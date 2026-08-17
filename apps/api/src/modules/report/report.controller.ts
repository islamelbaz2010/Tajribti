import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  private async assertOwnership(req: RequestWithUser, campaignId: string): Promise<void> {
    if (req.user.type !== 'brand') throw new ForbiddenException('Brand account required');
    await this.reportService.assertBrandOwnership(campaignId, req.user.id);
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
