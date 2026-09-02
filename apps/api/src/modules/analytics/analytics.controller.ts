import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { resolveCompanyId } from '../auth/company-scope.util';

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  private async assertOwnership(req: RequestWithUser, campaignId: string): Promise<void> {
    await this.analyticsService.assertBrandOwnership(campaignId, resolveCompanyId(req.user));
  }

  @Get(':campaignId/overview')
  async getOverview(
    @Param('campaignId') campaignId: string,
    @Request() req: RequestWithUser,
  ) {
    await this.assertOwnership(req, campaignId);
    return this.analyticsService.getOverview(campaignId);
  }

  @Get(':campaignId/demographics')
  async getDemographics(
    @Param('campaignId') campaignId: string,
    @Request() req: RequestWithUser,
  ) {
    await this.assertOwnership(req, campaignId);
    return this.analyticsService.getDemographics(campaignId);
  }

  @Get(':campaignId/survey')
  async getSurveyBreakdown(
    @Param('campaignId') campaignId: string,
    @Request() req: RequestWithUser,
  ) {
    await this.assertOwnership(req, campaignId);
    return this.analyticsService.getSurveyBreakdown(campaignId);
  }

  @Get(':campaignId/participants')
  async getParticipants(
    @Param('campaignId') campaignId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Request() req: RequestWithUser,
  ) {
    await this.assertOwnership(req, campaignId);
    return this.analyticsService.getParticipants(campaignId, +page, +limit);
  }
}
