# AI Loading Order — Optimal Context Loading Sequence

Load documents in this order to build context from foundation to specifics.  
All paths are relative to `workspace/`.

---

## Tier 1 — Load First (Always)

| # | File | What it gives you |
|---|---|---|
| 1 | `_ai_bootstrap/AI_CONTEXT.md` | Project overview, current status, critical framings, AI rules |
| 2 | `_ai_bootstrap/PROJECT_CONTEXT.md` | Background, constraints, what's done and not done |
| 3 | `14_Memory/MASTER_PROJECT_MEMORY.md` | Living memory — verified facts, corrections, locked decisions, open questions |
| 4 | `_ai_bootstrap/PROJECT_GLOSSARY.md` | 42-term glossary — all terminology |
| 5 | `00_Source_of_Truth/SOURCE_OF_TRUTH.md` | Document authority registry — which file governs |

---

## Tier 2 — Load for Strategic Context

| # | File | What it gives you |
|---|---|---|
| 5 | `15_Decisions/FOUNDER_DECISIONS.md` | All binding decisions (constitutional) |
| 6 | `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` | Investment thesis + strategic analysis (canonical) |
| 7 | `_navigator/DECISION_STATUS_BOARD.md` | Open/blocked/locked decision snapshot |

---

## Tier 3 — Load for Product Context

| # | File | What it gives you |
|---|---|---|
| 8 | `08_PRD/MASTER_PRD_v1.0.md` | 22 features, 3 personas, data model, state machines |
| 9 | `07_Product/PRODUCT_STRATEGY.md` | SWOT, Porter's Five Forces, PESTEL, product roadmap |
| 10 | `07_Product/GO_TO_MARKET.md` | GTM strategy, brand target list, sequencing |
| 11 | `01_Project_Overview/PROJECT_OVERVIEW.md` | Company overview, values, geographic roadmap |

---

## Tier 4 — Load for Technical Context

| # | File | What it gives you |
|---|---|---|
| 12 | `09_Technical/TECHNICAL_ARCHITECTURE.md` | Full stack, DB design, caching, AI, security, DR |
| 13 | `06_Enterprise_Architecture/ENTERPRISE_ARCHITECTURE.md` | EA domains, capabilities, integration map |
| 14 | `10_AI/AI_STRATEGY.md` | AI philosophy, LLM strategy, prompt management, fraud detection |

---

## Tier 5 — Load for Project Status

| # | File | What it gives you |
|---|---|---|
| 16 | `13_Audits/REMEDIATION_REAUDIT.md` | Current authorization status (67/100, NOT AUTHORIZED) |
| 17 | `15_Decisions/OPEN_DECISIONS_TRACKER.md` | All 4 blocking items with owner and what proves them closed |
| 18 | `_navigator/DECISION_STATUS_BOARD.md` | Blocking / open / locked decision live dashboard |
| 19 | `02_Project_Management/MASTER_DELIVERY_PLAN.md` | Sprint plan, WBS, QA |
| 20 | `13_Audits/READINESS_AUDIT.md` | Full original audit findings |

---

## Tier 6 — Load for Intelligence & Memory

| # | File | What it gives you |
|---|---|---|
| 19 | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` | Competitor analysis, Samplia verification, document corrections |
| 20 | `14_Memory/PROJECT_MEMORY.md` | Persistent project memory — corrections, verified facts, open questions |
| 21 | `03_Research/SOURCE_VIDEO_TRANSCRIPT.md` | Business concept origin (Samplia video, Arabic) |

---

## Tier 7 — Load for Prompts and AI

| # | File | What it gives you |
|---|---|---|
| 24 | `11_Prompts/CHATGPT_PROMPTS.md` | 18-phase DD prompt + peer review synthesis prompt (reusable) |
| 25 | `_ai_bootstrap/AI_WORKFLOW.md` | How to run an AI session — protocol, prompt patterns, closeout checklist |

---

## Tier 8 — Load for Governance (Sprint Work, Execution)

| # | File | What it gives you |
|---|---|---|
| 26 | `15_Decisions/DECISION_LOG.md` | Full decision history — 51 decisions logged |
| 27 | `15_Decisions/ASSUMPTION_REGISTER.md` | All assumptions and validation status |
| 28 | `02_Project_Management/RISK_REGISTER.md` | 20 risks scored; 6 HIGH/CRITICAL flagged |
| 29 | `00_Source_of_Truth/PROJECT_RULES.md` | 25 inviolable project rules |
| 30 | `CONTRIBUTING.md` | How to maintain the workspace |

---

## Context Budget Guidance

| Goal | Load |
|---|---|
| Quick orientation (2 min) | Tier 1 only |
| Strategic review | Tiers 1–2 |
| Product discussion | Tiers 1–3 |
| Technical discussion | Tiers 1, 4 |
| Project status review | Tiers 1, 5 |
| Competitive analysis | Tiers 1, 6 |
| AI / prompt work | Tiers 1, 7 |
| Sprint planning / execution | Tiers 1, 5, 8 |
| Full workspace context | All tiers |
