# Demo Data Setup

Seeds the database with 49 pre-loaded consumers, a demo campaign, brand account, and reusable QR code. Run this after the backend is running.

---

## Prerequisites

- Backend must be running on `http://localhost:3000`
- Database must be connected (TypeORM sync has run — tables exist)

---

## Step 1 — Execute the Seed

```bash
curl -s -X POST http://localhost:3000/api/v1/admin/seed | python3 -m json.tool
```

Or use the automation script from the repository root:
```bash
bash scripts/seed-demo.sh
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "message": "Demo data seeded successfully. 49 historical consumers loaded.",
    "campaignId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "qrCode": "tajribti:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:demo"
  },
  "timestamp": "2026-07-30T..."
}
```

**Save the `qrCode` value** — you will need it to display in the Campaign & QR screen.

---

## What Gets Seeded

| Item | Count | Details |
|------|-------|---------|
| Brand account | 1 | email: `demo@brand.com`, password: `Demo1234!` |
| Campaign | 1 | Active, 30-day duration from today, 5 survey questions |
| QR code | 1 | Status: DEMO (reusable — no duplicate check) |
| Consumers | 49 | Weighted Egyptian demographics (Cairo-heavy, ages 18-54) |
| Redemption events | 49 | Pre-seeded historical redemptions |
| Survey responses | 49 | Pre-seeded responses with realistic distribution |

---

## Step 2 — Verify the Seed in the Dashboard

1. Open http://localhost:3001
2. Log in: `demo@brand.com` / `Demo1234!`
3. The Overview screen should show **49 redemptions**, not 0
4. Navigate to Campaign & QR — the campaign name should read `Cairo Consumer Intelligence Pilot`

---

## Step 3 — Get the Demo QR Code

The seed response contains `qrCode`. The dashboard Campaign & QR screen also displays a QR image.

To display it for the demo:
1. Log into the dashboard
2. Navigate to **Campaign & QR**
3. The QR PNG is displayed — it can be shown on screen or printed

---

## Re-seeding (if needed)

The seed endpoint throws a 409 if data already exists. To re-seed from scratch:

```bash
# Reset (deletes demo consumers, campaign, QR, brand account)
curl -X POST http://localhost:3000/api/v1/admin/seed/reset

# Then re-seed
curl -X POST http://localhost:3000/api/v1/admin/seed
```

Or use the automation script:
```bash
bash scripts/seed-demo.sh --reset
```

---

## Known Limitation — Reset Does Not Fully Clean Up

`/admin/seed/reset` has a known defect (DEFECT-009): the consumer cleanup SQL uses an exact phone match instead of a pattern, so pre-seeded consumers may not be fully deleted. Workaround: use the Supabase dashboard to manually delete rows from the `consumer`, `redemption_event`, `survey_response`, `campaign`, `qr_code`, and `brand_account` tables, then re-seed.

Proceed to → [07_FIRST_RUN.md](07_FIRST_RUN.md)
