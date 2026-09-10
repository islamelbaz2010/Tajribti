import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireConsumer, asConsumer } from "../middleware/auth";

const router = Router();

// ---------------------------------------------------------------------------
// Discover (Benchmark §4 CONSUMER "Discover") — active campaigns only.
// ---------------------------------------------------------------------------
router.get("/campaigns", async (_req, res) => {
  const now = new Date();
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE", startDate: { lte: now }, endDate: { gte: now } },
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
    },
  });
  if (!campaign || campaign.status !== "ACTIVE") {
    return res.status(404).json({ error: "Campaign not available" });
  }
  res.json(campaign);
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

  const participation = await prisma.participation.create({
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
    await prisma.answer.createMany({
      data: answers.map((a) => ({
        participationId: participation.id,
        questionId: a.questionId,
        valueText: a.valueText,
        valueOptions: a.valueOptions ? JSON.stringify(a.valueOptions) : null,
      })),
    });
  }

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

const surveySubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      valueText: z.string().optional(),
      valueNumber: z.number().optional(),
      valueOptions: z.array(z.string()).optional(),
    })
  ),
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

  await prisma.$transaction(
    parsed.data.answers.map((a) =>
      prisma.answer.upsert({
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

  const updated = await prisma.participation.update({
    where: { id: participation.id },
    data: { status: "SURVEY_COMPLETE", surveyCompletedAt: new Date() },
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

export default router;
