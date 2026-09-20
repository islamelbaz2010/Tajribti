# TAJRIBTI — GATE-CLOSURE + RELEASE-READINESS DECISION PACK

**Date:** 2026-09-20
**Scope:** Web / API / Product / Governance / Release Readiness
**Mobile:** OUT OF SCOPE · **Production:** READ-ONLY · **Remote GitHub:** READ-ONLY (inspection only)
**Method:** forensic verification from repository + git state. No SHA/branch/status trusted from prior reports — all re-verified below.

---

## A. Executive Status

The Web/API/Product layer is **technically complete for everything that has a Founder decision behind it**. The §32 acceptance behavior (Discover excludes participated campaigns at API level; Activity holds history; zero consumer push) is implemented and regression-tested. All remaining items are **decision/authorization gates, not code defects**. One governance-record hygiene fix was applied this pass (OFD-14 supersession annotation on the register).

- Confirmed defects found this pass: **0**
- Code changes this pass: **0** (one documentation annotation only)
- RED items: **0**

## B. Exact Git State

| Item | Verified value | How |
|---|---|---|
| Current branch | `master` | `git branch -vv` — **no upstream tracking** |
| HEAD | `f79012af97d8a8e6085246cce0959c0be796a7aa` | `git rev-parse HEAD` |
| Working tree | clean | `git status --short` → empty |
| `origin/benchmark-current` | `45aa5711ab83f97fc8985a185df221ac48031082` | `git ls-remote` + local ref |
| `origin/main` | `04c736e6c8e58ae3602042dd689cabdc75e8aad0` (also `origin/HEAD`) | `git ls-remote` |
| Local `master` on remote? | **No** — not present in `git ls-remote` | — |
| master vs benchmark-current | **3 ahead, 0 behind**; merge-base = `45aa571` | `git rev-list --count` |
| main vs benchmark-current | **DIVERGED** — main has 74 commits not in benchmark-current; benchmark-current has 42 not in main | `git merge-base`, `rev-list` |
| Other remote branches | `diagnostic/*` (3), `fix/consumer-mlkit-r8`, `sprint/meos-production-build`, `sprint/pilot-readiness-mvp` — mobile/diagnostic work | `git ls-remote` |
| Commits unique to local master | `3086038` (innovation impl), `23632a4` (forensic corrections), `f79012a` (Discover exclusion + push removal) | `git log` |
| Mobile files changed since baseline? | 3 files (`api_client.dart`, `l10n.dart`, `profile_screen.dart`) — **all inside `3086038`, the innovation commit itself**; corrective passes `23632a4`/`f79012a` and this pass touched **zero** mobile files | `git log -- mobile/`, `git diff --name-only` |

### Branch reconciliation table

| Branch | Location | HEAD | Relationship |
|---|---|---|---|
| `master` | local only | `f79012a` | benchmark-current + 3 local commits; fast-forwardable onto `origin/benchmark-current` |
| `benchmark-current` | remote | `45aa571` | intended release lineage; behind local master by exactly the 3 innovation/correction commits |
| `main` | remote | `04c736e` | **diverged** — older/different product line; not the release target |
| `diagnostic/*`, `sprint/*`, `fix/*` | remote | various | unrelated mobile/diagnostic work; do not touch |

## C. Benchmark Integrity

`governance/REFERENCE_PRODUCT_BENCHMARK.md` — **re-read in full (457 lines)** this pass.

- SHA-256: `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a`
- Matches the recorded baseline hash; no committed or uncommitted modification (`git diff` clean).
- **AI_BOOTSTRAP: does not exist** — reported per rule; governance resolved from `governance/`, `docs/`, `reports/`, implementation, tests.
- **PROJECT_STATE / equivalent: does not exist** in this repo — reported per rule; `docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md` + the register + reports are the current state documents.
- Benchmark §9 explicitly lists "push notifications" under NOT-authorized competitor features — the 2026-09-20 no-push decision is therefore *consistent with* the Benchmark, and the innovation-layer OFD-14 override was correctly removed.

## D. Founder Decision Register (reconstructed)

Source: `reports/TAJRIBTI_FOUNDER_INNOVATION_MASTER_REGISTER_2026-09-20.md` (OFD-01…20 confirmed complete — no additional decisions found in repo) + 2026-09-20 clarification.

| OFD | Status |
|---|---|
| 01 additive-only | GREEN |
| 02 rewards rejected | GRAY — absent, verified |
| 03 narrative | GREEN — deterministic bilingual evidence-bound |
| 04 eight study types | YELLOW — instruments live; per-type findings methodology = gate |
| 05 price/pack/claims | GREEN |
| 06A/B/C segmentation/sentiment/themes | GREEN — labeled derived, suppressed |
| 06D predictive | BLUE — methodology-gated; nothing falsely claims prediction |
| 07 verticals (Beauty) | GREEN — others future-only |
| 08 roles/Platform Admin | YELLOW — roles enforced; assignment semantics = gate |
| 09 mobile sequence | BLUE — deferred |
| 10 Akedly | GREEN — V1.2-conformant (corrected assessment stands) |
| 11 Benchmark immutable | GREEN — hash verified |
| 12 media URLs | GREEN — binary = gate |
| 13 PDF | YELLOW — print→PDF works; engine decision open |
| 14 notifications | **GRAY — SUPERSEDED by 2026-09-20 no-push decision; all active surfaces removed** |
| 15A/15B identity+opt-in, same-company intel | GREEN |
| 15C shared panel | GRAY — rejected; absent (404-tested) |
| 15D marketplace | BLUE — future |
| 16 demo mode | GRAY — absent |
| 17 public site | GREEN |
| 18 folder consolidation | BLUE — uniqueness not proven; no deletions |
| 19 question governance | GREEN — atomic, dual-actor audit |
| 20 tech≠commercial release | GREEN — gates tracked, none claimed closed |
| **NEW 2026-09-20** Discover exclusion + no push | GREEN — implemented, tested |

## E. Completed Scope

Consumer (OTP/JWT, Discover exclusion, eligibility, redeem, survey, Activity), Company (profile, employees+roles, campaigns, product descriptors, media, questions+requests, live results, intelligence, bilingual report+narrative, print, panel-insights), Operations (pipeline, readiness, lifecycle, live, issues, question apply/reject, audit view), Platform Admin (companies, ops-users, audited PII, audit log), Public site (OFD-17), integrity/security suite.

## F. Rejected / Superseded Scope

OFD-02 rewards, OFD-16 demo mode, OFD-15C shared panel, **OFD-14 push (superseded)** — all absent from active product behavior; absence guarded by tests.

## G. Deferred Scope

Mobile (Phase D), predictive methodology, binary media, PDF engine, folder consolidation, panel marketplace, non-Beauty verticals.

## H. Gate 1 — Ops Role Assignment

**Current implementation:** `OpsUser.role` ∈ {PLATFORM_ADMIN, OPERATIONS}, DB-stored, enforced per-request in `api/src/middleware/auth.ts`. Migration backfilled all existing OpsUsers → PLATFORM_ADMIN (capability-preserving — nobody lost access). Assignment scope today: **global** (an OPERATIONS user sees all campaigns; PLATFORM_ADMIN additionally manages companies/users/PII).

**Unresolved:** whether Operations visibility should be scoped (per-company / per-campaign) or remain global. No `OpsAssignment` entity exists; none was created.

| | Option A — per-company | Option B — per-campaign | Option C — global (status quo) |
|---|---|---|---|
| Schema | new OpsAssignment(companyId, opsUserId) | OpsAssignment(campaignId, opsUserId) | none |
| API | company-scoped filters on every ops query | campaign-scoped filters | none |
| UI | company picker/filter | campaign picker/filter | none |
| Security | tighter blast radius | tightest | broadest (current) |
| Complexity | medium | high | none |
| Migration | additive table + backfill decision | additive + heavier mapping | none |

**Must not change regardless:** PLATFORM_ADMIN-only controls, tenant isolation, audit. **Risk if wrong:** over-scoping breaks ops workflows; under-scoping leaves excessive PII-adjacent visibility. **FOUNDER DECISION REQUIRED.**

## I. Gate 2 — PDF Engine

**Current:** bilingual EN/AR, `dir="rtl"`, `@media print` stylesheet → browser Save-as-PDF. Verified working; no PDF *file* artifact is produced or stored.

| | A — browser print (status quo) | B — server-generated | C — client-generated |
|---|---|---|---|
| Impl impact | zero | engine dep (e.g. Playwright/Puppeteer or pdf-lib+fonts) | dep (e.g. jsPDF/html2canvas) |
| Arabic RTL | browser-native, correct | requires embedded Arabic font + shaping | fragile RTL/shaping |
| File artifact | no | yes (download/store) | yes (download) |
| Storage | none | optional storage decision follows | none |
| Reproducibility | user-dependent | deterministic | browser-dependent |
| Deploy impact | none | heavier (headless browser on Railway) | none |
| Testing | manual | automatable | hard |

**Founder question:** does OFD-13 require a generated PDF artifact (B/C), or is browser print-to-PDF sufficient (A)? **FOUNDER DECISION REQUIRED.**

## J. Gate 3 — Study Types

All eight selectable and executable end-to-end via instruments in `api/src/lib/studyTemplates.ts` (14 instruments), with generic evidence→report→intelligence path.

| Type | Engine capability | Methodology Founder must define |
|---|---|---|
| Concept Testing | instrument + generic report | concept-evaluation findings structure, success criteria |
| Pricing | price fields + instruments | price-analysis method (e.g. willingness bands — method unspecified) |
| Packaging | instruments | packaging-comparison findings structure |
| Claims | claims field + instruments | claim-evaluation criteria |
| Advertising/Message | instruments | message-testing comparison structure |
| Brand | instruments | brand-metric findings |
| U&A Expansion | instruments | U&A findings structure |
| Segmentation | descriptive segmentation | whether a dedicated segmentation *study report* is required |

**FOUNDER DECISION REQUIRED per type** (or one blanket decision: "generic report is sufficient for V1"). RESEARCH EVIDENCE — NOT PRODUCT REQUIREMENT: the three files in `doc/` (Consumer_Insights guide, Samplia analysis, ShevchenkoKuhlmannReips2020 Samply paper) may inform methodology options but were not converted into requirements.

## K. Gate 4 — Predictive Analytics

Current implementation correctly presents only descriptive statistics (Wilson CIs), segmentation, lexicon sentiment, observed-term themes — all labeled derived. **Nothing claims prediction.** A future predictive capability would need Founder-defined: prediction target, training population, minimum sample policy, validation method, leakage controls, error reporting, model versioning, explainability, evidence threshold. **FOUNDER DECISION REQUIRED — methodology brief only; zero implementation.**

## L. Gate 5 — Binary Media Storage

Current `CampaignMedia`: URL-referenced, company-owned, campaign-bound, launch-locked, XSS-escaped, isolation-tested.

| | A — URL-only (status quo) | B — object-storage upload | C — platform-managed storage |
|---|---|---|---|
| Infra | none | bucket + signed uploads | bucket + lifecycle mgmt |
| Security | URL spoofing/broken links | MIME/size validation needed | + moderation/cleanup |
| Cost | zero | storage+egress | highest |
| Migration | none | additive | additive |
| Auth | existing company scope | + upload authorization | + admin review possible |

**FOUNDER DECISION REQUIRED** — only if V1 needs hosted assets.

## M. Gate 6 — Akedly Shield

Re-verified vs V1.2 contract: backend proxy ✓, client-side PoW ✓, `powSolution`/`turnstileToken` forwarded verbatim ✓, `transactionReqID` server-side ✓, `trust proxy`+`x-end-user-ip` ✓, API credentials never client-side ✓. Options: **A** keep current (correct today); **B** adopt `akedly_shield` only if/when Turnstile enabled or PoW difficulty pinned high. Recommendation-ready but **not implemented** — adoption is a conditional trigger decision, not a defect.

## N. Gate 7 — Folder Consolidation (verified, no deletions)

| Folder | Identity | HEAD | Dirty | Classification |
|---|---|---|---|---|
| `tajribti-benchmark-clean` (167M) | remote = Tajribti.git, branch master | `f79012a` | clean | **KEEP — active controlled workspace** |
| `samples app` (2.6G) | same remote, branch `sprint/pilot-readiness-mvp` | `24d99efd` (**not on remote**) | **75 modified files** | **KEEP — unique uncommitted work + local-only commits; NOT deletable** |
| `Tajribti` (41M) | same remote, branch `main` | `04c736e` = remote main | clean | redundant clone of main — **CANDIDATE** (deletion not authorized) |
| `tajribti-benchmark-edition` (304M) | **no remote**, own history | `d932864` | 2 modified | **KEEP — unique local-only repo; uniqueness unprovable** |
| `samples-app-backups` (1.8G) | not a git repo | — | — | **BACKUP** (`backup_20260910_014517`) — uniqueness unprovable, no deletion |

Uniqueness cannot be proven for `samples app` (75 uncommitted changes + unpushed HEAD), `tajribti-benchmark-edition` (no remote), or the backup folder. **No deletion authorized or performed.**

## O. Gate 8 — Branch / Release

Facts: local `master` = `benchmark-current` + 3 commits, fast-forward possible; `master` doesn't exist remotely; `main` is divergent. **Recommended procedure for Founder approval (none executed):**

1. `git push origin master:benchmark-current` → fast-forwards the release branch, no new branch created, no PR needed. *(alternative: push `master` as `master` — NOT recommended, creates a stray remote branch)*
2. Optionally `git push origin :` nothing else; leave `main` untouched.
3. After push, optionally set upstream: `git branch -u origin/benchmark-current master` or rename local master → deferred to Founder.

**No-ops confirmed:** no push, merge, rename, force, PR, or branch deletion performed.

## P. Gate 9 — B-04 Pre-Flight Checklist

`api/scripts/load-test-qr.ts` — measures `GET /consumer/qr/:code` (public read) + `POST /consumer/campaigns/:id/eligibility` (write; repeats exercise the 409 already-participated path). NOT RUN.

- [ ] Production env: live Railway API base URL
- [ ] Test campaign: ACTIVE, in-date, seeded specifically for the test
- [ ] QR source bound to that campaign
- [ ] Consumer JWT pool: `CONSUMER_TOKENS` comma-separated (unique per write for true write-path measure)
- [ ] Traffic: defaults 500 req @ concurrency 20 — agree target load figure with Founder
- [ ] Monitoring: Railway metrics + DB connection pool during run
- [ ] Cleanup: test campaign + generated participation rows (Postgres) post-run
- [ ] Authorization: explicit production load-test approval + maintenance window
- [ ] Note: script writes REAL rows — run only against a disposable test campaign

## Q. Commercial Gates

| Gate | Class | Status |
|---|---|---|
| B-02 Egyptian LLC | LEGAL/FOUNDER | open — external |
| B-03 PDPL sign-off | LEGAL/FOUNDER | open — external |
| B-04 QR load validation | PRODUCTION/AUTHORIZATION | open — script ready, pre-flight above |

## R. Mobile Status

**Untouched.** Zero mobile diffs in this pass and both corrective passes; the 3 mobile file changes on this branch are inside `3086038` (the approved innovation commit). Mobile = Phase D after Web/Product acceptance.

## S. Research Evidence

`doc/` contains the three expected research files. Inspected for existence only; classified **RESEARCH EVIDENCE — NOT PRODUCT REQUIREMENT**; usable solely to inform methodology options (Gate 3/4).

## T. Exact Founder Decisions Required

| ID | Decision | Options | Current State | Founder Action |
|----|----------|---------|---------------|----------------|
| D-1 | Ops assignment scope | per-company / per-campaign / global | global, all-OpsUsers-backfilled-PLATFORM_ADMIN | choose scope (or ratify global) |
| D-2 | OFD-13 PDF completeness | print-to-PDF sufficient / server PDF / client PDF | print path works, no file artifact | choose |
| D-3 | Study-type depth | generic report sufficient for V1 / per-type methodology | 8 types executable, generic findings | choose per type or blanket |
| D-4 | Predictive analytics | define methodology / stay descriptive | descriptive only (correct) | define or formally defer |
| D-5 | Media storage | URL-only / object storage / platform-managed | URL-only (working) | choose |
| D-6 | Akedly Shield trigger | keep current / adopt on Turnstile+high-difficulty | V1.2-conformant | ratify trigger or keep |
| D-7 | Folder disposition | keep all / archive / delete `Tajribti` clone | 5 folders, uniqueness unproven for 3 | decide; no deletion authorized |
| D-8 | Release path | push master→benchmark-current (FF) | local-only commits ready | authorize push |
| D-9 | B-04 execution | run load test on production | script + checklist ready | authorize + window |

## U. Recommended Execution Order AFTER Founder Decisions

1. D-8 push `benchmark-current` (unblocks everything downstream)
2. D-1/D-2/D-3/D-4/D-5 implementation passes per decisions
3. B-04 production run (D-9) → then Web/Product acceptance
4. Phase D: Android → device → Akedly mobile → iOS

## V. No-Go Items

Push/provider infrastructure (rejected), shared panel (15C), demo mode (16), rewards (02), cross-company intelligence, methodology invention, production mutation, mobile work, branch merge/rename without authorization.

## W. Release Readiness Matrix

| Layer | Status |
|---|---|
| Web/API code | GREEN — tested (55/55), typecheck clean |
| Benchmark integrity | GREEN — hash identical |
| Governance records | GREEN — OFD-14 supersession now annotated on register |
| Git release path | YELLOW — ready, awaiting D-8 authorization |
| Founder decision completeness | YELLOW — 9 decisions packaged above |
| Commercial readiness | YELLOW — B-02/B-03/B-04 open |
| Mobile readiness | BLUE — Phase D, deferred correctly |
| Production | untouched | 
| Remote GitHub | untouched |

**Validation this pass:** working tree clean; tsc 0 and prisma validate and 55/55 tests verified at commit `f79012a` (state unchanged since — documentation-only annotation afterward); zero mobile diffs this pass; zero production/remote mutation.
