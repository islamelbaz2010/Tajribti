# Decision Log — Chronological Record of All Decisions

**Format:** Append-only. Never delete or amend past entries. If a decision is reversed, add a new entry marked REVERSED/AMENDED.  
**Authority:** Binding decisions are in `15_Decisions/FOUNDER_DECISIONS.md`. This log provides audit trail and rationale.  
**Last updated:** 2026-09-01
**Decision count:** 61 logged (36+ locked, 6 open, 4 blocking, 9 ADRs)

---

## How to Read This Log

| Column | Meaning |
|---|---|
| ID | Unique decision ID — never reassigned |
| Date | Date decision was made or documented |
| Category | BIZ / PROD / TECH / ADR / UX / BRAND / OPS / FIN / OPEN |
| Status | LOCKED / OPEN / BLOCKED / REVERSED |
| Decision | The decision made |
| Rationale | Why this was decided |
| Authority | Who made it |

---

## Phase 0 — Foundation Decisions (Pre-Workspace)

*These decisions were made during the initial concept and IC analysis phase, documented in the FDD and Investment reports.*

### Strategic Business Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-001 | 2026-07 | BIZ | LOCKED | Platform category: Consumer Intelligence Platform — NEVER "sampling company" | Free product samples are the acquisition mechanic; data is the product. Positioning as sampling company undersells the value proposition and misdirects investor framing | Founder (FDD) |
| DL-002 | 2026-07 | BIZ | LOCKED | Paying customer: Brands only. Consumers NEVER pay. | B2B2C model — brand data value is the revenue source; consumer friction from fees would destroy data panel quality | Founder (FDD) |
| DL-003 | 2026-07 | BIZ | LOCKED | Target market: FMCG, beauty, personal care, pharma-OTC in Egypt | Highest repeat-launch frequency; existing sampling/research budget; easiest measurable ROI for brand | Founder (FDD) |
| DL-004 | 2026-07 | BIZ | LOCKED | Year 1 geography: Cairo only | Highest brand concentration in Egypt; most cost-efficient first market for operations | Founder (FDD) |
| DL-005 | 2026-07 | BIZ | LOCKED | Year 2 expansion: Alexandria, Giza, New Cairo, 6th October | Natural adjacency; shared logistics infrastructure | Founder (FDD) |
| DL-006 | 2026-07 | BIZ | LOCKED | GCC expansion gate: Egypt unit economics proven — hard gate, not calendar date | Avoids premature geographic expansion before model is proven; protects capital | Founder (FDD) |
| DL-007 | 2026-07 | BIZ | LOCKED | Out of scope Y1–3: Healthcare, insurance, banking, telecom, government, education | FMCG is primary; all listed verticals have materially different regulatory + sales complexity | Founder (FDD) |
| DL-008 | 2026-07 | BIZ | LOCKED | Revenue model: Campaign fees + per-sample + AI dashboard subscription + panel access + Enterprise API | Multi-revenue-stream reduces single-client concentration risk; subscription layer improves revenue quality | Founder (FDD) |
| DL-009 | 2026-07 | BIZ | LOCKED | Sales motion: Outbound-led, land-and-expand, ~20 named accounts | Concentrated account base allows deep relationship management; land-and-expand is proven B2B SaaS motion | Founder (FDD) |
| DL-010 | 2026-07 | BIZ | LOCKED | Funding: Capital-efficient, bootstrapped trajectory. Raise only to hit next milestone. | Reference company (Samplia) is bootstrapped; venture-scale assumptions not warranted without validated unit economics | Founder (FDD) |
| DL-011 | 2026-07 | BIZ | LOCKED | Exit A: Strategic acquisition (NielsenIQ, Kantar, Circana, MENA media) | Data assets + brand relationships are acquisition-valuable to global intelligence companies | Founder (FDD) |
| DL-012 | 2026-07 | BIZ | LOCKED | Exit B: Sustained independent profitability as regional data company | Not all outcomes require an exit; profitable regional intelligence company is a valid terminal state | Founder (FDD) |
| DL-013 | 2026-07 | BIZ | LOCKED | REJECTED: Venture-style forced-exit timeline | Incompatible with capital-efficient trajectory and operator-founder operating model | Founder (FDD) |

### Product Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-014 | 2026-07 | PROD | LOCKED | Core product: Two-sided platform — consumer app + brand dashboard | Platform value comes from connecting both sides; single-sided product delivers half the value | Founder (FDD) |
| DL-015 | 2026-07 | PROD | LOCKED | MVP scope: Admin portal + brand dashboard + consumer app + QR redemption + 3–5 question survey + basic analytics | Minimum viable loop to generate revenue-quality data; all other features deferred | Founder (FDD) |
| DL-016 | 2026-07 | PROD | LOCKED | NOT in MVP: Permanent kiosks, owned logistics, e-commerce, paid consumer subscriptions, non-FMCG, GCC features | Capital and complexity reduction; deferred to validated demand | Founder (FDD) |
| DL-017 | 2026-07 | PROD | LOCKED | AI strategy: AI = faster insight delivery, NOT the moat. Moat = data + brand relationships. | LLM APIs are commoditizing AI; proprietary data panel + brand trust is defensible | Founder (FDD) |
| DL-018 | 2026-07 | PROD | LOCKED | Mobile strategy: Mobile-first + mobile-only for consumers. Brand dashboard = desktop-web-first. | Egyptian FMCG consumer primarily uses Android mobile; brand managers work at desks | Founder (FDD) |
| DL-019 | 2026-07 | PROD | LOCKED | Primary language: Egyptian-dialect Arabic — native, not a translation layer | Egyptian-dialect UX reduces cognitive friction for target consumer demographic | Founder (FDD) |

### Technology Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-020 | 2026-07 | TECH | LOCKED | Core API: NestJS (TypeScript) | Typed, structured, good ecosystem for small teams; native DI + modular architecture | Founder (FDD) |
| DL-021 | 2026-07 | TECH | LOCKED | AI service: Python / FastAPI satellite | Python is the dominant ML/AI ecosystem; FastAPI is production-grade; cleanly separated from core API | Founder (FDD) |
| DL-022 | 2026-07 | TECH | LOCKED | Consumer frontend: Flutter | Cross-platform iOS + Android from single codebase; strong RTL Arabic support; lower-end Android performance | Founder (FDD) |
| DL-023 | 2026-07 | TECH | LOCKED | Brand dashboard: React (web, desktop-first) | Most widely supported frontend framework; brand managers use desktop browsers | Founder (FDD) |
| DL-024 | 2026-07 | TECH | LOCKED | Database: PostgreSQL (AWS RDS Multi-AZ) | Proven, reliable, full ACID; RDS Multi-AZ for production HA; no exotic DB for core data | Founder (FDD) |
| DL-025 | 2026-07 | TECH | LOCKED | Queue: AWS SQS (cross-module) + BullMQ (internal jobs) | SQS for durability + cross-service decoupling; BullMQ for internal retry logic | Founder (FDD) |
| DL-026 | 2026-07 | TECH | LOCKED | Cache: Redis via AWS ElastiCache | Industry standard; session storage, rate limiting, leaderboard caching | Founder (FDD) |
| DL-027 | 2026-07 | TECH | LOCKED | Cloud: AWS (region provisionally me-south-1 Bahrain) | Nearest AWS region to Egypt with MENA data-residency precedent; PDPL compliance pending legal confirmation | Founder (FDD + Remediation) |
| DL-028 | 2026-07 | TECH | LOCKED | IaC: Terraform | Industry standard; reviewed via PR like application code | Founder (FDD) |
| DL-029 | 2026-07 | TECH | LOCKED | AI providers: OpenAI + Anthropic, multi-provider | No single-vendor lock-in; provider outages don't take down insight layer | Founder (FDD) |
| DL-030 | 2026-07 | TECH | LOCKED | Philosophy: Boring, proven tech for core stack; novelty reserved for AI/data layer only | Small team; operational stability more valuable than technical novelty | Founder (FDD) |
| DL-031 | 2026-07 | TECH | LOCKED | Build vs. Buy: Build pipeline + fraud detection + AI narratives. Buy payments, cloud, LLMs, BI, CRM, monitoring. | Builds only where differentiation exists; buys to accelerate and reduce ops burden | Founder (FDD) |
| DL-032 | 2026-07 | TECH | LOCKED | Open source: Use freely (PostgreSQL, Redis). Do NOT open-source Tajribti's own code or models. | Data models and fraud-detection logic are proprietary competitive assets | Founder (FDD) |

### Architecture Decisions (ADRs)

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| ADR-01 | 2026-07 | ADR | LOCKED | Modular monolith — not microservices | Year-1 team 2–3 engineers; microservices overhead not justified; clean module boundaries allow future extraction | Founder + IERB (Architecture) |
| ADR-02 | 2026-07 | ADR | LOCKED | Cursor-based pagination — not offset | Consistent at scale; no page-drift on live data; consistent with UUID PK; IERB finding M-02 remediated | IERB + Founder (Remediation) |
| ADR-03 | 2026-07 | ADR | LOCKED | UUID v4 primary keys | Prevents sequential-ID enumeration attacks; safe for public-facing IDs | Founder (Architecture) |
| ADR-04 | 2026-07 | ADR | LOCKED | Soft-delete on all entities | PDPL compliance; audit trail preservation; events only anonymized, never hard-deleted | Founder (Architecture + PDPL) |
| ADR-05 | 2026-07 | ADR | LOCKED | Integer monetary fields | Avoids floating-point rounding errors in financial calculations | Founder (Architecture) |
| ADR-06 | 2026-07 | ADR | LOCKED | SQS for cross-module events | Keeps QR redemption path fast; decouples analytics growth from core transaction loop | Founder (Architecture) |
| ADR-07 | 2026-07 | ADR | LOCKED | Multi-provider LLM | No single-vendor lock-in (FDD requirement); provider outages don't disable insight layer | Founder (FDD) |
| ADR-08 | 2026-07 | ADR | LOCKED | Versioned prompt templates — not inline in code | Supports testing; typed JSON output; not entangled with application code | Founder (AI Strategy) |
| ADR-09 | 2026-08-18 | ADR | LOCKED | When Akedly `challengeRequired=false`, Flutter skips PoW and omits `powSolution`; backend does not pre-validate `powSolution` presence; Akedly is the authoritative PoW enforcer server-to-server | When Akedly Dev Mode is active, no `challengeToken` exists to build a valid `powSolution`; Akedly rejects the send request when PoW is required but absent — removing the Tajribti pre-check delegates enforcement to the correct authority without weakening security | Claude Code (Session F) / Founder (authorized) |

### UX Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-033 | 2026-07 | UX | LOCKED | UX philosophy: Friction is the enemy. Every unnecessary tap costs completed surveys. | Survey completion rate is the core data-quality metric; UX friction destroys it | Founder (FDD) |
| DL-034 | 2026-07 | UX | LOCKED | Accessibility: RTL-first, Arabic typography, lower-end Android support, graceful degradation on poor connectivity | Egyptian target consumer is not an iPhone power user; graceful degradation is mandatory, not optional | Founder (FDD) |
| DL-035 | 2026-07 | UX | LOCKED | Languages: Egyptian-dialect Arabic = default and primary. English = secondary toggle. | Platform is natively Egyptian. English toggle for bilingual brand managers. | Founder (FDD) |

### Brand Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-036 | 2026-07 | BRAND | LOCKED | Positioning: "Egypt's Consumer Intelligence Platform" — never "sampling company" or "coupon app" | Framing controls value perception; sampling company framing limits pricing power | Founder (FDD) |
| DL-037 | 2026-07 | BRAND | LOCKED | Personality: Sharp, evidence-driven, trustworthy — "credible insider" | Not a marketing platform; a data platform. Personality must reflect data credibility. | Founder (FDD) |
| DL-038 | 2026-07 | BRAND | LOCKED | Never oversell certainty — always show sample size and confidence context | Data honesty builds long-term brand trust; dishonest analytics gets caught and destroys relationships | Founder (FDD) |

### Operational Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-039 | 2026-07 | OPS | LOCKED | Company structure: Egyptian LLC initially, converting to JSC as it scales | Standard Egypt entity for early-stage; JSC required for institutional investment | Founder (FDD) |
| DL-040 | 2026-07 | OPS | LOCKED | Remote-first for engineering/product/data. In-person required for Ops/field and Sales. | Engineering talent is geographically distributed; field operations require physical presence | Founder (FDD) |
| DL-041 | 2026-07 | OPS | LOCKED | CS strategy: Proactive ROI reporting drives renewal — not reactive ticket-answering | Brand retention depends on demonstrated value, not support quality alone | Founder (FDD) |

---

## Phase 1 — Remediation Decisions (Post-IERB Audit)

*These decisions resolved IERB blocking items B-02, B-04, and partially B-03.*

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-042 | 2026-07-26 | OPS | LOCKED | Cloud region: AWS me-south-1 (Bahrain) — provisional | Closest AWS region to Egypt with MENA data-residency precedent; no worse PDPL fit than UAE absent specific legal reason | Founder (Remediation) |
| DL-043 | 2026-07-26 | OPS | LOCKED | Sprint 0 team: CEO + CTO + fractional legal + fractional CFO (pre-GO activities only) | Minimum viable Sprint 0 team; avoids hiring cost before GO confirmed | Founder (Remediation) |
| DL-044 | 2026-07-26 | OPS | LOCKED | Sprint 1+ hires: 2 engineers + Ops Manager + Head of Brand Partnerships on GO confirmation | Standard Year-1 team structure per Master Execution Blueprint | Founder (Remediation) |
| DL-045 | 2026-07-26 | OPS | LOCKED | Sprint 0 vendor budget: SMS/OTP ~$200–500, WhatsApp BSP ~$500–1,000, AWS setup ~$500–1,000, PDPL legal ~$2,000–5,000 | Explicit budget line for Track 0 vendor contracts; resolves IERB B-04 | Founder (Remediation) |

---

## Open Decisions (Unresolved)

| ID | Date | Category | Status | Decision Required | Owner | Impact |
|---|---|---|---|---|---|---|
| OD-01 | 2026-07 | BRAND | OPEN | Final legal company name + trademark/domain clearance | Founder | All code, legal filings, brand assets use provisional name until resolved |
| OD-02 | 2026-07 | OPS | OPEN | CEO doubles as PM through Year 1, or dedicated PM hired on GO | Founder | Hiring plan and Sprint 0 resource allocation |
| OD-03 | 2026-07 | TECH | OPEN | Final cloud region confirmation (provisionally Bahrain) | Founder + Legal | Infrastructure confirmed after PDPL review |
| OD-04 | 2026-07 | FIN | OPEN | External funding sought or bootstrapped trajectory | Founder | Timeline and team size for Track 1 |
| OD-05 | 2026-07 | FIN | OPEN | Revenue-mix percentages (campaign vs. subscription vs. API) | Founder + Track 0 results | Pricing and packaging strategy |

---

## Blocking Items (Development Gates)

| ID | Date | Category | Status | Item | Owner | Closes When |
|---|---|---|---|---|---|---|
| B-01 | 2026-07 | FIN | BLOCKED | Track 0 GO decision not confirmed | Founder | Founder confirms sprint concluded with GO |
| B-02 | 2026-07 | LEGAL | BLOCKED | Egyptian LLC incorporation unconfirmed | Founder | LLC confirmed incorporated |
| B-03 | 2026-07 | LEGAL | BLOCKED | PDPL legal sign-off not obtained | Legal counsel | Egyptian data-privacy lawyer provides written scope opinion |
| B-04 | 2026-07 | TECH | BLOCKED | QR concurrency load test not executed | CTO (not yet hired) | Load test executed and results documented |

---

## Phase 2 — Commercial Validation Sprint (Track 0) — Reconciled from Chat

*These decisions were extracted from the historical ChatGPT session archive (PROJECT_CHAT_SNAPSHOT_2026-08-17.md) and reconciled against the repository by the ASSESSMENT PREPARATION / DECISION RECONCILIATION protocol on 2026-08-17. Evidence citations reference the CHAT_CONTEXT_EXTRACTION_2026-08-17.md canonical extraction.*

### Product Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-046 | 2026-08-14 | PROD | LOCKED | First brand client must see the Flutter mobile app — not mobile web — for the first demonstration | Founder quote: "لا انا قلت كمان أول عميل يرى موبيل ابلكيشن"; the Flutter native app represents the product as designed; mobile web is an internal bridge only | Founder (Chat — confirmed by CHAT-D04 extraction) |
| DL-047 | 2026-08-14 | PROD | LOCKED | Intelligence Report quality declared insufficient before Samplia standard is reached; Samplia.com is the explicit visual and structural benchmark | Founder quote: "جدا جدا ضعييييف" (very very weak); Samplia reference set as the design target — not an internal preference but an explicit founder direction | Founder (Chat — confirmed by CHAT-D11 extraction) |

### Open / Conflict Decisions

| ID | Date | Category | Status | Decision Required | Owner | Notes |
|---|---|---|---|---|---|---|
| DL-048 | 2026-08-17 | TECH | OPEN | CONFLICT-INTERNAL-C: DL-046 (first client must see Flutter) vs. macOS 13 hardware which cannot build Flutter 3.44.8 (requires macOS 14+). Founder must choose: upgrade to macOS 14; set up CI build pipeline; or amend DL-046 to accept mobile web for first demo | Founder | Identified during DECISION_RECONCILIATION_2026-08-17; not previously logged in any workspace document. Blocks first brand discovery meeting at full demo fidelity. |

**DL-048 resolution — 2026-08-23:** Founder selected Option B — use the CI-based Flutter Android build/distribution path; DL-046 remains unchanged. CI artifact production and client-ready validation remain execution evidence.

**DL-048 closure — 2026-08-23:** PATH C isolated E2E completed 16/16 PASS. Disposable APK (SHA-256 `d32abec…`) built from source SHA `ad71117` with `API_BASE=http://localhost:3010/api/v1`; real Akedly V1.2 OTP authenticated +201118000472; full participation journey confirmed; already-participated protection ("شاركت سابقاً") confirmed; production Railway campaign unchanged; isolated runtime cleanly destroyed post-validation. DL-048 is CLOSED. Post-cleanup home-screen error classified EXPECTED DISPOSABLE RUNTIME FAILURE — not a product defect. Client-ready gate: MET.

---

## Phase 3 — Pilot Hardening & Bug Fix Sprint (2026-08-17 to 2026-08-18)

### Engineering Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-049 | 2026-08-18 | TECH | LOCKED | OTP screen branches on `challengeRequired` field before reading PoW fields; skips PoW entirely when false | Akedly Dev Mode returns no `challenge`/`difficulty`/`challengeToken`; unconditional cast to `String` caused Dart `TypeError` and silent failure; fix makes the code correct for both Dev Mode and production PoW-on states | Claude Code (Session F) / Founder (authorized) |

---

## Phase 4 — Product Completion Sprint V0.5 (2026-08-23)

### Governance Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-050 | 2026-08-23 | PROD | LOCKED | CONFLICT-D RESOLVED: Discovery-First is the target consumer product experience. CAD-05 (Consumer journey: Discover → Scan → Survey → Reward) applies from Product Completion V0.5 onward. QR scanning remains a valid campaign-entry mechanism alongside discovery. | Founder review of product state concluded the current QR-only experience is insufficient — no retention loop, no reason to return. Product must have discovery, campaign browsing, meaningful navigation, and participation history. Samplia-level product depth is the benchmark. CONFLICT-D is closed. | Founder (explicit direction 2026-08-23) |
| DL-051 | 2026-08-23 | PROD | LOCKED | BD-13 BOUNDED EXCEPTION: Engineering is authorized for Product Completion V0.5 scope only. Authorized scope: consumer discovery feed, real home screen with campaigns + profile, campaign detail (extend existing), discovery-first entry, return-to-home after completion, participation history, reward presentation. All items outside this scope remain governed by BD-13. BD-14 kill criterion unchanged. | Founder direction: transform technical pilot into coherent consumer product. No LOI gate applies to this bounded sprint because it corrects a product incompleteness that predates the commercial validation sprint, not a Track 1 expansion. | Founder (explicit direction 2026-08-23) |

---

## Phase 5 — Commercial Report + Client/Consumer Completion Exception (2026-08-24)

### Governance Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-052 | 2026-08-24 | PROD | LOCKED | BD-13 BOUNDED EXCEPTION: Engineering authorized for exactly four items — (1) consumer app completion/UX polish, (2) the new Executive Consumer Intelligence Report (extending, not replacing, the existing report implementation), (3) limited client/brand-account monitoring capability, (4) small directly-blocking real-pilot fixes only where safe within existing architecture. Explicitly excludes: website, self-service campaign/survey/report builder, rewards economics, media/gallery backend, generic admin/CRM, V2+ expansion, architecture rewrite. BD-13 resumes for everything outside this scope once this exception's work concludes. | Founder issued this bounded exception directly, in the same DL-051 pattern, to move from the closed V0.5 foundation toward commercial report/report-quality readiness without reopening broad Track 1 engineering. | Founder (explicit direction 2026-08-24) |
| DL-053 | 2026-08-24 | TECH | LOCKED | Under DL-052 scope item 2: extended `AiReport` with a nullable `narrativeAr` column and generate bilingual (EN+AR) narratives per campaign; softened Recommendations/Key-Findings language in `Report.tsx` to hedge on sample size and stop presenting sample composition as market proof; added a minimum-quality gate to the `q5` verbatims filter in `analytics.service.ts`; conditioned the Audience Profile intro in `Report.tsx` on `campaign.isDemo` so it no longer unconditionally claims verified/OTP-authenticated participation for demo data. These four fixes correspond exactly to the three confirmed D-028 issues (audience-claim contradiction, English-only Arabic Executive Summary, unfiltered verbatims) plus evidence-proportionate recommendation language, implemented by extending the existing report rather than building a parallel system. | D-028's confirmed issues were the most concrete, already-diagnosed, smallest-safe-change item within DL-052's report scope; extending the existing implementation avoided a second reporting architecture. | Claude Code (session, DL-052 authorized) |

---

## Phase 6 — V1 Commercial Product Build, Bounded Increment (2026-08-24)

### Governance Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-054 | 2026-08-24 | PROD | LOCKED — BOUNDED EXCEPTION | BD-13 exception, following the DL-052 pattern, for exactly four coordinated workstreams: (1) consumer product experience polish where a real gap exists (no blanket redesign), (2) client account/monitoring evolution using only existing API/data — specifically campaign-history navigation via a `?campaignId=` query param across the existing dashboard pages, ownership-enforced server-side, no new routes/entities, (3) commercial report improvement within the existing report architecture only — no new backend aggregation for previously-deferred unsupported metrics (Reach, segment cross-tabs), (4) campaign-level survey configuration using the existing per-campaign `surveyQuestions` jsonb column only — no Survey Builder UI. Explicitly excludes website, self-service campaign/survey/report builders, rewards economics, media/gallery backend, generic admin/CRM, V2+. Each workstream that would require new backend architecture beyond existing data/API is to be documented as a deferred dependency, not built. BD-13 resumes for everything else once this scope's work concludes. | Founder issued this bounded exception directly (same real-time mechanism as DL-051/DL-052) to continue commercial product work incrementally without reopening broad Track 1 engineering. | Founder (explicit direction 2026-08-24) |

---

## Phase 7 — Product Completion: Campaign Operations + Media/Gallery (2026-08-26)

*Governance-only formalization. No product code was changed when this decision was recorded — see `ASSESSMENT_PREPARATION_DECISION_RECONCILIATION_2026-08-26.md` §7, which classified these two items as TACIT / UNFORMALIZED MANAGEMENT CHANGE (not permanently rejected, not previously authorized) after DL-052/DL-054 explicitly excluded them by name.*

### Governance Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-055 | 2026-08-26 | PROD | LOCKED — BOUNDED EXCEPTION | BD-13 exception, following the DL-051/052/054 pattern, for exactly two coordinated Tajribti-internal product-completion workstreams: (1) **Internal Tajribti Campaign Operations** — a bounded internal-operations surface (not brand self-service) for Tajribti's own team, using only the existing campaign domain/API foundations: campaign list, campaign detail, campaign creation via the existing `POST /campaigns` endpoint and `Campaign` entity, campaign status/lifecycle, campaign dates, brand/client association, QR/access operations, participation/operational visibility, and existing report access. (2) **Campaign-oriented Media/Gallery** — Gallery → Campaign → Photos/Videos, presenting/storing campaign/event media organized by campaign; reuse existing infrastructure if present, otherwise implement only the smallest architecture required for this bounded scope. Explicitly excludes: generic Admin/CRM framework, arbitrary user administration, self-service Survey Builder, self-service Campaign Builder as a commercial SaaS model, self-service Report Builder, advanced workflow automation, CRM integrations, billing, payments, enterprise RBAC expansion, social feed/likes/comments/followers/public user-generated content/creator or media marketplace/complex social graph, website (any form), rewards economics, and any other broad V1 or unrelated expansion. This is NOT broad V1 authorization — broad V1 remains governed by the existing Track 0 gates (B-01–B-04). BD-13 resumes for everything outside this two-item scope once this exception's work concludes. | The Discovery-First consumer foundation (DL-050/051) and reporting surfaces (DL-052/053/054) are now complete. Internal campaign operations and campaign-oriented media/gallery were the two remaining Founder-identified product-completion gaps, previously excluded by name from DL-052/054's bounded scope as a scoping boundary for those specific increments, not a permanent rejection. This decision formalizes Founder authorization for exactly these two remaining items as a new bounded increment, without authorizing broad V1 or self-service SaaS functionality. | Founder (explicit direction 2026-08-26, DL-051/052/054 pattern) |

---

## Phase 8 — D-028 Final Closure (2026-08-26)

### Governance Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-056 | 2026-08-26 | TECH | LOCKED | D-028 CLOSURE: full R1–R9 review of the current report source (`Report.tsx`, `report.service.ts`, `analytics.service.ts`) found R1/R2/R3/R4/R5/R7/R9 already RESOLVED in code (notably the R3 consumer-voice quality gate: `MIN_VERBATIM_LENGTH=10` + whitespace check in `analytics.service.ts`, rejecting single-token junk like "test"/"vvgv"). R6 (pagination) was found still genuinely broken — the PDF page-slicing loop could dedicate an entire near-blank trailing page to a small leftover content sliver, reproducing the originally reported "page 4 is almost entirely blank" defect (traced numerically: content at ~3.05×pageHeight height triggers a wasted 4th page for a 0.05×pageHeight sliver) — and was fixed by dropping a dedicated trailing page below a 20mm threshold and ending the true last page's image crop at the content's bottom instead, causing a small deliberate overlap rather than a blank page. Verified via clean `tsc --noEmit -p tsconfig.json` and successful `CI=true npm run build` on `apps/dashboard` (bundle +52B). R8 (per-study adaptability) confirmed PARTIALLY SUPPORTED — works for the current standard survey layout; the `q2`/`q3`/`q5` hardcoded semantic roles remain an explicit non-blocking deferred schema dependency, not fixed, consistent with the standing decision against a generalized Survey/Report Builder. D-028 recorded CLOSED — ACCEPTED WITH ONE DOCUMENTED NON-BLOCKING DEFERMENT (R8); full detail in `OPEN_DECISIONS_TRACKER.md`. | Founder explicitly instructed closing this loop via evidence-based review rather than a further live-review round; the only remaining gap (R6) was small, bounded, and directly traceable to the original complaint, so it was fixed and verified rather than left open for a cosmetic-adjacent reason. | Founder (explicit direction 2026-08-26) / Claude Code (session, this direction authorized) |

---

## Phase 9 — Founder Mobile Request Lock (2026-08-27)

### Governance Decisions

| ID | Date | Category | Status | Decision | Rationale | Authority |
|---|---|---|---|---|---|---|
| DL-057 | 2026-08-27 | PROD | LOCKED | FOUNDER MOBILE REQUEST LOCK: persists the Founder's confirmed Consumer Mobile product boundary for future sessions. Confirmed Mobile product areas (already implemented and verified in `apps/consumer`, none rebuilt or redesigned this session): (1) Discovery-First Home (`home_screen.dart` — campaign list, profile banner, activity preview, QR CTA), (2) Campaign discovery/detail/participation (`campaign_screen.dart`, `survey_screen.dart`), (3) Profile (`profile_screen.dart`), (4) Settings (`settings_screen.dart`), (5) Activity/personal history (`activity_screen.dart`) — confirmed to already BE the Mobile Past Campaigns capability (lists every completed campaign with brand/product/date/points, opens each campaign's detail; not a generic action log), (6) Services/About (`services_screen.dart`). Requested but not automatically authorized for current implementation: (9) Media/Gallery — remains DEFERRED per DL-055's existing scope, not implemented here. Reporting (10): the existing Brand/Client analytics/report/PDF/AI-summary capability (Dashboard) remains the current reporting surface. "Reports" was not separately established as a confirmed Consumer Mobile requirement — a distinct Consumer Mobile Reports screen is NOT authorized by this decision and was correctly not built; it is not treated as missing/blocking, and no Founder decision on its scope is requested or pending. Explicitly out of scope for this Mobile work and untouched: Website, Dashboard, Admin Portal, Web Campaign Management, brand-facing Web Intelligence Reports. | Prevents future sessions from re-litigating already-complete Mobile screens, from miscounting Web/Dashboard work as Mobile completion, from conflating the existing Activity screen's absence-of-a-separate-name with an actual missing Past Campaigns capability, and from over-reading "Reports" as a confirmed Mobile requirement when only the existing Brand/Client reporting capability was ever established. | Founder (explicit direction 2026-08-27, Mobile Request Lock; corrected same-session before commit) |
| DL-058 | 2026-09-01 | TECH | LOCKED | CAMPAIGN MANAGEMENT COMPLETION under DL-055 item 1's existing authorization. Full source audit found campaign CRUD, ownership enforcement, status lifecycle, QR, and campaign-scoped Media/Gallery already implemented (`POST/PATCH/GET /campaigns*`, `CampaignDetail.tsx`, `Gallery.tsx`) — the concrete gap versus the Founder's stated experience was the absence of a single Campaign Management entry point (the only prior campaign list was the informational "Other Campaigns" strip at the bottom of Overview, with no manage affordance) and two content gaps: no product-image field on Create/Edit, no archive/remove mechanism. Added this session, reusing existing architecture only: (1) `Campaigns.tsx` — a campaign list/grid page at `/campaigns`, added as the first CAMPAIGN nav item ("Campaign Management"), showing every campaign on the account with status, product image, and links into the existing Manage/Overview/Media pages — additive, does not replace Overview or Trial QR; (2) Product Image URL field added to `CreateCampaign.tsx` and `CampaignDetail.tsx`'s existing manage form (the `productImage` column/DTO field already existed server-side but no UI wrote to it) — image-URL architecture preserved, no upload/storage subsystem added; Location Name/Address added to the same edit form for the same reason (DTO-supported, UI-missing); (3) a new `archived` `CampaignStatus` value + additive migration (`1788000000000-AddArchivedCampaignStatus`, not yet run against production — Founder/deploy action) so "remove a campaign" is a reversible lifecycle transition through the existing PATCH endpoint, since no hard-delete path exists anywhere in the codebase (redemptions/survey responses/QR codes/reports all FK-reference Campaign) and DL-055 did not establish one; (4) a confirmation prompt before saving a status change to `completed`/`archived`, and before removing a Gallery media item — no state-machine added, any status can still move to any other. Explicit scope note: DL-055 frames this surface as "internal-operations, not brand self-service"; the codebase's actual JWT/ownership model (`req.user.type === 'brand'`, campaigns scoped by `brandAccountId`) already treats the logged-in dashboard user as a brand account with ownership-enforced access, so this reconciles as building CRUD for existing, already-provisioned brand/client accounts — not the excluded self-service signup/SaaS-onboarding model, which remains untouched and unauthorized. `tsc --noEmit` and `CI=true npm run build` clean on both `apps/api` and `apps/dashboard`. | The Founder's request was for actual reachable Campaign Management, not new backend architecture; the audit showed the backend and most UI already existed under DL-055 but were not coherently reachable as one workflow, and two content fields were server-ready but UI-invisible — the smallest change was a list/entry-point page plus filling the two field gaps, not a rebuild. | Founder (explicit direction, this session, DL-055 pattern) / Claude Code (session, DL-055 authorized) |
| DL-059 | 2026-09-01 | TECH | LOCKED | CONTROLLED BRAND PROVISIONING (Pilot Operations Closure): closes the brand-onboarding gap DL-058 flagged as open. Per explicit Founder direction this session, onboarding for the pilot is internal/admin-provisioned, NOT public self-service signup. Audited existing admin architecture first: `AdminController`/`AdminService` already had a working internal-operator authorization primitive (`x-admin-secret` header checked against `ADMIN_SECRET`, already configured in Railway production since it gates `/admin/seed`) and already created `BrandAccount` rows with bcrypt-hashed passwords (`seedDemo()`). Added `POST /admin/brands` (`CreateBrandAccountDto`: name/email/password/optional logoUrl) reusing that exact mechanism and that exact `BrandAccount` creation shape — no new auth system, no second identity model, no RBAC framework. Response returns only `{id, name, email, createdAt}`; password never leaves the service. Runtime-verified end-to-end against the local, non-production `tajribti_demo` DB (test rows deleted after): unauthenticated request → 401; wrong secret → 401; correct secret + valid payload → 201 with no password field; duplicate email → 409; weak password → 400 (DTO validation); the provisioned brand then logged in via the existing `/auth/brand/login`, created a campaign with a product image, PATCHed its own status to the new `archived` value, and a second provisioned brand received 403 attempting to PATCH the first brand's campaign and saw an empty `/campaigns/my` list — full cross-brand isolation confirmed on the real code path, not just by source reading. `tsc --noEmit` + `nest build` clean. Public self-service signup, KYC, billing, and enterprise RBAC remain explicitly out of scope, per this session's direction. | The repository already had every primitive this needed (admin-secret gate, bcrypt brand creation) — the gap was only that provisioning was hardcoded to the single demo brand inside `seedDemo()`, with no way to create a second real one. Reusing the existing mechanism verbatim was the smallest safe change; inventing a new admin auth layer or a public signup flow would both have exceeded this session's explicit scope. | Founder (explicit direction, this session) / Claude Code (session) |

---

## How to Add a Decision

When a new decision is made, add a row to the appropriate section:
1. Assign next sequential ID in the DL- or ADR- series
2. Record exact date
3. Choose category from: BIZ / PROD / TECH / ADR / UX / BRAND / OPS / FIN / OPEN
4. Set initial status: LOCKED (final) or OPEN (pending)
5. State the decision clearly — one sentence, present tense
6. State the rationale — why, not what
7. Note the authority: Founder, IERB, Legal Counsel, etc.
8. If the decision came from a specific document, reference it

**Never edit a past entry. Append reversals and amendments as new rows.**
