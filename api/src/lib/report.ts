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

  const [funnel, sources, purchaseIntent, satisfaction, verbatims, questionAggregates] = await Promise.all([
    getFunnel(campaignId),
    getSourceBreakdown(campaignId),
    getPurchaseIntent(campaignId),
    getSatisfaction(campaignId),
    getVerbatims(campaignId),
    getQuestionAggregates(campaignId),
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
    if (purchaseIntent.averageScore != null) {
      findings.push(
        `Average purchase intent across ${purchaseIntent.responses} response(s) is ${purchaseIntent.averageScore}/5.`
      );
    }
    if (satisfaction.averageScore != null) {
      findings.push(`Average satisfaction rating across ${satisfaction.responses} response(s) is ${satisfaction.averageScore}/5.`);
    }
    if (funnel.entered > 0) {
      const completionRate = Math.round((funnel.surveyComplete / funnel.entered) * 100);
      findings.push(`Journey completion rate (entered → survey complete) is ${completionRate}% (${funnel.surveyComplete}/${funnel.entered}).`);
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
