#!/usr/bin/env bash
# Checks that the backend and dashboard are running and reachable.
# Usage: bash scripts/health-check.sh

set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"
DASH_URL="${DASH_URL:-http://localhost:3001}"

PASS=0
FAIL=0

check() {
  local label="$1"
  local url="$2"
  local status

  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")

  if [[ "$status" == "200" || "$status" == "404" || "$status" == "405" ]]; then
    # 404/405 from the API means routing is live — the server is running
    echo "  [✓] $label — $url (HTTP $status)"
    PASS=$((PASS + 1))
  else
    echo "  [✗] $label — $url (HTTP $status — not reachable)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "=== Health Check ==="

check "Backend API" "$API_URL/api/v1/admin/seed"
check "Dashboard  " "$DASH_URL"

echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "  All services are running."
  echo ""
  echo "  Brand dashboard : $DASH_URL"
  echo "  API base        : $API_URL/api/v1"
else
  echo "  $FAIL service(s) not reachable."
  echo ""
  echo "  Start backend  : cd apps/api && npm run start:dev"
  echo "  Start dashboard: cd apps/dashboard && npm start"
  echo ""
  echo "  See docs/deployment/08_TROUBLESHOOTING.md for help."
fi

echo ""

[[ "$FAIL" -eq 0 ]] && exit 0 || exit 1
