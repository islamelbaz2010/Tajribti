import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiReport } from '../../entities/ai-report.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { Campaign } from '../../entities/campaign.entity';
import { BrandAccount } from '../../entities/brand-account.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiReport, SurveyResponse, RedemptionEvent, Campaign, BrandAccount]),
    AnalyticsModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
