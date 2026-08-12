# MASTER INDEX — Tajribti Knowledge Workspace

> **Start here.** This is the single entry point for the entire workspace.

**Project:** Tajribti (تجربتي) — Egypt's Consumer Intelligence Platform  
**Status:** ❌ Development NOT Authorized — Readiness Score 67/100  
**Generated:** 2026-07-26 | **Last Updated:** 2026-07-27  
**Source:** 14 inbox files → 120+ workspace files across 25+ folders  

---

## Workspace Structure

```
workspace/
│
├── MASTER_INDEX.md                ← YOU ARE HERE
│
├── 00_FOUNDER_INTENT/             ← LOAD FIRST (every AI session, before AI_BOOTSTRAP)
│   ├── 01_FOUNDER_VISION.md       ← The original idea — WHY this company exists
│   ├── 02_CORE_VALUE_ENGINE.md    ← The minimum chain — WHAT creates value
│   ├── 03_NON_NEGOTIABLE_RULES.md ← 10 rules that cannot be changed
│   ├── 04_WHAT_NOT_TO_BUILD.md    ← The postponement list — WHAT to reject
│   ├── 05_PROJECT_NORTH_STAR.md   ← The single metric — Stage 2+ brand count
│   └── 06_FOUNDER_ALIGNMENT_GATE.md ← MANDATORY GATE — execute after 01–05, before any answer
│
├── AI_BOOTSTRAP/                  ← LOAD SECOND (AI sessions) — 16 purpose-built onboarding files
│   ├── 00_AI_START_HERE.md        ← Read first, every session
│   ├── 01_PROJECT_CONSTITUTION.md ← What IS / IS NOT the project
│   ├── 02_PROJECT_STATE.md        ← Authorization status + blockers
│   ├── 03_FOUNDER_DECISIONS.md    ← All 51 locked decisions
│   ├── 04_CURRENT_OBJECTIVE.md    ← What we're doing right now
│   ├── 05_CURRENT_PHASE.md        ← Track 0 constraints + exit criteria
│   ├── 06_PROJECT_GLOSSARY.md     ← 43+ terms with business/technical/AI meaning
│   ├── 07_DOMAIN_MODEL.md         ← Actors, entities, state machines
│   ├── 08_ARCHITECTURE_MAP.md     ← One-page tech architecture
│   ├── 09_REPOSITORY_MAP.md       ← Full workspace folder structure
│   ├── 10_KNOWLEDGE_MAP.md        ← Where every knowledge type lives
│   ├── 11_AI_RULES.md             ← Operating manual for AI
│   ├── 12_AI_CHECKLIST.md         ← Mandatory checklist before every answer
│   ├── 13_LOADING_ORDER.md        ← Session-type loading recipes
│   ├── 14_CONTEXT_INDEX.md        ← Every file with one-line description
│   └── 15_SOURCE_OF_TRUTH.md      ← Canonical files, authority, conflict resolution
│
├── _ai_bootstrap/                 ← Original AI context files (pre-AI_BOOTSTRAP layer)
│   ├── AI_CONTEXT.md              ← PRIMARY: full project context for AI
│   ├── PROJECT_CONTEXT.md         ← Project background and constraints
│   ├── SYSTEM_OVERVIEW.md         ← Platform architecture diagram
│   ├── PROJECT_GLOSSARY.md        ← 42-term glossary
│   ├── PROJECT_MAP.md             ← Document lineage diagram
│   ├── HOW_TO_START.md            ← Human onboarding guide
│   ├── LOADING_ORDER.md           ← AI context loading sequence
│   └── AI_WORKFLOW.md             ← AI session protocol, prompt patterns, closeout
│
├── _navigator/                    ← Indexes and cross-reference maps
│   ├── DECISION_INDEX.md          ← All 46+ decisions with status
│   ├── DECISION_STATUS_BOARD.md   ← Open/blocked/resolved tracker
│   ├── TOPIC_INDEX.md             ← Knowledge by subject area
│   ├── DOCUMENT_INDEX.md          ← All 14 source files
│   ├── SOURCE_INDEX.md            ← Source file metadata
│   ├── ARCHITECTURE_INDEX.md      ← Tech stack + ADRs
│   ├── PROMPT_INDEX.md            ← AI prompt library
│   ├── MEMORY_INDEX.md            ← Key facts for AI context
│   ├── REPORT_INDEX.md            ← All generated reports
│   └── ENTRY_POINTS.md            ← Find-anything quick guide
│
├── _structured_data/              ← Machine-readable knowledge
│   ├── manifest.json              ← Workspace manifest
│   ├── documents.json             ← Document registry
│   ├── knowledge_graph.json       ← Entity relationships
│   ├── statistics.json            ← Workspace statistics
│   ├── topics.json                ← Extracted topics
│   ├── links.json                 ← All cross-references
│   └── duplicates.json            ← Duplicate detection results
│
├── 00_Source_of_Truth/
│   ├── SOURCE_OF_TRUTH.md         ← Authority registry (which doc governs)
│   └── PROJECT_RULES.md           ← 25 inviolable project rules
│
├── 01_Project_Overview/
│   └── PROJECT_OVERVIEW.md        ← Mission, model, roadmap, status
│
├── 02_Project_Management/
│   ├── MASTER_DELIVERY_PLAN.md    ← WBS, sprints, risks, QA, DevOps
│   ├── RISK_REGISTER.md           ← Full risk register — 20 risks scored
│   └── SPRINT_MEMORY_TEMPLATE.md  ← Sprint capture template (copy per sprint)
│
├── 03_Research/
│   └── SOURCE_VIDEO_TRANSCRIPT.md ← Original Samplia video transcript (Arabic)
│
├── 04_Investment/
│   ├── INVESTMENT_DUE_DILIGENCE_REPORT_v2.md  ← CANONICAL (19K words)
│   ├── IC_MEMO_v1.0.md            ← IC Memo + conditional GO
│   └── IC_REPORT_TEMPLATE.md      ← Original Arabic working draft
│
├── 05_EBOS/                       ← MEOS v1 — Track 0 operational system
│   ├── MEOS_v1_Production_Spec.md     ← MEOS full specification (58KB)
│   ├── MEOS_v1_Operational_Handover.md ← How to operate the workbook (read before opening)
│   ├── MEOS_v1_Production_Certificate.md ← 9/9 quality gates APPROVED
│   ├── MEOS_v1_Release_Notes.md       ← 9 patches: v1.0 → v1.0.1
│   ├── MEOS_v1_Sprint_Completion_Report.md ← Sprint record + known gaps
│   └── MEOS_v1_Track0.xlsx            ← THE workbook (binary — open in Excel)
│
├── 06_Enterprise_Architecture/
│   └── ENTERPRISE_ARCHITECTURE.md ← EA domains, capabilities, tech decisions
│
├── 07_Product/
│   ├── PRODUCT_STRATEGY.md        ← Product vision, roadmap, feature prioritization
│   └── GO_TO_MARKET.md            ← GTM strategy, brand targeting, sequencing
│
├── 08_PRD/
│   └── MASTER_PRD_v1.0.md         ← 22 features, 3 personas, data model, state machines
│
├── 09_Technical/
│   └── TECHNICAL_ARCHITECTURE.md  ← Stack, DB, caching, AI, security, DR
│
├── 10_AI/
│   └── AI_STRATEGY.md             ← LLM strategy, prompt management, data intelligence
│
├── 11_Prompts/
│   └── CHATGPT_PROMPTS.md         ← 18-phase DD prompt + peer review synthesis prompt
│
├── 12_Reviews/
│   └── PEER_REVIEW_MASTER_REPORT.md ← Independent peer review + master report
│
├── 13_Audits/
│   ├── READINESS_AUDIT.md         ← IERB audit — 58/100 NOT AUTHORIZED
│   └── REMEDIATION_REAUDIT.md     ← Post-remediation — 67/100 NOT AUTHORIZED
│
├── 14_Memory/
│   ├── PROJECT_MEMORY.md          ← Persistent knowledge for AI sessions
│   └── MASTER_PROJECT_MEMORY.md   ← MASTER — load every session; supersedes PROJECT_MEMORY
│
├── 15_Decisions/
│   ├── FOUNDER_DECISIONS.md       ← FDD — constitutional source of truth
│   ├── OPEN_DECISIONS_TRACKER.md  ← Live tracker for unresolved decisions
│   ├── DECISION_LOG.md            ← Full chronological record of all 51 decisions
│   └── ASSUMPTION_REGISTER.md     ← All assumptions with validation status
│
├── 16_Reports/
│   ├── WORKSPACE_REPORT.md        ← Workspace generation summary
│   ├── CLASSIFICATION_REPORT.md   ← Document classification
│   ├── KNOWLEDGE_REPORT.md        ← Knowledge extraction summary
│   ├── STATISTICS_REPORT.md       ← Workspace statistics
│   ├── QUALITY_REPORT.md          ← Quality assessment
│   ├── MEMORY_REPORT.md           ← Memory items report
│   └── PROMPT_REPORT.md           ← Prompt analysis report
│
├── 17_Final/
│   ├── WORKSPACE_AUDIT.md         ← Enterprise Knowledge Architect audit
│   ├── READY_FOR_AI.md            ← AI readiness certification
│   └── FINAL_QUALITY_SCORE.md     ← Final scored assessment (91/100)
│
├── 18_Archive/                    ← Superseded document versions
│   └── SUPERSEDED_DOCUMENTS.md    ← Registry of superseded files
│
├── Sales_Execution_Pack/          ← Track 0 commercial toolkit (APPROVED — ready for use)
│   ├── 01_Sales_Playbook.md       ← Complete brand sales process, scripts, objections
│   ├── 02_Brand_OnePager.md       ← One-page client-facing brand brief
│   ├── 03_LOI_Template.md         ← Letter of Intent template (3 package tiers)
│   ├── Production_Acceptance_Review_v1.0.md ← PAR — APPROVED 97/100 (P-01, P-02 applied)
│   └── 04_Legal/
│       ├── Egyptian_LLC_Checklist.md ← Closes B-02 (Egyptian LLC incorporation)
│       └── PDPL_Lawyer_Brief.md   ← Closes B-03 (PDPL legal sign-off)
│
└── docs/                          ← Repository analysis and governance
    ├── Repository_Remediation_Master_Plan_v1.md ← APPROVED remediation plan
    ├── governance/
    │   └── PROJECT_ARCHITECTURE_CONSTITUTION.md ← PAC v1.0 — 25 CAD decisions (LOCKED)
    └── audit/
        ├── AUDIT_INDEX.md
        ├── PART1_REPOSITORY_INVENTORY.md
        ├── PART2A_FILE_REVIEW_CARDS_FOUNDER_BOOTSTRAP.md
        ├── PART2B_FILE_REVIEW_CARDS_CORE_DOCS.md
        ├── PART2C_FILE_REVIEW_CARDS_REMAINING.md
        └── PART5_TO_10_REMAINING_REPORTS.md

CHANGELOG.md                       ← Workspace version history (root)
CONTRIBUTING.md                    ← How to maintain this workspace (root)
```

---

## Quick Navigation by Role

### Running Track 0 sales (brand outreach)?
→ `Sales_Execution_Pack/01_Sales_Playbook.md` — complete sales process  
→ `Sales_Execution_Pack/02_Brand_OnePager.md` — send to brand prospects  
→ `Sales_Execution_Pack/03_LOI_Template.md` — complete and send when ready  
→ `05_EBOS/MEOS_v1_Operational_Handover.md` — how to use the tracking workbook  
→ `05_EBOS/MEOS_v1_Track0.xlsx` — the daily tracking workbook (open in Excel)

### New to the project?
→ `_ai_bootstrap/AI_CONTEXT.md` (2 min read)  
→ `01_Project_Overview/PROJECT_OVERVIEW.md`  
→ `15_Decisions/FOUNDER_DECISIONS.md`

### Investor or reviewer?
→ `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` (canonical)  
→ `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` (corrections + final master)  
→ `17_Final/FINAL_QUALITY_SCORE.md`

### Product or engineering?
→ `08_PRD/MASTER_PRD_v1.0.md`  
→ `09_Technical/TECHNICAL_ARCHITECTURE.md`  
→ `02_Project_Management/MASTER_DELIVERY_PLAN.md`

### Checking project status?
→ `13_Audits/REMEDIATION_REAUDIT.md` — ❌ NOT AUTHORIZED, 67/100  
→ `15_Decisions/OPEN_DECISIONS_TRACKER.md` — 4 blocking items  
→ `_navigator/DECISION_STATUS_BOARD.md`

### Starting a sprint?
→ `02_Project_Management/SPRINT_MEMORY_TEMPLATE.md` — copy per sprint  
→ `15_Decisions/ASSUMPTION_REGISTER.md` — assumptions to validate  
→ `02_Project_Management/RISK_REGISTER.md` — risks to monitor

### Need project rules?
→ `00_Source_of_Truth/PROJECT_RULES.md`  
→ `CONTRIBUTING.md`

### AI assistant?
→ Load `00_FOUNDER_INTENT/` (6 files) first — mandatory gate  
→ Then `AI_BOOTSTRAP/00_AI_START_HERE.md`  
→ Then `AI_BOOTSTRAP/13_LOADING_ORDER.md` for session-type loading recipes (includes Track 0 Sales Session)  
→ See `_ai_bootstrap/AI_WORKFLOW.md` for session protocol

---

## Authorization Status

| Status | Score | Blocking Items |
|---|---|---|
| ❌ Development NOT Authorized | 67/100 | 4 — see below |

| # | Blocking Item | Owner |
|---|---|---|
| B-01 | Track 0 GO decision confirmation | Founder / IC |
| B-02 | Egyptian LLC incorporation confirmed | Founder |
| B-03 | PDPL legal sign-off obtained | Legal counsel |
| B-04 | QR concurrency load test executed | Engineering |

---

## Document Authority Chain

```
SOURCE_OF_TRUTH.md
    ↓
Founder Decisions Document (FDD)  [Constitutional — governs all]
    ↓
IC Due Diligence Report v2.0      [Canonical investment thesis]
    ↓
Master PRD v1.0                   [Product authority]
Technical Architecture v1.0       [Tech authority]
Master Delivery Plan v1.0         [Delivery authority]
    ↓
Readiness Audit → Remediation     [Authorization gate]
```

---

*Workspace v4.2 — Permanent source of truth. See `CHANGELOG.md` for version history. See `CONTRIBUTING.md` to maintain this workspace.*
