import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma, signToken, startApi, ApiCall } from "./helpers";
import { INDUSTRY_TAXONOMY, isValidIndustry, isValidSubIndustry } from "../src/lib/industries";

// Founder Web Review 2026-09-21 regression suite:
//  A) Campaign readiness: a campaign with no product linked must not show
//     "Ready to launch". Benchmark §5 names Product a core campaign
//     component; the Founder confirmed the missing-product ready state as
//     a defect. The product check must also gate submit-for-review (422).
//  B) Industry/Sub-industry: both are controlled selections from the
//     canonical taxonomy (src/lib/industries.ts). Ops company onboarding
//     and Company profile PATCH must reject values outside the taxonomy
//     and reject a sub-industry that does not belong to the industry.

let api: ApiCall;
let stopServer: () => Promise<void>;
let empToken: string;
let companyId: string;
let productId: string;
let opsManagerToken: string;
let opsToken: string;

before(async () => {
  ({ api, stop: stopServer } = await startApi());
  const company = await prisma.company.create({ data: { name: "Industry Co" } });
  companyId = company.id;
  const emp = await prisma.employee.create({
    data: { companyId: company.id, email: "e@industry.test", name: "E", passwordHash: "x", role: "COMPANY_ADMIN" },
  });
  empToken = signToken({ kind: "employee", employeeId: emp.id, companyId: company.id });
  const opsManager = await prisma.opsUser.create({
    data: { email: "om@ops.test", name: "OM", passwordHash: "x", role: "OPERATIONS_MANAGER" },
  });
  opsManagerToken = signToken({ kind: "ops", opsUserId: opsManager.id });
  const ops = await prisma.opsUser.create({
    data: { email: "o@ops.test", name: "O", passwordHash: "x", role: "OPERATIONS" },
  });
  opsToken = signToken({ kind: "ops", opsUserId: ops.id });
  productId = (await prisma.product.create({ data: { companyId: company.id, name: "P" } })).id;
});

after(async () => {
  await stopServer();
});

async function mkCampaign(withProduct = true) {
  const r = await api("/api/company/campaigns", {
    method: "POST", token: empToken,
    body: {
      name: "c", objective: "o",
      startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString(),
      ...(withProduct ? { productId } : {}),
      audienceAgeMin: 18, audienceAgeMax: 45, audienceGender: "ANY", audienceCity: "Cairo",
    },
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body.id as string;
}

async function mkSource(campaignId: string) {
  const r = await api(`/api/company/campaigns/${campaignId}/qr-sources`, {
    method: "POST", token: empToken,
    body: {
      code: "SRC" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      label: "Shelf",
      activeFrom: new Date().toISOString(),
      activeTo: new Date(Date.now() + 86400000).toISOString(),
    },
  });
  assert.equal(r.status, 201, JSON.stringify(r.body));
}

function productCheck(checks: { key: string; ok: boolean }[]) {
  return checks.find((c) => c.key === "product");
}

describe("readiness — product is required", () => {
  it("a campaign with a QR source but no product is NOT ready", async () => {
    const id = await mkCampaign(false);
    await mkSource(id);
    const r = await api(`/api/company/campaigns/${id}/readiness`, { token: empToken });
    assert.equal(r.status, 200);
    assert.equal(r.body.ready, false);
    assert.equal(productCheck(r.body.checks)?.ok, false);
  });

  it("submit-for-review is refused (422) while no product is linked", async () => {
    const id = await mkCampaign(false);
    await mkSource(id);
    const r = await api(`/api/company/campaigns/${id}/submit-for-review`, { method: "POST", token: empToken });
    assert.equal(r.status, 422, JSON.stringify(r.body));
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    assert.equal(campaign?.status, "DRAFT");
  });

  it("the same campaign becomes ready once a product is linked", async () => {
    const id = await mkCampaign(false);
    await mkSource(id);
    const patch = await api(`/api/company/campaigns/${id}`, {
      method: "PATCH", token: empToken, body: { productId },
    });
    assert.equal(patch.status, 200, JSON.stringify(patch.body));
    const r = await api(`/api/company/campaigns/${id}/readiness`, { token: empToken });
    assert.equal(r.body.ready, true, JSON.stringify(r.body));
    assert.equal(productCheck(r.body.checks)?.ok, true);
    const submit = await api(`/api/company/campaigns/${id}/submit-for-review`, { method: "POST", token: empToken });
    assert.equal(submit.status, 200, JSON.stringify(submit.body));
  });
});

describe("industry / sub-industry controlled taxonomy", () => {
  it("the canonical taxonomy is non-empty and internally consistent", () => {
    assert.ok(INDUSTRY_TAXONOMY.length >= 3);
    for (const g of INDUSTRY_TAXONOMY) {
      assert.ok(g.industry.length > 0);
      assert.ok(g.subIndustries.length > 0);
      for (const s of g.subIndustries) assert.ok(isValidSubIndustry(g.industry, s));
    }
    assert.equal(isValidIndustry("Not An Industry"), false);
  });

  it("ops company onboarding rejects an unknown industry", async () => {
    const r = await api("/api/ops/companies", {
      method: "POST", token: opsManagerToken,
      body: { name: "Bad Co", industry: "Test", employeeName: "E", employeeEmail: "bad1@x.test", employeePassword: "password123" },
    });
    assert.equal(r.status, 400, JSON.stringify(r.body));
  });

  it("ops company onboarding rejects a mismatched sub-industry", async () => {
    const r = await api("/api/ops/companies", {
      method: "POST", token: opsManagerToken,
      body: { name: "Mismatch Co", industry: "Pet Care", subIndustry: "Skincare", employeeName: "E", employeeEmail: "bad2@x.test", employeePassword: "password123" },
    });
    assert.equal(r.status, 400);
  });

  it("ops company onboarding rejects a sub-industry with no industry", async () => {
    const r = await api("/api/ops/companies", {
      method: "POST", token: opsManagerToken,
      body: { name: "Orphan Co", subIndustry: "Skincare", employeeName: "E", employeeEmail: "bad3@x.test", employeePassword: "password123" },
    });
    assert.equal(r.status, 400);
  });

  it("ops company onboarding accepts a valid pair and returns it", async () => {
    const r = await api("/api/ops/companies", {
      method: "POST", token: opsManagerToken,
      body: { name: "Good Co", industry: "Food & Beverage", subIndustry: "Beverages", employeeName: "E", employeeEmail: "good@x.test", employeePassword: "password123" },
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.industry, "Food & Beverage");
    assert.equal(r.body.subIndustry, "Beverages");
  });

  it("plain OPERATIONS cannot create companies (role unchanged)", async () => {
    const r = await api("/api/ops/companies", {
      method: "POST", token: opsToken,
      body: { name: "Nope Co", employeeName: "E", employeeEmail: "nope@x.test", employeePassword: "password123" },
    });
    assert.equal(r.status, 403);
  });

  // Founder direction 2026-09-23 (consolidated workspace pass): Industry
  // and Sub-industry are creation-time classification — PATCH /profile may
  // no longer change them. These tests replaced the earlier mutable-field
  // tests for the same endpoint.
  it("company profile PATCH rejects setting an industry after creation", async () => {
    const r = await api("/api/company/profile", {
      method: "PATCH", token: empToken, body: { industry: "Test" },
    });
    assert.equal(r.status, 400, JSON.stringify(r.body));
  });

  it("company profile PATCH rejects any industry/sub-industry change, preserves stored values", async () => {
    // "Good Co" was onboarded above with industry "Food & Beverage" /
    // sub-industry "Beverages". Its admin employee can still PATCH the
    // name — and resending unchanged classification values is a no-op —
    // but changing either classification field is rejected.
    const goodCo = await prisma.company.findFirst({ where: { name: "Good Co" } });
    assert.ok(goodCo);
    const goodEmp = await prisma.employee.findFirst({ where: { companyId: goodCo.id } });
    assert.ok(goodEmp);
    // Onboarded employees default to COMPANY_MEMBER; promote for this test
    // (PATCH /profile is requireCompanyAdmin).
    await prisma.employee.update({ where: { id: goodEmp.id }, data: { role: "COMPANY_ADMIN" } });
    const goodToken = signToken({ kind: "employee", employeeId: goodEmp.id, companyId: goodCo.id });

    const change = await api("/api/company/profile", {
      method: "PATCH", token: goodToken, body: { industry: "Beauty & Personal Care", subIndustry: "Skincare" },
    });
    assert.equal(change.status, 400);
    const subOnly = await api("/api/company/profile", {
      method: "PATCH", token: goodToken, body: { subIndustry: "Pet Food" },
    });
    assert.equal(subOnly.status, 400);

    const sameValues = await api("/api/company/profile", {
      method: "PATCH", token: goodToken,
      body: { name: "Good Co Renamed", industry: "Food & Beverage", subIndustry: "Beverages" },
    });
    assert.equal(sameValues.status, 200, JSON.stringify(sameValues.body));
    const row = await prisma.company.findUnique({ where: { id: goodCo.id } });
    assert.equal(row?.name, "Good Co Renamed");
    assert.equal(row?.industry, "Food & Beverage");
    assert.equal(row?.subIndustry, "Beverages");
  });

  it("company profile PATCH on a company with no classification still rejects setting one", async () => {
    const r = await api("/api/company/profile", {
      method: "PATCH", token: empToken, body: { industry: "Beauty & Personal Care", subIndustry: "Skincare" },
    });
    assert.equal(r.status, 400);
    const row = await prisma.company.findUnique({ where: { id: companyId } });
    assert.equal(row?.industry, null);
  });
});
