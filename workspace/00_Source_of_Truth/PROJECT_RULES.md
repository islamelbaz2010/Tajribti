# Project Rules — Tajribti Consumer Intelligence Platform

**Authority:** These rules govern how this project is run and how this workspace is maintained.  
**Status:** Binding. Amendment requires Founder decision documented in DECISION_LOG.md.  
**Last updated:** 2026-07-27

---

## Rule Category Summary

| Category | Rules |
|---|---|
| Workspace integrity | 5 rules |
| Development authorization | 3 rules |
| Decision-making | 4 rules |
| Documentation | 4 rules |
| AI collaboration | 4 rules |
| Naming and language | 3 rules |
| Financial discipline | 2 rules |
| **Total** | **25 rules** |

---

## Section 1 — Workspace Integrity Rules

### RULE-W-01: Source files are immutable

The `inbox/` folder contains the 14 source documents. These files are sacred:
- **Never modify** any file in `inbox/`
- **Never rename** any file in `inbox/`
- **Never delete** any file in `inbox/`
- **Never overwrite** any file in `inbox/`

All generated output goes inside `workspace/` only.

### RULE-W-02: workspace/ is the permanent source of truth

All project knowledge lives in `workspace/`. Not in chat logs. Not in AI session memory. Not in private notes. When a decision is made, a risk is identified, an assumption is validated, or a document is updated — it is recorded in `workspace/` before the session ends.

### RULE-W-03: Never create files outside workspace/

The working directory for this project is the project root. Never create files in `inbox/`, the parent directory, or any location outside `workspace/`. All output paths must begin with `workspace/`.

### RULE-W-04: Every workspace file has a single authoritative location

No content is duplicated across files. When the same information needs to appear in multiple places, one file holds the content and others reference it with a path link. Exception: summary tables in MASTER_INDEX and MASTER_PROJECT_MEMORY may reproduce key facts for navigation purposes.

### RULE-W-05: CHANGELOG.md is updated with every meaningful workspace change

Any file creation, significant edit, path change, or structural reorganization is logged in `workspace/CHANGELOG.md` before the session ends. The entry must include: date, what changed, why.

---

## Section 2 — Development Authorization Rules

### RULE-D-01: No production code until development is authorized

Development is currently **NOT AUTHORIZED** (IERB score 67/100). The 4 blocking items (B-01 through B-04) must be closed before any production code is written, any engineers are hired, or any infrastructure is provisioned.

This rule applies to:
- Writing application code (NestJS, Flutter, React, Python/FastAPI)
- Provisioning production AWS infrastructure
- Setting up production database instances
- Hiring full-time engineers

This rule does NOT apply to:
- Architecture design documents
- PRD and specification work
- AI analysis and planning
- Proof-of-concept code written clearly as exploratory only

### RULE-D-02: Track 0 before Track 1

Track 0 ($15K–$25K commercial validation sprint, 60 days, no engineering) must conclude with a GO decision before Track 1 (full build) is authorized. No skipping. No parallelizing without explicit Founder decision to do so.

Track 0 objectives are:
1. Secure ≥3 brand LOIs with indicative pricing
2. Confirm LLC incorporation
3. Obtain PDPL legal scope opinion
4. Validate consumer participation willingness

### RULE-D-03: Kill criterion must be enforced

Track 0 kill criterion: If <3 brand LOIs are secured within 60 days, the GO/NO-GO decision is NO-GO. The kill criterion is not negotiable. Its enforcement protects founder capital and prevents sunk-cost reasoning from driving bad decisions.

If NO-GO is triggered: document the findings in the Assumption Register (mark critical assumptions INVALIDATED), record the decision in the Decision Log, and do not proceed to Track 1 without a validated pivot.

---

## Section 3 — Decision-Making Rules

### RULE-DC-01: FDD governs all conflicts

When any two documents say different things, the Founder Decisions Document (FDD) in `15_Decisions/FOUNDER_DECISIONS.md` is the tie-breaker. The FDD is the constitutional document. All other documents are downstream.

Full authority chain:
1. FDD → 2. IC v2.0 → 3. Remediation Re-Audit → 4. PRD → 5. Technical Architecture → 6. Delivery Plan

### RULE-DC-02: Every new decision is logged before implementation

Before implementing any decision — technical, operational, product, financial — the decision is added to `15_Decisions/DECISION_LOG.md` with: ID, date, category, decision, rationale, and authority. "We'll document it later" is not acceptable.

### RULE-DC-03: Locked decisions require FDD amendment to change

Decisions marked LOCKED in DECISION_LOG.md cannot be reversed by an AI suggestion, a new document, or an off-the-cuff conversation. Reversing a LOCKED decision requires:
1. Explicit Founder decision to amend
2. FDD updated
3. DECISION_LOG.md updated with reversal entry
4. All downstream documents updated

### RULE-DC-04: Open decisions do not block documentation

When a decision is OPEN, the workspace documents the open state clearly and marks downstream content as provisional. Open decisions do not prevent documentation from being created — they require provisional labels until the decision is closed.

---

## Section 4 — Documentation Rules

### RULE-DOC-01: FACT, ESTIMATE, and ASSUMPTION are always labeled

Any quantitative claim in any document must be labeled as one of:
- **FACT** — verified with a named source
- **ESTIMATE** — calculated from available data with stated assumptions
- **ASSUMPTION** — believed to be true but unvalidated

Claims without labels are treated as assumptions. The Assumption Register (`15_Decisions/ASSUMPTION_REGISTER.md`) is the master list.

### RULE-DOC-02: Provisional name appears with disclaimer

Whenever "Tajribti" appears in a document that could be used in a legal, contractual, or brand-asset context, the following disclaimer must accompany it:

> *"Tajribti is a working name pending trademark and domain clearance."*

Code repositories, domain registrations, and legal filings treat the name as provisional until FDD OD-01 is closed.

### RULE-DOC-03: Financial figures are labeled ILLUSTRATIVE until validated

All revenue, cost, and unit-economic figures are labeled "ILLUSTRATIVE" or "ESTIMATE" until Track 0 produces validated data from real brand negotiations. No financial figure is presented as a validated forecast before this point.

### RULE-DOC-04: Superseded documents are archived, not deleted

When a document is superseded by a later version, it is moved to `18_Archive/` and registered in `18_Archive/SUPERSEDED_DOCUMENTS.md`. The superseded document is never deleted. The inbox/ source file is never moved.

---

## Section 5 — AI Collaboration Rules

### RULE-AI-01: AI does not modify source files

AI assistants (Claude, ChatGPT) working on this project must never propose or execute modifications to any file in `inbox/`. All AI output goes to `workspace/`.

### RULE-AI-02: AI outputs are captured to workspace before session ends

Any AI-generated content that is worth keeping — decisions, analysis, framework outputs, plans, corrections — is written to the appropriate workspace file before the session closes. Chat history is ephemeral; workspace is permanent.

### RULE-AI-03: AI must load context before advising

An AI assistant that has not loaded at minimum:
- `_ai_bootstrap/AI_CONTEXT.md`
- `_ai_bootstrap/PROJECT_CONTEXT.md`
- `15_Decisions/FOUNDER_DECISIONS.md`

...should not make strategic recommendations. The workspace exists specifically to make AI context loading fast and accurate. Use `_ai_bootstrap/LOADING_ORDER.md` to determine the right loading sequence for each type of session.

### RULE-AI-04: AI does not override locked decisions

An AI assistant must not suggest overriding a LOCKED decision from the FDD unless the Founder explicitly asks it to reconsider. Locked decisions represent concluded deliberation. Reopening them wastes time and creates confusion.

---

## Section 6 — Naming and Language Rules

### RULE-NL-01: Egyptian-dialect Arabic is the primary language for consumer-facing content

Consumer app copy, push notifications, and in-app support messages default to Egyptian-dialect Arabic. Formal Modern Standard Arabic is not used in consumer-facing surfaces. English is a secondary toggle for bilingual users.

### RULE-NL-02: Category name is always "Consumer Intelligence Platform"

The platform is never described as:
- A "sampling company"
- A "coupon app"
- A "product trial app"
- A "sampling platform"

It is always "Egypt's Consumer Intelligence Platform" (or "the platform" in shorthand). Free samples are the acquisition mechanic. Data is the product.

### RULE-NL-03: Consistent naming across workspace files

| Correct | Incorrect |
|---|---|
| Tajribti (تجربتي) | Tajrubti, Tagribti, Tagrobty |
| Consumer Intelligence Platform | Sampling platform, sampling company |
| Samplia | Samplia.com, Samplía |
| Marketeers Research | Marketeers, The Marketeers |
| PDPL | Data Protection Law (non-specific) |
| IERB | The Board, the Audit Board |
| FDD | Founder Decision Doc, Decisions Document |

---

## Section 7 — Financial Discipline Rules

### RULE-FD-01: No capital commitment without Founder authorization

No vendor contract, subscription, service agreement, or financial commitment is made without explicit Founder authorization. All Sprint 0 spending must fit within the $15K–$25K Track 0 envelope.

### RULE-FD-02: Unit economics are built bottom-up from real data

No financial projection is treated as a plan until it is built bottom-up from:
1. Validated brand pricing (≥3 LOIs from Track 0)
2. Measured consumer CAC (from Track 0 activation pilot)
3. Tested operations cost (from Sprint 0 vendor quotes)

Top-down TAM/SAM/SOM calculations are for investor framing only — not for internal planning.

---

## Rule Amendment Log

| Date | Rule ID | Change | Authorized by |
|---|---|---|---|
| 2026-07-27 | All | Initial rules documented | Founder |

*To amend any rule: add a row above, state the change, and ensure the corresponding DECISION_LOG.md entry references this amendment.*
