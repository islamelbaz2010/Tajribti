import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Campaign, CampaignStatus, SurveyQuestion } from '../../entities/campaign.entity';
import { QrCode, QrCodeStatus } from '../../entities/qr-code.entity';
import { Consumer } from '../../entities/consumer.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { BrandAccount } from '../../entities/brand-account.entity';
import { BrandContact } from '../../entities/brand-contact.entity';
import { CompanyEmployee } from '../../entities/company-employee.entity';
import { AdminUser } from '../../entities/admin-user.entity';
import { AiReport } from '../../entities/ai-report.entity';
import { ConfigService } from '@nestjs/config';
import { CreateBrandAccountDto } from './dto/create-brand-account.dto';
import { UpdateBrandAccountDto } from './dto/update-brand-account.dto';
import { CreateBrandContactDto } from './dto/create-brand-contact.dto';
import { CreateCompanyEmployeeDto } from './dto/create-company-employee.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { AnalyticsService } from '../analytics/analytics.service';
import { ReportService } from '../report/report.service';
import { CampaignService } from '../campaign/campaign.service';
import { UpdateCampaignDto } from '../campaign/dto/update-campaign.dto';

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'] as const;
const GENDERS = ['male', 'female'] as const;
const CITIES = ['Cairo', 'Giza', 'Cairo', 'Cairo', 'Cairo'] as const;
const INTERESTS = ['food_beverages', 'beauty_personal_care', 'health_wellness', 'home_care'] as const;
const DESCRIPTORS = ['Fresh', 'Light', 'Refreshing', 'Balanced', 'Natural', 'Bold', 'Smooth'] as const;

const DEMO_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'q1',
    text: 'What was your first impression of this product?',
    textAr: 'ما هو انطباعك الأول عن هذا المنتج؟',
    type: 'stars',
    required: true,
  },
  {
    id: 'q2',
    text: 'How likely are you to buy this product at a store?',
    textAr: 'ما مدى احتمالية شراؤك لهذا المنتج من المتجر؟',
    type: 'scale',
    required: true,
  },
  {
    id: 'q3',
    text: 'Which word best describes this product?',
    textAr: 'أي كلمة تصف هذا المنتج بشكل أفضل؟',
    type: 'multiple_choice',
    options: ['Fresh', 'Light', 'Refreshing', 'Balanced', 'Natural'],
    optionsAr: ['منعش', 'خفيف', 'مرطب', 'متوازن', 'طبيعي'],
    required: true,
  },
  {
    id: 'q4',
    text: 'Compared to similar products, this is:',
    textAr: 'مقارنة بالمنتجات المماثلة، هذا المنتج:',
    type: 'multiple_choice',
    options: ['Much Better', 'Better', 'About the Same', 'Worse'],
    optionsAr: ['أفضل بكثير', 'أفضل', 'مماثل', 'أسوأ'],
    required: true,
  },
  {
    id: 'q5',
    text: 'Any other comments? (optional)',
    textAr: 'أي تعليقات إضافية؟ (اختياري)',
    type: 'text',
    required: false,
  },
];

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(QrCode)
    private readonly qrRepo: Repository<QrCode>,
    @InjectRepository(Consumer)
    private readonly consumerRepo: Repository<Consumer>,
    @InjectRepository(RedemptionEvent)
    private readonly redemptionRepo: Repository<RedemptionEvent>,
    @InjectRepository(SurveyResponse)
    private readonly surveyRepo: Repository<SurveyResponse>,
    @InjectRepository(BrandAccount)
    private readonly brandRepo: Repository<BrandAccount>,
    @InjectRepository(BrandContact)
    private readonly brandContactRepo: Repository<BrandContact>,
    @InjectRepository(AiReport)
    private readonly aiReportRepo: Repository<AiReport>,
    @InjectRepository(CompanyEmployee)
    private readonly employeeRepo: Repository<CompanyEmployee>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepo: Repository<AdminUser>,
    private readonly configService: ConfigService,
    private readonly analyticsService: AnalyticsService,
    private readonly reportService: ReportService,
    private readonly campaignService: CampaignService,
  ) {}

  async seedDemo(): Promise<{ message: string; campaignId: string; qrCode: string }> {
    const existingDemo = await this.campaignRepo.findOne({
      where: { isDemo: true },
    });

    if (existingDemo) {
      throw new ConflictException(
        `Demo data already seeded. Campaign ID: ${existingDemo.id}. Use /admin/seed/reset to reseed.`,
      );
    }

    this.logger.log('Seeding demo data...');

    const brandEmail = this.configService.get('DEMO_BRAND_EMAIL') ?? 'demo@brand.com';
    const brandPassword = this.configService.get('DEMO_BRAND_PASSWORD') ?? 'Demo1234!';
    const hashedPassword = await bcrypt.hash(brandPassword, 10);

    const brand = await this.brandRepo.save(
      this.brandRepo.create({
        name: this.configService.get('DEMO_BRAND_NAME') ?? 'Egyptian Beverages Co.',
        email: brandEmail,
        password: hashedPassword,
        logoUrl: null,
      }),
    );

    const campaign = await this.campaignRepo.save(
      this.campaignRepo.create({
        brandAccountId: brand.id,
        brandName: brand.name,
        productName: this.configService.get('DEMO_PRODUCT_NAME') ?? 'Almaza Light',
        productImage: 'https://placehold.co/400x400/1a1a2e/ffffff.png?text=Product',
        description: 'Experience the refreshing taste of our latest product. Try it for free and share your thoughts.',
        locationName: this.configService.get('DEMO_LOCATION_NAME') ?? 'City Stars Mall — Ground Floor Atrium',
        locationAddress: 'City Stars Mall, Omar Ibn Al-Khattab St, Nasr City, Cairo',
        rewardPoints: 50,
        status: CampaignStatus.ACTIVE,
        targetCount: 200,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        surveyQuestions: DEMO_SURVEY_QUESTIONS,
        isDemo: true,
      }),
    );

    const qrCodeValue = `tajribti:${campaign.id}:demo`;
    const qrCode = await this.qrRepo.save(
      this.qrRepo.create({
        campaignId: campaign.id,
        code: qrCodeValue,
        status: QrCodeStatus.DEMO,
      }),
    );

    await this.seedConsumersAndResponses(campaign.id, qrCode.id, 49);

    this.logger.log(`Demo seeded. Campaign: ${campaign.id}, QR: ${qrCodeValue}`);

    return {
      message: 'Demo data seeded successfully. 49 historical consumers loaded.',
      campaignId: campaign.id,
      qrCode: qrCodeValue,
    };
  }

  // Controlled/internal Brand provisioning (Pilot Operations Closure,
  // 2026-09-01): the only real-Brand onboarding mechanism authorized for
  // this pilot phase. Callable only by whoever holds ADMIN_SECRET (same
  // gate as /admin/seed) — deliberately NOT a public signup endpoint, no
  // Brand-facing route calls this. Reuses the exact BrandAccount creation
  // shape seedDemo() has always used; no second identity model, no new
  // auth system. Returns nothing password-related.
  async createBrand(
    dto: CreateBrandAccountDto,
  ): Promise<{ id: string; name: string; email: string; employeeCode: string; createdAt: Date }> {
    const existing = await this.brandRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException(`A brand account already exists for ${dto.email}`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const brand = await this.brandRepo.save(
      this.brandRepo.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        logoUrl: dto.logoUrl ?? null,
        sector: dto.sector ?? null,
        // Founder ruling W-1 (2026-09-02): every newly-provisioned Company
        // gets a working employee code immediately, so "Admin creates the
        // Company" and "employees can self-register with a code" are not
        // two separate manual steps.
        employeeCode: await this.generateUniqueEmployeeCode(),
      }),
    );

    return {
      id: brand.id,
      name: brand.name,
      email: brand.email,
      employeeCode: brand.employeeCode as string,
      createdAt: brand.createdAt,
    };
  }

  // Company Foundation (2026-09-01): Admin listing/edit of existing
  // Companies — deliberately never returns `password`. Same x-admin-secret
  // gate as every other admin.* method. Extended (Founder ruling W-2,
  // 2026-09-01/02) with employeeCount/campaignCount so the Admin Control
  // Center's Companies list is immediately useful, not just names.
  async listBrands(): Promise<
    Array<
      Pick<BrandAccount, 'id' | 'name' | 'email' | 'logoUrl' | 'sector' | 'employeeCode' | 'createdAt'> & {
        employeeCount: number;
        campaignCount: number;
      }
    >
  > {
    const brands = await this.brandRepo.find({ order: { createdAt: 'DESC' } });
    if (brands.length === 0) return [];
    const brandIds = brands.map((b) => b.id);

    const [employeeCounts, campaignCounts] = await Promise.all([
      this.employeeRepo
        .createQueryBuilder('e')
        .select('e.brand_account_id', 'brandAccountId')
        .addSelect('COUNT(*)', 'count')
        .where('e.brand_account_id IN (:...brandIds)', { brandIds })
        .groupBy('e.brand_account_id')
        .getRawMany<{ brandAccountId: string; count: string }>(),
      this.campaignRepo
        .createQueryBuilder('c')
        .select('c.brand_account_id', 'brandAccountId')
        .addSelect('COUNT(*)', 'count')
        .where('c.brand_account_id IN (:...brandIds)', { brandIds })
        .groupBy('c.brand_account_id')
        .getRawMany<{ brandAccountId: string; count: string }>(),
    ]);
    const employeeCountMap = new Map(employeeCounts.map((r) => [r.brandAccountId, Number(r.count)]));
    const campaignCountMap = new Map(campaignCounts.map((r) => [r.brandAccountId, Number(r.count)]));

    return brands.map(({ id, name, email, logoUrl, sector, employeeCode, createdAt }) => ({
      id,
      name,
      email,
      logoUrl,
      sector,
      employeeCode,
      createdAt,
      employeeCount: employeeCountMap.get(id) ?? 0,
      campaignCount: campaignCountMap.get(id) ?? 0,
    }));
  }

  // Admin Control Center (Founder ruling W-2, 2026-09-02): single-Company
  // drill-down — the "Admin -> Company" step of the required navigation.
  async getBrandDetail(id: string): Promise<
    Pick<BrandAccount, 'id' | 'name' | 'email' | 'logoUrl' | 'sector' | 'employeeCode' | 'createdAt'> & {
      employeeCount: number;
      campaignCount: number;
    }
  > {
    const brand = await this.requireBrand(id);
    const [employeeCount, campaignCount] = await Promise.all([
      this.employeeRepo.count({ where: { brandAccountId: id } }),
      this.campaignRepo.count({ where: { brandAccountId: id } }),
    ]);
    const { name, email, logoUrl, sector, employeeCode, createdAt } = brand;
    return { id, name, email, logoUrl, sector, employeeCode, createdAt, employeeCount, campaignCount };
  }

  async updateBrand(
    id: string,
    dto: UpdateBrandAccountDto,
  ): Promise<Pick<BrandAccount, 'id' | 'name' | 'email' | 'logoUrl' | 'sector'>> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand account not found');

    if (dto.name !== undefined) brand.name = dto.name;
    if (dto.logoUrl !== undefined) brand.logoUrl = dto.logoUrl || null;
    if (dto.sector !== undefined) brand.sector = dto.sector;

    const saved = await this.brandRepo.save(brand);
    return { id: saved.id, name: saved.name, email: saved.email, logoUrl: saved.logoUrl, sector: saved.sector };
  }

  // ── Company Contacts (Company Foundation, 2026-09-01) ──────────────────
  // Admin-side CRUD, mirrored by a self-service subset in company.service.ts
  // for the Company's own console. Not a second auth system — no
  // password/login is ever created for a contact.

  async listBrandContacts(brandId: string): Promise<BrandContact[]> {
    await this.requireBrand(brandId);
    return this.brandContactRepo.find({ where: { brandAccountId: brandId }, order: { createdAt: 'DESC' } });
  }

  async createBrandContact(brandId: string, dto: CreateBrandContactDto): Promise<BrandContact> {
    await this.requireBrand(brandId);
    return this.brandContactRepo.save(
      this.brandContactRepo.create({
        brandAccountId: brandId,
        name: dto.name,
        email: dto.email,
        role: dto.role ?? null,
      }),
    );
  }

  async deleteBrandContact(brandId: string, contactId: string): Promise<void> {
    const contact = await this.brandContactRepo.findOne({ where: { id: contactId } });
    if (!contact || contact.brandAccountId !== brandId) {
      throw new NotFoundException('Contact not found for this brand');
    }
    await this.brandContactRepo.remove(contact);
  }

  // ── Company Employees (Founder ruling W-1, 2026-09-02) ─────────────────
  // Admin-side creation ("Admin may create employee accounts when the
  // Company requests them") — the operator sets email+password directly,
  // exactly like createBrand() above. Self-registration via the Company's
  // own employee code is the other, Admin-independent path (see
  // auth.service.ts employeeSignup()).

  async listCompanyEmployees(
    brandId: string,
  ): Promise<Array<Pick<CompanyEmployee, 'id' | 'name' | 'email' | 'createdAt'>>> {
    await this.requireBrand(brandId);
    const employees = await this.employeeRepo.find({
      where: { brandAccountId: brandId },
      order: { createdAt: 'DESC' },
    });
    return employees.map(({ id, name, email, createdAt }) => ({ id, name, email, createdAt }));
  }

  async createCompanyEmployee(
    brandId: string,
    dto: CreateCompanyEmployeeDto,
  ): Promise<{ id: string; name: string; email: string; createdAt: Date }> {
    await this.requireBrand(brandId);
    const email = dto.email.trim().toLowerCase();
    const existing = await this.employeeRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException(`An employee account already exists for ${email}`);
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const employee = await this.employeeRepo.save(
      this.employeeRepo.create({ brandAccountId: brandId, name: dto.name, email, passwordHash }),
    );
    return { id: employee.id, name: employee.name, email: employee.email, createdAt: employee.createdAt };
  }

  async deleteCompanyEmployee(brandId: string, employeeId: string): Promise<void> {
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
    if (!employee || employee.brandAccountId !== brandId) {
      throw new NotFoundException('Employee not found for this company');
    }
    await this.employeeRepo.softRemove(employee);
  }

  // Regenerates a Company's employee self-registration code — invalidates
  // the old code immediately (anyone who had it can no longer register;
  // already-registered employees are unaffected, since the code is only
  // ever checked at signup time, never stored on the employee record).
  async regenerateEmployeeCode(brandId: string): Promise<{ employeeCode: string }> {
    const brand = await this.requireBrand(brandId);
    brand.employeeCode = await this.generateUniqueEmployeeCode();
    await this.brandRepo.save(brand);
    return { employeeCode: brand.employeeCode };
  }

  private async generateUniqueEmployeeCode(): Promise<string> {
    // 8 uppercase alphanumeric characters (Crockford-ish, no ambiguous
    // 0/O/1/I) — short enough for a Company to read aloud/type, long
    // enough that guessing isn't a realistic path to another Company's
    // employee registration.
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    for (let attempt = 0; attempt < 10; attempt++) {
      const bytes = crypto.randomBytes(8);
      let code = '';
      for (let i = 0; i < 8; i++) code += alphabet[bytes[i] % alphabet.length];
      const existing = await this.brandRepo.findOne({ where: { employeeCode: code } });
      if (!existing) return code;
    }
    throw new ConflictException('Could not generate a unique employee code — please retry');
  }

  // ── TAJRIBTI Admin identity (Founder ruling W-2, 2026-09-02) ───────────
  // Bootstraps a real AdminUser — the ONLY thing the legacy x-admin-secret
  // is still the sole gate for; every other admin.* method now also
  // accepts a valid AdminUser JWT (see admin.controller.ts checkAdminAuth()).

  async bootstrapAdminUser(
    dto: CreateAdminUserDto,
  ): Promise<{ id: string; name: string; email: string; createdAt: Date }> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.adminUserRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException(`An admin account already exists for ${email}`);
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const admin = await this.adminUserRepo.save(
      this.adminUserRepo.create({ name: dto.name, email, passwordHash }),
    );
    return { id: admin.id, name: admin.name, email: admin.email, createdAt: admin.createdAt };
  }

  // ── Admin Control Center: cross-Company Campaign navigation
  // (Founder ruling W-2, 2026-09-02) ──────────────────────────────────────
  // "Admin -> Company -> Campaigns -> Selected Campaign -> Participants/
  // Data -> Insights -> Report" — the navigation this task requires. Reuses
  // AnalyticsService/ReportService exactly as the Company Console does;
  // Admin authorization (already checked at the controller) stands in for
  // the per-Company ownership check those services also expose.

  async listAllCampaigns(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    brandId?: string;
  }): Promise<{
    campaigns: Array<Campaign & { companyName: string | null; participantCount: number }>;
    total: number;
  }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));

    const qb = this.campaignRepo
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.brandAccount', 'brandAccount')
      .orderBy('campaign.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) qb.andWhere('campaign.status = :status', { status: query.status });
    if (query.brandId) qb.andWhere('campaign.brandAccountId = :brandId', { brandId: query.brandId });
    if (query.search) {
      qb.andWhere('(campaign.productName ILIKE :search OR campaign.brandName ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const [campaigns, total] = await qb.getManyAndCount();
    // Reference Product Benchmark, Admin Operations (2026-09-02): an
    // operator scanning the cross-Company campaign table should be able to
    // see participant counts without clicking into every row — reuses
    // CampaignService's own grouped-COUNT helper (one extra query for the
    // whole page, not per row) rather than duplicating the aggregation.
    const withCounts = await this.campaignService.attachParticipantCounts(campaigns);
    const companyNameById = new Map(campaigns.map((c) => [c.id, c.brandAccount?.name ?? null]));
    return {
      campaigns: withCounts.map((c) => ({ ...c, companyName: companyNameById.get(c.id) ?? null })),
      total,
    };
  }

  // Product Reference Alignment (2026-09-02): real operational control,
  // not read-only drill-down — Admin can launch/pause/complete/archive a
  // campaign, or correct its fields, the same way the Company owner can.
  // Reuses campaign.service.ts's exact validation (date range, survey
  // question core-identity protection) via updateCampaignAsAdmin(); no
  // new lifecycle state, no new fields, no separate rules.
  async updateCampaignForAdmin(id: string, dto: UpdateCampaignDto): Promise<Campaign & { companyName: string | null }> {
    const updated = await this.campaignService.updateCampaignAsAdmin(id, dto);
    return this.getCampaignDetailForAdmin(updated.id);
  }

  async getCampaignDetailForAdmin(id: string): Promise<Campaign & { companyName: string | null }> {
    const campaign = await this.campaignRepo.findOne({
      where: { id },
      relations: ['brandAccount'],
    });
    if (!campaign) throw new NotFoundException(`Campaign ${id} not found`);
    return { ...campaign, companyName: campaign.brandAccount?.name ?? null };
  }

  async getCampaignOverviewForAdmin(campaignId: string) {
    await this.getCampaignDetailForAdmin(campaignId);
    return this.analyticsService.getOverview(campaignId);
  }

  async getCampaignDemographicsForAdmin(campaignId: string) {
    await this.getCampaignDetailForAdmin(campaignId);
    return this.analyticsService.getDemographics(campaignId);
  }

  async getCampaignSurveyForAdmin(campaignId: string) {
    await this.getCampaignDetailForAdmin(campaignId);
    return this.analyticsService.getSurveyBreakdown(campaignId);
  }

  async getCampaignParticipantsForAdmin(campaignId: string, page: number, limit: number) {
    await this.getCampaignDetailForAdmin(campaignId);
    return this.analyticsService.getParticipants(campaignId, page, limit);
  }

  async getCampaignReportForAdmin(campaignId: string) {
    await this.getCampaignDetailForAdmin(campaignId);
    return this.reportService.generatePdfData(campaignId);
  }

  async getCampaignAiSummaryForAdmin(campaignId: string) {
    await this.getCampaignDetailForAdmin(campaignId);
    return this.reportService.getAiSummary(campaignId);
  }

  private async requireBrand(id: string): Promise<BrandAccount> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand account not found');
    return brand;
  }

  // Used by AdminController's checkAdminAuth() to validate a decoded
  // Admin JWT's subject actually still corresponds to a live AdminUser
  // (not soft-deleted) — kept here rather than duplicating repo access in
  // the controller layer.
  async isValidAdminUser(adminId: string): Promise<boolean> {
    const admin = await this.adminUserRepo.findOne({ where: { id: adminId } });
    return !!admin;
  }

  // Admin Operations Overview — aggregate stats for the dashboard landing.
  // All queries are simple COUNT/GROUP-BY on existing tables; no new
  // entities, no schema change, no heavy joins beyond what the campaign list
  // already does.
  async getOperationalStats(): Promise<{
    totalCompanies: number;
    campaignsByStatus: Record<string, number>;
    needsAttention: Array<{ id: string; productName: string; companyName: string | null; endDate: string; participantCount: number }>;
    recentCampaigns: Array<{ id: string; productName: string; companyName: string | null; status: string; createdAt: string }>;
  }> {
    const today = new Date().toISOString().slice(0, 10);

    const [totalCompanies, allStatusCounts, attentionRows, recentRows] = await Promise.all([
      this.brandRepo.count(),

      // Campaign counts grouped by status — one query, no N+1
      this.campaignRepo
        .createQueryBuilder('c')
        .select('c.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('c.status')
        .getRawMany() as Promise<{ status: string; count: string }[]>,

      // Active campaigns whose end date has already passed — operational
      // exceptions list (mirrors client-side needsAttention() already in
      // AdminCampaigns.tsx / AdminCampaignDetail.tsx)
      this.campaignRepo
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.brandAccount', 'b')
        .where('c.status = :status', { status: 'active' })
        .andWhere('c.endDate IS NOT NULL')
        .andWhere('c.endDate < :today', { today })
        .orderBy('c.endDate', 'ASC')
        .limit(20)
        .getMany(),

      // 10 most recently created campaigns — activity feed
      this.campaignRepo
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.brandAccount', 'b')
        .orderBy('c.createdAt', 'DESC')
        .limit(10)
        .getMany(),
    ]);

    // Participant counts for the attention list
    const attentionIds = attentionRows.map((c) => c.id);
    const recentIds = recentRows.map((c) => c.id);
    const countMap = await this.campaignService.attachParticipantCounts(
      [...attentionRows, ...recentRows.filter((c) => !attentionIds.includes(c.id))],
    ).then((rows) => new Map(rows.map((r) => [r.id, (r as { participantCount?: number }).participantCount ?? 0])));

    const campaignsByStatus: Record<string, number> = {};
    for (const row of allStatusCounts) {
      campaignsByStatus[row.status] = Number(row.count);
    }

    return {
      totalCompanies,
      campaignsByStatus,
      needsAttention: attentionRows.map((c) => ({
        id: c.id,
        productName: c.productName,
        companyName: c.brandAccount?.name ?? null,
        endDate: c.endDate ?? '',
        participantCount: countMap.get(c.id) ?? 0,
      })),
      recentCampaigns: recentRows.map((c) => ({
        id: c.id,
        productName: c.productName,
        companyName: c.brandAccount?.name ?? null,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  }

  async getAdminUser(adminId: string): Promise<{ id: string; name: string; email: string } | null> {
    const admin = await this.adminUserRepo.findOne({ where: { id: adminId } });
    if (!admin) return null;
    return { id: admin.id, name: admin.name, email: admin.email };
  }

  async resetDemo(): Promise<{ message: string }> {
    const brandEmail = this.configService.get('DEMO_BRAND_EMAIL') ?? 'demo@brand.com';
    const demoBrand = await this.brandRepo.findOne({ where: { email: brandEmail } });

    // Delete all campaigns under the demo brand account (demo and any test real campaigns)
    const allDemoBrandCampaigns = demoBrand
      ? await this.campaignRepo.find({ where: { brandAccountId: demoBrand.id } })
      : await this.campaignRepo.find({ where: { isDemo: true } });

    for (const campaign of allDemoBrandCampaigns) {
      await this.aiReportRepo.delete({ campaignId: campaign.id });
      await this.surveyRepo.delete({ campaignId: campaign.id });
      await this.redemptionRepo.delete({ campaignId: campaign.id });
      await this.qrRepo.delete({ campaignId: campaign.id });
    }
    await this.campaignRepo.delete(
      demoBrand ? { brandAccountId: demoBrand.id } : { isDemo: true },
    );

    await this.consumerRepo
      .createQueryBuilder()
      .delete()
      .where('phone LIKE :pattern', { pattern: '+20100%' })
      .execute();

    await this.brandRepo
      .createQueryBuilder()
      .delete()
      .where('email = :email', { email: brandEmail })
      .execute();

    return { message: 'Demo data reset. Run /admin/seed to reseed.' };
  }

  private async seedConsumersAndResponses(
    campaignId: string,
    qrCodeId: string,
    count: number,
  ): Promise<void> {
    const ageWeights = [0.25, 0.35, 0.25, 0.1, 0.05];
    const genderWeights = [0.45, 0.55];

    for (let i = 0; i < count; i++) {
      const phone = `+20100${String(i).padStart(6, '0')}`;
      const ageRange = this.weightedPick(AGE_RANGES, ageWeights);
      const gender = this.weightedPick(GENDERS, genderWeights);
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];

      const consumer = await this.consumerRepo.save(
        this.consumerRepo.create({
          phone,
          name: `Consumer ${i + 1}`,
          ageRange,
          gender,
          city,
          interest: INTERESTS[Math.floor(Math.random() * INTERESTS.length)],
        }),
      );

      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 12);
      const redeemedAt = new Date(
        Date.now() - daysAgo * 86400000 - hoursAgo * 3600000,
      );

      const redemption = await this.redemptionRepo.save(
        this.redemptionRepo.create({
          consumerId: consumer.id,
          campaignId,
          qrCodeId,
          isDemoSeed: true,
          redeemedAt,
        } as Partial<RedemptionEvent>),
      );

      const q1Score = Math.random() < 0.7 ? 5 : Math.random() < 0.8 ? 4 : 3;
      const q2Score =
        ageRange === '25-34' && gender === 'female'
          ? Math.random() < 0.89 ? 5 : 4
          : Math.random() < 0.72 ? 5 : Math.random() < 0.85 ? 4 : 3;
      const descriptor = DESCRIPTORS[Math.floor(Math.random() * DESCRIPTORS.length)];
      const q4 = Math.random() < 0.56 ? 'Much Better' : Math.random() < 0.8 ? 'Better' : 'About the Same';

      await this.surveyRepo.save(
        this.surveyRepo.create({
          redemptionId: redemption.id,
          consumerId: consumer.id,
          campaignId,
          answers: { q1: q1Score, q2: q2Score, q3: descriptor, q4, q5: '' },
          isDemoSeed: true,
          completedAt: new Date(redeemedAt.getTime() + 90000),
        } as Partial<SurveyResponse>),
      );
    }
  }

  private weightedPick<T extends readonly string[]>(arr: T, weights: number[]): T[number] {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < arr.length; i++) {
      cumulative += weights[i] ?? 0;
      if (rand < cumulative) return arr[i] as T[number];
    }
    return arr[arr.length - 1] as T[number];
  }

  private buildDemoPhonePattern(): string {
    return '+20100';
  }
}
