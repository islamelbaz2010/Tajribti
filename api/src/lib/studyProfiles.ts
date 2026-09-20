// FOUNDER INNOVATION (D-3, 2026-09-20): per-study-type methodology block.
// Each of the 8 approved study types gets a distinct, evidence-grounded
// profile in the report — objective, methodology, which existing evidence
// fields are primary, explicit limitations, and what is NOT claimed.
// Every value here is static methodology text from the approved spec
// (docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md §D); no numbers or
// findings are invented — figures still come only from the computed
// evidence blocks. Types not in this map return null (no fake profile).

export interface StudyProfile {
  key: string;
  objective: string;
  methodology: string;
  // names of report evidence fields this study type treats as primary
  primaryEvidence: string[];
  limitations: string[];
  notClaimed: string[];
}

export const STUDY_PROFILES: Record<string, StudyProfile> = {
  CONCEPT_TESTING: {
    key: "CONCEPT_TESTING",
    objective: "Is the product/concept appealing and differentiated enough to proceed?",
    methodology:
      "Post-exposure/post-trial evaluation: appeal, differentiation rating and purchase intent are measured after the consumer has experienced the product; open-text captures improvement direction.",
    primaryEvidence: ["purchaseIntent", "satisfaction", "campaignSpecificQuestions", "consumerVoice"],
    limitations: [
      "Evaluation is post-exposure only — this is not a pre-development concept board; no stimulus stage exists in the current model.",
      "Media assets may serve as a stimulus reference but are not a controlled stimulus instrument.",
    ],
    notClaimed: ["No go/no-go verdict", "No forecast of launch success", "No comparison against competitor concepts"],
  },
  PRICING_PERCEPTION: {
    key: "PRICING_PERCEPTION",
    objective: "Is the perceived price acceptable for the value delivered?",
    methodology:
      "Trial plus price-context feedback: price-acceptability and value-for-money choices are measured and read alongside the product's declared priceRange.",
    primaryEvidence: ["campaignSpecificQuestions", "purchaseIntent", "consumerVoice"],
    limitations: [
      "Measures perceived acceptability and value only — this is not a price-ladder method.",
      "A numeric price-sensitivity instrument (e.g. Van Westendorp) does not exist in the current question model and is not simulated.",
    ],
    notClaimed: ["No optimal price point", "No demand curve", "No willingness-to-pay distribution"],
  },
  PACKAGING_EVALUATION: {
    key: "PACKAGING_EVALUATION",
    objective: "Does the pack attract, communicate, and function?",
    methodology:
      "Trial with pack in hand: appeal, benefit-clarity and usability choices plus an open-text standout-message question.",
    primaryEvidence: ["campaignSpecificQuestions", "satisfaction", "consumerVoice"],
    limitations: [
      "Evaluates the pack in the consumer's hands — this is not a shelf test; no competitive shelf simulation exists.",
    ],
    notClaimed: ["No shelf-standout metric", "No pack-vs-competitor comparison"],
  },
  CLAIMS_TESTING: {
    key: "CLAIMS_TESTING",
    objective: "Is the main claim understood and believed?",
    methodology:
      "Trial with claim exposure: claim clarity and believability are measured; the product's declared claims field supplies the claim under test.",
    primaryEvidence: ["campaignSpecificQuestions", "consumerVoice"],
    limitations: [
      "Measures consumer perception of the claim only — this is not substantiation research and produces no claim-truth judgment.",
    ],
    notClaimed: ["No substantiation verdict", "No regulatory-compliance assessment"],
  },
  ADVERTISING_MESSAGE_TESTING: {
    key: "ADVERTISING_MESSAGE_TESTING",
    objective: "Does the intended message land?",
    methodology:
      "Message exposure plus recall: recall, clarity and relevance choices measure whether the intended message registered; creative media may act as the reference.",
    primaryEvidence: ["campaignSpecificQuestions", "consumerVoice"],
    limitations: [
      "Measures message reception among participants — this is not ad-effectiveness measurement; no exposure, reach or frequency metrics exist.",
    ],
    notClaimed: ["No reach/frequency data", "No media-mix conclusion"],
  },
  BRAND_PERCEPTION: {
    key: "BRAND_PERCEPTION",
    objective: "How is the brand perceived by trialing consumers?",
    methodology:
      "Trial plus brand association: attribute-association multi-choice and open text capture perception at a single point in time.",
    primaryEvidence: ["campaignSpecificQuestions", "consumerVoice", "demographics"],
    limitations: [
      "Single point-in-time snapshot — this is not a brand tracker; no longitudinal comparison is made or implied.",
    ],
    notClaimed: ["No brand-equity index", "No trend over time"],
  },
  UA_EXPANSION: {
    key: "UA_EXPANSION",
    objective: "Deeper usage & attitude picture of category consumers.",
    methodology:
      "Screener-heavy design: usage-frequency and repertoire questions at eligibility plus post-trial drivers/barriers open text — all within the campaign frame.",
    primaryEvidence: ["campaignSpecificQuestions", "demographics", "consumerVoice", "audienceDifferences"],
    limitations: [
      "Campaign-bound sample of participants — this is not a standalone U&A panel study and does not represent the general market.",
    ],
    notClaimed: ["No market sizing", "No population projection"],
  },
  SEGMENTATION_STUDY: {
    key: "SEGMENTATION_STUDY",
    objective: "Do meaningful audience groups respond differently?",
    methodology:
      "Descriptive segmentation only: eligibility screeners feed segment dimensions (gender/city/age-band); evidence is conditioned per segment with n shown; cells below the suppression floor are hidden.",
    primaryEvidence: ["audienceDifferences", "demographics", "campaignSpecificQuestions"],
    limitations: [
      "Descriptive comparison only — no clustering, no inference, no significance testing between segments is performed.",
    ],
    notClaimed: ["No market-segmentation model", "No statistical significance between segments"],
  },
};

export function getStudyProfile(studyType: string | null | undefined): StudyProfile | null {
  return studyType ? STUDY_PROFILES[studyType] ?? null : null;
}
