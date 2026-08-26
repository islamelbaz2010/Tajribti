import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Campaign } from './campaign.entity';

export enum CampaignMediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
}

// Campaign asset/evidence layer — photos/videos organized by campaign,
// referenced by URL (same pattern already used by Campaign.productImage;
// no new upload/storage subsystem introduced). Internal Tajribti-operated
// gallery, not a public/social feature — no likes/comments/followers.
@Entity('campaign_media')
export class CampaignMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campaign_id' })
  campaignId: string;

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({
    type: 'enum',
    enum: CampaignMediaType,
    default: CampaignMediaType.PHOTO,
  })
  type: CampaignMediaType;

  @Column({ type: 'varchar', length: 1000 })
  url: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  caption: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
