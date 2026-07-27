# Master Product Requirements Document (PRD) v1.0

**Title:** Master Product Requirements Document v1.0  
**Original Filename:** B 3-Tajribti_Master_PRD_v1.0.docx  
**Original Location:** inbox/  
**Category:** PRD / Product  
**Version:** 1.0  
**Word Count:** ~3,691  
**Keywords:** PRD, product requirements, features, user stories, consumer app, brand dashboard, admin portal, MVP, personas, permissions  

---

## Summary

The Master PRD defines all product requirements for Tajribti MVP and V1. Covers 3 products (Consumer App, Brand Dashboard, Admin Portal), 22 features, 3 user personas, a permissions matrix, full data model, and a feature specification framework with depth calibrated to build readiness.

---

## Phase 1 — Product Ecosystem

### Products

| Product | Description | Primary User |
|---|---|---|
| Consumer App | Mobile app for sample discovery, redemption, and feedback | Egyptian consumer (data source) |
| Brand Dashboard | Web platform for campaign management and insight delivery | Brand marketing team (paying customer) |
| Admin Portal | Internal tool for Ops/CS configuration and management | Tajribti employees |

### MVP Integrations

| Integration | Purpose | Status |
|---|---|---|
| WhatsApp Business API | Campaign and reward notifications | MVP |
| Vodafone Cash / InstaPay | Reward disbursement | MVP |
| Payment/invoicing | Brand billing (manual in MVP) | MVP (manual) |
| CSV export | Brand-side data export | MVP |
| HubSpot/Salesforce | Enterprise CRM | NOT MVP |
| Enterprise API | Large-account data integration | NOT MVP |
| Third-party LLM insight generation | AI narratives | NOT MVP |

---

## Phase 2 — User Personas

### Persona 1 — "Mona" (Consumer)

| Field | Detail |
|---|---|
| Profile | 26, Cairo, marketing coordinator, active on Instagram/TikTok, mid-range Android |
| Goals | Discover new products for free; feel like early adopter; get occasional real rewards |
| Pain Points | Distrusts "free stuff" offers; hates long surveys; worried about spam or hidden costs |
| Success Criteria | Completes campaign redemption + survey in under 3 minutes; returns within 30 days |

### Persona 2 — "Ahmed" (Brand Marketing Manager)

| Field | Detail |
|---|---|
| Profile | 34, mid-size Egyptian FMCG brand, manages 3–5 product launches/year, reports to Marketing Director |
| Goals | Prove new product resonates before full national launch; get data fast for go/no-go decision |
| Pain Points | Traditional research too slow; sampling today unmeasured; needs defensible ROI story |
| Success Criteria | Receives usable campaign report within days of campaign close; renews for next launch |

### Persona 3 — "Yasmine" (Internal Ops Admin)

| Field | Detail |
|---|---|
| Profile | Tajribti employee, manages campaign setup and field fulfillment across all active brand accounts |
| Goals | Get every campaign live on schedule with zero fulfillment errors |
| Pain Points | Manual QR/location assignment error-prone at scale; needs fraud visibility without dedicated data-science tool |
| Success Criteria | Campaign fulfillment SLA (48–72 hrs) met on 95%+ of campaigns |

---

## Phase 3 — Feature Inventory (22 Features)

### Consumer App

| ID | Feature | Priority | Description |
|---|---|---|---|
| 1 | Phone OTP Registration/Login | P0 | Frictionless, trusted entry for Egyptian consumers |
| 2 | Consumer Profile Setup | P0 | Capture age/gender/city/interests for campaign targeting |
| 3 | Campaign Discovery (list/map) | P0 | Surface nearby active campaigns |
| 4 | Push Notification — New Campaign | P0 | Drive visits to active campaign locations |
| 5 | QR Redemption | P0 | Verify physical presence and issue the sample |
| 6 | Post-Trial Survey (3–5 questions) | P0 | Capture structured feedback within minutes of trial |
| 7 | In-App Consumer Support | P0 | Resolve redemption/reward issues without phone support |
| 8 | Consent & Privacy Center (view/delete data) | P0 | PDPL compliance; FDD non-negotiable |
| 9 | Rewards Wallet (points/cashback/coupons) | P1 | Sustain retention beyond first campaign |
| 10 | Referral Program | P1 | Lower consumer CAC via peer invites |
| 11 | Interest-Based Communities | P2 | Higher-frequency engagement, resellable panels |

### Brand Dashboard

| ID | Feature | Priority | Description |
|---|---|---|---|
| 12 | Brand Account Onboarding (Sales-assisted) | P0 | Get a signed brand live on the platform |
| 13 | Campaign Creation Wizard | P0 | Define product, segment, locations, dates, survey questions |
| 14 | Live Campaign Monitoring | P0 | Real-time redemption/survey-completion visibility |
| 15 | Basic Analytics Report + CSV Export | P0 | Demographic and response breakdowns brands can act on |
| 16 | Brand User Management | P0 | Brand Admin invites/removes Brand Viewers |
| 17 | Contract & Invoice View | P1 | Transparency on billing without a support ticket |
| 18 | AI Insight Narratives | P2 | Turn raw data into plain-language recommendation |
| 19 | Enterprise API / CRM Connector | P2 | Enable large-account data integration |

### Admin Portal (Internal)

| ID | Feature | Priority | Description |
|---|---|---|---|
| 20 | Campaign Configuration & Approval | P0 | Ops sets up locations, field staff, QR batches |
| 21 | Fraud/Anomaly Review Queue | P0 (manual) / P1 (automated) | Protect data quality before it reaches brand report |
| 22 | Support Ticket Management | P0 | Internal view/resolution of all consumer and brand tickets |

**Priority key:** P0 = MVP critical path | P1 = V1 release | P2 = V1.5+ / future

---

## Phase 4 — Full Specification (10 P0 Features)

Full 12-field specification provided in Master PRD for:
- TJ-001: OTP Registration/Login
- TJ-002: Consumer Profile Setup
- TJ-004: Push Notification — New Campaign
- TJ-005: QR Redemption *(highest technical risk — concurrency)*
- TJ-006: Post-Trial Survey
- TJ-008: Consent & Privacy Center
- TJ-012: Brand Account Onboarding
- TJ-013: Campaign Creation Wizard
- TJ-014: Live Campaign Monitoring
- TJ-015: Basic Analytics Report + CSV Export

*Remaining 12 features are groomed to full 20-field detail one sprint before build — per FDD Budget Philosophy.*

---

## Phase 5 — Data Model Summary

### Core Entities

| Entity | Key Attributes |
|---|---|
| Consumer | UUID, phone, profile, consent_status, deleted_at (soft-delete) |
| Campaign | UUID, brand_id, status (state machine), start_date, end_date, survey_template |
| BrandAccount | UUID, name, tier, status, deleted_at (soft-delete) |
| BrandUser | UUID, brand_account_id, role (Admin/Viewer) |
| RedemptionEvent | UUID, consumer_id, campaign_id, qr_code, location, timestamp — never hard-deleted, only anonymized |
| SurveyResponse | UUID, redemption_id, answers_json, created_at — never hard-deleted, only anonymized |
| Location | UUID, campaign_id, address, coordinates, field_staff_id |
| QRCode | UUID, campaign_id, location_id, status (unused/redeemed/voided) |

### Engineering Conventions

- Primary keys: UUID v4 (avoids sequential-ID enumeration)
- Every entity has created_at, updated_at (UTC timestamptz)
- Soft-delete (deleted_at) on Consumer, Campaign, BrandAccount
- All monetary fields stored as integers (smallest currency unit — avoids float rounding)
- Campaign.status enforced via CHECK constraint (state machine at DB level)
- Foreign keys ON DELETE RESTRICT by default

---

## Phase 6 — State Machines

### Campaign Status States
`DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → PAUSED → COMPLETED → ARCHIVED`

### QR Code States
`UNUSED → RESERVED → REDEEMED | VOIDED`

---

## Phase 7 — Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Campaign discovery feed <500ms P95 |
| Availability | 99.5% uptime for consumer app (MVP) |
| QR Redemption | Idempotent — duplicate scan must not issue second sample |
| Survey completion | Target <3 minutes total consumer time |
| Data privacy | PDPL-compliant — self-service deletion, minimum data collection |
| Fraud detection | Manual review queue in MVP; automated model in V1.5 |
| Localization | RTL-first, Arabic-first, lower-end Android support |

---

## Open Questions (PRD Level)

1. Final survey question templates per product category (FMCG vs. pharma vs. beauty)
2. Maximum campaigns per consumer per month (anti-fatigue rule)
3. Reward value calibration for Egypt (EGP equivalent of sample value)
4. Whether Persona 3 (Ops Admin) has a separate mobile view or desktop-only

---

## Related Documents

- [[FDD]] → `15_Decisions/FOUNDER_DECISIONS.md`
- [[Technical Architecture]] → `09_Technical/TECHNICAL_ARCHITECTURE.md`
- [[Master Delivery Plan]] → `02_Project_Management/MASTER_DELIVERY_PLAN.md`
- [[Readiness Audit]] → `13_Audits/READINESS_AUDIT.md`
