import { Controller, Get, Param, Query, UseGuards, SetMetadata } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/guards/jwt.guard';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Get(':campaignId/overview')
  getOverview(@Param('campaignId') campaignId: string) {
    return this.analyticsService.getOverview(campaignId);
  }

  @Public()
  @Get(':campaignId/demographics')
  getDemographics(@Param('campaignId') campaignId: string) {
    return this.analyticsService.getDemographics(campaignId);
  }

  @Public()
  @Get(':campaignId/survey')
  getSurveyBreakdown(@Param('campaignId') campaignId: string) {
    return this.analyticsService.getSurveyBreakdown(campaignId);
  }

  @Public()
  @Get(':campaignId/participants')
  getParticipants(
    @Param('campaignId') campaignId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.analyticsService.getParticipants(campaignId, +page, +limit);
  }
}
