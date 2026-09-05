import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Campaign } from './campaign.entity';

export enum QrCodeStatus {
  ACTIVE = 'active',
  DEMO = 'demo',
  VOIDED = 'voided',
}

@Entity('qr_codes')
export class QrCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campaign_id' })
  campaignId: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.qrCodes)
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Index({ unique: true })
  @Column({ length: 200 })
  code: string;

  @Column({
    type: 'enum',
    enum: QrCodeStatus,
    default: QrCodeStatus.ACTIVE,
  })
  status: QrCodeStatus;

  // DL-105: source label — e.g. "Mall Entrance", "Social Media Poster".
  // NULL for the original auto-generated primary QR; only explicitly
  // created source QRs carry a label.
  @Column({ type: 'varchar', nullable: true, length: 100, default: null })
  label: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
