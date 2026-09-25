# TAJRIBTI — FINAL CONSOLIDATED PRODUCT / GOVERNANCE / COMMERCIAL / PLATFORM RECONCILIATION

Date: 2026-09-25 · Single-pass forensic audit + authorized surgical implementation.

# 1. EXECUTIVE STATUS

**C. PARTIALLY RECONCILED — FOUNDER DECISIONS REQUIRED**

Authorized work implemented: Platform Admin global-authority layer over Company information (detail view, audited identity edit, employee access revocation, company-visible change traceability). One Founder direction — Industry × Sub-industry × Study-Type eligibility — has **no authoritative matrix in any source** and is recorded as a required decision, not guessed.

# 2. REPOSITORY STATE

- Branch: `master` → HEAD `215e06e` → after: new commit (this pass)
- Synced: `origin/master`, `origin/benchmark-current`
- Benchmark `043cb4c2…` — unchanged
- No AI_BOOTSTRAP file exists in this repository.
- Working tree: 6 modified + 1 migration dir + 1 test file (see §14)

# 3. SOURCES LOADED

- `governance/REFERENCE_PRODUCT_BENCHMARK.md`, `governance/FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md`
- Closure/governance reports (Phase E, final product closure, commercial closure, report/sample-report reconciliation, Phase F readiness, role capability matrix, founder web review corrective pass)
- Commercial workspace `tajribti-commercial-research/reports` (all six named reports) + source-materials grep for eligibility/matrix evidence
- Implementation: `auth.ts`, `ops.ts`, `company.ts`, `siteAdmin.ts`, `audit.ts`, `industries.ts`, `studyTemplates.ts`, `studyProfiles.ts`, `report.ts`, `measurement.ts`, `narrative.ts`, `schema.prisma`, ops/company web UIs

# 4. GOVERNANCE CONFLICTS

| Conflict | Classification | Resolution |
|---|---|---|
| FD doc §3: study-type is "not a sector/vertical selector" vs. 2026-09-25 direction that companies see only industry-appropriate study types | Founder decision superseding earlier direction — **but the eligibility matrix itself does not exist** | Newest direction governs intent; matrix content is WHITE (§9) |
| Industry/Sub-industry editable by nobody after creation (2026-09-23 ruling removed company self-edit; no ops edit route existed) | Implementation gap — authorized now | Implemented `PATCH /ops/companies/:id` |
| Prior reports vs. current code | No new conflicts found; all prior closures consistent (148→160 tests) | — |

# 5. CURRENT PLATFORM ADMIN STATE (after this pass)

| Resource | View | Create | Edit | Delete | Approve/Reject | Audit |
|---|---|---|---|---|---|---|
| Companies | ✅ list + detail | ✅ (OpsMgr+) | ✅ name/industry/sub-industry (OpsMgr+) | — | — | ✅ field-level detail |
| Employees | ✅ per-company | — (company-side) | — | — | — | ✅ revoke audited |
| Employee access | ✅ | — | revoke (PA) | — | — | ✅ |
| Products | ✅ per-company | — | — | — | — | — |
| Campaigns | ✅ all fields | — | launch/pause/close | — | — | ✅ lifecycle audited |
| Questions | ✅ + question-audit | — | via QCR apply | — | ✅ approve/reject/changes | ✅ |
| Study-type changes | ✅ requests | — | — | — | ✅ | ✅ |
| Participant PII | ✅ PA-only | — | — | — | — | ✅ |
| Ops users | ✅ | ✅ | revoke | — | — | ✅ |
| Audit events | ✅ PA-only | — | — | — | — | — |
| Public site/CMS | ✅ | ✅ draft | publish | — | Draft→Publish | ✅ |

# 6. PLATFORM ADMIN GAP ANALYSIS — IMPLEMENTED

| Gap | Before | Now |
|---|---|---|
| Company detail view (employees/products/campaigns) | None — only counts | `GET /ops/companies/:id` + ops UI detail panel |
| Company identity edit post-creation | Nobody could fix industry/sub-industry | `PATCH /ops/companies/:id` (OpsMgr+PA), taxonomy-validated, stale sub-industry cleared only when invalidated |
| Employee access revocation platform-wide | Company-admin only | `POST /ops/companies/:id/employees/:eid/revoke` (PA-only), last-admin guard, audit |
| Company can identify admin changes | No channel | `AccessAuditEvent.detail` + `GET /company/audit-events` + profile-page "Account activity" feed |
| Ops had no employee visibility | `_count` only | Employee table in detail panel (name/email/role/status) |

**Not implemented — decision dependencies:** direct PA create/edit of Products, campaign Questions, Media, QR sources. These have existing governance flows (company authorship; ops approval of change requests); unrestricted parallel CRUD would be an invention, not a surgical fix. "Company contacts": no such fields exist in the schema — a data-model decision, not assumed.

# 7. COMPANY CHANGE TRACEABILITY

- Audit: `AccessAuditEvent.detail` (nullable, additive) carries `"field: old → new"` diffs; writer extended in `lib/audit.ts`.
- Company visibility: `GET /company/audit-events` returns events targeting the company's own rows (company + its employees), actorKind-labeled; rendered as an "Account activity" table on the Company Profile page.
- No notification platform invented — the feed uses existing audit infrastructure per the direction's own constraint.

# 8. INDUSTRY / SUB-INDUSTRY

- Canonical taxonomy: `api/src/lib/industries.ts` — 7 industry groups, controlled sub-industries; served at `GET /api/meta/industries`; backend-validated on all writes.
- Storage: `Company.industry`, `Company.subIndustry` (nullable; legacy values preserved on read).
- Mutability after this pass: company self-edit remains rejected (2026-09-23 ruling preserved); Ops Manager + Platform Admin can now correct via audited `PATCH /ops/companies/:id`.
- Effect on capabilities: none today — industry is classification only (see §9).

# 9. INDUSTRY × SUB-INDUSTRY × STUDY-TYPE

**NO AUTHORITATIVE MATRIX FOUND.** Searched: Benchmark, Founder decisions, innovation register/spec, commercial research reports + source-materials, schema, seed data, templates/profiles, all closure reports. The only sector coupling in evidence is the three industry-named Post-Trial template keys; the strategic-differentiation FD explicitly folds sector into template *content* and states study-type is not a sector selector.

**REQUIRED DECISION (WHITE — not implemented):**
`Industry → Sub-industry → Allowed Study Types`, including: (a) which Post-Trial variant (or none) applies to Health & Wellness, Baby & Family Care, Pet Care, Other; (b) whether generic study types (Concept Testing, Pricing, Packaging, Claims, Ad Testing, Brand Perception, U&A, Segmentation, Differentiation & Appeal) remain available to all industries; (c) behavior when a company has no industry set or a legacy value; (d) whether ineligibility blocks StudyTypeChangeRequests and apply-template too; (e) Ops/PA override behavior.

# 10. STUDY CATALOG RECONCILIATION

14 executable templates (`studyTemplates.ts`) = company catalog (`/company/study-templates`, all returned) = ops catalog (same list). 8 methodology profiles (`studyProfiles.ts`); the 6 original types lack profiles (recorded #08 gap, unauthorized). Public site: 9 study cards, "Available now" vs "methodology in development" split (FD-WEB-11/12/13). Commercial catalog (Essential/Standard/Professional/Custom) is packaging, not template selection. No catalog duplication defect — distinct roles confirmed.

# 11. COMMERCIAL DECISION TRACEABILITY

Commercial closure register stands (42 items, CLOSED FOR PHASE F — not reopened). Chains verified for scope (FMCG-only → taxonomy is consumer-goods), sample unit (completed eligible → funnel), report-included, no I→D promise (engine has none). No implementation gaps surfaced this pass.

# 12. REPORT / METHODOLOGY RECONCILIATION

No change. Engine remains evidence-grounded/deterministic; #08 extensions (percentages, charts, satisfaction distribution, profiles for the six originals, evidence coverage in-report) remain defined-but-not-authorized. Sample Report discrepancy = documented Founder-sequenced deferral (#15 after #08; #09 forbids I→D promise). Public-site wording previously reconciled; nothing new found.

# 13. INFORMATION ARCHITECTURE FINDINGS

- Fixed: ops Companies tab had no way to see a company's employees/products — counts only. Row click now opens a detail panel; the campaign-pipeline drill is preserved as a button inside it.
- Kept: existing tab structure, filters (industry/sub-industry already present), design system, all navigation.
- Noted, not changed: study-type selector shows all 14 regardless of industry — gated by §9 decision, not an IA fix.

# 14. CHANGES IMPLEMENTED

| File | Change |
|---|---|
| `api/prisma/schema.prisma` | `AccessAuditEvent.detail String?` (additive) |
| `api/prisma/migrations/20260925000000_access_audit_detail/` | `ALTER TABLE … ADD COLUMN "detail" TEXT` |
| `api/src/lib/audit.ts` | optional `detail` on `writeAccessAudit` |
| `api/src/routes/ops.ts` | `GET /companies/:id`, `PATCH /companies/:id`, `POST /companies/:id/employees/:eid/revoke` |
| `api/src/routes/company.ts` | `GET /audit-events` (company-scoped) |
| `web/app/ops/index.html` | company detail panel: view, audited edit form, employee revoke (PA), preserved campaign drill |
| `web/app/company/index.html` | "Account activity" feed on profile page |
| `api/test/platform-admin-company.test.ts` | 12 tests (new suite) |

# 15. CHANGES NOT IMPLEMENTED

- Industry→Study-Type filtering — no authoritative matrix (§9).
- PA direct CRUD on products/questions/media/QR — would bypass existing request/approval governance; needs explicit decision on which resources.
- Employee *creation* by PA — credential-setting workflow for another tenant; not assumed.
- Any IA redesign beyond the company-detail surface.

# 16. TEST RESULTS

- Full suite: **160/160 tests, 45 suites, 0 failures** (148 prior + 12 new)
- `tsc --noEmit`: clean · `prisma validate`: clean · `prisma migrate deploy`: applied to dev.db
- Both modified web-app scripts pass `node --check` extraction validation
- New coverage: detail view auth (ops ✓, employee 403), edit auth matrix (PA/OpsMgr ✓, OPERATIONS/employee 403), taxonomy validation, stale sub-industry clearing, no-op no-audit, employee revoke guards (cross-company 404, last-admin 409, repeat 409, revoked JWT dead immediately), company audit feed scoping (own-company only, member-readable, ops 403)

# 17. SECURITY / TENANT ISOLATION

- All new company data access is employee-JWT-gated and `companyId`-scoped; ops routes behind `requireOps`/`requireOpsManager`/`requirePlatformAdmin` as appropriate.
- No response returns `passwordHash` (explicit selects verified).
- Cross-company leak tested: company B cannot see company A's audit events; ops employee-revoke on mismatched company/employee pair → 404.

# 18. MOBILE

**ZERO mobile changes.** `git status` confirms no mobile/Flutter/iOS/Android paths touched; no mobile commands run.

# 19. BENCHMARK

`governance/REFERENCE_PRODUCT_BENCHMARK.md` SHA-256 `043cb4c2…` — unchanged. No Founder-decision file modified.

# 20. REMAINING FOUNDER DECISIONS

1. **Industry × Sub-industry × Study-Type eligibility matrix** — the §9 decision block. Highest priority: it is the only piece of the 2026-09-25 direction with no implementable authority.
2. Direct PA mutation scope for company-owned Products/Questions/Media/QR (vs. existing request/approval flows).
3. PA employee creation (credential workflow) — if desired beyond view+revoke.

# 21. FINAL STATUS

**C. PARTIALLY RECONCILED — FOUNDER DECISIONS REQUIRED.** Everything implementable under existing authority is implemented and regression-verified; the remaining items are genuine decision gaps, not engineering gaps.
