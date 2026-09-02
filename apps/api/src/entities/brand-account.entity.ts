import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Campaign } from './campaign.entity';
import { BrandContact } from './brand-contact.entity';
import { CompanyEmployee } from './company-employee.entity';

// Company Foundation (2026-09-01): the controlled sector/category list.
// Sourced only from locked Founder decisions DL-003 ("Target market: FMCG,
// beauty, personal care, pharma-OTC in Egypt") and DL-007 ("Out of scope
// Y1-3: Healthcare, insurance, banking, telecom, government, education") —
// not invented, not expanded beyond the pilot's evidenced target market.
// Drives the sector -> recommended Consumer Insights Framework feature;
// never used to gate/restrict who can be provisioned as a Company.
export enum BrandSector {
  FMCG = 'fmcg',
  BEAUTY_PERSONAL_CARE = 'beauty_personal_care',
  PHARMA_OTC = 'pharma_otc',
}

@Entity('brand_accounts')
export class BrandAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  // Company Foundation (2026-09-01): optional, additive. Nullable so every
  // pre-existing brand (including the demo account) keeps working unset;
  // Console prompts the Company to set it via the new self-service profile
  // endpoint rather than a backfill migration.
  @Column({ type: 'enum', enum: BrandSector, nullable: true })
  sector: BrandSector | null;

  // Company Employee identity (Founder ruling W-1, 2026-09-02): the
  // Company-specific code a person registering as an employee must supply
  // (see AuthService.employeeSignup()) — "wrong/invalid code blocks
  // registration and instructs the user to obtain the correct code" is
  // enforced by comparing against this column. Nullable: a Company
  // provisioned before this feature, or one Admin hasn't enabled employee
  // self-registration for yet, simply has no code and self-registration
  // is blocked with a clear message (Admin can still create employee
  // accounts directly either way). Unique so a code can never be guessed
  // into a different Company by chance collision.
  @Column({ name: 'employee_code', type: 'varchar', length: 20, unique: true, nullable: true })
  employeeCode: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => Campaign, (campaign) => campaign.brandAccount)
  campaigns: Campaign[];

  @OneToMany(() => BrandContact, (contact) => contact.brandAccount)
  contacts: BrandContact[];

  @OneToMany(() => CompanyEmployee, (employee) => employee.brandAccount)
  employees: CompanyEmployee[];
}
