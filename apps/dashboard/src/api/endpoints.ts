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
    client.get(`/report/${campaignId}/summary`),
  getPdfData: (campaignId: string): Promise<PdfData> =>
    client.get(`/report/${campaignId}/pdf-data`),
};
