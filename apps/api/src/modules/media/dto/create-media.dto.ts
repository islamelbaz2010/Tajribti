import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { CampaignMediaType } from '../../../entities/campaign-media.entity';

export class CreateMediaDto {
  @IsEnum(CampaignMediaType)
  type: CampaignMediaType;

  // Referenced by URL — same pattern as the existing Campaign.productImage
  // field. No upload/storage subsystem is introduced by this DTO.
  @IsString()
  @IsUrl({ require_protocol: true })
  @MaxLength(1000)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  caption?: string;
}
