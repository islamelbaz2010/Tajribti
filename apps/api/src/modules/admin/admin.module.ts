import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Campaign } from '../../entities/campaign.entity';
import { QrCode } from '../../entities/qr-code.entity';
import { Consumer } from '../../entities/consumer.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { SurveyResponse } from '../../entities/survey-response.entity';
import { BrandAccount } from '../../entities/brand-account.entity';
import { BrandContact } from '../../entities/brand-contact.entity';
import { CompanyEmployee } from '../../entities/company-employee.entity';
import { AdminUser } from '../../entities/admin-user.entity';
import { AiReport } from '../../entities/ai-report.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ReportModule } from '../report/report.module';
import { CampaignModule } from '../campaign/campaign.module';

// Founder ruling W-2 (2026-09-02): AdminModule now also owns the real
// TAJRIBTI Admin identity (AdminUser) and, via AnalyticsModule/ReportModule,
// the Admin Control Center's Company -> Campaign -> Participants/Data ->
// Insights -> Report drill-down (reusing the exact same services the
// Company Console already uses — no parallel analytics/report logic).
// JwtModule is configured independently here (same secret/env contract as
// AuthModule) rather than importing AuthModule, keeping this module's
// dependency graph self-contained the way every other module in this
// codebase already is.
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
      CompanyEmployee,
      AdminUser,
      AiReport,
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRY') ?? '15m',
        },
      }),
      inject: [ConfigService],
    }),
    AnalyticsModule,
    ReportModule,
    CampaignModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
