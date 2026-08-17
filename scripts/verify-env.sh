#!/usr/bin/env bash
# Verifies that all required environment files and variables are present.
# Run from the repository root: bash scripts/verify-env.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PASS=0
FAIL=0

pass() { echo "  [✓] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [✗] $1"; FAIL=$((FAIL + 1)); }
section() { echo ""; echo "=== $1 ==="; }

# ─── Backend ────────────────────────────────────────────────────────────────

section "Backend (apps/api/.env)"

API_ENV="$REPO_ROOT/apps/api/.env"

if [[ -f "$API_ENV" ]]; then
  pass ".env file exists"
  # shellcheck disable=SC1090
  source "$API_ENV" 2>/dev/null || true

  [[ -n "${DATABASE_URL:-}" ]] && \
    [[ "$DATABASE_URL" != *"YOUR_PASSWORD"* ]] && \
    [[ "$DATABASE_URL" != *"REPLACE"* ]] && \
    pass "DATABASE_URL is set" || fail "DATABASE_URL is missing or still a placeholder"

  [[ -n "${JWT_SECRET:-}" ]] && \
    [[ "$JWT_SECRET" != *"REPLACE"* ]] && \
    pass "JWT_SECRET is set" || fail "JWT_SECRET is missing or still a placeholder"

  [[ -n "${JWT_REFRESH_SECRET:-}" ]] && \
    [[ "$JWT_REFRESH_SECRET" != *"REPLACE"* ]] && \
    pass "JWT_REFRESH_SECRET is set" || fail "JWT_REFRESH_SECRET is missing or still a placeholder"

  if [[ -n "${JWT_SECRET:-}" && -n "${JWT_REFRESH_SECRET:-}" && \
        "$JWT_SECRET" != *"REPLACE"* && "$JWT_REFRESH_SECRET" != *"REPLACE"* ]]; then
    [[ "$JWT_SECRET" != "$JWT_REFRESH_SECRET" ]] && \
      pass "JWT_SECRET ≠ JWT_REFRESH_SECRET" || fail "JWT_SECRET and JWT_REFRESH_SECRET must be different"
  fi

  [[ "${DEMO_MODE:-}" == "true" ]] && \
    pass "DEMO_MODE=true" || fail "DEMO_MODE must be 'true' for demo"
else
  fail ".env file missing — run: cp apps/api/.env.example apps/api/.env"
  FAIL=$((FAIL + 4))
fi

# ─── Dashboard ───────────────────────────────────────────────────────────────

section "Dashboard (apps/dashboard/.env)"

DASH_ENV="$REPO_ROOT/apps/dashboard/.env"

if [[ -f "$DASH_ENV" ]]; then
  pass ".env file exists"
  # read without sourcing to avoid overwriting API vars
  DASH_PORT=$(grep -E "^PORT=" "$DASH_ENV" | cut -d= -f2 | tr -d '[:space:]' || true)
  DASH_API_URL=$(grep -E "^REACT_APP_API_URL=" "$DASH_ENV" | cut -d= -f2 | tr -d '[:space:]' || true)

  [[ "$DASH_PORT" == "3001" ]] && \
    pass "PORT=3001" || fail "PORT must be 3001 (API uses 3000; CORS requires dashboard on 3001)"

  [[ -n "$DASH_API_URL" ]] && \
    pass "REACT_APP_API_URL is set ($DASH_API_URL)" || fail "REACT_APP_API_URL is missing"
else
  fail ".env file missing — run: cp apps/dashboard/.env.example apps/dashboard/.env"
  FAIL=$((FAIL + 2))
fi

# ─── Node.js ─────────────────────────────────────────────────────────────────

section "Node.js"

if command -v node &>/dev/null; then
  NODE_VER=$(node --version | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
  if [[ "$NODE_MAJOR" -ge 18 ]]; then
    pass "Node.js v$NODE_VER (≥ 18)"
  else
    fail "Node.js v$NODE_VER — must be ≥ 18"
  fi
else
  fail "Node.js not installed"
fi

# ─── Dependencies ────────────────────────────────────────────────────────────

section "Dependencies"

[[ -d "$REPO_ROOT/apps/api/node_modules" ]] && \
  pass "apps/api/node_modules present" || fail "apps/api/node_modules missing — run: cd apps/api && npm install"

[[ -d "$REPO_ROOT/apps/dashboard/node_modules" ]] && \
  pass "apps/dashboard/node_modules present" || fail "apps/dashboard/node_modules missing — run: cd apps/dashboard && npm install"

# ─── Flutter ─────────────────────────────────────────────────────────────────

section "Flutter (optional — required for consumer app)"

if command -v flutter &>/dev/null; then
  FLUTTER_VER=$(flutter --version 2>/dev/null | head -1 || true)
  pass "Flutter installed: $FLUTTER_VER"
else
  echo "  [!] Flutter not installed — consumer app cannot be run on this machine"
  echo "      Install: brew install --cask flutter"
fi

# ─── Ports ───────────────────────────────────────────────────────────────────

section "Port availability"

if lsof -i :3000 &>/dev/null; then
  fail "Port 3000 is in use — kill the process before starting the backend"
else
  pass "Port 3000 is free"
fi

if lsof -i :3001 &>/dev/null; then
  fail "Port 3001 is in use — kill the process before starting the dashboard"
else
  pass "Port 3001 is free"
fi

# ─── Summary ─────────────────────────────────────────────────────────────────

echo ""
echo "========================================"
echo "  PASS: $PASS   FAIL: $FAIL"
echo "========================================"

if [[ "$FAIL" -eq 0 ]]; then
  echo "  Environment is ready."
  exit 0
else
  echo "  Fix the items above before proceeding."
  exit 1
fi
