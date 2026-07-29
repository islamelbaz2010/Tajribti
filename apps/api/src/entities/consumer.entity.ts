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

  @Column({ length: 100, nullable: true })
  name: string | null;

  @Column({ name: 'age_range', length: 20, nullable: true })
  ageRange: string | null;

  @Column({ length: 20, nullable: true })
  gender: string | null;

  @Column({ length: 50, nullable: true })
  city: string | null;

  @Column({ length: 50, nullable: true })
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
