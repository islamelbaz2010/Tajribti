import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateBrandContactDto } from '../admin/dto/create-brand-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

// Company Foundation (2026-09-01): self-service Company Console surface —
// "who am I" (getMe) and the Company's own campaign-contact roster.
// Brand-JWT only, scoped to req.user.id exactly like CampaignController.
@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  private requireBrand(req: RequestWithUser): string {
    if (req.user.type !== 'brand') throw new ForbiddenException('Brand account required');
    return req.user.id;
  }

  @Get('me')
  getMe(@Request() req: RequestWithUser) {
    return this.companyService.getMe(this.requireBrand(req));
  }

  @Get('contacts')
  listContacts(@Request() req: RequestWithUser) {
    return this.companyService.listContacts(this.requireBrand(req));
  }

  @Post('contacts')
  createContact(@Request() req: RequestWithUser, @Body() dto: CreateBrandContactDto) {
    return this.companyService.createContact(this.requireBrand(req), dto);
  }

  @Delete('contacts/:id')
  async removeContact(@Request() req: RequestWithUser, @Param('id') id: string) {
    await this.companyService.removeContact(this.requireBrand(req), id);
    return { success: true };
  }

  @Get('sector-framework')
  getSectorFramework(@Request() req: RequestWithUser) {
    return this.companyService.getSectorFramework(this.requireBrand(req));
  }
}
