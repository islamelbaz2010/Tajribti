import { prisma } from "./prisma";
import { getFunnel } from "./measurement";

// FOUNDER-AUTHORIZED COMMERCIAL ARCHITECTURE (commercial closure
// 2026-09-24 + Model A company agreement pass). This module is intentionally
// narrow: it represents the approved Essential / Standard / Professional /
// Custom service packages, one governing company agreement, and campaign-level
// quote-readiness state. It does not implement a billing engine, subscription,
// renewal, entitlement framework, payment gateway, tax calculation, legal
// signature flow, or contract workflow.

export const COMMERCIAL_PACKAGE_TIERS = ["ESSENTIAL", "STANDARD", "PROFESSIONAL", "CUSTOM"] as const;
export type CommercialPackageTier = (typeof COMMERCIAL_PACKAGE_TIERS)[number];

export const FULFILLMENT_MODELS = ["POINT_OF_TRIAL", "HOME_DELIVERY"] as const;
export type FulfillmentModel = (typeof FULFILLMENT_MODELS)[number];

export const COMMERCIAL_PAYMENT_STATUSES = [
  "QUOTE_DRAFT",
  "QUOTED",
  "AWAITING_BANK_TRANSFER",
  "PAID_CONFIRMED",
] as const;
export type CommercialPaymentStatus = (typeof COMMERCIAL_PAYMENT_STATUSES)[number];

export const COMMERCIAL_AGREEMENT_STATUSES = ["DRAFT", "CONFIGURED", "QUOTED", "READY"] as const;
export type CommercialAgreementStatus = (typeof COMMERCIAL_AGREEMENT_STATUSES)[number];

export const CONTRACTED_PARTICIPANT_BASES = ["PER_CAMPAIGN_SCOPE", "TOTAL_PROGRAM_PARTICIPANTS"] as const;
export type ContractedParticipantBasis = (typeof CONTRACTED_PARTICIPANT_BASES)[number];

export const CUSTOM_SCOPE_MINIMUM_PARTICIPANTS = 250;
export const MAX_DISCOUNT_PERCENT = 20;

export interface CommercialTermsLike {
  packageTier: string;
  contractedParticipants: number | null;
  fulfillmentModel: string;
  scopeNote: string | null;
  quotedStudyFeeEgp: number | null;
  quotedParticipantRateEgp: number | null;
  quotedHomeDeliveryFeeEgp: number | null;
  discountPercent: number;
  discountBasis: string | null;
  paymentMethod: string;
  paymentStatus: string;
  updatedAt?: Date;
  updatedById?: string | null;
  commercialAgreementId?: string | null;
}

export interface CompanyCommercialAgreementLike {
  packageTier: string;
  contractedParticipantBasis: string;
  contractedParticipants: number | null;
  fulfillmentModel: string;
  contractReference: string | null;
  scopeNote: string | null;
  quotedStudyFeeEgp: number | null;
  quotedParticipantRateEgp: number | null;
  quotedHomeDeliveryFeeEgp: number | null;
  discountPercent: number;
  discountBasis: string | null;
  paymentMethod: string;
  paymentStatus: string;
  agreementStatus: string;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  readyAt?: Date | null;
  updatedAt?: Date;
  updatedById?: string | null;
}

export const DEFAULT_COMMERCIAL_TERMS: CommercialTermsLike = {
  packageTier: "ESSENTIAL",
  contractedParticipants: null,
  fulfillmentModel: "POINT_OF_TRIAL",
  scopeNote: null,
  quotedStudyFeeEgp: null,
  quotedParticipantRateEgp: null,
  quotedHomeDeliveryFeeEgp: null,
  discountPercent: 0,
  discountBasis: null,
  paymentMethod: "MANUAL_BANK_TRANSFER",
  paymentStatus: "QUOTE_DRAFT",
};

export const DEFAULT_COMPANY_COMMERCIAL_AGREEMENT: CompanyCommercialAgreementLike = {
  packageTier: "ESSENTIAL",
  contractedParticipantBasis: "PER_CAMPAIGN_SCOPE",
  contractedParticipants: null,
  fulfillmentModel: "POINT_OF_TRIAL",
  contractReference: null,
  scopeNote: null,
  quotedStudyFeeEgp: null,
  quotedParticipantRateEgp: null,
  quotedHomeDeliveryFeeEgp: null,
  discountPercent: 0,
  discountBasis: null,
  paymentMethod: "MANUAL_BANK_TRANSFER",
  paymentStatus: "QUOTE_DRAFT",
  agreementStatus: "DRAFT",
  effectiveFrom: null,
  effectiveTo: null,
};

export interface CommercialPackageLike {
  id: string;
  tier: string;
  name: string;
  description: string;
  deliverables: string;
  serviceNote: string | null;
  defaultStudyFeeEgp: number | null;
  defaultParticipantRateEgp: number | null;
  defaultHomeDeliveryFeeEgp: number | null;
  minimumParticipants: number | null;
  maximumParticipants: number | null;
  defaultFulfillmentModel: string;
  turnaroundLabel: string | null;
  active: boolean;
  displayOrder: number;
  internalNote: string | null;
  updatedAt: Date;
  updatedById: string | null;
}

export function commercialPackageResponse(pkg: CommercialPackageLike, updatedByName: string | null = null) {
  let deliverables: string[] = [];
  try {
    const parsed = JSON.parse(pkg.deliverables);
    if (Array.isArray(parsed)) deliverables = parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    deliverables = [];
  }
  return {
    id: pkg.id,
    tier: pkg.tier,
    name: pkg.name,
    description: pkg.description,
    deliverables,
    serviceNote: pkg.serviceNote,
    defaultStudyFeeEgp: pkg.defaultStudyFeeEgp,
    defaultParticipantRateEgp: pkg.defaultParticipantRateEgp,
    defaultHomeDeliveryFeeEgp: pkg.defaultHomeDeliveryFeeEgp,
    minimumParticipants: pkg.minimumParticipants,
    maximumParticipants: pkg.maximumParticipants,
    defaultFulfillmentModel: pkg.defaultFulfillmentModel,
    fulfillmentLabel: pkg.defaultFulfillmentModel === "HOME_DELIVERY" ? "Home Delivery" : "Point-of-Trial",
    turnaroundLabel: pkg.turnaroundLabel,
    active: pkg.active,
    status: pkg.active ? "ACTIVE" : "INACTIVE",
    displayOrder: pkg.displayOrder,
    internalNote: pkg.internalNote,
    updatedAt: pkg.updatedAt,
    updatedById: pkg.updatedById,
    updatedByName,
    semantics: packageCapabilities(pkg.tier),
  };
}

export async function buildCommercialPackageCatalog() {
  const packages = await prisma.commercialPackage.findMany({ orderBy: [{ displayOrder: "asc" }, { tier: "asc" }] });
  const updaterIds = [...new Set(packages.map((p) => p.updatedById).filter((id): id is string => Boolean(id)))];
  const updaters = updaterIds.length
    ? await prisma.opsUser.findMany({ where: { id: { in: updaterIds } }, select: { id: true, name: true } })
    : [];
  const updaterById = new Map(updaters.map((u) => [u.id, u.name]));
  return packages.map((p) => commercialPackageResponse(p, p.updatedById ? updaterById.get(p.updatedById) ?? null : null));
}

export async function assertCommercialPackageSelectable(tier: string) {
  const pkg = await prisma.commercialPackage.findUnique({ where: { tier } });
  if (!pkg) return "Unknown commercial package";
  if (!pkg.active) return `${pkg.name} is inactive in the commercial package catalog`;
  return null;
}

export function packageCapabilities(packageTier: string) {
  const enhancedReport = packageTier === "STANDARD" || packageTier === "PROFESSIONAL" || packageTier === "CUSTOM";
  return {
    coreReport: true,
    enhancedReport,
    distributionsAndCharts: enhancedReport,
    evidenceCoverage: enhancedReport,
    analystSummary: packageTier === "STANDARD" || packageTier === "PROFESSIONAL",
    humanReadout: packageTier === "PROFESSIONAL",
    customStatementOfWork: packageTier === "CUSTOM",
  };
}

// Package entitlement is enforced on every customer-facing computed
// insight surface, not just the printable report shell. The internal
// measurement helpers may carry deterministic distribution data; these
// sanitizers remove the Standard+ presentation fields for Essential.
export function metricForPackage<T extends { distribution?: unknown; distributionItems?: unknown }>(metric: T, packageTier: string): T {
  if (packageCapabilities(packageTier).enhancedReport) return metric;
  return { ...metric, distribution: null, distributionItems: null };
}

export function questionAggregatesForPackage<T extends { percentBasis?: string | null; breakdown: { percentage?: number }[] }>(
  aggregates: T[],
  packageTier: string
) {
  if (packageCapabilities(packageTier).enhancedReport) return aggregates;
  return aggregates.map((q) => ({
    ...q,
    percentBasis: null,
    breakdown: q.breakdown.map(({ percentage: _percentage, ...b }) => b),
  }));
}

export function validateCommercialTerms(d: CommercialTermsLike): string | null {
  if (!COMMERCIAL_PACKAGE_TIERS.includes(d.packageTier as CommercialPackageTier)) return "Unknown commercial package";
  if (!FULFILLMENT_MODELS.includes(d.fulfillmentModel as FulfillmentModel)) return "Unknown fulfillment model";
  if (d.paymentMethod !== "MANUAL_BANK_TRANSFER") return "Manual bank transfer is the only supported payment method";
  if (!COMMERCIAL_PAYMENT_STATUSES.includes(d.paymentStatus as CommercialPaymentStatus)) return "Unknown payment status";
  if (d.contractedParticipants != null && d.contractedParticipants <= 0) return "Contracted participants must be positive";
  if (d.discountPercent < 0 || d.discountPercent > MAX_DISCOUNT_PERCENT) return "Discount cannot exceed 20%";
  if (d.discountPercent > 0 && !d.discountBasis?.trim()) return "A discount basis is required when a discount is recorded";
  if (d.packageTier === "CUSTOM" && !d.scopeNote?.trim()) return "Custom scope requires a scope note / SOW basis";
  if (d.packageTier !== "CUSTOM" && d.contractedParticipants != null && d.contractedParticipants >= CUSTOM_SCOPE_MINIMUM_PARTICIPANTS) {
    return "A scope of 250+ contracted participants requires the Custom package";
  }
  const quoteFieldsComplete =
    d.contractedParticipants != null &&
    d.quotedStudyFeeEgp != null &&
    d.quotedParticipantRateEgp != null &&
    (d.fulfillmentModel !== "HOME_DELIVERY" || d.quotedHomeDeliveryFeeEgp != null);
  if (d.paymentStatus !== "QUOTE_DRAFT" && !quoteFieldsComplete) {
    return "A complete quoted scope is required before the commercial status leaves draft";
  }
  return null;
}

// Company agreement validation deliberately differs from campaign scope:
// the agreement can carry package/rate/fulfillment terms without forcing a
// participant count (per-campaign scope supplies quantity), while a quoted or
// ready agreement still requires the commercial basis and quoted fee fields.
export function validateCompanyCommercialAgreement(d: CompanyCommercialAgreementLike): string | null {
  if (!COMMERCIAL_PACKAGE_TIERS.includes(d.packageTier as CommercialPackageTier)) return "Unknown commercial package";
  if (!CONTRACTED_PARTICIPANT_BASES.includes(d.contractedParticipantBasis as ContractedParticipantBasis)) return "Unknown contracted participant basis";
  if (!FULFILLMENT_MODELS.includes(d.fulfillmentModel as FulfillmentModel)) return "Unknown fulfillment model";
  if (!COMMERCIAL_AGREEMENT_STATUSES.includes(d.agreementStatus as CommercialAgreementStatus)) return "Unknown agreement status";
  if (d.paymentMethod !== "MANUAL_BANK_TRANSFER") return "Manual bank transfer is the only supported payment method";
  if (!COMMERCIAL_PAYMENT_STATUSES.includes(d.paymentStatus as CommercialPaymentStatus)) return "Unknown payment status";
  if (d.contractedParticipants != null && d.contractedParticipants <= 0) return "Contracted participants must be positive";
  if (d.contractedParticipantBasis === "TOTAL_PROGRAM_PARTICIPANTS" && d.contractedParticipants == null) {
    return "A total participant count is required for a total-program agreement";
  }
  if (d.contractedParticipantBasis === "PER_CAMPAIGN_SCOPE" && d.contractedParticipants != null) {
    return "Per-campaign agreements leave participant quantity to campaign scope";
  }
  if (d.discountPercent < 0 || d.discountPercent > MAX_DISCOUNT_PERCENT) return "Discount cannot exceed 20%";
  if (d.discountPercent > 0 && !d.discountBasis?.trim()) return "A discount basis is required when a discount is recorded";
  if (d.packageTier === "CUSTOM" && !d.scopeNote?.trim()) return "Custom scope requires a scope note / SOW basis";
  if (d.packageTier !== "CUSTOM" && d.contractedParticipants != null && d.contractedParticipants >= CUSTOM_SCOPE_MINIMUM_PARTICIPANTS) {
    return "A scope of 250+ contracted participants requires the Custom package";
  }

  const quoteFieldsComplete =
    d.quotedStudyFeeEgp != null &&
    d.quotedParticipantRateEgp != null &&
    (d.fulfillmentModel !== "HOME_DELIVERY" || d.quotedHomeDeliveryFeeEgp != null);
  const hasCommercialBasis = Boolean(d.contractReference?.trim() || d.scopeNote?.trim());

  if (d.agreementStatus !== "DRAFT" && !hasCommercialBasis) {
    return "A contract reference or commercial scope note is required before the agreement leaves draft";
  }
  if (d.effectiveFrom && d.effectiveTo && d.effectiveTo <= d.effectiveFrom) {
    return "Agreement end date must be after the start date";
  }
  if (d.agreementStatus !== "DRAFT" && (!d.effectiveFrom || !d.effectiveTo)) {
    return "A contract start and end date are required before the agreement leaves draft";
  }
  if ((d.agreementStatus === "QUOTED" || d.agreementStatus === "READY") && !quoteFieldsComplete) {
    return "A complete quoted fee structure is required before the agreement is marked quoted or ready";
  }
  if (d.paymentStatus !== "QUOTE_DRAFT" && !quoteFieldsComplete) {
    return "A complete quoted fee structure is required before the payment status leaves draft";
  }
  if (d.agreementStatus === "READY" && d.paymentStatus === "QUOTE_DRAFT") {
    return "A ready agreement must have a quoted or later payment status";
  }
  return null;
}

function agreementRecordToLike(agreement: {
  packageTier: string;
  contractedParticipantBasis: string;
  contractedParticipants: number | null;
  fulfillmentModel: string;
  contractReference: string | null;
  scopeNote: string | null;
  quotedStudyFeeEgp: number | null;
  quotedParticipantRateEgp: number | null;
  quotedHomeDeliveryFeeEgp: number | null;
  discountPercent: number;
  discountBasis: string | null;
  paymentMethod: string;
  paymentStatus: string;
  agreementStatus: string;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  readyAt: Date | null;
  updatedAt: Date;
  updatedById: string | null;
}): CompanyCommercialAgreementLike {
  return { ...agreement };
}

export async function buildCompanyCommercialAgreementState(companyId: string, opts: { includeCatalog?: boolean } = {}) {
  const [agreement, campaignScopes] = await Promise.all([
    prisma.companyCommercialAgreement.findUnique({ where: { companyId } }),
    prisma.campaignCommercialTerms.findMany({
      where: { campaign: { companyId } },
      select: {
        campaignId: true,
        packageTier: true,
        paymentStatus: true,
        commercialAgreementId: true,
        campaign: { select: { id: true, name: true, status: true } },
      },
      orderBy: { campaign: { createdAt: "desc" } },
    }),
  ]);
  const a = agreement ? agreementRecordToLike(agreement) : DEFAULT_COMPANY_COMMERCIAL_AGREEMENT;
  const updatedBy = agreement?.updatedById
    ? await prisma.opsUser.findUnique({ where: { id: agreement.updatedById }, select: { name: true } })
    : null;
  const quoteComplete =
    a.quotedStudyFeeEgp != null &&
    a.quotedParticipantRateEgp != null &&
    (a.fulfillmentModel !== "HOME_DELIVERY" || a.quotedHomeDeliveryFeeEgp != null);
  const configured = Boolean(agreement);
  const status = configured ? a.agreementStatus : "NOT_CONFIGURED";
  const catalogPackage = opts.includeCatalog && configured
    ? await prisma.commercialPackage.findUnique({ where: { tier: a.packageTier } })
    : null;

  return {
    companyId,
    configured,
    agreementStatus: status,
    agreementStatusLabel: agreementStatusLabel(status),
    commerciallyReady: a.agreementStatus === "READY",
    packageTier: a.packageTier,
    packageLabel: packageTierLabel(a.packageTier),
    contractedParticipantBasis: a.contractedParticipantBasis,
    contractedParticipantBasisLabel:
      a.contractedParticipantBasis === "TOTAL_PROGRAM_PARTICIPANTS" ? "Total program participants" : "Per-campaign scope",
    contractedParticipants: a.contractedParticipants,
    fulfillmentModel: a.fulfillmentModel,
    fulfillmentLabel: a.fulfillmentModel === "HOME_DELIVERY" ? "Home Delivery" : "Point-of-Trial",
    contractReference: a.contractReference,
    scopeNote: a.scopeNote,
    quotedStudyFeeEgp: a.quotedStudyFeeEgp,
    quotedParticipantRateEgp: a.quotedParticipantRateEgp,
    quotedHomeDeliveryFeeEgp: a.quotedHomeDeliveryFeeEgp,
    discountPercent: a.discountPercent,
    discountBasis: a.discountBasis,
    paymentMethod: a.paymentMethod,
    paymentStatus: a.paymentStatus,
    paymentStatusLabel: paymentStatusLabel(a.paymentStatus),
    effectiveFrom: a.effectiveFrom ?? null,
    effectiveTo: a.effectiveTo ?? null,
    readyAt: a.readyAt ?? null,
    updatedAt: a.updatedAt ?? null,
    updatedById: a.updatedById ?? null,
    updatedByName: updatedBy?.name ?? null,
    catalogPackage: catalogPackage ? commercialPackageResponse(catalogPackage) : null,
    linkedCampaigns: campaignScopes.map((scope) => ({
      id: scope.campaign.id,
      name: scope.campaign.name,
      status: scope.campaign.status,
      packageTier: scope.packageTier,
      packageLabel: packageTierLabel(scope.packageTier),
      paymentStatus: scope.paymentStatus,
      paymentStatusLabel: paymentStatusLabel(scope.paymentStatus),
      scopeLinked: Boolean(agreement && scope.commercialAgreementId === agreement.id),
    })),
    readiness: {
      configured,
      hasCommercialBasis: Boolean(a.contractReference?.trim() || a.scopeNote?.trim()),
      quoteComplete,
      commercialStatus: status,
      taxStatus: "LEGAL_ACCOUNTING_VALIDATION_REQUIRED",
      pricingStatus: "QUOTED_TERMS_NOT_FINAL_PRICE_LIST",
    },
  };
}

export async function buildCommercialState(campaignId: string) {
  const [campaign, funnel] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        companyId: true,
        commercialTerms: { select: { commercialAgreementId: true } },
      },
    }),
    getFunnel(campaignId),
  ]);
  const [terms, companyAgreement] = await Promise.all([
    prisma.campaignCommercialTerms.findUnique({ where: { campaignId } }),
    campaign ? prisma.companyCommercialAgreement.findUnique({ where: { companyId: campaign.companyId } }) : Promise.resolve(null),
  ]);
  const t: CommercialTermsLike = terms
    ? {
        packageTier: terms.packageTier,
        contractedParticipants: terms.contractedParticipants,
        fulfillmentModel: terms.fulfillmentModel,
        scopeNote: terms.scopeNote,
        quotedStudyFeeEgp: terms.quotedStudyFeeEgp,
        quotedParticipantRateEgp: terms.quotedParticipantRateEgp,
        quotedHomeDeliveryFeeEgp: terms.quotedHomeDeliveryFeeEgp,
        discountPercent: terms.discountPercent,
        discountBasis: terms.discountBasis,
        paymentMethod: terms.paymentMethod,
        paymentStatus: terms.paymentStatus,
        updatedAt: terms.updatedAt,
        updatedById: terms.updatedById,
        commercialAgreementId: terms.commercialAgreementId,
      }
    : DEFAULT_COMMERCIAL_TERMS;

  const agreementState = campaign ? await buildCompanyCommercialAgreementState(campaign.companyId) : null;
  // A draft/configured agreement is onboarding state, not yet a governing
  // commercial package. Only an explicitly READY agreement supplies package
  // or fulfillment defaults to an unscoped campaign; explicit campaign scope
  // always wins.
  const governingAgreement = companyAgreement?.agreementStatus === "READY" ? companyAgreement : null;
  const inheritedPackage = !terms && governingAgreement ? governingAgreement.packageTier : null;
  const effectivePackageTier = terms?.packageTier ?? inheritedPackage ?? t.packageTier;
  const effectiveFulfillment = terms?.fulfillmentModel ?? governingAgreement?.fulfillmentModel ?? t.fulfillmentModel;
  const campaignScopeMode = terms
    ? (terms.commercialAgreementId && companyAgreement && terms.commercialAgreementId === companyAgreement.id
        ? "CAMPAIGN_SCOPE_LINKED_TO_AGREEMENT"
        : "CAMPAIGN_SCOPE")
    : governingAgreement
      ? "INHERITED_COMPANY_AGREEMENT"
      : companyAgreement
        ? "COMPANY_AGREEMENT_NOT_READY"
        : "DEFAULT_NOT_AGREED";

  const contracted = t.contractedParticipants;
  const completedEligibleParticipants = funnel.surveyComplete;
  const shortfall = contracted == null ? null : Math.max(0, contracted - completedEligibleParticipants);
  const overage = contracted == null ? null : Math.max(0, completedEligibleParticipants - contracted);
  const quotedParticipantSubtotal =
    t.quotedParticipantRateEgp != null && contracted != null ? t.quotedParticipantRateEgp * contracted : null;
  const billableCompletedParticipants = contracted == null ? null : Math.min(completedEligibleParticipants, contracted);
  const completedParticipantSubtotal =
    t.quotedParticipantRateEgp != null && billableCompletedParticipants != null
      ? t.quotedParticipantRateEgp * billableCompletedParticipants
      : null;
  const studyFeeDiscount =
    t.quotedStudyFeeEgp != null && t.discountPercent > 0 ? Math.round((t.quotedStudyFeeEgp * t.discountPercent) / 100) : 0;
  const quoteComplete =
    t.quotedStudyFeeEgp != null &&
    t.quotedParticipantRateEgp != null &&
    contracted != null &&
    (t.fulfillmentModel !== "HOME_DELIVERY" || t.quotedHomeDeliveryFeeEgp != null);
  const quotedSubtotalEgp = quoteComplete
    ? t.quotedStudyFeeEgp! - studyFeeDiscount + quotedParticipantSubtotal! + (t.quotedHomeDeliveryFeeEgp ?? 0)
    : null;
  const completedSubtotalEgp = quoteComplete
    ? t.quotedStudyFeeEgp! - studyFeeDiscount + completedParticipantSubtotal! + (t.quotedHomeDeliveryFeeEgp ?? 0)
    : null;

  return {
    campaignId,
    packageTier: effectivePackageTier,
    packageLabel: packageTierLabel(effectivePackageTier),
    packageSource: terms ? "CAMPAIGN_SCOPE" : inheritedPackage ? "COMPANY_AGREEMENT" : companyAgreement ? "COMPANY_AGREEMENT_NOT_READY" : "DEFAULT_NOT_AGREED",
    campaignScopeConfigured: Boolean(terms),
    campaignScopeMode,
    scopeLinked: Boolean(terms?.commercialAgreementId && companyAgreement && terms.commercialAgreementId === companyAgreement.id),
    contractedParticipants: contracted,
    fulfillmentModel: effectiveFulfillment,
    fulfillmentLabel: effectiveFulfillment === "HOME_DELIVERY" ? "Home Delivery" : "Point-of-Trial",
    scopeNote: t.scopeNote,
    quotedStudyFeeEgp: t.quotedStudyFeeEgp,
    quotedParticipantRateEgp: t.quotedParticipantRateEgp,
    quotedHomeDeliveryFeeEgp: t.quotedHomeDeliveryFeeEgp,
    discountPercent: t.discountPercent,
    discountBasis: t.discountBasis,
    paymentMethod: t.paymentMethod,
    paymentStatus: t.paymentStatus,
    paymentStatusLabel: paymentStatusLabel(t.paymentStatus),
    updatedAt: t.updatedAt ?? null,
    companyAgreement: agreementState,
    reportCapabilities: packageCapabilities(effectivePackageTier),
    calculation: {
      completedEligibleParticipants,
      shortfall,
      overage,
      overageHandling: overage && overage > 0 ? "FIELDWORK_CHANGE_ORDER" : "NONE",
      requiresChangeOrder: overage != null && overage > 0,
      requiresRescope: contracted != null && overage != null && overage > contracted * 0.5,
      shortfallHandling: shortfall && shortfall > 0 ? "CONTRACTUAL_CREDIT_OR_REMEDY" : "NONE",
    },
    quoteReadiness: {
      participantSubtotalEgp: quotedParticipantSubtotal,
      quotedParticipantSubtotalEgp: quotedParticipantSubtotal,
      completedParticipantSubtotalEgp: completedParticipantSubtotal,
      studyFeeDiscountEgp: studyFeeDiscount,
      quotedSubtotalBeforeTaxEgp: quotedSubtotalEgp,
      completedSubtotalBeforeTaxEgp: completedSubtotalEgp,
      unorderedOverageBilling: overage && overage > 0 ? "CHANGE_ORDER_REQUIRED_BEFORE_BILLING" : "NONE",
      quoteComplete,
      taxStatus: "LEGAL_ACCOUNTING_VALIDATION_REQUIRED",
      pricingStatus: "QUOTED_TERMS_NOT_FINAL_PRICE_LIST",
    },
  };
}

export function packageTierLabel(tier: string) {
  return { ESSENTIAL: "Essential", STANDARD: "Standard", PROFESSIONAL: "Professional", CUSTOM: "Custom" }[tier] ?? tier;
}

function paymentStatusLabel(status: string) {
  return {
    QUOTE_DRAFT: "Quote draft",
    QUOTED: "Quoted",
    AWAITING_BANK_TRANSFER: "Awaiting bank transfer",
    PAID_CONFIRMED: "Bank transfer confirmed",
  }[status] ?? status;
}

export function agreementStatusLabel(status: string) {
  return {
    NOT_CONFIGURED: "Commercial setup required",
    DRAFT: "Agreement draft",
    CONFIGURED: "Agreement configured",
    QUOTED: "Agreement quoted",
    READY: "Commercial ready",
  }[status] ?? status;
}
