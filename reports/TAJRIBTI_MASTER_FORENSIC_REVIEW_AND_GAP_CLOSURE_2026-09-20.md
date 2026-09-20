# TAJRIBTI — MASTER FORENSIC REVIEW AND GAP CLOSURE

**Date:** 2026-09-20
**Pass:** consolidated forensic review + confirmed-defect closure + release-candidate preparation
**Companion:** `TAJRIBTI_MASTER_GAP_REGISTER_2026-09-20.md`

## 1. Executive Summary

Reviewed the full Web/API candidate against the Benchmark + Founder decisions. Three confirmed issues were found and fixed (audience clearing, stale-approve UX, QR artifact). No new scope was invented. The review database was isolated without deleting anything. All validation green.

## 2. Repository State

| Item | Value |
|---|---|
| Repo | `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean` |
| Branch | `master` |
| HEAD before this pass | `a2ae416` |
| origin/benchmark-current | `9bc15f0956c85a86be4453424f613da32d39782f` |
| Ahead/behind | 4 / 0 (before this pass's commit) |
| AI_BOOTSTRAP | Not present in repository — documented hierarchy used: Benchmark → Founder decisions → reports → code |
| Working tree | clean except this pass's changes |

## 3. Governance State

- Benchmark `governance/REFERENCE_PRODUCT_BENCHMARK.md` — unchanged, hash verified `648d2031…2534a` before and after.
- Founder decisions D-1…D-9 + OFD-08 honored as approved scope.
- No conflicts encountered between documents.

## 4. Product Surface Review

**Consumer:** OTP dev path, Discover (API-enforced exclusion), eligibility → redeem → survey → Activity — verified end-to-end live on the isolated review DB. No push UI/routes anywhere.

**Company:** campaigns, study-type selection/change-requests, products (tenant-isolated), audience (now correctly clearable), media (URL + hosted-init), questions, QR/sources (now with usable entry links), live results, insights, report + studyProfile + bilingual narrative + print.

**Operations:** global pipeline (D-1), companies, study-type requests (duplicates refused; locked-campaign approves refused + now honestly displayed), question requests, participants (PII admin-gated), issues, report.

**Platform Admin:** distinct Administration tab — ops-user management + access audit log; verified hidden/forbidden for OPERATIONS at UI **and** API level. Not merged into normal Operations.

## 5. Gap Register Summary

20 findings: A=11 · B=1 · C=3 (all fixed) · E=1 · F=2 · G=1 (resolved) · H=1 · D=0 · I=0.

## 6. Confirmed Defects Fixed

### G-05 — Audience/product clearing (CONFIRMED DEFECT)
- **Root cause:** PATCH schema used `.optional()` only; the UI sent `undefined` for emptied inputs; Prisma `update` skips `undefined` keys → stale `audienceAgeMin/Max`, `audienceCity`, `productId` persisted forever.
- **Fix:** fields are now `nullish()` with `""→null` normalization; PATCH product-ownership check only runs on a real id; UI sends explicit `null` for cleared values.
- **Files:** `api/src/routes/company.ts`, `web/app/company/index.html`.
- **Tests:** 3 new (explicit-null clears + persists on reload; omission preserves; cross-company attach still 404).

### G-07 — Misleading Approve on locked campaign (UX DEFECT)
- **Root cause:** backend correctly 409s approval of a PENDING request whose campaign left DRAFT/READY, but the ops UI still rendered an Approve button that could only fail.
- **Fix:** locked-campaign pending rows now show "Campaign is {status} — this request can no longer be approved"; Reject retained to clear stale rows.
- **Files:** `web/app/ops/index.html`.
- **Tests:** new backend test — ACTIVE-campaign request approve → 409, campaign untouched, reject still allowed.

### G-08 — No usable QR artifact (USABILITY GAP)
- **Root cause:** QR/source rows showed label/code/dates but no usable entry; the consumer entry point `/app/consumer/?qr=CODE` existed but was never surfaced.
- **Fix:** Entry link column rendered per source (openable/copyable; encodable into any QR generator).
- **Files:** `web/app/company/index.html`.

## 7. Remaining Gaps

- **Infrastructure pending:** D-5 bucket — staged `tajribti-media` (iad) in production env pending apply + 5 `MEDIA_BUCKET_*` env vars. Code fails closed (503) until then.
- **Governance / future:** ops-user deactivate/edit (not currently required); media orphan-sweep scheduling (`listMediaKeys` ready, cadence undecided); predictive analytics (methodology-first); difficulty-budget Turnstile trigger (dormant).
- **Manual verification:** Founder to eyeball print output, studyProfile blocks, hosted upload once infra applied.
- **Release blockers:** none code-side; release awaits Founder approval + push authorization (D-8).

## 8. D-3 Status (per type — honest)

All 8 study types emit a **distinct** methodology profile in the report (verified live: different objectives, different limitations/not-claimed lists). Shared instrument (Question model + type-specific template questions); **no bespoke statistical instrument exists for any type** — the matrix in the gap register marks Instrument PARTIAL for 7 of 8 where the approved method maps to instruments the question model cannot express (price-ladder, shelf test, exposure tracking). Implemented to the maximum the current model supports; deeper instruments are a Founder decision, not fakeable.

## 9. D-5 Status

**Code: COMPLETE** — schema+migration, upload-init → signed PUT → confirm (type+size verify) → READY → signed reads in company/ops/consumer, guards (ownership, lifecycle, JPEG/PNG/WebP, 5 MB, 20/campaign), fail-closed 503, 14 tests.
**Infrastructure: PENDING** — bucket staged not applied; until env vars are set, Founder sees the upload UI + clean "not provisioned" message. Upload → persist → retrieve → render cannot be verified until then.

## 10. D-6 Status

Conditional shield verified: `challengeRequired` gates PoW; provider `turnstile.required` gates Turnstile; `powSolution`/`turnstileToken` forwarded verbatim; no invented threshold; difficulty-budget trigger dormant. Backend tests T4–T6 green.

## 11. Review Environment

dev.db accumulated ~77 test/audit campaigns from prior passes (local-only, not production). Per rule 8, **nothing was deleted**: an isolated `dev-review.db` was created (migrations + seed + review fixtures): 1 company, 8 DRAFT study-type campaigns, 1 pending study-type request, seed campaign with QR + completed consumer journey, 1 PLATFORM_ADMIN (`admin@tajribti.local`/`AdminReview123!`), 1 OPERATIONS (`ops@tajribti.local`/`OpsReview123!`), 1 COMPANY_ADMIN (`admin@nilefresh.example`/`CompanyPass123!`), consumer via OTP `devOnlyCode`. Server: `DATABASE_URL="file:./dev-review.db" npm run dev` on :4000.

## 12. Release Candidate Status

**READY FOR FOUNDER MANUAL REVIEW**

(Not "release approval": production deploy, bucket apply, and B-04 await explicit Founder authorization.)

## Validation

- `npm test`: **74/74 pass** (23 suites) — +5 new regression tests, baseline preserved
- `tsc -p tsconfig.json` / `npm run build`: exit 0
- `prisma validate`: valid
- Web inline-JS parse (4 surfaces): OK
- Benchmark SHA-256 before = after: `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a`

**No push · no deploy · no B-04 · mobile untouched · no deletions · Benchmark unchanged.**
