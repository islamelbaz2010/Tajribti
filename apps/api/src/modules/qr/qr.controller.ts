import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
  SetMetadata,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { QrService } from './qr.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { resolveCompanyId } from '../auth/company-scope.util';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

class RedeemQrDto {
  @IsString()
  qrCode: string;

  @IsUUID()
  campaignId: string;
}

// DL-105: body for creating a named source QR for a campaign placement.
class CreateSourceQrDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label: string;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('qr')
@UseGuards(JwtAuthGuard)
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('redeem')
  @HttpCode(HttpStatus.OK)
  redeem(@Request() req: RequestWithUser, @Body() dto: RedeemQrDto) {
    return this.qrService.redeemQr({
      qrCode: dto.qrCode,
      consumerId: req.user.id,
      campaignId: dto.campaignId,
    });
  }

  // Mobile web consumer entry — no qrCode string required, campaignId sufficient
  @Post('enter/:campaignId')
  @HttpCode(HttpStatus.OK)
  enter(@Param('campaignId') campaignId: string, @Request() req: RequestWithUser) {
    if (req.user.type !== 'consumer') throw new ForbiddenException('Consumer account required');
    return this.qrService.enterCampaignWeb(campaignId, req.user.id);
  }

  @Public()
  @Get('generate/:campaignId')
  async generateQr(
    @Param('campaignId') campaignId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.qrService.generateQrImage(campaignId);
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=86400',
    });
    res.send(buffer);
  }

  // DL-105: Create a labeled source QR for a specific campaign placement.
  // Brand-authenticated only. Each call creates a new independent QR code
  // that consumers can scan to enter the campaign — the label is stored so
  // source attribution analytics can show how many redemptions each
  // placement generated (GET /analytics/:id/qr-sources).
  @Post('campaign/:campaignId/sources')
  @HttpCode(HttpStatus.CREATED)
  async createSourceQr(
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateSourceQrDto,
    @Request() req: RequestWithUser,
  ) {
    // resolveCompanyId throws ForbiddenException for non-brand/employee users
    const brandAccountId = resolveCompanyId(req.user);
    return this.qrService.generateLabeledQr(campaignId, dto.label, brandAccountId);
  }
}
