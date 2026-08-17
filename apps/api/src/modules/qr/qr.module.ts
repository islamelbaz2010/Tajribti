import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCode } from '../../entities/qr-code.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { Campaign } from '../../entities/campaign.entity';
import { Consumer } from '../../entities/consumer.entity';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';

@Module({
  imports: [TypeOrmModule.forFeature([QrCode, RedemptionEvent, Campaign, Consumer])],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
