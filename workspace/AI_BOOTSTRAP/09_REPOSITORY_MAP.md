# Repository Map — Workspace Structure

**Complete map of the workspace folder structure, document hierarchy, and navigation.**  
Source: `_navigator/DOCUMENT_INDEX.md`, `MASTER_INDEX.md`, `_structured_data/manifest.json`, direct workspace read

---

## Workspace Root

```
workspace/
├── MASTER_INDEX.md               ← Master navigation index (start here for humans)
├── CHANGELOG.md                  ← Version history, append-only
├── CONTRIBUTING.md               ← How to work in this workspace
│
├── 00_FOUNDER_INTENT/            ← LOAD FIRST (every AI session) — Founder governance layer
│   ├── 01_FOUNDER_VISION.md      ← WHY this company exists — the original idea
│   ├── 02_CORE_VALUE_ENGINE.md   ← WHAT creates value — the minimum 7-step chain
│   ├── 03_NON_NEGOTIABLE_RULES.md ← 10 rules that cannot be changed
│   ├── 04_WHAT_NOT_TO_BUILD.md   ← The postponement list — what to reject
│   ├── 05_PROJECT_NORTH_STAR.md  ← The single metric — Stage 2+ brand count
│   └── 06_FOUNDER_ALIGNMENT_GATE.md ← MANDATORY GATE — execute before any answer
│
├── AI_BOOTSTRAP/                 ← AI onboarding layer (this folder) — v1.1 FROZEN
│   ├── 00_AI_START_HERE.md
│   ├── 01_PROJECT_CONSTITUTION.md
│   ├── 02_PROJECT_STATE.md
│   ├── 03_FOUNDER_DECISIONS.md
│   ├── 04_CURRENT_OBJECTIVE.md
│   ├── 05_CURRENT_PHASE.md
│   ├── 06_PROJECT_GLOSSARY.md
│   ├── 07_DOMAIN_MODEL.md
│   ├── 08_ARCHITECTURE_MAP.md
│   ├── 09_REPOSITORY_MAP.md      ← You are here
│   ├── 10_KNOWLEDGE_MAP.md
│   ├── 11_AI_RULES.md
│   ├── 12_AI_CHECKLIST.md
│   ├── 13_LOADING_ORDER.md       ← Includes Track 0 Sales Session type (added v4.2)
│   ├── 14_CONTEXT_INDEX.md
│   ├── 15_SOURCE_OF_TRUTH.md
│   ├── AI_SESSION_TEMPLATE.md    ← Mandatory session opener template (v4.1)
│   ├── BOOTSTRAP_FREEZE_REPORT.md ← Certification audit 98/100 FROZEN (v4.1)
│   ├── BOOTSTRAP_VERSION.md      ← Bootstrap version record (v4.1)
│   ├── PROJECT_FINGERPRINT.json  ← Machine-readable project identity (v4.1)
│   └── TRACEABILITY_INDEX.md     ← Every Bootstrap claim mapped to source (v4.1)
│
├── _ai_bootstrap/                ← Original AI context files (pre-AI_BOOTSTRAP layer)
│   ├── AI_CONTEXT.md             ← Project context for AI sessions
│   ├── AI_WORKFLOW.md            ← AI session protocol
│   ├── HOW_TO_START.md           ← Role-based onboarding
│   ├── LOADING_ORDER.md          ← File loading sequence
│   ├── PROJECT_CONTEXT.md        ← What's done / not done
│   ├── PROJECT_GLOSSARY.md       ← 43 business/technical terms
│   ├── PROJECT_MAP.md            ← Document lineage + authorization gate
│   ├── SYSTEM_OVERVIEW.md        ← Business/infra ASCII diagrams
│   └── SYSTEM_PROMPTS.md         ← Starting prompts for AI sessions
│
├── _navigator/                   ← Human navigation indexes
│   ├── ARCHITECTURE_INDEX.md     ← Tech stack, ADRs, system boundaries
│   ├── DECISION_INDEX.md         ← All 51 decisions organized by type
│   ├── DECISION_STATUS_BOARD.md  ← Open/locked/provisional status board
│   ├── DOCUMENT_INDEX.md         ← All workspace documents indexed
│   ├── ENTRY_POINTS.md           ← Task → entry point quick reference
│   ├── MEMORY_INDEX.md           ← Key facts and corrections index
│   ├── PROMPT_INDEX.md           ← Prompts and templates indexed
│   ├── REPORT_INDEX.md           ← All reports indexed
│   ├── SOURCE_INDEX.md           ← Source (inbox) files indexed
│   └── TOPIC_INDEX.md            ← Knowledge organized by 9 subject areas
│
├── _structured_data/             ← Machine-readable structured data
│   ├── documents.json            ← All documents metadata
│   ├── duplicates.json           ← Duplicate/related content pairs
│   ├── knowledge_graph.json      ← 14 document nodes + 5 concept nodes, 22 edges
│   ├── links.json                ← Cross-reference links between files
│   ├── manifest.json             ← Workspace structure metadata
│   ├── statistics.json           ← 43,762 total words, 14 source files, key metrics
│   └── topics.json               ← Topic classification data
│
├── 00_Source_of_Truth/           ← Canonical governance files
│   ├── PROJECT_RULES.md          ← 25 binding rules across 7 categories
│   ├── SOURCE_OF_TRUTH.md        ← Authority registry, superseded docs
│   └── SUPERSEDED_DOCUMENTS.md  ← Documents superseded by newer versions
│
├── 01_Project_Overview/          ← Project summary and mission
│   └── PROJECT_OVERVIEW.md       ← Mission, vision, north star, business model
│
├── 02_Project_Management/        ← Delivery, sprints, risks, assumptions
│   ├── MASTER_DELIVERY_PLAN.md   ← WBS, sprint 0–6, resource plan, QA, DevOps
│   ├── RISK_REGISTER.md          ← 20 risks across 5 categories
│   ├── SPRINT_MEMORY_TEMPLATE.md ← Template for sprint capture
│   └── sprints/
│       └── README.md             ← Sprint files will be created here
│
├── 03_Research/                  ← Source material and primary research
│   └── SOURCE_VIDEO_TRANSCRIPT.md ← Arabic Samplia video (project genesis)
│
├── 04_Investment/                ← Investment analysis and IC materials
│   ├── IC_MEMO_v1.0.md           ← IC memo — Conditional GO recommendation
│   ├── IC_REPORT_TEMPLATE.md     ← Working draft (Arabic original)
│   └── INVESTMENT_DUE_DILIGENCE_REPORT_v2.md ← Canonical 19K-word due diligence
│
├── 05_EBOS/                      ← MEOS v1 — Track 0 operational system
│   ├── MEOS_v1_Production_Spec.md    ← Full MEOS specification (58KB)
│   ├── MEOS_v1_Operational_Handover.md ← How to operate the workbook (read before opening)
│   ├── MEOS_v1_Production_Certificate.md ← 9/9 quality gates APPROVED
│   ├── MEOS_v1_Release_Notes.md      ← 9 patches: v1.0 → v1.0.1
│   ├── MEOS_v1_Sprint_Completion_Report.md ← Sprint record + known gaps
│   ├── MEOS_v1_Track0.xlsx           ← THE workbook (binary — open in Excel/Sheets)
│   └── README.md                     ← Directory stub
│
├── 06_Enterprise_Architecture/   ← EA domain and capability model
│   └── ENTERPRISE_ARCHITECTURE.md ← 5-domain EA map, capabilities, integrations
│
├── 07_Product/                   ← Product strategy, GTM, roadmap
│   ├── GO_TO_MARKET.md           ← GTM sequence, 14 brand targets, kill criterion
│   └── PRODUCT_STRATEGY.md       ← SWOT, Porter's Five Forces, PESTEL, roadmap
│
├── 08_PRD/                       ← Product Requirements Document
│   └── MASTER_PRD_v1.0.md        ← 22 features, 3 personas, data model, state machines
│
├── 09_Technical/                 ← Technical architecture
│   └── TECHNICAL_ARCHITECTURE.md ← 5-layer architecture, all stack decisions
│
├── 10_AI/                        ← AI strategy and design
│   └── AI_STRATEGY.md            ← AI philosophy, LLM strategy, TJ-018, TJ-021
│
├── 11_Prompts/                   ← Prompts and templates
│   └── CHATGPT_PROMPTS.md        ← 18-phase due diligence prompt structure
│
├── 12_Reviews/                   ← Quality reviews and peer review
│   └── PEER_REVIEW_MASTER_REPORT.md ← Corrections, competitor discovery, verified facts
│
├── 13_Audits/                    ← Investment readiness audits
│   └── REMEDIATION_REAUDIT.md    ← Latest audit: 67/100, blocking items, NOT AUTHORIZED
│
├── 14_Memory/                    ← AI memory and project memory
│   └── MASTER_PROJECT_MEMORY.md  ← Living memory: 14 sections, supersedes PROJECT_MEMORY.md
│
├── 15_Decisions/                 ← Decision tracking
│   ├── ASSUMPTION_REGISTER.md    ← 40 assumptions across 5 categories
│   ├── DECISION_LOG.md           ← Chronological append-only decision log (51 decisions)
│   ├── FOUNDER_DECISIONS.md      ← FDD: constitutional document
│   └── OPEN_DECISIONS_TRACKER.md ← 4 blocking + 5 non-blocking open decisions
│
├── 16_Reports/                   ← Generated analytical reports
│   ├── CLASSIFICATION_REPORT.md
│   ├── KNOWLEDGE_REPORT.md       ← Decision counts, insights, KPIs, open questions
│   ├── MEMORY_REPORT.md
│   ├── PROMPT_REPORT.md
│   ├── QUALITY_REPORT.md         ← Overall 84/100 quality assessment
│   ├── STATISTICS_REPORT.md
│   └── WORKSPACE_REPORT.md       ← Source files processed, workspace files generated
│
├── 17_Final/                     ← Final audit files
│   ├── FINAL_QUALITY_SCORE.md    ← Final score 91/100
│   ├── READY_FOR_AI.md           ← AI readiness certification
│   └── WORKSPACE_AUDIT.md        ← 26 improvements, 68→91 score
│
├── 18_Archive/                   ← Superseded document versions
│   └── SUPERSEDED_DOCUMENTS.md   ← Registry of superseded files
│
├── Sales_Execution_Pack/         ← Track 0 commercial toolkit — APPROVED (PAR 97/100)
│   ├── 01_Sales_Playbook.md      ← Complete brand sales process, scripts, objections, MEOS workflow
│   ├── 02_Brand_OnePager.md      ← One-page client-facing brand brief
│   ├── 03_LOI_Template.md        ← LOI template (3 package tiers)
│   ├── Production_Acceptance_Review_v1.0.md ← PAR — APPROVED, P-01+P-02 applied 2026-07-27
│   └── 04_Legal/
│       ├── Egyptian_LLC_Checklist.md ← Closes B-02 (Egyptian LLC incorporation)
│       └── PDPL_Lawyer_Brief.md  ← Closes B-03 (PDPL legal sign-off)
│
└── docs/                         ← Repository analysis and governance
    ├── Repository_Remediation_Master_Plan_v1.md ← APPROVED remediation blueprint
    ├── governance/
    │   └── PROJECT_ARCHITECTURE_CONSTITUTION.md ← PAC v1.0 — 25 CAD decisions (LOCKED)
    └── audit/
        ├── AUDIT_INDEX.md
        ├── PART1_REPOSITORY_INVENTORY.md
        ├── PART2A_FILE_REVIEW_CARDS_FOUNDER_BOOTSTRAP.md
        ├── PART2B_FILE_REVIEW_CARDS_CORE_DOCS.md
        ├── PART2C_FILE_REVIEW_CARDS_REMAINING.md
        └── PART5_TO_10_REMAINING_REPORTS.md
```

---

## Inbox (Source Files — IMMUTABLE)

```
../inbox/                         ← NEVER MODIFY / RENAME / DELETE / OVERWRITE
├── *.docx
├── *.pdf
├── *.txt
├── *.md
├── *.html
├── *.csv
├── *.xlsx
├── *.pptx
├── *.json
├── *.yaml
├── *.xml
├── *.png
├── *.jpg
├── *.jpeg
└── *.zip
```

The inbox contains the 14 source documents from which this entire workspace was built. All source documents are downstream of the Samplia video (project genesis). Do not touch these files under any circumstances.

*Source: `00_Source_of_Truth/PROJECT_RULES.md` RULE-W-01; `00_Source_of_Truth/SOURCE_OF_TRUTH.md`*

---

## Quick Navigation by Task

| Task | Go to |
|---|---|
| Start a new AI session | `00_FOUNDER_INTENT/` (6 files) → `AI_BOOTSTRAP/00_AI_START_HERE.md` |
| Prepare for a brand call | `Sales_Execution_Pack/01_Sales_Playbook.md` |
| Send to a brand prospect | `Sales_Execution_Pack/02_Brand_OnePager.md` |
| Issue or track an LOI | `Sales_Execution_Pack/03_LOI_Template.md` + `05_EBOS/MEOS_v1_Operational_Handover.md` |
| Track Kill Criterion | `05_EBOS/MEOS_v1_Track0.xlsx` (Pipeline!B12) |
| Check current status | `AI_BOOTSTRAP/02_PROJECT_STATE.md` |
| Look up a decision | `AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md` or `15_Decisions/DECISION_LOG.md` |
| Review architecture | `AI_BOOTSTRAP/08_ARCHITECTURE_MAP.md` or `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| Look up a feature | `08_PRD/MASTER_PRD_v1.0.md` |
| Check risks | `02_Project_Management/RISK_REGISTER.md` |
| Check assumptions | `15_Decisions/ASSUMPTION_REGISTER.md` |
| Start a sprint | `02_Project_Management/SPRINT_MEMORY_TEMPLATE.md` |
| Find all files | `MASTER_INDEX.md` |

*Source: `_navigator/ENTRY_POINTS.md`; `MASTER_INDEX.md`*
