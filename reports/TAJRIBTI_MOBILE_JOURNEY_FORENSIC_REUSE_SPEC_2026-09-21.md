# TAJRIBTI — Mobile Consumer Journey: Forensic Reuse & Implementation Specification

**Date:** 2026-09-21 · **Mode:** READ-ONLY — no code, schema, dependency, or config changed

---

## 1. Executive Summary

The current repository already contains a **substantially implemented Flutter consumer app** (`mobile/consumer`, ~7,200 LOC Dart) that was previously recovered and rewired to the current Benchmark Edition API. It is not a greenfield gap — the Discover → QR → OTP → Eligibility → Trial → Survey → History journey **already exists and follows the current API contracts**.

What this audit found is a smaller set of **real defects and governance gaps**, not a rebuild need:

1. **Rewards-language leaks** — rendered consumer-facing strings still promise rewards ("Earn reward points", "earned your reward") although the product has no rewards system (Founder-rejected legacy).
2. **Push opt-in toggle calls removed endpoints** — `/consumer/push/opt-in|out` no longer exist server-side; the toggle silently fails (backend comment says cleanup was deliberately deferred to the mobile phase — that phase is now).
3. **FD-07 "OTP required for every campaign"** is **not supported by the current backend** — OTP issues a reusable session JWT; no per-campaign OTP exists anywhere (web or API). This is a genuine product gap or a decision that needs re-reading.
4. **Partial-participation resume gap** — a consumer who became ELIGIBLE or TRIAL_REDEEMED but never finished the survey is excluded from Discover (any participation is excluded) and gets 409 on re-entry, dead-ending at an "already participated" screen. The server *would* allow survey resume; the client can't reach it.
5. **No deep links** — the generated QR encodes the *web* consumer URL; a phone-camera scan lands on the web app, not the Flutter app.
6. **Turnstile unsupported on mobile** — if the production Akedly pipeline ever requires Turnstile, mobile OTP fails permanently (PoW is implemented; Turnstile widget is not).
7. **Campaign media invisible on mobile** — the API returns `media` with resolved URLs; the `Campaign` model never parses it.

Everything else (navigation, l10n, eligibility, survey, activity, consent panel, Akedly PoW, role separation) is implemented and aligned.

## 2. Repository Identity

| Item | Value |
|---|---|
| Root | `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean` |
| Branch | `master` |
| HEAD | `dcde3cbb883aea1d6331b47ba81619250cda9729` |
| Origin | `https://github.com/islamelbaz2010/Tajribti.git` |
| Ahead of `origin/benchmark-current` | 6 commits |
| Worktree | clean except 3 untracked Founder workbooks (`TAJRIBTI_FOUNDER_DECISION_REVIEW_WORKBOOK*.xlsx`) — untouched |
| AI_BOOTSTRAP | **absent** — no bootstrap file found; existing authority hierarchy used (Benchmark → Founder decisions → source/tests → reports) |

## 3. Governance Sources

| Source | Role |
|---|---|
| `governance/REFERENCE_PRODUCT_BENCHMARK.md` | **Product Truth** — SHA-256 `648d2031…2534a`, verified unchanged |
| `governance/FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md` | Founder decisions (study types) |
| `docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md` | Founder Innovation spec (OFD items) |
| FD-01…FD-18 (this prompt) | Current approved decision set |
| `api/src/**`, `api/prisma/schema.prisma`, `api/test/**` | Implementation evidence |
| `web/app/consumer/index.html` | Released web consumer reference |
| `mobile/consumer/**` | Current mobile evidence |
| `/Users/ahmed/Documents/Projects/samples app/` | **Archive only** — `apps/consumer` (Flutter ancestor), `apps/api`, `apps/dashboard` |

## 4. Product Truth

Benchmark §4 CONSUMER column: `Discover · Campaign · Eligibility · Trial/Redemption · QR/Journey · Survey · Feedback · Post-Trial`. Verified-participation principle (§3): participation tied to authenticated/verified consumer identity where the flow requires it; QR/source attribution operationally visible. §10 hardening list names consumer authentication, OTP/JWT flow, QR lifecycle/date gating — all present in the current API.

## 5. Founder Decisions Applied

| FD | Applied as |
|---|---|
| FD-01/02 | Member = read-only (mobile employee branch is read-only — consistent); Admin = full management (web) |
| FD-03 | Ops ≠ Platform Admin — already API-enforced |
| FD-04 | Company→Ops request workflow — already implemented (study-type/question-change requests) |
| FD-05 | QR/source required — enforced: `qrSourceId`→campaign binding, 400 on foreign source |
| FD-06 | Discover **or** Scan QR converge at Campaign — implemented both paths |
| **FD-07** | **CONFLICT — see §11.** OTP exists but is session-level, not per-campaign |
| FD-08 | Profile = phone + name + consent flags only (research attributes come via eligibility snapshot) |
| FD-09 | Eligibility = demographics + ELIGIBILITY-stage screeners — implemented |
| FD-10 | Public site B2B; consumer journey = app — consistent |
| FD-11 | Public site shows implemented-vs-approved honestly — maintained |
| FD-12/13 | Study profiles exist (D-3); predictive analytics absent by design |
| FD-14 | Media = platform-managed storage contract (S3-compatible); mobile doesn't render media yet |
| FD-15/16 | No deploy, no B-04 — honored |
| FD-17 | Happy path = the implemented route structure |
| FD-18 | Reuse = already executed in the recovery pass; this spec verifies what remains |

## 6. Benchmark Consumer Journey — mapped

| Step | Benchmark requirement | Current API | Current mobile | Gap |
|---|---|---|---|---|
| Discover | Active in-window campaigns | `GET /consumer/campaigns` (+participated exclusion for authed) | `home_screen.dart` list + poll + pull-refresh | none |
| Campaign | Campaign detail | `GET /consumer/campaigns/:id` (ACTIVE only; ELIGIBILITY questions + media) | `campaign_screen.dart` (coming-soon/ended/not-active states) | `media` returned but never rendered |
| Eligibility | Demographics + screeners | `POST …/eligibility` — server-decided, transactional | `eligibility_screen.dart` + `eligibility_form.dart` | resume gap (§16) |
| Trial/Redemption | Redemption state transition | `POST …/redeem` (ELIGIBLE→TRIAL_REDEEMED) | called inline after eligibility | none |
| QR/Journey | Source attribution | `GET /consumer/qr/:code` (window + ACTIVE gates, 410) | `scanner_screen.dart` (discover + verify modes) | no OS deep link |
| Survey | POST_TRIAL feedback | `GET/POST …/survey` (TRIAL_REDEEMED-gated, atomic) | `survey_screen.dart` (4 question types, stepper) | none |
| History | Post-trial activity | `GET /consumer/participations` | `activity_screen.dart` + home preview | none |
| Profile/consent | identity + consent | `GET/PATCH /profile`, `/panel/opt-*` | `profile_screen.dart` | push toggle → dead endpoint |
| OTP | verified identity | challenge/request/verify (Akedly-conditional) | `phone/otp_screen` + `akedly_pow.dart` | per-campaign OTP absent (FD-07) |

## 7. Current Mobile Implementation Audit

| Area | Status | Evidence |
|---|---|---|
| Navigation (go_router, 15 routes) | IMPLEMENTED | `app.dart` |
| Splash → Home | IMPLEMENTED | `splash_screen.dart` |
| Discover + auto-refresh (30s poll, lifecycle-aware) | IMPLEMENTED | `home_screen.dart:30` |
| Campaign detail + lifecycle states (coming soon / ended / inactive / completed) | IMPLEMENTED | `campaign_screen.dart` |
| QR scanner (discovery mode + verify mode) | IMPLEMENTED | `scanner_screen.dart` — `mobile_scanner` |
| QR URL + bare-code parsing | IMPLEMENTED | `scanner_screen.dart:45` |
| Phone entry (+20 prefill, local phone cache) | IMPLEMENTED | `phone_screen.dart` |
| OTP (6-digit boxes, 60s resend, auto-verify) | IMPLEMENTED | `otp_screen.dart` |
| Akedly Shield PoW (client-solved, proxy-fetched) | IMPLEMENTED | `akedly_pow.dart`, `otp_screen.dart:53` |
| Turnstile | **MISSING** — fails into retryable error if pipeline requires it | `otp_screen.dart:59` comment |
| Eligibility collection (demographics + screeners) | IMPLEMENTED | `eligibility_screen.dart`, `eligibility_form.dart`, widget-tested |
| Trial redemption | IMPLEMENTED (inline after ELIGIBLE) | `eligibility_screen.dart:86` |
| Survey stepper (4 types, required gating) | IMPLEMENTED | `survey_screen.dart` |
| Completion/thank-you | IMPLEMENTED | `thank_you_screen.dart` |
| History/Activity | IMPLEMENTED | `activity_screen.dart` |
| Profile + panel consent | IMPLEMENTED | `profile_screen.dart` |
| **Push opt-in toggle** | **CONFLICTING** — calls endpoints removed by Founder decision | `profile_screen.dart:349`, `api_client.dart:175` |
| **Rewards/points copy** | **CONFLICTING** — "Earn reward points" rendered in Home hero strip + Services step 4 + alreadyParticipatedSub | `l10n.dart:88,96,205,302` |
| Settings (language, support mailto/tel, sign-out, employee entry) | IMPLEMENTED | `settings_screen.dart` |
| Employee mobile branch (login/home/live detail, read-only) | IMPLEMENTED | `screens/employee/*`, `employee_api_client.dart` |
| Bilingual AR/EN + RTL | IMPLEMENTED (181 string pairs, `LangProvider`) | `l10n.dart` |
| Local persistence | IMPLEMENTED (SharedPreferences: token, identity, lang) | `auth_service.dart`, `session.dart` |
| Deep links / universal links | **MISSING** | no intent-filter/app-link config |
| Campaign media rendering | **MISSING** | `models.dart` never parses `media` |
| Offline behavior | TECHNICAL ONLY — silent-fail polling, error/retry states; no queue | `home_screen.dart:91` |
| Tests | PARTIAL — 2 test files (smoke + eligibility form); **cannot run here** (Flutter SDK requires macOS ≥14, host is 13) | `test/` |

## 8. Current API Contract Audit

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/consumer/auth/otp/challenge` | GET | none | rate-limited 30/5min; uniform `{challengeRequired:false}` without provider |
| `/consumer/auth/otp/request` | POST | none | 1/min per phone; dev returns `devOnlyCode`; prod fail-closed 503 without Akedly |
| `/consumer/auth/otp/verify` | POST | none | 10/5min per phone; 4–6 digit; issues session JWT (no refresh) |
| `/consumer/campaigns` | GET | optional | ACTIVE + in-window; authed ⇒ excludes any participation |
| `/consumer/campaigns/:id` | GET | none | 404 unless ACTIVE; embeds ELIGIBILITY questions + resolved media |
| `/consumer/qr/:code` | GET | none | 404 unknown; 410 outside source window or non-ACTIVE campaign |
| `/consumer/campaigns/:id/eligibility` | POST | consumer | creates Participation atomically; 409 duplicate; 400 foreign source/question; server decides eligible |
| `/consumer/campaigns/:id/redeem` | POST | consumer | ELIGIBLE→TRIAL_REDEEMED only; 403 INELIGIBLE; 409 wrong state |
| `/consumer/campaigns/:id/survey` | GET/POST | consumer | TRIAL_REDEEMED only; POST_TRIAL binding enforced; atomic submit → SURVEY_COMPLETE |
| `/consumer/participations` | GET | consumer | history w/ campaign name+status |
| `/consumer/profile` | GET/PATCH | consumer | phone/name/consent flags |
| `/consumer/panel/opt-*` | POST | consumer | panel consent |
| `/consumer/push/opt-*` | — | — | **REMOVED** (Founder decision) — mobile still calls it |

**FD-07 verdict:** backend has **no per-campaign OTP**. OTP is account-level (once → JWT). Every campaign *does* require an authenticated (OTP-verified) identity — if FD-07 means that, it's satisfied; if it means a fresh OTP per campaign entry, that is **GAP — IMPLEMENTATION REQUIRED** and needs a Founder re-read plus a backend contract.

## 9. Samples App Forensic Comparison

`samples app/apps/consumer` is the direct ancestor of `mobile/consumer` — same architecture (dio, go_router, shared_preferences, l10n AppStr pattern, same screen names). The current app already absorbed the reusable structure during the recovery pass.

| Old source | What it does | Classification | Rationale |
|---|---|---|---|
| `app.dart` route table + shell | GoRouter structure | REUSED (already) | current table is the evolved version |
| `l10n.dart` (AppStr/LangProvider pattern) | AR/EN + RTL | REUSED (already) | same architecture, strings updated |
| `scanner_screen.dart` | camera scan + overlay | REUSE WITH MODIFICATION (done) | same pattern; now parses `?qr=` URL + bare code, verify mode added |
| widgets (`star_rating`, `scale_input`, `choice_chip_group`) | survey inputs | REUSED (already) | remapped to current question-type enum |
| `auth_choice/login/signup` screens | email/password accounts | **DO NOT REUSE** | no account layer in current backend — already removed |
| `akedly_shield` git package | Shield SDK | RESEARCH ONLY | current app uses hand-rolled PoW matching the proxy contract; SDK is optional Founder decision |
| refresh-token flow | session renewal | DO NOT REUSE | no refresh endpoint exists |
| `/qr/enter`, `/qr/redeem`, `pointsEarned` | QR mechanics + rewards | DO NOT REUSE | current contract differs; **rewards is rejected legacy** |
| `/campaigns/demo/active` | demo mode | **DO NOT REUSE** | rejected feature — must stay absent |
| rewards UI (`rewardPoints`, wallet-ish strings) | points display | **DO NOT REUSE** — yet residue remains in l10n strings (defect, §7) |
| employee screens | company employee view | REUSED (already) | read-only, consistent with FD-01 |

## 10. Final Proposed Consumer Journey

The implemented structure already matches FD-06/FD-17 — keep it:

```
PHASE 1  OPEN/AUTH    Splash → Home (anonymous browse OK; auth deferred to first action)
PHASE 2  DISCOVER     Home: active campaigns + scanner shortcut + activity preview
PHASE 3  CAMPAIGN     Detail: states (active/coming-soon/ended/inactive/completed)
PHASE 4  QR           Scan-to-verify (or scan-to-discover shortcut)
PHASE 5  OTP          Phone → challenge → code → JWT (per FD-07 decision)
PHASE 6  ELIGIBILITY  Demographics + screeners → server decides
PHASE 7  TRIAL        ELIGIBLE → redeem → TRIAL_REDEEMED
PHASE 8  SURVEY       Stepper over POST_TRIAL questions → SURVEY_COMPLETE
PHASE 9  COMPLETION   Thank-you → Home/Activity
PHASE 10 HISTORY      Activity + excluded-from-Discover
PHASE 11 PROFILE      identity + consent (panel only; push removed)
PHASE 12 SETTINGS     language, support, sign-out, employee entry
```

Recommended deviations from current build: remove push toggle; strip rewards copy; add partial-participation resume (TRIAL_REDEEMED → straight to survey); render campaign media; optional deep links.

## 11. QR Flow (proposed lifecycle)

`scan → parse (?qr= or bare code) → GET /consumer/qr/:code → 404 invalid / 410 expired-or-inactive / 200 {campaignId, sourceId, label} → JourneySession.start(campaignId, sourceId) → Campaign → verify-scan (verify mode binds to campaign) → OTP → eligibility POST carries qrSourceId → attribution persisted on Participation`.

Server enforces: source↔campaign binding (400), participation uniqueness (409), lifecycle (410/404). Missing: OS-level deep link so a camera-app scan opens the Flutter app instead of web.

## 12. OTP Flow

Phone (+20 prefill, length≥12 client-side) → GET challenge → solve PoW if required → POST request (60s resend; server enforces 1/min) → 6-digit boxes → POST verify → saveSession → continue journey (or /home). **Gaps:** Turnstile unhandled; per-campaign OTP (FD-07) not in backend contract; JWT never expires client-side until a 401 forces re-auth (eligibility screen handles 401 → logout → /phone — good).

## 13. Eligibility / Screening

Implemented per FD-09: form collects age/gender/city + ELIGIBILITY-stage answers (`valueOptions`/`valueText`), submits the exact web contract, server decides. INELIGIBLE → dead-end screen (correct). Duplicate → 409 → "already participated" (see resume gap). Required-screeners-unanswered → server marks INELIGIBLE (participation row persists with INELIGIBLE status — correct evidence behavior).

## 14. Consumer Profile

| Field | Current | Benchmark/FD | Required? |
|---|---|---|---|
| phone | OTP identity | ✓ | required |
| name | optional at verify, PATCH-able | ✓ FD-08 | optional |
| age/gender/city | captured **per-campaign** at eligibility (snapshot cols) | ✓ FD-09 | per-campaign |
| panelOptIn | explicit toggle | ✓ OFD-15A | optional, default off |
| pushOptIn | toggle exists → dead endpoint | **rejected feature** | remove |
| email/preferences/etc. | absent | not authorized | don't add |

## 15. Screen Inventory (final)

| ID | Screen | Status | Notes |
|---|---|---|---|
| S-01 | Splash | implemented | → /home |
| S-02 | Home/Discover | implemented | fix rewards hero step |
| S-03 | Campaign Detail | implemented | +media render gap |
| S-04 | Scanner | implemented | dual mode |
| S-05 | Phone | implemented | |
| S-06 | OTP | implemented | Turnstile gap |
| S-07 | Eligibility | implemented | |
| S-08 | Survey | implemented | |
| S-09 | Thank You | implemented | |
| S-10 | Activity | implemented | |
| S-11 | Profile | implemented | remove push toggle |
| S-12 | Settings | implemented | |
| S-13 | Services | implemented | fix rewards step |
| S-14–16 | Employee login/home/detail | implemented, read-only | consistent w/ FD-01 |
| — | Deep-link handler | **missing** | decision required |

## 16. State Machine

`DISCOVERED → SELECTED → [QR_VERIFIED] → OTP_PENDING → AUTHENTICATED → ELIGIBILITY_SUBMITTED → ELIGIBLE → TRIAL_REDEEMED → SURVEY_COMPLETE` with terminal branches `INELIGIBLE`, `ALREADY_PARTICIPATED` (409), `EXPIRED` (410), `NOT_ACTIVE` (404/410). **Missing transition:** `TRIAL_REDEEMED → SURVEY` on re-entry (resume) — the 409 wall blocks it. `PAUSED`/`COMPLETED` handled by generic not-active states (410/404 from API; distinct UX already exists client-side via status/dates).

## 17. Edge-Case Matrix (key rows)

| Trigger | Current behavior | Verdict |
|---|---|---|
| No campaigns | `_EmptyState` | OK |
| Already participated | badge + completed state; 409 → same | OK |
| Campaign expired/paused | ended / not-active screens; API 410/404 | OK |
| Invalid/mismatch QR | snackbar + resume scan | OK |
| Ineligible | dedicated screen, no survey path | OK |
| OTP fail/timeout/resend | inline error + 60s timer; server throttles | OK |
| Network loss | error states + retry; silent poll retry | OK |
| 401 mid-journey | logout → /phone | OK |
| **Partial participation (redeemed, no survey)** | **dead-end at "already participated"** | **GAP — resume required** |
| **App restart mid-journey** | JourneySession (static) lost → starts over | acceptable, but eligibility 409 then dead-ends → same gap |
| Turnstile-required pipeline | permanent retryable error | GAP |
| Camera-scan QR (not in-app) | opens web app, not Flutter | GAP/decision |

## 18. Arabic/English

Full AR/EN via `AppStr` + `LangProvider` + `Directionality` everywhere (181 pairs); Arabic default, persisted. **Limitation (honest):** dynamic campaign/question content is single-language — the schema has no AR columns (`models.dart:17` documents this). Do not fabricate translations.

## 19. Security/Privacy

Token in SharedPreferences (standard); Bearer on all calls; no secrets on client; PII = phone + eligibility snapshots; consent explicit; QR carries opaque code (no PII); participant PII is Platform-Admin-only server-side. Residual: no cert-pinning/root checks (not required by governance); OTP `devOnlyCode` is dev-only (fail-closed in prod).

## 20. Implementation Gaps (consolidated)

| # | Gap | Type |
|---|---|---|
| G-M1 | Push opt-in toggle calls removed endpoints | defect — remove |
| G-M2 | Rewards copy in l10n (hero step, services step 4, alreadyParticipatedSub) | defect — remove |
| G-M3 | No resume path for TRIAL_REDEEMED/ELIGIBLE partial participation | gap — client route fix (server already permits survey fetch) |
| G-M4 | FD-07 per-campaign OTP — not in backend contract | **decision required** |
| G-M5 | Turnstile unsupported on mobile | gap — decision (add widget vs keep PoW-only pipeline) |
| G-M6 | Campaign media never rendered | gap — parse `media`, render resolved URLs |
| G-M7 | No universal/app links for QR URLs | gap — decision |
| G-M8 | Flutter SDK can't run on this host (macOS 13 < 14) — no local build/test verification | infrastructure blocker |

## 21. Recommended Implementation Order

- **A — Foundation:** none needed (exists). Fix G-M1/G-M2 (defect removals) here.
- **B — Auth/OTP:** FD-07 decision → contract; Turnstile decision (G-M5).
- **C — Discovery/Campaign:** media rendering (G-M6).
- **D — Eligibility:** resume-path fix (G-M3) — route 409 by actual participation status.
- **E — QR attribution:** done; optionally deep links (G-M7).
- **F–H — Trial/Survey/History:** done; only resume affects these.
- **I — Profile/Consent/Settings:** push removal is the only work.
- **J — Edge cases/tests:** extend widget tests; add resume + dead-end coverage.
- **K — Android validation:** blocked by host OS (G-M8) — needs a newer macOS or CI device.
- **L — iOS:** later, per existing Founder decision.

## 22. Founder Decisions Still Required

| ID | Question | Options | Impact |
|---|---|---|---|
| D-07a | FD-07 "OTP for every campaign" — session-level auth per campaign (current) or a fresh OTP per campaign entry? | A: keep session-level (done, zero work); B: per-campaign OTP (new contract + UX + rate-limit design) | B changes backend + both clients |
| D-M5 | Turnstile on mobile: add a Turnstile widget, or keep the production pipeline PoW-only? | A: PoW-only pipeline policy; B: embed webview-based Turnstile | B adds dependency + privacy surface |
| D-M7 | Universal/app links so camera scans open the app? | A: web fallback acceptable now; B: configure Android App Links (+iOS later) | B needs verified domain + manifest work |
| D-M3 | Partial participation resume: reopen TRIAL_REDEEMED to survey? (Recommend YES — evidence is otherwise stranded) | A: resume; B: current dead-end | A is a small client fix, no backend change |

## 23. STOP / GO

**GO for implementation planning with conditions** — the app is ~90% aligned already; the real work is 2 defect removals, 1 resume fix, media rendering, and 4 Founder decisions. No rebuild.

---

*No code changed. No push. No deploy. Benchmark unchanged.*
