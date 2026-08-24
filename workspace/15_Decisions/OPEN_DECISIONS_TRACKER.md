# Open Decisions Tracker

**Purpose:** Live tracker for all unresolved decisions. Update this file as decisions are made.  
**Last reviewed:** 2026-08-17  
**Owner:** Founder / CEO  

---

## BLOCKING — Must resolve before any Track 1 activity

### B-01 — Track 0 GO Decision
| Field | Value |
|---|---|
| **Decision required** | Confirm that the $15,000–$25,000 commercial validation sprint has concluded with a GO decision |
| **Owner** | Founder / Investment Committee |
| **Impact** | All Track 1 engineering is blocked. This is the master gate for the entire project. |
| **What proves it closed** | Written GO confirmation from the IC or founder with date and sprint outcome summary |
| **Status** | ⬜ OPEN |

### B-02 — Egyptian LLC Incorporation
| Field | Value |
|---|---|
| **Decision required** | Confirm that the Egyptian LLC is incorporated, or provide a date by which it will be |
| **Owner** | Founder |
| **Impact** | Cannot sign vendor contracts in Sprint 0 (SMS, WhatsApp BSP, cloud, payment providers) |
| **What proves it closed** | Commercial register number, or signed formation agreement with a specific date |
| **Status** | ⬜ OPEN |

### B-03 — PDPL Legal Sign-Off
| Field | Value |
|---|---|
| **Decision required** | Qualified Egyptian data-privacy lawyer reviews the platform design and provides a written scope opinion |
| **Owner** | Legal counsel (to be engaged) |
| **Impact** | Cannot ship any data-collecting feature without this. FDD states privacy-by-design is non-negotiable. |
| **What proves it closed** | Written legal memo from Egyptian counsel scoping PDPL obligations for this platform |
| **Status** | ⬜ OPEN |

### B-04 — QR Concurrency Load Test
| Field | Value |
|---|---|
| **Decision required** | Engineering team executes the QR redemption load test defined in the Delivery Plan Risk Register (R-03) |
| **Owner** | Engineering (CTO — not yet hired) |
| **Impact** | Highest identified technical risk. Race condition under concurrent load is unproven. Cannot authorize Private Beta without this. |
| **What proves it closed** | Load test report showing idempotency holds at target concurrent redemption volume |
| **Status** | ⬜ OPEN |

---

## NON-BLOCKING — Important but not authorization gates

### OD-01 — Company Name / Trademark
| Field | Value |
|---|---|
| **Decision** | Confirm final legal company name; complete trademark and domain clearance for "Tajribti" |
| **Impact** | All code repositories, legal filings, and brand assets must use provisional name until cleared |
| **Notes** | Standard footer on all documents: *"Tajribti is a working name pending trademark and domain clearance"* |
| **Status** | ⬜ OPEN |

### OD-02 — CEO as PM vs. Dedicated PM
| Field | Value |
|---|---|
| **Decision** | Does the CEO double as Product Manager in Year 1, or is a dedicated PM hired on GO? |
| **Impact** | Affects Sprint 0 resource plan and Year 1 hiring budget |
| **Notes** | FDD lists this as an open decision — CEO doubling is the default assumption in the Delivery Plan |
| **Status** | ⬜ OPEN |

### OD-03 — Cloud Region (Provisionally Bahrain)
| Field | Value |
|---|---|
| **Decision** | Confirm AWS me-south-1 (Bahrain) as the cloud region, or select a different region |
| **Impact** | Infrastructure setup in Sprint 0 depends on this being confirmed |
| **Notes** | Provisionally resolved in Remediation doc — pending final PDPL legal confirmation |
| **Status** | ⚠️ PROVISIONAL (Bahrain) |

### OD-04 — Funding Strategy
| Field | Value |
|---|---|
| **Decision** | Seek external funding or remain bootstrapped? |
| **Impact** | Affects growth timeline, team size, and investor reporting obligations |
| **Notes** | FDD states capital-efficient by design; bootstrapped trajectory is the default model |
| **Status** | ⬜ OPEN |

### OD-05 — Revenue Mix Percentages
| Field | Value |
|---|---|
| **Decision** | What percentage of revenue is expected from each stream (campaign fees vs. subscription vs. panel vs. API)? |
| **Impact** | Pricing strategy, financial model, investor narrative |
| **Notes** | Pending Track 0 pricing discovery. Current figures ($4K–$20K/campaign) are illustrative. |
| **Status** | ⬜ OPEN — depends on B-01 (Track 0 GO) |

---

---

## PRODUCT COMPLETION V0.5 — Sprint Authorization (2026-08-23)

### CONFLICT-D — QR-First vs Discovery-First Consumer Journey

| Field | Value |
|---|---|
| **Decision** | Founder reviewed product state 2026-08-23 and directed: Discovery-First is the target consumer experience. CAD-05 applies from V0.5. QR scanning preserved as secondary entry. |
| **Authority** | Founder (explicit direction 2026-08-23) |
| **Decision ID** | DL-050 |
| **Status** | ✅ RESOLVED — 2026-08-23 |

### V0.5 Sprint Authorization — BD-13 Bounded Exception

| Field | Value |
|---|---|
| **Decision** | Engineering authorized for Product Completion V0.5 only: discovery feed, real home, campaign detail, return loop, participation history, reward presentation. BD-13 resumes after V0.5. BD-14 kill criterion unchanged. |
| **Authority** | Founder (explicit direction 2026-08-23) |
| **Decision ID** | DL-051 |
| **Status** | ✅ AUTHORIZED — 2026-08-23 |

---

## COMMERCIAL SPRINT — Must resolve before first brand demo (Track 0)

### CONFLICT-INTERNAL-C — Flutter Demo Path

| Field | Value |
|---|---|
| **Decision required** | Resolve the conflict between DL-046 (first client must see Flutter) and the fact that Flutter 3.44.8 cannot be built on macOS 13 (requires macOS 14+). Choose one of three paths: (A) upgrade Founder machine to macOS 14; (B) set up a CI build pipeline; or (C) amend DL-046 to accept mobile web for first meeting |
| **Owner** | Founder (hardware + product decision) |
| **Impact** | The first brand discovery meeting cannot demonstrate the Flutter mobile app at full fidelity until this is resolved. Mobile web is deployed on Vercel and functional, but contradicts DL-046. |
| **What proves it closed** | Flutter app successfully built and distributable (path A or B) OR DL-046 formally amended to accept mobile web with note in FOUNDER_DECISIONS.md (path C) |
| **Status** | ⬜ OPEN — identified 2026-08-17 |

### D-028 — Intelligence Report Quality

| Field | Value |
|---|---|
| **Decision required** | Founder reviews the current Intelligence Report deployed on Vercel (EN and AR modes) and either (a) confirms the current version meets the Samplia benchmark (DL-047) and is ready for commercial demos, or (b) specifies the exact remaining changes needed |
| **Owner** | Founder |
| **Impact** | Commercial demo materials are incomplete until Founder confirms the report is ready. Further speculative design work is blocked by MANAGEMENT_SITUATION_ANALYSIS protocol. |
| **What proves it closed** | Founder message confirming "report is ready" or a specific list of remaining changes |
| **Status** | ⬜ OPEN — improvements delivered 2026-08-14; sign-off pending |

---

## How to close a decision

1. Record the decision with date and owner in `15_Decisions/FOUNDER_DECISIONS.md`
2. Mark it ✅ in this tracker
3. Update `_navigator/DECISION_STATUS_BOARD.md`
4. If it was a blocking item, re-submit to the IERB for re-audit
