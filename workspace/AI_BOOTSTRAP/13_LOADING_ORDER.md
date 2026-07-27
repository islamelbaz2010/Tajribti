# Loading Order — What to Load and When

**Exactly which files an AI must load, in what order, for each session type.**

Source: `_ai_bootstrap/LOADING_ORDER.md`, `_ai_bootstrap/AI_WORKFLOW.md`, `_ai_bootstrap/AI_CONTEXT.md`

---

## Universal Minimum Load (Every Session, No Exceptions)

Load these 4 files every single session before answering anything:

```
1.  AI_BOOTSTRAP/00_AI_START_HERE.md          (1-page orientation)
2.  AI_BOOTSTRAP/02_PROJECT_STATE.md          (current status + blockers)
3.  AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md      (all locked decisions)
4.  AI_BOOTSTRAP/11_AI_RULES.md               (operating rules)
```

**Estimated load time: ~2 minutes**  
**Token budget: ~8,000 tokens**

After these 4, apply `AI_BOOTSTRAP/12_AI_CHECKLIST.md` before generating your first answer.

---

## Session Type: Strategic Advice

*"How should we approach X?" / "What's the best way to Y?" / "Analyze Z"*

```
Tier 1 — Universal minimum (above)
Tier 2 — Strategic context
    5.  AI_BOOTSTRAP/01_PROJECT_CONSTITUTION.md   (what IS / IS NOT the project)
    6.  AI_BOOTSTRAP/04_CURRENT_OBJECTIVE.md      (what we're doing right now)
    7.  AI_BOOTSTRAP/05_CURRENT_PHASE.md          (Track 0 constraints)
Tier 3 — Domain specific
    8.  07_Product/GO_TO_MARKET.md                (brand outreach strategy)
    9.  04_Investment/IC_MEMO_v1.0.md             (conditional GO requirements)
    10. 02_Project_Management/RISK_REGISTER.md   (risks to consider)
```

---

## Session Type: Product / Feature Questions

*"How should TJ-005 work?" / "What features are P0?" / "What's in the MVP?"*

```
Tier 1 — Universal minimum (above)
Tier 2 — Product context
    5.  08_PRD/MASTER_PRD_v1.0.md                (22 features, personas, data model)
    6.  AI_BOOTSTRAP/07_DOMAIN_MODEL.md          (entities, state machines)
    7.  07_Product/PRODUCT_STRATEGY.md           (roadmap, SWOT)
```

---

## Session Type: Technical Architecture

*"How does X work technically?" / "What database design should we use?" / "ADR for Z"*

```
Tier 1 — Universal minimum (above)
Tier 2 — Technical context
    5.  09_Technical/TECHNICAL_ARCHITECTURE.md   (full tech stack, all ADRs)
    6.  AI_BOOTSTRAP/08_ARCHITECTURE_MAP.md      (one-page overview)
    7.  06_Enterprise_Architecture/ENTERPRISE_ARCHITECTURE.md (EA capability model)
    8.  10_AI/AI_STRATEGY.md                     (AI service design)
```

---

## Session Type: Investment / Business Analysis

*"Is this a good investment?" / "What are the risks?" / "What does the IC think?"*

```
Tier 1 — Universal minimum (above)
Tier 2 — Investment context
    5.  04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md (full 19K-word analysis)
    6.  04_Investment/IC_MEMO_v1.0.md            (recommendation + conditions)
    7.  13_Audits/REMEDIATION_REAUDIT.md         (current authorization status)
    8.  02_Project_Management/RISK_REGISTER.md   (20 risks)
    9.  15_Decisions/ASSUMPTION_REGISTER.md      (40 assumptions + validation status)
```

---

## Session Type: Competitive Analysis

*"Who are our competitors?" / "How does Marketeers Research compare?" / "Market position?"*

```
Tier 1 — Universal minimum (above)
Tier 2 — Competitive context
    5.  12_Reviews/PEER_REVIEW_MASTER_REPORT.md  (competitors, corrections)
    6.  07_Product/PRODUCT_STRATEGY.md           (SWOT, Porter's Five Forces, PESTEL)
    7.  04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md (market analysis section)
    8.  07_Product/GO_TO_MARKET.md               (GTM + brand target list)
```

---

## Session Type: Sprint Planning

*"Plan Sprint 0" / "What should we do next sprint?" / "What's our sprint goal?"*

```
Tier 1 — Universal minimum (above)
Tier 2 — Delivery context
    5.  AI_BOOTSTRAP/04_CURRENT_OBJECTIVE.md     (what we need to accomplish)
    6.  02_Project_Management/MASTER_DELIVERY_PLAN.md (sprint schedule, WBS)
    7.  02_Project_Management/SPRINT_MEMORY_TEMPLATE.md (sprint capture format)
    8.  15_Decisions/OPEN_DECISIONS_TRACKER.md   (blocking items status)
    9.  02_Project_Management/RISK_REGISTER.md   (risks to address in sprint)
```

---

## Session Type: Decision Making

*"Should we do X?" / "Which option is better?" / "What's the decision on Y?"*

```
Tier 1 — Universal minimum (above)
Tier 2 — Decision context
    5.  15_Decisions/OPEN_DECISIONS_TRACKER.md   (is this already decided?)
    6.  15_Decisions/DECISION_LOG.md             (decision history and format)
    7.  AI_BOOTSTRAP/01_PROJECT_CONSTITUTION.md  (non-goals — is this in scope?)
    8.  15_Decisions/ASSUMPTION_REGISTER.md      (relevant assumptions)
    9.  00_Source_of_Truth/PROJECT_RULES.md      (rules governing decisions)
```

---

## Session Type: Assumptions and Risks

*"What assumptions are we making?" / "What are our risks?" / "Validate assumption X"*

```
Tier 1 — Universal minimum (above)
Tier 2 — Risk/assumption context
    5.  15_Decisions/ASSUMPTION_REGISTER.md      (40 assumptions, validation status)
    6.  02_Project_Management/RISK_REGISTER.md   (20 risks, scores)
    7.  04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md (risk analysis section)
```

---

## Session Type: AI Strategy

*"How should we use AI?" / "What's our AI roadmap?" / "LLM provider decision"*

```
Tier 1 — Universal minimum (above)
Tier 2 — AI strategy context
    5.  10_AI/AI_STRATEGY.md                     (AI philosophy, features, flywheel)
    6.  09_Technical/TECHNICAL_ARCHITECTURE.md   (ADR-07, ADR-08)
    7.  08_PRD/MASTER_PRD_v1.0.md               (TJ-018, TJ-021 feature specs)
```

---

## Session Type: Full Project Context (New AI Joining)

*First session / context reset / comprehensive onboarding*

```
Tier 1 — Universal minimum (above)
Tier 2 — Complete orientation
    5.  AI_BOOTSTRAP/01_PROJECT_CONSTITUTION.md  (what IS / IS NOT)
    6.  AI_BOOTSTRAP/04_CURRENT_OBJECTIVE.md     (right now)
    7.  AI_BOOTSTRAP/05_CURRENT_PHASE.md         (phase context)
    8.  AI_BOOTSTRAP/06_PROJECT_GLOSSARY.md      (all key terms)
    9.  AI_BOOTSTRAP/07_DOMAIN_MODEL.md          (actors, entities)
    10. AI_BOOTSTRAP/08_ARCHITECTURE_MAP.md      (tech overview)
    11. AI_BOOTSTRAP/09_REPOSITORY_MAP.md        (workspace map)
    12. 14_Memory/MASTER_PROJECT_MEMORY.md       (living memory)
```

**Estimated load time: ~10–15 minutes for full context**

---

## Context Budget Reference

| Tier | Files | Est. Tokens | Covers |
|---|---|---|---|
| Universal minimum | 4 files | ~8K | Authorization, decisions, rules |
| + Strategic | +5 files | ~20K | Constitution, objective, phase, GTM, risks |
| + Product | +3 files | ~25K | Full PRD, domain model, strategy |
| + Technical | +4 files | ~30K | Full tech architecture, AI strategy |
| + Investment | +5 files | ~45K | Full IC analysis, audit, assumptions |
| Full onboarding | All above | ~60K | Complete project context |

*Adjust based on the model's context window. Claude Opus 4.8 can hold the full onboarding set.*

---

## Files That Are NEVER Needed for Answering (Reference Only)

- `_structured_data/` files — machine-readable, redundant with markdown files
- `11_Prompts/CHATGPT_PROMPTS.md` — historical prompt structure, not current state
- `16_Reports/` — generated reports, superseded by more detailed source docs
- `03_Research/SOURCE_VIDEO_TRANSCRIPT.md` — project genesis only; not needed for most answers
- `CONTRIBUTING.md` — workspace governance, not product knowledge
- `02_Project_Management/sprints/` — sprint files (don't exist yet; will be created per sprint)

*Source: `_ai_bootstrap/LOADING_ORDER.md` — Files Not Needed for Initial Context*
