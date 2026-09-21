import { prisma } from "./prisma";
import { getFunnel, getPurchaseIntent, getSatisfaction, getQuestionAggregates } from "./measurement";
import { getTextQuestionResponseCounts } from "./report";

// Readiness. Benchmark §4 OPERATIONS names "Readiness" as an explicit
// capability node, and §2.4 (ExpertVoice reference) supports a general
// pre-launch review stage ("Preview/save-before-launch is part of the
// workflow") — so the *existence* of a readiness check is
// BENCHMARK-EXPLICIT. Its exact content is not: the Benchmark does not
// enumerate a checklist.
//
// A prior pass kept "product is linked" and "at least one post-trial
// question configured" here, reasoned from "Feedback/Product are campaign
// components" (§3/§5) plus an inference that the rest of the product
// (trial, insight, report) structurally needs them. That inference —
// "Feedback is a campaign component" therefore "launch must be blocked
// without a post-trial question" — is not a relationship the Benchmark
// actually states, and "structurally needs it" is exactly the kind of
// "necessary/unavoidable" reasoning that does not establish Product
// Truth. Both checks were REMOVED as NON-BENCHMARK PRODUCT BEHAVIOR
// (an invented launch-gating business rule), not preserved as
// technical-only — they gate the lifecycle, so they are product
// decisions, and no Benchmark passage authorizes them. Same reasoning
// already applied to the QR/source gate removed in a prior pass.
//
// What remains is only what the Benchmark evidence text directly
// supports or what is genuine data-validity with no interpretive
// content:
// - "objective is set": §3 states directly, as the Campaign-objective
//   capability's own definition, "Campaign has a clear purpose, not
//   only product/date fields" — BENCHMARK-DERIVABLE, not an inference
//   through an unrelated capability. (In practice this check can never
//   be false, since campaign creation already requires a non-empty
//   objective — it is reported as a confirmation, not an active gate.)
// - "dates: start before end": pure chronological validity with no
//   business threshold chosen (no minimum duration, no cutoff date) —
//   TECHNICAL-ONLY.
// - "at least one QR/source": an earlier pass removed this check as
//   Benchmark-unauthorized; FOUNDER DECISION FD-WEB-05 (2026-09-21)
//   explicitly re-authorizes it — "QR is mandatory for every Campaign",
//   and no campaign path may bypass the QR/source concept. A campaign
//   with zero sources cannot produce a scannable entry and must not
//   reach READY/ACTIVE.
//
// BLOCKED — BENCHMARK DOES NOT SPECIFY THE REQUIRED READINESS CHECKLIST
// beyond these items. No approval hierarchy, approval chain, or
// compliance engine is invented; the Benchmark does not describe one.
export interface ReadinessCheck {
  key: string;
  label: string;
  ok: boolean;
}

// FOUNDER-APPROVED — Feature A: Evidence Sufficiency Coach (optional
// extension beyond the Benchmark's mandatory requirements). Purely
// descriptive: reuses the exact same already-computed count primitives
// that populate the report's own funnel/purchase-intent/satisfaction/
// choice/text sections — no new measurement, no statistical calculation,
// no threshold, no "enough"/"insufficient" judgment. This field never
// participates in `ready` — it is visibility only, never a new blocking
// gate (same "no invented launch-gating business rule" discipline this
// file already applies to `checks` above).
async function getEvidenceCoverage(campaignId: string): Promise<string[]> {
  const [funnel, purchaseIntent, satisfaction, questionAggregates, textCounts] = await Promise.all([
    getFunnel(campaignId),
    getPurchaseIntent(campaignId),
    getSatisfaction(campaignId),
    getQuestionAggregates(campaignId),
    getTextQuestionResponseCounts(campaignId),
  ]);

  const coverage: string[] = [
    `${funnel.entered} participant(s) entered this campaign.`,
    `${funnel.eligible} participant(s) were eligible.`,
    `${funnel.trialRedeemed} trial redemption(s) recorded.`,
    `${funnel.surveyComplete} survey response(s) recorded.`,
    `${purchaseIntent.responses} purchase-intent response(s) recorded.`,
    `${satisfaction.responses} rating response(s) recorded.`,
  ];
  for (const q of questionAggregates) {
    coverage.push(`${q.responses} response(s) recorded for '${q.text}'.`);
  }
  for (const t of textCounts) {
    coverage.push(`${t.count} response(s) recorded for '${t.text}'.`);
  }
  return coverage;
}

export async function checkReadiness(campaignId: string): Promise<{
  ready: boolean;
  checks: ReadinessCheck[];
  evidenceCoverage: string[];
}> {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
  });

  // FD-WEB-05: QR/source presence is now a Founder-authorized readiness
  // check — see the header comment. Counted here (not via include) so the
  // campaign read stays light.
  const qrSourceCount = await prisma.qrSource.count({ where: { campaignId } });

  const checks: ReadinessCheck[] = [
    { key: "objective", label: "Campaign objective is set", ok: campaign.objective.trim().length > 0 },
    {
      key: "dates",
      label: "Start date is before end date",
      ok: campaign.startDate < campaign.endDate,
    },
    {
      key: "qr-source",
      label: "At least one QR/source is configured",
      ok: qrSourceCount > 0,
    },
  ];

  const evidenceCoverage = await getEvidenceCoverage(campaignId);

  return { ready: checks.every((c) => c.ok), checks, evidenceCoverage };
}
