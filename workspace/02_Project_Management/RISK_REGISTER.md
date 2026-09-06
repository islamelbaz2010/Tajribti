# Risk Register — Tajribti Consumer Intelligence Platform

**Format:** Living document — update status as risks materialize, are mitigated, or are retired.  
**Owner:** Founder  
**Last updated:** 2026-07-27  
**Scoring:** Likelihood × Impact (both 1–5). Score ≥ 12 = HIGH. Score 6–11 = MEDIUM. Score ≤ 5 = LOW.

---

## Risk Summary Dashboard

| Category | HIGH | MEDIUM | LOW | Total |
|---|---|---|---|---|
| Legal / Compliance | 2 | 1 | 0 | 3 |
| Financial | 2 | 1 | 0 | 3 |
| Market | 1 | 3 | 1 | 5 |
| Technical | 1 | 3 | 1 | 5 |
| Operational | 0 | 3 | 1 | 4 |
| **Total** | **6** | **11** | **3** | **20** |

---

## Scoring Key

| Score | Rating | Action required |
|---|---|---|
| 15–25 | CRITICAL | Immediate action; track weekly |
| 9–14 | HIGH | Active mitigation plan; track sprint-by-sprint |
| 4–8 | MEDIUM | Monitor; document mitigation |
| 1–3 | LOW | Note; review quarterly |

---

## Legal / Compliance Risks

| ID | Risk | L | I | Score | Rating | Mitigation | Contingency | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-LC-01 | **PDPL non-compliance** — Platform collects demographic + behavioral + location data without written legal opinion. Launching without PDPL sign-off exposes platform to regulatory action. | 4 | 5 | **20** | CRITICAL | Engage qualified Egyptian data-privacy lawyer in Sprint 0. Do not collect any user data before written scope opinion. Privacy-by-design: minimum data collection, consent-first, soft-delete. | Delay launch until sign-off obtained. This is a gate, not a risk to accept. | Founder / Legal Counsel | **OPEN — B-03 blocking** |
| R-LC-02 | **Egyptian LLC not incorporated** — Vendor contracts in Sprint 0 (SMS provider, WhatsApp BSP, payment providers) cannot be signed without a legal entity. | 3 | 5 | **15** | CRITICAL | Incorporate Egyptian LLC before Sprint 0 vendor contract phase. Set formation deadline. | Extend Sprint 0 timeline until entity is confirmed. | Founder | **OPEN — B-02 blocking** |
| R-LC-03 | **Provisional name conflict** — "Tajribti" may conflict with existing Egyptian or MENA trademarks / domains. Late discovery means rebrand cost after brand assets are produced. | 2 | 4 | **8** | MEDIUM | Complete trademark and domain clearance search before producing brand assets, domain purchases, or code repository names. | Rebrand to cleared name. All docs already carry provisional name disclaimer. | Founder / Legal | OPEN |

---

## Financial Risks

| ID | Risk | L | I | Score | Rating | Mitigation | Contingency | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-FIN-01 | **Track 0 NO-GO** — Commercial validation sprint concludes that brands will not pay, or unit economics do not support the business model. Entire Track 1 plan is contingent on GO. | 2 | 5 | **10** | HIGH | Run Track 0 rigorously. Target minimum 3 brand LOIs before declaring GO. Define and enforce a kill criterion: if <3 LOIs in 60 days, do not proceed. | Pivot concept, adjust pricing, or suspend the project. Sunk cost = documentation only; no engineering spent. | Founder / IC | **OPEN — B-01 blocking** |
| R-FIN-02 | **Zero validated willingness-to-pay** — ALL revenue figures ($4K–$20K/campaign) are illustrative. No brand has committed to pay. | 4 | 5 | **20** | CRITICAL | Track 0 sprint objective: secure real brand LOIs with indicative pricing. Do not project financial returns until at least 3 paying brands are confirmed. | Adjust pricing model based on validation sprint findings. | Founder | OPEN |
| R-FIN-03 | **Funding runway** — If Track 0 GO is confirmed and Track 1 authorized, runway must sustain 24-week MVP build. Without external funding, this requires sufficient founder capital or early brand revenue. | 3 | 4 | **12** | HIGH | Model burn rate before GO. Identify exact funding source (bootstrap / angel / pre-seed) before authorizing Track 1. Minimum hiring model = 2 engineers + Ops + Sales on GO. | Reduce MVP scope, extend timeline, or raise small pre-seed before Track 1. | Founder | OPEN |

---

## Market Risks

| ID | Risk | L | I | Score | Rating | Mitigation | Contingency | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-MKT-01 | **Marketeers Research competitive response** — Near-direct competitor (Smart Value™ FMCG analytics) could launch a sampling execution layer, eliminating the product gap Tajribti exploits. | 3 | 4 | **12** | HIGH | Differentiate on physical-sample + behavioral data combination (Marketeers is digital analytics only). Move fast on brand relationships. Track Marketeers product announcements. | Sharpen data-depth positioning. Compete on Egypt-specific insights quality, not reach. | Founder | OPEN |
| R-MKT-02 | **Consumer adoption** — Egyptian consumers may not participate consistently, especially for low-value or unfamiliar products. Panel attrition reduces data quality below minimum thresholds. | 3 | 4 | **12** | HIGH | Partner only with high-demand FMCG brands for first campaigns. Optimize redemption UX to <3 minutes. Gamification layer post-MVP. Referral program for panel growth. | Adjust reward model; increase sample value; target higher-engagement consumer segments. | Founder | OPEN |
| R-MKT-03 | **Brand B2B sales cycle** — FMCG brand procurement cycles are typically 3–6 months from first conversation to signed contract. May delay first revenue beyond Sprint 1. | 4 | 3 | **12** | HIGH | Begin outreach in Sprint 0 (commercial validation). 14-brand target list identified. Personal relationship selling, not inbound. Set realistic pipeline assumptions in financial model. | Negotiate faster POC agreements. Offer smaller pilot campaigns to shorten approval cycle. | Founder | OPEN |
| R-MKT-04 | **Samplia model not validated in MENA** — Reference company is Spanish. Egypt FMCG market dynamics, consumer behavior, and brand procurement differ materially. | 3 | 3 | **9** | HIGH | Track 0 is the localization validation. Do not assume Samplia's metrics apply directly. Localize pricing, product selection criteria, and consumer experience before projecting metrics. | Extend Track 0, adjust model, or narrow initial offering. | Founder | OPEN |
| R-MKT-05 | **Non-FMCG category expansion premature** — Risk of scope creep into verticals (pharma-OTC, beauty) before FMCG model is proven. | 2 | 2 | **4** | LOW | FDD explicitly restricts Y1 to FMCG. Beauty and pharma-OTC are Y2/Y3 expansion gates. Enforce this in product and sales planning. | Defer any non-FMCG discussions to post-Cairo validation. | Founder | MONITORED |

---

## Technical Risks

| ID | Risk | L | I | Score | Rating | Mitigation | Contingency | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-TECH-01 | **QR concurrency race condition** — At a physical sampling event, hundreds of consumers may scan simultaneously. Race condition on redemption creates risk of duplicate sample issuance or system overload. This is the highest-identified technical risk. | 2 | 5 | **10** | HIGH | ~~Optimistic locking on QRCode entity.~~ **Load tested 2026-09-01, two passes** (`16_Reports/B04_QR_CONCURRENCY_LOAD_TEST_2026-09-01.md`, DL-083/DL-084) — proved the DB-level unique constraint this row previously claimed already existed did NOT exist (50 concurrent same-consumer redemptions produced 50 duplicate rows). **Fixed and CLOSED**: partial unique index on `(consumer_id, campaign_id) WHERE is_demo_seed=false` (migration `1788200000000-AddRedemptionUniqueConstraint`, not yet applied to production — see B-04) + service-layer handling in `qr.service.ts` — re-verified across every test round of both passes: 50 concurrent requests always produce exactly 1 row. **Duplicate-issuance sub-risk: CLOSED.** System-overload/response-time sub-risk: **NOT closed** — DL-084 additionally parallelized 3 independent DB reads (best clean result p95 1634ms, down from DL-083's ≈2.1s) and confirmed via diagnostic that pool size (kept at 20) is no longer the limiting factor, but every measured attempt still exceeds the documented <1s target; one re-test was confounded by severe unrelated host load and is reported as inconclusive rather than a regression. | Fallback: offline QR validation with sync. Reduce maximum concurrent redemptions per location per hour. | CTO (not yet hired) | **OPEN — B-04 remediated twice, gate not closed (response-time criterion unmet; production migration also not yet applied)** |
| R-TECH-02 | **Modular monolith boundary erosion** — As team grows, module boundaries may be violated (direct DB access across modules, shared state). Erosion makes future microservice extraction expensive. | 3 | 3 | **9** | HIGH | Define and enforce module contracts in code review. NestJS module system provides natural enforcement. Architecture review every sprint. | Extract offending code to proper module. If boundaries are severely eroded, accept extraction cost. | CTO | OPEN |
| R-TECH-03 | **AWS Bahrain PDPL confirmation** — If legal review confirms AWS Bahrain does not satisfy Egyptian PDPL data residency, a mid-build infrastructure migration is required — worst possible timing. | 2 | 5 | **10** | HIGH | Resolve cloud region in Sprint 0 (as part of PDPL legal review). Do not stand up production infrastructure before PDPL sign-off. Terraform IaC makes region migration more tractable. | Migrate to UAE or local Egypt DC (Nile Online/Telecom Egypt). Terraform reduces migration cost. | Founder + Legal | OPEN |
| R-TECH-04 | **Database partition activation not owned** — Schema is partition-ready, but activation trigger is unowned. If growth hits partition threshold during active campaigns, unplanned migration is required. | 2 | 3 | **6** | MEDIUM | Assign explicit database scaling owner (CTO/DBA on hire). Set activation thresholds in runbooks before beta. | Emergency partition activation during maintenance window. Redis caching mitigates read pressure. | CTO | OPEN |
| R-TECH-05 | **Third-party LLM API outage** — OpenAI or Anthropic service disruption disables AI insight narrative layer. | 2 | 2 | **4** | LOW | Multi-provider strategy (OpenAI + Anthropic) means one outage degrades, not disables. AI narratives are enhancement layer, not core transaction path. | Fallback to template-based narrative generation. Core QR + survey + analytics unaffected. | CTO | MONITORED |

---

## Operational Risks

| ID | Risk | L | I | Score | Rating | Mitigation | Contingency | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-OPS-01 | **Single-founder execution** — All strategy, sales, product, and operational decisions concentrated in one person. Illness, burnout, or unexpected absence could halt the project. | 3 | 4 | **12** | HIGH | Systematic documentation in this workspace mitigates key-person knowledge risk. Hire CTO as co-executor as first Track 1 hire. Clear decision log enables continuity. | CTO takes operational lead. Workspace serves as institutional memory. | Founder | MONITORED |
| R-OPS-02 | **Field operations complexity** — Physical sampling events require logistics, field coordinators, product storage, QR activation. Underestimating operational complexity is a common cause of consumer platform failure. | 3 | 3 | **9** | HIGH | Outsource physical logistics to established Egypt sampling/events agencies for first campaigns. Hire Ops Manager Sprint 1. No owned warehouse or full-time field staff in Y1. | Reduce campaign scale. Use agency-managed events model through Y1. | Ops Manager (not yet hired) | OPEN |
| R-OPS-03 | **Payment provider integration** — Vodafone Cash and InstaPay integrations may have undocumented edge cases, delayed approval processes, or limited API documentation. | 3 | 3 | **9** | HIGH | Begin payment provider engagement in Sprint 0. Obtain API access and test in dev environment before committing to payment flow in PRD. | Use physical voucher or gift card fulfillment as fallback pending digital integration. | CTO | OPEN |
| R-OPS-04 | **Restore drills not executed** — 4-hour RTO / 1-hour RPO targets set; quarterly restore drills required but not yet executed. | 2 | 2 | **4** | LOW | Schedule first restore drill in Sprint 2 environment. Add drill completion as beta gate criteria. | Manual restore from last RDS snapshot. | CTO | OPEN |

---

## Risk Retirement Log

*Record risks that have been formally closed or retired here.*

| ID | Risk | Closed Date | Resolution |
|---|---|---|---|
| — | No risks retired yet | — | — |

---

## Review Schedule

| Milestone | Risk Review Action |
|---|---|
| Sprint 0 start | Review all CRITICAL and HIGH risks; confirm owners |
| Track 0 GO decision | Retire R-FIN-01 (if GO) or halt project; update R-FIN-02 with real data |
| LLC incorporated | Retire R-LC-02 |
| PDPL sign-off obtained | Retire R-LC-01, update R-TECH-03 |
| Sprint 1 start | Review all open risks; add new engineering risks |
| Private Beta gate | Retire R-TECH-01 (if load test passes) |
| Production v1.0 | Full register review; update all statuses |
| Quarterly (ongoing) | Review MEDIUM and LOW risks; retire confirmed-mitigated items |
