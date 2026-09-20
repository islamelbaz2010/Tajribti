// FOUNDER INNOVATION (OFD-03) — evidence-grounded bilingual narrative.
// NOT Benchmark-required; Benchmark §6 governs: observed evidence is
// separated from interpretation, nothing is fabricated.
//
// METHODOLOGY (binding, per spec docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_
// 2026-09-20.md §E): this is a DETERMINISTIC composition layer. Every
// sentence is a fixed template fed only by values already computed inside
// buildReport() — one fact per sentence, numbers copied verbatim, no causal
// connectives, no evaluative adjectives, no statistics beyond the source
// fields. Arabic sentences are hand-authored (not machine-translated) so
// the register stays honest. If a value does not exist in the report
// object, the sentence is not produced — the narrative can never say more
// than the evidence.
//
// What this deliberately is NOT: an LLM narrative, sentiment synthesis,
// theme summary, or recommendation writer. Those live (clearly labeled) in
// lib/intelligence.ts, or remain Founder-gated future decisions.

export interface ReportNarrativeInput {
  campaign: { name: string; status: string; startDate: Date; endDate: Date; company: string; product: string | null; studyType: string | null };
  evidence: { sampleSize: number; level: "ZERO_DATA" | "HAS_DATA" };
  funnel: { entered: number; eligible: number; ineligible: number; trialRedeemed: number; surveyComplete: number; dropped: number };
  purchaseIntent: { responses: number; averageScore: number | null; questionText: string | null };
  satisfaction: { responses: number; averageScore: number | null; questionText: string | null };
  consumerVoice: { question: string; response: string | null; at: Date }[];
}

export interface ReportNarrative {
  derivedNarrative: true;
  methodology: string;
  en: string[];
  ar: string[];
}

const METHODOLOGY_EN =
  "Deterministic evidence-grounded narrative: every sentence restates a value already computed in this report. No estimation, inference, causality, sentiment, or AI generation.";
const METHODOLOGY_AR =
  "سرد تنفيذي مولّد آلياً من الأدلة المسجلة فقط: كل جملة تعيد ذكر قيمة محسوبة في هذا التقرير. لا تقديرات ولا استنتاجات ولا ادعاءات سببية ولا تحليل مشاعر.";

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function buildNarrative(input: ReportNarrativeInput): ReportNarrative {
  const en: string[] = [];
  const ar: string[] = [];
  const { campaign: c, evidence, funnel, purchaseIntent, satisfaction, consumerVoice } = input;

  // --- Identity (always honest) --------------------------------------------
  en.push(
    `This report covers the campaign '${c.name}' run for ${c.company}${c.product ? ` on the product '${c.product}'` : ""}.`
  );
  ar.push(
    `يغطي هذا التقرير حملة '${c.name}' لصالح ${c.company}${c.product ? ` على المنتج '${c.product}'` : ""}.`
  );
  en.push(`The campaign ran from ${fmtDate(c.startDate)} to ${fmtDate(c.endDate)} and its current status is ${c.status}.`);
  ar.push(`امتدت الحملة من ${fmtDate(c.startDate)} إلى ${fmtDate(c.endDate)} وحالتها الحالية ${c.status}.`);

  // --- Sample / funnel ------------------------------------------------------
  if (evidence.level === "ZERO_DATA") {
    en.push("No completed post-trial survey responses have been recorded for this campaign yet; no findings can be drawn.");
    ar.push("لم يتم تسجيل أي استجابات استبيان مكتملة بعد التجربة لهذه الحملة حتى الآن؛ ولا يمكن استخلاص أي نتائج.");
    return { derivedNarrative: true, methodology: METHODOLOGY_EN, en, ar };
  }

  en.push(
    `${funnel.entered} participation(s) entered the campaign journey, ${funnel.trialRedeemed} reached trial redemption, and ${funnel.surveyComplete} completed the post-trial survey.`
  );
  ar.push(
    `دخلت ${funnel.entered} مشاركة في رحلة الحملة، ووصلت ${funnel.trialRedeemed} إلى مرحلة استلام المنتج، وأكملت ${funnel.surveyComplete} الاستبيان بعد التجربة.`
  );
  if (funnel.entered > 0) {
    const rate = Math.round((funnel.surveyComplete / funnel.entered) * 100);
    en.push(`The journey completion rate (entered to survey complete) is ${rate}%.`);
    ar.push(`معدل إكمال الرحلة (من الدخول إلى إكمال الاستبيان) هو ${rate}%.`);
  }
  // §6 small-sample caution — every non-zero sample, no invented threshold.
  en.push(
    `All results in this report are based on ${evidence.sampleSize} completed response(s) and should be treated as directional, not conclusive.`
  );
  ar.push(`جميع النتائج في هذا التقرير مبنية على ${evidence.sampleSize} استجابة مكتملة ويجب اعتبارها مؤشرات أولية وليست نتائج قاطعة.`);

  // --- Quantitative signals (only when measured) ----------------------------
  if (purchaseIntent.averageScore != null) {
    const label = purchaseIntent.questionText ? ` '${purchaseIntent.questionText}'` : "";
    en.push(
      `Average purchase intent${label} is ${purchaseIntent.averageScore} out of 5, based on ${purchaseIntent.responses} response(s).`
    );
    ar.push(
      `متوسط نية الشراء${label} هو ${purchaseIntent.averageScore} من 5، بناءً على ${purchaseIntent.responses} استجابة.`
    );
  }
  if (satisfaction.averageScore != null) {
    const label = satisfaction.questionText ? ` '${satisfaction.questionText}'` : "";
    en.push(
      `The average rating${label} is ${satisfaction.averageScore} out of 5, based on ${satisfaction.responses} response(s).`
    );
    ar.push(`متوسط التقييم${label} هو ${satisfaction.averageScore} من 5، بناءً على ${satisfaction.responses} استجابة.`);
  }

  // --- Consumer voice (volume only — no sentiment/theme claims) -------------
  if (consumerVoice.length > 0) {
    en.push(`${consumerVoice.length} open-text consumer response(s) are included verbatim in this report.`);
    ar.push(`يتضمن هذا التقرير ${consumerVoice.length} رداً نصياً مفتوحاً من المستهلكين منقولاً حرفياً.`);
  }

  return { derivedNarrative: true, methodology: METHODOLOGY_EN + " / " + METHODOLOGY_AR, en, ar };
}
