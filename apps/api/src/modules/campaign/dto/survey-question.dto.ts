import { IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// Mirrors the existing SurveyQuestion shape in campaign.entity.ts exactly.
// Question count/order/types remain fixed at 5 (id q1-q5, matching
// DEFAULT_SURVEY_QUESTIONS in campaign.service.ts) — this DTO only lets
// Tajribti's internal team adapt question/option TEXT per campaign
// sector/product; it is not a generalized Survey Builder.
export class SurveyQuestionDto {
  @IsString()
  id: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  text: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  textAr: string;

  @IsIn(['stars', 'scale', 'multiple_choice', 'text'])
  type: 'stars' | 'scale' | 'multiple_choice' | 'text';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionsAr?: string[];

  @IsBoolean()
  required: boolean;
}
