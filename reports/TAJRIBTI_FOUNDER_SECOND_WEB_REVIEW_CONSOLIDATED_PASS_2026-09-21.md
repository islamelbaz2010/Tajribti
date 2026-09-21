# TAJRIBTI — Founder Second Web Review: Consolidated Pass

Date: 2026-09-21
Scope: Founder-directed corrective/product UX pass — public B2B site, unified
staff login, role-aware reporting surfaces, filters, communication gap analysis.
Read-only items (Benchmark, Founder Decisions, mobile, commercial, production):
untouched throughout.

## 1. Founder observations addressed

- Public header "Journey" → unclear for first-time B2B visitors → renamed.
- Duplicate Company Login block at the bottom of the homepage → removed.
- Consumer Login must not appear on the public site → removed (consumers are
  mobile-only; the previous dropdown exposed a consumer entry point).
- Home Care / Household visual showed a generic kitchen scene, not a triable
  product → replaced with an unbranded household spray-cleaner photo.
- Study-type pills communicated no meaning → replaced with purpose + real
  template questions.
- Sample report was text-heavy → upgraded with KPI cards, bar distributions,
  finding cards, and an Insight→Decision→Recommendation chain.
- Staff had separate workspace URLs → unified `/login` + `/api/staff/login`.
- Data-heavy lists lacked filtering → filter bars added.
- Company ↔ Operations communication breadth → investigated (see §10).

## 2. Public website changes

- Header: `Journey` → `How it works` (anchors to the existing `#how` workflow
  section — no new product model invented). `Log in` is now a single link to
  `/login`; the dropdown (which exposed a Consumer login item) is gone.
- Duplicate "Company Login" button removed from the final CTA — the header
  login is the single entry point.
- New FAQ section ("Questions companies ask") — four items, all statements
  traceable to implemented behavior (mobile-only consumers, staff workspaces,
  report contents, persisted-evidence-only figures, n-threshold suppression).
- Sector card for Home Care now shows an unbranded household spray cleaner
  (CC BY 2.0, bmstores/Flickr via Openverse — attribution in footer). The
  beverage, beauty, and bottle images (Unsplash) are unchanged.
- Text density: no sections removed; the section order already matched the
  target structure (hero → how it works → sectors → deliverables → study
  types → sample report → integrity → FAQ → demo).

## 3. Header decision

`How it works` adopted — it names the visitor's question ("how does this
work?") rather than the internal domain term ("Journey"). Points at `#how`,
the existing accurate three-step trial→feedback→evidence section.

## 4. Home Care visual correction

`product-cleaning.jpg` — unbranded spray bottle + paper towel, visually
verified (no brand marks, clearly a household cleaning product a consumer
could trial). Rejected candidates included a labeled "Spray & Wipe" bottle
(visible product label) and a branded Clorox caddy.

## 5. Text-to-visual changes

- Study pills → 3-column `study-card` grid: each card carries the study name,
  a one-line purpose, and 2 real example questions quoted verbatim from
  `api/src/lib/studyTemplates.ts`. No fabricated questions.
- The "9 shown" presentation subset is unchanged — still 3 pre-existing
  templates + 6 of the 8 OFD-04 profiles; `CLAIMS_TESTING`, `UA_EXPANSION`
  and the 3 vertical post-trial templates remain represented implicitly.
  Reconciliation documented in the prior gate; not a methodology change.

## 6. Sample report changes

New visual blocks (same demo data, still flagged "Illustrative example —
fictional demo data, not a real campaign"):

- Campaign snapshot: 4 KPI cards (Entered / Eligible / Survey complete /
  Purchase intent).
- Trial funnel: existing row retained.
- Campaign-specific questions: count table → proportional bar rows
  (widths derived deterministically from the shown counts).
- Findings: bullet list → accent-bordered finding cards.
- New "Insight → decision" chain: Finding → Insight → Decision implication →
  Recommendation (Recommendation text matches the real deterministic rule
  output; the demo label covers the interpretive middle steps).
- Methodology & limitations block unchanged.

## 7. Reporting architecture

One engine confirmed: `buildReport()` in `api/src/lib/report.ts` serves both
`GET /company/campaigns/:id/report` and `GET /ops/campaigns/:id/report`. No
second report engine exists or was created. Insights and live measurement
similarly share `measurement.ts`/`intelligence.ts` across surfaces.

## 8. Role-specific report views

- Company Member: read-only verified live (`+ New campaign`, profile save,
  and all mutating controls hidden; API returns 403 regardless).
- Company Admin: report tab + campaign management context unchanged.
- Operations: campaign detail already exposes Configuration, Readiness,
  QR/Journey, Participants (admin-gated), Live Monitoring, Operational
  Issues, Survey Ops, Insights, and Final Report. Added an operational
  overview strip in the campaign header — readiness verdict, entered /
  trial-redeemed / survey-complete counts, open-issue count — from the same
  existing endpoints, so the operational state is visible without opening
  tabs.
- Operations Manager: same workspace, narrower permissions unchanged
  (companies onboarding + no Administration tab).
- Platform Admin: Administration tab (ops users + audit) unchanged; no
  company-report editing powers added.

## 9. Filters

Client-side over already tenant-scoped data (no new endpoints, no new
authorization surface):

- Company campaigns: search (name), status, study type, start-date ≥.
- Ops pipeline: search (campaign or company), status (server-side, kept),
  study type, start-date ≥; company drill-down filter unchanged.
- Ops companies: search, industry, dependent sub-industry.
- Ops study-type requests: search (campaign/company) + existing status.
- Ops question-change requests: search (campaign/company) + status.
- Ops participants (Platform Admin only): search (name/phone), status,
  QR source.
- All filter bars have a Reset control; empty-filter behavior unchanged.

## 10. Company ↔ Operations communication findings

**Gap confirmed, not implemented.** The authorized channels are:

- Study-type change requests (company → ops, with approve/reject/
  request-changes outcomes visible back to the company).
- Question change requests (same pattern).
- Operational Issues (ops-internal: open/resolve; not company-visible).

No Benchmark clause or Founder Decision authorizes a general campaign
communication/action-request mechanism with an OPEN → COMPANY RESPONDED →
UNDER REVIEW → RESOLVED lifecycle. Per the gate's stop conditions, this is
documented rather than implemented.

**Minimum Founder decision required:** approve a general campaign comment /
action-request object (owner, status lifecycle, visibility rules for company
vs ops, audit fields). Reusing `OperationalIssue` with a `visibleToCompany`
flag + company response endpoint would be the smallest implementation if
approved.

## 11. Unified staff login

- `POST /api/staff/login` (`api/src/routes/staffAuth.ts`): checks Employee
  then OpsUser; returns `{ token, kind, role, workspace }`. `workspace` is
  computed server-side (`/app/company` or `/app/ops`) — never from input.
- `/login` page (`web/public/login.html`, routed in `server.ts` before the
  static mount): single email/password form; stores the token under the
  destination workspace's existing storage key; whitelists the returned
  workspace before redirecting.
- Existing `/api/company/auth/login` and `/api/ops/auth/login` remain intact
  — direct workspace URLs still work.
- Consumers cannot authenticate: no staff-table row exists for them, and a
  phone-as-email input fails schema validation (400).

## 12. Authentication / authorization verification

- New suite `api/test/staff-login.test.ts` — 8 tests: admin→company,
  member→company, all three ops roles→ops, consumer rejection, identical
  401s for unknown email vs wrong password, malformed input 400, and
  returned tokens verified against real workspace routes.
- Token kinds unchanged (`employee`/`ops`); middleware untouched; tenant
  isolation untouched. Rate limiting identical to existing logins
  (10/5min per email key).

## 13. Visual QA

Playwright + system Chrome, all real renders at 1440px and 390px:

- `/login`: clean card, error state verified.
- Redirects verified live: admin→/app/company, member→/app/company,
  ops-manager→/app/ops, platform-admin→/app/ops. (`ops@tajribti.local`
  returned 401 — the dev account's password differs; not a defect.)
- Public desktop: hero, sector cards (new cleaning image), study grid,
  upgraded sample report, FAQ — all render correctly.
- Public mobile: single-column stacks correctly; `Log in` stays visible
  (fixed a regression where the mobile nav-hiding rule would have removed it).
- Company campaigns: filter bar renders; status filter works.
- Ops pipeline: search/study-type/date filters render and filter.
- Ops campaign: overview strip shows Readiness/Entered/Trial redeemed/
  Survey complete/Open issues.
- Ops companies: industry/sub-industry filters work.
- Member: read-only verified (button hidden; earlier visible screenshot was
  a mid-load artifact, re-verified with computed style check).

## 14. Tests

- Full API suite: **118/118 pass** (was 110; +8 staff-login tests).
- `tsc --noEmit`: clean.
- Inline JS in all four web surfaces: `node --check` clean.
- Prisma: no schema change this pass (no migration needed).

## 15. Files changed

- `api/src/routes/staffAuth.ts` (new)
- `api/src/server.ts` (mount + /login route)
- `api/test/helpers.ts` (test-harness mount)
- `api/test/staff-login.test.ts` (new)
- `web/public/login.html` (new)
- `web/public/index.html` (nav, study cards, report visuals, FAQ, image, footer)
- `web/public/assets/img/product-cleaning.jpg` (new, CC BY 2.0)
- `web/app/company/index.html` (campaign filter bar)
- `web/app/ops/index.html` (pipeline/companies/requests/participants filters,
  campaign overview strip)
- `reports/TAJRIBTI_FOUNDER_SECOND_WEB_REVIEW_CONSOLIDATED_PASS_2026-09-21.md` (this file)

## 16. Founder Decisions required

1. **General Company↔Operations campaign communication channel** (§10) —
   not authorized by any current decision; minimum decision described above.
2. Whether the public study-type grid should show all 14 executable
   templates or stay a curated 9 (currently: curated; unchanged).
3. Structured demo-request form vs the current `mailto:` CTA (carried over
   from the Zamplia review queue).

## 17. Deferred items

- `dist-table`/`finding-list` CSS classes are now unused on the public page
  (replaced by new classes) — harmless; left for a cleanup pass.
- Hosted media storage provisioning (infrastructure gate — unchanged).
- dev.db contains test-fixture campaign noise (unchanged — dev data).

## 18. Production / Mobile / Commercial status

- Production: untouched — no deploy, no infra changes.
- Mobile: untouched — zero files under `mobile/` modified; consumer OTP/
  Akedly flow unchanged.
- Commercial: untouched — no pricing, billing, or plan surfaces touched.
- Benchmark: SHA-256 `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` — unchanged.
- Founder Decisions: unchanged.
