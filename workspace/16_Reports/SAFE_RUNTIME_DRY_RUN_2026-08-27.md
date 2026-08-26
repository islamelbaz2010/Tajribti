# TAJRIBTI — SAFE RUNTIME DRY-RUN EVIDENCE

**Date/time:** 2026-08-27 (session; exact times reflected in `.demo-logs/api.log` timestamps, ~2026-08-27T00:13 local)
**Branch:** `sprint/pilot-readiness-mvp`
**HEAD before and after:** `4c0cf07c9822b0be8ec0ba061169d609cae6162d` (unchanged — no source code modified)

## 1. Requirement being closed

Per `16_Reports/TAJRIBTI_CLIENT_READY_FINALIZATION_2026-08-23.md` (§5, §9, §14) and
`16_Reports/TAJRIBTI_TRACK_0_COMMERCIAL_READINESS_FINALIZATION_2026-08-23.md` (§2, §8, §12):
the "safe runtime" / "safe non-mutating demo runtime" gap refers specifically to whether
`bash scripts/demo.sh` (which calls `scripts/seed-demo.sh --reset`) can be run without risk
of mutating shared or production data. As of 2026-08-23, this was BLOCKED / UNVERIFIED
because "the launcher was not executed" and no isolated/disposable database was confirmed.

This is a distinct item from DL-048's PATH C isolated E2E (which validated the Flutter/Consumer
mobile OTP path against a separate isolated Postgres instance, `tajribti_e2e_isolated` on port
3010, per `CHANGELOG.md` v6.22 — not `scripts/demo.sh`/`tajribti_demo`).

## 2. Environment type

Local, disposable, developer-machine environment. No new infrastructure created.
Existing, unmodified repository scripts reused as-is: `scripts/demo.sh` →
`scripts/verify-env.sh` + `scripts/run-demo.sh` + `scripts/seed-demo.sh --reset` +
`scripts/health-check.sh`. No file was edited to perform this test.

## 3. Isolation method (verified before execution)

- `apps/api/.env` `DATABASE_URL` confirmed, before running anything, to point at
  `postgresql://ahmed@localhost:5432/tajribti_demo` — a local Postgres database, not the
  Railway production database (`api-production-266c.up.railway.app`) used by the live pilot.
- `tajribti_demo` confirmed via `psql -l` as a standalone local database, structurally
  identical (8 tables: `campaigns`, `consumers`, `brand_accounts`, `otp_sessions`, `qr_codes`,
  `redemption_events`, `survey_responses`, `ai_reports`) to the schema described for the
  Railway instance in `AI_BOOTSTRAP/02_PROJECT_STATE.md`, but a physically separate database.
- `apps/dashboard/.env` `REACT_APP_API_URL=http://localhost:3000/api/v1` confirmed local, not
  the Railway URL baked into the live Vercel deployment.
- No `git checkout`, branch switch, or reference to `sprint/meos-production-build` occurred at
  any point. MEOS's frozen commit `0209b9a` was not touched, read, or executed.

## 4. Runtime start result

`bash scripts/demo.sh` executed end-to-end, unmodified:

1. **Configure brand identity** — PASS (default values: Sprite Zero Egypt / Sprite Zero Sugar
   / City Stars Mall — written only to untracked, gitignored `apps/api/.env`, per the script's
   own documented behavior).
2. **Verify environment** — PASS, 15/15 checks (`DATABASE_URL` set, `JWT_SECRET` /
   `JWT_REFRESH_SECRET` set and distinct, `DEMO_MODE=true`, dashboard env present, Node ≥18,
   dependencies present, ports free).
3. **Start backend and dashboard** — PASS. Backend (NestJS, local PID) became reachable at
   `http://localhost:3000/api/v1` (HTTP 404 on the seed-check probe endpoint, expected for a
   GET against a POST-only route). Dashboard (React, local PID) became reachable at
   `http://localhost:3001` (HTTP 200).
4. **Seed demo data (reset + reseed)** — PASS. `POST /admin/seed/reset` then `POST
   /admin/seed` against the local backend only. New campaign ID
   `0d86a1a0-cfc9-40cd-85c6-29125100f80a` generated. `api.log` shows all inserted rows
   (`consumers`, `redemption_events`, `survey_responses`) flagged `is_demo_seed: true`, with
   synthetic phone numbers (`+201000000XX`) and synthetic names ("Consumer 48", "Consumer 49"
   etc.) — no real consumer data referenced or touched.
5. **Health check** — PASS. Backend and dashboard both reported healthy; "TAJRIBTI DEMO READY"
   banner printed.

## 5. Application/client path exercised

Brand-dashboard path proven reachable end-to-end: seeded campaign → brand login
(`demo@brand.com`) → dashboard at `http://localhost:3001` serving HTTP 200. QR code generated
(`tajribti:0d86a1a0-...:demo`). This mirrors the intended first-client demonstration path.

## 6. Data-safety result

- Before: local `tajribti_demo` already held 1 campaign / 50 consumers / 1 brand account / 49
  survey responses (residue of an earlier local seed — synthetic, `is_demo_seed=true`).
- During: reset cleared and reseeded the same local database only; every row inserted during
  this run is tagged `is_demo_seed: true` with synthetic identifiers.
- After: local `tajribti_demo` holds the same shape (1 campaign / 50 consumers / 1 brand
  account / 49 survey responses) — a fresh, equivalent seed, not accumulated garbage.
- No query in `.demo-logs/api.log` referenced Railway, any production hostname, or any
  non-synthetic identifier. Grep for "railway" / "meos-production" across the run log and API
  log returned zero matches.

## 7. Reset/reseed result

Confirmed safe: `seed-demo.sh --reset` operates only via `POST /admin/seed/reset` against
`http://localhost:3000` (the freshly-started local backend process), which is bound to the
local `tajribti_demo` database per `apps/api/.env`. No mechanism in the script can reach the
Railway database — there is no Railway URL, credential, or reference anywhere in
`scripts/demo.sh`, `scripts/run-demo.sh`, or `scripts/seed-demo.sh`.

## 8. Shutdown result

Backend and dashboard processes terminated via PID/port kill (ports 3000 and 3001). Confirmed
both ports free immediately after. No orphaned processes.

## 9. Cleanup result

- No source file was modified (`git status --short -- apps/ workspace/15_Decisions` shows no
  new tracked-file changes from this test).
- Only untracked, gitignored artifacts were touched/created: `apps/api/.env` (brand-name
  fields, already excluded from git), `.demo-logs/api.log` and `.demo-logs/dashboard.log`
  (already untracked per pre-existing `.demo-logs/` directory).
- Local `tajribti_demo` database left in a normal, reproducible seeded state — identical in
  shape to its pre-test state, safe to reset again at any time via the same script.

## 10. Production / MEOS non-interference

- Railway production API/database: not contacted. No HTTP request in this session targeted
  `api-production-266c.up.railway.app`.
- Vercel production dashboard: not contacted.
- MEOS (`sprint/meos-production-build @ 0209b9a`): not checked out, not read, not executed, not
  referenced by any command run in this session.
- Git branch remained `sprint/pilot-readiness-mvp` throughout; HEAD unchanged
  (`4c0cf07c9822b0be8ec0ba061169d609cae6162d`) before and after.

## 11. Result

**PASS.** The existing, unmodified `scripts/demo.sh` orchestration starts correctly, exercises
the intended brand-dashboard client path, performs reset/reseed safely against an isolated
local database, and shuts down cleanly, without touching Railway production, real consumer
data, or the frozen MEOS branch. The "safe non-mutating demo runtime" gap identified in the
2026-08-23 finalization reports is closed: the risk those reports flagged (an undocumented,
unverified runtime) has been verified — the launcher's current configuration is already local
and isolated by construction; no code change was needed to make it so.

## 12. Limitations

- This dry-run validates the *local development* runtime path (`localhost:3000`/`3001` against
  local Postgres), which is what a Founder or engineer would use to run `bash scripts/demo.sh`
  on their own machine. It does not certify a *shared/hosted* disposable demo environment (e.g.
  a dedicated demo deployment reachable by a remote client) — no such environment is described
  anywhere in the repository, and none was created here.
- The `open` browser-launch step was not independently confirmed in this headless session
  (non-blocking — the HTTP 200 health check already confirms the dashboard is reachable).
- This dry-run did not exercise the Flutter consumer app against this local backend (out of
  scope — the Flutter/OTP path is separately covered by DL-048's PATH C isolated E2E).
- This does not constitute D-028 report-quality review (already closed separately via DL-056),
  a legal/PDPL opinion, an LLC filing, or a QR concurrency load test — none of B-01–B-04 are
  affected by this evidence.
