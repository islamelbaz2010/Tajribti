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
