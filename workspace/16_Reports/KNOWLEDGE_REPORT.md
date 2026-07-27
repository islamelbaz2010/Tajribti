# Knowledge Extraction Report

**Generated:** 2026-07-26  

---

## Extracted Knowledge Summary

| Category | Count |
|---|---|
| Business decisions | 15 |
| Product decisions | 7 |
| Technology decisions | 19 |
| UX decisions | 5 |
| Open / unresolved decisions | 9 |
| Architecture decisions (ADRs) | 8 |
| Features documented | 22 |
| User personas | 3 |
| Business risks | 5 |
| Technical risks | 3 |
| Production risks | 3 |
| Blocking issues | 4 |
| Resolved issues | 5 |
| Sprint milestones | 7 |
| Competitors identified | 8+ |
| Target brand accounts | 12 |
| Prompt templates | 2 |
| State machines documented | 2 |

---

## Key Business Insights

### The Single Most Important Reframe
> **This is NOT a sampling company.**  
> The business is a Consumer Intelligence Platform. Free samples are the consumer acquisition mechanic. Data is the product. Brands pay. Consumers receive value.

This reframe changes valuation, scalability, defensibility, capital allocation, competitive positioning, exit opportunities, and long-term enterprise value.

### Data Moat Insight
Every successful campaign increases platform value exponentially by adding to the proprietary consumer dataset. The moat grows with every campaign run — not from technology, but from data accumulation that competitors cannot replicate.

### Reference Company Reality Check
Samplia (the inspiration) is a **bootstrapped services business**, not a venture-scale outcome. Egypt planning must be anchored to this realistic base case. The growth/scalability assumptions in early documents were structurally optimistic.

---

## Extracted Business Decisions (Classified)

### Final (Locked) — 46 decisions across FDD
See `_navigator/DECISION_INDEX.md` for full list.

### Open (Blocking) — 4 decisions
1. Track 0 GO confirmation
2. Egyptian LLC incorporation
3. PDPL legal sign-off
4. QR concurrency load test

### Open (Non-Blocking) — 5 decisions
1. Final legal name / trademark
2. CEO as PM vs. dedicated PM
3. Final cloud region (provisionally Bahrain)
4. External funding vs. bootstrapped
5. Revenue-mix percentages

---

## Extracted Risks

### Business Risks
| Risk | Severity |
|---|---|
| Zero validated willingness-to-pay | Critical |
| Marketeers Research as near-direct competitor | High |
| Samplia bootstrapped — growth assumptions optimistic | High |
| No funded Sales function for Sprint 0–6 | High (was Blocking — now resolved) |
| No bottom-up TAM/SAM/SOM | High |

### Technical Risks
| Risk | Severity |
|---|---|
| QR redemption race condition under concurrent load | High |
| Module boundaries untested — extraction cost if wrong | Medium |
| Partition activation trigger not owned | Medium |

### Legal/Compliance Risks
| Risk | Severity |
|---|---|
| PDPL sign-off not obtained | Critical (gate) |
| Cloud data residency unresolved (mid-build migration) | High (was Blocking — provisionally resolved) |
| Cross-border data transfer rules open | Medium |

---

## Extracted Processes

| Process | Owner | Location |
|---|---|---|
| Brand campaign onboarding | Sales + Ops | PRD Feature 12 |
| Consumer OTP registration | Consumer | PRD Feature 1 |
| QR code redemption flow | Field Ops + Consumer | PRD Feature 5 |
| Post-trial survey collection | Consumer | PRD Feature 6 |
| Campaign analytics report generation | Analytics module | PRD Feature 15 |
| PDPL data deletion request | CS + Engineering | PRD Feature 8 |
| Sprint delivery | Engineering | Delivery Plan |
| P0 incident response | On-call | Operational Readiness Plan |

---

## Extracted KPIs (from FDD + PRD)

| KPI | Definition |
|---|---|
| North Star | Verified, brand-actionable consumer data points per month |
| Campaign fulfillment SLA | 48–72 hrs on 95%+ of campaigns |
| Consumer survey completion time | <3 minutes |
| OTP delivery time | <30 seconds |
| Platform uptime | 99.5% (MVP) |
| Consumer retention | Returns for second campaign within 30 days |
| Brand renewal rate | Renews for next product launch |
| Report delivery | Within hours of campaign close |

---

## Extracted Open Questions

1. No customer interviews conducted — zero primary research exists
2. No bottom-up market sizing for Egypt FMCG sampling/research spend
3. Whether any Egyptian competitor operates app-based physical sampling specifically
4. Final PDPL legal scope opinion from qualified Egyptian counsel
5. Validated pricing data for Egyptian brand budgets ($4K–$20K/campaign is illustrative)
6. Minimum panel size required for statistically useful segment-level reports
7. Survey question templates per product category (FMCG vs. pharma vs. beauty)
8. Maximum campaigns per consumer per month (anti-fatigue rule)
