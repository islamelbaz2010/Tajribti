import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignMedia } from '../../entities/campaign-media.entity';
import { Campaign } from '../../entities/campaign.entity';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(CampaignMedia)
    private readonly mediaRepo: Repository<CampaignMedia>,
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
  ) {}

  // Same brand-ownership check pattern as analytics.service.ts
  // assertBrandOwnership — campaign media is scoped to the campaign's
  // owning brand exactly like analytics/report/participants already are.
  async assertBrandOwnership(campaignId: string, brandId: string): Promise<void> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.brandAccountId !== brandId) throw new ForbiddenException('Access denied');
  }

  async listForCampaign(campaignId: string): Promise<CampaignMedia[]> {
    return this.mediaRepo.find({
      where: { campaignId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(campaignId: string, dto: CreateMediaDto): Promise<CampaignMedia> {
    const media = this.mediaRepo.create({
      campaignId,
      type: dto.type,
      url: dto.url,
      caption: dto.caption ?? null,
    });
    return this.mediaRepo.save(media);
  }

  async remove(campaignId: string, mediaId: string): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media || media.campaignId !== campaignId) {
      throw new NotFoundException('Media item not found for this campaign');
    }
    await this.mediaRepo.remove(media);
  }
}
