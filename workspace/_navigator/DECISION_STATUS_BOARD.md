# Decision Status Board — Live Tracker

**Last updated:** 2026-07-27  
**Source of truth:** `15_Decisions/FOUNDER_DECISIONS.md`  
**Full index:** `_navigator/DECISION_INDEX.md`

---

## ❌ BLOCKING — Development cannot proceed

| ID | Decision Required | Owner | Impact if Delayed |
|---|---|---|---|
| B-01 | Track 0 commercial sprint GO/NO-GO confirmation | Founder / IC | All Track 1 activity remains unauthorized |
| B-02 | Egyptian LLC incorporation confirmed (or formation date set) | Founder | Cannot sign vendor contracts in Sprint 0 |
| B-03 | PDPL legal sign-off from qualified Egyptian counsel | Legal counsel | Cannot ship any data-collecting feature |
| B-04 | QR concurrency load test executed | Engineering (not yet hired) | Highest technical risk unproven before beta |

---

## ⚠️ OPEN — Non-blocking but unresolved

| ID | Decision | Owner | Notes |
|---|---|---|---|
| OD-01 | Final legal company name and trademark/domain clearance | Founder | "Tajribti" is provisional — all code/legal filings must treat as provisional |
| OD-02 | CEO doubles as PM through Year 1, or dedicated PM hired on GO | Founder | Affects hiring plan and Sprint 0 resource allocation |
| OD-03 | Final cloud hosting region (provisionally AWS me-south-1 Bahrain) | Founder + Legal | Provisionally resolved in Remediation doc |
| OD-04 | Whether external funding is sought or company remains bootstrapped | Founder | Affects go-to-market timeline |
| OD-05 | Revenue-mix percentages | Founder + validation sprint | Pending Track 0 pricing discovery |

---

## ✅ LOCKED — Final decisions (not subject to change without FDD amendment)

### Strategic
| ID | Decision | Value |
|---|---|---|
| BD-01 | Company positioning | Consumer Intelligence Platform — NEVER a sampling company |
| BD-02 | Target market | FMCG, beauty, personal care, pharma-OTC in Egypt |
| BD-03 | Paying customer | Brand marketing / innovation / consumer-insights teams |
| BD-04 | Year 1 geography | Cairo only |
| BD-05 | GCC expansion gate | Only after Egypt unit economics proven — hard gate |
| BD-06 | Revenue model | Campaign fees + per-sample + AI subscription + panel access + Enterprise API |
| BD-07 | Sales motion | Outbound-led, land-and-expand, ~20 named accounts |
| BD-08 | Exit option A | Strategic acquisition (NielsenIQ / Kantar / MENA media group) |
| BD-09 | Exit option B | Sustained independent profitability as regional data company |
| BD-10 | Rejected exit model | Venture-style forced-exit timeline |

### Product
| ID | Decision | Value |
|---|---|---|
| PD-01 | Core product | Two-sided platform: consumer app + brand dashboard |
| PD-02 | MVP definition | Admin portal + brand dashboard + consumer app + QR redemption + 3–5 question survey + basic analytics |
| PD-03 | AI strategy | AI = faster insight delivery, NOT the moat. Use third-party LLMs. Moat = data + relationships |
| PD-04 | Mobile strategy | Mobile-first and mobile-only for consumers. Brand dashboard = desktop-web-first |
| PD-05 | Primary language | Egyptian-dialect Arabic (not a translation layer — native Egyptian from day 1) |

### Technology
| ID | Decision | Value |
|---|---|---|
| TD-01 | Core API | NestJS modular monolith (not microservices until scale warrants) |
| TD-02 | AI service | Satellite Python / FastAPI service |
| TD-03 | Consumer frontend | Flutter (cross-platform iOS/Android) |
| TD-04 | Brand dashboard | React web (desktop-first) |
| TD-05 | Database | PostgreSQL (AWS RDS Multi-AZ) |
| TD-06 | Queue | AWS SQS (cross-module) + BullMQ (internal jobs) |
| TD-07 | AI providers | OpenAI + Anthropic — multi-provider, no lock-in |
| TD-08 | Cloud | AWS (region provisionally Bahrain — see OD-03) |
| TD-09 | IaC | Terraform, reviewed via PR like application code |
| TD-10 | Primary keys | UUID v4 on all entities |
| TD-11 | Pagination | Cursor-based (not offset) for all list endpoints |
| TD-12 | RAG/Vector DB | NOT required for V2 — deferred until validated need |

### Architecture Decisions (ADRs)
| ADR | Decision | Rationale |
|---|---|---|
| ADR-01 | Modular monolith | Year-1 team 2–3 engineers; microservices overhead not justified; clean boundaries for future extraction |
| ADR-02 | Cursor pagination | Efficient at scale; no page-drift on live data; consistent with UUID PK convention |
| ADR-03 | UUID v4 PKs | No sequential-ID enumeration; safe for public-facing IDs |
| ADR-04 | Soft-delete | PDPL compliance; audit recovery; events only anonymized never hard-deleted |
| ADR-05 | Integer monetary fields | Avoids floating-point rounding errors |
| ADR-06 | SQS cross-module events | Keeps redemption path fast; decouples analytics growth from core loop |
| ADR-07 | Multi-provider LLM | No single-vendor lock-in (FDD requirement) |
| ADR-08 | Versioned prompt templates | Not inline in code; supports testing; typed JSON output |

---

## Decision Count Summary

| Status | Count |
|---|---|
| ❌ Blocking (must resolve before development) | **4** |
| ⚠️ Open non-blocking | **5** |
| ✅ Locked final | **27+** |
| **Total tracked** | **36+** |
