import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

// Company Foundation (2026-09-01): a contact record, not an account — no
// password/login field exists here by design (see brand-contact.entity.ts).
export class CreateBrandContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;
}
