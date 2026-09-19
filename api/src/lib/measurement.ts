import { prisma } from "./prisma";

// Evidence-grounded measurement (Benchmark §16 user-directive): every
// metric here has a real source query, a stated population, and a
// defensible denominator. No commercial metric or statistical claim is
// invented beyond what raw persisted Answers/Participations support.
//
// Cross-boundary discipline (Benchmark §10 campaign/company isolation):
// Answer and Participation rows join relations that are stored as
// independent foreign keys. Ingestion now guarantees those relations
// agree (routes/consumer.ts), but every query below additionally
// constrains BOTH sides of the join to the queried campaign — so a
// malformed row persisted before that enforcement (e.g. an Answer whose
// question belongs to campaign A while its participation belongs to
// campaign B) is excluded from BOTH campaigns' evidence rather than
// contaminating either.

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
    // participations.campaignId must match the source's campaign — a
    // malformed participation pointing at another campaign's source is
    // excluded from this campaign's source metrics.
    include: { participations: { where: { campaignId }, select: { status: true } } },
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

// Scale classification: BENCHMARK-AMBIGUOUS, not technical-only. §3
// requires purchase intent to exist as "a first-class insight signal"
// and §2.3 lists satisfaction as an insight category — those are
// BENCHMARK-EXPLICIT. The numeric range (1-5) is not: the Benchmark
// specifies no scale, and a prior pass called 1-5 an "unavoidable
// minimal technical choice" — that framing was itself wrong. The scale
// has real product meaning (what a consumer is offered as answer
// options; the "/5" a company reads in its report) and 1-5 is not
// established as Product Truth by anything in the Benchmark text. It is
// retained here only as existing technical infrastructure carrying an
// unresolved product characteristic — not represented as
// Benchmark-defined — because building an alternative (e.g. a
// per-question configurable range) would itself be inventing a new,
// equally unauthorized scale mechanism rather than resolving the
// ambiguity. See lib/report.ts for the corresponding disclosure shown
// to report readers. BLOCKED — BENCHMARK DOES NOT SPECIFY THE REQUIRED
// SCALE. No interpretive threshold is applied to the resulting average
// anywhere downstream (a prior pass had done so in lib/report.ts and it
// was removed as fabricated methodology); only the raw mean and
// per-response count are exposed.
export interface PurchaseIntentSummary {
  responses: number;
  averageScore: number | null;
  distribution: Record<string, number>; // "1".."5" -> count
  questionText: string | null;
}

// questionText: the Study-Type Intelligence layer (FOUNDER-APPROVED
// STRATEGIC DIFFERENTIATION — see governance/FOUNDER_DECISION_STRATEGIC_
// DIFFERENTIATION.md) deliberately creates RATING_1_5 questions that are
// not literally "satisfaction" for every study type (e.g. Concept/Launch
// Viability's "How different is this product from what you can already
// buy?", Packaging & Claims Reaction's claim-believability question).
// Labeling every such figure "Satisfaction" without showing what was
// actually asked would misrepresent the evidence — exactly what
// Benchmark §6 ("evidence must be separated from interpretation") warns
// against. Since campaign-wide aggregation only stays meaningful with at
// most one question of this type per campaign (see the apply-template
// guard in company.ts), the underlying question text can be shown
// unambiguously whenever exactly one exists; if a company has manually
// added more than one (the single-question POST route carries no such
// guard), there is no single text to attribute the blended average to, so
// this stays null and the UI falls back to its existing generic label —
// no new methodology, just honest labeling of what already exists.
async function singleQuestionText(campaignId: string, type: string): Promise<string | null> {
  const questions = await prisma.question.findMany({ where: { campaignId, type }, select: { text: true } });
  const distinct = Array.from(new Set(questions.map((q) => q.text)));
  return distinct.length === 1 ? distinct[0] : null;
}

export async function getPurchaseIntent(campaignId: string): Promise<PurchaseIntentSummary> {
  const answers = await prisma.answer.findMany({
    where: {
      question: { campaignId, type: "PURCHASE_INTENT_1_5" },
      participation: { campaignId },
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
    questionText: await singleQuestionText(campaignId, "PURCHASE_INTENT_1_5"),
  };
}

export async function getSatisfaction(campaignId: string) {
  const answers = await prisma.answer.findMany({
    where: {
      question: { campaignId, type: "RATING_1_5" },
      participation: { campaignId },
      valueNumber: { not: null },
    },
    select: { valueNumber: true },
  });
  const sum = answers.reduce((acc, a) => acc + (a.valueNumber ?? 0), 0);
  return {
    responses: answers.length,
    averageScore: answers.length ? Number((sum / answers.length).toFixed(2)) : null,
    questionText: await singleQuestionText(campaignId, "RATING_1_5"),
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
      participation: { campaignId },
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
  level: "ZERO_DATA" | "HAS_DATA";
}

// Evidence discipline (Benchmark §6): "sample size must be visible" and
// "small samples require appropriately cautious language" are the only
// two rules the Benchmark actually states here — it defines no numeric
// threshold for what counts as "small," and nowhere authorizes a claim
// that a sample has become statistically sufficient. A prior pass used
// n<20 as a "small sample" cutoff and labeled n>=20 "SUFFICIENT" — both
// are fabricated methodology (an invented threshold, and an invented
// statistical-adequacy claim §6 never grants). Removed. This function
// now does only what Benchmark actually requires: expose the real
// sample size, and distinguish "no data at all" (an honest, non-invented
// distinction) from "some data" — every non-zero sample is treated as
// requiring the same cautious, directional language, because Benchmark
// defines no point at which that caution should stop applying.
// BLOCKED — BENCHMARK DOES NOT SPECIFY THE REQUIRED SAMPLE-SUFFICIENCY
// THRESHOLD OR METHODOLOGY.
export function classifySample(n: number): EvidenceLevel {
  return { sampleSize: n, level: n === 0 ? "ZERO_DATA" : "HAS_DATA" };
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
      where: { questionId: q.id, participation: { campaignId } },
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
