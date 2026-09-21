# TAJRIBTI — Mobile Final Corrective Implementation

**Date:** 2026-09-21
**Pass:** Implementation pass following `TAJRIBTI_MOBILE_JOURNEY_FORENSIC_REUSE_SPEC_2026-09-21.md`
**Baseline:** `dcde3cbb883aea1d6331b47ba81619250cda9729` (branch `master` → `origin/benchmark-current`)
**Benchmark:** `governance/REFERENCE_PRODUCT_BENCHMARK.md` — **unchanged**, SHA-256 `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a`

---

## 1. Executive Summary

All four closed Founder decisions and all verified forensic gaps were implemented without redesigning the product or rebuilding the app:

- **FD-07a** — campaign-bound fresh OTP is now enforced server-side via a new `CampaignOtpVerification` record; a session token alone can no longer create a participation, and a verification for Campaign A cannot authorize Campaign B.
- **FD-M5** — mobile remains PoW-only; no Turnstile token or WebView exists anywhere in the Flutter client.
- **FD-M7** — Android App Links configured: manifest `autoVerify` intent-filter for the real production host, `/.well-known/assetlinks.json` served by the API, in-app `/app/consumer?qr=` route resolving through the same QR endpoint as the scanner.
- **FD-M3** — partial participations resume: TRIAL_REDEEMED re-enters the survey on the same participation identity; ENTERED resumes at redemption; SURVEY_COMPLETE and INELIGIBLE keep their terminal states. No duplicate participation, redemption, or survey can be created.
- **G-M1** — push UI, toggle state, API client call, and localization removed.
- **G-M2** — all consumer-visible reward/points language and rendering removed; the model fields were deleted rather than hidden behind a zero.
- **G-M6** — campaign media is parsed and rendered on Campaign Detail (http(s)-only, order preserved, per-item graceful failure).

Web Consumer (which shares the eligibility contract) was updated to the same FD-07a + FD-M3 semantics: campaign verification card before eligibility, and status-aware resume on campaign open.

## 2. Founder Decisions Implemented

| Decision | Implementation |
|---|---|
| FD-07a | `OtpCode.campaignId` + new `CampaignOtpVerification` model; `POST /consumer/auth/otp/request` validates the campaign is ACTIVE before minting a code; `POST /consumer/auth/otp/verify` looks up codes scoped by `campaignId` exactly (null matches only unscoped codes) and mints a 15-minute verification; `POST /consumer/campaigns/:id/eligibility` requires a live unconsumed verification for (consumer, campaign) and consumes it atomically inside the participation transaction. |
| FD-M5 | `requestOtp` in `api_client.dart` never sends `turnstileToken`; a Turnstile-required pipeline falls into the existing retryable error path. No Turnstile/WebView dependency added. The Akedly challenge → client PoW → request → verify path is unchanged and now carries `campaignId`. |
| FD-M7 | `AndroidManifest.xml` VIEW/BROWSABLE `autoVerify` intent-filter for `https://api-production-266c.up.railway.app/app/consumer*`; `GET /.well-known/assetlinks.json` (shared handler in `src/lib/appLinks.ts`) serves the `android_app` statement for `com.tajribti.consumer` with the release-cert SHA-256 from `ANDROID_APP_LINKS_SHA256`; empty list when unset (fails closed to web fallback). New `QrEntryScreen` + `/app/consumer` GoRoute resolves `?qr=` via `GET /consumer/qr/:code` — preserving QR source attribution. |
| FD-M3 | `CampaignScreen._load`/`_start` route on real participation status; `EligibilityScreen._resumeIfExisting` resumes ENTERED→redeem→survey and TRIAL_REDEEMED→survey on the same identity; Activity and Home open records by status. |

## 3. Push Removal (G-M1)

Removed: `setPushOptIn` client method (dead endpoints), the push `SwitchListTile` in Profile, `_push` state, `pushOptInLabel`/`pushOptInSub` strings, and the privacy-section comment implying push exists. The consent section now shows only the supported panel opt-in. Dormant `Consumer.pushOptIn`/`pushOptInAt` schema columns were intentionally left in place (documented in `consumer.ts`: dropping them is a destructive migration with no product need).

## 4. Rewards Removal (G-M2)

Removed: reward card on Campaign Detail, reward chips on Home campaign cards and activity tiles, `Campaign.rewardPoints` / `ParticipationRecord.rewardPoints` model fields (previously hardcoded 0 shims), `rewardPoints()`, `rewardDetail`, `pointsLabel`, `pointsAddedLabel`, `heroStepEarn`, `servicesStepEarn`, "earn points" copy in `heroSub`/`servicesIntro`, and "earned your reward" in `alreadyParticipatedSub`. Hero steps are now Discover → Try → Share; Services steps 1–3. No replacement reward mechanism was added.

## 5. Partial Participation Resume (FD-M3 / G-M3)

Backend already served `GET /survey` for TRIAL_REDEEMED — reused, not redesigned.

- `CampaignScreen._load` reads `GET /consumer/participations` and sets one of: completed view (SURVEY_COMPLETE), ineligible view (INELIGIBLE — new dedicated state), or a resumable flag (ENTERED / TRIAL_REDEEMED → CTA becomes "Resume Survey").
- `_start` resumes before the QR re-scan: TRIAL_REDEEMED → `/survey`; ENTERED → `/eligibility` (which redeems the existing participation and continues to the survey).
- `EligibilityScreen._resumeIfExisting` runs on load AND on a 409, so even a stale client state converges on the real server status. Eligibility submission handles `403 CAMPAIGN_OTP_REQUIRED` by routing to a fresh campaign-bound OTP.
- Activity records show the real status pill (Completed / In progress / Not eligible) and resume on tap; Home cards treat only SURVEY_COMPLETE as completed.
- Web Consumer `openCampaign` routes identically: TRIAL_REDEEMED opens the survey card, ENTERED the redemption card, SURVEY_COMPLETE the done state, INELIGIBLE a dedicated not-eligible card.

## 6. Campaign-Bound OTP (FD-07a / G-M4)

Architecture: the account session (consumer JWT) remains the identity; the campaign-bound `CampaignOtpVerification` is the participation authorization — checked by exact (consumerId, campaignId) pair, never a flag on the token.

- Request: `campaignId` optional; rejected 404 unless the campaign exists and is ACTIVE.
- Verify: code lookup filtered by `campaignId` exactly — a code issued for A is invisible when claiming B; an unscoped verify cannot satisfy a scoped code (and vice versa). Successful scoped verify mints a 15-minute verification and returns a normal session token (same identity).
- Eligibility: duplicate-participation check runs first (existing participations keep their truthful 409), then the verification gate (403 `CAMPAIGN_OTP_REQUIRED`), then the existing QR-source and answer bindings. Consumption is atomic inside the participation transaction — a failed transaction never spends a verification, and a spent one can never replay.
- Rate limits unchanged (per-phone request and verify throttles intact); OTP plaintext is never stored (`code` column carries the Akedly transactionReqID under the provider path) and `devOnlyCode` remains dev-only.
- Campaign delete (`company.ts`) now removes the campaign's verification rows with its other children.

## 7. PoW-only Mobile Security (FD-M5 / G-M5)

The Akedly conditional design was preserved, not weakened: challenge proxy → client-side PoW (akedly_pow.dart) → request → verify. Mobile sends only `phone`, `campaignId`, `powSolution`. `turnstileToken` support remains on the backend for the Web path where the pipeline demands it, but the mobile client no longer has the field at all. A Turnstile-required pipeline surfaces the existing retryable challenge error on mobile — production security is not bypassed.

## 8. Campaign Media (G-M6)

`CampaignMedia` model (`url`, `caption`, `kind`) + `Campaign.media` parsed from `GET /consumer/campaigns/:id` (server already returns resolved URLs via `resolveMediaUrls`). Campaign Detail renders a horizontal gallery after the description: http(s)-only URLs, insertion order preserved, per-item `errorBuilder` fallback, captions ellipsized, malformed items dropped at parse. Hosted (signed-URL) and plain-URL media both render identically — the client never sees storage internals.

## 9. Android App Links (FD-M7 / G-M7)

- **Manifest:** `autoVerify` VIEW/BROWSABLE filter — `https://api-production-266c.up.railway.app` + `pathPrefix=/app/consumer` (the actual host QR PNGs encode; verified from `company.ts` URL generation and the live deployment docs).
- **Domain association:** `GET /.well-known/assetlinks.json` on the API — `android_app` statement for `com.tajribti.consumer` with the SHA-256 from `ANDROID_APP_LINKS_SHA256`; `[]` when unset. The fingerprint is an environment value because no release keystore exists in-repo (release builds currently use debug signing — a documented release gate).
- **In-app:** `/app/consumer` GoRoute → `QrEntryScreen` → `resolveQrCode` → `JourneySession.start(campaignId, qrSourceId)` → `/campaign`. Same resolution contract as the in-app scanner; attribution preserved.
- **Fallback:** when the app is absent or verification fails, the identical URL serves the web Consumer (`/app/consumer/?qr=`), which now also performs the campaign-bound OTP.
- **iOS:** URL-based routing is platform-neutral; universal links need only an `apple-app-site-association` counterpart + Xcode entitlement later — no redesign required.

## 10. Samples App Contamination Audit

Post-implementation scan of `mobile/consumer` (`reward|points|wallet|push|demo|refreshToken|qr/enter|qr/redeem|pointsEarned`):

- **VALID TECHNICAL MATCH:** `context.push(...)` calls (go_router navigation); `demographics`/`Demographics` (contains "demo"); comments documenting removed endpoints/fields and the old→new endpoint map in `api_client.dart`; Android debug/profile manifest comments ("breakpoints").
- **LEGACY PRODUCT CONTAMINATION:** none remaining. Zero consumer-visible reward/points/push strings or behavior; no refresh tokens, wallet, demo mode, or old QR mechanics.

## 11. Tests

**API (node:test, real HTTP + migrated SQLite):** 94 tests / 29 suites — **all passing.**

New files:
- `test/campaign-otp.test.ts` (10 tests): request→verify→eligibility round-trip; session-token-alone rejected; cross-campaign code invisible; scoped code fails unscoped verify; A-verification cannot authorize B; code replay + one-shot verification consumption; expired verification rejected; codes only for ACTIVE campaigns; TRIAL_REDEEMED resume round-trip (redeem → GET survey → submit → SURVEY_COMPLETE, exactly one participation, re-redeem 409); Akedly PoW round-trip with campaign binding.
- `test/app-links.test.ts` (2 tests): empty statement list without fingerprint; correct `android_app` statement with it.

Modified: `test/helpers.ts` (`grantCampaignVerification` fixture + assetlinks mount), `test/integrity.test.ts` (every eligibility call site now grants a campaign verification first), `test/innovation.test.ts` (same for its seeded journey).

**Mobile (Flutter):** `test/campaign_media_test.dart` added (media parsing order/captions, malformed-item tolerance, participation status passthrough). **Cannot execute on this host** — see Regression.

## 12. Regression

- API: **94/94 pass** (was 82; +10 FD-07a/FD-M3, +2 FD-M7). No existing test deleted or weakened; all eligibility-bearing tests now exercise the OTP gate.
- `tsc --noEmit`: clean. `prisma validate`/migrate: clean (migration applied to local `dev.db` only).
- Web consumer JS: `node --check` clean.
- AndroidManifest: `xmllint` valid.
- **BLOCKED — Flutter SDK requires macOS 14+; this host is macOS 13.** `flutter` and `dart analyze` fail VM init. Dart changes were statically reviewed (imports, null-safety, `firstOrNull` already in use elsewhere, no dangling references to removed keys verified by grep). Mobile tests must run in CI.

## 13. Benchmark Integrity

`governance/REFERENCE_PRODUCT_BENCHMARK.md` SHA-256 = `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` — **unchanged**, verified before and after implementation.

## 14. Files Changed

**API:** `prisma/schema.prisma`, `src/routes/consumerAuth.ts`, `src/routes/consumer.ts`, `src/routes/company.ts`, `src/server.ts`, `src/lib/appLinks.ts` (new), `test/helpers.ts`, `test/integrity.test.ts`, `test/innovation.test.ts`, `test/campaign-otp.test.ts` (new), `test/app-links.test.ts` (new), `prisma/migrations/20260921012924_campaign_otp_verification/` (new).

**Web:** `web/app/consumer/index.html` (campaign verification card + status-aware resume + media unchanged).

**Mobile:** `lib/core/l10n.dart`, `lib/core/api_client.dart`, `lib/core/models.dart`, `lib/app.dart`, `lib/screens/campaign_screen.dart`, `lib/screens/eligibility_screen.dart`, `lib/screens/otp_screen.dart`, `lib/screens/profile_screen.dart`, `lib/screens/home_screen.dart`, `lib/screens/activity_screen.dart`, `lib/screens/services_screen.dart`, `lib/screens/qr_entry_screen.dart` (new), `test/campaign_media_test.dart` (new), `android/app/src/main/AndroidManifest.xml`.

## 15. Database/Migration Changes

`20260921012924_campaign_otp_verification` — adds `OtpCode.campaignId` (nullable, indexed `[phone, campaignId]`) and `CampaignOtpVerification` (consumer/campaign FKs, `otpCodeId` provenance, expiry/consumption, indexed `[consumerId, campaignId]`). Applied to **local `dev.db` only**. Production migration requires explicit approval and was not run.

## 16. Remaining Gaps

- **Release signing + `ANDROID_APP_LINKS_SHA256`:** App Link auto-verification activates only once release signing exists and the fingerprint is set on the API environment — a release-gate dependency, not a code gap. Until then links open the web fallback (correct behavior).
- **Flutter verification:** compile/analyze/widget tests must run in CI (host macOS 13 < required 14).
- **OTP digit length:** the OTP entry UI is fixed at 6 boxes while the schema accepts 4–6 (pre-existing; depends on the Akedly pipeline's configured code length).
- **iOS universal links:** intentionally deferred per FD-M7.

## 17. Production Readiness

CONDITIONAL — code is complete and fully tested on the API/Web side; production deployment additionally requires: the migration applied to production, `ANDROID_APP_LINKS_SHA256` set after release signing, and a CI Flutter run on a supported host. No push, deploy, or production change was made.

## 18. Push/Deploy Status

No push. No deploy. No B-04. No production data or environment touched. Local migration only, reported above.
