import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/auth";
import { rateLimit } from "../lib/rateLimit";
import { isAkedlyEnabled, getChallenge as akedlyGetChallenge, sendOtp as akedlySendOtp, verifyOtp as akedlyVerifyOtp } from "../lib/akedly";

const router = Router();

// Production hardening: the OTP code must never be returned to the client
// (or logged) in production — devOnlyCode is a development convenience only.
// When AKEDLY_API_KEY/AKEDLY_PIPELINE_ID are configured, delivery goes
// through Akedly V1.2 and no local code exists at all.
const isProduction = process.env.NODE_ENV === "production";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Benchmark §10: "consumer authentication / OTP/JWT flow" must be
// preserved as a foundation. No SMS gateway is integrated in this build
// (environment blocker — reported in the final report); the code is
// returned in the response and logged so the flow is genuinely testable
// end-to-end without fabricating delivery.
const requestSchema = z.object({
  phone: z.string().min(6).max(20),
  // FOUNDER DECISION FD-07a (2026-09-21): OTP is required fresh for every
  // campaign participation. Supplying campaignId binds the issued code to
  // that campaign; verify only matches a code whose campaignId is identical
  // — a code bound to Campaign A can never verify for Campaign B.
  campaignId: z.string().optional(),
  // Client-side Shield proofs, forwarded to Akedly unchanged. The client
  // obtains the challenge via GET /otp/challenge, solves PoW itself, and
  // submits the result here — the server never solves it.
  powSolution: z.object({ challengeToken: z.string(), nonce: z.number().int().nonnegative() }).optional(),
  turnstileToken: z.string().optional(),
});

// Client-side PoW entry point (Akedly V1.2 Step 1). Returns the pipeline's
// challenge requirements so the client can solve them before requesting an
// OTP. When no provider is configured (local dev) the uniform response says
// no challenge is required.
router.get(
  "/otp/challenge",
  rateLimit({ windowMs: 5 * 60_000, max: 30 }),
  async (_req, res) => {
    if (!isAkedlyEnabled()) {
      return res.json({ status: "success", data: { challengeRequired: false, turnstile: { required: false, siteKey: null } } });
    }
    const challenge = await akedlyGetChallenge();
    if (!challenge.ok) return res.status(502).json({ error: "OTP provider challenge failed" });
    res.json({ status: "success", data: challenge.data });
  }
);

router.post(
  "/otp/request",
  rateLimit({ windowMs: 60_000, max: 1, key: (req) => (req.body as { phone?: string })?.phone }),
  async (req, res) => {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid phone" });
    const { phone, campaignId, powSolution, turnstileToken } = parsed.data;

    if (campaignId) {
      // Campaign binding is established at request time and only for a
      // campaign that can actually be entered — the code must never be
      // minted against a draft/closed/nonexistent campaign.
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { status: true } });
      if (!campaign || campaign.status !== "ACTIVE") {
        return res.status(404).json({ error: "Campaign is not available" });
      }
    }

    if (isAkedlyEnabled()) {
      // Real delivery. The OtpCode row carries the Akedly transactionReqID
      // in `code` — verify resolves it by phone, never by user input.
      const sent = await akedlySendOtp(phone, req.ip, powSolution, turnstileToken);
      if (!sent.ok) {
        // eslint-disable-next-line no-console
        console.warn(`[OTP] Akedly send failed for phone=${phone}: status=${sent.status} ${sent.message}`);
        return res.status(sent.status).json({ error: "OTP could not be sent. Please try again later." });
      }
      await prisma.otpCode.create({ data: { phone, campaignId: campaignId ?? null, code: sent.transactionReqID, expiresAt: sent.expiresAt } });
      return res.json({ sent: true, expiresAt: sent.expiresAt });
    }

    if (isProduction) {
      // No provider configured — fail closed rather than pretend a code
      // was delivered.
      return res.status(503).json({ error: "OTP provider not configured" });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma.otpCode.create({ data: { phone, campaignId: campaignId ?? null, code, expiresAt } });
    // eslint-disable-next-line no-console
    console.log(`[OTP] phone=${phone} code=${code} (no SMS gateway integrated — dev delivery)`);
    res.json({ sent: true, devOnlyCode: code, expiresAt });
  }
);

const verifySchema = z.object({
  phone: z.string().min(6).max(20),
  // Akedly pipelines may issue 4–6 digit codes — never hardcode 6.
  code: z.string().regex(/^\d{4,6}$/),
  name: z.string().optional(),
  // FD-07a: when present, only a code bound to this exact campaignId
  // satisfies the lookup — cross-campaign reuse is impossible.
  campaignId: z.string().optional(),
});

router.post(
  "/otp/verify",
  rateLimit({ windowMs: 5 * 60_000, max: 10, key: (req) => (req.body as { phone?: string })?.phone }),
  async (req, res) => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { phone, code, name, campaignId } = parsed.data;

    // FD-07a campaign binding: the code lookup matches campaignId exactly
    // (null matches only unscoped codes, a campaign-scoped code matches only
    // that campaign) — a code issued for Campaign A is invisible here when
    // the client claims Campaign B.
    let otp: { id: string };
    if (isAkedlyEnabled()) {
      // The stored `code` is the Akedly transactionReqID; the user-entered
      // code is checked by Akedly, not compared here.
      const latest = await prisma.otpCode.findFirst({
        where: { phone, campaignId: campaignId ?? null, consumedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      });
      if (!latest) return res.status(401).json({ error: "Invalid or expired code" });
      const verified = await akedlyVerifyOtp(latest.code, code);
      if (!verified.ok) {
        return res.status(verified.status).json({ error: "Invalid or expired code" });
      }
      otp = latest;
    } else {
      const found = await prisma.otpCode.findFirst({
        where: { phone, code, campaignId: campaignId ?? null, consumedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      });
      if (!found) return res.status(401).json({ error: "Invalid or expired code" });
      otp = found;
    }

    await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    let consumer = await prisma.consumer.findUnique({ where: { phone } });
    if (!consumer) {
      consumer = await prisma.consumer.create({ data: { phone, name } });
    } else if (name && !consumer.name) {
      consumer = await prisma.consumer.update({ where: { id: consumer.id }, data: { name } });
    }

    if (campaignId) {
      // Mint the campaign-bound participation authorization. It is consumed
      // atomically by POST /consumer/campaigns/:id/eligibility — one
      // verification authorizes exactly one eligibility submission for
      // exactly this campaign, for exactly this consumer.
      await prisma.campaignOtpVerification.create({
        data: {
          consumerId: consumer.id,
          campaignId,
          otpCodeId: otp.id,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
    }

    const token = signToken({ kind: "consumer", consumerId: consumer.id });
    res.json({ token, consumer: { id: consumer.id, phone: consumer.phone, name: consumer.name } });
  }
);

export default router;
