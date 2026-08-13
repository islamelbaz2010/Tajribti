# Pre-Demo Checklist

Run through this checklist the night before and again 30 minutes before a commercial meeting. Every item must be checked.

---

## Night Before

### Environment
- [ ] `apps/api/.env` exists and contains `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `DEMO_MODE=true`
- [ ] `apps/dashboard/.env` exists and contains `PORT=3001` and `REACT_APP_API_URL`
- [ ] Supabase project is active (check the dashboard — free-tier projects pause after inactivity)

### Backend
- [ ] `cd apps/api && npm run start:dev` — server starts without errors
- [ ] Console shows: `[Tajribti API] Demo mode: ON`
- [ ] TypeORM logs show tables (first run) or no errors (subsequent runs)

### Seed
- [ ] `curl -X POST http://localhost:3000/api/v1/admin/seed` — returns 200 with `campaignId` and `qrCode`
- [ ] OR: seed already exists → `curl http://localhost:3000/api/v1/admin/seed` returns 409 (idempotent)

### Dashboard
- [ ] `cd apps/dashboard && npm start` — opens on http://localhost:3001
- [ ] Login with `demo@brand.com` / `Demo1234!` succeeds
- [ ] Overview shows **49** redemptions
- [ ] Campaign & QR screen loads — QR image is visible

### Flutter App
- [ ] `cd apps/consumer && flutter run` completes without errors
- [ ] App installs on device and shows splash screen
- [ ] Phone entry screen appears
- [ ] Enter `+201001234567` → tap Send OTP → enter `0000` → verify succeeds
- [ ] Register with Cairo/Giza/Alexandria/Other → Home screen shows campaign card
- [ ] QR scan screen opens — camera view appears

### End-to-End Test (full dry run)
- [ ] Scan the demo QR → survey completes → Thank You screen shows
- [ ] Dashboard counter increments to 50
- [ ] AI Summary screen loads narrative (wait up to 10 seconds on first load)
- [ ] PDF export downloads a file

---

## 30 Minutes Before the Meeting

### Confirm Services Running
```bash
bash scripts/health-check.sh
```
All items must show ✓.

### Reset for Clean Demo (optional)
If a dry run was completed and you want to start fresh at 49 (not 50+):
```bash
curl -X POST http://localhost:3000/api/v1/admin/seed/reset
curl -X POST http://localhost:3000/api/v1/admin/seed
```
Then verify the dashboard shows 49.

### Consumer App — Log Out
- Log out of the consumer app so the demo starts fresh at the phone entry screen
- Verify the app is on the phone entry screen, not the home screen

### Network
- [ ] Confirm the machine running the backend and the demo device are on the same WiFi (if using a physical device)
- [ ] Confirm the machine's LAN IP and that the Flutter app's `API_BASE` points to it
- [ ] Confirm no VPN or firewall blocks port 3000 between device and machine

### Display Setup
- [ ] Brand dashboard is open on the main presentation screen
- [ ] Campaign & QR screen is visible (the QR code the consumer will scan)
- [ ] Consumer app is on a second device (phone) ready to scan

---

## During the Demo — Known Limitations to Communicate

| Issue | What to Say |
|-------|-------------|
| Thank You screen shows "+0 points" | "Points are recorded server-side — the display will show the correct value in the production build" |
| AI summary takes 5-8 seconds (live AI only — instant when no API key is configured) | "The platform is processing the survey data to generate the intelligence summary" |
| Mansoura city not available | Do not select it — use Cairo or Other |

---

## Post-Demo

- [ ] Note any steps that failed or required workaround
- [ ] File a report for the Project Director before the next meeting
- [ ] If re-running the demo multiple times: the QR code is DEMO status — it can be scanned repeatedly without hitting the duplicate-redemption guard

---

## Emergency — Backend Not Starting

1. Check `lsof -i :3000` — kill any conflicting process
2. Check `apps/api/.env` exists and `DATABASE_URL` is set
3. Check Supabase project is not paused (log into supabase.com)
4. Restart: `cd apps/api && npm run start:dev`

## Emergency — Dashboard Not Loading

1. Check `lsof -i :3001` — kill any conflict
2. Check `apps/dashboard/.env` has `PORT=3001`
3. Restart: `cd apps/dashboard && npm start`

## Emergency — Consumer App Cannot Connect

1. Confirm backend is running: `curl http://localhost:3000/api/v1/admin/seed`
2. Confirm device is on same WiFi as the backend machine
3. Find machine LAN IP: `ipconfig getifaddr en0`
4. Rebuild: `flutter run --dart-define=API_BASE=http://<IP>:3000/api/v1`
