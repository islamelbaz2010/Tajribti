import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '../../entities/campaign.entity';
import { QrCode } from '../../entities/qr-code.entity';
import { Consumer } from '../../entities/consumer.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { BrandAccount } from '../../entities/brand-account.entity';
import { BrandContact } from '../../entities/brand-contact.entity';
import { AiReport } from '../../entities/ai-report.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      QrCode,
      Consumer,
      RedemptionEvent,
      SurveyResponse,
      BrandAccount,
      BrandContact,
      AiReport,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
