# TAJRIBTI — FOUNDER WEB REVIEW CORRECTIVE PASS
Date: 2026-09-21 · Scope: consolidated post-Founder-review corrective pass
Status: COMPLETE — ready for second Founder manual review

---

## 1. Repository Identity

- Repository: `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean`
- Branch: `master` (lineage `origin/benchmark-current`)
- Starting HEAD: `027cededca5c5956ed592c7579d4cb9f983048cc`
- Active database: `api/prisma/dev.db` (per `api/.env` `DATABASE_URL="file:./dev.db"`); `dev-review.db` exists but is not wired.
- No `AI_BOOTSTRAP` file exists in the repository; README used as loading-order evidence.

## 2. Benchmark Verification

- File: `governance/REFERENCE_PRODUCT_BENCHMARK.md`
- SHA-256 before and after this pass: `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` — **unchanged**.
- Sections directly applied: §3 (Campaign objective), §4 (Company/Operations/Consumer surfaces), §5 (Campaign core — Product named a core component), §6 (evidence-to-insight model), §7 (report model: Data → Analysis → Consumer Voice → Insight → Decision → Recommendation), §8 (Company/Operations separation).

## 3. Founder Findings → Disposition

| Finding | Disposition |
|---|---|
| Public site below professional B2B quality | Fixed — full IA rebuild, real product photography |
| Abstract/placeholder visuals | Fixed — 5 unbranded product photos (provenance below) |
| Operations Console on public marketing surface | Fixed — removed from nav and CTAs; app + login unchanged at `/app/ops` |
| `#report` insufficient for a paid deliverable | Fixed — both the public sample report and the real Company Report tab restructured to a professional cover → exec summary → evidence → findings → recommendations → methodology/limitations hierarchy |
| Company Login required but secondary | Implemented — "Log in ▾" disclosure menu (Company + Consumer) plus secondary CTA; does not dominate marketing |
| Company Member = read-only | Verified live (see §11) |
| Operations Manager verification account | Verified live (see §11) |
| Industry free-text / no Sub-industry | Fixed — canonical controlled taxonomy, dependent selects, backend validation |
| Campaign showed "Ready to launch" with no product | Fixed — product is now a readiness gate (Benchmark §5 + Founder-confirmed defect) |
| Hosted media "not provisioned" message | Infrastructure-only; wording improved to a proactive neutral pending-state |

No requested item conflicted with the Benchmark.

## 4. Public Website Changes

`web/public/index.html` rewritten end-to-end (the goal was information architecture, not cosmetics):

- **Nav**: Journey / Sectors / Sample report / **Log in ▾** (accessible disclosure menu — Company, Consumer) / Book a demo. **Operations Console removed entirely** from the marketing surface; `/app/ops` and its auth remain untouched.
- **Hero**: product-led value proposition with two real product photographs and an evidence-chain badge; CTAs are Book a demo / See a sample report.
- **How a campaign works**: three real-imagery cards — Trial (unbranded beverage), Feedback (unbranded cosmetics), Evidence (home/household context).
- **Who it's for**: Product & Innovation, Brand & Marketing, Consumer Insights & Research, Commercial teams.
- **Sectors**: photo cards for Food & Beverage, Beauty & Personal Care, Home Care. Study-type pills separated into **"Available now"** (executable study types backed by real question templates + report methodology profiles) and **"Approved directions — methodology in development"** (not executable, explicitly labeled; per FD-WEB-11/12/13 honesty discipline).
- **What you receive**: the 8 report deliverables.
- **Sample report**: rebuilt as a proper deliverable mock — dark cover band (TAJRIBTI · Consumer Insights & Feedback Report · fictional demo campaign · sample-size tag), executive summary, trial funnel, purchase intent + product experience with stated n, campaign-specific question distributions **shown as counts** (matching the real report's format — no invented percentages), audience differences with per-segment n, consumer voice, findings, evidence coverage, recommendation, methodology & limitations. Clearly flagged "Illustrative example — fictional demo data, not a real campaign" and every figure is explicitly tied to a stated n.
- **Evidence discipline band**: no significance/confidence claims, no AI sentiment, weak evidence shown as weak.
- **Final CTA**: Book a demo + secondary Company Login. Footer unchanged in substance.

**No fake proof**: no logos, no client names, no testimonials, no invented metrics anywhere on the page. The only numbers are inside the explicitly demo-flagged sample report.

**Imagery** (`web/public/assets/img/`, 5 files): real product photography sourced from Unsplash (license permits free use without attribution). Each image was downloaded and **visually inspected**; all branded candidates (Coca-Cola, Aesop, Curology, Nike, Converse) were rejected. Kept: `product-beverage.jpg` (unbranded water bottle), `product-bottle.jpg` (matte green bottle), `product-beauty.jpg` + `product-beauty-2.jpg` (unbranded cosmetics flat-lay), `product-home.jpg` (kitchen cookware). No company names, logos, or people identifiable as clients.

## 5. Report Changes

`web/app/company/index.html` `loadReport()` restructured into a professional deliverable (same `buildReport()` payload — presentation only, zero data-model changes):

- **Cover band**: TAJRIBTI · Consumer Insights & Feedback Report; campaign name; company · study type · status; product + window; tag line with completed-response count, evidence level, generated date.
- **Executive summary**: the existing deterministic bilingual narrative (EN + AR RTL, preserved verbatim) moved to the top as the exec summary.
- Ordered sections: Research objective → Consumer/sample profile → Trial participation (funnel + source attribution table) → Product experience → Purchase intent (question text + n always shown) → Campaign-specific questions → Consumer voice → Audience differences → Key findings → Evidence coverage → Recommendations → Study methodology (per-study-type profile incl. "This report does not claim") → Methodology → Limitations.
- New report CSS (`.rep-cover`, `.rep-label`, `.rep-exec`, `.rep-dist`, `.rep-method`); print stylesheet preserved so only the report prints (OFD-13).

Visual QA confirmed the real Nile Fresh "Pilot Acceptance" report renders the full hierarchy with honest n-values, and stored XSS payloads in verbatims render as escaped text.

## 6. Survey → Evidence → Insight → Report Lineage

Verified by code inspection + test suite (110/110 pass):

- Consumer answers persist as `Answer` rows bound to `questionId` + `participationId` (`consumer.ts` survey submit validates each question belongs to the same campaign and stage).
- `measurement.ts` computes funnel, purchase intent, satisfaction, and question aggregates from those persisted rows only.
- `report.ts` (`buildReport`) consumes the same measurement functions — findings, evidence coverage, narrative, recommendations are all derived from persisted evidence; zero-data campaigns get no fabricated findings; ties are named as ties; no AI inference.
- `intelligence.ts` labeled derived sections (age-band suppression, keyword-lexicon sentiment, observed-term themes) are shown only in the on-demand Intelligence panel, clearly labeled, never in the report's claims.
- Tests covering the chain: `integrity.test.ts` (answer→question→campaign binding, measurement integrity, report scope), `innovation.test.ts` (narrative/intelligence). **No hardcoded Q-labels, no second survey model, no disconnected report text found.**

## 7. Industry/Sub-industry Changes

- **Canonical taxonomy**: new `api/src/lib/industries.ts` — 7 industry groups (Food & Beverage, Beauty & Personal Care, Home & Household Care, Health & Wellness, Baby & Family Care, Pet Care, Other) each with sub-industries. Documented as Founder-directed structure; the Benchmark defines no taxonomy, so a modest consumer-goods list consistent with existing study-type categories was chosen and is documented in-file.
- **Shared endpoint**: `GET /api/meta/industries` serves the taxonomy to every surface (mounted in `server.ts`).
- **Schema**: `Company.subIndustry String?` added; migration `20260921064939_company_sub_industry` applied to `dev.db` (additive, no data rewrite).
- **Backend validation**: `POST /api/ops/companies` and `PATCH /api/company/profile` reject unknown industries, mismatched sub-industries, and orphaned sub-industries (400).
- **UI**: Company profile and Ops onboarding both render dependent selects fed from the canonical endpoint; sub-industry re-populates on industry change.
- **Legacy data**: stored values outside the taxonomy ("Test", "Telecommunications", "FMCG — Food & Beverage") are preserved on read and shown as "(existing)" marker options; saving a profile while a legacy value is selected omits the fields instead of resubmitting a rejected value. Ops companies list displays legacy values as stored.

## 8. Company / Operations Surface Separation

- Public site exposes: marketing content, Book a demo, Log in ▾ (Company, Consumer). **No Operations link anywhere on the public surface.**
- `/app/ops` remains behind ops auth; role tabs unchanged.
- Verified: `opsmanager@tajribti.internal` sees Campaign Pipeline / Companies / Study-Type Requests / Question Requests — no Platform Admin-only surfaces (ops-user management, participant PII, audit log).
- Company workspace remains company-scoped; members read-only.

## 9. Campaign Readiness Finding

**Defect confirmed and fixed.** `api/src/lib/readiness.ts` previously reported `ready: true` for campaigns with no product — matching exactly what the Founder saw.

- Added check: `{ key: "product", label: "A product is linked", ok: campaign.productId != null }`.
- Derivation documented in-file: Benchmark §5 names Product a core campaign component alongside Company/Objective/Audience/Dates; §2.1 "campaigns are designed around product, audience and goals"; the trial exists to put a specific product in consumers' hands — BENCHMARK-DERIVABLE + Founder-confirmed.
- Gates both `GET /campaigns/:id/readiness` (both surfaces) and `POST /submit-for-review` (422 until ready) and the ops launch path.
- Regression tests added (see §12).

## 10. Media Storage Finding

**Infrastructure-only, correctly surfaced.** Code is complete (S3-compatible signed PUT → confirm → signed read); `MEDIA_BUCKET_*` env vars are absent in this environment, which is a provisioning gate, not a defect.

- `GET /api/company/campaigns/:id` now returns `hostedMediaConfigured` so the UI can state the pending state proactively.
- Company media section shows: *"Hosted media storage is not yet provisioned for this environment. URL-referenced media is fully available; file upload is pending infrastructure."* — verified rendered on a DRAFT campaign.
- URL media unaffected. Hosted uploads still fail closed (503) if attempted — no fake success. Nothing was hidden or redesigned; no infrastructure provisioned.

## 11. Role Verification

Live-tested against the running local environment:

| Account | Role | Verified behavior |
|---|---|---|
| `admin@tajribti.local` | PLATFORM_ADMIN | Full admin scope |
| `opsmanager@tajribti.internal` | OPERATIONS_MANAGER | Ops scope + Companies tab with onboarding form; no Platform Admin surfaces (screenshot-verified) |
| `ops@tajribti.local` | OPERATIONS | Pipeline scope; company creation refused (403, test-covered) |
| `admin@nilefresh.example` | COMPANY_ADMIN | Full company mutation scope |
| `layla2@nilefresh.example` | COMPANY_MEMBER | Read-only verified visually: "Member — read only" pill, all inputs disabled, no save/add affordances, "Read-only — Company Member accounts cannot edit campaign configuration" |

Backend gates re-verified in `middleware/auth.ts`: `requireCompanyAdmin` (member → 403), `requireOpsManager` (OPERATIONS → 403; OPERATIONS_MANAGER + PLATFORM_ADMIN pass), `requirePlatformAdmin`.

## 12. Tests

- **API suite: 110/110 pass, 0 fail** (`npm test`, ~196s), up from 98. Includes new `test/founder-web-review.test.ts` — 9 regression tests:
  - readiness: no-product → not ready; submit-for-review 422; ready after product linked
  - taxonomy: internal consistency; ops rejects unknown industry / mismatched sub-industry / orphan sub-industry; accepts valid pair; OPERATIONS 403 on company create; company PATCH rejects invalid / accepts+persist valid pair
- Existing suites all green: role gates (OFD-08 + FD-WEB-01/03), campaign delete lifecycle, QR binding, answer→question→campaign binding, measurement/report integrity, narrative/intelligence, media, OTP/Akedly, app links.
- `npx tsc --noEmit`: clean.
- `npx prisma validate`: valid.
- Web JS parse (all 4 surfaces' inline scripts): clean.

## 13. Visual QA

Actual rendered captures (Chrome via Playwright, `/tmp/tj-qa/`):

- `public-desktop-hero.png` — hero with real product photography, clean CTAs, no ops link
- `public-desktop-full.png` — full page: hero → journey strip → how-it-works (photo cards) → audience → sectors (photo cards + honest pills) → deliverables → sample report → evidence band → CTA → footer
- `public-report.png` — sample report: cover band, exec summary, funnel, metrics with n, count-based distributions, segments with n, consumer voice, findings, methodology & limitations
- `public-mobile-full.png` — mobile stacks correctly, images responsive, nav collapses to login + CTA
- `company-report.png` — real report on Nile Fresh pilot campaign: professional cover, exec summary (EN+AR), all sections; XSS payload in a verbatim rendered as inert text
- `company-setup.png`, `company-media.png` — campaign setup; hosted-media pending-state message rendered
- `member-setup.png` — member read-only mode
- `ops-manager.png`, `ops-onboard.png` — ops manager scope; dependent industry selects (DOM-verified: F&B → 6 correct sub-industries)

## 14. Remaining Gaps

- **Hosted media storage**: awaiting `MEDIA_BUCKET_*` provisioning (infrastructure, not code).
- **Legacy industry values** in existing rows remain until each company picks a controlled industry (by design — no silent rewrite).
- **`dev.db` noise**: ~80 test/audit campaigns make the review environment cluttered (data, not code).
- **Public site imagery** is licensed stock (Unsplash), not real TAJRIBTI campaign photography — appropriate for pre-launch; real campaign imagery should replace it once available.
- Mobile local run remains blocked by host macOS 13 vs Flutter SDK requirement 14 — unchanged, out of scope.

## 15. Explicitly NOT Changed

- **Mobile**: zero files under `mobile/` touched.
- **Commercial**: no pricing, billing, plans, or commercial assumptions anywhere.
- **Production**: no deploy, no push, no production migration, no credential changes.
- **B-04**: not run.
- **Benchmark**: byte-identical (hash verified above).

## 16. Git State

- Branch `master`, starting HEAD `027ceded…`.
- Modified: `api/prisma/schema.prisma`, `api/src/lib/readiness.ts`, `api/src/routes/company.ts`, `api/src/routes/ops.ts`, `api/src/server.ts`, `web/app/company/index.html`, `web/app/ops/index.html`, `web/public/index.html`.
- New (staged with commit): `api/src/lib/industries.ts`, `api/test/founder-web-review.test.ts`, `api/prisma/migrations/20260921064939_company_sub_industry/`, `web/public/assets/img/` (5 images), this report.
- Excluded (untracked, untouched): Founder workbooks (`TAJRIBTI_FOUNDER_DECISION_REVIEW_WORKBOOK_*.xlsx`), `doc/Consumer Insights & Feedback/` reference package, prior access-package report.

## 17. Commit

One local commit created for the consolidated pass — SHA reported in the completion summary. No push, no deploy.

## 18. Founder Manual Re-Review Checklist

1. **Public site** `http://localhost:4000/` — review hero, real imagery, how-it-works, sectors (executable vs approved-direction pills), sample report section, Log in ▾ menu, Book a demo. Confirm no Operations Console link.
2. **Company Admin** (`admin@nilefresh.example` / `CompanyPass123!`) — open "TAJRIBTI Pilot Acceptance" → Report tab: review the professional report deliverable. On a DRAFT campaign (e.g. "final test") confirm the hosted-media pending note and that readiness now reports "A product is linked" as unmet.
3. **Company Member** (`layla2@nilefresh.example` / `CompanyPass123!`) — confirm fully read-only workspace.
4. **Operations Manager** (`opsmanager@tajribti.internal` / `OpsPass123!`) — Companies tab: dependent Industry → Sub-industry selects; create a test company if desired. Confirm no Platform Admin surfaces.
5. **Industry control** — Company profile shows controlled selects; legacy values display as "(existing)".
