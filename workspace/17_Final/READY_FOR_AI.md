# Ready for AI — Workspace Readiness Certification

**Certification Date:** 2026-07-27  
**Workspace:** Tajribti — Egypt's Consumer Intelligence Platform  
**Certifying Agent:** Enterprise Knowledge Architect  
**Status:** CERTIFIED — READY FOR AI COLLABORATION  

---

## Certification Summary

This workspace is certified ready for multi-session AI collaboration. An AI assistant loading this workspace can orient itself, understand the project, serve the founder accurately, and avoid known errors — without requiring explanatory messages from the user in each new session.

---

## What "Ready for AI" Means

A workspace is ready for AI when an AI assistant can:

1. Load it cold and understand the project in under 60 seconds
2. Know which documents are authoritative and which are superseded
3. Know what has been decided and what has not
4. Know the current authorization status and why
5. Know the verified facts and the known corrections
6. Know how to serve each role (Founder, Investor, Developer, PM)
7. Avoid repeating known errors (wrong founding year, wrong company framing, etc.)
8. Know what NOT to assume (e.g., do not assume development is authorized)

This workspace passes all 8 tests.

---

## AI Entry Point

**Start here every session:**

```
workspace/_ai_bootstrap/AI_CONTEXT.md
```

This file is the single most important file in the workspace. It contains:
- Project framing (correct name, correct category, correct model)
- Current authorization status (Track 0 only — development NOT authorized)
- The 4 blocking items and what closes each
- Key entities and their roles
- Technology stack summary
- Document authority chain (which file governs)
- Critical facts table (with corrections)
- AI assistant rules (9 rules for accurate behavior)
- Workspace navigation guide
- Build notes and constraints

---

## Recommended Loading Order

Load in this sequence for a productive session. Tier 1 is mandatory; all others are context-dependent.

| Tier | Purpose | Files |
|---|---|---|
| 1 | Foundation (always load) | `AI_CONTEXT.md`, `PROJECT_CONTEXT.md`, `PROJECT_GLOSSARY.md`, `SOURCE_OF_TRUTH.md` |
| 2 | Strategy | `FOUNDER_DECISIONS.md`, `INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`, `DECISION_STATUS_BOARD.md` |
| 3 | Product | `MASTER_PRD_v1.0.md`, `PRODUCT_STRATEGY.md`, `GO_TO_MARKET.md`, `PROJECT_OVERVIEW.md` |
| 4 | Technical | `TECHNICAL_ARCHITECTURE.md`, `ENTERPRISE_ARCHITECTURE.md`, `AI_STRATEGY.md` |
| 5 | Status | `REMEDIATION_REAUDIT.md`, `OPEN_DECISIONS_TRACKER.md`, `MASTER_DELIVERY_PLAN.md` |
| 6 | Memory | `PEER_REVIEW_MASTER_REPORT.md`, `PROJECT_MEMORY.md`, `SOURCE_VIDEO_TRANSCRIPT.md` |
| 7 | Prompts | `CHATGPT_PROMPTS.md` |

---

## AI Assistant Rules (Summary)

These rules are drawn from `AI_CONTEXT.md`. They govern behavior in every session.

| Rule | Instruction |
|---|---|
| Name | Use "Tajribti (تجربتي)" with Arabic. Use "the platform" or "the product" generically. Do NOT say "Samplia Egypt" |
| Category | This is a Consumer Intelligence Platform. NOT a "sampling company." |
| Development status | Development is NOT authorized. Do not suggest writing code, hiring engineers, or building anything until the 4 blocking items are resolved |
| Decisions | All binding decisions are in FOUNDER_DECISIONS.md. Do not suggest overriding them unless the Founder explicitly asks you to reconsider |
| Figures | All financial figures in documents are illustrative. Do not present them as validated |
| Authority | When documents conflict, follow the authority chain: FDD > IC v2.0 > PRD > REMEDIATION_REAUDIT |
| Corrections | Samplia was founded in 2013 (not 2019). Samplia is bootstrapped (not venture-backed). Tajribti's provisional name is unregistered |
| Framing | The Founder is an operator-type founder, not a venture fundraiser. Frame advice accordingly |
| Track 0 | The immediate next step is the $15K–$25K commercial validation sprint. Do not skip to Track 1 |

---

## Workspace Coverage by Domain

| Domain | Coverage | Files |
|---|---|---|
| Investment analysis | Full | `04_Investment/` (3 files) |
| Founding decisions | Full | `15_Decisions/FOUNDER_DECISIONS.md` |
| Product requirements | Full | `08_PRD/MASTER_PRD_v1.0.md` |
| Technical architecture | Full | `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| AI strategy | Full | `10_AI/AI_STRATEGY.md` |
| Enterprise architecture | Full | `06_Enterprise_Architecture/ENTERPRISE_ARCHITECTURE.md` |
| Product strategy + SWOT | Full | `07_Product/PRODUCT_STRATEGY.md` |
| Go-to-market | Full | `07_Product/GO_TO_MARKET.md` |
| Delivery plan | Full | `02_Project_Management/MASTER_DELIVERY_PLAN.md` |
| Readiness audits | Full | `13_Audits/` (2 files) |
| Competitor analysis | Full | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` |
| Prompt library | Full | `11_Prompts/CHATGPT_PROMPTS.md` |
| Decision tracking | Full | `15_Decisions/OPEN_DECISIONS_TRACKER.md`, `_navigator/DECISION_STATUS_BOARD.md` |
| Glossary | Full (42 terms) | `_ai_bootstrap/PROJECT_GLOSSARY.md` |
| Source video research | Full | `03_Research/SOURCE_VIDEO_TRANSCRIPT.md` |
| Persistent memory | Full | `14_Memory/PROJECT_MEMORY.md` |
| Unit economics | NOT COVERED — requires Track 0 validation | — |
| Primary customer research | NOT COVERED — zero interviews conducted | — |
| Legal / PDPL review | NOT COVERED — requires legal counsel | — |

---

## Supported AI Workflows

The following AI workflows are supported by the workspace as-is:

**Strategic sessions:**
- Investment committee preparation → load Tiers 1–2
- Competitive positioning → load Tiers 1, 2, 6
- GTM planning → load Tiers 1–3

**Product sessions:**
- Feature prioritization → load Tiers 1–3
- PRD extension → load Tiers 1, 3, 4
- User story writing → load Tiers 1, 3

**Technical sessions:**
- Architecture review → load Tiers 1, 4
- Tech stack debate → load Tiers 1, 4
- Sprint planning → load Tiers 1, 4, 5

**Decision sessions:**
- Blocking item resolution → load Tiers 1, 2, 5
- FDD review or amendment → load Tiers 1, 2
- Open decision closure → load Tiers 1, 5

**AI/prompt sessions:**
- Prompt reuse and adaptation → load Tiers 1, 7
- LLM vendor evaluation → load Tiers 1, 4

---

## Session Start Template

Paste this into any new AI session to orient the assistant immediately:

```
I am working on Tajribti (تجربتي), Egypt's Consumer Intelligence Platform.
This is a B2B2C platform: brands pay, consumers receive free product samples, 
the platform provides post-trial behavioral data.

My workspace is organized with the following AI bootstrap files:
- Start with: workspace/_ai_bootstrap/AI_CONTEXT.md
- Then load: workspace/_ai_bootstrap/PROJECT_CONTEXT.md
- Then load: workspace/_ai_bootstrap/PROJECT_GLOSSARY.md

The current status is: development NOT authorized (IERB score 67/100).
4 blocking items remain open. The immediate next step is Track 0: 
commercial validation sprint, $15K–$25K, 60 days, no engineering.

The authoritative decision source is: workspace/15_Decisions/FOUNDER_DECISIONS.md
The canonical investment analysis is: workspace/04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md
```

---

## Certification Sign-off

| Dimension | Status |
|---|---|
| AI entry point exists and is accurate | PASS |
| Loading order documented | PASS |
| AI rules documented and complete | PASS |
| Glossary complete | PASS (42 terms) |
| Broken links resolved | PASS |
| Superseded documents flagged | PASS |
| Persistent memory populated | PASS |
| Authorization status clearly stated | PASS |
| Decision authority chain clear | PASS |
| Source files immutable and intact | PASS |

**Overall: CERTIFIED — READY FOR AI COLLABORATION**

---

*Enterprise Knowledge Architect — Certification issued 2026-07-27*
