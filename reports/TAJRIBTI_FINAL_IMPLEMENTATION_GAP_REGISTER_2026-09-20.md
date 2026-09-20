# TAJRIBTI — FINAL IMPLEMENTATION GAP REGISTER

**Date:** 2026-09-20
**Companion to:** `TAJRIBTI_FOUNDER_MANUAL_REVIEW_PACKAGE_2026-09-20.md`
**Scope:** Consolidated classification of every approved item after the completion pass.

| # | Item | Classification | Evidence | Remaining action |
|---|---|---|---|---|
| 1 | Operations global visibility (D-1) | FULLY IMPLEMENTED | `api/src/routes/ops.ts` — no per-company scoping; pipeline filter is UI-only | None |
| 2 | Browser Print / Save-as-PDF (D-2) | FULLY IMPLEMENTED | `@media print` CSS + `btn-print-report` in `web/app/company/index.html`; ops report surface prints | Founder visual check of print output |
| 3 | Study methodologies ×8 (D-3) | FULLY IMPLEMENTED (methodology-profile depth) | `api/src/lib/studyProfiles.ts`; `studyProfile` in report payload; rendered in company + ops report UIs; tests | Founder judges sufficiency of depth — deeper instruments (e.g. Van Westendorp) would need new approved question types |
| 4 | Predictive analytics (D-4) | DEFERRED (by design) | Descriptive sections labeled; no predictive language | Founder-approved methodology before any model |
| 5 | Hosted media (D-5) | INFRASTRUCTURE PENDING — code fully implemented | `api/src/lib/media.ts`, routes, migration, UI, 14 tests | Apply staged bucket `tajribti-media` + wire 5 env vars (§5 of review package) |
| 6 | Akedly conditional shield (D-6) | FULLY IMPLEMENTED | `web/app/consumer/index.html` ~201–208; T4/T5 tests | Difficulty-budget trigger remains dormant pending ratified budget |
| 7 | Platform Admin UI | FULLY IMPLEMENTED | Administration tab in `web/app/ops/index.html` (ops-users + audit log), role-gated | Founder login check with PLATFORM_ADMIN account |
| 8 | Ops-user deactivate/edit | NOT IMPLEMENTED | No API route exists; spec defined create/list only | Founder decision if needed — not a Benchmark requirement |
| 9 | Media orphan sweep | BACKEND ONLY | `listMediaKeys()` exported; no scheduler invented | Founder decision on sweep cadence/policy |
| 10 | Consumer Discover exclusion | FULLY IMPLEMENTED | `participations: { none: { consumerId } }` + test | None |
| 11 | B-04 | DEFERRED | Runbook exists; not run | Founder authorization after review |
| 12 | Mobile | DEFERRED | Untouched | Phase D |

**No hidden greens:** item 5 is the only infrastructure-gated feature; item 8 is the only deliberately-absent capability; item 9 is intentionally unscheduled.
