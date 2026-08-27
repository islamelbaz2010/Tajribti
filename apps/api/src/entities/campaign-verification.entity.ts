import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

// The Campaign-specific verification primitive: proof that a specific,
// already-authenticated Consumer has completed phone-OTP verification for
// a specific Campaign. A valid account JWT alone (Consumer identity) is
// NOT sufficient to enter a Campaign - QrService checks for a row here
// (see qr.service.ts) before allowing a NEW redemption. Pre-existing
// redemptions created before this table existed are unaffected: the
// existing-redemption check in QrService runs first and short-circuits
// to "already completed" without requiring a backfilled row here.
@Entity('campaign_verifications')
@Unique(['consumerId', 'campaignId'])
export class CampaignVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'consumer_id', type: 'uuid' })
  consumerId: string;

  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId: string;

  // The phone number the Campaign OTP was actually verified against for
  // this participation - kept for audit/research-data purposes even if
  // it later differs from the Consumer's account-profile phone.
  @Column({ length: 20 })
  phone: string;

  @CreateDateColumn({ name: 'verified_at' })
  verifiedAt: Date;
}
