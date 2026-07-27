# Architecture Map — Tajribti

**One-page system architecture overview. All information sourced from `09_Technical/TECHNICAL_ARCHITECTURE.md` and `06_Enterprise_Architecture/ENTERPRISE_ARCHITECTURE.md`.**

---

## System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                          TAJRIBTI PLATFORM                             │
│                                                                        │
│  ┌─────────────────┐  ┌─────────────────────┐  ┌──────────────────┐  │
│  │  CONSUMER APP   │  │   BRAND DASHBOARD   │  │  ADMIN PORTAL    │  │
│  │  Flutter        │  │   React Web         │  │  React Web       │  │
│  │  iOS + Android  │  │   Desktop-first     │  │  Internal only   │  │
│  │  RTL-first      │  │   OTP/OAuth2 auth   │  │  OTP auth        │  │
│  └────────┬────────┘  └──────────┬──────────┘  └────────┬─────────┘  │
│           │                      │                       │            │
│           └──────────────────────┴───────────────────────┘            │
│                                  │                                     │
│                                  ▼                                     │
│              ┌─────────────────────────────────────┐                  │
│              │           CORE API                  │                  │
│              │     NestJS (TypeScript)             │                  │
│              │     Modular Monolith                │                  │
│              │                                     │                  │
│              │  Modules:                           │                  │
│              │  • Auth    • Campaign               │                  │
│              │  • QR      • Survey                 │                  │
│              │  • Analytics • Notification         │                  │
│              │  • Rewards • Fraud                  │                  │
│              └──────┬──────────────┬───────────────┘                  │
│                     │              │                                   │
│            ┌────────▼───┐    ┌─────▼──────────────┐                  │
│            │  AI SERVICE│    │      DATA LAYER     │                  │
│            │  Python /  │    │                     │                  │
│            │  FastAPI   │    │  PostgreSQL (RDS)   │                  │
│            │            │    │  Redis (ElastiCache)│                  │
│            │  LLM calls │    │  SQS (cross-module) │                  │
│            │  Prompt    │    │  BullMQ (internal)  │                  │
│            │  templates │    │                     │                  │
│            └────────────┘    └─────────────────────┘                  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Layer-by-Layer Breakdown

### Frontend Layer

| Product | Framework | Target | Auth |
|---|---|---|---|
| Consumer App | Flutter (Dart) | iOS 14+ / Android 6+ / RTL-first / lower-end Android | OTP (SMS) |
| Brand Dashboard | React (TypeScript) | Desktop-first, modern browsers | OTP or OAuth2 |
| Admin Portal | React (TypeScript) | Internal, desktop only | OTP |

*Source: `09_Technical/TECHNICAL_ARCHITECTURE.md` Section 2 — Frontend*

### Backend — Core API

| Attribute | Value |
|---|---|
| Framework | NestJS (TypeScript) |
| Architecture | Modular monolith (ADR-01) |
| Auth | Passport.js — OTP + JWT (15min access / 7d refresh) + OAuth2 |
| Pagination | Cursor-based only (ADR-02) |
| Primary keys | UUID v4 (ADR-03) |
| Soft delete | All entities — `deletedAt` timestamp (ADR-04) |
| Monetary fields | Integer only — no float (ADR-05) |
| ORM | TypeORM |
| Module communication | SQS cross-module, BullMQ internal queues |

Modules: Auth, Campaign, QR, Survey, Analytics, Notification, Rewards, Fraud

*Source: `09_Technical/TECHNICAL_ARCHITECTURE.md` Section 3 — Backend*

### AI Service (Satellite)

| Attribute | Value |
|---|---|
| Framework | Python / FastAPI |
| Role | Satellite service — not in critical request path |
| LLM providers | OpenAI + Anthropic (multi-provider, ADR-07) |
| Prompt management | Versioned template files, not inline code (ADR-08) |
| V1 scope | TJ-021 Fraud Detection (manual → automated) |
| V2 scope | TJ-018 AI Insight Narratives (deferred) |
| V1 RAG | NOT planned — deferred to validated need |

*Source: `09_Technical/TECHNICAL_ARCHITECTURE.md` Section 4 — AI Service; `10_AI/AI_STRATEGY.md`*

### Data Layer

| Component | Technology | Purpose |
|---|---|---|
| Primary database | PostgreSQL (AWS RDS Multi-AZ) | All application data, ACID transactions |
| Cache | Redis (AWS ElastiCache) | OTP sessions, campaign feeds, rate limiting |
| Cross-module queue | AWS SQS | Decoupled event passing between modules |
| Internal job queue | BullMQ | Background jobs within Core API |
| Object storage | AWS S3 | Campaign assets, brand logos, exports |

*Source: `09_Technical/TECHNICAL_ARCHITECTURE.md` Section 5 — Data*

### Infrastructure (AWS)

| Component | Technology | Notes |
|---|---|---|
| Compute | AWS ECS | Containerized, autoscaled |
| Cloud region | AWS me-south-1 Bahrain | PROVISIONAL — pending PDPL clarity |
| Multi-AZ | Yes | All stateful services |
| IaC | Terraform | All infrastructure as code |
| CI/CD | GitHub Actions (to be provisioned Sprint 0) | — |
| Load balancer | AWS ALB | — |
| Monitoring | AWS CloudWatch + (future) Datadog | — |

*Source: `09_Technical/TECHNICAL_ARCHITECTURE.md` Section 6 — Infrastructure*

---

## External Integrations

| Integration | Purpose | Priority |
|---|---|---|
| SMS / OTP provider | Deliver OTP codes to Egyptian mobile numbers (Twilio or local provider) | P0 |
| WhatsApp BSP | Notification delivery (post-survey confirmations, campaign alerts) | P1 |
| Vodafone Cash | Egyptian mobile wallet for consumer reward payouts | P1 |
| InstaPay | Egyptian digital payment network for reward payouts | P1 |
| OpenAI API | LLM provider (multi-provider setup) | P2 |
| Anthropic API | LLM provider (multi-provider setup) | P2 |
| AWS services | RDS, ElastiCache, SQS, S3, ECS, ALB, CloudWatch | P0 |

*Source: `09_Technical/TECHNICAL_ARCHITECTURE.md` Section 7 — Integrations; `06_Enterprise_Architecture/ENTERPRISE_ARCHITECTURE.md`*

---

## Security Architecture

| Concern | Design |
|---|---|
| Auth tokens | JWT (15min access), refresh tokens (7d, rotated) |
| API rate limiting | Redis-based, per user and per endpoint |
| Consumer data | Encrypted at rest (AES-256), in transit (TLS 1.3) |
| PII handling | Soft-delete (Right to Erasure), data minimization |
| Admin portal | IP allowlist + MFA |
| QR fraud | Idempotency guard + rate limiting per device |

*Source: `09_Technical/TECHNICAL_ARCHITECTURE.md` Section 8 — Security*

---

## Critical Technical Risk

**TJ-005 — QR Code Redemption: Concurrent Scan Race Condition**

Multiple consumers may scan the same QR code simultaneously. Without an idempotency guard, a single product sample could be claimed multiple times.

Design response:
- RESERVED state (5-minute TTL) created atomically at first scan
- Database-level unique constraint on redemption per QR code
- SQS-based decoupling to handle burst load

Status: Designed — NOT yet tested. B-04 (load test) is a blocking item.

*Source: `08_PRD/MASTER_PRD_v1.0.md` TJ-005; `09_Technical/TECHNICAL_ARCHITECTURE.md`*

---

## Architectural Non-Decisions (Explicitly Deferred)

| Decision | Status | Trigger to revisit |
|---|---|---|
| Microservices split | NOT before Year 2–3 | Engineering team grows beyond 8 backend engineers |
| Multi-cloud | NOT before Year 2–3 | Scale or regional expansion requirement |
| RAG / vector database | NOT in V1 roadmap | Validated use case in V2 |
| Dedicated search engine (Elasticsearch) | NOT in V1 | Scale-validated need |
| GraphQL API | NOT planned | REST sufficient for V1 use cases |

*Source: `09_Technical/TECHNICAL_ARCHITECTURE.md` ADR section; `10_AI/AI_STRATEGY.md`*
