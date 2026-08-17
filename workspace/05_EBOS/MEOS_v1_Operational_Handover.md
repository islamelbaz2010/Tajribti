# OPERATIONAL HANDOVER
## MEOS v1.0.1 — Track 0 Commercial Validation Sprint

**Handover Date:** 2026-07-27  
**Version:** MEOS v1.0.1  
**File:** `workspace/05_EBOS/MEOS_v1_Track0.xlsx`  
**Status:** PRODUCTION READY — All gates passed

---

## 1. What You Are Receiving

A complete, production-ready operational workbook for running the Tajribti 60-day Track 0 sprint. Every tracking system, formula, dropdown, and cross-sheet relationship is built and verified. You open it, enter the GO Date, and operate.

---

## 2. Day 0 Actions (Before Sprint Begins)

Complete these before the sprint starts. In order.

### 2.1 — Enter GO Date
- Open `MEOS_v1_Track0.xlsx`
- Navigate to **Dashboard** tab
- Click cell **A2**
- Enter the sprint start date (e.g., `2026-08-01`)
- The cell displays `GO Date: 2026-08-01`
- All date formulas cascade automatically: Day 60 Target (C2), Dashboard date column (B5:B64), Calendar date links

### 2.2 — Verify Sprint Meta Block (Row 2)
Confirm these cells after entering A2:

| Cell | Expected Content After A2 Entry |
|---|---|
| A2 | GO Date: [your date] |
| C2 | Day 60 target date (auto-calculated as A2+59) |
| E2 | Kill Criterion: 5 interested companies (Stage 2+) |
| H2 | Budget: $15,000–$25,000 |
| J2 | Sprint Owner: Founder / CEO |

### 2.3 — Enter Day 1 Priority
- In Dashboard, Row 5, Column K: type your Day 1 #1 Priority
- This is the only free-text cell required before starting

### 2.4 — Apply Sheet Protection (Optional but Recommended)
Protection ranges cannot be applied by script — must be done in Excel or Google Sheets:
- Dashboard A1:M4 (title + meta + headers) — Protect
- CRM Row 1 (headers) — Protect
- Pipeline Rows 1–14 (health summary + headers) — Protect
- LOI Row 4 (headers) — Protect
- Calendar Row 3 (headers) — Protect

---

## 3. Daily Operations

### Morning Routine (5 minutes)
1. Open **Dashboard** tab — this is your primary view
2. Find today's row (match today's date in Column B)
3. Fill in yesterday's actuals if not done: C, D, E, F, G columns
4. Read Live Status Block (Rows 66–77) — all values auto-update
5. Check Kill Criterion Status (C74) — are you at ≥5 Stage 2+ brands?

### After Every Outreach Action
1. Log in **CRM** tab — update Stage, Last Touchpoint, Next Action
2. If brand advances to Stage 2+: update **Pipeline** tab Stage field
3. If LOI is issued: add new row in **LOI** tab

### Weekly Routine (Friday, 15 minutes)
1. Review Calendar Panel A — check task completion status for the week
2. Update Week task Statuses: `❌ Not Started` → `✅ Done` or `🔄 In Progress`
3. Check Calendar Panel B daily log completeness
4. Review Pipeline Stage Age column H — `⛔ AGED` flags require attention

---

## 4. Sheet-by-Sheet Operating Guide

### Dashboard
- **Primary daily sheet** — open this every morning
- Rows 5–64: one row per sprint day; fill columns C–K only
- Column J (Kill Criterion Status): select from dropdown — do not type free text
- Live Status Block (Rows 66–77): read-only; all values are formulas
- Column B date validation enforces date-only entry; blank = day not yet active

### CRM
- **Add new accounts** by inserting rows below row 1 (headers)
- 14 pre-seeded Tier 1/2 accounts start at Stage 0 — update as outreach progresses
- Column AE (Days Since Last Touchpoint) and AF (Overdue?) are formula-driven — do not edit
- Column R (CRM Stage) and Pipeline Column E (Current Stage) must be kept in sync manually

### Pipeline
- **Health summary** (Rows 3–12) auto-counts from data below row 14 — do not edit
- B12 (Kill Criterion Count) is the decision metric — target ≥5
- Stage Age Flag (Col H) turns `⛔ AGED` at 14+ days — action required
- Add new rows below row 14 as brands enter pipeline

### LOI
- **Issue a new LOI**: add a row below row 4; fill cols A–P; Q and R auto-calculate
- Column I (Brand Countersigned?): use dropdown — never type free text
- Column R (Follow-up Due?): auto-flags when Days Since Issued >5 and status is "❌ Not yet"
- Summary block (Row 2) auto-updates: LOIs issued, signed, declined, conversion rate

### Calendar
- **Panel A** (cols A–H): weekly task tracker — pre-loaded with Week 1 tasks
- **Panel B** (cols J–P): daily execution log — fill each working day
- Weeks 2–9 Panel A tasks: BLOCKED until `MEOS_v1.md` is provided (see row 16 marker)
- Task Status dropdown: `❌ Not Started` → `🔄 In Progress` → `✅ Done` → `⚠️ Blocked`

---

## 5. Open Blockers — Founder Action Required

| ID | Item | Owner | When |
|---|---|---|---|
| B-01 | Calendar Weeks 2–9 tasks | Founder / Ops | When `MEOS_v1.md` is received |
| B-02 | Dashboard A2 — Enter GO Date | Founder | Day 0 (before sprint) |
| B-03 | Dashboard K5 — Day 1 Priority | Founder | Day 0 |
| B-04 | Apply sheet protection | Founder | Day 0, in Excel/Google Sheets |
| B-05 | Create Google Sheets named filter views | Founder | After Drive import |
| B-06 | Source 15th brand account (BRD-015) | Founder / Sales | Week 1 |

---

## 6. Kill Criterion — The Sprint GO/NO-GO Decision

**The only metric that matters at Sprint Day 60:**

```
Pipeline!B12 = Stage 2+ brand count
Target: ≥ 5

Dashboard!C74 = ✅ Met        → Sprint GO → Proceed to MVP build
Dashboard!C74 = ⚠️ Approaching → Sprint HOLD → Extend or pivot
Dashboard!C74 = ❌ Not Met    → Sprint FAIL → Re-evaluate strategy
```

**Stage 2** = Brand has engaged with your pitch and expressed interest.  
Stages 3–6 = higher commitment levels; all count toward the criterion.

---

## 7. File Location and Backup

- **Primary file:** `workspace/05_EBOS/MEOS_v1_Track0.xlsx`
- **Backup:** Copy to Google Drive before Day 1 and after each weekly review
- **Version:** This file is v1.0.1 — do not overwrite with earlier versions
- **Google Sheets import:** File → Import in Google Sheets; select .xlsx format

---

## 8. Support

If any formula returns an error:

| Error | Likely Cause | Fix |
|---|---|---|
| Day# shows #VALUE! | GO Date not entered in A2 | Enter date in Dashboard!A2 |
| C2 shows a number | A2 has a date — C2 number format needs date | Format C2 as Date |
| Days Since = 0 everywhere | All dates reference A2 which is blank | Enter GO Date in A2 |
| LOI Q column blank | LOI Issued Date (col F) not entered | Fill col F for each LOI row |
| Pipeline H column blank | Stage Entry Date (col F) not entered | Fill col F for each Pipeline row |
