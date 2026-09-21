import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireConsumer, asConsumer } from "../middleware/auth";
import { verifyToken } from "../lib/auth";
import { resolveMediaUrls } from "../lib/media";

const router = Router();

// ---------------------------------------------------------------------------
// Discover (Benchmark §4 CONSUMER "Discover") — active, in-window campaigns.
// FOUNDER PRODUCT DECISION (2026-09-20): for an authenticated consumer,
// Discover must exclude every campaign they already have a Participation
// record for — participated campaigns live in Activity/History only, never
// in Discover (no disabled card, no "already participated" entry).
// Anonymous callers still receive the public active list unchanged.
// ---------------------------------------------------------------------------
router.get("/campaigns", async (req, res) => {
  const now = new Date();
  let consumerId: string | null = null;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const claims = verifyToken(header.slice("Bearer ".length));
    if (claims?.kind === "consumer") consumerId = claims.consumerId;
  }
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
      ...(consumerId ? { participations: { none: { consumerId } } } : {}),
    },
    include: { company: { select: { name: true } }, product: true },
    orderBy: { startDate: "desc" },
  });
  res.json(campaigns);
});

router.get("/campaigns/:id", async (req, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: {
      company: { select: { name: true } },
      product: true,
      questions: { where: { stage: "ELIGIBILITY" }, orderBy: { order: "asc" } },
      media: true,
    },
  });
  if (!campaign || campaign.status !== "ACTIVE") {
    return res.status(404).json({ error: "Campaign not available" });
  }
  res.json({ ...campaign, media: await resolveMediaUrls(campaign.media) });
});

// ---------------------------------------------------------------------------
// QR / Journey entry (Benchmark §3 QR/source attribution; §10 date gating)
// ---------------------------------------------------------------------------
router.get("/qr/:code", async (req, res) => {
  const source = await prisma.qrSource.findUnique({
    where: { code: req.params.code },
    include: { campaign: true },
  });
  if (!source) return res.status(404).json({ error: "Unknown QR/source code" });

  const now = new Date();
  if (now < source.activeFrom || now > source.activeTo) {
    return res.status(410).json({ error: "This QR/source is not currently active" });
  }
  if (source.campaign.status !== "ACTIVE") {
    return res.status(410).json({ error: "Campaign is not currently active" });
  }
  res.json({ campaignId: source.campaignId, sourceId: source.id, sourceLabel: source.label });
});

// ---------------------------------------------------------------------------
// Eligibility (Benchmark §4 CONSUMER "Eligibility")
// ---------------------------------------------------------------------------
const eligibilitySchema = z.object({
  qrSourceId: z.string().optional(),
  age: z.number().int().min(0).max(120).optional(),
  gender: z.string().optional(),
  city: z.string().optional(),
  answers: z.array(z.object({ questionId: z.string(), valueOptions: z.array(z.string()).optional(), valueText: z.string().optional() })).default([]),
});

router.post("/campaigns/:id/eligibility", requireConsumer, async (req, res) => {
  const { consumerId } = asConsumer(req);
  const parsed = eligibilitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const { qrSourceId, age, gender, city, answers } = parsed.data;

  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { questions: { where: { stage: "ELIGIBILITY" } } },
  });
  if (!campaign || campaign.status !== "ACTIVE") {
    return res.status(404).json({ error: "Campaign is not available" });
  }

  const existing = await prisma.participation.findUnique({
    where: { campaignId_consumerId: { campaignId: campaign.id, consumerId } },
  });
  if (existing) {
    return res.status(409).json({ error: "Already participated in this campaign", participation: existing });
  }

  // FOUNDER DECISION FD-07a (2026-09-21): a fresh OTP verification bound to
  // THIS campaign is required before a participation can be created. The
  // check runs after the duplicate-participation check so an existing
  // participation still reports its real state (409) instead of re-asking
  // for OTP. The verification is consumed inside the participation
  // transaction below — it authorizes exactly one eligibility submission,
  // for this consumer, for this campaign only.
  const verification = await prisma.campaignOtpVerification.findFirst({
    where: { consumerId, campaignId: campaign.id, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!verification) {
    return res.status(403).json({ error: "Campaign verification required", code: "CAMPAIGN_OTP_REQUIRED" });
  }

  // QR/source → campaign binding (Benchmark §10 campaign ownership
  // isolation): a source identifier is only valid for the campaign it was
  // created on. Unknown ids and sources belonging to another campaign get
  // the same 400 — the response does not reveal whether the source exists
  // elsewhere. Checked before any mutation so a rejected attempt creates
  // no participation.
  if (qrSourceId) {
    const source = await prisma.qrSource.findUnique({
      where: { id: qrSourceId },
      select: { campaignId: true },
    });
    if (!source || source.campaignId !== campaign.id) {
      return res.status(400).json({ error: "Invalid QR/source for this campaign" });
    }
  }

  // Answer → question → campaign binding: screener answers may only
  // reference ELIGIBILITY-stage questions of this exact campaign and must
  // carry a value. A question id from another campaign, a POST_TRIAL
  // question, or an answer with no content must never become persisted
  // evidence (the participation is scoped to this campaign, so a foreign
  // question id would otherwise create an Answer row whose two relations
  // disagree — exactly the malformed evidence measurement must never see).
  const eligibilityQuestionIds = new Set(campaign.questions.map((q) => q.id));
  const hasInvalidAnswer = answers.some(
    (a) => !eligibilityQuestionIds.has(a.questionId) || (!a.valueText?.trim() && !(a.valueOptions?.length ?? 0))
  );
  if (hasInvalidAnswer) {
    return res.status(400).json({ error: "Invalid input" });
  }

  // Demographic gate (Benchmark §3 "Audience/qualification is an explicit
  // campaign concern"). Missing demographic input is treated as a screener
  // question instead of an automatic fail only if the campaign did not
  // request it (no field set => no gate on that field).
  let demoEligible = true;
  if (campaign.audienceAgeMin != null && age != null && age < campaign.audienceAgeMin) demoEligible = false;
  if (campaign.audienceAgeMax != null && age != null && age > campaign.audienceAgeMax) demoEligible = false;
  if (campaign.audienceGender && campaign.audienceGender !== "ANY" && gender && gender !== campaign.audienceGender) {
    demoEligible = false;
  }
  if (campaign.audienceCity && city && campaign.audienceCity.toLowerCase() !== city.toLowerCase()) {
    demoEligible = false;
  }

  // Screener questions: every required ELIGIBILITY question must be answered.
  const requiredIds = campaign.questions.filter((q) => q.required).map((q) => q.id);
  const answeredIds = new Set(answers.map((a) => a.questionId));
  const allRequiredAnswered = requiredIds.every((id) => answeredIds.has(id));

  const eligible = demoEligible && allRequiredAnswered;

  // Participation and its screener answers commit together — a
  // participation without the answers that determined its status (or
  // answers on a participation that failed to be created) would be
  // corrupt evidence.
  const participation = await prisma.$transaction(async (tx) => {
    // Consume the campaign-bound verification atomically with the
    // participation it authorizes — a spent verification can never be
    // replayed, and a failed transaction never consumes one.
    await tx.campaignOtpVerification.update({
      where: { id: verification.id },
      data: { consumedAt: new Date() },
    });
    const created = await tx.participation.create({
      data: {
        campaignId: campaign.id,
        consumerId,
        qrSourceId,
        status: eligible ? "ELIGIBLE" : "INELIGIBLE",
        eligibilityAt: new Date(),
        ageAtEntry: age,
        genderAtEntry: gender,
        cityAtEntry: city,
      },
    });
    if (answers.length) {
      await tx.answer.createMany({
        data: answers.map((a) => ({
          participationId: created.id,
          questionId: a.questionId,
          valueText: a.valueText,
          valueOptions: a.valueOptions ? JSON.stringify(a.valueOptions) : null,
        })),
      });
    }
    return created;
  });

  res.json({ eligible, participation });
});

// ---------------------------------------------------------------------------
// Trial / Redemption (Benchmark §4 CONSUMER "Trial / Redemption")
// ---------------------------------------------------------------------------
router.post("/campaigns/:id/redeem", requireConsumer, async (req, res) => {
  const { consumerId } = asConsumer(req);
  const participation = await prisma.participation.findUnique({
    where: { campaignId_consumerId: { campaignId: req.params.id, consumerId } },
  });
  if (!participation) return res.status(404).json({ error: "Not eligible — no participation record" });
  if (participation.status === "INELIGIBLE") return res.status(403).json({ error: "Not eligible for trial" });
  if (participation.status !== "ELIGIBLE") {
    return res.status(409).json({ error: `Cannot redeem from status ${participation.status}` });
  }
  const updated = await prisma.participation.update({
    where: { id: participation.id },
    data: { status: "TRIAL_REDEEMED", trialRedeemedAt: new Date() },
  });
  res.json(updated);
});

// ---------------------------------------------------------------------------
// Survey / Feedback (Benchmark §4 CONSUMER "Survey", "Feedback")
// ---------------------------------------------------------------------------
router.get("/campaigns/:id/survey", requireConsumer, async (req, res) => {
  const { consumerId } = asConsumer(req);
  const participation = await prisma.participation.findUnique({
    where: { campaignId_consumerId: { campaignId: req.params.id, consumerId } },
  });
  if (!participation) return res.status(404).json({ error: "No participation record" });
  if (participation.status !== "TRIAL_REDEEMED") {
    return res.status(409).json({ error: "Survey is available only after trial redemption" });
  }
  const questions = await prisma.question.findMany({
    where: { campaignId: req.params.id, stage: "POST_TRIAL" },
    orderBy: { order: "asc" },
  });
  res.json(questions);
});

// Minimum evidence validity: a submission must contain at least one
// answer, and every answer must carry an actual value. A request with no
// valid answer payload must not produce persisted evidence or a completed
// participation (an all-null Answer row is not evidence — it would still
// inflate per-question response counts downstream).
const surveySubmitSchema = z.object({
  answers: z
    .array(
      z
        .object({
          questionId: z.string(),
          valueText: z.string().optional(),
          valueNumber: z.number().optional(),
          valueOptions: z.array(z.string()).optional(),
        })
        .refine(
          (a) =>
            (a.valueText?.trim() ?? "").length > 0 ||
            a.valueNumber !== undefined ||
            (a.valueOptions?.length ?? 0) > 0,
          { message: "Each answer must carry a value" }
        )
    )
    .min(1),
});

router.post("/campaigns/:id/survey", requireConsumer, async (req, res) => {
  const { consumerId } = asConsumer(req);
  const parsed = surveySubmitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const participation = await prisma.participation.findUnique({
    where: { campaignId_consumerId: { campaignId: req.params.id, consumerId } },
  });
  if (!participation) return res.status(404).json({ error: "No participation record" });
  if (participation.status !== "TRIAL_REDEEMED") {
    return res.status(409).json({ error: "Survey is available only after trial redemption" });
  }

  // Answer → question → participation → campaign binding (Benchmark §10
  // campaign ownership isolation): every submitted questionId must be a
  // POST_TRIAL question of this exact campaign. The participation is
  // already bound to the authenticated consumer and this campaign by the
  // campaignId_consumerId lookup above, so enforcing the question side
  // guarantees answer.question.campaignId === participation.campaignId.
  // Answers referencing questions of other campaigns — or another stage —
  // are rejected whole, before any mutation.
  const surveyQuestions = await prisma.question.findMany({
    where: { campaignId: participation.campaignId, stage: "POST_TRIAL" },
    select: { id: true },
  });
  const surveyQuestionIds = new Set(surveyQuestions.map((q) => q.id));
  if (parsed.data.answers.some((a) => !surveyQuestionIds.has(a.questionId))) {
    return res.status(400).json({ error: "Invalid input" });
  }

  // Answers and the SURVEY_COMPLETE transition commit together — a
  // completed participation without its persisted answers is corrupt
  // evidence, and answers on a participation that never completed must
  // not stand either.
  const updated = await prisma.$transaction(async (tx) => {
    await Promise.all(
      parsed.data.answers.map((a) =>
        tx.answer.upsert({
          where: { participationId_questionId: { participationId: participation.id, questionId: a.questionId } },
          create: {
            participationId: participation.id,
            questionId: a.questionId,
            valueText: a.valueText,
            valueNumber: a.valueNumber,
            valueOptions: a.valueOptions ? JSON.stringify(a.valueOptions) : null,
          },
          update: {
            valueText: a.valueText,
            valueNumber: a.valueNumber,
            valueOptions: a.valueOptions ? JSON.stringify(a.valueOptions) : null,
          },
        })
      )
    );
    return tx.participation.update({
      where: { id: participation.id },
      data: { status: "SURVEY_COMPLETE", surveyCompletedAt: new Date() },
    });
  });

  res.json(updated);
});

// ---------------------------------------------------------------------------
// Post-Trial (Benchmark §4 CONSUMER "Post-Trial") — participation history.
// ---------------------------------------------------------------------------
router.get("/participations", requireConsumer, async (req, res) => {
  const { consumerId } = asConsumer(req);
  const participations = await prisma.participation.findMany({
    where: { consumerId },
    include: { campaign: { select: { id: true, name: true, status: true } } },
    orderBy: { enteredAt: "desc" },
  });
  res.json(participations);
});

// ===========================================================================
// FOUNDER INNOVATION LAYER (docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md)
// ===========================================================================

// --- OFD-08.4: persistent consumer account profile ----------------------------
router.get("/profile", requireConsumer, async (req, res) => {
  const { consumerId } = asConsumer(req);
  const consumer = await prisma.consumer.findUnique({
    where: { id: consumerId },
    select: { id: true, phone: true, name: true, panelOptIn: true, panelOptInAt: true, pushOptIn: true, pushOptInAt: true, createdAt: true },
  });
  if (!consumer) return res.status(404).json({ error: "Consumer not found" });
  res.json(consumer);
});

router.patch("/profile", requireConsumer, async (req, res) => {
  const { consumerId } = asConsumer(req);
  const parsed = z.object({ name: z.string().min(1).optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const consumer = await prisma.consumer.update({
    where: { id: consumerId },
    data: { name: parsed.data.name },
    select: { id: true, phone: true, name: true, panelOptIn: true, pushOptIn: true },
  });
  res.json(consumer);
});

// --- OFD-15A: explicit panel opt-in / opt-out ---------------------------------
// Opt-in enables same-company cross-campaign aggregation (OFD-15B). Opt-out
// is immediate: the consumer is excluded from all panel aggregates.
router.post("/panel/opt-in", requireConsumer, async (req, res) => {
  const { consumerId } = asConsumer(req);
  const consumer = await prisma.consumer.update({
    where: { id: consumerId },
    data: { panelOptIn: true, panelOptInAt: new Date() },
    select: { id: true, panelOptIn: true, panelOptInAt: true },
  });
  res.json(consumer);
});

router.post("/panel/opt-out", requireConsumer, async (req, res) => {
  const { consumerId } = asConsumer(req);
  const consumer = await prisma.consumer.update({
    where: { id: consumerId },
    data: { panelOptIn: false, panelOptInAt: null },
    select: { id: true, panelOptIn: true },
  });
  res.json(consumer);
});

// FOUNDER PRODUCT DECISION (2026-09-20): consumers receive NO push
// notifications — the /push/opt-in and /push/opt-out endpoints were removed
// (no consent to collect, nothing to deliver). The Consumer.pushOptIn /
// pushToken columns are left dormant: dropping them would be a destructive
// migration with no product need. Mobile push UI cleanup is deferred to the
// final mobile release phase (mobile code is frozen this pass).

export default router;
