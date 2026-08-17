import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

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
}
