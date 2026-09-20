# TAJRIBTI — FOUNDER MANUAL REVIEW PACKAGE

**Date:** 2026-09-20
**Document type:** Release-candidate review package — the main document for Founder manual acceptance.
**Status:** REVIEW CANDIDATE — implemented, tested locally, NOT deployed, NOT pushed.

---

## 1. Release Identity

| Item | Value |
|---|---|
| Release candidate base SHA | `e05b55e1b5ef96b530c73d43f1779ff2173b5fe8` + uncommitted completion-pass changes (committed as the release-candidate commit — see §16) |
| Production baseline SHA | `9bc15f0956c85a86be4453424f613da32d39782f` (deployed) — code baseline `45aa571` per earlier verification |
| Production Web/API URL | `https://api-production-266c.up.railway.app/` |
| Branch | local `master` → intended remote `origin/benchmark-current` |
| Push status | NOT PUSHED — awaiting Founder review |
| Deploy status | NOT DEPLOYED |
| Benchmark | `governance/REFERENCE_PRODUCT_BENCHMARK.md` v1.0 — unchanged, SHA-256 `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` |

---

## 2. Founder Decision Matrix

| Decision | Approved | Implemented | Visible in Web | API enforced | Deferred | Founder Review |
|---|---|---|---|---|---|---|
| D-1 Operations global visibility | YES | YES (pre-existing, unchanged) | YES | YES | NO | Verify pipeline shows all companies |
| D-2 Browser Print / Save-as-PDF | YES | YES (pre-existing, verified) | YES | n/a (client-side) | NO | Print both report surfaces |
| D-3 Eight study methodologies | YES | YES — this pass | YES | YES | NO | Compare two different-study-type reports |
| D-4 Predictive analytics = methodology-first | YES | YES (descriptive only, labeled) | YES | YES | Prediction model deferred | Confirm no predictive language |
| D-5 Hosted media | YES | CODE COMPLETE — infra pending | Partially (upload UI present; fails closed 503 until bucket applied) | YES | Bucket provisioning staged, not applied | See §10 |
| D-6 Akedly conditional Shield | YES | YES (pre-existing, verified) | YES | YES | Difficulty-threshold trigger dormant | Conditional on provider response |
| D-7 Folders keep | YES | YES (nothing touched) | n/a | n/a | NO | — |
| D-8 Release authorized in principle | YES | Held — no push this pass | n/a | n/a | Pending Founder OK | Authorize push when satisfied |
| D-9 B-04 load test | Window exists | NOT RUN | n/a | n/a | YES — after review | Do not run |
| Mobile | Deferred | Not touched | n/a | n/a | YES | — |

---

## 3. What Was Implemented in This Pass

### D-3 — Per-study-type methodology profiles (VISIBLE)
- New `api/src/lib/studyProfiles.ts`: distinct approved methodology profile for each of the 8 study types — objective, method, primary evidence fields, per-type limitations, and an explicit "this report does not claim" block.
- `api/src/lib/report.ts` now emits `studyProfile` in every report payload (company + ops share `buildReport`).
- Both report UIs render a "Study methodology" section. Comparing a Pricing report against a Segmentation report now shows materially different text — not relabeled copies.
- Nothing statistical was invented: profiles are approved methodology text; all figures still come only from computed evidence.

### D-5 — Hosted media (CODE COMPLETE / INFRASTRUCTURE STAGED)
- Schema: `CampaignMedia` gained `source` (`URL`|`HOSTED`), `status` (`PENDING`|`READY`), `storageKey`, `contentType`, `sizeBytes`. Migration `20260920124459_hosted_media` preserves existing rows (`source='URL'`, `status='READY'`).
- New `api/src/lib/media.ts`: S3-compatible client (AWS SDK v3, Railway Bucket virtual-hosted style), campaign-scoped keys `campaigns/{campaignId}/{mediaId}.{ext}`, signed PUT (5 min TTL) and GET (1 h TTL) URLs, confirm-time `HeadObject` verification (type+size must match the declaration), delete, prefix listing for orphan sweep.
- New routes in `api/src/routes/company.ts`:
  - `POST /api/company/campaigns/:id/media/upload-init` — validation + PENDING row + signed PUT URL
  - `POST /api/company/campaigns/:id/media/:mid/confirm` — verifies stored object, marks READY
  - `GET`/`POST`/`DELETE` media routes extended: hosted reads resolve fresh signed URLs; delete best-effort removes the object.
- Guards enforced: company ownership (404 cross-tenant), lifecycle lock (409 when not DRAFT/READY), JPEG/PNG/WebP only, 5 MB max, 20 assets/campaign cap, fail-closed `503` when bucket env is unset.
- Hosted URLs now resolve to signed read URLs in company detail, ops campaign detail, and **consumer campaign detail**.
- Company UI: file-upload control next to URL form; media table shows Source + status; hosted rows render a "view" link.
- Consumer view: hosted images render via signed URL (no credentials exposed).

### Platform Admin UI completion (VISIBLE)
- `web/app/ops/index.html`: new **Administration** tab — visible only for `PLATFORM_ADMIN` (role from login response + localStorage; backend `requirePlatformAdmin` remains authoritative).
- Tab contains: ops-user list (name/email/role), create-ops-user form (name/email/password/role select incl. PLATFORM_ADMIN), and the access audit-event log (`GET /ops/audit-events`, capped at 200 rows shown of API's 500 max).
- OPERATIONS users do not see the tab at all; even if forced, the API returns 403.

### D-6 — Akedly conditional shield (VERIFIED, no change needed)
- `web/app/consumer/index.html` lines ~201–208: solves PoW only when `challengeRequired`; obtains Turnstile token only when `data.turnstile.required`; forwards `powSolution`/`turnstileToken` verbatim. No invented threshold — the difficulty-budget trigger stays dormant as documented.

### Intentionally absent (rejected features regression-checked by tests)
Rewards, shared TAJRIBTI panel, panel marketplace, push notifications, demo mode, cross-company intelligence, predictive claims — all remain absent; suite asserts push endpoints are gone.

---

## 4. Exact Web Routes for Review

| Surface | URL |
|---|---|
| Public website | `https://api-production-266c.up.railway.app/` |
| Company workspace | `https://api-production-266c.up.railway.app/app/company/` |
| Operations / Platform Admin | `https://api-production-266c.up.railway.app/app/ops/` |
| Consumer app | `https://api-production-266c.up.railway.app/app/consumer/` |

**IMPORTANT:** these URLs currently serve production `9bc15f0`. The new functionality is on the **local release candidate** — it is NOT visible on production until the Founder approves and the push/deploy happens (D-8). To review the candidate before deploy, run the API locally (`cd api && npm install && npm run db:migrate && npm run dev`) and open `http://localhost:<port>/app/company/` etc. — or approve push of `master → benchmark-current` to deploy the candidate.

---

## 5. Infrastructure Pending (D-5 bucket)

A Railway Bucket named **`tajribti-media`** (id `f1ae9446-7c99-4f0b-ad03-cbc9632bdae0`, region `iad`) has been **staged** in the `production` environment of project `tajribti-pilot`. It is a pending change only — nothing is provisioned and nothing is deployed. It becomes real when the staged changes are applied (dashboard "Deploy staged changes" / `accept-deploy`), which the Founder can do at release time, or discard.

After the bucket exists, wire the API service variables (Railway: api service → Variables → reference the bucket's shared variables):

| App env var | Railway bucket variable |
|---|---|
| `MEDIA_BUCKET_ENDPOINT` | `ENDPOINT` (e.g. `https://t3.storageapi.dev`) |
| `MEDIA_BUCKET_NAME` | `BUCKET` (globally unique name, not the display name) |
| `MEDIA_BUCKET_ACCESS_KEY` | `ACCESS_KEY_ID` |
| `MEDIA_BUCKET_SECRET_KEY` | `SECRET_ACCESS_KEY` |
| `MEDIA_BUCKET_REGION` | `REGION` (optional; default `auto`) |

Until those variables are set, upload-init returns `503 Hosted media storage is not provisioned` and URL media is unaffected — the feature fails closed, never half-open.

---

## 6. Founder Manual Review Sequence

Checkbox legend: `[ ]` unchecked → mark PASS/FAIL.

| # | URL / Screen | Action | Expected result | ✓ |
|---|---|---|---|---|
| 1 | `/` Public website | Scroll | Positioning, journey, sectors, sample report, 8 study-type catalog, CTAs; no push/demo claims | [ ] |
| 2 | `/app/company/` | Log in with company credentials | Dashboard with campaign list | [ ] |
| 3 | Company → New campaign | Create campaign | DRAFT campaign created | [ ] |
| 4 | Campaign → Setup | Open Study Type selector | All 8 study types selectable with template descriptions | [ ] |
| 5 | Campaign → Setup → Product | Set price range, pack size, claims | Fields save and persist | [ ] |
| 6 | Campaign → Setup → Media | Add URL media; try Upload file | URL row appears with Source=URL. Upload: file picker validates type/size; if bucket env unset → clear "not provisioned" message (expected pre-release); after wiring → uploaded file shows Source=HOSTED, "view" link opens the image | [ ] |
| 7 | Journey / Survey tab | Review questions | Template questions for the chosen study type | [ ] |
| 8 | QR / Sources tab | Add a source | QR/source listed | [ ] |
| 9 | Live Results tab | Open | Funnel metrics render | [ ] |
| 10 | Insights tab | Open | Descriptive sections, n-shown, suppressed cells marked | [ ] |
| 11 | Report tab | Open | Full report incl. **Study methodology** block naming the campaign's study type | [ ] |
| 12 | Report → narrative | Read Arabic block | Arabic lines render RTL (`dir="rtl"`) | [ ] |
| 13 | Report → Print/Save as PDF | Click | Print dialog shows only the report card; RTL preserved | [ ] |
| 14 | `/app/ops/` | Log in (ops account) | Pipeline / Companies / Study-Type Requests / Question Requests; **Administration** tab visible only if PLATFORM_ADMIN | [ ] |
| 15 | Ops → Administration | Open (admin account) | Ops-user table, create-user form, audit log. Under an OPERATIONS login the tab is absent and API returns 403 | [ ] |
| 16 | `/app/consumer/` | Log in via OTP | Consumer home | [ ] |
| 17 | Discover | Browse | Active, date-valid campaigns | [ ] |
| 18 | Participate in a campaign, return to Discover | Refresh | Participated campaign no longer listed (API-enforced) | [ ] |
| 19 | Activity | Open | Prior participation listed | [ ] |
| 20 | End-to-end | New campaign → QR → consumer journey → report | Full loop works; report shows the study-type profile matching step 4 | [ ] |

---

## 7. What Must NOT Be Tested Yet

- **B-04** QR production load test — window exists but requires explicit go after this review.
- **Mobile** — untouched, deferred until Web/API acceptance.
- **Production hosted upload** — only after the staged bucket is applied and env vars wired.
- Any direct production data creation/mutation.

## 8. Deferred / Known Boundaries

- Predictive analytics: methodology-gated, no model shipped (D-4).
- Difficulty-budget Turnstile trigger: dormant pending a ratified solve-time budget (D-6).
- Orphan sweep: `listMediaKeys()` exists; no scheduled job invented — sweep policy is a Founder decision.
- Ops-user edit/deactivate: create + list only (matches existing API surface); no deactivate endpoint exists.
- Server-side PDF: intentionally absent (D-2 — browser print is the mechanism).

## 9. Validation Results (this pass)

- `npm test`: **69/69 pass**, 21 suites, 0 fail/skip (includes 14 new hosted-media + study-profile tests)
- `tsc -p tsconfig.json`: exit 0
- `prisma validate`: valid
- Web inline-script parse (all 4 HTML surfaces): OK
- Benchmark hash: unchanged

## 10. Risk Notes

- `npm audit` reports 2 moderate vulnerabilities (pre-existing/transitive; not remediated to avoid unrelated dependency drift).
- The staged bucket pending change sits in production's deploy queue — it applies only on an explicit apply; if the release push happens first, confirm whether Railway bundles staged changes into that deploy before authorizing.
