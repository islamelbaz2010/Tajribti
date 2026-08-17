import { IsString, Matches, Length, IsOptional } from 'class-validator';

export class VerifyOtpDto {
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
