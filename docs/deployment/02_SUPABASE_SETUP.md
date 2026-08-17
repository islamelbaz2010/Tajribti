# Supabase Setup

The backend requires a PostgreSQL 14+ database. These instructions use Supabase (free tier). Any PostgreSQL instance works — skip to **Step 4** if you are using your own.

---

## Step 1 — Create a Supabase Project

1. Go to https://supabase.com and sign in (or create a free account)
2. Click **New Project**
3. Choose your organization
4. Set:
   - **Name:** `tajribti-demo` (or any name)
   - **Database Password:** choose a strong password and save it
   - **Region:** choose the region closest to your demo location
5. Click **Create new project** and wait ~2 minutes for provisioning

---

## Step 2 — Get the Connection String

1. In your Supabase project dashboard, go to **Project Settings** → **Database**
2. Scroll to **Connection string** → select the **URI** tab
3. Copy the string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with the database password you set in Step 1

---

## Step 3 — Test Connectivity (Optional)

If you have `psql` installed:
```bash
psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" -c "SELECT version();"
```

If you don't have `psql`, you can test in Step 3 of [03_BACKEND_SETUP.md](03_BACKEND_SETUP.md) — the backend logs a connection error on startup if the URL is wrong.

---

## Step 4 — Schema Creation

**No manual schema creation is required.**

TypeORM's `synchronize: true` (enabled when `NODE_ENV` is not `production`) automatically creates all tables when the backend starts for the first time.

Tables created on first startup:
- `consumer`
- `otp_session`
- `campaign`
- `qr_code`
- `redemption_event`
- `survey_response`
- `brand_account`
- `ai_report`

---

## Step 5 — Save the Connection String

You will use this string as `DATABASE_URL` in `apps/api/.env`.

Proceed to → [03_BACKEND_SETUP.md](03_BACKEND_SETUP.md)

---

## Using a Local PostgreSQL Instance

If you prefer a local database instead of Supabase:

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14
createdb tajribti_demo
```

Connection string:
```
postgresql://postgres@localhost:5432/tajribti_demo
```

Set `ssl.rejectUnauthorized: false` is already configured in the backend — local connections without SSL will work.
