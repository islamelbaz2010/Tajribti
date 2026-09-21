# TAJRIBTI — WEB READINESS GATE — 2026-09-21

## 1. EXECUTIVE STATUS

**WEB READY — CONDITIONAL**

All in-scope Web requirements from the Founder Decision workbook (FD-WEB-01 …
FD-WEB-18) are implemented and regression-verified on the current repository.
The conditions are **infrastructure/release gates, not product gaps**: a
production database migration, production OTP/Akedly configuration, production
storage/media environment, and Founder review before release. No product
behaviour remains ambiguous in a way that blocks a production decision.

## 2. REPOSITORY IDENTITY

| Item | Value |
|---|---|
| Path | `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean` |
| Remote | `https://github.com/islamelbaz2010/Tajribti.git` |
| Local branch | `master` |
| Remote line | `origin/benchmark-current` (also `origin/main`, `origin/HEAD -> origin/main`) |
| HEAD at gate start | `71e06ee59baa1649b8f064514a93b5ff7f1a984b` |
| Pre-existing untracked | 3 Founder decision workbooks (`.xlsx`) — excluded from commit |

Repository identity was confirmed unambiguous before any change: path, remote,
Benchmark file presence, and SHA-256 all matched. Local branch naming
(`master`) was not treated as evidence of production deployment.

## 3. BENCHMARK SHA

`governance/REFERENCE_PRODUCT_BENCHMARK.md`

```
648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a
```

Unchanged before, during, and after this pass. The Benchmark was not modified.

## 4. FOUNDER DECISION INPUTS

The 2026-09-21 Founder Decision Review Workbook supplied FD-WEB-01 through
FD-WEB-18. Decisions that changed implementation this pass:

| Decision | Effect |
|---|---|
| FD-WEB-01 | `COMPANY_MEMBER` = reporting/read-only; all mutation routes gated `COMPANY_ADMIN` |
| FD-WEB-02 | `COMPANY_ADMIN` retains full company/campaign management |
| FD-WEB-03 | New `OPERATIONS_MANAGER` role: company creation + operations scope, no Platform Admin powers |
| FD-WEB-04 | Both request queues gain a `REQUEST_CHANGES` review outcome, company-visible, audited |
| FD-WEB-05 | QR source mandatory per campaign — reinstated as a readiness check |
| FD-WEB-10 | Public CTA corrected to **Book a demo** |
| FD-WEB-11/12 | Public catalog labels executable vs approved-not-yet-executable vs future |
| FD-WEB-16 | B-04 QR load test deferred — not run |
| FD-WEB-17 | Mobile explicitly out of scope for this pass |

Decisions already satisfied by prior passes and verified unchanged: FD-WEB-06
(Discover OR QR entry), FD-WEB-07 (campaign-bound fresh OTP), FD-WEB-08
(expanded research profiles), FD-WEB-09 (demographics + screener eligibility),
FD-WEB-13 (no predictive analytics), FD-WEB-14 (platform-managed storage —
code complete), FD-WEB-15 (conditional shield preserved), FD-WEB-18 (no
Samples App feature inheritance).

## 5. WEB REQUIREMENT MATRIX

Legend: **A** implemented+verified · **B** partial · **C** not implemented ·
**D** ambiguous · **E** unauthorized/legacy · **F** technical only ·
**G** conflicting · **H** requires product decision.

| # | Requirement | Source | Implementation | Test evidence | Status | Action |
|---|---|---|---|---|---|---|
| A | Consumer Web surface | Benchmark | `web/app/consumer/index.html` — discover, QR entry, OTP, eligibility, trial, survey, completion, resume, activity, profile, media | consumer suites (OTP, eligibility, survey binding, resume) | A | none |
| B | Company Web | FD-WEB-01/02 | `web/app/company/index.html` — full workspace; member read-only mode added | `COMPANY_MEMBER is read-only across all mutation surfaces` | A | none |
| C | Operations Web | FD-WEB-03/04 | `web/app/ops/index.html` — queues, company creation, request-changes controls, campaign media view | ops role gates + request-changes suites | A | none |
| D | Platform Administration | FD-WEB-03 | Ops-user management, audit events, participant PII restricted to `PLATFORM_ADMIN` | `OPERATIONS cannot manage ops users…`, `OPERATIONS_MANAGER … not Platform Admin surfaces` | A | none |
| E | Public B2B website | FD-WEB-10/11/12 | `web/public/index.html` — B2B value chain, honest catalog, Book a demo CTA | JS parse check; manual review | A | none |
| F | Campaign lifecycle | Benchmark | DRAFT → review → READY → ACTIVE → PAUSED/COMPLETED; DRAFT-only delete; locked-after-launch rules | `campaign delete lifecycle governance`, lifecycle tests | A | none |
| G | Campaign creation/config | FD-WEB-02 | Company Admin create/patch/products/questions/media/templates | integrity + innovation suites | A | none |
| H | Campaign permissions | FD-WEB-01/02 | Backend `requireCompanyAdmin` on all 14 mutation routes; UI hidden for members | member read-only sweep (all mutations → 403/404) | A | none |
| I | Company → Ops requests | FD-WEB-04 | Study-type + question-change queues: approve/reject/**request-changes**, company-visible notes, re-file | `request-changes review outcome (FD-WEB-04)` ×2 | A | none |
| J | QR/source behaviour | FD-WEB-05 | QR source mandatory at readiness; per-source PNG; lifecycle/date-gated; campaign-bound attribution | `QR source → campaign binding`, `QR image generation` | A | none |
| K | Web OTP | FD-WEB-07 | Campaign-bound fresh OTP; cross-campaign verification rejected; session-alone rejected; rate-limited | `FD-07a campaign-bound OTP` (5 tests) | A | none |
| L | Discover / eligibility / trial / survey / completion | FD-WEB-06/09 | Full journey in consumer web + API; demographics + screeners; INELIGIBLE cannot redeem | eligibility + audience-gate suites | A | none |
| M | Resume | FD-M3/WEB | ENTERED → redeem → survey; TRIAL_REDEEMED → survey; no duplicates | resume tests (prior pass, still green) | A | none |
| N | Campaign media | FD-WEB-14 | URL media, locked after launch, company-isolated; consumer + ops web render it | `campaign media (OFD-12)` | A | infra gate: prod bucket env |
| O | Study methodologies | FD-WEB-08/12 | `studyTemplates.ts` + `studyProfiles.ts` — 8 profiles with objective/method/evidence/limitations/non-claims | `D-3 study-type methodology profiles` | A | none |
| P | Reports | Benchmark | `report.ts` — evidence-grounded, campaign-scoped, narrative from persisted values | `measurement and report integrity`, narrative tests | A | none |
| Q | Live Results | Benchmark | `measurement.ts` live metrics, source attribution, campaign-scoped | M1–M4 tests | A | none |
| R | Insights | Benchmark | `intelligence.ts` labeled derived sections with small-cell suppression | intelligence tests | A | none |
| S | Audit | FD-WEB-04 | `audit.ts` events on access, review decisions incl. request-changes | audit tests in both request suites | A | none |
| T | Tenant isolation | Benchmark | companyId-scoped lookups; cross-company → 404 | P/Q/A/M isolation tests | A | none |
| U | Public claims | FD-WEB-11 | Executable vs approved vs future labeled; no Van Westendorp/NPS/shelf/statistical claims | manual review + catalog cross-check vs `studyProfiles.ts` | A | none |
| V | Production readiness | Scope | Code complete; gates listed in §15 | full suite 98/98, tsc, prisma, JS parse | A (code) | infra gates pending |
| — | B-04 QR load test | FD-WEB-16 | Deferred by Founder decision | not run | H → deferred decision | not executed |

No requirement classified C, E, or G remains. No D/H item blocks Web
readiness; the single H item (B-04) is an explicitly deferred Founder
decision.

## 6. IMPLEMENTED DURING THIS PASS

| File | Change | Why |
|---|---|---|
| `api/src/middleware/auth.ts` | Added `requireOperationsManager`; corrected stale role comments | FD-WEB-03 |
| `api/src/routes/company.ts` | `requireCompanyAdmin` applied to all 14 mutation routes (products, campaigns create/patch/delete, questions, templates, QR sources, media, submit-for-review, study-type requests, question-change requests, employees) | FD-WEB-01 — backend authorization is authoritative |
| `api/src/routes/ops.ts` | `OPERATIONS_MANAGER` allowed on company creation; new `POST /study-type-requests/:id/request-changes` and `POST /question-change-requests/:id/request-changes` (conditional PENDING→CHANGES_REQUESTED update, review note, audit event); audit on approve/reject outcomes | FD-WEB-03, FD-WEB-04 |
| `api/prisma/schema.prisma` | `OpsRole` += `OPERATIONS_MANAGER`; `StudyTypeChangeRequest.reviewNote`; status enum += `CHANGES_REQUESTED`; comments updated | FD-WEB-03/04 persistence |
| `api/prisma/migrations/20260921034722_study_type_request_review_note/` | Migration for the above | schema change |
| `api/src/lib/readiness.ts` | QR/source presence reinstated as a readiness check (alongside objective + valid dates); comments distinguish Founder-authorized gating from prior unsupported gates | FD-WEB-05 |
| `api/test/innovation.test.ts` | New tests: member read-only sweep across every mutation surface; OPERATIONS_MANAGER company creation vs Platform-Admin rejection; request-changes on both queues (note, audit, re-file) | FD-WEB-01/03/04 regression proof |
| `api/test/integrity.test.ts` | Fixture employees that exercise mutation routes set to `COMPANY_ADMIN` | tests must reflect the corrected role model |
| `web/app/company/index.html` | Member read-only mode: product form, question add/remove, template apply, QR creation, media add/remove, submit, request filing all hidden/disabled for `COMPANY_MEMBER`; request outcomes show review note + re-file path | FD-WEB-01/04 UI parity (backend remains authoritative) |
| `web/app/ops/index.html` | `OPERATIONS_MANAGER` role option; onboard-company visible to manager; request-changes buttons + note prompt on both queues; `CHANGES_REQUESTED` rendering; read-only campaign media list in Configuration tab | FD-WEB-03/04; media visibility gap |
| `web/public/index.html` | Primary CTA → **Book a demo**; study catalog explicitly labeled currently-executable vs approved-direction vs future/reference | FD-WEB-10/11/12 |

Nothing else was changed. No mobile file was touched. No governance document
was regenerated or duplicated.

## 7. NOT IMPLEMENTED

| Item | Reason | Classification |
|---|---|---|
| B-04 QR load test | Explicitly deferred by FD-WEB-16 | deferred Founder decision |
| Production DB migration apply | Production data/infra out of scope | infrastructure gate |
| Production OTP/Akedly credentials | Production secrets out of scope | infrastructure gate |
| Production media bucket env | FD-WEB-14 — code complete, infra staged | infrastructure gate |
| Formal Van Westendorp / shelf / NPS / churn instruments | Methodology spec absent | approved — not yet executable (FD-WEB-12) |
| Predictive analytics | FD-WEB-13 authorizes definition only | future methodology |
| Mobile/APK/Flutter | FD-WEB-17 — explicitly out of this pass | mobile gate |
| iOS universal links | Deferred in prior pass; mobile scope | mobile gate |
| Push notifications, rewards/points | Rejected product decisions (FD-WEB-18) | not authorized — intentionally absent |

No item was left unimplemented because it was merely difficult; every
remaining item is an explicit decision, an infrastructure gate, or out of
scope.

## 8. PUBLIC WEBSITE STATUS

- **Clearly B2B?** Yes. Audience copy targets product/innovation, brand/
  marketing, and consumer-insights teams; the value chain shown is
  trial → feedback → measurement → evidence → decision-ready report.
- **Why companies pay?** Yes — structured consumer data and evidence-grounded
  reports from real product trial, not panel surveys.
- **Current capabilities explained?** Yes — campaign setup, QR distribution,
  eligibility screening, trial redemption, surveys, live results, reports.
- **Available vs approved/future distinguished?** Yes — the catalog now labels
  executable capabilities, approved directions requiring methodology
  implementation (e.g. formal price-sensitivity instruments, shelf
  simulation, longitudinal tracking), and future/reference items.
- **Unsupported claims avoided?** Yes — no pricing numbers, no ROI guarantees,
  no statistical-significance claims, no AI-inference claims, no unimplemented
  instruments marketed as available.
- **CTA correct?** Yes — **Book a demo** is the primary commercial CTA;
  consumer entry remains a utility link, not the primary journey.

## 9. COMPANY ROLE STATUS

- **Company Member = Reporting / Read Only** — verified. All 14 mutation
  routes require `COMPANY_ADMIN`; direct API calls from a member token return
  403 (cross-company: 404). Read/report endpoints remain available. UI hides
  mutation controls but backend authorization is authoritative.
- **Company Admin = Full Company/Campaign Management** — verified. Admins
  retain products, campaigns, questions, templates, QR sources, media,
  submission, and request filing. Operations-controlled lifecycle decisions
  still require the request workflow — admin rights do not bypass Operations.

## 10. OPERATIONS STATUS

- **Operations**: global operational surface — campaign review, request
  queues, operational workflows. Cannot create companies, manage ops users,
  or view participant PII.
- **Operations Manager**: can create companies and operate in Operations
  scope; cannot access Platform Admin-only surfaces (ops-user management,
  audit-event administration, participant PII).
- **Platform Admin**: retains privileged administration.
- **Company Request workflow**: Request → Ops review → Approve / Reject /
  Request Changes → execution where approved. Company sees status and review
  note; can correct and re-file. Conditional status updates make reviews
  concurrency-safe.
- **Audit**: review decisions, request-changes send-backs, question edits,
  and access events are all recorded with actor identity.

## 11. CONSUMER WEB STATUS

| Step | Status |
|---|---|
| Discover (excludes participated) | verified — `consumer Discover exclusion` test |
| Scan QR / attributed entry | verified — QR source → campaign binding tests |
| Campaign view + media gallery | verified — ordered media render, https-only |
| Campaign-bound OTP | verified — FD-07a suite (5 tests) |
| Eligibility (demographics + screeners) | verified — E6/E7/E8/E12 |
| Trial / redemption | verified — INELIGIBLE cannot redeem; single redemption |
| Survey | verified — answer/question/participation binding |
| Completion | verified — no duplicate completion |
| Resume (ENTERED / TRIAL_REDEEMED) | verified — FD-M3 resume tests green |
| Activity / Profile | verified — consumer-owned history only |

No push-notification surface exists on Web (rejected product decision).

## 12. REPORT / METHODOLOGY STATUS

**Currently executable** (spec + instrument + evidence rules in repository):
- Concept Testing, Pricing perception, Packaging feedback, Claims feedback,
  Advertising/Message feedback, Brand perception, U&A expansion,
  Descriptive segmentation — each with objective, methodology, primary
  evidence, limitations, and explicit non-claims in `studyProfiles.ts`.

**Approved but not yet executable** (direction approved, instrument absent):
- Formal price-sensitivity instruments (e.g. Van Westendorp), shelf
  simulation/standout, longitudinal brand tracking, demand curves.

**Future / reference only:**
- Predictive analytics (definition only, FD-WEB-13), market sizing,
  statistical-significance reporting, market-segmentation models, causal
  inference.

No profile fabricates go/no-go verdicts, price points, or statistical claims.

## 13. SECURITY STATUS

- Tenant isolation: all company resources scoped by `companyId`; cross-company
  access returns 404 without existence leaks — verified by tests.
- Role isolation: MEMBER/ADMIN and OPERATIONS/OPERATIONS_MANAGER/
  PLATFORM_ADMIN boundaries enforced server-side — verified.
- Campaign OTP isolation: codes and verifications are campaign-bound; reuse
  across campaigns impossible — verified.
- QR isolation: sources bound to their campaign; foreign-campaign and
  cross-company sources rejected — verified.
- PII: participant PII restricted to Platform Admin; not broadened.
- Secrets: company/ops creation responses expose no password hashes.
- Audit: review decisions, access events, and request outcomes recorded.
- Rate limits: OTP request/verify and login throttling intact (S1–S4).
- Dev-only OTP delivery remains dev-only; Akedly transport forwards client
  PoW verbatim — the server never solves challenges (T0–T6).

## 14. TEST RESULTS

Command: `npm test` (node:test over `api/test/*.test.ts`), after all changes:

```
tests    98
suites   30
pass     98
fail     0
cancelled 0
skipped  0
duration ~176s
```

Additional verification:
- `npx tsc --noEmit` — clean.
- `npx prisma validate` — clean (migration applied to local dev.db only).
- Inline-script parse (`new Function`) on all four web files — clean.
- Legacy contamination scan across web surfaces — 0 product matches;
  remaining hits are JS `push()`, demographics arrays, and removal comments.

## 15. PRODUCTION GATES

Code-complete; the following must occur **before** production release and are
deliberately not executed in this pass:

1. Apply migration `20260921034722_study_type_request_review_note` to the
   production database.
2. Configure production OTP/Akedly credentials and verify the live pipeline.
3. Confirm production media/storage environment (FD-WEB-14 — code complete,
   infrastructure pending).
4. Verify all production environment variables and secrets.
5. Founder review of this gate report.
6. Controlled deployment + read-only production verification.
7. B-04 QR load test — deferred by FD-WEB-16; requires its own window.

## 16. MOBILE GATE

MOBILE WAS NOT BUILT.
APK WAS NOT BUILT.
FLUTTER LOCAL TESTING WAS NOT USED AS A WEB BLOCKER.

No file under `mobile/` was modified in this pass. The Android CI workflow
was inspected as repository evidence only and not triggered. The known
macOS 13 < Flutter-SDK-required macOS 14 limitation remains a
CI/supported-host concern, not a Web-readiness blocker.

## 17. FINAL RECOMMENDATION

The current TAJRIBTI Benchmark Web product is **WEB READY — CONDITIONAL**:
every Founder-directed Web requirement is implemented and regression-verified
(98/98 tests, 30 suites), the Benchmark is untouched, and the remaining items
are infrastructure/release gates plus explicitly deferred decisions — not
product gaps.

Recommended next step: Founder review of this report, then the production
gates in §15, then — and only then — the controlled mobile gate.
