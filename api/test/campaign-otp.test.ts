import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma, signToken, startApi, ApiCall } from "./helpers";
import { _setAkedlyFetch } from "../src/lib/akedly";

// FD-07a (Founder decision 2026-09-21): a fresh OTP verification bound to
// THIS campaign is required before a participation can be created. This
// suite exercises the real HTTP boundary — request → verify → consume —
// against a freshly migrated SQLite database.
//
// Properties under test:
//   - a session token alone does NOT authorize participation;
//   - a code issued for Campaign A is invisible to a verify claiming B;
//   - a verification minted for A authorizes only A, exactly once;
//   - codes can only be minted against ACTIVE campaigns;
//   - replay (same code / same verification) is rejected;
//   - TRIAL_REDEEMED participations can resume into the survey (FD-M3);
//   - the Akedly transport path honours the same campaign binding.

let api: ApiCall;
let stopServer: () => Promise<void>;

let campaignAId: string;
let campaignBId: string;
let campaignDraftId: string;
let qPostAId: string;

let phoneSeq = 0;
const nextPhone = () => `+2010001${String(phoneSeq++).padStart(5, "0")}`;

async function requestOtp(phone: string, campaignId?: string) {
  const res = await api("/api/consumer/auth/otp/request", {
    method: "POST",
    body: campaignId ? { phone, campaignId } : { phone },
  });
  return res;
}

async function verifyOtp(phone: string, code: string, campaignId?: string) {
  const res = await api("/api/consumer/auth/otp/verify", {
    method: "POST",
    body: campaignId ? { phone, code, campaignId } : { phone, code },
  });
  return res;
}

async function campaignLogin(campaignId: string) {
  const phone = nextPhone();
  const req = await requestOtp(phone, campaignId);
  assert.equal(req.status, 200, JSON.stringify(req.body));
  const code = req.body.devOnlyCode as string;
  assert.ok(code, "dev mode must echo the code for the round-trip");
  const verify = await verifyOtp(phone, code, campaignId);
  assert.equal(verify.status, 200, JSON.stringify(verify.body));
  return { phone, token: verify.body.token as string, consumerId: verify.body.consumer.id as string };
}

before(async () => {
  ({ api, stop: stopServer } = await startApi());

  const company = await prisma.company.create({ data: { name: "OTP Co" } });
  const mkCampaign = (name: string, status: string) =>
    prisma.campaign.create({
      data: {
        companyId: company.id,
        name,
        objective: "Test objective",
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        status,
      },
    });
  campaignAId = (await mkCampaign("CA", "ACTIVE")).id;
  campaignBId = (await mkCampaign("CB", "ACTIVE")).id;
  campaignDraftId = (await mkCampaign("CD", "DRAFT")).id;
  qPostAId = (
    await prisma.question.create({
      data: { campaignId: campaignAId, stage: "POST_TRIAL", type: "TEXT", text: "How was it?", order: 1 },
    })
  ).id;
});

after(async () => {
  await stopServer();
  await prisma.$disconnect();
});

describe("FD-07a campaign-bound OTP", () => {
  it("full request → verify → eligibility round-trip for the bound campaign", async () => {
    const { token } = await campaignLogin(campaignAId);
    const elig = await api(`/api/consumer/campaigns/${campaignAId}/eligibility`, {
      method: "POST",
      token,
      body: { answers: [] },
    });
    assert.equal(elig.status, 200, JSON.stringify(elig.body));
    assert.equal(elig.body.participation.campaignId, campaignAId);
  });

  it("a session token alone does NOT authorize participation (account login ≠ campaign entry)", async () => {
    const phone = nextPhone();
    const req = await requestOtp(phone);
    assert.equal(req.status, 200);
    const verify = await verifyOtp(phone, req.body.devOnlyCode);
    assert.equal(verify.status, 200);
    assert.ok(verify.body.token);
    const elig = await api(`/api/consumer/campaigns/${campaignAId}/eligibility`, {
      method: "POST",
      token: verify.body.token,
      body: { answers: [] },
    });
    assert.equal(elig.status, 403);
    assert.equal(elig.body.code, "CAMPAIGN_OTP_REQUIRED");
    assert.equal(
      await prisma.participation.count({
        where: { campaignId: campaignAId, consumerId: verify.body.consumer.id },
      }),
      0
    );
  });

  it("a code issued for Campaign A is invisible when verify claims Campaign B", async () => {
    const phone = nextPhone();
    const req = await requestOtp(phone, campaignAId);
    assert.equal(req.status, 200);
    const wrong = await verifyOtp(phone, req.body.devOnlyCode, campaignBId);
    assert.equal(wrong.status, 401);
    // And no verification was minted for the claimed campaign.
    assert.equal(await prisma.campaignOtpVerification.count({ where: { campaignId: campaignBId } }), 0);
  });

  it("a campaign-scoped code does not satisfy an unscoped (account) verify", async () => {
    const phone = nextPhone();
    const req = await requestOtp(phone, campaignAId);
    assert.equal(req.status, 200);
    const unscoped = await verifyOtp(phone, req.body.devOnlyCode);
    assert.equal(unscoped.status, 401);
  });

  it("a verification minted for Campaign A cannot authorize Campaign B", async () => {
    const { token } = await campaignLogin(campaignAId);
    const onB = await api(`/api/consumer/campaigns/${campaignBId}/eligibility`, {
      method: "POST",
      token,
      body: { answers: [] },
    });
    assert.equal(onB.status, 403);
    assert.equal(onB.body.code, "CAMPAIGN_OTP_REQUIRED");
    // Campaign A still succeeds — the authorization is spent only there.
    const onA = await api(`/api/consumer/campaigns/${campaignAId}/eligibility`, {
      method: "POST",
      token,
      body: { answers: [] },
    });
    assert.equal(onA.status, 200);
    // And B remains closed afterwards.
    const onBAgain = await api(`/api/consumer/campaigns/${campaignBId}/eligibility`, {
      method: "POST",
      token,
      body: { answers: [] },
    });
    assert.equal(onBAgain.status, 403);
  });

  it("replay: the same code cannot verify twice, and one verification authorizes one submission", async () => {
    const phone = nextPhone();
    const req = await requestOtp(phone, campaignAId);
    const code = req.body.devOnlyCode;
    const first = await verifyOtp(phone, code, campaignAId);
    assert.equal(first.status, 200);
    const replay = await verifyOtp(phone, code, campaignAId);
    assert.equal(replay.status, 401);
    const token = first.body.token;
    const elig1 = await api(`/api/consumer/campaigns/${campaignAId}/eligibility`, {
      method: "POST",
      token,
      body: { answers: [] },
    });
    assert.equal(elig1.status, 200);
    // The verification is consumed; a second submission reports the real
    // state (409 participation exists) rather than silently succeeding.
    const elig2 = await api(`/api/consumer/campaigns/${campaignAId}/eligibility`, {
      method: "POST",
      token,
      body: { answers: [] },
    });
    assert.equal(elig2.status, 409);
    assert.equal(
      await prisma.participation.count({ where: { campaignId: campaignAId, consumerId: first.body.consumer.id } }),
      1
    );
  });

  it("an expired verification does not authorize eligibility", async () => {
    const consumer = await prisma.consumer.create({ data: { phone: nextPhone() } });
    const token = signToken({ kind: "consumer", consumerId: consumer.id });
    await prisma.campaignOtpVerification.create({
      data: {
        consumerId: consumer.id,
        campaignId: campaignAId,
        otpCodeId: "expired-fixture",
        expiresAt: new Date(Date.now() - 1000),
      },
    });
    const elig = await api(`/api/consumer/campaigns/${campaignAId}/eligibility`, {
      method: "POST",
      token,
      body: { answers: [] },
    });
    assert.equal(elig.status, 403);
    assert.equal(elig.body.code, "CAMPAIGN_OTP_REQUIRED");
  });

  it("codes are only minted against ACTIVE campaigns", async () => {
    // Distinct phones — OTP request is throttled to one send per 60s per
    // phone, and the throttle must stay intact.
    assert.equal((await requestOtp(nextPhone(), campaignDraftId)).status, 404);
    assert.equal((await requestOtp(nextPhone(), "no-such-campaign")).status, 404);
    // Account-level requests are unaffected.
    assert.equal((await requestOtp(nextPhone())).status, 200);
  });
});

describe("FD-M3 partial participation resume", () => {
  it("TRIAL_REDEEMED participation can fetch and submit the survey on the same identity", async () => {
    const { token, consumerId } = await campaignLogin(campaignAId);
    await api(`/api/consumer/campaigns/${campaignAId}/eligibility`, { method: "POST", token, body: { answers: [] } });
    const redeem = await api(`/api/consumer/campaigns/${campaignAId}/redeem`, { method: "POST", token });
    assert.equal(redeem.status, 200, JSON.stringify(redeem.body));

    // Consumer leaves before the survey. Re-entry must resume, not
    // dead-end: the survey endpoint serves TRIAL_REDEEMED participations.
    const survey = await api(`/api/consumer/campaigns/${campaignAId}/survey`, { token });
    assert.equal(survey.status, 200);
    assert.equal(survey.body[0].id, qPostAId);

    const submit = await api(`/api/consumer/campaigns/${campaignAId}/survey`, {
      method: "POST",
      token,
      body: { answers: [{ questionId: qPostAId, valueText: "resumed and done" }] },
    });
    assert.equal(submit.status, 200, JSON.stringify(submit.body));

    const participation = await prisma.participation.findUnique({
      where: { campaignId_consumerId: { campaignId: campaignAId, consumerId } },
    });
    assert.equal(participation?.status, "SURVEY_COMPLETE");
    // Exactly one participation, one redemption — no duplicates created.
    assert.equal(
      await prisma.participation.count({ where: { campaignId: campaignAId, consumerId } }),
      1
    );
    const reRedeem = await api(`/api/consumer/campaigns/${campaignAId}/redeem`, { method: "POST", token });
    assert.equal(reRedeem.status, 409);
  });
});

describe("FD-07a under the Akedly transport", () => {
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

  it("PoW-only round-trip bound to a campaign: verify for B sees nothing minted for A", async () => {
    enableAkedly();
    _setAkedlyFetch(async (url) => {
      if (url.includes("/send"))
        return {
          status: 200,
          json: async () => ({
            status: "success",
            data: { transactionReqID: "tx-scoped", expiresAt: new Date(Date.now() + 300000).toISOString() },
          }),
        };
      return { status: 200, json: async () => ({ status: "success", data: { verified: true } }) };
    });
    const phone = nextPhone();
    const req = await api("/api/consumer/auth/otp/request", {
      method: "POST",
      body: { phone, campaignId: campaignAId, powSolution: { challengeToken: "ct-1", nonce: 7 } },
    });
    assert.equal(req.status, 200);
    assert.equal(req.body.devOnlyCode, undefined, "Akedly path must never echo a code");
    // Stored transaction is bound to campaign A.
    const stored = await prisma.otpCode.findFirst({ where: { phone } });
    assert.equal(stored?.campaignId, campaignAId);
    // Verify claiming campaign B cannot see it.
    const wrong = await api("/api/consumer/auth/otp/verify", {
      method: "POST",
      body: { phone, code: "123456", campaignId: campaignBId },
    });
    assert.equal(wrong.status, 401);
    // Verify for the bound campaign mints the verification and a session.
    const right = await api("/api/consumer/auth/otp/verify", {
      method: "POST",
      body: { phone, code: "123456", campaignId: campaignAId },
    });
    assert.equal(right.status, 200);
    const elig = await api(`/api/consumer/campaigns/${campaignAId}/eligibility`, {
      method: "POST",
      token: right.body.token,
      body: { answers: [] },
    });
    assert.equal(elig.status, 200, JSON.stringify(elig.body));
  });
});
