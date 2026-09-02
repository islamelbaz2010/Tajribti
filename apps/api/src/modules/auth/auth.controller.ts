import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { BrandLoginDto } from './dto/brand-login.dto';
import { EmployeeSignupDto } from './dto/employee-signup.dto';
import { EmployeeLoginDto } from './dto/employee-login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { JwtAuthGuard, IS_PUBLIC_KEY } from './guards/jwt.guard';
import { AuthenticatedUser } from './strategies/jwt.strategy';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Account authentication (email + password) — independent of Campaigns ──

  /**
   * POST /api/v1/auth/signup
   * Create a Consumer account with email + password. No Campaign context
   * required. Issues an account JWT pair immediately (emailVerified=false).
   */
  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  /**
   * POST /api/v1/auth/login
   * Normal account login: email + password. No Campaign context required.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /api/v1/auth/verify-email
   * Consume a single-use email verification token.
   */
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmailToken(dto);
  }

  // ── Campaign participation verification (phone + OTP) ───────────────────
  // Requires an authenticated account (no longer @Public()) — this is
  // Campaign-specific verification, not account login. Every call is bound
  // to a campaignId in the DTO.

  /**
   * GET /api/v1/auth/akedly/challenge
   * Proxy to Akedly V1.2 challenge endpoint. Returns challenge data for client-side PoW.
   * API key never leaves the backend.
   */
  @Public()
  @Get('akedly/challenge')
  getChallenge() {
    return this.authService.getChallenge();
  }

  /**
   * POST /api/v1/auth/otp/request
   * Campaign-specific participation verification OTP - requires an
   * authenticated Consumer and a campaignId. Production: forwards phone +
   * powSolution to Akedly V1.2; returns transactionReqID. Demo mode:
   * returns immediately without an Akedly call.
   */
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  requestOtp(@Request() req: RequestWithUser, @Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto, req.user.id);
  }

  /**
   * POST /api/v1/auth/otp/verify
   * Verifies transactionReqID + code with Akedly V1.2 (or DEMO_MODE bypass),
   * then records a CampaignVerification for (this consumer, dto.campaignId).
   * Does not issue new tokens - the caller already holds a valid account JWT.
   */
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Request() req: RequestWithUser, @Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto, req.user.id);
  }

  /**
   * POST /api/v1/auth/register
   * Legacy: complete consumer profile after phone-OTP identity (pre-account
   * model). Kept for backward compatibility; unused by the current signup flow.
   */
  @Post('register')
  @HttpCode(HttpStatus.OK)
  register(@Request() req: RequestWithUser, @Body() dto: RegisterDto) {
    return this.authService.register(req.user.id, dto);
  }

  /**
   * POST /api/v1/auth/brand/login
   * Brand dashboard login. Returns JWT pair + brand info.
   */
  @Public()
  @Post('brand/login')
  @HttpCode(HttpStatus.OK)
  brandLogin(@Body() dto: BrandLoginDto) {
    return this.authService.brandLogin(dto);
  }

  // ── Company Employee identity (Founder ruling W-1, 2026-09-02) ──────────
  // A separate registration/login path from both Consumer and Brand — see
  // auth.service.ts's employeeSignup()/employeeLogin() for the full
  // company-code validation contract.

  /**
   * GET /api/v1/auth/employee/companies
   * Public, minimal-field directory (id/name/logoUrl only) so a person
   * registering as an employee can select the real Company they work for.
   */
  @Public()
  @Get('employee/companies')
  listCompaniesForEmployeeSignup() {
    return this.authService.listCompaniesForEmployeeSignup();
  }

  /**
   * POST /api/v1/auth/employee/signup
   * Registers a new Company Employee against an existing Company + its
   * employee code. Wrong/missing code is rejected with a message telling
   * the person to obtain the correct one from their Company.
   */
  @Public()
  @Post('employee/signup')
  @HttpCode(HttpStatus.CREATED)
  employeeSignup(@Body() dto: EmployeeSignupDto) {
    return this.authService.employeeSignup(dto);
  }

  /**
   * POST /api/v1/auth/employee/login
   */
  @Public()
  @Post('employee/login')
  @HttpCode(HttpStatus.OK)
  employeeLogin(@Body() dto: EmployeeLoginDto) {
    return this.authService.employeeLogin(dto);
  }

  // ── TAJRIBTI Admin identity (Founder ruling W-2, 2026-09-02) ────────────
  // Admin *creation* stays under AdminController (POST /admin/auth/bootstrap,
  // gated by the existing x-admin-secret) — this is only the login path,
  // symmetric with /auth/brand/login and /auth/employee/login above.

  /**
   * POST /api/v1/auth/admin/login
   */
  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  /**
   * POST /api/v1/auth/refresh
   * Exchange a valid refresh token for a new access + refresh token pair.
   * Does not require a current access token — consumers use this when the 15m access token expires.
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  /**
   * GET /api/v1/auth/me
   * Return current consumer profile from JWT. Never includes passwordHash.
   */
  @Get('me')
  getMe(@Request() req: RequestWithUser) {
    return this.authService.getMe(req.user.id);
  }
}
