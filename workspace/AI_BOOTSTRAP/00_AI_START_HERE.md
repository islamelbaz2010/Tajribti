# AI START HERE — Tajribti

---

## ⚠️ MANDATORY FIRST STEP — LOAD FOUNDER INTENT BEFORE THIS FILE

**Before reading anything else, load these 6 files in order:**

```
STEP 0A:  00_FOUNDER_INTENT/01_FOUNDER_VISION.md         ← WHY the company exists
STEP 0B:  00_FOUNDER_INTENT/02_CORE_VALUE_ENGINE.md      ← WHAT creates value
STEP 0C:  00_FOUNDER_INTENT/03_NON_NEGOTIABLE_RULES.md   ← WHAT cannot be changed
STEP 0D:  00_FOUNDER_INTENT/04_WHAT_NOT_TO_BUILD.md      ← WHAT to reject immediately
STEP 0E:  00_FOUNDER_INTENT/05_PROJECT_NORTH_STAR.md     ← THE single success metric
STEP 0F:  00_FOUNDER_INTENT/06_FOUNDER_ALIGNMENT_GATE.md ← EXECUTE THIS GATE NOW
```

**If any of these files is missing or unreadable: STOP. Do not proceed.**

**After loading STEP 0F, execute the Founder Alignment Gate immediately.**  
**Gate FAILS → Output only the FOUNDER ALIGNMENT FAILED block. Do not read this file further.**  
**Gate PASSES → Continue reading this file and the Universal Minimum below.**

These files define the Founder's intent. Everything below is downstream.

---

**Read this file next. Every time. No exceptions.**

---

## Project Name

**Tajribti (تجربتي)** — Egypt's Consumer Intelligence Platform  
*"Tajribti" means "my experience" in Arabic. It is a PROVISIONAL working name — not a confirmed brand name.*  
Source: `_ai_bootstrap/PROJECT_GLOSSARY.md`

---

## Mission

Replace guesswork in product launches with real-time, consented consumer truth — starting with Egypt's FMCG, beauty, and pharma-OTC sectors.  
Source: `01_Project_Overview/PROJECT_OVERVIEW.md`

---

## What This Is

A **B2B2C Consumer Intelligence Platform**. Brands pay. Consumers receive free products. Platform collects post-trial behavioral data and returns it to brands as structured intelligence. The free sample is the acquisition mechanic. The data is the product.

**It is NOT a sampling company, activation agency, field marketing company, or logistics operation.**  
Source: `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` — Executive Conclusion

---

## Current Status

```
✅ MEOS v1 COMMERCIAL DEMO — LOCKED + FROZEN (2026-08-13)
   Command: bash scripts/demo.sh
   Branch : sprint/meos-production-build
   Commit : 0209b9a — DO NOT MODIFY

✅ V0.5 BOUNDED CONSUMER FOUNDATION — CLOSED (2026-08-23)
   Branch : sprint/pilot-readiness-mvp
   HEAD   : ad71117fe4d7db2fa59bd9a476684cd95607e440
   Railway API   : https://api-production-266c.up.railway.app/api/v1 ✅ LIVE
   Vercel Dash   : https://dashboard-six-flame-wsaixia9cm.vercel.app  ✅ LIVE
   Flutter app   : Discovery-First Home, campaign detail, survey, points, history, AR/EN, QR secondary entry
   Completion    : Founder-confirmed completed-campaign re-entry shows Already Participated, no Survey, no reward
   Dashboard    : Login, overview, campaign/QR, insights, survey results, participants, summary, report/PDF
   Scope        : V0.5 consumer foundation only; not Production V1

⚠️ TRACK 1 FULL ENGINEERING — STILL GATED (B-02 / B-03 / B-04)
   B-01 CLOSED 2026-09-01 (Founder/Project Director formal GO — DL-082). B-04 REMEDIATED
   TWICE but not closed (duplicate-issuance race fixed and re-verified across both passes;
   <1s response-time criterion still unmet after two rounds of performance fixes; production
   migration also not yet applied — see `16_Reports/B04_QR_CONCURRENCY_LOAD_TEST_2026-09-01.md`,
   DL-083/DL-084). B-02/B-03 remain OPEN — no incorporation or legal-sign-off evidence exists
   in the repository.
```

⚠️ IMPORTANT: OTP provider is Akedly (WhatsApp), NOT Twilio. Twilio was removed in commit e0a300a.

Source: `AI_BOOTSTRAP/02_PROJECT_STATE.md`; Sessions 2026-08-13 and 2026-08-14

---

## Current Goal

Close the Track 0 / governance readiness gate after V0.5. Broad V1 engineering is not authorized until the existing gates are closed:

| # | Blocker | Status |
|---|---|---|
| B-01 | Track 0 GO/NO-GO decision from IC | ✅ CLOSED 2026-09-01 (DL-082) |
| B-02 | Egyptian LLC incorporation confirmed | ⬜ OPEN — no evidence in repository |
| B-03 | PDPL written legal sign-off obtained | ⬜ OPEN — no evidence in repository |
| B-04 | QR concurrency load test executed | ⬜ OPEN — remediated twice 2026-09-01, response-time criterion still unmet, migration not yet applied (DL-083, DL-084) |

V0.5 is CLOSED FOR BOUNDED SCOPE and must not be rebuilt.

The next position is:

```
V0.5 CLOSED
→ Track 0 / governance, commercial, legal, and technical readiness
→ written GO / NO-GO
→ only after authorization: V1 product contract and engineering
```

The remaining V1 blockers:
1. ~~B-01 — Track 0 GO/NO-GO decision~~ — CLOSED 2026-09-01, see above
2. B-02 — Egyptian LLC confirmation — still OPEN
3. B-03 — PDPL written legal sign-off — still OPEN
4. B-04 — QR concurrency/idempotency load test — REMEDIATED TWICE (duplicate-issuance fixed, re-verified) but not closed (response-time criterion unmet after two rounds; production migration also not yet applied)

B-01's historical closure basis (recorded here for traceability, not altered): the commercial outcome feeding it was ≥3 signed pilot brand LOIs within the Track 0 window, with fewer than 3 as the locked kill criterion; the Project Director/Founder issued the formal GO decision directly on 2026-09-01 (DL-082) rather than via that LOI-count path — see DL-082 for the exact governance basis. D-028 remains a separate, non-blocking report/demo-quality decision in the Open Decisions Tracker; it was not a fifth B blocker or Track 1 authorization condition.

Production OTP/provider configuration is externally unverified where current records conflict; do not treat it as a reason to rebuild the consumer foundation.

Source: `AI_BOOTSTRAP/04_CURRENT_OBJECTIVE.md`

---

## Source of Truth

`15_Decisions/FOUNDER_DECISIONS.md` — the constitutional document. All other files are downstream.

**Authority chain:** FDD → IC v2.0 → PRD → Technical Architecture → Delivery Plan → Remediation Re-Audit

---

## Loading Order (Quick)

1. `AI_BOOTSTRAP/00_AI_START_HERE.md` ← you are here
2. `AI_BOOTSTRAP/02_PROJECT_STATE.md`
3. `AI_BOOTSTRAP/03_FOUNDER_DECISIONS.md`
4. `AI_BOOTSTRAP/11_AI_RULES.md`
5. Load domain file by task (see `AI_BOOTSTRAP/13_LOADING_ORDER.md`)

---

## Critical Rules — Never Violate

1. **Never** call Tajribti a "sampling company" — it is a Consumer Intelligence Platform
2. **Never** present any financial figure as validated — all are ILLUSTRATIVE
3. **Never** suggest Track 1 full engineering work — MEOS v1 demo is complete; Track 1 requires B-02/B-03/B-04 (B-01 closed 2026-09-01, DL-082)
4. **Never** claim there are no Egyptian competitors — Marketeers Research is a near-direct competitor
5. **Never** treat "Tajribti" as a confirmed brand name — it is provisional
6. **Never** override a LOCKED founder decision without explicit founder instruction

Source: `AI_BOOTSTRAP/11_AI_RULES.md`, `_ai_bootstrap/AI_CONTEXT.md`
