# Changelog — Tajribti Knowledge Workspace

**Format:** Reverse-chronological (newest first). Log every meaningful file creation, edit, reorganization, or correction.  
**Rule:** Every workspace session that creates or edits files must add at least one entry here before closing.  
**Versioning:** Workspace versions track major structural changes, not every file edit.

---

## Workspace Version History

| Version | Date | Summary |
|---|---|---|
| v6.39 | 2026-09-01 | Company Foundation (DL-069): extended the product toward real Companies with structured identity/contacts/sector/campaign relationships, additive-only. Confirmed `BrandAccount` already the right shape for "Company" — no new identity entity. Added nullable `sector` enum (`fmcg`/`beauty_personal_care`/`pharma_otc`, sourced only from locked DL-003/DL-007) and a new `brand_contacts` table (record, not an account — no password/login) via additive migration `1788100000000-AddCompanyFoundation` (not yet run against production, pending Founder action, same as the still-outstanding archive migration). `Campaign` gained an ownership-validated, nullable `contactId` (`ON DELETE SET NULL`). Admin: brand listing/edit + full contact CRUD, same `x-admin-secret` gate. New self-service `CompanyModule` (`GET /company/me`, contact CRUD, `GET /company/sector-framework`) scoped to the authenticated brand exactly like every other brand-owned resource. Sector → recommended-questions framework (2 product-authored questions per sector, namespaced ids that can't collide with core `q1`-`q5`) surfaced as an opt-in panel in `CreateCampaign.tsx` feeding the existing Survey Builder V2 `SurveyEditor` — never silently applied. Campaign Contact selector added to Create/Edit; new `CompanyProfile.tsx` page (`/company`) for identity + self-service contact management. Report cover extended with Company logo + sector (graceful null fallback), no pagination/data-calculation logic touched. Confirmed already satisfied and left alone: date pickers (already native `<input type="date">`), Campaign Gallery (already auto-associated per-campaign). No Consumer Mobile changes — none of this data is consumer-facing. Runtime-verified end-to-end locally including full cross-Company isolation (a second test Company can't see or attach the first Company's contacts). `tsc`/`nest build`/`CI=true npm run build` all clean. |
| v6.38 | 2026-09-01 | Campaign Details identity + campaign scheduling + Coming Soon (DL-068): (1) six Company Console pages (CampaignDetail/Insights/SurveyResults/AiSummary/Participants/Report) fixed a Founder-reported bug — Campaign Details showed a fixed first campaign regardless of URL — root cause was a `useEffect` with an empty dependency array on routes that don't remount on a query-string-only change; fixed to track `location.search`, matching the pattern Overview.tsx/Gallery.tsx already had. (2) startDate is now editable (was excluded on a defensive, not Founder-locked, assumption that turned out not to be load-bearing); `validateDateRange()` rejects endDate before startDate on create/update. (3) "Coming Soon": new `isCampaignOpenForParticipation()` (status=active AND startDate<=today) is now the single gate every participation entry point (QR redeem, web entry, Campaign OTP) checks, replacing status-only checks — a Company can schedule a future campaign that's publicly discoverable but not yet enterable. Consumer Mobile: Campaign model gained startDate/endDate + isComingSoon; Home card shows a "Coming Soon" badge + start date; Campaign Detail gates Start Trial entirely with a dedicated Coming Soon screen. CI build (Run #46) succeeded on first try; installed on device and visually confirmed both the Home card and Campaign Detail Coming Soon states, plus that the real active campaign is unaffected. One known deviation: a throwaway production consumer was created to obtain a JWT for a rejection-path test — not strictly necessary, flagged rather than hidden. `tsc`/build clean; deployed to Railway, Vercel, and the CI-built APK. |
| v6.37 | 2026-09-01 | Survey Builder ordering fix (DL-067): Founder-reported bug — a custom question couldn't move past a core question — root-caused to three places conflating "core" with "first 5 array positions" instead of a reserved-id identity (`campaign.service.ts` guard, `analytics.service.ts` custom-question slice, `SurveyEditor.tsx` move handler + disabled state). Since analytics reads answers by question id (never array position), a core question's position was always safe to move. Fixed all three to use identity (`{q1..q5}`) instead of position — custom questions can now reorder to any position including ahead of every core question. No migration, no historical-data risk (id-keyed, not position-keyed). Verified locally and in production using the Founder's own already-present test question on the campaign the bug came from: confirmed the old failure (400) before deploying, confirmed success (200) after, with the campaign's real historical survey data unchanged throughout. Regression-checked across all 3 production campaigns. `tsc`/build clean; deployed to Railway and Vercel. |
| v6.36 | 2026-09-01 | Survey Builder V2 + Report cover polish (DL-066): the first 5 "core" survey questions stay id/type/order-immutable (wording/options still editable, unchanged from DL-062) since analytics reads their answers by fixed key; questions beyond that are now free to add/remove/reorder/retype (DTO cap raised 5→10). `analytics.service.ts` generalizes to a `customQuestions` result per added question (breakdown/average/verbatims by type) — existing q2/q3/q5 logic untouched, zero regression risk. New shared `SurveyEditor.tsx` component replaces duplicate inline editors in Create/Edit; `SurveyResults.tsx` renders the new custom-question results. Report cover chips: emoji → small-caps labels (no pagination/data logic touched; content re-reviewed and judged already strong). Mobile compatibility confirmed by source (`survey_screen.dart` computes everything from `questions.length`) — zero Mobile code change. Runtime-verified locally and in production (rejection-path only, zero mutation; existing real campaign's data confirmed unchanged). `tsc`/build clean; deployed to both Railway and Vercel. |
| v6.35 | 2026-09-01 | End-to-end pilot loop — device verified, no code change (DL-065): full Company→Campaign→Survey→API→Consumer Mobile→Participation→Survey→API→Insights→Report run on device `TKINR8IJ5D9DSKQK` using the existing installed APK (zero rebuilds/reinstalls). Created one distinctively-labeled production campaign with a custom survey (Q3 options Alpha/Beta/Gamma/Delta/Epsilon, non-default) — DEVICE VERIFIED it appeared automatically in Available Offers and Campaign Detail showed correctly; QR camera-scan handed off as one manual Founder step (environmental limitation, not automatable from this shell); after Founder completion, independently re-verified server-side: exactly 1 redemption/1 survey response, Survey Results' q3 breakdown showed "Delta" (proving exact survey fidelity end-to-end), Demographics/AI Insights/Report all consistent with the same real data, AI narrative correctly hedged on small sample size. Campaign set back to draft afterward. |
| v6.34 | 2026-09-01 | End-to-end product coherence audit (DL-064) — NO CODE CHANGE JUSTIFIED. Traced the full Company→Campaign→API→Consumer Mobile→Consumer→Survey→API→Console→Report loop from source plus fresh empirical evidence: Campaign→Mobile field/survey propagation confirmed correct in `models.dart`/`survey_screen.dart`; lifecycle-gated participation and campaign-OTP identity isolation confirmed in `qr.service.ts`; survey submission ownership/duplicate-protection confirmed in `survey.service.ts`; a freshly-run local test confirmed a second brand gets 403 across all 7 owned-data endpoints (analytics ×4, report ×2, media) for a campaign it doesn't own; Report.tsx/report.service.ts deep-read against a 13-section target IA and found already covering nearly all of it with explicit insufficient-data guards and no overclaiming. No Consumer Mobile device test performed — no code changed, every hop verified from source/API/local-runtime evidence. Conclusion: the product loop already works end-to-end as designed; no further changes justified this pass. |
| v6.33 | 2026-09-01 | Company Console visual/UX maturation, phase 2 (DL-063), no API changes: audited against Founder-supplied production screenshots; found the "admin-dashboard" feeling traced mainly to zero-data handling, not the visual system. Added purposeful empty states to Participants/Demographics/Survey Results/AI Insights (were rendering genuinely empty tables/charts/score cards); fixed SurveyResults' verbatims copy hardcoded to say "demo scenario" even for real campaigns; Overview's hardcoded "LIVE" badge replaced with the campaign's real status, and a "Go Deeper" (Survey Results/AI Insights/Report) section added at the bottom so Overview ends in navigation into the value layer instead of a metrics wall. Report.tsx reviewed, not touched — already mature, no proven deficiency. `tsc`/build clean; deployed via `vercel --prod`, all 10 routes verified reachable post-deploy. |
| v6.32 | 2026-09-01 | Company Console product transformation (DL-062): implemented the IA proposed in DL-061 — nav regrouped into CAMPAIGN (Campaigns/Details & QR/Media) and CONSUMER INSIGHTS (Overview/Participants/Demographics/Survey Results/AI Insights/Report), all existing routes preserved; sidebar shows a persistent "Working on [campaign]" context; renamed inherited MEOS-demo page titles throughout. Added Campaign-Specific Survey Configuration: `UpdateCampaignDto`/`CampaignDetail.tsx` now let a Company reword its own campaign's survey questions/options after creation (wording only — a new server-side guard rejects any change to question count/order/id/type, since analytics reads answers by fixed key). Runtime-verified locally and in production (rejection-path only, no mutation) that the new guard is live; the real campaign's data confirmed unchanged afterward. `tsc`/build clean; deployed — Railway auto-deployed the API, Dashboard deployed via `vercel --prod` to the renamed `tajribti` project, all routes verified reachable post-deploy. |
| v6.31 | 2026-09-01 | Company Console reconciliation (DL-061): audited every Dashboard route against actual API calls — all real, none dead; identified the Founder's "still looks like the old product" observation as the original MEOS-demo 7-screen IA/naming carried forward unredesigned, a presentational finding not a code defect. Verified Company Console → Railway → Consumer Mobile data flow end-to-end in production: created one clearly-labeled test campaign via the existing demo brand, confirmed every field (image, description, location, reward) round-trips correctly through the exact endpoints Consumer Mobile calls, then set it to `draft` (kept, not deleted). Confirmed via `apps/consumer/lib/core/models.dart` which Campaign fields Consumer Mobile actually reads (`locationAddress`/`targetCount`/`startDate`/`endDate` are stored but unused, not a defect). Renamed the Vercel project `dashboard` → `tajribti` (same project ID, no new project); verified the production alias is a separately pinned object and stayed live through the rename. No Dashboard/API code changed this pass — corrected IA proposed in the session report, not implemented. |
| v6.30 | 2026-09-01 | Pilot go-live pass (DL-060): confirmed DL-058/059 code already live in production — Railway auto-deployed `4a7a77d`/`d42abb4` on push (verified `POST /admin/brands` responds correctly to production, no account created; existing `GET /campaigns`/`POST /auth/brand/login` healthy, demo campaign unchanged); deployed `apps/dashboard` to the existing Vercel `dashboard` project via `vercel --prod` (aliased to the existing production URL, reachability-verified). Archive migration attempt via `railway connect postgres` was blocked by the harness's own permission classifier before any DB connection was made — not retried or routed around, left as a Founder action. Real second-Brand provisioning deliberately not performed — no Founder-approved Brand identity/credentials exist in the workspace to use, and inventing one for production was out of scope. No code changed this pass. |
| v6.29 | 2026-09-01 | Controlled Brand provisioning under DL-059 (Pilot Operations Closure): audited existing admin architecture (`AdminController`/`AdminService`, `x-admin-secret` gate already configured in Railway production) and added `POST /admin/brands` (`CreateBrandAccountDto`) reusing that exact mechanism and `seedDemo()`'s existing bcrypt `BrandAccount` creation shape — no new auth system, no public signup route. Response never includes the password. Runtime-verified end-to-end on the local, non-production `tajribti_demo` DB (started API on port 3010 to avoid an unrelated process already on 3000; test rows deleted afterward): unauthenticated → 401, wrong secret → 401, valid → 201, duplicate email → 409, weak password → 400; the provisioned brand then logged in, created a campaign with a product image, and archived it; a second provisioned brand got 403 attempting to edit the first brand's campaign and an empty `/campaigns/my`. `tsc --noEmit` + `nest build` clean. No dashboard/consumer/MEOS/deployment changes. |
| v6.28 | 2026-09-01 | Campaign Management completion under DL-058 (DL-055 item 1 pattern): added `apps/dashboard/src/pages/Campaigns.tsx` (campaign list/grid entry point at `/campaigns`, wired into `App.tsx` and `Layout.tsx` nav as "Campaign Management"); added Product Image URL field to `CreateCampaign.tsx` and to `CampaignDetail.tsx`'s manage form (with Location Name/Address); added `CampaignStatus.ARCHIVED` + additive migration `1788000000000-AddArchivedCampaignStatus` (not yet run against production) as the soft-delete/archive mechanism (no hard-delete exists or was added); confirm-before-save on lifecycle-ending status changes and confirm-before-remove on Gallery media. `tsc --noEmit` + `CI=true npm run build` clean on `apps/api` and `apps/dashboard`. Full campaign-management source audit found create/edit/status-lifecycle/QR/ownership/Media-Gallery already implemented under prior DL-055 work; brand self-service onboarding/signup confirmed still absent (no endpoint beyond demo seed) and intentionally not built — Founder decision required, documented as open in `DECISION_LOG.md` DL-058. No consumer/Flutter, MEOS, or Vercel/Railway deployment changes; migration not run against production DB. |
| v6.27 | 2026-08-27 | Safe runtime dry-run closeout: executed the existing, unmodified `scripts/demo.sh` orchestration end-to-end against the local isolated `tajribti_demo` Postgres database (confirmed separate from the Railway production database and from MEOS's frozen branch); verify-env 15/15, backend+dashboard start, reset/reseed, brand-dashboard client path, and clean shutdown all PASS; zero Railway/MEOS interaction; evidence at `16_Reports/SAFE_RUNTIME_DRY_RUN_2026-08-27.md`. Client-ready gate now 5/5 MET (Flutter-first path, safe runtime, report-quality/D-028, identifiable artifact, known limitations); `02_PROJECT_STATE.md`/`04_CURRENT_OBJECTIVE.md`/`05_CURRENT_PHASE.md`/`14_CONTEXT_INDEX.md` updated to reflect this and that customer outreach is now AUTHORIZED per the existing conditional rule (not sent — Edita/Rimon Sami target remains READY / NOT SENT). No product/API/dashboard/consumer source code changed; no D-028/Mobile/B-01–B-04/DL-055/Website work; no MEOS mutation; no outreach sent. |
| v6.26 | 2026-08-24 | Session close — DL-052 concluded (all 4 items) + DL-054 bounded increment executed: `CampaignDetail.tsx` real-campaign DEMO-mislabel fixed; campaign history surfaced and made navigable across all dashboard pages via `?campaignId=` (`endpoints.ts`, `Layout.tsx`, 7 pages); a cross-brand campaign-identity disclosure found in that same work fixed before push; Report.tsx extended with a Research Objective section and Campaign Period (both from existing data, no fabrication). Pre-push consolidation review passed clean — READY FOR PUSH — but push not executed (5 commits `1e0c9d1`..`dccd79c` remain local-only on top of pushed `df9baa3`). DL-052/DL-054/DL-053 all recorded in `DECISION_LOG.md` Phase 5–6, `FOUNDER_DECISIONS.md`, `OPEN_DECISIONS_TRACKER.md`. `02_PROJECT_STATE.md` updated with a current-session delta block. No API/backend source changed this session's second half; no website/points/rewards/survey-builder/campaign-builder/media-gallery/CRM work. |
| v6.25 | 2026-08-24 | DL-052 bounded engineering exception + DL-053 report remediation: bilingual (EN/AR) AI narrative generation added to `report.service.ts`/`AiReport` entity; Report.tsx recommendation/finding language calibrated to hedge on sample size and stop presenting sample composition as market proof; Audience Profile intro conditioned on `campaign.isDemo`; verbatims minimum-quality gate added to `analytics.service.ts`. Typecheck + build verified clean on `apps/api` and `apps/dashboard`. Consumer app, client-account, and real-pilot items under DL-052 not started this pass — sequenced next. No consumer/Flutter, MEOS, or deployment changes. |
| v6.24 | 2026-08-23 | Vercel redeployment — `apps/dashboard` redeployed to existing `dashboard` project (deploy ID `dpl_9UNY4vGTgtX36pXNozgfecjYN3nW`) from HEAD 9d6b33c; Intelligence Report improvements (b8b461b + 9cd1fc2) now live at `dashboard-six-flame-wsaixia9cm.vercel.app`; `REACT_APP_API_URL` added to Vercel production env pointing to Railway API; D-028 now reviewable (Founder acceptance still required); no product source/DB/backend/MEOS changes |
| v6.23 | 2026-08-23 | DL-048 living-file governance closure — updated `_navigator/DECISION_INDEX.md` and `15_Decisions/DECISION_LOG.md` with PATH C final closure note; all 7 living governance files now consistently reflect DL-048 FULLY VALIDATED; D-028 confirmed as sole remaining commercial-readiness gate (Founder review of Intelligence Report pending); no product/data/deployment/code changes |
| v6.22 | 2026-08-23 | PATH C isolated E2E validation COMPLETE — 16/16 steps PASS; real Akedly OTP (+201118000472); full participation (50 pts, Sprite Zero Sugar); completed-campaign protection ("شاركت سابقاً") confirmed; production Railway campaign unchanged; isolated runtime (PostgreSQL `tajribti_e2e_isolated` + NestJS port 3010) torn down; DL-048 client-ready gate MET; workspace state updated; no production data mutation |
| v6.21 | 2026-08-23 | Retrieved GitHub Actions Run #14 artifact `tajribti-consumer-android-14` through authenticated repository tooling; verified GitHub digest, APK SHA-256, package identity, version metadata, and byte-identical installation on `TKINR8IJ5D9DSKQK`; no E2E, runtime mutation, product, or outreach work performed |
| v6.20 | 2026-08-23 | DL-048 Option B recorded through the established decision process; verified the existing CI Flutter workflow and successful Run #14 for current HEAD, read-only environment checks pass 15/15, but artifact download requires authentication and no isolated runtime is documented; living state updated; no product, V0.5, database, campaign, deployment, MEOS, or outreach work performed |
| v6.19 | 2026-08-23 | Client-ready finalization pass: preserved V0.5 closure, gated outreach on the explicit client-ready prerequisite, clarified the commercial-pack/client-demo distinction in `AI_BOOTSTRAP/14_CONTEXT_INDEX.md`, recorded Flutter-first/D-028/safe-runtime/exact-artifact blockers, and added `16_Reports/TAJRIBTI_CLIENT_READY_FINALIZATION_2026-08-23.md`; no product, data, deployment, APK, CI, MEOS, or outreach work performed |
| v6.18 | 2026-08-23 | Track 0 commercial execution pass: no documented warm agency-client relationship was found, so the documented Edita/Rimon Sami fallback was selected; the existing outreach action was prepared but not sent, one unsupported “first platform” phrase was narrowed, and the execution report was added; no MEOS/product/data/deployment/outreach mutation performed |
| v6.17 | 2026-08-23 | Track 0 commercial-readiness finalization: labeled the Demo Script launcher as reset/reseed and unsafe for shared environments, recorded that no safe non-mutating runtime path is verified, preserved the open Flutter-first and D-028 decisions, and added `16_Reports/TAJRIBTI_TRACK_0_COMMERCIAL_READINESS_FINALIZATION_2026-08-23.md`; no product/data/deployment/MEOS work performed |
| v6.16 | 2026-08-23 | Track 0 commercial-pack reconciliation: removed the unsupported income-segmentation claim from the in-scope Demo Script, qualified LOI raw-response export as scope/technical-confirmation dependent because no CSV endpoint exists, and aligned One-Pager timing to campaign end; no product/data/deployment/MEOS work performed |
| v6.15 | 2026-08-23 | Track 0 commercial execution pass: aligned tracked One-Pager and LOI with supported age/gender/area demographics; preserved the pre-existing untracked demo script; income collection was not added; Flutter demo decision, D-028, and runtime dry run remain open; no product/data/deployment/MEOS work performed |
| v6.14 | 2026-08-23 | Track 0 commercial-readiness audit: corrected Sales Playbook and GTM Stage 1 wording so ≥3 signed LOIs is the commercial criterion feeding formal B-01 and does not itself authorize engineering; narrowed current MEOS status to source-verified with runtime dry run pending; no product, data, deployment, or MEOS work performed |
| v6.13 | 2026-08-23 | Track 0 gate reconciliation: clarified ≥3 signed LOIs as the commercial criterion feeding formal B-01, separated D-028 as non-blocking report/demo quality, and aligned Track 0 exit wording; updated 00/02/04/05 current-state files only; no product, data, deployment, or V0.5 work performed |
| v6.12 | 2026-08-23 | Current-state micro-reconciliation: corrected living CI #11, PostgreSQL/demo-seed, and broad-engineering wording; marked the historical V0.5 report status as superseded; historical reports and Founder decisions preserved; V0.5 remains closed and broad V1 remains gated |
| v6.11 | 2026-08-23 | Governance reconciliation: V0.5 bounded consumer foundation formally recorded as CLOSED after Founder-confirmed completed-campaign device validation; stale current-state claims corrected; broad V1 engineering remains gated; no product source or data changed |
| v6.10 | 2026-08-23 | V0.5 current-state correction: restored My Activity campaign navigation; final CI Run #13 APK retrieved and installed; semantic device tests remain blocked by cleared auth session and no approved multi-campaign creation workflow |
| v6.9 | 2026-08-23 | V0.5 Product Semantics Validation: CI Run #11 PASS; real-device test on TKINR8IJ5D9DSKQK; 8-condition semantics gate PASS; validation report produced |
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
- `apps/consumer/lib/screens/survey_screen.dart` — `_alreadySubmitted` state; "Already Submitted" UI on 409; ThankYou false-reward route removed
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

---

## [v6.7] — 2026-08-23 — Auth + Survey Submission Fixes (3 Flutter files)

### Session type

Bug diagnosis and fix (3 Flutter files, no backend changes). Two confirmed root causes identified and fixed.

### Root Causes

**Bug 1 — "Could not enter campaign"** (`campaign_screen.dart`):
JWT access token expires after 15m (`JWT_ACCESS_EXPIRY=15m` default). `AuthService.isLoggedIn()` only checks key existence, not expiry. Returning consumer with expired JWT calls `enterCampaign()`, receives 401 from `JwtAuthGuard`, sees "Could not enter campaign." Fix: detect 401 in `_start()`, call `AuthService.logout()`, redirect to `/phone`.

**Bug 2 — "Could not send answers"** (`survey_screen.dart`):
`_submit()` caught all exceptions generically. HTTP 409 `ConflictException` (survey already submitted) displayed as error. Fix: detect 409 specifically, navigate to ThankYou (409 = already completed = success state).

**Bug 3 — ThankYou shows 0 points** (`models.dart`):
`RedemptionResult.fromJson` read `json['pointsEarned']` but API returns `rewardPoints`. Fix: fallback chain `pointsEarned ?? rewardPoints ?? 0`.

### Code Changes (pending commit)

| File | Change |
|------|--------|
| `apps/consumer/lib/screens/campaign_screen.dart` | `+import 'package:dio/dio.dart'`; `_start()` detects 401 → `AuthService.logout()` → `/phone` |
| `apps/consumer/lib/screens/survey_screen.dart` | `+import 'package:dio/dio.dart'`; `_submit()` detects 409 → `/thankyou` |
| `apps/consumer/lib/core/models.dart` | `RedemptionResult.fromJson` reads `pointsEarned ?? rewardPoints ?? 0` |

### Status

PENDING: Founder authorization to commit + push → CI build → device validation.

---

## [v6.6] — 2026-08-23 — Session I: Product Completion V0.5 (Discovery-First Consumer Product)

### Session type

Full engineering sprint (code + governance). CONFLICT-D formally resolved, V0.5 authorization recorded, Discovery-First consumer product implemented. 17 files changed, 980 insertions.

### Governance Decisions

| Decision | Status |
|---|---|
| DL-050 — CONFLICT-D RESOLVED: Discovery-First is the target consumer product experience from V0.5 | LOCKED |
| DL-051 — BD-13 BOUNDED EXCEPTION: V0.5 engineering authorized (pilot completion scope only) | LOCKED |

### Code Changes (commit 0ae48d1)

| Layer | Change |
|---|---|
| Backend — `campaign.controller.ts` | `@Public()` on GET /campaigns — consumers browse without auth |
| Backend — `qr.service.ts` | `enterCampaignWeb()` auto-creates QR for discovery-first entry |
| Backend — `auth.service.ts` | `getMe()` returns totalPoints + recentCampaigns (computed from redemptions join) |
| Flutter — `models.dart` | `ConsumerProfile`, `ParticipationRecord` models added |
| Flutter — `api_client.dart` | `getActiveCampaigns()`, `getConsumerProfile()` methods added |
| Flutter — `l10n.dart` | 13 new/updated localization keys (AR + EN) for Home/Discovery |
| Flutter — `home_screen.dart` | Complete real Discovery Home: campaign cards, profile banner, activity history, QR CTA |
| Flutter — `splash_screen.dart` | Routing → `/home` (Discovery-First, DL-050) |
| Flutter — `campaign_screen.dart` | Back button added; error state routes to `/home` |

### Validation

| Check | Result |
|---|---|
| Backend TypeScript | CLEAN |
| Dashboard build | CLEAN |
| Flutter analyze | BLOCKED (macOS 13 / DL-048) |
| CI APK build | TRIGGERED (push to sprint/pilot-readiness-mvp, commit 0ae48d1) |
| Real device | PENDING (waiting for CI APK) |

### Governance Files Updated

- `workspace/15_Decisions/DECISION_LOG.md` — Phase 4 (DL-050, DL-051)
- `workspace/15_Decisions/OPEN_DECISIONS_TRACKER.md` — CONFLICT-D RESOLVED; V0.5 AUTHORIZED
- `workspace/AI_BOOTSTRAP/02_PROJECT_STATE.md` — Phase updated
- `workspace/AI_BOOTSTRAP/14_CONTEXT_INDEX.md` — Session I added
- `workspace/16_Reports/PRODUCT_COMPLETION_V0_5_EXECUTION_REPORT_2026-08-23.md` — This session's final report

### Post-commit patch — Campaign image seed fix (2026-08-23)

Investigation confirmed Android image decode warning was caused by demo campaign `productImage` URL returning `image/svg+xml`. Flutter `Image.network` correctly fires `errorBuilder` on SVG decode failure; the brand gradient fallback renders instead. Flutter image rendering required no change.

| File | Change |
|------|--------|
| `apps/api/src/modules/admin/admin.service.ts:115` | Placeholder URL changed from `…/ffffff?text=Product` → `…/ffffff.png?text=Product`; new URL returns `content-type: image/png` (HTTP 200, 5,763 bytes) |

**Live Railway demo campaign unchanged (intentional):** Campaign `9c370244-...` still contains the old SVG URL in PostgreSQL. Production reset/reseed was NOT executed — it would clear 49 seeded consumers, all survey responses, and QR codes. The existing `POST /admin/seed/reset` + `POST /admin/seed` mechanism is available for a future refresh when demo data can be cleared. No approved real Sprite Zero raster image exists in the repository.

---

## [v6.5] — 2026-08-19 — Session G: Assessment Preparation (Chat Context Extraction + Decision Reconciliation)

### Session type

Analysis only (no code changes, no deployments, no commits). Two workspace reports produced.

### Files Created

| File | Description |
|---|---|
| `workspace/16_Reports/CHAT_CONTEXT_EXTRACTION_2026-08-19.md` | Chat Context Extraction from PROJECT_CHAT_SNAPSHOT_2026-08-18.md (8,070 lines); new content covers Sessions 4, 5, 5b, F, and real-device E2E confirmation |
| `workspace/16_Reports/ASSESSMENT_PREPARATION_DECISION_RECONCILIATION_2026-08-19.md` | Full Decision Reconciliation: 56 formal decisions checked against repository; 4 conflicts identified; 2 unformalized management changes; 3 material uncommitted deltas |

### Key findings

- **RESOLVED since prior extraction:** OTP delivery confirmed working (real OTP "832719" on OPPO CPH2481); CI #8 passed; APK #8 built
- **SUPERSEDED:** AKEDLY_TEMPLATE_ID is no longer a required var — must be DELETED from Railway; V1.2 Auth pipeline (`6a8338c061a103e7b2ccc936`) is the current OTP architecture
- **NEW MANAGEMENT INTENT:** Founder declared product incomplete ("just camera and questions"); next session = Product Completion / V1 Consumer Experience Assessment
- **4 ACTIVE CONFLICTS:** CONFLICT-A (BD-13 vs. deployed MVP), CONFLICT-B (TD-01 vs. mobile web), CONFLICT-C (DL-046 vs. CI distribution path), CONFLICT-D (CAD-05 vs. QR-First implementation)
- **3 UNCOMMITTED DELTAS:** Overview.tsx DEMO badge conditional; JoinPage.tsx reward points conditional; Session F closeout contains stale items

### Files Updated

| File | Change |
|---|---|
| `workspace/CHANGELOG.md` | This entry (v6.5) |

---

## [v6.4] — 2026-08-18 — Session F: OTP Flow Fix (Akedly Dev Mode / challengeRequired=false)

### Session type

Engineering (authorized — bug fix only). No new features. No deployments. Two-file minimal fix.

### Root cause proven

When the Akedly V1.2 pipeline is in Dev Mode, the challenge endpoint returns `{ challengeRequired: false }` with NO `challenge`, `difficulty`, or `challengeToken` fields. Flutter's `_challengeAndRequest()` unconditionally cast `challengeData['challenge'] as String`, producing a Dart `TypeError` (null-to-String). The `catch (_)` block swallowed the error and showed "Could not reach verification service". `requestOtp()` was never called — hence no POST in Railway logs.

A secondary blocker: backend `requestOtp()` pre-checked `if (!dto.powSolution) throw 400` regardless of `challengeRequired`.

### Files Modified

| File | Change |
|---|---|
| `apps/consumer/lib/screens/otp_screen.dart` | Read `challengeRequired` before touching PoW fields; branch on true/false; skip PoW and pass `powSolution: null` when false |
| `apps/api/src/modules/auth/auth.service.ts` | Removed hard `powSolution` pre-check; made `powSolution` conditionally included in Akedly send body; Akedly now enforces PoW when required |

### Files Created

| File | Description |
|---|---|
| `workspace/16_Reports/OTP_FLOW_FIX_SESSION_F_2026-08-18.md` | Formal implementation report — root cause, contract analysis, complete flow after fix, validation results, next actions |

### Validation

| Check | Result |
|---|---|
| TypeScript compile (`npx tsc --noEmit`) | PASS — zero errors |
| Flutter analyze | BLOCKED — macOS 13 below Flutter minimum 14; code manually verified |
| CI (GitHub Actions) | PENDING — commit + push required |
| OTP end-to-end with real phone | PENDING — pipeline activation required |

### Key decisions logged

| ID | Decision |
|---|---|
| ADR-09 | When Akedly `challengeRequired=false`, Flutter skips PoW; backend omits `powSolution`; Akedly is authoritative PoW validator |
| DL-049 | Tajribti does not pre-validate `powSolution` presence; Akedly pipeline enforces PoW requirement server-to-server |

### Security invariants preserved

- `AKEDLY_API_KEY` server-side only (never in Flutter) ✓
- PoW enforced by Akedly when pipeline requires it ✓
- `transactionReqID→phone` server-side binding intact ✓
- Client-supplied phone never trusted for JWT identity ✓
- No bypass of production security ✓

### Next human actions

1. `git add -p && git commit && git push` → triggers CI run #8
2. Install new APK → confirm OTP screen passes challenge phase
3. Activate Akedly pipeline `6a8338c061a103e7b2ccc936` in Akedly dashboard
4. Update Railway `AKEDLY_PIPELINE_ID` + delete `AKEDLY_TEMPLATE_ID` / `AKEDLY_OTP_VAR`
5. Test full OTP with real Egyptian phone

---

## [v6.0] — 2026-08-17 — Analysis Sprint: Decision Reconciliation + Portfolio Assessment

### Session type

Analysis-only. No product code modified. No deployments. All changes are workspace documentation.

### Protocol executed

1. Chat Context Extraction (UNIVERSAL CHAT CONTEXT EXTRACTION v1) — 7,089-line ChatGPT snapshot
2. Assessment Preparation / Decision Reconciliation — 28 decisions reconciled (D-001 through D-028)
3. Product Version Audit v2 — updated for commits b8b461b + 9cd1fc2 + 9da53d2
4. Management Situation Analysis v2 — updated with CONFLICT-INTERNAL-C and D-028
5. Portfolio Assessment — full independent assessment for portfolio comparison

### Files Created

| File | Description |
|---|---|
| `workspace/16_Reports/CHAT_CONTEXT_EXTRACTION_2026-08-17.md` | Full extraction of Founder decisions from 7,089-line historical ChatGPT archive (CHAT-D01 through CHAT-D20) |
| `workspace/16_Reports/ASSESSMENT_PREPARATION_DECISION_RECONCILIATION_2026-08-17.md` | Reconciliation of all chat decisions against authoritative repository sources — D-001 through D-028; 28 decisions classified |
| `workspace/16_Reports/PORTFOLIO_ASSESSMENT_2026-08-17.md` | Independent portfolio assessment — 16 sections, 12 scored dimensions; Stage-Gate: VALIDATE |

### Files Updated

| File | Change |
|---|---|
| `workspace/13_Audits/PRODUCT_VERSION_AUDIT.md` | Updated from v1 (2026-08-14) to v2 (2026-08-17); added DELTA for commits b8b461b + 9cd1fc2 + 9da53d2; added CONFLICT-INTERNAL-C |
| `workspace/16_Reports/MANAGEMENT_SITUATION_ANALYSIS.md` | Updated from v1 (2026-08-14) to v2 (2026-08-17); added CONFLICT-INTERNAL-C, D-028; updated DO NOW/WAIT/DO NOT DO NOW |
| `workspace/15_Decisions/DECISION_LOG.md` | Appended Phase 2 section: DL-046 (Flutter first demo), DL-047 (Report quality Samplia benchmark), DL-048 (CONFLICT-INTERNAL-C) |
| `workspace/15_Decisions/OPEN_DECISIONS_TRACKER.md` | Added COMMERCIAL SPRINT section: CONFLICT-INTERNAL-C and D-028 open decisions |
| `workspace/CHANGELOG.md` | This file — v6.0 entry added |
| `workspace/AI_BOOTSTRAP/14_CONTEXT_INDEX.md` | Added new files from this session to 13_Audits/ and 16_Reports/ sections |

### Key findings this session

| Finding | Type |
|---------|------|
| D-009 (first client must see Flutter) — CONFIRMED Founder decision, previously undocumented in workspace | Decision |
| D-028 (Intelligence Report "very very weak"; Samplia is visual benchmark) — CONFIRMED Founder decision, previously undocumented | Decision |
| CONFLICT-INTERNAL-C — D-009 cannot be honored on macOS 13; Flutter 3.44.8 requires macOS 14+ | NEW CONFLICT |
| Stage-Gate decision: VALIDATE — do not build until commercial assumptions are tested | Assessment outcome |
| Commercial state: zero LOIs, zero revenue, zero consumers, zero brand interviews | Current reality |
| Kill criterion clock is active: <3 LOIs in 60 days = NO-GO | Active gate |

---

## [v6.1] — 2026-08-17 — Real Pilot Validation: Two Critical Bugs Fixed

### Session type

Engineering (authorized — bug fixes only). Device validation on OPPO CPH2481. No new features.

### Commits

| Commit | Branch | Message |
|---|---|---|
| `a17d9f8` | `sprint/pilot-readiness-mvp` | fix(api): allow enterCampaignWeb to find demo-status QR codes |
| `8acfa8d` | `sprint/pilot-readiness-mvp` | fix(consumer): add ML Kit R8 ProGuard keep rules for scanner |

### Files Modified

| File | Change |
|---|---|
| `apps/api/src/modules/qr/qr.service.ts` | `enterCampaignWeb` WHERE clause extended to OR-match DEMO status QR codes |
| `apps/consumer/android/app/build.gradle.kts` | ProGuard rules file wired into release build |

### Files Created

| File | Description |
|---|---|
| `apps/consumer/android/app/proguard-rules.pro` | ML Kit ComponentRegistrar keep rules — prevents R8 from stripping reflection-loaded classes |
| `workspace/16_Reports/PILOT_VALIDATION_REPORT_2026-08-17.md` | Phase-by-phase validation report with final verdict |

### Key findings this session

| Finding | Type |
|---------|------|
| ML Kit ProGuard fix confirmed working on OPPO CPH2481 — no `NoSuchMethodException`, camera at 25fps | BUG FIXED (device-confirmed) |
| `enterCampaignWeb` returned 404 for all demo campaigns — WHERE clause excluded DEMO-status QR codes | BUG FIXED |
| `AKEDLY_TEMPLATE_ID` not set in Railway — OTP generated but not delivered | EXTERNAL BLOCKER (Founder action required) |
| Pilot verdict: B — CONDITIONALLY OPERATIONAL (blocked by Akedly only) | Outcome |

### Pilot state after this session

| Component | State |
|---|---|
| enterCampaignWeb bug | ✅ FIXED — deployed to Railway |
| ML Kit ProGuard fix | ✅ DEVICE-CONFIRMED — on sprint branch |
| Akedly OTP | ❌ External blocker — set AKEDLY_TEMPLATE_ID in Railway to unblock |

---

## [v5.0] — 2026-08-14 — Bilingual Consumer App + Arabic Report Mode

### Commit

| Commit | Branch | Message |
|---|---|---|
| `9cd1fc2` | `sprint/pilot-readiness-mvp` | feat: bilingual AR/EN consumer app + Arabic report mode |

### Files Created

| File | Description |
|---|---|
| `apps/consumer/lib/core/l10n.dart` | LangNotifier + LangProvider + AppStr — full AR/EN string table, SharedPreferences persistence |
| `apps/consumer/lib/widgets/lang_toggle.dart` | Reusable language toggle chip (light/dark variants) |

### Files Modified

| File | Change |
|---|---|
| `apps/consumer/lib/app.dart` | TajribtiApp → StatefulWidget; Cairo font via GoogleFonts.cairoTextTheme; LangProvider wraps tree |
| `apps/consumer/lib/screens/*.dart` (all 8) | Replaced hardcoded Arabic strings with `context.l10n.*`; `TextDirection.rtl` → `context.dir`; LangToggle in AppBar |
| `apps/consumer/lib/screens/register_screen.dart` | Gender/city chips use `context.l10n` lists (locale-aware labels, fixed English API values) |
| `apps/consumer/lib/screens/survey_screen.dart` | Scale labels, question text selection (Arabic/English), error states all localized |
| `apps/consumer/pubspec.yaml` | Added `google_fonts: ^6.1.0` |
| `apps/dashboard/public/index.html` | Cairo font preloaded via Google Fonts CDN |
| `apps/dashboard/src/pages/Report.tsx` | EN/AR toggle in action bar; RTL direction + Cairo font in Arabic mode; full Arabic translations for all 7 sections; CssBar RTL flip; PDF filename `-ar`/`-en` suffix |
| `workspace/AI_BOOTSTRAP/02_PROJECT_STATE.md` | Updated Flutter and Report status to BILINGUAL |
| `workspace/AI_BOOTSTRAP/00_AI_START_HERE.md` | Fixed stale Twilio reference; updated commit hash; added Akedly activation steps |

### Verification

| Test | Result |
|---|---|
| TypeScript dashboard (`npx tsc --noEmit`) | CLEAN — zero errors |
| Commercial demo (frozen) | UNTOUCHED — commit `0209b9a` on `sprint/meos-production-build` |
| JoinPage.tsx (mobile web bridge) | UNTOUCHED — verified header confirms no modification |

### What Was NOT Done (Intentionally)

- APK build — requires macOS 14+ (machine is 13.0); APK must use CI
- V2/V3/V4 features
- Brand self-registration UI
- New OTP architecture
- New external services

---

## [v4.9] — 2026-08-14 — Flutter Consumer App Pilot-Complete + Report Upgrade

### Commit

| Commit | Branch | Message |
|---|---|---|
| `b8b461b` | `sprint/pilot-readiness-mvp` | feat: complete Flutter consumer app + improve client report for real pilot |

### Files Created

| File | Description |
|---|---|
| `apps/consumer/lib/core/session.dart` | JourneySession — static class threading campaignId/redemptionId across all screens |
| `apps/consumer/lib/screens/campaign_screen.dart` | Campaign Entry screen (P0 requirement) — loads real campaign, handles auth/entry |

### Files Modified

| File | Change |
|---|---|
| `apps/consumer/lib/core/api_client.dart` | Added `getCampaignById()` + `enterCampaign()` — real campaign API wiring |
| `apps/consumer/lib/screens/scanner_screen.dart` | Rewritten — parses 4 QR formats; navigates to `/campaign` |
| `apps/consumer/lib/screens/otp_screen.dart` | Debug text REMOVED; 60s countdown; correct post-auth campaign flow |
| `apps/consumer/lib/screens/register_screen.dart` | Nested try-catch for `enterCampaign` after registration |
| `apps/consumer/lib/screens/survey_screen.dart` | `getDemoActiveCampaign` → `getCampaignById(campaignId)` |
| `apps/consumer/lib/screens/home_screen.dart` | Removed demo dependency — QR scanner entry point |
| `apps/consumer/lib/screens/phone_screen.dart` | Campaign context banner; improved errors |
| `apps/consumer/lib/screens/splash_screen.dart` | Unauthenticated → `/scanner` (not `/phone`) |
| `apps/consumer/lib/app.dart` | Added `/campaign` route; removed `campaignId` extra from scanner |
| `apps/dashboard/src/pages/Report.tsx` | Multi-page A4 PDF; branded dark cover; 7 numbered sections (01–07) |

### Status After This Session

```
Flutter consumer app: PILOT-READY — full journey functional with real campaign API
Report:              UPGRADED — branded cover, 7 sections, multi-page A4
APK:                 NOT BUILT — requires macOS 14+
```

---

## [v4.8] — 2026-08-13 — Real Pilot MVP Sprint Closure

### Commits

| Commit | Branch | Message |
|---|---|---|
| `ed72a20` | `sprint/pilot-readiness-mvp` | feat: Real Pilot MVP — mobile web consumer journey |

### Implementation Scope

| Area | Changes |
|---|---|
| Campaign API | `POST /campaigns`, `GET /campaigns/my` — brand-scoped; `isDemo:false`; default 5-question survey injected |
| Campaign DTO | `apps/api/src/modules/campaign/dto/create-campaign.dto.ts` — NEW with class-validator |
| QR Service | Real campaigns → URL payload (`CONSUMER_WEB_URL/join/:campaignId`); demo campaigns retain JSON (Flutter compat) |
| QR Entry | `POST /qr/enter/:campaignId` — consumer JWT; idempotent; creates RedemptionEvent with `isDemoSeed:false` |
| Mobile web consumer journey | 6 screens (Arabic RTL): JoinLayout, JoinPage, PhonePage, OtpPage, RegisterPage, SurveyPage, ThankYouPage |
| Consumer routes | Mounted at `/join/:campaignId/*` in existing React dashboard — no new infrastructure |
| Analytics security | Removed all `@Public()` from analytics + report endpoints; brand JWT + ownership check required |
| Report security | Same; fallback narrative rewritten — no demo/simulated language |
| Admin resetDemo | Fixed FK constraint failure when non-demo campaigns exist under demo brand account |
| Env docs | `CONSUMER_WEB_URL` documented in `.env.example` |

### Verification

| Test | Result |
|---|---|
| A — Real campaign creation | PASS |
| B — Real QR URL encoding | PASS |
| C — Consumer web journey end-to-end | PASS |
| D — Consumer JWT rejected on analytics | PASS (403) |
| E — Brand analytics returns own data | PASS |
| F — Cross-campaign ownership check | PASS (403) |
| G — Commercial demo regression (demo.sh) | PASS — 49 signals, DEMO badge, all screens |
| TypeScript API | CLEAN |
| TypeScript Dashboard | CLEAN |

### Status

```
COMMERCIAL DEMO:  READY + FROZEN
REAL PILOT MVP:   READY LOCALLY (NOT yet deployed to cloud)
NEXT:             PILOT DEPLOYMENT
```

### What Was NOT Done (Intentionally)

- Cloud deployment (Railway/Vercel/Supabase) — requires operator execution
- Twilio SMS configuration — requires credentials
- P1 features (brand self-registration, campaign management UI)
- P2 features (PDPL consent, consumer data deletion)

---

## [v4.6] — 2026-08-13 — Demo Script Commercial-Safety Lock

### File Changed

`Sales_Execution_Pack/05_Demo_Presentation_Script.md` — 3 targeted wording corrections only.

| Correction | Before | After |
|---|---|---|
| Consumer interaction | "mobile web flow — no app to download" | "frictionless — the consumer scans the QR, completes the short interaction on their phone, and the signal is captured automatically" |
| Reporting timing | "Within 24 hours of campaign end" | "At the end of the campaign" |
| Pilot duration | "A pilot campaign runs for 30 to 60 days" | "We can structure a pilot around a defined campaign period…" |

### Verification

- All 5 prohibited terms removed: `mobile web`, `no app`, `24 hours`, `30 to 60`, `30-60` — PASS
- All required content preserved: simulated-data disclosure, "The software is real. The flows are real. The data is not.", all 7 screen URLs, commands, What Not To Say, recovery instructions — PASS
- Canonical demo launch: PASS
- Personalized demo launch (Nestlé Egypt / Nescafé Classic / Maadi City Centre): PASS
- Dashboard HTTP 200: PASS
- Personalization in API: PASS
- Canonical restored: PASS

### Product Code Changed

NO. Zero product code changes. Zero API changes. Zero schema changes.

### Status

COMMERCIAL DEMO FROZEN.

---

## [v4.5] — 2026-08-13 — Demo Presentation Script

### Files Created

| File | Change |
|---|---|
| `Sales_Execution_Pack/05_Demo_Presentation_Script.md` | NEW — screen-by-screen founder presentation guide for brand discovery meetings |

### What Was Verified

- Canonical demo launch: PASS (`bash scripts/demo.sh`)
- Personalized demo launch: PASS (Nestlé Egypt / Nescafé Classic / Maadi City Centre)
- All 6 key API endpoints: PASS (overview, demographics, survey, participants, ai-summary, qr/generate)
- AI summary narrative: truthful disclosure confirmed ("illustrative narrative", "simulated consumer interactions")
- Dashboard HTTP 200: PASS
- Login (demo@brand.com / Demo1234!): PASS
- Canonical restore: PASS

### What Was Found

Review of the complete Sales Execution Pack and demo infrastructure confirmed:
- Sales Playbook (01), Brand OnePager (02), LOI Template (03), Legal (04), GTM Blueprint — all complete, approved 97/100
- demo.sh launcher functional, 5-step orchestration (env → start → seed → health check → banner)
- 7 dashboard screens functional via sidebar navigation
- One genuine gap: no screen-by-screen demo talking guide existed anywhere in repository

### What Was NOT Changed

- No product code changed
- No database schema changed
- No API changed
- No dashboard screens changed
- No existing Sales Execution Pack files changed
- No demo infrastructure changed

### Session Summary

Commercial demo package is now complete. The minimum viable presentation set is:
1. `bash scripts/demo.sh` — starts everything
2. `Sales_Execution_Pack/05_Demo_Presentation_Script.md` — founder's screen-by-screen guide
3. `Sales_Execution_Pack/02_Brand_OnePager.md` — leave-behind for prospects
4. `Sales_Execution_Pack/01_Sales_Playbook.md` — discovery call + LOI process
5. `Sales_Execution_Pack/03_LOI_Template.md` — send after meeting

### Blocking Items — Unchanged

B-01, B-02, B-03, B-04 remain open. No engineering work was authorized or performed.

---

## [v4.4] — 2026-08-13 — MEOS v1 Commercial Demo Build + Lock

### Files Created or Modified

| File | Change |
|---|---|
| `scripts/demo.sh` | NEW — one-command demo orchestrator with `--brand/--product/--location` flags |
| `apps/dashboard/src/pages/Insights.tsx` | Chart tooltip dark theme + "PRIMARY TARGET SEGMENT" callout replaced with factual cards |
| `apps/dashboard/src/pages/SurveyResults.tsx` | Chart tooltip dark theme |
| `apps/dashboard/src/components/Layout.tsx` | Consumer Signals redesign (NAV_SECTIONS, sidebar, DEMO badge) |
| `apps/dashboard/src/index.css` | Dark body background + signalRing keyframes |
| `apps/dashboard/src/pages/Overview.tsx` | Consumer Signals redesign |
| `apps/dashboard/src/pages/Login.tsx` | Dark theme |
| `apps/dashboard/src/pages/CampaignDetail.tsx` | Dark theme |
| `apps/dashboard/src/pages/AiSummary.tsx` | Dark theme |
| `apps/dashboard/src/pages/Participants.tsx` | Dark theme |
| `apps/dashboard/src/pages/Report.tsx` | Dark theme |
| `scripts/run-demo.sh` | RETRIES=90; HTTP 404 accepted as health-check pass for NestJS POST-only routes |
| `scripts/seed-demo.sh` | Deterministic phone +20100NNNNNN; health-check status logic fixed |
| `scripts/verify-env.sh` | `flutter --version \|\| true` — prevents pipefail exit 255 |
| `apps/api/src/modules/admin/admin.service.ts` | Deterministic phone; AiReport FK deleted first in resetDemo() |
| `apps/api/src/modules/admin/admin.module.ts` | AiReport added to TypeOrmModule.forFeature + @InjectRepository |

### Workspace Bootstrap Files Updated

| File | Change |
|---|---|
| `AI_BOOTSTRAP/00_AI_START_HERE.md` | Current Status updated to MEOS v1 LOCKED; Rule 3 updated |
| `AI_BOOTSTRAP/02_PROJECT_STATE.md` | Full state update: Demo State section added, authorization updated, sprint updated |
| `AI_BOOTSTRAP/04_CURRENT_OBJECTIVE.md` | Objective updated to Commercial Execution; demo command added |
| `AI_BOOTSTRAP/AI_SESSION_TEMPLATE.md` | Expected answers updated; Commercial Execution session type added |
| `14_Memory/MASTER_PROJECT_MEMORY.md` | Section 2 updated; Rule 4 updated; Section 16 session close record added |
| `CHANGELOG.md` | v4.4 entry added |

### Session Summary

MEOS v1 commercial demo built across three sequential sub-sessions (Session A, B, C):
- Session A: Consumer Signals dark-theme redesign across all 7 dashboard screens
- Session B: Backend seed/reset infrastructure — deterministic phones, FK ordering, health-check fixes
- Session C: Demo launcher (scripts/demo.sh), chart tooltips, segment callout fix, full verification

Demo verification sequence: canonical → personalized (Coca-Cola Egypt) → canonical restore. All three PASS.

Locked via commit 0209b9a on branch `sprint/meos-production-build`. NOT pushed per Founder instruction.

### Git State

- Branch: `sprint/meos-production-build`
- Commit: `0209b9a` ("Finalize commercial demo and one-command launcher")
- Status: NOT pushed (intentional)

### Blocking Items — Unchanged

B-01, B-02, B-03, B-04 remain open. Demo build was authorized under MEOS sprint. Track 1 full engineering still gated.

---

## [v4.3] — 2026-07-27 — Track 0 Commercial Execution Blueprint

### Files Created

| File | Location | Description |
|---|---|---|
| `GTM_BLUEPRINT_v1.0.md` | `Sales_Execution_Pack/` | Complete 21-part GTM commercial operating manual for Track 0 |

### Session Summary

Full GTM Commercial Execution Blueprint produced from Founder Questionnaire answers (answered 2026-07-27). Covers all 21 required sections: GTM strategy, channel matrix, ICP, brand targets, agency targets, sales scripts (Arabic + English), discovery questions, objection handling, follow-up sequences, LinkedIn strategy, agency partnership strategy, referral strategy, 60-day execution plan, KPIs, pipeline dashboard, risk matrix, success metrics, weekly review process.

### Strategic Decisions Embedded in Blueprint

- **Primary channel:** Own agency clients first (fastest to LOI — existing relationship), then agency-to-agency peer partnerships
- **Secondary channel:** LinkedIn systematic outreach (25 messages/week, Etisalat + Agency Founder profile converts above average)
- **Fallback:** Industry events sprint (AMCHAM, BCFE)
- **Tier 1 brand targets:** Edita, Juhayna, Domty, Americana, Kellogg's Egypt
- **ICP:** Marketing Director / Head of Marketing at Egyptian FMCG company, Cairo, sampling campaign planned in next 6 months
- **LOI conversion strategy:** Emphasize non-binding nature; zero-cash pilot option available
- **Key hidden asset identified:** Founder's existing agency clients are the fastest path to the first LOI — no cold outreach required for the first target

### Blocking Items — Unchanged

B-01 (Track 0 GO), B-02 (LLC), B-03 (PDPL), B-04 (QR load test) remain OPEN. Development NOT AUTHORIZED. GTM Blueprint does not change these statuses.

---

## [v4.2] — 2026-07-27 — Repository Intelligence & Evidence Audit

### Files Created

| File | Location | Description |
|---|---|---|
| `AUDIT_INDEX.md` | `docs/audit/` | Master index of audit deliverable — key findings for Founder |
| `PART1_REPOSITORY_INVENTORY.md` | `docs/audit/` | Complete inventory of all ~149 files with 4 audit findings |
| `PART2A_FILE_REVIEW_CARDS_FOUNDER_BOOTSTRAP.md` | `docs/audit/` | File Review Cards: Founder Intent + AI Bootstrap layers |
| `PART2B_FILE_REVIEW_CARDS_CORE_DOCS.md` | `docs/audit/` | File Review Cards: Core decisions, architecture, product, audit docs |
| `PART2C_FILE_REVIEW_CARDS_REMAINING.md` | `docs/audit/` | File Review Cards: Memory, reports, navigator, binary, stubs |
| `PART5_TO_10_REMAINING_REPORTS.md` | `docs/audit/` | Parts 3-10: Knowledge Inventory, Founder Alignment, Dependencies, Duplicates, Conflicts, Commercial Value, Risks, Executive Summary |

### Mission Summary

Full 10-phase Repository Intelligence & Evidence Audit completed. Every readable text file read completely (no sampling). ~119 readable files, ~15 binary files, ~7 empty directories. Zero files deleted, moved, archived, or restructured. All files remain READY FOR REVIEW.

### Key Findings

| Finding | Severity |
|---|---|
| PAR Patch P-02 not applied — Sales Pack cannot go to clients | CRITICAL for Track 0 |
| CONFLICT-001: B-series ID collision between READINESS_AUDIT.md and OPEN_DECISIONS_TRACKER.md | HIGH |
| MASTER_INDEX.md stale — 12+ new files not listed | HIGH |
| inbox/chatgpt chat till 27-7.docx not yet processed | HIGH |
| IC v2.0 workspace representation is 130-line summary (not 19,661-word full doc) | HIGH |
| CONFLICT-003: PAR M-01 may already be resolved (income segment present in PDPL Brief) | MEDIUM |
| SOURCE_OF_TRUTH.md has broken path for SUPERSEDED_DOCUMENTS.md | MEDIUM |

---

## [v4.1] — 2026-07-27 — Bootstrap Certification Pass

### Files Created

| File | Location | Description |
|---|---|---|
| `PROJECT_FINGERPRINT.json` | `AI_BOOTSTRAP/` | Machine-readable project identity, counts, conflicts, and fingerprint |
| `TRACEABILITY_INDEX.md` | `AI_BOOTSTRAP/` | Every major Bootstrap claim mapped to source file with confidence level |
| `AI_SESSION_TEMPLATE.md` | `AI_BOOTSTRAP/` | Mandatory session opener template — 6 steps, confirmation checklist, closeout protocol |
| `BOOTSTRAP_VERSION.md` | `AI_BOOTSTRAP/` | Bootstrap version record, revision history, update protocol |
| `BOOTSTRAP_FREEZE_REPORT.md` | `AI_BOOTSTRAP/` | Full certification audit — 98/100 readiness score, 2 conflicts documented, FROZEN |

### Files Updated
- `CHANGELOG.md` — this entry
- `workspace/MASTER_INDEX.md` — file count updated to 96+

### Why This Version Exists

Second-pass architecture audit of the AI_BOOTSTRAP layer. All 14 inbox files, all 96+ workspace files, and all root-level directories were re-read before any certification was performed. Two conflicts were found and documented. Project identity was verified (Tajribti is the product name; "samples app" is the filesystem folder only). Bootstrap frozen at version 1.1.

---

## [v4.0] — 2026-07-27 — AI Bootstrap Layer

### Files Created (AI_BOOTSTRAP/ — new folder)

| File | Description |
|---|---|
| `00_AI_START_HERE.md` | 1-page orientation: project name, status, loading order, critical rules |
| `01_PROJECT_CONSTITUTION.md` | What IS / IS NOT the project; vision, mission, non-goals |
| `02_PROJECT_STATE.md` | Authorization, blockers, phase, team, open decisions — current state only |
| `03_FOUNDER_DECISIONS.md` | All 51 locked founder decisions merged, sorted by category |
| `04_CURRENT_OBJECTIVE.md` | Exactly what we're doing right now: Track 0, 4 blocking items, 14 brand targets |
| `05_CURRENT_PHASE.md` | Track 0 context, previous phase, next phase, exit criteria |
| `06_PROJECT_GLOSSARY.md` | 43+ terms with business meaning, technical meaning, and AI-system meaning |
| `07_DOMAIN_MODEL.md` | Actors, 10 capabilities, 3 business processes, 8 entities, 2 state machines |
| `08_ARCHITECTURE_MAP.md` | One-page architecture: 3 frontends, NestJS core, Python AI service, data layer |
| `09_REPOSITORY_MAP.md` | Full workspace folder structure with file-level descriptions |
| `10_KNOWLEDGE_MAP.md` | Where every type of institutional knowledge lives, organized by question type |
| `11_AI_RULES.md` | Anti-drift protocol, 8 absolute rules, scope rules, session protocol |
| `12_AI_CHECKLIST.md` | 11-step mandatory pre-answer checklist + quick-fire fact check table |
| `13_LOADING_ORDER.md` | Session-type loading recipes with token budget estimates |
| `14_CONTEXT_INDEX.md` | One-line description of every file in the workspace |
| `15_SOURCE_OF_TRUTH.md` | Canonical files, authority chain, conflict resolution protocol |

### Files Updated
- `MASTER_INDEX.md` — added AI_BOOTSTRAP/ to workspace tree; updated file count to 96+
- `CHANGELOG.md` — this entry

### Why This Version Exists

The workspace had comprehensive documentation (v1.0), an audit pass (v2.0), and governance files (v3.0). What was missing was a purpose-built, AI-optimized onboarding layer — distinct from human-oriented documentation — that allows any future AI session to reach full project context in under 2 minutes. The AI_BOOTSTRAP/ folder is strictly for AI onboarding: every file answers a specific AI orientation question, cites sources, and is structured to be consumed sequentially.

**Design principles applied:**
- Every statement cites a source document
- No invented information
- Conflicts documented, never silently resolved
- Anti-drift protocol enforced throughout
- Session-type loading recipes reduce token waste

---

## [v3.0] — 2026-07-27 — Long-term Development Governance

### Files Created

| File | Location | Description |
|---|---|---|
| `MASTER_PROJECT_MEMORY.md` | `14_Memory/` | Comprehensive living memory — supersedes and extends PROJECT_MEMORY.md; load every session |
| `DECISION_LOG.md` | `15_Decisions/` | Full chronological decision log — 51 decisions logged across all categories |
| `RISK_REGISTER.md` | `02_Project_Management/` | Full risk register — 20 risks scored across 5 categories; 6 HIGH/CRITICAL flagged |
| `ASSUMPTION_REGISTER.md` | `15_Decisions/` | Full assumption register — 40 assumptions tracked across 5 categories |
| `PROJECT_RULES.md` | `00_Source_of_Truth/` | 25 inviolable project rules across 7 categories |
| `AI_WORKFLOW.md` | `_ai_bootstrap/` | AI session protocol — loading order, prompt patterns, closeout checklist |
| `SPRINT_MEMORY_TEMPLATE.md` | `02_Project_Management/` | Sprint memory template for Track 0 through Sprint 6 |
| `CHANGELOG.md` | `workspace/` (root) | This file — workspace version history |
| `CONTRIBUTING.md` | `workspace/` (root) | Contribution guidelines for Founder and future team members |

### Why This Version Exists

The workspace was certified AI-ready (91/100, v2.0) but lacked the long-term governance infrastructure needed as the project moves from documentation to execution. Nine governance files transform it from a knowledge archive into a permanent source of truth that can survive team growth, context resets, and multi-year development.

---

## [v2.0] — 2026-07-27 — Enterprise Knowledge Architect Audit

### Structural Reorganization

| Change | Before | After |
|---|---|---|
| Root clutter | 20 files at workspace root | 3 files at root (MASTER_INDEX, CHANGELOG, CONTRIBUTING) |
| AI bootstrap files | Scattered at root | Organized into `_ai_bootstrap/` |
| Index files | Scattered at root | Organized into `_navigator/` |
| JSON files | Scattered at root | Organized into `_structured_data/` |

### Files Created in This Version

| File | Location | Description |
|---|---|---|
| `DECISION_STATUS_BOARD.md` | `_navigator/` | Live blocker/open/locked decision tracker |
| `OPEN_DECISIONS_TRACKER.md` | `15_Decisions/` | 4 blocking items with "what proves it closed" guidance |
| `ENTERPRISE_ARCHITECTURE.md` | `06_Enterprise_Architecture/` | EA domain map, capability model, integration architecture |
| `GO_TO_MARKET.md` | `07_Product/` | GTM strategy, brand target list, sequencing, kill criterion |
| `PRODUCT_STRATEGY.md` | `07_Product/` | Product vision, SWOT, Porter's Five Forces, PESTEL, roadmap |
| `AI_STRATEGY.md` | `10_AI/` | LLM strategy, prompt management, fraud detection, data flywheel |
| `PROJECT_MEMORY.md` | `14_Memory/` | Persistent project memory — corrections, verified facts, open questions |
| `PROJECT_CONTEXT.md` | `_ai_bootstrap/` | Project background, constraints, what's done and not done |
| `REPORT_INDEX.md` | `_navigator/` | Index of all generated reports |
| `MEMORY_REPORT.md` | `16_Reports/` | Memory items summary report |
| `PROMPT_REPORT.md` | `16_Reports/` | Prompt analysis report |
| `SUPERSEDED_DOCUMENTS.md` | `18_Archive/` | Registry of superseded source documents |
| `topics.json` | `_structured_data/` | 12 extracted topics with document mappings |
| `duplicates.json` | `_structured_data/` | Duplicate detection results |
| `links.json` | `_structured_data/` | All 29 cross-reference edges |
| `WORKSPACE_AUDIT.md` | `17_Final/` | Enterprise Knowledge Architect audit report |
| `READY_FOR_AI.md` | `17_Final/` | AI readiness certification |
| `FINAL_QUALITY_SCORE.md` | `17_Final/` | Final quality assessment (91/100) |

### Files Significantly Updated in This Version

| File | Change |
|---|---|
| `AI_CONTEXT.md` | Rebuilt to v2.0 — 10 sections, 9 AI rules, 900+ words |
| `LOADING_ORDER.md` | Updated to 7 tiers; all new files referenced |
| `MASTER_INDEX.md` | Completely rebuilt with new folder tree and role-based navigation |

### Fixes Applied in This Version

| Fix | Detail |
|---|---|
| Broken link | `IC_MEMO_FINAL_v1.0.md` → fixed to `IC_MEMO_v1.0.md` |
| Path references | Report files updated from old root paths to new `_navigator/` paths |
| Data typo | `statistics.json`: `samplia_founded: 1013` → `2013` |

---

## [v1.0] — 2026-07-26 — Initial Workspace Build

### Source Files Processed

14 files extracted from `inbox/` using python-docx and pdfplumber:
- 13 .docx files
- 1 .pdf file
- 1 .txt file

Total source content: ~40,000 words across 14 documents.

### Workspace Structure Created

22 folders (00_Source_of_Truth through 18_Archive) + initial file set.

### Phase Summary

| Phase | Output |
|---|---|
| 1 — Scan | 14 files catalogued |
| 2 — Extract | All content extracted to text |
| 3 — Classify | All files classified by type/language/status |
| 4 — Create workspace | 22-folder structure created |
| 5 — Split documents | All major documents split into domain files |
| 6 — Enrich | Metadata added to all generated files |
| 7 — Extract knowledge | 46+ decisions, 22 features, entities, KPIs, risks extracted |
| 8 — Indexes | 9 of 10 indexes generated (REPORT_INDEX added in v2.0) |
| 9 — JSON | 4 of 7 JSON files generated (3 added in v2.0) |
| 10 — Cross-reference | 21 cross-reference edges documented |
| 11 — Reports | 5 of 7 reports generated (2 added in v2.0) |
| 12 — AI bootstrap | 5 of 7 files generated (2 added in v2.0) |
| 13 — Validate | Basic validation passed; issues identified for v2.0 |
| 14 — Final summary | WORKSPACE_REPORT.md + STATISTICS_REPORT.md created |

### Corrections Applied in v1.0 Build

| Correction | Detail |
|---|---|
| Samplia founding year | 2013 (not 2018/2019 as in early documents) |
| Samplia funding status | Bootstrapped (not venture-backed) |
| Competitor gap | Marketeers Research identified as near-direct competitor |
| Competitor count | ~127 global competitors in category |

---

## How to Add a CHANGELOG Entry

When you make meaningful workspace changes:

```markdown
## [date] — [Brief title]

### Files Created
| File | Location | Description |
|---|---|---|
| `FILENAME.md` | `folder/` | One-line description |

### Files Updated
| File | Change |
|---|---|
| `FILENAME.md` | What changed and why |

### Issues Fixed
| Issue | Resolution |
|---|---|
| [Issue description] | [How it was fixed] |
```

**Minimum entry for a simple session:**
```
## [date] — Session: [session goal]
- Updated `DECISION_LOG.md` — added DL-[N]: [brief decision]
- Updated `RISK_REGISTER.md` — R-[ID] status changed to [new status]
```
