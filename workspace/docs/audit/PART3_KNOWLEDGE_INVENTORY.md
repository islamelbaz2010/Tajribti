# TAJRIBTI REPOSITORY INTELLIGENCE & EVIDENCE AUDIT — PART 3
## Knowledge Inventory

**Source:** Every file read completely. Classifications from content, not filename.

---

## 3.1 FOUNDER DECISIONS (Locked — 46 total)

### Business Decisions (15)
| ID | Decision | Evidence File |
|---|---|---|
| BD-01 | Platform = Consumer Intelligence Platform (NEVER a sampling company) | FOUNDER_DECISIONS.md; IC v2.0; AI_BOOTSTRAP/01 |
| BD-02 | Target market = FMCG, beauty, personal care, pharma-OTC brands in Egypt | FOUNDER_DECISIONS.md |
| BD-03 | Paying customer = Brand marketing/innovation/consumer-insights teams | FOUNDER_DECISIONS.md |
| BD-04 | Year 1 geography = Cairo only | FOUNDER_DECISIONS.md |
| BD-05 | Year 2 geography = Alexandria, Giza, New Cairo, 6th October | FOUNDER_DECISIONS.md |
| BD-06 | GCC expansion only after Egypt unit economics proven (hard gate, not calendar) | FOUNDER_DECISIONS.md |
| BD-07 | Out-of-scope sectors Y1-3 = Healthcare, insurance, banking, telecom, government, education | FOUNDER_DECISIONS.md |
| BD-08 | Pricing philosophy = Brands pay; consumers never pay | FOUNDER_DECISIONS.md |
| BD-09 | Revenue model = Campaign fees + per-sample + AI dashboard + panel access + Enterprise API | FOUNDER_DECISIONS.md |
| BD-10 | Sales motion = Land-and-expand (single campaign → subscription) | FOUNDER_DECISIONS.md |
| BD-11 | Exit option A = Strategic acquisition (NielsenIQ, Kantar, Circana, MENA media group) | FOUNDER_DECISIONS.md |
| BD-12 | Exit option B = Sustained independent regional data-services profitability | FOUNDER_DECISIONS.md |
| BD-13 | Rejected exit = Venture-style forced-exit timeline; Engineering only after written GO | FOUNDER_DECISIONS.md |
| BD-14 | Funding = Capital-efficient, bootstrapped; raise only to hit next milestone | FOUNDER_DECISIONS.md |
| BD-15 | Company structure = Egyptian LLC → convert to JSC as company scales | FOUNDER_DECISIONS.md |

### Product Decisions (7)
| ID | Decision | Evidence File |
|---|---|---|
| PD-01 | Core product = Two-sided platform: consumer app + brand dashboard | FOUNDER_DECISIONS.md |
| PD-02 | MVP scope = Admin dashboard + brand dashboard + consumer app + QR redemption + 3-5 Q survey + basic analytics | FOUNDER_DECISIONS.md; MASTER_PRD_v1.0.md |
| PD-03 | NOT in MVP = Permanent kiosks, owned logistics, e-commerce, paid consumer subscriptions, non-FMCG, GCC features | FOUNDER_DECISIONS.md |
| PD-04 | AI strategy = AI = faster insight delivery (not the moat); use third-party LLMs | FOUNDER_DECISIONS.md; AI_STRATEGY.md |
| PD-05 | Automation scope = Automate operational; NOT brand relationships or campaign strategy | FOUNDER_DECISIONS.md |
| PD-06 | MVP integrations = WhatsApp Business API, Vodafone Cash, InstaPay, CSV export | FOUNDER_DECISIONS.md |
| PD-07 | NOT in MVP integrations = HubSpot/Salesforce, Enterprise API, LLM insight generation | FOUNDER_DECISIONS.md |

### Technology Decisions (13 core, 19 total)
| ID | Decision | Evidence File |
|---|---|---|
| TD-01/ADR-01 | Core API = Modular monolith (NestJS) — NOT microservices before Year 2 | FOUNDER_DECISIONS.md; TECHNICAL_ARCHITECTURE.md |
| TD-02 | Cloud = AWS | FOUNDER_DECISIONS.md |
| TD-03 | Cloud region = Provisionally AWS me-south-1 Bahrain (pending PDPL) | FOUNDER_DECISIONS.md; REMEDIATION_REAUDIT.md |
| TD-07 | Consumer frontend = Flutter (cross-platform, RTL-first) | FOUNDER_DECISIONS.md |
| TD-08 | Brand dashboard = React web (desktop-first) | FOUNDER_DECISIONS.md |
| TD-12 | Primary DB = PostgreSQL (AWS RDS Multi-AZ) | FOUNDER_DECISIONS.md |
| TD-13 | Cache = Redis (ElastiCache) | FOUNDER_DECISIONS.md |
| TD-15 | AI providers = OpenAI + Anthropic (multi-provider, no lock-in) | FOUNDER_DECISIONS.md; ADR-07 |
| TD-18 | RAG/Vector DB = NOT required for V2 — deferred | FOUNDER_DECISIONS.md; AI_STRATEGY.md |
| ADR-02 | Cursor pagination (default 25, max 100, cursor = last-seen UUID + created_at) | DECISION_LOG.md DL-043; REMEDIATION_REAUDIT.md |
| ADR-04 | Soft-delete (deletedAt) for PDPL compliance | TECHNICAL_ARCHITECTURE.md |
| ADR-05 | Integer monetary fields (no float) | TECHNICAL_ARCHITECTURE.md |
| ADR-06 | SQS cross-module events | TECHNICAL_ARCHITECTURE.md |

### UX Decisions (5)
| ID | Decision | Evidence File |
|---|---|---|
| UX-01 | Mobile strategy = Mobile-first and mobile-only for consumers | FOUNDER_DECISIONS.md |
| UX-02 | Brand dashboard = Desktop-web-first | FOUNDER_DECISIONS.md |
| UX-03 | Primary language = Egyptian-dialect Arabic | FOUNDER_DECISIONS.md |
| UX-04 | Secondary language = English (toggle) | FOUNDER_DECISIONS.md |
| UX-05 | Accessibility = RTL-first, lower-end Android support, poor connectivity graceful degradation | FOUNDER_DECISIONS.md |

---

## 3.2 COMMERCIAL DECISIONS

| Decision | Evidence |
|---|---|
| Track 0 budget = $15K-$25K (60 days, zero engineering) — ILLUSTRATIVE | IC_MEMO_v1.0.md; REMEDIATION_REAUDIT.md |
| Kill criterion = ≥3 signed pilot LOIs in 60 days; absolute, cannot be waived | 03_NON_NEGOTIABLE_RULES.md; 05_PROJECT_NORTH_STAR.md |
| 14 named brand targets (Tier 1/2/3) | GO_TO_MARKET.md |
| Brand supply before consumer demand (B2B-first GTM) | GO_TO_MARKET.md; FOUNDER_DECISIONS.md |
| LOI lifecycle tracked via MEOS LOI tab | MEOS_v1_Operational_Handover.md |
| 5-stage sales process documented | 01_Sales_Playbook.md |
| Sales Pack requires 2 patches before client use (PAR defects M-01, M-02) | Production_Acceptance_Review_v1.0.md |

---

## 3.3 ARCHITECTURE DECISIONS (8 ADRs)

| ADR | Decision | Rationale | Status |
|---|---|---|---|
| ADR-01 | Modular monolith | Year-1 team 2-3 engineers; module boundaries designed for extraction | LOCKED |
| ADR-02 | Cursor pagination | Avoids page-drift on live data; scalable | LOCKED |
| ADR-03 | UUID v4 PKs | No sequential ID enumeration; safe public IDs | LOCKED |
| ADR-04 | Soft-delete | PDPL compliance; audit recovery | LOCKED |
| ADR-05 | Integer monetary | No floating-point rounding errors | LOCKED |
| ADR-06 | SQS cross-module events | Fast redemption path; decoupled analytics | LOCKED |
| ADR-07 | Multi-provider LLM | No single-vendor lock-in | LOCKED |
| ADR-08 | Versioned prompt templates | A/B testable; not inline in code | LOCKED |

---

## 3.4 PRODUCT DECISIONS (Features)

| Feature ID | Name | Priority | Risk |
|---|---|---|---|
| TJ-001 | Consumer OTP Registration | P0 | Low |
| TJ-002 | Consumer Profile & Onboarding | P0 | Low |
| TJ-003 | Consent Center (PDPL) | P0 | High — blocked by B-03 |
| TJ-004 | Campaign Discovery Feed | P0 | Medium |
| TJ-005 | QR Code Redemption | P0 | **HIGHEST RISK** — concurrent scan race condition |
| TJ-006 | Post-Trial Survey | P0 | Low |
| TJ-007 | Push Notifications | P0 | Low |
| TJ-008 | Consent & Privacy Center (PDPL right-to-erasure) | P0 | High |
| TJ-009 | Brand Account Management | P0 | Low |
| TJ-010 | Campaign Creation Wizard | P0 | Medium |
| TJ-011 | Consumer Intelligence Reports | P0 | Medium |
| TJ-012 | Live Campaign Monitoring | P0 | Low |
| TJ-013 | Brand Analytics Dashboard | P0 | Low |
| TJ-014 | Admin — Location Management | P0 | Low |
| TJ-015 | Admin — Consumer Support | P1 | Low |
| TJ-016 | Consumer History & Rewards | P1 | Low |
| TJ-017 | Campaign Approvals (Admin) | P0 | Low |
| TJ-018 | AI Insight Narratives | P2 — V2 ONLY | Medium |
| TJ-019 | Gamification & Rewards Engine | P0 | Low |
| TJ-020 | Platform Audit & Logs | P1 | Low |
| TJ-021 | Fraud Detection | P0 (manual) → P1 (automated) | Medium |
| TJ-022 | Admin — Brand Account Admin | P1 | Low |

**Evidence:** MASTER_PRD_v1.0.md, PROJECT_ARCHITECTURE_CONSTITUTION.md

---

## 3.5 BUSINESS ASSUMPTIONS (40 total — 3 validated)

### Validation Status Summary
| Status | Count |
|---|---|
| VALIDATED | 3 |
| UNVALIDATED | 34 |
| IN PROGRESS | 0 |
| DEFERRED | 3 |
| INVALIDATED | 0 |

### Critical Unvalidated Assumptions
| ID | Assumption | Validated By |
|---|---|---|
| A-MKT-01 | Brands willing to pay $4K-$20K/campaign | Track 0 outreach — PENDING |
| A-MKT-02 | FMCG brands have real pain with blind sampling | Track 0 discovery calls — PENDING |
| A-MKT-03 | ≥3 brands will commit to LOI within 60 days | Track 0 execution — PENDING |
| A-MKT-04 | Egyptian consumers participate without cash payment | Track 0 pilot — PENDING |
| A-FIN-01 | Break-even achievable at 18-24 months | Financial modeling — PENDING |
| A-TECH-02 | QR scan processes <1s under concurrent load | Load test — PENDING (B-04) |
| A-TECH-03 | AWS Bahrain satisfies PDPL | Legal opinion — PENDING (B-03) |
| A-LEG-01, 02, 03 | PDPL permits all planned data operations | Legal opinion — PENDING (B-03) |

### Validated Assumptions
| ID | Assumption | Validated | Date |
|---|---|---|---|
| A-TECH-04 | Cursor pagination is superior for live data | ADR-02 decision + rationale | 2026-07-26 |
| A-MKT-07 | Cairo is the right first market | Analysis + decision BD-04 | 2026-07-26 |
| A-TECH-08 | AWS RDS Multi-AZ provides adequate reliability | AWS documentation | 2026-07-26 |

**Evidence:** ASSUMPTION_REGISTER.md

---

## 3.6 OPEN QUESTIONS (No Answer in Any Repository Document)

| # | Question | Source |
|---|---|---|
| OQ-01 | Has any Egyptian competitor implemented app-based PHYSICAL sampling specifically? | PEER_REVIEW_MASTER_REPORT.md; MASTER_PROJECT_MEMORY.md |
| OQ-02 | What is the minimum panel size for statistically meaningful segment-level reports? | MASTER_PROJECT_MEMORY.md; KNOWLEDGE_REPORT.md |
| OQ-03 | What is the actual FMCG brand sampling/research budget in Egypt? ($4K-$20K is illustrative) | MASTER_PROJECT_MEMORY.md |
| OQ-04 | What are the actual unit economics (CAC, LTV, contribution margin)? | KNOWLEDGE_REPORT.md |
| OQ-05 | Have any brand or consumer prospects been interviewed? (No — zero conducted) | MASTER_PROJECT_MEMORY.md |
| OQ-06 | What is Tajribti's specific PDPL legal exposure? | MASTER_PROJECT_MEMORY.md |
| OQ-07 | What survey question templates apply per product category (FMCG vs. pharma vs. beauty)? | MASTER_PRD_v1.0.md (open question #1) |
| OQ-08 | Maximum campaigns per consumer per month (anti-fatigue rule)? | MASTER_PRD_v1.0.md (open question #2) |
| OQ-09 | Final reward value calibration in EGP? | MASTER_PRD_v1.0.md (open question #3) |
| OQ-10 | Persona 3 (Yasmine) — mobile vs. desktop for admin portal? | MASTER_PRD_v1.0.md (open question #4) |

---

## 3.7 CONTRADICTIONS IDENTIFIED IN REPOSITORY

| # | Contradiction | Files Involved | Severity |
|---|---|---|---|
| CON-01 (=CONFLICT-001) | B-02, B-03, B-04 IDs have completely different meanings in READINESS_AUDIT.md vs. OPEN_DECISIONS_TRACKER.md | READINESS_AUDIT.md vs. OPEN_DECISIONS_TRACKER.md | HIGH — same IDs, different content |
| CON-02 (=CONFLICT-002) | Authority chain position of REMEDIATION_REAUDIT.md is inconsistent across documents | Various | MEDIUM |
| CON-03 | PAR M-01 states income segment is MISSING from PDPL_Lawyer_Brief.md — but the file DOES include income segment | Production_Acceptance_Review_v1.0.md vs. PDPL_Lawyer_Brief.md | MEDIUM — version discrepancy or patch applied before PAR |
| CON-04 | Early documents claim "no direct Egyptian competitor" — PEER_REVIEW confirms Marketeers Research IS a near-direct competitor | IC_REPORT_TEMPLATE.md vs. PEER_REVIEW_MASTER_REPORT.md | RESOLVED in corrections but some old documents still contain incorrect claim |
| CON-05 | STATISTICS_REPORT.md quality score is 84/100 but FINAL_QUALITY_SCORE.md is 91/100 | STATISTICS_REPORT.md vs. FINAL_QUALITY_SCORE.md | LOW — different assessment dates (84 = pre-v2.0 audit; 91 = post-v2.0) |
| CON-06 | SOURCE_OF_TRUTH.md references SUPERSEDED_DOCUMENTS.md at `workspace/00_Source_of_Truth/SUPERSEDED_DOCUMENTS.md` but file is actually at `workspace/18_Archive/SUPERSEDED_DOCUMENTS.md` | SOURCE_OF_TRUTH.md vs. actual file path | MEDIUM — broken reference |

---

## 3.8 DEPENDENCIES BETWEEN DOCUMENTS

### Authority Chain (Top-Down)
```
FOUNDER_DECISIONS.md (constitutional)
    ↓ governs
INVESTMENT_DUE_DILIGENCE_REPORT_v2.md (investment thesis)
    ↓ informed
MASTER_PRD_v1.0.md (product authority)
TECHNICAL_ARCHITECTURE.md (technical authority)
MASTER_DELIVERY_PLAN.md (delivery authority)
    ↓ audited by
READINESS_AUDIT.md → REMEDIATION_REAUDIT.md (authorization gate)
```

### Track 0 Commercial Chain
```
GO_TO_MARKET.md → 01_Sales_Playbook.md → MEOS_v1_Track0.xlsx
    ↓ supported by
02_Brand_OnePager.md + 03_LOI_Template.md
    ↓ governed by
Egyptian_LLC_Checklist.md + PDPL_Lawyer_Brief.md
```

### AI Session Loading Chain
```
00_FOUNDER_INTENT/ (6 files) → AI_BOOTSTRAP/ (21 files)
    → _ai_bootstrap/ (8 files, pre-Bootstrap layer)
```

---

## 3.9 UNIQUE KNOWLEDGE — CANNOT BE DERIVED FROM OTHER FILES

| Knowledge Item | Only Source |
|---|---|
| Project genesis — Arabic video watched in Madrid | SOURCE_VIDEO_TRANSCRIPT.md |
| Samplia founding year (2013, not 2018/2019), founders' names, bootstrapped | PEER_REVIEW_MASTER_REPORT.md |
| Marketeers Research confirmed as near-direct competitor | PEER_REVIEW_MASTER_REPORT.md |
| Specific blocker closure evidence standards ("what proves it closed") | OPEN_DECISIONS_TRACKER.md |
| PAR defects M-01, M-02 (Sales Pack quality issues) | Production_Acceptance_Review_v1.0.md |
| LOI Tab Column I = dropdown not date (MEOS) | MEOS_v1_Operational_Handover.md |
| 9 MEOS patches from v1.0 to v1.0.1 | MEOS_v1_Release_Notes.md |
| 6 open MEOS operational blockers at handover | MEOS_v1_Sprint_Completion_Report.md |
| CONFLICT-001 and CONFLICT-002 explicitly documented | AI_BOOTSTRAP/BOOTSTRAP_FREEZE_REPORT.md |
| 14 inbox source document names, formats, word counts | _navigator/DOCUMENT_INDEX.md |
| 25 CAD decisions with product boundary definitions | docs/governance/PROJECT_ARCHITECTURE_CONSTITUTION.md |
| The Single Accountability Question framing | 00_FOUNDER_INTENT/06_FOUNDER_ALIGNMENT_GATE.md |
| Full chatgpt chat session from July 27 | `inbox/chatgpt chat till 27-7.docx` (UNPROCESSED — content unknown) |

---

*Next: Part 4 — Founder Alignment Report*
