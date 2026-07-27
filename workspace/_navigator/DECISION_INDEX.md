# DECISION INDEX — All Extracted Decisions

**Source of Truth:** `15_Decisions/FOUNDER_DECISIONS.md`

---

## Business Decisions

| ID | Decision | Value | Status |
|---|---|---|---|
| BD-01 | Company positioning | Consumer Intelligence Platform — NEVER a sampling company | FINAL |
| BD-02 | Target market | FMCG, beauty, personal care, pharma-OTC brands in Egypt | FINAL |
| BD-03 | Paying customer | Brand marketing, innovation, consumer-insights teams | FINAL |
| BD-04 | Year 1 geography | Cairo only | FINAL |
| BD-05 | Year 2 geography | Alexandria, Giza, New Cairo, 6th October | FINAL |
| BD-06 | GCC expansion gate | Only after Egypt unit economics proven — hard gate, not calendar date | FINAL |
| BD-07 | Out-of-scope sectors Y1–3 | Healthcare, insurance, banking, telecom, government, education | FINAL |
| BD-08 | Pricing philosophy | Brands pay; consumers never pay. Price for value of data/insight | FINAL |
| BD-09 | Revenue model | Campaign fees + per-sample fees + AI dashboard subscription + panel access + Enterprise API | FINAL |
| BD-10 | Sales motion | Land-and-expand. Land with single paid campaign, expand to subscription | FINAL |
| BD-11 | Exit option A | Strategic acquisition (NielsenIQ, Kantar, Circana, MENA media group) | FINAL |
| BD-12 | Exit option B | Sustained independent profitability as regional data-services company | FINAL |
| BD-13 | Rejected exit model | Venture-style forced-exit timeline | FINAL |
| BD-14 | Funding strategy | Capital-efficient, bootstrapped. Raise only to hit next milestone | FINAL |
| BD-15 | Company structure | Egyptian LLC → convert to JSC as company scales | FINAL |

---

## Product Decisions

| ID | Decision | Value | Status |
|---|---|---|---|
| PD-01 | Core product | Two-sided platform: consumer app + brand dashboard | FINAL |
| PD-02 | MVP scope | Admin dashboard, brand dashboard, consumer app, QR redemption, 3–5 question survey, basic analytics | FINAL |
| PD-03 | NOT in MVP | Permanent kiosks, owned logistics, e-commerce, paid consumer subscriptions, non-FMCG verticals, GCC features | FINAL |
| PD-04 | AI strategy | AI = faster insight delivery, not the moat. Use third-party LLMs (OpenAI/Anthropic) | FINAL |
| PD-05 | Automation scope | Automate: operational tasks. Do NOT automate: brand relationships, campaign strategy | FINAL |
| PD-06 | MVP integrations | WhatsApp Business API, Vodafone Cash, InstaPay, CSV export | FINAL |
| PD-07 | NOT in MVP integrations | HubSpot/Salesforce, Enterprise API, LLM insight generation | FINAL |

---

## Technology Decisions

| ID | Decision | Value | Status |
|---|---|---|---|
| TD-01 | Tech philosophy | Boring, proven tech for core. Reserve novelty for AI/data layer only | FINAL |
| TD-02 | Cloud provider | AWS | FINAL |
| TD-03 | Cloud region | Provisionally AWS me-south-1 (Bahrain) | PROVISIONAL |
| TD-04 | Multi-cloud | No multi-cloud in Years 1–2 | FINAL |
| TD-05 | Core API architecture | Modular monolith (NestJS) | FINAL |
| TD-06 | AI/data service | Satellite Python/FastAPI service | FINAL |
| TD-07 | Consumer frontend | Flutter (cross-platform mobile) | FINAL |
| TD-08 | Brand dashboard | React web (desktop-first) | FINAL |
| TD-09 | API style | REST versioned (/api/v1/); no GraphQL in MVP | FINAL |
| TD-10 | Authentication | OTP (consumer) + JWT + OAuth2 (V2 SSO) | FINAL |
| TD-11 | Background jobs | BullMQ (internal) + AWS SQS (cross-module) | FINAL |
| TD-12 | Primary DB | PostgreSQL (AWS RDS Multi-AZ) | FINAL |
| TD-13 | Cache | Redis (ElastiCache) | FINAL |
| TD-14 | ORM | TypeORM with NestJS migrations | FINAL |
| TD-15 | AI providers | OpenAI + Anthropic (multi-provider, no lock-in) | FINAL |
| TD-16 | Build vs. Buy | Build: pipeline + fraud detection + AI narratives. Buy: payments, cloud, LLM APIs, CRM, monitoring | FINAL |
| TD-17 | Open source policy | Use freely. Do NOT open-source own code or models | FINAL |
| TD-18 | RAG/Vector DB | NOT required for V2 — deferred to future "ask your data" feature only if validated | FINAL |
| TD-19 | Infrastructure as code | Terraform | FINAL |

---

## UX Decisions

| ID | Decision | Value | Status |
|---|---|---|---|
| UX-01 | Mobile strategy | Mobile-first and mobile-only for consumers | FINAL |
| UX-02 | Brand dashboard platform | Desktop-web-first | FINAL |
| UX-03 | Primary language | Egyptian-dialect Arabic | FINAL |
| UX-04 | Secondary language | English (toggle) | FINAL |
| UX-05 | Accessibility | RTL-first, lower-end Android support, poor connectivity graceful degradation | FINAL |

---

## Open Decisions (Unresolved)

| ID | Decision | Owner | Status |
|---|---|---|---|
| OD-01 | Final legal company name and trademark/domain clearance | Founder | OPEN |
| OD-02 | CEO doubles as PM through Year 1 or dedicated PM hired | Founder | OPEN |
| OD-03 | Final cloud hosting region (provisionally Bahrain) | Founder + Legal | PROVISIONAL |
| OD-04 | Whether external funding is sought or bootstrapped | Founder | OPEN |
| OD-05 | Revenue-mix percentages | Pending validation sprint | OPEN |
| OD-06 | Track 0 GO decision | Founder / IC | OPEN — BLOCKING |
| OD-07 | Egyptian LLC incorporation | Founder | OPEN — BLOCKING |
| OD-08 | PDPL legal review sign-off | Legal counsel | OPEN — BLOCKING |
| OD-09 | QR concurrency load test | Engineering | OPEN — BLOCKING |

---

## Architecture Decisions (ADR)

| ID | Decision | Rationale |
|---|---|---|
| ADR-01 | Modular monolith over microservices | Year-1 team is 2–3 engineers; microservices overhead not justified; module boundaries designed for future extraction |
| ADR-02 | Cursor-based pagination over offset-based | More efficient at scale; avoids page-drift on live data |
| ADR-03 | UUID v4 primary keys | Avoids sequential-ID enumeration; safe for public-facing IDs |
| ADR-04 | Soft-delete over hard-delete | Audit recovery; PDPL compliance requires anonymization not deletion for events |
| ADR-05 | Monetary fields as integers | Avoids floating-point rounding errors |
| ADR-06 | SQS for cross-module events | Keeps redemption path fast; decouples analytics growth from core loop |
| ADR-07 | Multi-provider LLM (OpenAI + Anthropic) | Avoids single-vendor lock-in per FDD |
| ADR-08 | Versioned prompt templates in dedicated module | Not inline in application code; supports A/B testing prompts |
