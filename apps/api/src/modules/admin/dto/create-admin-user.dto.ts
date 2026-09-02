import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

// Bootstraps a real AdminUser (Founder ruling W-2, 2026-09-02). Only
// reachable via POST /admin/auth/bootstrap, itself gated by the same
// x-admin-secret already used everywhere else in this controller — the
// secret's remaining role is exactly this: standing up/administering real
// Admin identities, not steady-state daily operation.
export class CreateAdminUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
