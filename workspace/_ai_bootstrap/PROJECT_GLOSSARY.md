# Project Glossary — Tajribti

| Term | Definition |
|---|---|
| Tajribti (تجربتي) | Working name for the platform; means "my experience" in Arabic; provisional pending trademark clearance |
| Consumer Intelligence Platform | The correct category for this business — a platform that collects and monetizes structured consumer data, where sampling is the acquisition mechanic |
| Sampling company | What this business is NOT — explicitly rejected framing |
| Track 0 | 60-day, $15K–$25K commercial validation sprint — the only currently authorized activity |
| Track 1 | Full build program — authorized only on Track 0 GO decision |
| GO / NO-GO | Decision gate at end of Track 0 determining whether Track 1 proceeds |
| FDD | Founder Decisions Document — the constitutional source of truth for all project decisions |
| IERB | Independent Executive Review Board — issued the Readiness Audit |
| PDPL | Egypt Personal Data Protection Law (Law No. 151 of 2020) — compliance is a non-negotiable gate |
| Samplia | Spanish reference company (founded 2013, bootstrapped) — inspiration for the Egypt model |
| Marketeers Research | Primary near-direct competitor; operates AI-powered FMCG analytics ("Smart Value™") in Egypt/KSA/GCC |
| B2B2C | Business model where brands pay, platform operates, consumers receive value |
| Modular monolith | The chosen backend architecture — NestJS with clean module boundaries, designed for future microservices extraction |
| BullMQ | Redis-backed queue for internal NestJS background jobs |
| SQS | AWS Simple Queue Service — used for cross-module async events (redemption.completed, survey.completed) |
| CASL | Authorization library for NestJS — implements attribute-based access control |
| QR Redemption | The core physical mechanic — consumer scans QR code at location to receive a product sample |
| Post-Trial Survey | 3–5 question survey completed by consumer within minutes of receiving the product |
| Consumer Panel | The growing database of verified, profiled Egyptian consumers — the primary asset and moat |
| Campaign | A brand-funded product trial event with defined segment, locations, dates, survey, and budget |
| Brand Dashboard | Web application for brand marketing teams to create campaigns, monitor progress, and view analytics |
| Admin Portal | Internal Tajribti tool for Ops team to configure campaigns, review fraud, and manage support |
| P0 | Highest-priority features — must be in MVP |
| P1 | Important features — in V1 release |
| P2 | Future features — V1.5 or later |
| TAM | Total Addressable Market — not yet built for this project (open gap) |
| SAM | Serviceable Addressable Market — not yet built |
| SOM | Serviceable Obtainable Market — not yet built |
| Unit Economics | CAC, LTV, contribution margin, payback period — not yet built (critical open gap) |
| Instant Cash / InstaPay | Egyptian consumer payment rails used for reward disbursement |
| WhatsApp BSP | WhatsApp Business Service Provider — required for WhatsApp notification integration |
| RTL | Right-to-left — mandatory for Arabic language UI |
| UUID v4 | Primary key type used for all entities — avoids sequential enumeration |
| Soft-delete | Marking records as deleted (deleted_at) instead of physically removing them — required for PDPL compliance and audit |
| Cursor pagination | Pagination using last-seen record cursor rather than page offset — chosen architecture |
| ADR | Architecture Decision Record — documents why an architecture decision was made |
| Sprint 0 | Setup sprint — legal entity, AWS, Terraform, CI/CD, vendor contracts — before engineering begins |
| EGP | Egyptian Pound — local currency for reward value calibration |
