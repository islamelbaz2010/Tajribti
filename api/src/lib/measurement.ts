import { prisma } from "./prisma";

// Evidence-grounded measurement (Benchmark §16 user-directive): every
// metric here has a real source query, a stated population, and a
// defensible denominator. No commercial metric or statistical claim is
// invented beyond what raw persisted Answers/Participations support.

export async function getFunnel(campaignId: string) {
  const participations = await prisma.participation.findMany({
    where: { campaignId },
    select: { status: true },
  });

  const total = participations.length;
  const count = (s: string) => participations.filter((p) => p.status === s).length;

  return {
    entered: total,
    eligible: count("ELIGIBLE") + count("TRIAL_REDEEMED") + count("SURVEY_COMPLETE"),
    ineligible: count("INELIGIBLE"),
    trialRedeemed: count("TRIAL_REDEEMED") + count("SURVEY_COMPLETE"),
    surveyComplete: count("SURVEY_COMPLETE"),
    dropped: count("DROPPED"),
  };
}

export async function getSourceBreakdown(campaignId: string) {
  const sources = await prisma.qrSource.findMany({
    where: { campaignId },
    include: { participations: { select: { status: true } } },
  });
  return sources.map((s) => ({
    sourceId: s.id,
    label: s.label,
    code: s.code,
    entered: s.participations.length,
    trialRedeemed: s.participations.filter(
      (p) => p.status === "TRIAL_REDEEMED" || p.status === "SURVEY_COMPLETE"
    ).length,
    surveyComplete: s.participations.filter((p) => p.status === "SURVEY_COMPLETE").length,
  }));
}

export interface PurchaseIntentSummary {
  responses: number;
  averageScore: number | null;
  distribution: Record<string, number>; // "1".."5" -> count
}

export async function getPurchaseIntent(campaignId: string): Promise<PurchaseIntentSummary> {
  const answers = await prisma.answer.findMany({
    where: {
      question: { campaignId, type: "PURCHASE_INTENT_1_5" },
      valueNumber: { not: null },
    },
    select: { valueNumber: true },
  });
  const distribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  let sum = 0;
  for (const a of answers) {
    const v = Math.round(a.valueNumber ?? 0);
    if (v >= 1 && v <= 5) distribution[String(v)]++;
    sum += a.valueNumber ?? 0;
  }
  return {
    responses: answers.length,
    averageScore: answers.length ? Number((sum / answers.length).toFixed(2)) : null,
    distribution,
  };
}

export async function getSatisfaction(campaignId: string) {
  const answers = await prisma.answer.findMany({
    where: {
      question: { campaignId, type: "RATING_1_5" },
      valueNumber: { not: null },
    },
    select: { valueNumber: true },
  });
  const sum = answers.reduce((acc, a) => acc + (a.valueNumber ?? 0), 0);
  return {
    responses: answers.length,
    averageScore: answers.length ? Number((sum / answers.length).toFixed(2)) : null,
  };
}

// Consumer voice — raw verbatims from free-text POST_TRIAL answers.
// No sentiment/theme algorithm is applied (Benchmark §17 user-directive:
// do not invent analytics methodology when the Benchmark does not define
// it). Verbatims are surfaced as-is with sample size stated alongside.
export async function getVerbatims(campaignId: string, limit = 50) {
  const answers = await prisma.answer.findMany({
    where: {
      question: { campaignId, stage: "POST_TRIAL", type: "TEXT" },
      valueText: { not: null },
    },
    select: { valueText: true, createdAt: true, question: { select: { text: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return answers
    .filter((a) => a.valueText && a.valueText.trim().length > 0)
    .map((a) => ({ question: a.question.text, response: a.valueText, at: a.createdAt }));
}

export interface EvidenceLevel {
  sampleSize: number;
  level: "ZERO_DATA" | "SMALL_SAMPLE" | "SUFFICIENT";
}

// Evidence discipline (Benchmark §6): sample size must be visible, small
// samples require cautious language, zero-data must remain honest. The
// n=20 threshold is an engineering default for "small sample" labeling —
// not a Benchmark-specified statistical threshold — and is reported as
// such rather than presented as a validated cutoff.
export function classifySample(n: number): EvidenceLevel {
  if (n === 0) return { sampleSize: n, level: "ZERO_DATA" };
  if (n < 20) return { sampleSize: n, level: "SMALL_SAMPLE" };
  return { sampleSize: n, level: "SUFFICIENT" };
}

export async function getCampaignQuestions(campaignId: string) {
  return prisma.question.findMany({ where: { campaignId }, orderBy: { order: "asc" } });
}

// Campaign-specific custom question aggregation (Benchmark §7 "campaign-
// specific questions"). Choice-type answers are tallied by option; rating
// and purchase-intent are handled by dedicated summaries above; text
// questions surface as verbatims.
export async function getQuestionAggregates(campaignId: string) {
  const questions = await prisma.question.findMany({
    where: { campaignId, type: { in: ["SINGLE_CHOICE", "MULTI_CHOICE"] } },
    orderBy: { order: "asc" },
  });
  const results = [];
  for (const q of questions) {
    const answers = await prisma.answer.findMany({
      where: { questionId: q.id },
      select: { valueOptions: true },
    });
    const options: { id: string; label: string }[] = q.options ? JSON.parse(q.options) : [];
    const tally: Record<string, number> = {};
    for (const o of options) tally[o.id] = 0;
    for (const a of answers) {
      if (!a.valueOptions) continue;
      const ids: string[] = JSON.parse(a.valueOptions);
      for (const id of ids) tally[id] = (tally[id] ?? 0) + 1;
    }
    results.push({
      questionId: q.id,
      text: q.text,
      stage: q.stage,
      responses: answers.length,
      breakdown: options.map((o) => ({ optionId: o.id, label: o.label, count: tally[o.id] ?? 0 })),
    });
  }
  return results;
}
