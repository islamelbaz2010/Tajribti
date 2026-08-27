import { IsString, Matches, Length, IsOptional, IsUUID } from 'class-validator';

export class VerifyOtpDto {
  // Must match the campaignId the OTP was requested for (see
  // AuthService.verifyOtp - the pending transaction's own bound
  // campaignId is checked against this, not just trusted from the client).
  @IsUUID()
  campaignId: string;

  // Required in DEMO_MODE (used for Consumer lookup); sent by client always for backward compat.
  // In production: server-side binding determines the authoritative phone; this field is ignored for JWT identity.
  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: 'phone must be a valid international phone number',
  })
  phone: string;

  @IsString()
  @Length(4, 6)
  code: string;

  // Required in production (DEMO_MODE=false). Optional at DTO level; enforced by service.
  @IsOptional()
  @IsString()
  transactionReqID?: string;
}
