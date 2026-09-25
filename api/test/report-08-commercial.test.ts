import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma, signToken, startApi, ApiCall } from "./helpers";
import { STUDY_TEMPLATES } from "../src/lib/studyTemplates";
import { getStudyProfile } from "../src/lib/studyProfiles";
import { DEFAULT_COMMERCIAL_TERMS } from "../src/lib/commercial";

// Report Product #08 + commercial-package regression suite. Uses real HTTP
// boundaries and real persisted participation/answer records — no mocks.
let api: ApiCall;
let stopServer: () => Promise<void>;

let companyAdminToken: string;
let companyMemberToken: string;
let otherCompanyToken: string;
let opsAdminToken: string;
let opsManagerToken: string;
let opsWorkerToken: string;
let companyId: string;
let essentialCampaignId: string;
let standardCampaignId: string;

function onboardingAgreement(overrides: Record<string, unknown> = {}) {
  return {
    packageTier: "STANDARD",
    contractedParticipantBasis: "PER_CAMPAIGN_SCOPE",
    contractedParticipants: null,
    fulfillmentModel: "POINT_OF_TRIAL",
    contractReference: "ONBOARD-SOW-001",
    scopeNote: "Atomic onboarding fixture agreement.",
    quotedStudyFeeEgp: 6000,
    quotedParticipantRateEgp: 60,
    quotedHomeDeliveryFeeEgp: null,
    discountPercent: 0,
    discountBasis: null,
    effectiveFrom: "2026-10-01T00:00:00.000Z",
    effectiveTo: "2027-09-30T23:59:59.000Z",
    paymentMethod: "MANUAL_BANK_TRANSFER",
    paymentStatus: "QUOTED",
    agreementStatus: "READY",
    ...overrides,
  };
}

async function seedCampaign(companyId: string, name: string) {
  const campaign = await prisma.campaign.create({
    data: {
      companyId,
      name,
      objective: "Measure trial evidence",
      studyType: "POST_TRIAL_FOOD_BEVERAGE",
      status: "ACTIVE",
      startDate: new Date(Date.now() - 86400000),
      endDate: new Date(Date.now() + 86400000),
    },
  });
  if (name === "essential") {
    await prisma.campaignCommercialTerms.create({ data: { campaignId: campaign.id } });
  }
  const qr = await prisma.qrSource.create({
    data: {
      campaignId: campaign.id,
      code: `QR-${name}`,
      label: "Store QR",
      activeFrom: new Date(Date.now() - 86400000),
      activeTo: new Date(Date.now() + 86400000),
    },
  });
  const purchase = await prisma.question.create({
    data: { campaignId: campaign.id, stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "Would you buy it?", order: 0 },
  });
  const rating = await prisma.question.create({
    data: { campaignId: campaign.id, stage: "POST_TRIAL", type: "RATING_1_5", text: "Rate the product", order: 1 },
  });
  const single = await prisma.question.create({
    data: {
      campaignId: campaign.id, stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Preferred format", order: 2,
      options: JSON.stringify([{ id: "single", label: "Single" }, { id: "multi", label: "Multi-pack" }]),
    },
  });
  const multi = await prisma.question.create({
    data: {
      campaignId: campaign.id, stage: "POST_TRIAL", type: "MULTI_CHOICE", text: "What did you notice?", order: 3,
      options: JSON.stringify([{ id: "taste", label: "Taste" }, { id: "pack", label: "Pack" }, { id: "price", label: "Price" }]),
    },
  });
  const text = await prisma.question.create({
    data: { campaignId: campaign.id, stage: "POST_TRIAL", type: "TEXT", text: "Anything else?", order: 4, required: false },
  });

  const participationIds: string[] = [];
  const answerPlans = [
    { purchase: 5, rating: 5, single: "single", multi: ["taste", "pack"], text: "Loved the taste" },
    { purchase: 4, rating: 4, single: "single", multi: ["taste"], text: "Pack was easy" },
    { purchase: 2, rating: 3, single: "single", multi: [], text: null },
    { purchase: 1, rating: 2, single: "multi", multi: ["pack", "price"], text: null },
  ];
  for (const [index, plan] of answerPlans.entries()) {
    const consumer = await prisma.consumer.create({ data: { phone: `+2012099${1000 + index}${name}` } });
    const participation = await prisma.participation.create({
      data: {
        campaignId: campaign.id,
        consumerId: consumer.id,
        qrSourceId: qr.id,
        status: "SURVEY_COMPLETE",
        ageAtEntry: 24 + index,
        genderAtEntry: index % 2 ? "FEMALE" : "MALE",
        cityAtEntry: index < 3 ? "Cairo" : "Giza",
      },
    });
    participationIds.push(participation.id);
    await prisma.answer.createMany({
      data: [
        { participationId: participation.id, questionId: purchase.id, valueNumber: plan.purchase },
        { participationId: participation.id, questionId: rating.id, valueNumber: plan.rating },
        { participationId: participation.id, questionId: single.id, valueOptions: JSON.stringify([plan.single]) },
        { participationId: participation.id, questionId: multi.id, valueOptions: JSON.stringify(plan.multi) },
        ...(plan.text ? [{ participationId: participation.id, questionId: text.id, valueText: plan.text }] : []),
      ],
    });
  }
  // One non-completing participant makes funnel/source counts differ from n.
  const droppedConsumer = await prisma.consumer.create({ data: { phone: `+201209990${name}` } });
  await prisma.participation.create({
    data: { campaignId: campaign.id, consumerId: droppedConsumer.id, qrSourceId: qr.id, status: "ENTERED" },
  });
  return campaign.id;
}

before(async () => {
  ({ api, stop: stopServer } = await startApi());
  const company = await prisma.company.create({ data: { name: "Report Co", industry: "FOOD_BEVERAGE" } });
  companyId = company.id;
  const otherCompany = await prisma.company.create({ data: { name: "Other Co" } });
  const admin = await prisma.employee.create({ data: { companyId: company.id, email: "report-admin@test", name: "Admin", passwordHash: "x", role: "COMPANY_ADMIN" } });
  const member = await prisma.employee.create({ data: { companyId: company.id, email: "report-member@test", name: "Member", passwordHash: "x", role: "COMPANY_MEMBER" } });
  const other = await prisma.employee.create({ data: { companyId: otherCompany.id, email: "other@test", name: "Other", passwordHash: "x", role: "COMPANY_ADMIN" } });
  await prisma.employee.create({ data: { companyId: company.id, email: "duplicate-employee@test.example", name: "Duplicate", passwordHash: "x", role: "COMPANY_MEMBER" } });
  const opsAdmin = await prisma.opsUser.create({ data: { email: "commercial-admin@test", name: "Ops Admin", passwordHash: "x", role: "PLATFORM_ADMIN" } });
  const opsManager = await prisma.opsUser.create({ data: { email: "commercial-manager@test", name: "Ops Manager", passwordHash: "x", role: "OPERATIONS_MANAGER" } });
  const opsWorker = await prisma.opsUser.create({ data: { email: "commercial-ops@test", name: "Ops", passwordHash: "x", role: "OPERATIONS" } });
  companyAdminToken = signToken({ kind: "employee", employeeId: admin.id, companyId: company.id });
  companyMemberToken = signToken({ kind: "employee", employeeId: member.id, companyId: company.id });
  otherCompanyToken = signToken({ kind: "employee", employeeId: other.id, companyId: otherCompany.id });
  opsAdminToken = signToken({ kind: "ops", opsUserId: opsAdmin.id });
  opsManagerToken = signToken({ kind: "ops", opsUserId: opsManager.id });
  opsWorkerToken = signToken({ kind: "ops", opsUserId: opsWorker.id });
  essentialCampaignId = await seedCampaign(company.id, "essential");
  standardCampaignId = await seedCampaign(company.id, "standard");
});

after(async () => {
  await stopServer();
  await prisma.$disconnect();
});

describe("commercial package catalog and onboarding", () => {
  it("exposes exactly the four approved tiers to Operations and keeps catalog mutation Platform Admin-only", async () => {
    const catalog = await api("/api/ops/commercial-packages", { token: opsWorkerToken });
    assert.equal(catalog.status, 200, JSON.stringify(catalog.body));
    assert.deepEqual(catalog.body.map((p: any) => p.tier), ["ESSENTIAL", "STANDARD", "PROFESSIONAL", "CUSTOM"]);
    assert.deepEqual(catalog.body.map((p: any) => p.name), ["Essential", "Standard", "Professional", "Custom"]);
    assert.ok(catalog.body.every((p: any) => Array.isArray(p.deliverables) && p.deliverables.length > 0));

    const denied = await api("/api/ops/commercial-packages/STANDARD", {
      method: "PUT", token: opsWorkerToken, body: { defaultStudyFeeEgp: 9999 },
    });
    assert.equal(denied.status, 403);

    const inactive = await api("/api/ops/commercial-packages/CUSTOM", {
      method: "PUT", token: opsAdminToken, body: { active: false },
    });
    assert.equal(inactive.status, 200, JSON.stringify(inactive.body));
    const rejectedInactive = await api(`/api/ops/campaigns/${standardCampaignId}/commercial`, {
      method: "PUT", token: opsAdminToken, body: { packageTier: "CUSTOM" },
    });
    assert.equal(rejectedInactive.status, 400);
    assert.match(JSON.stringify(rejectedInactive.body), /active/i);
    const restored = await api("/api/ops/commercial-packages/CUSTOM", {
      method: "PUT", token: opsAdminToken, body: { active: true },
    });
    assert.equal(restored.status, 200);

    const companyDenied = await api("/api/ops/commercial-packages/STANDARD", {
      method: "PUT", token: companyAdminToken, body: { defaultStudyFeeEgp: 9999 },
    });
    assert.equal(companyDenied.status, 403);
  });

  it("creates Company, employee, and READY agreement atomically and leaves no orphan on validation failure", async () => {
    const denied = await api("/api/ops/companies", {
      method: "POST", token: opsManagerToken,
      body: {
        name: "Manager Onboarding Denied",
        employeeName: "Denied Admin",
        employeeEmail: "denied-onboarding@test.example",
        employeePassword: "Password123!",
        commercialAgreement: onboardingAgreement(),
      },
    });
    assert.equal(denied.status, 403);

    const missing = await api("/api/ops/companies", {
      method: "POST", token: opsAdminToken,
      body: {
        name: "Missing Agreement Co",
        employeeName: "Missing Admin",
        employeeEmail: "missing-agreement@test.example",
        employeePassword: "Password123!",
      },
    });
    assert.equal(missing.status, 400);
    assert.equal(await prisma.company.count({ where: { name: "Missing Agreement Co" } }), 0);
    assert.equal(await prisma.employee.count({ where: { email: "missing-agreement@test.example" } }), 0);

    const invalid = await api("/api/ops/companies", {
      method: "POST", token: opsAdminToken,
      body: {
        name: "Invalid Agreement Co",
        employeeName: "Invalid Admin",
        employeeEmail: "invalid-agreement@test.example",
        employeePassword: "Password123!",
        commercialAgreement: onboardingAgreement({ contractReference: null, scopeNote: null }),
      },
    });
    assert.equal(invalid.status, 400);
    assert.equal(await prisma.company.count({ where: { name: "Invalid Agreement Co" } }), 0);
    assert.equal(await prisma.employee.count({ where: { email: "invalid-agreement@test.example" } }), 0);

    const duplicate = await api("/api/ops/companies", {
      method: "POST", token: opsAdminToken,
      body: {
        name: "Duplicate Employee Co",
        employeeName: "Duplicate Admin",
        employeeEmail: "duplicate-employee@test.example",
        employeePassword: "Password123!",
        commercialAgreement: onboardingAgreement({ contractReference: "ONBOARD-SOW-DUPLICATE" }),
      },
    });
    assert.equal(duplicate.status, 409, JSON.stringify(duplicate.body));
    assert.equal(await prisma.company.count({ where: { name: "Duplicate Employee Co" } }), 0);
    assert.equal(await prisma.companyCommercialAgreement.count({ where: { contractReference: "ONBOARD-SOW-DUPLICATE" } }), 0);

    const created = await api("/api/ops/companies", {
      method: "POST", token: opsAdminToken,
      body: {
        name: "Onboarded Commercial Co",
        industry: "Food & Beverage",
        subIndustry: "Beverages",
        employeeName: "Commercial Admin",
        employeeEmail: "onboarded-commercial@test.example",
        employeePassword: "Password123!",
        commercialAgreement: onboardingAgreement(),
      },
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.commercialAgreement.agreementStatus, "READY");
    assert.equal(created.body.commercialAgreement.packageTier, "STANDARD");

    const agreement = await api(`/api/ops/companies/${created.body.id}/commercial-agreement`, { token: opsWorkerToken });
    assert.equal(agreement.status, 200);
    assert.equal(agreement.body.agreementStatus, "READY");
    assert.equal(agreement.body.commerciallyReady, true);
    assert.equal(agreement.body.contractReference, "ONBOARD-SOW-001");
    assert.ok(agreement.body.readyAt);

    const audit = await prisma.accessAuditEvent.findFirst({
      where: { action: "COMPANY_CREATE", targetType: "company", targetId: created.body.id },
    });
    assert.ok(audit);
    assert.match(audit.detail ?? "", /READY commercial agreement/i);

    const employee = created.body.employees[0];
    const promote = await api(`/api/ops/companies/${created.body.id}/employees/${employee.id}/role`, {
      method: "PATCH", token: opsAdminToken, body: { role: "COMPANY_ADMIN" },
    });
    assert.equal(promote.status, 200, JSON.stringify(promote.body));
    const onboardedToken = signToken({ kind: "employee", employeeId: employee.id, companyId: created.body.id });
    const campaign = await api("/api/company/campaigns", {
      method: "POST", token: onboardedToken,
      body: {
        name: "Ready-agreement campaign",
        objective: "Verify no second commercial lifecycle gate",
        startDate: "2026-10-01T00:00:00.000Z",
        endDate: "2026-10-07T00:00:00.000Z",
      },
    });
    assert.equal(campaign.status, 201, JSON.stringify(campaign.body));

    const commercial = await api(`/api/company/campaigns/${campaign.body.id}/commercial`, { token: onboardedToken });
    assert.equal(commercial.status, 200, JSON.stringify(commercial.body));
    assert.equal(commercial.body.campaignScopeMode, "INHERITED_COMPANY_AGREEMENT");
    assert.equal(commercial.body.packageSource, "COMPANY_AGREEMENT");
  });
});

describe("company commercial agreement (Model A)", () => {
  it("starts unconfigured, distinguishes defaults from readiness, and stays read-only outside Platform Admin", async () => {
    const initialCompany = await api("/api/company/commercial-agreement", { token: companyMemberToken });
    assert.equal(initialCompany.status, 200, JSON.stringify(initialCompany.body));
    assert.equal(initialCompany.body.agreementStatus, "NOT_CONFIGURED");
    assert.equal(initialCompany.body.commerciallyReady, false);
    assert.equal(initialCompany.body.linkedCampaigns.length, 1);
    assert.equal(initialCompany.body.linkedCampaigns[0].scopeLinked, false);

    const opsView = await api(`/api/ops/companies/${companyId}/commercial-agreement`, { token: opsWorkerToken });
    assert.equal(opsView.status, 200, JSON.stringify(opsView.body));
    assert.equal(opsView.body.agreementStatus, "NOT_CONFIGURED");

    const denied = await api(`/api/ops/companies/${companyId}/commercial-agreement`, {
      method: "PUT", token: opsWorkerToken, body: { agreementStatus: "DRAFT" },
    });
    assert.equal(denied.status, 403);

    const companyWrite = await api("/api/company/commercial-agreement", {
      method: "PUT", token: companyAdminToken, body: { agreementStatus: "READY" },
    });
    assert.equal(companyWrite.status, 404);
  });

  it("lets Platform Admin configure a Ready agreement, audits it, and links campaign scope without rewriting scope", async () => {
    const invalidReady = await api(`/api/ops/companies/${companyId}/commercial-agreement`, {
      method: "PUT", token: opsAdminToken,
      body: { agreementStatus: "READY", packageTier: "STANDARD" },
    });
    assert.equal(invalidReady.status, 400);
    assert.match(JSON.stringify(invalidReady.body), /reference/i);

    const invalidDates = await api(`/api/ops/companies/${companyId}/commercial-agreement`, {
      method: "PUT", token: opsAdminToken,
      body: {
        contractReference: "SOW-INVALID-DATES",
        scopeNote: "Invalid contract period regression case.",
        effectiveFrom: "2026-10-01T00:00:00.000Z",
        effectiveTo: "2026-10-01T00:00:00.000Z",
        agreementStatus: "CONFIGURED",
      },
    });
    assert.equal(invalidDates.status, 400);
    assert.match(JSON.stringify(invalidDates.body), /end date/i);

    const saved = await api(`/api/ops/companies/${companyId}/commercial-agreement`, {
      method: "PUT", token: opsAdminToken,
      body: {
        packageTier: "STANDARD",
        contractedParticipantBasis: "TOTAL_PROGRAM_PARTICIPANTS",
        contractedParticipants: 100,
        fulfillmentModel: "HOME_DELIVERY",
        contractReference: "SOW-2026-001",
        scopeNote: "Company-level agreement governing campaign scopes.",
        quotedStudyFeeEgp: 5000,
        quotedParticipantRateEgp: 50,
        quotedHomeDeliveryFeeEgp: 400,
        discountPercent: 10,
        discountBasis: "Founder-approved launch agreement",
        effectiveFrom: "2026-10-01T00:00:00.000Z",
        effectiveTo: "2027-09-30T23:59:59.000Z",
        paymentMethod: "MANUAL_BANK_TRANSFER",
        paymentStatus: "QUOTED",
        agreementStatus: "READY",
      },
    });
    assert.equal(saved.status, 200, JSON.stringify(saved.body));
    assert.equal(saved.body.agreementStatus, "READY");
    assert.equal(saved.body.commerciallyReady, true);
    assert.equal(saved.body.effectiveFrom, "2026-10-01T00:00:00.000Z");
    assert.equal(saved.body.effectiveTo, "2027-09-30T23:59:59.000Z");
    assert.ok(saved.body.readyAt);
    assert.equal(saved.body.linkedCampaigns.length, 1);
    assert.equal(saved.body.linkedCampaigns[0].scopeLinked, true);

    const updated = await api(`/api/ops/campaigns/${standardCampaignId}/commercial`, {
      method: "PUT", token: opsAdminToken,
      body: { ...DEFAULT_COMMERCIAL_TERMS, packageTier: "STANDARD", contractedParticipants: 2 },
    });
    assert.equal(updated.status, 200, JSON.stringify(updated.body));
    assert.equal(updated.body.companyAgreement.agreementStatus, "READY");
    assert.equal(updated.body.scopeLinked, true);
    assert.equal(updated.body.packageTier, "STANDARD");
    assert.equal(updated.body.contractedParticipants, 2);

    const companyView = await api(`/api/company/campaigns/${standardCampaignId}/commercial`, { token: companyAdminToken });
    assert.equal(companyView.status, 200);
    assert.equal(companyView.body.companyAgreement.contractReference, "SOW-2026-001");
    assert.equal(companyView.body.companyAgreement.linkedCampaigns.some((c: any) => c.id === standardCampaignId && c.scopeLinked), true);

    const audit = await prisma.accessAuditEvent.findFirst({
      where: { action: "COMPANY_COMMERCIAL_AGREEMENT_UPDATED", targetId: companyId },
    });
    assert.ok(audit);
  });

  it("keeps catalog edits, later agreement changes, and historical campaign scope values independent", async () => {
    const beforeAgreement = await prisma.companyCommercialAgreement.findUnique({ where: { companyId } });
    const beforeScope = await prisma.campaignCommercialTerms.findUnique({ where: { campaignId: standardCampaignId } });
    assert.ok(beforeAgreement);
    assert.ok(beforeScope);

    const packageUpdate = await api("/api/ops/commercial-packages/STANDARD", {
      method: "PUT", token: opsAdminToken,
      body: {
        defaultStudyFeeEgp: 7777,
        defaultParticipantRateEgp: 77,
        internalNote: "Catalog default changed after the company agreement and campaign scope were configured.",
      },
    });
    assert.equal(packageUpdate.status, 200, JSON.stringify(packageUpdate.body));

    const afterAgreement = await prisma.companyCommercialAgreement.findUnique({ where: { companyId } });
    const afterScope = await prisma.campaignCommercialTerms.findUnique({ where: { campaignId: standardCampaignId } });
    assert.equal(afterAgreement?.quotedStudyFeeEgp, beforeAgreement.quotedStudyFeeEgp);
    assert.equal(afterAgreement?.quotedParticipantRateEgp, beforeAgreement.quotedParticipantRateEgp);
    assert.equal(afterAgreement?.packageTier, beforeAgreement.packageTier);
    assert.equal(afterScope?.quotedStudyFeeEgp, beforeScope.quotedStudyFeeEgp);
    assert.equal(afterScope?.packageTier, beforeScope.packageTier);
    assert.equal(afterScope?.contractedParticipants, beforeScope.contractedParticipants);

    const agreementChange = await api(`/api/ops/companies/${companyId}/commercial-agreement`, {
      method: "PUT", token: opsAdminToken,
      body: { scopeNote: "Agreement wording updated after campaign scope was configured." },
    });
    assert.equal(agreementChange.status, 200, JSON.stringify(agreementChange.body));

    const historicalScope = await prisma.campaignCommercialTerms.findUnique({ where: { campaignId: standardCampaignId } });
    assert.equal(historicalScope?.packageTier, beforeScope.packageTier);
    assert.equal(historicalScope?.quotedStudyFeeEgp, beforeScope.quotedStudyFeeEgp);
    assert.equal(historicalScope?.contractedParticipants, beforeScope.contractedParticipants);
    assert.equal(historicalScope?.commercialAgreementId, beforeAgreement.id);

    const catalogAudit = await prisma.accessAuditEvent.findFirst({
      where: { action: "COMMERCIAL_PACKAGE_UPDATED", targetId: "STANDARD" },
    });
    assert.ok(catalogAudit);
  });
});

describe("campaign commercial terms", () => {
  it("exposes Essential defaults to company and ops, while cross-tenant access stays denied", async () => {
    const companyView = await api(`/api/company/campaigns/${essentialCampaignId}/commercial`, { token: companyMemberToken });
    assert.equal(companyView.status, 200, JSON.stringify(companyView.body));
    assert.equal(companyView.body.packageTier, "ESSENTIAL");
    assert.equal(companyView.body.reportCapabilities.enhancedReport, false);
    assert.equal(companyView.body.calculation.completedEligibleParticipants, 4);

    const opsView = await api(`/api/ops/campaigns/${essentialCampaignId}/commercial`, { token: opsWorkerToken });
    assert.equal(opsView.status, 200);
    assert.equal(opsView.body.paymentMethod, "MANUAL_BANK_TRANSFER");

    const denied = await api(`/api/company/campaigns/${standardCampaignId}/commercial`, { token: otherCompanyToken });
    assert.equal(denied.status, 404);
  });

  it("validates package conditions and keeps mutations Platform Admin-only", async () => {
    const denied = await api(`/api/ops/campaigns/${standardCampaignId}/commercial`, {
      method: "PUT", token: opsWorkerToken, body: { ...DEFAULT_COMMERCIAL_TERMS, packageTier: "STANDARD" },
    });
    assert.equal(denied.status, 403);

    for (const [body, match] of [
      [{ packageTier: "PROFESSIONAL", contractedParticipants: 250 }, /Custom|custom/i],
      [{ packageTier: "CUSTOM", contractedParticipants: 250 }, /scope/i],
      [{ packageTier: "STANDARD", discountPercent: 20 }, /basis/i],
      [{ packageTier: "STANDARD", discountPercent: 21, discountBasis: "approved" }, /20/],
      [{ packageTier: "STANDARD", fulfillmentModel: "HOME_DELIVERY", paymentStatus: "QUOTED" }, /quoted/i],
      [{ packageTier: "STANDARD", paymentMethod: "CARD" }, /invalid/i],
    ] as const) {
      const res = await api(`/api/ops/campaigns/${standardCampaignId}/commercial`, {
        method: "PUT", token: opsAdminToken, body: { ...DEFAULT_COMMERCIAL_TERMS, ...body },
      });
      assert.equal(res.status, 400, JSON.stringify(res.body));
      assert.match(JSON.stringify(res.body), match);
    }

    const updated = await api(`/api/ops/campaigns/${standardCampaignId}/commercial`, {
      method: "PUT", token: opsAdminToken,
      body: {
        ...DEFAULT_COMMERCIAL_TERMS,
        packageTier: "STANDARD",
        contractedParticipants: 2,
        quotedStudyFeeEgp: 1000,
        quotedParticipantRateEgp: 25,
        discountPercent: 20,
        discountBasis: "Approved launch discount",
        paymentMethod: "MANUAL_BANK_TRANSFER",
        paymentStatus: "QUOTED",
      },
    });
    assert.equal(updated.status, 200, JSON.stringify(updated.body));
    assert.equal(updated.body.reportCapabilities.enhancedReport, true);
    assert.equal(updated.body.calculation.overage, 2);
    assert.equal(updated.body.calculation.requiresChangeOrder, true);
    assert.equal(updated.body.calculation.requiresRescope, true);
    assert.equal(updated.body.quoteReadiness.quotedParticipantSubtotalEgp, 50);
    assert.equal(updated.body.quoteReadiness.completedParticipantSubtotalEgp, 50);
    assert.equal(updated.body.quoteReadiness.quotedSubtotalBeforeTaxEgp, 850);
    assert.equal(updated.body.quoteReadiness.completedSubtotalBeforeTaxEgp, 850);
    assert.equal(updated.body.quoteReadiness.unorderedOverageBilling, "CHANGE_ORDER_REQUIRED_BEFORE_BILLING");

    const partial = await api(`/api/ops/campaigns/${standardCampaignId}/commercial`, {
      method: "PUT", token: opsAdminToken, body: { paymentStatus: "AWAITING_BANK_TRANSFER" },
    });
    assert.equal(partial.status, 200, JSON.stringify(partial.body));
    assert.equal(partial.body.packageTier, "STANDARD");
    assert.equal(partial.body.quotedStudyFeeEgp, 1000);
    assert.equal(partial.body.quotedParticipantRateEgp, 25);

    const audit = await prisma.accessAuditEvent.findFirst({
      where: { action: "CAMPAIGN_COMMERCIAL_TERMS_UPDATED", targetId: standardCampaignId },
    });
    assert.ok(audit);
  });
});

describe("report product #08", () => {
  it("returns deterministic distributions, percentages, coverage and labels for Standard", async () => {
    const report = await api(`/api/company/campaigns/${standardCampaignId}/report`, { token: companyAdminToken });
    assert.equal(report.status, 200, JSON.stringify(report.body));

    assert.equal(report.body.commercialPackage.tier, "STANDARD");
    assert.equal(report.body.commercialPackage.capabilities.enhancedReport, true);
    assert.equal(report.body.campaign.statusLabel.en, "Active");
    assert.equal(report.body.evidence.levelLabel.en, "Survey responses available");
    assert.equal(report.body.studyProfile.key, "POST_TRIAL_FOOD_BEVERAGE");

    const pi = report.body.purchaseIntent;
    assert.equal(pi.responses, 4);
    assert.equal(pi.distributionItems.find((d: any) => d.value === 5).percentage, 25);
    assert.equal(pi.distributionItems[0].label, "1");

    const rating = report.body.satisfaction;
    assert.equal(rating.averageScore, 3.5);
    assert.equal(rating.distributionItems.find((d: any) => d.value === 5).count, 1);
    assert.equal(rating.distributionItems.find((d: any) => d.value === 5).percentage, 25);

    const single = report.body.campaignSpecificQuestions.find((q: any) => q.text === "Preferred format");
    assert.equal(single.percentBasis, "RESPONDENTS");
    assert.equal(single.breakdown.find((b: any) => b.label === "Single").percentage, 75);

    const multi = report.body.campaignSpecificQuestions.find((q: any) => q.text === "What did you notice?");
    assert.equal(multi.percentBasis, "SELECTIONS");
    assert.equal(multi.breakdown.find((b: any) => b.label === "Pack").percentage, 40);

    const source = report.body.sources.find((s: any) => s.label === "Store QR");
    assert.equal(source.enteredPercentage, 100);
    assert.equal(source.surveyCompletePercentage, 100);

    const city = report.body.demographics.distributions.city.find((d: any) => d.label === "Cairo");
    assert.equal(city.percentage, 75);

    assert.ok(Array.isArray(report.body.evidenceCoverage));
    assert.ok(report.body.evidenceCoverage.some((line: string) => line.includes("purchase-intent response")));
    assert.ok(report.body.audienceDifferences.gender.every((g: any) => g.sentences.every((s: string) => s.includes("suppressed"))));
  });

  it("keeps Essential on the core report contract without enhanced sections", async () => {
    const report = await api(`/api/company/campaigns/${essentialCampaignId}/report`, { token: companyAdminToken });
    assert.equal(report.status, 200);
    assert.equal(report.body.commercialPackage.tier, "ESSENTIAL");
    assert.equal(report.body.purchaseIntent.distributionItems, null);
    assert.equal(report.body.satisfaction.distributionItems, null);
    assert.equal(report.body.evidenceCoverage, null);
    assert.equal(report.body.campaignSpecificQuestions[0].percentBasis, null);
    assert.equal(report.body.campaignSpecificQuestions[0].breakdown[0].percentage, undefined);

    const insights = await api(`/api/company/campaigns/${essentialCampaignId}/insights`, { token: companyAdminToken });
    assert.equal(insights.status, 200);
    assert.equal(insights.body.purchaseIntent.distributionItems, null);
    assert.equal(insights.body.questionAggregates[0].breakdown[0].percentage, undefined);

    const live = await api(`/api/company/campaigns/${essentialCampaignId}/live`, { token: companyAdminToken });
    assert.equal(live.status, 200);
    assert.equal(live.body.satisfaction.distributionItems, null);
  });

  it("covers every executable study template with an explicit methodology profile", async () => {
    for (const template of Object.values(STUDY_TEMPLATES)) {
      assert.ok(getStudyProfile(template.key), `${template.key} must have a methodology profile`);
    }
    assert.equal(Object.keys(STUDY_TEMPLATES).length, 14);
  });

  it("does not emit Insight→Decision, inferential statistics or raw consumer PII", async () => {
    const report = await api(`/api/ops/campaigns/${standardCampaignId}/report`, { token: opsAdminToken });
    assert.equal(report.status, 200);
    const serialized = JSON.stringify(report.body);
    assert.doesNotMatch(serialized, /Insight\s*→\s*Decision|p-value|confidence interval/i);
    assert.doesNotMatch(serialized, /passwordHash|"phone"/i);
  });
});
