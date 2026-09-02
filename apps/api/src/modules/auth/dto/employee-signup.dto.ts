import { IsEmail, IsString, IsUUID, MinLength, MaxLength, Matches } from 'class-validator';

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// Founder ruling W-1 (2026-09-02): the self-registration path for a
// Company Employee. Deliberately NOT part of ordinary consumer signup
// (SignupDto, unchanged) — a separate account type, a separate endpoint.
// The person selects an EXISTING real Company (companyId, from the public
// GET /auth/employee/companies listing) and supplies that Company's own
// code; a wrong/missing code is rejected with a message telling them to
// obtain the correct one from their Company (see AuthService.employeeSignup()).
export class EmployeeSignupDto {
  @IsUUID()
  companyId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  code: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @Matches(PASSWORD_PATTERN, {
    message: 'Password must be at least 8 characters and include a letter and a number',
  })
  password: string;
}
