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
import { BrandLoginDto } from './dto/brand-login.dto';
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
   * Production: forward phone + powSolution to Akedly V1.2; returns transactionReqID.
   * Demo mode: returns immediately without Akedly call.
   */
  @Public()
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  /**
   * POST /api/v1/auth/otp/verify
   * Production: verifies transactionReqID + code with Akedly V1.2; issues JWT.
   * Demo mode: code '0000' always succeeds.
   */
  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  /**
   * POST /api/v1/auth/register
   * Complete consumer profile. Requires valid JWT from /otp/verify.
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
   * Return current consumer profile from JWT.
   */
  @Get('me')
  getMe(@Request() req: RequestWithUser) {
    return this.authService.getMe(req.user.id);
  }
}
