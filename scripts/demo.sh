#!/usr/bin/env bash
# One-command demo orchestrator with optional client personalization.
#
# Usage:
#   bash scripts/demo.sh
#   bash scripts/demo.sh --brand "Coca-Cola Egypt" --product "Coca-Cola Zero Sugar" --location "City Stars Mall"
#
# Flags:
#   --brand      DEMO_BRAND_NAME    (default: Sprite Zero Egypt)
#   --product    DEMO_PRODUCT_NAME  (default: Sprite Zero Sugar)
#   --location   DEMO_LOCATION_NAME (default: City Stars Mall — Ground Floor Atrium)
#
# Security:
#   Values are written to apps/api/.env only — never committed to git.
#   Do NOT pass real client credentials or API keys via these flags.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_ENV="$REPO_ROOT/apps/api/.env"

# ─── Defaults ─────────────────────────────────────────────────────────────────

BRAND_NAME="Sprite Zero Egypt"
PRODUCT_NAME="Sprite Zero Sugar"
LOCATION_NAME="City Stars Mall — Ground Floor Atrium"

# ─── Arg parsing ──────────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --brand)    BRAND_NAME="$2";    shift 2 ;;
    --product)  PRODUCT_NAME="$2";  shift 2 ;;
    --location) LOCATION_NAME="$2"; shift 2 ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: bash scripts/demo.sh [--brand NAME] [--product NAME] [--location NAME]"
      exit 1
      ;;
  esac
done

# ─── Helpers ──────────────────────────────────────────────────────────────────

step() { echo ""; echo "[$1/5] $2"; }

patch_env() {
  local key="$1"
  local value="$2"

  if [[ ! -f "$API_ENV" ]]; then
    echo "  [✗] $API_ENV not found. Run: bash scripts/setup-demo.sh"
    exit 1
  fi

  if grep -q "^${key}=" "$API_ENV" 2>/dev/null; then
    # Quote value so 'source .env' handles spaces and special chars
    sed -i '' "s|^${key}=.*|${key}=\"${value}\"|" "$API_ENV"
  else
    echo "${key}=\"${value}\"" >> "$API_ENV"
  fi
}

# ─── Step 1: Configure brand identity ─────────────────────────────────────────

step 1 "Configuring brand identity..."
echo "  Brand    : $BRAND_NAME"
echo "  Product  : $PRODUCT_NAME"
echo "  Location : $LOCATION_NAME"

patch_env "DEMO_BRAND_NAME"    "$BRAND_NAME"
patch_env "DEMO_PRODUCT_NAME"  "$PRODUCT_NAME"
patch_env "DEMO_LOCATION_NAME" "$LOCATION_NAME"

echo "  [✓] Written to apps/api/.env (not committed)"

# ─── Step 2: Verify environment ───────────────────────────────────────────────

# Release demo ports before env check so verify-env.sh sees them as free
for PORT in 3000 3001; do
  PIDS=$(lsof -ti ":$PORT" 2>/dev/null || true)
  if [[ -n "$PIDS" ]]; then
    echo "  Releasing port $PORT (PID: $PIDS)..."
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
done

step 2 "Verifying environment..."
if ! bash "$REPO_ROOT/scripts/verify-env.sh"; then
  echo ""
  echo "  Fix environment issues above before running the demo."
  exit 1
fi

# ─── Step 3: Start services ───────────────────────────────────────────────────

step 3 "Starting backend and dashboard..."
bash "$REPO_ROOT/scripts/run-demo.sh"

# ─── Step 4: Seed demo data ───────────────────────────────────────────────────

step 4 "Seeding demo data (reset + reseed)..."
bash "$REPO_ROOT/scripts/seed-demo.sh" --reset

# ─── Step 5: Health check ─────────────────────────────────────────────────────

step 5 "Running health check..."
bash "$REPO_ROOT/scripts/health-check.sh"

# ─── Ready banner ─────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║          TAJRIBTI DEMO READY                         ║"
echo "╠══════════════════════════════════════════════════════╣"
printf "║  Brand    : %-40s║\n" "$BRAND_NAME"
printf "║  Product  : %-40s║\n" "$PRODUCT_NAME"
printf "║  Location : %-40s║\n" "$LOCATION_NAME"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  Signals  : 49 seeded (simulated, not real data)     ║"
echo "║  Dashboard: http://localhost:3001                    ║"
echo "║  Login    : demo@brand.com / Demo1234!               ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  To restore canonical demo:                          ║"
echo "║    bash scripts/demo.sh                              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
