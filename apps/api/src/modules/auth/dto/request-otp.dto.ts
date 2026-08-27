import { IsString, Matches, IsOptional, IsNumber, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class PowSolutionDto {
  @IsString()
  challengeToken: string;

  @IsNumber()
  nonce: number;
}

export class RequestOtpDto {
  // This OTP is Campaign participation verification, not account login -
  // every request is bound to exactly one Campaign (see
  // AuthController.requestOtp, now authenticated + campaign-scoped).
  @IsUUID()
  campaignId: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message: 'phone must be a valid international phone number',
  })
  phone: string;

  // Required in production (DEMO_MODE=false). Optional at DTO level; enforced by service.
  @IsOptional()
  @ValidateNested()
  @Type(() => PowSolutionDto)
  powSolution?: PowSolutionDto;

  @IsOptional()
  @IsString()
  turnstileToken?: string;
}
