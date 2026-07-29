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
import { AiReport } from '../entities/ai-report.entity';

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
    AiReport,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
  logging: false,
});
