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
// Exported (not just for report.ts's own use) — Feature A (Evidence
// Sufficiency Coach, Founder-approved optional extension) reuses this
// exact same per-question count in api/src/lib/readiness.ts rather than
// duplicating the query; no behavior change to the function itself.
export async function getTextQuestionResponseCounts(campaignId: string): Promise<{ text: string; count: number }[]> {
  const questions = await prisma.question.findMany({
    where: { campaignId, stage: "POST_TRIAL", type: "TEXT" },
    orderBy: { order: "asc" },
    // answers.participation must belong to the same campaign — see the
    // cross-boundary discipline note in lib/measurement.ts.
    select: { text: true, answers: { where: { participation: { campaignId } }, select: { valueText: true } } },
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

// FOUNDER-APPROVED — G1-B Evidence-Grounded Recommendation Methodology
// (forensic closure pass, final report). Every recommendation here is
// downstream of an already-computed Finding — no new measurement, no
// evaluative language ("high/low/strong/weak/good/bad/launch/expand/
// discontinue"), no threshold, no statistical inference, no sentiment or
// theme inference. Each category states only that specific evidence
// exists and directs a bounded procedural next step (treat as one input,
// validate before generalizing, review together before concluding,
// review verbatims before finalizing) — never a verdict on the evidence
// itself. Fixed emission order: ZERO_DATA -> joint PI/rating (or
// whichever alone exists) -> choice -> text, matching the Findings
// ordering above.
function buildChoiceRecommendations(questionAggregates: { text: string; responses: number; breakdown: { label: string; count: number }[] }[]): string[] {
  const out: string[] = [];
  for (const q of questionAggregates) {
    if (q.responses === 0 || q.breakdown.length === 0) continue;
    const maxCount = Math.max(...q.breakdown.map((b) => b.count));
    if (maxCount === 0) continue;
    const topLabels = q.breakdown.filter((b) => b.count === maxCount).map((b) => b.label);
    if (topLabels.length === 1) {
      out.push(
        `The most common response to '${q.text}' was '${topLabels[0]}' (${maxCount} of ${q.responses} respondent(s)). Treat this as a sample-specific signal and validate it with further evidence before drawing any broader-market conclusion.`
      );
    } else {
      out.push(
        `The most common responses to '${q.text}' were ${joinWithAnd(topLabels.map((l) => `'${l}'`))}, each selected by ${maxCount} of ${q.responses} respondent(s). Treat this as a sample-specific signal and validate it with further evidence before drawing any broader-market conclusion.`
      );
    }
  }
  return out;
}

function buildTextRecommendations(textCounts: { text: string; count: number }[]): string[] {
  return textCounts
    .filter((t) => t.count > 0)
    .map(
      (t) =>
        `${t.count} open-text response(s) were recorded for '${t.text}'. Review these responses directly before finalizing any decision that depends on this qualitative context.`
    );
}

// FOUNDER-APPROVED — Feature E: Segment-Conditioned Evidence (Gender/City
// only). Optional extension beyond the Benchmark's mandatory requirements
// — Benchmark §3 ("Meaningful audience differences can be examined when
// data supports them") and §7 ("Segment-level outputs must only be shown
// when the backend actually supports the required aggregation") *permit*
// this; neither requires it nor defines its mechanism. Reuses the exact
// same aggregate logic already used campaign-wide above (average;
// deterministic mode with all ties named) scoped to participations
// sharing an already-captured demographic value (Benchmark §7
// "demographics" snapshot) — no new measurement, no age segmentation, no
// bins, no significance testing, no causal claim. Every non-empty cell is
// shown regardless of size (Founder-approved: no minimum-N threshold is
// invented). A participation with no value for a dimension is skipped —
// the same convention the campaign-wide demographics aggregation above
// already uses (no "Unknown" bucket is fabricated).
type SegmentDimension = "genderAtEntry" | "cityAtEntry";

async function getSegmentedEvidence(
  campaignId: string,
  piQuestionText: string | null,
  ratingQuestionText: string | null
): Promise<{
  gender: { segmentValue: string; sentences: string[] }[];
  city: { segmentValue: string; sentences: string[] }[];
}> {
  const piAnswers = await prisma.answer.findMany({
    where: { question: { campaignId, type: "PURCHASE_INTENT_1_5" }, participation: { campaignId }, valueNumber: { not: null } },
    select: { valueNumber: true, participation: { select: { genderAtEntry: true, cityAtEntry: true } } },
  });
  const ratingAnswers = await prisma.answer.findMany({
    where: { question: { campaignId, type: "RATING_1_5" }, participation: { campaignId }, valueNumber: { not: null } },
    select: { valueNumber: true, participation: { select: { genderAtEntry: true, cityAtEntry: true } } },
  });
  const choiceQuestions = await prisma.question.findMany({
    where: { campaignId, type: { in: ["SINGLE_CHOICE", "MULTI_CHOICE"] } },
    orderBy: { order: "asc" },
  });
  const choiceAnswers = await Promise.all(
    choiceQuestions.map((q) =>
      prisma.answer.findMany({
        where: { questionId: q.id, participation: { campaignId } },
        select: { valueOptions: true, participation: { select: { genderAtEntry: true, cityAtEntry: true } } },
      })
    )
  );

  function buildForDimension(dimension: SegmentDimension) {
    const sentencesBySegment = new Map<string, string[]>();
    const addSentence = (seg: string | null, sentence: string) => {
      if (!seg) return; // no value for this dimension -> skipped, never fabricated as "Unknown"
      if (!sentencesBySegment.has(seg)) sentencesBySegment.set(seg, []);
      sentencesBySegment.get(seg)!.push(sentence);
    };

    const piBySeg = new Map<string, { sum: number; n: number }>();
    for (const a of piAnswers) {
      const seg = a.participation[dimension];
      if (!seg) continue;
      const cur = piBySeg.get(seg) ?? { sum: 0, n: 0 };
      cur.sum += a.valueNumber ?? 0;
      cur.n += 1;
      piBySeg.set(seg, cur);
    }
    for (const [seg, { sum, n }] of piBySeg) {
      const avg = Number((sum / n).toFixed(2));
      addSentence(
        seg,
        `Among ${seg} respondents (n=${n}), average purchase intent${piQuestionText ? ` for '${piQuestionText}'` : ""} was ${avg}/5.`
      );
    }

    const ratingBySeg = new Map<string, { sum: number; n: number }>();
    for (const a of ratingAnswers) {
      const seg = a.participation[dimension];
      if (!seg) continue;
      const cur = ratingBySeg.get(seg) ?? { sum: 0, n: 0 };
      cur.sum += a.valueNumber ?? 0;
      cur.n += 1;
      ratingBySeg.set(seg, cur);
    }
    for (const [seg, { sum, n }] of ratingBySeg) {
      const avg = Number((sum / n).toFixed(2));
      addSentence(
        seg,
        `Among ${seg} respondents (n=${n}), the average rating${ratingQuestionText ? ` for '${ratingQuestionText}'` : ""} was ${avg}/5.`
      );
    }

    choiceQuestions.forEach((q, i) => {
      const options: { id: string; label: string }[] = q.options ? JSON.parse(q.options) : [];
      const answers = choiceAnswers[i];
      const tallyBySeg = new Map<string, Record<string, number>>();
      const countBySeg = new Map<string, number>();
      for (const a of answers) {
        const seg = a.participation[dimension];
        if (!seg || !a.valueOptions) continue;
        const ids: string[] = JSON.parse(a.valueOptions);
        const tally = tallyBySeg.get(seg) ?? {};
        for (const id of ids) tally[id] = (tally[id] ?? 0) + 1;
        tallyBySeg.set(seg, tally);
        countBySeg.set(seg, (countBySeg.get(seg) ?? 0) + 1);
      }
      for (const [seg, tally] of tallyBySeg) {
        const n = countBySeg.get(seg) ?? 0;
        if (n === 0) continue;
        const counts = options.map((o) => ({ label: o.label, count: tally[o.id] ?? 0 }));
        const maxCount = Math.max(...counts.map((c) => c.count));
        if (maxCount === 0) continue;
        const top = counts.filter((c) => c.count === maxCount).map((c) => c.label);
        if (top.length === 1) {
          addSentence(seg, `Among ${seg} respondents (n=${n}), the most common response to '${q.text}' was '${top[0]}' (${maxCount} of ${n}).`);
        } else {
          addSentence(
            seg,
            `Among ${seg} respondents (n=${n}), the most common responses to '${q.text}' were ${joinWithAnd(
              top.map((l) => `'${l}'`)
            )}, each selected by ${maxCount} of ${n}.`
          );
        }
      }
    });

    return Array.from(sentencesBySegment.entries()).map(([segmentValue, sentences]) => ({ segmentValue, sentences }));
  }

  return { gender: buildForDimension("genderAtEntry"), city: buildForDimension("cityAtEntry") };
}

function buildRecommendations(
  evidenceLevel: "ZERO_DATA" | "HAS_DATA",
  purchaseIntent: { averageScore: number | null; responses: number },
  satisfaction: { averageScore: number | null; responses: number; questionText: string | null },
  questionAggregates: { text: string; responses: number; breakdown: { label: string; count: number }[] }[],
  textCounts: { text: string; count: number }[]
): string[] {
  if (evidenceLevel === "ZERO_DATA") {
    return ["Do not draw conclusions until survey responses are collected."];
  }

  const recommendations: string[] = [];
  const hasPI = purchaseIntent.averageScore != null;
  const hasRating = satisfaction.averageScore != null;

  // Joint PI/rating supersedes the two standalone categories whenever
  // both exist — a single, weighting-free juxtaposition rather than two
  // un-cross-referenced lines. Deliberately asserts nothing about
  // relative importance, agreement, or disagreement between the two
  // figures (a prior draft's "equal weight" / "neither more important"
  // language was itself an unsupported weighting claim and was removed).
  if (hasPI && hasRating) {
    const ratingLabel = satisfaction.questionText ? `the product-experience rating for '${satisfaction.questionText}'` : "the product-experience rating";
    recommendations.push(
      `Purchase intent (${purchaseIntent.averageScore}/5 across ${purchaseIntent.responses} response(s)) and ${ratingLabel} (${satisfaction.averageScore}/5 across ${satisfaction.responses} response(s)) were both measured for this campaign. Review both results together before drawing any conclusion.`
    );
  } else if (hasPI) {
    recommendations.push(
      `The observed purchase-intent result (${purchaseIntent.averageScore}/5 across ${purchaseIntent.responses} response(s)) should be treated as one input, alongside the sample size, to the next commercial decision — not as a standalone conclusion.`
    );
  } else if (hasRating) {
    const ratingSubject = satisfaction.questionText ? `result for '${satisfaction.questionText}'` : "product-experience rating result";
    recommendations.push(
      `The observed ${ratingSubject} (${satisfaction.averageScore}/5 across ${satisfaction.responses} response(s)) should be treated as one input, alongside the sample size, to the next product decision — not as a standalone conclusion.`
    );
  }

  recommendations.push(...buildChoiceRecommendations(questionAggregates));
  recommendations.push(...buildTextRecommendations(textCounts));

  return recommendations;
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

  // Findings: deterministic, evidence-triggered statements only — never
  // free-form generated text. Each rule cites the exact number that
  // produced it (traceable lineage, user-directive §16/§18).
  const findings: string[] = [];

  if (evidence.level === "ZERO_DATA") {
    findings.push("No completed post-trial survey responses have been recorded for this campaign yet.");
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

  // G1-B (forensic closure pass): recommendations are computed
  // separately from findings, using the exact same underlying evidence —
  // see buildRecommendations() above for the full methodology and its
  // fixed emission order (zero-data -> joint PI/rating (or whichever
  // alone exists) -> choice -> text).
  const recommendations = buildRecommendations(evidence.level, purchaseIntent, satisfaction, questionAggregates, textQuestionCounts);

  // Feature E (Founder-approved optional extension, not Benchmark-
  // required): Gender/City-conditioned evidence. See getSegmentedEvidence()
  // above for the full methodology.
  const segmentedEvidence = await getSegmentedEvidence(campaignId, purchaseIntent.questionText, satisfaction.questionText);

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
    // Feature E (Founder-approved optional extension): every figure below
    // should be read alongside its own stated n and treated as
    // directional, not conclusive — no minimum sample size is asserted,
    // reusing the exact same caution idiom already applied to `findings`
    // above rather than inventing a new one.
    audienceDifferences: {
      note: "Every figure below should be read alongside its own stated sample size (n) and treated as directional, not conclusive — no minimum sample size is asserted.",
      gender: segmentedEvidence.gender,
      city: segmentedEvidence.city,
    },
    methodology:
      "All figures are computed live from persisted participation, eligibility, redemption and survey-response records for this campaign. No figure is estimated, modeled, or AI-generated.",
    limitations: [
      "Purchase intent and satisfaction reflect self-reported survey responses only.",
      "The 1-5 scale for purchase intent and satisfaction is a platform characteristic, not a defined product standard; treat the reported average alongside its scale rather than as a validated index.",
      // Updated for Feature E: this previously stated no additional
      // segmentation existed beyond source/QR and the raw demographic
      // snapshot — that is no longer accurate now that gender/city-
      // conditioned evidence exists (see audienceDifferences above), so
      // the boundary is restated precisely rather than left stale.
      "Gender/city-conditioned evidence (where shown) reflects only the demographic snapshot captured at eligibility; no age-based, cross-campaign, or predictive segmentation is fabricated, and no statistical comparison between segments is applied.",
      // No sample-sufficiency claim is made at any size — Benchmark §6
      // requires cautious language for small samples but never defines a
      // point at which a sample becomes statistically sufficient.
      "No statistical significance testing is applied, and no sample-size threshold for sufficiency is asserted; all figures should be read alongside the stated sample size.",
    ],
    generatedAt: new Date().toISOString(),
  };
}
