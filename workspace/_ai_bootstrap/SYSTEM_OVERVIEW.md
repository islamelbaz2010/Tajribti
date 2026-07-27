# System Overview — Tajribti Platform

---

## Business System

```
┌─────────────────────────────────────────────────────┐
│              TAJRIBTI PLATFORM                      │
│         Consumer Intelligence Platform              │
│─────────────────────────────────────────────────────│
│                                                     │
│  BRAND SIDE (B2B — paying customers)               │
│  ┌─────────────────────────────────────────────┐   │
│  │ Brand Dashboard (React Web)                 │   │
│  │ • Campaign Creation Wizard                  │   │
│  │ • Live Campaign Monitoring                  │   │
│  │ • Analytics Reports + CSV Export            │   │
│  │ • AI Insight Narratives (V2)                │   │
│  └─────────────────────────────────────────────┘   │
│                       ↕                            │
│  CORE PLATFORM (NestJS Modular Monolith)           │
│  ┌─────────────────────────────────────────────┐   │
│  │ Auth │ Campaign │ Fulfillment │ Survey      │   │
│  │ Analytics │ Notification │ Support          │   │
│  └─────────────────────────────────────────────┘   │
│                       ↕                            │
│  CONSUMER SIDE (B2C — data sources)                │
│  ┌─────────────────────────────────────────────┐   │
│  │ Consumer App (Flutter Mobile)               │   │
│  │ • Campaign Discovery (map/list)             │   │
│  │ • QR Code Redemption (physical location)    │   │
│  │ ��� Post-Trial Survey (3–5 questions)         │   │
│  │ • Rewards Wallet                            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ADMIN (Internal — Tajribti Ops)                   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Admin Portal (React Web)                    │   │
│  │ • Campaign Configuration & Approval         │   │
│  │ • Fraud/Anomaly Review Queue                │   │
│  │ • Support Ticket Management                 │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Infrastructure System

```
┌─────────────────────────────────────────────┐
│         AWS me-south-1 (Bahrain)            │
│─────────────────────────────────────────────│
│  ECS (autoscaled, multi-AZ rolling deploy)  │
│  ├── NestJS API containers                  │
│  ├── Python FastAPI AI service              │
│  └── Background workers (BullMQ)            │
│                                             │
│  RDS PostgreSQL (Multi-AZ)                  │
│  ElastiCache Redis                          │
│  SQS (cross-module events)                  │
│                                             │
│  External APIs:                             │
│  ├── OpenAI / Anthropic (LLM)              │
│  ├── SMS/OTP provider                       │
│  ├── WhatsApp Business API                  │
│  └── Vodafone Cash / InstaPay               │
└─────────────────────────────────────────────┘
```

---

## Value Flow

```
Brand pays campaign fee
        ↓
Platform distributes product samples to verified consumers
        ↓
Consumers try product → complete survey (within minutes)
        ↓
Structured data flows into platform
        ↓
Analytics engine processes responses
        ↓
Brand receives: demographic breakdown + survey responses + purchase intent
        ↓
Brand makes go/no-go decision on product launch
        ↓
Platform proprietary dataset grows → next campaign has better targeting
```

---

## Geographic Scope

| Phase | Markets |
|---|---|
| MVP (Year 1) | Cairo |
| Expansion (Year 2) | Alexandria, Giza, New Cairo, 6th October |
| National (Year 3) | Nile Delta, Upper Egypt, tourist cities |
| Regional (Year 4+) | GCC — hard gate, requires Egypt unit economics first |
