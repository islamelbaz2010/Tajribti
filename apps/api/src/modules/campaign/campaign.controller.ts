import { Controller, Get, Param, UseGuards, SetMetadata } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/guards/jwt.guard';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  findActive() {
    return this.campaignService.findActive();
  }

  @Public()
  @Get('demo/active')
  findDemoActive() {
    return this.campaignService.findDemoActive();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.campaignService.findById(id);
  }
}
