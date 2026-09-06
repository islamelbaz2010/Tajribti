import adminClient from './adminClient';
import type {
  AdminCompany,
  AdminCampaign,
  AdminCampaignsResponse,
  CompanyEmployee,
  OverviewData,
  DemographicsData,
  SurveyData,
  ParticipantsResponse,
  AiReport,
  PdfData,
  BrandContact,
  BrandSector,
} from './types';

// Founder ruling W-2 (2026-09-02): TAJRIBTI Admin Control Center API
// surface — "Admin -> Company -> Campaigns -> Selected Campaign ->
// Participants/Data -> Insights -> Report." Every call here goes through
// adminClient (its own token/base), never the Company Console's client.

export const adminAuthApi = {
  login: (email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> =>
    adminClient.post('/auth/admin/login', { email, password }),
  me: (): Promise<{ id: string | null; name: string; email: string | null }> =>
    adminClient.get('/admin/auth/me'),
};

export const adminCompaniesApi = {
  list: (): Promise<AdminCompany[]> => adminClient.get('/admin/brands'),
  get: (id: string): Promise<AdminCompany> => adminClient.get(`/admin/brands/${id}`),
  create: (body: {
    name: string;
    email: string;
    password: string;
    logoUrl?: string;
    sector?: BrandSector;
  }): Promise<AdminCompany> => adminClient.post('/admin/brands', body),
  update: (
    id: string,
    body: Partial<{ name: string; logoUrl: string; sector: BrandSector }>,
  ): Promise<AdminCompany> => adminClient.patch(`/admin/brands/${id}`, body),
  listContacts: (id: string): Promise<BrandContact[]> => adminClient.get(`/admin/brands/${id}/contacts`),
  listEmployees: (id: string): Promise<CompanyEmployee[]> => adminClient.get(`/admin/brands/${id}/employees`),
  createEmployee: (
    id: string,
    body: { name: string; email: string; password: string },
  ): Promise<CompanyEmployee> => adminClient.post(`/admin/brands/${id}/employees`, body),
  removeEmployee: (id: string, employeeId: string): Promise<void> =>
    adminClient.delete(`/admin/brands/${id}/employees/${employeeId}`),
  regenerateEmployeeCode: (id: string): Promise<{ employeeCode: string }> =>
    adminClient.post(`/admin/brands/${id}/employee-code/regenerate`, {}),
};

export const adminStatsApi = {
  // Admin Operations Overview — aggregate stats for the dashboard landing
  // page (Reference Blueprint: "DASHBOARD / OPERATIONS OVERVIEW").
  getStats: (): Promise<{
    totalCompanies: number;
    campaignsByStatus: Record<string, number>;
    needsAttention: Array<{ id: string; productName: string; companyName: string | null; endDate: string; participantCount: number }>;
    recentCampaigns: Array<{ id: string; productName: string; companyName: string | null; status: string; createdAt: string }>;
  }> => adminClient.get('/admin/stats'),
};

export const adminCampaignsApi = {
  list: (query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    brandId?: string;
  }): Promise<AdminCampaignsResponse> => adminClient.get('/admin/campaigns', { params: query }),
  get: (id: string): Promise<AdminCampaign> => adminClient.get(`/admin/campaigns/${id}`),
  // Product Reference Alignment (2026-09-02): real operational control —
  // same UpdateCampaignDto shape the Company Console's own campaignApi.update
  // already uses (endpoints.ts), reused here rather than duplicated.
  update: (
    id: string,
    body: Partial<{
      productName: string;
      description: string;
      locationName: string;
      locationAddress: string;
      rewardPoints: number;
      targetCount: number;
      startDate: string;
      endDate: string;
      status: string;
    }>,
  ): Promise<AdminCampaign> => adminClient.patch(`/admin/campaigns/${id}`, body),
  getOverview: (id: string): Promise<OverviewData> => adminClient.get(`/admin/campaigns/${id}/overview`),
  getDemographics: (id: string): Promise<DemographicsData> =>
    adminClient.get(`/admin/campaigns/${id}/demographics`),
  getSurvey: (id: string): Promise<SurveyData> => adminClient.get(`/admin/campaigns/${id}/survey`),
  getParticipants: (id: string, page: number): Promise<ParticipantsResponse> =>
    adminClient.get(`/admin/campaigns/${id}/participants`, { params: { page } }),
  getAiSummary: (id: string): Promise<AiReport> => adminClient.get(`/admin/campaigns/${id}/ai-summary`),
  getReport: (id: string): Promise<PdfData> => adminClient.get(`/admin/campaigns/${id}/report`),
};
