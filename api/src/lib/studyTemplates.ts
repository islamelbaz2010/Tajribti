// FOUNDER-APPROVED STRATEGIC DIFFERENTIATION — NOT Benchmark-required.
// See governance/FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md.
//
// A small, static "Decision -> Study Type -> Recommended Questions" catalog.
// This is a pure authoring aid layered above the unchanged Benchmark core
// engine: every recommended question uses only the five question types and
// two stages the Question model (schema.prisma) already defines. No new
// question type, scale, scoring, or methodology is introduced. Applying a
// template only creates ordinary Question rows through the same validated
// path POST /company/campaigns/:id/questions already uses — a company can
// edit or delete any of them afterward exactly like a manually-added
// question. Nothing is forced.
//
// CORRECTNESS CONSTRAINT (not a style choice): measurement.ts's
// getSatisfaction() and getPurchaseIntent() aggregate ALL answers of type
// RATING_1_5 / PURCHASE_INTENT_1_5 across an entire campaign into one
// combined average, with no per-question breakdown (this is existing,
// unmodified Benchmark-conformant behavior — see measurement.ts). If a
// campaign ever had two different RATING_1_5 questions (e.g. "taste" and
// "aroma"), that shared average would silently blend two unrelated
// measurements into one number that means nothing — a fabricated-looking
// metric the Benchmark's own evidence/interpretation-separation rule (§6)
// would not tolerate. Every template below therefore contains AT MOST ONE
// RATING_1_5 question and AT MOST ONE PURCHASE_INTENT_1_5 question. The
// apply-template route (company.ts) additionally refuses to create a
// second question of either type if the campaign already has one — from
// this catalog or authored manually — so this constraint holds even when
// a company mixes templates with their own manual questions.

export type TemplateQuestion = {
  stage: "ELIGIBILITY" | "POST_TRIAL";
  type: "SINGLE_CHOICE" | "MULTI_CHOICE" | "TEXT" | "RATING_1_5" | "PURCHASE_INTENT_1_5";
  text: string;
  options?: { id: string; label: string }[];
  required?: boolean;
};

export type StudyTemplate = {
  key: string;
  label: string;
  // The business decision this study type answers (research-derived
  // framing, not a Benchmark-defined taxonomy — see the founder decision
  // record for sourcing).
  decision: string;
  questions: TemplateQuestion[];
};

const yesNo = (labels: [string, string] = ["Yes", "No"]): { id: string; label: string }[] => [
  { id: "opt0", label: labels[0] },
  { id: "opt1", label: labels[1] },
];

export const STUDY_TEMPLATES: StudyTemplate[] = [
  {
    key: "POST_TRIAL_FOOD_BEVERAGE",
    label: "Post-Trial Experience — Food & Beverage",
    decision: "Does this product deliver after trial?",
    questions: [
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How would you rate the overall taste and quality of the product?" },
      { stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "How likely are you to purchase this product if available at your usual store?" },
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Would you buy this again?", options: [{ id: "opt0", label: "Yes" }, { id: "opt1", label: "No" }, { id: "opt2", label: "Not sure" }] },
      { stage: "POST_TRIAL", type: "TEXT", text: "What did you like or dislike about the product?" },
    ],
  },
  {
    key: "POST_TRIAL_BEAUTY_PERSONAL_CARE",
    label: "Post-Trial Experience — Beauty & Personal Care",
    decision: "Does this product deliver after trial?",
    questions: [
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How would you rate the product's texture, feel and scent overall?" },
      { stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "How likely are you to purchase this product if available at your usual store?" },
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Did the product perform as you expected?", options: [{ id: "opt0", label: "Yes" }, { id: "opt1", label: "No" }, { id: "opt2", label: "Somewhat" }] },
      // Repurchase intent, added for parity with Food & Beverage —
      // research consistently treats "would you buy this again" as a
      // distinct evidence point from a single point-in-time purchase-
      // intent score (see founder-decision record §5 for sourcing).
      // SINGLE_CHOICE, not a second PURCHASE_INTENT_1_5 — the campaign
      // already has one; adding a second would corrupt its aggregate.
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Would you buy this again?", options: [{ id: "opt0", label: "Yes" }, { id: "opt1", label: "No" }, { id: "opt2", label: "Not sure" }] },
      { stage: "POST_TRIAL", type: "TEXT", text: "What did you like or dislike about the product?" },
    ],
  },
  {
    key: "POST_TRIAL_HOME_CARE",
    label: "Post-Trial Experience — Home Care / Household",
    decision: "Does this product deliver after trial?",
    questions: [
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How would you rate the product's effectiveness?" },
      { stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "How likely are you to purchase this product if available at your usual store?" },
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "How easy was the product to use?", options: [{ id: "opt0", label: "Very easy" }, { id: "opt1", label: "Easy" }, { id: "opt2", label: "Neutral" }, { id: "opt3", label: "Difficult" }, { id: "opt4", label: "Very difficult" }] },
      // Repurchase intent — same rationale as the Beauty template above.
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Would you buy this again?", options: [{ id: "opt0", label: "Yes" }, { id: "opt1", label: "No" }, { id: "opt2", label: "Not sure" }] },
      { stage: "POST_TRIAL", type: "TEXT", text: "What did you like or dislike about the product?" },
    ],
  },
  {
    // G2-A (forensic closure pass): reframed — the persisted key stays
    // CONCEPT_LAUNCH_VIABILITY for full backward compatibility with every
    // existing Campaign.studyType / StudyTypeChangeRequest value; only
    // the display-facing label/decision changed. The prior label/decision
    // implied pre-development concept validation, but the actual
    // mechanism below (real physical trial -> appeal/differentiation/
    // purchase-intent survey) has no pre-trial stimulus stage and cannot
    // establish whether an unproduced concept would succeed before
    // manufacturing — see governance closure report for the full audit.
    key: "CONCEPT_LAUNCH_VIABILITY",
    label: "Post-Trial — Differentiation & Appeal",
    decision: "How appealing and differentiated is this product after trial, and what purchase intent does it generate?",
    questions: [
      { stage: "ELIGIBILITY", type: "SINGLE_CHOICE", text: "Do you regularly purchase products in this category?", options: yesNo() },
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Is this product appealing to you?", options: [{ id: "opt0", label: "Very appealing" }, { id: "opt1", label: "Somewhat appealing" }, { id: "opt2", label: "Not appealing" }] },
      // Uniqueness/differentiation — concept-testing research treats this
      // as core evidence alongside appeal and purchase intent (a concept
      // can be liked yet redundant with what a consumer already buys).
      // This template previously had no RATING_1_5 question at all, so
      // adding one here creates no aggregation conflict.
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How different is this product from what you can already buy?" },
      { stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "How likely are you to purchase this product if available at your usual store?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "What would make this product more appealing to you?" },
    ],
  },
  {
    key: "PACKAGING_CLAIMS_REACTION",
    label: "Packaging & Claims Reaction",
    decision: "Does the packaging/claim communicate the intended proposition?",
    questions: [
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Was the product's main benefit clear from the packaging?", options: [{ id: "opt0", label: "Yes" }, { id: "opt1", label: "No" }, { id: "opt2", label: "Not sure" }] },
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How believable is the product's main claim?" },
      // Purchase intent — packaging/claims research (Ipsos, Zappi;
      // see founder-decision record) consistently ties pack/claim
      // reaction to purchase intent as the outcome metric, not just
      // comprehension/believability in isolation. This template
      // previously had no PURCHASE_INTENT_1_5 question, so adding one
      // here creates no aggregation conflict.
      { stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "How likely are you to purchase this product if available at your usual store?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "What message or benefit stood out most on the packaging?" },
    ],
  },
  {
    key: "USAGE_ATTITUDE",
    label: "Usage & Attitude (Category Understanding)",
    decision: "How does the category currently behave, and what drives choice within it?",
    questions: [
      { stage: "ELIGIBILITY", type: "SINGLE_CHOICE", text: "How often do you use products in this category?", options: [{ id: "opt0", label: "Daily" }, { id: "opt1", label: "Weekly" }, { id: "opt2", label: "Monthly" }, { id: "opt3", label: "Rarely" }, { id: "opt4", label: "Never" }] },
      { stage: "POST_TRIAL", type: "TEXT", text: "What usually drives your choice of product in this category?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "What frustrates you most about products in this category?" },
    ],
  },
  // =========================================================================
  // FOUNDER INNOVATION (OFD-04) — eight additional study types, 2026-09-20.
  // Methodology per type: docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md
  // §A–D. Same engine, same constraint: at most one RATING_1_5 and one
  // PURCHASE_INTENT_1_5 per template. These measure consumer PERCEPTION after
  // real exposure/trial — they do not turn the platform into generic survey
  // research and they do not perform the named formal methodologies that
  // require instruments we do not have (e.g. a true Van Westendorp price
  // ladder needs numeric price questions — documented boundary, not built).
  // =========================================================================
  {
    key: "CONCEPT_TESTING",
    label: "Concept Testing — Appeal & Differentiation",
    decision: "Is this product or approved concept appealing and differentiated enough to proceed?",
    questions: [
      { stage: "ELIGIBILITY", type: "SINGLE_CHOICE", text: "Do you regularly purchase products in this category?", options: yesNo() },
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "How appealing is this product or concept to you?", options: [{ id: "opt0", label: "Very appealing" }, { id: "opt1", label: "Somewhat appealing" }, { id: "opt2", label: "Neutral" }, { id: "opt3", label: "Not appealing" }] },
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How different is this from what you can already buy?" },
      { stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "How likely are you to choose this if it were available?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "What would make this more appealing to you?" },
    ],
  },
  {
    key: "PRICING_PERCEPTION",
    label: "Pricing — Value Perception",
    decision: "Is the perceived price acceptable for the value delivered? (Uses Product.priceRange as context; NOT a Van Westendorp ladder.)",
    questions: [
      { stage: "ELIGIBILITY", type: "SINGLE_CHOICE", text: "Do you regularly purchase products in this category?", options: yesNo() },
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "How would you describe the price of this product?", options: [{ id: "opt0", label: "Too cheap — I'd question the quality" }, { id: "opt1", label: "Fair for what it offers" }, { id: "opt2", label: "A bit expensive" }, { id: "opt3", label: "Too expensive" }] },
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How good is the value for money of this product?" },
      { stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "How likely are you to purchase this product at its current price?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "What price would feel right for this product, and why?" },
    ],
  },
  {
    key: "PACKAGING_EVALUATION",
    label: "Packaging — Appeal & Clarity",
    decision: "Does the pack attract, communicate, and function? (Consumer reaction to the actual pack — NOT a shelf test.)",
    questions: [
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "How attractive is the packaging?", options: [{ id: "opt0", label: "Very attractive" }, { id: "opt1", label: "Somewhat attractive" }, { id: "opt2", label: "Neutral" }, { id: "opt3", label: "Not attractive" }] },
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Was it clear from the packaging what this product is and does?", options: [{ id: "opt0", label: "Yes, completely" }, { id: "opt1", label: "Somewhat" }, { id: "opt2", label: "No" }] },
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How practical is the packaging to use (open, hold, store)?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "What stood out most — good or bad — about the packaging?" },
    ],
  },
  {
    key: "CLAIMS_TESTING",
    label: "Claims — Comprehension & Believability",
    decision: "Is the product's main claim understood and believed? (Perception only — NOT claim substantiation. Uses Product.claims.)",
    questions: [
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Can you recall the main benefit or claim on this product?", options: [{ id: "opt0", label: "Yes" }, { id: "opt1", label: "No" }, { id: "opt2", label: "Not sure" }] },
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How believable is the product's main claim?" },
      { stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "How likely are you to purchase this product based on its claims?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "Which claim or message stood out most, and did you believe it? Why?" },
    ],
  },
  {
    key: "ADVERTISING_MESSAGE_TESTING",
    label: "Advertising / Message Testing — Recall & Relevance",
    decision: "Does the intended message land with consumers? (Post-exposure recall/relevance — NOT ad-effectiveness measurement.)",
    questions: [
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Do you remember the message shown with this product?", options: [{ id: "opt0", label: "Yes, clearly" }, { id: "opt1", label: "Vaguely" }, { id: "opt2", label: "No" }] },
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "Was the message clear and easy to understand?", options: [{ id: "opt0", label: "Yes" }, { id: "opt1", label: "Somewhat" }, { id: "opt2", label: "No" }] },
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How relevant was the message to you personally?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "In your own words, what was the message trying to tell you?" },
    ],
  },
  {
    key: "BRAND_PERCEPTION",
    label: "Brand — Perception Snapshot",
    decision: "How is the brand perceived by consumers who tried the product? (Point-in-time snapshot — NOT a brand tracker.)",
    questions: [
      { stage: "ELIGIBILITY", type: "SINGLE_CHOICE", text: "Had you heard of this brand before today?", options: yesNo() },
      { stage: "POST_TRIAL", type: "MULTI_CHOICE", text: "Which words describe this brand to you now?", options: [{ id: "opt0", label: "Trustworthy" }, { id: "opt1", label: "High quality" }, { id: "opt2", label: "Good value" }, { id: "opt3", label: "Innovative" }, { id: "opt4", label: "Ordinary" }, { id: "opt5", label: "Not for me" }] },
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How would you rate your overall impression of this brand?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "Did trying this product change how you see the brand? How?" },
    ],
  },
  {
    key: "UA_EXPANSION",
    label: "Usage & Attitude — Expanded Category Picture",
    decision: "How do category consumers use, choose, and feel about products like this? (Campaign-bound U&A — NOT a standalone panel study.)",
    questions: [
      { stage: "ELIGIBILITY", type: "SINGLE_CHOICE", text: "How often do you use products in this category?", options: [{ id: "opt0", label: "Daily" }, { id: "opt1", label: "Weekly" }, { id: "opt2", label: "Monthly" }, { id: "opt3", label: "Rarely" }, { id: "opt4", label: "Never" }] },
      { stage: "ELIGIBILITY", type: "MULTI_CHOICE", text: "What matters most when you choose a product in this category?", options: [{ id: "opt0", label: "Price" }, { id: "opt1", label: "Brand" }, { id: "opt2", label: "Quality" }, { id: "opt3", label: "Ingredients/contents" }, { id: "opt4", label: "Recommendations" }, { id: "opt5", label: "Availability" }] },
      { stage: "POST_TRIAL", type: "TEXT", text: "What usually drives your choice of product in this category?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "What frustrates you most about products in this category?" },
      { stage: "POST_TRIAL", type: "SINGLE_CHOICE", text: "After trying it, where does this product stand vs. what you usually use?", options: [{ id: "opt0", label: "Better" }, { id: "opt1", label: "About the same" }, { id: "opt2", label: "Worse" }] },
    ],
  },
  {
    key: "SEGMENTATION_STUDY",
    label: "Segmentation — Audience Difference Study",
    decision: "Do meaningful audience groups respond differently to this product? (Screener-fed descriptive segmentation — no clustering/inference is performed.)",
    questions: [
      { stage: "ELIGIBILITY", type: "SINGLE_CHOICE", text: "How often do you use products in this category?", options: [{ id: "opt0", label: "Daily" }, { id: "opt1", label: "Weekly" }, { id: "opt2", label: "Monthly" }, { id: "opt3", label: "Rarely" }] },
      { stage: "ELIGIBILITY", type: "SINGLE_CHOICE", text: "Who usually buys this kind of product in your household?", options: [{ id: "opt0", label: "Me" }, { id: "opt1", label: "Someone else" }, { id: "opt2", label: "Shared" }] },
      { stage: "POST_TRIAL", type: "RATING_1_5", text: "How would you rate this product overall?" },
      { stage: "POST_TRIAL", type: "PURCHASE_INTENT_1_5", text: "How likely are you to purchase this product?" },
      { stage: "POST_TRIAL", type: "TEXT", text: "What did you like or dislike about the product?" },
    ],
  },
];

export function findTemplate(key: string): StudyTemplate | undefined {
  return STUDY_TEMPLATES.find((t) => t.key === key);
}
