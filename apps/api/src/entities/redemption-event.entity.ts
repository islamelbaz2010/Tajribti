import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Consumer } from './consumer.entity';
import { Campaign } from './campaign.entity';
import { QrCode } from './qr-code.entity';
import { SurveyResponse } from './survey-response.entity';

@Entity('redemption_events')
@Index(['consumerId', 'campaignId'])
// B-04 remediation (2026-09-01): partial unique index, not a plain
// @Unique(['consumerId','campaignId']) — DEMO-status QR codes are
// intentionally exempt from the duplicate-redemption check in
// qr.service.ts (redeemQr()'s `isDemo` branch, for repeated live
// walkthrough/demo scans), so only real (`is_demo_seed = false`) rows are
// constrained. Declared here (not just in the migration) so that
// NODE_ENV=development's `synchronize: true` reconciles the schema
// against this decorator instead of dropping the migration-created index
// on next boot - proven necessary by this session's load test, which
// found the index silently removed after a dev-mode restart.
@Index('UQ_redemption_events_consumer_campaign_real', ['consumerId', 'campaignId'], {
  unique: true,
  where: '"is_demo_seed" = false',
})
export class RedemptionEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'consumer_id' })
  consumerId: string;

  @ManyToOne(() => Consumer, (consumer) => consumer.redemptions)
  @JoinColumn({ name: 'consumer_id' })
  consumer: Consumer;

  @Column({ name: 'campaign_id' })
  campaignId: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.redemptions)
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ name: 'qr_code_id' })
  qrCodeId: string;

  @ManyToOne(() => QrCode)
  @JoinColumn({ name: 'qr_code_id' })
  qrCode: QrCode;

  @Column({ name: 'is_demo_seed', default: false })
  isDemoSeed: boolean;

  @CreateDateColumn({ name: 'redeemed_at' })
  redeemedAt: Date;

  @OneToOne(() => SurveyResponse, (response) => response.redemption)
  surveyResponse: SurveyResponse;
}
