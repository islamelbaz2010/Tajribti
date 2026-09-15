# Founder Decision — Strategic Product Differentiation (Study-Type Intelligence Layer)

**Document type:** Founder-level product decision record
**Date:** 2026-09-15
**Status:** ACTIVE
**Relationship to `REFERENCE_PRODUCT_BENCHMARK.md`:** This document does **not** amend, replace, or retroactively become part of the Benchmark. The Benchmark remains the sole *minimum* Product Truth for the TAJRIBTI Benchmark Edition. This record authorizes one specific, scoped extension *beyond* that minimum, under an explicit founder decision made outside the Benchmark. Nothing in this file should ever be cited as if it were Benchmark text.

---

## 1. The decision

The founder authorized treating external consumer-research evidence as grounds for product capabilities that go beyond the Benchmark, when they create meaningful differentiation and commercial value, provided they:

1. do not violate any explicit Benchmark exclusion (§9),
2. sit as a configuration/intelligence layer above the existing generic engine rather than replacing or fragmenting it,
3. never force a company's choices — every recommendation stays optional and editable,
4. introduce no new statistical methodology, scoring, segmentation, or AI narrative.

Under that authorization, this decision adds one capability: a small, static **"Decision → Study Type → Recommended Questions"** catalog (`api/src/lib/studyTemplates.ts`), an optional `Campaign.studyType` tag, and a "Apply recommended questions" action in the Company console.

## 2. What this is

- A company creating a campaign may optionally answer "What are you trying to learn?" from six research-derived study types (Post-Trial Experience for Food & Beverage / Beauty & Personal Care / Home Care, Concept/Launch Viability, Packaging & Claims Reaction, Usage & Attitude).
- Selecting one tags the campaign (`studyType`) and offers to bulk-create that study type's recommended questions — using only the five question types and two stages the Benchmark-conformant `Question` model already defines.
- A company can ignore this entirely; a campaign with no `studyType` behaves identically to the pre-existing, Benchmark-only product.
- A generated question is stored as an ordinary `Question` row, indistinguishable from a manually-authored one, and `DELETE /company/campaigns/:id/questions/:qid` already exists on the backend for any question, generated or manual.

**Correction (final acceptance pass, 2026-09-15):** this document previously stated that "every generated question can be edited or deleted afterward exactly like a manually-authored one," implying the Company console UI already supports that. It does not: `web/app/company/index.html`'s question list renders stage/type/text only, with no edit or delete control wired to any question, generated or manual — the backend `DELETE` route exists but nothing in the UI calls it. This is a pre-existing Journey/Survey gap that predates the Study-Type layer (the empty fourth `<th>` column in the question table suggests it was always intended and never finished); it is not something this decision introduced, and the Benchmark itself never requires question editing as part of the named "Journey/Survey" capability — only that questions exist, persist, and feed analysis. Left unfixed in this pass per the standing rule against opportunistic feature-building during an acceptance/audit pass; recorded here so the claim above is never repeated as fact.

## 3. What this is not

- Not a separate report engine, sector engine, or "FoodEngine/BeautyEngine" — the Core Engine (Campaign, Audience, Journey, Survey, Measurement, Insights, Report) is unchanged. `buildReport()`'s methodology, evidence rules, and 14 categories are unchanged; `studyType` is added only as a factual passthrough field in the campaign-identity section.
- Not a sector/vertical selector in its own right — sector differences are folded into study-type *content* (e.g. the Food & Beverage vs. Beauty vs. Home Care variants of the Post-Trial template), not a second architectural axis.
- Not a resolution of the Benchmark's own sector silence (see `governance/REFERENCE_PRODUCT_BENCHMARK.md` §9 — "non-FMCG vertical expansion" remains excluded; this record does not touch that boundary and every template is FMCG-oriented).
- Not billing, pricing, subscriptions, or a commercial service catalog — none of that exists in the implementation.
- Not a scoring, significance, or segmentation system — no new number is computed by this feature; it only creates ordinary `Question` rows.

## 4. A correctness constraint this decision had to design around

`measurement.ts`'s `getSatisfaction()` and `getPurchaseIntent()` aggregate **all** answers of type `RATING_1_5` / `PURCHASE_INTENT_1_5` on a campaign into one combined average, with no per-question breakdown (pre-existing, unmodified, Benchmark-conformant behavior). Every template therefore contains at most one question of each type, and the apply-template endpoint (`POST /company/campaigns/:id/questions/apply-template`) refuses to create a second one if the campaign already has one — from this catalog or authored manually — reporting back which questions were skipped and why. This preserves the Benchmark's own evidence-integrity rule (§6: "evidence must be separated from interpretation... unsupported segmentation or causal claims must not be fabricated") rather than silently blending two different measurements into one meaningless number.

## 5. Evidence basis (context, not Product Truth)

Drawn from Kantar, Ipsos, Qualtrics, NielsenIQ and IQVIA sources researched in this product pass — see the accompanying handoff for full citations. Summary: professional consumer-intelligence study types (Concept Testing, Product/Sensory Testing, Packaging/Claims Testing, Usage & Attitude, Post-Trial Experience) differ from a generic survey tool by connecting evidence to a specific brand decision, and a platform that pre-populates the right questions for a stated decision is a defensible differentiator for companies without in-house research expertise — without needing separate software per sector.

**Content additions (product-value pass, 2026-09-15):** three question-content gaps were identified against this same research and closed, all within the existing five-question-type/two-stage model, none adding a second `RATING_1_5` or `PURCHASE_INTENT_1_5` to any template (the §4 constraint above):
- Beauty & Personal Care and Home Care Post-Trial templates gained the same "Would you buy this again?" repurchase-intent question the Food & Beverage template already had — research treats repurchase intent as distinct evidence from a single point-in-time purchase-intent score, and there was no reason the two sector variants should carry less evidence than the third.
- Concept/Launch Viability gained a "How different is this product from what you can already buy?" question — concept-testing sources (Qualtrics; see handoff) treat uniqueness/differentiation as core evidence alongside appeal and purchase intent; this template had no `RATING_1_5` question at all, so nothing was displaced.
- Packaging & Claims Reaction gained a purchase-intent question — packaging research (Ipsos, Zappi; see handoff) ties pack/claim reaction to purchase intent as the outcome metric, not comprehension/believability alone; this template had no `PURCHASE_INTENT_1_5` question at all, so nothing was displaced.

A candidate "value/price perception" question (also research-supported) was explicitly **not** added: the Campaign/Product data model carries no price field and the consumer journey never shows a price, so a price-perception question would have no evidence anchor — this is recorded as a Product Decision Required (whether to add a price field to `Product`), not silently worked around with a weak question.

## 6. Reversibility

Purely additive: one nullable schema column, two new thin routes, and optional UI affordances. Removing this decision requires no data migration for any campaign that never set `studyType`.
