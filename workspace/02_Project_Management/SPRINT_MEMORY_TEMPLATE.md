# Sprint Memory Template

**Purpose:** Captures the context, decisions, outcomes, and learnings from each sprint so that any future session (human or AI) can resume without losing project state.  
**Usage:** Copy this template to a new file named `SPRINT_MEMORY_SPRINT_[N]_[YYYY-MM-DD].md` in `02_Project_Management/sprints/` at the start of each sprint. Update it throughout. Complete it at sprint end.

---

# Sprint Memory — Sprint [NUMBER]

**Sprint:** [NUMBER] — [NAME e.g., "Track 0 Commercial Validation"]  
**Dates:** [Start date] → [End date]  
**Status:** [IN PROGRESS / COMPLETED / ABORTED]  
**Lead:** [Founder / CTO / Both]  
**Written by:** [Human / AI / Both]

---

## 1. Sprint Goals

*What this sprint was supposed to accomplish. Copy from Delivery Plan or write fresh.*

| Goal | Priority | Target metric |
|---|---|---|
| [Goal 1] | P0 | [Measurable outcome] |
| [Goal 2] | P0 | [Measurable outcome] |
| [Goal 3] | P1 | [Measurable outcome] |

---

## 2. Context at Sprint Start

*State of the project when this sprint began. Load from previous sprint's memory or MASTER_PROJECT_MEMORY.md.*

**Authorization status:** [e.g., NOT AUTHORIZED / AUTHORIZED — Track 1]  
**Blocking items open:** [List B-01 through B-04 status]  
**Last sprint outcome:** [Brief summary]  
**Key open decisions:** [List from DECISION_STATUS_BOARD.md]  
**Key open risks:** [Top 3 from RISK_REGISTER.md]

---

## 3. Planned Work

*Backlog items committed to this sprint.*

| Item | Type | Owner | Estimate |
|---|---|---|---|
| [Task name] | [Feature / Bug / Research / Admin] | [Owner] | [Days] |
| | | | |
| | | | |

**Sprint capacity:** [N] developer-days  
**Committed features:** [TJ-XXX list]

---

## 4. What Was Completed

*Fill in at sprint end. Mark each planned item.*

| Item | Status | Notes |
|---|---|---|
| [Task name] | ✅ Done / ❌ Not done / ⚠️ Partial | [Notes on blockers or changes] |
| | | |

**Completion rate:** [X / Y tasks] ([%])  
**Features merged:** [TJ-XXX list]  
**Features deferred:** [TJ-XXX list + reason]

---

## 5. Decisions Made This Sprint

*All new decisions made during this sprint. Add to DECISION_LOG.md as well.*

| Decision ID | Date | Decision | Rationale |
|---|---|---|---|
| DL-[next] | [date] | [Decision] | [Why] |
| | | | |

---

## 6. Assumptions Validated / Invalidated

*Any Track 0 or later validation outcomes. Update ASSUMPTION_REGISTER.md with same data.*

| Assumption ID | Assumption | Outcome | Evidence |
|---|---|---|---|
| A-[ID] | [Assumption text] | VALIDATED / INVALIDATED / PARTIALLY | [Source / data] |
| | | | |

---

## 7. Risks That Materialized

*Any risks from the Risk Register that became real during this sprint.*

| Risk ID | Risk | What happened | Mitigation taken |
|---|---|---|---|
| R-[ID] | [Risk description] | [What occurred] | [What was done] |
| | | | |

**New risks identified this sprint:** [List any new risks to be added to RISK_REGISTER.md]

---

## 8. Blocking Items Status Change

*Update if any of B-01 through B-04 changed status during this sprint.*

| Item | Was | Now | Evidence |
|---|---|---|---|
| B-01 Track 0 GO | [OPEN] | [OPEN / CLOSED] | [Evidence or still open] |
| B-02 LLC | [OPEN] | [OPEN / CLOSED] | [Evidence] |
| B-03 PDPL | [OPEN] | [OPEN / CLOSED] | [Evidence] |
| B-04 QR load test | [OPEN] | [OPEN / CLOSED] | [Evidence] |

---

## 9. Key Metrics (if applicable)

*Track 0 and later sprints produce measurable outcomes. Record here.*

| Metric | Target | Actual | Notes |
|---|---|---|---|
| Brand outreach contacts | [N] | [N] | |
| Brand discovery calls completed | [N] | [N] | |
| Brand LOIs received | [N] | [N] | |
| Consumer activations (pilot) | [N] | [N] | |
| Survey completion rate | [%] | [%] | |
| Features tested | [N] | [N] | |
| Test coverage | [%] | [%] | |

---

## 10. Financial Summary (Sprint 0 / Track 0 only)

*Record actual spend against Track 0 budget.*

| Item | Budget | Actual | Variance |
|---|---|---|---|
| Legal (PDPL counsel) | $2,000–$5,000 | $ | |
| SMS/OTP provider setup | $200–$500 | $ | |
| WhatsApp BSP | $500–$1,000 | $ | |
| AWS setup | $500–$1,000 | $ | |
| Other | | $ | |
| **Total** | **$15,000–$25,000** | **$** | |

---

## 11. Key Learnings

*What this sprint taught you that wasn't obvious before. These are the most valuable entries for future sessions.*

1. [Learning 1]
2. [Learning 2]
3. [Learning 3]

**What to repeat:** [Approach or decision that worked well]  
**What to change:** [Approach or decision that didn't work]  
**What to investigate:** [Open question that emerged]

---

## 12. Workspace Changes Made This Sprint

*All files created, edited, or restructured during this sprint. Update CHANGELOG.md with these.*

| File | Change | Why |
|---|---|---|
| [path/FILE.md] | [Created / Edited / Moved] | [Reason] |
| | | |

---

## 13. AI Sessions This Sprint

*Record significant AI-assisted work sessions so insights are traceable.*

| Date | AI used | Session goal | Key output | Saved to workspace? |
|---|---|---|---|---|
| [date] | [Claude / ChatGPT / Other] | [Goal] | [What was produced] | [Yes / No] |
| | | | | |

---

## 14. Carries Forward to Next Sprint

*What this sprint leaves behind for the next one.*

**Open items to carry forward:**
- [ ] [Item 1]
- [ ] [Item 2]

**Blocking items still unresolved:** [List]  
**Key context the next sprint lead needs:** [2–3 sentences]  
**Files to load at the start of next sprint:** [Specific workspace files most relevant]

---

## Sprint Closeout Certification

*Complete this at sprint end before archiving.*

- [ ] DECISION_LOG.md updated with all sprint decisions
- [ ] ASSUMPTION_REGISTER.md updated with all validated/invalidated assumptions
- [ ] RISK_REGISTER.md updated with materialized and new risks
- [ ] DECISION_STATUS_BOARD.md updated with any blocking item changes
- [ ] MASTER_PROJECT_MEMORY.md updated with new permanent facts
- [ ] CHANGELOG.md updated with all workspace changes
- [ ] This sprint memory file is complete and saved

**Sprint signed off by:** [Founder]  
**Date signed off:** [date]

---

## Pre-Populated Sprint Registry

*Track all sprint files here for easy navigation:*

| Sprint | Name | Dates | Status | File |
|---|---|---|---|---|
| Sprint 0 | Track 0 — Commercial Validation | TBD | NOT STARTED | Create as `sprints/SPRINT_MEMORY_SPRINT_0_[date].md` |
| Sprint 1 | Core Infrastructure | TBD | NOT STARTED | Create on GO confirmation |
| Sprint 2 | Consumer App MVP | TBD | NOT STARTED | Create in Sprint 1 |
| Sprint 3 | Brand Dashboard MVP | TBD | NOT STARTED | Create in Sprint 2 |
| Sprint 4 | Analytics + AI Layer | TBD | NOT STARTED | Create in Sprint 3 |
| Sprint 5 | Private Beta | TBD | NOT STARTED | Create in Sprint 4 |
| Sprint 6 | Production v1.0 | TBD | NOT STARTED | Create in Sprint 5 |
