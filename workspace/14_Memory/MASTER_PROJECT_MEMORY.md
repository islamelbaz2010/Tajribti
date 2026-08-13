# Master Project Memory — Tajribti Consumer Intelligence Platform

**Type:** Living memory document — load at the start of every AI session  
**Last updated:** 2026-07-27  
**Update rule:** Append; never delete. Mark stale entries `[SUPERSEDED]` instead of removing.  
**Authority:** This document is authoritative for project context. For binding decisions, defer to `15_Decisions/FOUNDER_DECISIONS.md`.

---

## 1. Project Identity

| Attribute | Value |
|---|---|
| Working name | Tajribti (تجربتي) — "my experience" in Egyptian Arabic |
| Name status | **PROVISIONAL** — trademark and domain clearance pending (FDD OD-01) |
| Category | Egypt's Consumer Intelligence Platform |
| Model | B2B2C — brands pay, consumers receive free products, platform collects post-trial behavioral data |
| Stage | Pre-revenue, pre-product, pre-engineering |
| Current track | Track 0 — $15K–$25K commercial validation sprint (60 days, NO engineering) |
| Next track | Track 1 — Full build — currently **BLOCKED** |
| Reference company | Samplia, Spain (founded 2013, Barcelona, bootstrapped, ~40–50M samples) |
| Nearest competitor | Marketeers Research — Egypt/KSA/GCC, AI-powered "Smart Value™" FMCG analytics |
| Total global competitors | ~127 in sampling-plus-data category; 12 funded |
| Project origin | 3-minute Arabic video of Samplia sampling Mentos in Madrid Gran Via |

---

## 2. Current State — Updated 2026-08-13

```
✅  MEOS v1 COMMERCIAL DEMO — LOCKED + FROZEN
    Branch  : sprint/meos-production-build
    Commit  : 0209b9a ("Finalize commercial demo and one-command launcher")
    Launcher: bash scripts/demo.sh
    Verified: PASS — 49 signals, all 7 screens
    Status  : DO NOT MODIFY

✅  REAL PILOT MVP — READY LOCALLY
    Branch  : sprint/pilot-readiness-mvp
    Commit  : ed72a20 ("feat: Real Pilot MVP — mobile web consumer journey")
    Phase   : Pilot Deployment (NOT yet deployed to cloud)
    Tests   : 7/7 acceptance tests PASS
    Status  : Cloud deployment required before real field pilot can run

⚠️  TRACK 1 FULL ENGINEERING — NOT AUTHORIZED
    IERB Re-Audit Score (baseline): 67/100 (pre-demo)
    4 blocking items remain open: B-01, B-02, B-03, B-04
```

---

## 3. The 4 Blocking Items — What Opens the Gate

| ID | Blocker | What Closes It |
|---|---|---|
| B-01 | Track 0 GO not confirmed | Founder confirms $15K–$25K commercial sprint concluded with GO decision |
| B-02 | Egyptian LLC incorporation unconfirmed | Founder confirms LLC is incorporated (or provides formation date) |
| B-03 | PDPL legal sign-off not obtained | Qualified Egyptian data-privacy lawyer provides written scope opinion |
| B-04 | QR concurrency load test not run | Engineering team executes load test (requires engineers — not yet hired) |

**Note:** B-04 cannot be closed until B-01 is closed (engineers hired on GO confirmation).

---

## 4. Document Authority Chain

When documents conflict, the following hierarchy governs:

```
1. Founder Decisions Document (FDD)          ← highest authority
   └── 15_Decisions/FOUNDER_DECISIONS.md
2. IC Due Diligence Report v2.0              ← investment thesis / market analysis
   └── 04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md
3. IERB Remediation & Re-Audit              ← current authorization status
   └── 13_Audits/REMEDIATION_REAUDIT.md
4. Master PRD v1.0                           ← product requirements
   └── 08_PRD/MASTER_PRD_v1.0.md
5. Technical Architecture v1.0               ← technical decisions
   └── 09_Technical/TECHNICAL_ARCHITECTURE.md
6. Master Delivery Plan v1.0                 ← execution plan
   └── 02_Project_Management/MASTER_DELIVERY_PLAN.md
```

---

## 5. What Must Never Be Forgotten

| # | Rule |
|---|---|
| 1 | This is NOT a sampling company. Category: Consumer Intelligence Platform |
| 2 | Brands pay. Consumers NEVER pay. This is non-negotiable per FDD. |
| 3 | "Tajribti" is a working name. Never use it in legal filings or code repos as confirmed. |
| 4 | MEOS v1 demo FROZEN (commit 0209b9a). Real Pilot MVP READY LOCALLY (commit ed72a20). Track 1 full engineering NOT authorized until B-01 through B-04 are closed. Next step: deploy pilot, not build new features. |
| 5 | ALL financial figures in all documents are ILLUSTRATIVE — zero validated unit economics exist. |
| 6 | Samplia is bootstrapped (not VC-backed). Its growth curve is a services company, not a venture one. |
| 7 | Marketeers Research is a near-direct competitor. "No direct competitor in Egypt" claim is INCORRECT. |
| 8 | The Founder is an operator-type founder, not a venture fundraiser. Frame advice for capital efficiency. |
| 9 | Track 0 first. Do not skip to Track 1 discussion until B-01 is closed. |
| 10 | MEOS v1.0.1 is production-certified and ready to use. Sales Execution Pack is APPROVED (97/100). Founder outreach may begin immediately. |
| 11 | B-IDs in `READINESS_AUDIT.md` use HISTORICAL numbering (old audit). Current blocking items use `OPEN_DECISIONS_TRACKER.md` B-IDs. Never confuse the two. |

---

## 6. Verified External Facts

| Fact | Source | Confidence |
|---|---|---|
| Samplia founded 2013, Barcelona/Madrid | Crunchbase | HIGH |
| Samplia founders: Arnau Lahuerta Tarré, Robert Bonada, Paula Torrell Rojas | Public records | HIGH |
| Samplia is unfunded / self-financed | Tracxn | HIGH |
| Samplia scale: ~40–50M samples, 300–400+ brands, ~2M app users | Trade materials | MEDIUM (range) |
| ~127 global competitors in sampling+data category; 12 funded | Tracxn | MEDIUM |
| Marketeers Research — Egypt/KSA/GCC/Europe — Smart Value™ FMCG AI platform | Independent | HIGH |
| Egypt target consumer: primarily lower-end Android devices | Market context | HIGH |
| Egypt payment rails: Vodafone Cash, InstaPay | Market context | HIGH |
| AWS me-south-1 = Bahrain — provisional PDPL-compliant region | Remediation doc | PROVISIONAL |

---

## 7. Corrections — Errors Fixed in Peer Review

These errors appeared in early source documents (IC Template, IC v1.0 PDF) and were corrected in the Peer Review Master Report. They must never be re-introduced.

| Wrong | Correct |
|---|---|
| Samplia founded 2018 or "2019 per website" | Founded 2013 |
| Samplia founders "unavailable" | Arnau Lahuerta Tarré, Robert Bonada, Paula Torrell Rojas |
| Samplia funding "unavailable" | Bootstrapped / self-financed |
| "No direct competitor with same integration in Egypt" | INCORRECT — Marketeers Research is near-direct |
| Global competitors not quantified | ~127 globally, 12 funded |
| statistics.json: `samplia_founded: 1013` | Fixed to `2013` |
| Broken link: IC_MEMO_FINAL_v1.0.md | Fixed to IC_MEMO_v1.0.md |

---

## 8. Locked Technology Decisions

| Decision | Value |
|---|---|
| Core API | NestJS — modular monolith (not microservices) |
| AI service | Python / FastAPI satellite service |
| Consumer app | Flutter (cross-platform iOS + Android) |
| Brand dashboard | React (desktop-first web) |
| Database | PostgreSQL on AWS RDS Multi-AZ |
| Queue | AWS SQS (cross-module) + BullMQ (internal) |
| Cache | Redis via AWS ElastiCache |
| Cloud | AWS (Bahrain me-south-1, provisional) |
| IaC | Terraform |
| AI providers | OpenAI + Anthropic (multi-provider, no lock-in) |
| Primary keys | UUID v4 on all entities |
| Pagination | Cursor-based (never offset) |
| Soft-delete | All entities soft-delete (PDPL compliance) |
| Money | Integer fields (no float rounding) |
| Deployments | AWS ECS + rolling deploys |

---

## 9. Locked Business Decisions

| Decision | Value |
|---|---|
| Year 1 market | Cairo only |
| Year 2 expansion | Alexandria, Giza, New Cairo, 6th October |
| GCC gate | Egypt unit economics proven — hard gate, not calendar date |
| Out of scope Y1–3 | Healthcare, insurance, banking, telecom, government, education |
| Pricing | Brands pay; consumers never pay |
| Exit A | Strategic acquisition (NielsenIQ, Kantar, Circana, MENA media group) |
| Exit B | Sustained independent profitability as regional data company |
| Rejected | Venture-style forced-exit timeline |
| Funding | Capital-efficient, bootstrapped trajectory. Raise only to hit next milestone. |

---

## 10. Key Product Facts

- **22 features** defined in PRD, organized across 8 Epics
- **3 personas:** Mona (consumer), Ahmed (brand manager), Yasmine (admin)
- **MVP scope:** Admin portal + brand dashboard + consumer app + QR redemption + 3–5 question survey + basic analytics
- **Out of MVP:** Permanent kiosks, owned logistics, e-commerce, paid consumer subscriptions, non-FMCG verticals
- **TJ-005 (QR Redemption)** is the highest-risk feature — requires load test before beta
- **TJ-018 (AI Insight Narratives)** and **TJ-021 (Fraud Detection)** are the two AI-critical features
- **Highest technical risk:** Race condition on concurrent QR redemptions at physical events

---

## 11. Open Questions (No Answer in Any Document)

| # | Question | Why It Matters |
|---|---|---|
| 1 | Has any Egyptian competitor implemented app-based physical free-sample distribution? | Competitive positioning may need updating |
| 2 | Minimum consumer panel size for statistically meaningful segment-level reports? | Core product promise depends on this |
| 3 | Actual Egyptian FMCG brand budget for sampling/research (real market data)? | Pricing strategy built on estimates |
| 4 | Actual unit economics at Cairo MVP scale (CAC, LTV, contribution margin, payback)? | All projections are illustrative until Track 0 |
| 5 | Have any brand prospects been interviewed? Any consumers interviewed? | Zero primary research conducted |
| 6 | Egypt PDPL legal exposure for demographic profiling + location tracking? | Gate requirement — cannot build without answer |

---

## 12. How This Founder Works

- Uses Claude and ChatGPT as primary thinking and analysis tools
- Works methodically through structured frameworks (18-phase prompt, peer review prompt)
- Values evidence discipline — FACT / ESTIMATE / ASSUMPTION distinctions are important
- Has already completed a full IC analysis, readiness audit, and remediation cycle before this workspace
- Values organized, permanent knowledge over ephemeral chat history
- Operates at operator-founder pace: structured, methodical, capital-efficient
- This workspace IS the project until Track 1 is authorized

---

## 13. Project Genesis

The entire project originated from a 3-minute Arabic-language video showing a Samplia sampling activation for Mentos in Madrid's Gran Via. The original concept was transcribed and fed through an 18-phase ChatGPT due diligence prompt. Two rounds of analysis + peer review produced the original investment documents. All 14 source files in `inbox/` were produced in that process or immediately after. This workspace was then built from those 14 files.

---

## 14. Workspace Metadata

| Attribute | Value |
|---|---|
| Source files | 14 (inbox/ — immutable) |
| Workspace files | 120+ |
| Folders | 25+ |
| Repository version | v4.2 |
| Quality score | 91/100 (v2.0 audit) |
| AI Bootstrap files | 21 (in AI_BOOTSTRAP/ — v1.1 FROZEN) |
| Indexes | 10 (in _navigator/) |
| JSON data files | 7 (in _structured_data/) |
| Workspace created | 2026-07-26 |
| Last audited | 2026-07-27 (Repository Intelligence Audit v4.2 + Remediation Execution) |

---

## 15. Track 0 Commercial Toolkit Status (Added v4.2 — 2026-07-27)

| Item | Status | Details |
|---|---|---|
| MEOS v1.0.1 workbook | PRODUCTION CERTIFIED | 9/9 quality gates. 5 sheets, 14 pre-seeded brands, 16 named ranges. Kill Criterion at `Pipeline!B12`. |
| Sales Execution Pack | APPROVED — 97/100 | PAR 10/10 gates. P-01 (income segment in PDPL Brief) and P-02 (LOI Column I dropdown) both verified applied. |
| Sales Playbook | APPROVED | 5-stage brand acquisition process. Scripts, objections, MEOS workflow all complete. |
| Brand OnePager | APPROVED | Client-facing brief — send to brand prospects after first call. |
| LOI Template | APPROVED | 3 package tiers, commercial terms, timeline. Non-binding for Track 0. |
| PDPL Lawyer Brief | APPROVED | Brief ready to send to Egyptian data-privacy lawyer — closes B-03. |
| Egyptian LLC Checklist | APPROVED | Step-by-step incorporation guide — closes B-02. |

**Founder outreach may begin immediately. No further documentation is required.**

---

## 16. Session Close Record — Session C (2026-08-13)

**Session type:** MEOS v1 Commercial Demo Build + Finalize + Lock

### Verified State at Session Close

| Item | Value |
|---|---|
| Branch | sprint/meos-production-build |
| Last verified commit | 0209b9a "Finalize commercial demo and one-command launcher" |
| Demo status | LOCKED — VERIFIED PASS |
| Demo launcher | `bash scripts/demo.sh` |
| Personalization flags | `--brand / --product / --location` |
| Demo login | demo@brand.com / Demo1234! |
| Dashboard URL | http://localhost:3001 (after launcher) |
| Canonical brand | Sprite Zero Egypt / Sprite Zero Sugar / City Stars Mall — Ground Floor Atrium |
| Seed count | 49 simulated consumers — NOT real data |

### Completed Work — Do Not Repeat

| Component | What Was Done |
|---|---|
| Insights.tsx | Chart tooltip dark theme (CHART_TOOLTIP constant with all 4 properties) |
| Insights.tsx | "PRIMARY TARGET SEGMENT" replaced with two factual independent-distribution cards |
| SurveyResults.tsx | Chart tooltip dark theme |
| Layout.tsx | Consumer Signals full redesign (NAV_SECTIONS, sidebar, live DEMO badge) |
| index.css | Dark body + signalRing keyframes |
| Overview.tsx | SignalFlowStrip, SignalHero, MetricCard, FeedRow redesign |
| Login / CampaignDetail / AiSummary / Participants / Report | Consumer Signals dark theme |
| scripts/demo.sh | NEW — one-command launcher with personalization flags |
| scripts/run-demo.sh | RETRIES=90; HTTP 404 accepted as backend-ready signal |
| scripts/seed-demo.sh | Deterministic phone +20100NNNNNN; fixed health-check status logic |
| scripts/verify-env.sh | `flutter --version \|\| true` to suppress pipefail exit 255 |
| admin.service.ts | Deterministic phone; AiReport FK deleted first in resetDemo() |
| admin.module.ts | AiReport injected into TypeOrmModule and constructor |

### Intentional Dirty State (not in commit 0209b9a)

- `workspace/Sales_Execution_Pack/02_Brand_OnePager.md` — founder PII fill-in (Islam ElBaz, 01090677722) — excluded deliberately
- `apps/api/.env` — NEVER commit (demo brand identity config lives here, not in git)
- Various workspace files with minor MEOS sprint doc updates

### Canonical Demo Commands

```bash
# Standard demo (Sprite Zero canonical)
bash scripts/demo.sh

# Client-personalized demo
bash scripts/demo.sh --brand "Coca-Cola Egypt" --product "Coca-Cola Zero Sugar" --location "City Stars Mall"

# Restore canonical
bash scripts/demo.sh
```

### Security Rules (Permanent — Never Violate)

- NEVER commit `apps/api/.env`
- NEVER commit `.DS_Store` or `.akwb/` artifacts
- 49 seeded consumers = SIMULATED DATA — never describe as real
- NEVER hardcode prospect names in source files
- NEVER commit client-specific configuration
- NEVER represent Sprite Zero as a Tajribti customer or imply the campaign actually happened

---

---

## 17. Session Close Record — Session D (2026-08-13)

**Session type:** Real Pilot MVP Implementation + Sprint Closure

### Verified State at Session Close

| Item | Value |
|---|---|
| Branch | sprint/pilot-readiness-mvp |
| Commit | ed72a20 "feat: Real Pilot MVP — mobile web consumer journey" |
| Base | 0209b9a (sprint/meos-production-build) |
| Real Pilot MVP | READY LOCALLY — 7/7 acceptance tests PASS |
| Commercial demo | FROZEN — bash scripts/demo.sh → 49 signals, DEMO badge, all screens |
| TypeScript | CLEAN (API + Dashboard) |
| Cloud deployment | NOT EXECUTED |
| Real field pilot | NOT YET RUN |

### Completed Work — Do Not Repeat

| Component | What Was Done |
|---|---|
| campaign.service.ts | `createCampaign()`, `findByBrand()`, `DEFAULT_SURVEY_QUESTIONS` |
| campaign.controller.ts | `POST /campaigns`, `GET /campaigns/my`, `GET /campaigns/:id` (public) |
| campaign/dto/create-campaign.dto.ts | NEW — class-validator DTO |
| qr.service.ts | URL payload for real campaigns; JSON payload for demo; `enterCampaignWeb()` |
| qr.controller.ts | `POST /qr/enter/:campaignId` (consumer JWT, idempotent) |
| analytics.controller.ts | All 4 routes: removed @Public(), added brand JWT + ownership check |
| analytics.service.ts | `assertBrandOwnership()` + Campaign repo injected |
| analytics.module.ts | Campaign added to TypeOrmModule.forFeature |
| report.controller.ts | Both routes: removed @Public(), added brand JWT + ownership check |
| report.service.ts | `assertBrandOwnership()`; fallback narrative rewritten (no demo language) |
| admin.service.ts | `resetDemo()` fixed — clears all campaigns under demo brand (not just isDemo:true) |
| .env.example | `CONSUMER_WEB_URL` documented |
| dashboard/src/api/types.ts | `SurveyQuestion` interface; `isDemo`, `surveyQuestions` added to Campaign |
| dashboard/src/api/endpoints.ts | `getMyActiveCampaign()`, `getById()`, `create()` |
| dashboard/src/components/Layout.tsx | DEMO badge conditional on `isDemo`; uses `getMyActiveCampaign()` |
| 7 dashboard pages | All replaced `getDemoActive()` → `getMyActiveCampaign()` |
| dashboard/src/App.tsx | `/join/:campaignId/*` route tree added |
| consumer/JoinLayout.tsx | NEW — RTL shell, ConsumerJourneyContext, consumerPost() utility |
| consumer/JoinPage.tsx | NEW — campaign landing, "ابدأ التجربة" |
| consumer/PhonePage.tsx | NEW — Egyptian phone entry → POST /auth/otp/request |
| consumer/OtpPage.tsx | NEW — OTP verify → POST /auth/otp/verify → POST /qr/enter/:campaignId |
| consumer/RegisterPage.tsx | NEW — name, ageRange, gender, city → POST /auth/register |
| consumer/SurveyPage.tsx | NEW — 4 question types, progress bar → POST /survey/submit |
| consumer/ThankYouPage.tsx | NEW — ✓ confirmation, reward points, brand name |

### Intentional Dirty State (not committed)

- `workspace/Sales_Execution_Pack/02_Brand_OnePager.md` — founder PII (Islam ElBaz, 01090677722, islam.elbaz2010@gmail.com) — excluded deliberately
- `apps/api/.env` — NEVER commit
- `apps/dashboard/.env` — NEVER commit
- `EBOS/.DS_Store`, `workspace/.DS_Store`, other .DS_Store files — never commit
- `.akwb/`, `.demo-logs/` — never commit

### Known Limitations for Next Session

| # | Limitation | Resolution Path |
|---|------------|-----------------|
| L-01 | No brand self-registration UI | P1 — after field pilot |
| L-02 | No campaign management UI | P1 — after field pilot |
| L-03 | `GET /campaigns` (findActive) unfiltered | P2 |
| L-04 | OTP static `0000` in DEMO_MODE=true | Set DEMO_MODE=false + Twilio for field |
| L-05 | No PDPL consent screen | P2 |
| L-06 | TypeORM synchronize:true in dev | P2 — generate migrations before cloud deploy |
| L-07 | Admin endpoints unauthenticated | P2 |

---

## Update Log

| Date | Update |
|---|---|
| 2026-07-27 | Initial MASTER_PROJECT_MEMORY.md created — consolidates PROJECT_MEMORY.md with additional context |
| 2026-07-27 | v4.2 update — added rules 10 and 11 (MEOS/Sales Pack status, B-ID numbering conflict), updated workspace metadata, added Section 15 Track 0 commercial toolkit status |
| 2026-08-13 | v4.4 update — Section 2 updated to reflect MEOS v1 demo LOCKED; Rule 4 updated; Section 16 session close record added |
| 2026-08-13 | v4.8 update — Section 2 updated to reflect Real Pilot MVP READY LOCALLY; Rule 4 updated; Section 17 session close record added |

*Load this file at the start of every session. If any fact here conflicts with current source documents, update this file — do not rely on a stale memory.*
