# Technical Architecture Document v1.0

**Title:** Technical Architecture Document v1.0 — Production Architecture  
**Original Filename:** B 4-Tajribti_Technical_Architecture_v1.0.docx  
**Original Location:** inbox/  
**Category:** Technical / Architecture  
**Version:** 1.0  
**Word Count:** ~1,209  
**Keywords:** architecture, NestJS, Flutter, React, AWS, PostgreSQL, Redis, SQS, BullMQ, modular monolith, Python, FastAPI, TypeORM, ECS, Terraform  

---

## Summary

Defines the production-ready technical architecture for Tajribti MVP. Uses a modular monolith (NestJS) + Python satellite service for AI/data workloads. Three environments (dev/staging/prod). All infrastructure as code via Terraform. Five-layer logical architecture with strictly one-directional dependencies.

---

## Phase 1 — Architecture Overview

### Architectural Style Decision

| Element | Decision | Rationale |
|---|---|---|
| Core API | Modular monolith (NestJS) | Year-1 team is 2–3 engineers — microservices overhead not justified |
| AI/Data workloads | Satellite Python service (FastAPI) | Separate concerns without full microservices |
| Microservices | Deferred to Year 2+ | Module boundaries designed for clean extraction when needed |
| Scalability principle | Design for 10x current volume — not hypothetical global scale prematurely |

### Architectural Decision Record

> Every module is built with clear domain boundaries and its own data-access layer so any module (e.g., Fulfillment, Analytics) can be extracted into an independently deployable service later without a rewrite.

---

## Phase 2 — Logical Architecture (5 Layers)

Strictly one-directional dependency — each layer depends only on the layer below:

| Layer | Contents |
|---|---|
| 5. Presentation | Flutter/React UI components — no business logic |
| 4. API/Application | NestJS controllers, request validation (class-validator), response shaping |
| 3. Domain/Business Logic | Module services implementing PRD business rules (state machines, validation rules) |
| 2. Data Access | Repositories/ORM layer (TypeORM) — no business logic |
| 1. Infrastructure | DB drivers, cache clients, queue clients, third-party SDKs |

---

## Phase 3 — Frontend Architecture

| Platform | Technology | Notes |
|---|---|---|
| Consumer mobile app | Flutter | Cross-platform iOS/Android; RTL-first |
| Brand dashboard | React (web) | Desktop-first; brand users work from desks |
| Admin portal | React (web) | Internal — desktop only |

---

## Phase 4 — Backend Architecture

### API Layer

| Element | Decision |
|---|---|
| Protocol | REST, versioned (/api/v1/...) |
| Spec | OpenAPI/Swagger — auto-generated from NestJS decorators |
| GraphQL | Deliberately NOT adopted for MVP |

### Authentication & Authorization

| Mechanism | Implementation |
|---|---|
| Consumer auth | Passport custom OTP strategy |
| All authenticated requests | JWT strategy |
| Brand SSO | OAuth2 strategy — reserved for V2 |
| Authorization | NestJS Guards + CASL (attribute-based rules) |
| Permissions | Mapped directly to PRD Permissions Matrix |

### Background Jobs & Queues

| Queue | Technology | Use Cases |
|---|---|---|
| Internal scheduled/retryable | BullMQ (Redis-backed) | Notification dispatch, report generation, QR batch generation |
| Cross-module event-driven | AWS SQS | redemption.completed and survey.completed events → consumed async by Notification and Analytics |

**SQS rationale:** Keeps the redemption path fast even as reporting logic grows more complex.

### Caching

| Cache Entry | TTL | Invalidation |
|---|---|---|
| Campaign discovery feed | 2 minutes | SQS event-driven |
| Brand dashboard summary counts | 1 minute | SQS event-driven on new redemption/survey |
| Rate-limit counters | Per-request | Rolling window |

---

## Phase 5 — Database Design

### Database Technology
- **Primary:** PostgreSQL (AWS RDS Multi-AZ)
- **Cache/Queue:** Redis (ElastiCache)
- **ORM:** TypeORM with NestJS migrations

### Engineering Conventions

| Convention | Detail |
|---|---|
| Primary keys | UUID v4 — avoids sequential-ID enumeration, safe for public-facing IDs |
| Timestamps | created_at, updated_at (UTC timestamptz) on every entity |
| Soft-delete | deleted_at on Consumer, Campaign, BrandAccount |
| Monetary fields | Integers (smallest currency unit) — avoids floating-point rounding |
| Foreign keys | ON DELETE RESTRICT by default; explicit CASCADE only where PRD business rules require it |
| Campaign status | CHECK constraint enforcing PRD state machine at DB AND application level (defense in depth) |
| NOT NULL | On all required fields per Master PRD data model |

### Key Indexes

- Consumer: phone (unique), created_at
- Campaign: brand_id + status, start_date, end_date
- RedemptionEvent: campaign_id + consumer_id (composite unique), created_at
- SurveyResponse: redemption_id (unique), created_at
- QRCode: code (unique), campaign_id + status

### Migrations

- TypeORM migrations — one per schema change
- Reviewed in same PR as the code that depends on it
- Additive-first and backward-compatible (add → backfill → remove pattern)
- Supports zero-downtime deploys

### Partitioning

- SurveyResponse and AuditLog: schema-ready with created_at as partition key from Day 1
- Monthly range partitioning activated when table size crosses operational threshold
- Not required at MVP launch volume — avoids premature optimization

### Backups

- RDS automated daily snapshots, minimum 7-day point-in-time recovery
- Cross-region backup replication weekly (disaster recovery)
- Quarterly restore drills — *a backup that has never been restored is not a verified backup*

---

## Phase 6 — Infrastructure

### Environments

| Environment | Configuration |
|---|---|
| dev | Local Docker Compose — mirrors prod services |
| staging | Full AWS replica at smaller instance sizes |
| production | Multi-AZ, autoscaled |

### Deployment

- ECS rolling updates with health-check-gated rollback
- Infrastructure as code: Terraform — reviewed via PR like application code
- CI/CD: see Master Delivery Plan DevOps Plan

### Cloud Region

- **Provisionally:** AWS me-south-1 (Bahrain)
- Rationale: Closest AWS region with regional presence to Egypt; MENA SaaS precedent; no worse PDPL fit than UAE absent specific legal reason
- **Status:** Provisional — pending final PDPL legal confirmation (see Remediation doc)

---

## Phase 7 — Security

| Domain | Requirement |
|---|---|
| Encryption | At rest and in transit — all consumer data |
| Data minimization | Collect minimum data a campaign requires — never more |
| Consumer deletion | Self-service, per PDPL |
| Anonymization | RedemptionEvent/SurveyResponse are never hard-deleted — only anonymized |
| Rate limiting | Redis-based per-endpoint |
| Security scanning | Required from Hardening sprint onward |
| PDPL compliance | Gate — must be signed off before any data-heavy MVP ships |

---

## Phase 8 — AI Architecture (V2 Target-State)

### LLM Strategy

| Element | Decision |
|---|---|
| Providers | OpenAI + Anthropic — multi-provider (per FDD, avoids single-vendor lock-in) |
| Routing | Internal AI Gateway service (Python/FastAPI) — not hardcoded in application code |
| Azure/Google Vertex | Evaluated only if a specific enterprise client requires a particular compliance certification |

### Prompt Layer

- Versioned prompt templates stored in dedicated prompt-management module
- Structured JSON-mode output schemas — frontend consumes typed data, not free text
- Not inline in application code

### RAG / Embeddings / Vector Database

**Decision: NOT required for V2 insight-narrative use case.**

Rationale: The underlying knowledge is the campaign's own structured survey data (already in Postgres/warehouse) — not an external document corpus. RAG, embeddings, and vector database are explicitly deferred to a Future-vision "ask your data" conversational feature only if that becomes a validated product need.

---

## Phase 9 — Disaster Recovery

| Metric | Target |
|---|---|
| RTO (Recovery Time Objective) | 4 hours (MVP scale) |
| RPO (Recovery Point Objective) | 1 hour |
| Restore drills | Quarterly (none yet run — open gap per Readiness Audit) |
| Cross-region backup | Weekly |

---

## Technical Debt Risks (Identified by Readiness Audit)

| Risk | Detail |
|---|---|
| Module boundary untested | Modular monolith is correct Y1 choice but boundaries not tested under real load — if wrong, "extract later" becomes expensive rework |
| QR concurrency unproven | Highest technical risk (R-03 in Risk Register) — load-test plan exists but no load test has been run |
| Partition activation trigger | Schema-ready but not owned by anyone — could be missed under real growth |

---

## Related Documents

- [[Master PRD]] → `08_PRD/MASTER_PRD_v1.0.md`
- [[Master Delivery Plan]] → `02_Project_Management/MASTER_DELIVERY_PLAN.md`
- [[FDD — Technology Decisions]] → `15_Decisions/FOUNDER_DECISIONS.md`
- [[Readiness Audit]] → `13_Audits/READINESS_AUDIT.md`
