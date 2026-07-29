import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    const payload = JSON.stringify({
      type: 'tajribti_campaign',
      campaign_id: campaignId,
      qr_code: qrCode.code,
    });

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
