import { Controller, Post, Get, UseGuards, SetMetadata } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/guards/jwt.guard';

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('seed')
  seed() {
    return this.adminService.seedDemo();
  }

  @Public()
  @Post('seed/reset')
  resetSeed() {
    return this.adminService.resetDemo();
  }
}
