# AI Workflow — How to Work with AI on This Project

**Audience:** Founder + any collaborator working with AI (Claude, ChatGPT) on Tajribti  
**Purpose:** Standard operating procedure for AI-assisted sessions — so every session starts well, produces useful outputs, and leaves the workspace better than it found it  
**Last updated:** 2026-07-27

---

## Core Principle

This workspace IS the project's institutional memory. AI sessions are productive when they start from the workspace and end by writing back to the workspace. A session that generates great analysis and leaves it only in the chat window has wasted half its value.

```
LOAD WORKSPACE → DO WORK → WRITE BACK TO WORKSPACE
```

---

## Section 1 — Session Start Protocol

### Minimum Load (Every Session)

Always load these first, in this order:

```
1. workspace/_ai_bootstrap/AI_CONTEXT.md
2. workspace/_ai_bootstrap/PROJECT_CONTEXT.md
3. workspace/_ai_bootstrap/PROJECT_GLOSSARY.md
4. workspace/00_Source_of_Truth/SOURCE_OF_TRUTH.md
```

This gives the AI:
- Platform identity (not a sampling company)
- Current authorization status (development NOT authorized)
- The 4 blocking items
- All 42 key terms correctly defined
- Which document governs which domain

**Do not skip this step.** An AI without this context will give you generic advice and may re-introduce known errors (e.g., wrong Samplia founding year, wrong company framing).

### Extended Load by Session Type

| Session type | Additional files to load |
|---|---|
| Strategy / investment | `15_Decisions/FOUNDER_DECISIONS.md` + `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` |
| Product / PRD | `08_PRD/MASTER_PRD_v1.0.md` + `07_Product/PRODUCT_STRATEGY.md` |
| Technical | `09_Technical/TECHNICAL_ARCHITECTURE.md` + `10_AI/AI_STRATEGY.md` |
| Sprint planning | `02_Project_Management/MASTER_DELIVERY_PLAN.md` + `15_Decisions/OPEN_DECISIONS_TRACKER.md` |
| Decision-making | `15_Decisions/DECISION_LOG.md` + `_navigator/DECISION_STATUS_BOARD.md` |
| Risk / assumptions | `02_Project_Management/RISK_REGISTER.md` + `15_Decisions/ASSUMPTION_REGISTER.md` |
| Competitive analysis | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` + `14_Memory/PROJECT_MEMORY.md` |

Use `_ai_bootstrap/LOADING_ORDER.md` for the full 7-tier sequence when doing comprehensive work.

### Session Opener Template

Paste this to orient the AI at the start of a new session:

```
I am working on Tajribti (تجربتي), Egypt's Consumer Intelligence Platform.

KEY CONTEXT:
- B2B2C: brands pay, consumers receive free products, platform collects behavioral data
- Status: Development NOT authorized. Track 0 commercial validation only.
- 4 blocking items: B-01 (Track 0 GO), B-02 (LLC), B-03 (PDPL), B-04 (QR load test)
- All financial figures are ILLUSTRATIVE — no validated unit economics exist

LOAD THESE FILES FIRST:
1. workspace/_ai_bootstrap/AI_CONTEXT.md
2. workspace/_ai_bootstrap/PROJECT_CONTEXT.md

THEN LOAD FOR [SESSION TYPE]:
[specify: strategy / product / technical / decisions / risk]

Today's session goal: [state your goal here]
```

---

## Section 2 — What to Ask AI to Do (and Not Do)

### High-Value AI Tasks for This Project

| Task | How to frame it | Output location |
|---|---|---|
| Decision analysis | "Analyze the tradeoffs of [option A] vs [option B] against our FDD constraints" | `15_Decisions/DECISION_LOG.md` |
| Risk identification | "Identify risks I haven't captured in the Risk Register for [area]" | `02_Project_Management/RISK_REGISTER.md` |
| Assumption challenging | "Challenge my assumptions about [topic] — what might be wrong?" | `15_Decisions/ASSUMPTION_REGISTER.md` |
| Document drafting | "Draft a [document type] for [audience], using only facts from the loaded workspace" | Relevant workspace folder |
| Competitive research | "Research [competitor/market topic] and suggest workspace updates" | `12_Reviews/` or `14_Memory/` |
| PRD elaboration | "Elaborate the acceptance criteria for TJ-[feature] using the PRD as base" | `08_PRD/` |
| Technical review | "Review [architecture decision] against our ADRs and flag any conflicts" | `09_Technical/` or `15_Decisions/DECISION_LOG.md` |
| Sprint planning | "Given the open blocking items, what is the optimal Sprint 0 task sequence?" | `02_Project_Management/` |
| Memory capture | "What should I add to MASTER_PROJECT_MEMORY.md from this session?" | `14_Memory/MASTER_PROJECT_MEMORY.md` |

### What NOT to Ask AI to Do

| Ask | Why not |
|---|---|
| "Write the NestJS authentication module" | Development NOT authorized; RULE-D-01 |
| "Generate the Flutter QR scan implementation" | Same — no production code before Track 1 authorization |
| "Override this FDD decision because [reason]" | Locked decisions require FDD amendment process — RULE-DC-03 |
| "Assume the Samplia metrics apply to Egypt" | Direct assumption fallacy — A-MKT-06 is UNVALIDATED |
| "What are our unit economics?" | Don't exist yet — all figures are ILLUSTRATIVE until Track 0 |
| "Project our Year 3 revenue" | Cannot do this honestly until Track 0 produces validated price + volume data |
| "Is development authorized yet?" | Check `_navigator/DECISION_STATUS_BOARD.md` — AI can't verify external facts |

---

## Section 3 — During a Session

### Keep the AI on Track

If an AI response drifts from project constraints, use these corrections:

- **Wrong category framing:** "Remember: this is a Consumer Intelligence Platform, not a sampling platform."
- **Wrong company name:** "We say 'Tajribti (provisional)' or 'the platform' — not 'Samplia Egypt.'"
- **Unauthorized development advice:** "We're in Track 0 only — development isn't authorized yet."
- **Unvalidated figures treated as facts:** "Those figures are illustrative. Don't project from them as if they're validated."
- **Competitor blind spot:** "Marketeers Research is a near-direct competitor in Egypt — don't treat us as the only player."

### Tracking AI Suggestions

When an AI session generates a suggestion or insight worth keeping, explicitly ask the AI to:

1. Categorize it: Is it a decision, a risk, an assumption, a correction, a workspace update?
2. Write it to the right file
3. Update `CHANGELOG.md` with what was added

Don't let good analysis stay trapped in the chat window.

---

## Section 4 — Session Closeout Protocol

At the end of every productive AI session, run this checklist:

```
CLOSEOUT CHECKLIST:
□ Were any new decisions made? → Add to DECISION_LOG.md
□ Were any new risks identified? → Add to RISK_REGISTER.md
□ Were any assumptions validated or invalidated? → Update ASSUMPTION_REGISTER.md
□ Were any facts corrected? → Update MASTER_PROJECT_MEMORY.md
□ Were any files created or significantly changed? → Update CHANGELOG.md
□ Were any blocking items resolved? → Update DECISION_STATUS_BOARD.md
□ Is there anything the AI got wrong that I need to remember? → Note in MASTER_PROJECT_MEMORY.md
□ Should a Sprint Memory entry be created? → See SPRINT_MEMORY_TEMPLATE.md
```

Ask the AI: *"Based on this session, what should I update in the workspace?"*

---

## Section 5 — Prompt Patterns That Work

### For strategic analysis:
```
You are a strategic advisor for Tajribti (تجربتي), Egypt's Consumer Intelligence Platform.
Load context from AI_CONTEXT.md and FOUNDER_DECISIONS.md.
The platform is B2B2C, development is NOT authorized, and we are in Track 0.
[Your specific question]
Base your response only on facts in the workspace. Label any assumptions as ASSUMPTION.
```

### For challenging your own thinking:
```
Challenge this plan: [describe plan]
What could go wrong? What am I assuming that might be false?
Reference the Assumption Register and Risk Register in your response.
Do not assume anything works — ask what evidence would validate it.
```

### For drafting a workspace document:
```
Draft [document name] for the Tajribti workspace.
Audience: [Founder / IC / CTO / New engineer / AI assistant]
Use only facts from the workspace. Label estimates as ESTIMATE and assumptions as ASSUMPTION.
Format: [format instructions if needed]
Save the output to workspace/[path/FILENAME.md]
```

### For a decision analysis:
```
I need to decide: [decision]
Options:
A: [option A]
B: [option B]
Constraints from FDD: [relevant FDD decisions]
What are the tradeoffs? Which option better fits our locked decisions?
After analysis, draft the DECISION_LOG entry I should add.
```

### For a sprint planning session:
```
I am planning Sprint [number] for Tajribti.
Load: MASTER_DELIVERY_PLAN.md, DECISION_STATUS_BOARD.md, OPEN_DECISIONS_TRACKER.md
Current sprint status: [brief summary]
Blocking items still open: [list]
What is the optimal task sequence for this sprint, given constraints?
Output: Draft sprint plan in SPRINT_MEMORY_TEMPLATE.md format.
```

---

## Section 6 — Multi-Session Continuity

### When Resuming After a Break

1. Load Tier 1 files (always)
2. Load `14_Memory/MASTER_PROJECT_MEMORY.md` — captures current state, corrections, and open questions
3. Load `_navigator/DECISION_STATUS_BOARD.md` — confirms current authorization status
4. Load `CHANGELOG.md` — confirms what changed since your last session
5. State the session goal clearly

### When Context Window Fills Up

Long sessions compress earlier context. When this happens:
1. Ask the AI to summarize what was decided in this session
2. Write that summary to the appropriate workspace files immediately
3. Start a new session and load from workspace (not from chat history)

The workspace is designed to survive context window resets. Chat history is not.

### When Working with a Fresh AI Instance

The workspace should allow any AI assistant to orient fully from scratch. If an AI gives you advice that conflicts with workspace facts:
1. Point it to the specific workspace file that has the correct information
2. If the AI persists, the workspace governs — not the AI
3. Consider adding a note to `MASTER_PROJECT_MEMORY.md` about the confusion point

---

## Section 7 — AI Model Selection Guidance

| Task type | Recommended model | Why |
|---|---|---|
| Deep strategic analysis | Claude Opus 4.8 / claude-opus-4-8 | Strongest reasoning; best for multi-document synthesis |
| Document drafting | Claude Sonnet 4.6 / claude-sonnet-4-6 | Fast, high quality, cost-efficient |
| Quick Q&A / lookups | Claude Haiku 4.5 / claude-haiku-4-5-20251001 | Fastest, cheapest for simple queries |
| Multi-step workspace builds | Claude Code (CLI) | Reads/writes files directly; no copy-paste |
| Long document analysis | Claude Opus (with extended context) | Large context window; handles 14 documents at once |

**Default for this project:** Claude Sonnet 4.6 for standard work; Claude Opus 4.8 for investment analysis, architectural decisions, and complex strategic sessions.

---

## Section 8 — Workspace Maintenance with AI

The AI can and should help maintain the workspace, including:
- Adding entries to DECISION_LOG.md, RISK_REGISTER.md, ASSUMPTION_REGISTER.md
- Updating CHANGELOG.md
- Adding to MASTER_PROJECT_MEMORY.md
- Creating new sprint memory files from SPRINT_MEMORY_TEMPLATE.md
- Updating DECISION_STATUS_BOARD.md when blocking items are resolved

The AI must NOT:
- Modify any file in `inbox/`
- Delete files from `workspace/`
- Override locked decisions without explicit Founder instruction
- Write production code before development authorization

When asking AI to update workspace files:
- Be specific about which file to update
- Confirm the update was made before ending the session
- Verify the content is correct before closing

---

*Reference: `00_Source_of_Truth/PROJECT_RULES.md` Section 5 for AI collaboration rules.*
