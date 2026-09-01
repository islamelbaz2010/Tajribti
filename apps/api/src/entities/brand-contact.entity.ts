import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BrandAccount } from './brand-account.entity';

// Company Foundation (2026-09-01): a responsible person associated with a
// Company/Brand — the minimum safe model for "campaign contacts" without
// inventing a second, independent authentication system. A contact is a
// record, not an account: it has no password, no login, no JWT identity.
// Existing BrandAccount stays the sole authenticated identity per Company;
// contacts are selected/assigned within that Company's own console, the
// same way any other brand-scoped resource (Campaign, CampaignMedia)
// already is.
@Entity('brand_contacts')
export class BrandContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'brand_account_id', type: 'uuid' })
  brandAccountId: string;

  @ManyToOne(() => BrandAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_account_id' })
  brandAccount: BrandAccount;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150 })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
