import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { resolveCompanyId } from '../auth/company-scope.util';

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

// Campaign-scoped Media/Gallery — internal Tajribti operations surface,
// not a public/social endpoint. Mirrors the ownership-check pattern used
// by AnalyticsController/ReportController exactly (brand-scoped, JWT
// required, campaign ownership asserted on every request).
@Controller('campaigns/:campaignId/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  private async assertOwnership(req: RequestWithUser, campaignId: string): Promise<void> {
    await this.mediaService.assertBrandOwnership(campaignId, resolveCompanyId(req.user));
  }

  @Get()
  async list(@Param('campaignId') campaignId: string, @Request() req: RequestWithUser) {
    await this.assertOwnership(req, campaignId);
    return this.mediaService.listForCampaign(campaignId);
  }

  @Post()
  async create(
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateMediaDto,
    @Request() req: RequestWithUser,
  ) {
    await this.assertOwnership(req, campaignId);
    return this.mediaService.create(campaignId, dto);
  }

  @Delete(':mediaId')
  async remove(
    @Param('campaignId') campaignId: string,
    @Param('mediaId') mediaId: string,
    @Request() req: RequestWithUser,
  ) {
    await this.assertOwnership(req, campaignId);
    await this.mediaService.remove(campaignId, mediaId);
    return { success: true };
  }
}
