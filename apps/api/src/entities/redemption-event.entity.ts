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
