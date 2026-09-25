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
