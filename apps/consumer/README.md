# Tajribti Consumer App

Flutter mobile app for the Tajribti Commercial Demo. RTL Arabic UI, QR code scanner, OTP authentication, and survey collection.

## Quick Start

```bash
# Install dependencies
flutter pub get

# Run on connected device or emulator (Android emulator default)
flutter run

# Run with custom API base (physical device on same LAN)
flutter run --dart-define=API_BASE=http://192.168.1.x:3000/api/v1
```

## Requirements

- Flutter SDK ≥ 3.0.0
- Dart SDK ≥ 3.0.0 (bundled with Flutter)
- Android: API level 21+ (Android 5.0+), or iOS 12+
- Camera permission (for QR scanning)

## API Configuration

The app reads the backend URL from the `API_BASE` build-time constant:

| Scenario | API_BASE value |
|----------|---------------|
| Android emulator | `http://10.0.2.2:3000/api/v1` (default) |
| iOS simulator | `http://127.0.0.1:3000/api/v1` |
| Physical device | `http://<your-machine-LAN-IP>:3000/api/v1` |

Set it at build time:
```bash
flutter run --dart-define=API_BASE=http://192.168.1.50:3000/api/v1
```

## Demo Credentials

- **Phone:** any valid format (e.g. `+201001234567`)
- **OTP:** `0000` (when `DEMO_MODE=true` on the backend)

## Dependencies

| Package | Purpose |
|---------|---------|
| dio ^5.4.0 | HTTP client |
| mobile_scanner ^5.1.0 | QR camera scanner |
| shared_preferences ^2.2.2 | JWT token storage |
| go_router ^13.2.0 | Navigation |

## Build Commands

```bash
flutter pub get                    # install dependencies
flutter analyze                    # static analysis
flutter build apk --release        # Android APK
flutter build ios --release        # iOS (requires Mac + Xcode)
flutter install                    # install to connected device
```

See `docs/deployment/05_FLUTTER_SETUP.md` in the repository root for full setup instructions.
