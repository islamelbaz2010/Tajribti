import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma, signToken, startApi, grantCampaignVerification, ApiCall } from "./helpers";
import { verifyToken } from "../src/lib/auth";
import { _setAkedlyFetch } from "../src/lib/akedly";

// Focused evidence-integrity regression suite (Benchmark §10 campaign
// ownership isolation / company isolation). Exercises the real HTTP
// boundary of the Consumer and Company routers against a freshly
// migrated SQLite database — no mocks, no production data.
//
// Fixture graph:
//   Company A ── employeeA, productPA, productPA2
//     ├─ campaignCA1 (ACTIVE, productPA) ─ qrSA1
//     │    ├─ qElig1  ELIGIBILITY SINGLE_CHOICE (required)
//     │    ├─ qPI     POST_TRIAL PURCHASE_INTENT_1_5
//     │    ├─ qRate   POST_TRIAL RATING_1_5
//     │    ├─ qChoice POST_TRIAL SINGLE_CHOICE
//     │    └─ qText   POST_TRIAL TEXT
//     ├─ campaignCA2 (ACTIVE) ─ qrSA2
//     │    ├─ qEligOther ELIGIBILITY TEXT
//     │    └─ qPIother   POST_TRIAL PURCHASE_INTENT_1_5
//     ├─ campaignCM (ACTIVE, measurement baseline) ─ qrSM
//     │    ├─ qPIM  POST_TRIAL PURCHASE_INTENT_1_5
//     │    ├─ qRateM POST_TRIAL RATING_1_5
//     │    └─ qTextM POST_TRIAL TEXT
//     └─ campaignCG (ACTIVE, audience-gated: age 18–30, FEMALE, Cairo)
//   Company B ── employeeB, productPB
//     └─ campaignCB (ACTIVE, productPB) ─ qrSB1
//          └─ qPIB POST_TRIAL PURCHASE_INTENT_1_5
//
// One complete valid journey is seeded on CM in before() so the
// measurement/report tests have an exact, uncontaminated baseline.

let api: ApiCall;
let stopServer: () => Promise<void>;

let companyAId: string;
let companyBId: string;
let employeeAToken: string;
let employeeBToken: string;
let productPAId: string;
let productPBId: string;
let campaignCA1Id: string;
let campaignCA2Id: string;
let campaignDraftId: string;
let campaignCBId: string;
let campaignCMId: string;
let campaignCGId: string;
let qrSA1Id: string;
let qrSA2Id: string;
let qrSB1Id: string;
let qrSMId: string;
let qElig1Id: string;
let qPIId: string;
let qRateId: string;
let qChoiceId: string;
let qTextId: string;
let qEligOtherId: string;
let qPIotherId: string;
let qPIBId: string;

let phoneSeq = 0;
async function mkConsumer() {
  const consumer = await prisma.consumer.create({ data: { phone: `+2010000${String(10000 + phoneSeq++)}` } });
  return { id: consumer.id, token: signToken({ kind: "consumer", consumerId: consumer.id }) };
}

// FD-07a (2026-09-21): eligibility requires a campaign-bound OTP
// verification. Fixture-granted here; the real request→verify→consume path
// is covered end-to-end by campaign-otp.test.ts.
async function grantOtp(token: string, campaignId: string) {
  const claims = verifyToken(token);
  assert.ok(claims?.kind === "consumer");
  await grantCampaignVerification(claims.consumerId, campaignId);
}

async function eligibleOn(campaignId: string, token: string, body: Record<string, unknown> = {}) {
  await grantOtp(token, campaignId);
  const res = await api(`/api/consumer/campaigns/${campaignId}/eligibility`, { method: "POST", token, body });
  assert.equal(res.status, 200, `eligibility failed: ${JSON.stringify(res.body)}`);
  return res.body.participation;
}

async function redeemedOn(campaignId: string, token: string, eligBody: Record<string, unknown> = {}) {
  const participation = await eligibleOn(campaignId, token, eligBody);
  const res = await api(`/api/consumer/campaigns/${campaignId}/redeem`, { method: "POST", token });
  assert.equal(res.status, 200, `redeem failed: ${JSON.stringify(res.body)}`);
  return participation;
}

const campaignBody = (overrides: Record<string, unknown> = {}) => ({
  name: "Test Campaign",
  objective: "Validate evidence integrity",
  startDate: new Date(Date.now() - 86400000).toISOString(),
  endDate: new Date(Date.now() + 86400000).toISOString(),
  ...overrides,
});

const eligAnswer = () => ({ answers: [{ questionId: qElig1Id, valueOptions: ["yes"] }] });

before(async () => {
  ({ api, stop: stopServer } = await startApi());

  const companyA = await prisma.company.create({ data: { name: "Company A" } });
  const companyB = await prisma.company.create({ data: { name: "Company B" } });
  companyAId = companyA.id;
  companyBId = companyB.id;

  // FD-WEB-01: COMPANY_MEMBER is reporting/read-only — the employees that
  // drive mutation routes in this suite must be COMPANY_ADMIN.
  const employeeA = await prisma.employee.create({
    data: { companyId: companyAId, email: "a@example.test", name: "Emp A", passwordHash: "x", role: "COMPANY_ADMIN" },
  });
  const employeeB = await prisma.employee.create({
    data: { companyId: companyBId, email: "b@example.test", name: "Emp B", passwordHash: "x", role: "COMPANY_ADMIN" },
  });
  employeeAToken = signToken({ kind: "employee", employeeId: employeeA.id, companyId: companyAId });
  employeeBToken = signToken({ kind: "employee", employeeId: employeeB.id, companyId: companyBId });

  const productPA = await prisma.product.create({ data: { companyId: companyAId, name: "Product A" } });
  const productPB = await prisma.product.create({ data: { companyId: companyBId, name: "Product B" } });
  productPAId = productPA.id;
  productPBId = productPB.id;

  const mkCampaign = (companyId: string, name: string, productId?: string) =>
    prisma.campaign.create({
      data: {
        companyId,
        productId,
        name,
        objective: "Test objective",
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        status: "ACTIVE",
      },
    });

  const campaignCA1 = await mkCampaign(companyAId, "CA1", productPAId);
  const campaignCA2 = await mkCampaign(companyAId, "CA2");
  const campaignCB = await mkCampaign(companyBId, "CB", productPBId);
  const campaignCM = await mkCampaign(companyAId, "CM");
  const campaignDraft = await prisma.campaign.create({
    data: {
      companyId: companyAId,
      productId: productPAId,
      name: "Draft A",
      objective: "Test objective",
      startDate: new Date(Date.now() - 86400000),
      endDate: new Date(Date.now() + 86400000),
      status: "DRAFT",
    },
  });
  campaignCA1Id = campaignCA1.id;
  campaignCA2Id = campaignCA2.id;
  campaignCBId = campaignCB.id;
  campaignCMId = campaignCM.id;
  campaignDraftId = campaignDraft.id;

  // Audience-gated campaign: proves configured demographic gates are
  // actually evaluated against the demographics the client submits —
  // the contract the mobile eligibility step now fulfils.
  const campaignCG = await prisma.campaign.create({
    data: {
      companyId: companyAId,
      name: "CG",
      objective: "Test objective",
      startDate: new Date(Date.now() - 86400000),
      endDate: new Date(Date.now() + 86400000),
      status: "ACTIVE",
      audienceAgeMin: 18,
      audienceAgeMax: 30,
      audienceGender: "FEMALE",
      audienceCity: "Cairo",
    },
  });
  campaignCGId = campaignCG.id;

  const mkQr = (campaignId: string, code: string) =>
    prisma.qrSource.create({
      data: {
        campaignId,
        code,
        label: code,
        activeFrom: new Date(Date.now() - 86400000),
        activeTo: new Date(Date.now() + 86400000),
      },
    });
  qrSA1Id = (await mkQr(campaignCA1Id, "SRC-A1")).id;
  qrSA2Id = (await mkQr(campaignCA2Id, "SRC-A2")).id;
  qrSB1Id = (await mkQr(campaignCBId, "SRC-B1")).id;
  qrSMId = (await mkQr(campaignCMId, "SRC-M")).id;

  const mkQuestion = (campaignId: string, stage: string, type: string, text: string, extra: Record<string, unknown> = {}) =>
    prisma.question.create({ data: { campaignId, stage, type, text, order: 0, ...extra } });

  qElig1Id = (
    await mkQuestion(campaignCA1Id, "ELIGIBILITY", "SINGLE_CHOICE", "Screener?", {
      options: JSON.stringify([{ id: "yes", label: "Yes" }, { id: "no", label: "No" }]),
    })
  ).id;
  qPIId = (await mkQuestion(campaignCA1Id, "POST_TRIAL", "PURCHASE_INTENT_1_5", "PI?")).id;
  qRateId = (await mkQuestion(campaignCA1Id, "POST_TRIAL", "RATING_1_5", "Rate?")).id;
  qChoiceId = (
    await mkQuestion(campaignCA1Id, "POST_TRIAL", "SINGLE_CHOICE", "Pick?", {
      options: JSON.stringify([{ id: "a", label: "A" }, { id: "b", label: "B" }]),
    })
  ).id;
  qTextId = (await mkQuestion(campaignCA1Id, "POST_TRIAL", "TEXT", "Tell us", { required: false })).id;

  qEligOtherId = (await mkQuestion(campaignCA2Id, "ELIGIBILITY", "TEXT", "Other screener", { required: false })).id;
  qPIotherId = (await mkQuestion(campaignCA2Id, "POST_TRIAL", "PURCHASE_INTENT_1_5", "Other PI")).id;
  qPIBId = (await mkQuestion(campaignCBId, "POST_TRIAL", "PURCHASE_INTENT_1_5", "B PI")).id;

  const qPIM = await mkQuestion(campaignCMId, "POST_TRIAL", "PURCHASE_INTENT_1_5", "M PI");
  const qRateM = await mkQuestion(campaignCMId, "POST_TRIAL", "RATING_1_5", "M rate");
  const qTextM = await mkQuestion(campaignCMId, "POST_TRIAL", "TEXT", "M text", { required: false });
  void qPIBId;

  // Baseline completed journey on CM (PI=5, rating=4, one verbatim).
  const baseline = await mkConsumer();
  const participation = await redeemedOn(campaignCMId, baseline.token, { qrSourceId: qrSMId });
  void participation;
  const submit = await api(`/api/consumer/campaigns/${campaignCMId}/survey`, {
    method: "POST",
    token: baseline.token,
    body: {
      answers: [
        { questionId: qPIM.id, valueNumber: 5 },
        { questionId: qRateM.id, valueNumber: 4 },
        { questionId: qTextM.id, valueText: "baseline verbatim" },
      ],
    },
  });
  assert.equal(submit.status, 200, `baseline survey failed: ${JSON.stringify(submit.body)}`);
});

after(async () => {
  await stopServer();
  await prisma.$disconnect();
});

// ---------------------------------------------------------------------------
// DEFECT A — Product → Company ownership (P1/P2/P3)
// ---------------------------------------------------------------------------
describe("product → company ownership", () => {
  it("P1: same-company product assignment succeeds on create and update", async () => {
    const created = await api("/api/company/campaigns", {
      method: "POST",
      token: employeeAToken,
      body: campaignBody({ productId: productPAId }),
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.productId, productPAId);

    const other = await prisma.product.create({ data: { companyId: companyAId, name: "Product A2" } });
    const patched = await api(`/api/company/campaigns/${created.body.id}`, {
      method: "PATCH",
      token: employeeAToken,
      body: { productId: other.id },
    });
    assert.equal(patched.status, 200, JSON.stringify(patched.body));
    assert.equal(patched.body.productId, other.id);
  });

  it("P2/P3: cross-company product assignment is rejected and mutates nothing", async () => {
    const created = await api("/api/company/campaigns", {
      method: "POST",
      token: employeeAToken,
      body: campaignBody({ productId: productPBId }),
    });
    assert.equal(created.status, 404);

    const patched = await api(`/api/company/campaigns/${campaignDraftId}`, {
      method: "PATCH",
      token: employeeAToken,
      body: { productId: productPBId },
    });
    assert.equal(patched.status, 404);
    const unchanged = await prisma.campaign.findUnique({ where: { id: campaignDraftId } });
    assert.equal(unchanged?.productId, productPAId);
  });

  it("P3b: unknown product id is rejected identically (no existence leak)", async () => {
    const patched = await api(`/api/company/campaigns/${campaignDraftId}`, {
      method: "PATCH",
      token: employeeAToken,
      body: { productId: "no-such-product" },
    });
    assert.equal(patched.status, 404);
    const unchanged = await prisma.campaign.findUnique({ where: { id: campaignDraftId } });
    assert.equal(unchanged?.productId, productPAId);
  });
});

// ---------------------------------------------------------------------------
// DEFECT B — QR/source → campaign binding (Q1–Q4)
// ---------------------------------------------------------------------------
describe("QR source → campaign binding", () => {
  it("Q1: same-campaign QR source participates normally", async () => {
    const consumer = await mkConsumer();
    await grantOtp(consumer.token, campaignCA1Id);
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/eligibility`, {
      method: "POST",
      token: consumer.token,
      body: { qrSourceId: qrSA1Id, ...eligAnswer() },
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.eligible, true);
    assert.equal(res.body.participation.qrSourceId, qrSA1Id);
  });

  it("Q2/Q4: QR source of another campaign is rejected with no participation", async () => {
    const consumer = await mkConsumer();
    await grantOtp(consumer.token, campaignCA1Id);
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/eligibility`, {
      method: "POST",
      token: consumer.token,
      body: { qrSourceId: qrSA2Id, ...eligAnswer() },
    });
    assert.equal(res.status, 400);
    const count = await prisma.participation.count({ where: { campaignId: campaignCA1Id, consumerId: consumer.id } });
    assert.equal(count, 0);
  });

  it("Q3: QR source of another company's campaign is rejected", async () => {
    const consumer = await mkConsumer();
    await grantOtp(consumer.token, campaignCA1Id);
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/eligibility`, {
      method: "POST",
      token: consumer.token,
      body: { qrSourceId: qrSB1Id, ...eligAnswer() },
    });
    assert.equal(res.status, 400);
    const count = await prisma.participation.count({ where: { campaignId: campaignCA1Id, consumerId: consumer.id } });
    assert.equal(count, 0);
  });

  it("Q4b: unknown QR source id is rejected identically", async () => {
    const consumer = await mkConsumer();
    await grantOtp(consumer.token, campaignCA1Id);
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/eligibility`, {
      method: "POST",
      token: consumer.token,
      body: { qrSourceId: "no-such-source", ...eligAnswer() },
    });
    assert.equal(res.status, 400);
    const count = await prisma.participation.count({ where: { campaignId: campaignCA1Id, consumerId: consumer.id } });
    assert.equal(count, 0);
  });
});

// ---------------------------------------------------------------------------
// DEFECT C/D — Answer → question → campaign binding (eligibility + survey)
// ---------------------------------------------------------------------------
describe("answer → question → campaign binding (eligibility)", () => {
  it("rejects a screener answer targeting another campaign's question", async () => {
    const consumer = await mkConsumer();
    await grantOtp(consumer.token, campaignCA1Id);
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/eligibility`, {
      method: "POST",
      token: consumer.token,
      body: { answers: [{ questionId: qEligOtherId, valueText: "x" }, ...eligAnswer().answers] },
    });
    assert.equal(res.status, 400);
    assert.equal(await prisma.participation.count({ where: { campaignId: campaignCA1Id, consumerId: consumer.id } }), 0);
    assert.equal(await prisma.answer.count({ where: { questionId: qEligOtherId } }), 0);
  });

  it("rejects a screener answer targeting a POST_TRIAL question of the same campaign", async () => {
    const consumer = await mkConsumer();
    await grantOtp(consumer.token, campaignCA1Id);
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/eligibility`, {
      method: "POST",
      token: consumer.token,
      body: { answers: [{ questionId: qPIId, valueText: "5" }, ...eligAnswer().answers] },
    });
    assert.equal(res.status, 400);
    assert.equal(await prisma.participation.count({ where: { campaignId: campaignCA1Id, consumerId: consumer.id } }), 0);
  });

  it("rejects a screener answer carrying no value", async () => {
    const consumer = await mkConsumer();
    await grantOtp(consumer.token, campaignCA1Id);
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/eligibility`, {
      method: "POST",
      token: consumer.token,
      body: { answers: [{ questionId: qElig1Id }] },
    });
    assert.equal(res.status, 400);
    assert.equal(await prisma.participation.count({ where: { campaignId: campaignCA1Id, consumerId: consumer.id } }), 0);
  });
});

// ---------------------------------------------------------------------------
// Eligibility decisions — the contract the mobile collection step fulfils
// (E6/E7/E8/E12). The server is the authority: it must produce a real
// INELIGIBLE outcome for unanswered required screeners and for failed
// audience gates, never let redemption proceed from INELIGIBLE, and keep
// the existing duplicate-participation protection.
// ---------------------------------------------------------------------------
describe("audience gates & eligibility decisions", () => {
  it("E7+E6: an unanswered required screener produces INELIGIBLE, and INELIGIBLE cannot redeem", async () => {
    const consumer = await mkConsumer();
    await grantOtp(consumer.token, campaignCA1Id);
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/eligibility`, {
      method: "POST",
      token: consumer.token,
      body: { answers: [] },
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.eligible, false);
    assert.equal(res.body.participation.status, "INELIGIBLE");
    const redeem = await api(`/api/consumer/campaigns/${campaignCA1Id}/redeem`, {
      method: "POST",
      token: consumer.token,
    });
    assert.equal(redeem.status, 403);
  });

  it("E8: configured audience gates are evaluated against submitted demographics", async () => {
    const mk = () => mkConsumer();

    const inside = await mk();
    await grantOtp(inside.token, campaignCGId);
    const ok = await api(`/api/consumer/campaigns/${campaignCGId}/eligibility`, {
      method: "POST",
      token: inside.token,
      body: { age: 25, gender: "FEMALE", city: "Cairo" },
    });
    assert.equal(ok.status, 200, JSON.stringify(ok.body));
    assert.equal(ok.body.eligible, true);
    assert.equal(ok.body.participation.ageAtEntry, 25);
    assert.equal(ok.body.participation.genderAtEntry, "FEMALE");
    assert.equal(ok.body.participation.cityAtEntry, "Cairo");

    const tooOld = await mk();
    await grantOtp(tooOld.token, campaignCGId);
    const ageFail = await api(`/api/consumer/campaigns/${campaignCGId}/eligibility`, {
      method: "POST",
      token: tooOld.token,
      body: { age: 40, gender: "FEMALE", city: "Cairo" },
    });
    assert.equal(ageFail.body.eligible, false);
    assert.equal(ageFail.body.participation.status, "INELIGIBLE");

    const wrongGender = await mk();
    await grantOtp(wrongGender.token, campaignCGId);
    const genderFail = await api(`/api/consumer/campaigns/${campaignCGId}/eligibility`, {
      method: "POST",
      token: wrongGender.token,
      body: { age: 25, gender: "MALE", city: "Cairo" },
    });
    assert.equal(genderFail.body.eligible, false);

    const wrongCity = await mk();
    await grantOtp(wrongCity.token, campaignCGId);
    const cityFail = await api(`/api/consumer/campaigns/${campaignCGId}/eligibility`, {
      method: "POST",
      token: wrongCity.token,
      body: { age: 25, gender: "FEMALE", city: "Giza" },
    });
    assert.equal(cityFail.body.eligible, false);
  });

  it("E12: a second eligibility submission on the same campaign is rejected", async () => {
    const consumer = await mkConsumer();
    await grantOtp(consumer.token, campaignCGId);
    const first = await api(`/api/consumer/campaigns/${campaignCGId}/eligibility`, {
      method: "POST",
      token: consumer.token,
      body: { age: 25, gender: "FEMALE", city: "Cairo" },
    });
    assert.equal(first.body.eligible, true);
    const second = await api(`/api/consumer/campaigns/${campaignCGId}/eligibility`, {
      method: "POST",
      token: consumer.token,
      body: { age: 25, gender: "FEMALE", city: "Cairo" },
    });
    assert.equal(second.status, 409);
    assert.equal(
      await prisma.participation.count({ where: { campaignId: campaignCGId, consumerId: consumer.id } }),
      1
    );
  });
});

describe("answer → question → participation → campaign binding (survey)", () => {
  const validSurvey = () => ({
    answers: [
      { questionId: qPIId, valueNumber: 5 },
      { questionId: qRateId, valueNumber: 4 },
      { questionId: qChoiceId, valueOptions: ["a"] },
      { questionId: qTextId, valueText: "solid product" },
    ],
  });

  it("A1: valid participation + valid campaign questions completes", async () => {
    const consumer = await mkConsumer();
    const participation = await redeemedOn(campaignCA1Id, consumer.token, eligAnswer());
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/survey`, {
      method: "POST",
      token: consumer.token,
      body: validSurvey(),
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.status, "SURVEY_COMPLETE");
    // 4 survey answers persisted (the participation also carries its 1
    // eligibility screener answer from redeemedOn()).
    assert.equal(
      await prisma.answer.count({
        where: { participationId: participation.id, questionId: { in: [qPIId, qRateId, qChoiceId, qTextId] } },
      }),
      4
    );
  });

  it("A2/A5: a foreign-campaign question is rejected and persists nothing", async () => {
    const consumer = await mkConsumer();
    const participation = await redeemedOn(campaignCA1Id, consumer.token, eligAnswer());
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/survey`, {
      method: "POST",
      token: consumer.token,
      body: { answers: [{ questionId: qPIotherId, valueNumber: 3 }] },
    });
    assert.equal(res.status, 400);
    // No answer persisted for the rejected question; the only answer on
    // the participation remains its eligibility screener answer.
    assert.equal(
      await prisma.answer.count({ where: { participationId: participation.id, questionId: qPIotherId } }),
      0
    );
    assert.equal(await prisma.answer.count({ where: { participationId: participation.id } }), 1);
    const unchanged = await prisma.participation.findUnique({ where: { id: participation.id } });
    assert.equal(unchanged?.status, "TRIAL_REDEEMED");
  });

  it("A2b: an ELIGIBILITY-stage question of the same campaign is rejected at survey time", async () => {
    const consumer = await mkConsumer();
    const participation = await redeemedOn(campaignCA1Id, consumer.token, eligAnswer());
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/survey`, {
      method: "POST",
      token: consumer.token,
      body: { answers: [{ questionId: qElig1Id, valueOptions: ["no"] }] },
    });
    assert.equal(res.status, 400);
    const unchanged = await prisma.participation.findUnique({ where: { id: participation.id } });
    assert.equal(unchanged?.status, "TRIAL_REDEEMED");
  });

  it("A3: a participation of another campaign cannot be reached through this route", async () => {
    const consumer = await mkConsumer();
    await redeemedOn(campaignCA1Id, consumer.token, eligAnswer());
    const res = await api(`/api/consumer/campaigns/${campaignCA2Id}/survey`, {
      method: "POST",
      token: consumer.token,
      body: { answers: [{ questionId: qPIotherId, valueNumber: 3 }] },
    });
    assert.equal(res.status, 404);
  });

  it("A4: a different consumer cannot act on the participation", async () => {
    const consumer = await mkConsumer();
    await redeemedOn(campaignCA1Id, consumer.token, eligAnswer());
    const other = await mkConsumer();
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/survey`, {
      method: "POST",
      token: other.token,
      body: validSurvey(),
    });
    assert.equal(res.status, 404);
    assert.equal(
      await prisma.answer.count({ where: { participation: { consumerId: other.id } } }),
      0
    );
  });

  it("D1: an empty answers payload cannot complete a participation", async () => {
    const consumer = await mkConsumer();
    const participation = await redeemedOn(campaignCA1Id, consumer.token, eligAnswer());
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/survey`, {
      method: "POST",
      token: consumer.token,
      body: { answers: [] },
    });
    assert.equal(res.status, 400);
    const unchanged = await prisma.participation.findUnique({ where: { id: participation.id } });
    assert.equal(unchanged?.status, "TRIAL_REDEEMED");
  });

  it("D2: an answer carrying no value is rejected", async () => {
    const consumer = await mkConsumer();
    const participation = await redeemedOn(campaignCA1Id, consumer.token, eligAnswer());
    const res = await api(`/api/consumer/campaigns/${campaignCA1Id}/survey`, {
      method: "POST",
      token: consumer.token,
      body: { answers: [{ questionId: qPIId }] },
    });
    assert.equal(res.status, 400);
    // Nothing new persisted — only the eligibility screener answer remains.
    assert.equal(await prisma.answer.count({ where: { participationId: participation.id } }), 1);
    const unchanged = await prisma.participation.findUnique({ where: { id: participation.id } });
    assert.equal(unchanged?.status, "TRIAL_REDEEMED");
  });
});

// ---------------------------------------------------------------------------
// DEFECT D — Measurement / report protection from malformed persisted rows
// ---------------------------------------------------------------------------
describe("measurement and report integrity", () => {
  it("M1: valid campaign answers appear in that campaign's measurement", async () => {
    const res = await api(`/api/company/campaigns/${campaignCMId}/live`, { token: employeeAToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.purchaseIntent.responses, 1);
    assert.equal(res.body.purchaseIntent.averageScore, 5);
    assert.equal(res.body.satisfaction.responses, 1);
    assert.equal(res.body.satisfaction.averageScore, 4);
    assert.equal(res.body.funnel.surveyComplete, 1);
    const sm = res.body.sources.find((s: any) => s.sourceId === qrSMId);
    assert.deepEqual([sm.entered, sm.trialRedeemed, sm.surveyComplete], [1, 1, 1]);
  });

  it("M2: an answer whose participation belongs to another campaign is excluded", async () => {
    const foreign = await mkConsumer();
    const malParticipation = await prisma.participation.create({
      data: { campaignId: campaignCBId, consumerId: foreign.id, status: "SURVEY_COMPLETE" },
    });
    // Malformed row: question lives on CM, participation lives on CB.
    await prisma.answer.create({
      data: { participationId: malParticipation.id, questionId: (await prisma.question.findFirstOrThrow({ where: { campaignId: campaignCMId, type: "PURCHASE_INTENT_1_5" } })).id, valueNumber: 1 },
    });
    const res = await api(`/api/company/campaigns/${campaignCMId}/live`, { token: employeeAToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.purchaseIntent.responses, 1);
    assert.equal(res.body.purchaseIntent.averageScore, 5);
  });

  it("M3: a participation bound to another campaign's source is excluded from source metrics", async () => {
    const foreign = await mkConsumer();
    await prisma.participation.create({
      data: { campaignId: campaignCA2Id, consumerId: foreign.id, qrSourceId: qrSMId, status: "SURVEY_COMPLETE" },
    });
    const res = await api(`/api/company/campaigns/${campaignCMId}/live`, { token: employeeAToken });
    assert.equal(res.status, 200);
    const sm = res.body.sources.find((s: any) => s.sourceId === qrSMId);
    assert.deepEqual([sm.entered, sm.trialRedeemed, sm.surveyComplete], [1, 1, 1]);
  });

  it("M4: report evidence stays campaign-scoped and report shape is unchanged", async () => {
    const foreign = await mkConsumer();
    const malParticipation = await prisma.participation.create({
      data: { campaignId: campaignCBId, consumerId: foreign.id, status: "SURVEY_COMPLETE" },
    });
    const qTextM = await prisma.question.findFirstOrThrow({ where: { campaignId: campaignCMId, type: "TEXT" } });
    await prisma.answer.create({
      data: { participationId: malParticipation.id, questionId: qTextM.id, valueText: "FOREIGN-VERBATIM-MARKER-7x9" },
    });

    const res = await api(`/api/company/campaigns/${campaignCMId}/report`, { token: employeeAToken });
    assert.equal(res.status, 200);
    assert.ok(!JSON.stringify(res.body).includes("FOREIGN-VERBATIM-MARKER-7x9"));
    assert.ok(res.body.consumerVoice.some((v: any) => v.response === "baseline verbatim"));
    assert.equal(res.body.evidence.sampleSize, 1);
    assert.ok(Array.isArray(res.body.findings) && res.body.findings.length > 0);
    assert.ok(Array.isArray(res.body.recommendations) && res.body.recommendations.length > 0);
    assert.ok(res.body.methodology.includes("persisted"));
    assert.equal(res.body.campaign.id, campaignCMId);
  });
});

// ---------------------------------------------------------------------------
// Regression — existing valid behavior is unchanged (R1–R8)
// ---------------------------------------------------------------------------
describe("regression", () => {
  // Updated 2026-09-20 (OFD-04): the Founder-approved study-type expansion
  // added 8 templates (CONCEPT_TESTING, PRICING_PERCEPTION,
  // PACKAGING_EVALUATION, CLAIMS_TESTING, ADVERTISING_MESSAGE_TESTING,
  // BRAND_PERCEPTION, UA_EXPANSION, SEGMENTATION_STUDY) on top of the 6
  // this assertion originally pinned. The check still pins the catalog —
  // now to the full approved set, so any further drift still fails.
  it("R7: study-template catalog and direct studyType assignment are unchanged", async () => {
    const templates = await api("/api/company/study-templates", { token: employeeAToken });
    assert.equal(templates.status, 200);
    assert.equal(templates.body.length, 14);
    assert.deepEqual(
      templates.body.map((t: { key: string }) => t.key),
      [
        "POST_TRIAL_FOOD_BEVERAGE",
        "POST_TRIAL_BEAUTY_PERSONAL_CARE",
        "POST_TRIAL_HOME_CARE",
        "CONCEPT_LAUNCH_VIABILITY",
        "PACKAGING_CLAIMS_REACTION",
        "USAGE_ATTITUDE",
        "CONCEPT_TESTING",
        "PRICING_PERCEPTION",
        "PACKAGING_EVALUATION",
        "CLAIMS_TESTING",
        "ADVERTISING_MESSAGE_TESTING",
        "BRAND_PERCEPTION",
        "UA_EXPANSION",
        "SEGMENTATION_STUDY",
      ]
    );

    const created = await api("/api/company/campaigns", {
      method: "POST",
      token: employeeAToken,
      body: campaignBody({ studyType: "POST_TRIAL_FOOD_BEVERAGE" }),
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.studyType, "POST_TRIAL_FOOD_BEVERAGE");
  });

  it("R8: actor isolation is unchanged", async () => {
    assert.equal((await api("/api/company/campaigns")).status, 401);

    const consumer = await mkConsumer();
    assert.equal((await api("/api/company/campaigns", { token: consumer.token })).status, 403);
    assert.equal((await api("/api/consumer/participations", { token: employeeAToken })).status, 403);

    // Cross-company campaign detail stays a non-leaking 404.
    assert.equal(
      (await api(`/api/company/campaigns/${campaignCA1Id}`, { token: employeeBToken })).status,
      404
    );
  });
});

describe("auth transport hardening", () => {
  it("S1: OTP request returns devOnlyCode outside production and verify completes the round-trip", async () => {
    const phone = "+201000000001";
    const req1 = await api("/api/consumer/auth/otp/request", { method: "POST", body: { phone } });
    assert.equal(req1.status, 200);
    assert.match(req1.body.devOnlyCode, /^\d{6}$/);

    const v = await api("/api/consumer/auth/otp/verify", {
      method: "POST",
      body: { phone, code: req1.body.devOnlyCode },
    });
    assert.equal(v.status, 200);
    assert.ok(v.body.token);
    assert.equal(v.body.consumer.phone, phone);
  });

  it("S2: OTP request is throttled to one send per 60s per phone", async () => {
    const phone = "+201000000002";
    assert.equal(
      (await api("/api/consumer/auth/otp/request", { method: "POST", body: { phone } })).status,
      200
    );
    const second = await api("/api/consumer/auth/otp/request", { method: "POST", body: { phone } });
    assert.equal(second.status, 429);
    // A different phone is unaffected — limits are keyed per credential.
    assert.equal(
      (
        await api("/api/consumer/auth/otp/request", {
          method: "POST",
          body: { phone: "+201000000003" },
        })
      ).status,
      200
    );
  });

  it("S3: OTP verify is throttled per phone — brute force stops at the window max", async () => {
    const phone = "+201000000004";
    await api("/api/consumer/auth/otp/request", { method: "POST", body: { phone } });
    for (let i = 0; i < 10; i++) {
      const r = await api("/api/consumer/auth/otp/verify", {
        method: "POST",
        body: { phone, code: "000000" },
      });
      assert.equal(r.status, 401);
    }
    const blocked = await api("/api/consumer/auth/otp/verify", {
      method: "POST",
      body: { phone, code: "000000" },
    });
    assert.equal(blocked.status, 429);
  });

  it("S4: employee login is throttled per email", async () => {
    for (let i = 0; i < 10; i++) {
      const r = await api("/api/company/auth/login", {
        method: "POST",
        body: { email: "a@example.test", password: "wrong" },
      });
      assert.equal(r.status, 401);
    }
    const blocked = await api("/api/company/auth/login", {
      method: "POST",
      body: { email: "a@example.test", password: "wrong" },
    });
    assert.equal(blocked.status, 429);
  });
});

describe("akedly transport", () => {
  const OLD_KEY = process.env.AKEDLY_API_KEY;
  const OLD_PIPE = process.env.AKEDLY_PIPELINE_ID;

  function enableAkedly() {
    process.env.AKEDLY_API_KEY = "test-key";
    process.env.AKEDLY_PIPELINE_ID = "test-pipeline";
  }

  after(() => {
    if (OLD_KEY === undefined) delete process.env.AKEDLY_API_KEY;
    else process.env.AKEDLY_API_KEY = OLD_KEY;
    if (OLD_PIPE === undefined) delete process.env.AKEDLY_PIPELINE_ID;
    else process.env.AKEDLY_PIPELINE_ID = OLD_PIPE;
    _setAkedlyFetch(null);
  });

  it("T0: challenge proxy returns the pipeline challenge for the client to solve", async () => {
    enableAkedly();
    _setAkedlyFetch(async (url) => {
      return { status: 200, json: async () => ({ status: "success", data: { challengeRequired: true, challenge: "deadbeef", difficulty: 3, challengeToken: "ct-x", expiresAt: new Date(Date.now() + 90000).toISOString(), turnstile: { required: false, siteKey: null } } }) };
    });
    const r = await api("/api/consumer/auth/otp/challenge");
    assert.equal(r.status, 200);
    assert.equal(r.body.data.challengeRequired, true);
    assert.equal(r.body.data.challenge, "deadbeef");
    assert.equal(r.body.data.difficulty, 3);
    assert.equal(r.body.data.challengeToken, "ct-x");
  });

  it("T1: full Akedly round-trip — client powSolution → send → verify → token, no code echo", async () => {
    enableAkedly();
    _setAkedlyFetch(async (url) => {
      if (url.includes("/send"))
        return { status: 200, json: async () => ({ status: "success", data: { transactionID: "t1", transactionReqID: "tx-t1", channels: ["whatsapp"], expiresAt: new Date(Date.now() + 300000).toISOString() }, message: "OTP sent successfully" }) };
      return { status: 200, json: async () => ({ status: "success", data: { verified: true, transactionID: "t1" }, message: "OTP verified successfully" }) };
    });
    const phone = "+201000000010";
    const r = await api("/api/consumer/auth/otp/request", {
      method: "POST",
      body: { phone, powSolution: { challengeToken: "ct-1", nonce: 48291 } },
    });
    assert.equal(r.status, 200);
    assert.equal(r.body.sent, true);
    assert.equal(r.body.devOnlyCode, undefined);
    const v = await api("/api/consumer/auth/otp/verify", { method: "POST", body: { phone, code: "123456" } });
    assert.equal(v.status, 200);
    assert.ok(v.body.token);
    assert.equal(v.body.consumer.phone, phone);
  });

  it("T2: Akedly INVALID_OTP surfaces as 401 and no consumer session is created", async () => {
    enableAkedly();
    _setAkedlyFetch(async (url) => {
      if (url.includes("/send"))
        return { status: 200, json: async () => ({ status: "success", data: { transactionReqID: "tx-t2", expiresAt: new Date(Date.now() + 300000).toISOString() } }) };
      return { status: 403, json: async () => ({ status: "error", code: "INVALID_OTP", message: "Invalid OTP" }) };
    });
    const phone = "+201000000011";
    assert.equal((await api("/api/consumer/auth/otp/request", { method: "POST", body: { phone } })).status, 200);
    const v = await api("/api/consumer/auth/otp/verify", { method: "POST", body: { phone, code: "000000" } });
    assert.equal(v.status, 401);
    assert.equal(await prisma.consumer.count({ where: { phone } }), 0);
  });

  it("T3: Akedly 429 propagates as 429", async () => {
    enableAkedly();
    _setAkedlyFetch(async () => {
      return { status: 429, json: async () => ({ status: "error", code: "RATE_LIMIT_PHONENUMBER_PERMINUTE", message: "Rate limit exceeded", cooldownSeconds: 47 }) };
    });
    const r = await api("/api/consumer/auth/otp/request", { method: "POST", body: { phone: "+201000000012" } });
    assert.equal(r.status, 429);
  });

  it("T4: client-supplied powSolution and turnstileToken are forwarded verbatim — the server never solves", async () => {
    enableAkedly();
    let sendBody: any = null;
    _setAkedlyFetch(async (url, init) => {
      if (url.includes("/send")) {
        sendBody = JSON.parse(init!.body!);
        return { status: 200, json: async () => ({ status: "success", data: { transactionReqID: "tx-t4", expiresAt: new Date(Date.now() + 300000).toISOString() } }) };
      }
      return { status: 200, json: async () => ({ status: "success", data: { verified: true } }) };
    });
    const phone = "+201000000013";
    const r = await api("/api/consumer/auth/otp/request", {
      method: "POST",
      body: { phone, powSolution: { challengeToken: "ct-1", nonce: 42 }, turnstileToken: "tok-1" },
    });
    assert.equal(r.status, 200);
    // Forwarded exactly as the client computed them — no server-side solve.
    assert.deepEqual(sendBody.powSolution, { challengeToken: "ct-1", nonce: 42 });
    assert.equal(sendBody.turnstileToken, "tok-1");
    assert.equal(sendBody.verificationAddress.phoneNumber, phone);
  });

  it("T5: challenge passthrough exposes a Turnstile-required pipeline to the client", async () => {
    enableAkedly();
    _setAkedlyFetch(async () => {
      return { status: 200, json: async () => ({ status: "success", data: { challengeRequired: false, turnstile: { required: true, siteKey: "0x4AAA" } } }) };
    });
    const r = await api("/api/consumer/auth/otp/challenge");
    assert.equal(r.status, 200);
    assert.equal(r.body.data.turnstile.required, true);
    assert.equal(r.body.data.turnstile.siteKey, "0x4AAA");
  });

  it("T6: challenge endpoint is uniform when no provider is configured", async () => {
    delete process.env.AKEDLY_API_KEY;
    delete process.env.AKEDLY_PIPELINE_ID;
    const r = await api("/api/consumer/auth/otp/challenge");
    assert.equal(r.status, 200);
    assert.equal(r.body.data.challengeRequired, false);
    assert.equal(r.body.data.turnstile.required, false);
  });
});
