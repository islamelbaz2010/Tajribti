export interface CampaignMedia {
  id: string;
  campaignId: string;
  type: 'photo' | 'video';
  url: string;
  caption: string | null;
  createdAt: string;
}

export interface LiveFeedEntry {
  id: string;
  gender: string | null;
  ageRange: string | null;
  city: string | null;
  redeemedAt: string;
}

export interface OverviewData {
  totalRedemptions: number;
  // DL-104 (2026-09-06): verified consumers who passed OTP for this campaign
  // — the first measurable stage in the journey funnel before QR redemption.
  verificationCount: number;
  surveyCompletions: number;
  completionRate: number;
  purchaseIntentPercent: number;
  liveFeed: LiveFeedEntry[];
}

// DL-105 (2026-09-06): one QR code per row, with its source label and
// how many redemptions it has generated. label is null for the primary
// unlabelled QR; all explicitly created source QRs carry a label.
export interface QrSourceData {
  qrId: string;
  label: string | null;
  code: string;
  redemptionCount: number;
}

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export interface DemographicsData {
  ageDistribution: DistributionItem[];
  genderDistribution: DistributionItem[];
  cityDistribution: DistributionItem[];
}

// Survey Builder V2: generic result for any question beyond the campaign's
// core 5 — computed by type, since custom questions have no fixed key.
export interface CustomQuestionResult {
  id: string;
  text: string;
  textAr: string;
  type: 'stars' | 'scale' | 'multiple_choice' | 'text';
  responseCount: number;
  breakdown?: { label: string; count: number }[];
  average?: number;
  verbatims?: string[];
}

export interface SegmentPurchaseIntent {
  label: string;
  respondentCount: number;
  positiveIntentPercent: number;
}

export interface SurveyData {
  purchaseIntentScore: number;
  purchaseIntentDistribution: DistributionItem[];
  // Reference Product Benchmark, Insights/Segmentation (2026-09-02): see
  // analytics.service.ts's own SurveyData for the reasoning — purchase
  // intent broken out by the same demographic segments getDemographics()
  // already computes separately, so the two can finally be read together.
  purchaseIntentBySegment: {
    byGender: SegmentPurchaseIntent[];
    byAgeRange: SegmentPurchaseIntent[];
  };
  questionBreakdown: Record<string, { label: string; count: number }[]>;
  verbatims: string[];
  customQuestions: CustomQuestionResult[];
  // Product Completion Wave (2026-09-02): q1's average — see
  // analytics.service.ts's SurveyData for why this exists as a separate
  // field rather than living in questionBreakdown (q1 is stars, an
  // average, not a label distribution like q3/q4).
  firstImpressionScore: { average: number; responseCount: number };
}

export interface Participant {
  id: string;
  ageRange: string | null;
  gender: string | null;
  city: string | null;
  redeemedAt: string;
  hasSurvey: boolean;
}

export interface ParticipantsResponse {
  participants: Participant[];
  total: number;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  textAr: string;
  type: 'stars' | 'scale' | 'multiple_choice' | 'text';
  options?: string[];
  optionsAr?: string[];
  required: boolean;
}

export interface Campaign {
  id: string;
  productName: string;
  brandName: string;
  description: string;
  locationName: string;
  locationAddress: string;
  status: string;
  targetCount: number;
  startDate: string;
  endDate: string;
  productImage: string;
  rewardPoints: number;
  isDemo: boolean;
  surveyQuestions: SurveyQuestion[];
  contactId?: string | null;
  // Reference Product Benchmark, list-view progress (2026-09-02): how many
  // consumers have actually redeemed/participated so far, out of
  // targetCount — present on every endpoint that returns a campaign list
  // (GET /campaigns/my, GET /admin/campaigns), absent on single-campaign
  // detail endpoints where AnalyticsService's own richer overview already
  // covers it. Optional so existing single-campaign call sites are unaffected.
  participantCount?: number;
  // Benchmark Alignment — Campaign Creation + Audience/Eligibility
  // (2026-09-06, DL-101): new optional fields.
  objective?: string | null;
  audienceGender?: string | null;
  audienceAgeRanges?: string[] | null;
}

// Accepted age range values — mirrors consumer onboarding options.
export const VALID_AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];

// Company Foundation (2026-09-01)
export type BrandSector = 'fmcg' | 'beauty_personal_care' | 'pharma_otc';

export const SECTOR_LABELS: Record<BrandSector, string> = {
  fmcg: 'FMCG (Food & Beverage)',
  beauty_personal_care: 'Beauty & Personal Care',
  pharma_otc: 'Pharma-OTC',
};

export interface Company {
  id: string;
  name: string;
  email: string;
  logoUrl: string | null;
  sector: BrandSector | null;
  employeeCode: string | null;
  createdAt: string;
  // Present only on GET /company/me — which identity is currently logged
  // in (the Company owner's own BrandAccount, or an authenticated
  // CompanyEmployee). Both see the same Company data.
  viewerType?: 'brand' | 'employee';
}

export interface BrandContact {
  id: string;
  brandAccountId: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
}

// Founder ruling W-1 (2026-09-02): a real authenticated Company Employee —
// distinct from BrandContact above (a non-authenticated record).
export interface CompanyEmployee {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface EmployeeSignupCompany {
  id: string;
  name: string;
  logoUrl: string | null;
}

// Founder ruling W-2 (2026-09-02): TAJRIBTI Admin Control Center types.
export interface AdminCompany {
  id: string;
  name: string;
  email: string;
  logoUrl: string | null;
  sector: BrandSector | null;
  employeeCode: string | null;
  createdAt: string;
  employeeCount: number;
  campaignCount: number;
}

export interface AdminCampaign extends Campaign {
  brandAccountId: string | null;
  companyName: string | null;
  createdAt: string;
}

export interface AdminCampaignsResponse {
  campaigns: AdminCampaign[];
  total: number;
}

export interface AiReport {
  narrative: string;
  narrativeAr: string | null;
  responseCountAtGeneration: number;
  createdAt: string;
}

export interface PdfData {
  campaign: Campaign;
  company: { name: string; logoUrl: string | null; sector: BrandSector | null } | null;
  overview: OverviewData;
  demographics: DemographicsData;
  survey: SurveyData;
  report: AiReport;
}
