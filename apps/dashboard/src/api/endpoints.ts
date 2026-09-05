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
  Company,
  BrandContact,
  CompanyEmployee,
  EmployeeSignupCompany,
} from './types';

export const authApi = {
  login: (email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> =>
    client.post('/auth/brand/login', { email, password }),
  // Founder ruling W-1 (2026-09-02): Company Employee identity — a
  // separate login/registration path from the Company owner's own
  // BrandAccount login above, and from ordinary Consumer signup.
  employeeLogin: (
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; companyName: string }> =>
    client.post('/auth/employee/login', { email, password }),
  listCompaniesForEmployeeSignup: (): Promise<EmployeeSignupCompany[]> =>
    client.get('/auth/employee/companies'),
  employeeSignup: (body: {
    companyId: string;
    code: string;
    name: string;
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string; companyName: string }> =>
    client.post('/auth/employee/signup', body),
};

export const campaignApi = {
  getDemoActive: (): Promise<Campaign> => client.get('/campaigns/demo/active'),
  // Default campaign every Console page falls back to when no ?campaignId=
  // is present (Layout's sidebar, and every analytics/report page via
  // getSelected() below). The doc comment here always claimed this
  // resolves to "their most recent ACTIVE campaign" but the implementation
  // used to just take list[0] — /campaigns/my orders by createdAt DESC
  // with no status filter, so a brand-new DRAFT campaign (e.g. one being
  // set up, or a leftover verification/test draft) silently became the
  // default for every Console page the moment it was created, even while
  // an older ACTIVE campaign was still collecting real consumer
  // submissions. Root cause of a real production incident (2026-09-02):
  // two genuine Founder-completed participations existed and were fully
  // queryable via the API the whole time, but the Console's default
  // selection had drifted to a newer, unrelated draft test campaign with
  // zero data, making the real submissions invisible without an explicit
  // ?campaignId=. Fixed to actually do what the comment always said:
  // prefer the most recent ACTIVE campaign, falling back to the plain
  // most-recent campaign only when the brand has no active one at all
  // (e.g. a brand-new account with just a draft) — same fallback the
  // caller already relied on, so that case is unchanged.
  getMyActiveCampaign: (): Promise<Campaign> =>
    (client.get('/campaigns/my') as Promise<Campaign[]>).then((list) => {
      if (!list || list.length === 0) throw new Error('No campaign found for this account');
      return list.find((c) => c.status === 'active') ?? list[0];
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
    contactId?: string;
    surveyQuestions?: SurveyQuestion[];
    // Benchmark Alignment — Campaign Creation + Audience (2026-09-06, DL-101)
    objective?: string;
    audienceGender?: string;
    audienceAgeRanges?: string[];
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
      startDate: string;
      endDate: string;
      status: string;
      contactId: string;
      surveyQuestions: SurveyQuestion[];
      // Benchmark Alignment — Campaign Creation + Audience (2026-09-06, DL-101)
      objective: string;
      audienceGender: string;
      audienceAgeRanges: string[];
    }>,
  ): Promise<Campaign> => client.patch(`/campaigns/${id}`, body),
};

// Company Foundation (2026-09-01): self-service Company Console surface.
export const companyApi = {
  getMe: (): Promise<Company> => client.get('/company/me'),
  getContacts: (): Promise<BrandContact[]> => client.get('/company/contacts'),
  createContact: (body: { name: string; email: string; role?: string }): Promise<BrandContact> =>
    client.post('/company/contacts', body),
  removeContact: (id: string): Promise<void> => client.delete(`/company/contacts/${id}`),
  getSectorFramework: (): Promise<SurveyQuestion[]> => client.get('/company/sector-framework'),
};

// Founder ruling W-1 (2026-09-02): self-service view of who has employee
// access to the currently-logged-in Company. Works identically whether the
// caller is the Company owner (BrandAccount) or an employee — both are
// scoped to the same Company server-side.
export const employeesApi = {
  list: (): Promise<CompanyEmployee[]> => client.get('/company/employees'),
  remove: (id: string): Promise<void> => client.delete(`/company/employees/${id}`),
};

// Upload capability (2026-09-02): Postgres-backed asset store (see API's
// assets.module.ts) — no third-party storage integration.
export const assetsApi = {
  uploadLogo: (file: File): Promise<{ logoUrl: string }> => {
    const form = new FormData();
    form.append('file', file);
    return client.post('/assets/logo', form);
  },
  removeLogo: (): Promise<{ logoUrl: null }> => client.delete('/assets/logo'),
  uploadCampaignProductImage: (
    campaignId: string,
    file: File,
  ): Promise<{ productImage: string }> => {
    const form = new FormData();
    form.append('file', file);
    return client.post(`/assets/campaign/${campaignId}/product-image`, form);
  },
  removeCampaignProductImage: (campaignId: string): Promise<{ productImage: null }> =>
    client.delete(`/assets/campaign/${campaignId}/product-image`),
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
  // Commercial V1 Completion Sprint (2026-09-01): public, unauthenticated
  // — powers the marketing site's Sample Report page. Server-side scoped
  // to the seeded demo campaign only; no campaignId is ever sent.
  getPublicSample: (): Promise<PdfData> => client.get('/report/sample'),
};
