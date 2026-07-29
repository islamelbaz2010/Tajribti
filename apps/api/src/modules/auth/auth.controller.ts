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
   * POST /api/v1/auth/otp/request
   * Send OTP to phone number. In DEMO_MODE, always sends "0000".
   */
  @Public()
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  requestOtp(@Body() dto: RequestOtpDto): Promise<{ message: string }> {
    return this.authService.requestOtp(dto);
  }

  /**
   * POST /api/v1/auth/otp/verify
   * Verify OTP. Returns JWT pair + isNewUser flag.
   * In DEMO_MODE, code "0000" always succeeds.
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
   * GET /api/v1/auth/me
   * Return current consumer profile from JWT.
   */
  @Get('me')
  getMe(@Request() req: RequestWithUser) {
    return this.authService.getMe(req.user.id);
  }
}
