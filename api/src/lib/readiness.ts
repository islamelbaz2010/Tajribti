import { prisma } from "./prisma";

// Readiness (Benchmark §2.4 / user-directive §13): a guided
// Configure -> Review/Ready -> Launch distinction, based on
// Benchmark-supported campaign requirements only. No approval hierarchy,
// approval chain, or compliance engine is invented (user-directive §8).
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
