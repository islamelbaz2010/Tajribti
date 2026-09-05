import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { resolveCompanyId } from '../auth/company-scope.util';

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
    return this.campaignService.createCampaign(resolveCompanyId(req.user), dto);
  }

  @Get('my')
  findMy(@Request() req: RequestWithUser) {
    return this.campaignService.findByBrand(resolveCompanyId(req.user));
  }

  // Internal Tajribti Campaign Operations (DL-055 item 1): edit + status
  // lifecycle for a campaign the authenticated brand owns.
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignService.updateCampaign(resolveCompanyId(req.user), id, dto);
  }

  @Public()
  @Get()
  findActive() {
    return this.campaignService.findActive();
  }

  @Public()
  @Get('demo/active')
  findDemoActive() {
    return this.campaignService.findDemoActive();
  }

  // Benchmark Alignment — Audience/Eligibility (2026-09-06, DL-101):
  // Consumer-facing pre-participation eligibility check. The consumer app
  // calls this before initiating the OTP/participation flow so it can show
  // an appropriate state (eligible → proceed, ineligible → explain why).
  //
  // Requires a valid consumer JWT. Returns {eligible, reason?}. The server-
  // side participation gates (QrService, AuthService) enforce the same rule
  // independently — this endpoint is informational (lets the app present the
  // right UI) and does NOT replace server enforcement.
  @Get(':id/eligibility')
  async checkEligibility(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ) {
    if (req.user.type !== 'consumer') {
      throw new ForbiddenException('Only consumers can check campaign eligibility');
    }
    return this.campaignService.checkEligibilityForConsumer(id, req.user.id);
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.campaignService.findById(id);
  }
}
