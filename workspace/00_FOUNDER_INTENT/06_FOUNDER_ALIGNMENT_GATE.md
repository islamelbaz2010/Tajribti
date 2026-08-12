# FOUNDER ALIGNMENT GATE
## Mandatory Verification — Execute Before Any Answer

**This gate executes immediately after the 5 Founder Intent files are loaded.**  
**No session may answer any question until this gate PASSES.**  
**Every item must be answered from repository evidence only. No reasoning. No inference. No invention.**

---

## EXECUTION PROTOCOL

Read each question. Pull the answer from the already-loaded Founder Intent files. Verify against the source cited. Score the category. Only then proceed.

If you cannot source the answer from the repository: STOP. The gate fails.

---

## QUESTION 1 — What business is Tajribti actually building?

**Answer (maximum 20 words):**

> A B2B2C Consumer Intelligence Platform where brands pay, consumers receive free products, and Tajribti delivers structured consumer truth.

**Source:** `00_FOUNDER_INTENT/01_FOUNDER_VISION.md` — What This IS / IS NOT table  
**Gate category:** Founder Vision

---

## QUESTION 2 — What is Tajribti selling?

**Answer (one sentence only):**

> Tajribti is selling a question answered: "What did Egyptian consumers actually think of my product the first time they tried it?"

**Source:** `00_FOUNDER_INTENT/02_CORE_VALUE_ENGINE.md` — What Is Actually Being Sold  
**Gate category:** Core Value Engine

---

## QUESTION 3 — What is the Core Value Engine?

**Answer (maximum 7 steps):**

```
1. Consumer receives free product sample at a retail location
2. Tries the product   [this step cannot fail]
3. Answers 5 questions on a phone
4. Brand receives consumer intelligence report within 24 hours
5. Brand pays
6. Tajribti earns revenue
7. Panel grows — the moat deepens with every campaign
```

**Source:** `00_FOUNDER_INTENT/02_CORE_VALUE_ENGINE.md` — The Minimum Chain  
**Gate category:** Core Value Engine

---

## QUESTION 4 — What is forbidden during Track 0?

**Answer:**

The entire engineering layer. No exceptions.

| Forbidden | Source |
|---|---|
| Flutter consumer app | BD-13 LOCKED |
| React brand portal | BD-13 LOCKED |
| React operations portal | BD-13 LOCKED |
| NestJS API | BD-13 LOCKED |
| PostgreSQL schema | BD-13 LOCKED |
| AWS infrastructure | BD-13 LOCKED |
| Terraform | BD-13 LOCKED |
| CI/CD pipeline | BD-13 LOCKED |
| Any backend service | BD-13 LOCKED |
| New architecture constitutions | Section 3 — frozen |
| New AI bootstrap files | Section 3 — frozen |
| New navigator index files | Section 3 — frozen |
| New governance frameworks | Section 3 — frozen |

**Source:** `00_FOUNDER_INTENT/04_WHAT_NOT_TO_BUILD.md` — Section 1 and Section 3  
**Gate category:** What Not To Build

---

## QUESTION 5 — What is the single North Star metric?

**Answer:**

```
MEOS Pipeline — Stage 2+ Brand Count

Current:       0
Day 45 target: ≥ 5 brands at Stage 2 (interested, engaged)
Day 60 target: ≥ 3 signed pilot LOIs
```

If the Stage 2+ count did not increase since the last session: the Founder's only job is to make it increase.

**Source:** `00_FOUNDER_INTENT/05_PROJECT_NORTH_STAR.md` — The Only Number That Matters  
**Gate category:** North Star

---

## QUESTION 6 — What causes an immediate NO-GO recommendation?

**Answer:**

Fewer than 3 signed pilot LOIs at the end of the 60-day Track 0 window.

> *"If you don't get 5 interested companies in the discovery phase, don't start coding."*

This criterion cannot be waived. It cannot be extended. It is the commercial thesis test.

**Source:** `00_FOUNDER_INTENT/03_NON_NEGOTIABLE_RULES.md` — Rule 2; `00_FOUNDER_INTENT/05_PROJECT_NORTH_STAR.md` — Kill Criterion  
**Gate category:** Track 0

---

## QUESTION 7 — Can engineering begin today?

**Answer: NO**

Engineering cannot begin today.

Repository evidence:
- Authorization status: DEVELOPMENT NOT AUTHORIZED (`AI_BOOTSTRAP/02_PROJECT_STATE.md`)
- IERB Re-Audit Score: 67/100 — below the 80/100 threshold required for GO (`13_Audits/REMEDIATION_REAUDIT.md`)
- B-01 is OPEN — Track 0 GO decision not yet issued (`15_Decisions/OPEN_DECISIONS_TRACKER.md`)
- B-02 is OPEN — Egyptian LLC not yet incorporated
- B-03 is OPEN — PDPL written legal opinion not yet obtained
- B-04 is OPEN and blocked by B-01 — QR load test cannot be executed until GO is issued
- BD-13 is LOCKED — engineering begins only after written Track 0 GO decision

Any recommendation to begin engineering, design an API, provision infrastructure, or write production code must be rejected immediately.

**Source:** `00_FOUNDER_INTENT/03_NON_NEGOTIABLE_RULES.md` — Rule 1; `00_FOUNDER_INTENT/05_PROJECT_NORTH_STAR.md` — Four Blockers  
**Gate category:** Track 0

---

## QUESTION 8 — What should every recommendation increase?

**Answer (from repository only):**

Every recommendation must increase the probability of one or more of these three outcomes:

```
1. First LOI signed
2. First pilot executed
3. First paying customer
```

If a recommendation cannot be directly connected to one of these three outcomes, it must be redirected before it is delivered.

**Source:** `00_FOUNDER_INTENT/05_PROJECT_NORTH_STAR.md` — What Every AI Session Must Do; `AI_BOOTSTRAP/12_AI_CHECKLIST.md` — Project Director Checklist  
**Gate category:** Commercial Objective

---

## FOUNDER ALIGNMENT SCORE

Score each category after answering. Every category must be PASS.

| # | Category | Check | Score |
|---|---|---|---|
| 1 | **Founder Vision** | Answer correctly identifies: B2B2C Consumer Intelligence Platform. Brands pay. Consumers try. Tajribti delivers structured truth. | PASS / FAIL |
| 2 | **Core Value Engine** | Answer correctly identifies: the 7-step minimum chain. The panel as the moat. The question being sold — not the technology. | PASS / FAIL |
| 3 | **Commercial Objective** | Answer correctly identifies: every recommendation must connect to First LOI / First Pilot / First Paying Customer. | PASS / FAIL |
| 4 | **Track 0** | Answer correctly identifies: engineering not authorized. All 4 blockers OPEN. Kill criterion absolute. | PASS / FAIL |
| 5 | **North Star** | Answer correctly identifies: Stage 2+ Brand Count as the single metric. Current count: 0. Day 45 target: ≥5. Day 60 target: ≥3 LOIs. | PASS / FAIL |
| 6 | **Non-Negotiable Rules** | Answer correctly identifies: 10 rules active. No rule may be relaxed. All financial figures ILLUSTRATIVE. Marketeers Research is a near-direct competitor. | PASS / FAIL |
| 7 | **What Not To Build** | Answer correctly identifies: entire engineering layer forbidden during Track 0. Workspace should not grow during Track 0. Section 2 deferral list active. | PASS / FAIL |

---

## GATE DECISION

### IF ANY CATEGORY SCORES FAIL

```
FOUNDER ALIGNMENT FAILED

Reason:         [State the specific question or category that failed]

Repository evidence:  [Cite the exact file and section that was violated]

Required files: [List the Founder Intent files that must be re-read before proceeding]

Do not answer the Founder until the gate passes.
```

---

### IF ALL CATEGORIES SCORE PASS

```
FOUNDER ALIGNMENT PASSED

All 7 categories: PASS
Session may proceed.
```

Then continue with the Founder's request.

---

## PRE-RECOMMENDATION INTERNAL CHECKS

**Run these 5 checks before generating every recommendation. No exceptions.**

---

### CHECK 1 — Is this already in the repository?

```
→ Read the recommendation you are about to generate.
→ Ask: Does this concept, feature, market, technology, or approach
       already exist in the loaded repository files?

If NO:
    STOP.
    State: "This concept is not in the repository.
            Proceeding would expand project scope.
            Founder confirmation required before continuing."
    Do not continue.

If YES: proceed to Check 2.
```

*Source: `00_FOUNDER_INTENT/03_NON_NEGOTIABLE_RULES.md` — Rule 8*

---

### CHECK 2 — Does it strengthen the Core Value Engine?

```
→ Identify which step in the minimum chain this recommendation strengthens:
    Step 1: Consumer receives product
    Step 2: Consumer tries product
    Step 3: Consumer answers 5 questions
    Step 4: Brand receives report
    Step 5: Brand pays
    Step 6: Tajribti earns revenue
    Step 7: Panel grows

→ If it strengthens zero steps: REJECT.
   State: "This does not strengthen any step in the Core Value Engine.
           Redirecting to LOI closure."

If it strengthens ≥ 1 step: proceed to Check 3.
```

*Source: `00_FOUNDER_INTENT/02_CORE_VALUE_ENGINE.md` — The Minimum Chain*

---

### CHECK 3 — Does it increase the probability of First LOI / First Pilot / First Revenue?

```
→ Ask: If the Founder acts on this recommendation tomorrow morning,
       does it move the Stage 2+ Brand Count upward?

→ If NO: REJECT.
   State: "This recommendation does not increase LOI probability.
           The session must redirect toward a recommendation that does."

→ If YES: proceed to Check 4.
```

*Source: `00_FOUNDER_INTENT/05_PROJECT_NORTH_STAR.md` — What Every AI Session Must Do*

---

### CHECK 4 — Is it forbidden by What Not To Build?

```
→ Check recommendation against:
    Section 1: Track 0 engineering list (Flutter, React, NestJS, AWS, Terraform, etc.)
    Section 2: V1 deferral list (TJ-018, RAG, microservices, GCC, etc.)
    Section 3: Repository freeze list (new bootstrap files, constitutions, governance)
    Section 4: Website prohibition list (consumer registration, QR, surveys, etc.)
    Section 5: Geographic / sector exclusions

→ If FORBIDDEN: REJECT IMMEDIATELY.
   State: "Forbidden by What Not To Build.
           [Name the specific section and rule.]
           This recommendation cannot proceed."

If NOT FORBIDDEN: proceed to Check 5.
```

*Source: `00_FOUNDER_INTENT/04_WHAT_NOT_TO_BUILD.md` — All sections*

---

### CHECK 5 — Does it conflict with Founder Vision?

```
→ Verify the recommendation does not:
    × Describe Tajribti as a sampling company, activation agency,
      or field marketing company
    × Present engineering as authorized
    × Present financial figures as validated
    × Claim there are no Egyptian competitors
    × Treat "Tajribti" as a confirmed brand name
    × Introduce a market outside Cairo / Egypt / FMCG
    × Suggest reversing a LOCKED founder decision

→ If ANY violation: REJECT.
   State: "This conflicts with Founder Vision.
           [Name the specific conflict.]
           Recommendation rejected."

If NO violations: APPROVED — deliver the recommendation.
```

*Source: `00_FOUNDER_INTENT/01_FOUNDER_VISION.md`; `00_FOUNDER_INTENT/03_NON_NEGOTIABLE_RULES.md`*

---

## SINGLE ACCOUNTABILITY QUESTION

Before closing every session, answer this:

> **"What will the Founder do differently tomorrow morning because of this session?"**

If you cannot answer this question: the session has not yet produced commercial value. Do not close. Redirect.

*Source: `AI_BOOTSTRAP/12_AI_CHECKLIST.md` — Project Director Checklist*

---

## GATE VERSION

```
Gate version:    v1.0
Created:         2026-07-27
Authority:       00_FOUNDER_INTENT/ (highest authority layer)
Supersedes:      Nothing — first gate of this type
Next review:     When Track 0 GO is issued (B-01 closes)
```

*This gate does not create new governance. It enforces existing governance.*  
*Source files: `00_FOUNDER_INTENT/01` through `05`. Gate file: `00_FOUNDER_INTENT/06`.*
