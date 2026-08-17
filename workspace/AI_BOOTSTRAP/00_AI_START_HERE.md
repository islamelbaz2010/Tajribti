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

⚠️ REAL PILOT MVP — DEPLOYED / MOBILE APP BILINGUAL-COMPLETE (2026-08-14)
   Branch : sprint/pilot-readiness-mvp
   HEAD   : 9cd1fc2 (pushed to GitHub)
   Railway API   : https://api-production-266c.up.railway.app/api/v1 ✅ LIVE
   Vercel Dash   : https://dashboard-six-flame-wsaixia9cm.vercel.app  ✅ LIVE
   PostgreSQL    : ONLINE — 8 tables, clean (no real data yet)
   Flutter app   : BILINGUAL AR/EN — LangProvider + Cairo font + full l10n (9cd1fc2)
   Report        : BILINGUAL AR/EN — EN/AR toggle, RTL layout, Cairo font (9cd1fc2)
   OTP           : Akedly WhatsApp OTP integrated; BLOCKED on AKEDLY_TEMPLATE_ID (in review)
   Brand account : NOT CREATED (awaiting Founder input)

⚠️ TRACK 1 FULL ENGINEERING — STILL GATED (B-01 / B-02 / B-03 / B-04)
```

⚠️ IMPORTANT: OTP provider is Akedly (WhatsApp), NOT Twilio. Twilio was removed in commit e0a300a.

Source: `AI_BOOTSTRAP/02_PROJECT_STATE.md`; Sessions 2026-08-13 and 2026-08-14

---

## Current Goal

Activate the deployed pilot: set Akedly Template ID in Railway + create first real brand account. The 4 Track 1 blocking items remain open:

| # | Blocker |
|---|---|
| B-01 | Track 0 GO/NO-GO decision from IC |
| B-02 | Egyptian LLC incorporation confirmed |
| B-03 | PDPL written legal sign-off obtained |
| B-04 | QR concurrency load test executed |

**Immediate activation steps (engineering complete — Founder inputs only):**
1. Set `AKEDLY_TEMPLATE_ID` in Railway → WhatsApp OTP live (AKEDLY_API_KEY and AKEDLY_PIPELINE_ID already set)
2. Create first real brand account (Founder provides name/email/password → Claude inserts via Railway Postgres)

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
3. **Never** suggest Track 1 full engineering work — MEOS v1 demo is complete; Track 1 requires B-01/B-02/B-03/B-04
4. **Never** claim there are no Egyptian competitors — Marketeers Research is a near-direct competitor
5. **Never** treat "Tajribti" as a confirmed brand name — it is provisional
6. **Never** override a LOCKED founder decision without explicit founder instruction

Source: `AI_BOOTSTRAP/11_AI_RULES.md`, `_ai_bootstrap/AI_CONTEXT.md`
