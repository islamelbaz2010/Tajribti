# Contributing — How to Work on This Workspace

**Audience:** Founder, future team members (CTO, Ops Manager, PM), and AI assistants  
**Purpose:** Clear rules for how to maintain this workspace as the permanent source of truth  
**Last updated:** 2026-07-27  
**Rules authority:** `00_Source_of_Truth/PROJECT_RULES.md`

---

## The Prime Directive

This workspace is the permanent institutional memory of the Tajribti project. When someone joins the team, gets handed a task, or opens a new AI session — this workspace is what they load. Everything here must be accurate, current, and complete.

**If it's not in the workspace, it doesn't exist as project knowledge.**

---

## Section 1 — What You Can and Cannot Change

### IMMUTABLE (Never Touch)

| Location | Rule |
|---|---|
| `inbox/` (all 14 files) | Never modify, rename, delete, or overwrite. These are the sacred source files. |
| Locked decisions in `DECISION_LOG.md` | Never edit a past entry. Add reversals as new entries. |
| Audit findings in `13_Audits/` | Never alter audit scores or findings retroactively. |

### FROZEN (Only Authorized Changes)

| Location | Rule |
|---|---|
| `15_Decisions/FOUNDER_DECISIONS.md` | Founder amendments only. Document the amendment in DECISION_LOG.md first. |
| `00_Source_of_Truth/PROJECT_RULES.md` | Founder authorization required. Log in DECISION_LOG.md. |
| `00_Source_of_Truth/SOURCE_OF_TRUTH.md` | Founder authorization required. |

### LIVING (Anyone Can Update — With Logging)

| Location | Rule |
|---|---|
| `14_Memory/MASTER_PROJECT_MEMORY.md` | Add new facts, corrections, and insights. Log changes in CHANGELOG.md. |
| `15_Decisions/DECISION_LOG.md` | Append new decisions. Never edit old ones. |
| `02_Project_Management/RISK_REGISTER.md` | Update risk statuses, add new risks. Log in CHANGELOG.md. |
| `15_Decisions/ASSUMPTION_REGISTER.md` | Update validation statuses, add new assumptions. |
| `_navigator/DECISION_STATUS_BOARD.md` | Update when blocking items change status. |
| `CHANGELOG.md` | Add entries for every meaningful workspace change. |
| `16_Reports/` | Update reports when underlying data changes. |

### APPEND-ONLY (Add; Never Delete)

| Location | Rule |
|---|---|
| `15_Decisions/DECISION_LOG.md` | Append-only. |
| `CHANGELOG.md` | Append-only. |
| `02_Project_Management/RISK_REGISTER.md` risk retirement log | Append-only. |

---

## Section 2 — File Naming Conventions

| Pattern | Use for |
|---|---|
| `SCREAMING_SNAKE_CASE.md` | All workspace markdown files |
| `kebab-case.json` | JSON data files (exception: follow existing naming in `_structured_data/`) |
| `SPRINT_MEMORY_SPRINT_[N]_[YYYY-MM-DD].md` | Sprint memory files |
| `_lowercase/` | Special organizational folders (`_ai_bootstrap/`, `_navigator/`, `_structured_data/`) |
| `NN_Title_Case/` | Numbered content folders (`00_Source_of_Truth/` through `18_Archive/`) |

**No spaces in file names.** No special characters except underscores and hyphens.

---

## Section 3 — Adding a New Document

When a new source document arrives (a new analysis, a legal opinion, a competitor report):

1. **Place the original in `inbox/`** — never anywhere else
2. **Create a workspace representation** in the appropriate numbered folder
3. **Register it in `_structured_data/documents.json`** — add metadata
4. **Add it to `_navigator/DOCUMENT_INDEX.md`**
5. **Update `_navigator/SOURCE_INDEX.md`** with metadata
6. **Add cross-references to `_structured_data/links.json`** if it connects to other documents
7. **Update `MASTER_INDEX.md`** with the new file
8. **Log in `CHANGELOG.md`**

---

## Section 4 — Making a Decision

When a new decision is made at any level (business, product, technical, operational):

1. **Check `15_Decisions/FOUNDER_DECISIONS.md`** — does it already cover this? Does it conflict?
2. **Check `15_Decisions/DECISION_LOG.md`** — has this been decided before? Was it reversed?
3. **Add to `DECISION_LOG.md`** — assign next DL- ID, fill all columns
4. **If it's strategic, amend FDD** — significant business/product/tech decisions must be reflected in the FDD
5. **Update `_navigator/DECISION_STATUS_BOARD.md`** if status of blocking/open items changes
6. **If it closes a blocking item** — update `15_Decisions/OPEN_DECISIONS_TRACKER.md` and `DECISION_STATUS_BOARD.md`
7. **Log in `CHANGELOG.md`**

---

## Section 5 — Capturing a New Risk

1. **Assign next R-[CATEGORY]-[NN] ID**
2. **Add to `02_Project_Management/RISK_REGISTER.md`** — fill L, I, Score, Mitigation, Contingency, Owner, Status
3. **Check if it affects any existing assumptions** — update `ASSUMPTION_REGISTER.md` if so
4. **Log in `CHANGELOG.md`**

---

## Section 6 — Validating an Assumption

When Track 0 or later sprints produce evidence about an assumption:

1. **Open `15_Decisions/ASSUMPTION_REGISTER.md`**
2. **Update the Status column**: UNVALIDATED → VALIDATED / INVALIDATED / PARTIALLY
3. **Add the evidence** (source + date) in the Validation Method column
4. **If INVALIDATED**: document the implication and whether a decision needs to change
5. **Update `14_Memory/MASTER_PROJECT_MEMORY.md`** with the validated fact
6. **Add to the sprint memory file** for the current sprint
7. **Log in `CHANGELOG.md`**

---

## Section 7 — Running a Sprint

**At sprint start:**
1. Copy `SPRINT_MEMORY_TEMPLATE.md` to `02_Project_Management/sprints/SPRINT_MEMORY_SPRINT_[N]_[date].md`
2. Fill Sections 1–3 (Goals, Context at Start, Planned Work)
3. Review RISK_REGISTER.md and DECISION_STATUS_BOARD.md

**During sprint:**
- Update sprint memory file as decisions, findings, and completions occur
- Log workspace changes in CHANGELOG.md as they happen
- Don't batch updates — log while memory is fresh

**At sprint end:**
1. Complete all sprint memory sections
2. Run the Sprint Closeout Checklist (bottom of template)
3. Update DECISION_LOG, RISK_REGISTER, ASSUMPTION_REGISTER as needed
4. Update MASTER_PROJECT_MEMORY.md with new permanent facts
5. Log CHANGELOG.md entry for the sprint

---

## Section 8 — Working with AI

See `AI_BOOTSTRAP/13_LOADING_ORDER.md` for session-type loading recipes (includes Track 0 Sales session). See `_ai_bootstrap/AI_WORKFLOW.md` for full session protocol. Summary:

| Do | Don't |
|---|---|
| Load `00_FOUNDER_INTENT/` (6 files) first — mandatory gate | Skip Founder Intent layer |
| Then load `AI_BOOTSTRAP/00_AI_START_HERE.md` + universal minimum | Jump into advice without loading context |
| Use `AI_BOOTSTRAP/13_LOADING_ORDER.md` to pick the right session type | Load everything regardless of session type |
| Tell AI which files to read and update | Let analysis stay in chat window |
| Run session closeout checklist | End session without writing back to workspace |
| Verify AI output against workspace facts | Trust AI output that contradicts workspace |
| Use AI to challenge assumptions and identify risks | Use AI to authorize development (it cannot) |

---

## Section 9 — Resolving Conflicts Between Files

When two workspace files say different things:

1. **Apply the authority chain:** FDD > IC v2.0 > Remediation Re-Audit > PRD > Technical Architecture > Delivery Plan
2. **Update the lower-authority file** to reflect the higher-authority source
3. **If both files have a claim to authority, escalate to Founder** — log the conflict in DECISION_LOG.md
4. **Log the fix in CHANGELOG.md**

**Authority chain note — AI session layers:**
- `00_FOUNDER_INTENT/` (6 files) is the AI session entry layer — derived from FDD, loaded first every session. If 00_FOUNDER_INTENT/ conflicts with FDD, FDD governs.
- `AI_BOOTSTRAP/` is the AI onboarding layer (v1.1 FROZEN) — structural guidance, not an authority document. Factual claims in AI_BOOTSTRAP trace back to source documents via `TRACEABILITY_INDEX.md`.
- `Sales_Execution_Pack/` defers to FDD and IC v2.0 on any commercial or positioning claim.

**B-ID numbering conflict note:**
`13_Audits/READINESS_AUDIT.md` uses historical B-IDs from the original IERB review. `15_Decisions/OPEN_DECISIONS_TRACKER.md` uses current B-IDs. When referencing blocking items, always use OPEN_DECISIONS_TRACKER.md as authoritative. See the annotation block at top of READINESS_AUDIT.md for the full mapping.

---

## Section 10 — Archiving Superseded Documents

When a document is replaced by a newer version:

1. **Add the superseded file to `18_Archive/SUPERSEDED_DOCUMENTS.md`**
2. **Add a notice to the workspace representation** of the superseded document: "⚠️ SUPERSEDED BY [new document path]"
3. **Never delete** the old workspace file or the original inbox source
4. **Log in CHANGELOG.md**

---

## Quick Reference

| I want to... | Go to... |
|---|---|
| Know the current authorization status | `_navigator/DECISION_STATUS_BOARD.md` |
| Add a new decision | `15_Decisions/DECISION_LOG.md` |
| Add a new risk | `02_Project_Management/RISK_REGISTER.md` |
| Mark an assumption validated | `15_Decisions/ASSUMPTION_REGISTER.md` |
| Know what to load for an AI session | `AI_BOOTSTRAP/13_LOADING_ORDER.md` (authoritative — 11 session types) |
| Start a new sprint | `02_Project_Management/SPRINT_MEMORY_TEMPLATE.md` |
| Find any document fast | `_navigator/ENTRY_POINTS.md` |
| Know which document governs | `00_Source_of_Truth/SOURCE_OF_TRUTH.md` |
| Check what's changed recently | `CHANGELOG.md` |
| Understand project rules | `00_Source_of_Truth/PROJECT_RULES.md` |
| Get AI oriented quickly | `00_FOUNDER_INTENT/` (load first) → `AI_BOOTSTRAP/00_AI_START_HERE.md` |
