import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

// Controlled/internal Brand provisioning only (Pilot Operations Closure,
// 2026-09-01) — created by an authorized internal operator via the
// existing x-admin-secret gate, not a public self-service signup DTO.
// Same shape as the fields AdminService.seedDemo() has always written to
// BrandAccount (name/email/password/logoUrl); nothing new added.
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
}
