# Project Glossary — Tajribti

**Every domain term with its business meaning, technical meaning, and AI-system meaning.**  
Source: Merged from `_ai_bootstrap/PROJECT_GLOSSARY.md` (43 terms) + `08_PRD/MASTER_PRD_v1.0.md` + `09_Technical/TECHNICAL_ARCHITECTURE.md`

---

## Core Platform Terms

### Tajribti (تجربتي)
- **Business:** The platform's provisional working name. Means "my experience" in Arabic. PROVISIONAL — not trademark-cleared.
- **Technical:** Not a technical term — used in codebase identifier prefix `TJ-`.
- **AI:** Always flag as provisional. Never present as a confirmed brand name.
- *Source: `_ai_bootstrap/PROJECT_GLOSSARY.md`*

### Consumer Intelligence Platform
- **Business:** The correct category description for Tajribti. A technology platform that monetizes structured consumer behavioral data collected at the point of first product trial.
- **Technical:** The architectural category — as opposed to a sampling logistics platform.
- **AI:** The ONLY acceptable category label. Never substitute "sampling company," "activation agency," or "field marketing company."
- *Source: `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`*

### B2B2C
- **Business:** Business-to-Business-to-Consumer. Brands are the paying customers (B2B). Consumers are the data source and end-users (B2C). Revenue flows from brands; value flows to consumers.
- **Technical:** Two separate user-facing products — Brand Dashboard (B2B) and Consumer App (B2C) — connected through the core platform.
- **AI:** Always reason about which "side" of the platform a question relates to.
- *Source: `_ai_bootstrap/AI_CONTEXT.md` Section 3*

### Campaign
- **Business:** A brand-initiated product sampling event. A brand pays to distribute a product at specific locations for a defined period. The campaign is the primary unit of value delivery.
- **Technical:** The central domain entity. State machine: DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → PAUSED → COMPLETED → ARCHIVED. UUID v4 primary key.
- **AI:** The Campaign entity is the anchor for most product, operations, and analytics questions.
- *Source: `08_PRD/MASTER_PRD_v1.0.md`; `09_Technical/TECHNICAL_ARCHITECTURE.md`*

### QR Code / QR Redemption
- **Business:** The physical redemption mechanism. A consumer scans a unique QR code at a sampling location to redeem a product and trigger the survey. The moment of QR scan is the data collection trigger.
- **Technical:** QRCode entity. State machine: UNUSED → RESERVED → REDEEMED | VOIDED. Concurrent scan race condition is the highest technical risk in the MVP (TJ-005). Idempotency guard required.
- **AI:** Always flag TJ-005 as highest-risk feature. Never design a QR solution without addressing the concurrency problem.
- *Source: `08_PRD/MASTER_PRD_v1.0.md` TJ-005; `09_Technical/TECHNICAL_ARCHITECTURE.md`*

### Redemption Event
- **Business:** A verified instance of a consumer receiving a product sample. One event = one verified trial = one billable data point. The smallest unit of value.
- **Technical:** `RedemptionEvent` entity. Created atomically at QR scan with idempotency guard. Linked to Consumer, Campaign, Location, QRCode.
- **AI:** Redemption events are the primary revenue-generating unit and the data foundation.
- *Source: `08_PRD/MASTER_PRD_v1.0.md`; `09_Technical/TECHNICAL_ARCHITECTURE.md`*

---

## Business / Strategy Terms

### Track 0
- **Business:** The $15K–$25K, 60-day commercial validation sprint. Zero engineering. Goal: secure ≥3 brand LOIs, confirm LLC, get PDPL opinion. The only currently authorized activity.
- **Technical:** N/A — no engineering happens in Track 0.
- **AI:** Never suggest engineering work during Track 0. If asked about implementation, note that development is blocked until Track 0 GO.
- *Source: `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`; `13_Audits/REMEDIATION_REAUDIT.md`*

### Track 1
- **Business:** The full-build phase. ~24 weeks, ~$90K–$120K (ILLUSTRATIVE). Blocked until B-01 through B-04 are closed and IC issues GO.
- **Technical:** Sprint 0–6, full engineering team, AWS provisioning, MVP build to Production v1.0.
- **AI:** Only discuss Track 1 planning as future state. Do not frame it as current.
- *Source: `02_Project_Management/MASTER_DELIVERY_PLAN.md`*

### LOI (Letter of Intent)
- **Business:** A signed letter from a brand indicating intention to run a pilot campaign. 3 LOIs = kill criterion met. LOIs are non-binding but signal serious interest and validate WTP.
- **Technical:** N/A — pre-engineering commercial document.
- **AI:** The primary Track 0 success metric. Count LOIs explicitly when assessing Track 0 progress.
- *Source: `07_Product/GO_TO_MARKET.md`*

### WTP (Willingness to Pay)
- **Business:** Whether a brand will actually pay real money for Tajribti's consumer intelligence service. The single most critical validation question.
- **Technical:** N/A.
- **AI:** UNVALIDATED. Never assume WTP exists. It is the core Track 0 question.
- *Source: `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`; `15_Decisions/ASSUMPTION_REGISTER.md` A-FIN-01*

### Kill Criterion
- **Business:** The explicit decision rule for project failure: "If we don't get ≥3 brand LOIs in 60 days, we do not start coding." A quantitative, binary trigger.
- **Technical:** N/A.
- **AI:** Must be enforced in any discussion of whether to proceed to engineering.
- *Source: `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`; `07_Product/GO_TO_MARKET.md`*

### First-Party Data
- **Business:** Consumer data collected directly by Tajribti through consented in-person interactions and surveys. Not purchased from third-party data brokers. The quality and exclusivity of this data is the moat.
- **Technical:** All data stored in Tajribti's PostgreSQL database, linked to verified consumer profiles with explicit consent records.
- **AI:** The first-party nature of the data is a key differentiator. Never suggest third-party data as a substitute or supplement during early phases.
- *Source: `10_AI/AI_STRATEGY.md`; `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`*

### Data Flywheel
- **Business:** The compounding advantage where more campaigns → more consumer data → better brand insights → more brand value → more campaign spend → more campaigns. Self-reinforcing growth loop.
- **Technical:** Not an architectural pattern — a business dynamic that depends on data accumulation in PostgreSQL.
- **AI:** The moat is the flywheel. AI assists in extracting value from data; it does not replace data volume as the moat.
- *Source: `10_AI/AI_STRATEGY.md`*

### PDPL (Personal Data Protection Law)
- **Business:** Egypt's personal data protection law (Law No. 151 of 2020). Governs how Tajribti collects, stores, and processes consumer data. PDPL compliance is non-negotiable — it is a blocking item (B-03).
- **Technical:** Drives ADR-04 (soft-delete), consent center feature (TJ-003), data residency choice (cloud region), data minimization in survey design.
- **AI:** Never advise on PDPL compliance without flagging that a written legal opinion from an Egyptian data-privacy lawyer has not yet been obtained (B-03 is open).
- *Source: `09_Technical/TECHNICAL_ARCHITECTURE.md`; `15_Decisions/OPEN_DECISIONS_TRACKER.md` B-03; `02_Project_Management/RISK_REGISTER.md` R-LC-01*

### IERB
- **Business:** The Investment and Evaluation Review Board — the internal committee that conducts readiness audits and issues GO/NO-GO authorizations for development.
- **Technical:** N/A.
- **AI:** IERB score of 67/100 = NOT AUTHORIZED. Never treat the score as a "pass" — the threshold for authorization has not been disclosed in the repository.
- *Source: `13_Audits/REMEDIATION_REAUDIT.md`*

---

## Competitive Landscape Terms

### Samplia
- **Business:** The Spanish reference company (founded 2013, bootstrapped, ~40–50M samples distributed, ~2M registered users). The inspiration for Tajribti. NOT the model to copy — the Egypt model is a redesign for local context.
- **Technical:** N/A — external company.
- **AI:** Samplia is a reference, not a competitor. Never conflate Samplia with Tajribti's positioning.
- *Source: `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`; `_structured_data/statistics.json`*

### Marketeers Research
- **Business:** The nearest direct Egyptian competitor. Egypt/KSA/GCC/Europe footprint. AI-powered "Smart Value™" FMCG analytics. Identified by peer review — not mentioned in original source documents.
- **Technical:** N/A.
- **AI:** ALWAYS acknowledge Marketeers Research when discussing competition. This is not a secondary competitor — it is the primary near-direct competitor.
- *Source: `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` Section 3*

---

## Product / Feature Terms

### Consumer App
- **Business:** The mobile application used by consumers (Mona persona) to discover campaigns, redeem free product samples via QR, complete post-trial surveys, and earn rewards.
- **Technical:** Flutter (cross-platform iOS/Android). RTL-first. Designed for lower-end Android handsets. OTP-only authentication.
- *Source: `08_PRD/MASTER_PRD_v1.0.md`*

### Brand Dashboard
- **Business:** The web application used by brand managers (Ahmed persona) to create campaigns, monitor live redemptions, and access consumer insight analytics.
- **Technical:** React web. Desktop-first. OTP or OAuth2 authentication.
- *Source: `08_PRD/MASTER_PRD_v1.0.md`*

### Admin Portal
- **Business:** Internal-only web application used by Tajribti operations staff (Yasmine persona) to approve campaigns, manage brands, handle support, and monitor platform health.
- **Technical:** React web. Internal access only.
- *Source: `08_PRD/MASTER_PRD_v1.0.md`*

### Mona
- **Business:** Primary consumer persona. 26 years old, Cairo, Android phone user, interested in free products and small rewards, willing to complete short surveys.
- **Technical:** Drives Flutter RTL-first, low-end Android optimization, OTP auth.
- *Source: `08_PRD/MASTER_PRD_v1.0.md` Section 2 — Personas*

### Ahmed (Brand Manager)
- **Business:** Primary brand persona. 34 years old, FMCG brand manager, needs consumer data and campaign performance metrics, desktop work environment.
- **Technical:** Drives React dashboard, desktop-first, campaign analytics features.
- *Source: `08_PRD/MASTER_PRD_v1.0.md` Section 2 — Personas*

### Yasmine (Admin/Ops)
- **Business:** Internal persona. Tajribti operations staff managing brand onboarding, campaign approvals, and field coordination.
- **Technical:** Drives admin portal features, approval workflow.
- *Source: `08_PRD/MASTER_PRD_v1.0.md` Section 2 — Personas*

### Consent Center
- **Business:** The in-app module where consumers explicitly grant and manage data permissions. PDPL-compliance feature. No dark patterns allowed.
- **Technical:** Feature TJ-003. Consent record linked to every consumer profile and every survey response. Soft-delete respects Right to Erasure.
- *Source: `08_PRD/MASTER_PRD_v1.0.md` TJ-003*

### Post-Trial Survey
- **Business:** The 3–5 question survey completed by a consumer immediately after redeeming a product sample. The primary data collection mechanism. <3 min completion time.
- **Technical:** Feature TJ-006. SurveyResponse entity. Linked to RedemptionEvent.
- *Source: `08_PRD/MASTER_PRD_v1.0.md` TJ-006*

---

## Technical Terms

### Modular Monolith
- **Business:** Not a business term — architectural decision. Means the backend is one deployable unit but internally divided into separate business modules (Auth, Campaign, QR, Survey, Analytics, Notification).
- **Technical:** NestJS modular architecture. Chosen over microservices for 2–3 engineer Year-1 team (ADR-01). Modules communicate via SQS (cross-module) or BullMQ (internal queues).
- *Source: `09_Technical/TECHNICAL_ARCHITECTURE.md` ADR-01*

### Soft Delete
- **Business:** When a consumer requests data deletion (PDPL Right to Erasure), their record is marked deleted but not physically removed. Maintains referential integrity while honoring the legal right.
- **Technical:** `deletedAt` timestamp field on ALL entities. Soft-delete middleware on all TypeORM queries. ADR-04.
- *Source: `09_Technical/TECHNICAL_ARCHITECTURE.md` ADR-04*

### Idempotency Guard
- **Business:** Prevents a consumer from redeeming the same QR code twice, even if they scan simultaneously from two devices. The concurrency safety mechanism.
- **Technical:** Database-level unique constraint + application-level check at redemption. Core of TJ-005 risk mitigation.
- *Source: `09_Technical/TECHNICAL_ARCHITECTURE.md`; `08_PRD/MASTER_PRD_v1.0.md` TJ-005*

### OTP (One-Time Password)
- **Business:** The authentication method for consumers. A 6-digit code sent via SMS to a mobile number. No email/password — reduces friction for Egyptian mobile users.
- **Technical:** Passport.js OTP strategy. Redis for OTP session state (5-minute TTL). Rate-limited per phone number.
- *Source: `09_Technical/TECHNICAL_ARCHITECTURE.md`; `08_PRD/MASTER_PRD_v1.0.md` TJ-001*

### AI Gateway
- **Business:** Internal routing layer that directs LLM requests to OpenAI or Anthropic based on task type and cost. No vendor lock-in.
- **Technical:** ADR-07. Managed by Python/FastAPI AI satellite service. Prompt templates stored as versioned files (ADR-08).
- *Source: `09_Technical/TECHNICAL_ARCHITECTURE.md`*

### RTL (Right-to-Left)
- **Business:** Arabic text flows right-to-left. All consumer-facing UI must be designed RTL-first, not adapted from LTR.
- **Technical:** Flutter native RTL support. Bidirectional text handling. Arabic typefaces. Consumer app designed RTL-first — not an afterthought.
- *Source: `08_PRD/MASTER_PRD_v1.0.md` UX-01; `15_Decisions/FOUNDER_DECISIONS.md`*

---

## Financial Terms (ALL ILLUSTRATIVE UNLESS MARKED VALIDATED)

### Campaign Price Range
- **Meaning:** $4,000–$20,000 per campaign.
- **Status:** ILLUSTRATIVE — not validated. Track 0 pricing discovery will produce real numbers.
- *Source: `_ai_bootstrap/AI_CONTEXT.md`; `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`*

### Lean MVP Cost
- **Meaning:** ~$90K–$120K estimated cost to reach Production v1.0.
- **Status:** ILLUSTRATIVE.
- *Source: `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`*

### Blended Gross Margin
- **Meaning:** ~60% projected blended gross margin at scale.
- **Status:** ILLUSTRATIVE.
- *Source: `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`*

### Break-even
- **Meaning:** ~18–24 months to operational break-even.
- **Status:** ILLUSTRATIVE.
- *Source: `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`*
