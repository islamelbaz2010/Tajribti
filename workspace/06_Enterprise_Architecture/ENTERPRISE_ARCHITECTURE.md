# Enterprise Architecture — Tajribti Platform

**Original Source:** Extracted from B 4-Tajribti_Technical_Architecture_v1.0.docx + B 2.5-FDD + B 3-PRD  
**Category:** Enterprise Architecture  
**Keywords:** EA, capabilities, domains, technology, integration, security, scalability, TOGAF  

---

## Summary

Enterprise Architecture view of the Tajribti platform across Business, Data, Application, and Technology domains. Designed for a 2–3 engineer Year-1 team with a clear extraction path to microservices as the platform scales.

---

## EA Domain Map

| Domain | Layer | Key Elements |
|---|---|---|
| Business | Strategy | Consumer Intelligence Platform; B2B2C; Land-and-expand |
| Business | Processes | Campaign lifecycle; Consumer journey; Brand reporting |
| Business | Capabilities | Campaign management; Consumer data collection; Analytics; Fraud detection |
| Data | Entities | Consumer, Campaign, BrandAccount, RedemptionEvent, SurveyResponse, QRCode, Location |
| Data | Governance | PDPL compliance; Minimum data collection; Consent management; Self-service deletion |
| Application | Core API | NestJS modular monolith — Auth, Campaign, Fulfillment, Survey, Analytics, Notification, Support modules |
| Application | Consumer | Flutter mobile app (iOS + Android) |
| Application | Brand | React web dashboard (desktop-first) |
| Application | Admin | React web portal (internal Ops) |
| Application | AI Service | Python FastAPI satellite — LLM routing, prompt management, insight generation |
| Technology | Cloud | AWS ECS (multi-AZ, autoscaled, ECS rolling deploy) |
| Technology | Data | PostgreSQL (RDS Multi-AZ) + Redis (ElastiCache) + SQS |
| Technology | IaC | Terraform — infrastructure reviewed via PR |
| Technology | Observability | Health-check-gated rollbacks; quarterly restore drills |

---

## Business Capabilities Model

### Core Capabilities (MVP)

| Capability | Sub-capabilities | Tech owner |
|---|---|---|
| Consumer Acquisition | App onboarding, OTP authentication, campaign discovery, push notifications | Consumer App / Auth Module |
| Physical Redemption | QR generation, location assignment, field redemption, fraud detection | Fulfillment Module |
| Data Collection | Post-trial survey, demographic capture, consent management, data deletion | Survey Module |
| Brand Intelligence | Campaign analytics, CSV export, demographic breakdown | Analytics Module |
| Campaign Operations | Campaign creation wizard, admin approval, live monitoring | Campaign Module + Admin Portal |
| Brand Relationship Management | Account onboarding, user management, invoice view | Brand Dashboard |

### V1 Capabilities (Post-MVP)

| Capability | Status |
|---|---|
| Rewards Engine | Rewards wallet, cashback, coupons |
| Referral System | Consumer peer invites |
| AI Insight Narratives | LLM-powered plain-language recommendations |
| Fraud Automation | ML-based anomaly detection (MVP has manual queue) |

### V2+ Capabilities (Future)

| Capability | Status |
|---|---|
| Consumer Panel Marketplace | Sell access to defined demographic/interest segments |
| Enterprise API | CRM/data-warehouse integration for large accounts |
| Retail Media | Sponsored placement within app and physical sites |
| Gamification | Engagement layer on consumer side |
| Conversational Analytics | "Ask your data" — RAG + embeddings (only if validated need) |

---

## Application Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                PRESENTATION LAYER               │
│  Flutter Mobile App   │  React Web (Brand/Admin) │
└───────────────┬─────────────────────────────────┘
                │ HTTPS / REST (/api/v1/...)
┌───────────────▼─────────────────────────────────┐
│              API/APPLICATION LAYER               │
│  NestJS Controllers + Guards + CASL             │
│  (request validation, response shaping)         │
└───────────────┬─────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────┐
│            DOMAIN/BUSINESS LOGIC LAYER          │
│  Auth │ Campaign │ Fulfillment │ Survey          │
│  Analytics │ Notification │ Support             │
│  (state machines, validation rules, PRD rules)  │
└───────────────┬─────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────┐
│              DATA ACCESS LAYER                  │
│  TypeORM repositories — no business logic here  │
└───────────────┬─────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────┐
│            INFRASTRUCTURE LAYER                 │
│  PostgreSQL │ Redis │ SQS │ External APIs       │
└─────────────────────────────────────────────────┘

                    ← Cross-module event bus →
        [Fulfillment Module] ──SQS──► [Analytics Module]
        [Survey Module]      ──SQS──► [Notification Module]
```

---

## Integration Architecture

### Internal Integrations (MVP)

| Integration | Protocol | Direction | Purpose |
|---|---|---|---|
| NestJS ↔ PostgreSQL | TypeORM | Bi-directional | Primary data store |
| NestJS ↔ Redis | Redis client | Bi-directional | Cache + BullMQ + rate limiting |
| NestJS ↔ SQS | AWS SDK | Event-driven | Cross-module async events |
| NestJS ↔ Python AI Service | HTTP | NestJS → AI | Insight generation requests |

### External Integrations (MVP)

| Integration | API | Purpose | Status |
|---|---|---|---|
| SMS/OTP provider | REST | Consumer OTP delivery | Vendor TBD |
| WhatsApp Business API | Meta BSP | Campaign + reward notifications | Vendor TBD |
| Vodafone Cash / InstaPay | Payment API | Consumer reward disbursement | MVP |
| OpenAI | REST | LLM insight generation | V2 |
| Anthropic | REST | LLM insight generation (multi-provider) | V2 |

### Deferred Integrations (V1/V2)

| Integration | Timing |
|---|---|
| HubSpot / Salesforce CRM | V1 (enterprise clients) |
| Enterprise API / webhook | V2 |
| Retail Media marketplace | V2 |

---

## Security Architecture

| Domain | Control | Implementation |
|---|---|---|
| Data at rest | Encryption | AWS RDS + S3 encryption |
| Data in transit | TLS 1.2+ | All endpoints HTTPS |
| Authentication | OTP + JWT + OAuth2 | Passport.js strategies |
| Authorization | ABAC | NestJS Guards + CASL, mapped to PRD Permissions Matrix |
| Rate limiting | Per-endpoint | Redis-backed counters |
| Data minimization | Schema-level | NOT NULL on required fields only; no speculative data collection |
| Consumer deletion | Self-service | Feature TJ-008; anonymization (not hard-delete) within 30 days |
| Audit trail | AuditLog entity | All data mutations logged; never deleted |
| Fraud detection | MVP: manual queue; V1.5: automated ML | Admin Portal Feature TJ-021 |

---

## Scalability Architecture

| Principle | Implementation |
|---|---|
| Stateless services | NestJS containers on ECS — no in-memory state |
| Horizontal autoscaling | ECS autoscale on CPU/memory targets |
| Queue-based decoupling | SQS between Fulfillment/Survey and Analytics/Notification |
| Cache invalidation | Event-driven (not purely TTL) — on SQS events |
| Partition-ready | SurveyResponse + AuditLog schema-ready for monthly range partitions |
| Design target | 10× current volume at all times — not hypothetical global scale |

---

## Technology Choices — Rationale Summary

| Choice | Why |
|---|---|
| NestJS over Express | Built-in DI, Guards, decorators, TypeORM integration — reduces boilerplate for a small team |
| NestJS over Spring Boot | Team is TypeScript/JS first; shared type system with frontend |
| Flutter | Single codebase iOS + Android; Arabic RTL support; good lower-end Android performance |
| PostgreSQL over MongoDB | ACID compliance; relational data model matches the entities; CHECK constraints for state machine enforcement |
| BullMQ + Redis over SQS for internal jobs | Lower latency for retry-heavy internal jobs; SQS for cross-module to maintain module boundary separation |
| Modular monolith over microservices | Right-sized for 2–3 engineers; avoids distributed systems overhead at MVP scale |

---

## Related Documents

- [[Technical Architecture]] → `09_Technical/TECHNICAL_ARCHITECTURE.md`
- [[Master PRD — Data Model]] → `08_PRD/MASTER_PRD_v1.0.md`
- [[FDD — Technology Decisions]] → `15_Decisions/FOUNDER_DECISIONS.md`
- [[Architecture Index]] → `_navigator/ARCHITECTURE_INDEX.md`
