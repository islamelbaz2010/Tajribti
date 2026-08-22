import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { QrCode, QrCodeStatus } from '../../entities/qr-code.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { Campaign, CampaignStatus } from '../../entities/campaign.entity';

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

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not active');
    }

    const isDemo = qrCode.status === QrCodeStatus.DEMO;

    if (!isDemo) {
      const existingRedemption = await this.redemptionRepo.findOne({
        where: { consumerId: dto.consumerId, campaignId: dto.campaignId },
      });

      if (existingRedemption) {
        throw new BadRequestException('You have already redeemed this campaign');
      }
    }

    const redemption = await this.redemptionRepo.save(
      this.redemptionRepo.create({
        consumerId: dto.consumerId,
        campaignId: dto.campaignId,
        qrCodeId: qrCode.id,
        isDemoSeed: false,
      }),
    );

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
  }> {
    const existingQr = await this.qrRepo.findOne({
      where: [
        { campaignId, status: QrCodeStatus.ACTIVE },
        { campaignId, status: QrCodeStatus.DEMO },
      ],
      relations: ['campaign'],
    });

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
      if (found.status !== CampaignStatus.ACTIVE) {
        throw new BadRequestException('Campaign is not active');
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

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not active');
    }

    const existingRedemption = await this.redemptionRepo.findOne({
      where: { consumerId, campaignId },
    });

    if (existingRedemption) {
      // Return the existing redemption so the consumer can continue to the survey
      return {
        success: true,
        redemptionId: existingRedemption.id,
        productName: campaign.productName,
        rewardPoints: campaign.rewardPoints,
      };
    }

    const redemption = await this.redemptionRepo.save(
      this.redemptionRepo.create({
        consumerId,
        campaignId,
        qrCodeId: resolvedQrId,
        isDemoSeed: false,
      }),
    );

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
}
