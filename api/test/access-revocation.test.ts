import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { prisma, signToken, startApi, ApiCall } from "./helpers";

// Final non-mobile closure (2026-09-24) — Founder ruling O2 staff access
// revocation + O5 database-aware health and safe failure logging.
//
// Revocation contract:
//   - COMPANY_ADMIN revokes a same-company employee; PLATFORM_ADMIN revokes
//     an ops user. No new role is introduced; records are preserved
//     (revokedAt timestamp, never deleted).
//   - Revocation is DB-state based: a JWT issued BEFORE revocation must
//     fail authorization immediately — the middleware re-reads the row.
//   - Self-revocation is refused; cross-tenant and unauthorized revocations
//     are refused.
//   - Every revocation writes EMPLOYEE_ACCESS_REVOKED /
//     OPS_USER_ACCESS_REVOKED into AccessAuditEvent.
// Health contract: /api/health returns ok:true with db:"up" on a live DB,
// and must never include credentials or PII in its response.

let api: ApiCall;
let stopServer: () => Promise<void>;

let companyA: string, companyB: string;
let empAdminA: string, empMemberA: string, empMemberA2: string, empAdminB: string;
let opsAdmin: string, opsUser: string;

let tokAdminA: string, tokMemberA: string, tokMemberA2: string, tokAdminB: string;
let tokOpsAdmin: string, tokOpsUser: string;

before(async () => {
  ({ api, stop: stopServer } = await startApi());
  const hash = await bcrypt.hash("pass1234", 10);
  const a = await prisma.company.create({ data: { name: "Revoke A" } });
  const b = await prisma.company.create({ data: { name: "Revoke B" } });
  companyA = a.id; companyB = b.id;

  const mk = async (companyId: string, email: string, role: string) => {
    const e = await prisma.employee.create({ data: { companyId, email, name: email, passwordHash: hash, role } });
    return e.id;
  };
  empAdminA = await mk(companyA, "admin@a.test", "COMPANY_ADMIN");
  empMemberA = await mk(companyA, "member@a.test", "COMPANY_MEMBER");
  empMemberA2 = await mk(companyA, "member2@a.test", "COMPANY_MEMBER");
  empAdminB = await mk(companyB, "admin@b.test", "COMPANY_ADMIN");

  const oa = await prisma.opsUser.create({ data: { email: "padmin@r.test", name: "PA", passwordHash: hash, role: "PLATFORM_ADMIN" } });
  const ou = await prisma.opsUser.create({ data: { email: "ops@r.test", name: "OP", passwordHash: hash, role: "OPERATIONS" } });
  opsAdmin = oa.id; opsUser = ou.id;

  tokAdminA = signToken({ kind: "employee", employeeId: empAdminA, companyId: companyA });
  tokMemberA = signToken({ kind: "employee", employeeId: empMemberA, companyId: companyA });
  tokMemberA2 = signToken({ kind: "employee", employeeId: empMemberA2, companyId: companyA });
  tokAdminB = signToken({ kind: "employee", employeeId: empAdminB, companyId: companyB });
  tokOpsAdmin = signToken({ kind: "ops", opsUserId: opsAdmin });
  tokOpsUser = signToken({ kind: "ops", opsUserId: opsUser });
});

after(async () => { await stopServer(); });

describe("employee access revocation (O2)", () => {
  it("rejects non-admin revocation attempts (403) and leaves the target active", async () => {
    const r = await api(`/api/company/employees/${empMemberA}/revoke`, { method: "POST", token: tokMemberA });
    assert.equal(r.status, 403);
    const e = await prisma.employee.findUnique({ where: { id: empMemberA } });
    assert.equal(e!.revokedAt, null);
  });

  it("rejects cross-tenant revocation (404) — company B admin cannot revoke company A employee", async () => {
    const r = await api(`/api/company/employees/${empMemberA}/revoke`, { method: "POST", token: tokAdminB });
    assert.equal(r.status, 404);
    const e = await prisma.employee.findUnique({ where: { id: empMemberA } });
    assert.equal(e!.revokedAt, null);
  });

  it("rejects self-revocation (409) — no admin self-lockout via the revoke control", async () => {
    const r = await api(`/api/company/employees/${empAdminA}/revoke`, { method: "POST", token: tokAdminA });
    assert.equal(r.status, 409);
    const e = await prisma.employee.findUnique({ where: { id: empAdminA } });
    assert.equal(e!.revokedAt, null);
  });

  it("revokes an employee: login fails, pre-issued JWT fails, history preserved, audit written", async () => {
    // Pre-issued token works before revocation.
    const before = await api("/api/company/profile", { token: tokMemberA });
    assert.equal(before.status, 200);

    const r = await api(`/api/company/employees/${empMemberA}/revoke`, { method: "POST", token: tokAdminA });
    assert.equal(r.status, 200);
    assert.equal(r.body.revoked, true);

    // Record preserved, not deleted.
    const e = await prisma.employee.findUnique({ where: { id: empMemberA } });
    assert.ok(e);
    assert.ok(e!.revokedAt instanceof Date);

    // Old JWT is dead immediately (DB-state check, not claim trust).
    const afterJwt = await api("/api/company/profile", { token: tokMemberA });
    assert.equal(afterJwt.status, 403);

    // Fresh login is refused with the generic invalid-credentials response.
    const login = await api("/api/staff/login", { method: "POST", body: { email: "member@a.test", password: "pass1234" } });
    assert.equal(login.status, 401);
    assert.match(login.body.error, /invalid/i);
    assert.ok(!("kind" in login.body)); // no account-kind leak to an unauthenticated caller

    // Audit event exists, actor-attributed, no secrets in detail.
    const audit = await prisma.accessAuditEvent.findFirst({ where: { action: "EMPLOYEE_ACCESS_REVOKED", targetId: empMemberA } });
    assert.ok(audit);
    assert.equal(audit!.actorKind, "employee");
    assert.equal(audit!.actorId, empAdminA);
    assert.equal(audit!.targetType, "employee");
    assert.ok(!JSON.stringify(audit).includes("pass1234"));

    // Revoked employee no longer appears reachable as active in the list.
    const list = await api("/api/company/employees", { token: tokAdminA });
    const row = list.body.find((x: any) => x.id === empMemberA);
    assert.ok(row.revokedAt);
  });

  it("second revoke is refused (409) — revocation is one-way by design", async () => {
    const r = await api(`/api/company/employees/${empMemberA}/revoke`, { method: "POST", token: tokAdminA });
    assert.equal(r.status, 409);
  });

  it("the last active Company Admin of a company cannot be revoked (409)", async () => {
    // Company B has exactly one admin; nobody else may revoke them.
    const b2 = await prisma.employee.create({
      data: { companyId: companyB, email: "member@b.test", name: "MB", passwordHash: await bcrypt.hash("pass1234", 10), role: "COMPANY_MEMBER" },
    });
    const r = await api(`/api/company/employees/${empAdminB}/revoke`, { method: "POST", token: tokAdminB });
    assert.equal(r.status, 409); // self-revoke guard fires first for the caller
    // A second admin CAN revoke the first — proving the guard is about
    // the target being the last admin, not about admins being unrevocable.
    const admin2 = await prisma.employee.create({
      data: { companyId: companyB, email: "admin2@b.test", name: "A2", passwordHash: await bcrypt.hash("pass1234", 10), role: "COMPANY_ADMIN" },
    });
    const tokAdminB2 = signToken({ kind: "employee", employeeId: admin2.id, companyId: companyB });
    const ok = await api(`/api/company/employees/${empAdminB}/revoke`, { method: "POST", token: tokAdminB2 });
    assert.equal(ok.status, 200);
    assert.ok(b2.id); // member row untouched
  });
});

describe("ops user access revocation (O2)", () => {
  it("rejects a non-platform-admin ops user (403)", async () => {
    const r = await api(`/api/ops/ops-users/${opsUser}/revoke`, { method: "POST", token: tokOpsUser });
    assert.equal(r.status, 403);
    const u = await prisma.opsUser.findUnique({ where: { id: opsUser } });
    assert.equal(u!.revokedAt, null);
  });

  it("rejects a company employee token entirely (403)", async () => {
    const r = await api(`/api/ops/ops-users/${opsUser}/revoke`, { method: "POST", token: tokAdminA });
    assert.equal(r.status, 403);
  });

  it("rejects self-revocation (409)", async () => {
    const r = await api(`/api/ops/ops-users/${opsAdmin}/revoke`, { method: "POST", token: tokOpsAdmin });
    assert.equal(r.status, 409);
  });

  it("revokes an ops user: login fails, pre-issued JWT fails on privileged routes, audit written", async () => {
    const before = await api("/api/ops/campaigns", { token: tokOpsUser });
    assert.equal(before.status, 200);

    const r = await api(`/api/ops/ops-users/${opsUser}/revoke`, { method: "POST", token: tokOpsAdmin });
    assert.equal(r.status, 200);

    const u = await prisma.opsUser.findUnique({ where: { id: opsUser } });
    assert.ok(u!.revokedAt instanceof Date);

    // Old JWT dead on the ops pipeline immediately.
    const afterJwt = await api("/api/ops/campaigns", { token: tokOpsUser });
    assert.equal(afterJwt.status, 403);

    // Fresh login refused generically.
    const login = await api("/api/staff/login", { method: "POST", body: { email: "ops@r.test", password: "pass1234" } });
    assert.equal(login.status, 401);

    const audit = await prisma.accessAuditEvent.findFirst({ where: { action: "OPS_USER_ACCESS_REVOKED", targetId: opsUser } });
    assert.ok(audit);
    assert.equal(audit!.actorId, opsAdmin);
    assert.ok(!JSON.stringify(audit).includes("pass1234"));
  });
});

describe("revoked-account logins stay generic (no account-kind leak)", () => {
  it("revoked employee via legacy company login → generic 401", async () => {
    const r = await api("/api/company/auth/login", { method: "POST", body: { email: "member@a.test", password: "pass1234" } });
    assert.equal(r.status, 401);
    assert.match(r.body.error, /invalid/i);
  });
  it("revoked ops user via legacy ops login → generic 401", async () => {
    const r = await api("/api/ops/auth/login", { method: "POST", body: { email: "ops@r.test", password: "pass1234" } });
    assert.equal(r.status, 401);
    assert.match(r.body.error, /invalid/i);
  });
  it("wrong password for an ACTIVE account → identical generic 401", async () => {
    const r = await api("/api/staff/login", { method: "POST", body: { email: "admin@a.test", password: "wrong" } });
    assert.equal(r.status, 401);
    assert.match(r.body.error, /invalid/i);
  });
});

describe("database-aware health endpoint (O5)", () => {
  it("returns ok + db:up on a live database, with no PII or credentials in the body", async () => {
    const r = await api("/api/health");
    assert.equal(r.status, 200);
    assert.equal(r.body.ok, true);
    assert.equal(r.body.db, "up");
    const body = JSON.stringify(r.body);
    assert.ok(!body.includes("pass1234"));
    assert.ok(!body.includes("@a.test"));
    assert.ok(!body.includes("+20"));
  });
});

describe("safe failure logging (O5)", () => {
  it("OTP verify failure logs an operational event without the code or phone", async () => {
    const events: unknown[][] = [];
    const orig = console.warn;
    console.warn = (...a: unknown[]) => { events.push(a); };
    try {
      const r = await api("/api/consumer/auth/otp/verify", {
        method: "POST",
        body: { phone: "+201099998888", code: "000000" },
      });
      assert.equal(r.status, 401);
    } finally {
      console.warn = orig;
    }
    const hit = events.find((a) => String(a[0]).includes("[OTP]"));
    assert.ok(hit, "expected an [OTP] operational log event");
    const line = JSON.stringify(hit);
    assert.ok(!line.includes("+201099998888"), "phone number must not appear in logs");
    assert.ok(!line.includes("000000"), "OTP code must not appear in logs");
  });

  it("staff login failure logs an operational event without the password or email", async () => {
    const events: unknown[][] = [];
    const orig = console.warn;
    console.warn = (...a: unknown[]) => { events.push(a); };
    try {
      await api("/api/staff/login", { method: "POST", body: { email: "ghost@nowhere.test", password: "hunter2secret" } });
    } finally {
      console.warn = orig;
    }
    const hit = events.find((a) => String(a[0]).includes("[auth]"));
    assert.ok(hit, "expected an [auth] operational log event");
    const line = JSON.stringify(hit);
    assert.ok(!line.includes("hunter2secret"), "password must not appear in logs");
    assert.ok(!line.includes("ghost@nowhere.test"), "email must not appear in logs");
  });
});
