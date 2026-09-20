# TAJRIBTI — MASTER POST-INNOVATION PRODUCT FORENSIC REVIEW

**Date:** 2026-09-20
**Scope:** Web / API / Product only. Mobile is deferred to final release by explicit Founder direction and is **not** counted as a blocker in this report.
**Method:** READ → RECONCILE → AUDIT → CORRECT → TEST → REPORT. No push, no deploy, no merge, no branch rename, no production change.

---

## A. Repository / branch state

| Item | Value | Evidence |
|---|---|---|
| Repository | `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean` | `git rev-parse` |
| GitHub repo | `islamelbaz2010/Tajribti` | `git remote -v` |
| Current branch | `master` (local, **no upstream tracking**) | `git branch` / `git status` |
| Baseline | `45aa5711ab83f97fc8985a185df221ac48031082` = `origin/benchmark-current` | `git merge-base`, `git log` |
| Innovation commit | `30860385cff6c7282d0533d85869df964b1bd816` | `git log` |
| Prior corrective commit | `23632a4ecf1cae5309f5950b7474f0ada41575ff` | `git log` |
| This-pass corrective commit | recorded in §V (created after validation) | `git log` |
| Ancestry | `master` = `benchmark-current` tip + `3086038` + `23632a4` + this pass — content lineage correct | `git log --oneline`, `git merge-base` |
| Remote state | **Unchanged** — nothing pushed/fetched | `git status`, no `push`/`fetch` executed |

**AI_BOOTSTRAP:** no `AI_BOOTSTRAP` file exists in the repository — this fact is reported per the required loading-order rule. Governance was resolved from the actual files present: `governance/REFERENCE_PRODUCT_BENCHMARK.md` (immutable Product Truth), `governance/FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md`, `reports/TAJRIBTI_FOUNDER_INNOVATION_MASTER_REGISTER_2026-09-20.md` (OFD register), `docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md`, `docs/PROJECT_STATE.md`, plus implementation and tests.

## B. Benchmark hash before / after

`governance/REFERENCE_PRODUCT_BENCHMARK.md` — **re-read in full** during this pass.

- Before: `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a`
- After: `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a`
- **UNCHANGED — byte-identical.** `git diff` shows the file untouched.

## C. Founder Decision Register (reconstructed)

| Founder Decision | Surface | Status | Evidence | Action |
|---|---|---|---|---|
| OFD-01 Innovation additive only | All | GREEN — IMPLEMENTED AND VERIFIED | No Benchmark edit; hash identical; integrity tests pass | None |
| OFD-02 Rewards REJECTED | All | GREEN — verified absent; no rewards/wallet/points code or UI | `grep` sweep over `api/src`, `web/` — no wallet/points/reward features | None |
| OFD-03 AI Narrative (evidence-only, bilingual) | Reports | GREEN — deterministic bilingual narrative, evidence-bound, no LLM, no fabricated stats | `api/src/lib/narrative.ts`; test "report carries a deterministic bilingual narrative built only from report values" | Preserve — do not replace |
| OFD-04 8 Study Types | Campaign engine | YELLOW — PARTIAL/GATED | `api/src/lib/studyTemplates.ts` — 14 instruments covering all 8 types; generic report path works; per-type findings/report methodology not specified → not invented | Methodology gate per type (§K) |
| OFD-05 Price/Pack/Claims | Product → Campaign → Report | GREEN — fields persist, validate, flow into reports; company-isolated | `schema.prisma` `Product.priceRange/packSize/claims`; `company.ts`; tests pass | None |
| OFD-06A Advanced Segmentation | Intelligence | GREEN — implemented as descriptive segmentation, correctly labeled derived | `api/src/lib/intelligence.ts`; suppression n<5 | None |
| OFD-06B Sentiment | Intelligence | GREEN — transparent lexicon-based, labeled derived; not presented as AI model | `api/src/lib/intelligence.ts` | None |
| OFD-06C Automated Themes | Intelligence | GREEN — observed-term frequencies, labeled derived; not presented as semantic AI | `api/src/lib/intelligence.ts` | None |
| OFD-06D Predictive/Statistical | Intelligence | BLUE — DEFERRED CORRECTLY | Direction approved; methodology not specified → descriptive statistics only; Wilson intervals presented as descriptive, not predictive | Methodology gate — do not invent a model |
| OFD-07 Vertical expansion | Company | GREEN — Beauty selectable as first non-FMCG extension; Healthcare/Electronics/Services not exposed | `company.ts` vertical validation | None |
| OFD-08 Platform Admin / roles | Ops API + UI | YELLOW — PARTIAL/GATED | Distinct `PLATFORM_ADMIN` vs `OPERATIONS` enforced in middleware+routes+UI; company/ops-user/PII-audit controls exist; assignment granularity + blanket backfill remain open (§F, §S) | Role-assignment semantics = Founder gate |
| OFD-09 Mobile sequence | Mobile | BLUE — DEFERRED BY FOUNDER DECISION | Android-first sequence stands; this task is Web/API only; no mobile file modified | Phase D, after Web/Product acceptance |
| OFD-10 Akedly compatibility | Consumer auth | GREEN — CONFORMANT with V1.2 | `api/src/lib/akedly.ts` backend proxy; client-side PoW; `trust proxy` + `x-end-user-ip`; transactionReqID-keyed verify; production `AKEDLY_*` vars present (masked) | None; `akedly_shield` adoption optional (Turnstile/high-difficulty trigger) |
| OFD-11 Benchmark immutable | Governance | GREEN — verified | §B — identical SHA-256 before/after | None |
| OFD-12 Campaign Media | Company/Consumer | GREEN — URL-referenced media; ownership, campaign binding, launch lock, company isolation, XSS-escaped rendering | `schema.prisma` `CampaignMedia`; `company.ts` media routes; `consumer.ts` campaign payload; web rendering escapes | Binary storage deferred (§N) |
| OFD-13 PDF Export AR+EN | Company/Ops reports | YELLOW — PARTIAL/GATED | Bilingual `dir="rtl"` report + print CSS → browser print→PDF; **no server/client PDF file generation** | PDF engine = open decision gate (§O) |
| OFD-14 Notifications | Consumer/Company/Ops | **GRAY — SUPERSEDED → removed** | Founder decision 2026-09-20 rejects all consumer push. All active routes/UI removed this pass (`consumer` push opt-in/out, company request, ops queue/launch, ops Notifications tab, consumer checkbox). `CampaignNotificationRequest` model + `Consumer.push*` columns remain as documented dormant artifacts | Do not reintroduce without new Founder decision |
| OFD-15A Persistent identity + opt-in | Consumer | GREEN — phone identity, `panelOptIn`/`panelOptInAt` consent endpoints persist | `consumerAuth.ts`, `consumer.ts` profile/consent routes; tests | None |
| OFD-15B Same-company cross-campaign intel | Company | GREEN — opted-in-only, same-company aggregate, small-cell suppressed | `company.ts` `panel-insights` + `intelligence.ts`; test "same-company, opted-in only, small-cell suppressed" | None |
| OFD-15C Shared TAJRIBTI panel | Ops | GRAY — REJECTED, remains absent | No `/ops/panel` route, no Panel UI; regression test asserts 404 | Guarded by test |
| OFD-15D Panel marketplace | — | BLUE — FUTURE ONLY | Not implemented; correctly absent | Future gate |
| OFD-16 Demo Mode | Product | GREEN — absent | No demo-campaign mode; public-site illustrative report is clearly labeled fictional marketing content, not product Demo Mode | None |
| OFD-17 Public Website | Public | GREEN — expanded marketing surface live; no private data exposure; no stale positioning | `web/public/index.html`; static, no auth data | None |
| OFD-18 Folder consolidation | Repo | BLUE — DEFERRED | No deletions/consolidation; uniqueness proof not produced | Remains a governance gate |
| OFD-19 Question change governance | Company/Ops | GREEN — Company request → Ops apply/reject; lifecycle-locked; atomic PENDING→APPLYING; dual-actor audit; historical answers protected | `company.ts` request routes; `ops.ts` apply/reject; `QuestionChangeRequest`/`QuestionAuditEvent`; 3 dedicated tests | None |
| OFD-20 Technical vs commercial release | Governance | GREEN — understood | B-02/B-03/B-04 remain commercial gates; this pass is technical-only | None |
| **NEW (2026-09-20)** Discover = available-not-participated; no consumer push | Consumer | GREEN — implemented this pass | `GET /consumer/campaigns` excludes `participations: { some: { consumerId } }` when authenticated; Activity via `/consumer/participations`; anonymous listing unchanged | Verified by regression test |

## D. Decision-by-decision status summary

GREEN: OFD-01, 02, 03, 05, 06A, 06B, 06C, 07, 10, 11, 12, 15A, 15B, 16, 17, 19, 20, + 2026-09-20 Discover/no-push decision.
YELLOW: OFD-04 (methodology gate), OFD-08 (assignment gate), OFD-13 (PDF engine gate).
BLUE: OFD-06D, OFD-09, OFD-15D, OFD-18.
GRAY: OFD-15C (rejected, absent), OFD-14 (superseded, removed).
RED: none after this pass's corrections.

## E. Product Surface Matrix

| Product Surface | Complete | Partial | Missing | Incorrect | Notes |
|---|---|---|---|---|---|
| Consumer | ✓ Discover/Activity rule, OTP, eligibility, redeem, survey, history | — | — | — | Push removed per new decision |
| Company Workspace | ✓ products/descriptors, media, questions+requests, reports, intelligence, panel-insights, roles | PDF (print only) | binary media storage | — | isolation tested |
| Operations | ✓ pipeline, lifecycle, live, issues, question requests, audit | assignment granularity | — | — | no panel (15C), no notifications (14) |
| Platform Admin | ✓ companies, ops-users, participant PII (audited), audit log | real-user role assignment | — | — | distinct from Operations, enforced |
| Public Website | ✓ OFD-17 expansion | — | — | — | illustrative report clearly labeled fictional |
| Reporting/Insights | ✓ bilingual, narrative, print | true PDF file | — | — | engine decision pending |
| Study-Type Engine | instruments (14) | per-type findings/report | type-specific methodology | — | gated, not invented |
| Auth/Identity/Consent | ✓ OTP+JWT, rate limits, Akedly V1.2, panel consent | — | — | — | push consent removed |
| QR/Source/Journey | ✓ binding, date gating, attribution | — | — | — | B-04 load run pending (production gate) |
| Question Governance | ✓ lifecycle + audit + atomic apply | — | — | — | — |
| Media/Assets | ✓ URL media, ownership, lock | binary storage | — | — | deferred by decision |
| Notification Logic | — | — | all removed per decision | — | dormant schema only |
| Release/Deploy Config | web/API build green | — | — | — | no deploy performed |

## F. Platform Admin Console audit

- **Real surface exists and is distinct from Operations.** `PLATFORM_ADMIN` vs `OPERATIONS` are separate DB roles (`schema.prisma` `OpsUser.role`), enforced by `requirePlatformAdmin`/`requireOpsUser` in `api/src/middleware/auth.ts`; the ops UI gates admin-only panels.
- **Platform Admin-only capabilities (backend-enforced):** company create/list (`POST/GET /ops/companies`), ops-user create/role change (`/ops/users`), participant PII (`GET /ops/campaigns/:id/participants` — emits `AccessAuditEvent`), audit log (`GET /ops/audit-events`). Verified by tests: "OPERATIONS cannot create companies or view participant PII; PLATFORM_ADMIN can, audited" and "OPERATIONS cannot manage ops users; PLATFORM_ADMIN can".
- **Consumer PII access** is Platform Admin-only and auditable.
- **Company tenant isolation** enforced via `companyId` scoping on every company route; cross-company tests pass.
- **Operations users cannot obtain admin capabilities** — middleware checks role per request from DB (role changes take effect immediately).
- **Open item (gate, not defect):** migration backfilled all existing OpsUsers as `PLATFORM_ADMIN` (capability-preserving). Per-person assignment semantics are not specified by any Founder decision — recorded in §Z. Not a defect to fix without authority.
- **UI/API mismatch:** none found — every UI-gated control also has a backend guard.

## G. Consumer audit (final Founder behavior)

Journey verified end-to-end by tests: OTP → JWT → Discover → campaign detail → eligibility → redeem → survey → completion → Activity.

- `GET /consumer/campaigns` — anonymous: all ACTIVE in-date campaigns; **authenticated: same list minus campaigns with a `Participation` for that consumer** (Prisma `participations: { none: { consumerId } }`). Implemented in `api/src/routes/consumer.ts`.
- `GET /consumer/campaigns/:id` — unchanged detail surface; a second participation attempt is still rejected by the existing already-participated guard (controlled response, not bypass).
- `GET /consumer/participations` — consumer-scoped Activity/history (entered/eligible/redeemed/completed lifecycle states — existing states only, none invented).
- Web UI `web/app/consumer/index.html` — `loadDiscover` sends the auth token so filtering is server-side; Discover renders no already-participated card (backend returns none); Activity section renders history.
- XSS-safe rendering verified; no cross-consumer/cross-campaign leakage (tests A3/A4, product-ownership suite).
- **Push:** opt-in/out routes removed; consumer UI checkbox and calls removed; `Consumer.pushOptIn/pushOptInAt/pushToken` columns remain as dormant schema (documented in `schema.prisma` comment and §O of the spec).

## H. Company audit

Profile, employees+roles (COMPANY_ADMIN manages; MEMBER cannot — tested), company isolation (cross-company product assignment rejected — tested), campaigns, product price/pack/claims, URL media (locked after launch — tested), questions direct-edit while DRAFT/READY and request-flow when locked, question audit history, QR sources, live results, intelligence, bilingual report + narrative + print, same-company opted-in panel insights. Notification-request routes **removed** this pass (OFD-14 superseded). No defect remaining.

## I. Operations audit

Pipeline/readiness/lifecycle controls, live view, issues, QR/source ops, question change-request apply/reject (atomic, dual-actor audit), campaign intelligence, reports, participant PII correctly gated to PLATFORM_ADMIN. Notification queue/launch routes and Notifications tab **removed** this pass. No `/ops/panel` (15C rejected — 404 tested). No silent permission expansion.

## J. Public Website audit

OFD-17 implemented (`web/public/index.html`): expanded marketing surface, no authenticated data, no private company/campaign/consumer exposure, no Demo Mode (the illustrative report block is explicitly labeled "fictional demo data" marketing content — compliant with OFD-16 which rejected a demo *campaign mode*, not labeled marketing illustration), no push claims, no stale positioning. No defect.

## K. Campaign / Study-Type audit

All 8 approved types selectable via `studyType` + dedicated instruments in `studyTemplates.ts` (14 instruments total). Each executes end-to-end: eligibility → trial → survey → evidence → generic report → intelligence.

| Study Type | Class | Why |
|---|---|---|
| Concept Testing | PARTIAL | instrument + generic report; type-specific findings methodology unspecified |
| Pricing | PARTIAL | same — price instruments exist; pricing-analysis methodology not specified |
| Packaging | PARTIAL | same |
| Claims | PARTIAL | same — claims field + instruments exist |
| Advertising/Message | PARTIAL | same |
| Brand | PARTIAL | same |
| U&A Expansion | PARTIAL | same |
| Segmentation | PARTIAL | descriptive segmentation exists; type-specific study report not built |

Per-type findings/recommendation methodology is a **decision gate** — none was invented.

## L. Intelligence audit

Segmentation (descriptive cohorts), sentiment (lexicon, transparent), themes (observed-term frequencies), Wilson intervals — all labeled derived, small-cell suppressed (n<5), campaign-scoped, company-scoped via tenant. Predictive analytics: **BLUE — methodology-gated**; nothing presented as predictive that isn't.

## M. AI Narrative audit

`api/src/lib/narrative.ts` — deterministic template narrative, English + Arabic, built only from persisted report values; no LLM call, no causal language beyond evidence, no fabricated stats/sentiment/themes/recommendations. Compliant with OFD-03. **Preserve.**

## N. Media audit

`CampaignMedia` — URL-referenced, company-owned, campaign-bound, creation locked after launch, company isolation tested, rendering XSS-escaped in web, included in consumer campaign payload and report context. Binary storage: **not implemented — deferred by decision** (OFD-12 scoped URLs; open dependency recorded).

## O. PDF audit

Bilingual report (`dir="rtl"` Arabic), print stylesheet, browser print→PDF — works. **No generated PDF file** (no server-side or client-side engine). OFD-13 classified YELLOW — engine selection is an open Founder/technical decision; none was chosen per stop-condition rules.

## P. Question Governance audit

Company request → Operations apply/reject; lifecycle-locked (draft/ready direct, locked → request flow); atomic PENDING→APPLYING flip prevents double-apply races; whitelist field application; stage/type immutable; delete-with-answers refused; `QuestionAuditEvent` records both actors with before/after values; historical answers preserved. Three dedicated tests pass. GREEN.

## Q. Consumer Identity / Consent audit

Persistent phone identity via OTP+JWT; `panelOptIn`/`panelOptInAt` explicit consent endpoints; same-company-only aggregate insights (opted-in consumers only, suppressed <5); strict cross-company isolation; no shared panel (15C). Push consent fields: dormant. GREEN.

## R. Akedly audit

Re-verified against code: `api/src/lib/akedly.ts` — server-side `AKEDLY_API_KEY`/`AKEDLY_PIPELINE_ID`, challenge proxy, OTP send/verify proxy, `powSolution`/`turnstileToken` forwarded verbatim, `transactionReqID` stored server-side, `app.set("trust proxy", 1)` + `x-end-user-ip` forwarding, JWT only after backend verify. **V1.2-CONFORMANT.** `akedly_shield` adoption optional (Turnstile/high-difficulty trigger). No Akedly configuration changed.

## S. Security / Data Integrity audit

- Tenant isolation, campaign ownership, QR→campaign binding, answer→question→campaign binding, participation uniqueness, consumer scoping — all covered by dedicated integrity tests (55 pass).
- Roles checked per-request from DB; self-role-change refused; cross-company assignment rejected without existence leak.
- Rate limiting on OTP send/verify and employee login; Akedly errors propagate correctly (401/429).
- Audit: `AccessAuditEvent` on company create, ops-user create, PII access, panel access, question apply — real actor names (fixed in `23632a4`).
- Concurrency: atomic conditional updates on change-request apply and lifecycle transitions.
- XSS: all dynamic web rendering escaped.
- Standing items (not new defects): PLATFORM_ADMIN blanket backfill (§F gate); mobile Turnstile path absent (latent MEDIUM, deferred with mobile).

## T. Rejected-feature regression audit

- OFD-15C shared panel: **absent** — `/ops/panel` 404 regression test passes; no Panel UI.
- OFD-16 demo mode: **absent** from product.
- OFD-02 rewards: **absent**.
- OFD-14 push (superseded 2026-09-20): all active routes/UI **removed this pass**; absence regression tests pass (consumer opt-in/out 404, company request 404, ops launch 404).
- No reintroduction paths found.

## U. Consumer Discover/Activity — final behavior (acceptance criterion)

```
OPEN APP → SHOW AVAILABLE ACTIVE CAMPAIGNS → EXCLUDE ALREADY-PARTICIPATED
→ CONSUMER CAN ENTER A NEW CAMPAIGN → PREVIOUS PARTICIPATIONS ONLY IN ACTIVITY
```

- API: authenticated `GET /consumer/campaigns` returns ACTIVE + in-date campaigns with **zero** participation by that consumer — enforced by `participations: { none: { consumerId } }`, not UI hiding.
- Anonymous Discover still lists active campaigns.
- `GET /consumer/participations` = Activity (consumer-scoped history).
- UI renders Discover from the API response — no participated card can appear.
- **No push is required. No push is sent when the app is closed. No push infrastructure is active.**
- Regression test: "authenticated consumer does not see a participated campaign; anonymous and other consumers do" — PASSES.

## V. Corrections performed (this pass)

| # | Defect | Correction | Files |
|---|---|---|---|
| C-1 | Discover returned already-participated campaigns for authenticated consumers | Added `participations: { none: { consumerId } }` exclusion when consumer identity present; anonymous path unchanged | `api/src/routes/consumer.ts` |
| C-2 | Consumer push opt-in/out routes active despite rejection | Removed routes; documented dormant schema columns | `api/src/routes/consumer.ts`, `api/prisma/schema.prisma` (comment) |
| C-3 | Company notification-request routes active | Removed | `api/src/routes/company.ts` |
| C-4 | Ops notification queue/launch/reject routes active | Removed | `api/src/routes/ops.ts` |
| C-5 | Ops Notifications tab + loader + handlers | Removed | `web/app/ops/index.html` |
| C-6 | Consumer push consent checkbox + JS | Removed | `web/app/consumer/index.html` |
| C-7 | OFD-14 workflow tests asserting removed behavior | Replaced with absence assertions (404s) + new Discover-exclusion regression test | `api/test/innovation.test.ts` |
| C-8 | Spec still described push as implemented + stale "notification launches" mentions | Annotated superseded; corrected role/audit lists | `docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md` |

No Benchmark edit. No mobile edit. No schema/data migration (columns/model left dormant deliberately — dropping them would be a destructive migration requiring authority). No production or remote change.

## W. Tests

`npm test` (node --test, per-file SQLite DBs): **55 tests, 17 suites — 55 pass, 0 fail, 0 cancelled, 0 skipped.**

Coverage includes: product descriptors, role gates, media lifecycle, question governance (3), push-absence (3), Discover-exclusion (1), consent/panel incl. 15C-404 (3), narrative/intelligence (2), product-ownership (3), QR binding (4), eligibility binding (3), audience gates (3), survey binding (7), measurement/report integrity (4), regression (2), auth transport (4), Akedly transport (7).

## X. Build / typecheck

- `tsc -p tsconfig.json` — exit 0.
- `prisma validate` — schema valid; migration set consistent (no new migration added — comment-only schema change).
- Web inline JS parses cleanly (ops + consumer).
- No linter configured in repo.
- Mobile build: not run — deferred by scope (not a blocker).

## Y. Remaining blockers

1. **B-04** — production QR write-path load validation (`api/scripts/load-test-qr.ts` delivered, never run — needs authorization + production access).
2. **PDF engine** — OFD-13 complete only when an engine is selected.
3. **Study-type methodology** — per-type findings/report structures unspecified.
4. **Predictive methodology** — OFD-06D direction approved, method undefined.
5. **Binary media storage** — deferred architecture decision.
6. **Role-assignment granularity** — PLATFORM_ADMIN backfill needs real-user assignment semantics.

None are code defects; all are decision/authorization gates.

## Z. Remaining Founder decisions

- Per-person Ops role assignment (replace blanket PLATFORM_ADMIN backfill); explicit-assignment layer definition.
- PDF engine selection (OFD-13 completion).
- Per-study-type methodology (OFD-04 completion).
- Predictive methodology (OFD-06D).
- Binary media storage (OFD-12 extension).
- `akedly_shield` adoption trigger (Turnstile/difficulty).
- OFD-18 folder dedup/deletion after uniqueness proof.
- Landing branch + push authorization for `master` → `benchmark-current`.
- Any Benchmark amendment.
- Commercial gates: B-02 Egyptian LLC, B-03 PDPL sign-off, B-04 production QR load run.
- (Push provider decision is **closed** — superseded by 2026-09-20 no-push decision.)

## AA. Mobile deferred gate

Mobile code untouched this pass (`git status` shows zero `mobile/` changes). Android APK → physical device → Akedly mobile validation → Android acceptance → iOS remains Phase D, entered only after Web/API/Product acceptance. Mobile validation is **not** a blocker for this task.

## AB. Exact next recommended step

Present this report for Web/API/Product acceptance; then have the Founder resolve the §Z decision gates (highest-leverage first: role-assignment semantics and the PDF engine). Once accepted, push `benchmark-current` (commits `3086038` + `23632a4` + this pass's corrective commit) and proceed to Phase D mobile release.

---

### Feature × Surface matrix

| Feature | Consumer | Company | Operations | Platform Admin | Public |
|---|---|---|---|---|---|
| Discover (excl. participated) | ✓ | — | — | — | — |
| Activity/history | ✓ | — | — | — | — |
| Push notifications | removed | removed | removed | — | — |
| Campaign CRUD | — | ✓ | monitor | view | — |
| Media gallery | view | ✓ manage | view | — | — |
| Question governance | — | request | apply/reject | audit view | — |
| Reports + narrative | — | ✓ | ✓ | ✓ | — |
| PDF export | — | print→PDF | print→PDF | — | — |
| Intelligence | — | ✓ | ✓ | — | — |
| Panel insights (same-company) | consent | ✓ aggregate | — | audit | — |
| Shared panel (15C) | — | — | rejected | — | — |
| Company/user mgmt | — | employees | — | ✓ | — |
| Consumer PII | self | — | denied | audited | — |
| Marketing content | — | — | — | — | ✓ |

**Final status: GREEN for all implemented-and-specified scope; YELLOW for methodology/engine-gated items (OFD-04 per-type depth, OFD-08 assignment, OFD-13 PDF); BLUE for deferred items; GRAY for rejected/superseded items; no RED remaining.**
