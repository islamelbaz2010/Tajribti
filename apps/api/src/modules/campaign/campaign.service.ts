import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus, SurveyQuestion } from '../../entities/campaign.entity';
import { QrCode } from '../../entities/qr-code.entity';
import { BrandContact } from '../../entities/brand-contact.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

const DEFAULT_SURVEY_QUESTIONS: SurveyQuestion[] = [
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
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(QrCode)
    private readonly qrCodeRepo: Repository<QrCode>,
    @InjectRepository(BrandContact)
    private readonly brandContactRepo: Repository<BrandContact>,
  ) {}

  async createCampaign(brandAccountId: string, dto: CreateCampaignDto): Promise<Campaign> {
    this.validateDateRange(dto.startDate ?? null, dto.endDate ?? null);
    if (dto.contactId) {
      await this.assertContactOwnership(brandAccountId, dto.contactId);
    }
    const campaign = this.campaignRepo.create({
      brandAccountId,
      brandName: dto.brandName,
      productName: dto.productName,
      productImage: dto.productImage ?? null,
      description: dto.description ?? null,
      locationName: dto.locationName ?? null,
      locationAddress: dto.locationAddress ?? null,
      rewardPoints: dto.rewardPoints,
      targetCount: dto.targetCount,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
      contactId: dto.contactId ?? null,
      // Internal per-campaign research configuration (DL-057 scope): use
      // the provided question set if Tajribti's team prepared one for
      // this campaign's sector/product, otherwise the existing standard
      // 5-question trial survey — same shape either way, no builder.
      surveyQuestions: dto.surveyQuestions ?? DEFAULT_SURVEY_QUESTIONS,
      status: CampaignStatus.ACTIVE,
      isDemo: false,
    });
    return this.campaignRepo.save(campaign);
  }

  async findByBrand(brandAccountId: string): Promise<Campaign[]> {
    return this.campaignRepo.find({
      where: { brandAccountId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Campaign[]> {
    return this.campaignRepo.find({
      where: { status: CampaignStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async findDemoActive(): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOne({
      where: { isDemo: true, status: CampaignStatus.ACTIVE },
    });

    if (!campaign) {
      throw new NotFoundException('Demo campaign not found. Run the seed script first.');
    }

    return campaign;
  }

  async findById(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }
    return campaign;
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignRepo.find({ order: { createdAt: 'DESC' } });
  }

  // Internal Tajribti Campaign Operations (DL-055 item 1): campaign
  // status/lifecycle and field edits. Same ownership pattern already used
  // in analytics.service.ts — a brand may only update its own campaigns.
  // isDemo and brandAccountId are intentionally not editable here
  // (ownership is not reassignable). surveyQuestions may be updated within
  // the Survey Builder V2 bounds — see validateSurveyQuestionEdit below.
  async updateCampaign(
    brandAccountId: string,
    id: string,
    dto: UpdateCampaignDto,
  ): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }
    if (campaign.brandAccountId !== brandAccountId) {
      throw new ForbiddenException('Access denied');
    }
    return this.applyUpdate(campaign, dto);
  }

  // Admin Operations (Product Reference Alignment, 2026-09-02): the exact
  // same update logic as updateCampaign() above, minus the per-Company
  // ownership check — Admin's cross-Company authorization already
  // happened at the controller (the admin-auth gate every /admin/*
  // route requires), which stands in for the ownership check every other
  // caller of applyUpdate() goes through. No new campaign fields, no new
  // lifecycle state, no separate validation path: this is the Company
  // owner's own edit/status-change capability, exercised by an
  // authorized operator instead of the owner. Addresses the benchmark's
  // "TAJRIBTI Operations must be able to actually operate campaigns
  // (launch/pause/close)" finding — previously Admin could only read.
  async updateCampaignAsAdmin(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id } });
    if (!campaign) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }
    return this.applyUpdate(campaign, dto);
  }

  private async applyUpdate(campaign: Campaign, dto: UpdateCampaignDto): Promise<Campaign> {
    if (dto.productName !== undefined) campaign.productName = dto.productName;
    if (dto.productImage !== undefined) campaign.productImage = dto.productImage;
    if (dto.description !== undefined) campaign.description = dto.description;
    if (dto.locationName !== undefined) campaign.locationName = dto.locationName;
    if (dto.locationAddress !== undefined) campaign.locationAddress = dto.locationAddress;
    if (dto.rewardPoints !== undefined) campaign.rewardPoints = dto.rewardPoints;
    if (dto.targetCount !== undefined) campaign.targetCount = dto.targetCount;
    // Empty string -> clear to null rather than pass through: the current
    // Dashboard UI never sends "" (it omits the field instead), but an
    // empty string reaching the Postgres `date` column directly is an
    // invalid literal and would otherwise 500 instead of clearing the date.
    if (dto.startDate !== undefined) campaign.startDate = dto.startDate || null;
    if (dto.endDate !== undefined) campaign.endDate = dto.endDate || null;
    if (dto.status !== undefined) campaign.status = dto.status;
    if (dto.contactId !== undefined) {
      if (dto.contactId) {
        await this.assertContactOwnership(campaign.brandAccountId ?? '', dto.contactId);
      }
      campaign.contactId = dto.contactId || null;
    }
    if (dto.surveyQuestions !== undefined) {
      this.validateSurveyQuestionEdit(campaign.surveyQuestions, dto.surveyQuestions);
      campaign.surveyQuestions = dto.surveyQuestions;
    }
    // Validated against the campaign's resulting state (not just the DTO),
    // so this correctly catches e.g. only endDate being edited to before
    // an unchanged, already-stored startDate.
    this.validateDateRange(campaign.startDate, campaign.endDate);

    return this.campaignRepo.save(campaign);
  }

  // Company Foundation (2026-09-01): a campaign may only reference a
  // contact belonging to its own owning Company — same ownership-scoping
  // discipline as every other brand-scoped resource in this codebase
  // (analytics/report/media all assert `resource.brandAccountId === brandId`).
  private async assertContactOwnership(brandAccountId: string, contactId: string): Promise<void> {
    const contact = await this.brandContactRepo.findOne({ where: { id: contactId } });
    if (!contact || contact.brandAccountId !== brandAccountId) {
      throw new BadRequestException('Contact not found for this company');
    }
  }

  // Campaign Scheduling (2026-09-01): the one cross-field validation date
  // fields need. Both fields are optional (a campaign may have no dates,
  // or only one), so this only rejects the case where both are present
  // and end precedes start.
  private validateDateRange(startDate: string | null, endDate: string | null): void {
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException('End date cannot be earlier than start date.');
    }
  }

  // Survey Builder V2 (Company Console Product Maturation, 2026-09-01;
  // ordering fixed 2026-09-01): "core" is an IDENTITY, not a position.
  // analytics.service.ts reads answers by fixed key (q2 = purchase intent
  // scale, q3 = descriptor choice, q5 = free text) looked up in the
  // `answers` jsonb object — a dictionary keyed by question id, never by
  // array index. That means a core question's ARRAY POSITION can change
  // freely without affecting analytics identity at all; only removing a
  // core id or changing its type would corrupt those sections. The
  // original implementation conflated the two (blocked reordering into
  // the first 5 array slots), which trapped every custom question after
  // the core set even though nothing about analytics required that.
  // Reserved ids q1–q5 are the core set for every campaign (the shape
  // DEFAULT_SURVEY_QUESTIONS and every Create Campaign submission already
  // use); anything else is a free "custom" question — add, remove,
  // reorder anywhere (including between/before core questions), or
  // retype, because analytics.service.ts picks those up generically by id
  // (see getSurveyBreakdown), not by position.
  private static readonly CORE_QUESTION_IDS = new Set(['q1', 'q2', 'q3', 'q4', 'q5']);

  private validateSurveyQuestionEdit(
    current: SurveyQuestion[],
    proposed: SurveyQuestion[],
  ): void {
    const currentCore = new Map(
      current
        .filter((q) => CampaignService.CORE_QUESTION_IDS.has(q.id))
        .map((q) => [q.id, q] as const),
    );
    const proposedById = new Map(proposed.map((q) => [q.id, q] as const));

    // Every core question that exists today must still exist, with its
    // type unchanged, somewhere in the proposed list. Its array position
    // may move freely.
    for (const [id, coreQuestion] of currentCore) {
      const match = proposedById.get(id);
      if (!match) {
        throw new BadRequestException(
          `Cannot remove core question ${id} — it can be reordered anywhere in the survey, but not removed.`,
        );
      }
      if (match.type !== coreQuestion.type) {
        throw new BadRequestException(
          `Question ${id} is a core question and must keep its existing type — only its wording/options/position may change.`,
        );
      }
    }

    // A new/custom question may not claim a reserved core id it didn't
    // already have — prevents silently taking over that id's analytics
    // identity (e.g. a custom question renamed to "q2").
    for (const q of proposed) {
      if (CampaignService.CORE_QUESTION_IDS.has(q.id) && !currentCore.has(q.id)) {
        throw new BadRequestException(
          `"${q.id}" is a reserved core question id and cannot be used by a new question.`,
        );
      }
    }

    const ids = proposed.map((q) => q.id);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Survey questions must have unique ids.');
    }
  }
}
