# TAJRIBTI — Founder Consolidated Web / Workspace / Reporting UX Pass

**Date:** 2026-09-21 (executed 2026-09-23 local time)
**Scope:** Public B2B website + Company workspace + Operations workspace + reporting surfaces. One consolidated pass. Local only — nothing deployed.

---

## 1. Repository state

- **START HEAD:** `fcb18c4396b78cc2a41db9b9e06d01229e0e3e7d` (previous consolidated pass commit)
- **Branch:** master
- **Working tree at start:** clean except pre-existing untracked Founder workbooks + `doc/Consumer Insights & Feedback/` (untouched)

## 2. Benchmark verification

- `governance/REFERENCE_PRODUCT_BENCHMARK.md` SHA-256 **before and after:** `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` — **unchanged**.
- No Founder Decision file, methodology definition, evidence model, OTP/Akedly path, or audit architecture was modified.

## 3. Public website changes

- Header unchanged from last pass: `How it works → #how`, `Sectors`, `Sample report`, `Log in → /login`, `Book a demo → #contact`. No Consumer login, no Operations CTA anywhere on the public site.
- "How a TAJRIBTI campaign works" cards keep the 3-step Trial → Feedback → Evidence story.

## 4. Image changes (Founder visual corrections)

| Slot | Before | After | License |
|---|---|---|---|
| Sector card — Food & Beverage | glass of juice (`product-beverage.jpg`) | unbranded beverage can tops (`product-cans.jpg`) | CC0 via Openverse |
| Sector card — Beauty & Personal Care | makeup brushes flatlay (`product-beauty.jpg`) | generic shampoo/conditioner/body-soap bottles (`product-shampoo.jpg`) | CC BY 2.0 — takot (Flickr 4804922749), attributed in footer |
| How-card 2 — Feedback | **branded** cosmetics flatlay (NARS/Too Faced/Morphe visible, `product-beauty-2.jpg`) | blank-label dropper bottle (`product-skincare.jpg`) | CC0 via Openverse |
| How-card 3 — Evidence | unrelated kitchen interior (`product-home.jpg`) | household spray cleaner (`product-cleaning.jpg`, already in repo) | CC BY 2.0 — bmstores |
| Hero short image | makeup brushes | shampoo bottles | (same as above) |

- Removed files: `product-beauty-2.jpg` (contained real brand marks — a compliance fix, not just taste), `product-beauty.jpg`, `product-beverage.jpg`, `product-home.jpg` (all unused after the swap).
- Footer attribution updated to cover all CC-licensed images.

## 5. Study Type presentation

- Unchanged from last pass — card layout (Study Type / purpose / 2 real `studyTemplates.ts` questions) verified intact. Curated 9-type subset preserved; all-14 exposure remains a queued Founder decision.

## 6. Sample Report redesign

- Added **5-point distribution bars** under both headline metrics (purchase intent and product experience), previously averages-only:
  - Purchase intent 66/56/34/18/10 = n=184, mean 3.82 → consistent with the stated 3.8/5.
  - Experience 78/60/26/10/5 = n=179, mean 4.10 → consistent with the stated 4.1/5.
- Everything remains inside the `Illustrative example — fictional demo data` flag; funnel (Entered→Eligible→Trial redeemed→Survey complete), question-level bars, audience-difference panels, voice quotes, findings cards, Insight→Decision chain, and methodology/limitations all retained.

## 7. Shared reporting engine

- Unchanged: both `/api/company/campaigns/:id/report` and `/api/ops/campaigns/:id/report` serve `buildReport()` — one engine, role-specific presentation only.

## 8. Company reporting experience

- New **Reports** sidebar page: search + status + study type + **From/To date range on campaign start date** (labeled "Campaign start date on or after/before" via titles) + reset. Clicking a row opens the campaign detail directly on its **Report** tab (`openCampaign(id, 'report')`).
- Campaign detail tabs unchanged (Setup / Journey / QR / Live / Insights / Report) — the report itself still renders the full cover → exec summary → funnel → metrics → questions → voice → audience → findings → recommendations → methodology structure.

## 9. Operations reporting experience

- Campaign header operational strip (readiness, funnel, open issues) retained from last pass; Report tab renders the same shared payload — verified live (DRAFT campaign correctly shows `ZERO_DATA` evidence level with no fabricated figures).
- **Pipeline status cards** added: All / Draft / Ready / Active / Paused / Completed with live counts; clicking sets the status filter. Status moved from server param to client-side filter so counts are accurate across all buckets (companyId remains the only server-side filter).
- **From/To date range** added on campaign start date. Request lists (Study-Type, Question) gained a "Requested on or after" filter on `createdAt`.

## 10. Platform Admin

- Unchanged: Administration tab (ops users + audit) stays PLATFORM_ADMIN-only. Verified live via unified login (`ops@tajribti.internal` → `/app/ops/` → Administration visible; OPERATIONS_MANAGER session correctly shows no Administration tab).

## 11. Date range filtering

- Company Campaigns: `cf-from`/`cf-to` on **campaign start date**.
- Company Reports: `rf-from`/`rf-to` on campaign start date.
- Ops Pipeline: `pipeline-from`/`pipeline-to` on campaign start date.
- Ops request queues: `*-from` on request `createdAt`.
- All resettable; all client-side over already tenant-scoped datasets — no isolation impact.

## 12. Company sidebar / navigation

New information architecture in `web/app/company/index.html`:

- Left sidebar: company name, nav (Overview, Campaigns, Products, Reports, Company Profile, Employees), `+ New campaign` primary action, all inside a sticky card.
- ≤820px: sidebar collapses to a horizontal nav row; verified no horizontal overflow at 390px.
- `+ New campaign` is hidden for COMPANY_MEMBER (`applyRoleUI`) — verified `display:none` live.

## 13. Campaign status cards + pagination

- Campaigns page: clickable status cards (All/Draft/Ready/Active/Paused/Completed with real counts) drive the existing status filter; list is paginated at 10/page with Prev/Next + count label (dev data has 77 campaigns — the long-list problem is real and now handled).
- Overview page: KPI strip (Total/Active/In review/Completed/Draft), status cards that deep-link into the filtered Campaigns page, 5 most recent campaigns, product preview, consumer panel card.

## 14. Products navigation

- Products is now a first-class page: card grid with image (when `imageUrl` set), name, description, price/pack, claims, and per-product campaign count. Add form retained, admin-only.
- Product select in New Campaign unchanged — product choice during creation preserved.

## 15. Company Profile immutability

- **Server:** `PATCH /company/profile` now rejects any `industry`/`subIndustry` value that differs from the stored value (400 with a clear message). Resending unchanged values is a no-op; `name` remains editable. Legacy non-taxonomy values are preserved untouched.
- **UI:** both selects render disabled for every role with an explanatory note; the save button now sends only `name`.
- Tests updated (the previous "PATCH accepts a valid pair" test contradicted the new direction and was replaced — see §21).

## 16. Employees navigation

- Employees is a first-class page: list (name/email/role) + admin-only add form with role select. Members see the list read-only; add form hidden (backend 403 regardless).

## 17. New Campaign access

- `+ New campaign` sidebar CTA opens a dedicated page with the existing creation form (study-type tag, name, objective, dates, product). Admin only.

## 18. Unified Login verification

- `POST /api/staff/login` unchanged; live-verified: `layla@nilefresh.example` → `/app/company/`, `layla2@nilefresh.example` → `/app/company/` (member), `opsmanager@tajribti.internal` → `/app/ops/`, `ops@tajribti.internal` → `/app/ops/` (admin tab present). Server-side role resolution only; consumers cannot authenticate.

## 19. Role authorization

- Verified live: member sees no `+ New campaign`, no save controls, locked profile selects, hidden employee add form. Ops Manager sees full ops workspace minus Administration. Platform Admin sees Administration. Backend middleware unchanged — all enforcement is server-side.

## 20. Responsive QA

- 390px: sidebar collapses to nav row, no horizontal scroll (fixed two real overflow bugs found in QA: `.page-area` sizing under `align-items:flex-start` in column mode, and un-capped study-type selects; campaign-item flex children given `min-width:0` so pills stop clipping).
- Public mobile: Log in + Book a demo remain visible; sector cards stack cleanly.

## 21. Tests

- `npm test` (api): **118/118 pass** (33 suites), including the 8 unified-staff-login tests and updated profile-immutability tests:
  - PATCH rejects setting an industry after creation (400)
  - PATCH rejects changing stored industry/sub-industry; same-value resend is a no-op; name still updates
  - PATCH on a company with no classification still rejects setting one
- `npx tsc --noEmit`: clean.
- `npx prisma validate`: schema valid (schema untouched).
- All four edited HTML files: inline JS parses clean via `node --check`.

## 22. Exact files changed

```
M  api/src/routes/company.ts            (profile classification immutability)
M  api/test/founder-web-review.test.ts  (immutability tests replace mutability tests)
M  web/app/company/index.html           (sidebar IA, overview, status cards, pagination,
                                         reports page, date filters, profile lock)
M  web/app/ops/index.html               (status cards, to-date, request date filters,
                                         mobile flex fix)
M  web/public/index.html                (image swaps, report distributions, attribution)
A  web/public/assets/img/product-cans.jpg      (CC0)
A  web/public/assets/img/product-shampoo.jpg   (CC BY 2.0 — takot)
A  web/public/assets/img/product-skincare.jpg  (CC0)
D  web/public/assets/img/product-beauty-2.jpg  (contained real brand marks)
D  web/public/assets/img/product-beauty.jpg
D  web/public/assets/img/product-beverage.jpg
D  web/public/assets/img/product-home.jpg
A  reports/…CONSOLIDATED_PASS_2026-09-21.md    (this file)
```

## 23. Deferred Founder Decisions

1. **Company ↔ Operations general communication channel** — still not authorized by any Benchmark clause or Founder decision; not implemented. Minimum decision needed: authorize a campaign-scoped action/comment entity + lifecycle.
2. **Exposing all 14 executable templates publicly** — curated 9-card subset retained.
3. **Structured demo-request form** — still `mailto:`.
4. **Participant-list date filter** — judged not meaningful inside a single-campaign view (spec allows omitting non-useful filters); flagged for confirmation.

## 24. Intentionally NOT implemented

- Generic staff chat/messaging (§27).
- "Survey Started" funnel stage — no such persisted stage exists; funnel shows the four real stages.
- Ops workspace visual redesign into a sidebar — the existing tab IA already maps to its Benchmark nodes; only the requested cards/filters were added (no functional reduction risk taken).
- Any new report engine, methodology, demographic dimension, or statistical claim.

## 25. Production / Mobile / Commercial status

- **Production:** untouched (no deploy, no prod data access).
- **Mobile:** untouched (`mobile/` not modified; OTP/Akedly paths unchanged).
- **Commercial:** untouched.
- **Benchmark SHA:** `648d2031…52534a` — unchanged.
