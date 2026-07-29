import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { QrModule } from './modules/qr/qr.module';
import { SurveyModule } from './modules/survey/survey.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportModule } from './modules/report/report.module';
import { AdminModule } from './modules/admin/admin.module';
import { Consumer } from './entities/consumer.entity';
import { OtpSession } from './entities/otp-session.entity';
import { Campaign } from './entities/campaign.entity';
import { QrCode } from './entities/qr-code.entity';
import { RedemptionEvent } from './entities/redemption-event.entity';
import { SurveyResponse } from './entities/survey-response.entity';
import { BrandAccount } from './entities/brand-account.entity';
import { AiReport } from './entities/ai-report.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        entities: [
          Consumer,
          OtpSession,
          Campaign,
          QrCode,
          RedemptionEvent,
          SurveyResponse,
          BrandAccount,
          AiReport,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        ssl: {
          rejectUnauthorized: false,
        },
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CampaignModule,
    QrModule,
    SurveyModule,
    AnalyticsModule,
    ReportModule,
    AdminModule,
  ],
})
export class AppModule {}
