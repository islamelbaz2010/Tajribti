import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { RedemptionEvent } from './redemption-event.entity';
import { SurveyResponse } from './survey-response.entity';

@Entity('consumers')
export class Consumer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  phone: string;

  // Account identity (added for email/password account authentication —
  // distinct from `phone`, which remains required and is used only for
  // Campaign participation verification, not account login). Nullable
  // because pre-existing phone-only consumer records have neither.
  @Column({ type: 'varchar', unique: true, length: 255, nullable: true })
  email: string | null;

  // bcrypt hash only — never the plaintext password. Never returned by
  // any API response (see AuthService.getMe/login/signup, which build
  // explicit response shapes rather than spreading this entity).
  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @Column({ name: 'age_range', type: 'varchar', length: 20, nullable: true })
  ageRange: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  interest: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => RedemptionEvent, (event) => event.consumer)
  redemptions: RedemptionEvent[];

  @OneToMany(() => SurveyResponse, (response) => response.consumer)
  surveyResponses: SurveyResponse[];
}
