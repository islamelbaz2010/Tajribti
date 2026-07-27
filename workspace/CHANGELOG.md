# Changelog — Tajribti Knowledge Workspace

**Format:** Reverse-chronological (newest first). Log every meaningful file creation, edit, reorganization, or correction.  
**Rule:** Every workspace session that creates or edits files must add at least one entry here before closing.  
**Versioning:** Workspace versions track major structural changes, not every file edit.

---

## Workspace Version History

| Version | Date | Summary |
|---|---|---|
| v4.1 | 2026-07-27 | Bootstrap Certification — 5 new files added; conflicts documented; FROZEN at score 98/100 |
| v4.0 | 2026-07-27 | AI Bootstrap Layer — 16-file purpose-built AI onboarding folder (AI_BOOTSTRAP/) |
| v3.0 | 2026-07-27 | Long-term development governance layer added (9 new files) |
| v2.0 | 2026-07-27 | Enterprise Knowledge Architect audit + 26 improvements applied |
| v1.0 | 2026-07-26 | Initial workspace built from 14 inbox source files (14-phase build) |

---

## [v4.1] — 2026-07-27 — Bootstrap Certification Pass

### Files Created

| File | Location | Description |
|---|---|---|
| `PROJECT_FINGERPRINT.json` | `AI_BOOTSTRAP/` | Machine-readable project identity, counts, conflicts, and fingerprint |
| `TRACEABILITY_INDEX.md` | `AI_BOOTSTRAP/` | Every major Bootstrap claim mapped to source file with confidence level |
| `AI_SESSION_TEMPLATE.md` | `AI_BOOTSTRAP/` | Mandatory session opener template — 6 steps, confirmation checklist, closeout protocol |
| `BOOTSTRAP_VERSION.md` | `AI_BOOTSTRAP/` | Bootstrap version record, revision history, update protocol |
| `BOOTSTRAP_FREEZE_REPORT.md` | `AI_BOOTSTRAP/` | Full certification audit — 98/100 readiness score, 2 conflicts documented, FROZEN |

### Files Updated
- `CHANGELOG.md` — this entry
- `workspace/MASTER_INDEX.md` — file count updated to 96+

### Why This Version Exists

Second-pass architecture audit of the AI_BOOTSTRAP layer. All 14 inbox files, all 96+ workspace files, and all root-level directories were re-read before any certification was performed. Two conflicts were found and documented. Project identity was verified (Tajribti is the product name; "samples app" is the filesystem folder only). Bootstrap frozen at version 1.1.

---

## [v4.0] — 2026-07-27 — AI Bootstrap Layer

### Files Created (AI_BOOTSTRAP/ — new folder)

| File | Description |
|---|---|
| `00_AI_START_HERE.md` | 1-page orientation: project name, status, loading order, critical rules |
| `01_PROJECT_CONSTITUTION.md` | What IS / IS NOT the project; vision, mission, non-goals |
| `02_PROJECT_STATE.md` | Authorization, blockers, phase, team, open decisions — current state only |
| `03_FOUNDER_DECISIONS.md` | All 51 locked founder decisions merged, sorted by category |
| `04_CURRENT_OBJECTIVE.md` | Exactly what we're doing right now: Track 0, 4 blocking items, 14 brand targets |
| `05_CURRENT_PHASE.md` | Track 0 context, previous phase, next phase, exit criteria |
| `06_PROJECT_GLOSSARY.md` | 43+ terms with business meaning, technical meaning, and AI-system meaning |
| `07_DOMAIN_MODEL.md` | Actors, 10 capabilities, 3 business processes, 8 entities, 2 state machines |
| `08_ARCHITECTURE_MAP.md` | One-page architecture: 3 frontends, NestJS core, Python AI service, data layer |
| `09_REPOSITORY_MAP.md` | Full workspace folder structure with file-level descriptions |
| `10_KNOWLEDGE_MAP.md` | Where every type of institutional knowledge lives, organized by question type |
| `11_AI_RULES.md` | Anti-drift protocol, 8 absolute rules, scope rules, session protocol |
| `12_AI_CHECKLIST.md` | 11-step mandatory pre-answer checklist + quick-fire fact check table |
| `13_LOADING_ORDER.md` | Session-type loading recipes with token budget estimates |
| `14_CONTEXT_INDEX.md` | One-line description of every file in the workspace |
| `15_SOURCE_OF_TRUTH.md` | Canonical files, authority chain, conflict resolution protocol |

### Files Updated
- `MASTER_INDEX.md` — added AI_BOOTSTRAP/ to workspace tree; updated file count to 96+
- `CHANGELOG.md` — this entry

### Why This Version Exists

The workspace had comprehensive documentation (v1.0), an audit pass (v2.0), and governance files (v3.0). What was missing was a purpose-built, AI-optimized onboarding layer — distinct from human-oriented documentation — that allows any future AI session to reach full project context in under 2 minutes. The AI_BOOTSTRAP/ folder is strictly for AI onboarding: every file answers a specific AI orientation question, cites sources, and is structured to be consumed sequentially.

**Design principles applied:**
- Every statement cites a source document
- No invented information
- Conflicts documented, never silently resolved
- Anti-drift protocol enforced throughout
- Session-type loading recipes reduce token waste

---

## [v3.0] — 2026-07-27 — Long-term Development Governance

### Files Created

| File | Location | Description |
|---|---|---|
| `MASTER_PROJECT_MEMORY.md` | `14_Memory/` | Comprehensive living memory — supersedes and extends PROJECT_MEMORY.md; load every session |
| `DECISION_LOG.md` | `15_Decisions/` | Full chronological decision log — 51 decisions logged across all categories |
| `RISK_REGISTER.md` | `02_Project_Management/` | Full risk register — 20 risks scored across 5 categories; 6 HIGH/CRITICAL flagged |
| `ASSUMPTION_REGISTER.md` | `15_Decisions/` | Full assumption register — 40 assumptions tracked across 5 categories |
| `PROJECT_RULES.md` | `00_Source_of_Truth/` | 25 inviolable project rules across 7 categories |
| `AI_WORKFLOW.md` | `_ai_bootstrap/` | AI session protocol — loading order, prompt patterns, closeout checklist |
| `SPRINT_MEMORY_TEMPLATE.md` | `02_Project_Management/` | Sprint memory template for Track 0 through Sprint 6 |
| `CHANGELOG.md` | `workspace/` (root) | This file — workspace version history |
| `CONTRIBUTING.md` | `workspace/` (root) | Contribution guidelines for Founder and future team members |

### Why This Version Exists

The workspace was certified AI-ready (91/100, v2.0) but lacked the long-term governance infrastructure needed as the project moves from documentation to execution. Nine governance files transform it from a knowledge archive into a permanent source of truth that can survive team growth, context resets, and multi-year development.

---

## [v2.0] — 2026-07-27 — Enterprise Knowledge Architect Audit

### Structural Reorganization

| Change | Before | After |
|---|---|---|
| Root clutter | 20 files at workspace root | 3 files at root (MASTER_INDEX, CHANGELOG, CONTRIBUTING) |
| AI bootstrap files | Scattered at root | Organized into `_ai_bootstrap/` |
| Index files | Scattered at root | Organized into `_navigator/` |
| JSON files | Scattered at root | Organized into `_structured_data/` |

### Files Created in This Version

| File | Location | Description |
|---|---|---|
| `DECISION_STATUS_BOARD.md` | `_navigator/` | Live blocker/open/locked decision tracker |
| `OPEN_DECISIONS_TRACKER.md` | `15_Decisions/` | 4 blocking items with "what proves it closed" guidance |
| `ENTERPRISE_ARCHITECTURE.md` | `06_Enterprise_Architecture/` | EA domain map, capability model, integration architecture |
| `GO_TO_MARKET.md` | `07_Product/` | GTM strategy, brand target list, sequencing, kill criterion |
| `PRODUCT_STRATEGY.md` | `07_Product/` | Product vision, SWOT, Porter's Five Forces, PESTEL, roadmap |
| `AI_STRATEGY.md` | `10_AI/` | LLM strategy, prompt management, fraud detection, data flywheel |
| `PROJECT_MEMORY.md` | `14_Memory/` | Persistent project memory — corrections, verified facts, open questions |
| `PROJECT_CONTEXT.md` | `_ai_bootstrap/` | Project background, constraints, what's done and not done |
| `REPORT_INDEX.md` | `_navigator/` | Index of all generated reports |
| `MEMORY_REPORT.md` | `16_Reports/` | Memory items summary report |
| `PROMPT_REPORT.md` | `16_Reports/` | Prompt analysis report |
| `SUPERSEDED_DOCUMENTS.md` | `18_Archive/` | Registry of superseded source documents |
| `topics.json` | `_structured_data/` | 12 extracted topics with document mappings |
| `duplicates.json` | `_structured_data/` | Duplicate detection results |
| `links.json` | `_structured_data/` | All 29 cross-reference edges |
| `WORKSPACE_AUDIT.md` | `17_Final/` | Enterprise Knowledge Architect audit report |
| `READY_FOR_AI.md` | `17_Final/` | AI readiness certification |
| `FINAL_QUALITY_SCORE.md` | `17_Final/` | Final quality assessment (91/100) |

### Files Significantly Updated in This Version

| File | Change |
|---|---|
| `AI_CONTEXT.md` | Rebuilt to v2.0 — 10 sections, 9 AI rules, 900+ words |
| `LOADING_ORDER.md` | Updated to 7 tiers; all new files referenced |
| `MASTER_INDEX.md` | Completely rebuilt with new folder tree and role-based navigation |

### Fixes Applied in This Version

| Fix | Detail |
|---|---|
| Broken link | `IC_MEMO_FINAL_v1.0.md` → fixed to `IC_MEMO_v1.0.md` |
| Path references | Report files updated from old root paths to new `_navigator/` paths |
| Data typo | `statistics.json`: `samplia_founded: 1013` → `2013` |

---

## [v1.0] — 2026-07-26 — Initial Workspace Build

### Source Files Processed

14 files extracted from `inbox/` using python-docx and pdfplumber:
- 13 .docx files
- 1 .pdf file
- 1 .txt file

Total source content: ~40,000 words across 14 documents.

### Workspace Structure Created

22 folders (00_Source_of_Truth through 18_Archive) + initial file set.

### Phase Summary

| Phase | Output |
|---|---|
| 1 — Scan | 14 files catalogued |
| 2 — Extract | All content extracted to text |
| 3 — Classify | All files classified by type/language/status |
| 4 — Create workspace | 22-folder structure created |
| 5 — Split documents | All major documents split into domain files |
| 6 — Enrich | Metadata added to all generated files |
| 7 — Extract knowledge | 46+ decisions, 22 features, entities, KPIs, risks extracted |
| 8 — Indexes | 9 of 10 indexes generated (REPORT_INDEX added in v2.0) |
| 9 — JSON | 4 of 7 JSON files generated (3 added in v2.0) |
| 10 — Cross-reference | 21 cross-reference edges documented |
| 11 — Reports | 5 of 7 reports generated (2 added in v2.0) |
| 12 — AI bootstrap | 5 of 7 files generated (2 added in v2.0) |
| 13 — Validate | Basic validation passed; issues identified for v2.0 |
| 14 — Final summary | WORKSPACE_REPORT.md + STATISTICS_REPORT.md created |

### Corrections Applied in v1.0 Build

| Correction | Detail |
|---|---|
| Samplia founding year | 2013 (not 2018/2019 as in early documents) |
| Samplia funding status | Bootstrapped (not venture-backed) |
| Competitor gap | Marketeers Research identified as near-direct competitor |
| Competitor count | ~127 global competitors in category |

---

## How to Add a CHANGELOG Entry

When you make meaningful workspace changes:

```markdown
## [date] — [Brief title]

### Files Created
| File | Location | Description |
|---|---|---|
| `FILENAME.md` | `folder/` | One-line description |

### Files Updated
| File | Change |
|---|---|
| `FILENAME.md` | What changed and why |

### Issues Fixed
| Issue | Resolution |
|---|---|
| [Issue description] | [How it was fixed] |
```

**Minimum entry for a simple session:**
```
## [date] — Session: [session goal]
- Updated `DECISION_LOG.md` — added DL-[N]: [brief decision]
- Updated `RISK_REGISTER.md` — R-[ID] status changed to [new status]
```
