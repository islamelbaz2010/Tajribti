import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BrandAccount } from './brand-account.entity';

// Company Employee identity (Founder ruling W-1, 2026-09-02): a REAL
// authenticated TAJRIBTI user, distinct from both the single BrandAccount
// login (the Company's own "owner" identity) and BrandContact (a
// non-authenticated campaign-contact record — unchanged, still has no
// password/login field, still not this).
//
// Minimum coherent model, not a generic RBAC framework (explicitly
// forbidden by this task's own governance): every employee has exactly
// one relationship to exactly one Company, and — once authenticated —
// the same company-scoped access the BrandAccount owner already has to
// that Company's own Campaigns/Participants/Insights/Reports (see
// `apps/api/src/modules/auth/company-scope.util.ts`'s resolveCompanyId(),
// which every brand-scoped controller now goes through). No separate
// role/permission matrix — the smallest model the Founder's own
// requirement (Section 6 of the ruling prompt) actually calls for.
@Entity('company_employees')
export class CompanyEmployee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'brand_account_id', type: 'uuid' })
  brandAccountId: string;

  @ManyToOne(() => BrandAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_account_id' })
  brandAccount: BrandAccount;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 150 })
  email: string;

  // bcrypt hash only — never the plaintext password, never returned by any
  // API response (see AuthService/AdminService, which build explicit
  // response shapes rather than spreading this entity), same discipline
  // already used for Consumer.passwordHash and BrandAccount.password.
  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
