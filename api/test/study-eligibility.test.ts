import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { prisma, signToken, startApi, ApiCall } from "./helpers";

// Founder Decision A (2026-09-25): Industry → Study-Type eligibility.
// Option A — generic study types are universal; only the three
// sector-specific Post-Trial variants are Industry-dependent.
//
// Contract under test:
//   - GET /company/study-templates returns all generic templates to every
//     company, plus only the Post-Trial variant matching the company's
//     canonical industry.
//   - null/legacy industries get generic templates only.
//   - Campaign create / PATCH / study-type change request / apply-template
//     all reject a sector variant outside the company's industry.
//   - Ops catalog (GET /ops/study-templates) stays complete for all ops
//     roles — eligibility scopes Company-facing selection only.
//   - Existing campaigns keep their stored studyType unchanged.

let api: ApiCall;
let stopServer: () => Promise<void>;

let fbCo: string, beautyCo: string, noneCo: string, legacyCo: string;
let tokFb: string, tokBeauty: string, tokNone: string, tokLegacy: string;
let tokHome: string;
const genericOnlyTokens: string[] = [];
let tokOpsAdmin: string;
let fbCampaign: string, legacyCampaign: string;

const GENERIC_KEYS = [
  "CONCEPT_LAUNCH_VIABILITY", "PACKAGING_CLAIMS_REACTION", "USAGE_ATTITUDE",
  "CONCEPT_TESTING", "PRICING_PERCEPTION", "PACKAGING_EVALUATION", "CLAIMS_TESTING",
  "ADVERTISING_MESSAGE_TESTING", "BRAND_PERCEPTION", "UA_EXPANSION", "SEGMENTATION_STUDY",
];

before(async () => {
  ({ api, stop: stopServer } = await startApi());
  const hash = await bcrypt.hash("pass1234", 10);
  const mkCo = async (name: string, industry?: string, subIndustry?: string) =>
    (await prisma.company.create({ data: { name, industry, subIndustry } })).id;
  fbCo = await mkCo("Elig F&B", "Food & Beverage", "Beverages");
  beautyCo = await mkCo("Elig Beauty", "Beauty & Personal Care", "Skincare");
  noneCo = await mkCo("Elig None");
  legacyCo = await mkCo("Elig Legacy", "FMCG — Food & Beverage"); // legacy stored value, not in taxonomy

  const mkAdmin = async (companyId: string, email: string) =>
    (await prisma.employee.create({ data: { companyId, email, name: email, passwordHash: hash, role: "COMPANY_ADMIN" } })).id;
  const ea = await mkAdmin(fbCo, "a@fb.test");
  const eb = await mkAdmin(beautyCo, "a@beauty.test");
  const en = await mkAdmin(noneCo, "a@none.test");
  const el = await mkAdmin(legacyCo, "a@legacy.test");
  const homeCo = await mkCo("Elig Home", "Home & Household Care", "Laundry Care");
  const eh = await mkAdmin(homeCo, "a@home.test");
  tokFb = signToken({ kind: "employee", employeeId: ea, companyId: fbCo });
  tokBeauty = signToken({ kind: "employee", employeeId: eb, companyId: beautyCo });
  tokNone = signToken({ kind: "employee", employeeId: en, companyId: noneCo });
  tokLegacy = signToken({ kind: "employee", employeeId: el, companyId: legacyCo });
  tokHome = signToken({ kind: "employee", employeeId: eh, companyId: homeCo });
  for (const [industry, email] of [
    ["Health & Wellness", "a@health.test"],
    ["Baby & Family Care", "a@baby.test"],
    ["Pet Care", "a@pet.test"],
    ["Other", "a@other.test"],
  ] as const) {
    const companyId = await mkCo(`Elig ${industry}`, industry);
    const employeeId = await mkAdmin(companyId, email);
    genericOnlyTokens.push(signToken({ kind: "employee", employeeId, companyId }));
  }
  const oa = await prisma.opsUser.create({ data: { email: "pa@elig.test", name: "PA", passwordHash: hash, role: "PLATFORM_ADMIN" } });
  tokOpsAdmin = signToken({ kind: "ops", opsUserId: oa.id });

  fbCampaign = (await prisma.campaign.create({
    data: { companyId: fbCo, name: "FB C", objective: "o", startDate: new Date(), endDate: new Date(), status: "DRAFT" },
  })).id;
  // Historical campaign: legacy company carrying a studyType set before
  // eligibility existed — must remain readable and functional.
  legacyCampaign = (await prisma.campaign.create({
    data: { companyId: legacyCo, name: "Legacy C", objective: "o", startDate: new Date(), endDate: new Date(), status: "DRAFT", studyType: "POST_TRIAL_FOOD_BEVERAGE" },
  })).id;
});

after(async () => { await stopServer(); });

describe("GET /company/study-templates — contextual catalog", () => {
  it("F&B company gets its variant + all generics, not other sector variants", async () => {
    const r = await api("/api/company/study-templates", { token: tokFb });
    assert.equal(r.status, 200);
    const keys = r.body.map((t: any) => t.key);
    assert.ok(keys.includes("POST_TRIAL_FOOD_BEVERAGE"));
    assert.ok(!keys.includes("POST_TRIAL_BEAUTY_PERSONAL_CARE"));
    assert.ok(!keys.includes("POST_TRIAL_HOME_CARE"));
    for (const k of GENERIC_KEYS) assert.ok(keys.includes(k), k);
  });
  it("Beauty company gets its variant + all generics", async () => {
    const r = await api("/api/company/study-templates", { token: tokBeauty });
    const keys = r.body.map((t: any) => t.key);
    assert.ok(keys.includes("POST_TRIAL_BEAUTY_PERSONAL_CARE"));
    assert.ok(!keys.includes("POST_TRIAL_FOOD_BEVERAGE"));
    assert.equal(keys.length, GENERIC_KEYS.length + 1);
  });
  it("Home Care company gets its variant + all generics", async () => {
    const r = await api("/api/company/study-templates", { token: tokHome });
    const keys = r.body.map((t: any) => t.key);
    assert.ok(keys.includes("POST_TRIAL_HOME_CARE"));
    assert.ok(!keys.includes("POST_TRIAL_FOOD_BEVERAGE"));
    assert.ok(!keys.includes("POST_TRIAL_BEAUTY_PERSONAL_CARE"));
    assert.equal(keys.length, GENERIC_KEYS.length + 1);
  });
  it("Health, Baby, Pet, Other, no-industry and legacy-industry companies get generics only", async () => {
    for (const tok of [...genericOnlyTokens, tokNone, tokLegacy]) {
      const r = await api("/api/company/study-templates", { token: tok });
      const keys = r.body.map((t: any) => t.key);
      assert.equal(keys.length, GENERIC_KEYS.length);
      assert.ok(!keys.some((k: string) => k.startsWith("POST_TRIAL_")));
    }
  });
  it("ops catalog remains complete for Platform Admin", async () => {
    const r = await api("/api/ops/study-templates", { token: tokOpsAdmin });
    assert.equal(r.body.length, 14);
  });
});

describe("write-path enforcement", () => {
  it("campaign create accepts generic + own-sector types, rejects foreign sector types", async () => {
    const ok = await api("/api/company/campaigns", {
      method: "POST", token: tokFb,
      body: { name: "Gen C", objective: "o", startDate: "2026-01-01", endDate: "2026-02-01", studyType: "CONCEPT_TESTING" },
    });
    assert.equal(ok.status, 201);
    const ok2 = await api("/api/company/campaigns", {
      method: "POST", token: tokFb,
      body: { name: "PT C", objective: "o", startDate: "2026-01-01", endDate: "2026-02-01", studyType: "POST_TRIAL_FOOD_BEVERAGE" },
    });
    assert.equal(ok2.status, 201);
    const bad = await api("/api/company/campaigns", {
      method: "POST", token: tokFb,
      body: { name: "Bad C", objective: "o", startDate: "2026-01-01", endDate: "2026-02-01", studyType: "POST_TRIAL_HOME_CARE" },
    });
    assert.equal(bad.status, 400);
    // direct API bypass attempt on the other side too
    const bad2 = await api("/api/company/campaigns", {
      method: "POST", token: tokBeauty,
      body: { name: "Bad B", objective: "o", startDate: "2026-01-01", endDate: "2026-02-01", studyType: "POST_TRIAL_FOOD_BEVERAGE" },
    });
    assert.equal(bad2.status, 400);
  });
  it("PATCH studyType rejects an ineligible variant", async () => {
    const r = await api(`/api/company/campaigns/${fbCampaign}`, {
      method: "PATCH", token: tokFb, body: { studyType: "POST_TRIAL_BEAUTY_PERSONAL_CARE" },
    });
    assert.equal(r.status, 400);
    const ok = await api(`/api/company/campaigns/${fbCampaign}`, {
      method: "PATCH", token: tokFb, body: { studyType: "USAGE_ATTITUDE" },
    });
    assert.equal(ok.status, 200);
  });
  it("study-type change request rejects an ineligible variant", async () => {
    const r = await api(`/api/company/campaigns/${fbCampaign}/study-type-requests`, {
      method: "POST", token: tokFb, body: { requestedStudyType: "POST_TRIAL_HOME_CARE" },
    });
    assert.equal(r.status, 400);
  });
  it("approval revalidates eligibility when company industry changed after the request", async () => {
    const company = await prisma.company.create({ data: { name: "Approval Recheck", industry: "Food & Beverage", subIndustry: "Beverages" } });
    const employee = await prisma.employee.create({
      data: { companyId: company.id, email: "a@approval-recheck.test", name: "Admin", passwordHash: await bcrypt.hash("pass1234", 10), role: "COMPANY_ADMIN" },
    });
    const token = signToken({ kind: "employee", employeeId: employee.id, companyId: company.id });
    const campaign = await prisma.campaign.create({
      data: { companyId: company.id, name: "Approval Recheck", objective: "o", startDate: new Date(), endDate: new Date(), status: "DRAFT" },
    });
    await prisma.question.create({ data: { campaignId: campaign.id, stage: "POST_TRIAL", type: "TEXT", text: "Feedback?", order: 0 } });
    const filed = await api(`/api/company/campaigns/${campaign.id}/study-type-requests`, {
      method: "POST", token, body: { requestedStudyType: "POST_TRIAL_FOOD_BEVERAGE" },
    });
    assert.equal(filed.status, 201);
    assert.equal((await api(`/api/ops/companies/${company.id}`, {
      method: "PATCH", token: tokOpsAdmin, body: { industry: "Beauty & Personal Care", subIndustry: "Skincare" },
    })).status, 200);
    const approval = await api(`/api/ops/study-type-requests/${filed.body.id}/approve`, { method: "POST", token: tokOpsAdmin });
    assert.equal(approval.status, 409);
    assert.match(approval.body.error, /no longer available/i);
    assert.equal((await prisma.campaign.findUnique({ where: { id: campaign.id } }))?.studyType, null);
    assert.equal((await prisma.studyTypeChangeRequest.findUnique({ where: { id: filed.body.id } }))?.status, "PENDING");
  });
  it("apply-template rejects an ineligible variant", async () => {
    const r = await api(`/api/company/campaigns/${fbCampaign}/questions/apply-template`, {
      method: "POST", token: tokFb, body: { templateKey: "POST_TRIAL_HOME_CARE" },
    });
    assert.equal(r.status, 400);
    const ok = await api(`/api/company/campaigns/${fbCampaign}/questions/apply-template`, {
      method: "POST", token: tokFb, body: { templateKey: "CONCEPT_TESTING" },
    });
    assert.equal(ok.status, 201);
  });
  it("historical campaign keeps its stored studyType and stays readable", async () => {
    const r = await api(`/api/company/campaigns/${legacyCampaign}`, { token: tokLegacy });
    assert.equal(r.status, 200);
    assert.equal(r.body.studyType, "POST_TRIAL_FOOD_BEVERAGE");
  });
});
