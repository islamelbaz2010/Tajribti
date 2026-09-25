// FOUNDER INNOVATION (D-3, 2026-09-20): per-study-type methodology block.
// Each executable study type gets a distinct, evidence-grounded
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
  // Report Product #08 (authorized 2026-09-26): profiles below mirror the
  // six original executable templates in studyTemplates.ts. They add
  // methodology context only; they do not add metrics, scoring, weighting,
  // or claims that the persisted questions do not already measure.
  POST_TRIAL_FOOD_BEVERAGE: {
    key: "POST_TRIAL_FOOD_BEVERAGE",
    objective: "Does this food or beverage product deliver after trial?",
    methodology:
      "Post-trial product-experience evaluation: taste/quality rating, purchase intent, repeat-purchase choice and open-text likes/dislikes are measured after real product use.",
    primaryEvidence: ["purchaseIntent", "satisfaction", "campaignSpecificQuestions", "consumerVoice"],
    limitations: [
      "Measures this campaign's trial sample only — it is not a category or population benchmark.",
      "Perceived taste/quality is self-reported after trial; no sensory laboratory measurement is implied.",
    ],
    notClaimed: ["No repeat-purchase forecast", "No preference ranking versus competitors", "No nutritional or safety assessment"],
  },
  POST_TRIAL_BEAUTY_PERSONAL_CARE: {
    key: "POST_TRIAL_BEAUTY_PERSONAL_CARE",
    objective: "Does this beauty or personal-care product deliver after trial?",
    methodology:
      "Post-trial product-experience evaluation: texture/feel/scent rating, purchase intent, expectation performance, repeat-purchase choice and open-text likes/dislikes are measured after real product use.",
    primaryEvidence: ["purchaseIntent", "satisfaction", "campaignSpecificQuestions", "consumerVoice"],
    limitations: [
      "Measures this campaign's trial sample only — it is not a category or population benchmark.",
      "Product performance is self-reported consumer perception; no clinical, dermatological, or efficacy testing is implied.",
    ],
    notClaimed: ["No efficacy claim substantiation", "No repeat-purchase forecast", "No preference ranking versus competitors"],
  },
  POST_TRIAL_HOME_CARE: {
    key: "POST_TRIAL_HOME_CARE",
    objective: "Does this home-care or household product deliver after trial?",
    methodology:
      "Post-trial product-experience evaluation: effectiveness rating, purchase intent, ease-of-use choice, repeat-purchase choice and open-text likes/dislikes are measured after real household use.",
    primaryEvidence: ["purchaseIntent", "satisfaction", "campaignSpecificQuestions", "consumerVoice"],
    limitations: [
      "Measures this campaign's trial sample only — it is not a category or population benchmark.",
      "Perceived effectiveness and ease of use are self-reported; no laboratory performance or safety testing is implied.",
    ],
    notClaimed: ["No product-performance certification", "No repeat-purchase forecast", "No preference ranking versus competitors"],
  },
  CONCEPT_LAUNCH_VIABILITY: {
    key: "CONCEPT_LAUNCH_VIABILITY",
    objective: "How appealing and differentiated is this product after trial, and what purchase intent does it generate?",
    methodology:
      "Post-trial differentiation and appeal evaluation: category purchase context, appeal, perceived difference, purchase intent and improvement direction are measured after real product trial.",
    primaryEvidence: ["purchaseIntent", "satisfaction", "campaignSpecificQuestions", "consumerVoice"],
    limitations: [
      "Evaluates an existing trialed product — this is not pre-development concept validation and has no stimulus-only stage.",
      "Perceived difference is relative to what respondents say they can already buy; no competitor audit is performed.",
    ],
    notClaimed: ["No launch-success verdict", "No pre-development concept test", "No forecast of sales or market share"],
  },
  PACKAGING_CLAIMS_REACTION: {
    key: "PACKAGING_CLAIMS_REACTION",
    objective: "Does the packaging or claim communicate the intended proposition?",
    methodology:
      "Trial with packaging/claim exposure: benefit clarity, claim believability, purchase intent and standout-message verbatims are measured after the consumer sees and tries the product.",
    primaryEvidence: ["campaignSpecificQuestions", "satisfaction", "purchaseIntent", "consumerVoice"],
    limitations: [
      "Measures consumer perception of packaging/claim communication only — no claim substantiation or regulatory assessment is performed.",
      "Packaging is evaluated in-use; this is not a shelf simulation or competitive standout test.",
    ],
    notClaimed: ["No claim-truth verdict", "No shelf standout metric", "No regulatory-compliance conclusion"],
  },
  USAGE_ATTITUDE: {
    key: "USAGE_ATTITUDE",
    objective: "How does the category currently behave, and what drives choice within it?",
    methodology:
      "Category usage-and-attitude snapshot: usage frequency is captured at eligibility and drivers/frustrations are captured as post-trial open text within the campaign frame.",
    primaryEvidence: ["campaignSpecificQuestions", "demographics", "consumerVoice"],
    limitations: [
      "Campaign-bound participant sample — this is not a standalone market U&A study and does not represent the general population.",
      "Drivers and frustrations are surfaced as verbatim evidence only; no theme extraction, weighting, or market sizing is applied.",
    ],
    notClaimed: ["No market sizing", "No population projection", "No attitudinal segmentation model"],
  },
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
