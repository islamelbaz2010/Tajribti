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
  surveyCompletions: number;
  completionRate: number;
  purchaseIntentPercent: number;
  liveFeed: LiveFeedEntry[];
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

export interface SurveyData {
  purchaseIntentScore: number;
  purchaseIntentDistribution: DistributionItem[];
  questionBreakdown: Record<string, { label: string; count: number }[]>;
  verbatims: string[];
  customQuestions: CustomQuestionResult[];
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
}

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
  createdAt: string;
}

export interface BrandContact {
  id: string;
  brandAccountId: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
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
