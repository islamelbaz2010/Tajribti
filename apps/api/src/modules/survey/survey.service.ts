import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyResponse, SurveyAnswers } from '../../entities/survey-response.entity';
import { RedemptionEvent } from '../../entities/redemption-event.entity';
import { AiReport } from '../../entities/ai-report.entity';

interface SubmitSurveyDto {
  redemptionId: string;
  consumerId: string;
  answers: SurveyAnswers;
}

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(SurveyResponse)
    private readonly surveyRepo: Repository<SurveyResponse>,
    @InjectRepository(RedemptionEvent)
    private readonly redemptionRepo: Repository<RedemptionEvent>,
    @InjectRepository(AiReport)
    private readonly aiReportRepo: Repository<AiReport>,
  ) {}

  async submit(dto: SubmitSurveyDto): Promise<SurveyResponse> {
    const redemption = await this.redemptionRepo.findOne({
      where: { id: dto.redemptionId, consumerId: dto.consumerId },
    });

    if (!redemption) {
      throw new NotFoundException('Redemption event not found');
    }

    const existingResponse = await this.surveyRepo.findOne({
      where: { redemptionId: dto.redemptionId },
    });

    if (existingResponse) {
      throw new ConflictException('Survey already submitted for this redemption');
    }

    const response = await this.surveyRepo.save(
      this.surveyRepo.create({
        redemptionId: dto.redemptionId,
        consumerId: dto.consumerId,
        campaignId: redemption.campaignId,
        answers: dto.answers,
      }),
    );

    await this.aiReportRepo.update(
      { campaignId: redemption.campaignId },
      { invalidatedAt: new Date() },
    );

    return response;
  }
}
