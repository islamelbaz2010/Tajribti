import { prisma } from "./prisma";

// Readiness. The Benchmark (§2.4, via the ExpertVoice reference) supports
// a general guided pre-launch review stage ("Preview/save-before-launch
// is part of the workflow"; "Configure -> Review/Ready -> Launch/Active
// -> Monitor -> Complete") but does not enumerate the exact checklist
// items a campaign must satisfy before launch. The specific checks below
// are an engineering interpretation of that general requirement, not a
// one-to-one Benchmark specification — BENCHMARK-AMBIGUOUS at the item
// level. No approval hierarchy, approval chain, or compliance engine is
// invented; the Benchmark does not describe one.
export interface ReadinessCheck {
  key: string;
  label: string;
  ok: boolean;
}

export async function checkReadiness(campaignId: string): Promise<{
  ready: boolean;
  checks: ReadinessCheck[];
}> {
  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { questions: true, qrSources: true },
  });

  const checks: ReadinessCheck[] = [
    { key: "objective", label: "Campaign objective is set", ok: campaign.objective.trim().length > 0 },
    { key: "product", label: "Product is linked", ok: !!campaign.productId },
    {
      key: "dates",
      label: "Start date is before end date",
      ok: campaign.startDate < campaign.endDate,
    },
    {
      key: "postTrialSurvey",
      label: "At least one post-trial survey question is configured",
      ok: campaign.questions.some((q) => q.stage === "POST_TRIAL"),
    },
    {
      key: "qrSource",
      label: "At least one QR/source is configured",
      ok: campaign.qrSources.length > 0,
    },
  ];

  return { ready: checks.every((c) => c.ok), checks };
}
