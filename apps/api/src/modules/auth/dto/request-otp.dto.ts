import { IsString, Matches, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PowSolutionDto {
  @IsString()
  challengeToken: string;

  @IsNumber()
  nonce: number;
}

export class RequestOtpDto {
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
