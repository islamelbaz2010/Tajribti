# Domain Model — Tajribti

**The business domain: actors, capabilities, processes, entities, and relationships. Everything derived from source documents — no invention.**

Source files: `08_PRD/MASTER_PRD_v1.0.md`, `09_Technical/TECHNICAL_ARCHITECTURE.md`, `06_Enterprise_Architecture/ENTERPRISE_ARCHITECTURE.md`, `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`

---

## Actors (Who interacts with the platform)

| Actor | Type | Description | Source |
|---|---|---|---|
| Consumer | External user | Receives free product sample; completes post-trial survey; earns rewards. Persona: Mona (26, Cairo, Android). | PRD Section 2 |
| Brand | External paying customer | Pays for campaign; receives structured consumer insight data. Persona: Ahmed (34, FMCG brand manager). | PRD Section 2 |
| Tajribti Admin/Ops | Internal | Approves campaigns; manages brands; monitors platform health; coordinates field ops. Persona: Yasmine. | PRD Section 2 |
| Field Coordinator | Internal (contracted) | Manages physical sampling events; hands out products; ensures QR scan compliance. | MASTER_DELIVERY_PLAN Section 6 |
| IC (Investment Committee) | Governance | Authorizes GO/NO-GO for each development phase. External — not a platform user. | IC_MEMO_v1.0 |
| IERB | Governance | Conducts readiness audits and issues authorization scores. External. | REMEDIATION_REAUDIT |
| Legal Counsel | External advisor | Egyptian data-privacy lawyer (not yet engaged). Reviews PDPL compliance design. | OPEN_DECISIONS_TRACKER B-03 |

---

## Core Capabilities

| Capability | What it enables | Products involved |
|---|---|---|
| Consumer Acquisition | Attract consumers to sampling events via app | Consumer App |
| Identity Verification | Verify consumer is a unique individual (OTP + profile) | Consumer App, Core API |
| Campaign Management | Brands create, configure, launch, and monitor sampling campaigns | Brand Dashboard, Admin Portal, Core API |
| Physical Redemption | QR-based verification of product receipt at point of trial | Consumer App, Core API |
| Data Collection | Capture demographic profile + post-trial survey responses | Consumer App, Core API |
| Consent Management | Obtain, record, and respect consumer data consent (PDPL) | Consumer App, Core API |
| Brand Intelligence | Transform raw survey data into structured insight reports | Brand Dashboard, Core API, AI Service |
| Fraud Prevention | Detect and block duplicate/fraudulent redemptions | Core API (TJ-021) |
| Reward Distribution | Issue points/rewards to consumers on verified redemption | Consumer App, Core API (TJ-019) |
| Admin Operations | Campaign approval, brand management, platform monitoring | Admin Portal, Core API |

*Source: `06_Enterprise_Architecture/ENTERPRISE_ARCHITECTURE.md` — Capability Model*

---

## Business Processes (End-to-End)

### Process 1: Brand Campaign Lifecycle

```
Brand → submits campaign brief (via Brand Dashboard)
     → Admin reviews & approves (via Admin Portal)
     → Platform configures QR codes + locations
     → Campaign goes ACTIVE
     → Field Coordinators set up pop-up event
     → Consumers discover campaign (via Consumer App feed)
     → Consumers redeem QR code (physical scan)
     → Platform records RedemptionEvent
     → Consumer completes post-trial survey
     → Platform stores SurveyResponse
     → Campaign ends → data aggregated
     → Brand receives insight report (via Brand Dashboard)
     → Tajribti invoices brand
```

*Source: `08_PRD/MASTER_PRD_v1.0.md`; `06_Enterprise_Architecture/ENTERPRISE_ARCHITECTURE.md`*

### Process 2: Consumer Journey

```
Consumer discovers Tajribti (app store / word of mouth)
     → Downloads Consumer App
     → Registers via OTP (phone number)
     → Completes onboarding profile (demographics — age, gender, location, interests)
     → Grants data consent (Consent Center TJ-003)
     → Browses available campaigns in home feed
     → Travels to campaign location
     → Scans QR code at location
     → QR validated → product received
     → Completes 3–5 question post-trial survey (<3 min)
     → Earns reward points
     → Returns for next campaign
```

*Source: `08_PRD/MASTER_PRD_v1.0.md` User Journey section*

### Process 3: Data Value Creation

```
Raw input: Consumer demographic profile
         + Post-trial survey responses (TJ-006)
         + Redemption metadata (location, time, product, quantity)
         + Behavioral signals (repeat redemptions, completion rate)

Processing: Aggregation + statistical analysis
          + AI insight narrative generation (TJ-018 — V2 only)
          + Segment analysis (demographic cuts)

Output: Brand report = purchase intent % + demographic breakdown
                     + geographic heatmap + satisfaction scores
                     + open-ended response themes
```

*Source: `10_AI/AI_STRATEGY.md`; `08_PRD/MASTER_PRD_v1.0.md`*

---

## Core Entities

| Entity | Description | Key Attributes | State Machine |
|---|---|---|---|
| Consumer | Platform user who receives samples | id (UUID), phone, demographics, consentStatus | (none — status driven by consent) |
| BrandAccount | A brand organization on the platform | id (UUID), name, industry, billingInfo | ACTIVE / SUSPENDED / INACTIVE |
| BrandUser | Individual user within a BrandAccount | id (UUID), brandAccountId, role, email | ACTIVE / SUSPENDED |
| Campaign | A brand's sampling event | id (UUID), brandAccountId, title, status, startDate, endDate, targetCount | DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → PAUSED → COMPLETED → ARCHIVED |
| Location | Physical venue for a campaign pop-up event | id (UUID), campaignId, address, coordinates | ACTIVE / INACTIVE |
| QRCode | Unique scannable token for one redemption | id (UUID), campaignId, locationId, status | UNUSED → RESERVED → REDEEMED | VOIDED |
| RedemptionEvent | Verified record of a consumer receiving a sample | id (UUID), consumerId, campaignId, qrCodeId, locationId, redeemedAt | (immutable — append-only) |
| SurveyResponse | Consumer's answers to post-trial survey | id (UUID), consumerId, redemptionEventId, responses (JSONB) | (immutable — append-only) |

*Source: `08_PRD/MASTER_PRD_v1.0.md` Section 5 — Data Model; `09_Technical/TECHNICAL_ARCHITECTURE.md`*

---

## Entity Relationships

```
BrandAccount ──(has many)──► BrandUser
BrandAccount ──(has many)──► Campaign
Campaign ──(has many)──► Location
Campaign ──(has many)──► QRCode
Consumer ──(has many)──► RedemptionEvent
RedemptionEvent ──(belongs to)──► Consumer
RedemptionEvent ──(belongs to)──► Campaign
RedemptionEvent ──(belongs to)──► QRCode
RedemptionEvent ──(belongs to)──► Location
RedemptionEvent ──(has one)──► SurveyResponse
SurveyResponse ──(belongs to)──► RedemptionEvent
SurveyResponse ──(belongs to)──► Consumer
```

*Source: `08_PRD/MASTER_PRD_v1.0.md` Section 5 — Data Model*

---

## Campaign State Machine

```
DRAFT
  │ (brand submits for approval)
  ▼
PENDING_APPROVAL
  │ (admin approves)              (admin rejects → back to DRAFT)
  ▼
APPROVED
  │ (campaign start date reached or admin activates)
  ▼
ACTIVE ◄──── PAUSED
  │               │
  │ (pause)       │ (resume)
  │               │
  └───────────────►
  │
  │ (end date reached or target count reached)
  ▼
COMPLETED
  │ (after reporting cycle)
  ▼
ARCHIVED
```

*Source: `08_PRD/MASTER_PRD_v1.0.md` Section 5 — State Machines*

---

## QR Code State Machine

```
UNUSED
  │ (consumer begins scan / reservation window opens)
  ▼
RESERVED (TTL: 5 minutes — race condition prevention)
  │                          │
  │ (consumer completes scan + survey)    │ (TTL expires without completion)
  ▼                          ▼
REDEEMED                  back to UNUSED
     OR
VOIDED (admin action)
```

*Source: `08_PRD/MASTER_PRD_v1.0.md` Section 5 — State Machines*

---

## Platform Boundary

| Inside Tajribti | Outside Tajribti |
|---|---|
| Consumer identity, profile, consent | Product logistics ownership |
| QR redemption verification | Physical product manufacturing |
| Post-trial survey and response storage | Brand's internal CRM systems |
| Consumer insight analytics and reports | Third-party market research methodologies |
| Reward points ledger | Payment processing (consumer side — no charge to consumer) |
| Campaign creation and management | Field staff employment (contracted, not employed) |

*Source: `01_Project_Overview/PROJECT_OVERVIEW.md`; `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`*
