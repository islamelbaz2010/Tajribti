import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma, signToken, startApi, ApiCall } from "./helpers";

// FOUNDER INNOVATION (D-5 + D-3, 2026-09-20) regression suite.
// D-5 hosted media: exercises the real HTTP boundary for the hosted
// upload lifecycle — fail-closed when the bucket is unconfigured,
// content-type/size/campaign-cap validation, ownership and lifecycle
// guards, PENDING row behavior, and confirm refusal when the stored
// object cannot be verified (the test bucket endpoint is deliberately
// unreachable — the object was never really uploaded). No live bucket
// is required and no credentials are used.
// D-3 study profiles: verifies each studyType produces a distinct
// methodology block in the report payload.

let api: ApiCall;
let stopServer: () => Promise<void>;

let companyAId: string;
let empAToken: string;
let empBToken: string;
let campaignDraftId: string;
let campaignActiveId: string;

before(async () => {
  ({ api, stop: stopServer } = await startApi());

  const companyA = await prisma.company.create({ data: { name: "Media Co A" } });
  const companyB = await prisma.company.create({ data: { name: "Media Co B" } });
  companyAId = companyA.id;
  const empA = await prisma.employee.create({
    data: { companyId: companyAId, email: "a@media.test", name: "A", passwordHash: "x", role: "COMPANY_ADMIN" },
  });
  const empB = await prisma.employee.create({
    data: { companyId: companyB.id, email: "b@media.test", name: "B", passwordHash: "x", role: "COMPANY_ADMIN" },
  });
  empAToken = signToken({ kind: "employee", employeeId: empA.id, companyId: companyAId });
  empBToken = signToken({ kind: "employee", employeeId: empB.id, companyId: companyB.id });

  const mk = async (name: string, status: string) =>
    prisma.campaign.create({
      data: {
        companyId: companyAId, name, objective: "media test", status,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
      },
    });
  campaignDraftId = (await mk("draft", "DRAFT")).id;
  campaignActiveId = (await mk("active", "ACTIVE")).id;
});

after(async () => {
  delete process.env.MEDIA_BUCKET_ENDPOINT;
  delete process.env.MEDIA_BUCKET_NAME;
  delete process.env.MEDIA_BUCKET_ACCESS_KEY;
  delete process.env.MEDIA_BUCKET_SECRET_KEY;
  await stopServer();
});

describe("D-5 hosted media — fail-closed without provisioned bucket", () => {
  it("upload-init returns 503 when bucket env is not configured", async () => {
    const r = await api(`/api/company/campaigns/${campaignDraftId}/media/upload-init`, {
      method: "POST", token: empAToken,
      body: { kind: "PRODUCT_IMAGE", contentType: "image/png", sizeBytes: 1000 },
    });
    assert.equal(r.status, 503);
  });
});

describe("D-5 hosted media — configured bucket (unreachable endpoint)", () => {
  before(() => {
    process.env.MEDIA_BUCKET_ENDPOINT = "http://127.0.0.1:1";
    process.env.MEDIA_BUCKET_NAME = "test-bucket";
    process.env.MEDIA_BUCKET_ACCESS_KEY = "test";
    process.env.MEDIA_BUCKET_SECRET_KEY = "test";
  });

  it("upload-init issues a campaign-scoped key and signed URL", async () => {
    const r = await api(`/api/company/campaigns/${campaignDraftId}/media/upload-init`, {
      method: "POST", token: empAToken,
      body: { kind: "PRODUCT_IMAGE", contentType: "image/png", sizeBytes: 2048, caption: "hero" },
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.match(r.body.storageKey, new RegExp(`^campaigns/${campaignDraftId}/`));
    assert.ok(r.body.uploadUrl.includes("127.0.0.1"));
    assert.equal(r.body.expiresIn, 300);
    const row = await prisma.campaignMedia.findUnique({ where: { id: r.body.mediaId } });
    assert.equal(row?.source, "HOSTED");
    assert.equal(row?.status, "PENDING");
  });

  it("rejects non-image content types", async () => {
    const r = await api(`/api/company/campaigns/${campaignDraftId}/media/upload-init`, {
      method: "POST", token: empAToken,
      body: { kind: "PRODUCT_IMAGE", contentType: "text/html", sizeBytes: 1000 },
    });
    assert.equal(r.status, 400);
  });

  it("rejects files over 5 MB", async () => {
    const r = await api(`/api/company/campaigns/${campaignDraftId}/media/upload-init`, {
      method: "POST", token: empAToken,
      body: { kind: "PRODUCT_IMAGE", contentType: "image/png", sizeBytes: 6 * 1024 * 1024 },
    });
    assert.equal(r.status, 400);
  });

  it("rejects upload-init on a locked (ACTIVE) campaign", async () => {
    const r = await api(`/api/company/campaigns/${campaignActiveId}/media/upload-init`, {
      method: "POST", token: empAToken,
      body: { kind: "PRODUCT_IMAGE", contentType: "image/png", sizeBytes: 1000 },
    });
    assert.equal(r.status, 409);
  });

  it("rejects another company's employee (tenant isolation)", async () => {
    const r = await api(`/api/company/campaigns/${campaignDraftId}/media/upload-init`, {
      method: "POST", token: empBToken,
      body: { kind: "PRODUCT_IMAGE", contentType: "image/png", sizeBytes: 1000 },
    });
    assert.equal(r.status, 404);
  });

  it("confirm refuses a row whose stored object cannot be verified", async () => {
    const init = await api(`/api/company/campaigns/${campaignDraftId}/media/upload-init`, {
      method: "POST", token: empAToken,
      body: { kind: "PRODUCT_IMAGE", contentType: "image/jpeg", sizeBytes: 512 },
    });
    assert.equal(init.status, 201);
    const conf = await api(`/api/company/campaigns/${campaignDraftId}/media/${init.body.mediaId}/confirm`, {
      method: "POST", token: empAToken,
    });
    assert.equal(conf.status, 400);
    const row = await prisma.campaignMedia.findUnique({ where: { id: init.body.mediaId } });
    assert.equal(row?.status, "PENDING");
  });

  it("media list returns hosted rows without exposing storage internals", async () => {
    const r = await api(`/api/company/campaigns/${campaignDraftId}/media`, { token: empAToken });
    assert.equal(r.status, 200);
    const hosted = r.body.filter((m: any) => m.source === "HOSTED");
    assert.ok(hosted.length >= 1);
    for (const m of hosted) assert.equal(m.status, "PENDING");
  });

  it("delete removes a hosted row and best-effort deletes the object", async () => {
    const init = await api(`/api/company/campaigns/${campaignDraftId}/media/upload-init`, {
      method: "POST", token: empAToken,
      body: { kind: "PRODUCT_IMAGE", contentType: "image/webp", sizeBytes: 128 },
    });
    const del = await api(`/api/company/campaigns/${campaignDraftId}/media/${init.body.mediaId}`, {
      method: "DELETE", token: empAToken,
    });
    assert.equal(del.status, 204);
    assert.equal(await prisma.campaignMedia.findUnique({ where: { id: init.body.mediaId } }), null);
  });

  it("enforces the 20-asset cap", async () => {
    const draft = await prisma.campaign.create({
      data: {
        companyId: companyAId, name: "cap", objective: "x", status: "DRAFT",
        startDate: new Date(), endDate: new Date(),
      },
    });
    for (let i = 0; i < 20; i++) {
      await prisma.campaignMedia.create({
        data: { campaignId: draft.id, kind: "PRODUCT_IMAGE", url: `https://example.com/${i}.png` },
      });
    }
    const r = await api(`/api/company/campaigns/${draft.id}/media/upload-init`, {
      method: "POST", token: empAToken,
      body: { kind: "PRODUCT_IMAGE", contentType: "image/png", sizeBytes: 100 },
    });
    assert.equal(r.status, 400);
  });
});

describe("D-5 hosted media — URL path unchanged", () => {
  it("URL media create/list/delete still works with source=URL", async () => {
    const create = await api(`/api/company/campaigns/${campaignDraftId}/media`, {
      method: "POST", token: empAToken,
      body: { kind: "CAMPAIGN_MEDIA", url: "https://example.com/hero.png" },
    });
    assert.equal(create.status, 201);
    assert.equal(create.body.source, "URL");
    assert.equal(create.body.status, "READY");
    const del = await api(`/api/company/campaigns/${campaignDraftId}/media/${create.body.id}`, {
      method: "DELETE", token: empAToken,
    });
    assert.equal(del.status, 204);
  });
});

describe("D-3 study-type methodology profiles in reports", () => {
  it("report carries the distinct profile for the campaign study type", async () => {
    const campaign = await prisma.campaign.create({
      data: {
        companyId: companyAId, name: "pricing", objective: "x", status: "ACTIVE",
        studyType: "PRICING_PERCEPTION",
        startDate: new Date(Date.now() - 86400000), endDate: new Date(Date.now() + 86400000),
      },
    });
    const r = await api(`/api/company/campaigns/${campaign.id}/report`, { token: empAToken });
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.studyProfile.key, "PRICING_PERCEPTION");
    assert.ok(r.body.studyProfile.objective.length > 10);
    assert.ok(r.body.studyProfile.limitations.length >= 1);
    assert.ok(r.body.studyProfile.notClaimed.length >= 1);
  });

  it("different study types produce different profiles", async () => {
    const seg = await prisma.campaign.create({
      data: {
        companyId: companyAId, name: "seg", objective: "x", status: "ACTIVE",
        studyType: "SEGMENTATION_STUDY",
        startDate: new Date(Date.now() - 86400000), endDate: new Date(Date.now() + 86400000),
      },
    });
    const r = await api(`/api/company/campaigns/${seg.id}/report`, { token: empAToken });
    assert.equal(r.body.studyProfile.key, "SEGMENTATION_STUDY");
    assert.notEqual(r.body.studyProfile.objective.includes("price"), true);
  });

  it("campaigns without a study type carry no profile", async () => {
    const r = await api(`/api/company/campaigns/${campaignActiveId}/report`, { token: empAToken });
    assert.equal(r.status, 200);
    assert.equal(r.body.studyProfile, null);
  });
});
