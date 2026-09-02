import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Request,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  SetMetadata,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetsService, UploadedFileLike } from './assets.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  private requireBrand(req: RequestWithUser): string {
    if (req.user.type !== 'brand') throw new ForbiddenException('Brand account required');
    return req.user.id;
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('file'))
  uploadLogo(@Request() req: RequestWithUser, @UploadedFile() file: UploadedFileLike) {
    return this.assetsService.uploadBrandLogo(this.requireBrand(req), file);
  }

  @Delete('logo')
  @HttpCode(HttpStatus.OK)
  removeLogo(@Request() req: RequestWithUser) {
    return this.assetsService.removeBrandLogo(this.requireBrand(req));
  }

  @Post('campaign/:campaignId/product-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadCampaignProductImage(
    @Request() req: RequestWithUser,
    @Param('campaignId') campaignId: string,
    @UploadedFile() file: UploadedFileLike,
  ) {
    return this.assetsService.uploadCampaignProductImage(this.requireBrand(req), campaignId, file);
  }

  @Delete('campaign/:campaignId/product-image')
  @HttpCode(HttpStatus.OK)
  removeCampaignProductImage(@Request() req: RequestWithUser, @Param('campaignId') campaignId: string) {
    return this.assetsService.removeCampaignProductImage(this.requireBrand(req), campaignId);
  }

  // Public: campaign product images and company logos appear on public
  // surfaces (consumer join page, public sample report, campaign
  // discovery) that have no auth context — same public-image contract an
  // ordinary external image URL would already have had.
  @Public()
  @Get(':id')
  async serve(@Param('id') id: string, @Res() res: Response) {
    const asset = await this.assetsService.getAsset(id);
    res.set({
      'Content-Type': asset.mimeType,
      'Content-Length': asset.data.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.send(asset.data);
  }
}
