import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { Consumer } from '../../entities/consumer.entity';
import { Campaign } from '../../entities/campaign.entity';
import { CampaignVerification } from '../../entities/campaign-verification.entity';

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
  // DL-104 (2026-09-06): Sampl benchmark — "Journey completion/drop-off is
  // measurable by stage." verificationCount is stage 1 (OTP verified);
  // totalRedemptions is stage 2 (QR redeemed); surveyCompletions is stage 3.
  // All three numbers exist in the current DB — no new migration needed.
  verificationCount: number;
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

// Survey Builder V2 (2026-09-01): generic result for any question beyond
// the core 5 (see campaign.service.ts CORE_QUESTION_COUNT) — computed by
// type rather than by a hardcoded id, since custom questions have no fixed
// key the way q2/q3/q5 do.
export interface CustomQuestionResult {
  id: string;
  text: string;
  textAr: string;
  type: 'stars' | 'scale' | 'multiple_choice' | 'text';
  responseCount: number;
  breakdown?: { label: string; count: number }[]; // multiple_choice
  average?: number; // stars/scale
  verbatims?: string[]; // text
}

// Reference Product Benchmark, Insights/Segmentation (2026-09-02): Sampl's
// "review rate and purchase intent can be viewed by audience segment" and
// Zamplit's "insights include...audience differences" — the product
// already computed demographics (getDemographics) and purchase intent
// (here) as two entirely separate distributions, but never the one thing
// both references name explicitly: whether purchase intent actually
// *differs* across the sample's own segments. `respondentCount` is always
// shown alongside the percentage — this campaign's own evidence discipline
// (visible sample size, no unsupported segmentation) applies here exactly
// as it does everywhere else in the product.
export interface SegmentPurchaseIntent {
  label: string;
  respondentCount: number;
  positiveIntentPercent: number;
}

export interface SurveyData {
  purchaseIntentScore: number;
  purchaseIntentDistribution: DistributionItem[];
  purchaseIntentBySegment: {
    byGender: SegmentPurchaseIntent[];
    byAgeRange: SegmentPurchaseIntent[];
  };
  questionBreakdown: Record<string, { label: string; count: number }[]>;
  verbatims: string[];
  customQuestions: CustomQuestionResult[];
  // Product Completion Wave (2026-09-02): q1 ("first impression", stars,
  // 1-5) and q4 ("compared to similar products", multiple_choice) are
  // captured on every campaign — the same default 5-question survey that
  // has always existed — but were never computed or surfaced anywhere in
  // the product (Company Console, Report, or Admin Control Center all
  // stopped at q2/q3/q5). Added here, not as new upstream data collection
  // — the answers already exist in every SurveyResponse row. q1's type
  // (stars, protected/immutable per validateSurveyQuestionEdit) means an
  // average is the correct summary, matching the pattern already used for
  // custom stars/scale questions below; q4 is multiple_choice, so it fits
  // the existing questionBreakdown shape exactly like q3 does — added as
  // questionBreakdown.q4 rather than a new field.
  firstImpressionScore: { average: number; responseCount: number };
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
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(CampaignVerification)
    private readonly verificationRepo: Repository<CampaignVerification>,
  ) {}

  async assertBrandOwnership(campaignId: string, brandId: string): Promise<void> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.brandAccountId !== brandId) throw new ForbiddenException('Access denied');
  }

  async getOverview(campaignId: string): Promise<OverviewData> {
    const [redemptions, surveys, verificationCount] = await Promise.all([
      this.redemptionRepo.find({
        where: { campaignId },
        relations: ['consumer'],
        order: { redeemedAt: 'DESC' },
      }),
      this.surveyRepo.find({ where: { campaignId } }),
      // DL-104: stage 1 of the journey funnel — consumers who completed OTP
      // verification for this campaign. Loaded as a count to avoid pulling
      // full rows for a number we only display as a metric.
      this.verificationRepo.count({ where: { campaignId } }),
    ]);

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
      verificationCount,
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

  // Survey Builder V2 (2026-09-01; ordering fixed 2026-09-01): a Company's
  // own campaign/product-specific additions — anything whose id is not one
  // of the reserved core ids (campaign.service.ts CORE_QUESTION_IDS).
  // Identity-based, not positional: custom questions can be reordered
  // anywhere in `surveyQuestions` (including before/between core
  // questions), so slicing by array position would incorrectly include a
  // relocated core question or exclude a relocated custom one.
  private static readonly CORE_QUESTION_IDS = new Set(['q1', 'q2', 'q3', 'q4', 'q5']);

  async getSurveyBreakdown(campaignId: string): Promise<SurveyData> {
    // `relations: ['consumer']` added for purchaseIntentBySegment below —
    // one join on the same query, not a second round trip; every other
    // read in this function is unaffected (SurveyResponse.answers, used by
    // all of them, was already being selected).
    const surveys = await this.surveyRepo.find({ where: { campaignId }, relations: ['consumer'] });
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });

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

    // q4 ("Compared to similar products, this is:") — multiple_choice,
    // same shape/extraction pattern as q3 above.
    const q4Values = surveys.map((s) => s.answers['q4']).filter(Boolean);
    const q4Dist = this.buildStringDistribution(
      q4Values.map((v) => String(v)),
    );

    // q1 ("What was your first impression of this product?") — stars,
    // same average-extraction pattern already used for custom stars/scale
    // questions further down this function.
    const q1Values = surveys
      .map((s) => s.answers['q1'])
      .filter((v): v is number => typeof v === 'number');
    const firstImpressionScore = {
      average: q1Values.length > 0
        ? Math.round((q1Values.reduce((a, b) => a + b, 0) / q1Values.length) * 10) / 10
        : 0,
      responseCount: q1Values.length,
    };

    const verbatims = this.extractVerbatims(surveys, 'q5');

    // Survey Builder V2: generic result for every question beyond the core
    // 5, computed by type — no hardcoded id the way q2/q3/q5 are, because
    // a Company's custom questions have no fixed key.
    const customQuestions: CustomQuestionResult[] = (
      campaign?.surveyQuestions.filter((q) => !AnalyticsService.CORE_QUESTION_IDS.has(q.id)) ?? []
    ).map((q) => {
      const answered = surveys
        .map((s) => s.answers[q.id])
        .filter((v) => v !== undefined && v !== null && v !== '');
      const base = {
        id: q.id,
        text: q.text,
        textAr: q.textAr,
        type: q.type,
        responseCount: answered.length,
      };
      if (q.type === 'multiple_choice') {
        return { ...base, breakdown: this.buildStringDistribution(answered.map(String)) };
      }
      if (q.type === 'stars' || q.type === 'scale') {
        const numeric = answered.filter((v): v is number => typeof v === 'number');
        return {
          ...base,
          average: numeric.length > 0
            ? Math.round((numeric.reduce((a, b) => a + b, 0) / numeric.length) * 10) / 10
            : 0,
        };
      }
      return { ...base, verbatims: this.extractVerbatims(surveys, q.id) };
    });

    return {
      purchaseIntentScore,
      purchaseIntentDistribution,
      purchaseIntentBySegment: {
        byGender: this.buildPurchaseIntentBySegment(surveys, (s) => s.consumer?.gender ?? null),
        byAgeRange: this.buildPurchaseIntentBySegment(surveys, (s) => s.consumer?.ageRange ?? null),
      },
      questionBreakdown: {
        q3: q3Dist,
        q4: q4Dist,
      },
      verbatims,
      customQuestions,
      firstImpressionScore,
    };
  }

  // Groups survey responses by an arbitrary demographic key (gender, age
  // range) and reuses the existing calcPurchaseIntentPercent() — the same
  // Top-2-Box (q2>=4) convention already used for the campaign-wide
  // purchaseIntentPercent everywhere else — per group, rather than
  // introducing a second definition of "positive intent". Segments with
  // zero responses are simply absent, not shown as 0%.
  private buildPurchaseIntentBySegment(
    surveys: SurveyResponse[],
    segmentOf: (s: SurveyResponse) => string | null,
  ): SegmentPurchaseIntent[] {
    const bySegment = new Map<string, SurveyResponse[]>();
    for (const s of surveys) {
      const label = segmentOf(s) ?? 'Unknown';
      if (!bySegment.has(label)) bySegment.set(label, []);
      bySegment.get(label)!.push(s);
    }
    return Array.from(bySegment.entries())
      .map(([label, group]) => ({
        label,
        respondentCount: group.length,
        positiveIntentPercent: this.calcPurchaseIntentPercent(group),
      }))
      .sort((a, b) => b.respondentCount - a.respondentCount);
  }

  // Shared quality gate for any free-text question (q5 or a custom text
  // question): reject empty, very short, or single-token entries (e.g.
  // "test", "vvgv", "ok") that are not meaningful qualitative signal. A
  // defensible minimum bar, not content rewriting — genuine short feedback
  // with a space ("too sweet") still passes; single junk tokens do not.
  private extractVerbatims(surveys: SurveyResponse[], questionId: string): string[] {
    const MIN_VERBATIM_LENGTH = 10;
    return surveys
      .map((s) => s.answers[questionId])
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.trim())
      .filter((v) => v.length >= MIN_VERBATIM_LENGTH && /\s/.test(v))
      .slice(0, 5);
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
