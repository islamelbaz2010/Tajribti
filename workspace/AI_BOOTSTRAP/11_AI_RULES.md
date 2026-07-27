# AI Rules — Operating Manual for Future AI Sessions

**This is the binding operating manual for every AI assistant working on Tajribti. Read before answering anything.**

Source: `_ai_bootstrap/AI_CONTEXT.md`, `_ai_bootstrap/AI_WORKFLOW.md`, `00_Source_of_Truth/PROJECT_RULES.md`, founder instructions

---

## SECTION 1: Anti-Drift Protocol

Before generating ANY answer, verify:

1. Is my answer based on the **Current Objective** (`AI_BOOTSTRAP/04_CURRENT_OBJECTIVE.md`)?
2. Is my answer consistent with the **Current Phase** (`AI_BOOTSTRAP/05_CURRENT_PHASE.md`)?
3. Does my answer respect all **Founder Decisions** (`AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md`)?
4. Is my answer aligned with the **Project Constitution** (`AI_BOOTSTRAP/01_PROJECT_CONSTITUTION.md`)?

**If your answer introduces a concept, feature, technology, revenue stream, market, or approach that does NOT already exist in the repository:**

```
STOP.
Report the drift to the founder.
State: "This concept is not in the repository. Proceeding would expand scope."
Do not continue until the founder confirms.
```

**Never:**
- Expand the scope of the project
- Transform the project into a generic framework
- Suggest ideas that belong to a different product or phase
- Add features to fill perceived gaps — gaps are intentional

---

## SECTION 2: Absolute Rules (Non-Negotiable)

### RULE-AI-01: Never Call It a Sampling Company

The ONLY acceptable description: **Consumer Intelligence Platform** (B2B2C).

Using "sampling company," "activation agency," "field marketing," "promotional," or "logistics" as the category description is a strategic error. Correct it immediately if you catch it.

*Source: `01_PROJECT_CONSTITUTION.md`; `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`*

### RULE-AI-02: All Financial Figures Are ILLUSTRATIVE

Campaign price range ($4K–$20K), lean MVP cost ($90K–$120K), break-even (18–24 months), gross margin (~60%) — every figure is unvalidated.

**Always add this qualifier when citing financial figures:**  
> "ILLUSTRATIVE — not validated. Track 0 pricing discovery will produce real data."

Never present a financial figure as if it were a validated number.

*Source: `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`; `AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md` FIN-01*

### RULE-AI-03: Development Is NOT Authorized

Do NOT:
- Write production code
- Design database migrations
- Set up cloud infrastructure
- Create a Sprint 1–6 plan as if GO has been confirmed
- Suggest implementation details as if engineering has started

Track 0 only. No code. No infra. No engineering.

*Source: `13_Audits/REMEDIATION_REAUDIT.md`; `00_Source_of_Truth/PROJECT_RULES.md` RULE-D-01*

### RULE-AI-04: Acknowledge Marketeers Research

There IS a near-direct Egyptian competitor: **Marketeers Research** (Egypt/KSA/GCC/Europe, AI-powered "Smart Value™" FMCG analytics).

Never claim Tajribti has no direct competitors. Never claim the Egyptian market is uncontested.

*Source: `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` Section 3*

### RULE-AI-05: Tajribti Is a Provisional Name

"Tajribti" is the working name only. Trademark not cleared. Final brand name not yet decided (OD-01 is open).

Always flag this when discussing branding, trademark, or naming decisions.

*Source: `AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md` BR-01, BR-02*

### RULE-AI-06: Never Override Locked Decisions

If a decision is marked LOCKED in `03_FOUNDER_DECISIONS.md`, you may:
- Explain the rationale
- Surface risks or trade-offs
- Present new evidence that bears on it

You may NOT:
- Suggest reversing it without explicit founder instruction
- Treat it as "up for discussion" without being invited to do so
- Propose alternatives as if the decision hasn't been made

*Source: `00_Source_of_Truth/PROJECT_RULES.md` RULE-DC-01*

### RULE-AI-07: Cite Every Claim

Every factual claim must reference the source document. Do not state facts without attribution.

Format: *Source: `path/to/file.md` — Section Name*

If you cannot cite a source, mark the claim explicitly:  
> "[NO SOURCE — this is reasoning/inference, not documented fact]"

### RULE-AI-08: No Consumer or Brand Interview Data Exists

Zero consumer interviews have been conducted. Zero brand interviews have been conducted. Zero validated pricing data exists. All market assumptions are UNVALIDATED.

Never imply there is consumer or brand validation that hasn't happened.

*Source: `14_Memory/MASTER_PROJECT_MEMORY.md` Open Questions; `15_Decisions/ASSUMPTION_REGISTER.md`*

---

## SECTION 3: Conflict Resolution

### If You Find a Conflict Between Files

1. Document the conflict explicitly
2. State which file has higher authority (see authority chain below)
3. Do NOT resolve the conflict yourself
4. Flag it to the founder

**Authority chain (highest to lowest):**
1. `15_Decisions/FOUNDER_DECISIONS.md` (FDD)
2. `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` (IC v2.0)
3. `08_PRD/MASTER_PRD_v1.0.md` (Master PRD)
4. `09_Technical/TECHNICAL_ARCHITECTURE.md` (Tech Architecture)
5. `02_Project_Management/MASTER_DELIVERY_PLAN.md` (Delivery Plan)
6. `13_Audits/REMEDIATION_REAUDIT.md` (Latest audit state)

If two documents at the same authority level conflict, flag both and state: "Conflict between [File A] and [File B]. Cannot resolve without founder instruction."

*Source: `00_Source_of_Truth/SOURCE_OF_TRUTH.md`; `00_Source_of_Truth/PROJECT_RULES.md` RULE-DC-01*

---

## SECTION 4: Scope Rules

### What an AI CAN help with right now

- Brand pitch deck and outreach materials
- Brand discovery call frameworks and scripts
- Pricing discovery methodology
- LOI template drafting
- Egyptian LLC incorporation checklist
- PDPL research and lawyer engagement brief
- Strategic analysis within existing scope
- Document drafting (new decisions, risk entries, assumption updates)
- Track 0 sprint planning
- Asking hard questions about assumptions

### What an AI CANNOT help with right now

| Task | Why Not |
|---|---|
| Write production code | Development not authorized |
| Design APIs or endpoints | No engineering without GO |
| Infrastructure provisioning | Track 0 is commercial-only |
| Sprint 1–6 planning as current | Post-GO only |
| GCC market analysis | Geographic non-goal |
| Non-FMCG vertical strategy | Sector non-goal Years 1–3 |
| RAG / vector DB design | Explicitly deferred |
| AI narrative feature design | TJ-018 is V2 only |
| Microservices architecture | ADR-01 is LOCKED |
| External funding pitch | OD-04 is open — no decision made |

*Source: `_ai_bootstrap/AI_WORKFLOW.md` Section 4; `AI_BOOTSTRAP/04_CURRENT_OBJECTIVE.md`*

---

## SECTION 5: Session Protocol

### Before Answering Any Question

1. Load `AI_BOOTSTRAP/00_AI_START_HERE.md` (have you read this session?)
2. Load `AI_BOOTSTRAP/02_PROJECT_STATE.md` (is dev authorized? what phase?)
3. Load `AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md` (does the question touch a locked decision?)
4. Apply Anti-Drift Protocol (Section 1 above)
5. Check: does my answer introduce out-of-scope concepts? If yes → STOP

### At Session End

Before closing:
- Has a new decision been made? → Add to `15_Decisions/DECISION_LOG.md`
- Has a new risk been identified? → Add to `02_Project_Management/RISK_REGISTER.md`
- Has an assumption been validated or invalidated? → Update `15_Decisions/ASSUMPTION_REGISTER.md`
- Has a correction been identified? → Update `14_Memory/MASTER_PROJECT_MEMORY.md`
- Has a significant change occurred? → Update `CHANGELOG.md`
- Are blocking items updated? → Update `15_Decisions/OPEN_DECISIONS_TRACKER.md`

*Source: `_ai_bootstrap/AI_WORKFLOW.md` Session Closeout Checklist*

---

## SECTION 6: How This Project Is Different

Most AI projects work against a live codebase with active development. This one is different:

1. **No code exists** — all architecture is designed but not implemented
2. **Authorization is the bottleneck** — the reason to not build is deliberate, not a failure
3. **The workspace IS the product** right now — the 73-file knowledge workspace is the deliverable for this phase
4. **The founder uses AI as a strategic thinking partner** — not just a code generator
5. **Evidence discipline is explicit** — FACT / ESTIMATE / ASSUMPTION distinctions matter
6. **Every figure is labeled** — no financial number is presented without its validation status

When working on this project, match this rigor.

*Source: `_ai_bootstrap/AI_CONTEXT.md`; `14_Memory/MASTER_PROJECT_MEMORY.md`; founder-observed patterns*
