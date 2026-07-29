#!/usr/bin/env bash
# Full first-time setup for a new machine.
# Guides the operator through every step needed to run the commercial demo.
#
# Usage: bash scripts/setup-demo.sh
#
# This script does NOT start the backend or seed data.
# After running this script:
#   1. Fill in apps/api/.env (DATABASE_URL, JWT secrets)
#   2. Run: bash scripts/run-demo.sh
#   3. Run: bash scripts/seed-demo.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo "========================================"
echo "  Tajribti Demo — First-Time Setup"
echo "========================================"

# ─── Node.js check ───────────────────────────────────────────────────────────

echo ""
echo "[1/6] Checking Node.js..."
if ! command -v node &>/dev/null; then
  echo "  [✗] Node.js not installed."
  echo "      Install from https://nodejs.org or: brew install node"
  exit 1
fi
NODE_MAJOR=$(node --version | sed 's/v//' | cut -d. -f1)
if [[ "$NODE_MAJOR" -lt 18 ]]; then
  echo "  [✗] Node.js $(node --version) — must be ≥ 18"
  echo "      Upgrade from https://nodejs.org"
  exit 1
fi
echo "  [✓] Node.js $(node --version)"

# ─── Install npm dependencies ─────────────────────────────────────────────────

echo ""
echo "[2/6] Installing backend dependencies..."
cd "$REPO_ROOT/apps/api"
if [[ -d node_modules ]]; then
  echo "  [✓] node_modules already present — skipping"
else
  npm install
  echo "  [✓] Backend dependencies installed"
fi

echo ""
echo "[3/6] Installing dashboard dependencies..."
cd "$REPO_ROOT/apps/dashboard"
if [[ -d node_modules ]]; then
  echo "  [✓] node_modules already present — skipping"
else
  npm install
  echo "  [✓] Dashboard dependencies installed"
fi

# ─── Create .env files ────────────────────────────────────────────────────────

echo ""
echo "[4/6] Creating environment files..."

API_ENV="$REPO_ROOT/apps/api/.env"
DASH_ENV="$REPO_ROOT/apps/dashboard/.env"

if [[ -f "$API_ENV" ]]; then
  echo "  [✓] apps/api/.env already exists — not overwriting"
else
  cp "$REPO_ROOT/apps/api/.env.example" "$API_ENV"
  echo "  [✓] apps/api/.env created from .env.example"
fi

if [[ -f "$DASH_ENV" ]]; then
  echo "  [✓] apps/dashboard/.env already exists — not overwriting"
else
  cp "$REPO_ROOT/apps/dashboard/.env.example" "$DASH_ENV"
  echo "  [✓] apps/dashboard/.env created from .env.example"
fi

# ─── Generate JWT secret helper ───────────────────────────────────────────────

echo ""
echo "[5/6] JWT secret generation..."
echo ""
echo "  Run these two commands and paste the results into apps/api/.env:"
echo ""
echo "  JWT_SECRET:"
node -e "console.log('  ' + require('crypto').randomBytes(64).toString('hex'))"
echo ""
echo "  JWT_REFRESH_SECRET (different value):"
node -e "console.log('  ' + require('crypto').randomBytes(64).toString('hex'))"

# ─── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "[6/6] Remaining manual steps (cannot be automated):"
echo ""
echo "  a) Create a Supabase project at https://supabase.com"
echo "     Get the PostgreSQL connection string from:"
echo "     Project Settings → Database → Connection string (URI)"
echo ""
echo "  b) Open apps/api/.env and fill in:"
echo "     DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
echo "     JWT_SECRET=<generated above>"
echo "     JWT_REFRESH_SECRET=<generated above — must be different>"
echo "     DEMO_MODE=true   ← verify this is set"
echo ""
echo "  c) (Optional) Install Flutter SDK for the consumer app:"
echo "     brew install --cask flutter"
echo "     See docs/deployment/05_FLUTTER_SETUP.md"
echo ""
echo "========================================"
echo "  After completing steps a-b, run:"
echo "    bash scripts/verify-env.sh    — confirm environment is ready"
echo "    bash scripts/run-demo.sh      — start backend and dashboard"
echo "    bash scripts/seed-demo.sh     — load demo data"
echo "========================================"
echo ""
echo "  Full documentation: docs/deployment/"
echo ""
