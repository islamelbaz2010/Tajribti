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
import { BrandContact } from './brand-contact.entity';
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

  // Company Foundation (2026-09-01): optional reference to one of the
  // owning Company's own BrandContact records — "who at the Company is
  // running/responsible for this campaign." Ownership-validated in
  // campaign.service.ts (a contact from another Company can never be
  // attached). ON DELETE SET NULL at the DB level so deleting a contact
  // never touches campaign data/history.
  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId: string | null;

  @ManyToOne(() => BrandContact, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contact_id' })
  contact: BrandContact | null;

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

// Campaign Scheduling / "Coming Soon" (2026-09-01): a campaign can be
// status=ACTIVE with a startDate in the future — genuinely configured and
// publicly discoverable (GET /campaigns already returns all ACTIVE
// campaigns regardless of date, which is what lets Consumer Mobile show it
// as upcoming), but not yet open for actual participation. This is the
// single source of truth for "is this campaign open for participation
// right now" — every participation entry point (qr.service.ts's
// redeemQr/enterCampaignWeb, auth.service.ts's Campaign OTP flow) must use
// it instead of checking `status === ACTIVE` alone, or a future-dated
// campaign could be entered before its start date.
//
// Date comparison is UTC-day-only, matching the existing convention
// already used elsewhere for these `date`-typed columns (see
// admin.service.ts's seed dates) — no new timezone policy introduced.
export function isCampaignOpenForParticipation(campaign: Campaign): boolean {
  if (campaign.status !== CampaignStatus.ACTIVE) return false;
  if (!campaign.startDate) return true;
  const todayUtc = new Date().toISOString().split('T')[0];
  return campaign.startDate <= todayUtc;
}
