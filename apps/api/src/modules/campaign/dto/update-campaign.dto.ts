import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
  MinLength,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignStatus } from '../../../entities/campaign.entity';
import { SurveyQuestionDto } from './survey-question.dto';

// Bounded edit surface for Internal Tajribti Campaign Operations (DL-055 item 1),
// Survey Builder V2 (Company Console Product Maturation, 2026-09-01), and
// Campaign Scheduling / "Coming Soon" (2026-09-01). Deliberately excludes
// brandAccountId and isDemo (ownership/demo status are not reassignable).
// `startDate` is now editable — nothing in participation gating ever
// actually depended on it being immutable (only `status` gated
// participation until this pass added isCampaignOpenForParticipation,
// which reads startDate live rather than assuming it can't change);
// campaign.service.ts validates endDate isn't before startDate on save.
// `surveyQuestions` is bounded, not a free-form Survey Builder:
// campaign.service.ts's validateSurveyQuestionEdit() requires every
// reserved core question id (CORE_QUESTION_IDS) to keep its existing
// type — its array position is unconstrained — because analytics.service.ts
// reads answers by fixed key (`answers['q2']`, `answers['q3']`,
// `answers['q5']`); questions with any other id may be freely added,
// removed, reordered, or retyped.
export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  productName?: string;

  @IsOptional()
  @IsString()
  productImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  locationName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationAddress?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  rewardPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetCount?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDto)
  surveyQuestions?: SurveyQuestionDto[];
}
