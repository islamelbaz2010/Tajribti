# TAJRIBTI — Primary Vercel Preview + Final Web QA

Date: 2026-09-23
Author: Devin (implementation engineer)
Scope: Vercel Preview deployment under the PRIMARY `tajribti` project + final web QA. No product redesign, no new behavior.

---

## A. Project / repository identity

- Repo: `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean`
- Branch: `master`
- Remote: `origin → github.com/islamelbaz2010/Tajribti`; `origin/benchmark-current` at `9bc15f0` — local `master` ahead; nothing pushed this pass.

## B. AI_BOOTSTRAP confirmation

PASS — repository read directly; HEAD, branch, tree, remote state verified before work. Benchmark + implemented Founder decisions treated as Product Truth. No historical `samples app` decisions used.

## C. Benchmark SHA

`648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` — unchanged.

## D. Starting SHA

`9c6ba337a6394853cada4d441f37378c005ed6c1` (local `master`, after `ace4a01` + `9c6ba33`).

## E. Ending SHA

`9c6ba337a6394853cada4d441f37378c005ed6c1` — no code changes this pass; no new commit created.

## F. Git branch

`master`

## G. Working tree state

Clean (only pre-existing untracked Founder documents; no source modifications).

## H. Vercel project identity

- PRIMARY project used: **`tajribti`** (`prj_HtmXMR8S0D99GbCNTfPYXhoYORvW`, team `islam-elbaz-s-projects`)
- Git-linked to `islamelbaz2010/Tajribti`, production branch `main` — our `master` deploys resolve to **Preview**.
- Separate `tajribti-preview` project: left untouched this pass (per instruction).

## I. Preview deployment URL

`https://tajribti-r4y92ofdv-islam-elbaz-s-projects.vercel.app`

Founder access link (deployment-scoped shareable link, created via `PATCH /aliases/{deployment}/protection-bypass` — scope `shareable-link`; project SSO protection unchanged):

`https://tajribti-r4y92ofdv-islam-elbaz-s-projects.vercel.app/?_vercel_share=AitZ0xIGoItYEaQgQUedgd4RhBuXXYo2`

Opening the share link once sets an access cookie; subsequent navigation is unprotected. The secret can be revoked at any time from the deployment's protection settings.

## J. Deployment ID

`dpl_71xHbxaQPWLZ2kfsvF2hmQBDSR7v` (inspect: vercel.com/islam-elbaz-s-projects/tajribti/71xHbxaQPWLZ2kfsvF2hmQBDSR7v)

## K. Environment

Preview (verified — CLI reported `Preview`, not aliased to production).

## L. Production untouched confirmation

PASS — no `--prod`, no production alias assigned, production target still points at pre-existing deployments. `REACT_APP_API_URL` (production, sensitive) untouched.

## M. Railway untouched confirmation

PASS — no Railway commands run; production app/data/mobile state unchanged.

## N. Vercel configuration changes (this pass)

- Repo re-linked: `tajribti-preview` → **`tajribti`** (`.vercel/` is gitignored).
- `JWT_SECRET` added to **Preview target only** on `tajribti` (new random value; not exposed here).
- Shareable-link protection bypass created **on the single preview deployment** (deployment-scoped, revocable). `ssoProtection: all_except_custom_domains` on the project is unchanged; no global security setting was weakened.
- No changes to Git integration, build settings, domains, or production env vars.

Prior commits `ace4a01`/`9c6ba33` contain the preview plumbing (reviewed below).

## Vercel plumbing review (§7)

- `api/src/server.ts`: exports `app`; `app.listen` only when run directly (`require.main === module`) — `node dist/server.js` and `npm run dev` behavior unchanged. `webRoot` gained extra candidate paths (bundled layouts); first candidate still matches normal layout. **Preview-safe; no production behavior change.**
- `api/src/vercel.ts`: serverless entry; copies seeded `preview.db` to `/tmp` per instance, sets `DATABASE_URL` + `NODE_ENV=production`, then requires `./server`. **Preview-only file; not imported by production code.**
- `api/prisma/schema.prisma`: `binaryTargets` adds `rhel-openssl-3.0.x` alongside `native` — additive engine artifact only.
- `api/prisma/preview-seed.ts`: adds review-role accounts to the preview DB only (Layla → COMPANY_ADMIN, member, ops manager, platform admin). Not part of the product seed.
- `api/package.json` `vercel-build`: tsc → prisma generate → migrate+seed `preview.db` → copy `web/` to `api/web-bundle` (gitignored build artifact).
- `vercel.json`: legacy `builds`/`routes` — all traffic → `api/dist/vercel.js`. Overrides project build settings only within deployments built from this config.
- `/tmp` SQLite: per-instance, ephemeral, seeded fixture data only — **not** a production persistence change. Preview writes never reach Railway/production data.

## O. F&B image verification

PASS — `web/public/assets/img/product-cans.jpg` now shows **full unbranded aluminum beverage cans** ("Aluminium Cans", Mark Morgan Trinidad, CC BY 2.0 — verified on the Flickr photo page). Renders correctly in the F&B sector card on the preview; footer attribution updated to `Mark Morgan Trinidad, CC BY 2.0`. No logos/trademarks.

## P. Public website QA — PASS

- B2B-only nav: How it works · Sectors · Sample report · Log in · Book a demo. No Operations Console CTA, no consumer login.
- Sector cards: beverage cans / generic shampoo+conditioner / household spray — consistent card heights, correct aspect ratios, no broken images.
- Study-type cards: purpose + real template questions; "Available now" labeling preserved; curated subset unchanged.
- Header `Log in` visible at mobile width.

## Q. Sample Report QA — PASS

Verified live on the preview (all scroll positions):

- Cover/campaign identity card, dates, "184 completed survey responses · Cairo & Alexandria", ILLUSTRATIVE EXAMPLE — FICTIONAL DEMO DATA badge.
- KPI cards (412 entered / 305 eligible / 184 complete / 3.8/5 PI), executive summary, proportional funnel.
- Purchase-intent 5-point distribution (sums 184, avg ≈3.8) and rating 5-point distribution (n=179, 4.1/5).
- Campaign-specific question bars (n=184 each), audience differences (gender n=101/83; city n=120/64), Consumer Voice quote cards, findings cards, Insight→Decision→Recommendation, compact methodology + limitations.
- Reads as a visual decision report, not a text wall. No fabricated/AI claims; fictional labeling explicit.

## R. Company Admin QA — PASS

- Sidebar IA: Overview / Campaigns / Products / Reports / Company Profile / Employees / + New campaign.
- Overview KPI cards + status cards + recent campaigns + products + panel (opted-in, small-cell note).
- Campaigns: status cards (All/Draft/Ready/Active/Paused/Completed), search, study-type, From/To, pagination.
- Reports page: filtered picker → campaign Report tab; report renders with real persisted data (seeded campaign honestly reports ZERO_DATA evidence level).
- Profile: industry/sub-industry locked (server-side immutability from previous pass intact).

## S. Company Member QA — PASS

- `member@nilefresh.example` → Company workspace, "Member — read only" badge, **no + New campaign**, no mutation controls; full read access to campaigns/products/reports.

## T. Operations QA — PASS

- `ops@tajribti.internal` → `/app/ops`, pipeline status cards + From/To + filters, request queues; **Administration tab hidden**.

## U. Operations Manager QA — PASS

- `opsmanager@tajribti.internal` → `/app/ops`, same operational scope; **no Administration tab**, no platform controls.

## V. Platform Admin QA — PASS

- `platform@tajribti.internal` → `/app/ops` with **Administration tab visible**.

## W. Industry / Sub-industry QA — PASS

- Controlled taxonomy selects (`/api/meta/industries` 200 on preview); profile classification locked post-creation (UI disabled + server rejects PATCH).

## X. QR QA — PASS

- QR / Sources tab on preview: QR PNG renders (Cairo Mall Activation, `NILE-HIBISCUS-CAIRO-001`), entry URL shown, Copy link + Download QR buttons present, "Locked once launched — view only" enforced on ACTIVE campaign.

## Y. Reporting QA — PASS

- Shared evidence engine; Company report view (identity/objective/exec summary/bilingual narrative) vs Operations pipeline/reporting surfaces — same persisted data. From/To date filters present on company campaigns/reports and ops pipeline + request queues.

## Z. 390px responsive QA — PASS

- Public: scrollWidth 391 vs innerWidth 390 (1px, no visible horizontal scrollbar — borderline rounding on a full-bleed element; visually clean).
- Company workspace: 390/390 — sidebar collapses to nav rows, no overflow.

## AA. Runtime / API QA — PASS

- `/api/health` 200, `/api/meta/industries` 200, `/login` 200, `/app/company/` 200, `/assets/img/product-cans.jpg` 200.
- `POST /api/staff/login` on preview: all 5 roles → correct workspace, correct server-side role.
- `/api/company/campaigns` returns seeded campaign with product join.
- Note: one cold-start race observed — first company-workspace load after idle can briefly show the sign-in card; a reload/second login lands correctly. Cause: per-instance `/tmp` DB copy on cold start. Preview-only artifact; documented, not a product bug.

## AB. Regression results — PASS

- `npm test`: **118/118 pass** (33 suites) — re-run after `server.ts` changes in `ace4a01`/`9c6ba33`.
- `tsc -p tsconfig.json`: clean. `prisma validate`: clean. `vercel build` (local, Build Output API): clean.
- No test changes needed this pass (no code changes).

## AC. Remaining gaps

- Preview DB is per-instance `/tmp` SQLite → mutations don't persist across instances/cold starts; seeded fixture data only. Fine for visual review; not a production topology.
- Seeded campaign has no participants → live workspace reports show honest zero-data states; the visual richness is demonstrated by the labeled fictional public Sample Report.
- The stale earlier deployment on `tajribti-preview` project still occupies that project's own production alias (predates `JWT_SECRET` → 500s). Project left untouched per instruction; cleanup is a separate Founder decision.
- The `tajribti` project's production alias (`tajribti-islam-elbaz-s-projects.vercel.app`) still points at old ERROR deployments — untouched; promotion is out of scope.

## AD. Blockers

None.

---

## Review credentials (preview fixture data only — do NOT copy to production)

- Company Admin: `layla@nilefresh.example` / `CompanyPass123!`
- Company Member: `member@nilefresh.example` / `CompanyPass123!`
- Operations: `ops@tajribti.internal` / `OpsPass123!`
- Operations Manager: `opsmanager@tajribti.internal` / `OpsPass123!`
- Platform Admin: `platform@tajribti.internal` / `PlatformPass123!`
