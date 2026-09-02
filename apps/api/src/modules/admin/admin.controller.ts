import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { CreateBrandAccountDto } from './dto/create-brand-account.dto';
import { UpdateBrandAccountDto } from './dto/update-brand-account.dto';
import { CreateBrandContactDto } from './dto/create-brand-contact.dto';
import { CreateCompanyEmployeeDto } from './dto/create-company-employee.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // Founder ruling W-2 (2026-09-02): every admin.* route now accepts
  // EITHER the legacy x-admin-secret header (kept working as a migration/
  // emergency mechanism — and as the one thing that bootstraps the first
  // real AdminUser) OR a valid AdminUser JWT (the real Admin identity
  // model this ruling requires). The secret is deliberately NOT removed —
  // this task's own instruction is "may remain temporarily as a
  // migration/emergency mechanism... must NOT remain the sole Admin
  // authentication model after this implementation," which this satisfies
  // without a disruptive cutover.
  private async checkAdminAuth(
    secret: string | undefined,
    authHeader: string | undefined,
  ): Promise<void> {
    const expectedSecret = this.configService.get<string>('ADMIN_SECRET');
    if (expectedSecret && secret === expectedSecret) return;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length);
      try {
        const payload = this.jwtService.verify<JwtPayload>(token, {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        });
        if (payload.type === 'admin' && (await this.adminService.isValidAdminUser(payload.sub))) {
          return;
        }
      } catch {
        // fall through to the rejection below
      }
    }

    throw new UnauthorizedException('Admin authentication required');
  }

  @Post('seed')
  async seed(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.seedDemo();
  }

  @Post('seed/reset')
  async resetSeed(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.resetDemo();
  }

  // ── TAJRIBTI Admin identity (Founder ruling W-2, 2026-09-02) ───────────

  // Bootstraps a real AdminUser. Secret-only (not also JWT-acceptable) —
  // deliberately the one route that stays gated by the legacy mechanism
  // alone, since a not-yet-existing Admin obviously cannot present an
  // Admin JWT. Once at least one AdminUser exists, every other admin.*
  // route (including this one, for creating further Admins) also accepts
  // that AdminUser's own JWT.
  @Post('auth/bootstrap')
  async bootstrapAdmin(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Body() dto: CreateAdminUserDto,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.bootstrapAdminUser(dto);
  }

  // Session check for the Admin Control Center UI — symmetric with
  // GET /company/me and GET /auth/me.
  @Get('auth/me')
  async getMe(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = this.jwtService.verify<JwtPayload>(authHeader.slice('Bearer '.length), {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        });
        if (payload.type === 'admin') {
          const admin = await this.adminService.getAdminUser(payload.sub);
          if (admin) return admin;
        }
      } catch {
        // secret-only callers (no admin identity yet) fall through below
      }
    }
    return { id: null, name: 'Admin (secret)', email: null };
  }

  // Controlled/internal Brand provisioning (Pilot Operations Closure,
  // 2026-09-01): the current pilot's onboarding mechanism — an internal
  // operator holding ADMIN_SECRET provisions a real BrandAccount, then
  // hands the Brand its email/password for /auth/brand/login. Not a
  // public signup route: same admin-auth gate as every route above.
  @Post('brands')
  async createBrand(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Body() dto: CreateBrandAccountDto,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.createBrand(dto);
  }

  // Company Foundation (2026-09-01): Admin listing/edit of existing
  // Companies (name/logo/sector) and their Contacts — same admin-auth
  // gate as every route above, not a public surface.
  @Get('brands')
  async listBrands(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.listBrands();
  }

  // Admin Control Center (Founder ruling W-2, 2026-09-02): the
  // "Admin -> Company" drill-down step.
  @Get('brands/:id')
  async getBrand(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.getBrandDetail(id);
  }

  @Patch('brands/:id')
  async updateBrand(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateBrandAccountDto,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.updateBrand(id, dto);
  }

  @Get('brands/:id/contacts')
  async listBrandContacts(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.listBrandContacts(id);
  }

  @Post('brands/:id/contacts')
  async createBrandContact(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
    @Body() dto: CreateBrandContactDto,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.createBrandContact(id, dto);
  }

  @Delete('brands/:id/contacts/:contactId')
  async deleteBrandContact(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
    @Param('contactId') contactId: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    await this.adminService.deleteBrandContact(id, contactId);
    return { success: true };
  }

  // ── Company Employees (Founder ruling W-1, 2026-09-02) ─────────────────

  @Get('brands/:id/employees')
  async listCompanyEmployees(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.listCompanyEmployees(id);
  }

  @Post('brands/:id/employees')
  async createCompanyEmployee(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
    @Body() dto: CreateCompanyEmployeeDto,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.createCompanyEmployee(id, dto);
  }

  @Delete('brands/:id/employees/:employeeId')
  async deleteCompanyEmployee(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    await this.adminService.deleteCompanyEmployee(id, employeeId);
    return { success: true };
  }

  @Post('brands/:id/employee-code/regenerate')
  async regenerateEmployeeCode(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.regenerateEmployeeCode(id);
  }

  // ── Admin Control Center: cross-Company Campaign navigation
  // (Founder ruling W-2, 2026-09-02) ──────────────────────────────────────
  // "Admin -> Company -> Campaigns -> Selected Campaign -> Participants/
  // Data -> Insights -> Report."

  @Get('campaigns')
  async listAllCampaigns(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('brandId') brandId?: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.listAllCampaigns({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      status,
      brandId,
    });
  }

  @Get('campaigns/:id')
  async getCampaign(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.getCampaignDetailForAdmin(id);
  }

  @Get('campaigns/:id/overview')
  async getCampaignOverview(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.getCampaignOverviewForAdmin(id);
  }

  @Get('campaigns/:id/demographics')
  async getCampaignDemographics(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.getCampaignDemographicsForAdmin(id);
  }

  @Get('campaigns/:id/survey')
  async getCampaignSurvey(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.getCampaignSurveyForAdmin(id);
  }

  @Get('campaigns/:id/participants')
  async getCampaignParticipants(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.getCampaignParticipantsForAdmin(id, +page, +limit);
  }

  @Get('campaigns/:id/ai-summary')
  async getCampaignAiSummary(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.getCampaignAiSummaryForAdmin(id);
  }

  @Get('campaigns/:id/report')
  async getCampaignReport(
    @Headers('x-admin-secret') secret: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
  ) {
    await this.checkAdminAuth(secret, authHeader);
    return this.adminService.getCampaignReportForAdmin(id);
  }
}
