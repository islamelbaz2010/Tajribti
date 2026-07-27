# PROJECT MAP — Tajribti Knowledge Graph

```
ORIGIN
  └── samples app text idea.txt (Samplia video transcript)

ANALYSIS LAYER
  ├── Report A 1-IC_Report_Template.docx (18-phase Arabic analysis)
  ├── Report A 1-IC Memo PDF v1.0 (Conditional GO)
  ├── Report B 1-IC Memo Final v1.0 (B2B reframing memo)
  └── Report B 1-Peer Review Master Report (peer review + corrections)

CANONICAL INVESTMENT
  └── A 1-IC Edition v2.0 (CANONICAL — supersedes all above)

STRATEGIC FOUNDATION
  └── B 2.5-FDD v1.0 (Constitutional source of truth)
       ├── Business decisions
       ├── Product decisions
       ├── Technology decisions
       ├── UX/Brand/Operations/Financial decisions
       └── Open decisions (5 + 4 blocking)

EXECUTION DOCUMENTS
  ├── B 2-Master Execution Blueprint
  │    └── Track 0 (sprint) → Track 1 (full build, contingent)
  ├── B 3-Master PRD v1.0
  │    ├── 22 features (3 products)
  │    ├── 3 personas
  │    ├── Data model
  │    └── State machines
  ├── B 4-Technical Architecture v1.0
  │    ├── NestJS modular monolith
  │    ├── Flutter + React frontends
  │    ├── AWS (Bahrain, provisional)
  │    └── AI Gateway (OpenAI + Anthropic)
  └── B 5-Master Delivery Plan v1.0
       ├── Sprint 0–6 (12 weeks engineering)
       ├── ~24 weeks total to Production v1.0
       ├── Risk Register
       └── QA Strategy

QUALITY GATES
  ├── B 6-Readiness Audit (58/100 — NOT AUTHORIZED)
  └── B 6.5-Remediation & Re-Audit (67/100 — NOT AUTHORIZED)
       ├── 5 findings closed
       └── 4 blocking items remain

PROMPT LIBRARY
  └── chatgpt chat till 26-7.docx
       ├── PROMPT-001: 18-phase due diligence
       └── PROMPT-002: Peer review synthesis
```

---

## Data Flows (Operational)

```
BRAND (paying customer)
  → Campaign Brief
  → Campaign Creation Wizard (Brand Dashboard)
  → Admin Approval (Admin Portal)
  → Field Setup (Ops)

CONSUMER (data source)
  → Sees notification (Push Notification)
  → Visits location (Campaign Discovery / Map)
  → Scans QR (QR Redemption)
  → Receives free sample (Fulfillment)
  → Completes survey (Post-Trial Survey, <3 min)

DATA LAYER
  → Survey responses → PostgreSQL
  → Events → AWS SQS → Analytics Module
  → Analytics → Brand Dashboard (real-time)
  → AI Narratives → Brand Dashboard (V2)
  → Campaign Report (within hours of close)
```

---

## Authorization Gate Flow

```
Track 0: Commercial Validation Sprint
  ├── Budget: $15,000–$25,000
  ├── Duration: 60 days
  ├── No engineering, no office, no app
  └── GO / NO-GO decision
            ↓ (GO required)
Track 1: Full Build
  └── Sprint 0 → Sprint 6 → Production v1.0
```

**Current Status:** Track 0 GO not confirmed → Track 1 blocked
