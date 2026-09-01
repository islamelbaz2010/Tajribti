import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { CreateBrandAccountDto } from './dto/create-brand-account.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {}

  private checkAdminSecret(provided: string | undefined): void {
    const expected = this.configService.get<string>('ADMIN_SECRET');
    if (!expected) {
      throw new UnauthorizedException('Admin endpoints are not configured');
    }
    if (provided !== expected) {
      throw new UnauthorizedException('Invalid admin secret');
    }
  }

  @Post('seed')
  seed(@Headers('x-admin-secret') secret: string | undefined) {
    this.checkAdminSecret(secret);
    return this.adminService.seedDemo();
  }

  @Post('seed/reset')
  resetSeed(@Headers('x-admin-secret') secret: string | undefined) {
    this.checkAdminSecret(secret);
    return this.adminService.resetDemo();
  }

  // Controlled/internal Brand provisioning (Pilot Operations Closure,
  // 2026-09-01): the current pilot's onboarding mechanism — an internal
  // operator holding ADMIN_SECRET provisions a real BrandAccount, then
  // hands the Brand its email/password for /auth/brand/login. Not a
  // public signup route: same x-admin-secret gate as /admin/seed above.
  @Post('brands')
  createBrand(
    @Headers('x-admin-secret') secret: string | undefined,
    @Body() dto: CreateBrandAccountDto,
  ) {
    this.checkAdminSecret(secret);
    return this.adminService.createBrand(dto);
  }
}
