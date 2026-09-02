import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { resolveCompanyId } from '../auth/company-scope.util';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Public Sample Report (Commercial V1 Completion Sprint, 2026-09-01):
  // powers the public marketing site — no auth, no campaignId param,
  // hardcoded server-side to the seeded demo campaign only (see
  // report.service.ts's generatePublicSampleReport()).
  @Public()
  @Get('sample')
  getPublicSampleReport() {
    return this.reportService.generatePublicSampleReport();
  }

  private async assertOwnership(req: RequestWithUser, campaignId: string): Promise<void> {
    await this.reportService.assertBrandOwnership(campaignId, resolveCompanyId(req.user));
  }

  @Get(':campaignId/ai-summary')
  async getAiSummary(
    @Param('campaignId') campaignId: string,
    @Request() req: RequestWithUser,
  ) {
    await this.assertOwnership(req, campaignId);
    return this.reportService.getAiSummary(campaignId);
  }

  @Get(':campaignId/pdf-data')
  async getPdfData(
    @Param('campaignId') campaignId: string,
    @Request() req: RequestWithUser,
  ) {
    await this.assertOwnership(req, campaignId);
    return this.reportService.generatePdfData(campaignId);
  }
}
