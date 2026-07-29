# Prerequisites

Everything that must be installed on the operator's machine before any other setup step.

---

## Required for Backend + Dashboard

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 18.x LTS | https://nodejs.org or `brew install node` |
| npm | 9.x | Bundled with Node.js |
| Git | any | `brew install git` |

Verify:
```bash
node --version    # must print v18.x or higher
npm --version     # must print 9.x or higher
```

---

## Required for Flutter Consumer App

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Flutter SDK | 3.0.0 | See [05_FLUTTER_SETUP.md](05_FLUTTER_SETUP.md) |
| Android Studio | 2022.x+ | For emulator and Android SDK |
| Xcode (macOS only) | 14+ | For iOS simulator and device |

Verify after Flutter install:
```bash
flutter doctor     # all required items must show ✓
```

---

## Required for Database

A live **PostgreSQL 14+** instance. The demo uses **Supabase** (free tier is sufficient).

See [02_SUPABASE_SETUP.md](02_SUPABASE_SETUP.md) for full instructions.

---

## Required for AI Report (Optional)

At least one of the following API keys. If neither is set, the system generates a structured fallback narrative automatically — the demo still works.

| Provider | Key variable |
|----------|-------------|
| Anthropic | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |

---

## Port Availability

Before starting the demo, confirm these ports are free:

```bash
lsof -i :3000    # must be empty — API uses this port
lsof -i :3001    # must be empty — Dashboard uses this port
```

Kill any process occupying either port before proceeding.

---

## macOS Quick Install (Homebrew)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node git
brew install --cask flutter android-studio
```

---

## Next Step

→ [02_SUPABASE_SETUP.md](02_SUPABASE_SETUP.md)
