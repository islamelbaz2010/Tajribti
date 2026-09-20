# TAJRIBTI — FINAL RELEASE DECISION STATUS

**Date:** 2026-09-20
**Scope:** Web / API / Product / Governance / Release Preparation
**Mobile:** OUT OF SCOPE · **Production/GitHub:** READ-ONLY (verified, unmutated)
**Authority order followed:** Benchmark → OFD Register → Innovation Spec → Master Forensic Review → Gate-Closure Pack → source → tests. AI_BOOTSTRAP: **absent** (reported). PROJECT_STATE: **absent** (reported); spec+register+reports serve as state docs.

---

## A. Current Git State (re-verified, not assumed)

| Item | Verified value |
|---|---|
| Local branch | `master` — no upstream tracking |
| HEAD | `29bd48916615ca0c5e3c86f6ffb81a4dc5ba103f` |
| Working tree | clean |
| `origin/benchmark-current` | `45aa5711ab83f97fc8985a185df221ac48031082` |
| `origin/main` | `04c736e6c8e58ae3602042dd689cabdc75e8aad0` — **diverged** (74 vs 42 unique commits) |
| master vs benchmark-current | **4 ahead / 0 behind** — `3086038`, `23632a4`, `f79012a`, `29bd489`; merge-base `45aa571`; fast-forward safe |
| Local master on remote | absent |
| Unrelated commits on master | none — all 4 are approved innovation/correction/docs commits |
| Mobile diffs since baseline | 3 files, all inside approved innovation commit `3086038`; zero in corrective/docs commits |

## B. Benchmark Integrity

`governance/REFERENCE_PRODUCT_BENCHMARK.md` re-read in full (457 lines). SHA-256 `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` — **unchanged**, no uncommitted modification.

## C. Product Status (verified against source)

- **Discover exclusion:** `GET /consumer/campaigns` applies `participations: { none: { consumerId } }` for authenticated consumers (`api/src/routes/consumer.ts:30`); anonymous list unchanged — GREEN.
- **Activity:** `GET /consumer/participations` consumer-scoped history — GREEN.
- **Duplicate participation:** 409 "Already participated" guard intact — GREEN.
- **Push:** all active routes/UI removed; only documented dormant schema (`Consumer.push*`, `CampaignNotificationRequest`) + absence tests remain — GREEN (superseded OFD-14).
- **15C shared panel:** absent, 404-tested — GRAY (rejected).
- **Rewards / Demo Mode:** absent — GRAY.
- **Platform Admin:** distinct `PLATFORM_ADMIN` role, DB-enforced, company/ops-user/audited-PII controls — GREEN (assignment granularity = D-1).
- **Tenant isolation, question audit, deterministic bilingual narrative, labeled-derived intelligence, no false predictive claims, URL media, print-to-PDF, Akedly V1.2 contract** — all verified GREEN.

## D. Founder Decision Status

OFD-01…20 + 2026-09-20 clarifications — same classifications as the Gate-Closure Pack: GREEN (01,03,05,06A–C,07,10,11,12,15A,15B,16,17,19,20, Discover/no-push), YELLOW (04,08,13), BLUE (06D,09,15D,18), GRAY (02,14,15C). Register annotated for OFD-14 supersession.

## E. Gates D-1 … D-9

| Gate | Verified evidence | Requires Founder? |
|---|---|---|
| D-1 Ops assignment | `OpsUser.role` DB-enforced; scope global; PLATFORM_ADMIN backfill intentional/capability-preserving | YES — per-company / per-campaign / global (impacts in Gate-Closure Pack §H) |
| D-2 PDF | bilingual RTL + print CSS verified; no file artifact | YES — print sufficient vs server/client engine |
| D-3 Study types | 8 types executable via 14 instruments + generic report | YES — ratify generic V1 report or define per-type methodology |
| D-4 Predictive | descriptive only, correctly labeled | YES — define methodology or formally defer |
| D-5 Media storage | URL-only, ownership/lock/isolation tested | YES only if hosted uploads wanted — else ratify URL-only |
| D-6 Akedly Shield | V1.2-conformant; Shield optional (Turnstile/high-difficulty trigger) | Ratify keep-current vs conditional adoption |
| D-7 Folders | `samples app` **81 dirty files + unpushed HEAD 24d99efd**; `tajribti-benchmark-edition` remoteless w/ 2 dirty files; `Tajribti` = clean clone of main; backups folder non-git | YES — keep/archive; **no deletion safe except possibly the clean clone; none authorized** |
| D-8 Release push | master = benchmark-current + approved commits only; FF-safe | YES — authorize `git push origin master:benchmark-current` |
| D-9 B-04 | `load-test-qr.ts` verified: QR GET + eligibility POST, concurrency 20/500 default, CONSUMER_TOKENS pool, writes real rows | YES — authorization + window + disposable campaign (preflight in Gate-Closure Pack §P) |

## F. Technical Release Register Status (v2 xlsx — verified)

`TAJRIBTI_Technical_Release_Review_Register_2026-09-20_v2.xlsx` (in `samples app/`): every technical fact checked against repository — HEAD 29bd489 ✓, baseline 45aa571 ✓, hash ✓, 55/55 ✓, tsc/prisma ✓, Discover exclusion ✓, push removal/dormant schema ✓, 15C removal ✓, gates G1–G15 match D-1…D-9 ✓, master+3 note now +4 (docs commit; harmless drift). **DOCUMENTATION CONFLICTS: none.** One stale field to refresh at next sync: "3 commits ahead" → 4 (includes docs-only `29bd489`).

## G. Legal/Accounting Dossier Status (v2 pdf — verified)

`TAJRIBTI_Legal_Accounting_Readiness_Dossier_Egypt_2026-09-20_v2.pdf` (in `samples app/`): technical snapshot section matches repository facts (SHA, tests, Discover rule, push removal, mobile deferral, production-untouched). Legal/accounting content is a working pack for counsel — **not modified, no legal advice given**. B-02 (LLC) and B-03 (PDPL/Law 151-2020 + Reg. 816/2025 verification) remain open legal gates.

## H. Production Status (read-only verified)

Railway `tajribti-pilot` / production / service `api`: latest deployment **SUCCESS**, created 2026-09-20T01:08Z, **branch `benchmark-current` @ `45aa571`** — i.e., production runs the pre-innovation baseline.
**⚠ Release-path fact:** Railway auto-deploys `benchmark-current` — the D-8 push is therefore also a production deploy. Founder authorization for D-8 must acknowledge this; deployed-SHA verification (Railway dashboard) follows the push per register step 2.

## I. Mobile Status

Untouched — zero mobile diffs outside approved `3086038`. Phase D deferred correctly.

## J. Exact Manual Actions Required

| # | Action | Where | Expected result | Access |
|---|---|---|---|---|
| 1 | Authorize release push (implies production deploy) | Founder approval | permission to run `git push origin master:benchmark-current` | GitHub SSO/2FA |
| 2 | Run push | local repo | `benchmark-current` fast-forwards to `29bd489`…*or current HEAD*; Railway auto-deploys | local git creds |
| 3 | Verify deployed SHA | Railway dashboard → tajribti-pilot → api → deployments | deployment commit = pushed HEAD, status SUCCESS | Railway account (password manager/SSO) |
| 4 | Prepare B-04 disposable campaign + QR + consumer token pool | production product UI / admin | ACTIVE in-date campaign, bound QR source, CONSUMER_TOKENS | product access |
| 5 | Authorize + run B-04 in window | `api/scripts/load-test-qr.ts` | latency/error evidence captured | production access |
| 6 | Archive evidence (SHA, outputs) | release dossier | stored, no secrets | — |
| 7 | B-02/B-03 counsel workstreams | GAFI/ETA/ITIDA links in register sheet 2 | legal gates progress | Founder/counsel |

## K. Exact Founder Decisions Required

D-1 Ops scope · D-2 PDF sufficiency · D-3 study-type depth · D-4 predictive methodology-or-deferral · D-5 media storage · D-6 Akedly Shield trigger · D-7 folder disposition · D-8 push authorization · D-9 B-04 window. (B-02/B-03 = legal workstreams.)

## L. No-Go List

Push (rejected) · shared panel 15C · demo mode 16 · rewards 02 · cross-company intelligence · methodology/permission/architecture invention · folder deletion without uniqueness proof · production mutation · mobile work · merge/rename/force-push.

---

**Validation this pass:** `npm test` 55/55 pass (17 suites, 0 fail/skip) · `tsc` exit 0 · `prisma validate` clean · Benchmark hash identical · working tree clean · zero code changes made.
