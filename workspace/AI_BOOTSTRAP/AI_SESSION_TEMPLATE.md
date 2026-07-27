# AI Session Template — Mandatory Session Opener

**Every AI working on Tajribti MUST run this template at the start of every session.**  
**This is not optional. This is not a suggestion. Run every step in order.**

---

## STEP 1 — Read Core Orientation

Read these files in order:

```
1. AI_BOOTSTRAP/00_AI_START_HERE.md
2. AI_BOOTSTRAP/02_PROJECT_STATE.md
3. AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md
4. AI_BOOTSTRAP/11_AI_RULES.md
5. AI_BOOTSTRAP/15_SOURCE_OF_TRUTH.md
```

**Do not skip steps. Do not reorder them.**

---

## STEP 2 — Confirm Understanding

After reading, confirm these 12 facts by stating them explicitly:

```
[ ] 1. Project name and status:
        "This project is named [ANSWER] — status: [ANSWER]"

[ ] 2. Development authorization:
        "Development is [AUTHORIZED / NOT AUTHORIZED]. IERB score: [ANSWER]/100."

[ ] 3. Current phase:
        "We are in [ANSWER] phase. Engineering [HAS / HAS NOT] started."

[ ] 4. Current objective:
        "The current objective is [ANSWER]"

[ ] 5. Blocking items:
        "There are [N] blocking items. They are: [list them]"

[ ] 6. Constitutional document:
        "The source of truth is [ANSWER]"

[ ] 7. Platform category (critical):
        "This platform is a [ANSWER] — NOT a sampling company."

[ ] 8. Business model:
        "The model is [ANSWER]. Who pays: [ANSWER]. Who receives value: [ANSWER]."

[ ] 9. Financial figures:
        "All financial figures in this repository are [ANSWER]."

[ ] 10. Primary Egyptian competitor:
         "The nearest direct Egyptian competitor is [ANSWER]."

[ ] 11. Provisional name status:
         "The name 'Tajribti' is [ANSWER]."

[ ] 12. Working authorization for this session:
         "Based on current phase and authorization, I [CAN / CANNOT] help with [type of work]."
```

**Expected correct answers:**

| # | Expected |
|---|---|
| 1 | "Tajribti (تجربتي)" — provisional name, NOT authorized for development |
| 2 | NOT AUTHORIZED. 67/100 |
| 3 | Track 0 — commercial validation. Engineering has NOT started. |
| 4 | Execute $15K–$25K commercial validation; secure ≥3 brand LOIs; close 4 blocking items |
| 5 | 4 blocking items: B-01 (Track 0 GO), B-02 (LLC), B-03 (PDPL), B-04 (QR load test) |
| 6 | `15_Decisions/FOUNDER_DECISIONS.md` (FDD) |
| 7 | Consumer Intelligence Platform (B2B2C) |
| 8 | B2B2C. Brands pay. Consumers receive free products + rewards. |
| 9 | ILLUSTRATIVE — not validated |
| 10 | Marketeers Research (Egypt/KSA/GCC, AI-powered "Smart Value™" FMCG analytics) |
| 11 | PROVISIONAL — trademark and domain clearance pending |
| 12 | CAN help with: strategy, brand outreach, LOI drafting, legal research, PDPL brief. CANNOT help with: engineering, production code, infra setup. |

---

## STEP 3 — Report Conflicts

Before answering any question, state:

> "I have read the mandatory session files. I am now reporting any conflicts I detected."

If you found a conflict between files:
- Name both files
- State what each says
- State which is higher authority per `AI_BOOTSTRAP/15_SOURCE_OF_TRUTH.md`
- Do NOT resolve the conflict

If no conflicts found:
> "No new conflicts detected between loaded files and prior knowledge."

---

## STEP 4 — Load Domain Files

Based on the user's question, load additional files from `AI_BOOTSTRAP/13_LOADING_ORDER.md`:

```
Strategic advice    → Load Tier 2: 01, 04, 05 + GTM, IC Memo, Risk Register
Product/features    → Load Tier 2: PRD, Domain Model, Product Strategy
Technical           → Load Tier 2: Technical Architecture, Architecture Map, EA
Investment          → Load Tier 2: IC v2.0, IC Memo, Remediation Audit, Assumptions
Competitive         → Load Tier 2: Peer Review, Product Strategy, IC v2.0, GTM
Sprint planning     → Load Tier 2: Current Objective, Delivery Plan, Sprint Template
Decision making     → Load Tier 2: Open Decisions Tracker, Decision Log, Constitution
```

---

## STEP 5 — Declare Session Scope

State:

> "Based on the current phase (Track 0 — commercial validation, NO engineering authorized), this session can assist with: [list specific permitted work].
>
> This session CANNOT assist with: [list blocked work relevant to today's conversation]."

---

## STEP 6 — Wait for Instructions

After completing Steps 1–5, output:

```
SESSION READY

Project: Tajribti (تجربتي) — Egypt's Consumer Intelligence Platform
Authorization: NOT AUTHORIZED for development
Current Phase: Track 0 — Commercial Validation
Loaded Files: [list files loaded this session]
Detected Conflicts: [none / list them]
Session Scope: [what you can and cannot help with today]

Ready for your question.
```

Then wait for user instructions.

---

## SESSION CLOSEOUT CHECKLIST

Before ending the session, run this checklist:

```
[ ] Was a new decision made?
    → If YES: Add to 15_Decisions/DECISION_LOG.md

[ ] Was a new risk identified?
    → If YES: Add to 02_Project_Management/RISK_REGISTER.md

[ ] Was an assumption validated or invalidated?
    → If YES: Update 15_Decisions/ASSUMPTION_REGISTER.md

[ ] Was a correction identified?
    → If YES: Update 14_Memory/MASTER_PROJECT_MEMORY.md

[ ] Was a significant workspace change made?
    → If YES: Update CHANGELOG.md

[ ] Was a blocking item status changed?
    → If YES: Update 15_Decisions/OPEN_DECISIONS_TRACKER.md

[ ] Was a new file created that affects the context index?
    → If YES: Update AI_BOOTSTRAP/14_CONTEXT_INDEX.md
```

Source: `_ai_bootstrap/AI_WORKFLOW.md` Session Closeout Checklist

---

## ANTI-DRIFT CHECKPOINT

At any point during the session, if you notice your answer introduces:

```
→ A new market not already in the repository
→ A new feature not in the PRD
→ A new technology not in the architecture
→ A new revenue stream not in the FDD
→ A new strategic approach not already in the workspace

STOP.
State: "I am detecting scope drift. The concept I was about to introduce is [X].
This does not exist in the repository. Shall I proceed or stop?"
Wait for instruction.
```

Never proceed through a drift checkpoint without explicit founder confirmation.

Source: `AI_BOOTSTRAP/11_AI_RULES.md` Section 1 — Anti-Drift Protocol
