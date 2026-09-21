import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma, signToken, startApi, grantCampaignVerification, ApiCall } from "./helpers";

// FOUNDER INNOVATION regression suite (docs/TAJRIBTI_FOUNDER_INNOVATION_
// SPEC_2026-09-20.md). Exercises the real HTTP boundary for the approved
// Innovation layer: product descriptors (OFD-05), company/ops roles
// (OFD-08), media (OFD-12), notification requests (OFD-14), consumer
// consent + same-company panel intelligence (OFD-15), question change
// audit trail (OFD-19), evidence-bounded narrative (OFD-03) and derived
// intelligence (OFD-06). Fresh migrated DB per run — no mocks.
//
// Fixture graph:
//   Company A ── empAdminA (COMPANY_ADMIN), empMemberA (COMPANY_MEMBER)
//     ├─ campaignA (ACTIVE — locked) ─ qrA
//     │    ├─ qText   POST_TRIAL TEXT
//     │    └─ qChoice POST_TRIAL SINGLE_CHOICE (has an answer → delete-proof)
//     └─ campaignDraftA (DRAFT — configurable)
//   Company B ── empB (COMPANY_ADMIN)
//     └─ campaignB (ACTIVE)
//   Ops: opsAdmin (PLATFORM_ADMIN), opsWorker (OPERATIONS)
//   Consumers: c1..cN with panelOptIn / pushOptIn set directly.

let api: ApiCall;
let stopServer: () => Promise<void>;

let companyAId: string;
let companyBId: string;
let empAdminAToken: string;
let empMemberAToken: string;
let empBToken: string;
let opsAdminToken: string;
let opsWorkerToken: string;
let opsManagerToken: string;
let campaignAId: string;
let campaignBId: string;
let campaignDraftAId: string;
let qChoiceId: string;

let phoneSeq = 0;
async function mkConsumer(opts: { panelOptIn?: boolean; pushOptIn?: boolean } = {}) {
  const consumer = await prisma.consumer.create({
    data: {
      phone: `+2011000${String(10000 + phoneSeq++)}`,
      panelOptIn: opts.panelOptIn ?? false,
      pushOptIn: opts.pushOptIn ?? false,
    },
  });
  return { id: consumer.id, token: signToken({ kind: "consumer", consumerId: consumer.id }) };
}

before(async () => {
  ({ api, stop: stopServer } = await startApi());

  const companyA = await prisma.company.create({ data: { name: "Innovation Co A" } });
  const companyB = await prisma.company.create({ data: { name: "Innovation Co B" } });
  companyAId = companyA.id;
  companyBId = companyB.id;

  const empAdminA = await prisma.employee.create({
    data: { companyId: companyAId, email: "admin@a.test", name: "Admin A", passwordHash: "x", role: "COMPANY_ADMIN" },
  });
  const empMemberA = await prisma.employee.create({
    data: { companyId: companyAId, email: "member@a.test", name: "Member A", passwordHash: "x", role: "COMPANY_MEMBER" },
  });
  const empB = await prisma.employee.create({
    data: { companyId: companyBId, email: "admin@b.test", name: "Admin B", passwordHash: "x", role: "COMPANY_ADMIN" },
  });
  empAdminAToken = signToken({ kind: "employee", employeeId: empAdminA.id, companyId: companyAId });
  empMemberAToken = signToken({ kind: "employee", employeeId: empMemberA.id, companyId: companyAId });
  empBToken = signToken({ kind: "employee", employeeId: empB.id, companyId: companyBId });

  const opsAdmin = await prisma.opsUser.create({
    data: { email: "padmin@ops.test", name: "Platform Admin", passwordHash: "x", role: "PLATFORM_ADMIN" },
  });
  const opsWorker = await prisma.opsUser.create({
    data: { email: "worker@ops.test", name: "Ops Worker", passwordHash: "x", role: "OPERATIONS" },
  });
  const opsManager = await prisma.opsUser.create({
    data: { email: "manager@ops.test", name: "Ops Manager", passwordHash: "x", role: "OPERATIONS_MANAGER" },
  });
  opsAdminToken = signToken({ kind: "ops", opsUserId: opsAdmin.id });
  opsWorkerToken = signToken({ kind: "ops", opsUserId: opsWorker.id });
  opsManagerToken = signToken({ kind: "ops", opsUserId: opsManager.id });

  const mkCampaign = async (companyId: string, name: string, status: string) => {
    const c = await prisma.campaign.create({
      data: {
        companyId, name, objective: "Innovation test", status,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
      },
    });
    await prisma.qrSource.create({
      data: { campaignId: c.id, code: `QR-${name}`, label: name, activeFrom: new Date(Date.now() - 86400000), activeTo: new Date(Date.now() + 86400000) },
    });
    return c;
  };

  campaignAId = (await mkCampaign(companyAId, "A-active", "ACTIVE")).id;
  campaignBId = (await mkCampaign(companyBId, "B-active", "ACTIVE")).id;
  campaignDraftAId = (await mkCampaign(companyAId, "A-draft", "DRAFT")).id;

  const qText = await prisma.question.create({ data: { campaignId: campaignAId, stage: "POST_TRIAL", type: "TEXT", text: "Tell us", order: 0, required: false } });
  qChoiceId = (
    await prisma.question.create({
      data: { campaignId: campaignAId, stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Pick?", order: 1, options: JSON.stringify([{ id: "a", label: "A" }, { id: "b", label: "B" }]) },
    })
  ).id;

  // One completed journey on campaignA so report/narrative/intelligence
  // have real evidence and the choice question has an attached answer.
  const c1 = await mkConsumer({ panelOptIn: true, pushOptIn: true });
  // FD-07a: participation requires a campaign-bound OTP verification.
  await grantCampaignVerification(c1.id, campaignAId);
  const elig = await api(`/api/consumer/campaigns/${campaignAId}/eligibility`, { method: "POST", token: c1.token, body: {} });
  assert.equal(elig.status, 200, JSON.stringify(elig.body));
  await api(`/api/consumer/campaigns/${campaignAId}/redeem`, { method: "POST", token: c1.token });
  const sub = await api(`/api/consumer/campaigns/${campaignAId}/survey`, {
    method: "POST", token: c1.token,
    body: { answers: [{ questionId: qText.id, valueText: "loved the taste, great product" }, { questionId: qChoiceId, valueOptions: ["a"] }] },
  });
  assert.equal(sub.status, 200, JSON.stringify(sub.body));
});

after(async () => {
  await stopServer();
  await prisma.$disconnect();
});

// --- OFD-05: structured price / pack / claims --------------------------------
describe("product price/pack/claims (OFD-05)", () => {
  it("creates and updates the new descriptor fields, isolated per company", async () => {
    const created = await api("/api/company/products", {
      method: "POST", token: empAdminAToken,
      body: { name: "Drink", priceRange: "25-40 EGP", packSize: "330 ml", claims: ["Sugar-free", "Vitamin C"] },
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.priceRange, "25-40 EGP");
    assert.equal(created.body.packSize, "330 ml");
    assert.deepEqual(JSON.parse(created.body.claims), ["Sugar-free", "Vitamin C"]);

    const patched = await api(`/api/company/products/${created.body.id}`, {
      method: "PATCH", token: empAdminAToken, body: { priceRange: "30-45 EGP" },
    });
    assert.equal(patched.status, 200);
    assert.equal(patched.body.priceRange, "30-45 EGP");

    const cross = await api(`/api/company/products/${created.body.id}`, {
      method: "PATCH", token: empBToken, body: { priceRange: "999" },
    });
    assert.equal(cross.status, 404);
  });
});

// --- OFD-08: role gates -------------------------------------------------------
describe("role gates (OFD-08)", () => {
  it("COMPANY_MEMBER cannot manage employees; COMPANY_ADMIN can", async () => {
    const denied = await api("/api/company/employees", {
      method: "POST", token: empMemberAToken,
      body: { name: "X", email: "x@a.test", password: "Password123" },
    });
    assert.equal(denied.status, 403);

    const ok = await api("/api/company/employees", {
      method: "POST", token: empAdminAToken,
      body: { name: "New Member", email: "new@a.test", password: "Password123" },
    });
    assert.equal(ok.status, 201, JSON.stringify(ok.body));
    assert.equal(ok.body.role, "COMPANY_MEMBER");
  });

  it("role change is COMPANY_ADMIN-only and self-change is refused", async () => {
    const employees = (await api("/api/company/employees", { token: empAdminAToken })).body as { id: string }[];
    const member = employees.find(() => true); // any — target the member below explicitly
    void member;
    const memberRow = await prisma.employee.findUnique({ where: { email: "member@a.test" } });

    const denied = await api(`/api/company/employees/${memberRow!.id}/role`, {
      method: "PATCH", token: empMemberAToken, body: { role: "COMPANY_ADMIN" },
    });
    assert.equal(denied.status, 403);

    const adminRow = await prisma.employee.findUnique({ where: { email: "admin@a.test" } });
    const self = await api(`/api/company/employees/${adminRow!.id}/role`, {
      method: "PATCH", token: empAdminAToken, body: { role: "COMPANY_MEMBER" },
    });
    assert.equal(self.status, 409);
  });

  it("OPERATIONS cannot create companies or view participant PII; PLATFORM_ADMIN can, audited", async () => {
    const deniedCompany = await api("/api/ops/companies", {
      method: "POST", token: opsWorkerToken,
      body: { name: "Nope", employeeName: "E", employeeEmail: "e@x.test", employeePassword: "Password123" },
    });
    assert.equal(deniedCompany.status, 403);

    const deniedPii = await api(`/api/ops/campaigns/${campaignAId}/participants`, { token: opsWorkerToken });
    assert.equal(deniedPii.status, 403);

    const allowedPii = await api(`/api/ops/campaigns/${campaignAId}/participants`, { token: opsAdminToken });
    assert.equal(allowedPii.status, 200, JSON.stringify(allowedPii.body));
    assert.equal(allowedPii.body.length, 1);

    const audit = await prisma.accessAuditEvent.findFirst({
      where: { action: "PARTICIPANTS_PII_VIEW", targetId: campaignAId },
    });
    assert.ok(audit, "PII access must write an audit event");
    assert.equal(audit!.actorKind, "ops");
  });

  it("OPERATIONS cannot manage ops users; PLATFORM_ADMIN can", async () => {
    const denied = await api("/api/ops/ops-users", {
      method: "POST", token: opsWorkerToken,
      body: { name: "N", email: "n@ops.test", password: "Password123" },
    });
    assert.equal(denied.status, 403);
    const ok = await api("/api/ops/ops-users", {
      method: "POST", token: opsAdminToken,
      body: { name: "N", email: "n@ops.test", password: "Password123", role: "OPERATIONS" },
    });
    assert.equal(ok.status, 201, JSON.stringify(ok.body));
    assert.equal(ok.body.role, "OPERATIONS");
  });

  // FD-WEB-01 (2026-09-21): COMPANY_MEMBER is reporting/read-only — every
  // mutating company route rejects it; every read surface still works.
  it("COMPANY_MEMBER is read-only across all mutation surfaces", async () => {
    const mutations: [string, object | undefined][] = [
      ["/api/company/profile", { name: "X" }],
      ["/api/company/products", { name: "P" }],
      ["/api/company/campaigns", { name: "C", objective: "O", startDate: "2026-01-01", endDate: "2026-02-01" }],
      [`/api/company/campaigns/${campaignDraftAId}`, { name: "X" }],
      [`/api/company/campaigns/${campaignDraftAId}/submit-for-review`, undefined],
      [`/api/company/campaigns/${campaignDraftAId}/study-type-requests`, { requestedStudyType: "CONCEPT_TESTING" }],
      [`/api/company/campaigns/${campaignDraftAId}/questions`, { stage: "ELIGIBILITY", type: "TEXT", text: "q", order: 1 }],
      [`/api/company/campaigns/${campaignDraftAId}/questions/apply-template`, { templateKey: "CONCEPT_TESTING" }],
      [`/api/company/campaigns/${campaignDraftAId}/qr-sources`, { label: "L", code: "QR-MEMBER", activeFrom: "2026-01-01", activeTo: "2026-02-01" }],
      [`/api/company/campaigns/${campaignDraftAId}/media`, { kind: "CREATIVE", url: "https://cdn.example.com/x.png" }],
      [`/api/company/campaigns/${campaignDraftAId}/media/upload-init`, { kind: "CREATIVE", contentType: "image/png", sizeBytes: 100 }],
      [`/api/company/campaigns/${campaignAId}/question-change-requests`, { action: "DELETE", questionId: qChoiceId }],
    ];
    for (const [path, body] of mutations) {
      const method = path === "/api/company/profile" || path.endsWith(campaignDraftAId) ? "PATCH" : "POST";
      const r = await api(path, { method, token: empMemberAToken, body });
      assert.equal(r.status, 403, `${method} ${path} must be 403 for COMPANY_MEMBER, got ${r.status}`);
    }
    // Reads remain available.
    for (const path of [
      "/api/company/profile", "/api/company/products", "/api/company/campaigns", "/api/company/employees",
      "/api/company/study-templates", `/api/company/campaigns/${campaignAId}`,
      `/api/company/campaigns/${campaignAId}/live`, `/api/company/campaigns/${campaignAId}/insights`,
      `/api/company/campaigns/${campaignAId}/report`, `/api/company/campaigns/${campaignAId}/question-audit`,
      `/api/company/campaigns/${campaignAId}/media`, `/api/company/panel-insights`,
    ]) {
      const r = await api(path, { token: empMemberAToken });
      assert.equal(r.status, 200, `GET ${path} must be 200 for COMPANY_MEMBER, got ${r.status}`);
    }
  });

  // FD-WEB-03 (2026-09-21): OPERATIONS_MANAGER creates companies and keeps
  // the Operations scope — without inheriting Platform Admin powers.
  it("OPERATIONS_MANAGER can create companies but not Platform Admin surfaces", async () => {
    const created = await api("/api/ops/companies", {
      method: "POST", token: opsManagerToken,
      body: { name: "Mgr Co", employeeName: "E", employeeEmail: "mgr-co@x.test", employeePassword: "Password123" },
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    const audit = await prisma.accessAuditEvent.findFirst({
      where: { action: "COMPANY_CREATE", targetId: created.body.id },
    });
    assert.ok(audit, "company creation by OPERATIONS_MANAGER must be audited");

    // Operations scope retained.
    assert.equal((await api("/api/ops/campaigns", { token: opsManagerToken })).status, 200);
    assert.equal((await api(`/api/ops/campaigns/${campaignAId}/live`, { token: opsManagerToken })).status, 200);

    // Platform Admin powers are NOT inherited.
    assert.equal((await api(`/api/ops/campaigns/${campaignAId}/participants`, { token: opsManagerToken })).status, 403);
    assert.equal((await api("/api/ops/ops-users", { token: opsManagerToken })).status, 403);
    assert.equal((await api("/api/ops/audit-events", { token: opsManagerToken })).status, 403);

    // And plain OPERATIONS still cannot create companies.
    const denied = await api("/api/ops/companies", {
      method: "POST", token: opsWorkerToken,
      body: { name: "Nope", employeeName: "E", employeeEmail: "e2@x.test", employeePassword: "Password123" },
    });
    assert.equal(denied.status, 403);

    // PLATFORM_ADMIN can assign the new role.
    const ok = await api("/api/ops/ops-users", {
      method: "POST", token: opsAdminToken,
      body: { name: "M2", email: "m2@ops.test", password: "Password123", role: "OPERATIONS_MANAGER" },
    });
    assert.equal(ok.status, 201);
    assert.equal(ok.body.role, "OPERATIONS_MANAGER");
  });
});

// --- OFD-12: campaign media ----------------------------------------------------
describe("campaign media (OFD-12)", () => {
  it("supports URL media while configurable; locked after launch; company-isolated", async () => {
    const created = await api(`/api/company/campaigns/${campaignDraftAId}/media`, {
      method: "POST", token: empAdminAToken,
      body: { kind: "PACKAGING_IMAGE", url: "https://cdn.example.com/pack.png", caption: "front" },
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));

    const onActive = await api(`/api/company/campaigns/${campaignAId}/media`, {
      method: "POST", token: empAdminAToken,
      body: { kind: "CREATIVE", url: "https://cdn.example.com/ad.png" },
    });
    assert.equal(onActive.status, 409);

    const crossRead = await api(`/api/company/campaigns/${campaignAId}/media`, { token: empBToken });
    assert.equal(crossRead.status, 404);

    const del = await api(`/api/company/campaigns/${campaignDraftAId}/media/${created.body.id}`, {
      method: "DELETE", token: empAdminAToken,
    });
    assert.equal(del.status, 204);
  });
});

// --- OFD-19: question audit + change requests ----------------------------------
describe("question audit + change requests (OFD-19)", () => {
  it("audits direct create/delete while configurable", async () => {
    const created = await api(`/api/company/campaigns/${campaignDraftAId}/questions`, {
      method: "POST", token: empAdminAToken,
      body: { stage: "POST_TRIAL", type: "TEXT", text: "Audited?", order: 5 },
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    const qid = created.body.id;

    const del = await api(`/api/company/campaigns/${campaignDraftAId}/questions/${qid}`, { method: "DELETE", token: empAdminAToken });
    assert.equal(del.status, 204);

    const audit = await prisma.questionAuditEvent.findMany({ where: { campaignId: campaignDraftAId, questionId: qid }, orderBy: { createdAt: "asc" } });
    assert.equal(audit.length, 2);
    assert.equal(audit[0].action, "CREATE");
    assert.equal(audit[0].lifecycleState, "DRAFT");
    assert.equal(audit[1].action, "DELETE");
    assert.ok(JSON.parse(audit[1].prevValue!).text === "Audited?");
  });

  it("locked campaign: company files request, ops applies edit, audit records both actors", async () => {
    // COMPANY_MEMBER cannot file change requests
    const denied = await api(`/api/company/campaigns/${campaignAId}/question-change-requests`, {
      method: "POST", token: empMemberAToken,
      body: { action: "EDIT", questionId: qChoiceId, payload: { text: "Pick one?" } },
    });
    assert.equal(denied.status, 403);

    const req = await api(`/api/company/campaigns/${campaignAId}/question-change-requests`, {
      method: "POST", token: empAdminAToken,
      body: { action: "EDIT", questionId: qChoiceId, payload: { text: "Pick one?" }, reason: "typo" },
    });
    assert.equal(req.status, 201, JSON.stringify(req.body));

    // duplicate pending request refused
    const dup = await api(`/api/company/campaigns/${campaignAId}/question-change-requests`, {
      method: "POST", token: empAdminAToken,
      body: { action: "DELETE", questionId: qChoiceId },
    });
    assert.equal(dup.status, 409);

    const applied = await api(`/api/ops/question-change-requests/${req.body.id}/apply`, { method: "POST", token: opsWorkerToken });
    assert.equal(applied.status, 200, JSON.stringify(applied.body));
    assert.equal(applied.body.status, "PERFORMED");

    const question = await prisma.question.findUnique({ where: { id: qChoiceId } });
    assert.equal(question!.text, "Pick one?");

    const audit = await prisma.questionAuditEvent.findFirst({ where: { campaignId: campaignAId, requestId: req.body.id } });
    assert.ok(audit);
    assert.equal(audit!.action, "EDIT");
    assert.equal(audit!.actorKind, "ops");
    assert.equal(audit!.lifecycleState, "ACTIVE");
    assert.ok(JSON.parse(audit!.prevValue!).text === "Pick?");
  });

  it("delete of a question with historical answers is refused", async () => {
    const req = await api(`/api/company/campaigns/${campaignAId}/question-change-requests`, {
      method: "POST", token: empAdminAToken,
      body: { action: "DELETE", questionId: qChoiceId },
    });
    assert.equal(req.status, 201);
    const applied = await api(`/api/ops/question-change-requests/${req.body.id}/apply`, { method: "POST", token: opsWorkerToken });
    assert.equal(applied.status, 409);
    const q = await prisma.question.findUnique({ where: { id: qChoiceId } });
    assert.ok(q, "question with answers must survive");
  });
});

// --- FD-WEB-04 (2026-09-21): request workflow gains the third review
// outcome — Approve / Reject / Request Changes — audited, company-visible --
describe("request-changes review outcome (FD-WEB-04)", () => {
  it("study-type request can be sent back with a note; company sees it and may re-file", async () => {
    const filed = await api(`/api/company/campaigns/${campaignDraftAId}/study-type-requests`, {
      method: "POST", token: empAdminAToken, body: { requestedStudyType: "CONCEPT_TESTING" },
    });
    assert.equal(filed.status, 201, JSON.stringify(filed.body));

    // note is required
    const noNote = await api(`/api/ops/study-type-requests/${filed.body.id}/request-changes`, {
      method: "POST", token: opsWorkerToken, body: {},
    });
    assert.equal(noNote.status, 400);

    const sentBack = await api(`/api/ops/study-type-requests/${filed.body.id}/request-changes`, {
      method: "POST", token: opsWorkerToken, body: { note: "Clarify the research objective first" },
    });
    assert.equal(sentBack.status, 200, JSON.stringify(sentBack.body));
    assert.equal(sentBack.body.status, "CHANGES_REQUESTED");
    assert.equal(sentBack.body.reviewNote, "Clarify the research objective first");

    // the campaign is untouched — nothing was applied
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignDraftAId } });
    assert.equal(campaign!.studyType, null);

    // the decision is audited (Platform Admin audit surface)
    const audit = await prisma.accessAuditEvent.findFirst({
      where: { action: "STUDY_TYPE_REQUEST_CHANGES_REQUESTED", targetId: filed.body.id },
    });
    assert.ok(audit);

    // company sees the outcome + note on its own requests list
    const list = await api(`/api/company/campaigns/${campaignDraftAId}/study-type-requests`, { token: empMemberAToken });
    assert.equal(list.body[0].status, "CHANGES_REQUESTED");
    assert.equal(list.body[0].reviewNote, "Clarify the research objective first");

    // and may re-file — a CHANGES_REQUESTED request does not block a new one
    const refiled = await api(`/api/company/campaigns/${campaignDraftAId}/study-type-requests`, {
      method: "POST", token: empAdminAToken, body: { requestedStudyType: "BRAND_PERCEPTION" },
    });
    assert.equal(refiled.status, 201, JSON.stringify(refiled.body));

    // ops can then reject the re-filed one — closing the loop
    const rejected = await api(`/api/ops/study-type-requests/${refiled.body.id}/reject`, {
      method: "POST", token: opsWorkerToken, body: { reason: "Not this quarter" },
    });
    assert.equal(rejected.status, 200);
    const rejectAudit = await prisma.accessAuditEvent.findFirst({
      where: { action: "STUDY_TYPE_REQUEST_REJECTED", targetId: refiled.body.id },
    });
    assert.ok(rejectAudit);
  });

  it("question change request can be sent back with a note; audited and company-visible", async () => {
    const filed = await api(`/api/company/campaigns/${campaignAId}/question-change-requests`, {
      method: "POST", token: empAdminAToken,
      body: { action: "EDIT", questionId: qChoiceId, payload: { text: "Reworded?" }, reason: "clarity" },
    });
    assert.equal(filed.status, 201, JSON.stringify(filed.body));

    const sentBack = await api(`/api/ops/question-change-requests/${filed.body.id}/request-changes`, {
      method: "POST", token: opsWorkerToken, body: { note: "Keep the original wording; add a new question instead" },
    });
    assert.equal(sentBack.status, 200, JSON.stringify(sentBack.body));
    assert.equal(sentBack.body.status, "CHANGES_REQUESTED");

    // question is untouched
    const question = await prisma.question.findUnique({ where: { id: qChoiceId } });
    assert.notEqual(question!.text, "Reworded?");

    const audit = await prisma.accessAuditEvent.findFirst({
      where: { action: "QUESTION_CHANGE_CHANGES_REQUESTED", targetId: filed.body.id },
    });
    assert.ok(audit);

    // company-visible outcome
    const list = await api(`/api/company/campaigns/${campaignAId}/question-change-requests`, { token: empMemberAToken });
    const row = (list.body as { id: string; status: string; reviewNote?: string }[]).find(r => r.id === filed.body.id);
    assert.equal(row!.status, "CHANGES_REQUESTED");
    assert.equal(row!.reviewNote, "Keep the original wording; add a new question instead");
  });
});

// --- Founder decision 2026-09-20: NO consumer push -----------------------------
// Consumers receive no push notifications, so the OFD-14 request/launch
// workflow was removed (there is no delivery target). These tests pin the
// rejection: the endpoints must not exist.
describe("no consumer push (Founder decision 2026-09-20)", () => {
  it("consumer push opt-in/out endpoints are gone", async () => {
    const c = await mkConsumer();
    const on = await api("/api/consumer/push/opt-in", { method: "POST", token: c.token, body: { pushToken: "tok" } });
    assert.equal(on.status, 404);
    const off = await api("/api/consumer/push/opt-out", { method: "POST", token: c.token });
    assert.equal(off.status, 404);
  });

  it("company notification-request endpoint is gone", async () => {
    const res = await api(`/api/company/campaigns/${campaignAId}/notification-requests`, {
      method: "POST", token: empAdminAToken, body: { title: "t", body: "b" },
    });
    assert.equal(res.status, 404);
  });

  it("ops notification launch endpoint is gone", async () => {
    const res = await api("/api/ops/notification-requests", { token: opsWorkerToken });
    assert.equal(res.status, 404);
  });
});

// --- Founder decision 2026-09-20: Discover excludes participated campaigns ------
// OPEN APP -> available ACTIVE campaigns -> exclude already-participated ->
// history lives only in Activity. Enforced at the API level, not just the UI.
describe("consumer Discover exclusion (Founder decision 2026-09-20)", () => {
  it("authenticated consumer does not see a participated campaign; anonymous and other consumers do", async () => {
    // c1 participated in campaignA during `before()`.
    const c1Token = signToken({
      kind: "consumer",
      consumerId: (await prisma.participation.findFirstOrThrow({ where: { campaignId: campaignAId } })).consumerId,
    });
    const mine = await api("/api/consumer/campaigns", { token: c1Token });
    assert.equal(mine.status, 200);
    assert.ok(!mine.body.some((c: any) => c.id === campaignAId), "participated campaign must be absent from Discover");

    // Activity still returns it for the same consumer.
    const activity = await api("/api/consumer/participations", { token: c1Token });
    assert.ok(activity.body.some((p: any) => p.campaignId === campaignAId));

    // A different consumer still sees it.
    const other = await mkConsumer();
    const theirs = await api("/api/consumer/campaigns", { token: other.token });
    assert.ok(theirs.body.some((c: any) => c.id === campaignAId));

    // Anonymous callers see the public active list unchanged.
    const anon = await api("/api/consumer/campaigns");
    assert.ok(anon.body.some((c: any) => c.id === campaignAId));
  });
});

// --- OFD-15: consumer consent + same-company panel intelligence ------------------
describe("consumer consent + panel (OFD-15)", () => {
  it("opt-in/out endpoints persist flags", async () => {
    const c = await mkConsumer();
    const on = await api("/api/consumer/panel/opt-in", { method: "POST", token: c.token });
    assert.equal(on.status, 200);
    assert.equal(on.body.panelOptIn, true);
    const off = await api("/api/consumer/panel/opt-out", { method: "POST", token: c.token });
    assert.equal(off.body.panelOptIn, false);
  });

  it("panel-insights is same-company, opted-in only, small-cell suppressed", async () => {
    const a = await api("/api/company/panel-insights", { token: empAdminAToken });
    assert.equal(a.status, 200, JSON.stringify(a.body));
    assert.equal(a.body.companyId, companyAId);
    // 1 opted-in participant on campaignA; per-campaign cell n=1 < 5 → suppressed
    const ca = a.body.perCampaign.find((p: any) => p.campaignId === campaignAId);
    assert.equal(ca.optedInParticipants.suppressed, true);
    // Company B sees none of Company A's consumers
    const b = await api("/api/company/panel-insights", { token: empBToken });
    assert.equal(b.body.optedInPanelConsumers, 0);
  });

  it("no shared ops panel exists (OFD-15C rejected)", async () => {
    // OFD-15C is REJECTED: TAJRIBTI must not expose a shared opt-in panel.
    // The endpoint was removed in the post-innovation forensic audit.
    const res = await api("/api/ops/panel", { token: opsWorkerToken });
    assert.equal(res.status, 404);
  });
});

// --- OFD-03 + OFD-06: narrative + derived intelligence ----------------------------
describe("narrative + intelligence (OFD-03, OFD-06)", () => {
  it("report carries a deterministic bilingual narrative built only from report values", async () => {
    const r = await api(`/api/company/campaigns/${campaignAId}/report`, { token: empAdminAToken });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.ok(r.body.narrative);
    assert.equal(r.body.narrative.derivedNarrative, true);
    assert.ok(r.body.narrative.en.length > 0);
    assert.ok(r.body.narrative.ar.length > 0);
    // no fabricated numbers: every figure mentioned exists in the report
    const joined = r.body.narrative.en.join(" ");
    assert.ok(!/significant|predict|will increase|caused/i.test(joined));
  });

  it("intelligence returns labeled derived sections with suppression", async () => {
    const r = await api(`/api/company/campaigns/${campaignAId}/intelligence`, { token: empAdminAToken });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.derived, true);
    assert.ok(r.body.methodology.sentiment.includes("lexicon"));
    assert.equal(r.body.sentiment.counts.positive, 1); // "loved ... great"
    assert.ok(Array.isArray(r.body.statistics.proportions));
    const bView = await api(`/api/company/campaigns/${campaignAId}/intelligence`, { token: empBToken });
    assert.equal(bView.status, 404);
  });
});
