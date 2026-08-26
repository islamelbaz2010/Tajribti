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

  // Optional per-campaign research configuration, prepared internally by
  // Tajribti's team when the standard 5-question trial survey needs
  // sector/product-specific wording (e.g. the default q3 word bank is
  // beverage-oriented). Omitted -> the existing standard survey is used
  // unchanged, exactly as before this field existed.
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SurveyQuestionDto)
  surveyQuestions?: SurveyQuestionDto[];
}
