import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { IsUUID, IsObject, IsOptional, IsString } from 'class-validator';
import { SurveyService } from './survey.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { SurveyAnswers } from '../../entities/survey-response.entity';

class SubmitSurveyDto {
  @IsUUID()
  redemptionId: string;

  @IsObject()
  answers: SurveyAnswers;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('survey')
@UseGuards(JwtAuthGuard)
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  submit(@Request() req: RequestWithUser, @Body() dto: SubmitSurveyDto) {
    return this.surveyService.submit({
      redemptionId: dto.redemptionId,
      consumerId: req.user.id,
      answers: dto.answers,
    });
  }
}
