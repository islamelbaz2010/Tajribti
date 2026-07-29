import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from '../../entities/campaign.entity';
import { QrCode } from '../../entities/qr-code.entity';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(QrCode)
    private readonly qrCodeRepo: Repository<QrCode>,
  ) {}

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
