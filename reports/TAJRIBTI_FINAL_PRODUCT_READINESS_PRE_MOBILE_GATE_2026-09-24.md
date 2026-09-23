# TAJRIBTI — FINAL PRODUCT READINESS + PRE-MOBILE GATE

**Date:** 2026-09-24
**Pass type:** Audit → Classify → Minimum Fix → Test → Verify
**Repository:** `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean`

---

## 1. Executive Status

The product core (Web/API) is **READY WITH GATE** for the Mobile phase. The audit found and fixed one genuine defect class — **incomplete audit coverage on lifecycle and company-side mutations** — and confirmed one real production infrastructure gap (**hosted media bucket not provisioned in production**). No redesign, no invented scope.

Fixes applied this pass (minimum required only):

- Added `AccessAuditEvent` writes to all previously-unaudited state-changing operations: ops launch/pause/close, issue create/resolve, company profile update, employee create/role-change, product create/update, campaign create/update, submit-for-review, request filings, QR-source create, campaign-media add/delete.
- `api/src/routes/company.ts`: added `auditEmployeeAction()` helper mirroring `auditOpsAction()` in `ops.ts`.

## 2. Git State

| Item | Value |
|---|---|
| Branch | `master` (local-only; not pushed) |
| HEAD before pass | `3733e2e` — docs: final web foundation + CMS production safety + marketing handoff report |
| Implementation commits under HEAD | `59d6e22` (image fix), `c7fac5f` (workspace/CMS/login) |
| Remote | `origin → github.com/islamelbaz2010/Tajribti.git`; `origin/benchmark-current` exists remotely — **not pushed to** |
| Working tree at pass start | Clean (untracked Founder artifact PDFs/XLSX at root — left untouched) |

## 3. Benchmark State

- `governance/REFERENCE_PRODUCT_BENCHMARK.md` unchanged this pass.
- Last commit touching the Benchmark file in this repo: `8fef980` ("clean-slate implementation").
- The `648d2031…` SHA cited in earlier reports is **not resolvable in this repo's object store** — it belongs to the upstream benchmark lineage, not this clone. Recorded for honesty; no action.
- Governance directory contains exactly two documents: Benchmark + Founder Decision Strategic Differentiation. The AI_BOOTSTRAP file and DECISION_STATUS_BOARD / OPEN_DECISIONS_TRACKER named in the brief **do not exist as repository files** — their content lives in `reports/` (e.g. `TAJRIBTI_FOUNDER_DECISION_EXECUTION_STATUS_2026-09-20.md`) and the Founder workbooks at repo root. Reported, not invented.

## 4. Role Capability Matrix (backend-derived, executable truth)

JWT carries identity only (`consumerId` / `employeeId+companyId` / `opsUserId`). Role is read from the DB row on every privileged request → role changes take effect immediately, revocation-safe.

| Capability | COMPANY_MEMBER | COMPANY_ADMIN | OPERATIONS | OPERATIONS_MANAGER | PLATFORM_ADMIN |
|---|---|---|---|---|---|
| Login (staff `/api/staff/login`) | ✅ → `/app/company` | ✅ → `/app/company` | ✅ → `/app/ops` | ✅ → `/app/ops` | ✅ → `/app/ops` |
| Read workspace data | ✅ all GETs | ✅ | ✅ | ✅ | ✅ |
| Profile update | ❌ | ✅ name only | — | — | — |
| Employees create / role change | ❌ | ✅ (self-demotion guarded) | — | — | — |
| Products create / update | ❌ | ✅ | — | — | — |
| Campaign create / edit | ❌ | ✅ DRAFT+READY | ❌ | ❌ | ❌ |
| Campaign delete | ❌ | ✅ DRAFT-only, evidence-protected | ❌ | ❌ | ❌ |
| Submit for review (DRAFT→READY) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Launch / Pause / Close | ❌ | ❌ | ✅ | ✅ | ✅ |
| File study-type request | ❌ | ✅ | — | — | — |
| File question-change request | ❌ | ✅ (locked campaigns only) | — | — | — |
| Approve / Reject / Request-changes | ❌ | ❌ | ✅ | ✅ | ✅ |
| Execute approved question change | ❌ | ❌ | ✅ | ✅ | ✅ |
| Company create | ❌ | ❌ | ❌ | ✅ | ✅ |
| Ops-user create / list | ❌ | ❌ | ❌ | ❌ | ✅ |
| Participant PII | ❌ | ❌ | ❌ | ❌ | ✅ (audited) |
| Audit-event surface | ❌ | ❌ | ❌ | ❌ | ✅ |
| CMS (site content/media) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Consumer PII / impersonation | never | never | never | never | audited read-only |

Verified: MEMBER 403 on all mutations; OPERATIONS lacks company-create/PII/ops-user/CMS; OPS_MANAGER gains company-create only; PLATFORM_ADMIN is the only PII/audit/CMS holder.

## 5. Company ↔ Operations Workflow Matrix

| Flow | Company files | Ops reviews | Execution | Verified |
|---|---|---|---|---|
| Study-type change | `POST /campaigns/:id/study-type-requests` (ADMIN, configurable campaign, dup-pending 409, same-type 400) | approve / reject(reason req.) / request-changes(note req.) | approval sets `campaign.studyType`, preserves questions | ✅ tests |
| Question change (EDIT/DELETE) | `POST /campaigns/:id/question-change-requests` (ADMIN, locked campaigns only — DRAFT/READY told to edit directly, dup-pending 409, payload required for EDIT) | apply / reject / request-changes(note req.) | apply performs whitelisted mutation; DELETE blocked when historical answers exist | ✅ tests |
| Submit for review | `POST .../submit-for-review` (DRAFT only, readiness gate) | — (lifecycle, not request) | DRAFT→READY | ✅ |
| Launch/pause/close | — | ops-only actions | READY→ACTIVE→PAUSED→COMPLETED | ✅ |
| Notification launch | **removed** — Founder decision: no consumer push; dormant model only | — | — | ✅ test |

## 6. Request Lifecycle Matrix

Both request types implement the full contract:

| Property | StudyTypeChangeRequest | QuestionChangeRequest |
|---|---|---|
| Create authz | COMPANY_ADMIN + owned + configurable | COMPANY_ADMIN + owned + lifecycle-locked |
| Duplicate-pending prevention | 409 | 409 |
| Status transitions | PENDING → APPROVED / REJECTED / CHANGES_REQUESTED | PENDING → APPLYING → PERFORMED / REJECTED / CHANGES_REQUESTED |
| Approve authz | ops (any ops role) | ops (any ops role) |
| Reject requires reason | ✅ `z.string().min(1)` | note field (optional) — see note |
| Request-changes requires note | ✅ | ✅ |
| Stale-approval guard | campaign must be DRAFT/READY | question existence re-verified; auto-reject if gone |
| Concurrency | conditional `updateMany` claim; 409 on second actor | atomic PENDING→APPLYING claim; 409 |
| Re-submission after changes | new request allowed (old no longer PENDING) | same |
| Company visibility | status + rejectionReason + reviewNote + reviewer name | status + reviewNote + performedBy |
| Audit | request filing + decision events | filing + decision + QuestionAuditEvent (before/after) |

**Note (classified, not fixed):** `question-change-requests/:id/reject` accepts an optional `note` where study-type reject requires a reason. Minor asymmetry — documented; tightening it would change an existing tested contract, deferred to Founder/Product decision.

## 7. Audit Trail Verification

`AccessAuditEvent` fields: actorKind, actorId, actorName, action, targetType, targetId, createdAt → covers WHO/WHAT/WHEN/ENTITY. BEFORE/AFTER payloads exist only in `QuestionAuditEvent` (prevValue/newValue) — question changes are the only entity where the Benchmark-grade history contract demanded field-level diffs. Request entities carry reason/note on the request row itself.

| Area | Before pass | After pass |
|---|---|---|
| Company create (ops) | ✅ COMPANY_CREATE | ✅ |
| Ops-user create | ✅ OPS_USER_CREATE | ✅ |
| PII view | ✅ PARTICIPANTS_PII_VIEW | ✅ |
| Panel-insights view | ✅ PANEL_INSIGHTS_VIEW | ✅ |
| Campaign delete | ✅ CAMPAIGN_DELETE | ✅ |
| Question mutations | ✅ QuestionAuditEvent | ✅ |
| Request decisions | ✅ approve/reject/changes | ✅ |
| CMS publish/draft/media | ✅ (siteAdmin audited) | ✅ |
| **Ops launch / pause / close** | ❌ | ✅ CAMPAIGN_LAUNCH/PAUSE/CLOSE |
| **Issue create / resolve** | ❌ | ✅ ISSUE_CREATE/RESOLVE |
| **Company profile / employees / products / campaign create+update / submit / request filing / QR source / media add+delete** | ❌ | ✅ all audited |

**Documented limitation (fire-and-report):** `writeAccessAudit` logs audit-write failures but lets the business action complete — an action can succeed without its audit row under DB failure. Audit events are append-only rows (no update surface exists → cannot be silently changed; no route lets unauthorized users write them). Classified READY WITH GATE: acceptable now; if governance requires audit-blocking semantics, that's a Founder/architecture decision.

## 8. Campaign Lifecycle Verification

```
DRAFT ──(COMPANY_ADMIN, readiness gate)──► READY ──(OPS)──► ACTIVE ──(OPS)──► PAUSED ──(OPS)──► COMPLETED
                                                              └────────────(OPS, close)──────────┘
```

- No resume transition — Benchmark names only Launch/Pause/Close; PAUSED can only close (deliberate, documented in code).
- Delete: DRAFT-only, ADMIN-only, refuses when participation evidence exists; READY refused (no withdraw transition in governance — not invented).
- Submit-for-review blocked unless readiness passes; launch re-checks readiness server-side.
- Study-type requests cannot be approved once campaign leaves DRAFT/READY (stale-approval protection).
- Cross-company access returns 404 throughout (no existence leak) — verified by tenant-isolation tests.

## 9. Company Workspace Audit

Overview / Campaigns / Products / Reports / Company Profile / Employees / New Campaign — all verified in prior pass and re-verified this pass at route level:

- MEMBER read-only enforced at backend (not just hidden UI) ✅
- Sidebar IA, role pill, display name in header, sign-out → `/login` ✅
- Tenant isolation: every handler scoped via `loadOwnedCampaign`/companyId ✅
- Request filing surfaces show status + reviewNote to company ✅
- No dead buttons found in current markup ✅

## 10. Operations Workspace Audit

Pipeline / Companies / Study-Type Requests / Question Requests / Issues / Live / Survey / Insights / Report / Administration / Public Website:

- Administration + Public Website render only for PLATFORM_ADMIN and are 403 at API level for all other roles ✅
- OPERATIONS_MANAGER sees operational tools but no Platform Admin controls ✅
- Request queues expose requester, reviewer, note, and linked campaign/question state ✅

## 11. Platform Admin Audit

- Routes: `GET/POST /ops-users`, `GET /audit-events`, `GET /campaigns/:id/participants` (PII), CMS under `/api/ops/site/*` — all `requirePlatformAdmin` ✅
- OPS_MANAGER explicitly excluded from each ✅ (403 tests)
- Audit surface is read-only list (500-row cap) — no mutation endpoint ✅

## 12. Media / Upload Audit

| Property | Status |
|---|---|
| Two paths | URL-referenced + hosted upload (S3-compatible, private bucket, signed PUT 300s / GET 3600s) |
| Validation | JPEG/PNG/WebP only, ≤5 MB, ≤20 per campaign |
| Confirm step | verifies stored object content-type + size before READY |
| Tenant isolation | media scoped `campaigns/{campaignId}/...`; all routes owned-campaign + ADMIN |
| Delete | row + object delete; orphan sweep supported |
| Fail-closed | 503 when `MEDIA_BUCKET_*` unset — **URL media unaffected** |
| Preview in UI | signed read URLs resolve for HOSTED rows ✅ |

**Gaps (classified):** no replace/activate-deactivate on campaign media (delete+re-add covers it; UI presents list/add/delete — not a Benchmark requirement); **hosted upload is code-complete but production bucket env vars are absent** → see §15.

## 13. Company Logo / Media Status

**FOUNDER DECISION REQUIRED.** The `Company` model has no logo field; the Benchmark names "Company Profile" but does not specify a logo asset. Per the implementation rule, adding company-logo upload is not authorized by repository + Founder decisions → not implemented. The hosted media architecture (`media.ts`) supports it cleanly when approved (`companies/{id}/...` key prefix would be the minimal extension).

## 14. Reporting Audit

Chain verified by tests: participation → eligibility → redemption → survey → `measurement.ts` aggregates → `classifySample` evidence thresholds + small-cell suppression → `report.ts` + deterministic bilingual `narrative.ts` + `intelligence.ts` (labeled derived sections, suppressed) → company report / ops report / public sample report.

- Campaign-scoped throughout; cross-campaign answer/source contamination excluded (M1–M4 tests) ✅
- No estimates, no statistical-significance claims, no AI-generated findings ✅
- Panel insights: same-company, opted-in-only, MIN_PANEL_CELL=5 suppression ✅
- Report design remains flagged for Marketing art-direction pass (previous report) — not a code defect.

## 15. Production Readiness (read-only inspection; nothing changed)

| Gate | Status |
|---|---|
| Runtime | Railway `tajribti-pilot` / api service, Node long-running ✅ |
| Persistence | `DATABASE_URL=file:/data/dev.db` on mounted volume `api-volume` ✅ |
| OTP/Akedly | `AKEDLY_API_KEY` + `AKEDLY_PIPELINE_ID` set in production ✅ |
| Auth | `JWT_SECRET`, `JWT_REFRESH_SECRET`, expiries set ✅ |
| CORS/web | `CORS_ORIGIN`, `CONSUMER_WEB_URL` set ✅ |
| Migrations | Prisma migrate deploy on release; schema valid ✅ |
| **Hosted media** | **`MEDIA_BUCKET_*` (endpoint/name/keys) NOT set in production → hosted upload 503s (fail-closed). URL media works. BLOCKER for hosted-media feature only.** |
| **Android App Links** | **`ANDROID_APP_LINKS_SHA256` not set → release signing fingerprint needed before verified links** |
| Unused Postgres | Postgres service exists but nothing references it — Founder observation, not changed |
| Backups/monitoring | Volume persists data; no backup schedule or monitoring config found in repo → open infra decision |

## 16. Consumer Mobile Readiness

`mobile/consumer` (Flutter, SDK ≥3.0): phone → Akedly PoW → campaign-bound OTP → eligibility → QR/scanner entry → redeem → survey → thank-you/resume → Activity/Profile/Settings. `lib/core/akedly_pow.dart`, `api_client.dart`, `session.dart` present; App Links manifest uses `__APP_LINKS_HOST__` injected at build; 3 test files. **READY WITH GATE** — remaining gates: release signing + App Links fingerprint, `CURRENT_API_BASE` injection, device QA, CI green (`build-consumer-current.yml` exists).

## 17. Staff Mobile Readiness

Employee companion already exists inside the consumer app: `employee_login/home/campaign_detail` + `employee_api_client`/`employee_session` (separate Dio + separate SharedPreferences keys; hits `/api/company/auth/login`, profile, campaigns, live). Read-only by design. **No Operations/Platform-Admin mobile screens exist.**

## 18. Mobile Architecture Recommendation (evidence-based)

- Keep **consumer + company-employee companion** in the existing single Flutter app — already built, session-isolated.
- **Operations / Operations Manager / Platform Admin → responsive web workspaces** (web/app/ops already carries ~48 responsive rules; desktop-first). A dedicated staff app duplicates ops surface for near-zero gain at current scale. If staff mobile parity is later required, add ops screens into the same app rather than a third app.
- Login behavior already satisfies the required contract (role detection → correct workspace) via `/api/staff/login` on web; employee mobile uses `/company/auth/login` with role read from DB — extend role-based routing in-app if staff roles enter the app.

Classified **FOUNDER DECISION REQUIRED** (architecture confirmation), with the above as the recommendation.

## 19. Commercial Model Status

- Repository: **no pricing/billing/subscription/invoice/payment code or schema** — explicitly confirmed by `FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md` ("Not billing, pricing, subscriptions, or a commercial service catalog — none of that exists in the implementation").
- Evidence artifacts present at repo root (untracked Founder documents): `TAJRIBTI_Legal_Accounting_Readiness_Dossier_Egypt_2026-09-23` (EN+AR PDFs), Founder Decision Review Workbooks (EN/AR), Technical Release Review Register.
- **Every commercial item is FOUNDER DECISION REQUIRED:** pricing model, setup/campaign/participant fees, subscription/annual plan, invoicing, VAT, currency, payment provider, entitlements, renewal/overage/contract/cancellation. Nothing invented here.

## 20. Marketing Parallel Status

Independent; not blocking. CMS is live for structured content/media updates; asset gap list delivered in the previous handoff report; report art-direction owned by Marketing.

## 21. Open Founder Decisions

1. Company logo upload (not specified in Benchmark; architecture ready).
2. Staff-mobile architecture confirmation (recommendation in §18).
3. Hosted media bucket provisioning in production (infrastructure decision — Railway Bucket or existing S3-compatible provider; env vars only, no code change).
4. Commercial model — all items (§19).
5. Optional: Content Editor role (currently PLATFORM_ADMIN-only CMS, per governance).
6. Optional: durable preview DB for CMS on Vercel preview.
7. Question-change reject — whether `note` should be mandatory like study-type `reason`.
8. Backup schedule / monitoring for the `/data` volume.
9. Unused Postgres service — keep or decommission.

## 22. Remaining Implementation Gaps

- Production `MEDIA_BUCKET_*` provisioning (infra, not code).
- `ANDROID_APP_LINKS_SHA256` release fingerprint (release-time).
- Company logo (awaiting decision).
- Ops/admin mobile surface (awaiting §18 decision).
- Audit fire-and-report semantics (acceptable now; upgrade only if governance requires).

## 23. Final Ordered Roadmap

```
WEB/API FINAL ─► ACCOUNT GOVERNANCE ─► MEDIA ─► REPORTING ─► MOBILE ARCHITECTURE
   ─► CONSUMER MOBILE ─► STAFF MOBILE ─► ANDROID QA ─► iOS QA
   ─► PRODUCTION READINESS ─► COMMERCIAL READINESS ─► PUBLIC LAUNCH
```

Web/API final, account governance, media (code) and reporting are complete as of this pass. Next executable step: **Mobile architecture decision confirmation**, then Consumer Mobile release hardening.

## 24. PRE-MOBILE GO / NO-GO

| Area | Classification |
|---|---|
| Account / Role governance | **READY** |
| Request → approval → execution → audit | **READY** (as of this pass's audit-completion fix) |
| Audit trail | **READY WITH GATE** (fire-and-report semantics documented) |
| Campaign lifecycle | **READY** |
| Company Workspace | **READY** |
| Operations Workspace | **READY** |
| Platform Admin | **READY** |
| Media / uploads (code) | **READY WITH GATE** (production bucket env pending) |
| Company logo | **FOUNDER DECISION REQUIRED** |
| Reporting | **READY** (art-direction = Marketing) |
| Consumer Mobile | **READY WITH GATE** (signing, App Links fingerprint, device QA) |
| Staff Mobile | **FOUNDER DECISION REQUIRED** (architecture confirmation; employee companion exists) |
| Production readiness | **READY WITH GATE** (media bucket + backups/monitoring open) |
| Commercial model | **FOUNDER DECISION REQUIRED** (nothing implemented; all terms open) |

**PRE-MOBILE GATE: GO — conditional on Founder confirmation of the mobile architecture decision (§18).** Consumer mobile hardening can begin immediately; staff mobile awaits the architecture ruling. Marketing proceeds in parallel.

---

*Verification: 124/124 API tests pass (34 suites) after the audit-completion changes; `tsc --noEmit` clean; `prisma validate` clean. No Benchmark, Mobile, Railway, or production changes. Nothing pushed.*
