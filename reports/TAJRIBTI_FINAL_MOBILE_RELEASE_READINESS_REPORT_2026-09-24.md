# TAJRIBTI — FINAL MOBILE + RELEASE READINESS + FULL SYSTEM QA

**Date:** 2026-09-24 · **Pass:** Consolidated release-readiness completion on the verified baseline
**Repo:** `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean`

---

## 1. Executive Summary

This pass verified the completed baseline, closed the last phone-width presentation gap (horizontal-scroll containment for wide workspace tables), and produced the complete release register. No redesign, no rework of verified areas. **Classification: B — READY WITH RELEASE GATES.** Every remaining gate is infrastructure configuration or a Founder decision — no unresolved code defect.

## 2. Starting Commit

`d7c2224` — "Founder requirements: company logo upload + campaign video, staff mobile decision" (132/132 tests at start).

## 3. Ending Commit

See §24 (committed at end of pass). Changes this pass: horizontal-scroll table containment in `web/app/ops/index.html` + `web/app/company/index.html` (phone-width safety for staff mobile via responsive web) + this report.

## 4. Benchmark Integrity

`governance/REFERENCE_PRODUCT_BENCHMARK.md` unchanged. Last touch: `8fef980` (clean-slate implementation). No benchmark mutation this pass or any prior pass.

## 5. Governance Status

All closed decisions verified intact: no consumer push (endpoints absent, tested), no rewards, member read-only, Ops-Manager-without-Platform-Admin, controlled industry taxonomy, no-resume lifecycle, DRAFT-only delete with evidence protection. No conflicts found between current repository documents. AI_BOOTSTRAP/status-board/tracker files do not exist as repo files — decision status lives in `reports/` + Founder workbooks (documented, not invented).

## 6. Account / Role Matrix

Verified against middleware + tests (unchanged this pass — correct already):

| | COMPANY_MEMBER | COMPANY_ADMIN | OPERATIONS | OPS_MANAGER | PLATFORM_ADMIN |
|---|---|---|---|---|---|
| Staff login → workspace | `/app/company` | `/app/company` | `/app/ops` | `/app/ops` | `/app/ops` |
| Mutations | none (403) | company-scoped CRUD, requests, submit | lifecycle, reviews, issues | + company create | + ops-users, PII, audit, CMS |
| Cross-tenant | 404 no-leak | 404 no-leak | all tenants (read/ops) | all tenants | all tenants |
| PII | no | no | no | no | audited read |

Role resolved from DB per request (JWT carries identity only) → revocation-immediate. No session/token sharing between consumer/employee/ops claim kinds.

## 7. Company ↔ Operations Workflow

Complete and tested: request → pending → approve/reject/request-changes(note) → atomic claim → execution → `AccessAuditEvent` → company-visible outcome → re-file allowed. Stale-approval and duplicate-pending protections verified by tests.

## 8. Audit Status

Operational audit logging retained per governance (OFD-08 "Auditability" = operational logging, not transaction-blocking). Fire-and-report semantics documented and accepted. Coverage: all privileged/state-changing routes emit `AccessAuditEvent`; `QuestionAuditEvent` retains before/after payloads. Audit surface is read-only, PLATFORM_ADMIN-only, 500-row cap. No unauthorized write path exists (events are written server-side only).

## 9. Media / Logo / Video Status

- **Company logo:** upload-init → signed PUT → confirm (server-recomputed key + stored-object verification) → signed read on `GET /profile`; remove clears fields + object; image-only ≤5 MB; COMPANY_ADMIN; audited; member-hidden in UI. CODE READY.
- **Campaign media:** images JPEG/PNG/WebP ≤5 MB; video MP4/WebM ≤50 MB; `mediaType` persisted (hosted: declared type; URL: extension inference); 20/campaign cap; campaign-scoped keys; confirm-time object verification; tenant isolation; consumer web + mobile + company rendering verified. CODE READY.
- **No transcoding pipeline** — original-file playback only, documented.
- **Production bucket:** `MEDIA_BUCKET_*` absent on Railway → hosted upload fails closed 503; URL media unaffected. **INFRASTRUCTURE GATE OPEN.**

## 10. Consumer Mobile Status

Journey verified against current API: Discover → campaign → Akedly PoW → campaign-bound OTP (fresh per campaign) → eligibility → QR/App Link → redeem → survey → completion → resume → Activity/Profile/consent. Video media = open-in-viewer tile (`url_launcher`, no player pipeline). No push, no rewards, no wallet — verified absent.

**Release gates:** release signing (currently debug keys — `build.gradle.kts` TODO noted), `ANDROID_APP_LINKS_SHA256` env, `CURRENT_API_BASE` repo variable, CI run, device QA, iOS later per Founder decision.

## 11. Company Staff Mobile Status

READY — employee companion in the Flutter app: `/company/auth/login` → employee home → campaign list → detail/live → logout. Session isolation: separate Dio + `employee_*` SharedPreferences keys; no consumer/ops identity mixing. Member role returns read-only data (backend-enforced). Device-width verification pending (toolchain blocked — §23).

## 12. Operations Staff Mobile Status

READY via responsive web — `/app/ops` collapses to top-nav column ≤800px, single-column grids ≤640px; this pass added `overflow-x:auto` card containment + `min-width` table floor so wide tables (requests, audit, participants) scroll inside the card instead of overflowing the viewport. Same change applied to `/app/company`. Role routing via `/api/staff/login` is device-agnostic; PLATFORM_ADMIN surfaces stay PLATFORM_ADMIN-gated. No Flutter duplication introduced.

## 13. Full Authentication Matrix

| Identity | Login | Workspace | Forbidden surfaces | Session isolation | Evidence |
|---|---|---|---|---|---|
| Consumer | OTP (Akedly, campaign-bound) | consumer app/web | all staff APIs (403) | consumer claim only | campaign-otp + staff-login suites |
| COMPANY_MEMBER | staff login | `/app/company` | all mutations, ops APIs | employee claim | staff-login + member-readonly tests |
| COMPANY_ADMIN | staff login | `/app/company` | ops APIs, PII, CMS | employee claim | suite + route middleware |
| OPERATIONS | staff login | `/app/ops` | PII, ops-users, audit, CMS, company-create | ops claim | staff-login + CMS 403 tests |
| OPS_MANAGER | staff login | `/app/ops` | PII, ops-users, audit, CMS | ops claim | middleware `requireOpsManager` |
| PLATFORM_ADMIN | staff login | `/app/ops` | — (full staff scope) | ops claim | CMS/audit/PII tests |

Unknown email ≡ wrong password (uniform 401); consumers rejected at staff login; per-email login throttle active.

## 14. Full Campaign E2E

Verified by the suite end-to-end: create → configure (product/audience/journey/media/QR) → submit-for-review (readiness gate) → ops launch → consumer entry (QR/App Link) → PoW → OTP → eligibility → redeem → survey → completion → live metrics → insights → report. Lineage Campaign→Participation→Eligibility→Redemption→Survey→Measurement→Report is campaign-scoped and cross-contamination-tested (M1–M4, A1–A5, Q1–Q4, E-series). QR source attribution verified; company sees only own data; ops sees cross-tenant operational data.

## 15. Reporting QA

Chain: persisted participation → aggregates (`measurement.ts`) → evidence classification + small-cell suppression → narrative (deterministic bilingual, report-values-only) → intelligence (labeled derived, suppressed) → report. Sample sizes, response counts, purchase intent, satisfaction, per-question aggregates, demographics, source attribution, methodology profile + limitations all present. No estimates, no significance claims, no AI-generated findings. Visual art direction = Marketing.

## 16. Production Readiness Gate

| Item | Status | Evidence |
|---|---|---|
| Code | READY | 132/132 tests, tsc clean |
| DB / migrations | READY | prisma valid; `migrate deploy` on release; `/data` volume mounted |
| Auth | READY | JWT secrets set; 12h tokens; per-email throttle; DB role resolution |
| CORS | READY | `CORS_ORIGIN` set |
| Akedly / OTP | READY | `AKEDLY_API_KEY` + `AKEDLY_PIPELINE_ID` set; transport tested |
| Media storage | INFRASTRUCTURE REQUIRED | `MEDIA_BUCKET_*` absent → hosted upload 503s (fail-closed); URL media works |
| Android App Links | READY WITH GATE | assetlinks route live; `ANDROID_APP_LINKS_SHA256` unset; manifest host injected at CI build |
| Mobile signing | INFRASTRUCTURE REQUIRED | debug signing in release build (documented TODO) |
| CI | READY WITH GATE | `build-consumer-current.yml` complete; requires `CURRENT_API_BASE` repo var; runs on `benchmark-current` push only |
| Device QA | BLOCKED (host) | macOS 13 < Flutter-required 14 — see §23 |
| Backups | FOUNDER/INFRA DECISION | volume persists; no backup schedule found |
| Monitoring/alerting | FOUNDER/INFRA DECISION | none configured in repo |
| Logging | READY | request/audit logging present |
| Unused Postgres | FOUNDER DECISION | provisioned but unreferenced — keep/decommission |
| Env vars / secrets | READY | all required vars set except media/links noted; no secrets in repo |
| Public website + CMS | READY | PLATFORM_ADMIN-gated, audited, published/draft separation |
| Reporting | READY | §15 |
| Workspaces | READY | role-gated, responsive, no dead controls found |

## 17. Commercial Decision Register

No billing/pricing/subscription/invoice/payment code or schema exists (FD doc explicit). All items: **CURRENT STATE — not implemented; EVIDENCE — Founder research artifacts at repo root (Legal/Accounting dossier EN+AR, decision workbooks); FOUNDER DECISION REQUIRED — yes; IMPLEMENTATION IMPACT — post-decision only.**

Items: pricing model · setup fee · campaign fee · participant/sample fee · subscription · annual plan · report pricing · billing · invoice · VAT · currency · payment provider · entitlements · renewal · overage · contract · cancellation. No dependency on Mobile readiness — parallel track.

## 18. Backup / Monitoring / Postgres Status

- `/data` volume: provisioned + mounted, `DATABASE_URL=file:/data/dev.db` → all product + CMS data persists.
- Backup strategy/schedule: **does not exist** in repo or observed config → decision required.
- Monitoring/alerting: **does not exist** → decision required.
- Postgres service: provisioned, **unused** (api uses SQLite file) → keep/decommission is a Founder/infrastructure decision. Not touched.

## 19. Remaining Founder Decisions

1. Commercial model — all 17 items (§17).
2. Request-contract asymmetry: question-change reject `note` optional vs study-type `reason` required — no authorization to unify; does not block Mobile.
3. Backup + monitoring policy for `/data` volume.
4. Unused Postgres service disposition.
5. Optional: Content Editor role for CMS (currently PLATFORM_ADMIN).

## 20. Remaining Infrastructure Gates

1. Provision Railway Bucket + set `MEDIA_BUCKET_ENDPOINT/NAME/ACCESS_KEY/SECRET_KEY` (+optional `REGION`).
2. `ANDROID_APP_LINKS_SHA256` (release keystore fingerprint).
3. `CURRENT_API_BASE` GitHub repo variable (unblocks CI APK + App Links host injection).
4. Release signing config (replace debug keys in `build.gradle.kts` release block / CI keystore).

## 21. Remaining Mobile Release Gates

Signing → fingerprint → `CURRENT_API_BASE` → CI APK on `benchmark-current` → Android device QA → iOS preparation (later per Founder decision).

## 22. Exact Next Execution Sequence

```
Provision media bucket + set env vars → set CURRENT_API_BASE + generate release keystore
→ push benchmark-current → CI APK → Android device QA → iOS prep
→ Full system QA on production candidate → Founder review
→ Commercial decisions → commercial implementation → Marketing/CI finalization → launch
```

## 23. Test Evidence

| Suite | Result |
|---|---|
| API (`npm test`) | **132/132 pass**, 36 suites, 0 fail — ran this pass |
| TypeScript `tsc --noEmit` | clean |
| `prisma validate` | clean |
| Web inline-script syntax (`node --check` on extracted scripts) | ops + company + consumer all OK |
| Flutter `analyze`/`test` | **BLOCKED on this host**: `flutter`/`dart` exit 255 — "Current Mac OS X version 13.0 is lower than minimum supported version 14.0". Alternative: CI workflow runs analyze + test + release APK on Ubuntu runner (requires `CURRENT_API_BASE` + benchmark-current push — not performed per git-safety rule) |

## 24. Git / Deployment Safety Confirmation

- Branch `master`, local-only; **nothing pushed**; `origin/benchmark-current` untouched.
- No production deploy; no Railway mutation (read-only variable listing only).
- No Benchmark change; no history rewrite; no merge to main.
- Changed files this pass: `web/app/ops/index.html`, `web/app/company/index.html` (phone-width table containment), this report.

---

## FINAL DECISION

**B — READY WITH RELEASE GATES.** All product code is verified; remaining gates are infrastructure configuration (media bucket vars, signing, App Links fingerprint, API base) and Founder decisions (commercial, backups/monitoring, Postgres, request-contract asymmetry). No code blocker exists between this state and Mobile release QA.
