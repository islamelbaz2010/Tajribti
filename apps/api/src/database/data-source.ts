import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Consumer } from '../entities/consumer.entity';
import { OtpSession } from '../entities/otp-session.entity';
import { Campaign } from '../entities/campaign.entity';
import { QrCode } from '../entities/qr-code.entity';
import { RedemptionEvent } from '../entities/redemption-event.entity';
import { SurveyResponse } from '../entities/survey-response.entity';
import { BrandAccount } from '../entities/brand-account.entity';
import { BrandContact } from '../entities/brand-contact.entity';
import { AiReport } from '../entities/ai-report.entity';
import { CampaignMedia } from '../entities/campaign-media.entity';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { CampaignVerification } from '../entities/campaign-verification.entity';
import { Asset } from '../entities/asset.entity';
import { CompanyEmployee } from '../entities/company-employee.entity';
import { AdminUser } from '../entities/admin-user.entity';

config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
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
    CompanyEmployee,
    AdminUser,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  logging: false,
});
