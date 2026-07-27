# Traceability Index — Every Major Statement to Its Source

**Every major claim in AI_BOOTSTRAP traced to its repository source with confidence level and evidence.**

---

## How to Read This Index

| Field | Meaning |
|---|---|
| **Claim** | The statement made in AI_BOOTSTRAP |
| **Bootstrap File** | Which AI_BOOTSTRAP file makes this claim |
| **Source File(s)** | Repository evidence supporting the claim |
| **Confidence** | HIGH / MEDIUM / LOW |
| **Notes** | Conflicts, caveats, or context |

---

## 1. Project Identity Claims

| Claim | Bootstrap File | Source File(s) | Confidence | Notes |
|---|---|---|---|---|
| Project name is "Tajribti (تجربتي)" | 00, 01, 02 | All 12 inbox Tajribti-prefixed files; `15_Decisions/FOUNDER_DECISIONS.md`; `_structured_data/statistics.json`; `_structured_data/manifest.json` | HIGH | Name is PROVISIONAL — trademark not cleared |
| "Tajribti" means "my experience" in Arabic | 00, 06 | `_ai_bootstrap/PROJECT_GLOSSARY.md` | HIGH | Linguistic fact, not a business decision |
| Platform category = Consumer Intelligence Platform | 00, 01, 02 | `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` Executive Conclusion; `15_Decisions/FOUNDER_DECISIONS.md` BD-01 | HIGH | Constitutional — highest-authority source |
| Business model = B2B2C | 01, 06 | `_ai_bootstrap/AI_CONTEXT.md` Section 3; `15_Decisions/FOUNDER_DECISIONS.md` BD-08 | HIGH | Locked founder decision |
| "Samples app" is the filesystem folder, not the product name | PROJECT_FINGERPRINT | All inbox files consistently use "Tajribti"; `_structured_data/manifest.json`: `"workspace": "Tajribti..."` | HIGH | No document names the product "Samples App" |
| Tajribti is a provisional name | 00, 03, 06 | `15_Decisions/FOUNDER_DECISIONS.md` OD-01; `13_Audits/REMEDIATION_REAUDIT.md` Section C.5; `14_Memory/PROJECT_MEMORY.md` | HIGH | Standard disclaimer exists in all docs |

---

## 2. Authorization Status Claims

| Claim | Bootstrap File | Source File(s) | Confidence | Notes |
|---|---|---|---|---|
| Development NOT authorized | 00, 02, 05 | `13_Audits/REMEDIATION_REAUDIT.md` Section D — "❌ DEVELOPMENT NOT AUTHORIZED"; `13_Audits/READINESS_AUDIT.md` Section 15 — same finding | HIGH | Two independent audit files confirm this |
| IERB score = 67/100 | 00, 02 | `13_Audits/REMEDIATION_REAUDIT.md` Section D — "67 / 100 (was 58)" | HIGH | Primary source is the remediation document |
| Previous score = 58/100 | 02 | `13_Audits/READINESS_AUDIT.md` Section 1 — "58 / 100" | HIGH | Two files agree: READINESS_AUDIT (58) + REMEDIATION_REAUDIT (was 58, now 67) |
| Current activity = Track 0 only | 00, 04, 05 | `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` Investment Parameters; `13_Audits/REMEDIATION_REAUDIT.md` Section B | HIGH | Consistent across IC memo, IC v2.0, remediation |

---

## 3. Blocker Claims

**TRACEABILITY NOTE — BLOCKER ID CONFLICT:**

The labels B-01 through B-04 appear in TWO documents with DIFFERENT meanings:

| ID | READINESS_AUDIT.md (original) | OPEN_DECISIONS_TRACKER.md (current) |
|---|---|---|
| B-01 | Track 0 GO not confirmed | Track 0 GO not confirmed ← same |
| B-02 | Sales/Brand-Partnerships function unfunded | Egyptian LLC incorporation unconfirmed ← DIFFERENT |
| B-03 | Cloud region unresolved | PDPL written legal sign-off not obtained ← DIFFERENT |
| B-04 | No Sprint 0 vendor contract budget line | QR concurrency load test not run ← DIFFERENT |

After remediation, original B-02, B-03, B-04 were CLOSED. The OPEN_DECISIONS_TRACKER.md reassigned B-02/B-03/B-04 to the remaining unresolved issues (originally labeled CF-2, M-01, M-04 in READINESS_AUDIT.md).

**AI_BOOTSTRAP files use the OPEN_DECISIONS_TRACKER.md labeling — which is the current-state authoritative version.**

| Claim | Bootstrap File | Source File(s) | Confidence | Notes |
|---|---|---|---|---|
| B-01 = Track 0 GO decision | 00, 02, 03, 04, 12 | `15_Decisions/OPEN_DECISIONS_TRACKER.md` B-01; `13_Audits/REMEDIATION_REAUDIT.md` open item #1 | HIGH | Consistent across both documents |
| B-02 = Egyptian LLC incorporation | 00, 02, 03, 04, 12 | `15_Decisions/OPEN_DECISIONS_TRACKER.md` B-02; `13_Audits/REMEDIATION_REAUDIT.md` CF-2 (relabeled) | HIGH | Label differs from original audit; meaning is clear |
| B-03 = PDPL legal sign-off | 00, 02, 03, 04, 12 | `15_Decisions/OPEN_DECISIONS_TRACKER.md` B-03; `13_Audits/REMEDIATION_REAUDIT.md` M-01 (relabeled) | HIGH | Same |
| B-04 = QR concurrency load test | 00, 02, 03, 04, 12 | `15_Decisions/OPEN_DECISIONS_TRACKER.md` B-04; `13_Audits/REMEDIATION_REAUDIT.md` M-04 (relabeled); `08_PRD/MASTER_PRD_v1.0.md` TJ-005 | HIGH | Same |

---

## 4. Business Model Claims

| Claim | Bootstrap File | Source File(s) | Confidence | Notes |
|---|---|---|---|---|
| Brands pay campaign fees | 01, 06 | `15_Decisions/FOUNDER_DECISIONS.md` BD-09; `_ai_bootstrap/AI_CONTEXT.md` Section 3 | HIGH | Locked decision |
| Consumers never pay | 01, 06 | `15_Decisions/FOUNDER_DECISIONS.md`; `14_Memory/PROJECT_MEMORY.md` rule #2 | HIGH | Locked decision |
| Revenue streams = 5 (campaign, per-sample, AI dashboard, panel, Enterprise API) | 01, 03 | `15_Decisions/FOUNDER_DECISIONS.md` BD-09 | HIGH | Locked decision |
| Competitive moat = data + brand relationships | 01, 06 | `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` Core Thesis; `10_AI/AI_STRATEGY.md` | HIGH | Repeated across IC v2.0 and AI strategy doc |
| Campaign price = $4K–$20K | 01, 06 | `_ai_bootstrap/AI_CONTEXT.md`; `_structured_data/statistics.json` | HIGH | ILLUSTRATIVE — always qualify |
| All financial figures are ILLUSTRATIVE | 01, 03, 06, 12 | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`; `14_Memory/PROJECT_MEMORY.md`; `_navigator/MEMORY_INDEX.md` | HIGH | Multiple sources confirm this qualifier |

---

## 5. Competitive Claims

| Claim | Bootstrap File | Source File(s) | Confidence | Notes |
|---|---|---|---|---|
| Samplia = reference company | 01, 06 | `15_Decisions/FOUNDER_DECISIONS.md` BD-11; `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` | HIGH | |
| Samplia founded 2013 | 03, 06 | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` (peer review corrected original error of "2018"); `_structured_data/statistics.json` samplia_founded: 2013 | HIGH | Error in original docs — corrected in peer review |
| Samplia is bootstrapped (not VC-backed) | 03, 06 | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`; `14_Memory/PROJECT_MEMORY.md` Verified External Facts | HIGH | Verified from Tracxn |
| Samplia: ~40–50M samples, ~2M users, 300–400+ brands | 06 | `_navigator/MEMORY_INDEX.md`; `14_Memory/PROJECT_MEMORY.md` Verified External Facts | HIGH | Range — not exact figures |
| Marketeers Research = near-direct Egyptian competitor | 01, 03, 06, 11 | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` Section 3; `_navigator/MEMORY_INDEX.md` | HIGH | Added by peer review — not in original source documents |
| Marketeers Research: Egypt/KSA/GCC/Europe, AI-powered, "Smart Value™" | 03, 06 | `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` Section 3 | HIGH | Verified in peer review |
| ~127 global competitors; 12 funded | 06 | `14_Memory/PROJECT_MEMORY.md`; `_navigator/MEMORY_INDEX.md` | HIGH | Per Tracxn — cited in memory files |

---

## 6. Technical Architecture Claims

| Claim | Bootstrap File | Source File(s) | Confidence | Notes |
|---|---|---|---|---|
| Consumer App = Flutter (RTL-first, iOS/Android) | 03, 08 | `15_Decisions/FOUNDER_DECISIONS.md` TD-01; `09_Technical/TECHNICAL_ARCHITECTURE.md` | HIGH | Locked |
| Brand Dashboard = React (desktop-first) | 03, 08 | `15_Decisions/FOUNDER_DECISIONS.md` TD-02 | HIGH | Locked |
| Core API = NestJS modular monolith | 03, 08 | `15_Decisions/FOUNDER_DECISIONS.md` TD-04; `09_Technical/TECHNICAL_ARCHITECTURE.md` ADR-01 | HIGH | Locked — ADR-01 |
| ADR-01: modular monolith over microservices | 03, 07, 08 | `09_Technical/TECHNICAL_ARCHITECTURE.md` ADR-01; `15_Decisions/FOUNDER_DECISIONS.md` | HIGH | |
| ADR-04: soft-delete on ALL entities | 03, 07, 08 | `09_Technical/TECHNICAL_ARCHITECTURE.md` ADR-04 | HIGH | PDPL compliance reason |
| Cloud region = AWS me-south-1 Bahrain (PROVISIONAL) | 03, 08 | `13_Audits/REMEDIATION_REAUDIT.md` Section C.3 — "Provisional decision: AWS me-south-1 (Bahrain)"; `15_Decisions/OPEN_DECISIONS_TRACKER.md` OD-03 | HIGH | Explicitly provisional — pending PDPL |
| QR concurrency = highest technical risk | 05, 07, 08 | `08_PRD/MASTER_PRD_v1.0.md` TJ-005; `13_Audits/READINESS_AUDIT.md` R-03 reference; `02_Project_Management/RISK_REGISTER.md` | HIGH | Consistent across PRD, audit, risk register |
| PostgreSQL (RDS Multi-AZ) + Redis (ElastiCache) + SQS | 03, 08 | `15_Decisions/FOUNDER_DECISIONS.md` TD-06/TD-07/TD-08; `09_Technical/TECHNICAL_ARCHITECTURE.md` | HIGH | |
| LLM = OpenAI + Anthropic multi-provider (ADR-07) | 03, 08 | `09_Technical/TECHNICAL_ARCHITECTURE.md` ADR-07; `15_Decisions/FOUNDER_DECISIONS.md` TD-14 | HIGH | |
| UUID v4 primary keys (ADR-03) | 03, 07, 08 | `09_Technical/TECHNICAL_ARCHITECTURE.md` ADR-03 | HIGH | |
| Cursor-based pagination (ADR-02) | 03, 08 | `09_Technical/TECHNICAL_ARCHITECTURE.md` ADR-02; `13_Audits/REMEDIATION_REAUDIT.md` Section C.4 | HIGH | Confirmed in remediation |
| Integer monetary fields — no float (ADR-05) | 03, 08 | `09_Technical/TECHNICAL_ARCHITECTURE.md` ADR-05 | HIGH | |

---

## 7. Product Claims

| Claim | Bootstrap File | Source File(s) | Confidence | Notes |
|---|---|---|---|---|
| 22 features across 8 epics | 07 | `08_PRD/MASTER_PRD_v1.0.md` Feature Table | HIGH | |
| 3 personas: Mona, Ahmed, Yasmine | 06, 07 | `08_PRD/MASTER_PRD_v1.0.md` Section 2 — Personas | HIGH | |
| TJ-005 = highest risk | 06, 07, 08 | `08_PRD/MASTER_PRD_v1.0.md` TJ-005; `13_Audits/READINESS_AUDIT.md` M-04 / R-03 | HIGH | |
| TJ-018 AI Narratives = V2 only (deferred) | 01, 03, 06 | `08_PRD/MASTER_PRD_v1.0.md` TJ-018 priority=P2; `10_AI/AI_STRATEGY.md`; `15_Decisions/FOUNDER_DECISIONS.md` PD-07 | HIGH | |
| Campaign state machine: DRAFT→PENDING_APPROVAL→APPROVED→ACTIVE→PAUSED→COMPLETED→ARCHIVED | 07 | `08_PRD/MASTER_PRD_v1.0.md` Section 5 State Machines | HIGH | |
| QR Code state: UNUSED→RESERVED→REDEEMED\|VOIDED | 06, 07 | `08_PRD/MASTER_PRD_v1.0.md` Section 5 State Machines | HIGH | |
| 8 core entities | 07 | `08_PRD/MASTER_PRD_v1.0.md` Section 5 Data Model | HIGH | Consumer, Campaign, BrandAccount, BrandUser, RedemptionEvent, SurveyResponse, Location, QRCode |

---

## 8. Delivery / Sprint Claims

| Claim | Bootstrap File | Source File(s) | Confidence | Notes |
|---|---|---|---|---|
| Sprint 0–6 structure (14 weeks post-GO) | 05, 08 | `02_Project_Management/MASTER_DELIVERY_PLAN.md` Section 3 | HIGH | |
| Track 0 budget = $15K–$25K | 00, 02, 04, 05 | `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` Investment Parameters; `13_Audits/REMEDIATION_REAUDIT.md` | HIGH | ILLUSTRATIVE |
| Year-1 team ~10–12 people post-GO | 02 | `02_Project_Management/MASTER_DELIVERY_PLAN.md` Section 6 | HIGH | |
| Kill criterion = <3 brand LOIs in 60 days | 01, 04 | `07_Product/GO_TO_MARKET.md` Kill Criterion; `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` | HIGH | |
| 14 priority brand targets | 04 | `07_Product/GO_TO_MARKET.md` Brand Target List | HIGH | KNOWLEDGE_REPORT says 12 — conflict; GO_TO_MARKET.md is canonical |

---

## 9. Geographic / Sector Claims

| Claim | Bootstrap File | Source File(s) | Confidence | Notes |
|---|---|---|---|---|
| Year 1 = Cairo only | 01, 03 | `15_Decisions/FOUNDER_DECISIONS.md` BD-03/BD-04 | HIGH | Locked |
| Year 2 cities = Alexandria, Giza, New Cairo, 6th October | 01, 03 | `15_Decisions/FOUNDER_DECISIONS.md` BD-04 | HIGH | |
| MENA expansion = only after Egypt unit economics proven | 01, 03 | `15_Decisions/FOUNDER_DECISIONS.md` BD-05/BD-06 | HIGH | Hard gate, not calendar |
| Target sectors = FMCG, beauty, pharma-OTC | 01, 03 | `15_Decisions/FOUNDER_DECISIONS.md` BD-02 | HIGH | Locked |
| Excluded sectors Years 1–3 = healthcare (clinical), insurance, banking, telecom, government, education | 01, 03 | `15_Decisions/FOUNDER_DECISIONS.md` BD-07 | HIGH | |

---

## 10. AI Strategy Claims

| Claim | Bootstrap File | Source File(s) | Confidence | Notes |
|---|---|---|---|---|
| AI = insight delivery, NOT the moat | 01, 03, 06 | `10_AI/AI_STRATEGY.md`; `15_Decisions/FOUNDER_DECISIONS.md` BD-15 | HIGH | |
| RAG / vector DB deferred | 01, 03 | `15_Decisions/FOUNDER_DECISIONS.md` TD-18; `10_AI/AI_STRATEGY.md` | HIGH | |
| Data flywheel = actual competitive dynamic | 06, 07 | `10_AI/AI_STRATEGY.md`; `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` | HIGH | |

---

## Statements With No Direct Source (Derived / Synthesized)

The following statements in AI_BOOTSTRAP are synthesized from multiple sources or are structural descriptions rather than directly quoted facts. They are derived, not invented.

| Statement | Bootstrap File | Basis | Note |
|---|---|---|---|
| "The data accumulation flywheel is the actual competitive moat — not the technology" | 01 | Synthesized from IC v2.0 Core Thesis + AI_STRATEGY.md | Faithful to source intent |
| "Egypt-first, not Egypt-adapted" (core value #5) | 01 | From `01_Project_Overview/PROJECT_OVERVIEW.md` core values section | Direct quote |
| Sprint schedule table | 05 | Derived from `02_Project_Management/MASTER_DELIVERY_PLAN.md` Section 3 | Accurate synthesis |
| Session type loading recipes | 13 | Synthesized from `_ai_bootstrap/LOADING_ORDER.md` + AI_WORKFLOW.md | Structural guidance — not factual claims |
| "Under 2 minutes" for minimum load | 00, 13 | Synthesized — no source document states this exactly | ESTIMATE based on file sizes |
| "~8,000 tokens" for universal minimum | 13 | ESTIMATE — no file quotes exact token counts | Engineering estimate |
