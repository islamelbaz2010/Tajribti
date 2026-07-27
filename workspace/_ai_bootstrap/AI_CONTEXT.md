# AI Context — Tajribti Knowledge Workspace

> **Load this file first.** This is the primary context document for any AI model working on this project.

**Version:** 2.0 (reviewed 2026-07-27)  
**Project:** Tajribti (تجربتي) — Egypt's Consumer Intelligence Platform  
**Status:** ❌ Development NOT Authorized | Readiness Score: 67/100  

---

## Section 1 — What This Is

**Tajribti** is a pre-launch Consumer Intelligence Platform for Egypt. It converts physical product trials into structured, brand-actionable consumer data within 24 hours.

### The One Sentence That Matters Most

> The business is NOT a sampling company. It is a Consumer Intelligence Platform where free product samples are the consumer acquisition mechanic. Data is the product. Brands pay. Consumers receive free products in exchange for honest feedback.

This reframing changes the valuation, scalability, defensibility, exit options, and every strategic decision. **Never describe Tajribti as a sampling company.**

---

## Section 2 — Current Status

| Dimension | Status |
|---|---|
| Development authorization | ❌ NOT AUTHORIZED |
| Readiness score | 67/100 (improved from 58 after remediation) |
| Authorized activity | Track 0 only — $15K–$25K commercial validation sprint, 60 days |
| Engineering | Has not started |
| Brand pilots | Not yet secured |
| Legal entity | Not yet confirmed incorporated |
| PDPL legal review | Not yet completed |

### 4 Blocking Items (must all be resolved before Track 1 begins)

| # | Item | Owner |
|---|---|---|
| B-01 | Track 0 commercial sprint GO/NO-GO confirmation | Founder / IC |
| B-02 | Egyptian LLC incorporation confirmed | Founder |
| B-03 | PDPL written legal sign-off | Legal counsel |
| B-04 | QR concurrency load test executed | Engineering (not yet hired) |

---

## Section 3 — The Business Model

```
BRAND (Coca-Cola, Nestlé, P&G, L'Oréal, etc.)
  → Pays campaign fee ($4K–$20K — illustrative, unvalidated)
  → Receives: structured consumer data, demographics, purchase intent, survey responses

CONSUMER (Egyptian, age 18–40, Cairo)
  → Receives: free product sample + rewards
  → Gives: demographic profile + post-trial survey (3–5 questions, <3 min)

TAJRIBTI (the platform intermediary)
  → Connects brands and consumers
  → Converts physical product trial into data within 24 hours
  → Revenue: campaign fees + per-sample fees + AI dashboard subscription + panel access + Enterprise API
```

**Revenue principle:** Brands pay. Consumers never pay.

---

## Section 4 — Key Entities

| Entity | Role |
|---|---|
| Tajribti | The platform (pre-launch; no production code) |
| Samplia (Spain) | Reference company — founded 2013, bootstrapped, ~40–50M samples, ~2M users, ~127 global competitors |
| Marketeers Research | **Primary near-direct Egyptian competitor** — AI-powered FMCG analytics "Smart Value™" in Egypt/KSA/GCC/Europe |
| Egyptian LLC | Legal entity — not yet confirmed incorporated |
| FDD | Founder Decisions Document — constitutional authority for all decisions |
| IERB | Independent Executive Review Board — issued the Readiness Audit |

---

## Section 5 — Technology Stack

| Layer | Technology |
|---|---|
| Consumer app | Flutter (cross-platform mobile, RTL-first, lower-end Android) |
| Brand dashboard | React web (desktop-first) |
| Admin portal | React web (internal) |
| Core API | NestJS (TypeScript) — modular monolith |
| AI service | Python / FastAPI — satellite service |
| Database | PostgreSQL (AWS RDS Multi-AZ) |
| Cache + queues | Redis (ElastiCache) + BullMQ (internal) + AWS SQS (cross-module) |
| Auth | Passport.js — OTP + JWT + OAuth2 |
| Cloud | AWS ECS, autoscaled, multi-AZ, Terraform IaC |
| Region | AWS me-south-1 Bahrain (provisional) |
| LLM APIs | OpenAI + Anthropic (multi-provider, no lock-in) |

Architecture: Modular monolith — right-sized for a 2–3 engineer Year-1 team.

---

## Section 6 — Document Authority Chain

When documents conflict, this order governs:

1. `15_Decisions/FOUNDER_DECISIONS.md` — constitutional; governs all
2. `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` — canonical investment thesis
3. `08_PRD/MASTER_PRD_v1.0.md` — product authority
4. `09_Technical/TECHNICAL_ARCHITECTURE.md` — tech authority
5. `02_Project_Management/MASTER_DELIVERY_PLAN.md` — delivery authority
6. `13_Audits/REMEDIATION_REAUDIT.md` — latest authorization status

**Superseded** (do not use as primary reference): IC Report Template, IC Memo PDF v1.0, IC Memo Final v1.0 — all superseded by IC Due Diligence v2.0.

---

## Section 7 — Critical Facts

| # | Fact | Consequence if missed |
|---|---|---|
| 1 | "No direct Egyptian competitor" is INCORRECT | Marketeers Research is a near-direct competitor — differentiation must be on sampling-to-data pipeline |
| 2 | Samplia is bootstrapped, not VC-backed | Growth assumptions must be tempered; Egypt model is a redesign, not a venture-scale replication |
| 3 | All financial figures are illustrative only | Never present as validated; no unit economics have been built |
| 4 | "Tajribti" is a provisional name | Do not use in legal filings, code repos, or brand assets until trademark cleared |
| 5 | PDPL is a gate, not a risk to accept | Cannot ship data-collecting features without written legal sign-off |
| 6 | Cairo only in Year 1 | No geographic expansion before unit economics are proven |
| 7 | GCC expansion is a hard gate | Not a calendar date — only unlocks after Egypt is proven |
| 8 | No primary research has been conducted | All demand is assumed; zero brand or consumer interviews |

---

## Section 8 — AI Assistant Rules

| Rule | Reason |
|---|---|
| Never call Tajribti a "sampling company" | FDD mandates Consumer Intelligence Platform positioning |
| Never present financial figures as validated forecasts | All illustrative — stated explicitly in every document |
| Never assume development is authorized | 4 blocking items remain open |
| Never say there are no direct Egyptian competitors | Marketeers Research is a near-direct competitor |
| Never treat "Tajribti" as a confirmed brand name | Provisional, pending trademark clearance |
| Always cite confidence + sample size in AI narratives | FDD brand communication principle — non-negotiable |
| Always sequence GTM: brand supply before consumer demand | B2B-first model — no brands = no campaigns = no panel |
| Never suggest permanent kiosk installations for Egypt | Egypt design uses portable kiosks — not permanent fixtures |

---

## Section 9 — Workspace Navigation

| Need | Go to |
|---|---|
| All decisions (locked + open) | `_navigator/DECISION_INDEX.md` |
| What is blocking development | `_navigator/DECISION_STATUS_BOARD.md` |
| Product features (22 features) | `08_PRD/MASTER_PRD_v1.0.md` |
| Technology stack | `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| Sprint plan and delivery | `02_Project_Management/MASTER_DELIVERY_PLAN.md` |
| Investment thesis | `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` |
| Competitor analysis | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` |
| Authorization status | `13_Audits/REMEDIATION_REAUDIT.md` |
| Definitions | `_ai_bootstrap/PROJECT_GLOSSARY.md` |
| AI loading sequence | `_ai_bootstrap/LOADING_ORDER.md` |
| SWOT + Porter's + PESTEL | `07_Product/PRODUCT_STRATEGY.md` |
| GTM strategy | `07_Product/GO_TO_MARKET.md` |
| AI strategy | `10_AI/AI_STRATEGY.md` |
| Persistent memory | `14_Memory/PROJECT_MEMORY.md` |

---

*Reviewed by Enterprise Knowledge Architect — 2026-07-27*
