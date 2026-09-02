import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Asset } from '../../entities/asset.entity';
import { BrandAccount } from '../../entities/brand-account.entity';
import { Campaign } from '../../entities/campaign.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, BrandAccount, Campaign]),
    // Memory storage: the file lands in `file.buffer`, never written to the
    // API service's local disk (which has no persistent volume on Railway —
    // see asset.entity.ts). Global 4MB limit mirrors assets.service.ts's own
    // check; the service-level check is what actually produces the
    // friendly 400, this is just a hard upper backstop.
    MulterModule.register({
      limits: { fileSize: 4 * 1024 * 1024 },
    }),
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
