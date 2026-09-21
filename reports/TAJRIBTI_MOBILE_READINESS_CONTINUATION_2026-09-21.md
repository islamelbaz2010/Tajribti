# TAJRIBTI — MOBILE READINESS CONTINUATION — 2026-09-21

**Pass:** Post-Web-gate main execution track — mobile production-readiness
continuation.
**Baseline:** `933c342c0874f7d3daef4f6639f892a3fae2837f` (Web Readiness
checkpoint, branch `master` → `origin/benchmark-current`).
**Benchmark:** `governance/REFERENCE_PRODUCT_BENCHMARK.md` — unchanged,
SHA-256 `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a`.

## 1. What This Pass Is

The prior pass (`TAJRIBTI_MOBILE_FINAL_CORRECTIVE_IMPLEMENTATION_2026-09-21.md`)
already implemented all Founder-approved mobile behavior: campaign-bound OTP
(FD-07a), PoW-only mobile security (FD-M5), Android App Links (FD-M7),
partial-participation resume (FD-M3), push/rewards removal (G-M1/G-M2), and
campaign media (G-M6). This continuation audited that state against current
repository evidence and closed the two **locally fixable** correctness gaps
it left behind. Nothing was rebuilt or redesigned.

## 2. Gap Audit Result

Every item in the known-corrective checklist was verified against code:

| Item | State |
|---|---|
| Campaign-bound OTP / `CampaignOtpVerification` | implemented + tested (10 tests) |
| Cross-campaign OTP isolation / expiry / atomic consumption | implemented + tested |
| PoW-only mobile, Turnstile absent | verified — only comments reference Turnstile |
| Android App Links + `assetlinks.json` endpoint | implemented + tested; host corrected this pass |
| Resume (ENTERED/TRIAL_REDEEMED), no duplicates | implemented + tested |
| Push / rewards removal | verified — no product residue |
| Campaign media rendering + graceful failure | implemented + tested |
| Arabic/English + RTL | verified (`Directionality`, `l10n`) |
| QR entry / attribution / session handling | implemented + tested |

Two defects found and fixed this pass:

1. **OTP digit dead-end (fixed).** The backend accepts 4–6 digit codes
   (`consumerAuth.ts`: "Akedly pipelines may issue 4–6 digit codes — never
   hardcode 6"), but the mobile OTP screen auto-verified only at exactly 6
   and had no manual submit — a 4- or 5-digit production code dead-ended the
   consumer. The screen now enables a **Continue** button at ≥4 digits;
   6-digit auto-verify is unchanged. (Web Consumer was checked: its
   `maxlength=6` input caps but does not require 6 — already compatible.)

2. **App Links host pointed at the legacy API (fixed).** The manifest
   hardcoded `api-production-266c.up.railway.app` — the legacy pre-Benchmark
   backend the CI workflow explicitly forbids. QR entry URLs are generated
   host-dynamically (`company.ts`: `req.protocol` + request `host`), so the
   correct claim is whatever host the *current* deployment lives on — which
   is not yet known in-repo. The manifest now carries the build-time token
   `__APP_LINKS_HOST__`, injected in CI from `CURRENT_API_BASE`
   (new "Inject App Links host" step in `build-consumer-current.yml`,
   after the manifest-restore step). Until injected it matches nothing —
   fail-closed to the web fallback. `assetlinks.json` was already
   host-dynamic and needed no change.

3. **Stale README limitation (corrected).** "No ELIGIBILITY-stage
   screener-question UI" predated `eligibility_form.dart`; removed and
   replaced with the App Links configuration note.

## 3. Files Changed

| File | Why |
|---|---|
| `mobile/consumer/lib/screens/otp_screen.dart` | 4–6 digit OTP entry — manual verify button, auto-verify at 6 |
| `mobile/consumer/android/app/src/main/AndroidManifest.xml` | `__APP_LINKS_HOST__` placeholder instead of legacy host |
| `.github/workflows/build-consumer-current.yml` | Inject App Links host from `CURRENT_API_BASE` |
| `mobile/consumer/README.md` | App Links config documented; stale limitation removed |

No API, web, schema, or governance file was touched.

## 4. Samples App Reuse

None this pass — no reuse was needed. The archive remains reference-only;
zero Samples App product features were inherited.

## 5. Verification

- AndroidManifest.xml: `xmllint` clean.
- Workflow YAML: parses clean.
- `git diff` inspected — only the four intended files.
- API suite: unchanged code, remains at 98/98 from the Web gate.
- **Flutter analyze/test: not runnable on this host** — even `dart pub get`
  fails VM init (Dart SDK 3.12.2 requires macOS ≥ 14; host is macOS 13).
  This is a CI gate, not a code defect; the Dart changes are statically
  reviewed (existing imports/widgets only, `continueBtn` key exists, button
  pattern matches other screens). No test result was fabricated.

## 6. CI Status

`build-consumer-current.yml` verified correct for the current line:
`ubuntu-latest`, Flutter 3.44.8, `flutter analyze --no-fatal-infos
--no-fatal-warnings`, `flutter test`, release APK build with
`--dart-define=API_BASE=$CURRENT_API_BASE/api`, fails fast when the
repository variable is unset. It runs on `benchmark-current` pushes touching
`mobile/consumer/**` or via `workflow_dispatch`. It was **not triggered**.

## 7. Remaining Blockers (all non-code)

1. `CURRENT_API_BASE` repository variable — requires the current API's real
   deployed HTTPS URL (no current deployment exists yet).
2. Release signing keystore + `ANDROID_APP_LINKS_SHA256` env on the API —
   release-gate dependency; without it App Links fail closed to web.
3. First CI run on a supported runner — `flutter analyze` + `flutter test`
   including `campaign_media_test.dart`, `eligibility_form_test.dart`,
   `widget_test.dart`.
4. Production DB migrations (campaign-otp-verification + review-note) —
   require explicit deployment approval.
5. iOS Universal Links — deferred per FD-M7.
6. B-04 QR load test — deferred per FD-WEB-16.

## 8. Final State

- No push. No deploy. No production change. No APK built. No mobile
  workflow triggered.
- Mobile code is as ready as this host can prove; every remaining item is
  an infrastructure/release gate requiring explicit authorization.
