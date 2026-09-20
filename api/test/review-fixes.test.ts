import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma, signToken, startApi, ApiCall } from "./helpers";

// Review pass 2026-09-20 regression suite — defects confirmed during the
// Founder manual review environment pass:
//  A) PATCH /campaigns previously could not clear optional fields — the UI
//     sent `undefined` for emptied inputs and Prisma skipped the key, so
//     stale audience/product values persisted. Now explicit null clears.
//  B) A PENDING study-type request whose campaign has since locked (e.g.
//     went ACTIVE) must not be approvable — backend returns 409; the ops
//     UI now reflects that instead of offering a dead Approve button.

let api: ApiCall;
let stopServer: () => Promise<void>;
let empToken: string;
let opsToken: string;
let productId: string;

before(async () => {
  ({ api, stop: stopServer } = await startApi());
  const company = await prisma.company.create({ data: { name: "Review Co" } });
  const emp = await prisma.employee.create({
    data: { companyId: company.id, email: "e@review.test", name: "E", passwordHash: "x", role: "COMPANY_ADMIN" },
  });
  empToken = signToken({ kind: "employee", employeeId: emp.id, companyId: company.id });
  const ops = await prisma.opsUser.create({
    data: { email: "o@review.test", name: "O", passwordHash: "x", role: "OPERATIONS" },
  });
  opsToken = signToken({ kind: "ops", opsUserId: ops.id });
  productId = (
    await prisma.product.create({ data: { companyId: company.id, name: "P" } })
  ).id;
});

after(async () => {
  await stopServer();
});

async function mkCampaign() {
  const r = await api("/api/company/campaigns", {
    method: "POST", token: empToken,
    body: {
      name: "c", objective: "o",
      startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString(),
      productId, audienceAgeMin: 18, audienceAgeMax: 45, audienceGender: "ANY", audienceCity: "Cairo",
    },
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body.id as string;
}

describe("audience/product explicit clearing", () => {
  it("PATCH with explicit null clears audience + product fields", async () => {
    const id = await mkCampaign();
    const cleared = await api(`/api/company/campaigns/${id}`, {
      method: "PATCH", token: empToken,
      body: { productId: null, audienceAgeMin: null, audienceAgeMax: null, audienceCity: null },
    });
    assert.equal(cleared.status, 200, JSON.stringify(cleared.body));
    assert.equal(cleared.body.productId, null);
    assert.equal(cleared.body.audienceAgeMin, null);
    assert.equal(cleared.body.audienceAgeMax, null);
    assert.equal(cleared.body.audienceCity, null);
    // Reload proves it persisted, not just returned.
    const reloaded = await api(`/api/company/campaigns/${id}`, { token: empToken });
    assert.equal(reloaded.body.audienceAgeMin, null);
    assert.equal(reloaded.body.audienceCity, null);
  });

  it("PATCH omitting fields still preserves them (no regression)", async () => {
    const id = await mkCampaign();
    const r = await api(`/api/company/campaigns/${id}`, {
      method: "PATCH", token: empToken, body: { name: "renamed" },
    });
    assert.equal(r.status, 200);
    assert.equal(r.body.audienceAgeMin, 18);
    assert.equal(r.body.audienceCity, "Cairo");
    assert.equal(r.body.productId, productId);
  });

  it("cross-company product attach still rejected on PATCH", async () => {
    const other = await prisma.company.create({ data: { name: "Other" } });
    const foreign = await prisma.product.create({ data: { companyId: other.id, name: "F" } });
    const id = await mkCampaign();
    const r = await api(`/api/company/campaigns/${id}`, {
      method: "PATCH", token: empToken, body: { productId: foreign.id },
    });
    assert.equal(r.status, 404);
  });
});

describe("study-type request lifecycle governance", () => {
  it("duplicate pending request is refused (409)", async () => {
    const id = await mkCampaign();
    const first = await api(`/api/company/campaigns/${id}/study-type-requests`, {
      method: "POST", token: empToken, body: { requestedStudyType: "CONCEPT_TESTING" },
    });
    assert.equal(first.status, 201, JSON.stringify(first.body));
    const second = await api(`/api/company/campaigns/${id}/study-type-requests`, {
      method: "POST", token: empToken, body: { requestedStudyType: "PRICING_PERCEPTION" },
    });
    assert.equal(second.status, 409);
  });

  it("pending request on a now-ACTIVE campaign cannot be approved (409), can be rejected", async () => {
    const id = await mkCampaign();
    const req = await api(`/api/company/campaigns/${id}/study-type-requests`, {
      method: "POST", token: empToken, body: { requestedStudyType: "SEGMENTATION_STUDY" },
    });
    assert.equal(req.status, 201);
    // Campaign launches after the request was filed — request is now stale.
    await prisma.campaign.update({ where: { id }, data: { status: "ACTIVE" } });
    const approve = await api(`/api/ops/study-type-requests/${req.body.id}/approve`, {
      method: "POST", token: opsToken,
    });
    assert.equal(approve.status, 409);
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    assert.equal(campaign?.studyType, null); // untouched by the refused approve
    const reject = await api(`/api/ops/study-type-requests/${req.body.id}/reject`, {
      method: "POST", token: opsToken, body: { reason: "Campaign already live" },
    });
    assert.equal(reject.status, 200);
  });
});
