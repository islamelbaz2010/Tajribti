# TAJRIBTI — VERCEL CURRENT-PROJECT DEPLOYMENT FORENSIC REPAIR

Date: 2026-09-24 · Scope: Vercel Preview deployment repair + manual-review readiness only. No product changes.

## A. PROJECT IDENTITY

- Repo: `github.com/islamelbaz2010/Tajribti` · local `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean`
- Baseline HEAD: `b483ccb` → repaired HEAD: **`80a606121e06eacdde06cc18d0729a1f9dbcd41d`**
- Branch: `master`; pushed to `origin/master` + `origin/benchmark-current` (synced)
- No AI_BOOTSTRAP file exists in this repository.

## B. TARGET VERCEL PROJECT

- Project: **`tajribti`** (`prj_HtmXMR8S0D99GbCNTfPYXhoYORvW`, team `islam-elbaz-s-projects` / `team_39m7lWlAV3vikfMHneAoZrtG`)
- CLI link verified via `.vercel/project.json` — correct project.

## C. FORBIDDEN PROJECT CONFIRMATION

`tajribti-preview` was **not touched** — no deployments, settings, env vars, or reads beyond confirming identity. No fallback use.

## D. ROOT CAUSE OF THE 404 (evidence-backed)

The repository uses the legacy `vercel.json` `builds`/`routes` pipeline: all traffic → `api/dist/vercel.js` (serverless entry). That file is **gitignored build output** — it must be produced during the Vercel build by `api/package.json`'s `vercel-build` script (tsc → prisma generate → migrate/seed `preview.db` → copy `web/` → `api/web-bundle`).

Two compounding defects:

1. **Root `package.json` had no `vercel-build` script** — the script existed only in `api/package.json`. `npm run vercel-build` at repo root failed (verified locally).
2. **Git-triggered deployments never run the build step under `builds`.** Build logs (Vercel API `/v2/deployments/{id}/events`): the `b483ccb` git deployment cloned the repo, ran `vercel build`, and completed in **18ms** — no `npm install`, no `vercel-build`, then warned *"Build output contains no 'functions', 'static', or 'services' directory"* → deployment marked **Ready** but serving **404 NOT_FOUND** past the SSO wall. Re-verified identically on the `edddcb5` git deployment after the root-script fix — the git path skips the build step regardless.

By contrast, `vercel deploy` (CLI) runs the full pipeline — install → `npm run vercel-build` → `@vercel/node` bundling `api/dist/vercel.js` (28.43MB incl. prisma engine + preview.db + web-bundle) → working function.

**Why not migrate off `builds`:** Vercel's zero-config `api/` function convention is recursive — every `.js`/`.ts` under `api/` becomes a function. The `api/` workspace (src, dist, test, prisma) would produce dozens of junk/broken functions. That migration is a forbidden architecture redesign.

## E. REPAIR PERFORMED

| Change | File | Why |
|---|---|---|
| Add `"scripts": {"vercel-build": "npm run vercel-build --workspace=api"}` | `package.json` (root) | Makes the intended api build runnable from the project root — required for `vercel build`/`vercel deploy` |
| Add `"git": {"deploymentEnabled": false}` | `vercel.json` | Git auto-deploys can **only** produce empty 404 builds under the `builds` pipeline (proven on 2 commits). Stops dead "Ready" deployments that break manual review. CLI deploys unaffected |

Product architecture, serverless entry, preview.db isolation, and all application behavior: **unchanged**.

## F. EXACT FILES CHANGED

- `package.json` — +4 lines (scripts block) — commit `edddcb5`
- `vercel.json` — +1 line (git.deploymentEnabled) — commit `80a6061`

No other repository files modified.

## G. TESTS / BUILD VERIFICATION

- `npm run vercel-build` at root: **succeeds** — produces `api/dist/vercel.js`, `api/dist/server.js`, `api/prisma/preview.db` (12 migrations + seed + preview-seed), `api/web-bundle/` (public + app surfaces), Prisma client incl. `libquery_engine-rhel-openssl-3.0.x.so.node`
- Full suite: **148/148 tests, 41 suites, 0 failures**
- `tsc --noEmit`: clean · `prisma validate`: clean
- Remote Vercel build logs: install + vercel-build + builders all executed; `λ api/dist/vercel.js` function built

## H. PREVIEW DEPLOYMENT

- Deployment ID: **`dpl_…`** (inspect `tajribti-81hg4ynt8`) — status **Ready**, target **preview**
- Built from working tree at HEAD `80a6061`
- **Preview URL:** `https://tajribti-81hg4ynt8-islam-elbaz-s-projects.vercel.app`
- **Founder shareable link** (deployment-scoped protection bypass, revocable):
  `https://tajribti-81hg4ynt8-islam-elbaz-s-projects.vercel.app/?_vercel_share=sgmRekYSDanJpJhfAL7wKlfCGkm1QUky`
- Project SSO (`all_except_custom_domains`) unchanged — bypass is scoped to this one deployment.

## I. HTTP + SMOKE-TEST RESULTS (all via the share link, verified live)

| Route | Result |
|---|---|
| `/` | 200 — 11 study-cards, deliverables, FAQ, sample-report shell, fictional-data badges |
| `/login` | 200 — `Log in — TAJRIBTI`; password field empty, **no prefilled credentials** |
| `/app/consumer/` | 200 — `TAJRIBTI — Consumer` |
| `/app/company/` | 200 — `TAJRIBTI — Company Workspace` (sign-in surface) |
| `/app/ops/` | 200 — `TAJRIBTI — Operations` (sign-in surface) |
| `/api/health` | 200 — `{"ok":true,"db":"up","service":"tajribti-benchmark-api","dev":false}` |
| `/api/meta/industries` | 200 |
| `/assets/img/product-cans.jpg` | 200 |

No unsupported pricing/AI/predictive claims; no production consumer data (seeded fixtures only).

## J. PREVIEW DB ISOLATION

`api/src/vercel.ts` copies the bundled seeded `preview.db` → `/tmp/tj-preview.db` per instance; `DATABASE_URL=file:/tmp/tj-preview.db`. No production connection, no production PII — confirmed by construction and by health/db responses.

## K. PRODUCTION SAFETY

Zero Railway changes: no env vars, volume, database, bucket, or deployment touched. Railway production (`46eea3db` SUCCESS, `{"ok":true,"db":"up"}`) unchanged. No secrets printed or committed (Vercel token used only for the deployment-scoped bypass API call; not stored in repo).

## L. REMAINING ISSUES / OWNER DECISIONS

1. **Git auto-deploys are now disabled** (`git.deploymentEnabled:false`) — deliberate: they can only emit empty 404 builds under the legacy `builds` pipeline. New review previews are created with `vercel deploy` from the repo root (established workflow — the 09-23 working preview was made the same way). Re-enabling push-based previews requires migrating off `builds`, which conflicts with the `api/` workspace layout → **Founder/architecture decision, not made here.**
2. Pre-existing dead/empty deployments remain in the project's history (harmless; the share link above is the correct one).
3. The `tajribti` production alias still points at old ERROR deployments — promotion is out of scope per instructions.
4. `JWT_SECRET` exists on Preview target (set in the 09-23 pass); no env vars added or changed this pass.

## M. FINAL STATUS

**REPAIRED + VERIFIED — MANUAL-REVIEW-READY.** Root cause identified from build-log evidence; two-line minimal repair; preview serves all surfaces with HTTP 200 on an isolated seeded database; production, governance, Mobile, Commercial, Report #08, Sample Report, and `tajribti-preview` all untouched.
