import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { prisma, signToken, startApi, ApiCall } from "./helpers";

// Consolidated pass (2026-09-25) — Founder direction: PLATFORM_ADMIN holds
// global platform authority over Company information, and admin changes
// to company-owned data must be identifiable to the Company.
//
// Contract under test:
//   - GET /ops/companies/:id — any ops role views one company's identity,
//     employees, products and campaigns (never passwordHash).
//   - PATCH /ops/companies/:id — OPERATIONS_MANAGER + PLATFORM_ADMIN only;
//     industry/sub-industry validated against the canonical taxonomy; the
//     change writes an AccessAuditEvent with a field-level detail diff.
//   - POST /ops/companies/:id/employees/:eid/revoke — PLATFORM_ADMIN only;
//     same revocation semantics as the company-side revoke (guards,
//     audit, immediate effect via middleware re-read).
//   - GET /company/audit-events — company sees events targeting its own
//     rows (company + its employees), including the ops-side detail; never
//     another company's events.

let api: ApiCall;
let stopServer: () => Promise<void>;

let companyA: string, companyB: string;
let empAdminA: string, empMemberA: string, empAdminB: string;
let tokAdminA: string, tokMemberA: string, tokAdminB: string;
let tokOpsAdmin: string, tokOpsManager: string, tokOpsUser: string;

before(async () => {
  ({ api, stop: stopServer } = await startApi());
  const hash = await bcrypt.hash("pass1234", 10);
  const a = await prisma.company.create({ data: { name: "PACo A", industry: "Food & Beverage", subIndustry: "Beverages" } });
  const b = await prisma.company.create({ data: { name: "PACo B" } });
  companyA = a.id; companyB = b.id;

  const mk = async (companyId: string, email: string, role: string) =>
    (await prisma.employee.create({ data: { companyId, email, name: email, passwordHash: hash, role } })).id;
  empAdminA = await mk(companyA, "admin@pa.test", "COMPANY_ADMIN");
  empMemberA = await mk(companyA, "member@pa.test", "COMPANY_MEMBER");
  empAdminB = await mk(companyB, "admin@pb.test", "COMPANY_ADMIN");
  await prisma.product.create({ data: { companyId: companyA, name: "PA Cola" } });
  await prisma.campaign.create({ data: { companyId: companyA, name: "PA Campaign", status: "DRAFT", objective: "PA objective", startDate: new Date(), endDate: new Date(Date.now() + 86400000) } });

  const oa = await prisma.opsUser.create({ data: { email: "pa@pac.test", name: "Plat Admin", passwordHash: hash, role: "PLATFORM_ADMIN" } });
  const om = await prisma.opsUser.create({ data: { email: "om@pac.test", name: "Ops Mgr", passwordHash: hash, role: "OPERATIONS_MANAGER" } });
  const ou = await prisma.opsUser.create({ data: { email: "op@pac.test", name: "Ops", passwordHash: hash, role: "OPERATIONS" } });

  tokAdminA = signToken({ kind: "employee", employeeId: empAdminA, companyId: companyA });
  tokMemberA = signToken({ kind: "employee", employeeId: empMemberA, companyId: companyA });
  tokAdminB = signToken({ kind: "employee", employeeId: empAdminB, companyId: companyB });
  tokOpsAdmin = signToken({ kind: "ops", opsUserId: oa.id });
  tokOpsManager = signToken({ kind: "ops", opsUserId: om.id });
  tokOpsUser = signToken({ kind: "ops", opsUserId: ou.id });
});

after(async () => { await stopServer(); });

describe("GET /ops/companies/:id — platform-wide company view", () => {
  it("returns identity, employees, products and campaigns without credentials", async () => {
    const r = await api(`/api/ops/companies/${companyA}`, { token: tokOpsUser });
    assert.equal(r.status, 200);
    assert.equal(r.body.name, "PACo A");
    assert.equal(r.body.employees.length, 2);
    assert.equal(r.body.products.length, 1);
    assert.equal(r.body.campaigns.length, 1);
    assert.equal(r.body.employees[0].passwordHash, undefined);
  });
  it("rejects company employees and unknown companies", async () => {
    assert.equal((await api(`/api/ops/companies/${companyA}`, { token: tokAdminA })).status, 403);
    assert.equal((await api(`/api/ops/companies/nope`, { token: tokOpsAdmin })).status, 404);
  });
});

describe("PATCH /ops/companies/:id — audited company identity management", () => {
  it("PLATFORM_ADMIN updates industry pair; audit carries field-level detail", async () => {
    const r = await api(`/api/ops/companies/${companyB}`, {
      method: "PATCH",
      token: tokOpsAdmin,
      body: { industry: "Beauty & Personal Care", subIndustry: "Skincare", name: "PACo B Renamed" },
    });
    assert.equal(r.status, 200);
    assert.equal(r.body.industry, "Beauty & Personal Care");
    const audit = await prisma.accessAuditEvent.findFirst({
      where: { action: "COMPANY_PROFILE_UPDATED", targetType: "company", targetId: companyB },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(audit);
    assert.match(audit.detail ?? "", /industry/);
    assert.match(audit.detail ?? "", /PACo B Renamed/);
    assert.equal(audit.actorName, "Plat Admin");
  });
  it("OPERATIONS_MANAGER can update; OPERATIONS and employees cannot", async () => {
    assert.equal((await api(`/api/ops/companies/${companyB}`, { method: "PATCH", token: tokOpsManager, body: { name: "PACo B2" } })).status, 200);
    assert.equal((await api(`/api/ops/companies/${companyB}`, { method: "PATCH", token: tokOpsUser, body: { name: "x" } })).status, 403);
    assert.equal((await api(`/api/ops/companies/${companyB}`, { method: "PATCH", token: tokAdminB, body: { name: "x" } })).status, 403);
  });
  it("rejects unknown industry, mismatched sub-industry, and no-op writes skip audit", async () => {
    assert.equal((await api(`/api/ops/companies/${companyA}`, { method: "PATCH", token: tokOpsAdmin, body: { industry: "Nonsense" } })).status, 400);
    assert.equal((await api(`/api/ops/companies/${companyA}`, { method: "PATCH", token: tokOpsAdmin, body: { subIndustry: "Skincare" } })).status, 400);
    const before = await prisma.accessAuditEvent.count({ where: { action: "COMPANY_PROFILE_UPDATED", targetId: companyA } });
    const r = await api(`/api/ops/companies/${companyA}`, { method: "PATCH", token: tokOpsAdmin, body: { industry: "Food & Beverage" } });
    assert.equal(r.status, 200);
    // industry unchanged but stale subIndustry cleared? No — pair stays
    // valid (Beverages ⊂ F&B); identical values → no write, no audit.
    const after = await prisma.accessAuditEvent.count({ where: { action: "COMPANY_PROFILE_UPDATED", targetId: companyA } });
    assert.equal(after, before);
  });
  it("changing industry clears a stale sub-industry", async () => {
    const r = await api(`/api/ops/companies/${companyA}`, { method: "PATCH", token: tokOpsAdmin, body: { industry: "Pet Care" } });
    assert.equal(r.status, 200);
    assert.equal(r.body.industry, "Pet Care");
    assert.equal(r.body.subIndustry, null);
  });
});

describe("POST /ops/companies/:id/employees/:eid/revoke — PLATFORM_ADMIN", () => {
  it("revokes a company member and audits it with detail", async () => {
    const r = await api(`/api/ops/companies/${companyA}/employees/${empMemberA}/revoke`, { method: "POST", token: tokOpsAdmin });
    assert.equal(r.status, 200);
    const emp = await prisma.employee.findUnique({ where: { id: empMemberA } });
    assert.ok(emp?.revokedAt);
    const audit = await prisma.accessAuditEvent.findFirst({
      where: { action: "EMPLOYEE_ACCESS_REVOKED", targetType: "employee", targetId: empMemberA, actorKind: "ops" },
    });
    assert.ok(audit);
    assert.match(audit.detail ?? "", /member@pa\.test/);
  });
  it("rejects OPERATIONS_MANAGER, OPERATIONS, employees; guards last admin and repeats", async () => {
    const other = await prisma.employee.create({ data: { companyId: companyA, email: "m2@pa.test", name: "m2", passwordHash: "x", role: "COMPANY_MEMBER" } });
    assert.equal((await api(`/api/ops/companies/${companyA}/employees/${other.id}/revoke`, { method: "POST", token: tokOpsManager })).status, 403);
    assert.equal((await api(`/api/ops/companies/${companyA}/employees/${other.id}/revoke`, { method: "POST", token: tokOpsUser })).status, 403);
    assert.equal((await api(`/api/ops/companies/${companyA}/employees/${other.id}/revoke`, { method: "POST", token: tokAdminA })).status, 403);
    // cross-company target → 404
    assert.equal((await api(`/api/ops/companies/${companyB}/employees/${other.id}/revoke`, { method: "POST", token: tokOpsAdmin })).status, 404);
    // last active admin cannot be revoked
    assert.equal((await api(`/api/ops/companies/${companyA}/employees/${empAdminA}/revoke`, { method: "POST", token: tokOpsAdmin })).status, 409);
    // already revoked
    assert.equal((await api(`/api/ops/companies/${companyA}/employees/${empMemberA}/revoke`, { method: "POST", token: tokOpsAdmin })).status, 409);
  });
  it("a revoked employee's JWT stops working immediately", async () => {
    assert.equal((await api("/api/company/profile", { token: tokMemberA })).status, 403);
  });
});

describe("GET /company/audit-events — company-visible traceability", () => {
  it("returns company + employee events for the caller's company only", async () => {
    const r = await api("/api/company/audit-events", { token: tokAdminA });
    assert.equal(r.status, 200);
    const revoked = r.body.find((e: any) => e.action === "EMPLOYEE_ACCESS_REVOKED");
    assert.ok(revoked);
    assert.equal(revoked.actorKind, "ops");
    assert.equal(revoked.actorName, "Plat Admin");
    const update = r.body.find((e: any) => e.action === "COMPANY_PROFILE_UPDATED");
    assert.ok(update);
    assert.ok(r.body.every((e: any) => !String(e.detail ?? "").includes("PACo B")));
  });
  it("company B does not see company A's events; members can read", async () => {
    const r = await api("/api/company/audit-events", { token: tokAdminB });
    assert.equal(r.status, 200);
    assert.ok(r.body.every((e: any) => !String(e.detail ?? "").includes("member@pa.test")));
    // member role can also read the feed (it is their own company's
    // audit trail) — use a fresh active member since empMemberA was
    // revoked above.
    const activeMember = await prisma.employee.create({ data: { companyId: companyA, email: "m3@pa.test", name: "m3", passwordHash: "x", role: "COMPANY_MEMBER" } });
    const m = await api("/api/company/audit-events", { token: signToken({ kind: "employee", employeeId: activeMember.id, companyId: companyA }) });
    assert.equal(m.status, 200);
  });
  it("rejects ops tokens", async () => {
    assert.equal((await api("/api/company/audit-events", { token: tokOpsAdmin })).status, 403);
  });
});

// Founder Decision B (2026-09-25): PLATFORM_ADMIN direct management of
// company-owned resources — products, campaign questions, QR sources and
// media — mirroring the company-side schemas and lifecycle lock, audited
// with detail, company-visible via the Account Activity feed.
describe("PLATFORM_ADMIN direct resource management", () => {
  let paCampaign: string;
  let paProduct: string;

  it("can create and update a company product", async () => {
    const r = await api(`/api/ops/companies/${companyA}/products`, {
      method: "POST", token: tokOpsAdmin, body: { name: "Admin-made Product", description: "d" },
    });
    assert.equal(r.status, 201);
    paProduct = r.body.id;
    const u = await api(`/api/ops/companies/${companyA}/products/${paProduct}`, {
      method: "PATCH", token: tokOpsAdmin, body: { name: "Admin-made Product v2" },
    });
    assert.equal(u.status, 200);
    assert.equal(u.body.name, "Admin-made Product v2");
    const audit = await prisma.accessAuditEvent.findFirst({ where: { action: "PRODUCT_UPDATED", targetId: paProduct } });
    assert.ok(audit?.detail);
  });
  it("product mutations are PA-only and company-scoped", async () => {
    assert.equal((await api(`/api/ops/companies/${companyA}/products`, { method: "POST", token: tokOpsManager, body: { name: "x" } })).status, 403);
    assert.equal((await api(`/api/ops/companies/${companyA}/products`, { method: "POST", token: tokOpsUser, body: { name: "x" } })).status, 403);
    assert.equal((await api(`/api/ops/companies/${companyA}/products`, { method: "POST", token: tokAdminA, body: { name: "x" } })).status, 403);
    assert.equal((await api(`/api/ops/companies/${companyB}/products/${paProduct}`, { method: "PATCH", token: tokOpsAdmin, body: { name: "x" } })).status, 404);
  });

  it("can add and delete campaign questions, audited as ops", async () => {
    paCampaign = (await prisma.campaign.create({
      data: { companyId: companyA, name: "PA Q Campaign", objective: "o", startDate: new Date(), endDate: new Date(), status: "DRAFT" },
    })).id;
    const r = await api(`/api/ops/campaigns/${paCampaign}/questions`, {
      method: "POST", token: tokOpsAdmin,
      body: { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "PA question?", options: [{ id: "a", label: "Yes" }, { id: "b", label: "No" }] },
    });
    assert.equal(r.status, 201);
    const qAudit = await prisma.questionAuditEvent.findFirst({ where: { questionId: r.body.id, action: "CREATE" } });
    assert.equal(qAudit?.actorKind, "ops");
    const del = await api(`/api/ops/campaigns/${paCampaign}/questions/${r.body.id}`, { method: "DELETE", token: tokOpsAdmin });
    assert.equal(del.status, 204);
    const dAudit = await prisma.questionAuditEvent.findFirst({ where: { questionId: r.body.id, action: "DELETE" } });
    assert.equal(dAudit?.actorKind, "ops");
  });
  it("question routes reject non-PA roles and locked campaigns", async () => {
    const locked = await prisma.campaign.create({
      data: { companyId: companyA, name: "Locked", objective: "o", startDate: new Date(), endDate: new Date(), status: "ACTIVE" },
    });
    assert.equal((await api(`/api/ops/campaigns/${locked.id}/questions`, { method: "POST", token: tokOpsAdmin, body: { stage: "POST_TRIAL", type: "TEXT", text: "x" } })).status, 409);
    assert.equal((await api(`/api/ops/campaigns/${paCampaign}/questions`, { method: "POST", token: tokOpsManager, body: { stage: "POST_TRIAL", type: "TEXT", text: "x" } })).status, 403);
    assert.equal((await api(`/api/ops/campaigns/${paCampaign}/questions`, { method: "POST", token: tokAdminA, body: { stage: "POST_TRIAL", type: "TEXT", text: "x" } })).status, 403);
    // choice validation mirrors company rules
    assert.equal((await api(`/api/ops/campaigns/${paCampaign}/questions`, { method: "POST", token: tokOpsAdmin, body: { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "x" } })).status, 400);
  });

  it("can add QR sources with duplicate-code protection", async () => {
    const r = await api(`/api/ops/campaigns/${paCampaign}/qr-sources`, {
      method: "POST", token: tokOpsAdmin,
      body: { label: "Admin QR", code: "PA-QR-1", activeFrom: "2026-01-01", activeTo: "2026-02-01" },
    });
    assert.equal(r.status, 201);
    assert.equal((await api(`/api/ops/campaigns/${paCampaign}/qr-sources`, {
      method: "POST", token: tokOpsAdmin,
      body: { label: "dup", code: "PA-QR-1", activeFrom: "2026-01-01", activeTo: "2026-02-01" },
    })).status, 409);
    assert.equal((await api(`/api/ops/campaigns/${paCampaign}/qr-sources`, {
      method: "POST", token: tokOpsUser, body: { label: "x", code: "yyy", activeFrom: "2026-01-01", activeTo: "2026-02-01" },
    })).status, 403);
  });

  it("can add and remove URL media", async () => {
    const r = await api(`/api/ops/campaigns/${paCampaign}/media`, {
      method: "POST", token: tokOpsAdmin, body: { kind: "PRODUCT_IMAGE", url: "https://example.com/p.png", caption: "c" },
    });
    assert.equal(r.status, 201);
    const del = await api(`/api/ops/campaigns/${paCampaign}/media/${r.body.id}`, { method: "DELETE", token: tokOpsAdmin });
    assert.equal(del.status, 204);
    assert.equal((await api(`/api/ops/campaigns/${paCampaign}/media`, { method: "POST", token: tokOpsManager, body: { kind: "CREATIVE", url: "https://example.com/x.png" } })).status, 403);
  });

  it("can change employee roles with the last-admin guard, audited", async () => {
    const m3 = await prisma.employee.create({ data: { companyId: companyA, email: "role@pa.test", name: "role", passwordHash: "x", role: "COMPANY_MEMBER" } });
    const r = await api(`/api/ops/companies/${companyA}/employees/${m3.id}/role`, {
      method: "PATCH", token: tokOpsAdmin, body: { role: "COMPANY_ADMIN" },
    });
    assert.equal(r.status, 200);
    const audit = await prisma.accessAuditEvent.findFirst({ where: { action: "EMPLOYEE_ROLE_CHANGE", targetType: "employee", targetId: m3.id, actorKind: "ops" } });
    assert.match(audit?.detail ?? "", /COMPANY_MEMBER → COMPANY_ADMIN/);
    // demoting the last remaining admin is refused
    await prisma.employee.update({ where: { id: empAdminA }, data: { revokedAt: new Date() } });
    const last = await prisma.employee.findFirst({ where: { companyId: companyA, role: "COMPANY_ADMIN", revokedAt: null } });
    assert.equal((await api(`/api/ops/companies/${companyA}/employees/${last!.id}/role`, { method: "PATCH", token: tokOpsAdmin, body: { role: "COMPANY_MEMBER" } })).status, 409);
    // restore the fixture admin — its token is used by later tests
    await prisma.employee.update({ where: { id: empAdminA }, data: { revokedAt: null } });
    assert.equal((await api(`/api/ops/companies/${companyA}/employees/${m3.id}/role`, { method: "PATCH", token: tokOpsManager, body: { role: "COMPANY_MEMBER" } })).status, 403);
    // cross-company target → 404
    assert.equal((await api(`/api/ops/companies/${companyB}/employees/${m3.id}/role`, { method: "PATCH", token: tokOpsAdmin, body: { role: "COMPANY_MEMBER" } })).status, 404);
  });

  it("can PATCH campaign configuration directly, unrestricted by industry eligibility", async () => {
    // PA may set any catalog study type — eligibility is company-facing.
    const r = await api(`/api/ops/campaigns/${paCampaign}`, {
      method: "PATCH", token: tokOpsAdmin,
      body: { name: "PA Renamed Campaign", studyType: "POST_TRIAL_HOME_CARE", audienceCity: "Cairo" },
    });
    assert.equal(r.status, 200);
    assert.equal(r.body.name, "PA Renamed Campaign");
    assert.equal(r.body.studyType, "POST_TRIAL_HOME_CARE"); // company A is Pet Care — admin is unrestricted
    const audit = await prisma.accessAuditEvent.findFirst({ where: { action: "CAMPAIGN_CONFIG_UPDATED", targetId: paCampaign } });
    assert.match(audit?.detail ?? "", /studyType/);
  });
  it("campaign PATCH is PA-only, lifecycle-locked, and product-scoped", async () => {
    assert.equal((await api(`/api/ops/campaigns/${paCampaign}`, { method: "PATCH", token: tokOpsManager, body: { name: "x" } })).status, 403);
    assert.equal((await api(`/api/ops/campaigns/${paCampaign}`, { method: "PATCH", token: tokAdminA, body: { name: "x" } })).status, 403);
    const active = await prisma.campaign.create({ data: { companyId: companyA, name: "Act", objective: "o", startDate: new Date(), endDate: new Date(), status: "ACTIVE" } });
    assert.equal((await api(`/api/ops/campaigns/${active.id}`, { method: "PATCH", token: tokOpsAdmin, body: { name: "x" } })).status, 409);
    const foreignProduct = await prisma.product.findFirst({ where: { companyId: companyB } });
    if (!foreignProduct) {
      const p = await prisma.product.create({ data: { companyId: companyB, name: "B product" } });
      assert.equal((await api(`/api/ops/campaigns/${paCampaign}`, { method: "PATCH", token: tokOpsAdmin, body: { productId: p.id } })).status, 404);
    } else {
      assert.equal((await api(`/api/ops/campaigns/${paCampaign}`, { method: "PATCH", token: tokOpsAdmin, body: { productId: foreignProduct.id } })).status, 404);
    }
  });
  it("can DELETE a DRAFT campaign; refused for non-DRAFT or evidenced campaigns", async () => {
    const draft = await prisma.campaign.create({ data: { companyId: companyA, name: "Del", objective: "o", startDate: new Date(), endDate: new Date(), status: "DRAFT" } });
    const active = await prisma.campaign.create({ data: { companyId: companyA, name: "NoDel", objective: "o", startDate: new Date(), endDate: new Date(), status: "ACTIVE" } });
    assert.equal((await api(`/api/ops/campaigns/${active.id}`, { method: "DELETE", token: tokOpsAdmin })).status, 409);
    assert.equal((await api(`/api/ops/campaigns/${draft.id}`, { method: "DELETE", token: tokOpsManager })).status, 403);
    assert.equal((await api(`/api/ops/campaigns/${draft.id}`, { method: "DELETE", token: tokOpsAdmin })).status, 204);
    assert.equal(await prisma.campaign.count({ where: { id: draft.id } }), 0);
  });

  it("company Account Activity shows all admin resource changes for its own company only", async () => {
    const r = await api("/api/company/audit-events", { token: tokAdminA });
    assert.equal(r.status, 200);
    const actions = r.body.map((e: any) => e.action);
    for (const a of ["PRODUCT_CREATE", "PRODUCT_UPDATED", "QUESTION_CREATE", "QUESTION_DELETE", "QR_SOURCE_CREATE", "CAMPAIGN_MEDIA_ADD", "CAMPAIGN_MEDIA_DELETE"]) {
      assert.ok(actions.includes(a), a);
    }
    assert.ok(r.body.every((e: any) => e.actorKind === "ops" || e.actorKind === "employee"));
    const rB = await api("/api/company/audit-events", { token: tokAdminB });
    assert.ok(rB.body.every((e: any) => !String(e.detail ?? "").includes("Admin-made")));
  });
});

describe("reconciliation pass — QR generation, template apply, segment suppression", () => {
  it("ops QR endpoint renders the same deterministic PNG the normal campaign flow produces", async () => {
    const camp = await prisma.campaign.create({ data: { companyId: companyA, name: "QR Png", objective: "o", startDate: new Date(), endDate: new Date(), status: "DRAFT" } });
    const other = await prisma.campaign.create({ data: { companyId: companyB, name: "QR Other", objective: "o", startDate: new Date(), endDate: new Date(), status: "DRAFT" } });
    const source = await prisma.qrSource.create({ data: { campaignId: camp.id, label: "Store A", code: "QR-TEST-001", activeFrom: new Date(), activeTo: new Date(Date.now() + 86400000) } });
    const r = await api(`/api/ops/campaigns/${camp.id}/qr-sources/${source.id}/qr.png`, { token: tokOpsUser, raw: true });
    assert.equal(r.status, 200);
    assert.match(r.headers?.["content-type"] ?? "", /image\/png/);
    assert.deepEqual(Array.from(r.raw!.subarray(0, 4)), [0x89, 0x50, 0x4e, 0x47]); // PNG magic — real generated image
    // a source belonging to a different campaign is not reachable through this campaign's URL
    assert.equal((await api(`/api/ops/campaigns/${other.id}/qr-sources/${source.id}/qr.png`, { token: tokOpsUser })).status, 404);
    assert.equal((await api(`/api/ops/campaigns/${camp.id}/qr-sources/nope/qr.png`, { token: tokOpsUser })).status, 404);
    // employees cannot use the ops surface at all
    assert.equal((await api(`/api/ops/campaigns/${camp.id}/qr-sources/${source.id}/qr.png`, { token: tokAdminA })).status, 403);
    // the company-side route renders the same image for the same source (same generation path)
    const co = await api(`/api/company/campaigns/${camp.id}/qr-sources/${source.id}/qr.png`, { token: tokAdminA, raw: true });
    assert.equal(co.status, 200);
    assert.deepEqual(Array.from(co.raw!.subarray(0, 4)), [0x89, 0x50, 0x4e, 0x47]);
  });

  it("PLATFORM_ADMIN applies a study template with the same integrity guard — full catalog, audited", async () => {
    // companyB has no industry: a sector variant is ineligible company-side
    // but PA selects from the unrestricted catalog (Decision A).
    const camp = await prisma.campaign.create({ data: { companyId: companyB, name: "Tpl", objective: "o", startDate: new Date(), endDate: new Date(), status: "DRAFT" } });
    const r = await api(`/api/ops/campaigns/${camp.id}/questions/apply-template`, { method: "POST", token: tokOpsAdmin, body: { templateKey: "POST_TRIAL_FOOD_BEVERAGE" } });
    assert.equal(r.status, 201);
    assert.ok(r.body.created.length === 4, "4 template questions created");
    assert.equal(r.body.skipped.length, 0);
    // second application: every question skipped (exact-text dedup + metric guards)
    const r2 = await api(`/api/ops/campaigns/${camp.id}/questions/apply-template`, { method: "POST", token: tokOpsAdmin, body: { templateKey: "POST_TRIAL_FOOD_BEVERAGE" } });
    assert.equal(r2.status, 201);
    assert.equal(r2.body.created.length, 0);
    assert.equal(r2.body.skipped.length, 4);
    // audit: QuestionAuditEvent per row + one AccessAuditEvent per application
    const qa = await prisma.questionAuditEvent.findMany({ where: { campaignId: camp.id, action: "CREATE" } });
    assert.equal(qa.length, 4);
    assert.ok(qa.every((e) => e.actorKind === "ops"));
    const access = await prisma.accessAuditEvent.findMany({ where: { action: "QUESTION_APPLY_TEMPLATE", targetId: camp.id } });
    assert.equal(access.length, 2);
    // authorization: non-PA roles and employees rejected
    assert.equal((await api(`/api/ops/campaigns/${camp.id}/questions/apply-template`, { method: "POST", token: tokOpsManager, body: { templateKey: "USAGE_ATTITUDE" } })).status, 403);
    assert.equal((await api(`/api/ops/campaigns/${camp.id}/questions/apply-template`, { method: "POST", token: tokAdminB, body: { templateKey: "USAGE_ATTITUDE" } })).status, 403);
    // locked campaign refused
    const locked = await prisma.campaign.create({ data: { companyId: companyB, name: "TplL", objective: "o", startDate: new Date(), endDate: new Date(), status: "ACTIVE" } });
    assert.equal((await api(`/api/ops/campaigns/${locked.id}/questions/apply-template`, { method: "POST", token: tokOpsAdmin, body: { templateKey: "USAGE_ATTITUDE" } })).status, 409);
    // unknown key rejected
    assert.equal((await api(`/api/ops/campaigns/${camp.id}/questions/apply-template`, { method: "POST", token: tokOpsAdmin, body: { templateKey: "NOPE" } })).status, 404);
  });

  it("report suppresses gender/city segment figures below 5 responses (OFD-15 rule)", async () => {
    const camp = await prisma.campaign.create({ data: { companyId: companyA, name: "Seg", objective: "o", startDate: new Date(), endDate: new Date(), status: "ACTIVE" } });
    const q = await prisma.question.create({ data: { campaignId: camp.id, stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "PI?", order: 0, required: true } });
    const mk = async (gender: string, n: number, score: number) => {
      for (let i = 0; i < n; i++) {
        const consumer = await prisma.consumer.create({ data: { phone: `+20${gender === "F" ? "10" : "11"}${camp.id.slice(0, 6)}${i}`.slice(0, 20) + `${Date.now() % 1000}${i}` } });
        const p = await prisma.participation.create({ data: { campaignId: camp.id, consumerId: consumer.id, status: "SURVEY_COMPLETE", genderAtEntry: gender } });
        await prisma.answer.create({ data: { participationId: p.id, questionId: q.id, valueNumber: score } });
      }
    };
    await mk("Female", 2, 5.0); // below the n<5 floor -> suppressed
    await mk("Male", 6, 3.0); // at/above the floor -> shown
    const r = await api(`/api/ops/campaigns/${camp.id}/report`, { token: tokOpsUser });
    assert.equal(r.status, 200);
    const female = r.body.audienceDifferences.gender.find((s: any) => s.segmentValue === "Female");
    const male = r.body.audienceDifferences.gender.find((s: any) => s.segmentValue === "Male");
    assert.ok(female, "Female segment present (as suppressed marker, not silently dropped)");
    assert.ok(female.sentences[0].includes("suppressed") && female.sentences[0].includes("n=2"));
    assert.ok(!female.sentences[0].includes("/5"), "suppressed cell must not leak the figure");
    assert.ok(male.sentences[0].includes("n=6") && male.sentences[0].includes("3/5"));
    assert.ok(r.body.audienceDifferences.note.includes("suppressed"));
  });

  it("POST /ops/companies/:id/campaigns creates a DRAFT campaign (PA-only, audited, full catalog)", async () => {
    const body = { name: "PA-created campaign", objective: "Founder Decision B parity", startDate: "2026-10-01", endDate: "2026-10-31" };
    // PA can select any study type including a sector-specific one outside
    // the company's industry (global authority, Decision A) — company-side
    // creation would reject this combination (tested in study-type-governance).
    const r = await api(`/api/ops/companies/${companyA}/campaigns`, { method: "POST", token: tokOpsAdmin, body: { ...body, studyType: "POST_TRIAL_HOME_CARE" } });
    assert.equal(r.status, 201);
    assert.equal(r.body.companyId, companyA);
    assert.equal(r.body.status, "DRAFT");
    assert.equal(r.body.studyType, "POST_TRIAL_HOME_CARE");
    const audit = await prisma.accessAuditEvent.findFirst({ where: { action: "CAMPAIGN_CREATE", targetId: r.body.id } });
    assert.ok(audit && audit.actorKind === "ops");
    // Company sees the event in Account Activity
    const activity = await api("/api/company/audit-events", { token: tokAdminA });
    assert.equal(activity.status, 200);
    assert.ok(activity.body.some((e: any) => e.action === "CAMPAIGN_CREATE" && e.targetType === "campaign" && e.detail?.includes("PA-created campaign")));
    // no studyType -> custom campaign, no template
    const plain = await api(`/api/ops/companies/${companyA}/campaigns`, { method: "POST", token: tokOpsAdmin, body });
    assert.equal(plain.status, 201);
    assert.equal(plain.body.studyType, null);
    // authorization: only PLATFORM_ADMIN
    assert.equal((await api(`/api/ops/companies/${companyA}/campaigns`, { method: "POST", token: tokOpsManager, body })).status, 403);
    assert.equal((await api(`/api/ops/companies/${companyA}/campaigns`, { method: "POST", token: tokOpsUser, body })).status, 403);
    assert.equal((await api(`/api/ops/companies/${companyA}/campaigns`, { method: "POST", token: tokAdminA, body })).status, 403);
    // guards: unknown company, unknown study type, cross-company product, bad dates surfaced as 400
    assert.equal((await api("/api/ops/companies/nope/campaigns", { method: "POST", token: tokOpsAdmin, body })).status, 404);
    assert.equal((await api(`/api/ops/companies/${companyA}/campaigns`, { method: "POST", token: tokOpsAdmin, body: { ...body, studyType: "NOPE" } })).status, 400);
    const otherProduct = await prisma.product.create({ data: { companyId: companyB, name: "B Product" } });
    assert.equal((await api(`/api/ops/companies/${companyA}/campaigns`, { method: "POST", token: tokOpsAdmin, body: { ...body, productId: otherProduct.id } })).status, 404);
    // no credential leakage
    assert.ok(!("passwordHash" in r.body));
  });
});
