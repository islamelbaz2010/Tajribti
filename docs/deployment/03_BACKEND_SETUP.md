# Backend Setup

Sets up and starts the NestJS API (`apps/api/`). Run this after completing [02_SUPABASE_SETUP.md](02_SUPABASE_SETUP.md).

---

## Step 1 — Create the Environment File

```bash
cd apps/api
cp .env.example .env
```

Open `.env` and fill in the required values:

### Required Variables

**`DATABASE_URL`**
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```
From Supabase: Project Settings → Database → Connection string (URI).

**`JWT_SECRET` and `JWT_REFRESH_SECRET`**

Generate two separate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run this command **twice**. Use different output for each variable.

```
JWT_SECRET=<first 128-char hex string>
JWT_REFRESH_SECRET=<second 128-char hex string>
```

**`DEMO_MODE`**
```
DEMO_MODE=true
```
Must be `true` for the demo. Enables OTP bypass code `0000`.

### Optional Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `3000` | API port — do not change unless you also update the dashboard |
| `CORS_ORIGIN` | `http://localhost:3001` | Dashboard URL — must match where the dashboard runs |
| `NODE_ENV` | `development` | Keep as `development` for demo |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token lifetime |
| `ANTHROPIC_API_KEY` | — | For AI narrative generation (optional) |
| `OPENAI_API_KEY` | — | Fallback AI (optional) |
| `DEMO_BRAND_EMAIL` | `demo@brand.com` | Brand login email |
| `DEMO_BRAND_PASSWORD` | `Demo1234!` | Brand login password |
| `DEMO_CAMPAIGN_NAME` | `Cairo Consumer Intelligence Pilot` | Seed campaign name |
| `DEMO_PRODUCT_NAME` | `Almaza Light` | Product name |
| `DEMO_BRAND_NAME` | `Egyptian Beverages Co.` | Brand name |
| `DEMO_LOCATION_NAME` | `City Stars Mall — Ground Floor Atrium` | Location |

### Twilio (not needed for demo)

Leave `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` empty. They are only needed for real SMS OTP delivery. `DEMO_MODE=true` bypasses SMS entirely.

---

## Step 2 — Install Dependencies

```bash
cd apps/api
npm install
```

Dependencies are already installed if `node_modules/` is present.

---

## Step 3 — Start the Backend

```bash
cd apps/api
npm run start:dev
```

**Expected output:**
```
[Nest] LOG  [NestApplication] Nest application successfully started
[Tajribti API] Running on http://localhost:3000/api/v1
[Tajribti API] Demo mode: ON
```

TypeORM will log table creation on first run (8 tables). This is expected.

**If the server crashes at startup**, the most common causes:
- `DATABASE_URL` is wrong or the database is unreachable → check [08_TROUBLESHOOTING.md](08_TROUBLESHOOTING.md)
- A port 3000 conflict → `lsof -i :3000` and kill the conflicting process

---

## Step 4 — Verify the Backend is Running

```bash
curl http://localhost:3000/api/v1/admin/seed
```

This should return a 405 Method Not Allowed (GET on a POST endpoint) — confirming the server is reachable and routing is live.

Proceed to → [04_DASHBOARD_SETUP.md](04_DASHBOARD_SETUP.md)
