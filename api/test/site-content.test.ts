import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { prisma, startApi, ApiCall, signToken } from "./helpers";

// Public Website content management (Founder direction 2026-09-24):
//  A) Authorization: PLATFORM_ADMIN only — company admins/members,
//     consumers, plain OPERATIONS and OPERATIONS_MANAGER are all denied.
//  B) Lifecycle: draft save does not touch the public endpoint; publish
//     exposes exactly the validated payload; republish overwrites.
//  C) Validation: unknown section keys and schema-invalid payloads are
//     rejected before they can be stored.
//  D) Media: upload/list/serve bytes publicly only when active; admin
//     raw endpoint serves inactive rows for preview.
//  E) Fallback: no published rows → the public endpoint returns an empty
//     sections map and the static homepage markup applies.

let api: ApiCall;
let stopServer: () => Promise<void>;
let padminToken: string;
let opsToken: string;
let opsMgrToken: string;
let empToken: string;

const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

before(async () => {
  ({ api, stop: stopServer } = await startApi());
  const hash = await bcrypt.hash("pass1234", 10);
  const padmin = await prisma.opsUser.create({ data: { email: "pa@site.test", name: "PA", passwordHash: hash, role: "PLATFORM_ADMIN" } });
  const ops = await prisma.opsUser.create({ data: { email: "ops@site.test", name: "O", passwordHash: hash, role: "OPERATIONS" } });
  const mgr = await prisma.opsUser.create({ data: { email: "mgr@site.test", name: "M", passwordHash: hash, role: "OPERATIONS_MANAGER" } });
  const company = await prisma.company.create({ data: { name: "Site Co" } });
  const emp = await prisma.employee.create({ data: { companyId: company.id, email: "e@site.test", name: "E", passwordHash: hash, role: "COMPANY_ADMIN" } });
  padminToken = signToken({ kind: "ops", opsUserId: padmin.id });
  opsToken = signToken({ kind: "ops", opsUserId: ops.id });
  opsMgrToken = signToken({ kind: "ops", opsUserId: mgr.id });
  empToken = signToken({ kind: "employee", employeeId: emp.id, companyId: company.id });
});

after(async () => { await stopServer(); });

describe("public site content management", () => {
  it("denies every non-PLATFORM_ADMIN role on admin routes", async () => {
    for (const [label, token] of [["ops", opsToken], ["ops-manager", opsMgrToken], ["company-admin", empToken]] as const) {
      const r = await api("/api/ops/site/sections", { token });
      assert.equal(r.status, 403, label);
      const w = await api("/api/ops/site/sections/hero/draft", { method: "PUT", token, body: { content: {} } });
      assert.equal(w.status, 403, label);
    }
    const anon = await api("/api/ops/site/sections");
    assert.equal(anon.status, 401);
  });

  it("public endpoint serves nothing before any publish (static fallback applies)", async () => {
    const r = await api("/api/public/site");
    assert.equal(r.status, 200);
    assert.deepEqual(r.body.sections, {});
  });

  it("lists all sections with defaults for the admin editor", async () => {
    const r = await api("/api/ops/site/sections", { token: padminToken });
    assert.equal(r.status, 200);
    const keys = r.body.map((s: any) => s.key);
    assert.deepEqual(keys, ["hero", "howItWorks", "sectors", "studyTypes", "sampleReport", "cta"]);
    assert.ok(r.body[0].defaults.headline);
  });

  it("saves a draft without exposing it publicly, then publishes", async () => {
    const content = {
      eyebrow: "Draft eyebrow",
      headline: "Draft headline for review",
      sub: "Draft supporting copy.",
      primaryCtaLabel: "Draft CTA",
      primaryCtaHref: "#contact",
      secondaryCtaLabel: "Draft secondary",
      secondaryCtaHref: "#report",
    };
    const d = await api("/api/ops/site/sections/hero/draft", { method: "PUT", token: padminToken, body: { content } });
    assert.equal(d.status, 200);
    assert.equal(d.body.draft.headline, "Draft headline for review");

    // Draft is not public.
    const pubBefore = await api("/api/public/site");
    assert.equal(pubBefore.status, 200);
    assert.equal(pubBefore.body.sections.hero, undefined);

    const p = await api("/api/ops/site/sections/hero/publish", { method: "POST", token: padminToken });
    assert.equal(p.status, 200);
    assert.equal(p.body.published.headline, "Draft headline for review");
    assert.ok(p.body.publishedBy);

    const pubAfter = await api("/api/public/site");
    assert.equal(pubAfter.body.sections.hero.headline, "Draft headline for review");

    // Audit trail exists for both writes.
    const events = await prisma.accessAuditEvent.findMany({ where: { targetType: "site-section", targetId: "hero" } });
    assert.deepEqual(events.map((e) => e.action).sort(), ["SITE_CONTENT_DRAFT", "SITE_CONTENT_PUBLISH"]);
  });

  it("rejects unknown sections and invalid payloads", async () => {
    const bad1 = await api("/api/ops/site/sections/nope/draft", { method: "PUT", token: padminToken, body: { content: {} } });
    assert.equal(bad1.status, 404);
    const bad2 = await api("/api/ops/site/sections/hero/draft", { method: "PUT", token: padminToken, body: { content: { headline: "x" } } });
    assert.equal(bad2.status, 400);
    // A draft with an off-site javascript: href must be rejected.
    const bad3 = await api("/api/ops/site/sections/cta/draft", { method: "PUT", token: padminToken, body: { content: { headline: "h", supportingText: "s", ctaLabel: "l", ctaHref: "javascript:alert(1)" } } });
    assert.equal(bad3.status, 400);
    // Study-type keys are a closed set — inventing a methodology fails.
    const bad4 = await api("/api/ops/site/sections/studyTypes/draft", { method: "PUT", token: padminToken, body: { content: { items: [{ key: "invented-method", title: "t", purpose: "p", statusLabel: "s", order: 0, active: true }] } } });
    assert.equal(bad4.status, 400);
    // Publishing with no draft fails cleanly.
    const bad5 = await api("/api/ops/site/sections/cta/publish", { method: "POST", token: padminToken });
    assert.equal(bad5.status, 400);
  });

  it("uploads media, serves it publicly only while active", async () => {
    const up = await api("/api/ops/site/media", {
      method: "POST",
      token: padminToken,
      body: { name: "pixel.png", mime: "image/png", dataBase64: PNG_1PX.toString("base64"), alt: "pixel", attribution: "test" },
    });
    assert.equal(up.status, 201);
    const id = up.body.id;

    const pub = await api(`/api/public/site/media/${id}`, { raw: true });
    assert.equal(pub.status, 200);
    assert.equal(pub.headers?.["content-type"], "image/png");
    assert.deepEqual(pub.raw, PNG_1PX);

    const off = await api(`/api/ops/site/media/${id}`, { method: "PATCH", token: padminToken, body: { active: false } });
    assert.equal(off.status, 200);
    const gone = await api(`/api/public/site/media/${id}`);
    assert.equal(gone.status, 404);
    // Admin preview still serves the inactive asset.
    const raw = await api(`/api/ops/site/media/${id}/raw`, { token: padminToken, raw: true });
    assert.equal(raw.status, 200);
    assert.deepEqual(raw.raw, PNG_1PX);

    // Bad mime rejected.
    const bad = await api("/api/ops/site/media", { method: "POST", token: padminToken, body: { name: "x", mime: "text/html", dataBase64: "AAAA" } });
    assert.equal(bad.status, 400);
  });
});
