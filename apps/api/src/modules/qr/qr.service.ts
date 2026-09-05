import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { QrCode, QrCodeStatus } from '../../entities/qr-code.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import {
  Campaign,
  isCampaignOpenForParticipation,
  getParticipationBlockedReason,
} from '../../entities/campaign.entity';
import { Consumer } from '../../entities/consumer.entity';
import { CampaignVerification } from '../../entities/campaign-verification.entity';
import { checkCampaignEligibility } from '../campaign/campaign-eligibility.util';

// B-04 remediation (2026-09-01): Postgres unique_violation SQLSTATE. TypeORM
// wraps driver errors in QueryFailedError; node-postgres always sets `.code`
// on the underlying driver error, and different TypeORM versions surface it
// either directly on the thrown error or nested under `.driverError` — check
// both rather than assume one.
const POSTGRES_UNIQUE_VIOLATION = '23505';
function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; driverError?: { code?: string } };
  return e?.code === POSTGRES_UNIQUE_VIOLATION || e?.driverError?.code === POSTGRES_UNIQUE_VIOLATION;
}

interface RedeemQrDto {
  qrCode: string;
  consumerId: string;
  campaignId: string;
}

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(QrCode)
    private readonly qrRepo: Repository<QrCode>,
    @InjectRepository(RedemptionEvent)
    private readonly redemptionRepo: Repository<RedemptionEvent>,
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(Consumer)
    private readonly consumerRepo: Repository<Consumer>,
    @InjectRepository(CampaignVerification)
    private readonly campaignVerificationRepo: Repository<CampaignVerification>,
    private readonly configService: ConfigService,
  ) {}

  async redeemQr(dto: RedeemQrDto): Promise<{
    success: boolean;
    redemptionId: string;
    productName: string;
    rewardPoints: number;
  }> {
    const qrCode = await this.qrRepo.findOne({
      where: { code: dto.qrCode },
      relations: ['campaign'],
    });

    if (!qrCode) {
      throw new NotFoundException('QR code not found');
    }

    if (qrCode.campaignId !== dto.campaignId) {
      throw new BadRequestException('QR code does not belong to this campaign');
    }

    const campaign = qrCode.campaign;

    if (!isCampaignOpenForParticipation(campaign)) {
      throw new BadRequestException(getParticipationBlockedReason(campaign));
    }

    const isDemo = qrCode.status === QrCodeStatus.DEMO;

    if (!isDemo) {
      // B-04 performance pass 3 (2026-09-06, DL-108): parallelize the three
      // independent DB reads (consumer eligibility, duplicate check, OTP
      // verification) that were previously sequential. Each read depends only
      // on dto.consumerId / dto.campaignId — both known after the QR lookup
      // above — so they can safely run concurrently. This mirrors the same
      // optimization already applied to enterCampaignWeb below.
      // Sequential cost: 3 × ~RTT. Parallel cost: 1 × max(RTT_x3).
      const [consumer, existingRedemption, verified] = await Promise.all([
        this.consumerRepo.findOne({ where: { id: dto.consumerId } }),
        this.redemptionRepo.findOne({
          where: { consumerId: dto.consumerId, campaignId: dto.campaignId },
        }),
        this.campaignVerificationRepo.findOne({
          where: { consumerId: dto.consumerId, campaignId: dto.campaignId },
        }),
      ]);

      // Benchmark Alignment — Audience/Eligibility (2026-09-06, DL-101):
      // Server-side eligibility enforcement at the QR redemption gate.
      if (consumer) {
        const eligibility = checkCampaignEligibility(campaign, consumer);
        if (!eligibility.eligible) {
          throw new BadRequestException(
            eligibility.reason ?? 'You are not eligible for this campaign',
          );
        }
      }

      if (existingRedemption) {
        throw new BadRequestException('You have already redeemed this campaign');
      }

      // Mirrors the pre-existing duplicate-check exemption: demo QR codes
      // are exempt from the OTP-verification gate (same as the dupe-check
      // above). Unused by the Consumer app today (enterCampaignWeb is the
      // active entry path), but kept for the physical-QR scan path.
      if (!verified) {
        throw new ForbiddenException('Campaign verification required before participation');
      }
    }

    // B-04 remediation: the existingRedemption check above is a
    // check-then-act race under concurrent requests (proven by load test,
    // 2026-09-01) — two requests can both pass the check before either
    // inserts. The DB-level partial unique index (migration
    // AddRedemptionUniqueConstraint1788200000000) is the actual guarantee;
    // this catch converts the resulting unique-violation into the same
    // business error the pre-check above already gives the normal-timing
    // caller, instead of leaking a raw 500.
    let redemption;
    try {
      redemption = await this.redemptionRepo.save(
        this.redemptionRepo.create({
          consumerId: dto.consumerId,
          campaignId: dto.campaignId,
          qrCodeId: qrCode.id,
          isDemoSeed: false,
        }),
      );
    } catch (err) {
      if (!isDemo && isUniqueViolation(err)) {
        throw new BadRequestException('You have already redeemed this campaign');
      }
      throw err;
    }

    return {
      success: true,
      redemptionId: redemption.id,
      productName: campaign.productName,
      rewardPoints: campaign.rewardPoints,
    };
  }

  // Web consumer entry — looks up ACTIVE QR by campaignId, no code string needed
  async enterCampaignWeb(campaignId: string, consumerId: string): Promise<{
    success: boolean;
    redemptionId: string;
    productName: string;
    rewardPoints: number;
    alreadyCompleted?: boolean;
  }> {
    // B-04 performance remediation (2026-09-01): these three reads (QR
    // lookup, existing-redemption lookup, Campaign-verification lookup) are
    // mutually independent — none uses another's result — but were
    // previously three sequential `await`s, each holding its own
    // connection-pool checkout back-to-back. A load test at 200 concurrent
    // requests measured p95 ~2.1s against the documented <1s target;
    // running these three concurrently removes two round-trips' worth of
    // sequential wait per request without changing any business logic
    // below, which still runs the same checks in the same order against
    // the now-already-fetched results. See
    // `16_Reports/B04_QR_CONCURRENCY_LOAD_TEST_2026-09-01.md`.
    const [existingQr, existingRedemption, verified] = await Promise.all([
      this.qrRepo.findOne({
        where: [
          { campaignId, status: QrCodeStatus.ACTIVE },
          { campaignId, status: QrCodeStatus.DEMO },
        ],
        relations: ['campaign'],
      }),
      // Checked before the date gate below: a consumer who already
      // redeemed must always be able to see their existing status, even if
      // the campaign's startDate was later edited to a future date (the
      // gate is about opening NEW participation, not retroactively hiding
      // one that already happened).
      this.redemptionRepo.findOne({
        where: { consumerId, campaignId },
        relations: ['surveyResponse'],
      }),
      // Prefetched unconditionally alongside the other two reads even
      // though it's only consulted if there's no existingRedemption below
      // (unconditional, unlike redeemQr(): this entry path's pre-existing
      // duplicate-redemption check never exempted demo campaigns, so
      // Campaign verification doesn't either) — one occasionally-unused
      // query is cheaper than a fourth sequential round-trip on every
      // first-time request, which is the volume case this fix targets.
      this.campaignVerificationRepo.findOne({ where: { consumerId, campaignId } }),
    ]);

    let resolvedQrId: string;
    let campaign: Campaign;

    if (existingQr) {
      resolvedQrId = existingQr.id;
      campaign = existingQr.campaign;
    } else {
      // Discovery-first entry: auto-create a QR code if the brand hasn't generated one yet.
      // Mirrors generateQrImage() logic so discovery and QR-scan entries are equivalent.
      const found = await this.campaignRepo.findOne({ where: { id: campaignId } });
      if (!found) throw new NotFoundException(`Campaign ${campaignId} not found`);
      if (!isCampaignOpenForParticipation(found)) {
        throw new BadRequestException(getParticipationBlockedReason(found));
      }
      campaign = found;
      const code = `tajribti:${campaignId}:${Date.now()}`;
      const newQr = await this.qrRepo.save(
        this.qrRepo.create({
          campaignId,
          code,
          status: campaign.isDemo ? QrCodeStatus.DEMO : QrCodeStatus.ACTIVE,
        }),
      );
      resolvedQrId = newQr.id;
    }

    if (existingRedemption) {
      return {
        success: true,
        redemptionId: existingRedemption.id,
        productName: campaign.productName,
        rewardPoints: campaign.rewardPoints,
        alreadyCompleted: !!existingRedemption.surveyResponse,
      };
    }

    if (!isCampaignOpenForParticipation(campaign)) {
      throw new BadRequestException(getParticipationBlockedReason(campaign));
    }

    // Benchmark Alignment — Audience/Eligibility (2026-09-06, DL-101):
    // Server-side eligibility enforcement at the web entry gate.
    // Checked after the date/status gate (which is a universal blocker)
    // and after the already-participated check (which must always be
    // visible even to ineligible consumers who somehow participated before
    // an audience restriction was added). For fresh first-time
    // participation only.
    const consumer = await this.consumerRepo.findOne({ where: { id: consumerId } });
    if (consumer) {
      const eligibility = checkCampaignEligibility(campaign, consumer);
      if (!eligibility.eligible) {
        throw new BadRequestException(
          eligibility.reason ?? 'You are not eligible for this campaign',
        );
      }
    }

    if (!verified) {
      throw new ForbiddenException('Campaign verification required before participation');
    }

    // B-04 remediation: same check-then-act race as redeemQr() above,
    // proven by load test (2026-09-01) — this is the endpoint the load
    // test actually exercised (POST /qr/enter/:campaignId, the real
    // Consumer Mobile/web entry path). On the DB rejecting a concurrent
    // duplicate, re-fetch and return the same alreadyCompleted shape the
    // existingRedemption branch above already returns for normal timing,
    // instead of leaking a raw 500.
    let redemption;
    try {
      redemption = await this.redemptionRepo.save(
        this.redemptionRepo.create({
          consumerId,
          campaignId,
          qrCodeId: resolvedQrId,
          isDemoSeed: false,
        }),
      );
    } catch (err) {
      if (isUniqueViolation(err)) {
        const raced = await this.redemptionRepo.findOne({
          where: { consumerId, campaignId },
          relations: ['surveyResponse'],
        });
        if (raced) {
          return {
            success: true,
            redemptionId: raced.id,
            productName: campaign.productName,
            rewardPoints: campaign.rewardPoints,
            alreadyCompleted: !!raced.surveyResponse,
          };
        }
      }
      throw err;
    }

    return {
      success: true,
      redemptionId: redemption.id,
      productName: campaign.productName,
      rewardPoints: campaign.rewardPoints,
    };
  }

  async generateQrImage(campaignId: string): Promise<Buffer> {
    const campaign = await this.campaignRepo.findOne({
      where: { id: campaignId },
      relations: ['qrCodes'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    let qrCode = campaign.qrCodes?.find(
      (q) => q.status === QrCodeStatus.DEMO || q.status === QrCodeStatus.ACTIVE,
    );

    if (!qrCode) {
      const code = `tajribti:${campaignId}:${Date.now()}`;
      qrCode = await this.qrRepo.save(
        this.qrRepo.create({
          campaignId,
          code,
          status: campaign.isDemo ? QrCodeStatus.DEMO : QrCodeStatus.ACTIVE,
        }),
      );
    }

    // Real campaigns encode a URL so the phone camera opens the browser consumer journey.
    // Demo campaigns keep the JSON format for Flutter scanner compatibility.
    let payload: string;
    if (campaign.isDemo) {
      payload = JSON.stringify({
        type: 'tajribti_campaign',
        campaign_id: campaignId,
        qr_code: qrCode.code,
      });
    } else {
      const consumerWebUrl =
        this.configService.get<string>('CONSUMER_WEB_URL') ?? 'http://localhost:3001';
      payload = `${consumerWebUrl}/join/${campaignId}`;
    }

    const buffer = await QRCode.toBuffer(payload, {
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });

    return buffer;
  }

  // DL-105: Generate a new labeled source QR for a campaign placement.
  // Each source QR is an independent ACTIVE QR code — consumers can scan
  // any of them to enter the campaign.  The label (e.g. "Mall Entrance",
  // "Social Media") is stored on the QR row so getQrSources() can surface
  // redemption counts per placement.
  async generateLabeledQr(
    campaignId: string,
    label: string,
    brandAccountId: string,
  ): Promise<{ qrId: string; code: string; label: string }> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign ${campaignId} not found`);
    if (campaign.brandAccountId !== brandAccountId)
      throw new ForbiddenException('Access denied');

    const trimmedLabel = label.trim().slice(0, 100);
    const code = `tajribti:${campaignId}:src:${Date.now()}`;

    const qrCode = await this.qrRepo.save(
      this.qrRepo.create({
        campaignId,
        code,
        status: campaign.isDemo ? QrCodeStatus.DEMO : QrCodeStatus.ACTIVE,
        label: trimmedLabel,
      }),
    );

    return { qrId: qrCode.id, code: qrCode.code, label: qrCode.label ?? trimmedLabel };
  }
}
