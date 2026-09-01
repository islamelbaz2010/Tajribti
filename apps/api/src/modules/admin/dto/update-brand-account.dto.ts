import { IsString, IsOptional, MinLength, MaxLength, IsEnum } from 'class-validator';
import { BrandSector } from '../../../entities/brand-account.entity';

// Company Foundation (2026-09-01): bounded admin edit surface for an
// existing Company. Deliberately excludes email/password (re-provisioning
// credentials is out of scope here — no self-service or admin password
// reset flow exists yet) and campaigns/contacts (managed via their own
// endpoints). Every field optional/patch-style, matching UpdateCampaignDto.
export class UpdateBrandAccountDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @IsOptional()
  @IsEnum(BrandSector)
  sector?: BrandSector;
}
