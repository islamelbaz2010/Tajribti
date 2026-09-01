import client from './client';
import type {
  OverviewData,
  DemographicsData,
  SurveyData,
  ParticipantsResponse,
  Campaign,
  CampaignMedia,
  SurveyQuestion,
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
  // Campaign-aware resolver: honors ?campaignId= in the URL (used by the
  // Overview "Other Campaigns" links) so every monitoring page can show a
  // specific campaign from history, falling back to the brand's active
  // campaign when no id is present.
  //
  // Resolves against getMyCampaigns() (scoped server-side to the
  // authenticated brand) rather than the public GET /campaigns/:id — that
  // endpoint is intentionally public for the consumer QR/discovery flow,
  // so calling it directly here would let a brand see another brand's
  // campaign name/product/location (not their data — analytics/report
  // ownership checks already block that — but still an identity leak)
  // just by editing the URL. An id that isn't actually this brand's falls
  // back to the active campaign instead of being displayed.
  getSelected: (): Promise<Campaign> => {
    const id = new URLSearchParams(window.location.search).get('campaignId');
    if (!id) return campaignApi.getMyActiveCampaign();
    return campaignApi.getMyCampaigns().then((list) => {
      const match = list.find((c) => c.id === id);
      return match ?? campaignApi.getMyActiveCampaign();
    });
  },
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
    surveyQuestions?: SurveyQuestion[];
  }): Promise<Campaign> => client.post('/campaigns', body),
  // Internal Tajribti Campaign Operations (DL-055 item 1): edit + status
  // lifecycle. Ownership-enforced server-side (a brand may only update its
  // own campaigns) — same pattern as getSelected() above.
  update: (
    id: string,
    body: Partial<{
      productName: string;
      productImage: string;
      description: string;
      locationName: string;
      locationAddress: string;
      rewardPoints: number;
      targetCount: number;
      endDate: string;
      status: string;
      surveyQuestions: SurveyQuestion[];
    }>,
  ): Promise<Campaign> => client.patch(`/campaigns/${id}`, body),
};

export const mediaApi = {
  list: (campaignId: string): Promise<CampaignMedia[]> =>
    client.get(`/campaigns/${campaignId}/media`),
  create: (
    campaignId: string,
    body: { type: 'photo' | 'video'; url: string; caption?: string },
  ): Promise<CampaignMedia> => client.post(`/campaigns/${campaignId}/media`, body),
  remove: (campaignId: string, mediaId: string): Promise<void> =>
    client.delete(`/campaigns/${campaignId}/media/${mediaId}`),
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
