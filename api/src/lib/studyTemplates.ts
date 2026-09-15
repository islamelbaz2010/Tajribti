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
    key: "CONCEPT_LAUNCH_VIABILITY",
    label: "Concept / Launch Viability",
    decision: "Should we launch this concept?",
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
];

export function findTemplate(key: string): StudyTemplate | undefined {
  return STUDY_TEMPLATES.find((t) => t.key === key);
}
