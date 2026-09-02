# Founder Decisions Document (FDD) — Constitutional Source of Truth

**Title:** Tajribti Founder Decisions Document v1.0  
**Original Filename:** B 2.5-Tajribti_Founder_Decisions_Document_v1.0.docx  
**Original Location:** inbox/  
**Category:** Decisions  
**Version:** 1.0  
**Keywords:** founder decisions, business decisions, product decisions, technology decisions, UX, brand, operations, finance  

---

## Summary

The FDD is the constitutional source of truth for the Tajribti platform. Every strategic, product, technology, UX, brand, operational, and financial decision is documented here with binding authority over all downstream documents. When a document contradicts the FDD, the FDD governs.

---

## Executive Vision

| Element | Decision |
|---|---|
| Mission | Replace guesswork in product launches with real-time, consented consumer truth |
| Vision | Default consumer-intelligence layer in Egypt within 3 years; MENA within 5–7 |
| North Star | Verified, brand-actionable consumer data points per month |
| Long-term | MENA's largest permissioned FMCG/beauty/pharma consumer panel |
| Exit Option A | Strategic acquisition by NielsenIQ, Kantar, Circana, or MENA media group |
| Exit Option B | Sustained independent profitability as a regional data-services company |
| Rejected | Venture-style forced-exit timeline |

---

## Business Decisions

| Decision | Value |
|---|---|
| Target Market | FMCG, beauty, personal care, pharma-OTC brands in Egypt |
| Paying Customer | Brand marketing, innovation, consumer-insights teams |
| Non-Paying (data source) | Egyptian consumers aged 18–40 in Cairo, Giza, Alexandria |
| Ideal Customer | Mid-to-large FMCG/beauty brand, 3+ launches/year, existing sampling/research budget |
| Year 1 Geography | Cairo only |
| Year 2 Geography | Alexandria, Giza, New Cairo, 6th October |
| GCC Expansion Gate | Only after Egypt unit economics are proven — hard gate, not a calendar date |
| Out of Scope (Y1–3) | Healthcare, insurance, banking, telecom, government, education |
| Pricing Philosophy | Brands pay; consumers never pay. Price for value of data/insight, not headcount |
| Revenue Model | B2B hybrid: campaign fees + per-sample fees + AI dashboard subscription + panel access + Enterprise API |
| Monetization Motion | Land with single paid campaign → expand to subscription + repeat + panel |
| Funding Strategy | Capital-efficient, bootstrapped trajectory. Raise only to hit next milestone |

---

## Product Decisions

| Decision | Value |
|---|---|
| Core Product | Two-sided platform: consumer app + brand dashboard |
| MVP Scope | Admin dashboard, brand dashboard, consumer app, QR redemption, 3–5 question survey, basic analytics |
| NOT in MVP | Permanent kiosks, owned logistics, e-commerce, paid consumer subscriptions, non-FMCG verticals, GCC features |
| Future Modules | Gamification, referral system, AI insight narratives, predictive purchase-intent, retail media, Enterprise API, consumer panel marketplace |
| AI Strategy | AI = faster insight delivery, NOT the moat. Moat = proprietary data + brand relationships. Use third-party LLM APIs (OpenAI/Anthropic). Build proprietary fraud-detection only once real campaign data exists |
| Automation | Automate: campaign creation, segmentation, reward distribution, survey generation, invoicing, notifications, QR validation. Do NOT automate: brand relationship management, campaign strategy |
| MVP Integrations | WhatsApp Business API (notifications), Vodafone Cash + InstaPay (rewards), HubSpot/Salesforce (enterprise CRM), CSV/API export |

---

## Technology Decisions

| Decision | Value |
|---|---|
| Tech Philosophy | Boring, proven technology for core stack. Reserve novelty for AI/data layer only |
| Cloud | AWS, nearest data-residency-compliant region (UAE or Bahrain) — pending legal PDPL confirmation |
| Multi-cloud | No multi-cloud in Years 1–2 |
| Security | Privacy-by-design. Encrypt at rest and in transit. Minimum data collection. Consumer self-service deletion |
| Build | Sampling-to-survey-to-dashboard pipeline, fraud-detection layer, AI insight-narrative logic (once trainable) |
| Buy | Payments, cloud, LLM APIs, analytics/BI, CRM, monitoring |
| Open Source | Use freely (PostgreSQL, Redis, Kafka). Do NOT open-source Tajribti's own code or models |
| AI Providers | OpenAI and/or Anthropic — multi-provider to avoid single-vendor lock-in |
| Scalability | Stateless services, horizontal autoscaling, queue-based decoupling. Design for 10x current volume |

---

## UX Decisions

| Decision | Value |
|---|---|
| UX Philosophy | Friction is the enemy. Every unnecessary tap costs completed surveys |
| Accessibility | RTL-first, readable Arabic typography, lower-end Android support, graceful degradation on poor connectivity |
| Mobile Strategy | Mobile-first and mobile-only for consumers. Brand dashboard = desktop-web-first |
| Languages | Egyptian-dialect Arabic = default and primary. English = secondary toggle |
| Localization | NOT a translation layer — natively Egyptian from first release |

---

## Brand Decisions

| Decision | Value |
|---|---|
| Brand Positioning | "Egypt's Consumer Intelligence Platform" — never described as sampling company or coupon app |
| Brand Personality | Sharp, evidence-driven, trustworthy — "credible insider" |
| Tone (consumer) | Direct, plain-language, zero jargon |
| Tone (brand-facing) | Data-forward, precise |
| Visual Direction | Clean, modern, Arabic-typography-led. Not "startup gradient" aesthetics |
| Brand Values | Consent, speed, honesty, usefulness |
| Communication | Never oversell certainty in insights — always show sample size and confidence context |

---

## Operational Decisions

| Decision | Value |
|---|---|
| Company Structure | Egyptian LLC initially, converting to JSC as it scales |
| Remote vs. Office | Remote-first for engineering/product/data. In-person required for Ops/field and Sales |
| Support | In-app for consumers; dedicated CS contact for brand accounts. No phone support Y1 |
| CS Strategy | Proactive ROI reporting drives renewal — not reactive ticket-answering |
| Sales Strategy | Outbound-led, ~20 named accounts. Sell measurable results, not software. Land-and-expand |
| Marketing | Consumer-side = acquire data panel. Brand-side growth = case studies + referrals from Sales/CS |

---

## Founder Operational Resolution — 2026-08-23

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-048 | 2026-08-23 | TECH | RECORDED — OPTION B | Use the existing CI-based Flutter Android build and distribution path as the Flutter-first client artifact path; do not require a Founder-machine upgrade and do not amend DL-046 | Resolves CONFLICT-INTERNAL-C operationally while preserving the locked requirement that the first brand client sees Flutter | Founder authorization in the client-ready execution instruction |
| DL-052 | 2026-08-24 | PROD | LOCKED — BOUNDED EXCEPTION | BD-13 exception for exactly: (1) consumer app completion/UX polish, (2) new Executive Consumer Intelligence Report (extend existing, do not replace), (3) limited client/brand monitoring capability, (4) small directly-blocking real-pilot fixes only. Explicitly excludes website, self-service builders, rewards economics, media/gallery backend, generic admin/CRM, V2+. BD-13 resumes for everything else once this scope's work concludes. | Move from closed V0.5 toward commercial report readiness without reopening broad Track 1 engineering | Founder (explicit direction 2026-08-24, DL-051 pattern) |
| DL-053 | 2026-08-24 | TECH | LOCKED | Under DL-052 item 2: bilingual (EN/AR) AI narrative generation added (`AiReport.narrativeAr`); Report.tsx recommendation/finding language calibrated to hedge on sample size and stop presenting sample composition as market proof; verbatims minimum-quality gate added; Audience Profile intro conditioned on `campaign.isDemo`. See `workspace/15_Decisions/DECISION_LOG.md` Phase 5 for full detail and files. | Implements the three confirmed D-028 issues as the smallest safe change, extending rather than replacing the existing report | Claude Code (session, DL-052 authorized) |
| DL-054 | 2026-08-24 | PROD | LOCKED — BOUNDED EXCEPTION | BD-13 exception for a bounded V1 increment: (1) consumer polish where real gaps exist, (2) client campaign-history navigation via `?campaignId=` query param across existing dashboard pages (existing API, server-side ownership already enforced, no new routes/entities), (3) report improvements within the existing architecture only, (4) survey configuration audit — rendering already fully data-driven, analytics role-mapping (q2/q3/q5) documented as a deferred schema dependency, not built. Excludes website, self-service builders, rewards, media backend, admin/CRM, V2+. See `DECISION_LOG.md` Phase 6. | Founder issued this bounded exception directly (DL-051/DL-052 pattern) to continue commercial product work incrementally | Founder (explicit direction 2026-08-24) |
| DL-056 | 2026-08-26 | TECH | LOCKED | D-028 CLOSURE: R1–R9 review of current report source found R1/R2/R3/R4/R5/R7/R9 already resolved in code; R6 (pagination — a near-blank trailing page for small content slivers, reproducing the original "page 4 almost blank" complaint) found still broken and fixed (`Report.tsx`, verified via clean typecheck + build); R8 (per-study adaptability) confirmed partially supported and explicitly deferred, non-blocking. D-028 recorded CLOSED — accepted with this one documented non-blocking deferment. See `DECISION_LOG.md` Phase 8. | Founder explicitly instructed closing this loop via evidence-based review; the only real remaining gap was small, bounded, and directly traceable to the original complaint, so it was fixed and verified rather than left open | Founder (explicit direction 2026-08-26) |
| DL-055 | 2026-08-26 | PROD | LOCKED — BOUNDED EXCEPTION | BD-13 exception for exactly two coordinated Tajribti-internal workstreams: (1) Internal Tajribti Campaign Operations (bounded internal-operations surface, not brand self-service — campaign list/detail/creation/status/dates/brand association/QR-access/participation visibility/report access, using only the existing campaign domain/API), (2) Campaign-oriented Media/Gallery (Gallery → Campaign → Photos/Videos, reusing existing infrastructure or implementing only the smallest architecture required). Explicitly excludes generic Admin/CRM, self-service Survey/Campaign/Report Builder, billing/payments, enterprise RBAC, social feed/marketplace features, website, rewards economics, and broad V1. Not broad V1 authorization. See `DECISION_LOG.md` Phase 7. | Formalizes the two remaining Founder-identified product-completion gaps (previously TACIT/UNFORMALIZED per the 2026-08-26 Decision Reconciliation), following the DL-051/052/054 bounded-exception pattern | Founder (explicit direction 2026-08-26, DL-051/052/054 pattern) |
| DL-057 | 2026-08-27 | PROD | LOCKED | FOUNDER MOBILE REQUEST LOCK: Discovery-First Home, Campaign discovery/detail/participation, Profile, Settings, Activity (= Mobile Past Campaigns — already satisfies this request under its existing name), and Services/About are CONFIRMED COMPLETE in `apps/consumer` and must not be rebuilt/redesigned absent a verified defect or explicit Founder change request. Media/Gallery remains REQUESTED BUT DEFERRED (governed by DL-055's existing scope, not this decision). Reporting: the existing Brand/Client reporting capability (Dashboard analytics/report/PDF/AI-summary) remains the current reporting surface; "Reports" was NOT separately established as a confirmed Consumer Mobile requirement, so a distinct Consumer Mobile Reports screen is NOT authorized by this decision, is not treated as missing/blocking, and does not require a further Founder decision. Website/Dashboard/Admin/Web Campaign Management remain explicitly out of scope for all Mobile work. See `DECISION_LOG.md` Phase 9. | Persists the Founder's Mobile product boundary so future sessions do not re-audit or rebuild already-complete Mobile screens, do not mistake the existing Activity screen's naming for a missing Past Campaigns capability, and do not over-read "Reports" as a confirmed Mobile requirement beyond the existing Brand/Client reporting capability. | Founder (explicit direction 2026-08-27; corrected same-session before commit) |
| — | — | — | NOTE | **Governance gap, not a decision**: DL-058 through DL-081, and separately DL-085/DL-086, were/are recorded only in `DECISION_LOG.md` and were never mirrored into this constitutional table. That is the concrete mechanism behind the "V1 SHIPPED" vs. "Track 1 not authorized" contradiction this session's governance reconciliation pass found and reported. Not backfilled here — out of this pass's scope — but flagged transparently rather than silently continued. See `DECISION_LOG.md` for the full DL-058–087 record. | — | — |
| DL-082 | 2026-09-01 | BIZ | LOCKED | B-01 TRACK 0 GO DECISION: the Project Director/Founder formally authorizes progression from the Track 0 GO/NO-GO decision gate (`OPEN_DECISIONS_TRACKER.md` B-01), effective 2026-09-01. This closes B-01 specifically and only — it does NOT close, and must never be read as evidence toward, B-02 (Egyptian LLC incorporation), B-03 (PDPL legal sign-off), or B-04 (QR concurrency load test), each of which remains independently gated on its own documented evidence. Track 1 / broad V1 engineering remains GATED as a whole until every one of B-01/B-02/B-03/B-04 is independently closed; B-01 closing alone does not authorize it. The prior OPEN status of B-01 (recorded 2026-07) is preserved as history, not deleted or rewritten. | A governance reconciliation pass (2026-09-01) found the repository internally contradictory — extensive engineering work (DL-058–081) had already occurred under Founder-authorized bounded exceptions while B-01–B-04 remained formally open — and required the Project Director to either authorize B-01 explicitly or leave the contradiction unresolved. This decision resolves it explicitly, on the record, without retroactively authorizing prior work or misrepresenting B-02/B-03/B-04 as closed. | Founder / Project Director (explicit direction, this session, dated 2026-09-01) |
| DL-083 | 2026-09-01 | TECH | LOCKED | B-04 QR CONCURRENCY LOAD TEST — REMEDIATED, GATE STILL OPEN ON ONE CRITERION: full detail in `DECISION_LOG.md` (same ID) and `16_Reports/B04_QR_CONCURRENCY_LOAD_TEST_2026-09-01.md`. Summary: a real duplicate-issuance race condition (RISK_REGISTER.md R-TECH-01) was found, fixed (partial unique DB index + service-layer handling), and verified via local load test against the real HTTP redemption path. The documented "<1s response time" criterion (MASTER_DELIVERY_PLAN.md TJ-005) is not yet met at the tested concurrency (hundreds of consumers) despite a connection-pool-size fix; B-04 therefore remains OPEN, not closed. | Evidence-based gate discipline: report the real defect found and fixed, and the real remaining gap, rather than declaring the gate closed on a partial result. | Founder / Project Director (explicit direction, this session, dated 2026-09-01) / Claude Code (session) |
| DL-084 | 2026-09-01 | TECH | LOCKED | B-04 FINAL CLOSURE ATTEMPT — STILL OPEN. Full detail in `DECISION_LOG.md` (same ID) and `16_Reports/B04_QR_CONCURRENCY_LOAD_TEST_2026-09-01.md`'s "Follow-on pass" section. Summary: production migration attempted via `railway run` (no real network bridge — confirmed) and `railway ssh` (blocked on no registered SSH key; generating one declined as out of scope) — NOT applied to production. Found and fixed one further evidence-backed performance issue in `enterCampaignWeb()` (3 independent DB reads parallelized). 3 test rounds run (this pass's limit): best result p95 1634ms, a genuine ~22% improvement over the prior pass, but still over the documented <1s target; a later round was confounded by severe unrelated host load (`uptime` load average 185.89), reported honestly rather than hidden or re-run indefinitely. Correctness held in every round (zero duplicate redemptions). B-04 remains OPEN: performance criterion not met, migration not yet live in production. | Evidence-based gate discipline continued: a real, measured improvement that remains insufficient is reported as insufficient, not rounded up to closed; an environmental confound is disclosed rather than used to inflate or hide the result; a precise operational blocker (no viable production network path, SSH key generation declined) is recorded rather than worked around. | Founder / Project Director (explicit direction, this session, dated 2026-09-01) / Claude Code (session) |
| DL-087 | 2026-09-02 | PROD | LOCKED | **FOUNDER RULINGS W-1/W-2**: (1) **W-1 — YES**, Company Employees are real authenticated TAJRIBTI users — a new `CompanyEmployee` identity (self-registration via an existing Company + that Company's own employee code, or Admin-direct creation), distinct from the unchanged non-authenticated `BrandContact`. (2) **W-2 — YES**, TAJRIBTI has a real Admin Control Center — a new `AdminUser` identity/login, with the legacy `x-admin-secret` kept only as a migration/bootstrap mechanism, plus a Company → Campaigns → Selected Campaign → Participants/Insights/Report navigation surface for cross-Company operators. Full implementation detail, verification evidence, and explicitly-deferred items (Mobile employee UI, campaign-ownership NOT-NULL enforcement, campaign approval workflow) in `DECISION_LOG.md` DL-087. | Resolves the two Wrong-Build Findings (W-1, W-2) the same-day `REFERENCE_BLUEPRINT_TAJRIBTI_RECONCILIATION_2026-09-02.md` reconciliation surfaced and explicitly left for Founder ruling rather than silently resolving. | Founder / Project Director (explicit direction, this session, dated 2026-09-02) / Claude Code (session) |
| DL-088 | 2026-09-02 | PROD | LOCKED | **POST-W-1/W-2 HARDENING + EMPLOYEE MOBILE**: independent adversarial-style re-verification of DL-087 (Company isolation, Admin authorization, revoke-immediacy, report isolation, ~35-campaign pagination/search/filter scale) found zero defects — every test matched expectation, no backend code changed. **Employee Mobile V1 implemented** as an additive extension to the existing Flutter app (new, separate `employee_*` session/API-client files + 3 new screens under `screens/employee/`, wired via 3 new routes and one small entry-point link on `AuthChoiceScreen` — 29 lines added, 0 removed, in the only 2 existing files touched), reusing existing backend endpoints with zero new API surface. Full detail, including the disclosed local Flutter/Dart VM limitation (unchanged from DL-085/086, not attempted around) and how correctness was verified without it, in `DECISION_LOG.md` DL-088. | Directly executes the Founder's instruction to verify rather than trust the DL-087 report, and to complete Employee Mobile now that it was determined to be safely additive rather than requiring a stop-at-boundary. | Founder / Project Director (explicit direction, this session, dated 2026-09-02) / Claude Code (session) |
| DL-089 | 2026-09-02 | PROD | LOCKED | **PRODUCT COMPLETION WAVE**: fixed the real upstream cause of the Founder's Survey Results observation — `analytics.service.ts` never computed q1 ("first impression")/q4 ("compared to similar products") despite both existing on every campaign's default survey since inception; now computed and rendered in the Company Console, the Report, and the Admin Control Center. Added the missing Admin UI operations for Company creation/edit (API already existed; UI didn't) without weakening "Companies are created ONLY by TAJRIBTI Admin." Applied the pending `1788400000000` migration to production (discovered missing while verifying the DL-087/088 deploy), which also applied the long-pending B-04 race-condition-fix migration as a direct side effect. Full detail in `DECISION_LOG.md` DL-089. | Addresses concrete Founder acceptance-testing findings, not a redesign; closes a real data-visibility gap and a real production-migration gap discovered in the course of verification. | Founder / Project Director (explicit direction, this session, dated 2026-09-02) / Claude Code (session) |
| DL-090 | 2026-09-02 | PROD | LOCKED | **REFERENCE PRODUCT BENCHMARK ALIGNMENT**: new `workspace/03_Research/REFERENCE_PRODUCT_BENCHMARK.md` registered (supplemental, does not override FDD/PRD/Technical Architecture). Implemented its two concretely-evidenced gaps: Admin can now operate campaigns (`PATCH /admin/campaigns/:id` — launch/pause/complete/archive/edit, same lifecycle/validation the Company owner already uses, no new state machine), and `campaign.brandAccountId` is now enforced `NOT NULL` (both local and production independently verified at 0 nulls before enforcing). Declined items requiring new data models (funnel/drop-off tracking, source attribution, audience/segment objects) or a change to tested commercial behavior (campaign-creation default status) without further Founder sign-off. Full detail in `DECISION_LOG.md` DL-090, including a repository-housekeeping note on reconciling a genuine branch divergence between `sprint/pilot-readiness-mvp` and `origin/main`. | Closes the one reasoning gap the benchmark itself identified (Admin read-only was an unexamined assumption, not a Founder decision) and a now-evidence-backed data-integrity invariant, without inventing scope. | Founder / Project Director (explicit direction, this session, dated 2026-09-02) / Claude Code (session) |
| DL-091 | 2026-09-02 | PROD | LOCKED | **POST-DL-090 FOUNDER PRODUCTION QA**: fixed the real cause of two Founder-reported Company Console defects — "Details & QR" and "Media" both blanked to a misleading error/empty-state message whenever an unrelated *secondary* network call (QR image / media list) failed after the campaign itself had already loaded successfully, because both pages checked one shared error state before checking whether a campaign was actually loaded. Decoupled the calls in both pages so the campaign now always renders once resolved, with any secondary failure shown as a scoped, retryable message instead of blanking the page. Root cause traced with real local HTTP requests replaying the Founder's exact Employee-login flow end-to-end (signup → create campaign → list → QR → media, all 200) — no backend/permission defect found; the failure was a transient production condition the frontend turned into a misleading message. Also re-verified, not changed: the Employee permission model (DL-087's explicit "same access as owner" design still holds) and the same-email-across-contexts question (four independent auth tables, no cross-contamination — expected test overlap from the Founder using one email for every login mode). Full detail in `DECISION_LOG.md` DL-091. | Traces the Founder's fresh production evidence to its actual mechanism instead of guessing at a permission cause, and confirms two already-settled decisions are still correctly in force rather than re-litigating them. | Founder / Project Director (explicit direction, this session, dated 2026-09-02) / Claude Code (session) |
| DL-092 | 2026-09-02 | PROD | LOCKED | **FULL REFERENCE BENCHMARK ALIGNMENT PASS**: re-mapped all 23 requested phases against the benchmark and the current implementation; DL-085–091 (all earlier the same day) had already implemented or reasoned-ly declined nearly all of it, so this pass found and shipped two genuine remaining gaps rather than re-doing that work — a client-side, backend-free "NEEDS ATTENTION" badge on both the Admin and Company campaign lists for an `active` campaign whose `endDate` has already passed (already closed to participation server-side; nothing surfaced that to the owner before). Confirmed already benchmark-compliant, unchanged: Report Methodology/Limitations sections, Admin's paginated/searchable campaign pipeline, the Employee permission model. Per this task's own priority rule ("a locked Founder Decision wins over the benchmark" / "isolate and report a genuine new business decision, don't guess"), three items were correctly NOT implemented rather than guessed: the Configure→Review→Launch campaign lifecycle/wizard (directly conflicts with DL-090, LOCKED the same day); campaign-level audience/eligibility targeting (a real PRD-cited, P0 gap — Consumer age/gender/city is captured "for campaign targeting" but never used — but enforcing it means deciding who gets excluded from an active pilot, a genuine business-risk decision no document answers); and an in-app consumer support contact (FDD-required but genuinely absent, and no real support channel/identity exists anywhere in the repository to point to — inventing one would mislead real consumers). Full detail in `DECISION_LOG.md` DL-092. | Follows the task's own explicit instruction to let a locked Founder Decision override the benchmark and to isolate rather than guess at a genuine new business decision, while still shipping the real, safe, evidence-backed gaps that survived that filter. | Founder / Project Director (explicit direction, this session, dated 2026-09-02) / Claude Code (session) |

## Open Decisions (Unresolved as of Audit)

1. Final legal company name and trademark/domain clearance
2. Whether CEO doubles as PM through Year 1 or a dedicated PM is hired on GO
3. Final cloud hosting region (provisionally AWS me-south-1 Bahrain — see Remediation doc)
4. Whether external funding is sought or company remains bootstrapped
5. Exact revenue-mix percentages (pending validation-sprint findings)

---

## Related Documents

- [[B 2 — Master Execution Blueprint]] → `01_Project_Overview/PROJECT_OVERVIEW.md`
- [[B 3 — Master PRD]] → `08_PRD/`
- [[B 4 — Technical Architecture]] → `09_Technical/`
- [[B 6 — Readiness Audit]] → `13_Audits/READINESS_AUDIT.md`
