# Troubleshooting

Common problems and their resolutions.

---

## Backend Fails to Start

### Error: `DATABASE_URL is not set`
- `apps/api/.env` is missing or does not contain `DATABASE_URL`
- Fix: `cp apps/api/.env.example apps/api/.env` then fill in `DATABASE_URL`

### Error: `connect ECONNREFUSED` or `FATAL: password authentication failed`
- The database URL is wrong, the password is incorrect, or Supabase is not reachable
- Fix: Copy the exact connection string from Supabase → Project Settings → Database → URI
- Verify SSL: the backend sends `ssl: { rejectUnauthorized: false }` — this is correct for Supabase

### Error: `Error: listen EADDRINUSE: address already in use :::3000`
- Something else is running on port 3000
- Fix:
  ```bash
  lsof -ti :3000 | xargs kill -9
  ```
  Then restart the backend

### Error: `JWT_SECRET is not set`
- Fill in `JWT_SECRET` and `JWT_REFRESH_SECRET` in `apps/api/.env`
- They must be different strings, each generated from:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

---

## Dashboard Issues

### Login fails: `Network Error`
- Backend is not running → start it with `cd apps/api && npm run start:dev`
- Wrong API URL in `apps/dashboard/.env` → verify `REACT_APP_API_URL=http://localhost:3000/api/v1`
- After changing `.env`, restart the dashboard: `Ctrl+C` then `npm start` again

### Dashboard opens on port 3000 instead of 3001
- `PORT=3001` is missing from `apps/dashboard/.env`
- Fix: Add `PORT=3001` to `apps/dashboard/.env`, restart dashboard
- All API calls will fail from port 3000 due to CORS

### Login fails: `401 Unauthorized`
- Demo data has not been seeded — run `curl -X POST http://localhost:3000/api/v1/admin/seed`
- Or credentials don't match — check `DEMO_BRAND_EMAIL` and `DEMO_BRAND_PASSWORD` in `apps/api/.env`

### QR image does not appear on Campaign & QR screen
- Backend must be running and reachable
- Open browser DevTools → Network tab → look for a failed request to `/api/v1/qr/generate/...`

### AI Summary loads forever
- If no `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is set, the fallback narrative is returned immediately
- If a key is set, network latency to the AI provider may cause a delay of 3-8 seconds — this is normal
- If it spins for >30 seconds, check the backend logs for API error messages

---

## Seed Issues

### Seed returns 409 Conflict
```json
{"statusCode":409,"message":"Demo data already seeded..."}
```
- Data already exists — either log in and use the existing demo, or reset:
  ```bash
  curl -X POST http://localhost:3000/api/v1/admin/seed/reset
  curl -X POST http://localhost:3000/api/v1/admin/seed
  ```

### Seed succeeds but dashboard shows 0 redemptions
- Wait 3 seconds for the polling cycle
- If still 0 after 10 seconds: the `campaignId` from the seed response doesn't match what the dashboard fetches — this should not happen (only one campaign exists)
- Check backend logs for errors on `GET /analytics/...`

---

## Flutter Issues

### `flutter pub get` fails
- Flutter SDK is not installed → see [05_FLUTTER_SETUP.md](05_FLUTTER_SETUP.md)
- No internet connection → run on a connected network

### App builds but cannot reach the backend
- Android emulator: backend must be on `http://10.0.2.2:3000` — verify default `API_BASE` in `apps/consumer/lib/core/constants.dart`
- Physical device: device and computer must be on the same WiFi — use `--dart-define=API_BASE=http://<LAN-IP>:3000/api/v1`
- Find your LAN IP: `ipconfig getifaddr en0` (macOS)

### OTP request succeeds but verify always fails
- Verify `DEMO_MODE=true` in `apps/api/.env`
- Restart the backend after changing `.env`
- The demo bypass code is `0000` — not `000000`; it must be exactly 4 digits... actually check the OTP verification logic

### QR scan completes but shows error snackbar
- Backend returned an error on `/qr/redeem`
- Common cause: JWT token expired — log out and log in again on the consumer app
- Check backend logs for the exact validation error

### Registration fails with 400 for the city "Mansoura"
- Known defect (DEFECT-006) — `Mansoura` is not in the backend city enum
- Select `Cairo`, `Giza`, `Alexandria`, or `Other` instead

### Survey submit fails with 400
- Should not occur after DEFECT-004 fix — if it does, check the backend logs for `property X should not exist`

---

## General

### TypeScript errors on build
```bash
cd apps/api && ./node_modules/.bin/tsc --noEmit
cd apps/dashboard && ./node_modules/.bin/tsc --noEmit
```
Both must produce zero output (zero errors). If errors appear, the branch may be in a bad state — check `git log` and ensure all 5 defect-fix commits are present.

### Backend logs show TypeORM sync errors
- Usually means `DATABASE_URL` is correct but the database user lacks `CREATE TABLE` permission
- On Supabase: the `postgres` user has full permissions — this should not occur
- On a restricted PostgreSQL instance: grant the user `CREATE` on the database

### Reset demo: consumers not cleaned up
- Known issue (DEFECT-009) — the reset query uses exact-match instead of prefix-match
- Manual cleanup via Supabase dashboard: delete all rows from `consumer`, `redemption_event`, `survey_response`, then re-seed
