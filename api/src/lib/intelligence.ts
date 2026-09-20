import { prisma } from "./prisma";

// ===========================================================================
// FOUNDER INNOVATION (OFD-06) — Advanced Intelligence layer.
// NOT Benchmark-required. Benchmark §6/§7 discipline is preserved: every
// output block is labeled `derived: true` with an explicit `methodology`
// string, and nothing here is presented as measured evidence.
//
// What this layer is allowed to be (per the Founder decision):
//   A. Advanced Segmentation — DESCRIPTIVE only (demographic groupings of
//      already-captured snapshots). Small-cell suppression at n<5 — the
//      threshold is OFD-15's mandated privacy control, not an invented
//      statistic.
//   B. Sentiment — transparent keyword-lexicon heuristic; per-verbatim label
//      is always traceable to the exact response text; no lexicon hit means
//      "neutral" — never guessed.
//   C. Automated Themes — keyword-frequency themes: the theme IS the observed
//      term, with count + traceable sample responses. No abstract theme
//      naming, no clustering.
//   D. Predictive/Statistical — descriptive statistics only: Wilson score
//      95% intervals on observed proportions. NO prediction model exists —
//      implementing one without a defensible methodology would violate the
//      Founder guardrail, so prediction is documented as a future decision.
// ===========================================================================

const MIN_CELL = 5; // OFD-15 small-cell privacy protection (documented threshold)

const AGE_BANDS: [number, number, string][] = [
  [18, 24, "18-24"],
  [25, 34, "25-34"],
  [35, 44, "35-44"],
  [45, 54, "45-54"],
  [55, 200, "55+"],
];

function ageBand(age: number | null): string | null {
  if (age == null) return null;
  for (const [lo, hi, label] of AGE_BANDS) if (age >= lo && age <= hi) return label;
  return age < 18 ? "under-18" : null;
}

// --- B. Lexicon sentiment ---------------------------------------------------
// Small transparent EN/AR lexicons. Versioned here so the methodology is
// auditable: bump LEXICON_VERSION whenever the lists change.
export const LEXICON_VERSION = "1.0";
const POSITIVE = [
  "good", "great", "excellent", "love", "loved", "amazing", "nice", "best", "perfect", "delicious", "fresh", "smooth", "recommend",
  "جميل", "رائع", "ممتاز", "عجبني", "حلو", "طعمه", "ممتازة", "كويس", "تحفة", "لذيذ", "ممتاز",
];
const NEGATIVE = [
  "bad", "terrible", "awful", "hate", "hated", "worst", "poor", "disappointed", "disappointing", "weak", "stale",
  "وحش", "سيء", "سيئة", "مش", "معجبنيش", "وحشة", "ضعيف", "زفت", "مش حلو", "مش عاجبني",
];

export type SentimentLabel = "positive" | "negative" | "neutral";

export function labelSentiment(text: string): SentimentLabel {
  const t = ` ${text.toLowerCase()} `;
  const pos = POSITIVE.some((w) => t.includes(w));
  const neg = NEGATIVE.some((w) => t.includes(w));
  if (pos && !neg) return "positive";
  if (neg && !pos) return "negative";
  return "neutral"; // both or neither — never forced
}

// --- C. Keyword themes ------------------------------------------------------
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "is", "it", "was", "for", "on", "with", "i", "this", "that", "very", "not", "its",
  "في", "من", "على", "أن", "إن", "هذا", "هذه", "كان", "كانت", "ما", "لا", "لم", "أو", "ثم", "كل", "بعد", "قبل", "عن", "مع", "ده", "دي",
]);

export interface Theme {
  term: string;
  count: number;
  questionText: string;
  sampleResponses: string[]; // traceable excerpts — the evidence behind the count
}

function extractThemes(answers: { text: string; questionText: string }[], topN = 10): Theme[] {
  const freq = new Map<string, { count: number; questionText: string; samples: string[] }>();
  for (const a of answers) {
    const words = a.text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
    const seen = new Set<string>();
    for (const w of words) {
      if (seen.has(w)) continue; // one mention per response per term
      seen.add(w);
      const cur = freq.get(w) ?? { count: 0, questionText: a.questionText, samples: [] };
      cur.count++;
      if (cur.samples.length < 3) cur.samples.push(a.text.slice(0, 160));
      freq.set(w, cur);
    }
  }
  return Array.from(freq.entries())
    .map(([term, v]) => ({ term, count: v.count, questionText: v.questionText, sampleResponses: v.samples }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

// --- D. Wilson score interval (standard, named methodology) ------------------
export function wilsonInterval(successes: number, n: number): { low: number; high: number } | null {
  if (n === 0) return null;
  const z = 1.96;
  const p = successes / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const margin = (z / denom) * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return { low: Number(Math.max(0, center - margin).toFixed(3)), high: Number(Math.min(1, center + margin).toFixed(3)) };
}

// --- A. Age-band segmentation (descriptive) ----------------------------------
async function getAgeBandSegments(campaignId: string) {
  const answers = await prisma.answer.findMany({
    where: {
      question: { campaignId, type: { in: ["PURCHASE_INTENT_1_5", "RATING_1_5"] } },
      participation: { campaignId },
      valueNumber: { not: null },
    },
    select: { valueNumber: true, question: { select: { type: true } }, participation: { select: { ageAtEntry: true } } },
  });
  const byBand = new Map<string, { piSum: number; piN: number; rSum: number; rN: number }>();
  for (const a of answers) {
    const band = ageBand(a.participation.ageAtEntry);
    if (!band) continue;
    const cur = byBand.get(band) ?? { piSum: 0, piN: 0, rSum: 0, rN: 0 };
    if (a.question.type === "PURCHASE_INTENT_1_5") { cur.piSum += a.valueNumber ?? 0; cur.piN++; }
    else { cur.rSum += a.valueNumber ?? 0; cur.rN++; }
    byBand.set(band, cur);
  }
  return Array.from(byBand.entries()).map(([band, v]) => {
    const n = Math.max(v.piN, v.rN);
    if (n < MIN_CELL) return { band, suppressed: true as const, n };
    return {
      band,
      suppressed: false as const,
      n,
      purchaseIntentAvg: v.piN ? Number((v.piSum / v.piN).toFixed(2)) : null,
      ratingAvg: v.rN ? Number((v.rSum / v.rN).toFixed(2)) : null,
    };
  });
}

export async function buildIntelligence(campaignId: string) {
  const textAnswers = await prisma.answer.findMany({
    where: { question: { campaignId, stage: "POST_TRIAL", type: "TEXT" }, participation: { campaignId }, valueText: { not: null } },
    select: { valueText: true, question: { select: { text: true } } },
  });
  const texts = textAnswers
    .filter((a) => a.valueText && a.valueText.trim().length > 0)
    .map((a) => ({ text: a.valueText as string, questionText: a.question.text }));

  const sentiments = texts.map((t) => ({ questionText: t.questionText, response: t.text.slice(0, 200), label: labelSentiment(t.text) }));
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
  for (const s of sentiments) sentimentCounts[s.label]++;

  const themes = extractThemes(texts);

  // Wilson intervals on choice-question proportions (descriptive uncertainty)
  const choiceQuestions = await prisma.question.findMany({
    where: { campaignId, type: { in: ["SINGLE_CHOICE", "MULTI_CHOICE"] } },
    orderBy: { order: "asc" },
    select: { id: true, text: true, options: true },
  });
  const proportions = [];
  for (const q of choiceQuestions) {
    const options: { id: string; label: string }[] = q.options ? JSON.parse(q.options) : [];
    const answers = await prisma.answer.findMany({
      where: { questionId: q.id, participation: { campaignId }, valueOptions: { not: null } },
      select: { valueOptions: true },
    });
    const n = answers.length;
    const tally: Record<string, number> = {};
    for (const a of answers) for (const id of JSON.parse(a.valueOptions as string)) tally[id] = (tally[id] ?? 0) + 1;
    proportions.push({
      questionId: q.id,
      text: q.text,
      responses: n,
      options: options.map((o) => ({
        label: o.label,
        count: tally[o.id] ?? 0,
        proportion: n ? Number(((tally[o.id] ?? 0) / n).toFixed(3)) : null,
        wilson95: wilsonInterval(tally[o.id] ?? 0, n),
      })),
    });
  }

  return {
    campaignId,
    derived: true,
    methodology: {
      segmentation: "Descriptive grouping by eligibility-time demographic snapshot (age bands; gender/city live in report audienceDifferences). Cells with n<5 suppressed (OFD-15 privacy rule). No clustering or inference.",
      sentiment: `Keyword-lexicon heuristic v${LEXICON_VERSION} (EN/AR word lists in code). Per-response label traceable to the verbatim. Not a validated sentiment model.`,
      themes: "Keyword frequency: each theme is an observed term with its count and traceable sample responses. No abstract theme naming.",
      statistics: "Descriptive only. Wilson score 95% intervals on observed proportions. No prediction model is implemented (no defensible methodology exists yet); no significance tests between segments.",
    },
    segmentation: { ageBands: await getAgeBandSegments(campaignId) },
    sentiment: { counts: sentimentCounts, perResponse: sentiments.slice(0, 50), lexiconVersion: LEXICON_VERSION },
    themes,
    statistics: { proportions },
  };
}
