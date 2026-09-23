# TAJRIBTI — Founder Web UX + Reporting + Content Management Consolidated Pass

**Date:** 2026-09-24
**Status:** COMPLETE — deployed to primary Vercel project `tajribti` as Preview

---

## 1. Provenance

| Item | Value |
|---|---|
| Start SHA | `d7f569b1eb09dc2862bc233908434546da46fd19` |
| End SHA | `c7fac5f` (single implementation commit) |
| Branch | `master` (local; not pushed) |
| Benchmark SHA | `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` — **unchanged** |
| Vercel project | `tajribti` (`prj_HtmXMR8S0D99GbCNTfPYXhoYORvW`) — primary project |
| Deployment ID | `dpl_G4ofbZRoCAN18qMFU1sCWVH5zE5S` |
| Environment | **Preview** (`target: preview`, confirmed via `vercel inspect`) |
| Preview URL | https://tajribti-mvuh57115-islam-elbaz-s-projects.vercel.app |
| Founder access | Deployment-scoped shareable link (project SSO unchanged): `?_vercel_share=eQm22Sj6np7Q5g3o8AwWalh83TZ1QAAH` |
| `tajribti-preview` project | Untouched — not used, not modified |

---

## 2. Public Website changes — PASS

- Hero, How-it-works steps, Sector cards, Study-type cards, Sample-report marketing block, and the global CTA are now hydratable from published content (`applySiteContent` in `web/public/index.html`). Every section falls back to the static markup when nothing is published — verified live (`/api/public/site` returned `{}` pre-publish and the page rendered fully).
- The 9 study-type cards now carry `data-study-key` attributes and a status pill; the key set is a closed enum in `api/src/lib/siteContent.ts` — no methodology can be invented through the CMS.
- No unsupported claims added; the existing "Available now" vs "approved directions" labeling is preserved.

## 3. Content Management — PASS (with one preview-infra limitation)

**Architecture:** `SiteContentSection` (key → draft/published JSON + draftBy/draftAt/publishedBy/publishedAt) and `SiteMedia` (DB-stored image bytes + alt/attribution/active/sortOrder). Migration `20260923214517_site_content_media`.

- Routes: `api/src/routes/siteAdmin.ts` under `/api/ops/site/*` — every route gated by `requireOps` + `requirePlatformAdmin`. `api/src/routes/sitePublic.ts` under `/api/public/site` serves **only published** payloads; drafts are never exposed.
- Payloads are zod-validated per section (`api/src/lib/siteContent.ts`); links restricted to on-site paths/anchors/`mailto:`/`https:`; sector images restricted to media-library ids or on-site asset paths.
- Lifecycle Draft → Preview → Publish: draft save is not public; publish copies draft → published; both writes emit `AccessAuditEvent` (`SITE_CONTENT_DRAFT`, `SITE_CONTENT_PUBLISH`, `SITE_MEDIA_UPLOAD`, `SITE_MEDIA_UPDATE`).
- Admin UI: new "Public Website" sidebar item in the Operations workspace, visible to PLATFORM_ADMIN only; per-section structured editors (no HTML/CSS editing), media library with upload/activate/deactivate, last-draft/last-publish attribution, Preview opens the homepage in `?cms_preview=1` mode which applies the draft from same-origin localStorage and shows a "Draft preview" banner.
- Media storage decision: the existing hosted-media bucket (`lib/media.ts`) is private/signed-URL by design and unconfigured outside Railway — not suitable for publicly addressable site imagery. Site media is stored as DB bytes and served from `GET /api/public/site/media/:id` (active rows only). Documented in `schema.prisma` and the route file.

**Live verification:** draft → not-public → publish → public GET returned the payload → reverted to canonical values on the same instance (draft 200, publish 200, public GET echoed content).

**Limitation (preview-only):** preview deployments run on a per-instance `/tmp` copy of the bundled SQLite DB, so CMS writes are visible only to the lambda instance that wrote them and evaporate on cold start. Verified: a public read on a different instance returned `{}`. On a persistent deployment (Railway/production) the DB is durable and this does not apply. No product change made.

## 4. Image findings — DOCUMENTED

- Current public imagery is unbranded/licensed (CC BY 2.0 / CC0 / Unsplash) and consistent in crop; the F&B can image from the prior pass stands.
- The CMS media library + sector `image` slots now provide the architecture for Founder-supplied photography without code edits. Final professional photography assets remain a **Founder-supplied asset gap** — no fake/branded imagery was invented.

## 5. Sample Report changes — PASS

- Replaced the cramped inline bar+label chips with label | proportional-bar | count·% rows (`.chart-row`): purchase-intent distribution, product-rating distribution, and all three campaign-specific questions. Bar width = share of respondents; percentages sum to 100 per figure.
- Audience Differences converted from prose sentences to comparative bars (`Female 4.0/5 ████ · n=101` style).
- KPI numerals enlarged; Consumer Voice quotes moved to a two-column card grid.
- All figures, methodology, limitations, and the fictional-demo labeling are unchanged — no new metrics, no inference, no text added.

## 6. Workspace shell changes — PASS

- Operations workspace now uses the same left-sidebar shell as Company (`.app-shell`/`.sidebar`/`.snav`): Campaign Pipeline, Companies, Study-Type Requests, Question Requests; Administration + Public Website appear only for PLATFORM_ADMIN.
- `+ New campaign`, member read-only, and all existing ops panels are unchanged.

## 7. Login/logout fix — PASS

- Root cause: `#view-login` was the default-visible block in both workspaces; token restoration ran async, so the card flashed on every authenticated load and after sign-out.
- Fix at the routing level: the card starts `hidden`; the init script calls `show('view-login')` only when no valid token exists; sign-out clears all keys and redirects to `/login` (never re-renders the in-app card).

## 8. Login copy — PASS

- `web/public/login.html`: "Sign in to your workspace" + "Sign in with your authorized company or TAJRIBTI Operations account. You'll be directed to the workspace for your role." Consumer line: "Consumer participation is available through the TAJRIBTI mobile app." Server-side routing unchanged.

## 9. Header changes — PASS

- Both workspaces now show `TAJRIBTI.` (no Company/Operations suffix) + user display name + role pill + Sign out. Names persist via `tj_company_name`/`tj_ops_name` set from the staff-login `name` field.

## 10. Role verification — PASS

| Account | Workspace | Role | CMS access |
|---|---|---|---|
| layla@nilefresh.example | /app/company | COMPANY_ADMIN | 403 |
| member@nilefresh.example | /app/company | COMPANY_MEMBER | 403 |
| ops@tajribti.internal | /app/ops | OPERATIONS | 403 |
| opsmanager@tajribti.internal | /app/ops | OPERATIONS_MANAGER | 403 |
| platform@tajribti.internal | /app/ops | PLATFORM_ADMIN | 200 |

All logins verified live against the preview; all role surfaces return correct workspace + role + name.

## 11. Tests — PASS

- **124/124 tests pass** (34 suites), including 6 new: CMS authz for every role, draft-not-public, publish exposes payload, unknown/invalid payloads rejected, closed study-key set enforced, media active gating, audit events.
- TypeScript `tsc --noEmit`: clean. `prisma validate`: valid; migration applies cleanly (verified on dev.db, test DBs, and preview.db during vercel-build).
- All four edited HTML files: inline `<script>` blocks parse clean under `new Function`.
- Local end-to-end smoke on a running server: draft → publish → public read → media upload/serve — all confirmed, then test rows cleaned from dev.db.

## 12. Deployment — PASS

- Preview URL: https://tajribti-mvuh57115-islam-elbaz-s-projects.vercel.app (`dpl_G4ofbZRoCAN18qMFU1sCWVH5zE5S`, target=preview, Ready).
- Shareable bypass link created per-deployment; project SSO protection untouched.

## 13. Production untouched — CONFIRMED

- No `--prod` deploy; `vercel ls tajribti` shows only Preview deployments for this and prior passes; production aliases unchanged; production env vars untouched (`JWT_SECRET` remains Preview-scoped).

## 14. Railway untouched — CONFIRMED

- No Railway commands, config, or env changes were made.

## 15. Remaining gaps

- **Preview CMS persistence**: per-instance `/tmp` SQLite on Vercel means publishes are instance-local and ephemeral — expected on preview; persistent on a real deployment. For a durable preview evaluation, a hosted preview DB would be needed (infrastructure decision).
- **Founder-supplied photography**: the media architecture is in place; final professional product photos remain an asset gap.
- **Content-editor role**: no separate role was created (per governance); the capability sits under PLATFORM_ADMIN. If a dedicated editor role is wanted, that is a Founder decision.
- Draft preview relies on same-origin localStorage; it previews the working map, including unsaved edits.

## 16. Founder decisions still required

- Whether to approve the published-content model as-is, or add a separate content-editor role later.
- Whether to provide final approved imagery for sectors/hero, or accept the current licensed set.
