import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Consumer } from '../../entities/consumer.entity';
import { OtpSession } from '../../entities/otp-session.entity';
import { BrandAccount } from '../../entities/brand-account.entity';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { BrandLoginDto } from './dto/brand-login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyOtpResult extends TokenPair {
  isNewUser: boolean;
  consumerId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly DEMO_OTP = '0000';
  private readonly OTP_TTL_MS = 5 * 60 * 1000;

  constructor(
    @InjectRepository(Consumer)
    private readonly consumerRepo: Repository<Consumer>,
    @InjectRepository(OtpSession)
    private readonly otpRepo: Repository<OtpSession>,
    @InjectRepository(BrandAccount)
    private readonly brandRepo: Repository<BrandAccount>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async requestOtp(dto: RequestOtpDto): Promise<{ message: string }> {
    const { phone } = dto;
    const isDemoMode = this.isDemoMode();

    const code = isDemoMode
      ? this.DEMO_OTP
      : Math.floor(100000 + Math.random() * 900000).toString();

    await this.otpRepo.delete({ phone });

    const expiresAt = new Date(Date.now() + this.OTP_TTL_MS);
    await this.otpRepo.save(
      this.otpRepo.create({ phone, code, expiresAt }),
    );

    if (!isDemoMode) {
      await this.sendAkedlyOtp(phone, code);
    }

    this.logger.log(
      `OTP requested for ${phone} — demo mode: ${isDemoMode}`,
    );

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResult> {
    const { phone, code } = dto;
    const isDemoMode = this.isDemoMode();
    const isDemoBypass = isDemoMode && code === this.DEMO_OTP;

    if (!isDemoBypass) {
      const otpSession = await this.otpRepo.findOne({
        where: {
          phone,
          used: false,
          expiresAt: MoreThan(new Date()),
        },
        order: { createdAt: 'DESC' },
      });

      if (!otpSession) {
        throw new UnauthorizedException('OTP not found or expired');
      }

      if (otpSession.code !== code) {
        throw new UnauthorizedException('Invalid OTP code');
      }

      await this.otpRepo.update(otpSession.id, { used: true });
    }

    let consumer = await this.consumerRepo.findOne({ where: { phone } });
    const isNewUser = !consumer;

    if (!consumer) {
      consumer = await this.consumerRepo.save(
        this.consumerRepo.create({ phone }),
      );
    }

    const tokens = this.generateTokens(consumer.id, phone, 'consumer');
    return { ...tokens, isNewUser, consumerId: consumer.id };
  }

  async register(consumerId: string, dto: RegisterDto): Promise<Consumer> {
    const consumer = await this.consumerRepo.findOne({
      where: { id: consumerId },
    });

    if (!consumer) {
      throw new NotFoundException('Consumer not found');
    }

    consumer.name = dto.name;
    consumer.ageRange = dto.ageRange;
    consumer.gender = dto.gender;
    consumer.city = dto.city;
    consumer.interest = dto.interest ?? null;

    return this.consumerRepo.save(consumer);
  }

  async brandLogin(dto: BrandLoginDto): Promise<TokenPair & { brandId: string; brandName: string }> {
    const brand = await this.brandRepo.findOne({
      where: { email: dto.email },
    });

    if (!brand) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, brand.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(brand.id, brand.email, 'brand');
    return { ...tokens, brandId: brand.id, brandName: brand.name };
  }

  async getMe(consumerId: string): Promise<Consumer> {
    const consumer = await this.consumerRepo.findOne({
      where: { id: consumerId },
    });

    if (!consumer) {
      throw new NotFoundException('Consumer not found');
    }

    return consumer;
  }

  private generateTokens(
    sub: string,
    identifier: string,
    type: 'consumer' | 'brand',
  ): TokenPair {
    const payload: JwtPayload = { sub, identifier, type };
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRY') ?? '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRY') ?? '7d',
    });

    return { accessToken, refreshToken };
  }

  private isDemoMode(): boolean {
    return this.configService.get<string>('DEMO_MODE') === 'true';
  }

  private async sendAkedlyOtp(phone: string, code: string): Promise<void> {
    try {
      const apiKey = this.configService.get<string>('AKEDLY_API_KEY');
      const pipelineId = this.configService.get<string>('AKEDLY_PIPELINE_ID');
      const templateId = this.configService.get<string>('AKEDLY_TEMPLATE_ID');
      const otpVar = this.configService.get<string>('AKEDLY_OTP_VAR') ?? 'otp';

      if (!apiKey || !pipelineId || !templateId) {
        this.logger.warn('Akedly not configured — OTP not delivered');
        return;
      }

      const res = await fetch('https://api.akedly.io/api/v1/utilities/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          APIKey: apiKey,
          pipelineID: pipelineId,
          templateId: templateId,
          variableValues: { [otpVar]: code },
          phone,
          customerUserId: phone,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Akedly delivery failed for ${phone}: ${text}`);
      }
    } catch (error) {
      this.logger.error(`Akedly OTP request threw for ${phone}`, error);
    }
  }
}
