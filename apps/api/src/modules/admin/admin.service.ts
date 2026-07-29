import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Campaign, CampaignStatus, SurveyQuestion } from '../../entities/campaign.entity';
import { QrCode, QrCodeStatus } from '../../entities/qr-code.entity';
import { Consumer } from '../../entities/consumer.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { BrandAccount } from '../../entities/brand-account.entity';
import { ConfigService } from '@nestjs/config';

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
    private readonly configService: ConfigService,
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
        productImage: 'https://placehold.co/400x400/1a1a2e/ffffff?text=Product',
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

  async resetDemo(): Promise<{ message: string }> {
    const demos = await this.campaignRepo.find({ where: { isDemo: true } });
    for (const campaign of demos) {
      await this.surveyRepo.delete({ campaignId: campaign.id });
      await this.redemptionRepo.delete({ campaignId: campaign.id });
      await this.qrRepo.delete({ campaignId: campaign.id });
    }
    await this.campaignRepo.delete({ isDemo: true });

    await this.consumerRepo.delete({ phone: this.buildDemoPhonePattern() });

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
      const phone = `+20${100000000 + i + Math.floor(Math.random() * 1000)}`;
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
