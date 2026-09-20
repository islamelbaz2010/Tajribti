# TAJRIBTI — MASTER GAP REGISTER

**Date:** 2026-09-20
**Candidate:** `a2ae416` + review-pass fixes (uncommitted → committed as review-pass commit)
**Classifications:** A implemented-correct · B needs-manual-verification · C confirmed-defect-fix · D missing-authorized · E infrastructure-pending · F governance-ambiguity · G test/review-data-pollution · H historical/out-of-scope · I founder-decision-required

| ID | Area | Finding | Evidence | Authority | Class | Action | Status |
|---|---|---|---|---|---|---|---|
| G-01 | Consumer Discover | API enforces participated-campaign exclusion | `consumer.ts` `participations:{none}`; test green; verified live on review DB | Benchmark + Founder decision | A | — | Done |
| G-02 | Consumer Activity | Participations listed in Activity | verified live (SURVEY_COMPLETE row) | Benchmark | A | — | Done |
| G-03 | Consumer auth | OTP dev path works; no push UI anywhere | `devOnlyCode` local; push endpoints absent (tests) | Founder decision | A | — | Done |
| G-04 | Akedly shield (D-6) | PoW only when `challengeRequired`; Turnstile only when provider `required`; no invented threshold | `web/app/consumer/index.html` ~201–208; T4–T6 tests | D-6 | A | — | Done |
| G-05 | Audience clearing | **Defect:** cleared optional fields (age min/max, city, product) persisted stale values — UI sent `undefined`, Prisma skipped the key | `company.ts` PATCH + `web/app/company` save handler | Benchmark data integrity | C | **FIXED** — nullable schema + explicit-null UI + transform `""→null`; 3 regression tests | Fixed, tested |
| G-06 | Study-type request dupes | Duplicate PENDING refused 409 — already correct | `company.ts` 366–374 + new test | Governance | A | regression test added | Done |
| G-07 | Stale approve on locked campaign | Backend 409s correctly, but ops UI offered a dead Approve button on PENDING requests for ACTIVE campaigns | `ops.ts` 195–197; `web/app/ops` renderer | Governance UX | C | **FIXED** — locked-campaign rows show explanatory note; Reject retained; backend test added | Fixed, tested |
| G-08 | QR artifact | QR/source rows had no usable entry artifact | consumer entry is `/app/consumer/?qr=CODE`; UI showed only label/code/dates | Benchmark QR/source | C | **FIXED** — Entry link column rendered per source | Fixed |
| G-09 | D-3 study methodologies | 8 distinct profiles (objective/method/primary-evidence/limitations/not-claimed) in report payload + both report UIs | `studyProfiles.ts`; 3-type live diff verified | D-3 | B | Founder judges sufficiency — see D-3 matrix below | Needs manual review |
| G-10 | D-5 hosted media | Code complete end-to-end (schema, routes, signed URLs, guards, UI, tests); storage not provisioned | `media.ts`, routes, 14 tests; upload-init 503s correctly | D-5 | E | Apply staged bucket `tajribti-media` + wire 5 env vars | Infra pending |
| G-11 | Platform Admin UI | Administration tab (ops-users + audit log) PLATFORM_ADMIN-only; OPERATIONS gets no tab + 403s | `web/app/ops`; verified live both roles | OFD-08 | A | — | Done |
| G-12 | Ops-user deactivate/edit | No endpoint/UI exists | routes expose create+list only | OFD-08 silent | F | Documented NOT CURRENTLY REQUIRED — do not implement without Founder decision | Documented |
| G-13 | Audit coverage | COMPANY_CREATE, PII_VIEW, OPS_USER_CREATE, PANEL_VIEW logged; question governance via QuestionAuditEvent | `ops.ts`, `company.ts` | OFD-08 | A | — | Done |
| G-14 | Predictive language | No prediction/forecast/significance claims; explicit disclaimers present | grep UI + `intelligence.ts` | D-4 | A | — | Done |
| G-15 | Product tenant isolation | Ownership enforced on create + PATCH; cross-company → uniform 404 | tests P1–P3 + new PATCH test | Benchmark §10 | A | regression test added | Done |
| G-16 | Review-data pollution | dev.db held ~77 test/audit campaigns → severe manual-review noise | local dev.db listing | — | G | Isolated clean `dev-review.db` (migrate+seed+fixtures); dev.db untouched | Resolved |
| G-17 | Media orphan sweep | `listMediaKeys()` exists; no scheduled job | `media.ts` | spec | F | Founder decision on cadence — not invented | Documented |
| G-18 | Live results | On-demand refresh, funnel + sources + PI/ratings persisted | `company.ts` `/live` | Benchmark | A | — | Done |
| G-19 | Reports | studyProfile + evidence + findings + limitations + bilingual narrative + print CSS | report renderers | Benchmark §7 | A | — | Done |
| G-20 | Mobile / B-04 / push | Out of scope this pass | — | D-8/D-9 | H | Deferred | — |

## D-3 Methodology Matrix (honest depth)

All 8 types share the same instrument (Question model + template questions) and evidence pipeline. Differentiation is methodology-profile-level: distinct objective/method/primary-evidence/limitations/not-claimed text + type-specific template questions. No bespoke statistical instrument exists for any type — none was invented.

| Study Type | Objective | Method | Instrument | Evidence | Findings | Recs | Report | Limits |
|---|---|---|---|---|---|---|---|---|
| Concept Testing | IMPL | IMPL | PARTIAL | IMPL | IMPL | IMPL | IMPL | IMPL |
| Pricing | IMPL | IMPL | PARTIAL* | IMPL | IMPL | IMPL | IMPL | IMPL |
| Packaging | IMPL | IMPL | PARTIAL* | IMPL | IMPL | IMPL | IMPL | IMPL |
| Claims | IMPL | IMPL | PARTIAL* | IMPL | IMPL | IMPL | IMPL | IMPL |
| Adv/Message | IMPL | IMPL | PARTIAL* | IMPL | IMPL | IMPL | IMPL | IMPL |
| Brand | IMPL | IMPL | PARTIAL* | IMPL | IMPL | IMPL | IMPL | IMPL |
| U&A Expansion | IMPL | IMPL | PARTIAL* | IMPL | IMPL | IMPL | IMPL | IMPL |
| Segmentation | IMPL | IMPL | IMPL | IMPL | IMPL | IMPL | IMPL | IMPL |

\* PARTIAL = the approved method is implemented as far as the existing question types support (no price-ladder/Van Westendorp, shelf test, exposure metrics, or longitudinal tracking exists — none was invented). Deeper instruments would require new authorized question types/methodology — a Founder decision.
