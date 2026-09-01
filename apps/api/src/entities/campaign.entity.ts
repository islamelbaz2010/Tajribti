import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BrandAccount } from './brand-account.entity';
import { QrCode } from './qr-code.entity';
import { RedemptionEvent } from './redemption-event.entity';
import { SurveyResponse } from './survey-response.entity';
import { AiReport } from './ai-report.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  // Soft-delete/archive semantic (Campaign Management, 2026-09-01): the
  // codebase has no hard-delete path for a Campaign anywhere (redemptions/
  // survey responses/QR codes/reports all reference it), so "remove a
  // campaign" is modeled as a lifecycle status like the other four rather
  // than inventing a destructive DELETE. Requires migration
  // 1788000000000-AddArchivedCampaignStatus to exist on the Postgres enum
  // type before this value can be written.
  ARCHIVED = 'archived',
}

export interface SurveyQuestion {
  id: string;
  text: string;
  textAr: string;
  type: 'stars' | 'scale' | 'multiple_choice' | 'text';
  options?: string[];
  optionsAr?: string[];
  required: boolean;
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'brand_account_id', type: 'uuid', nullable: true })
  brandAccountId: string | null;

  @ManyToOne(() => BrandAccount, { nullable: true })
  @JoinColumn({ name: 'brand_account_id' })
  brandAccount: BrandAccount | null;

  @Column({ name: 'brand_name', length: 100 })
  brandName: string;

  @Column({ name: 'product_name', length: 100 })
  productName: string;

  @Column({ name: 'product_image', type: 'varchar', length: 500, nullable: true })
  productImage: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'location_name', type: 'varchar', length: 100, nullable: true })
  locationName: string | null;

  @Column({ name: 'location_address', type: 'text', nullable: true })
  locationAddress: string | null;

  @Column({ name: 'reward_points', type: 'integer', default: 50 })
  rewardPoints: number;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.ACTIVE,
  })
  status: CampaignStatus;

  @Column({ name: 'target_count', type: 'integer', default: 100 })
  targetCount: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @Column({ name: 'survey_questions', type: 'jsonb' })
  surveyQuestions: SurveyQuestion[];

  @Column({ name: 'is_demo', default: false })
  isDemo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => QrCode, (qr) => qr.campaign)
  qrCodes: QrCode[];

  @OneToMany(() => RedemptionEvent, (event) => event.campaign)
  redemptions: RedemptionEvent[];

  @OneToMany(() => SurveyResponse, (response) => response.campaign)
  surveyResponses: SurveyResponse[];

  @OneToMany(() => AiReport, (report) => report.campaign)
  aiReports: AiReport[];
}
