#!/usr/bin/env bash
# Starts the backend and dashboard in background processes.
# Waits for both to be reachable, then opens the dashboard in the browser.
#
# Usage: bash scripts/run-demo.sh
#
# NOTE: This script does NOT start the Flutter consumer app.
#       Run the consumer app separately: cd apps/consumer && flutter run

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$REPO_ROOT/apps/api"
DASH_DIR="$REPO_ROOT/apps/dashboard"
LOG_DIR="$REPO_ROOT/.demo-logs"

mkdir -p "$LOG_DIR"

# ─── Pre-flight ───────────────────────────────────────────────────────────────

if ! bash "$REPO_ROOT/scripts/verify-env.sh"; then
  echo ""
  echo "Fix environment issues above before running the demo."
  exit 1
fi

# ─── Kill any existing processes on demo ports ────────────────────────────────

for PORT in 3000 3001; do
  PIDS=$(lsof -ti ":$PORT" 2>/dev/null || true)
  if [[ -n "$PIDS" ]]; then
    echo "Killing existing process on port $PORT (PID: $PIDS)..."
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
done

# ─── Start Backend ────────────────────────────────────────────────────────────

echo ""
echo "Starting backend..."
cd "$API_DIR"
npm run start:dev > "$LOG_DIR/api.log" 2>&1 &
API_PID=$!
echo "  Backend PID: $API_PID (log: $LOG_DIR/api.log)"

# Wait for backend to be ready
echo "  Waiting for backend..."
RETRIES=90
for i in $(seq 1 $RETRIES); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "http://localhost:3000/api/v1/admin/seed" 2>/dev/null || echo "000")
  if [[ "$STATUS" == "405" || "$STATUS" == "409" || "$STATUS" == "200" || "$STATUS" == "404" ]]; then
    echo "  [✓] Backend ready (HTTP $STATUS)"
    break
  fi
  if [[ "$i" -eq "$RETRIES" ]]; then
    echo "  [✗] Backend did not start in time."
    echo "      Check $LOG_DIR/api.log for errors."
    tail -20 "$LOG_DIR/api.log"
    exit 1
  fi
  sleep 2
done

# ─── Start Dashboard ─────────────────────────────────────────────────────────

echo ""
echo "Starting dashboard..."
cd "$DASH_DIR"
BROWSER=none npm start > "$LOG_DIR/dashboard.log" 2>&1 &
DASH_PID=$!
echo "  Dashboard PID: $DASH_PID (log: $LOG_DIR/dashboard.log)"

# Wait for dashboard to be ready
echo "  Waiting for dashboard..."
for i in $(seq 1 $RETRIES); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "http://localhost:3001" 2>/dev/null || echo "000")
  if [[ "$STATUS" == "200" ]]; then
    echo "  [✓] Dashboard ready"
    break
  fi
  if [[ "$i" -eq "$RETRIES" ]]; then
    echo "  [✗] Dashboard did not start in time."
    echo "      Check $LOG_DIR/dashboard.log for errors."
    tail -20 "$LOG_DIR/dashboard.log"
    exit 1
  fi
  sleep 2
done

# ─── Open Browser ─────────────────────────────────────────────────────────────

echo ""
echo "Opening dashboard in browser..."
if command -v open &>/dev/null; then
  open "http://localhost:3001"
elif command -v xdg-open &>/dev/null; then
  xdg-open "http://localhost:3001"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "========================================"
echo "  Demo is running"
echo "========================================"
echo "  Dashboard : http://localhost:3001"
echo "  API       : http://localhost:3000/api/v1"
echo "  Login     : demo@brand.com / Demo1234!"
echo ""
echo "  API log   : $LOG_DIR/api.log"
echo "  Dash log  : $LOG_DIR/dashboard.log"
echo ""
echo "  If demo data is not seeded yet:"
echo "  bash scripts/seed-demo.sh"
echo ""
echo "  To stop all demo processes:"
echo "  kill $API_PID $DASH_PID"
echo ""
echo "  Consumer app (run separately):"
echo "  cd apps/consumer && flutter run"
echo "========================================"
