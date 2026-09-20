# TAJRIBTI — FOUNDER DECISION CLOSURE PACK

**Date:** 2026-09-20 · **Nature:** decision matrix + consolidated post-decision implementation plan · **No code changes this pass.**

Authority order followed: Benchmark → Master Register → Innovation Spec → Master Forensic Review → Gate-Closure Pack → Release Decision Status → source → tests. AI_BOOTSTRAP: absent. PROJECT_STATE: absent. Both reported, not invented.

---

## A. Executive State

Web/API/Product layer: **all Founder-decided behavior implemented and verified**. Zero open code defects. Every remaining item is a Founder decision, authorization, or external/legal workstream. Repository is release-ready pending D-8 production-release authorization.

## B. Verified Git State

| Item | Verified |
|---|---|
| Branch / HEAD | `master` @ `96a8a9e9c0d7df0ca7e50edfc83cf6de8b6b6106` — no upstream, clean tree |
| vs `origin/benchmark-current` (`45aa571`) | **5 ahead / 0 behind** — `3086038` `23632a4` `f79012a` `29bd489` `96a8a9e`; merge-base `45aa571`; FF-safe |
| `origin/main` (`04c736e`) | diverged — not release target |
| Local commits | all approved innovation/correction/docs; none unrelated |
| Mobile diffs since baseline | only inside approved `3086038` |
| Remote/local mutations this pass | none |

## C. Benchmark Integrity

`governance/REFERENCE_PRODUCT_BENCHMARK.md` — full re-read; SHA-256 `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` — **identical**, unmodified.

## D. Product Acceptance Status

Consumer / Company / Operations / Platform Admin / Public Website / Reporting / Intelligence / Auth+QR / Question governance / Media / Akedly — all verified GREEN for decided scope. Full detail in `TAJRIBTI_MASTER_PRODUCT_FORENSIC_REVIEW_2026-09-20.md` §E–§T.

## E. No-Push Status

Sweep of `api/`, `web/`, `docs/`, `governance/`, tests: **no active consumer push of any kind** (campaign/reminder/lifecycle/reactivation/new-campaign), no ops launch, no company request. Remaining references: (a) documented dormant schema (`Consumer.push*`, `CampaignNotificationRequest`), (b) audit/spec annotations, (c) 404 absence tests, (d) Benchmark §9 exclusion line, (e) unrelated `.push()` array calls. **GREEN — decision enforced; dormant schema preserved per rule.**

## F. §32 Discover Status

`api/src/routes/consumer.ts:17–36` — authenticated consumers get ACTIVE + in-date + `participations: { none: { consumerId } }`; anonymous unchanged; detail route preserved; 409 duplicate guard intact; `/consumer/participations` = Activity. Regression-tested. **GREEN — API-enforced.**

## G. Platform Admin Status

Distinct `PLATFORM_ADMIN` role, DB-enforced per request; company/ops-user management + audited PII + audit log are admin-only; `OPERATIONS` blocked from all of the above (tested). Blanket PLATFORM_ADMIN backfill = capability-preserving; assignment granularity open (D-1). **GREEN with YELLOW gate.**

## H–P. Decision Gates

Classification key: **A** complete/no action · **B** Founder ratification only · **C** implementation required after approval · **D** production authorization required · **E** legal/external · **F** deferred · **G** rejected/superseded.

### H. D-1 — Ops role assignment — **B** (C if scoped option chosen)
Current: global visibility; `OpsUser.role` enforced; all OpsUsers backfilled PLATFORM_ADMIN.
Options: per-company / per-campaign / ratify global. Impacts (schema/API/UI/security/migration) in Gate-Closure Pack §H. Production impact: none until implemented. Mobile: none.

### I. D-2 — PDF — **B** (C if B/C chosen)
Current: bilingual RTL + print CSS → browser Save-as-PDF; verified working.
Options: A ratify print / B server-generated / C client-generated. If B/C: new dependency, Arabic font+shaping work, artifact storage decision, deploy weight. Mobile: none.

### J. D-3 — Study-type methodology — **B** (C if per-type)
Current: 8 types executable via 14 instruments + generic evidence→report→intelligence.
Options: A ratify generic V1 report for all / B define per-type findings+recommendations methodology (list in Gate-Closure Pack §J).

### K. D-4 — Predictive analytics — **B**
Current: descriptive only (Wilson CIs, segmentation, lexicon sentiment, observed themes) — correctly labeled, nothing false.
Options: ratify descriptive-only for V1 / commission methodology spec (target, population, sample policy, validation, leakage controls, error reporting, versioning, explainability, evidence threshold). No implementation allowed before spec.

### L. D-5 — Media storage — **B** (C if B/C)
Current: URL-only `CampaignMedia` — ownership/lock/isolation/XSS verified.
Options: A ratify URL-only / B object-storage upload / C platform-managed storage.

### M. D-6 — Akedly Shield — **B**
Current: V1.2-conformant backend-proxy + client-PoW (verified vs contract).
Options: ratify keep-current / conditional Shield adoption trigger (Turnstile enabled or pinned-high difficulty).

### N. D-7 — Folder disposition — **B**
Verified: `samples app` = 81 dirty files + unpushed HEAD `24d99efd` (unique work — KEEP); `tajribti-benchmark-edition` = remoteless repo, 2 dirty (unique — KEEP); `Tajribti` = clean clone of remote main (CANDIDATE — deletion still needs explicit authorization); `samples-app-backups` = non-git backup (BACKUP); clean workspace KEEP. Duplicate "(1)" copies of v2 docs exist inside `samples app` — cosmetic.

### O. D-8 — Release push — **D — PRODUCTION RELEASE AUTHORIZATION**
Not a Git sync: Railway auto-deploys `benchmark-current`; `git push origin master:benchmark-current` **is** the production deploy. Production verified running `45aa571` (SUCCESS, 2026-09-20T01:08Z).

**Pre-push checklist:** ✓ clean tree · ✓ Benchmark unchanged · ✓ 55/55 tests · ✓ tsc 0 · ✓ prisma validate · ✓ no unrelated commits · ✓ mobile unchanged outside `3086038` · ✓ production baseline `45aa571` verified · ☐ Founder explicit production-release authorization · ☐ Railway monitoring ready. **Not run.**

### P. D-9 — B-04 — **D**
`api/scripts/load-test-qr.ts` verified: GET `/consumer/qr/:code` + POST eligibility, concurrency 20 × 500 default, `CONSUMER_TOKENS` pool, **writes real rows**. Manual run procedure: authorize window → seed disposable ACTIVE campaign + bound QR + consumer JWT pool → `BASE=<prod-url> CAMPAIGN_ID=… QR_CODE=… CONSUMER_TOKENS=… npx ts-node --transpile-only scripts/load-test-qr.ts [conc] [reqs]` → capture latency/error output → monitor Railway metrics → cleanup test data → archive evidence. **Not run.**

## Q. Legal Gates — **E**

B-02 LLC (GAFI route, counsel confirms form/checklist) · B-03 PDPL (Law 151/2020 + Reg. 816/2025 verification, RoPA, controller/processor mapping, cross-border review) · B-04 = technical-production (P above). Verified factual technical references in the v2 dossier — correct; legal conclusions left to counsel/accountant.

## R. Mobile Gate — **F**

Untouched; Phase D only after Web/Product acceptance + release. No Flutter/APK/iOS action.

## S. Folder Safety

KEEP ×3 (clean workspace, `samples app`, `tajribti-benchmark-edition`) · CANDIDATE ×1 (`Tajribti` clean clone) · BACKUP ×1 (`samples-app-backups`). No deletion/move/modification performed or authorized.

## T. Documentation Status

- `TAJRIBTI_Technical_Release_Review_Register_2026-09-20_v2.xlsx` — located in `samples app/` (ARCHIVE LOCATION); all technical facts verified consistent. **DOCUMENTATION DRIFT:** field "local master reported 3 commits ahead" → verified current = **5 ahead** (docs commits `29bd489`, `96a8a9e` added post-sync; no product change).
- `TAJRIBTI_Legal_Accounting_Readiness_Dossier_Egypt_2026-09-20_v2.pdf` + `_AR_v2.pdf` — located in `samples app/` (ARCHIVE LOCATION); technical facts verified; duplicate "(1)" copies present.
- Recommendation (not executed): copy the three v2 files into the active workspace as new dated artifacts at next documentation sync.

## U. Exact Founder Decisions Needed

| ID | Question | Class |
|----|----------|-------|
| D-1 | Ops visibility scope: per-company / per-campaign / ratify global | B |
| D-2 | Is browser print-to-PDF sufficient for OFD-13? | B |
| D-3 | Generic V1 report sufficient, or per-type methodology? | B |
| D-4 | Ratify descriptive-only, or commission predictive methodology spec? | B |
| D-5 | URL-only media sufficient, or hosted storage? | B |
| D-6 | Ratify keep-current Akedly, or define Shield adoption trigger? | B |
| D-7 | Folder disposition (keep/archive/delete clean clone) | B |
| D-8 | Authorize production release push `master→benchmark-current`? | **D** |
| D-9 | Authorize B-04 production load window? | **D** |

## V. Exact Manual Actions Needed

1. Founder answers D-1…D-7 (ratifications likely close most as no-change).
2. If D-8 approved: `git push origin master:benchmark-current` → verify Railway deployment commit = HEAD + SUCCESS → smoke-check production.
3. If D-9 approved: execute §P procedure in an authorized window.
4. Copy v2 docs into workspace; refresh register's ahead-count field.
5. Counsel/accountant workstreams B-02/B-03 (links in register sheet 2). Credentials via password manager/SSO/2FA — never in chat/docs.

## W. Final No-Go List

Push/notifications (superseded) · 15C panel · demo mode · rewards · cross-company intel · methodology invention · folder deletion without proof · production mutation without D-8/D-9 · mobile · merge/rename/force-push · Benchmark edits.

---

# FINAL IMPLEMENTATION PLAN AFTER FOUNDER DECISION

| Gate | IF APPROVED → scope / files / tests / migration / production / rollback / acceptance | IF NOT APPROVED |
|---|---|---|
| D-1 scoped ops | add `OpsAssignment` model + migration; scope filters in `ops.ts`; UI picker; isolation tests; rollback = drop assignment enforcement | unchanged |
| D-2 engine | add PDF dep + `/report.pdf` route; Arabic font embed; snapshot test; heavier Railway build; rollback = remove route | print path stays |
| D-3 per-type | per-type findings/report sections in `report.ts`/`narrative.ts` + tests per methodology spec | generic report stays |
| D-4 predictive | methodology spec first, then isolated module; never ship without spec | descriptive stays |
| D-5 storage | storage provider + upload route + validation + migration of URLs; cleanup policy | URL-only stays |
| D-6 Shield | add `akedly_shield` where trigger met; PoW path unchanged otherwise | current stays |
| D-7 folders | archive/delete only after written uniqueness sign-off | keep all |
| D-8 release | push → verify deployed SHA → smoke test; rollback = redeploy `45aa571` | stays local |
| D-9 B-04 | §P run → evidence archive → close B-04 technically | gate stays open |

**Validation at HEAD `96a8a9e`:** 55/55 tests · 17 suites · 0 fail/skip · tsc 0 · prisma valid · Benchmark hash identical · zero code changes this pass.
