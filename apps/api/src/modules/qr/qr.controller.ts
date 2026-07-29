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
} from '@nestjs/common';
import { Response } from 'express';
import { QrService } from './qr.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { IsString, IsUUID } from 'class-validator';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

class RedeemQrDto {
  @IsString()
  qrCode: string;

  @IsUUID()
  campaignId: string;
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
}
