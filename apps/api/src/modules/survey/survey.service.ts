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

// B-04-pattern race fix (2026-09-02): same check-then-act race qr.service.ts
// was found to have (DL-083) — the existingResponse check below and the
// save() are two separate round trips, so two near-simultaneous submissions
// for the same redemption (a double-tapped Submit button, or a client retry
// after an apparent timeout) can both pass the pre-check before either
// insert commits. Reproduced live: 10 concurrent identical POST
// /survey/submit calls for one real redemption produced 1x 201, 2x raw
// "500 Internal server error" (the unhandled Postgres unique-violation on
// survey_responses' own redemption_id UNIQUE constraint), 7x correctly
// caught 409s. The DB-level constraint (already in place, migration-free)
// is the actual guarantee; this catch converts the violation into the same
// 409 the normal-timing caller already gets, instead of leaking a raw 500.
const POSTGRES_UNIQUE_VIOLATION = '23505';
function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; driverError?: { code?: string } };
  return e?.code === POSTGRES_UNIQUE_VIOLATION || e?.driverError?.code === POSTGRES_UNIQUE_VIOLATION;
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

    let response: SurveyResponse;
    try {
      response = await this.surveyRepo.save(
        this.surveyRepo.create({
          redemptionId: dto.redemptionId,
          consumerId: dto.consumerId,
          campaignId: redemption.campaignId,
          answers: dto.answers,
        }),
      );
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Survey already submitted for this redemption');
      }
      throw err;
    }

    await this.aiReportRepo.update(
      { campaignId: redemption.campaignId },
      { invalidatedAt: new Date() },
    );

    return response;
  }
}
