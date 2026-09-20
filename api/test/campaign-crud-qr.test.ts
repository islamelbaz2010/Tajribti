import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma, signToken, startApi, ApiCall } from "./helpers";

// Product-evolution pass 2026-09-20 regression suite — Founder-approved
// directions:
//  A) Every campaign source exposes a generated QR PNG of its consumer
//     entry URL (GET .../qr-sources/:sid/qr.png). The QR is an entry
//     mechanism only — tenant isolation still applies.
//  B) Campaign delete: COMPANY_ADMIN + DRAFT-only. READY/ACTIVE/PAUSED/
//     COMPLETED are refused; any participation evidence is refused; the
//     delete is audited.

let api: ApiCall;
let stopServer: () => Promise<void>;
let adminToken: string;
let memberToken: string;
let foreignAdminToken: string;
let companyId: string;
let foreignCompanyId: string;

before(async () => {
  ({ api, stop: stopServer } = await startApi());
  const company = await prisma.company.create({ data: { name: "Crud Co" } });
  companyId = company.id;
  const admin = await prisma.employee.create({
    data: { companyId, email: "a@crud.test", name: "A", passwordHash: "x", role: "COMPANY_ADMIN" },
  });
  const member = await prisma.employee.create({
    data: { companyId, email: "m@crud.test", name: "M", passwordHash: "x", role: "COMPANY_MEMBER" },
  });
  adminToken = signToken({ kind: "employee", employeeId: admin.id, companyId });
  memberToken = signToken({ kind: "employee", employeeId: member.id, companyId });
  const other = await prisma.company.create({ data: { name: "Foreign" } });
  foreignCompanyId = other.id;
  const foreign = await prisma.employee.create({
    data: { companyId: foreignCompanyId, email: "f@crud.test", name: "F", passwordHash: "x", role: "COMPANY_ADMIN" },
  });
  foreignAdminToken = signToken({ kind: "employee", employeeId: foreign.id, companyId: foreignCompanyId });
});

after(async () => {
  await stopServer();
});

async function mkCampaign(token: string = adminToken) {
  const r = await api("/api/company/campaigns", {
    method: "POST", token,
    body: {
      name: "c", objective: "o",
      startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString(),
    },
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body.id as string;
}

async function mkSource(campaignId: string) {
  const r = await api(`/api/company/campaigns/${campaignId}/qr-sources`, {
    method: "POST", token: adminToken,
    body: {
      code: "SRC" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      label: "Shelf",
      activeFrom: new Date().toISOString(),
      activeTo: new Date(Date.now() + 86400000).toISOString(),
    },
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body;
}

describe("QR image generation per source", () => {
  it("returns a PNG for an owned source", async () => {
    const id = await mkCampaign();
    const src = await mkSource(id);
    const r = await api(`/api/company/campaigns/${id}/qr-sources/${src.id}/qr.png`, {
      token: adminToken, raw: true,
    });
    assert.equal(r.status, 200);
    assert.match(r.headers?.["content-type"] ?? "", /image\/png/);
    assert.ok((r.raw?.length ?? 0) > 500); // a real QR PNG, not an empty placeholder
  });

  it("404s for a source of another company's campaign (no existence leak)", async () => {
    const id = await mkCampaign();
    const src = await mkSource(id);
    const r = await api(`/api/company/campaigns/${id}/qr-sources/${src.id}/qr.png`, {
      token: foreignAdminToken, raw: true,
    });
    assert.equal(r.status, 404);
  });

  it("404s for an unknown source id", async () => {
    const id = await mkCampaign();
    const r = await api(`/api/company/campaigns/${id}/qr-sources/does-not-exist/qr.png`, {
      token: adminToken, raw: true,
    });
    assert.equal(r.status, 404);
  });
});

describe("campaign delete lifecycle governance", () => {
  it("COMPANY_ADMIN can delete a DRAFT campaign; children go with it", async () => {
    const id = await mkCampaign();
    await mkSource(id);
    const r = await api(`/api/company/campaigns/${id}`, { method: "DELETE", token: adminToken });
    assert.equal(r.status, 204);
    assert.equal(await prisma.campaign.findUnique({ where: { id } }), null);
    assert.equal(await prisma.qrSource.count({ where: { campaignId: id } }), 0);
    const audit = await prisma.accessAuditEvent.findFirst({
      where: { action: "CAMPAIGN_DELETE", targetId: id },
    });
    assert.ok(audit, "delete must be audited");
  });

  it("COMPANY_MEMBER cannot delete (403)", async () => {
    const id = await mkCampaign();
    const r = await api(`/api/company/campaigns/${id}`, { method: "DELETE", token: memberToken });
    assert.equal(r.status, 403);
    assert.ok(await prisma.campaign.findUnique({ where: { id } }));
  });

  it("READY / ACTIVE / PAUSED / COMPLETED cannot be deleted (409)", async () => {
    for (const status of ["READY", "ACTIVE", "PAUSED", "COMPLETED"]) {
      const id = await mkCampaign();
      await prisma.campaign.update({ where: { id }, data: { status } });
      const r = await api(`/api/company/campaigns/${id}`, { method: "DELETE", token: adminToken });
      assert.equal(r.status, 409, `status ${status}`);
      assert.ok(await prisma.campaign.findUnique({ where: { id } }));
    }
  });

  it("refuses when participation evidence exists, even on DRAFT", async () => {
    const id = await mkCampaign();
    const src = await mkSource(id);
    const consumer = await prisma.consumer.create({ data: { phone: "+201009990001" } });
    await prisma.participation.create({
      data: { campaignId: id, consumerId: consumer.id, qrSourceId: src.id },
    });
    const r = await api(`/api/company/campaigns/${id}`, { method: "DELETE", token: adminToken });
    assert.equal(r.status, 409);
    assert.ok(await prisma.campaign.findUnique({ where: { id } }));
  });

  it("cross-company delete returns 404", async () => {
    const id = await mkCampaign();
    const r = await api(`/api/company/campaigns/${id}`, { method: "DELETE", token: foreignAdminToken });
    assert.equal(r.status, 404);
    assert.ok(await prisma.campaign.findUnique({ where: { id } }));
  });
});
