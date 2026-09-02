import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Consumer } from '../../entities/consumer.entity';
import { BrandAccount } from '../../entities/brand-account.entity';
import { Campaign } from '../../entities/campaign.entity';
import { CampaignVerification } from '../../entities/campaign-verification.entity';
import { EmailVerificationToken } from '../../entities/email-verification-token.entity';
import { CompanyEmployee } from '../../entities/company-employee.entity';
import { AdminUser } from '../../entities/admin-user.entity';

// OtpSession entity is retained in app.module.ts entity list so the DB table is not dropped.
// AuthModule no longer uses OtpSession — V1.2 delegates OTP lifecycle to Akedly.

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRY') ?? '15m',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Consumer,
      BrandAccount,
      Campaign,
      CampaignVerification,
      EmailVerificationToken,
      CompanyEmployee,
      AdminUser,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
