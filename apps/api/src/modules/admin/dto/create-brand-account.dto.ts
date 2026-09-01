import { IsEmail, IsString, IsOptional, MinLength, MaxLength, IsEnum } from 'class-validator';
import { BrandSector } from '../../../entities/brand-account.entity';

// Controlled/internal Brand provisioning only (Pilot Operations Closure,
// 2026-09-01) — created by an authorized internal operator via the
// existing x-admin-secret gate, not a public self-service signup DTO.
// Same shape as the fields AdminService.seedDemo() has always written to
// BrandAccount (name/email/password/logoUrl); `sector` added for Company
// Foundation (2026-09-01) — optional, controlled-list only (see BrandSector).
export class CreateBrandAccountDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt silently truncates beyond 72 bytes
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @IsOptional()
  @IsEnum(BrandSector)
  sector?: BrandSector;
}
