import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignMedia } from '../../entities/campaign-media.entity';
import { Campaign } from '../../entities/campaign.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [TypeOrmModule.forFeature([CampaignMedia, Campaign])],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
