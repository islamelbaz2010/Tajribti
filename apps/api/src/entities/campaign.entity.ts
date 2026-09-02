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

// Campaign Scheduling / "Coming Soon" + End-Date Gate (2026-09-01, extended
// 2026-09-01 pass 2): a campaign can be status=ACTIVE with a startDate in
// the future — genuinely configured and publicly discoverable (GET
// /campaigns already returns all ACTIVE campaigns regardless of date,
// which is what lets Consumer Mobile show it as upcoming), but not yet
// open for actual participation. This is the single source of truth for
// "is this campaign open for participation right now" — every
// participation entry point (qr.service.ts's redeemQr/enterCampaignWeb,
// auth.service.ts's Campaign OTP flow) must use it instead of checking
// `status === ACTIVE` alone, or a future-dated/ended campaign could be
// entered outside its configured window.
//
// endDate is INCLUSIVE (open through 23:59 of endDate, closed starting the
// day after) — not exclusive-at-start-of-day. This is the only reading
// consistent with the rest of the repository's own scheduling rules, not
// a new policy invented here: (1) validateDateRange() in
// campaign.service.ts already accepts endDate === startDate as a valid
// same-day campaign; an exclusive-at-start reading would make that
// same-day campaign NEVER enterable, which contradicts the UI explicitly
// allowing it to be created. (2) It mirrors startDate's own existing
// inclusive-at-start convention (`startDate <= today` opens participation
// starting ON the start date itself) — the symmetric, least-surprising
// choice for the closing boundary is `endDate >= today` (still open
// THROUGH the end date itself). Documented here per explicit instruction
// not to silently invent semantics — this interpretation, not a new
// lifecycle status, is how "participation must stop after endDate" is
// implemented.
//
// QR root-cause fix (2026-09-02): date comparison was UTC-day-only. Egypt
// (Africa/Cairo, UTC+2, no DST since 2014) is 2 hours ahead of UTC, so for
// the first ~2 hours of every local calendar day, `new Date().toISOString()`
// still reports the PREVIOUS day. A campaign created with startDate = "today"
// (the Dashboard's own date picker, which is the Company's local date) was
// therefore treated as not-yet-started by this gate until ~02:00 Cairo time
// — reproduced live 2026-09-02 against the real "test Brand" campaign
// (startDate 2026-09-02, server UTC clock still 2026-09-01 23:5x): the QR/
// join flow rendered and accepted phone/OTP entry correctly, then rejected
// the final redemption with "Campaign has not started yet" the moment this
// function ran — a real defect, not a guess. Fixed by computing "today" in
// the same local calendar this platform's dates are entered in
// (Africa/Cairo) instead of UTC. `en-CA` formats as YYYY-MM-DD, matching the
// stored `date` column format exactly.
function todayInCairo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date());
}

export function isCampaignOpenForParticipation(campaign: Campaign): boolean {
  if (campaign.status !== CampaignStatus.ACTIVE) return false;
  const todayUtc = todayInCairo();
  if (campaign.startDate && campaign.startDate > todayUtc) return false;
  if (campaign.endDate && campaign.endDate < todayUtc) return false;
  return true;
}

// Presentation-only helper (2026-09-01 pass 2): distinguishes "ended" from
// "not yet started" for UI copy (e.g. Consumer Mobile's closed-state
// screen) — isCampaignOpenForParticipation() alone can't tell the two
// apart since both return false. Never used for the actual gate itself.
export function hasCampaignEnded(campaign: Campaign): boolean {
  if (!campaign.endDate) return false;
  return campaign.endDate < todayInCairo();
}

// Single shared source of truth for the rejection message every
// participation entry point (qr.service.ts, auth.service.ts) returns when
// isCampaignOpenForParticipation() is false — previously each of the 4
// call sites duplicated a status-only ternary ("has not started yet" vs.
// "is not active") that had no way to express "has ended" once the
// end-date gate was added above; centralizing it here means the
// ended-campaign case is correct everywhere it's checked, not just
// wherever someone remembered to update it. Only meaningful to call when
// isCampaignOpenForParticipation(campaign) is already false.
export function getParticipationBlockedReason(campaign: Campaign): string {
  if (campaign.status !== CampaignStatus.ACTIVE) return 'Campaign is not active';
  if (hasCampaignEnded(campaign)) return 'This campaign has ended';
  return 'Campaign has not started yet';
}
