import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '../../entities/campaign.entity';
import { QrCode } from '../../entities/qr-code.entity';
import { BrandContact } from '../../entities/brand-contact.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, QrCode, BrandContact, RedemptionEvent])],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
