#!/usr/bin/env bash
# Seeds the database with 49 demo consumers, brand account, campaign, and QR code.
# Usage:
#   bash scripts/seed-demo.sh            — seed (fails with 409 if already seeded)
#   bash scripts/seed-demo.sh --reset    — reset existing seed, then re-seed

set -euo pipefail

API_BASE="${API_BASE:-http://localhost:3000/api/v1}"
ADMIN_SECRET="${ADMIN_SECRET:-}"
RESET=false

for arg in "$@"; do
  [[ "$arg" == "--reset" ]] && RESET=true
done

wait_for_api() {
  local retries=10
  local delay=2
  echo "Waiting for backend at $API_BASE ..."
  for i in $(seq 1 $retries); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "${API_BASE}/admin/seed" 2>/dev/null || echo "000")
    if [[ "$STATUS" == "200" || "$STATUS" == "404" || "$STATUS" == "405" || "$STATUS" == "409" ]]; then
      echo "Backend is reachable."
      return 0
    fi
    echo "  Attempt $i/$retries — retrying in ${delay}s..."
    sleep "$delay"
  done
  echo "ERROR: Backend at $API_BASE is not reachable after $((retries * delay))s."
  echo "       Start the backend first: cd apps/api && npm run start:dev"
  exit 1
}

do_seed() {
  if [[ -z "$ADMIN_SECRET" ]]; then
    echo "[✗] ADMIN_SECRET is not set. Export it before running this script."
    exit 1
  fi

  echo ""
  echo "Seeding demo data..."
  RESPONSE=$(curl -s -X POST "${API_BASE}/admin/seed" \
    -H "Content-Type: application/json" \
    -H "x-admin-secret: ${ADMIN_SECRET}")

  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo ""
    echo "[✓] Seed completed successfully."
    CAMPAIGN_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['campaignId'])" 2>/dev/null || echo "parse error")
    QR_CODE=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['qrCode'])" 2>/dev/null || echo "parse error")
    echo ""
    echo "  Campaign ID : $CAMPAIGN_ID"
    echo "  QR code     : $QR_CODE"
    echo ""
    echo "  Brand login : demo@brand.com / Demo1234!"
    echo "  Dashboard   : http://localhost:3001"
  elif echo "$RESPONSE" | grep -q '"statusCode":409'; then
    echo ""
    echo "[!] Demo data already seeded."
    echo "    To re-seed: bash scripts/seed-demo.sh --reset"
    exit 0
  else
    echo ""
    echo "[✗] Seed failed. See response above."
    exit 1
  fi
}

do_reset() {
  if [[ -z "$ADMIN_SECRET" ]]; then
    echo "[✗] ADMIN_SECRET is not set. Export it before running this script."
    exit 1
  fi

  echo "Resetting demo data..."
  RESET_RESPONSE=$(curl -s -X POST "${API_BASE}/admin/seed/reset" \
    -H "Content-Type: application/json" \
    -H "x-admin-secret: ${ADMIN_SECRET}")
  echo "$RESET_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESET_RESPONSE"
  echo "[✓] Reset complete."
  echo ""
}

wait_for_api

if [[ "$RESET" == "true" ]]; then
  do_reset
fi

do_seed
