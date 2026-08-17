# MEOS v1 — PRODUCTION SPECIFICATION
## Tajribti · Track 0 · Google Sheets Implementation
**Version:** 1.0  
**Date:** 2026-07-27  
**Owner:** Founder / CEO  
**Platform:** Google Sheets (primary) · Excel-compatible

---

---

# ASSET 1 — FOUNDER DASHBOARD

---

## 1. Worksheet Layout

**Sheet name:** `Dashboard`  
**Tab color:** Dark Navy `#1F2937`

```
ROW 1  │ TITLE BAR — merged A1:M1
       │ Text: "TAJRIBTI · MEOS v1 · FOUNDER DASHBOARD · Track 0"
       │ Fill: #1F2937 · Font: White · Bold · 14pt · Center aligned
ROW 2  │ SPRINT META — merged cells per field (see Sprint Meta block below)
ROW 3  │ [blank spacer row — row height: 8px]
ROW 4  │ COLUMN HEADERS — Row 4 is the freeze row
ROW 5  │ Day 1 data entry row
ROW 6  │ Day 2 data entry row
...
ROW 64 │ Day 60 data entry row
ROW 65 │ [blank]
ROW 66 │ LIVE SPRINT STATUS block (see Live Status section below)
```

**Freeze:** Row 4 + Column A  
**Row height Row 4:** 32px (header rows taller for readability)  
**Row height Rows 5–64:** 24px  
**Print area:** A1:M64  
**Print layout:** Landscape · Fit to 1 page wide

---

## 2. Sprint Meta Block (Row 2)

| Cell | Label | Value / Formula |
|---|---|---|
| A2 | GO Date: | Manual entry — the date Track 0 begins |
| C2 | Day 60 Target: | `=A2+59` (auto-calculates) |
| E2 | Kill Criterion: | `5 interested companies (Stage 2+)` |
| H2 | Budget: | `$15,000–$25,000` |
| J2 | Sprint Owner: | `Founder / CEO` |

Format Row 2: Fill `#F3F4F6` · Font `#374151` · Bold · 10pt

---

## 2. Columns

| Col | Header | Type | Width |
|---|---|---|---|
| A | Day # | Number | 60px |
| B | Date | Date (YYYY-MM-DD) | 110px |
| C | Accounts Contacted (Cumul.) | Number | 130px |
| D | Discovery Calls Booked | Number | 130px |
| E | Discovery Calls Completed | Number | 130px |
| F | Brands in Pipeline (Stage 2+) | Number | 140px |
| G | LOIs Issued | Number | 90px |
| H | LOIs Signed | Number | 90px |
| I | Pilots Signed | Number | 90px |
| J | Kill Criterion Status | Dropdown | 130px |
| K | Today's #1 Priority | Text | 300px |
| L | Blockers | Text | 250px |
| M | Notes | Text | 250px |

---

## 3. Dropdown Lists

**Column J — Kill Criterion Status**  
Values (in order):
```
❌ Not Met
⚠️ Approaching
✅ Met
```

---

## 4. Validation Rules

| Column | Rule | Error Message |
|---|---|---|
| A | Integer ≥ 1 ≤ 60 | "Day # must be between 1 and 60" |
| B | Valid date | "Enter date as YYYY-MM-DD" |
| C | Integer ≥ 0 | "Must be a non-negative whole number" |
| D | Integer ≥ 0 | "Must be a non-negative whole number" |
| E | Integer ≥ 0 | "Must be a non-negative whole number" |
| F | Integer ≥ 0 | "Must be a non-negative whole number" |
| G | Integer ≥ 0 | "Must be a non-negative whole number" |
| H | Integer ≥ 0 · ≤ G | "Cannot exceed LOIs Issued" |
| I | Integer ≥ 0 · ≤ H | "Cannot exceed LOIs Signed" |
| J | Dropdown only | "Select from list: ❌ / ⚠️ / ✅" |
| E ≤ D | E cannot exceed D | "Calls Completed cannot exceed Calls Booked" |

---

## 5. Formulas

### Live Sprint Status Block (Rows 66–80, Columns A–C)

This block auto-calculates from the other sheets. Founder reads it each morning/evening before filling the daily log.

| Cell | Label | Formula |
|---|---|---|
| A66 | `LIVE SPRINT STATUS` | — (header, merged A66:C66) |
| A67 | `Accounts Contacted` | `=COUNTIF(CRM!K2:K1000,"<>")` |
| A68 | `Discovery Calls Booked` | `=COUNTIF(CRM!R2:R1000,"Stage 2")+COUNTIF(CRM!R2:R1000,"Stage 3")+COUNTIF(CRM!R2:R1000,"Stage 4")+COUNTIF(CRM!R2:R1000,"Stage 5")+COUNTIF(CRM!R2:R1000,"Stage 6")` |
| A69 | `Discovery Calls Completed` | `=COUNTIF(CRM!S2:S1000,"<>")` |
| A70 | `Brands in Pipeline (Stage 2+)` | `=COUNTIF(Pipeline!E2:E1000,"Stage 2")+COUNTIF(Pipeline!E2:E1000,"Stage 3")+COUNTIF(Pipeline!E2:E1000,"Stage 4")+COUNTIF(Pipeline!E2:E1000,"Stage 5")+COUNTIF(Pipeline!E2:E1000,"Stage 6")` |
| A71 | `LOIs Issued` | `=COUNTA(LOI!A2:A1000)` |
| A72 | `LOIs Signed` | `=COUNTIF(LOI!I2:I1000,"✅ Signed")` |
| A73 | `Pilots Signed` | `=COUNTIF(LOI!K2:K1000,"✅ Signed")` |
| A74 | `Kill Criterion Status` | `=IF(COUNTIF(Pipeline!E2:E1000,"Stage 2")+COUNTIF(Pipeline!E2:E1000,"Stage 3")+COUNTIF(Pipeline!E2:E1000,"Stage 4")+COUNTIF(Pipeline!E2:E1000,"Stage 5")+COUNTIF(Pipeline!E2:E1000,"Stage 6")>=5,"✅ Met",IF(COUNTIF(Pipeline!E2:E1000,"Stage 2")+COUNTIF(Pipeline!E2:E1000,"Stage 3")+COUNTIF(Pipeline!E2:E1000,"Stage 4")+COUNTIF(Pipeline!E2:E1000,"Stage 5")+COUNTIF(Pipeline!E2:E1000,"Stage 6")>=3,"⚠️ Approaching","❌ Not Met"))` |
| A75 | `Today's Date` | `=TODAY()` |
| A76 | `Sprint Day` | `=TODAY()-$A$2+1` |
| A77 | `Days Remaining` | `=$C$2-TODAY()` |

**Column B of Live Block:** Labels (text)  
**Column C of Live Block:** Values (the formulas above go in C67:C77; A67:A77 = labels)

### Day # Auto-fill (Column A)

Row 5: `=IF(B5="","",B5-$A$2+1)` — calculates Day # from GO Date in A2  
Copy formula down to A64.  
Alternatively, Founder manually enters 1, 2, 3... in Column A.

### Date sequence (Column B)

Row 5: Enter GO date manually (e.g., 2026-07-28)  
Row 6: `=B5+1` (copy down to B64 for auto-sequencing)

---

## 6. Conditional Formatting

Apply all rules to data range **A5:M64**.

### Rule 1 — Pilots Signed (Column I)
| Condition | Fill | Font |
|---|---|---|
| I ≥ 3 | `#D1FAE5` (green) | `#065F46` |
| I = 1 OR I = 2 | `#FEF3C7` (amber) | `#92400E` |
| I = 0 AND A > 30 | `#FEE2E2` (red) | `#991B1B` |

### Rule 2 — Kill Criterion Status (Column J)
| Condition | Fill | Font |
|---|---|---|
| J = "✅ Met" | `#D1FAE5` | `#065F46` |
| J = "⚠️ Approaching" | `#FEF3C7` | `#92400E` |
| J = "❌ Not Met" | `#FEE2E2` | `#991B1B` |

### Rule 3 — Entire row highlight (today's row)
Apply to range A5:M64.  
Formula rule: `=$B5=TODAY()`  
Fill: `#EFF6FF` (light blue) · Font: `#1D4ED8` (bold)  
This highlights today's row automatically.

### Rule 4 — Brands in Pipeline warning (Column F)
| Condition | Fill | Font |
|---|---|---|
| F ≥ 5 | `#D1FAE5` | `#065F46` |
| F = 3 OR F = 4 | `#FEF3C7` | `#92400E` |
| F < 3 AND A ≥ 21 | `#FEE2E2` | `#991B1B` |

### Rule 5 — LOIs Signed (Column H)
| Condition | Fill |
|---|---|
| H ≥ 1 | `#D1FAE5` |
| H = 0 AND A ≥ 35 | `#FEE2E2` |

---

## 7. Automation Logic

**Day # auto-population:** Formula `=IF(B5="","",B5-$A$2+1)` in Column A auto-calculates sprint day from GO date.

**Live Status Block:** Rows 66–77 always show current counts pulled from CRM, Pipeline, LOI sheets. Founder reads these values and manually enters them in today's log row (or confirms they match).

**No scripting required.** All automation is formula-based.

---

## 8. Protection Rules

| Range | Protection |
|---|---|
| A1:M3 (Title + Meta + Spacer) | Protected — no edit |
| A4:M4 (Header row) | Protected — no edit |
| A5:B64 (Day #, Date) | Suggested protected after entry (lock each row end-of-day) |
| C5:I64 (Numeric fields) | Editable — Founder fills each evening |
| J5:M64 (Status + text fields) | Editable — Founder fills each evening |
| A66:C77 (Live Status Block) | Protected — formula cells, no manual edit |

**Google Sheets protection:** Data → Protect sheets and ranges → select range → set warning or restrict to Founder account.

---

## 9. Daily Usage

**Morning (5 minutes):**
1. Open Dashboard
2. Scroll to Row 66 (Live Status Block) — read all counts
3. Read yesterday's log row — note any trend
4. Write today's #1 Priority in Column K before opening email

**Evening (5 minutes):**
1. Verify Live Status Block shows current values (check CRM and Pipeline are updated first)
2. Find today's row (highlighted blue)
3. Enter C through I (copy from Live Status Block — they must match)
4. Set Column J Kill Criterion Status
5. Write Column L Blockers (one concrete sentence per blocker, max 3)
6. Write Column M Notes if anything notable happened

---

## 10. Common Errors

| Error | Symptom | Fix |
|---|---|---|
| Live Status Block doesn't match manual entry | CRM or Pipeline not updated before Dashboard | Update CRM first → Pipeline → then Dashboard |
| Day # shows #VALUE! | GO Date not entered in A2 | Enter sprint start date in cell A2 |
| Today's row not highlighted | Wrong date in Column B | Verify B column dates match calendar |
| Column I > Column H | Data entry error | Pilots Signed cannot exceed LOIs Signed |
| Kill Criterion shows ✅ but Pipeline count is wrong | Pipeline not updated | Open Pipeline → verify Stage 2+ count |

---

---

# ASSET 2 — BRAND OUTREACH CRM

---

## 1. Worksheet Layout

**Sheet name:** `CRM`  
**Tab color:** Blue `#1D4ED8`

```
ROW 1  │ COLUMN HEADERS — freeze row
ROW 2  │ First brand account (BRD-001)
ROW 3  │ Second brand account (BRD-002)
...
ROW 51 │ 50th brand account (BRD-050) — pre-allocate 50 rows
```

**Freeze:** Row 1 + Column A (Account ID)  
**Filters:** Enable on Row 1 (all columns)  
**Sort default:** Column Q (Next Action Date) ascending — shows most urgent actions first  
**Print area:** A1:AA50  
**Print layout:** Landscape · Scale to fit · Repeat Row 1 on each page

---

## 2. Columns

| Col | Header | Type | Width |
|---|---|---|---|
| A | Account ID | Text (BRD-XXX) | 90px |
| B | Company Name | Text | 180px |
| C | Category | Dropdown | 140px |
| D | Priority Tier | Dropdown | 110px |
| E | Primary Contact Name | Text | 150px |
| F | Primary Contact Title | Text | 180px |
| G | Primary Contact LinkedIn | URL | 200px |
| H | Primary Contact Email | Email | 200px |
| I | Relationship Source | Dropdown | 130px |
| J | Warm Intro Provider | Text | 150px |
| K | First Outreach Date | Date | 120px |
| L | First Outreach Channel | Dropdown | 120px |
| M | Last Touchpoint Date | Date | 120px |
| N | Last Touchpoint Type | Dropdown | 150px |
| O | Last Touchpoint Notes | Text | 300px |
| P | Next Action | Text | 300px |
| Q | Next Action Date | Date | 120px |
| R | CRM Stage | Dropdown | 120px |
| S | Discovery Call Date | Date | 130px |
| T | Discovery Call Outcome | Dropdown | 150px |
| U | Objection | Text | 200px |
| V | Objection Response | Text | 200px |
| W | Decision-Maker Identified | Dropdown | 140px |
| X | Decision-Maker Name | Text | 150px |
| Y | Campaign Budget Signal | Dropdown | 150px |
| Z | Pilot Interest Level | Dropdown | 120px |
| AA | Account Owner Notes | Text | 300px |
| AB | Contact 2 Name | Text | 150px |
| AC | Contact 2 Title | Text | 150px |
| AD | Contact 2 LinkedIn | URL | 200px |

---

## 3. Dropdown Lists

**Column C — Category**
```
FMCG
Beverage
Beauty
Personal Care
Pharma-OTC
Food
Home Care
Dairy
Snacks
Other
```

**Column D — Priority Tier**
```
Tier 1
Tier 2
Tier 3
```

**Column I — Relationship Source**
```
Cold
Warm intro
Mutual connection
Conference
Referral
```

**Column L — First Outreach Channel**
```
LinkedIn
Email
WhatsApp
Phone
In-person
```

**Column N — Last Touchpoint Type**
```
Sent message
Replied
Call booked
Call held
Email sent
Deck sent
Proposal sent
LOI sent
No response
```

**Column R — CRM Stage**
```
Stage 0
Stage 1
Stage 2
Stage 3
Stage 4
Stage 5
Stage 6
Stage X
```

**Column T — Discovery Call Outcome**
```
Interested
Not Interested
Needs Follow-up
Escalating Internally
```

**Column W — Decision-Maker Identified**
```
Yes
No
Unknown
```

**Column Y — Campaign Budget Signal**
```
High (>$10K)
Medium ($4–10K)
Low (<$4K)
Unknown
```

**Column Z — Pilot Interest Level**
```
Hot
Warm
Cold
Dead
```

---

## 4. Validation Rules

| Column | Rule | Error Message |
|---|---|---|
| A | Must match pattern BRD-### | "Format: BRD-001" — use data validation: text contains "BRD-" |
| A | Unique — no duplicate Account IDs | Manual check; use conditional formatting to flag duplicates |
| C | Dropdown only | "Select from category list" |
| D | Dropdown only | "Select Tier 1, 2, or 3" |
| G | Text starts with "https://linkedin.com" | Warning if not a LinkedIn URL |
| H | Text contains "@" | Warning if not email format |
| I | Dropdown only | |
| K | Valid date, not future date | "First outreach date cannot be in the future" |
| L | Dropdown only | |
| M | Valid date, ≥ K (Last Touchpoint ≥ First Outreach) | "Last touchpoint cannot be before first outreach" |
| N | Dropdown only | |
| Q | Valid date | "Enter a date" |
| Q | Q ≥ TODAY() for active accounts (Stage 1–5) | Warning: "Next Action Date is in the past — take action now" |
| R | Dropdown only | |
| T | Dropdown only | Required if S (Discovery Call Date) is filled |
| W | Dropdown only | |
| Y | Dropdown only | |
| Z | Dropdown only | Required for all accounts at Stage 2+ |

**Duplicate Account ID check (conditional formatting formula):**  
Apply to A2:A200: `=COUNTIF($A$2:$A$200,A2)>1`  
Fill: `#FEE2E2` (red) — flags duplicate IDs instantly.

---

## 5. Formulas

**Account ID auto-generation (optional — Column A):**  
If you want auto-numbering: `="BRD-"&TEXT(ROW()-1,"000")`  
Applied from A2 downward. Alternatively, type manually.

**Days Since Last Touchpoint (add as Column AE — optional operational column):**  
`=IF(M2="","",TODAY()-M2)`  
Label: "Days Since Last Touch"  
Conditional format: if AE > 7 and R ≠ "Stage X" → amber; if AE > 14 and R ≠ "Stage X" → red.

**Overdue Next Action indicator (Column AF — optional):**  
`=IF(Q2="","",IF(AND(Q2<TODAY(),R2<>"Stage X",R2<>"Stage 6"),"⚠️ OVERDUE",""))`

**Stage consistency check (Column AG — optional):**  
`=IF(R2=VLOOKUP(A2,Pipeline!A:E,5,FALSE),"✓","⚠️ SYNC ERROR")`  
Flags when CRM Stage and Pipeline Stage don't match.

---

## 6. Conditional Formatting

**Apply to A2:AA200 (entire data range).**

### Rule 1 — Pilot Interest Level (Column Z)
| Condition | Row Fill | Font |
|---|---|---|
| Z = "Hot" | `#D1FAE5` | `#065F46` |
| Z = "Warm" | `#FEF3C7` | `#92400E` |
| Z = "Cold" | `#FEE2E2` | `#991B1B` |
| Z = "Dead" | `#F3F4F6` | `#9CA3AF` (greyed out) |

Row-level formula rules (apply to entire row):
- Hot: `=$Z2="Hot"` → fill `#ECFDF5`
- Cold: `=$Z2="Cold"` → fill `#FFF7ED`
- Dead: `=$Z2="Dead"` → fill `#F9FAFB`, font `#9CA3AF`

### Rule 2 — Next Action Overdue (Column Q)
| Condition | Fill | Font |
|---|---|---|
| Q < TODAY() and R ≠ "Stage X" and R ≠ "Stage 6" | `#FEE2E2` | `#991B1B` Bold |

Formula rule on Q column: `=AND($Q2<TODAY(),$R2<>"Stage X",$R2<>"Stage 6",$Q2<>"")`

### Rule 3 — CRM Stage color (Column R)
| Value | Fill | Font |
|---|---|---|
| Stage 0 | `#F3F4F6` | `#6B7280` |
| Stage 1 | `#EFF6FF` | `#1D4ED8` |
| Stage 2 | `#ECFDF5` | `#065F46` |
| Stage 3 | `#F0FDF4` | `#15803D` |
| Stage 4 | `#FEF9C3` | `#854D0E` |
| Stage 5 | `#FFF7ED` | `#9A3412` |
| Stage 6 | `#D1FAE5` | `#065F46` Bold |
| Stage X | `#F3F4F6` | `#9CA3AF` Italic |

### Rule 4 — Duplicate Account ID
Formula on A2:A200: `=COUNTIF($A$2:$A$200,A2)>1` → Fill `#FEE2E2`

---

## 7. Automation Logic

**Filter presets (set as named filter views in Google Sheets):**

| Filter View Name | Columns Filtered | Criteria |
|---|---|---|
| Today's Actions | Q (Next Action Date) | = TODAY() or < TODAY() |
| Hot Leads | Z (Pilot Interest) | = "Hot" |
| Active Pipeline | R (CRM Stage) | Stage 2, 3, 4, or 5 |
| Stale Leads | M (Last Touchpoint) | < TODAY()-7 and R ≠ Stage X |
| Tier 1 Only | D (Priority Tier) | = "Tier 1" |
| Discovery Pending | T (Call Outcome) | = "Needs Follow-up" |

**Named ranges (define in Google Sheets: Data → Named ranges):**
- `CRM_AccountIDs` = `CRM!A:A`
- `CRM_Stages` = `CRM!R:R`
- `CRM_PilotInterest` = `CRM!Z:Z`
- `CRM_NextActionDate` = `CRM!Q:Q`
- `CRM_DiscoveryCallDate` = `CRM!S:S`
- `CRM_FirstOutreachDate` = `CRM!K:K`

---

## 8. Protection Rules

| Range | Protection |
|---|---|
| A1:AD1 (Header row) | Protected — no edit |
| A column (Account IDs) | Protect after entry — IDs are permanent |
| B column (Company Name) | Protect after entry — do not rename |
| AE:AG (formula columns) | Protected — formula-only, no manual edit |

---

## 9. Daily Usage

**Morning workflow:**
1. Open CRM
2. Activate filter view "Today's Actions" (Q = today or overdue)
3. Sort visible rows by Column Z (Pilot Interest Level) — Hot first
4. Execute each account's Next Action
5. Immediately after each action: update M (Last Touchpoint Date), N (Type), O (Notes), P (Next Action), Q (Next Action Date), R (Stage if changed)
6. If R changed → open Pipeline and update that row immediately

**After each outreach action:**
1. Locate the account's row
2. Update M = today's date
3. Update N = what you did (dropdown)
4. Update O = 1–3 sentences on what happened
5. Update P = exactly what you will do next (verb + deliverable + person)
6. Update Q = date by which next action must happen
7. If stage changed → update R AND open Pipeline → update Pipeline row

---

## 10. Common Errors

| Error | Symptom | Fix |
|---|---|---|
| Duplicate Account ID | Red highlight on Column A | Never create two rows for the same company — one row per company, ever |
| Stage X out of sync | CRM = Stage X but Pipeline shows active | Update Pipeline immediately when CRM changes to X |
| Blank Next Action on active account | Column P empty for Stage 1–5 | Required field — every active account has a next action |
| Next Action Date in past | Column Q red highlight | Take action now or explicitly push the date and note why |
| Discovery Call Outcome blank | Column T empty for Stage 3+ | Fill call outcome on the day of the call |
| O column paragraphs | Notes too long | Maximum 3 sentences — if you need more, write in a separate document |

---

---

# ASSET 3 — BRAND PIPELINE

---

## 1. Worksheet Layout

**Sheet name:** `Pipeline`  
**Tab color:** Purple `#7C3AED`

```
ROW 1  │ TITLE BAR — merged A1:J1
       │ Text: "TAJRIBTI · BRAND PIPELINE · Track 0"
       │ Fill: #1F2937 · White font · Bold
ROW 2  │ PIPELINE HEALTH SUMMARY header (merged A2:J2)
       │ Text: "PIPELINE HEALTH — LIVE COUNTS" · Fill: #374151 · White font
ROW 3–12 │ PIPELINE HEALTH SUMMARY BLOCK (see Section 5 Formulas)
ROW 13 │ [blank spacer]
ROW 14 │ COLUMN HEADERS — freeze row 14, column A
ROW 15 │ First account row (BRD-001)
ROW 16 │ Second account row (BRD-002)
...
```

**Freeze:** Row 14 + Column A (Account ID)  
**Filters:** Enable on Row 14  
**Sort default:** Column E (Current Stage) ascending, then Column G (Days in Stage) descending  
**Print area:** A14:J200  
**Print layout:** Portrait · Fit to 1 page wide · Repeat Row 14

---

## 2. Columns (Data rows — Row 15 onward)

| Col | Header | Type | Width |
|---|---|---|---|
| A | Account ID | Text (BRD-XXX) | 90px |
| B | Company Name | Text | 180px |
| C | Category | Dropdown | 140px |
| D | Priority Tier | Dropdown | 110px |
| E | Current Stage | Dropdown | 120px |
| F | Stage Entry Date | Date | 120px |
| G | Days in Stage | Formula (auto) | 100px |
| H | Stage Age Flag | Formula (auto) | 120px |
| I | Last Moved | Date | 120px |
| J | Notes | Text | 350px |

---

## 3. Dropdown Lists

**Column C — Category**  
Same as CRM: `FMCG / Beverage / Beauty / Personal Care / Pharma-OTC / Food / Home Care / Dairy / Snacks / Other`

**Column D — Priority Tier**  
`Tier 1 / Tier 2 / Tier 3`

**Column E — Current Stage**
```
Stage 0
Stage 1
Stage 2
Stage 3
Stage 4
Stage 5
Stage 6
Stage X
```

---

## 4. Validation Rules

| Column | Rule | Error |
|---|---|---|
| A | Must match existing CRM Account ID | Warning: "This Account ID must exist in CRM" |
| A | Unique in Pipeline | "Each account appears once only" |
| E | Dropdown only | — |
| F | Valid date, ≤ today | "Stage Entry Date cannot be in the future" |
| F | ≤ I (Stage Entry ≤ Last Moved) | "Entry date cannot be after Last Moved date" |
| I | Valid date, ≤ today | — |

**Account ID cross-reference check (conditional formatting):**  
Formula on A15:A200: `=COUNTIF(CRM!$A:$A,A15)=0` → Fill `#FEE2E2`  
This flags any Pipeline Account ID not found in the CRM.

---

## 5. Formulas

### Pipeline Health Summary Block (Rows 3–12)

Place in columns A and B:

| Row | A (Label) | B (Formula) |
|---|---|---|
| 3 | `Stage 0 — Identified` | `=COUNTIF(E15:E500,"Stage 0")` |
| 4 | `Stage 1 — Contacted` | `=COUNTIF(E15:E500,"Stage 1")` |
| 5 | `Stage 2 — Engaged` | `=COUNTIF(E15:E500,"Stage 2")` |
| 6 | `Stage 3 — Discovery` | `=COUNTIF(E15:E500,"Stage 3")` |
| 7 | `Stage 4 — Proposal` | `=COUNTIF(E15:E500,"Stage 4")` |
| 8 | `Stage 5 — LOI` | `=COUNTIF(E15:E500,"Stage 5")` |
| 9 | `Stage 6 — Pilot Signed` | `=COUNTIF(E15:E500,"Stage 6")` |
| 10 | `Stage X — Dead` | `=COUNTIF(E15:E500,"Stage X")` |
| 11 | `—` | `—` |
| 12 | `KILL CRITERION COUNT (Stage 2+)` | `=COUNTIF(E15:E500,"Stage 2")+COUNTIF(E15:E500,"Stage 3")+COUNTIF(E15:E500,"Stage 4")+COUNTIF(E15:E500,"Stage 5")+COUNTIF(E15:E500,"Stage 6")` |

Format Row 12 (Kill Criterion Count): Fill `#1F2937` · Font White · Bold · 12pt

Additional summary cells (D3:E5):
| Cell | Label | Formula |
|---|---|---|
| D3 | `Total Accounts` | `=COUNTA(A15:A500)` |
| D4 | `Active Accounts` | `=COUNTIF(E15:E500,"Stage 0")+COUNTIF(E15:E500,"Stage 1")+COUNTIF(E15:E500,"Stage 2")+COUNTIF(E15:E500,"Stage 3")+COUNTIF(E15:E500,"Stage 4")+COUNTIF(E15:E500,"Stage 5")` |
| D5 | `Kill Criterion Target` | `5` |
| E3 | — | — |
| E4 | — | — |
| E5 | `Kill Criterion Met?` | `=IF(B12>=5,"✅ YES","❌ NO — "&(5-B12)&" more needed")` |

### Days in Stage (Column G — data rows)

Formula for G15: `=IF(F15="","",TODAY()-F15)`  
Copy down to G200.  
Format: Number, 0 decimal places.

### Stage Age Flag (Column H — data rows)

Formula for H15:
```
=IF(OR(E15="Stage X",E15="Stage 6",E15="",F15=""),"—",
IF(AND(G15>14,OR(E15="Stage 1",E15="Stage 2",E15="Stage 3",E15="Stage 4")),"🔴 AGED",
IF(AND(G15>7,OR(E15="Stage 2",E15="Stage 3",E15="Stage 4")),"🟡 WATCH","—")))
```

Copy down to H200.

---

## 6. Conditional Formatting

**Apply to A15:J500.**

### Rule 1 — Stage Age Flag (entire row)
Formula: `=$H15="🔴 AGED"` → Fill `#FEE2E2` · Font `#991B1B`  
Formula: `=$H15="🟡 WATCH"` → Fill `#FEF9C3` · Font `#854D0E`

### Rule 2 — Current Stage color (Column E)
| Value | Fill | Font |
|---|---|---|
| Stage 0 | `#F9FAFB` | `#6B7280` |
| Stage 1 | `#EFF6FF` | `#1D4ED8` |
| Stage 2 | `#F0FDF4` | `#15803D` |
| Stage 3 | `#ECFDF5` | `#065F46` |
| Stage 4 | `#FEF9C3` | `#854D0E` |
| Stage 5 | `#FFF7ED` | `#9A3412` |
| Stage 6 | `#D1FAE5` | `#065F46` Bold |
| Stage X | `#F3F4F6` | `#9CA3AF` Italic |

### Rule 3 — Pipeline Health Summary (Rows 3–12)
Row 12 (Kill Criterion Count): dynamic fill
- Formula on B12: `=IF(B12>=5,"green fill","red fill")` — apply via conditional format:
  - B12 ≥ 5 → Fill `#D1FAE5`
  - B12 = 3 or 4 → Fill `#FEF9C3`
  - B12 < 3 → Fill `#FEE2E2`

### Rule 4 — Account ID not in CRM
Formula on A15:A500: `=COUNTIF(CRM!$A:$A,A15)=0` → Fill `#FEE2E2` · Font `#991B1B`

---

## 7. Automation Logic

**Stage movement protocol:**  
When Founder updates Column E (Current Stage):
1. Set F (Stage Entry Date) = today's date
2. Set I (Last Moved) = today's date
3. Clear or update J (Notes) — one sentence on why it moved

**Filter views (create in Google Sheets):**

| View Name | Filter |
|---|---|
| Aged Accounts | H = "🔴 AGED" |
| Kill Criterion (Stage 2+) | E = Stage 2 OR 3 OR 4 OR 5 OR 6 |
| Dead Only | E = Stage X |
| Tier 1 Active | D = Tier 1 AND E ≠ Stage X |

**Named ranges:**
- `Pipeline_Stages` = `Pipeline!E:E`
- `Pipeline_EntryDate` = `Pipeline!F:F`
- `Pipeline_AccountIDs` = `Pipeline!A:A`
- `Pipeline_KillCriterionCount` = `Pipeline!B12` (single cell reference)

---

## 8. Protection Rules

| Range | Protection |
|---|---|
| A1:J2 (Title bars) | Protected |
| A3:B12 (Health summary — label column) | Protected (labels don't change) |
| B3:B12 (Health summary — formula column) | Protected (formulas only) |
| A14:J14 (Header row) | Protected |
| G15:H500 (Days in Stage, Age Flag) | Protected — formula columns |
| A15:A500 (Account IDs) | Protect after entry |

---

## 9. Daily Usage

**Morning (2 minutes):**
1. Open Pipeline
2. Read Kill Criterion Count (cell B12)
3. Check Column H for any 🔴 AGED flags
4. AGED accounts → add to CRM "Today's Actions" filter

**After brand interaction (when stage changes):**
1. Open Pipeline → find account row
2. Update E (Current Stage)
3. Update F (Stage Entry Date) = today
4. Update I (Last Moved) = today
5. Update J (Notes) — one sentence
6. G and H auto-calculate — verify they look correct
7. Open CRM → update R (CRM Stage) to match
8. Open Dashboard → verify Brands in Pipeline count updates in Live Status Block

---

## 10. Common Errors

| Error | Symptom | Fix |
|---|---|---|
| Account in Pipeline not in CRM | Red highlight on Account ID | Add account to CRM first; Pipeline is derived from CRM |
| Stage not updated after CRM change | G (Days in Stage) shows incorrect age | Open Pipeline immediately when CRM Stage changes |
| Stage Age Flag shows for Stage X accounts | Formula not excluding Stage X | Verify H formula excludes Stage X and Stage 6 |
| Kill Criterion Count inflated | Stage 1 accounts counted | Stage 1 = no response. Not interested. Do not count. |
| Days in Stage showing negative | F (Stage Entry Date) set to future | Stage Entry Date must be today or in the past |

---

---

# ASSET 4 — LOI TRACKER

---

## 1. Worksheet Layout

**Sheet name:** `LOI`  
**Tab color:** Orange `#EA580C`

```
ROW 1  │ TITLE BAR — merged A1:P1
       │ Text: "TAJRIBTI · LOI TRACKER · Track 0"
       │ Fill: #1F2937 · White font · Bold
ROW 2  │ LOI SUMMARY block (see Section 5 Formulas)
ROW 3  │ [blank spacer]
ROW 4  │ COLUMN HEADERS — freeze row 4, column A
ROW 5  │ First LOI row (LOI-001)
ROW 6  │ LOI-002
...
```

**Freeze:** Row 4 + Column A (LOI ID)  
**Filters:** Enable on Row 4  
**Sort default:** Column F (LOI Issued Date) descending — newest LOI at top  
**Print area:** A1:P50  
**Print layout:** Landscape · Fit to 1 page wide

---

## 2. Columns

| Col | Header | Type | Width |
|---|---|---|---|
| A | LOI ID | Text (LOI-XXX) | 80px |
| B | Account ID | Text (BRD-XXX) | 90px |
| C | Company Name | Text | 180px |
| D | Contact Receiving LOI | Text (Name + Title) | 200px |
| E | LOI Type | Dropdown | 200px |
| F | LOI Issued Date | Date | 120px |
| G | LOI Version | Dropdown | 80px |
| H | Commercial Terms Summary | Text | 350px |
| I | Brand Countersigned? | Dropdown | 130px |
| J | Countersigned Date | Date | 130px |
| K | Pilot Agreement Executed? | Dropdown | 160px |
| L | Pilot Agreement Date | Date | 130px |
| M | Pilot Campaign Type | Dropdown | 200px |
| N | Estimated Campaign Value | Text | 140px |
| O | Pilot Start Date (Planned) | Date | 140px |
| P | Notes | Text | 300px |
| Q | Days Since Issued | Formula (auto) | 110px |
| R | Follow-up Due? | Formula (auto) | 120px |

---

## 3. Dropdown Lists

**Column E — LOI Type**
```
Non-binding interest
Binding pilot agreement
```

**Column G — LOI Version**
```
v1
v2
v3
```

**Column I — Brand Countersigned?**
```
❌ Not yet
🔄 Negotiating
✅ Signed
❌ Declined
```

**Column K — Pilot Agreement Executed?**
```
❌ Not yet
✅ Signed
```

**Column M — Pilot Campaign Type**
```
Consumer sampling + survey
Survey only
Data panel access
Sampling only
```

---

## 4. Validation Rules

| Column | Rule | Error |
|---|---|---|
| A | Pattern LOI-### · Unique | "Format: LOI-001. No duplicates." |
| B | Must match existing CRM Account ID | Warning: "Account ID must exist in CRM" |
| F | Valid date ≤ today | "Issued date cannot be in the future" |
| J | Valid date ≥ F | "Countersigned date cannot be before issued date" |
| J | Required if I = "✅ Signed" | "Enter countersigned date when status is Signed" |
| K | If I ≠ "✅ Signed" → K must be "❌ Not yet" | "Pilot agreement requires signed LOI first" |
| L | Required if K = "✅ Signed" | "Enter pilot agreement date when executed" |
| L | Valid date ≥ J | "Pilot agreement date cannot precede LOI countersign" |

**Countersigned date required when signed:**  
Conditional formatting formula on J column:  
`=AND($I5="✅ Signed",$J5="")` → Fill `#FEE2E2` (red) — flags missing date when status is Signed.

---

## 5. Formulas

### LOI Summary Block (Row 2, Columns A–N)

| Cell | Label | Formula |
|---|---|---|
| A2 | `LOIs Issued:` | — |
| B2 | [count] | `=COUNTA(A5:A500)` |
| C2 | `LOIs Signed:` | — |
| D2 | [count] | `=COUNTIF(I5:I500,"✅ Signed")` |
| E2 | `LOIs Declined:` | — |
| F2 | [count] | `=COUNTIF(I5:I500,"❌ Declined")` |
| G2 | `Pending:` | — |
| H2 | [count] | `=COUNTIF(I5:I500,"❌ Not yet")+COUNTIF(I5:I500,"🔄 Negotiating")` |
| I2 | `Pilots Signed:` | — |
| J2 | [count] | `=COUNTIF(K5:K500,"✅ Signed")` |
| K2 | `Conversion Rate:` | — |
| L2 | [rate] | `=IFERROR(TEXT(D2/B2,"0%"),"—")` |
| M2 | `Overdue Follow-up:` | — |
| N2 | [count] | `=COUNTIFS(I5:I500,"❌ Not yet",Q5:Q500,">"&5)` |

### Days Since Issued (Column Q — data rows)

Formula for Q5: `=IF(F5="","",TODAY()-F5)`  
Copy down to Q200.  
Format: Number, 0 decimal places.

### Follow-up Due (Column R — data rows)

Formula for R5:
```
=IF(OR(F5="",I5="✅ Signed",I5="❌ Declined"),"—",
IF(AND(Q5>5,I5="❌ Not yet"),"🔴 FOLLOW UP NOW",
IF(AND(Q5>14,I5="🔄 Negotiating"),"🔴 STALLING",
IF(AND(Q5>=3,Q5<=5,I5="❌ Not yet"),"🟡 DUE SOON","—"))))
```

Copy down to R200.

### LOI conversion rate (for weekly review):
`=IFERROR(COUNTIF(I5:I500,"✅ Signed")/COUNTA(A5:A500),"0%")`

---

## 6. Conditional Formatting

**Apply to A5:R200.**

### Rule 1 — Countersigned Status (Column I, row-level)
| Value | Row Fill | Font |
|---|---|---|
| ✅ Signed | `#D1FAE5` | `#065F46` |
| 🔄 Negotiating | `#FEF9C3` | `#854D0E` |
| ❌ Not yet | `#EFF6FF` | `#1D4ED8` |
| ❌ Declined | `#F3F4F6` | `#9CA3AF` Italic |

Row-level formulas:
- `=$I5="✅ Signed"` → Fill `#F0FDF4`
- `=$I5="❌ Declined"` → Fill `#F9FAFB`, Font `#9CA3AF`
- `=$I5="🔄 Negotiating"` → Fill `#FFFBEB`

### Rule 2 — Follow-up Required (Column R)
| Value | Fill | Font |
|---|---|---|
| 🔴 FOLLOW UP NOW | `#FEE2E2` | `#991B1B` Bold |
| 🔴 STALLING | `#FEE2E2` | `#991B1B` Bold |
| 🟡 DUE SOON | `#FEF9C3` | `#854D0E` |

### Rule 3 — Days Since Issued (Column Q)
| Condition | Fill |
|---|---|
| Q > 14 and I = "❌ Not yet" | `#FEE2E2` |
| Q > 5 and Q ≤ 14 and I = "❌ Not yet" | `#FEF9C3` |

Formula: `=AND($Q5>14,$I5="❌ Not yet")` → Fill `#FEE2E2`  
Formula: `=AND($Q5>5,$Q5<=14,$I5="❌ Not yet")` → Fill `#FEF9C3`

### Rule 4 — Missing Countersigned Date
Formula on J5:J200: `=AND($I5="✅ Signed",$J5="")` → Fill `#FEE2E2`

---

## 7. Automation Logic

**LOI issuance protocol:**
1. LOI row created → set F (Issued Date) = today → set Q and R formulas auto-calculate
2. Set calendar reminder: F + 5 business days = follow-up date (manual — note in P)
3. Pipeline must be at Stage 4 before LOI can be issued (validation note — not enforced by formula, but flagged in training)

**Status update cascade (manual, per protocol):**

When I changes to "✅ Signed":
1. Update J (Countersigned Date) = today
2. Open Pipeline → update E to "Stage 5"
3. Open Dashboard → update H (LOIs Signed) in today's log row

When K changes to "✅ Signed":
1. Update L (Pilot Agreement Date) = today
2. Open Pipeline → update E to "Stage 6"
3. Open Dashboard → update I (Pilots Signed) in today's log row

When I changes to "❌ Declined":
1. Update P (Notes) with one sentence: why declined
2. Open Pipeline → update E to "Stage X"
3. Do NOT delete this row — it is a permanent record

**Named ranges:**
- `LOI_Status` = `LOI!I:I`
- `LOI_PilotStatus` = `LOI!K:K`
- `LOI_IssuedDate` = `LOI!F:F`
- `LOI_AccountIDs` = `LOI!B:B`
- `LOI_DaysSinceIssued` = `LOI!Q:Q`

---

## 8. Protection Rules

| Range | Protection |
|---|---|
| A1:P3 (Title + Summary + Spacer) | Protected |
| A4:P4 (Header row) | Protected |
| A5:C500 (LOI ID, Account ID, Company Name) | Protect after entry — IDs are permanent records |
| Q5:R500 (Days Since Issued, Follow-up Due) | Protected — formula cells |
| F5:F500 (Issued Date) | Protect after entry — issuance date is a legal record |

---

## 9. Daily Usage

**Morning (2 minutes):**
1. Open LOI sheet
2. Scan Column R for any 🔴 flags
3. Any 🔴 FOLLOW UP NOW → add to CRM action list for today
4. Any 🔴 STALLING → schedule a direct conversation (not email)

**After every LOI event:**
1. If issuing new LOI → add new row, fill A through H and P
2. If countersigned → update I = ✅ Signed, J = today, then cascade to Pipeline and Dashboard
3. If declined → update I = ❌ Declined, write P (why declined), cascade to Pipeline
4. If negotiating → update I = 🔄 Negotiating, update P with negotiation status

**Weekly (Sunday, 5 minutes):**
1. Read LOI Summary Block (Row 2)
2. Check Conversion Rate (L2) — if Issued ≥ 3 and Signed = 0, LOI terms need review
3. Review all 🔴 and 🟡 in Column R
4. Any Days Since Issued > 14 with "❌ Not yet" → treat as functionally dead; call directly

---

## 10. Common Errors

| Error | Symptom | Fix |
|---|---|---|
| LOI issued before Stage 4 | Terms sent before brand was ready | Never issue LOI without completed discovery call + verbal interest |
| Signed but no date in J | Column J red highlight | Enter countersigned date same day you receive signature |
| Declined LOI deleted | Missing record | Never delete — mark Declined and keep the row |
| LOI not linked to Pipeline stage | Pipeline stays at Stage 4 after LOI signed | Update Pipeline to Stage 5 same day as countersign |
| No follow-up reminder | LOI sits for 2+ weeks unremarked | Set calendar event on day of issuance: F + 5 business days |
| Verbal yes treated as ✅ Signed | False count | ✅ Signed = physical document returned. Verbal = nothing. |

---

---

# ASSET 5 — EXECUTION CALENDAR

---

## 1. Worksheet Layout

**Sheet name:** `Calendar`  
**Tab color:** Green `#15803D`

```
PANEL A — WEEKLY TASK TRACKER (Columns A–H)
ROW 1      │ TITLE BAR — merged A1:H1
            │ "TAJRIBTI · EXECUTION CALENDAR · 60-Day Track 0"
ROW 2      │ [blank]
ROW 3      │ Column headers (Panel A)
ROW 4–12   │ Week 1 tasks
ROW 13     │ [blank separator]
ROW 14–21  │ Week 2 tasks
...
(Continue Week sections through Week 9)

PANEL B — DAILY EXECUTION LOG (Columns J–P)
ROW 1      │ TITLE BAR — merged J1:P1
            │ "DAILY EXECUTION LOG"
ROW 2      │ [blank]
ROW 3      │ Column headers (Panel B)
ROW 4+     │ One row per working day (Mon–Fri across 60 days = ~43 rows)
```

**Freeze:** Row 3 (both panels, same row) + Column A  
**Print area Panel A:** A1:H200  
**Print area Panel B:** J1:P100  
**Print layout:** Landscape · Fit to 1 page wide

---

## 2. Columns

### Panel A — Weekly Task Tracker

| Col | Header | Type | Width |
|---|---|---|---|
| A | Week # | Text/Number | 70px |
| B | Date Range | Text | 150px |
| C | Week Objective | Text | 300px |
| D | Milestone | Text | 250px |
| E | Task # | Number | 60px |
| F | Task Description | Text | 400px |
| G | Owner | Dropdown | 100px |
| H | Status | Dropdown | 130px |

### Panel B — Daily Execution Log

| Col | Header | Type | Width |
|---|---|---|---|
| J | Week # | Number | 70px |
| K | Day | Dropdown | 100px |
| L | Date | Date | 110px |
| M | Focus Area | Dropdown | 120px |
| N | Scheduled Actions | Text | 350px |
| O | Completed? | Dropdown | 100px |
| P | Notes | Text | 250px |

---

## 3. Dropdown Lists

**Column G — Task Owner**
```
Founder
Advisor
External
```

**Column H — Task Status**
```
❌ Not Started
🔄 In Progress
✅ Done
⚠️ At Risk
🚫 Blocked
```

**Column K — Day**
```
Monday
Tuesday
Wednesday
Thursday
Friday
```

**Column M — Focus Area**
```
Brand outreach
Follow-up
Discovery call
Proposal/LOI
Admin
Strategic review
```

**Column O — Completed?**
```
✅ Done
❌ Not done
↪️ Carried forward
```

---

## 4. Validation Rules

| Column | Rule | Error |
|---|---|---|
| H | Dropdown only | — |
| O | Dropdown only | — |
| L | Valid date | "Enter date as YYYY-MM-DD" |
| G | Dropdown only | — |
| M | Dropdown only | — |

**Overdue task flag (Column H):**  
When H = "❌ Not Started" and the week's Date Range end has passed → conditional format flags it red.

---

## 5. Formulas

### Week completion rate (add in column I — optional summary column):

For each week block, add a summary row at the bottom of the task list:  
`=COUNTIF(H[week_start_row]:H[week_end_row],"✅ Done")/COUNTA(H[week_start_row]:H[week_end_row])`  
Label: "Week X Completion Rate"  
Format as Percentage.

### Sprint progress (add to title area, cells A2:D2):

| Cell | Label | Formula |
|---|---|---|
| A2 | `Sprint GO Date:` | Link to Dashboard!A2 |
| B2 | `=Dashboard!A2` | — |
| C2 | `Current Day:` | — |
| D2 | `=TODAY()-Dashboard!A2+1` | — |

### Pre-populated Week/Date content (hardcoded after GO date is set):

Once GO Date is in Dashboard!A2, fill Column B for each week section:
- Week 1: `="Days 1–7: "&TEXT(Dashboard!$A$2,"d mmm")&"–"&TEXT(Dashboard!$A$2+6,"d mmm")`
- Week 2: `="Days 8–14: "&TEXT(Dashboard!$A$2+7,"d mmm")&"–"&TEXT(Dashboard!$A$2+13,"d mmm")`
- Continue pattern through Week 9.

### Daily log — Auto-date (Column L):

First working day row (Row 4, Panel B): Link to `=Dashboard!A2` (GO date)  
Subsequent rows: `=L4+1` (adjust for weekends by skipping Saturday/Sunday — or simply enter all 5 weekdays per week manually).

---

## 6. Conditional Formatting

**Apply to Panel A (A3:H200):**

### Rule 1 — Task Status colors (Column H, row-level)
| Value | Row Fill | Font |
|---|---|---|
| ✅ Done | `#F0FDF4` | `#15803D` |
| 🔄 In Progress | `#EFF6FF` | `#1D4ED8` |
| ⚠️ At Risk | `#FEF9C3` | `#854D0E` |
| 🚫 Blocked | `#FEE2E2` | `#991B1B` Bold |
| ❌ Not Started | `#F9FAFB` | `#374151` |

Row-level formulas:
- `=$H4="✅ Done"` → Fill `#F0FDF4`
- `=$H4="🚫 Blocked"` → Fill `#FEE2E2`
- `=$H4="⚠️ At Risk"` → Fill `#FFFBEB`

### Rule 2 — Week header rows (rows where E = blank and F contains objective text)
Apply bold + fill `#374151` + white font to week header rows. Implement by formatting manually — or apply conditional format: `=AND($A4<>"",E4="")` → Fill `#374151`, Font white.

**Apply to Panel B (J3:P100):**

### Rule 3 — Completed status (Column O, row-level)
| Value | Row Fill | Font |
|---|---|---|
| ✅ Done | `#F0FDF4` | `#15803D` |
| ❌ Not done | `#FEE2E2` | `#991B1B` |
| ↪️ Carried forward | `#FEF9C3` | `#92400E` |

### Rule 4 — Today's row (Panel B)
Formula on J:P range: `=$L4=TODAY()` → Fill `#EFF6FF` · Font `#1D4ED8` Bold

---

## 7. Pre-populated Task Content

Populate Panel A with all 9 weeks' tasks from MEOS_v1.md. Use the following structure for each week section:

**Week section structure (example — Week 1):**

| Row | A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|---|
| Week header | 1 | Days 1–7 [dates] | System armed and first outreach wave launched | ≥10 brand accounts contacted | — | — | — | — |
| Task row | — | — | — | — | 1 | Populate CRM with Tier 1 target list (≥15 companies) | Founder | ❌ Not Started |
| Task row | — | — | — | — | 2 | Assign Priority Tier 1/2/3 to all accounts | Founder | ❌ Not Started |
| Task row | — | — | — | — | 3 | Identify warm intro path for each Tier 1 account | Founder | ❌ Not Started |
| Task row | — | — | — | — | 4 | Draft outreach message — LinkedIn version (3 sentences max) | Founder | ❌ Not Started |
| Task row | — | — | — | — | 5 | Draft outreach message — Email version (5 sentences max) | Founder | ❌ Not Started |
| Task row | — | — | — | — | 6 | Draft 1-page pitch teaser PDF | Founder | ❌ Not Started |
| Task row | — | — | — | — | 7 | Launch outreach: contact ≥10 Tier 1 accounts | Founder | ❌ Not Started |
| Task row | — | — | — | — | 8 | Log all outreach in CRM — same day | Founder | ❌ Not Started |
| Task row | — | — | — | — | 9 | Set up all 5 MEOS assets | Founder | ❌ Not Started |
| Task row | — | — | — | — | 10 | Fill Day 1 row in Founder Dashboard | Founder | ❌ Not Started |

Repeat this structure for Weeks 2 through 9 using all tasks from MEOS_v1.md exactly.

---

## 8. Automation Logic

**Sunday planning protocol (manual):**
1. Open Week [N+1] section in Panel A
2. For each task with H = "❌ Not Started": assign to a day in Panel B
3. In Panel B: create one row per working day for the week
4. Fill N (Scheduled Actions) with task descriptions for that day
5. Link Monday's first task to Dashboard Column K (copy the week objective into Dashboard Monday's #1 Priority)

**Daily execution (Panel B):**
1. Open today's row (highlighted blue by Rule 4)
2. Work through N (Scheduled Actions)
3. Update O (Completed?) after each action
4. If ❌ Not done → write P (one sentence: why not done)
5. Do NOT silently carry forward — acknowledge in P

**Blocked task escalation:**
When H = "🚫 Blocked":
1. Write the blocker in a corresponding Panel B Notes cell (P column)
2. Write the same blocker in Dashboard L (Blockers) in today's row
3. Do not move on until you have named who or what is blocking it

---

## 8. Protection Rules

| Range | Protection |
|---|---|
| A1:H2 (Title + Sprint Meta) | Protected |
| A3:H3 (Panel A headers) | Protected |
| J1:P3 (Panel B title + headers) | Protected |
| Week header rows (A, B, C, D where E = blank) | Protect after initial setup |
| Task description column F | Protect after initial setup — tasks don't change mid-sprint |
| Column E (Task #) | Protected — never re-number |

---

## 9. Daily Usage

**Sunday (15 minutes):**
1. Open Calendar → find next week's Panel A section
2. Review all tasks: which are ❌ Not Started?
3. For each: open Panel B → create a day row → assign the task to N column
4. Confirm any brand calls are logged in CRM as well
5. Write Monday's week objective in Dashboard K5 (#1 Priority for Monday)

**Daily (morning):**
1. Open Panel B → find today's row (highlighted blue)
2. Read N (Scheduled Actions)
3. Execute in order

**Daily (after each task):**
1. Return to Panel B today's row
2. Mark O: ✅ Done
3. If not done: ❌ Not done + write P (one sentence)

**Daily (evening):**
1. Review today's Panel B row — any ❌ Not done?
2. Add these to tomorrow's Panel B N column
3. Update Panel A H (Status) if a full week's milestone was hit: ✅ Done

---

## 10. Common Errors

| Error | Symptom | Fix |
|---|---|---|
| Tasks not assigned to a specific day | Week ends with full backlog | Every task gets a day by Sunday night — no exceptions |
| ❌ Not done silently carried forward | Accountability gap; same tasks repeat for weeks | Write P (why) + explicitly enter in tomorrow's Panel B N column |
| Week objective not updated in Dashboard | Dashboard #1 Priority is stale | Each Sunday: write next week's objective in Dashboard Monday row |
| Stopping outreach tasks in Week 5+ | Pipeline collapses; you reach pilots target then lose depth | Outreach tasks stay in calendar through Week 8. Never remove. |
| Panel B left blank for a week | No daily log | Fill Panel B every working day — even if 5 minutes |

---

---

# WORKBOOK STRUCTURE

---

## Tab Order

| Position | Sheet Name | Tab Color | Purpose |
|---|---|---|---|
| 1 | `Dashboard` | Dark Navy `#1F2937` | Daily sprint view — open first every morning |
| 2 | `CRM` | Blue `#1D4ED8` | Master record of every brand contact |
| 3 | `Pipeline` | Purple `#7C3AED` | Stage-by-stage deal progression |
| 4 | `LOI` | Orange `#EA580C` | Letter of Intent tracking |
| 5 | `Calendar` | Green `#15803D` | 60-day task + milestone schedule |

---

## Color System

| Color | Hex | Meaning |
|---|---|---|
| Dark Navy | `#1F2937` | Title bars / header fills |
| Blue | `#1D4ED8` | Active / In progress / Contacted |
| Green (dark) | `#065F46` | Met / Signed / Done / Hot |
| Green (light) | `#D1FAE5` | Success state fill |
| Amber | `#92400E` | Approaching / At risk / Warm |
| Amber (light) | `#FEF9C3` | Warning fill |
| Red (dark) | `#991B1B` | Not met / Blocked / Overdue |
| Red (light) | `#FEE2E2` | Danger fill |
| Grey | `#9CA3AF` | Dead / Inactive / Stage X |
| Grey (light) | `#F3F4F6` | Dead row fill |
| White | `#FFFFFF` | Active data rows |

---

## Naming Convention

**Workbook file name:** `MEOS_v1_Track0_[GO-DATE].xlsx`  
Example: `MEOS_v1_Track0_2026-07-28.xlsx`

**Google Sheets name:** `MEOS v1 — Track 0 · Tajribti · [GO-DATE]`

**Account IDs:** `BRD-001` through `BRD-100` (three-digit zero-padded)  
**LOI IDs:** `LOI-001` through `LOI-050`  
**Sheet names:** Exact as specified above — no abbreviations, no spaces, no version suffixes

---

## Named Ranges (Define All on Setup Day)

| Range Name | Scope | Reference |
|---|---|---|
| `GO_Date` | Workbook | `Dashboard!$A$2` |
| `CRM_AccountIDs` | Workbook | `CRM!$A:$A` |
| `CRM_Stages` | Workbook | `CRM!$R:$R` |
| `CRM_PilotInterest` | Workbook | `CRM!$Z:$Z` |
| `CRM_NextActionDate` | Workbook | `CRM!$Q:$Q` |
| `CRM_DiscoveryCallDate` | Workbook | `CRM!$S:$S` |
| `CRM_FirstOutreachDate` | Workbook | `CRM!$K:$K` |
| `Pipeline_Stages` | Workbook | `Pipeline!$E:$E` |
| `Pipeline_AccountIDs` | Workbook | `Pipeline!$A:$A` |
| `Pipeline_KillCriterion` | Workbook | `Pipeline!$B$12` |
| `LOI_Status` | Workbook | `LOI!$I:$I` |
| `LOI_PilotStatus` | Workbook | `LOI!$K:$K` |
| `LOI_IssuedDate` | Workbook | `LOI!$F:$F` |
| `LOI_DaysSinceIssued` | Workbook | `LOI!$Q:$Q` |

---

## Version Number

**Current version:** MEOS v1.0  
**Version cell:** Add to all tab footers (insert footer in print settings):  
`MEOS v1.0 · Tajribti Track 0 · Built 2026-07-27`

**Version update protocol:** If any field is added or renamed → increment to v1.1. Any structural change to relationships → increment to v2.0. Do not increment for data entry.

---

## Folder Structure

```
Google Drive (or local folder):
└── TAJRIBTI/
    └── 00_OPERATIONS/
        └── MEOS_v1/
            ├── MEOS_v1_Track0_[GO-DATE].xlsx        ← Main workbook
            ├── MEOS_v1_Production_Spec.md            ← This document
            └── LOI_Documents/
                ├── LOI-001_[Company]_v1.pdf
                ├── LOI-002_[Company]_v1.pdf
                └── ...
```

---

## Sheet Relationship Map

```
CRM (master)
│  Account ID ─────────────────────────────────────┐
│  CRM Stage ──────────┐                           │
│  Discovery Call Date ─┤                           │
│  Pilot Interest ──────┤                           │
│  First Outreach Date ─┘                           │
│                       ↓                           ↓
│               Pipeline (stage view)          LOI Tracker
│               Account ID ←──────────── Account ID
│               Current Stage ──────────→ LOI status cascades back
│               Days in Stage (formula)   Countersigned Date
│               Kill Criterion Count      Pilot Agreement Date
│                       │                           │
│                       └──────────┬────────────────┘
│                                  ↓
│                         Dashboard (Live Status Block)
│                         Accounts Contacted ← CRM!K
│                         Calls Booked ← Pipeline!E
│                         Calls Completed ← CRM!S
│                         Brands in Pipeline ← Pipeline!E (COUNTIF)
│                         LOIs Issued ← LOI!A
│                         LOIs Signed ← LOI!I
│                         Pilots Signed ← LOI!K
│                         Kill Criterion ← Pipeline!B12
│
└── Calendar (independent — references Dashboard!A2 for GO date only)
```

**Data flows:**
- **CRM → Pipeline:** When CRM Stage changes, Pipeline Stage must match (same sitting)
- **Pipeline → Dashboard:** Dashboard Live Status Block reads Pipeline COUNTIF formulas live
- **LOI → Pipeline:** LOI countersign drives Pipeline to Stage 5; Pilot Agreement drives Stage 6
- **LOI → Dashboard:** Dashboard LOI counts read from LOI sheet (COUNTIF on I and K columns)
- **CRM → Dashboard:** Dashboard Accounts Contacted reads CRM First Outreach Date column
- **Dashboard → Calendar:** GO Date in Dashboard!A2 drives all week date ranges in Calendar

---

---

# PRODUCTION READINESS CHECKLIST

Complete all items before Day 1 outreach begins. Check each item only after verified — not after creating.

---

## WORKBOOK SETUP

```
□ Workbook created with correct filename: MEOS_v1_Track0_[GO-DATE]
□ All 5 tabs created: Dashboard | CRM | Pipeline | LOI | Calendar
□ Tab colors applied: Navy | Blue | Purple | Orange | Green
□ Tab order matches specification (Dashboard first, Calendar last)
□ Workbook shared with Founder account only (no public sharing)
□ Workbook saved to correct folder: TAJRIBTI/00_OPERATIONS/MEOS_v1/
```

---

## DASHBOARD

```
□ Title bar created (Row 1, merged, dark navy)
□ Sprint Meta block complete (Row 2) — GO Date entered in A2
□ Column headers in Row 4 — all 13 columns (A through M) labeled correctly
□ Row 4 frozen (freeze row)
□ Column A frozen (freeze column)
□ Day # auto-formula entered in A5:A64 OR manual sequence 1–60 ready
□ Date sequence in B5:B64 (B5 = GO Date, B6 = B5+1, etc.)
□ Kill Criterion Status dropdown applied to J5:J64 (3 values)
□ Pilots Signed conditional formatting verified (green at 3+, amber 1–2, red at 0 past Day 30)
□ Kill Criterion Status conditional formatting verified (green/amber/red by value)
□ Today's row conditional formatting verified (blue highlight on row where B = TODAY())
□ Brands in Pipeline conditional formatting verified
□ Live Sprint Status block (Rows 66–77) created with all formulas
□ All Live Status Block formulas verified — each returns a number (not error)
□ Dashboard ready for Day 1 entry (all rows Day 1–60 pre-formatted)
□ Day 1 row filled: Date, Day #1, all counts = 0, Kill Criterion = ❌ Not Met
□ Day 1 #1 Priority written
□ Print area set: A1:M64 · Landscape
```

---

## BRAND OUTREACH CRM

```
□ Column headers in Row 1 — all columns A through AD labeled correctly
□ Row 1 frozen (freeze row)
□ Column A frozen (freeze column)
□ All dropdown lists applied to correct columns:
  □ C (Category) — 10 values
  □ D (Priority Tier) — 3 values
  □ I (Relationship Source) — 5 values
  □ L (First Outreach Channel) — 5 values
  □ N (Last Touchpoint Type) — 9 values
  □ R (CRM Stage) — 8 values (Stage 0 through X)
  □ T (Discovery Call Outcome) — 4 values
  □ W (Decision-Maker Identified) — 3 values
  □ Y (Campaign Budget Signal) — 4 values
  □ Z (Pilot Interest Level) — 4 values
□ Duplicate Account ID conditional formatting applied (A2:A200)
□ Stage color conditional formatting applied (R column)
□ Pilot Interest Level row-level conditional formatting applied (Z column)
□ Next Action Overdue conditional formatting applied (Q column)
□ Days Since Last Touchpoint formula (AE column) applied to AE2:AE200
□ Overdue Next Action indicator (AF column) applied to AF2:AF200
□ Stage consistency check (AG column) applied to AG2:AG200
□ All 5 filter views created: Today's Actions | Hot Leads | Active Pipeline | Stale Leads | Tier 1 Only
□ All named ranges defined: CRM_AccountIDs, CRM_Stages, CRM_PilotInterest, CRM_NextActionDate, CRM_DiscoveryCallDate, CRM_FirstOutreachDate
□ 15 pre-populated accounts entered from GTM target list (Company Name, Category, Priority Tier, Stage = Stage 0)
□ Print area set: A1:AA50 · Landscape
```

---

## BRAND PIPELINE

```
□ Title bar created (Row 1, merged)
□ Pipeline Health Summary block complete (Rows 3–12) with all COUNTIF formulas
□ All 8 stage counts verified (B3:B10) — each returns a number
□ Kill Criterion Count formula verified (B12) — returns number ≥ 0
□ Kill Criterion Met? formula verified (E5) — returns text based on B12
□ Total Accounts, Active Accounts, Kill Criterion Target formulas in D3:D5 verified
□ Column headers in Row 14 — all 10 columns (A through J) labeled correctly
□ Row 14 frozen (freeze row)
□ Column A frozen (freeze column)
□ All dropdown lists applied: C (Category), D (Priority Tier), E (Current Stage — 8 values)
□ Days in Stage formula applied to G15:G200 (=IF(F15="","",TODAY()-F15))
□ Stage Age Flag formula applied to H15:H200 (full formula with Stage X exclusion)
□ Stage Age Flag conditional formatting verified — 🔴 AGED triggers red row fill
□ Stage color conditional formatting applied to E column (8 colors)
□ Account ID cross-reference check applied (A15:A200 — red if not in CRM)
□ All filter views created: Aged Accounts | Kill Criterion | Dead Only | Tier 1 Active
□ All named ranges defined: Pipeline_Stages, Pipeline_EntryDate, Pipeline_AccountIDs, Pipeline_KillCriterionCount
□ 15 initial accounts entered — all matching CRM Account IDs exactly — all Stage 0
□ Print area set: A14:J200 · Portrait
```

---

## LOI TRACKER

```
□ Title bar created (Row 1, merged)
□ LOI Summary Block complete (Row 2) — all formulas verified (B2, D2, F2, H2, J2, L2, N2)
□ Conversion Rate formula (L2) verified — returns percentage or "—"
□ Overdue Follow-up count (N2) verified — returns number
□ Column headers in Row 4 — all columns A through R labeled correctly
□ Row 4 frozen (freeze row)
□ Column A frozen (freeze column)
□ All dropdown lists applied:
  □ E (LOI Type) — 2 values
  □ G (LOI Version) — 3 values
  □ I (Brand Countersigned?) — 4 values
  □ K (Pilot Agreement Executed?) — 2 values
  □ M (Pilot Campaign Type) — 4 values
□ Days Since Issued formula applied to Q5:Q200 (=IF(F5="","",TODAY()-F5))
□ Follow-up Due formula applied to R5:R200 (full formula)
□ Countersigned status row-level conditional formatting verified (green/amber/red/grey)
□ Follow-up Required conditional formatting verified (🔴 and 🟡 trigger correctly)
□ Days Since Issued conditional formatting verified (>14 = red, >5 = amber)
□ Missing Countersigned Date conditional formatting applied (J column)
□ All named ranges defined: LOI_Status, LOI_PilotStatus, LOI_IssuedDate, LOI_AccountIDs, LOI_DaysSinceIssued
□ LOI_Documents folder created in Drive for PDF storage
□ Print area set: A1:P50 · Landscape
```

---

## EXECUTION CALENDAR

```
□ Title bar created (Row 1, merged for both panels)
□ Panel A column headers in Row 3 (A through H)
□ Panel B column headers in Row 3 (J through P)
□ Row 3 frozen
□ Column A frozen
□ All dropdown lists applied:
  □ G (Task Owner) — 3 values
  □ H (Task Status) — 5 values
  □ K (Day) — 5 values
  □ M (Focus Area) — 6 values
  □ O (Completed?) — 3 values
□ All 9 week sections created in Panel A:
  □ Week 1 (Days 1–7) — 10 tasks entered
  □ Week 2 (Days 8–14) — 7 tasks entered
  □ Week 3 (Days 15–21) — 7 tasks entered
  □ Week 4 (Days 22–28) — 5 tasks entered
  □ Week 5 (Days 29–35) — 6 tasks entered
  □ Week 6 (Days 36–42) — 5 tasks entered
  □ Week 7 (Days 43–49) — 4 tasks entered
  □ Week 8 (Days 50–56) — 5 tasks entered
  □ Week 9 (Days 57–60) — 5 tasks entered
□ All tasks default status = ❌ Not Started
□ Week date ranges reference Dashboard!A2 (GO Date) for auto-calculation
□ Task Status conditional formatting verified (green/blue/amber/red by value)
□ Today's row conditional formatting verified in Panel B (blue highlight)
□ Panel B pre-filled with Week 1 daily rows (Mon–Fri, Rows 4–8)
□ Week 1 Panel B rows linked to Week 1 Panel A tasks in Column N
□ Print areas set for both panels
```

---

## CROSS-SHEET RELATIONSHIPS

```
□ Dashboard Live Status Block — Accounts Contacted formula verified (reads CRM!K column)
□ Dashboard Live Status Block — Discovery Calls Booked formula verified (reads Pipeline!E)
□ Dashboard Live Status Block — Discovery Calls Completed formula verified (reads CRM!S)
□ Dashboard Live Status Block — Brands in Pipeline formula verified (reads Pipeline!E COUNTIF)
□ Dashboard Live Status Block — LOIs Issued formula verified (reads LOI!A)
□ Dashboard Live Status Block — LOIs Signed formula verified (reads LOI!I COUNTIF)
□ Dashboard Live Status Block — Pilots Signed formula verified (reads LOI!K COUNTIF)
□ Dashboard Live Status Block — Kill Criterion formula verified (reads Pipeline!E COUNTIF)
□ Pipeline — Account ID cross-reference check verified (reads CRM!A column)
□ Calendar — GO Date reference verified (reads Dashboard!A2)
□ CRM Stage consistency check verified (AE column reads Pipeline!E via VLOOKUP)
□ All named ranges resolve correctly — test each via Name Box
□ No #REF! errors anywhere in the workbook
□ No #VALUE! errors anywhere in the workbook
□ No #N/A errors in COUNTIF formulas
```

---

## FINAL PRE-LAUNCH

```
□ Workbook version footer added to all sheets: "MEOS v1.0 · Tajribti Track 0 · 2026-07-27"
□ All protection ranges set (header rows, formula columns, title bars)
□ All filter views saved and named correctly in CRM and Pipeline
□ All named ranges verified in Name Manager / Named Ranges list
□ 15 initial brand accounts entered in CRM with Company, Category, Priority Tier, Stage 0
□ 15 corresponding rows entered in Pipeline (same Account IDs, Stage 0)
□ Dashboard Day 1 row filled (date, Day #1, all counts 0, Kill Criterion ❌ Not Met, #1 Priority written)
□ Calendar Week 1 tasks all at ❌ Not Started
□ Workbook shared with no one else — Founder only
□ Backup copy saved: MEOS_v1_Track0_[GO-DATE]_BACKUP.xlsx
□ MEOS_v1_Production_Spec.md accessible in same folder as workbook
□ Ready for Day 1
```

---

*MEOS v1 Production Specification — Tajribti Track 0*  
*Built: 2026-07-27 · Owner: Founder / CEO*  
*Treat this document as read-only after workbook setup is complete.*
