# Open Decisions Tracker

**Purpose:** Live tracker for all unresolved decisions. Update this file as decisions are made.  
**Last reviewed:** 2026-08-26
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
| **Status** | ✅ OPTION B FULLY VALIDATED 2026-08-23 — PATH C isolated E2E: 16/16 steps PASS. Real Akedly OTP (+201118000472). Full participation + completed-campaign protection ("شاركت سابقاً") confirmed on TKINR8IJ5D9DSKQK. Production unchanged. |

### D-028 — Intelligence Report Quality

| Field | Value |
|---|---|
| **Decision required** | ~~Founder reviews the current Intelligence Report deployed on Vercel (EN and AR modes)~~ — superseded by direct Founder instruction 2026-08-26 to close this loop based on an evidence-based R1–R9 review (see below) rather than a further live-review round |
| **Owner** | Founder |
| **Status** | ✅ **CLOSED — 2026-08-26 — ACCEPTED WITH ONE DOCUMENTED NON-BLOCKING DEFERMENT** |
| **Closure basis** | Full R1–R9 review against current `Report.tsx`/`report.service.ts`/`analytics.service.ts` source (not assumed from prior reports). R1 (data integrity), R2 (findings integrity), R3 (consumer-voice quality gate — `MIN_VERBATIM_LENGTH=10` filter confirmed in `analytics.service.ts`), R4 (Executive Summary), R5 (Arabic localization of all report-generated content), R7 (methodology/limitations disclosure), R9 (evidence-proportionate recommendation language) — all **RESOLVED**, confirmed directly in source this session. R6 (pagination) — a genuine, previously-unfixed defect was found and fixed this session: the PDF page-slicing loop could dedicate an entire near-blank trailing page to a small content sliver (numerically reproduces the originally reported "page 4 is almost entirely blank" symptom); fixed in `Report.tsx` by dropping a dedicated trailing page below a 20mm-content threshold and ending the true last page's crop at the content's bottom instead. Verified via clean `tsc --noEmit` and a successful `npm run build` on `apps/dashboard`; **exact visual confirmation on a live-rendered PDF with real campaign data was not performed this session** (no live data/browser-render check available) — flagged as the one residual unverified item, not a known defect. R8 (per-study/sector adaptability) is **PARTIALLY SUPPORTED**: the report works correctly for the current standard 5-question survey layout, but `q2`/`q3`/`q5` semantic-role positions are hardcoded (already documented elsewhere as a deferred schema dependency, not built) — this is an explicit **non-blocking deferment**, not a defect, consistent with the project's standing decision not to build a generalized Survey/Report Builder. |
| **What was NOT done** | No report redesign. No new Survey/Report Builder. No new backend aggregation (Segment Insights, Reach, Purchase-Intent-by-Segment remain deferred, untouched). No website work — the report lives in `apps/dashboard`, not a website. |
| **Authority** | Founder (explicit direction 2026-08-26: "review what D-028 still needs and close it so it does not keep appearing") |

---

## COMMERCIAL REPORT + PRODUCT COMPLETION — Bounded Exception (2026-08-24)

### DL-052 — BD-13 Bounded Engineering Exception

| Field | Value |
|---|---|
| **Decision** | Engineering authorized for: consumer app completion/polish, new Executive Consumer Intelligence Report (extend existing), limited client/brand monitoring, small directly-blocking real-pilot fixes only. Full detail in `FOUNDER_DECISIONS.md` and `DECISION_LOG.md` Phase 5. |
| **Authority** | Founder (explicit direction 2026-08-24) |
| **Status** | ✅ AUTHORIZED — 2026-08-24 |

### DL-053 — Report remediation under DL-052

| Field | Value |
|---|---|
| **Decision** | Implemented the three confirmed D-028 issues (see D-028 row above) plus evidence-proportionate recommendation language, as an extension of the existing report implementation. |
| **Status** | ✅ IMPLEMENTED — 2026-08-24; typecheck + build verified on both `apps/api` and `apps/dashboard`; not yet Founder-reviewed |

---

## V1 COMMERCIAL PRODUCT BUILD — Bounded Increment (2026-08-24)

### DL-054 — BD-13 Bounded Engineering Exception

| Field | Value |
|---|---|
| **Decision** | Bounded V1 increment: consumer polish (real gaps only), client campaign-history navigation, report improvement within existing architecture, survey configuration audit. Full detail in `FOUNDER_DECISIONS.md` and `DECISION_LOG.md` Phase 6. |
| **Authority** | Founder (explicit direction 2026-08-24) |
| **Status** | ✅ AUTHORIZED — 2026-08-24 |

### DL-054 outcome

| Field | Value |
|---|---|
| **Implemented** | Client: `?campaignId=` navigation across all 7 dashboard pages, "Other Campaigns" list now clickable (`endpoints.ts`, `Overview.tsx`, `Layout.tsx`, 6 other pages). |
| **Audited, not built** | Consumer — no further gap found beyond prior increments. Report — no further safely-buildable gap beyond DL-053. Survey — rendering confirmed already fully campaign-configurable; analytics q2/q3/q5 role-mapping documented as a deferred schema dependency, not built. |
| **Status** | ✅ PARTIAL IMPLEMENTATION — 2026-08-24; typecheck + build verified on `apps/dashboard` |

---

## PRODUCT COMPLETION — Campaign Operations + Media/Gallery Bounded Exception (2026-08-26)

### DL-055 — BD-13 Bounded Engineering Exception

| Field | Value |
|---|---|
| **Decision** | Engineering authorized for exactly two Tajribti-internal workstreams: (1) Internal Campaign Operations (bounded internal-operations surface, not brand self-service, using only existing campaign domain/API), (2) Campaign-oriented Media/Gallery (Gallery → Campaign → Photos/Videos). Full detail in `FOUNDER_DECISIONS.md` and `DECISION_LOG.md` Phase 7. |
| **Authority** | Founder (explicit direction 2026-08-26) |
| **Status** | ✅ AUTHORIZED — 2026-08-26. **Not yet implemented** — this entry records authorization only; no engineering has started under DL-055. |
| **Explicitly excluded** | Generic Admin/CRM, self-service Survey/Campaign/Report Builder, billing/payments, enterprise RBAC, social feed/marketplace features, website (any form), rewards economics, broad V1 |
| **Not affected by this decision** | D-028 (unchanged, still OPEN — Founder acceptance not assumed), B-01/B-02/B-03/B-04 (unchanged, all OPEN), commercial outreach authorization (unchanged, still NOT AUTHORIZED), MEOS (unchanged, still FROZEN) |

---

## How to close a decision

1. Record the decision with date and owner in `15_Decisions/FOUNDER_DECISIONS.md`
2. Mark it ✅ in this tracker
3. Update `_navigator/DECISION_STATUS_BOARD.md`
4. If it was a blocking item, re-submit to the IERB for re-audit
