# Tajribti Consumer App

Flutter mobile app for TAJRIBTI. RTL Arabic UI, QR code scanner, phone+OTP
authentication, and post-trial survey collection — plus a small companion
"Employee Mobile" view (Company employee login + campaign overview),
reachable from Settings.

Recovered from an earlier working implementation and rewired to the
current TAJRIBTI Benchmark Edition API (`../../api`) — see the header
comments in `lib/core/api_client.dart`, `lib/core/employee_api_client.dart`
and `lib/core/models.dart` for the exact old->current endpoint mapping and
what was dropped (email/password accounts, a CAPTCHA/proof-of-work
challenge step, refresh tokens, and a points/rewards system — none of
these exist in the current backend or Benchmark).

## Quick Start

```bash
# Install dependencies
flutter pub get

# Run on connected device or emulator (Android emulator default)
flutter run

# Run with custom API base (physical device on same LAN)
flutter run --dart-define=API_BASE=http://192.168.1.x:4000/api
```

## Requirements

- Flutter SDK ≥ 3.0.0
- Dart SDK ≥ 3.0.0 (bundled with Flutter)
- Android: API level 21+ (Android 5.0+), or iOS 12+
- Camera permission (for QR scanning)

## API Configuration

The app reads the backend URL from the `API_BASE` build-time constant. The
current API has no version prefix and listens on port 4000 by default
(see `api/src/server.ts`):

| Scenario | API_BASE value |
|----------|---------------|
| Android emulator | `http://10.0.2.2:4000/api` (default) |
| iOS simulator | `http://127.0.0.1:4000/api` |
| Physical device | `http://<your-machine-LAN-IP>:4000/api` |

Set it at build time:
```bash
flutter run --dart-define=API_BASE=http://192.168.1.50:4000/api
```

## Demo Credentials

- **Phone:** any valid format (e.g. `+201001234567`)
- **OTP:** no fixed demo code — the current backend has no SMS gateway
  integrated, so `POST /consumer/auth/otp/request` returns the real code
  directly in the response (`devOnlyCode`) and logs it server-side. There
  is no `DEMO_MODE` flag.
- **Company Employee login** (Settings → "Company Employee? Sign in"):
  use an employee email/password created via the Ops or Company console.

## Dependencies

| Package | Purpose |
|---------|---------|
| dio ^5.4.0 | HTTP client |
| mobile_scanner ^5.1.0 | QR camera scanner |
| shared_preferences ^2.2.2 | Token/session storage |
| go_router ^13.2.0 | Navigation |
| google_fonts ^6.1.0 | Cairo typeface |
| url_launcher ^6.3.0 | Support email/phone links |

## Build Commands

```bash
flutter pub get                    # install dependencies
flutter analyze                    # static analysis
flutter build apk --release        # Android APK
flutter build ios --release        # iOS (requires Mac + Xcode)
flutter install                    # install to connected device
```

## Android App Links

The manifest's App Links host is the build-time token `__APP_LINKS_HOST__`.
CI (`build-consumer-current.yml`) replaces it with the host derived from
`CURRENT_API_BASE` — the same host the API encodes into campaign QR URLs.
Until a real host is injected, the filter matches nothing and the web
Consumer is the fallback. Auto-verification additionally requires
`ANDROID_APP_LINKS_SHA256` (release-cert fingerprint) set on the API
environment for `/.well-known/assetlinks.json`.

## Known Limitations

- No email concept for Consumer identity (phone+OTP only, matching the
  current backend and the released web Consumer app exactly).
- iOS Universal Links deferred (FD-M7) — Android App Links only for now.
