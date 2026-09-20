# TAJRIBTI — Product Evolution + Role Governance + UX Refinement Review

**Date:** 2026-09-20 · **Pass:** consolidated product-evolution pass on release candidate `30d6a98`

## 1. Repository

| Item | Value |
|---|---|
| Branch | `master` |
| Prior HEAD | `30d6a9875479cb2ccfa3048d1c274bbcc65c589e` |
| origin/benchmark-current | `9bc15f0956c85a86be4453424f613da32d39782f` |
| Ahead/behind (before commit) | 5 / 0 |
| Working tree | changes from this pass only; no stray artifacts staged |
| Push / deploy | none performed, none planned |
| Benchmark SHA-256 | `648d2031…2534a` — verified unchanged before and after |

`AI_BOOTSTRAP` file: still absent — documented; existing authority hierarchy (Benchmark → Founder decisions → source/tests) used.

## 2. New capabilities

### A. Automatic QR image generation — IMPLEMENTED + VERIFIED

- `GET /api/company/campaigns/:id/qr-sources/:sid/qr.png` generates a deterministic 512×512 PNG of the consumer entry URL (`{origin}/app/consumer/?qr=CODE`), on demand — nothing persisted, so the image can never drift from the entry link.
- Origin derived from the request (`trust proxy` already set) — correct locally and behind Railway.
- Company UI: every source now shows **thumbnail QR + label + code + active window + entry link + Copy link + Download QR**. Images load via authenticated blob fetch (endpoint is auth-gated).
- **Verified live:** PNG decodes (OpenCV) to `http://localhost:4000/app/consumer/?qr=LIVEQR01`; entry route resolves the code and correctly **refuses a non-ACTIVE campaign** — QR is an entry mechanism, not a permission bypass.
- Tenant isolation: foreign-company access → 404 (tested).

### B. Campaign Delete — IMPLEMENTED + VERIFIED

- `DELETE /api/company/campaigns/:id` — `requireCompanyAdmin` + **DRAFT-only**.
- Refuses (409): READY / ACTIVE / PAUSED / COMPLETED; any campaign with `Participation` rows (evidence guard, belt-and-braces since DRAFT can't collect any).
- Hard delete of configuration rows inside a transaction; hosted media objects removed best-effort first; writes `CAMPAIGN_DELETE` to `AccessAuditEvent`.
- Company UI: two-step inline "Delete draft → Confirm delete" button, **COMPANY_ADMIN only**, DRAFT only. Member sees no button; API 403s either way.
- **Verified live:** admin delete → 204 → 404 on reload; member → 403; READY → 409.
- Edit was already complete (PATCH + UI); verified via existing + new regression tests.

## 3. Role governance

Full matrix: `reports/TAJRIBTI_ROLE_CAPABILITY_MATRIX_2026-09-20.md`. Verified against middleware/route source. Key confirmations:

- Member vs Admin split is coherent (config collaborative; destructive/PII-adjacent acts Admin-only).
- Operations vs Platform Admin separation is API-enforced; PII is Platform-Admin-only and audited.
- No role capabilities were weakened or expanded beyond approved scope.

## 4. UX — fixed / improved / unchanged

**Fixed (defects):**
- **Seed credentials exposed in production-facing HTML** — `web/app/company/index.html` and `web/app/ops/index.html` shipped working login defaults (`layla@nilefresh.example`/`CompanyPass123!`, `ops@…`/`OpsPass123!`). Removed; `autocomplete` hints added. Local review credentials now live only in review docs.

**Improved:**
- Public site: added a product-led hero visual (phone QR-entry + report card, pure SVG/CSS — no invented assets), a Consumer entry in the unified login menu, tightened presentation. No unsupported claims introduced; sample report remains flagged as fictional demo data.
- Company QR tab: image-first source rows with copy/download.
- Company campaign detail: `button.danger` style added (was missing on this surface) for the delete affordance, matching ops.

**Intentionally unchanged:**
- Consumer OTP flow + conditional Akedly Shield (D-6) — no defect found; untouched.
- Ops console layout, report rendering, D-3 profiles, D-5 media code — verified, preserved.
- No video/assets added to the public site: no real media files exist in the repo; fabricating them would violate the no-invented-claims rule. **Asset dependency documented** — a product demo video would require Founder-supplied footage.

## 5. Existing approved work — status

| Item | Status |
|---|---|
| D-3 study profiles | unchanged — 8 distinct profiles; instrument-depth limitation remains documented |
| D-5 hosted media | code complete (14 tests, fail-closed 503); **infrastructure still pending** — staged bucket not applied |
| D-6 Akedly Shield | unchanged — provider-conditional, no invented threshold |
| Discover exclusion / Activity | unchanged, tests green |
| Push removal | unchanged — endpoints absent, tests green |
| Audience clearing / stale-approve / QR entry URL | unchanged — prior fixes intact |

## 6. Tests

`npm test` → **82/82 pass, 25 suites** (was 74/23; +8: QR PNG ×3, campaign delete ×5).
`tsc --noEmit` exit 0 · `npm run build` exit 0 · `prisma validate` clean · all 4 web surfaces' inline JS parses.

Live manual verification on isolated `dev-review.db` (port 4000): QR source create → PNG → decode → entry-gated correctly; member 403 / admin 204 / READY 409 delete all confirmed. `dev.db` untouched.

## 7. Remaining Founder decisions (blocking next step only)

1. **Delete semantics beyond DRAFT** — archive/withdraw concept for READY+ campaigns, if ever desired.
2. **D-5 infrastructure** — apply staged `tajribti-media` bucket + 5 env vars, or defer hosted media from release scope.
3. **Public-site media assets** — supply real product/demo imagery or ship the current asset-free visual design.

## 8. Release status

**READY FOR FOUNDER MANUAL REVIEW**

(QR verified end-to-end; campaign CRUD verified; no unresolved governance blockers inside this pass's scope; public site and login refined; D-5 infrastructure remains a flagged dependency, not a code gap.)
