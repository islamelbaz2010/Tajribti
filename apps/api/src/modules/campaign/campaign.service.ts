import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus, SurveyQuestion } from '../../entities/campaign.entity';
import { QrCode } from '../../entities/qr-code.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';

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
  ) {}

  async createCampaign(brandAccountId: string, dto: CreateCampaignDto): Promise<Campaign> {
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
      surveyQuestions: DEFAULT_SURVEY_QUESTIONS,
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
}
