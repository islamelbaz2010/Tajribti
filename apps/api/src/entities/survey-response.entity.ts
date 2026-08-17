import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Consumer } from './consumer.entity';
import { Campaign } from './campaign.entity';
import { RedemptionEvent } from './redemption-event.entity';

export interface SurveyAnswers {
  q1: number | string;
  q2: number | string;
  q3: number | string;
  q4: number | string;
  q5?: string;
  [key: string]: number | string | undefined;
}

@Entity('survey_responses')
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'redemption_id' })
  redemptionId: string;

  @OneToOne(() => RedemptionEvent, (event) => event.surveyResponse)
  @JoinColumn({ name: 'redemption_id' })
  redemption: RedemptionEvent;

  @Column({ name: 'consumer_id' })
  consumerId: string;

  @ManyToOne(() => Consumer, (consumer) => consumer.surveyResponses)
  @JoinColumn({ name: 'consumer_id' })
  consumer: Consumer;

  @Column({ name: 'campaign_id' })
  campaignId: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.surveyResponses)
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ type: 'jsonb' })
  answers: SurveyAnswers;

  @Column({ name: 'is_demo_seed', default: false })
  isDemoSeed: boolean;

  @CreateDateColumn({ name: 'completed_at' })
  completedAt: Date;
}
