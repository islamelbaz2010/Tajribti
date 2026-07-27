# Assumption Register — Tajribti Consumer Intelligence Platform

**Purpose:** Tracks every assumption the project is built on. Assumptions that are wrong can invalidate the business model, technical architecture, or financial projections. Track 0 exists to convert the highest-criticality assumptions from UNVALIDATED to VALIDATED.  
**Format:** Living document — update status as assumptions are validated or invalidated.  
**Last updated:** 2026-07-27  
**Owner:** Founder

---

## Status Key

| Status | Meaning |
|---|---|
| UNVALIDATED | Assumed true; no evidence |
| IN PROGRESS | Validation underway |
| VALIDATED | Confirmed true with evidence (cite source) |
| INVALIDATED | Confirmed false — project must adapt |
| DEFERRED | Will validate in a later phase |

## Criticality Key

| Level | Meaning |
|---|---|
| CRITICAL | If wrong, the business model fails |
| HIGH | If wrong, significant rework required |
| MEDIUM | If wrong, adjustments needed |
| LOW | If wrong, minor optimization required |

---

## Category A — Market Assumptions

| ID | Assumption | Criticality | Status | Validation Method | What Happens If Wrong | Owner |
|---|---|---|---|---|---|---|
| A-MKT-01 | Egyptian FMCG brands have a sampling/research budget of $4,000–$20,000 per campaign that they are willing to redirect to a digital-plus-physical platform | CRITICAL | UNVALIDATED | Track 0 brand interviews + LOI collection | Revenue model collapses; must reprice or reposition entirely | Founder |
| A-MKT-02 | Egyptian FMCG brands experience sufficient pain with current sampling/research approaches to switch to a new platform | CRITICAL | UNVALIDATED | Track 0 discovery interviews (pain hypothesis validation) | No switching motivation; need to find sharper pain point or different buyer | Founder |
| A-MKT-03 | At least 3 Egyptian FMCG brands will commit to a pilot campaign within 60 days of outreach (Track 0 kill criterion) | CRITICAL | UNVALIDATED | Track 0 brand outreach and LOI collection | Track 0 NO-GO; reevaluate product-market fit, pricing, or segment | Founder |
| A-MKT-04 | Egyptian consumers aged 18–40 in Cairo will participate in product trials without cash incentives (free product is sufficient motivation) | CRITICAL | UNVALIDATED | Track 0 consumer activation pilot | Consumer acquisition cost far higher than modeled; panel economics break | Founder |
| A-MKT-05 | A consumer panel of sufficient size to produce statistically meaningful segment-level reports is achievable at Cairo MVP scale | HIGH | UNVALIDATED | Define minimum panel size; model acquisition rate in Track 0 | Product's core value proposition (data quality) undermined until panel scale is reached | Founder + Product |
| A-MKT-06 | The Samplia business model (physical product trial → digital behavioral data) is replicable in the Egyptian market | HIGH | UNVALIDATED | Track 0 consumer activation; compare engagement metrics to Samplia benchmarks | Need to identify Egypt-specific modifications to the model | Founder |
| A-MKT-07 | Cairo is the right first city — highest FMCG brand concentration, most accessible consumer base | MEDIUM | VALIDATED | FDD + IC v2.0 analysis + market context | — | Founder |
| A-MKT-08 | No Egyptian competitor has already implemented app-based physical free-sample distribution at scale | MEDIUM | UNVALIDATED | Competitive research (primary: brand interviews asking about current sampling vendors) | Competitive differentiation thesis weakened; need sharper positioning | Founder |
| A-MKT-09 | Marketeers Research does NOT offer physical sampling execution — it is an analytics platform only | MEDIUM | UNVALIDATED | Marketeers Research product page + sales collateral review | If Marketeers has a sampling arm, competitive overlap is greater than modeled | Founder |
| A-MKT-10 | Egyptian FMCG brand procurement cycle is short enough for first revenue within 12 weeks of sales outreach | MEDIUM | UNVALIDATED | Track 0 sales pipeline tracking | First revenue delayed; need to model slower conversion in financial projections | Founder |

---

## Category B — Financial Assumptions

| ID | Assumption | Criticality | Status | Validation Method | What Happens If Wrong | Owner |
|---|---|---|---|---|---|---|
| A-FIN-01 | The illustrative campaign price range of $4,000–$20,000 reflects actual willingness-to-pay by Egyptian FMCG brands | CRITICAL | UNVALIDATED | Track 0 pricing discovery; direct negotiation with ≥3 brands | Entire revenue model, financial projections, and unit economics are recalibrated | Founder |
| A-FIN-02 | Revenue from brand campaigns can support Cairo operations (field coordinators, tech infrastructure, CS) within 12 months of GO | HIGH | UNVALIDATED | Financial model built on Track 0 pricing; validated unit economics | Need to raise capital or reduce operating model scope | Founder |
| A-FIN-03 | The platform can reach profitability on Cairo-only operations before needing external capital | HIGH | UNVALIDATED | Bottom-up financial model (not yet built); requires Track 0 price + volume data | Must raise pre-seed or seed capital before Cairo profitability | Founder |
| A-FIN-04 | Consumer acquisition cost (CAC) is low enough that panel economics are positive with free-product-only incentives | HIGH | UNVALIDATED | Measure CAC in Track 0 pilot; compare to campaign revenue per active consumer | Panel subsidy model required; adds cost structure to every campaign | Founder |
| A-FIN-05 | The subscription analytics dashboard (recurring revenue layer) is a viable product that brands will pay for in addition to campaign fees | MEDIUM | UNVALIDATED | Track 0 discovery: ask brands whether ongoing data access is more valuable than per-campaign access | Subscription layer removed; revenue is purely transactional; reduces valuation multiple | Founder |

---

## Category C — Technical Assumptions

| ID | Assumption | Criticality | Status | Validation Method | What Happens If Wrong | Owner |
|---|---|---|---|---|---|---|
| A-TECH-01 | NestJS modular monolith can serve Year-1 production load without requiring extraction to microservices | HIGH | DEFERRED | Load test in staging environment (Sprint 2); monitor in production | Architecture refactor required mid-product cycle; expensive | CTO |
| A-TECH-02 | QR code scan + server validation completes in <1 second under concurrency load at a physical sampling event | CRITICAL | UNVALIDATED | Load test (IERB B-04; mandatory before Private Beta) | Race conditions cause duplicate issuance; brand trust destroyed; significant re-architecture | CTO |
| A-TECH-03 | AWS me-south-1 (Bahrain) satisfies Egyptian PDPL data residency requirements | CRITICAL | UNVALIDATED | PDPL legal review by qualified Egyptian data-privacy lawyer (IERB B-03) | Infrastructure must be migrated before any user data is collected | Founder + Legal |
| A-TECH-04 | Cursor-based pagination is sufficient for all list endpoints at MVP scale | MEDIUM | VALIDATED | IERB finding M-02 remediated; documented in ADR-02 | — | Founder |
| A-TECH-05 | Flutter provides adequate performance on lower-end Egyptian Android devices (common in target demographic) | HIGH | UNVALIDATED | Test on representative low-end Android devices (e.g., Samsung A-series, Infinix) in Sprint 2 | Must add performance optimization layer; risk of consumer churn due to poor UX | CTO |
| A-TECH-06 | OpenAI and Anthropic API latency is acceptable for real-time AI insight narrative generation in the brand dashboard | MEDIUM | DEFERRED | Measure in staging before Feature TJ-018 release | Add client-side loading state; cache generated narratives; latency acceptable with async generation | CTO |
| A-TECH-07 | Vodafone Cash and InstaPay APIs are documented and accessible to a new Egyptian LLC | HIGH | UNVALIDATED | Engage payment providers in Sprint 0; obtain API access | Must use alternative reward delivery (physical vouchers, gift cards) until integration complete | CTO |
| A-TECH-08 | AWS RDS Multi-AZ provides sufficient reliability (99.95% SLA) for the MVP | MEDIUM | VALIDATED | AWS service SLA; industry standard | — | Founder |
| A-TECH-09 | Terraform IaC reduces cloud region migration cost to manageable level | MEDIUM | DEFERRED | Verify during staging environment setup | Manual migration required if IaC coverage is incomplete | CTO |

---

## Category D — Legal Assumptions

| ID | Assumption | Criticality | Status | Validation Method | What Happens If Wrong | Owner |
|---|---|---|---|---|---|---|
| A-LEG-01 | Consumer data consent flows (in-app, at point of redemption) are legally sufficient under PDPL | CRITICAL | UNVALIDATED | PDPL legal review | Must redesign consent flows; may require paper consent at physical events | Legal Counsel |
| A-LEG-02 | Demographic profiling of Egyptian consumers (age, gender, location, FMCG preferences) is permitted under PDPL with proper consent | CRITICAL | UNVALIDATED | PDPL legal review | Core data product is illegal or severely constrained; business model fundamentally compromised | Legal Counsel |
| A-LEG-03 | Post-trial behavioral data (survey responses, purchase-intent signals) can be legally sold/licensed to brands under Egyptian law | CRITICAL | UNVALIDATED | PDPL legal review | Data licensing model may require structural changes (data anonymization, aggregation-only) | Legal Counsel |
| A-LEG-04 | Egyptian LLC is the correct legal structure for a B2B2C digital platform at this scale | MEDIUM | UNVALIDATED | Legal counsel confirmation in Sprint 0 | Restructure required; delays vendor contracts and operations | Legal Counsel |
| A-LEG-05 | "Tajribti" (and any English equivalent) is available for trademark registration in Egypt and key MENA markets | MEDIUM | UNVALIDATED | Trademark search by Egyptian IP attorney | Full rebrand required; significant brand asset cost | Founder + Legal |

---

## Category E — Operational Assumptions

| ID | Assumption | Criticality | Status | Validation Method | What Happens If Wrong | Owner |
|---|---|---|---|---|---|---|
| A-OPS-01 | Physical sampling logistics can be outsourced to Egypt sampling/events agencies for first campaigns at acceptable cost | HIGH | UNVALIDATED | Track 0: request proposals from 2–3 Cairo sampling agencies | Must build internal logistics capability; significantly increases capital requirement and complexity | Ops Manager |
| A-OPS-02 | 2 backend engineers + 1 mobile engineer + 1 data engineer can build the MVP in 24 weeks | HIGH | UNVALIDATED | Engineering estimation in Sprint 1 planning; CTO assessment before hiring | Timeline extends; need additional engineers or scope reduction | CTO |
| A-OPS-03 | WhatsApp Business API approval for Egypt LLC can be obtained within Sprint 0 timeline | MEDIUM | UNVALIDATED | Apply in Sprint 0; track approval timeline | Use SMS-only notification strategy until WhatsApp approved; delays richer consumer engagement | CTO |
| A-OPS-04 | Founder can close first 3 brand pilot clients through personal outreach (no formal sales function in Sprint 0) | HIGH | UNVALIDATED | Track 0 outbound sales activity | Need to fund Sales Head before GO confirmation; increases Track 0 budget | Founder |
| A-OPS-05 | Field coordinators in Cairo can be recruited and trained on a per-campaign basis (freelance model) | MEDIUM | UNVALIDATED | Ops pilot during Track 0 or early Sprint 1 | Full-time field staff required; significantly increases fixed costs | Ops Manager |

---

## Validation Priority Queue

*Track 0 sprint should validate these assumptions before any others:*

1. A-MKT-01 — Brand willingness-to-pay (price range)
2. A-MKT-02 — Brand pain with current solutions
3. A-MKT-03 — Brand LOI within 60 days (kill criterion)
4. A-MKT-04 — Consumer participation without cash
5. A-FIN-01 — Actual campaign price confirmed
6. A-LEG-01 through A-LEG-03 — PDPL review (engage lawyer in Sprint 0)
7. A-TECH-02 — QR load test (earliest possible after CTO hire)
8. A-TECH-03 — AWS Bahrain PDPL clearance (same legal engagement as above)

---

## Assumption Retirement Log

*Record validated or invalidated assumptions here once confirmed:*

| ID | Assumption | Outcome | Evidence | Date |
|---|---|---|---|---|
| A-TECH-04 | Cursor-based pagination sufficient | VALIDATED | IERB remediation accepted; ADR-02 documented | 2026-07-26 |
| A-MKT-07 | Cairo is the right first city | VALIDATED | FDD + IC v2.0 analysis; no evidence for alternative | 2026-07-26 |
| A-TECH-08 | AWS RDS Multi-AZ reliability sufficient | VALIDATED | AWS SLA documentation; industry standard | 2026-07-26 |
