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
import { MediaModule } from './modules/media/media.module';
import { CompanyModule } from './modules/company/company.module';
import { AssetsModule } from './modules/assets/assets.module';
import { Asset } from './entities/asset.entity';
import { Consumer } from './entities/consumer.entity';
import { OtpSession } from './entities/otp-session.entity';
import { Campaign } from './entities/campaign.entity';
import { QrCode } from './entities/qr-code.entity';
import { RedemptionEvent } from './entities/redemption-event.entity';
import { SurveyResponse } from './entities/survey-response.entity';
import { BrandAccount } from './entities/brand-account.entity';
import { BrandContact } from './entities/brand-contact.entity';
import { AiReport } from './entities/ai-report.entity';
import { CampaignMedia } from './entities/campaign-media.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { CampaignVerification } from './entities/campaign-verification.entity';

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
          BrandContact,
          AiReport,
          CampaignMedia,
          EmailVerificationToken,
          CampaignVerification,
          Asset,
        ],
        // Production Schema Safety (DL-070, 2026-09-01): was `!== 'production'`
        // — a blocklist that silently stayed `true` for any unrecognized
        // NODE_ENV value, which is exactly what happened in the real pilot
        // environment (Railway's `api` service runs `NODE_ENV=pilot`, not
        // `production`), leaving TypeORM schema auto-sync live against the
        // real production database all session. Flipped to an allowlist
        // matching the adjacent `logging` line's existing pattern one line
        // below: synchronize is now only ever enabled for the one value
        // local development actually uses (`NODE_ENV=development`, per
        // `apps/api/.env`) — every other value, including `pilot`,
        // `production`, staging, or unset, now correctly disables it.
        // Production schema changes must go through `migration:run` only.
        synchronize: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('DATABASE_URL', '').includes('localhost') ? false : { rejectUnauthorized: false },
        // B-04 remediation (2026-09-01): no pool size was configured, so
        // node-postgres used its default of 10. A load test at 200
        // concurrent QR redemptions (repository-derived from RISK_REGISTER
        // R-TECH-01's "hundreds of consumers may scan simultaneously")
        // measured p95 latency of ~4.6s against MASTER_DELIVERY_PLAN.md's
        // documented "<1s response time" acceptance criterion for TJ-005 —
        // consistent with requests queueing for one of only 10 DB
        // connections. Raised conservatively (not to an arbitrarily large
        // number): this environment cannot verify Railway's actual
        // Postgres plan connection ceiling, so 20 stays well inside any
        // standard Postgres `max_connections` default (100) while still
        // meaningfully relieving the measured bottleneck.
        extra: { max: 20 },
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
    MediaModule,
    CompanyModule,
    AssetsModule,
  ],
})
export class AppModule {}
