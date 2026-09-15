import { prisma } from "./prisma";
import {
  getFunnel,
  getSourceBreakdown,
  getPurchaseIntent,
  getSatisfaction,
  getVerbatims,
  getQuestionAggregates,
  classifySample,
} from "./measurement";

// FOUNDER-APPROVED — forensic audit 2026-09-15, Decision 2: "Findings =
// minimal deterministic descriptive promotion of already persisted
// choice/text evidence." Both helpers below read only fields
// getQuestionAggregates()/an equivalent text-count query already compute
// or could trivially compute — no new measurement, no new methodology,
// purely descriptive (mode + count / response count). See report.ts
// findings assembly below for how these are ordered into the report.

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// Ties are named explicitly rather than arbitrarily resolved to one
// option — silently picking one of several equally-common answers would
// misrepresent the evidence (Benchmark §6 evidence/interpretation
// separation). A question with zero responses, or whose respondents left
// every option unselected (an unanswered MULTI_CHOICE question is
// possible since `required` is not enforced at POST_TRIAL submission —
// see routes/consumer.ts), produces no finding rather than a fabricated
// "0 of N" statement.
function buildChoiceFindings(questionAggregates: { text: string; responses: number; breakdown: { label: string; count: number }[] }[]): string[] {
  const out: string[] = [];
  for (const q of questionAggregates) {
    if (q.responses === 0 || q.breakdown.length === 0) continue;
    const maxCount = Math.max(...q.breakdown.map((b) => b.count));
    if (maxCount === 0) continue;
    const topLabels = q.breakdown.filter((b) => b.count === maxCount).map((b) => b.label);
    if (topLabels.length === 1) {
      out.push(
        `The most common response to '${q.text}' was '${topLabels[0]}', selected by ${maxCount} of ${q.responses} respondent(s).`
      );
    } else {
      out.push(
        `The most common responses to '${q.text}' were ${joinWithAnd(topLabels.map((l) => `'${l}'`))}, each selected by ${maxCount} of ${q.responses} respondent(s).`
      );
    }
  }
  return out;
}

// Volume-only — no theme extraction, no sentiment (Benchmark §12/§22
// prohibition on inventing analysis methodology the Benchmark does not
// define). Counts non-empty POST_TRIAL TEXT answers per question, the
// same "not null and non-blank after trim" rule getVerbatims() already
// applies (measurement.ts) — computed locally here (not added to
// measurement.ts) since report.ts already has its own prisma import and
// this is a one-off grouped count, not a reusable aggregation.
async function getTextQuestionResponseCounts(campaignId: string): Promise<{ text: string; count: number }[]> {
  const questions = await prisma.question.findMany({
    where: { campaignId, stage: "POST_TRIAL", type: "TEXT" },
    orderBy: { order: "asc" },
    select: { text: true, answers: { select: { valueText: true } } },
  });
  return questions.map((q) => ({
    text: q.text,
    count: q.answers.filter((a) => a.valueText && a.valueText.trim().length > 0).length,
  }));
}

function buildTextFindings(textCounts: { text: string; count: number }[]): string[] {
  return textCounts
    .filter((t) => t.count > 0)
    .map((t) => `${t.count} open-text response(s) were recorded for '${t.text}'.`);
}

// Decision-ready report (Benchmark §7): Data -> Analysis -> Consumer Voice
// -> Insight -> Decision -> Recommendation. Every field is a real query
// against persisted data; no AI narrative is fabricated (user-directive
// §19: "AI is NOT allowed to become raw data truth"; §18: "All numeric
// values must come from real persisted evidence. Zero-data must remain
// honest. Small samples must remain appropriately cautious.").
export async function buildReport(campaignId: string) {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { company: true, product: true },
  });

  const [funnel, sources, purchaseIntent, satisfaction, verbatims, questionAggregates, textQuestionCounts] = await Promise.all([
    getFunnel(campaignId),
    getSourceBreakdown(campaignId),
    getPurchaseIntent(campaignId),
    getSatisfaction(campaignId),
    getVerbatims(campaignId),
    getQuestionAggregates(campaignId),
    getTextQuestionResponseCounts(campaignId),
  ]);

  const evidence = classifySample(funnel.surveyComplete);

  // Demographics: aggregated only from real Participation snapshots
  // (Benchmark §7 "demographics").
  const participations = await prisma.participation.findMany({
    where: { campaignId, status: { in: ["ELIGIBLE", "TRIAL_REDEEMED", "SURVEY_COMPLETE"] } },
    select: { ageAtEntry: true, genderAtEntry: true, cityAtEntry: true },
  });
  const genderCounts: Record<string, number> = {};
  const cityCounts: Record<string, number> = {};
  let ageSum = 0;
  let ageN = 0;
  for (const p of participations) {
    if (p.genderAtEntry) genderCounts[p.genderAtEntry] = (genderCounts[p.genderAtEntry] ?? 0) + 1;
    if (p.cityAtEntry) cityCounts[p.cityAtEntry] = (cityCounts[p.cityAtEntry] ?? 0) + 1;
    if (p.ageAtEntry != null) {
      ageSum += p.ageAtEntry;
      ageN++;
    }
  }
  const demographics = {
    sampleSize: participations.length,
    averageAge: ageN ? Number((ageSum / ageN).toFixed(1)) : null,
    genderBreakdown: genderCounts,
    cityBreakdown: cityCounts,
  };

  // Findings/recommendations: deterministic, evidence-triggered statements
  // only — never free-form generated text. Each rule cites the exact
  // number that produced it (traceable lineage, user-directive §16/§18).
  const findings: string[] = [];
  const recommendations: string[] = [];

  if (evidence.level === "ZERO_DATA") {
    findings.push("No completed post-trial survey responses have been recorded for this campaign yet.");
    recommendations.push("Do not draw conclusions until survey responses are collected.");
  } else {
    // Benchmark §6 requires cautious language for small samples but
    // defines no threshold for "small" — so this caution is applied to
    // every non-zero sample rather than inventing a cutoff (see
    // classifySample in lib/measurement.ts).
    findings.push(
      `${evidence.sampleSize} completed survey response(s) are available. Findings below should be treated as directional, not conclusive, until a Benchmark-defined sufficiency threshold exists.`
    );
    if (funnel.entered > 0) {
      const completionRate = Math.round((funnel.surveyComplete / funnel.entered) * 100);
      findings.push(`Journey completion rate (entered → survey complete) is ${completionRate}% (${funnel.surveyComplete}/${funnel.entered}).`);
    }
    if (purchaseIntent.averageScore != null) {
      findings.push(
        `Average purchase intent across ${purchaseIntent.responses} response(s) is ${purchaseIntent.averageScore}/5.`
      );
    }
    if (satisfaction.averageScore != null) {
      findings.push(`Average satisfaction rating across ${satisfaction.responses} response(s) is ${satisfaction.averageScore}/5.`);
    }
    // No threshold-triggered recommendation ("average >= 4 => strong",
    // "<= 2.5 => weak", etc.) is generated: Benchmark §7 requires a
    // "recommendations" evidence category to exist, but nowhere defines
    // a cutoff at which a purchase-intent/satisfaction average becomes
    // "strong," "weak," or actionable. A prior pass invented 4 and 2.5
    // as such cutoffs and prescribed launch/messaging advice from them —
    // that is fabricated scoring methodology (Benchmark §12/§22
    // prohibition on inventing thresholds), not a Benchmark requirement.
    // BLOCKED — BENCHMARK DOES NOT SPECIFY THE REQUIRED RECOMMENDATION
    // METHODOLOGY. The category is still populated honestly rather than
    // left silently empty:
    recommendations.push(
      "No Benchmark-defined threshold exists for turning purchase intent or satisfaction averages into a specific recommendation — review the reported figures and sample size directly."
    );
  }

  // Decision 2 (forensic audit 2026-09-15): promote already-persisted
  // choice/text evidence into descriptive findings, appended after the
  // sample-size/funnel/quantitative findings above (choice, then text —
  // the audit's own required ordering). Computed unconditionally rather
  // than only in the non-zero-data branch above: an ELIGIBILITY-stage
  // choice question (e.g. a screener) can already have real answers even
  // when zero POST_TRIAL surveys are complete yet, and that is honest
  // evidence, not fabrication — each helper already skips any question
  // with no real responses, so this adds nothing when there truly is no
  // data. This is the fix for the U&A study type in particular, whose
  // template has no RATING_1_5/PURCHASE_INTENT_1_5 question at all and
  // previously produced findings limited to the two lines above.
  findings.push(...buildChoiceFindings(questionAggregates));
  findings.push(...buildTextFindings(textQuestionCounts));

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      objective: campaign.objective,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      company: campaign.company.name,
      product: campaign.product?.name ?? null,
      // FOUNDER-APPROVED STRATEGIC DIFFERENTIATION (not Benchmark-
      // required) — a plain factual passthrough of the campaign's
      // optional study-template tag, if any. Does not change how any
      // figure below is computed.
      studyType: campaign.studyType ?? null,
    },
    evidence,
    funnel,
    sources,
    demographics,
    purchaseIntent,
    satisfaction,
    campaignSpecificQuestions: questionAggregates,
    consumerVoice: verbatims,
    findings,
    recommendations,
    methodology:
      "All figures are computed live from persisted participation, eligibility, redemption and survey-response records for this campaign. No figure is estimated, modeled, or AI-generated.",
    limitations: [
      "Purchase intent and satisfaction reflect self-reported survey responses only.",
      "The 1-5 scale for purchase intent and satisfaction is a platform characteristic, not a defined product standard; treat the reported average alongside its scale rather than as a validated index.",
      "Segment-level (audience-difference) breakdowns are limited to source/QR attribution and the demographic snapshot captured at eligibility; no additional segmentation is fabricated.",
      // No sample-sufficiency claim is made at any size — Benchmark §6
      // requires cautious language for small samples but never defines a
      // point at which a sample becomes statistically sufficient.
      "No statistical significance testing is applied, and no sample-size threshold for sufficiency is asserted; all figures should be read alongside the stated sample size.",
    ],
    generatedAt: new Date().toISOString(),
  };
}
