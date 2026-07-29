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

export interface SurveyData {
  purchaseIntentScore: number;
  purchaseIntentDistribution: DistributionItem[];
  questionBreakdown: Record<string, { label: string; count: number }[]>;
  verbatims: string[];
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
}

export interface AiReport {
  narrative: string;
  responseCountAtGeneration: number;
  createdAt: string;
}

export interface PdfData {
  campaign: Campaign;
  overview: OverviewData;
  demographics: DemographicsData;
  survey: SurveyData;
  report: AiReport;
}
