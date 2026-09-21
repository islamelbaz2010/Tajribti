import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { prisma, startApi, ApiCall } from "./helpers";

// Founder 2nd Web Review §19/§20 regression suite — unified staff login.
//  A) One credential check serves BOTH staff account kinds; the workspace
//     destination is decided server-side from the authenticated account —
//     never from user input.
//  B) Employees (admin + member) → /app/company; every ops role → /app/ops.
//  C) Consumers are mobile-only (OTP): they have no row in either staff
//     table, so staff login cannot authenticate them.
//  D) Unknown email / wrong password → identical 401; no account-kind leak.
//  E) Returned tokens are the same signed kinds the per-surface logins issue
//     — they must actually authorize against their workspace's routes.

let api: ApiCall;
let stopServer: () => Promise<void>;

before(async () => {
  ({ api, stop: stopServer } = await startApi());
  const company = await prisma.company.create({ data: { name: "Staff Co" } });
  const hash = await bcrypt.hash("pass1234", 10);
  await prisma.employee.create({
    data: { companyId: company.id, email: "admin@staff.test", name: "A", passwordHash: hash, role: "COMPANY_ADMIN" },
  });
  await prisma.employee.create({
    data: { companyId: company.id, email: "member@staff.test", name: "M", passwordHash: hash, role: "COMPANY_MEMBER" },
  });
  for (const [email, role] of [
    ["ops@staff.test", "OPERATIONS"],
    ["opsmgr@staff.test", "OPERATIONS_MANAGER"],
    ["padmin@staff.test", "PLATFORM_ADMIN"],
  ] as const) {
    await prisma.opsUser.create({ data: { email, name: "O", passwordHash: hash, role } });
  }
  // Mobile-only consumer — deliberately NO employee/opsUser row.
  await prisma.consumer.create({ data: { phone: "+201000000001" } });
});

after(async () => { await stopServer(); });

describe("unified staff login", () => {
  it("routes a company admin to the company workspace", async () => {
    const r = await api("/api/staff/login", { method: "POST", body: { email: "admin@staff.test", password: "pass1234" } });
    assert.equal(r.status, 200);
    assert.equal(r.body.kind, "employee");
    assert.equal(r.body.role, "COMPANY_ADMIN");
    assert.equal(r.body.workspace, "/app/company");
    assert.ok(r.body.token);
    // The token must actually authorize against company routes.
    const me = await api("/api/company/profile", { token: r.body.token });
    assert.equal(me.status, 200);
  });

  it("routes a company member to the company workspace (read-only role preserved)", async () => {
    const r = await api("/api/staff/login", { method: "POST", body: { email: "member@staff.test", password: "pass1234" } });
    assert.equal(r.status, 200);
    assert.equal(r.body.kind, "employee");
    assert.equal(r.body.role, "COMPANY_MEMBER");
    assert.equal(r.body.workspace, "/app/company");
  });

  for (const [email, role] of [
    ["ops@staff.test", "OPERATIONS"],
    ["opsmgr@staff.test", "OPERATIONS_MANAGER"],
    ["padmin@staff.test", "PLATFORM_ADMIN"],
  ] as const) {
    it(`routes ${role} to the operations workspace`, async () => {
      const r = await api("/api/staff/login", { method: "POST", body: { email, password: "pass1234" } });
      assert.equal(r.status, 200);
      assert.equal(r.body.kind, "ops");
      assert.equal(r.body.role, role);
      assert.equal(r.body.workspace, "/app/ops");
      const me = await api("/api/ops/campaigns", { token: r.body.token });
      assert.equal(me.status, 200);
    });
  }

  it("rejects a consumer — consumers have no staff account (mobile OTP only)", async () => {
    const r = await api("/api/staff/login", { method: "POST", body: { email: "+201000000001", password: "pass1234" } });
    assert.equal(r.status, 400); // not an email — same Invalid input as schema reject
  });

  it("rejects unknown email and wrong password identically", async () => {
    const unknown = await api("/api/staff/login", { method: "POST", body: { email: "nobody@staff.test", password: "pass1234" } });
    const wrong = await api("/api/staff/login", { method: "POST", body: { email: "admin@staff.test", password: "wrongpass" } });
    assert.equal(unknown.status, 401);
    assert.equal(wrong.status, 401);
    assert.equal(unknown.body.error, wrong.body.error);
    assert.equal(unknown.body.workspace, undefined);
  });

  it("rejects malformed input", async () => {
    const r = await api("/api/staff/login", { method: "POST", body: { email: "not-an-email" } });
    assert.equal(r.status, 400);
  });
});
