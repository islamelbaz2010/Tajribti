import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { Consumer } from '../../entities/consumer.entity';
import { Campaign } from '../../entities/campaign.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([RedemptionEvent, SurveyResponse, Consumer, Campaign])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
