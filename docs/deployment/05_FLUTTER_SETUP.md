# Flutter Setup

Sets up and runs the consumer mobile app (`apps/consumer/`).

---

## Step 1 — Install Flutter SDK

### macOS (recommended)

```bash
brew install --cask flutter
```

Or download manually from https://docs.flutter.dev/get-started/install/macos

### Verify Installation

```bash
flutter doctor
```

All items relevant to your target platform must show `✓`. Acceptable to have warnings about Xcode CocoaPods or Chrome — those are not needed for the demo.

Required `flutter doctor` checks:
- `[✓] Flutter` — SDK installed
- `[✓] Android toolchain` — for Android device/emulator
- `[✓] Android Studio` — for emulator management
- `[✓] Connected device` — shows your device or emulator

---

## Step 2 — Install App Dependencies

```bash
cd apps/consumer
flutter pub get
```

---

## Step 3 — Start a Device or Emulator

### Option A — Android Emulator (recommended for demos with no physical device)

1. Open Android Studio
2. Go to **Device Manager** → **Create Device**
3. Choose a phone with camera support (e.g., Pixel 6)
4. Select an Android 13+ system image
5. Click **Start** to launch the emulator

The emulator must have camera access enabled. In the emulator controls, go to **Extended controls → Camera** and verify it is enabled.

### Option B — Physical Android Device

1. Enable Developer Options on the device: **Settings → About Phone → tap Build Number 7 times**
2. Enable USB Debugging: **Settings → Developer Options → USB Debugging**
3. Connect via USB
4. Verify: `flutter devices` — your device should appear

### Option C — iOS Simulator (macOS only)

```bash
open -a Simulator
```

Note: iOS Simulator camera does not work for real QR scanning. Use a physical device for the QR scan step of the demo.

---

## Step 4 — Configure the API Base URL

**Android emulator** — default works, no change needed:
```
http://10.0.2.2:3000/api/v1
```
`10.0.2.2` maps to the host machine's localhost from inside the Android emulator.

**Physical device or iOS** — use your machine's LAN IP:
```bash
# Find your machine's LAN IP
ipconfig getifaddr en0    # macOS WiFi
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Pass it at run time:
```bash
flutter run --dart-define=API_BASE=http://192.168.1.50:3000/api/v1
```

The device and the backend machine must be on the same WiFi network.

---

## Step 5 — Run the App

```bash
cd apps/consumer

# Android emulator (default API_BASE — no dart-define needed)
flutter run

# Physical device or iOS (replace IP with your machine's LAN IP)
flutter run --dart-define=API_BASE=http://192.168.1.50:3000/api/v1
```

**Expected:** The app launches showing the Tajribti splash screen, then navigates to the phone number entry screen.

---

## Step 6 — Verify Camera Permission

When the QR scan screen is first opened, Android will request camera permission. Tap **Allow**. If denied, go to device Settings → Apps → Tajribti → Permissions → Camera → Allow.

---

## App Display Name

The app displays as **"تجربتي"** (Arabic for Tajribti) on the device home screen.

---

## Known Limitation — No Flutter SDK on CI Machine

The Consumer app was written and validated at source level on a machine without a Flutter SDK. `flutter analyze` and `flutter run` must be executed by the operator on a machine with Flutter installed.

Proceed to → [06_DEMO_DATA_SETUP.md](06_DEMO_DATA_SETUP.md)
