import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

// Founder ruling W-1 (2026-09-02): "Admin may create employee accounts
// when the Company requests them." Same shape/pattern as
// CreateBrandAccountDto — the operator (who is relaying the Company's
// request) sets the initial email/password directly, exactly like
// admin.service.ts's existing createBrand(); no email-delivery
// infrastructure is invented to hand out a generated password (none
// exists anywhere else in this repository either — see
// auth.service.ts's own disclosed email-verification-link gap).
export class CreateCompanyEmployeeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt silently truncates beyond 72 bytes
  password: string;
}
