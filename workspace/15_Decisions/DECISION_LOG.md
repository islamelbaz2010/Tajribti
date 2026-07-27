# Decision Log — Chronological Record of All Decisions

**Format:** Append-only. Never delete or amend past entries. If a decision is reversed, add a new entry marked REVERSED/AMENDED.  
**Authority:** Binding decisions are in `15_Decisions/FOUNDER_DECISIONS.md`. This log provides audit trail and rationale.  
**Last updated:** 2026-07-27  
**Decision count:** 51 logged (27+ locked, 5 open, 4 blocking, 8 ADRs)

---

## How to Read This Log

| Column | Meaning |
|---|---|
| ID | Unique decision ID — never reassigned |
| Date | Date decision was made or documented |
| Category | BIZ / PROD / TECH / ADR / UX / BRAND / OPS / FIN / OPEN |
| Status | LOCKED / OPEN / BLOCKED / REVERSED |
| Decision | The decision made |
| Rationale | Why this was decided |
| Authority | Who made it |

---

## Phase 0 — Foundation Decisions (Pre-Workspace)

*These decisions were made during the initial concept and IC analysis phase, documented in the FDD and Investment reports.*

### Strategic Business Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-001 | 2026-07 | BIZ | LOCKED | Platform category: Consumer Intelligence Platform — NEVER "sampling company" | Free product samples are the acquisition mechanic; data is the product. Positioning as sampling company undersells the value proposition and misdirects investor framing | Founder (FDD) |
| DL-002 | 2026-07 | BIZ | LOCKED | Paying customer: Brands only. Consumers NEVER pay. | B2B2C model — brand data value is the revenue source; consumer friction from fees would destroy data panel quality | Founder (FDD) |
| DL-003 | 2026-07 | BIZ | LOCKED | Target market: FMCG, beauty, personal care, pharma-OTC in Egypt | Highest repeat-launch frequency; existing sampling/research budget; easiest measurable ROI for brand | Founder (FDD) |
| DL-004 | 2026-07 | BIZ | LOCKED | Year 1 geography: Cairo only | Highest brand concentration in Egypt; most cost-efficient first market for operations | Founder (FDD) |
| DL-005 | 2026-07 | BIZ | LOCKED | Year 2 expansion: Alexandria, Giza, New Cairo, 6th October | Natural adjacency; shared logistics infrastructure | Founder (FDD) |
| DL-006 | 2026-07 | BIZ | LOCKED | GCC expansion gate: Egypt unit economics proven — hard gate, not calendar date | Avoids premature geographic expansion before model is proven; protects capital | Founder (FDD) |
| DL-007 | 2026-07 | BIZ | LOCKED | Out of scope Y1–3: Healthcare, insurance, banking, telecom, government, education | FMCG is primary; all listed verticals have materially different regulatory + sales complexity | Founder (FDD) |
| DL-008 | 2026-07 | BIZ | LOCKED | Revenue model: Campaign fees + per-sample + AI dashboard subscription + panel access + Enterprise API | Multi-revenue-stream reduces single-client concentration risk; subscription layer improves revenue quality | Founder (FDD) |
| DL-009 | 2026-07 | BIZ | LOCKED | Sales motion: Outbound-led, land-and-expand, ~20 named accounts | Concentrated account base allows deep relationship management; land-and-expand is proven B2B SaaS motion | Founder (FDD) |
| DL-010 | 2026-07 | BIZ | LOCKED | Funding: Capital-efficient, bootstrapped trajectory. Raise only to hit next milestone. | Reference company (Samplia) is bootstrapped; venture-scale assumptions not warranted without validated unit economics | Founder (FDD) |
| DL-011 | 2026-07 | BIZ | LOCKED | Exit A: Strategic acquisition (NielsenIQ, Kantar, Circana, MENA media) | Data assets + brand relationships are acquisition-valuable to global intelligence companies | Founder (FDD) |
| DL-012 | 2026-07 | BIZ | LOCKED | Exit B: Sustained independent profitability as regional data company | Not all outcomes require an exit; profitable regional intelligence company is a valid terminal state | Founder (FDD) |
| DL-013 | 2026-07 | BIZ | LOCKED | REJECTED: Venture-style forced-exit timeline | Incompatible with capital-efficient trajectory and operator-founder operating model | Founder (FDD) |

### Product Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-014 | 2026-07 | PROD | LOCKED | Core product: Two-sided platform — consumer app + brand dashboard | Platform value comes from connecting both sides; single-sided product delivers half the value | Founder (FDD) |
| DL-015 | 2026-07 | PROD | LOCKED | MVP scope: Admin portal + brand dashboard + consumer app + QR redemption + 3–5 question survey + basic analytics | Minimum viable loop to generate revenue-quality data; all other features deferred | Founder (FDD) |
| DL-016 | 2026-07 | PROD | LOCKED | NOT in MVP: Permanent kiosks, owned logistics, e-commerce, paid consumer subscriptions, non-FMCG, GCC features | Capital and complexity reduction; deferred to validated demand | Founder (FDD) |
| DL-017 | 2026-07 | PROD | LOCKED | AI strategy: AI = faster insight delivery, NOT the moat. Moat = data + brand relationships. | LLM APIs are commoditizing AI; proprietary data panel + brand trust is defensible | Founder (FDD) |
| DL-018 | 2026-07 | PROD | LOCKED | Mobile strategy: Mobile-first + mobile-only for consumers. Brand dashboard = desktop-web-first. | Egyptian FMCG consumer primarily uses Android mobile; brand managers work at desks | Founder (FDD) |
| DL-019 | 2026-07 | PROD | LOCKED | Primary language: Egyptian-dialect Arabic — native, not a translation layer | Egyptian-dialect UX reduces cognitive friction for target consumer demographic | Founder (FDD) |

### Technology Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-020 | 2026-07 | TECH | LOCKED | Core API: NestJS (TypeScript) | Typed, structured, good ecosystem for small teams; native DI + modular architecture | Founder (FDD) |
| DL-021 | 2026-07 | TECH | LOCKED | AI service: Python / FastAPI satellite | Python is the dominant ML/AI ecosystem; FastAPI is production-grade; cleanly separated from core API | Founder (FDD) |
| DL-022 | 2026-07 | TECH | LOCKED | Consumer frontend: Flutter | Cross-platform iOS + Android from single codebase; strong RTL Arabic support; lower-end Android performance | Founder (FDD) |
| DL-023 | 2026-07 | TECH | LOCKED | Brand dashboard: React (web, desktop-first) | Most widely supported frontend framework; brand managers use desktop browsers | Founder (FDD) |
| DL-024 | 2026-07 | TECH | LOCKED | Database: PostgreSQL (AWS RDS Multi-AZ) | Proven, reliable, full ACID; RDS Multi-AZ for production HA; no exotic DB for core data | Founder (FDD) |
| DL-025 | 2026-07 | TECH | LOCKED | Queue: AWS SQS (cross-module) + BullMQ (internal jobs) | SQS for durability + cross-service decoupling; BullMQ for internal retry logic | Founder (FDD) |
| DL-026 | 2026-07 | TECH | LOCKED | Cache: Redis via AWS ElastiCache | Industry standard; session storage, rate limiting, leaderboard caching | Founder (FDD) |
| DL-027 | 2026-07 | TECH | LOCKED | Cloud: AWS (region provisionally me-south-1 Bahrain) | Nearest AWS region to Egypt with MENA data-residency precedent; PDPL compliance pending legal confirmation | Founder (FDD + Remediation) |
| DL-028 | 2026-07 | TECH | LOCKED | IaC: Terraform | Industry standard; reviewed via PR like application code | Founder (FDD) |
| DL-029 | 2026-07 | TECH | LOCKED | AI providers: OpenAI + Anthropic, multi-provider | No single-vendor lock-in; provider outages don't take down insight layer | Founder (FDD) |
| DL-030 | 2026-07 | TECH | LOCKED | Philosophy: Boring, proven tech for core stack; novelty reserved for AI/data layer only | Small team; operational stability more valuable than technical novelty | Founder (FDD) |
| DL-031 | 2026-07 | TECH | LOCKED | Build vs. Buy: Build pipeline + fraud detection + AI narratives. Buy payments, cloud, LLMs, BI, CRM, monitoring. | Builds only where differentiation exists; buys to accelerate and reduce ops burden | Founder (FDD) |
| DL-032 | 2026-07 | TECH | LOCKED | Open source: Use freely (PostgreSQL, Redis). Do NOT open-source Tajribti's own code or models. | Data models and fraud-detection logic are proprietary competitive assets | Founder (FDD) |

### Architecture Decisions (ADRs)

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| ADR-01 | 2026-07 | ADR | LOCKED | Modular monolith — not microservices | Year-1 team 2–3 engineers; microservices overhead not justified; clean module boundaries allow future extraction | Founder + IERB (Architecture) |
| ADR-02 | 2026-07 | ADR | LOCKED | Cursor-based pagination — not offset | Consistent at scale; no page-drift on live data; consistent with UUID PK; IERB finding M-02 remediated | IERB + Founder (Remediation) |
| ADR-03 | 2026-07 | ADR | LOCKED | UUID v4 primary keys | Prevents sequential-ID enumeration attacks; safe for public-facing IDs | Founder (Architecture) |
| ADR-04 | 2026-07 | ADR | LOCKED | Soft-delete on all entities | PDPL compliance; audit trail preservation; events only anonymized, never hard-deleted | Founder (Architecture + PDPL) |
| ADR-05 | 2026-07 | ADR | LOCKED | Integer monetary fields | Avoids floating-point rounding errors in financial calculations | Founder (Architecture) |
| ADR-06 | 2026-07 | ADR | LOCKED | SQS for cross-module events | Keeps QR redemption path fast; decouples analytics growth from core transaction loop | Founder (Architecture) |
| ADR-07 | 2026-07 | ADR | LOCKED | Multi-provider LLM | No single-vendor lock-in (FDD requirement); provider outages don't disable insight layer | Founder (FDD) |
| ADR-08 | 2026-07 | ADR | LOCKED | Versioned prompt templates — not inline in code | Supports testing; typed JSON output; not entangled with application code | Founder (AI Strategy) |

### UX Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-033 | 2026-07 | UX | LOCKED | UX philosophy: Friction is the enemy. Every unnecessary tap costs completed surveys. | Survey completion rate is the core data-quality metric; UX friction destroys it | Founder (FDD) |
| DL-034 | 2026-07 | UX | LOCKED | Accessibility: RTL-first, Arabic typography, lower-end Android support, graceful degradation on poor connectivity | Egyptian target consumer is not an iPhone power user; graceful degradation is mandatory, not optional | Founder (FDD) |
| DL-035 | 2026-07 | UX | LOCKED | Languages: Egyptian-dialect Arabic = default and primary. English = secondary toggle. | Platform is natively Egyptian. English toggle for bilingual brand managers. | Founder (FDD) |

### Brand Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-036 | 2026-07 | BRAND | LOCKED | Positioning: "Egypt's Consumer Intelligence Platform" — never "sampling company" or "coupon app" | Framing controls value perception; sampling company framing limits pricing power | Founder (FDD) |
| DL-037 | 2026-07 | BRAND | LOCKED | Personality: Sharp, evidence-driven, trustworthy — "credible insider" | Not a marketing platform; a data platform. Personality must reflect data credibility. | Founder (FDD) |
| DL-038 | 2026-07 | BRAND | LOCKED | Never oversell certainty — always show sample size and confidence context | Data honesty builds long-term brand trust; dishonest analytics gets caught and destroys relationships | Founder (FDD) |

### Operational Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-039 | 2026-07 | OPS | LOCKED | Company structure: Egyptian LLC initially, converting to JSC as it scales | Standard Egypt entity for early-stage; JSC required for institutional investment | Founder (FDD) |
| DL-040 | 2026-07 | OPS | LOCKED | Remote-first for engineering/product/data. In-person required for Ops/field and Sales. | Engineering talent is geographically distributed; field operations require physical presence | Founder (FDD) |
| DL-041 | 2026-07 | OPS | LOCKED | CS strategy: Proactive ROI reporting drives renewal — not reactive ticket-answering | Brand retention depends on demonstrated value, not support quality alone | Founder (FDD) |

---

## Phase 1 — Remediation Decisions (Post-IERB Audit)

*These decisions resolved IERB blocking items B-02, B-04, and partially B-03.*

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-042 | 2026-07-26 | OPS | LOCKED | Cloud region: AWS me-south-1 (Bahrain) — provisional | Closest AWS region to Egypt with MENA data-residency precedent; no worse PDPL fit than UAE absent specific legal reason | Founder (Remediation) |
| DL-043 | 2026-07-26 | OPS | LOCKED | Sprint 0 team: CEO + CTO + fractional legal + fractional CFO (pre-GO activities only) | Minimum viable Sprint 0 team; avoids hiring cost before GO confirmed | Founder (Remediation) |
| DL-044 | 2026-07-26 | OPS | LOCKED | Sprint 1+ hires: 2 engineers + Ops Manager + Head of Brand Partnerships on GO confirmation | Standard Year-1 team structure per Master Execution Blueprint | Founder (Remediation) |
| DL-045 | 2026-07-26 | OPS | LOCKED | Sprint 0 vendor budget: SMS/OTP ~$200–500, WhatsApp BSP ~$500–1,000, AWS setup ~$500–1,000, PDPL legal ~$2,000–5,000 | Explicit budget line for Track 0 vendor contracts; resolves IERB B-04 | Founder (Remediation) |

---

## Open Decisions (Unresolved)

| ID | Date | Category | Status | Decision Required | Owner | Impact |
|---|---|---|---|---|---|---|
| OD-01 | 2026-07 | BRAND | OPEN | Final legal company name + trademark/domain clearance | Founder | All code, legal filings, brand assets use provisional name until resolved |
| OD-02 | 2026-07 | OPS | OPEN | CEO doubles as PM through Year 1, or dedicated PM hired on GO | Founder | Hiring plan and Sprint 0 resource allocation |
| OD-03 | 2026-07 | TECH | OPEN | Final cloud region confirmation (provisionally Bahrain) | Founder + Legal | Infrastructure confirmed after PDPL review |
| OD-04 | 2026-07 | FIN | OPEN | External funding sought or bootstrapped trajectory | Founder | Timeline and team size for Track 1 |
| OD-05 | 2026-07 | FIN | OPEN | Revenue-mix percentages (campaign vs. subscription vs. API) | Founder + Track 0 results | Pricing and packaging strategy |

---

## Blocking Items (Development Gates)

| ID | Date | Category | Status | Item | Owner | Closes When |
|---|---|---|---|---|---|---|
| B-01 | 2026-07 | FIN | BLOCKED | Track 0 GO decision not confirmed | Founder | Founder confirms sprint concluded with GO |
| B-02 | 2026-07 | LEGAL | BLOCKED | Egyptian LLC incorporation unconfirmed | Founder | LLC confirmed incorporated |
| B-03 | 2026-07 | LEGAL | BLOCKED | PDPL legal sign-off not obtained | Legal counsel | Egyptian data-privacy lawyer provides written scope opinion |
| B-04 | 2026-07 | TECH | BLOCKED | QR concurrency load test not executed | CTO (not yet hired) | Load test executed and results documented |

---

## How to Add a Decision

When a new decision is made, add a row to the appropriate section:
1. Assign next sequential ID in the DL- or ADR- series
2. Record exact date
3. Choose category from: BIZ / PROD / TECH / ADR / UX / BRAND / OPS / FIN / OPEN
4. Set initial status: LOCKED (final) or OPEN (pending)
5. State the decision clearly — one sentence, present tense
6. State the rationale — why, not what
7. Note the authority: Founder, IERB, Legal Counsel, etc.
8. If the decision came from a specific document, reference it

**Never edit a past entry. Append reversals and amendments as new rows.**
