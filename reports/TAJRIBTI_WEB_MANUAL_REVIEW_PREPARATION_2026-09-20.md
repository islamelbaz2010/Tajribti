# TAJRIBTI — WEB MANUAL REVIEW PREPARATION

**Date:** 2026-09-20 · **Pass type:** read-only forensic + Founder review map. **Zero changes made.**

---

## A. Repository Web Architecture

The current repo has **no separate web-frontend application**:

- `web/` = **static HTML/JS only** — `web/public/index.html` (marketing site), `web/app/consumer/`, `web/app/company/`, `web/app/ops/` — each a single `index.html` with inline JS. **No package.json, no framework, no build step.**
- `api/src/server.ts:61–64` serves them directly via `express.static`: `/` → `web/public`, `/app/consumer`, `/app/company`, `/app/ops` → respective dirs.
- **Conclusion: the Railway `api` service IS the web host.** Web and API ship in the same deployment — there is no separate web deployment to mismatch.

## B. Web Provider

**Railway** — same `tajribti-pilot` / `api` service / `production` environment. (`railway.json` RAILPACK build → `cd api && npm run build`; start → `db:migrate && npm run start`; `web/` resolved as sibling at runtime.)

## C. API Provider

Railway — same service (Web and API are one deployment).

## D. Actual Web Production URL

**`https://api-production-266c.up.railway.app/`** — verified live: `/` 200 (public site), `/app/consumer/` 200 (`<title>TAJRIBTI — Consumer</title>`), `/app/company/` 200, `/app/ops/` 200. No custom domain (e.g. tajribti.com) is configured anywhere in repo or Railway config — **do not assume one exists.**

## E. API URL

`https://api-production-266c.up.railway.app/api` (same origin).

## F. Web Production Deployment Commit

**`9bc15f0`** — the Railway deployment `34148d90` (SUCCESS, 2026-09-20T10:52Z) serves both API and web statics from this commit.

## G. API Production Deployment Commit

**`9bc15f0`** — same deployment.

## H. Vercel Deployment Status

**FAILED (preview) — and unrelated to the current product.** No `vercel.json` exists in this repository; no Vercel config, domain, or dependency is referenced anywhere in `benchmark-current`. The observed failed build ran `react-scripts build` (exit 127 = command not found) — **`react-scripts` does not exist anywhere in the current codebase.**

## I. Build Failure Analysis

- **Observed failure:** Vercel preview build — `Command "react-scripts build" exited with 127`.
- **Evidence:** `apps/dashboard/package.json` on **`origin/main`** (the divergent legacy branch) uses `react-scripts` scripts — that is the Create-React-App dashboard the Vercel project is configured against. Exit 127 = dependency/binary absent (misconfigured install or wrong root dir for that legacy app).
- **Likely category:** stale Vercel project pointing at the legacy `main`-branch CRA dashboard — wrong project/wrong branch for the current product line.
- **Release impact:** **NONE on the current web product** — the real web app is static files served by Railway and is verifiably live.
- **Is Web production affected:** **NO.**

## J. Web Release Status

**A — `9bc15f0` LIVE** (all four surfaces verified by HTTP).

## K. Verified Web Routes / Entry Points

| Surface | URL | Requires login | Role | Purpose |
|---|---|---|---|---|
| Public marketing site | `https://api-production-266c.up.railway.app/` | no | — | OFD-17 public surface |
| Consumer app | `…/app/consumer/` | OTP for authed actions | consumer | Discover, campaign, eligibility, survey, Activity |
| Company workspace | `…/app/company/` | employee login | COMPANY_ADMIN / COMPANY_MEMBER | campaigns, products, media, questions, reports, intelligence, panel insights |
| Operations console | `…/app/ops/` | ops login | OPERATIONS (PLATFORM_ADMIN extras) | pipeline, lifecycle, issues, question requests, audits |

API base for all: `/api/*` on the same origin.

## L. Founder Manual Review Sequence

1. `/` — public site (EN/AR toggle, content).
2. `/app/consumer/` — Discover (anonymous shows active campaigns) → OTP login → Discover again (**participated campaigns must be absent**) → campaign detail → eligibility → redeem → survey → completion → **Activity/History holds prior participations**.
3. `/app/company/` — employee login → campaign create/edit → product price/pack/claims → media (URL-based — hosted media is specced, NOT implemented) → questions + change requests → live results → report (EN/AR, `dir=rtl`) → **browser print → Save as PDF** (D-2 path) → intelligence (descriptive only — no predictive claims) → panel insights (opt-in aggregate).
4. `/app/ops/` — ops login → pipeline/readiness/lifecycle/live/issues/question-request apply-reject → audit surfaces (PLATFORM_ADMIN items visible only to admin role; participants PII admin-only).

## M. Current Known Product Constraints (expected, not defects)

- No push UI anywhere — push is rejected; its absence is correct.
- No generated PDF file — browser print→PDF is the approved mechanism (D-2).
- Media is URL-referenced — hosted upload specced but deferred (D-5).
- Intelligence is descriptive + labeled derived — no predictive surface (D-4 methodology-only).
- Study types run through the generic report — per-type findings methodology documented, partially gated.
- Mobile deferred — Phase D.

## N. B-04 Status

**NOT RUN.** Window: 2026-09-21 02:00–03:00 Africa/Cairo. Runbook: `reports/TAJRIBTI_B04_PRODUCTION_LOAD_RUNBOOK_2026-09-20.md`.

## O. Mobile Status

DEFERRED.

## P. Blockers

None for the manual review. (Housekeeping, non-blocking: the stale Vercel project for the legacy CRA dashboard can be disconnected/removed in Vercel settings by the Founder — it does not serve the current product.)

## Q. Recommended Next Step

**Founder performs the manual web review** using §L sequence at `https://api-production-266c.up.railway.app/` → then executes B-04 in the authorized window.
