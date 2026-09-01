import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
  MinLength,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SurveyQuestionDto } from './survey-question.dto';

export class CreateCampaignDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  brandName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  productName: string;

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

  @IsInt()
  @Min(0)
  rewardPoints: number;

  @IsInt()
  @Min(1)
  targetCount: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  // Campaign-specific research configuration (Survey Builder V2,
  // 2026-09-01). Omitted -> the existing standard 5-question survey is
  // used unchanged. The first 5 questions are the "core" set wording
  // analytics/AI Insights/Report depend on by fixed id (see
  // campaign.service.ts CORE_QUESTION_COUNT); questions beyond that are
  // "custom" — a Company's own campaign/product/industry-specific
  // additions, generically surfaced in Survey Results without any
  // hardcoded analytics dependency. Capped at 10 total (5 core + up to 5
  // custom) to keep the consumer survey short enough to complete.
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDto)
  surveyQuestions?: SurveyQuestionDto[];
}
