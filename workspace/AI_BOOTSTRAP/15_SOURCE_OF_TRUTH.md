# Source of Truth — Canonical Files, Authority, and Conflict Resolution

**The definitive record of which files govern which questions. When files conflict, this file decides the winner.**

Source: `00_Source_of_Truth/SOURCE_OF_TRUTH.md`, `00_Source_of_Truth/PROJECT_RULES.md`, `14_Memory/MASTER_PROJECT_MEMORY.md`

---

## The Primary Source of Truth

```
15_Decisions/FOUNDER_DECISIONS.md
```

This is the **constitutional document**. It governs ALL conflicts. When any other file contradicts the FDD, the FDD wins — always.

*Source: `00_Source_of_Truth/SOURCE_OF_TRUTH.md`; `00_Source_of_Truth/PROJECT_RULES.md` RULE-DC-01*

---

## Document Authority Chain

Highest authority to lowest authority:

| Priority | Document | Governs |
|---|---|---|
| 1 (Constitutional) | `15_Decisions/FOUNDER_DECISIONS.md` | All strategic, product, technical, operational decisions |
| 2 (Canonical Investment) | `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` | Market analysis, business model, investment thesis |
| 3 (Canonical Product) | `08_PRD/MASTER_PRD_v1.0.md` | Features, personas, data model, state machines, UX |
| 4 (Canonical Technical) | `09_Technical/TECHNICAL_ARCHITECTURE.md` | Tech stack, ADRs, security, infrastructure, DB conventions |
| 5 (Canonical Delivery) | `02_Project_Management/MASTER_DELIVERY_PLAN.md` | Sprint schedule, team, WBS, QA, DevOps, release |
| 6 (Current State) | `13_Audits/REMEDIATION_REAUDIT.md` | Authorization status, IERB score, blocking items |

*Source: `00_Source_of_Truth/SOURCE_OF_TRUTH.md` Authority Registry*

---

## Canonical Documents by Domain

### "What is this project?"
→ **Canonical:** `15_Decisions/FOUNDER_DECISIONS.md` BD-01; `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` — Executive Conclusion  
→ **Supporting:** `01_Project_Overview/PROJECT_OVERVIEW.md`; `AI_BOOTSTRAP/01_PROJECT_CONSTITUTION.md`

### "Is development authorized?"
→ **Canonical:** `13_Audits/REMEDIATION_REAUDIT.md` — Section D  
→ **Supporting:** `15_Decisions/OPEN_DECISIONS_TRACKER.md` B-01

### "What features are in the MVP?"
→ **Canonical:** `08_PRD/MASTER_PRD_v1.0.md` — Feature Table  
→ **Supporting:** `_navigator/DECISION_INDEX.md` PROD section

### "What tech stack are we using?"
→ **Canonical:** `09_Technical/TECHNICAL_ARCHITECTURE.md` — Stack table  
→ **Supporting:** `_navigator/ARCHITECTURE_INDEX.md`; `AI_BOOTSTRAP/08_ARCHITECTURE_MAP.md`

### "What decisions have been made?"
→ **Canonical:** `15_Decisions/FOUNDER_DECISIONS.md` (constitutional)  
→ **Extended log:** `15_Decisions/DECISION_LOG.md` (51 decisions chronological)  
→ **Status board:** `_navigator/DECISION_STATUS_BOARD.md`

### "What are the open decisions?"
→ **Canonical:** `15_Decisions/OPEN_DECISIONS_TRACKER.md`  
→ **Supporting:** `_navigator/DECISION_STATUS_BOARD.md`

### "Who are the competitors?"
→ **Canonical:** `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` (PEER REVIEW — this is where Marketeers Research was identified)  
→ **Supporting:** `07_Product/PRODUCT_STRATEGY.md` SWOT section

### "What is the GTM plan?"
→ **Canonical:** `07_Product/GO_TO_MARKET.md`  
→ **Supporting:** `04_Investment/IC_MEMO_v1.0.md`

### "What is the investment case?"
→ **Canonical:** `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`  
→ **Supporting:** `04_Investment/IC_MEMO_v1.0.md`

### "What are the risks?"
→ **Canonical:** `02_Project_Management/RISK_REGISTER.md`  
→ **Supporting:** `15_Decisions/ASSUMPTION_REGISTER.md`

### "What are we assuming?"
→ **Canonical:** `15_Decisions/ASSUMPTION_REGISTER.md`  
→ **Supporting:** `14_Memory/MASTER_PROJECT_MEMORY.md` Open Questions

### "What's the sprint plan?"
→ **Canonical:** `02_Project_Management/MASTER_DELIVERY_PLAN.md` Section 3  
→ **Supporting:** `02_Project_Management/SPRINT_MEMORY_TEMPLATE.md`

### "Where is the AI context for sessions?"
→ **Primary:** `AI_BOOTSTRAP/` folder (this folder — purpose-built for AI onboarding)  
→ **Secondary:** `_ai_bootstrap/` folder (original AI context files)

---

## Superseded Documents

These files have been superseded. Use their replacements.

| Superseded File | Replaced By | Reason |
|---|---|---|
| `PROJECT_MEMORY.md` (root) | `14_Memory/MASTER_PROJECT_MEMORY.md` | Superseded by full 14-section living memory |
| `_ai_bootstrap/LOADING_ORDER.md` | `AI_BOOTSTRAP/13_LOADING_ORDER.md` | Bootstrap layer supersedes original |
| `_ai_bootstrap/PROJECT_GLOSSARY.md` | `AI_BOOTSTRAP/06_PROJECT_GLOSSARY.md` | Extended with AI meanings |
| Any root-level .md file | Organized into appropriate subdirectory | Reorganized in v2.0 audit |
| `IC_MEMO_FINAL_v1.0.md` (referenced in some files) | `04_Investment/IC_MEMO_v1.0.md` | Path correction — only one IC memo file exists |

*Source: `00_Source_of_Truth/SUPERSEDED_DOCUMENTS.md`; `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`*

---

## Immutable Files (Source Files — Never Modify)

All files inside `../inbox/` are immutable source materials. They must NEVER be:
- Modified
- Renamed
- Deleted
- Overwritten

The workspace (`workspace/`) is the only working area.

*Source: `00_Source_of_Truth/PROJECT_RULES.md` RULE-W-01*

---

## Conflict Resolution Protocol

When two documents contain conflicting information:

### Step 1: Apply the authority chain

Higher-authority document wins. See table above.

### Step 2: Check if the conflict is already resolved

Consult `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` — known corrections are documented there.

### Step 3: If unresolved, document the conflict

Add an entry to `14_Memory/MASTER_PROJECT_MEMORY.md` under "Known Conflicts" section.

Format:
```
CONFLICT: [Topic]
File A: [path] states [X]
File B: [path] states [Y]
Authority: [which wins under the chain, if applicable]
Status: UNRESOLVED — requires founder decision
```

### Step 4: Never silently resolve it

An AI must NEVER pick one version and present it as fact without flagging the conflict.

*Source: `00_Source_of_Truth/PROJECT_RULES.md` RULE-DC-01; `AI_BOOTSTRAP/11_AI_RULES.md` Section 3*

---

## Known Resolved Conflicts

| Conflict | Resolution | Source |
|---|---|---|
| Samplia founding year: 1013 vs 2013 | **2013 is correct.** Typo in original source. | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` |
| IC_MEMO file path: FINAL_v1.0 vs v1.0 | **`IC_MEMO_v1.0.md` is correct.** Only one file exists. | Workspace inspection |
| Cloud region: locked vs provisional | **PROVISIONAL.** Pending PDPL written opinion (B-03). | `13_Audits/REMEDIATION_REAUDIT.md`; `15_Decisions/OPEN_DECISIONS_TRACKER.md` OD-03 |

---

## File Classification (by Stability)

| Classification | Description | Examples |
|---|---|---|
| IMMUTABLE | Never change — source files | Everything in `inbox/` |
| FROZEN | Never change — constitutional | `15_Decisions/FOUNDER_DECISIONS.md`, `09_Technical/TECHNICAL_ARCHITECTURE.md` |
| LIVING | Updated as project evolves | `14_Memory/MASTER_PROJECT_MEMORY.md`, `02_PROJECT_STATE.md`, `CHANGELOG.md` |
| APPEND-ONLY | New entries added; old entries never edited | `15_Decisions/DECISION_LOG.md`, `CHANGELOG.md` |
| TEMPLATED | Copy per sprint/decision | `02_Project_Management/SPRINT_MEMORY_TEMPLATE.md` |

*Source: `CONTRIBUTING.md` File Classification section*
