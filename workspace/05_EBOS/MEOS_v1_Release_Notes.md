# RELEASE NOTES — MEOS v1.0.1

**Product:** TAJRIBTI MEOS — Market Entry Operating System  
**Track:** Track 0 — Commercial Validation Sprint  
**Version:** v1.0.1 (Patch Release)  
**Base Version:** v1.0 (build date: 2026-07-27)  
**Patch Date:** 2026-07-27  
**File:** `MEOS_v1_Track0.xlsx`

---

## What Is MEOS v1

MEOS (Market Entry Operating System) v1 is the complete operational workbook for Tajribti's 60-day Track 0 commercial validation sprint. It consists of five interconnected sheets that collectively track every dimension of the brand outreach cycle — from first contact through pilot signature.

**Sheets:**
1. **Dashboard** — 60-day daily sprint tracker with live status block
2. **CRM** — Full brand account relationship management (30 columns)
3. **Pipeline** — Stage-by-stage brand progression tracker with kill criterion
4. **LOI** — Letter of Intent issuance and signing tracker
5. **Calendar** — Dual-panel weekly task + daily execution log

---

## v1.0 → v1.0.1 — Patch Changes

### PATCH-01 — Named Range Rename
- **Before:** `Pipeline_KillCriterion` → `Pipeline!$B$12`
- **After:** `Pipeline_KillCriterionCount` → `Pipeline!$B$12`
- **Reason:** Spec §7 (Workbook Structure) specifies exact name `Pipeline_KillCriterionCount`. Reference target unchanged.

### PATCH-02 — Dashboard Date Validation
- **Added:** Date-type data validation on `Dashboard!B5:B64`
- **Rule:** Date only · Allow blank · Reject invalid dates
- **Reason:** Spec requires date validation on the Date column. Non-date entry would break the Day# formula chain.

### PATCH-03 — Dashboard Cross-Column Validation (E≤D)
- **Before:** `E5:E64` → Whole number ≥0
- **After:** `E5:E64` → Custom formula `AND(E5>=0,E5<=D5)`
- **Reason:** Spec requires "Calls Completed cannot exceed Calls Booked." Cross-column constraint enforced at entry time.

### PATCH-04 — Dashboard Cross-Column Validation (H≤G)
- **Before:** `H5:H64` → Whole number ≥0
- **After:** `H5:H64` → Custom formula `AND(H5>=0,H5<=G5)`
- **Reason:** Spec requires "LOIs Signed cannot exceed LOIs Issued." Prevents logically impossible conversion rates.

### PATCH-05 — Dashboard Cross-Column Validation (I≤H)
- **Before:** `I5:I64` → Whole number ≥0
- **After:** `I5:I64` → Custom formula `AND(I5>=0,I5<=H5)`
- **Reason:** Spec requires "Pilots Signed cannot exceed LOIs Signed." Prevents logically impossible pilot data.

### PATCH-06 — Dashboard Sprint Meta Budget Cell
- **Before:** Budget text `"Budget: $15,000–$25,000"` in `I2` (wrong column)
- **After:** Budget text in `H2` (correct per spec) · `I2` cleared
- **Reason:** Sprint Meta block spec places Budget in H2. Content was 1 column right of specified position.

### PATCH-07 — LOI Title Bar Merge Correction
- **Before:** `A1:R1` (18 columns — extended into formula columns Q and R)
- **After:** `A1:P1` (16 columns — spec exact, through Notes column only)
- **Reason:** Spec explicitly specifies "merged A1:P1." R1 and Q1 are formula/header columns that must remain independent.

### PATCH-08 — Calendar Print Area
- **Before:** Not set (empty string)
- **After:** Panel A = `A1:H200` · Panel B = `J1:P100` · Landscape · Fit 1 page wide
- **Reason:** Spec §5 Calendar defines dual-panel print areas. Neither was configured.

### PATCH-09 — Calendar Gap Column I3
- **Before:** `I3` = `"Week %"` (undocumented header in spec gap column)
- **After:** `I3` = blank
- **Reason:** Column I is the visual separator between Panel A (A–H) and Panel B (J–P). Spec does not define any header for I3.

---

## What Did Not Change

Everything not listed above is identical to v1.0:

- All 5 sheet layouts and column structures
- All formulas (no formula modifications in this patch)
- All dropdown values and dropdown column assignments
- All conditional formatting rules and color codes
- All tab colors
- All freeze panes
- All 14 pre-seeded brand accounts (BRD-001 through BRD-014)
- All cross-sheet formula relationships
- All named ranges (except the one rename in PATCH-01)
- All print areas on Dashboard, CRM, Pipeline, LOI (unchanged; only Calendar added)
- All row heights and column widths

---

## Compatibility

- Tested with: openpyxl 3.1.5
- Compatible with: Microsoft Excel 2016+, Google Sheets (via Drive import)
- File format: .xlsx (Office Open XML)
