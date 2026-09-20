# TAJRIBTI — B-04 PRODUCTION LOAD RUNBOOK

**Authorized window:** 2026-09-21, 02:00–03:00 Africa/Cairo — the ONLY authorized window. Do not run outside it.
**Script:** `api/scripts/load-test-qr.ts` (verified read-only review: QR GET + eligibility POST; writes real Participation rows; repeats exercise the 409 already-participated path).

## Targets (verified against code)

- Read: `GET /api/consumer/qr/:code` — public, date-gated QR resolution.
- Write: `POST /api/consumer/campaigns/:id/eligibility` — requires consumer JWT; one write per (campaignId, consumerId) unique pair.

## Preflight (all must be true before starting)

- [ ] Inside authorized window (Cairo local).
- [ ] Disposable test campaign: ACTIVE, in-date, clearly marked test (name e.g. `B04-LOAD-TEST`), NOT a customer campaign.
- [ ] Disposable QR source bound to that campaign.
- [ ] Consumer JWT pool: `CONSUMER_TOKENS` comma-separated — unique tokens for true write-path measurement (repeats measure the 409 path, also valid evidence).
- [ ] Railway dashboard open on `tajribti-pilot` → api metrics (CPU/mem/reqs/errors) for monitoring.
- [ ] No real consumer PII involved — synthetic test consumers only.

## Execution

```bash
cd api
BASE=https://api-production-266c.up.railway.app \
CAMPAIGN_ID=<test-campaign> QR_CODE=<test-qr> CONSUMER_TOKENS=<jwt1,jwt2,...> \
npx ts-node --transpile-only scripts/load-test-qr.ts 20 500
```

Default profile (per closure pack): 20 concurrent workers × 500 operations. Do not exceed without a new authorization.

## Expected / failure thresholds

- Read path: 200s, p95 sane (<1s target; record actuals).
- Write path: 200 for first write per token; 409 for repeats; **any 5xx spike or cross-campaign anomaly = stop and capture evidence**.
- Abort immediately on: 5xx >1% sustained, error types outside {200, 401, 409, 429}, or monitoring anomalies.

## Integrity verification during/after

- Participation uniqueness held (no duplicates for same consumer+campaign).
- QR attribution correct (source → campaign binding only).
- No cross-tenant leakage (test campaign data isolated to test company).
- No corruption of real campaigns.

## Cleanup (mandatory)

- Close/deactivate the test campaign.
- Remove test participations/QR source/consumers from production DB — via authorized DB access, scoped to the test IDs only.
- Confirm public Discover no longer lists the test campaign.

## Evidence capture

- Script stdout (latency stats + status histograms) saved verbatim.
- Railway metrics screenshots during window.
- Deployed commit SHA + timestamps recorded.
- Output appended to the release dossier (no secrets).

## If a prerequisite is unavailable

Do NOT improvise. Record the exact blocker in the execution status report and leave B-04 OPEN.
