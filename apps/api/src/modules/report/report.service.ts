import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiReport } from '../../entities/ai-report.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { Campaign } from '../../entities/campaign.entity';
import { BrandAccount, BrandSector } from '../../entities/brand-account.entity';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(AiReport)
    private readonly aiReportRepo: Repository<AiReport>,
    @InjectRepository(SurveyResponse)
    private readonly surveyRepo: Repository<SurveyResponse>,
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(BrandAccount)
    private readonly brandRepo: Repository<BrandAccount>,
    private readonly analyticsService: AnalyticsService,
    private readonly configService: ConfigService,
  ) {}

  async assertBrandOwnership(campaignId: string, brandId: string): Promise<void> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.brandAccountId !== brandId) throw new ForbiddenException('Access denied');
  }

  // Public Sample Report (Commercial V1 Completion Sprint, 2026-09-01):
  // powers the public marketing site's "View Sample Report" path — a
  // prospective Company must be able to see the deliverable before
  // logging in or buying anything. Deliberately hardcoded to the seeded
  // `isDemo: true` campaign only (admin.service.ts's seedDemo(), the
  // same campaign every /admin/seed/reset run recreates) — never accepts
  // a campaignId from the caller, so it can never expose real customer
  // data no matter what the public route is asked to render. Reuses
  // generatePdfData() unchanged; the existing `isDemo` flag already
  // drives the "SAMPLE DATA" badges/disclaimers throughout Report.tsx.
  async generatePublicSampleReport(): ReturnType<ReportService['generatePdfData']> {
    const demoCampaign = await this.campaignRepo.findOne({ where: { isDemo: true } });
    if (!demoCampaign) {
      throw new NotFoundException('No sample campaign is currently seeded.');
    }
    return this.generatePdfData(demoCampaign.id);
  }

  async getAiSummary(campaignId: string): Promise<{
    narrative: string;
    narrativeAr: string | null;
    responseCountAtGeneration: number;
    createdAt: string;
  }> {
    const cachedReport = await this.aiReportRepo.findOne({
      where: { campaignId, invalidatedAt: IsNull() },
      order: { generatedAt: 'DESC' },
    });

    const responseCount = await this.surveyRepo.count({ where: { campaignId } });

    // Cache is valid only if it matches the current response count AND already
    // has an Arabic narrative — older cached rows generated before bilingual
    // narratives existed are regenerated once to backfill narrativeAr.
    if (
      cachedReport &&
      cachedReport.responseCountAtGeneration === responseCount &&
      cachedReport.narrativeAr
    ) {
      return {
        narrative: cachedReport.narrative,
        narrativeAr: cachedReport.narrativeAr,
        responseCountAtGeneration: responseCount,
        createdAt: new Date(cachedReport.generatedAt).toISOString(),
      };
    }

    const { narrative, narrativeAr } = await this.generateNarrative(campaignId, responseCount);
    const createdAt = new Date().toISOString();

    await this.aiReportRepo.save(
      this.aiReportRepo.create({
        campaignId,
        narrative,
        narrativeAr,
        responseCountAtGeneration: responseCount,
      }),
    );

    return { narrative, narrativeAr, responseCountAtGeneration: responseCount, createdAt };
  }

  async generatePdfData(campaignId: string): Promise<{
    campaign: Campaign;
    company: { name: string; logoUrl: string | null; sector: BrandSector | null } | null;
    overview: Awaited<ReturnType<AnalyticsService['getOverview']>>;
    demographics: Awaited<ReturnType<AnalyticsService['getDemographics']>>;
    survey: Awaited<ReturnType<AnalyticsService['getSurveyBreakdown']>>;
    report: {
      narrative: string;
      narrativeAr: string | null;
      responseCountAtGeneration: number;
      createdAt: string;
    };
  }> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign ${campaignId} not found`);

    const [overview, demographics, survey, report] = await Promise.all([
      this.analyticsService.getOverview(campaignId),
      this.analyticsService.getDemographics(campaignId),
      this.analyticsService.getSurveyBreakdown(campaignId),
      this.getAiSummary(campaignId),
    ]);

    // Company Foundation (2026-09-01): cover branding only — graceful
    // fallback to null when the campaign has no owning brandAccountId
    // (legacy/demo shape) or the brand can't be found, so the Report's
    // pagination/data-calculation logic never has to special-case this.
    const company = campaign.brandAccountId
      ? await this.brandRepo.findOne({ where: { id: campaign.brandAccountId } })
      : null;

    return {
      campaign,
      company: company ? { name: company.name, logoUrl: company.logoUrl, sector: company.sector } : null,
      overview,
      demographics,
      survey,
      report,
    };
  }

  /** Below this response count, narrative language must hedge rather than assert. */
  private static readonly SMALL_SAMPLE_THRESHOLD = 30;

  private async generateNarrative(
    campaignId: string,
    responseCount: number,
  ): Promise<{ narrative: string; narrativeAr: string }> {
    const [overview, demographics, surveyData] = await Promise.all([
      this.analyticsService.getOverview(campaignId),
      this.analyticsService.getDemographics(campaignId),
      this.analyticsService.getSurveyBreakdown(campaignId),
    ]);

    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const topDemo = demographics.ageDistribution[0]?.label ?? 'unknown';
    const topGender = demographics.genderDistribution[0]?.label ?? 'unknown';
    const topCity = demographics.cityDistribution[0]?.label ?? 'Cairo';
    const topDescriptor = surveyData.questionBreakdown['q3']?.[0]?.label ?? 'positive';
    const verbatimsSample = surveyData.verbatims.slice(0, 2).join('; ');
    const isSmallSample = overview.totalRedemptions < ReportService.SMALL_SAMPLE_THRESHOLD;

    const promptData = {
      brandName: campaign.brandName,
      productName: campaign.productName,
      locationName: campaign.locationName ?? 'Cairo',
      totalConsumers: overview.totalRedemptions,
      purchaseIntentPercent: overview.purchaseIntentPercent,
      completionRate: overview.completionRate,
      topAgeRange: topDemo,
      topGender,
      topCity,
      topDescriptor,
      verbatims: verbatimsSample,
      isSmallSample,
    };

    const fallbackData = {
      brandName: campaign.brandName,
      productName: campaign.productName,
      totalConsumers: overview.totalRedemptions,
      purchaseIntentPercent: overview.purchaseIntentPercent,
      topAgeRange: topDemo,
      topGender,
      topDescriptor,
      topCity,
      isSmallSample,
    };

    try {
      const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
      const openaiKey = this.configService.get<string>('OPENAI_API_KEY');

      if (anthropicKey || openaiKey) {
        const callLlm = (prompt: string) =>
          anthropicKey ? this.callAnthropic(prompt, anthropicKey) : this.callOpenAI(prompt, openaiKey!);

        const [narrative, narrativeAr] = await Promise.all([
          callLlm(this.buildPrompt(promptData, 'en')),
          callLlm(this.buildPrompt(promptData, 'ar')),
        ]);

        return {
          narrative: narrative || this.buildFallbackNarrative(fallbackData, 'en'),
          narrativeAr: narrativeAr || this.buildFallbackNarrative(fallbackData, 'ar'),
        };
      }

      this.logger.warn('No AI API key configured — returning structured fallback narrative');
      return {
        narrative: this.buildFallbackNarrative(fallbackData, 'en'),
        narrativeAr: this.buildFallbackNarrative(fallbackData, 'ar'),
      };
    } catch (error) {
      this.logger.error('AI narrative generation failed', error);
      return {
        narrative: this.buildFallbackNarrative(fallbackData, 'en'),
        narrativeAr: this.buildFallbackNarrative(fallbackData, 'ar'),
      };
    }
  }

  private buildPrompt(
    data: {
      brandName: string;
      productName: string;
      locationName: string;
      totalConsumers: number;
      purchaseIntentPercent: number;
      completionRate: number;
      topAgeRange: string;
      topGender: string;
      topCity: string;
      topDescriptor: string;
      verbatims: string;
      isSmallSample: boolean;
    },
    lang: 'en' | 'ar',
  ): string {
    const languageInstruction =
      lang === 'ar'
        ? 'Write the entire briefing in Modern Standard Arabic suitable for an Egyptian brand marketing director. Do not leave any sentence in English.'
        : 'Write in English.';

    const sampleSizeInstruction = data.isSmallSample
      ? `This is a small sample (${data.totalConsumers} participants). Use hedged, directional language ("suggests", "an early signal", "worth validating further") — do not state findings as proven or representative of the broader market.`
      : `Sample size is ${data.totalConsumers} participants — still describe findings as directional trial evidence, not as proof of market-wide behavior.`;

    return `You are a senior consumer insights analyst writing an executive briefing for a research report.

Campaign: ${data.brandName} — ${data.productName}
Location: ${data.locationName}
Total consumers who completed a physical product trial: ${data.totalConsumers}
Survey completion rate: ${data.completionRate}%
Purchase intent (would buy at retail): ${data.purchaseIntentPercent}%
Strongest demographic: ${data.topGender}, age ${data.topAgeRange}
Top city (sample concentration, not a market claim): ${data.topCity}
Most common product descriptor chosen by consumers: "${data.topDescriptor}"
Sample consumer verbatims: ${data.verbatims || 'N/A'}

Write exactly 4-6 sentences of executive insight for a brand marketing director. Rules:
- Be specific — use the numbers
- Name the strongest demographic segment and its intent score, framed as an observation from this sample, not a proven market fact
- Reference the product descriptor
- ${sampleSizeInstruction}
- Do not claim the sample is representative of the broader consumer market
- Do not state that any city or segment is "the best" market without qualifying it as sample-based
- End with one recommendation, phrased as "consider..." or "this suggests...", not as a directive presented as certain
- ${languageInstruction}
- Do not use filler phrases like "Overall" or "In conclusion"
- Sound like a human analyst, not a template`;
  }

  private async callAnthropic(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    return data.content[0]?.text?.trim() ?? '';
  }

  private async callOpenAI(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 350,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are a senior consumer insights analyst.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content?.trim() ?? '';
  }

  private buildFallbackNarrative(
    data: {
      brandName: string;
      productName: string;
      totalConsumers: number;
      purchaseIntentPercent: number;
      topAgeRange: string;
      topGender: string;
      topDescriptor: string;
      topCity: string;
      isSmallSample: boolean;
    },
    lang: 'en' | 'ar',
  ): string {
    const hedgeEn = data.isSmallSample
      ? ' This is a small sample, so treat the segment signal as directional rather than conclusive.'
      : '';
    const hedgeAr = data.isSmallSample
      ? ' هذه عينة صغيرة، لذا يجب التعامل مع إشارة القطاع كمؤشر توجيهي وليس نتيجة قاطعة.'
      : '';

    if (lang === 'ar') {
      return `من إجمالي ${data.totalConsumers} مستهلكاً شاركوا في تجربة ${data.productName}، أشار ${data.purchaseIntentPercent}% إلى نيتهم شراء المنتج بسعر التجزئة. سجّلت فئة ${data.topGender} بعمر ${data.topAgeRange} أعلى نية شراء ضمن هذه العينة.${hedgeAr} التوصيف الأكثر اختياراً من قِبل المستهلكين كان "${data.topDescriptor}". بناءً على هذه الإشارات، يُقترح دراسة إعطاء أولوية لفئة ${data.topGender} بعمر ${data.topAgeRange} عند التخطيط للتوزيع الأولي، مع الأخذ في الاعتبار أن ${data.topCity} كانت موقع التجربة وليست بالضرورة السوق الأمثل.`;
    }

    return `Of the ${data.totalConsumers} consumers who participated in the ${data.productName} trial, ${data.purchaseIntentPercent}% indicated they would purchase the product at retail. The ${data.topGender} ${data.topAgeRange} segment showed the highest purchase intent within this sample.${hedgeEn} The most frequently chosen product descriptor was "${data.topDescriptor}". Based on these signals, consider prioritizing the ${data.topGender} ${data.topAgeRange} segment in initial retail planning — noting that ${data.topCity} was the trial location, not a confirmed target market.`;
  }
}
