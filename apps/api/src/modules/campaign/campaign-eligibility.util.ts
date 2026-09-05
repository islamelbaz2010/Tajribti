// Benchmark Alignment — Audience/Eligibility (2026-09-06, DL-101)
//
// Pure eligibility check: determines whether a given consumer matches a
// campaign's configured audience restrictions.
//
// Design principles:
//
//   1. SERVER-SIDE AUTHORITY: this function is the single server-side
//      source of truth. Client-side eligibility state (consumer app UI)
//      is presentational only. Every actual participation entry point
//      (QrService.enterCampaignWeb, QrService.redeemQr,
//      AuthService.verifyOtp) calls this before accepting participation.
//
//   2. UNKNOWN PROFILE IS OPEN: if a consumer's profile field is null
//      (they haven't completed that part of their profile), they are NOT
//      blocked by a restriction on that field. Eligibility enforcement
//      tightens naturally as profile completion rates improve.
//
//   3. NARROW SCOPE: only dimensions explicitly supported by the
//      repository evidence (gender, ageRange) and the consumer data model
//      are checked. No invented dimensions.
//
//   4. REASON VISIBILITY: the returned reason is consumer-safe (no
//      internal detail) and survives bi-lingual display in the consumer
//      app where `eligibleReason` is the EN text. AR translation is in
//      l10n.dart.
//
// Returns null if eligible, or a plain English reason string if not.
// Callers throw BadRequestException with this reason.

import { Campaign } from '../../entities/campaign.entity';
import { Consumer } from '../../entities/consumer.entity';

export interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

export function checkCampaignEligibility(
  campaign: Campaign,
  consumer: Consumer,
): EligibilityResult {
  // Gender restriction: only enforced when campaign specifies a gender
  // AND consumer has a known gender in their profile.
  if (
    campaign.audienceGender &&
    consumer.gender &&
    campaign.audienceGender.toLowerCase() !== consumer.gender.toLowerCase()
  ) {
    return {
      eligible: false,
      reason: 'This campaign is not available for your profile',
    };
  }

  // Age range restriction: only enforced when campaign specifies a
  // non-empty list AND consumer has a known ageRange in their profile.
  if (
    campaign.audienceAgeRanges &&
    campaign.audienceAgeRanges.length > 0 &&
    consumer.ageRange &&
    !campaign.audienceAgeRanges.includes(consumer.ageRange)
  ) {
    return {
      eligible: false,
      reason: 'This campaign is not available for your age group',
    };
  }

  return { eligible: true };
}
