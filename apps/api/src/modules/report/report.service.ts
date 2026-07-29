import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiReport } from '../../entities/ai-report.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { Campaign } from '../../entities/campaign.entity';
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
    private readonly analyticsService: AnalyticsService,
    private readonly configService: ConfigService,
  ) {}

  async getAiSummary(campaignId: string): Promise<{ narrative: string; cached: boolean }> {
    const cachedReport = await this.aiReportRepo.findOne({
      where: { campaignId, invalidatedAt: IsNull() },
      order: { generatedAt: 'DESC' },
    });

    const responseCount = await this.surveyRepo.count({ where: { campaignId } });

    if (cachedReport && cachedReport.responseCountAtGeneration === responseCount) {
      return { narrative: cachedReport.narrative, cached: true };
    }

    const narrative = await this.generateNarrative(campaignId, responseCount);

    await this.aiReportRepo.save(
      this.aiReportRepo.create({
        campaignId,
        narrative,
        responseCountAtGeneration: responseCount,
      }),
    );

    return { narrative, cached: false };
  }

  async generatePdfData(campaignId: string): Promise<{
    campaign: Campaign;
    overview: Awaited<ReturnType<AnalyticsService['getOverview']>>;
    demographics: Awaited<ReturnType<AnalyticsService['getDemographics']>>;
    surveyData: Awaited<ReturnType<AnalyticsService['getSurveyBreakdown']>>;
    narrative: string;
    generatedAt: string;
  }> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign ${campaignId} not found`);

    const [overview, demographics, surveyData, { narrative }] = await Promise.all([
      this.analyticsService.getOverview(campaignId),
      this.analyticsService.getDemographics(campaignId),
      this.analyticsService.getSurveyBreakdown(campaignId),
      this.getAiSummary(campaignId),
    ]);

    return {
      campaign,
      overview,
      demographics,
      surveyData,
      narrative,
      generatedAt: new Date().toISOString(),
    };
  }

  private async generateNarrative(campaignId: string, responseCount: number): Promise<string> {
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

    const prompt = this.buildPrompt({
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
    });

    try {
      const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
      if (anthropicKey) {
        return await this.callAnthropic(prompt, anthropicKey);
      }

      const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (openaiKey) {
        return await this.callOpenAI(prompt, openaiKey);
      }

      this.logger.warn('No AI API key configured — returning structured fallback narrative');
      return this.buildFallbackNarrative({
        brandName: campaign.brandName,
        productName: campaign.productName,
        totalConsumers: overview.totalRedemptions,
        purchaseIntentPercent: overview.purchaseIntentPercent,
        topAgeRange: topDemo,
        topGender,
        topDescriptor,
        topCity,
      });
    } catch (error) {
      this.logger.error('AI narrative generation failed', error);
      return this.buildFallbackNarrative({
        brandName: campaign.brandName,
        productName: campaign.productName,
        totalConsumers: overview.totalRedemptions,
        purchaseIntentPercent: overview.purchaseIntentPercent,
        topAgeRange: topDemo,
        topGender,
        topDescriptor,
        topCity,
      });
    }
  }

  private buildPrompt(data: {
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
  }): string {
    return `You are a senior consumer insights analyst writing an executive briefing.

Campaign: ${data.brandName} — ${data.productName}
Location: ${data.locationName}
Total consumers who completed a physical product trial: ${data.totalConsumers}
Survey completion rate: ${data.completionRate}%
Purchase intent (would buy at retail): ${data.purchaseIntentPercent}%
Strongest demographic: ${data.topGender}, age ${data.topAgeRange}
Top city: ${data.topCity}
Most common product descriptor chosen by consumers: "${data.topDescriptor}"
Sample consumer verbatims: ${data.verbatims || 'N/A'}

Write exactly 4-6 sentences of executive insight for a brand marketing director. Rules:
- Be specific — use the numbers
- Name the strongest demographic segment and its intent score
- Reference the product descriptor
- End with one concrete, actionable recommendation for launch planning
- Write in English
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

  private buildFallbackNarrative(data: {
    brandName: string;
    productName: string;
    totalConsumers: number;
    purchaseIntentPercent: number;
    topAgeRange: string;
    topGender: string;
    topDescriptor: string;
    topCity: string;
  }): string {
    return `Of the ${data.totalConsumers} consumers who completed a verified first-trial of ${data.productName}, ${data.purchaseIntentPercent}% indicated they would purchase the product at retail — a strong signal for a pre-launch validation. The ${data.topGender} ${data.topAgeRange} segment demonstrated the highest engagement and purchase intent, representing the primary target demographic for distribution planning. The most frequently chosen product descriptor among trial participants was "${data.topDescriptor}", suggesting the brand's intended positioning is landing effectively with Cairo consumers. Recommendation: prioritize the ${data.topGender} ${data.topAgeRange} segment in initial retail seeding and concentrate distribution in ${data.topCity} where trial density was highest.`;
  }
}
