# TAJRIBTI — FOUNDER INNOVATION MASTER REGISTER
## OFD-01 … OFD-20 — Decision Register
### Date: 2026-09-20 · Baseline: 45aa571 · Status: ACTIVE FOUNDER INNOVATION INPUT

> **SUPERSESSION NOTE (2026-09-20):** OFD-14 is superseded by the later Founder
> decision of 2026-09-20 — consumers receive NO push notifications. All
> push routes/UI were removed; `CampaignNotificationRequest` and
> `Consumer.push*` remain as dormant schema artifacts only. See
> `reports/TAJRIBTI_MASTER_PRODUCT_FORENSIC_REVIEW_2026-09-20.md` §V.

**Authority:** Founder-approved directions issued 2026-09-20. These decisions govern the Founder
Innovation layer only. `governance/REFERENCE_PRODUCT_BENCHMARK.md` remains immutable Product Truth
for the existing product (OFD-11). No Benchmark amendment is authorized.

Legend: BENCHMARK TRUTH = required by Benchmark · FOUNDER INNOVATION = this register ·
IMPLEMENTATION EVIDENCE = verified in code · FUTURE CANDIDATE = deferred · OPEN DEPENDENCY = gate.

| ID | Decision | Scope | Benchmark Relationship | Implementation Impact | Privacy/Legal | Dependency | Release Impact | Status |
|---|---|---|---|---|---|---|---|---|
| OFD-01 | Innovation First (sequencing) | Innovation spec/guardrails precede Final Mobile Release | None | Ordering only | — | None | Android release held until innovation scope reconciled | REGISTERED |
| OFD-02 | REJECT rewards/wallet/points | None — nothing implemented | Benchmark exclusion stands | None | — | — | — | REGISTERED — NOT IMPLEMENTED |
| OFD-03 | APPROVED — AI Narrative (evidence-grounded, EN/AR) | Narrative layer over persisted campaign evidence only; no fabrication, no invented causality/statistics/sentiment/themes; observed evidence vs interpretation distinguished | Benchmark §6 evidence/interpretation separation governs; "advanced AI narratives beyond supported evidence" exclusion is met by grounding every sentence in persisted data | `lib/narrative.ts` (deterministic bilingual composition) + `narrative` field on report | None beyond existing report data | None | Additive to report | APPROVED — IMPLEMENTED (deterministic, no LLM dependency) |
| OFD-04 | APPROVED — 8 Study Types: Concept Testing, Pricing, Packaging, Claims, Advertising/Message, Brand, U&A Expansion, Segmentation | Catalog entries + methodology spec per type | Study-type layer = existing Founder-approved extension; new types are Innovation-layer additions | `studyTemplates.ts` +8 entries honoring 1×RATING_1_5 + 1×PURCHASE_INTENT_1_5 constraint | — | Spec §D defines methodology per type | Catalog-visible | APPROVED — IMPLEMENTED (catalog) |
| OFD-05 | APPROVED — Price/Pack/Claims structured fields | `Product.priceRange`, `Product.packSize`, `Product.claims` (JSON list) | Benchmark-silent → Innovation-layer optional metadata | Schema (additive) + product create/update + display | — | OFD-04 Pricing/Packaging/Claims templates reference these | Additive | APPROVED — IMPLEMENTED |
| OFD-06 | APPROVED — Advanced Intelligence: A Segmentation, B Sentiment, C Themes, D Predictive/Statistical | Descriptive + clearly-labeled derived layer; methodology stated per capability | §6/§7 discipline preserved; derived output labeled derived | `lib/intelligence.ts` + `/campaigns/:id/intelligence` (company+ops) | Small-cell suppression (min n=5) on segment outputs | None | Additive endpoint | APPROVED — IMPLEMENTED (segmentation, themes, lexicon sentiment, Wilson CI descriptive stats; true prediction NOT implemented — no defensible model) |
| OFD-07 | APPROVED — Beauty (first non-FMCG); Healthcare/Electronics/Services future-only | `Company.industry` accepts "Beauty"; beauty study type already exists | Benchmark exclusion overridden for Beauty only by this decision | Validation/doc; no new machinery | — | — | — | APPROVED — IMPLEMENTED (industry value documented; existing beauty template) |
| OFD-08 | APPROVED — Account/platform governance: Platform Admin Console, multiple Ops roles, multiple Company roles, Consumer persistent account, Ops visibility = role-based + explicit assignment, strict tenant isolation, Admin may access consumer PII (audited) | Role model + audit; role names are Innovation-layer spec (not Benchmark truth) | §8 leaves permissions to Founder decisions — this decision supplies them | `OpsUser.role`, `Employee.role`, `AccessAuditEvent`, ops-user management, PII-access audit | PII access traceability = core requirement | Audit model | Additive | APPROVED — IMPLEMENTED (minimal viable roles, see Spec §H–L) |
| OFD-09 | Android final release first; iOS after Android acceptance | Android release requirements, device/Akedly/production validation, signing | — | CI workflow exists; signing/device validation are external gates | — | CURRENT_API_BASE (set), keystore, device | Release gate | REGISTERED — Android gate partially external (see final report) |
| OFD-10 | Akedly Flutter SDK: compatibility check FIRST | Read-only assessment | — | None | — | — | — | COMPLETE — see `reports/TAJRIBTI_AKEDLY_FLUTTER_COMPATIBILITY_2026-09-20.md` — verdict: INCOMPATIBLE, keep current implementation |
| OFD-11 | APPROVED — Benchmark immutable | No action | Governs everything | None | — | — | — | REGISTERED — enforced |
| OFD-12 | APPROVED — Campaign media/gallery | `CampaignMedia` URL-referenced assets (product/packaging/campaign/creative images) | §4 "Product / Assets" supports; media is Innovation-layer | Model + company CRUD + ops visibility | Content moderation noted | — | Additive | APPROVED — IMPLEMENTED (URL-referenced; no binary storage this pass) |
| OFD-13 | APPROVED — PDF report export EN/AR + RTL | Print-ready bilingual report view (EN/AR, `dir=rtl` Arabic block) + browser print→PDF | §7 report model preserved — additive export | Narrative block renders EN + AR (dir="rtl"); `@media print` stylesheet on company report view | — | — | Additive | APPROVED — IMPLEMENTED (print-view export path; server-side binary PDF deferred as technical-only) |
| OFD-14 | APPROVED — Mobile push only; Company requests → Operations launches; explicit consumer opt-in; NO lifecycle notification system; NO WhatsApp/SMS | Consent + request/launch records; delivery provider pending | Benchmark push exclusion overridden for this bounded scope by Founder | `pushOptIn`/`pushToken` on Consumer, `CampaignNotificationRequest`, ops launch endpoint | Explicit opt-in + opt-out mandatory | FCM/provider credentials = OPEN DEPENDENCY | Mobile toggle pending | APPROVED — IMPLEMENTED at data+consent+workflow level; actual push delivery BLOCKED — requires provider config (OPEN DEPENDENCY) |
| OFD-15 | APPROVED — Consumer panel: persistent identity + opt-in (15A), same-company cross-campaign intelligence (15B), shared opt-in panel (15C); marketplace = future only (15D) | Opt-in flag; company-scoped cross-campaign aggregates; never cross-company | §10 isolation preserved — cross-campaign limited to same company, opted-in consumers only | `Consumer.panelOptIn`, `/company/panel-insights`, `/ops/panel` | PDPL: consent recorded, opt-out, small-cell suppression (min n=5), no cross-company PII | B-03 legal sign-off (commercial gate) | Additive | APPROVED — IMPLEMENTED (opt-in + same-company aggregation + suppression; marketplace NOT implemented) |
| OFD-16 | REJECT — Demo Campaign Mode | None | — | None | — | — | — | REGISTERED — NOT IMPLEMENTED |
| OFD-17 | APPROVED — Public website expansion | `web/public/index.html` sections: what/how/companies/consumers/study types/intelligence/CTA/trust | §9 "corporate website" never an operational surface — marketing only | Static content | Legal/trust section is copy-level, not legal sign-off | — | Additive | APPROVED — IMPLEMENTED |
| OFD-18 | APPROVED w/ safety — folder consolidation after uniqueness verification | Verify-only this pass | — | None | — | — | — | EXECUTED (verification report in final report) — NO DELETIONS (uniqueness not fully provable for all folders) |
| OFD-19 | Question edit/delete: Company requests → Operations performs; lifecycle-governed; full audit trail | `QuestionChangeRequest` + `QuestionAuditEvent` (what/prev/new/requester/performer/when/campaign/lifecycle state) | §10 Survey Builder identity/history preserved; locked-campaign edits previously impossible — now governed | Models + company request routes + ops apply/reject + audit on direct edits too | — | Lifecycle states = existing 5 (no new states invented) | Additive | APPROVED — IMPLEMENTED |
| OFD-20 | Technical release ≠ commercial release; B-02/B-03/B-04 tracked, not claimed closed | Current-stack B-04 load validation designed (`api/scripts/load-test-qr.ts`) | — | Load-test script added | — | Legal gates external | Gate tracking only | REGISTERED — gates remain OPEN (B-02 LLC, B-03 PDPL, B-04 write-path at production scale) |

## Not implemented (explicit exclusions honored)

Rewards/wallet/points (OFD-02) · Demo mode (OFD-16) · Healthcare/Electronics/Services (OFD-07 future) ·
Panel Marketplace (OFD-15D future) · Cross-company intelligence (never) · WhatsApp/SMS notifications
(OFD-14) · lifecycle notification automation (OFD-14D) · iOS build (OFD-09 sequencing) · binary media
upload storage · true predictive models (no defensible methodology yet) · real push delivery (provider
dependency).
