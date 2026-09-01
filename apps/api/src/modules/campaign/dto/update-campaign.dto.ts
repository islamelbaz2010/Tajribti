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

// Bounded edit surface for Internal Tajribti Campaign Operations (DL-055 item 1)
// and Campaign-Specific Survey Configuration / Survey Builder V2 (Company
// Console Product Maturation, 2026-09-01). Deliberately excludes
// brandAccountId, isDemo, and startDate (a campaign's start shouldn't move
// once QR codes/participation may already reference it). `surveyQuestions`
// here is bounded, not a free-form Survey Builder: campaign.service.ts's
// validateSurveyQuestionEdit() requires the first CORE_QUESTION_COUNT (5)
// questions to keep their existing id/type/order exactly, because
// analytics.service.ts reads answers by fixed key (`answers['q2']`,
// `answers['q3']`, `answers['q5']`) for those specific positions — but
// questions beyond that core set may be freely added, removed, reordered,
// or retyped, since nothing in analytics/report hardcodes their keys.
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
