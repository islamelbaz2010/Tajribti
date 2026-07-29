import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { Consumer } from '../../entities/consumer.entity';

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export interface LiveFeedEntry {
  id: string;
  gender: string | null;
  ageRange: string | null;
  city: string | null;
  redeemedAt: Date;
}

export interface OverviewData {
  totalRedemptions: number;
  surveyCompletions: number;
  completionRate: number;
  purchaseIntentPercent: number;
  liveFeed: LiveFeedEntry[];
}

export interface DemographicsData {
  ageDistribution: DistributionItem[];
  genderDistribution: DistributionItem[];
  cityDistribution: DistributionItem[];
}

export interface SurveyData {
  purchaseIntentScore: number;
  purchaseIntentDistribution: DistributionItem[];
  questionBreakdown: Record<string, { label: string; count: number }[]>;
  verbatims: string[];
}

export interface Participant {
  id: string;
  ageRange: string | null;
  gender: string | null;
  city: string | null;
  redeemedAt: Date;
  hasSurvey: boolean;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(RedemptionEvent)
    private readonly redemptionRepo: Repository<RedemptionEvent>,
    @InjectRepository(SurveyResponse)
    private readonly surveyRepo: Repository<SurveyResponse>,
    @InjectRepository(Consumer)
    private readonly consumerRepo: Repository<Consumer>,
  ) {}

  async getOverview(campaignId: string): Promise<OverviewData> {
    const redemptions = await this.redemptionRepo.find({
      where: { campaignId },
      relations: ['consumer'],
      order: { redeemedAt: 'DESC' },
    });

    const surveys = await this.surveyRepo.find({ where: { campaignId } });

    const totalRedemptions = redemptions.length;
    const surveyCompletions = surveys.length;
    const completionRate =
      totalRedemptions > 0
        ? Math.round((surveyCompletions / totalRedemptions) * 100)
        : 0;

    const purchaseIntentPercent = this.calcPurchaseIntentPercent(surveys);

    const liveFeed: LiveFeedEntry[] = redemptions.slice(0, 10).map((r) => ({
      id: r.id,
      gender: r.consumer?.gender ?? null,
      ageRange: r.consumer?.ageRange ?? null,
      city: r.consumer?.city ?? null,
      redeemedAt: r.redeemedAt,
    }));

    return {
      totalRedemptions,
      surveyCompletions,
      completionRate,
      purchaseIntentPercent,
      liveFeed,
    };
  }

  async getDemographics(campaignId: string): Promise<DemographicsData> {
    const redemptions = await this.redemptionRepo.find({
      where: { campaignId },
      relations: ['consumer'],
    });

    const consumers = redemptions.map((r) => r.consumer).filter(Boolean);

    return {
      ageDistribution: this.buildDistribution(
        consumers.map((c) => c.ageRange ?? 'Unknown'),
      ),
      genderDistribution: this.buildDistribution(
        consumers.map((c) => c.gender ?? 'Unknown'),
      ),
      cityDistribution: this.buildDistribution(
        consumers.map((c) => c.city ?? 'Unknown'),
      ),
    };
  }

  async getSurveyBreakdown(campaignId: string): Promise<SurveyData> {
    const surveys = await this.surveyRepo.find({ where: { campaignId } });

    const purchaseIntentValues = surveys
      .map((s) => {
        const q2 = s.answers['q2'];
        return typeof q2 === 'number' ? q2 : null;
      })
      .filter((v): v is number => v !== null);

    const purchaseIntentScore =
      purchaseIntentValues.length > 0
        ? Math.round(
            (purchaseIntentValues.reduce((a, b) => a + b, 0) /
              purchaseIntentValues.length) *
              20,
          )
        : 0;

    const intents5 = purchaseIntentValues.filter((v) => v === 5).length;
    const intents4 = purchaseIntentValues.filter((v) => v === 4).length;
    const total = purchaseIntentValues.length || 1;

    const purchaseIntentDistribution: DistributionItem[] = [
      {
        label: 'Would Buy',
        count: intents5,
        percentage: Math.round((intents5 / total) * 100),
      },
      {
        label: 'Probably',
        count: intents4,
        percentage: Math.round((intents4 / total) * 100),
      },
      {
        label: 'Unsure',
        count: total - intents5 - intents4,
        percentage: Math.round(((total - intents5 - intents4) / total) * 100),
      },
    ];

    const q3Values = surveys.map((s) => s.answers['q3']).filter(Boolean);
    const q3Dist = this.buildStringDistribution(
      q3Values.map((v) => String(v)),
    );

    const verbatims = surveys
      .map((s) => s.answers['q5'])
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .slice(0, 5);

    return {
      purchaseIntentScore,
      purchaseIntentDistribution,
      questionBreakdown: {
        q3: q3Dist,
      },
      verbatims,
    };
  }

  async getParticipants(
    campaignId: string,
    page = 1,
    limit = 20,
  ): Promise<{ participants: Participant[]; total: number }> {
    const [redemptions, total] = await this.redemptionRepo.findAndCount({
      where: { campaignId },
      relations: ['consumer', 'surveyResponse'],
      order: { redeemedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const participants: Participant[] = redemptions.map((r) => ({
      id: r.id,
      ageRange: r.consumer?.ageRange ?? null,
      gender: r.consumer?.gender ?? null,
      city: r.consumer?.city ?? null,
      redeemedAt: r.redeemedAt,
      hasSurvey: !!r.surveyResponse,
    }));

    return { participants, total };
  }

  private calcPurchaseIntentPercent(surveys: SurveyResponse[]): number {
    if (surveys.length === 0) return 0;
    const positiveIntent = surveys.filter((s) => {
      const q2 = s.answers['q2'];
      return typeof q2 === 'number' && q2 >= 4;
    }).length;
    return Math.round((positiveIntent / surveys.length) * 100);
  }

  private buildDistribution(values: string[]): DistributionItem[] {
    const counts = values.reduce<Record<string, number>>((acc, val) => {
      acc[val] = (acc[val] ?? 0) + 1;
      return acc;
    }, {});

    const total = values.length || 1;
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100),
      }));
  }

  private buildStringDistribution(
    values: string[],
  ): { label: string; count: number }[] {
    const counts = values.reduce<Record<string, number>>((acc, val) => {
      acc[val] = (acc[val] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([label, count]) => ({ label, count }));
  }
}
