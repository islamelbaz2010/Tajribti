# Current Objective — One Page

**This file describes EXACTLY what we are trying to accomplish RIGHT NOW.**  
**Last updated:** 2026-08-13

---

## The One Sentence

Deploy the Real Pilot MVP to a controlled cloud environment and run one real, measured brand campaign with real consumers.

*Source: Real Pilot MVP Final Handoff; `AI_BOOTSTRAP/02_PROJECT_STATE.md`*

---

## What "Right Now" Means

**Real Pilot MVP is built, tested, and committed. It has never been deployed.**

The local implementation is complete (commit `ed72a20` on `sprint/pilot-readiness-mvp`). All 7 acceptance tests passed locally. The next required action is cloud deployment and execution of one real field pilot.

Commercial demo is FROZEN at commit `0209b9a` on `sprint/meos-production-build`. Do not touch it.

*Source: Real Pilot MVP Final Handoff; `AI_BOOTSTRAP/02_PROJECT_STATE.md`*

---

## The 5 Deployment Steps

### 1. API Deployment (Railway or equivalent)

Deploy `apps/api` to a publicly accessible host.

Required env vars:
```
DATABASE_URL=<supabase-or-pg-connection-string>
JWT_SECRET=<random-secret>
JWT_REFRESH_SECRET=<random-secret>
DEMO_MODE=false
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_PHONE_NUMBER=<+20...>
OPENAI_API_KEY=<key>
CONSUMER_WEB_URL=<vercel-dashboard-url>
```

### 2. Dashboard Deployment (Vercel)

Deploy `apps/dashboard` to Vercel.

Required env var:
```
REACT_APP_API_URL=<railway-api-url>/api/v1
```

The dashboard serves BOTH the brand portal AND the consumer mobile web journey (`/join/:campaignId/*`).

### 3. First Real Brand Account

No self-registration UI exists. Insert directly:
```sql
INSERT INTO brand_accounts (id, name, email, password, created_at)
VALUES (gen_random_uuid(), 'Brand Name', 'brand@email.com', '<bcrypt>', NOW());
```

Or add a temporary admin endpoint for account creation.

### 4. First Real Campaign

Brand logs in → `POST /api/v1/campaigns` → receives `campaignId` → `GET /qr/generate/:campaignId` → print QR on sample products.

### 5. First Real Consumer

Consumer receives a sample product, scans QR with phone camera, completes the Arabic mobile web journey in under 3 minutes. Data appears in brand dashboard.

---

## What Success Looks Like

```
✅  API deployed and reachable at public URL
✅  Dashboard deployed — brand portal + /join/* consumer journey both live
✅  Real OTP SMS delivered to Egyptian mobile number
✅  Real brand account created
✅  Real campaign created via API
✅  Real QR generated and printed
✅  At least one real consumer completes the full journey
✅  Real signal appears in brand analytics dashboard
→   Controlled pilot is running
```

---

## What an AI Should Help With Right Now

- Pilot deployment planning and execution (Railway, Vercel, Supabase setup)
- Environment variable configuration
- Twilio SMS setup for Egypt (+20 numbers)
- Database migration strategy (TypeORM synchronize vs. migrations)
- First real brand account creation
- First real campaign setup
- Monitoring and troubleshooting the live deployment

## What an AI Should NOT Help With Right Now

- P1 features (brand self-registration, campaign management UI) — not yet authorized
- P2 features (PDPL consent screen, consumer data deletion) — not yet authorized
- New dashboard screens or API endpoints beyond committed MVP
- Track 1 full engineering — still gated on B-01/B-02/B-03/B-04
- Modifying the commercial demo (FROZEN at commit 0209b9a)

*Source: Real Pilot MVP Final Handoff — Sections 9, 10*
