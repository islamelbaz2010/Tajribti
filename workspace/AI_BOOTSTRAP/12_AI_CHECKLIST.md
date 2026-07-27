# AI Checklist — Mandatory Before Every Answer

**Run through this checklist before generating any answer. Every item. No skipping.**

---

## PRE-ANSWER CHECKLIST

### Step 1: Authorization Check
```
[ ] Is development currently authorized?
    → Answer: NO (IERB 67/100, NOT AUTHORIZED)
    → If question involves writing code or provisioning infra → flag immediately
    Source: AI_BOOTSTRAP/02_PROJECT_STATE.md
```

### Step 2: Phase Check
```
[ ] What phase are we in?
    → Answer: Track 0 — Commercial Validation. No engineering.
    → If answer assumes engineering has started → STOP and correct
    Source: AI_BOOTSTRAP/05_CURRENT_PHASE.md
```

### Step 3: Scope Check
```
[ ] Does this question involve:
    [ ] Engineering or code? → Flag: "Development not authorized. Track 0 only."
    [ ] GCC expansion? → Flag: "Geographic non-goal. Egypt first."
    [ ] Non-FMCG sectors? → Flag: "Sector non-goal for Years 1–3."
    [ ] RAG or vector DB? → Flag: "Explicitly deferred. Not in V1 roadmap."
    [ ] AI narratives (TJ-018)? → Flag: "V2 feature only. Deferred."
    [ ] Microservices? → Flag: "ADR-01 is LOCKED. Modular monolith."
    [ ] External funding pitch? → Flag: "OD-04 is open. Not decided."
    Source: AI_BOOTSTRAP/11_AI_RULES.md Section 4
```

### Step 4: Decision Check
```
[ ] Does this question involve a locked founder decision?
    → Check: AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md
    → If LOCKED: explain rationale, surface risks, but do NOT suggest reversal
    → If OPEN: may explore — but confirm it IS open before treating it as undecided
    Source: AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md; 15_Decisions/OPEN_DECISIONS_TRACKER.md
```

### Step 5: Financial Figure Check
```
[ ] Does my answer include any financial figure?
    → ALL figures must include: "(ILLUSTRATIVE — not validated)"
    → Figures: $4K–$20K campaign price, $90K–$120K MVP cost,
               18–24 months break-even, ~60% gross margin
    → No exceptions. No implied validation.
    Source: PEER_REVIEW_MASTER_REPORT.md; AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md FIN-01
```

### Step 6: Competitor Check
```
[ ] Does my answer involve competitive landscape?
    → Must acknowledge Marketeers Research (Egypt/KSA/GCC, AI-powered, Smart Value™)
    → Samplia is a REFERENCE company, not a competitor
    → Never claim the Egyptian market is uncontested
    Source: 12_Reviews/PEER_REVIEW_MASTER_REPORT.md Section 3
```

### Step 7: Category Check
```
[ ] Does my answer describe what Tajribti IS?
    → The ONLY acceptable description: Consumer Intelligence Platform (B2B2C)
    → NEVER USE: sampling company / activation agency / field marketing / logistics
    Source: AI_BOOTSTRAP/01_PROJECT_CONSTITUTION.md
```

### Step 8: Name Check
```
[ ] Does my answer use "Tajribti" as a confirmed brand name?
    → It is PROVISIONAL — trademark not cleared
    → Acceptable: "the working name Tajribti (تجربتي)" or "provisionally named Tajribti"
    Source: AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md BR-01
```

### Step 9: Data Validation Check
```
[ ] Does my answer imply validated consumer or brand data?
    → ZERO interviews have been conducted
    → ZERO brand commitments exist
    → ALL market assumptions are UNVALIDATED
    → Any claim about consumer behavior or brand WTP is an assumption
    Source: 14_Memory/MASTER_PROJECT_MEMORY.md; 15_Decisions/ASSUMPTION_REGISTER.md
```

### Step 10: Source Citation Check
```
[ ] Does every factual claim cite a source?
    → Format: *Source: path/to/file.md — Section*
    → If no source: mark as "[NO SOURCE — reasoning/inference]"
    → Do not state facts without attribution
    Source: AI_BOOTSTRAP/11_AI_RULES.md RULE-AI-07
```

### Step 11: Anti-Drift Final Check
```
[ ] Does my answer introduce ANY concept not already in the repository?
    → New market? → STOP. Report drift.
    → New feature? → STOP. Report drift.
    → New technology? → STOP. Report drift.
    → New revenue stream? → STOP. Report drift.
    → New strategic approach? → STOP. Report drift.
    Source: AI_BOOTSTRAP/11_AI_RULES.md Section 1
```

---

## QUICK-FIRE FACT CHECKS

These specific facts must always be stated correctly:

| Fact | Correct Value | Common Error to Avoid |
|---|---|---|
| Platform category | Consumer Intelligence Platform | Sampling company |
| Business model | B2B2C | B2B or B2C |
| Development status | NOT AUTHORIZED | Authorized / in progress |
| Current phase | Track 0 (commercial validation) | Development / Sprint X |
| Samplia founding year | 2013 | 1013 (typo from source) |
| Samplia type | Bootstrapped reference company | Competitor |
| Marketeers Research | Near-direct competitor (Egypt/KSA) | Indirect / not mentioned |
| "Tajribti" brand name | PROVISIONAL | Confirmed brand name |
| Financial figures | ALL ILLUSTRATIVE | Validated projections |
| Consumer interviews | ZERO conducted | Ongoing / completed |
| QR redemption risk | HIGHEST technical risk | Routine feature |
| AI moat | Data + brand relationships | The AI technology |
| Cloud region | PROVISIONAL (pending PDPL) | Confirmed as Bahrain |

*Source: `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`; `_ai_bootstrap/AI_CONTEXT.md`; `13_Audits/REMEDIATION_REAUDIT.md`*

---

## BLOCKING ITEMS STATUS (Update This Section When Status Changes)

| ID | Blocker | Open / Closed |
|---|---|---|
| B-01 | Track 0 GO/NO-GO | OPEN |
| B-02 | LLC incorporation | OPEN |
| B-03 | PDPL written legal sign-off | OPEN |
| B-04 | QR concurrency load test | OPEN (blocked by B-01) |

All 4 are OPEN. Engineering cannot begin until all 4 are CLOSED.

*Source: `15_Decisions/OPEN_DECISIONS_TRACKER.md`; `13_Audits/REMEDIATION_REAUDIT.md`*
