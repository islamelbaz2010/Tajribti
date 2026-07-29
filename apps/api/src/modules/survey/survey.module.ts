import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { AiReport } from '../../entities/ai-report.entity';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';

@Module({
  imports: [TypeOrmModule.forFeature([SurveyResponse, RedemptionEvent, AiReport])],
  controllers: [SurveyController],
  providers: [SurveyService],
  exports: [SurveyService],
})
export class SurveyModule {}
