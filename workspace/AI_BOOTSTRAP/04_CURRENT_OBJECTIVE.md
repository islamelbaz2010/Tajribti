# Current Objective — One Page

**This file describes EXACTLY what we are trying to accomplish RIGHT NOW.**  
**Last updated:** 2026-08-14

---

## The One Sentence

Activate the deployed Real Pilot MVP — unblock OTP and create the first real brand account — so one real brand can run one real campaign with real consumers.

*Source: Deployment Session 2026-08-13; `AI_BOOTSTRAP/02_PROJECT_STATE.md`*

---

## What "Right Now" Means

**The Real Pilot MVP is deployed. Infrastructure is live.**

Railway API: https://api-production-266c.up.railway.app/api/v1  
Vercel Dashboard: https://dashboard-six-flame-wsaixia9cm.vercel.app  
PostgreSQL: ONLINE (tajribti-pilot project, 8 tables, zero data)

Two blockers remain before a real consumer can complete the journey:

1. **Akedly Template ID not yet set** — OTP code generation works; WhatsApp delivery requires AKEDLY_TEMPLATE_ID (currently in review with Akedly). AKEDLY_API_KEY and AKEDLY_PIPELINE_ID are available now.
2. **No real brand account** — The database is clean. No brand can log in until the first account is created.

Commercial demo: FROZEN at commit `0209b9a` on `sprint/meos-production-build`. Do not touch.

---

## The 2 Remaining Activation Steps

### 1. Set Akedly Credentials in Railway (WhatsApp OTP — Founder sets when Template ID is approved)

In Railway dashboard: set these on the `api` service in the `tajribti-pilot` project:

```
AKEDLY_API_KEY=d53379cf4b992b6684fedf9d0d367f194f6b89438710b63774e0e68fc26a715f
AKEDLY_PIPELINE_ID=6a7db76861a103e7b2a0b7ec
AKEDLY_TEMPLATE_ID=<approved-template-id>      ← SET THIS WHEN AKEDLY APPROVES IT
AKEDLY_OTP_VAR=otp                             ← default; change only if template uses different var name
```

Railway auto-redeploys after env var change. WhatsApp OTP goes live immediately.
The integration code is complete and soft-fails gracefully until Template ID is set.

⚠️ OTP is currently blocked only by AKEDLY_TEMPLATE_ID being in review. API key and Pipeline ID are ready.

### 2. Create First Real Brand Account (Founder provides: name, email, password)

Claude will:
- Generate bcrypt hash of the password
- Open Railway Postgres TCP proxy
- Insert the brand account via SQL
- Test login via API
- Close proxy

After this the brand can log in at the Vercel dashboard URL and create their first campaign.

---

## After Both Blockers Are Cleared

```
Brand logs in at https://dashboard-six-flame-wsaixia9cm.vercel.app
→ POST /api/v1/campaigns   (create campaign)
→ GET  /api/v1/qr/generate/:campaignId  (download QR PNG)
→ Print QR on sample product packaging
→ Distribute to real consumers at field location
→ Consumer scans QR → phone camera opens:
     https://dashboard-six-flame-wsaixia9cm.vercel.app/join/:campaignId
→ OTP → registration → survey → real signal in DB
→ Brand analytics dashboard reflects real data
→ AI report generated (Anthropic/OpenAI if key set, fallback narrative otherwise)
→   REAL FIELD PILOT: RUNNING
```

---

## What Success Looks Like

```
✅  Railway API: LIVE                          (done)
✅  PostgreSQL: ONLINE, clean schema           (done)
✅  Vercel Dashboard: LIVE                     (done)
✅  CORS: correctly configured                 (done)
✅  Consumer web deep links: working           (done)
✅  Admin endpoints: protected                 (done)
✅  Akedly OTP integration: code complete      (done — soft-fail until Template ID set)
⬜  Akedly Template ID: SET IN RAILWAY         (blocker 1 — Template ID in review)
⬜  Real brand account: CREATED               (blocker 2)
⬜  Real campaign: CREATED                    (requires brand account)
⬜  Real QR: GENERATED                        (requires campaign)
⬜  Real consumer completes journey           (requires all above)
⬜  Real signal in dashboard                  (requires consumer journey)
→   REAL FIELD PILOT: NOT YET VERIFIED
```

---

## What an AI Should Help With Right Now

- Setting Akedly env vars in Railway when Template ID is approved (AKEDLY_TEMPLATE_ID)
- Creating first real brand account via Railway Postgres when Founder provides name/email/password
- Verifying brand login works after account creation
- Helping brand create first campaign via API (curl commands)
- Generating QR code for the first campaign
- Verifying consumer journey end-to-end (real OTP requires Template ID to be approved first)

## What an AI Should NOT Help With Right Now

- P1 features (brand self-registration, campaign management UI) — not yet authorized
- P2 features (PDPL consent screen, consumer data deletion) — not yet authorized
- New dashboard screens or API endpoints
- Track 1 full engineering — still gated on B-01/B-02/B-03/B-04
- Modifying the commercial demo (FROZEN)
- Rebuilding the deployment infrastructure (it's live and working)

*Source: Deployment Session, 2026-08-13*
