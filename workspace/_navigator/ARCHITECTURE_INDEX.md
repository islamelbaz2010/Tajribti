# ARCHITECTURE INDEX

**Source:** `09_Technical/TECHNICAL_ARCHITECTURE.md`

---

## Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Consumer mobile | Flutter | Cross-platform iOS/Android; RTL-first |
| Brand dashboard | React | Desktop-web-first |
| Admin portal | React | Desktop-only |
| Core API | NestJS (TypeScript) | Modular monolith |
| AI/Data service | Python / FastAPI | Satellite service |
| ORM | TypeORM | NestJS-native migrations |
| Primary database | PostgreSQL (AWS RDS Multi-AZ) | UUID PKs, soft-delete, partitioning |
| Cache | Redis (ElastiCache) | TTL + event-driven invalidation |
| Message queue | AWS SQS | Cross-module async events |
| Background jobs | BullMQ (Redis-backed) | Internal scheduled/retryable jobs |
| Auth | Passport.js (OTP + JWT + OAuth2) | + NestJS Guards + CASL |
| Infrastructure | AWS ECS (rolling deploys) | Multi-AZ, autoscaled |
| IaC | Terraform | Reviewed in PRs like application code |
| Cloud region | AWS me-south-1 (Bahrain) — provisional | Pending PDPL legal confirmation |
| LLM APIs | OpenAI + Anthropic | Multi-provider; routed via AI Gateway |
| AI Gateway | Python / FastAPI | Internal routing; not hardcoded in app |

---

## Architectural Decisions (Quick Reference)

| ADR | Decision | Rationale |
|---|---|---|
| ADR-01 | Modular monolith | 2–3 engineer Year-1 team; microservices overhead not justified |
| ADR-02 | Cursor pagination | Efficient at scale; avoids page-drift |
| ADR-03 | UUID v4 PKs | No sequential enumeration; safe public IDs |
| ADR-04 | Soft-delete | PDPL compliance; audit recovery |
| ADR-05 | Integer monetary fields | No floating-point rounding errors |
| ADR-06 | SQS cross-module | Fast redemption path; decoupled analytics |
| ADR-07 | Multi-provider LLM | No single-vendor lock-in |
| ADR-08 | Versioned prompt templates | A/B testable; not inline in code |

---

## System Boundaries

```
Consumer (Flutter app)
    ↓ HTTPS
NestJS API (/api/v1/...)
    ├── Auth Module (OTP/JWT/CASL)
    ├── Campaign Module
    ├── Fulfillment Module (QR Redemption)
    ├── Survey Module
    ├── Analytics Module
    ├── Notification Module
    └── Support Module
    ↓ SQS events (async)
Analytics & Notification services
    ↓
PostgreSQL + Redis
    ↓
Python AI Service (FastAPI)
    ↓ API calls
OpenAI / Anthropic
```

---

## Environment Summary

| Env | Infrastructure |
|---|---|
| dev | Local Docker Compose (mirrors prod) |
| staging | Full AWS replica at smaller instance sizes |
| production | Multi-AZ, autoscaled, ECS rolling updates |

---

## Security Requirements

| Requirement | Status |
|---|---|
| Encrypt at rest | Required |
| Encrypt in transit | Required |
| Self-service consumer data deletion | Required (PDPL) |
| Minimum data collection | Required |
| Quarterly restore drills | Required — none yet run |
| PDPL legal sign-off | Required — OPEN (blocking) |
