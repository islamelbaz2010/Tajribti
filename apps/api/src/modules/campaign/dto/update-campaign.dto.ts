import { IsString, IsInt, IsOptional, Min, MaxLength, MinLength, IsEnum } from 'class-validator';
import { CampaignStatus } from '../../../entities/campaign.entity';

// Bounded edit surface for Internal Tajribti Campaign Operations (DL-055 item 1.
// Deliberately excludes brandAccountId, isDemo, surveyQuestions (unchanged —
// no Survey Builder), and startDate (a campaign's start shouldn't move once
// QR codes/participation may already reference it).
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
}
