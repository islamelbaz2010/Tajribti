import { Controller, Get, Param, Res, UseGuards, SetMetadata } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/guards/jwt.guard';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Public()
  @Get(':campaignId/ai-summary')
  getAiSummary(@Param('campaignId') campaignId: string) {
    return this.reportService.getAiSummary(campaignId);
  }

  @Public()
  @Get(':campaignId/pdf-data')
  getPdfData(@Param('campaignId') campaignId: string) {
    return this.reportService.generatePdfData(campaignId);
  }
}
