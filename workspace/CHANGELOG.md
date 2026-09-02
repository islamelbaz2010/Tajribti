# Changelog — Tajribti Knowledge Workspace

**Format:** Reverse-chronological (newest first). Log every meaningful file creation, edit, reorganization, or correction.  
**Rule:** Every workspace session that creates or edits files must add at least one entry here before closing.  
**Versioning:** Workspace versions track major structural changes, not every file edit.

---

## 2026-09-02 — Reference Product Benchmark registered

### Change
Created `workspace/03_Research/REFERENCE_PRODUCT_BENCHMARK.md` as the active product-reference benchmark for implementation alignment.

The benchmark preserves current first-party evidence from Samplia, Sampl, Zamplit and ExpertVoice and translates recurring product patterns into a TAJRIBTI-specific benchmark without authorizing blind feature copying.

Registered the new benchmark in `workspace/00_Source_of_Truth/SOURCE_OF_TRUTH.md` as the authoritative source for the **current product reference benchmark** domain. It supplements, and does not override, the FDD, Master PRD, Technical Architecture or other higher-authority project documents.

### Why
The project needs a permanent repository-level reference for the target product shape so future implementation sessions do not reconstruct the benchmark from chat history. This is intended to prevent further drift toward a simple dashboard/survey product and keep implementation focused on the complete campaign → consumer data → live measurement → insight → decision workflow.

### Source evidence
First-party sources reviewed 2026-09-02:
- Samplia: https://samplia.com/en and related official service/feedback/legal pages
- Sampl: https://www.sampltech.com/measurement-insight and https://www.sampltech.com/solutions/measure-success
- Zamplit: https://zamplit.com/platform/ , https://zamplit.com/how-it-works/ , https://zamplit.com/market-research/ , https://zamplit.com/product-launch-testing/
- ExpertVoice: https://resourcehub.expertvoice.com/hc/en-us/articles/5004150658450-Product-sampling-campaigns-on-ExpertVoice

---

## Workspace Version History

| Version | Date | Summary |
|---|---|---|
| v6.10 | 2026-08-23 | V0.5 current-state correction: restored My Activity campaign navigation; CI Run #12 passed; device and multi-campaign validation blocked by authenticated APK artifact access and no campaign-creation UI |
| v6.8 | 2026-08-23 | Product Semantics Fix: JWT refresh endpoint added; alreadyCompleted flag; 409→Already-Submitted; home filters participated; 9 files, commit c734d39 |
| v6.7 | 2026-08-23 | Auth + Survey fixes: 401 expired-JWT → re-auth; 409 duplicate-survey → ThankYou; rewardPoints mapping fixed; 3 Flutter files, pending commit |
| v6.6 | 2026-08-23 | Session I — Product Completion V0.5: CONFLICT-D resolved (DL-050); BD-13 bounded exception (DL-051); Discovery-First consumer product built; 980 insertions across 17 files; commit 0ae48d1; CI triggered |
| v6.5 | 2026-08-19 | Session G — Assessment Preparation: Chat Context Extraction (2026-08-18 snapshot) + Decision Reconciliation; 4 conflicts, 2 unformalized management changes, 3 material uncommitted deltas documented; no code changes |
| v6.4 | 2026-08-18 | Session F — OTP Flow Fix: root cause proven (Flutter null-cast on challengeRequired=false); two-file fix implemented and TypeScript-verified; implementation report produced |
| v6.3 | 2026-08-17 | Session 5b — Akedly V1.2 Hardening & Acceptance Pass: DEFECT-01 fixed (DEMO_MODE path); formal acceptance report produced; verdict B |
| v6.2 | 2026-08-17 | Session 5 — Akedly V1.2 Migration: wrong Utilities product replaced with V1.2 REST Authentication; Shield SDK PoW; server-side identity binding; Egypt/SMS delivery documented |
| v6.1 | 2026-08-17 | Session 4 — Real Pilot Validation: 2 critical bugs found and fixed; ML Kit ProGuard fix device-confirmed; enterCampaignWeb DEMO bug fixed and deployed; Akedly OTP external blocker documented |
| v6.0 | 2026-08-17 | Session 3 — Full analysis sprint: Chat Context Extraction, Decision Reconciliation, Product Version Audit v2, Management Situation Analysis v2, Portfolio Assessment (analysis-only; no product code) |
| v5.0 | 2026-08-14 | Session 2 — Bilingual AR/EN Flutter consumer app + Arabic Intelligence Report mode committed (9cd1fc2) |
| v4.9 | 2026-08-14 | Session 1 — Flutter consumer app pilot-complete + client report upgraded committed (b8b461b) |
| v4.8 | 2026-08-13 | Real Pilot MVP — mobile web consumer journey committed (ed72a20); project state updated to Pilot Deployment phase |
| v4.7 | 2026-08-13 | First Target Account List created — Top 3 with decision-makers, triggers, outreach messages, demo commands (06_First_Target_Account_List.md) |
| v4.6 | 2026-08-13 | Demo Script LOCKED — 3 commercial-safety corrections applied; demo verified PASS; commercial demo FROZEN |
| v4.5 | 2026-08-13 | Demo Presentation Script created — screen-by-screen brand meeting guide (05_Demo_Presentation_Script.md); demo verified PASS (canonical + personalized) |
| v4.4 | 2026-08-13 | MEOS v1 Commercial Demo — built, verified PASS, locked (commit 0209b9a); bootstrap updated to Commercial Execution phase |
| v4.3 | 2026-07-27 | Track 0 Commercial Execution — GTM Blueprint v1.0 produced and written to workspace |
| v4.2 | 2026-07-27 | Repository Intelligence & Evidence Audit — 6-file audit deliverable written to docs/audit/ |
| v4.1 | 2026-07-27 | Bootstrap Certification — 5 new files added; conflicts documented; FROZEN at score 98/100 |
| v4.0 | 2026-07-27 | AI Bootstrap Layer — 16-file purpose-built AI onboarding folder (AI_BOOTSTRAP/) |
| v3.0 | 2026-07-27 | Long-term development governance layer added (9 new files) |
| v2.0 | 2026-07-27 | Enterprise Knowledge Architect audit + 26 improvements applied |
| v1.0 | 2026-07-26 | Initial workspace built from 14 inbox source files (14-phase build) |

---

## [v6.8] — 2026-08-23 — Product Semantics Fix: Reward Lifecycle + Auth Persistence + Campaign State (9 files)

### Session type

Full product-level fix based on Founder device testing. Audit → design → implementation → commit in single session.

### Root Causes Fixed

| # | Root Cause | Fix |
|---|---|---|
| RC-1 | No `/auth/refresh` endpoint existed; 15m access token expiry forced OTP re-auth | Added `POST /auth/refresh` (backend); Dio interceptor silently retries with refresh token (Flutter) |
| RC-2 | `enterCampaignWeb` returned existing redemption without checking `survey_response` existence; no way for frontend to know campaign was already completed | Added `relations: ['surveyResponse']` + `alreadyCompleted` flag to API response |
| RC-3 | 409 handler in `survey_screen` navigated to ThankYou showing "+50 points" — false reward implication | 409 now shows "Already Submitted" inline state; ThankYou navigation removed from 409 path |
| RC-4 | Home screen showed ALL active campaigns regardless of consumer participation state | `home_screen` now computes `participatedIds` from `profile.recentCampaigns` and filters `availableCampaigns` |

### Files Changed (9)

**Backend (3):**
- `apps/api/src/modules/auth/auth.controller.ts` — `POST /auth/refresh` endpoint (@Public)
- `apps/api/src/modules/auth/auth.service.ts` — `refresh()` method: verifies JWT_REFRESH_SECRET, checks consumer exists, issues new token pair
- `apps/api/src/modules/qr/qr.service.ts` — `enterCampaignWeb`: loads `surveyResponse` relation; returns `alreadyCompleted: !!existingRedemption.surveyResponse`

**Flutter (6):**
- `apps/consumer/lib/core/api_client.dart` — `onError` interceptor: 401 → try POST /auth/refresh → retry; if refresh fails pass 401 through
- `apps/consumer/lib/core/models.dart` — `RedemptionResult.alreadyCompleted: bool` field
- `apps/consumer/lib/core/l10n.dart` — `alreadyParticipated`, `alreadyParticipatedSub`, `alreadySubmitted`, `alreadySubmittedSub` (AR+EN)
- `apps/consumer/lib/screens/campaign_screen.dart` — `_alreadyCompleted` state; "Already Participated" UI on `alreadyCompleted: true`; 401 comment updated
- `apps/consumer/lib/screens/survey_screen.dart` — `_alreadySubmitted` state; 409 now shows "Already Submitted" inline state; ThankYou navigation removed from 409 path
- `apps/consumer/lib/screens/home_screen.dart` — `Builder` wrapper; `participatedIds` filter; `availableCampaigns` excludes participated campaigns

### Commit

`c734d39` — pushed to `sprint/pilot-readiness-mvp` — CI Run #11 triggered

### Test Scenarios Required

| Scenario | Expected |
|---|---|
| First participation (new phone or fresh data) | Splash → Home → Campaign → Phone → OTP → Survey → ThankYou(+50) → Home(50pts) |
| Duplicate participation (same phone, same campaign) | Campaign → Campaign screen → "Already Participated" — NO ThankYou, NO reward implication |
| Different campaign (second campaign, same phone) | Available on Home (not filtered); can participate; earns own reward |
| Access token expired (15m after last OTP) | Silent refresh via interceptor; flow continues without OTP prompt |

### ...
