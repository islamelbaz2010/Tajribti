# Dashboard Setup

Sets up and starts the React brand dashboard (`apps/dashboard/`). Run this after [03_BACKEND_SETUP.md](03_BACKEND_SETUP.md) — the backend must be running first.

---

## Step 1 — Create the Environment File

```bash
cd apps/dashboard
cp .env.example .env
```

The default values in `.env.example` are correct for local development. No edits are needed unless your backend runs on a different port.

**Verify the file contains:**
```env
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api/v1
```

`PORT=3001` is required. The API server runs on 3000, and its CORS policy is configured to accept requests only from `http://localhost:3001`. If you run the dashboard on any other port, all API calls will be blocked by CORS.

---

## Step 2 — Install Dependencies

```bash
cd apps/dashboard
npm install
```

Dependencies are already installed if `node_modules/` is present.

---

## Step 3 — Start the Dashboard

```bash
cd apps/dashboard
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view the dashboard in the browser.
  Local: http://localhost:3001
```

The browser opens automatically. If not, navigate to http://localhost:3001

---

## Step 4 — Verify the Dashboard Loads

The login screen should appear with fields for Email and Password.

**Do not log in yet** — demo data must be seeded first. See [06_DEMO_DATA_SETUP.md](06_DEMO_DATA_SETUP.md).

---

## Dashboard Login Credentials

Set in `apps/api/.env` (defaults from `.env.example`):

| Field | Value |
|-------|-------|
| Email | `demo@brand.com` |
| Password | `Demo1234!` |

If you changed `DEMO_BRAND_EMAIL` or `DEMO_BRAND_PASSWORD` in the API `.env`, use those values instead.

---

## What the Dashboard Does

| Screen | Path | Purpose |
|--------|------|---------|
| Login | `/` | Brand authentication |
| Overview | `/overview` | Live redemption count, 3-second polling |
| Campaign & QR | `/campaign` | Campaign details + QR PNG for display |
| Demographics | `/demographics` | Age, gender, city breakdowns |
| Survey Results | `/insights` | Purchase intent, verbatims, question breakdown |
| Participants | `/participants` | Paginated participant list |
| AI Summary | `/report` | AI-generated narrative |
| PDF Export | `/report` | Full report download as PDF |

Proceed to → [05_FLUTTER_SETUP.md](05_FLUTTER_SETUP.md)
