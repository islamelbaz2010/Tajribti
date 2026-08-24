import client from './client';
import type {
  OverviewData,
  DemographicsData,
  SurveyData,
  ParticipantsResponse,
  Campaign,
  AiReport,
  PdfData,
} from './types';

export const authApi = {
  login: (email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> =>
    client.post('/auth/brand/login', { email, password }),
};

export const campaignApi = {
  getDemoActive: (): Promise<Campaign> => client.get('/campaigns/demo/active'),
  // Returns the first campaign owned by the authenticated brand.
  // For the demo brand this resolves to the demo campaign.
  // For a real brand this resolves to their most recent active campaign.
  getMyActiveCampaign: (): Promise<Campaign> =>
    (client.get('/campaigns/my') as Promise<Campaign[]>).then((list) => {
      if (!list || list.length === 0) throw new Error('No campaign found for this account');
      return list[0];
    }),
  // Full campaign history for the authenticated brand — same endpoint as
  // getMyActiveCampaign, without discarding everything but the first result.
  getMyCampaigns: (): Promise<Campaign[]> => client.get('/campaigns/my'),
  getById: (id: string): Promise<Campaign> => client.get(`/campaigns/${id}`),
  create: (body: {
    brandName: string;
    productName: string;
    productImage?: string;
    description?: string;
    locationName?: string;
    locationAddress?: string;
    rewardPoints: number;
    targetCount: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Campaign> => client.post('/campaigns', body),
};

export const analyticsApi = {
  getOverview: (campaignId: string): Promise<OverviewData> =>
    client.get(`/analytics/${campaignId}/overview`),
  getDemographics: (campaignId: string): Promise<DemographicsData> =>
    client.get(`/analytics/${campaignId}/demographics`),
  getSurvey: (campaignId: string): Promise<SurveyData> =>
    client.get(`/analytics/${campaignId}/survey`),
  getParticipants: (campaignId: string, page: number): Promise<ParticipantsResponse> =>
    client.get(`/analytics/${campaignId}/participants`, { params: { page } }),
};

export const qrApi = {
  getQrImage: (campaignId: string): Promise<Blob> =>
    client.get(`/qr/generate/${campaignId}`, { responseType: 'blob' }),
};

export const reportApi = {
  getAiSummary: (campaignId: string): Promise<AiReport> =>
    client.get(`/report/${campaignId}/ai-summary`),
  getPdfData: (campaignId: string): Promise<PdfData> =>
    client.get(`/report/${campaignId}/pdf-data`),
};
