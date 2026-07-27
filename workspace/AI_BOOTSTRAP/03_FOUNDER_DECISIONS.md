# Founder Decisions — Complete Register

**Every locked decision made by the founder, merged from across the entire repository, sorted chronologically where date is known. These decisions are CONSTITUTIONAL. Do not override or reframe them.**

Source files merged: `15_Decisions/FOUNDER_DECISIONS.md`, `_navigator/DECISION_INDEX.md`, `_navigator/DECISION_STATUS_BOARD.md`, `15_Decisions/DECISION_LOG.md`, `04_Investment/IC_MEMO_v1.0.md`, `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`

---

## How to Read This File

- **LOCKED**: Final, cannot be reversed by an AI — requires explicit founder instruction
- **PROVISIONAL**: Decided but subject to change if conditions change
- **OPEN**: Not yet decided — do not treat as decided
- **REVERSED**: Was decided, then explicitly overridden — note below original entry

---

## Business Decisions (BD)

| ID | Decision | Status | Source |
|---|---|---|---|
| BD-01 | Platform category = Consumer Intelligence Platform (NOT sampling company / activation agency) | LOCKED | FDD; IC v2.0 Executive Conclusion |
| BD-02 | Target sectors = FMCG, beauty, pharma-OTC for Year 1 | LOCKED | FDD; IC v2.0 Market Targeting |
| BD-03 | Geographic start = Cairo only | LOCKED | FDD; IC v2.0 Geographic Staging |
| BD-04 | Year 2 cities = Alexandria, Giza, New Cairo, 6th October | LOCKED | FDD; IC v2.0 Geographic Staging |
| BD-05 | MENA expansion is a hard gate — only after Egypt unit economics proven | LOCKED | FDD; IC v2.0 |
| BD-06 | Vision = Default consumer-intelligence layer in Egypt (3 yr), MENA (5-7 yr) | LOCKED | FDD; `01_Project_Overview/PROJECT_OVERVIEW.md` |
| BD-07 | Excluded sectors Years 1–3 = healthcare (clinical), insurance, banking, telecom, government, education | LOCKED | FDD |
| BD-08 | Business model = B2B2C (brands pay; consumers receive free product + rewards; platform monetizes data) | LOCKED | FDD; IC v2.0 |
| BD-09 | Revenue streams = Campaign fees + per-sample fees + AI dashboard subscription + panel access + Enterprise API | LOCKED | FDD |
| BD-10 | Competitive moat = proprietary first-party consumer dataset + brand relationships | LOCKED | IC v2.0; `10_AI/AI_STRATEGY.md` |
| BD-11 | Reference company = Samplia (Spain, founded 2013, bootstrapped ~40-50M samples, ~2M users) | LOCKED | FDD; `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` (correction: founded 2013, not 1013) |
| BD-12 | Nearest competitor = Marketeers Research (Egypt/KSA/GCC/Europe, AI-powered, Smart Value™ FMCG analytics) | LOCKED | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` (new finding, added via Peer Review) |
| BD-13 | Track 0 = only authorized activity ($15K–$25K, 60 days, NO engineering) | LOCKED | IC v2.0; `13_Audits/REMEDIATION_REAUDIT.md` |
| BD-14 | Kill criterion = <3 brand LOIs in 60 days → NO-GO | LOCKED | `07_Product/GO_TO_MARKET.md`; `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` |
| BD-15 | AI = insight delivery mechanism, NOT the competitive moat | LOCKED | `10_AI/AI_STRATEGY.md`; FDD |

---

## Product Decisions (PD)

| ID | Decision | Status | Source |
|---|---|---|---|
| PD-01 | 3 products: Consumer App (Flutter mobile), Brand Dashboard (React web), Admin Portal (React web) | LOCKED | `08_PRD/MASTER_PRD_v1.0.md` |
| PD-02 | MVP feature set = 8 epics, 22 features (P0/P1/P2 priority tiers) | LOCKED | `08_PRD/MASTER_PRD_v1.0.md` |
| PD-03 | MVP non-goals = permanent kiosks, owned logistics, e-commerce, paid consumer subscription, non-FMCG, GCC features, CRM integration, Enterprise API, AI narratives | LOCKED | `08_PRD/MASTER_PRD_v1.0.md` PD-07 |
| PD-04 | 3 user personas = Mona (consumer), Ahmed (brand manager), Yasmine (admin/ops) | LOCKED | `08_PRD/MASTER_PRD_v1.0.md` |
| PD-05 | QR Redemption (TJ-005) = highest technical risk feature; requires concurrent race condition solution | LOCKED | `08_PRD/MASTER_PRD_v1.0.md`; `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| PD-06 | Consumer onboarding survey = 3–5 questions, <3 min completion time | LOCKED | `08_PRD/MASTER_PRD_v1.0.md` |
| PD-07 | AI Insight Narratives (TJ-018) = P2, deferred to V2 | LOCKED | `08_PRD/MASTER_PRD_v1.0.md`; `10_AI/AI_STRATEGY.md` |

---

## MVP P0 Features (Must Ship for Beta)

| Feature ID | Name |
|---|---|
| TJ-001 | OTP Login & Registration (Consumer) |
| TJ-002 | Consumer Profile & Onboarding |
| TJ-003 | Consent Center (PDPL-compliant) |
| TJ-004 | Campaign Discovery Feed |
| TJ-005 | QR Code Redemption (HIGHEST RISK) |
| TJ-006 | Post-Trial Survey |
| TJ-009 | Brand Account & Dashboard |
| TJ-010 | Campaign Creation Wizard |
| TJ-012 | Live Campaign Monitoring |
| TJ-017 | Admin Portal — Campaign Approvals |
| TJ-018 | AI Insight Narratives (P2 — DEFERRED) |
| TJ-019 | Gamification & Rewards Engine |
| TJ-021 | Fraud Detection (P0 manual → P1 automated) |

*Source: `08_PRD/MASTER_PRD_v1.0.md` — Epic/Feature Table*

---

## Technology Decisions (TD)

| ID | Decision | Status | Source |
|---|---|---|---|
| TD-01 | Consumer App = Flutter (cross-platform iOS/Android, RTL-first, lower-end Android) | LOCKED | FDD; `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| TD-02 | Brand Dashboard = React web (desktop-first) | LOCKED | FDD |
| TD-03 | Admin Portal = React web (internal) | LOCKED | FDD |
| TD-04 | Core API = NestJS (TypeScript), modular monolith | LOCKED | FDD; ADR-01 |
| TD-05 | AI Service = Python / FastAPI (satellite service) | LOCKED | FDD |
| TD-06 | Database = PostgreSQL (AWS RDS Multi-AZ) | LOCKED | FDD |
| TD-07 | Cache = Redis (AWS ElastiCache) | LOCKED | FDD |
| TD-08 | Queue = AWS SQS (cross-module) + BullMQ (internal) | LOCKED | FDD; ADR-06 |
| TD-09 | Auth = Passport.js (OTP + JWT + OAuth2) | LOCKED | FDD |
| TD-10 | Cloud = AWS ECS, multi-AZ, autoscaled | LOCKED | FDD |
| TD-11 | Cloud region = AWS me-south-1 Bahrain | PROVISIONAL | FDD (pending PDPL clarity) |
| TD-12 | IaC = Terraform | LOCKED | FDD |
| TD-13 | ORM = TypeORM with NestJS migrations | LOCKED | FDD |
| TD-14 | LLM providers = OpenAI + Anthropic (multi-provider, no single-vendor lock-in) | LOCKED | FDD; ADR-07 |
| TD-15 | Prompt templates = versioned files (not inline in code) | LOCKED | ADR-08 |
| TD-16 | Soft-delete = mandatory on all entities (PDPL compliance) | LOCKED | ADR-04 |
| TD-17 | Multi-cloud = NOT before Years 2–3 | LOCKED | FDD |
| TD-18 | RAG / vector database = deferred to validated need only (NOT in V1 roadmap) | LOCKED | FDD; `10_AI/AI_STRATEGY.md` |
| TD-19 | Integer monetary fields (no float) | LOCKED | ADR-05 |

---

## Architecture Decision Records (ADR)

| ADR | Decision | Reason | Source |
|---|---|---|---|
| ADR-01 | Modular monolith over microservices | 2–3 engineer Year-1 team; micro-services premature | `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| ADR-02 | Cursor-based pagination (not offset) | Performance at scale; offset degrades with large datasets | `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| ADR-03 | UUID v4 primary keys | No sequential ID enumeration; security + distributed-safe | `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| ADR-04 | Soft-delete on ALL entities | PDPL Right-to-Erasure compliance without data loss | `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| ADR-05 | Integer monetary fields (no float) | Float rounding errors unacceptable in financial records | `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| ADR-06 | AWS SQS for cross-module events (fast redemption path) | Decoupling + reliability for QR redemption race condition | `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| ADR-07 | Multi-provider LLM (OpenAI + Anthropic) | No vendor lock-in; cost arbitrage; fallback capability | `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| ADR-08 | Versioned prompt templates (not inline) | Auditable, testable, improvable without code deploy | `09_Technical/TECHNICAL_ARCHITECTURE.md` |

---

## UX / Design Decisions (UX)

| ID | Decision | Status | Source |
|---|---|---|---|
| UX-01 | RTL-first design (Arabic primary, English secondary) | LOCKED | FDD; `08_PRD/MASTER_PRD_v1.0.md` |
| UX-02 | Arabic as primary language, English secondary | LOCKED | FDD; `07_Product/GO_TO_MARKET.md` |
| UX-03 | Consumer auth = OTP only (no email/password) | LOCKED | FDD; reduces friction for Egyptian mobile users |
| UX-04 | Brand dashboard = desktop-first | LOCKED | FDD; brand managers work at desks |
| UX-05 | Survey = maximum 3–5 questions, <3 min | LOCKED | FDD; `08_PRD/MASTER_PRD_v1.0.md` |

---

## Operational Decisions (OPS)

| ID | Decision | Status | Source |
|---|---|---|---|
| OPS-01 | Field operations model = contracted field coordinators (not employed) | LOCKED | IC v2.0; `02_Project_Management/MASTER_DELIVERY_PLAN.md` |
| OPS-02 | Campaign format = fixed pop-up sampling events (not permanent kiosks) | LOCKED | FDD; `07_Product/GO_TO_MARKET.md` |
| OPS-03 | Logistics = coordinated with brand (not owned by Tajribti) | LOCKED | FDD; `01_PROJECT_CONSTITUTION.md` non-goals |

---

## Brand / Naming Decisions (BR)

| ID | Decision | Status | Source |
|---|---|---|---|
| BR-01 | Working name = "Tajribti (تجربتي)" | PROVISIONAL | FDD — pending trademark clearance |
| BR-02 | Final brand name = NOT yet decided | OPEN | `_navigator/DECISION_STATUS_BOARD.md` OD-01 |
| BR-03 | External tagline framing = "Consumer Intelligence Platform" | LOCKED | IC v2.0 |

---

## Financial Decisions (FIN)

| ID | Decision | Status | Source |
|---|---|---|---|
| FIN-01 | All financial figures are ILLUSTRATIVE until validated by Track 0 | LOCKED | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`; FDD |
| FIN-02 | Track 0 budget cap = $15K–$25K | LOCKED | IC v2.0 |
| FIN-03 | No capital commitment before Track 0 GO | LOCKED | `00_Source_of_Truth/PROJECT_RULES.md` RULE-FD-01 |
| FIN-04 | Unit economics model must be built from real data, not assumed | LOCKED | `00_Source_of_Truth/PROJECT_RULES.md` RULE-FD-02 |
| FIN-05 | External funding vs. bootstrapped trajectory = OPEN | OPEN | `_navigator/DECISION_STATUS_BOARD.md` OD-04 |

---

## Phase 1 Remediation Decisions (Post-Audit)

| ID | Decision | Status | Source |
|---|---|---|---|
| REM-01 | Marketeers Research accepted as near-direct competitor (not indirect) | LOCKED | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` |
| REM-02 | Samplia founding year corrected to 2013 (not 1013 as previously written) | LOCKED | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`; statistics.json fixed |
| REM-03 | IERB re-audit score = 67/100 (up from 58/100 post-remediation) | LOCKED | `13_Audits/REMEDIATION_REAUDIT.md` |
| REM-04 | Authorization status = NOT AUTHORIZED for development | LOCKED | `13_Audits/REMEDIATION_REAUDIT.md` — remains unchanged after remediation |

---

## Open Decisions (NOT YET DECIDED — Do Not Treat as Locked)

| ID | Question | What Closes It | Source |
|---|---|---|---|
| OD-01 | Final legal company name + trademark/domain clearance | Trademark search completed; name registered | `15_Decisions/OPEN_DECISIONS_TRACKER.md` |
| OD-02 | CEO as PM through Year 1, or hire dedicated PM on GO | Decision documented in writing by Founder | `15_Decisions/OPEN_DECISIONS_TRACKER.md` |
| OD-03 | Final cloud region (provisionally AWS me-south-1 Bahrain) | PDPL written opinion received | `15_Decisions/OPEN_DECISIONS_TRACKER.md` |
| OD-04 | External funding vs. bootstrapped trajectory | Written decision by Founder | `15_Decisions/OPEN_DECISIONS_TRACKER.md` |
| OD-05 | Revenue mix percentages per stream | Track 0 pricing discovery completed | `15_Decisions/OPEN_DECISIONS_TRACKER.md` |
