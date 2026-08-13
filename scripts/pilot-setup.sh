#!/usr/bin/env bash
# ============================================================
# Tajribti Pilot Setup — Post-Deployment
# ============================================================
# Run this ONCE after deploying API + Dashboard to create the
# first real brand account and first real campaign.
#
# Prerequisites:
#   - API deployed and reachable at PILOT_API_URL
#   - DATABASE_URL set (schema auto-created by synchronize:true)
#   - DEMO_MODE=false in Railway env vars
#   - Twilio configured (for real OTP)
#
# Usage:
#   export PILOT_API_URL=https://your-api.railway.app/api/v1
#   export BRAND_EMAIL=brand@client.com
#   export BRAND_PASSWORD=SecurePassword123!
#   export BRAND_NAME="Client Brand Name"
#   bash scripts/pilot-setup.sh
# ============================================================

set -euo pipefail

PILOT_API_URL="${PILOT_API_URL:?Set PILOT_API_URL to https://your-api.railway.app/api/v1}"
BRAND_EMAIL="${BRAND_EMAIL:?Set BRAND_EMAIL}"
BRAND_PASSWORD="${BRAND_PASSWORD:?Set BRAND_PASSWORD}"
BRAND_NAME="${BRAND_NAME:?Set BRAND_NAME}"

echo ""
echo "================================================"
echo "  TAJRIBTI PILOT SETUP"
echo "  API: $PILOT_API_URL"
echo "================================================"

# ─── Step 1: Health check ─────────────────────────────────────────────────────

echo ""
echo "[1/5] Health check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$PILOT_API_URL/campaigns" 2>/dev/null || echo "000")
if [[ "$STATUS" != "401" && "$STATUS" != "200" ]]; then
  echo "  [✗] API not reachable (HTTP $STATUS). Check Railway deployment."
  exit 1
fi
echo "  [✓] API reachable (HTTP $STATUS)"

# ─── Step 2: Seed demo brand (optional — for demo.sh compatibility) ───────────

echo ""
echo "[2/5] Seeding demo brand (for commercial demo access)..."
SEED_RESULT=$(curl -s -X POST "$PILOT_API_URL/admin/seed" -H "Content-Type: application/json" 2>/dev/null)
echo "  $SEED_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  [✓] Demo seeded — campaign: {d.get(\"data\",{}).get(\"campaignId\",\"?\")}' if d.get('success') else f'  [!] Seed result: {d}')" 2>/dev/null || echo "  [!] Seed response: $SEED_RESULT"

# ─── Step 3: Create real brand account ────────────────────────────────────────

echo ""
echo "[3/5] Creating real brand account..."
echo "  Email: $BRAND_EMAIL"
echo "  Brand: $BRAND_NAME"
echo ""
echo "  NOTE: There is no self-registration API yet."
echo "  You must create the brand account directly in the database."
echo ""
echo "  Run this SQL on your Railway Postgres instance:"
echo ""
echo "  -- In Railway dashboard > Postgres > Query"
cat <<SQL
INSERT INTO brand_accounts (id, name, email, password, created_at)
SELECT
  gen_random_uuid(),
  '$BRAND_NAME',
  '$BRAND_EMAIL',
  '\$2b\$10\$REPLACE_WITH_BCRYPT_HASH',  -- bcrypt hash of: $BRAND_PASSWORD
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM brand_accounts WHERE email = '$BRAND_EMAIL');
SQL
echo ""
echo "  To generate the bcrypt hash, run:"
echo "  node -e \"const b=require('bcrypt');b.hash('$BRAND_PASSWORD',10).then(h=>console.log(h))\""
echo ""
echo "  Press Enter after inserting the brand account, or Ctrl+C to stop here."
read -r

# ─── Step 4: Test brand login ─────────────────────────────────────────────────

echo ""
echo "[4/5] Testing brand login..."
LOGIN_RESULT=$(curl -s -X POST "$PILOT_API_URL/auth/brand/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$BRAND_EMAIL\",\"password\":\"$BRAND_PASSWORD\"}" 2>/dev/null)

ACCESS_TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('accessToken','FAILED'))" 2>/dev/null || echo "FAILED")

if [[ "$ACCESS_TOKEN" == "FAILED" || -z "$ACCESS_TOKEN" ]]; then
  echo "  [✗] Brand login failed. Check password and brand account insertion."
  echo "  Response: $LOGIN_RESULT"
  exit 1
fi
echo "  [✓] Brand login successful"
echo "  Access token: ${ACCESS_TOKEN:0:20}..."

# ─── Step 5: Summary ──────────────────────────────────────────────────────────

echo ""
echo "================================================"
echo "  PILOT SETUP COMPLETE"
echo "================================================"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Log in to the brand dashboard:"
echo "     URL:      $( echo "$PILOT_API_URL" | sed 's|/api/v1||' | sed 's|api\.|dashboard.|' )"
echo "     Email:    $BRAND_EMAIL"
echo "     Password: $BRAND_PASSWORD"
echo ""
echo "  2. Create a campaign via API:"
cat <<CMD
  curl -X POST $PILOT_API_URL/campaigns \\
    -H "Authorization: Bearer $ACCESS_TOKEN" \\
    -H "Content-Type: application/json" \\
    -d '{
      "brandName": "$BRAND_NAME",
      "productName": "YOUR PRODUCT NAME",
      "locationName": "DISTRIBUTION LOCATION",
      "rewardPoints": 100,
      "targetCount": 50
    }'
CMD
echo ""
echo "  3. Generate QR code:"
echo "     GET $PILOT_API_URL/qr/generate/{campaignId}"
echo "     Authorization: Bearer $ACCESS_TOKEN"
echo ""
echo "  4. Print the QR on product packaging and distribute."
echo ""
echo "  5. Consumer scans QR → phone camera opens:"
echo "     https://your-dashboard.vercel.app/join/{campaignId}"
echo ""
