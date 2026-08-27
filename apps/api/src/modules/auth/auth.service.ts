import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
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
import * as crypto from 'crypto';
import { Consumer } from '../../entities/consumer.entity';
import { BrandAccount } from '../../entities/brand-account.entity';
import { Campaign, CampaignStatus } from '../../entities/campaign.entity';
import { CampaignVerification } from '../../entities/campaign-verification.entity';
import { EmailVerificationToken } from '../../entities/email-verification-token.entity';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { BrandLoginDto } from './dto/brand-login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Returned by signup()/login() — Account authentication only. Distinct
// from Campaign verification (see verifyOtp() below), which never issues
// tokens because the caller already has a valid account session.
export interface AccountAuthResult extends TokenPair {
  consumerId: string;
  emailVerified: boolean;
}

interface PendingVerification {
  phone: string;
  campaignId: string;
  consumerId: string;
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

const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly DEMO_OTP = '0000';

  // Server-side transactionReqID → (phone, campaign, consumer) binding.
  // Pilot runs as a single Railway instance; in-memory is sufficient and avoids DB schema changes.
  private readonly pendingVerifications = new Map<string, PendingVerification>();

  constructor(
    @InjectRepository(Consumer)
    private readonly consumerRepo: Repository<Consumer>,
    @InjectRepository(BrandAccount)
    private readonly brandRepo: Repository<BrandAccount>,
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(CampaignVerification)
    private readonly campaignVerificationRepo: Repository<CampaignVerification>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationRepo: Repository<EmailVerificationToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ── Account authentication (email + password) ─────────────────────────────
  // Independent of Campaigns entirely. This is the Consumer's normal
  // account identity — distinct from the phone-bound Campaign verification
  // further down this file.

  async signup(dto: SignupDto): Promise<AccountAuthResult> {
    const email = dto.email.trim().toLowerCase();

    const existingEmail = await this.consumerRepo.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('An account with this email already exists');
    }
    const existingPhone = await this.consumerRepo.findOne({ where: { phone: dto.phone } });
    if (existingPhone) {
      throw new ConflictException('An account with this phone number already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const consumer = await this.consumerRepo.save(
      this.consumerRepo.create({
        email,
        passwordHash,
        emailVerified: false,
        phone: dto.phone,
        name: dto.name,
        ageRange: dto.ageRange,
        gender: dto.gender,
        city: dto.city,
      }),
    );

    await this.issueEmailVerificationToken(consumer.id, email);

    const tokens = this.generateTokens(consumer.id, email, 'consumer');
    return { ...tokens, consumerId: consumer.id, emailVerified: false };
  }

  async login(dto: LoginDto): Promise<AccountAuthResult> {
    const email = dto.email.trim().toLowerCase();
    const consumer = await this.consumerRepo.findOne({ where: { email } });

    // Same generic message whether the email is unknown or the password is
    // wrong — never reveal which one, so account existence can't be probed.
    if (!consumer || !consumer.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(dto.password, consumer.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = this.generateTokens(consumer.id, email, 'consumer');
    return { ...tokens, consumerId: consumer.id, emailVerified: consumer.emailVerified };
  }

  // Generates and stores a single-use, expiring verification token, and logs
  // the link that would be emailed. EXTERNAL DEPENDENCY: no transactional
  // email provider (SendGrid/Resend/SES/etc.) is configured in this
  // repository — nothing is actually delivered to the user's inbox yet.
  // This is the real, server-verified primitive (token generation, expiry,
  // single-use, verified-state storage); wiring an actual provider to call
  // it is the pending integration.
  private async issueEmailVerificationToken(consumerId: string, email: string): Promise<void> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS);
    await this.emailVerificationRepo.save(
      this.emailVerificationRepo.create({ consumerId, token, expiresAt }),
    );
    const verifyPath = `/auth/verify-email?token=${token}`;
    this.logger.log(
      `[email-verification] No email provider configured — would send to ${email}: verify link ${verifyPath} (expires ${expiresAt.toISOString()})`,
    );
  }

  async verifyEmailToken(dto: VerifyEmailDto): Promise<{ verified: boolean }> {
    const record = await this.emailVerificationRepo.findOne({ where: { token: dto.token } });
    if (!record) {
      throw new BadRequestException('Invalid verification link');
    }
    if (record.usedAt) {
      throw new BadRequestException('This verification link has already been used');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('This verification link has expired');
    }

    const consumer = await this.consumerRepo.findOne({ where: { id: record.consumerId } });
    if (!consumer) {
      throw new NotFoundException('Consumer not found');
    }

    consumer.emailVerified = true;
    await this.consumerRepo.save(consumer);
    record.usedAt = new Date();
    await this.emailVerificationRepo.save(record);

    return { verified: true };
  }

  // ── Campaign participation verification (phone + OTP) ──────────────────────
  // NOT account login. Requires an already-authenticated consumerId (the
  // caller must already hold a valid account JWT — see AuthController,
  // these are no longer @Public()). Every request/verify is bound to one
  // specific Campaign; success records a CampaignVerification row, not a
  // new session.

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

  async requestOtp(
    dto: RequestOtpDto,
    consumerId: string,
  ): Promise<{ message: string; transactionReqID?: string; expiresAt?: string }> {
    const { phone, campaignId } = dto;
    await this.assertCampaignActive(campaignId);

    const isDemoMode = this.isDemoMode();

    if (isDemoMode) {
      this.logger.log(`Campaign OTP requested for ${phone} / campaign ${campaignId} — DEMO_MODE active`);
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

    // Bind transactionReqID → (phone, campaign, consumer) server-side.
    // Client-supplied phone/campaignId on verify are checked against this,
    // never trusted alone.
    this.pendingVerifications.set(transactionReqID, {
      phone,
      campaignId,
      consumerId,
      expiresAt: new Date(expiresAt),
    });

    this.logger.log(`Campaign OTP requested for ${phone} / campaign ${campaignId} via Akedly V1.2`);
    return { message: 'OTP sent successfully', transactionReqID, expiresAt };
  }

  async verifyOtp(
    dto: VerifyOtpDto,
    consumerId: string,
  ): Promise<{ verified: boolean; campaignId: string }> {
    await this.assertCampaignActive(dto.campaignId);

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
      // A transactionReqID is only ever valid for the exact campaign/consumer
      // it was requested under — prevents replaying one campaign's OTP
      // transaction against a different campaign or a different account.
      if (pending.campaignId !== dto.campaignId || pending.consumerId !== consumerId) {
        throw new UnauthorizedException('OTP does not match this campaign verification attempt');
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

      // Use server-side bound phone — client-supplied phone is NOT trusted.
      phone = pending.phone;
      this.pendingVerifications.delete(dto.transactionReqID);
    }

    // Idempotent: verifying twice for the same (consumer, campaign) just
    // confirms the existing verification rather than erroring — the unique
    // constraint on (consumerId, campaignId) is the source of truth.
    const existing = await this.campaignVerificationRepo.findOne({
      where: { consumerId, campaignId: dto.campaignId },
    });
    if (!existing) {
      await this.campaignVerificationRepo.save(
        this.campaignVerificationRepo.create({ consumerId, campaignId: dto.campaignId, phone }),
      );
    }

    return { verified: true, campaignId: dto.campaignId };
  }

  private async assertCampaignActive(campaignId: string): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not active');
    }
    return campaign;
  }

  // ── Legacy phone-profile-completion endpoint — kept for backward
  // compatibility with any existing callers; no longer used by the
  // Consumer app's own signup flow (see SignupDto, which collects the same
  // fields directly at account creation).
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

  async getMe(consumerId: string): Promise<Omit<Consumer, 'passwordHash'> & { totalPoints: number; recentCampaigns: object[] }> {
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

    // passwordHash must never leave this service — build the response
    // explicitly rather than spreading the raw entity.
    const { passwordHash: _passwordHash, ...safeConsumer } = consumer;
    return { ...safeConsumer, totalPoints, recentCampaigns };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
      payload = this.jwtService.verify<JwtPayload>(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.type !== 'consumer') throw new UnauthorizedException('Token type not eligible for refresh');
    const consumer = await this.consumerRepo.findOne({ where: { id: payload.sub } });
    if (!consumer) throw new UnauthorizedException('Consumer not found');
    return this.generateTokens(payload.sub, payload.identifier, 'consumer');
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
