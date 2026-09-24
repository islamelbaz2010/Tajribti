# TAJRIBTI — FINAL PRE-MOBILE COMPLETION + STAFF MOBILE READINESS

**Date:** 2026-09-24 · **Pass:** Consolidated completion on top of the verified PRE-MOBILE GATE
**Repo:** `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean`

---

## 1. Git State

| Item | Value |
|---|---|
| Branch | `master` (local-only, not pushed) |
| Start HEAD | `5104c7a` — pre-mobile gate audit-completion |
| This pass | schema migration `20260923235359_company_logo_media_type`, `media.ts`, `company.ts`, company/consumer web UI, `models.dart`, `campaign_screen.dart`, `hosted-media.test.ts` |
| Benchmark | unchanged |

## 2. Benchmark State

`governance/REFERENCE_PRODUCT_BENCHMARK.md` untouched. All changes this pass are Founder-explicit requirements (logo, video, staff mobile) layered over the unchanged Benchmark.

## 3. Final Role Matrix

Unchanged from the gate report — re-verified by the full suite (132 tests): MEMBER read-only (backend-enforced), OPS ≠ OPS_MANAGER ≠ PLATFORM_ADMIN, role resolved from DB per request, tenant isolation via 404-without-leak. Company users cannot reach lifecycle actions; ops roles cannot reach Platform Admin surfaces.

## 4. Company ↔ Operations Workflow

Verified end-to-end by the suite: request → ops review (approve/reject/request-changes with note) → execution → audit → company-visible outcome → resubmission. No gaps.

## 5. Audit Classification

Governance language (Innovation Spec §OFD-08: "Auditability: AccessAuditEvent … GET /ops/audit-events") specifies **operational audit logging** — option A. No authoritative document requires transaction-blocking immutable audit. **Retained fire-and-report semantics** (failures logged, action completes) and documented as accepted. Upgrade to blocking/immutable audit is a Founder/architecture decision if ever required — not implemented now.

Coverage after this pass + the previous fix: every privileged/state-changing route on both sides of the company↔ops boundary writes an `AccessAuditEvent`; question mutations additionally carry before/after in `QuestionAuditEvent`.

## 6. Company Logo — IMPLEMENTED

Founder requirement; built on the existing hosted-media architecture (no second system):

- **Schema:** `Company.logoStorageKey / logoContentType / logoSizeBytes` (migration `…_company_logo_media_type`).
- **Routes** (`/api/company/profile/logo/*`, all `requireCompanyAdmin`):
  - `upload-init` → validates image-only (JPEG/PNG/WebP), ≤5 MB, 503 fail-closed when bucket unconfigured, issues signed PUT to deterministic company-scoped key `companies/{id}/logo.{ext}`.
  - `confirm` → server recomputes the key (client cannot confirm arbitrary objects), `verifyStoredObject` checks type+size, swaps fields, best-effort deletes the replaced object, writes `COMPANY_LOGO_SET`.
  - `DELETE` → removes object + fields, `COMPANY_LOGO_REMOVE`. (Remove covers deactivate; no separate inactive state on a single-slot logo.)
- **Read:** `GET /profile` returns `logoUrl` (fresh signed URL) + `hostedMediaConfigured`.
- **UI:** profile page shows current logo, upload + remove (hidden for MEMBER, disabled with honest note when bucket unconfigured).
- Tenant isolation: key prefix is company-scoped; MEMBER 403 verified by test.

## 7. Campaign Image + Video — IMPLEMENTED

- `MEDIA_LIMITS` extended: images JPEG/PNG/WebP ≤5 MB; **video MP4/WebM ≤50 MB** (deliberately limited; no transcoding — original-file playback only).
- `mediaTypeOf()`/`mediaSizeLimit()` in `media.ts`; `mediaExtension()` returns `mp4`/`webm`.
- `CampaignMedia.mediaType` (IMAGE|VIDEO): hosted rows set from declared contentType; URL rows inferred from `.mp4/.webm` extension.
- Upload-init enforces per-type size caps; count cap (20) unchanged; confirm verifies object exactly as before.
- **UI:** company console accepts video files, per-type validation, media table shows Format + inline `<video>`/`<img>` preview; consumer web renders `<video controls playsinline>`.
- **Mobile:** `CampaignMedia.mediaType` parsed; video rows render a play-icon tile that opens the original file via `url_launcher` (already a dependency — no player pipeline introduced).

## 8. Production Media Requirements

Repo-defined provider: **Railway Bucket (S3-compatible)** — `media.ts` header comment; no new vendor. Required production vars (absent today, fail-closed 503):

```
MEDIA_BUCKET_ENDPOINT, MEDIA_BUCKET_NAME, MEDIA_BUCKET_ACCESS_KEY, MEDIA_BUCKET_SECRET_KEY, MEDIA_BUCKET_REGION (optional, default auto)
```

Action = provision a private bucket on the existing Railway project and set 4 vars. Not done (no production mutation). Also still needed for release: `ANDROID_APP_LINKS_SHA256`.

## 9–11. UX Final QA (Company / Operations / Platform Admin)

- No presentation defects requiring change found beyond this pass's media-table upgrade (Format column, inline previews).
- Ops workspace already collapses to top-nav column ≤800px and single-column grids ≤640px — usable on phone-width browsers.
- No dead buttons, no hidden mutations, member read-only intact, all role gating backend-enforced.

## 12. Consumer Mobile Readiness

Exists and covers Discover → QR/App Links → Akedly PoW → campaign-bound OTP → eligibility → redeem → survey → resume → Activity/Profile/consent. Campaign video now renders as an open-in-viewer tile. Release gates remaining: release signing, `ANDROID_APP_LINKS_SHA256`, `CURRENT_API_BASE` injection, CI, device QA, iOS prep.

## 13. Staff Mobile Architecture — DECISION (Option C: Hybrid)

| Audience | Surface | Why |
|---|---|---|
| Consumer | Flutter app | Exists; QR/OTP native experience required |
| Company Admin + Member | Flutter app — employee companion (exists) | Session-isolated (`employee_*` keys, separate Dio); login→role→home→campaigns→detail/live→logout all present |
| Operations / Ops Manager / Platform Admin | **Responsive web** (`/app/ops`) | Already collapses to mobile layout; full audit/PII/CMS surfaces stay on governed web; zero duplication; role-routing already server-driven via `/api/staff/login` |

No third app. No ops surface rebuilt in Flutter — the evidence (existing responsive ops workspace + DB-driven role routing) supports the hybrid.

## 14. Staff Mobile Implementation Status

- **Company staff:** IMPLEMENTED (pre-existing companion; verified against current API contract — `/company/auth/login`, profile, campaigns, live).
- **Operations/Admin staff:** READY via responsive web — no new code required this pass; role detection → workspace already works on any device width.
- Identity isolation: consumer/employee/ops claims never share a session or token store.

## 15. Commercial Decision Register

No pricing/billing/subscription/invoice code or schema exists (confirmed by FD doc + schema). Register — all items **FOUNDER DECISION REQUIRED**, implementation later:

pricing model · setup fee · campaign fee · participant/sample fee · subscription · annual plan · report pricing · billing · invoice · VAT · currency · payment provider · entitlements · renewal · overage · contract · cancellation.

Evidence artifacts at repo root (untracked Founder docs): Legal/Accounting Readiness Dossier (Egypt, EN+AR), Decision Review Workbooks, Technical Release Review Register.

## 16. Marketing Dependency Status

Independent, unblocked. Architecture now accepts: company logo, campaign images, campaign videos, CMS media — no further rebuild needed for brand asset insertion.

## 17. Remaining Blockers

1. Production `MEDIA_BUCKET_*` provisioning (infra decision; code ready, fail-closed).
2. `ANDROID_APP_LINKS_SHA256` release fingerprint.
3. Flutter toolchain on this host: `flutter`/`dart` fail — **macOS 13.0 < minimum 14.0** — analyze/test not runnable here; CI (`build-consumer-current.yml`) is the verification path.
4. Request-contract asymmetry (question-change reject `note` optional vs study-type `reason` required): **no governance authorization to unify → FOUNDER DECISION REQUIRED, implementation unchanged.**
5. Commercial decisions (§15).
6. Backup/monitoring policy for the `/data` volume; unused Postgres service disposition.

## 18. Exact Next Execution Sequence

```
WEB/API (done) → GOVERNANCE (done) → MEDIA/BRAND ASSETS (code done; bucket pending)
→ MOBILE ARCHITECTURE (decided: hybrid) → CONSUMER MOBILE hardening
→ COMPANY STAFF MOBILE (exists — verify on device) → OPERATIONS STAFF MOBILE (responsive web — device QA)
→ ANDROID QA → iOS QA → FULL SYSTEM QA → PRODUCTION READINESS
→ COMMERCIAL DECISIONS → COMMERCIAL IMPLEMENTATION → MARKETING/CI FINALIZATION → LAUNCH
```

**Next step:** provision the Railway bucket + set `MEDIA_BUCKET_*`, then consumer release hardening (signing + App Links fingerprint + `CURRENT_API_BASE`).

## 19. Final Status

| Area | Status |
|---|---|
| Account Governance | READY |
| Request Workflow | READY (asymmetry → FOUNDER DECISION REQUIRED, unchanged) |
| Audit | READY (operational logging accepted per governance) |
| Company Workspace | READY |
| Operations Workspace | READY |
| Platform Admin | READY |
| Media | READY WITH GATE (production bucket vars) |
| Company Logo | READY (implemented) |
| Campaign Video | READY (implemented) |
| Consumer Mobile | READY WITH GATE (signing/links/QA) |
| Company Staff Mobile | READY (exists — device verify pending) |
| Operations Mobile | READY (responsive web — device QA pending) |
| Platform Admin Mobile | READY (responsive web — device QA pending) |
| Production | READY WITH GATE (media bucket, App Links fingerprint, backups/monitoring) |
| Commercial | FOUNDER DECISION REQUIRED (all items; register above) |
| Marketing | IN PROGRESS (independent — not blocking) |

---

*Verification: 132/132 API tests pass (36 suites; +8 video/logo tests) · `tsc --noEmit` clean · `prisma validate` clean · web inline-script syntax checks pass · Flutter analyze/test blocked by host macOS 13 < 14 (documented, not faked). No production, Railway, Benchmark, or remote changes. Nothing pushed.*
