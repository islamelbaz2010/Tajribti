# TAJRIBTI — POST-INNOVATION FORENSIC AUDIT
## Date: 2026-09-20 · Auditor role: implementation/security/architecture/QA/release
## Scope: commit 3086038 (Founder Innovation) + corrective pass on top of it

# 1. Executive Status

| Item | Value |
|---|---|
| Baseline | `45aa5711ab83f97fc8985a185df221ac48031082` (= `origin/benchmark-current` tip) |
| Innovation commit | `30860385cff6c7282d0533d85869df964b1bd816` |
| Corrective commit | recorded in git log after this report was written (local only) |
| Current branch | `master` (local; no upstream). `origin/benchmark-current` = 45aa571. |
| HEAD | innovation commit + local corrective commit |
| Working tree | clean after commit |

**Branch governance note (reported, not changed):** the innovation work sits on local `master`,
whose parent is exactly the `benchmark-current` tip — so content is correct and nothing is lost,
but the local branch is *named* `master` rather than `benchmark-current` and has no upstream.
No push/rename/rebase was performed; whether the innovation commit should land on
`benchmark-current` (and be pushed) is a release-governance decision for the Founder/PM.

**Overall status: PARTIALLY IMPLEMENTED — READY FOR NEXT GATE on the implemented scope, with
corrected findings applied and explicit open decisions remaining.**

# 2. Benchmark Integrity

- Path: `governance/REFERENCE_PRODUCT_BENCHMARK.md` (v1.0, 2026-09-02)
- Baseline SHA-256: `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a`
- Final SHA-256:   `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a`
- **UNCHANGED** — zero diff across the entire pass (git diff on `governance/` is empty).

# 3. Founder Innovation Compliance Matrix

| OFD | Decision | Status | Evidence | Defects found → action |
|---|---|---|---|---|
| 01 | Innovation-first sequencing | COMPLIANT | Mobile release deferred pending this audit | none |
| 02 | Reject rewards | COMPLIANT | no rewards/points/wallet code anywhere | none |
| 03 | AI narrative — evidence-bound EN/AR | IMPLEMENTED (accurately: deterministic composition, NOT AI/LLM) | `lib/narrative.ts`, `report.ts` narrative field; test asserts no causal/predictive wording | none — methodology binding is correctly stated |
| 04 | 8 study types | PARTIALLY IMPLEMENTED — see §5 matrix | `studyTemplates.ts` 14 keys; apply-template route with 1×RATING/1×PI + dup guards | templates are instruments within the generic engine; per-type findings/report structure not implemented — correctly classified, not inflated |
| 05 | Price/Pack/Claims fields | IMPLEMENTED | Product fields + API + UI; tested incl. isolation | none |
| 06 | Advanced intelligence A–D | A/B/C IMPLEMENTED (descriptive, labeled); D = descriptive statistics only — true predictive NOT implemented (correct per guardrail) | `lib/intelligence.ts` + `/intelligence` endpoints | none — suppression/methodology/labeling verified |
| 07 | Beauty approved; others future | IMPLEMENTED (documented + Beauty post-trial template already existed) | `Company.industry` free-text accepts Beauty | none |
| 08 | Roles + audited PII | IMPLEMENTED with one open governance decision | DB roles, per-request DB checks, `AccessAuditEvent` | **all existing ops users backfilled PLATFORM_ADMIN** — capability-preserving but grants PII access broadly → OPEN FOUNDER DECISION (§8) |
| 09 | Android first, iOS after | COMPLIANT (sequencing) | CI workflow exists; iOS untouched | mobile local validation blocked — §14 |
| 10 | Akedly compatibility check | COMPLETE — corrected verdict: CONFORMANT | `reports/TAJRIBTI_AKEDLY_V1_2_COMPATIBILITY_AUDIT_2026-09-20.md` | prior report assessed wrong package — corrected |
| 11 | Benchmark immutable | COMPLIANT | hash identical | none |
| 12 | Campaign media | IMPLEMENTED (URL-referenced; binary storage = open decision) | `CampaignMedia` + routes + UI; locked after launch; isolated | none |
| 13 | PDF export EN/AR + RTL | PARTIAL — browser print→PDF path only | print CSS + `dir="rtl"` Arabic block on report view | no generated-PDF file output; honestly classified |
| 14 | Push: request→launch, opt-in, no lifecycle | PARTIALLY IMPLEMENTED — consent + request/launch + audit done; actual delivery blocked (no provider) | `pushOptIn`/`pushToken`, `CampaignNotificationRequest`, ops launch, audit | launch/reject race → FIXED (C-3); actor name hardcoded → FIXED (C-4) |
| 15 | 15A opt-in, 15B same-company, 15C REJECTED, 15D future | IMPLEMENTED after correction | opt-in endpoints; `/company/panel-insights` same-company only, n<5 suppressed | **`/ops/panel` + ops Panel tab implemented the REJECTED 15C shared panel → REMOVED (C-1)** |
| 16 | Reject demo mode | COMPLIANT | no demo-mode code; production env still carries inert legacy `DEMO_*` vars (informational) | none |
| 17 | Public website | IMPLEMENTED | `web/public/index.html` sections present incl. study-type catalog alignment | none |
| 18 | Folder consolidation w/ safety | VERIFIED, NO DELETIONS | 4 folders exist, distinct provenance; file-level uniqueness unproven | deletion remains an OPEN decision requiring a dedup pass |
| 19 | Company requests → Ops performs, audited | IMPLEMENTED | `QuestionChangeRequest` + `QuestionAuditEvent`; whitelist fields; delete-with-answers refused | apply/reject race → FIXED (C-2) |
| 20 | Technical vs commercial gates | COMPLIANT | B-04 load script delivered; gates tracked as open | none |

# 4. Akedly V1.2 Compatibility

Full detail: `reports/TAJRIBTI_AKEDLY_V1_2_COMPATIBILITY_AUDIT_2026-09-20.md`.

- **Production config:** `AKEDLY_API_KEY` + `AKEDLY_PIPELINE_ID` present (masked) on the
  Railway `api` service in production — existing V1.2 pipeline ("Sample app", Active) live.
- **Backend:** conformant — proxy matches the official recommended Express pattern verbatim;
  credentials server-side; verbatim proof forwarding; transactionReqID-keyed verify;
  `trust proxy` + `x-end-user-ip` supported.
- **PoW:** custom Dart solver is algorithmically identical to `solvePowInIsolate()`
  (`SHA256(challenge + ":" + nonce)`, hex leading zeros). CONFORMANT.
- **Turnstile:** web consumer uses official `@akedly/shield` (`getTurnstileToken`);
  **mobile has no Turnstile path** — latent gap while pipeline keeps Turnstile off.
- **Official `akedly_shield` adoption: OPTIONAL** — adopt when/if Turnstile is enabled or
  difficulty is pinned high. The prior "INCOMPATIBLE" verdict was against the deprecated
  V1.0 package and is superseded.

# 5. Study-Type Matrix (OFD-04)

All 8 share the generic engine: `studyType` tag → apply-template → ordinary `Question` rows →
generic survey → generic report. That is the approved architecture (configuration/intelligence
layer, per the standing differentiation decision), but per the audit rule **a template alone is
not a full study type** — honest classification:

| Study Type | Key | Instrument works end-to-end? | Type-specific objective/methodology spec | Type-specific findings/report | Status |
|---|---|---|---|---|---|
| Concept Testing | CONCEPT_TESTING | yes (generic engine) | yes (spec §D) | no (generic report) | PARTIAL |
| Pricing | PRICING_PERCEPTION | yes | yes | no; now has a Product.priceRange evidence anchor (OFD-05) | PARTIAL |
| Packaging | PACKAGING_EVALUATION | yes | yes | no; media assets usable as stimulus refs | PARTIAL |
| Claims | CLAIMS_TESTING | yes | yes | no; Product.claims anchor exists | PARTIAL |
| Advertising/Message | ADVERTISING_MESSAGE_TESTING | yes | yes | no; CREATIVE media kind supports stimulus | PARTIAL |
| Brand | BRAND_PERCEPTION | yes | yes | no | PARTIAL |
| U&A Expansion | UA_EXPANSION | yes | yes | no | PARTIAL |
| Segmentation | SEGMENTATION_STUDY | yes | yes | partially — OFD-06 age-band segmentation feeds it | PARTIAL |

**What is genuinely usable today:** a company can tag a campaign with any of the 8 types,
bulk-create a correct instrument (respecting the 1×RATING/1×PI integrity rule), collect real
responses, and get the generic report + derived intelligence. **What is missing for "full":
per-type findings/recommendation/report structures** — deliberately not invented (each needs
methodology the spec defines only at intent level; deepening is a follow-on decision).

# 6. Intelligence Matrix (OFD-06)

| Capability | Implementation | Classification |
|---|---|---|
| Advanced segmentation | Age-band groupings over eligibility snapshots; n<5 suppressed | IMPLEMENTED — descriptive only (correctly labeled) |
| Sentiment | Transparent EN/AR keyword lexicon v1.0; per-response label traceable to verbatim | IMPLEMENTED — heuristic foundation, honestly labeled "not a validated model" |
| Automated themes | Keyword-frequency extraction; theme = observed term + count + sample responses | IMPLEMENTED — technical foundation only (correctly: NOT true thematic analysis) |
| Predictive/statistical | Wilson 95% intervals on observed proportions; no prediction model, no significance tests | DESCRIPTIVE STATISTICS ONLY — true predictive analytics requires a Founder methodology decision (OPEN) |

All derived output carries `derived: true` + methodology strings; every value traces to
persisted `Answer`/`Participation` rows; small samples are suppressed/cautioned.

# 7. Security Findings

| # | Severity | Finding | Disposition |
|---|---|---|---|
| S-1 | MEDIUM | **Blanket PLATFORM_ADMIN backfill** — every existing OpsUser received PII-access role (capability-preserving, but broad) | OPEN FOUNDER DECISION — assign real roles per person |
| S-2 | MEDIUM (latent) | Mobile has no Turnstile path — OTP breaks if the pipeline enables it | documented; requires SDK/dependency decision |
| S-3 | LOW | Concurrency races on change-request/notification apply-reject-launch | FIXED (C-2/C-3) |
| S-4 | LOW | Hardcoded actorName in two audit writes | FIXED (C-4) |
| S-5 | LOW | Rejected 15C shared-panel endpoint shipped | FIXED (C-1) |
| S-6 | LOW | OTP UI hardcodes 6 digits (backend allows 4–6) | reported; informational fix pending pipeline config certainty |
| S-7 | INFORMATIONAL | Inert `DEMO_*`/`JWT_REFRESH_*` vars in production env (no code reads them) | hygiene decision for production cleanup |
| S-8 | INFORMATIONAL | Dead ternary in `otp_screen.dart` (`otpWrong : otpWrong`) | no behavior impact |

Verified clean: tenant isolation (all company routes scope by JWT companyId → 404 for foreign
resources, tested); question delete scoped by campaignId; change-request payloads whitelisted
(stage/type immutable); PII surfaces (participants, audit log, ops-user mgmt, company create)
behind `requirePlatformAdmin` with per-request DB role check; media URLs validated (zod `.url()`);
no secrets in diff; no new dependencies.

# 8. Role / Authorization Findings

- Middleware checks DB role on every request (revocation-effective). Verified by tests:
  COMPANY_MEMBER denied employee admin; OPERATIONS denied companies/PII/ops-user mgmt;
  PLATFORM_ADMIN allowed + audited.
- Self-role-change refused; new ops users default OPERATIONS; new employees default
  COMPANY_MEMBER.
- **Backfill (S-1):** migration set all existing Employees→COMPANY_ADMIN, all existing
  OpsUsers→PLATFORM_ADMIN — exactly preserving pre-innovation capability (previously roleless:
  everyone could do everything). Not a regression, but real per-person role assignment is an
  **OPEN FOUNDER DECISION** — do not silently re-tier.
- Explicit assignment beyond roles (OFD-08.5 "Role-Based + Explicit Assignment"): role-based
  part implemented; per-campaign/company explicit assignment records are NOT implemented —
  **unresolved Founder governance**, not invented.

# 9. PDF Findings (OFD-13)

- What exists: bilingual report view with `dir="rtl"` Arabic narrative block + `@media print`
  stylesheet → browser **print→PDF** produces EN+AR output with correct RTL.
- What does NOT exist: server-side/generated downloadable PDF file.
- **Classification: PARTIAL.** No new PDF engine introduced (would be a dependency decision
  outside this audit's corrective scope).

# 10. Media Findings (OFD-12)

- URL-referenced `CampaignMedia` (PRODUCT_IMAGE/PACKAGING_IMAGE/CAMPAIGN_MEDIA/CREATIVE):
  company CRUD while DRAFT/READY, locked after launch, tenant-isolated, ops-visible on campaign
  detail. Tested.
- Binary upload/storage intentionally absent — external storage decision is OPEN (not invented).

# 11. Push / Consent Findings (OFD-14)

- Explicit opt-in (`pushOptIn`, `pushOptInAt`, `pushToken`); opt-out clears token — immediate.
- Company request (COMPANY_ADMIN, READY/ACTIVE only) → Operations launch (ACTIVE only) →
  `LAUNCHED`/`PENDING_DELIVERY` + `eligibleCount` = push-opted-in consumers with participation
  in that company's campaigns only. Audited (now with real actor name).
- **No delivery path can bypass consent** — audience is computed from `pushOptIn: true` only;
  there is no send mechanism at all yet. Provider (FCM/APNs) = OPEN DECISION.
- 14D lifecycle automation: NOT implemented (correct).

# 12. Consumer Identity / Panel Findings (OFD-15)

- Persistent identity: phone+OTP creates/reuses the `Consumer` row; `GET/PATCH /profile`
  exposes consent state; mobile + web consent surfaces exist.
- 15B: `/company/panel-insights` — same-company campaigns only, opted-in consumers only,
  aggregates only, n<5 suppressed. Cross-company access structurally impossible (companyId
  scope). Tested.
- 15C: shared TAJRIBTI panel — **REMOVED** (was shipped; rejected scope). Verified no
  remaining cross-company panel surface.
- 15D marketplace: absent (correct).

# 13. Question Change Audit Findings (OFD-19)

- Full trail verified: `QuestionAuditEvent` records action, prev/new JSON, actor kind+id+name,
  campaign, lifecycle state, request linkage — for both direct edits (DRAFT/READY) and
  ops-performed changes on locked campaigns.
- Change-request path: company files (COMPANY_ADMIN, locked campaigns only, one pending per
  question) → ops applies whitelisted fields or rejects → delete-with-answers refused → both
  actors recorded. Tested.
- After the C-2 fix, apply/reject are race-safe.
- **Silent-mutation check:** no route mutates questions on locked campaigns other than the
  audited ops apply path. PASS.

# 14. Mobile Findings (OFD-09)

- Implemented: API client opt-in methods, EN/AR consent strings, profile toggles, Akedly V1.2
  challenge→client-PoW→send flow (algorithm-compatible).
- Gaps: no Turnstile widget (latent; pipeline currently off), main-thread PoW (documented),
  hardcoded 6-digit OTP boxes.
- **Validation: BLOCKED** — `flutter` fails on this host: "Current Mac OS X version 13.0 is
  lower than minimum supported version 14.0". `dart`/`flutter analyze` and builds cannot run
  locally. Mobile compile verification = CI (`build-consumer-current.yml`, Flutter 3.44.8) —
  must be confirmed on CI; physical-device OTP validation still required before Android
  release sign-off. iOS untouched (correct sequencing).

# 15. QR / B-04 Findings

- QR behavior verified by integrity suite: source→campaign binding, foreign-campaign/company
  rejection, date gating, attribution into source metrics/report. PASS.
- B-04: `api/scripts/load-test-qr.ts` delivered (QR read + eligibility write path, latency
  percentiles, status distribution). **NOT EXECUTED against production** — B-04 remains OPEN
  until a real run on production Postgres produces evidence. Not deployed/run (no authorization).

# 16. Corrective Changes Made

See `reports/TAJRIBTI_CORRECTIVE_IMPLEMENTATION_2026-09-20.md`:
- C-1 removed rejected 15C shared-panel endpoint + ops UI tab + test replaced with 404 assertion
- C-2 atomic claim guard on question-change apply/reject
- C-3 atomic guard on notification launch/reject
- C-4 real actor names in NOTIFICATION_LAUNCH and PANEL_INSIGHTS_VIEW audit events
- spec annotation marking §15C superseded (single surgical note; document otherwise preserved)

# 17. Validation Results

| Check | Result |
|---|---|
| `npm test` (node --test, real HTTP+SQLite via migrations) | **53 tests / 16 suites / 53 pass / 0 fail / 0 skip** |
| `tsc -p tsconfig.json` | exit 0 |
| `tsc --noEmit scripts/load-test-qr.ts` | exit 0 |
| Web inline-JS syntax check (company/ops/consumer/public) | all parse OK |
| Lint | no linter configured — TypeScript strict is the gate |
| Prisma migration | applied cleanly to fresh test DBs per suite |
| Flutter analyze/test/build | **BLOCKED** — host macOS 13 < Flutter minimum 14 |
| B-04 load test | script exists; **not run** (no production authorization) |

# 18. Remaining Open Decisions (genuine Founder/product/provider decisions only)

1. **Role assignment for real users** — all existing ops/employees currently hold the broad
   backfilled roles; assigning actual PLATFORM_ADMIN vs OPERATIONS etc. is governance.
2. **Explicit-assignment layer** (OFD-08.5) — role-based done; per-object assignment undefined.
3. **Push provider** (FCM/APNs credentials, budget) — required before OFD-14 delivery works.
4. **Predictive-analytics methodology** — required before OFD-06D can be more than descriptive.
5. **Binary media storage** — provider/approach for uploaded assets (URL-only today).
6. **Server-side PDF generation** — dependency/engine decision to go beyond print→PDF.
7. **Mobile Turnstile / isolate PoW** — adopt `akedly_shield` (Git dep) if/when pipeline needs it.
8. **Folder consolidation execution** — dedup pass before any deletion (OFD-18).
9. **Branch governance** — push/land the innovation+corrective commits onto `benchmark-current`.
10. **Benchmark amendment** — only path to promote innovation into Product Truth.

# 19. Commercial Release Gates

- **Technical readiness:** implemented scope is tested and green; Android release still needs
  CI compile + signing + physical-device OTP validation + B-04 production load run.
- **Commercial/Public readiness:** B-02 LLC — OPEN · B-03 PDPL sign-off — OPEN (more relevant
  now: consent/PII/panel surfaces exist) · B-04 — OPEN (tooling delivered, evidence pending).
- Technical ≠ commercial; nothing here claims public-launch readiness.

# 20. Final Recommendation

**PARTIALLY IMPLEMENTED — READY FOR NEXT GATE on the implemented scope.**

The innovation layer is correctly bounded, audited, tenant-isolated, and now conforms to the
authoritative decision set (including removal of the rejected shared panel). The Akedly V1.2
integration is verified conformant against official documentation — no SDK migration required.
Blocking items are all external decisions/gates, not code defects.
