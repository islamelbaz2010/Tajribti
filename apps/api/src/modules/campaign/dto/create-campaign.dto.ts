import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  IsUUID,
  IsIn,
  Min,
  MaxLength,
  MinLength,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SurveyQuestionDto } from './survey-question.dto';

// Accepted ageRange values — mirrors the consumer onboarding options so
// campaign restrictions align with what profile data actually stores.
export const VALID_AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];

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

  // Company Foundation (2026-09-01): optional reference to one of the
  // owning Company's own BrandContact records — ownership-validated in
  // campaign.service.ts (a contact from another Company can never be
  // attached, same pattern as every other ownership check in this file).
  @IsOptional()
  @IsUUID()
  contactId?: string;

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

  // Benchmark Alignment — Campaign Creation (2026-09-06, DL-101):
  // Campaign objective/goal — what the Company aims to learn or validate.
  @IsOptional()
  @IsString()
  @MaxLength(500)
  objective?: string;

  // Benchmark Alignment — Audience/Eligibility (2026-09-06, DL-101):
  // Gender restriction. NULL/omitted = no restriction.
  @IsOptional()
  @IsIn(['male', 'female'])
  audienceGender?: string;

  // Benchmark Alignment — Audience/Eligibility (2026-09-06, DL-101):
  // Age range restriction. Empty array / omitted = no restriction.
  // Each value must match a known ageRange string.
  @IsOptional()
  @IsArray()
  @IsIn(VALID_AGE_RANGES, { each: true })
  audienceAgeRanges?: string[];
}
