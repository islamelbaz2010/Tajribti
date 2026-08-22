import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Consumer } from '../../entities/consumer.entity';
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

interface PendingVerification {
  phone: string;
  expiresAt: Date;
}

export interface AkedlyChallengeData {
  challenge: string;
  difficulty: number;
  challengeToken: string;
  challengeRequired: boolean;
  turnstile: { required: boolean; siteKey: string };
}

interface AkedlySendData {
  transactionReqID: string;
  expiresAt: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly DEMO_OTP = '0000';

  // Server-side transactionReqID → phone binding.
  // Pilot runs as a single Railway instance; in-memory is sufficient and avoids DB schema changes.
  private readonly pendingVerifications = new Map<string, PendingVerification>();

  constructor(
    @InjectRepository(Consumer)
    private readonly consumerRepo: Repository<Consumer>,
    @InjectRepository(BrandAccount)
    private readonly brandRepo: Repository<BrandAccount>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getChallenge(): Promise<AkedlyChallengeData> {
    // DEMO_MODE bypass: return a trivial challenge so Flutter can proceed without calling Akedly.
    // difficulty=1 is intentional — non-zero so the SDK's PoW loop runs normally (instant on device).
    if (this.isDemoMode()) {
      return {
        challenge: '0'.repeat(64),
        difficulty: 1,
        challengeToken: 'DEMO_MODE',
        challengeRequired: false,
        turnstile: { required: false, siteKey: '' },
      };
    }

    const apiKey = this.configService.getOrThrow<string>('AKEDLY_API_KEY');
    const pipelineId = this.configService.getOrThrow<string>('AKEDLY_PIPELINE_ID');

    const url = `https://api.akedly.io/api/v1.2/transactions/challenge?APIKey=${encodeURIComponent(apiKey)}&pipelineID=${encodeURIComponent(pipelineId)}`;
    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      throw new ServiceUnavailableException('Authentication service temporarily unavailable');
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(`Akedly challenge failed (${res.status}): ${text}`);
      throw new ServiceUnavailableException('Authentication service temporarily unavailable');
    }

    const body = await res.json() as { status: string; data: AkedlyChallengeData };
    if (body.status !== 'success') {
      this.logger.error(`Akedly challenge non-success: ${JSON.stringify(body)}`);
      throw new ServiceUnavailableException('Authentication service temporarily unavailable');
    }

    return body.data;
  }

  async requestOtp(dto: RequestOtpDto): Promise<{ message: string; transactionReqID?: string; expiresAt?: string }> {
    const { phone } = dto;
    const isDemoMode = this.isDemoMode();

    if (isDemoMode) {
      this.logger.log(`OTP requested for ${phone} — DEMO_MODE active`);
      // Return a sentinel transactionReqID so Flutter shows the OTP input screen.
      // verifyOtp() checks isDemoBypass first, so this value is never looked up in pendingVerifications.
      return { message: 'OTP sent successfully', transactionReqID: 'DEMO_MODE' };
    }

    this.purgeExpiredVerifications();

    const apiKey = this.configService.getOrThrow<string>('AKEDLY_API_KEY');
    const pipelineId = this.configService.getOrThrow<string>('AKEDLY_PIPELINE_ID');

    // powSolution is omitted when challengeRequired=false (Akedly Dev Mode / PoW disabled).
    // Akedly enforces PoW when its pipeline requires it; we don't pre-check here.
    const sendBody: Record<string, unknown> = {
      APIKey: apiKey,
      pipelineID: pipelineId,
      verificationAddress: { phoneNumber: phone },
    };
    if (dto.powSolution) {
      sendBody['powSolution'] = {
        challengeToken: dto.powSolution.challengeToken,
        nonce: dto.powSolution.nonce,
      };
    }
    if (dto.turnstileToken) {
      sendBody['turnstileToken'] = dto.turnstileToken;
    }

    let res: Response;
    try {
      res = await fetch('https://api.akedly.io/api/v1.2/transactions/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendBody),
      });
    } catch {
      throw new ServiceUnavailableException('Could not reach authentication service — please try again');
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({})) as { code?: string };
      this.logger.error(`Akedly send failed (${res.status}) for ${phone}: ${errBody.code ?? 'unknown'}`);
      this.mapAkedlySendError(errBody.code, res.status);
    }

    const responseBody = await res.json() as { status: string; data: AkedlySendData };
    const { transactionReqID, expiresAt } = responseBody.data;

    // Bind transactionReqID → phone server-side. Client-supplied phone on verify is ignored for JWT identity.
    this.pendingVerifications.set(transactionReqID, { phone, expiresAt: new Date(expiresAt) });

    this.logger.log(`OTP requested for ${phone} via Akedly V1.2`);
    return { message: 'OTP sent successfully', transactionReqID, expiresAt };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResult> {
    const isDemoMode = this.isDemoMode();
    const isDemoBypass = isDemoMode && dto.code === this.DEMO_OTP;

    let phone: string;

    if (isDemoBypass) {
      // In DEMO_MODE, phone from client is used directly (development only).
      phone = dto.phone;
    } else {
      if (!dto.transactionReqID) {
        throw new BadRequestException('transactionReqID is required');
      }

      const pending = this.pendingVerifications.get(dto.transactionReqID);
      if (!pending) {
        throw new HttpException('OTP expired — please request a new code', HttpStatus.GONE);
      }
      if (pending.expiresAt < new Date()) {
        this.pendingVerifications.delete(dto.transactionReqID);
        throw new HttpException('OTP expired — please request a new code', HttpStatus.GONE);
      }

      let res: Response;
      try {
        res = await fetch('https://api.akedly.io/api/v1.2/transactions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionReqID: dto.transactionReqID, otp: dto.code }),
        });
      } catch {
        throw new ServiceUnavailableException('Could not reach authentication service — please try again');
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { code?: string };
        this.logger.error(`Akedly verify failed (${res.status}): ${errBody.code ?? 'unknown'}`);
        this.mapAkedlyVerifyError(errBody.code, res.status);
      }

      const verifyBody = await res.json() as { data: { verified: boolean } };
      if (!verifyBody.data.verified) {
        throw new UnauthorizedException('OTP verification failed');
      }

      // Use server-side bound phone — client-supplied phone is NOT trusted for JWT identity.
      phone = pending.phone;
      this.pendingVerifications.delete(dto.transactionReqID);
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

  async getMe(consumerId: string): Promise<Consumer & { totalPoints: number; recentCampaigns: object[] }> {
    const consumer = await this.consumerRepo.findOne({
      where: { id: consumerId },
      relations: ['redemptions', 'redemptions.campaign'],
    });

    if (!consumer) {
      throw new NotFoundException('Consumer not found');
    }

    const totalPoints = consumer.redemptions.reduce(
      (sum, r) => sum + (r.campaign?.rewardPoints ?? 0),
      0,
    );

    const recentCampaigns = consumer.redemptions
      .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
      .slice(0, 10)
      .map((r) => ({
        id: r.id,
        redeemedAt: r.redeemedAt,
        campaignId: r.campaignId,
        productName: r.campaign?.productName ?? null,
        brandName: r.campaign?.brandName ?? null,
        rewardPoints: r.campaign?.rewardPoints ?? 0,
        productImage: r.campaign?.productImage ?? null,
      }));

    return { ...consumer, totalPoints, recentCampaigns };
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

  private purgeExpiredVerifications(): void {
    const now = new Date();
    for (const [key, val] of this.pendingVerifications) {
      if (val.expiresAt < now) this.pendingVerifications.delete(key);
    }
  }

  private mapAkedlySendError(code: string | undefined, status: number): never {
    if (status === 429) {
      throw new HttpException('Too many OTP requests — please wait before retrying', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (code === 'POW_INVALID' || code === 'CHALLENGE_EXPIRED') {
      throw new BadRequestException('Challenge expired — please retry');
    }
    throw new ServiceUnavailableException('Could not send OTP — please try again');
  }

  private mapAkedlyVerifyError(code: string | undefined, status: number): never {
    if (status === 410 || code === 'TRANSACTION_EXPIRED') {
      throw new HttpException('OTP expired — please request a new code', HttpStatus.GONE);
    }
    if (code === 'MAX_ATTEMPTS_EXCEEDED') {
      throw new UnauthorizedException('Too many attempts — please request a new OTP');
    }
    if (status === 429) {
      throw new HttpException('Too many requests — please wait', HttpStatus.TOO_MANY_REQUESTS);
    }
    throw new UnauthorizedException('Invalid OTP code');
  }
}
