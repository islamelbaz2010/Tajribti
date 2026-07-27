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

## 2. Current Authorization Status

```
❌  DEVELOPMENT NOT AUTHORIZED
    IERB Re-Audit Score: 67/100 (was 58/100)
    4 blocking items remain open
    Track 0 commercial validation is the only authorized activity
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
| 4 | Development is NOT authorized. No production code. No engineering hiring. Until B-01 through B-04 are closed. |
| 5 | ALL financial figures in all documents are ILLUSTRATIVE — zero validated unit economics exist. |
| 6 | Samplia is bootstrapped (not VC-backed). Its growth curve is a services company, not a venture one. |
| 7 | Marketeers Research is a near-direct competitor. "No direct competitor in Egypt" claim is INCORRECT. |
| 8 | The Founder is an operator-type founder, not a venture fundraiser. Frame advice for capital efficiency. |
| 9 | Track 0 first. Do not skip to Track 1 discussion until B-01 is closed. |

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
| Workspace files | 65+ |
| Folders | 22 |
| Quality score | 91/100 (post-audit) |
| AI context files | 7 (in _ai_bootstrap/) |
| Indexes | 10 (in _navigator/) |
| JSON data files | 7 (in _structured_data/) |
| Workspace created | 2026-07-26 |
| Last audited | 2026-07-27 |

---

## Update Log

| Date | Update |
|---|---|
| 2026-07-27 | Initial MASTER_PROJECT_MEMORY.md created — consolidates PROJECT_MEMORY.md with additional context |

*Load this file at the start of every session. If any fact here conflicts with current source documents, update this file — do not rely on a stale memory.*
