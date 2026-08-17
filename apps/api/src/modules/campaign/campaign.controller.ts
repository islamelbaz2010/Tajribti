import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  SetMetadata,
  ForbiddenException,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  create(@Request() req: RequestWithUser, @Body() dto: CreateCampaignDto) {
    if (req.user.type !== 'brand') throw new ForbiddenException('Brand account required');
    return this.campaignService.createCampaign(req.user.id, dto);
  }

  @Get('my')
  findMy(@Request() req: RequestWithUser) {
    if (req.user.type !== 'brand') throw new ForbiddenException('Brand account required');
    return this.campaignService.findByBrand(req.user.id);
  }

  @Get()
  findActive() {
    return this.campaignService.findActive();
  }

  @Public()
  @Get('demo/active')
  findDemoActive() {
    return this.campaignService.findDemoActive();
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.campaignService.findById(id);
  }
}
