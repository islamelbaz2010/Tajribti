import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { CreateBrandAccountDto } from './dto/create-brand-account.dto';
import { UpdateBrandAccountDto } from './dto/update-brand-account.dto';
import { CreateBrandContactDto } from './dto/create-brand-contact.dto';

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

  // Company Foundation (2026-09-01): Admin listing/edit of existing
  // Companies (name/logo/sector) and their Contacts — same x-admin-secret
  // gate as every route above, not a public surface.
  @Get('brands')
  listBrands(@Headers('x-admin-secret') secret: string | undefined) {
    this.checkAdminSecret(secret);
    return this.adminService.listBrands();
  }

  @Patch('brands/:id')
  updateBrand(
    @Headers('x-admin-secret') secret: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateBrandAccountDto,
  ) {
    this.checkAdminSecret(secret);
    return this.adminService.updateBrand(id, dto);
  }

  @Get('brands/:id/contacts')
  listBrandContacts(
    @Headers('x-admin-secret') secret: string | undefined,
    @Param('id') id: string,
  ) {
    this.checkAdminSecret(secret);
    return this.adminService.listBrandContacts(id);
  }

  @Post('brands/:id/contacts')
  createBrandContact(
    @Headers('x-admin-secret') secret: string | undefined,
    @Param('id') id: string,
    @Body() dto: CreateBrandContactDto,
  ) {
    this.checkAdminSecret(secret);
    return this.adminService.createBrandContact(id, dto);
  }

  @Delete('brands/:id/contacts/:contactId')
  deleteBrandContact(
    @Headers('x-admin-secret') secret: string | undefined,
    @Param('id') id: string,
    @Param('contactId') contactId: string,
  ) {
    this.checkAdminSecret(secret);
    return this.adminService.deleteBrandContact(id, contactId).then(() => ({ success: true }));
  }
}
