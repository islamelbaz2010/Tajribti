# TAJRIBTI — STUDY-TYPE METHODOLOGY DECISION SPEC (D-3)

**Date:** 2026-09-20 · **Status:** METHODOLOGY SPECIFICATION — grounded in `docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md` §D and `api/src/lib/studyTemplates.ts`. Research files in `doc/` are RESEARCH EVIDENCE — NOT PRODUCT REQUIREMENT.

**Binding engine constraint (existing, preserved):** every instrument uses only the existing Question model — 5 types (`SINGLE_CHOICE`, `MULTI_CHOICE`, `TEXT`, `RATING_1_5`, `PURCHASE_INTENT_1_5`) × 2 stages (`ELIGIBILITY`, `POST_TRIAL`); at most one `RATING_1_5` and one `PURCHASE_INTENT_1_5` per template. Findings/recommendations use the existing deterministic evidence rules and the generic report structure — no per-type report branching is invented. Small-cell suppression n<5 applies to all segment outputs.

Shared methodology elements for ALL types: research objective = the campaign's `objective` field + type objective below; evidence = persisted participation/answers only; findings = computed proportions/means with n and Wilson CIs; recommendations = deterministic rules over evidence, never causal claims; limitations = stated explicitly per type; minimum evidence = n≥5 per reported cell, else suppressed; segmentation treatment = existing descriptive segment conditioning (gender/city/age-band) where data supports it.

---

## 1. Concept Testing (`CONCEPT_TESTING`)

- **Objective:** is the product/concept appealing and differentiated enough to proceed?
- **Research question:** appeal + differentiation + choice intent among category buyers.
- **Instrument:** category-usage screener (ELIGIBILITY) + post-exposure appeal choice, differentiation rating, purchase intent, open improvement (POST_TRIAL).
- **Evidence requirements:** completed participations with post-trial answers.
- **Valid findings:** appeal distribution, differentiation mean, PI distribution, verbatims.
- **Recommendation logic:** deterministic thresholds over observed distributions; no go/no-go verdict is fabricated — findings state what was measured.
- **Limitation (binding):** NOT a pre-development concept board — no stimulus stage exists; `CampaignMedia` may serve as stimulus reference only.
- **Status:** IMPLEMENTED — instrument + generic report satisfy the grounded scope.

## 2. Pricing (`PRICING_PERCEPTION`)

- **Objective:** is perceived price acceptable for value delivered?
- **Research question:** price acceptability + value-for-money perception, contextualized by `Product.priceRange`.
- **Instrument:** price-context/acceptability choices + value rating + PI + open text (POST_TRIAL).
- **Evidence/findings:** acceptability distribution, value mean, PI, verbatims.
- **Limitation (binding):** NOT Van Westendorp / price-ladder — no numeric price-ladder instrument exists. A true pricing-ladder methodology is a **remaining Founder methodology decision** (would require a new instrument type).
- **Status:** PARTIALLY IMPLEMENTED — perception-scope grounded and live; price-ladder depth deferred as documented gate, not invented.

## 3. Packaging (`PACKAGING_EVALUATION`)

- **Objective:** does the pack attract, communicate, function?
- **Research question:** appeal/clarity/usability + standout message.
- **Instrument:** pack-in-hand post-trial choices (appeal, clarity, usability) + open "standout" text.
- **Evidence/findings:** choice distributions, rating means, verbatims; `PACKAGING`/`PRODUCT` media as reference.
- **Limitation:** NOT a shelf test — no competitive shelf simulation exists.
- **Status:** IMPLEMENTED within grounded scope.

## 4. Claims (`CLAIMS_TESTING`)

- **Objective:** is the main claim understood and believed?
- **Research question:** claim recall + believability, using `Product.claims` as the claim under test.
- **Instrument:** believability rating + clarity choice + open text.
- **Evidence/findings:** believability mean/distribution, recall evidence, verbatims.
- **Limitation:** measures *perception* only — NOT substantiation research; no claim-truth judgment is produced.
- **Status:** IMPLEMENTED within grounded scope.

## 5. Advertising / Message Testing (`ADVERTISING_MESSAGE_TESTING`)

- **Objective:** does the intended message land?
- **Research question:** recall + clarity + relevance of the message/creative.
- **Instrument:** message recall/clarity/relevance choices; `CREATIVE` media as stimulus reference.
- **Evidence/findings:** recall/clarity/relevance distributions, verbatims.
- **Limitation:** NOT ad-effectiveness measurement — no exposure/frequency metrics exist.
- **Status:** IMPLEMENTED within grounded scope.

## 6. Brand (`BRAND_PERCEPTION`)

- **Objective:** how is the brand perceived by trialing consumers?
- **Research question:** attribute associations + associations in consumers' own words.
- **Instrument:** brand-attribute multi-choice + open text.
- **Evidence/findings:** association frequencies, verbatims/themes (labeled derived).
- **Limitation:** single point-in-time — NOT a brand tracker; no longitudinal comparison is claimed.
- **Status:** IMPLEMENTED within grounded scope.

## 7. U&A Expansion (`UA_EXPANSION`)

- **Objective:** deeper usage & attitude picture of category consumers.
- **Research question:** usage frequency, repertoire, drivers, barriers.
- **Instrument:** usage-frequency screener + post-trial drivers/barriers open text (screener-heavy).
- **Evidence/findings:** usage distribution, driver/barrier themes (derived labels).
- **Limitation:** campaign-bound — NOT a standalone U&A panel study.
- **Status:** IMPLEMENTED within grounded scope.

## 8. Segmentation (`SEGMENTATION_STUDY`)

- **Objective:** do meaningful audience groups respond differently?
- **Research question:** descriptive differences across demographic/behavioral screeners.
- **Instrument:** multiple ELIGIBILITY screeners feeding segment dimensions + standard post-trial core.
- **Evidence/findings:** segment-conditioned descriptive outputs only; cells n<5 suppressed.
- **Limitation:** NOT a market-segmentation model — no clustering or inference is performed.
- **Status:** IMPLEMENTED within grounded scope.

---

## Unresolved methodology decisions (documented, not guessed)

| Item | Needed decision |
|---|---|
| Numeric price-ladder instrument (Van Westendorp-style) | new question type + methodology — REQUIRES FOUNDER DECISION |
| Pre-trial stimulus stage for concept/ad testing | new stage in Question model — REQUIRES FOUNDER DECISION |
| Longitudinal brand tracking | multi-wave data model — REQUIRES FOUNDER DECISION |
| Inferential statistics / significance testing | pre-registered hypothesis framework — REQUIRES FOUNDER DECISION |

All other approved scope: methodology specified above and satisfied by current implementation.
