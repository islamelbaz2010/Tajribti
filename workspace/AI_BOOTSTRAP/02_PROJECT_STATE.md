# Project State — Current and Only Current

**This file contains ONLY the current state. No historical context. Update when state changes.**  
**Last updated:** 2026-08-23 (Session I — Product Completion V0.5; CONFLICT-D resolved; Discovery-First enabled; real HomeScreen + campaign discovery built)

---

## Product State — CURRENT

```
✅  MEOS v1 COMMERCIAL DEMO — LOCKED + FROZEN
    Branch  : sprint/meos-production-build
    Commit  : 0209b9a ("Finalize commercial demo and one-command launcher")
    Launcher: bash scripts/demo.sh
    Verified: PASS — 49 seeded signals, all 7 screens functional
    Login   : demo@brand.com / Demo1234!
    URL     : http://localhost:3001 (after launcher)
    Signals : 49 simulated consumers — NOT real data

✅  REAL PILOT MVP — DEPLOYED (PARTIALLY READY)
    Branch  : sprint/pilot-readiness-mvp
    Commit  : 67d29d3 (latest — chore: add .railwayignore)
    GitHub  : github.com/islamelbaz2010/Tajribti

    Railway API (LIVE):
      URL      : https://api-production-266c.up.railway.app/api/v1
      Project  : tajribti-pilot
      Service  : api (ff7272bd)
      DB       : PostgreSQL online — 8 tables auto-created (synchronize:true)
      DEMO_MODE: false
      CORS     : https://dashboard-six-flame-wsaixia9cm.vercel.app

    Vercel Dashboard (LIVE):
      URL      : https://dashboard-six-flame-wsaixia9cm.vercel.app
      Project  : dashboard (islam-elbaz-s-projects)
      API_URL  : https://api-production-266c.up.railway.app/api/v1 (baked at build)

    Consumer Web (LIVE — same Vercel URL):
      Entry    : https://dashboard-six-flame-wsaixia9cm.vercel.app/join/:campaignId
      Deep links: handled by vercel.json SPA rewrite

    Flutter Consumer App (apps/consumer):
      Status   : V0.5 PRODUCT COMPLETE (Discovery-First; real HomeScreen; 2026-08-23)
      Screens  : Splash → Home(Discovery) → Campaign → Phone → OTP → Register → Survey → ThankYou
               QR entry: Scanner → Campaign (preserved, unchanged)
      Bilingual: Full AR/EN toggle (LangToggle widget) on every screen
      Font     : Cairo (Google Fonts) applied via MaterialApp theme — proper Arabic typography
      L10n     : AppStr + LangProvider + l10n.dart — complete localization without flutter_localizations
      Persist  : Language preference saved to SharedPreferences across sessions
      Real QR  : Scanner parses URL format QR (/join/:campaignId) used by real campaigns
      Debug text: REMOVED (no demo OTP hint visible to consumers)
      API wiring: getCampaignById + enterCampaign (replaces getDemoActiveCampaign)
      Build flag: --dart-define=API_BASE=https://api-production-266c.up.railway.app/api/v1

    Client Report (apps/dashboard/src/pages/Report.tsx):
      Status   : IMPROVED + BILINGUAL (completed 2026-08-14 Session 2)
      PDF pages: Multi-page A4 pagination (was single tall screenshot)
      Cover    : Dark branded cover with KPI summary (was plain text header)
      Sections : Numbered 01–07, matching directive structure
      Language : EN/AR toggle in action bar — full Arabic RTL report mode
      Font     : Cairo font loaded via Google Fonts CDN in index.html
      Arabic   : Complete section titles, labels, narrative, methodology, findings in Arabic
      PDF name : Stamped with language suffix (-en / -ar) and date

    What is NOT yet operational:
      - Akedly V1.2 OTP production: pipeline 6a8338c061a103e7b2ccc936 NOT ACTIVATED (Dev Mode active)
      - CI APK for V0.5: PENDING (requires commit + push to GitHub Actions)
      - First real brand account: NOT CREATED
      - Real consumer journey (production OTP): NOT VERIFIED (Dev Mode only verified)

    What WAS verified (2026-08-18):
      - OTP Dev Mode: REAL-DEVICE CONFIRMED on OPPO CPH2481 (SMS received: 832719)
      - CI #8: PASSED — APK #8 built and installed on real device
      - Full QR → OTP → Survey → ThankYou flow: CONFIRMED end-to-end

    What WAS fixed/migrated:
      - enterCampaignWeb: fixed to accept DEMO-status QR codes (2026-08-17 Session 4)
      - ML Kit ProGuard: keep rules added — camera scanner confirmed working on OPPO CPH2481 (2026-08-17 Session 4)
      - Demo seed: confirmed running — campaign 9c370244-... ACTIVE, QR tajribti:9c370244-...:demo seeded (2026-08-17)
      - Akedly OTP: MIGRATED from wrong Utilities product to V1.2 REST Authentication (2026-08-17 Session 5)
        → Backend: challenge proxy, PoW forwarding, server-side transactionReqID→phone binding, Akedly verify
        → Flutter: Shield SDK PoW in Isolate, transactionReqID in screen state, new challenge/error UI states
        → Security: API key server-side only, client phone never trusted for JWT identity
        → Removed: TEMPLATE_ID, OTP_VAR, local OTP generation, local OTP DB comparison

⚠️  REAL FIELD PILOT — CONDITIONALLY READY (Verdict B — updated 2026-08-18 Session F)
    Infrastructure: DEPLOYED + BUG-FIXED + AKEDLY V1.2 MIGRATED + HARDENING ACCEPTED + OTP FLOW FIXED
    Akedly V1.2 OTP: CODE COMPLETE + HARDENED + OTP FLOW BUG FIXED — pipeline activation required + commit/push required
    Hardening pass: DEFECT-01 fixed (DEMO_MODE challenge/transactionReqID path); formal report at 16_Reports/AKEDLY_V1_2_HARDENING_ACCEPTANCE_2026-08-17.md
    OTP flow fix: Session F (2026-08-18); Flutter crash on challengeRequired=false fixed; formal report at 16_Reports/OTP_FLOW_FIX_SESSION_F_2026-08-18.md
    Demo seed: CONFIRMED RUNNING (campaign 9c370244-..., QR tajribti:9c370244-...:demo)
    ML Kit scanner: DEVICE-CONFIRMED working on OPPO CPH2481
    Real consumer data: ZERO (no field pilot has happened)
    Next actions (in order):
      1. Activate V1.2 auth pipeline in Akedly dashboard (pipeline 6a8338c061a103e7b2ccc936)
      2. Update Railway AKEDLY_PIPELINE_ID to 6a8338c061a103e7b2ccc936
      3. Remove AKEDLY_TEMPLATE_ID and AKEDLY_OTP_VAR from Railway env vars
      4. Build and distribute new Flutter APK (includes Shield SDK + V1.2 flow)
      5. Test with Dev Mode enabled in Akedly pipeline before real pilot
    Egypt delivery note: WhatsApp requires WABA (not connected); SMS fallback via Smart Routing is active
```

---

## Authorization Status

```
⚠️  TRACK 1 FULL ENGINEERING — NOT AUTHORIZED
    Real Pilot MVP build: COMPLETE (authorized as minimum pilot sprint)
    IERB Re-Audit Score (baseline): 67/100 (pre-demo)
    Track 1 gate: B-01, B-02, B-03, B-04 still open
```

*Source: `13_Audits/REMEDIATION_REAUDIT.md` — Section D (baseline); Real Pilot MVP Final Handoff*

---

## Current Phase

**Product Completion V0.5 + Pilot Activation** — consumer loop built; pipeline activation + brand account required

- Railway API: LIVE at https://api-production-266c.up.railway.app
- Vercel Dashboard: LIVE at https://dashboard-six-flame-wsaixia9cm.vercel.app
- PostgreSQL: ONLINE, schema created, no real data
- V0.5 product: BUILT (Discovery-First HomeScreen, campaign cards, history, return loop)
- Remaining: CI APK build + Akedly pipeline activation + first real brand account

---

## Current Objective

Activate the deployed Real Pilot MVP for one real, controlled brand campaign.

**Remaining activation actions (in order):**
1. Akedly dashboard: Activate pipeline 6a8338c061a103e7b2ccc936 (currently INACTIVE)
2. Railway env vars: Update AKEDLY_PIPELINE_ID to 6a8338c061a103e7b2ccc936
3. Railway env vars: DELETE AKEDLY_TEMPLATE_ID and AKEDLY_OTP_VAR (no longer used by V1.2)
4. Railway redeploy: triggers automatically on env var change
5. Akedly dashboard: Temporarily enable Dev Mode + Bypass PoW for development testing
6. Build new Flutter APK: `flutter build apk --release --dart-define=API_BASE=...`
7. Test end-to-end OTP flow with a real Egyptian phone number (Dev Mode)
8. Akedly dashboard: Disable Dev Mode before real pilot
9. Create first real brand account (Founder provides: brand name, email, password)

Note: AKEDLY_API_KEY is already set in Railway — do NOT change it.

After both: Brand logs in → creates campaign → generates QR → prints on samples → first real consumers scan → real pilot begins.

*Source: Deployment Session, 2026-08-13*

---

## Current Blockers (4 — All Must Be Closed Before Track 1)

| ID | Blocker | Owner | What Closes It |
|---|---|---|---|
| B-01 | Track 0 GO/NO-GO not confirmed | Founder / IC | Written GO confirmation with sprint outcome summary |
| B-02 | Egyptian LLC incorporation unconfirmed | Founder | Commercial register number or formation date |
| B-03 | PDPL written legal sign-off not obtained | Legal counsel (not yet engaged) | Written memo from Egyptian data-privacy lawyer |
| B-04 | QR concurrency load test not executed | CTO (not yet hired) | Load test report showing idempotency holds at target load |

*Source: `15_Decisions/OPEN_DECISIONS_TRACKER.md`; `13_Audits/REMEDIATION_REAUDIT.md` Section B*

---

## Next Milestone

**Track 0 GO Decision** — the master gate for the entire project.

Immediately after GO:
→ Sprint 0 (2 weeks): legal entity, AWS account, Terraform, CI/CD, vendor contracts  
→ Sprint 1–6 (10 weeks): MVP build  
→ Private Beta → Production v1.0  

*Source: `02_Project_Management/MASTER_DELIVERY_PLAN.md` Section 3 — Sprint Schedule*

---

## Current Priority Stack

1. Brand outreach — acquire ≥3–5 pilot LOIs (B2B sales, no app required)
2. LLC formation — enable Sprint 0 vendor contracts
3. PDPL legal review — gate for any data-collecting feature
4. QR load test — after CTO is hired (post-GO)

*Source: `07_Product/GO_TO_MARKET.md` GTM Sequence; `15_Decisions/OPEN_DECISIONS_TRACKER.md`*

---

## Open Decisions (Non-Blocking)

| ID | Decision | Status |
|---|---|---|
| OD-01 | Final legal company name + trademark/domain clearance | OPEN — "Tajribti" is provisional |
| OD-02 | CEO doubles as PM through Year 1, or dedicated PM hired on GO | OPEN |
| OD-03 | Final cloud region (provisionally AWS me-south-1 Bahrain) | PROVISIONAL |
| OD-04 | External funding vs. bootstrapped trajectory | OPEN |
| OD-05 | Revenue-mix percentages per stream | OPEN — depends on Track 0 pricing discovery |

*Source: `_navigator/DECISION_STATUS_BOARD.md`; `15_Decisions/OPEN_DECISIONS_TRACKER.md`*

---

## What Has Been Completed

| Done | Not Done |
|---|---|
| Investment due diligence (18 phases, 19K words) | Primary customer interviews |
| Peer review + corrections | Bottom-up market sizing (TAM/SAM/SOM) |
| Founder Decisions Document (all strategic decisions locked) | Unit economics model |
| Master PRD (22 features, 3 personas, data model, state machines) | Brand pilot commitments |
| Technical Architecture (full stack designed) | PDPL legal review |
| Master Delivery Plan (WBS, sprint 0–6, risks, QA, DevOps) | Legal entity formation |
| Independent Readiness Audit (58/100 → 67/100 after remediation) | QR load test |
| Enterprise Knowledge Workspace (73 files, 24 directories) | Track 1 full engineering |
| **MEOS v1 Commercial Demo** — 7-screen dashboard, NestJS API, 49 seeded signals | — |
| **One-command launcher** — `bash scripts/demo.sh` + `--brand/--product/--location` | — |
| **Consumer Signals design system** — dark theme applied across all screens | — |
| **Real Pilot MVP** — campaign API, mobile web consumer journey, analytics auth, real data | — |
| **Mobile web consumer journey** — QR → phone → OTP → profile → survey → thank-you (Arabic) | — |
| **Analytics/report security** — brand JWT + campaign ownership on all 6 endpoints | — |
| **Intelligence Report upgrade** (2026-08-14) — expanded to 7 sections: executive summary, demographics, intent analysis, consumer voice, key findings, recommendations, methodology | — |
| **CONFLICT-C resolved** — stale Twilio references replaced with Akedly throughout project state docs | — |
| **Flutter consumer app — bilingual AR/EN** (2026-08-14 Session 2) — LangProvider + AppStr + LangToggle + Cairo font; all 8 screens localized; language persisted in SharedPreferences | — |
| **Intelligence Report — Arabic mode** (2026-08-14 Session 2) — EN/AR toggle in dashboard; full RTL direction; complete Arabic translations for all 7 sections; Cairo font via CDN | — |

*Source: `_ai_bootstrap/PROJECT_CONTEXT.md` — What Has Been Done section; Real Pilot MVP Final Handoff*

---

## Team Status

| Role | Status |
|---|---|
| Founder / CEO | Active |
| CTO | Not yet hired (hired on GO) |
| Backend Engineers (×2) | Not yet hired |
| Head of Brand Partnerships | Not yet hired |
| Ops Manager | Not yet hired |
| Data Lead | Not yet hired |
| Field Coordinators (×2) | Not yet hired |
| CFO (fractional) | Not yet engaged |
| Legal Counsel (fractional) | Not yet engaged |

Year-1 team size post-GO: ~10–12 people.  
*Source: `02_Project_Management/MASTER_DELIVERY_PLAN.md` Section 6*

---

## Critical Data Gaps (Nothing in Workspace Answers These)

1. Has any Egyptian competitor implemented app-based physical free-sample distribution at scale? — UNKNOWN
2. Minimum consumer panel size for statistically meaningful segment-level reports — UNKNOWN
3. Actual Egyptian FMCG brand budget for sampling/research — UNKNOWN
4. Real unit economics (CAC, LTV, contribution margin, payback) — UNKNOWN
5. Any brand or consumer interviews — ZERO conducted
6. PDPL legal scope for this specific platform — UNKNOWN

*Source: `14_Memory/MASTER_PROJECT_MEMORY.md` Open Questions; `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` Remaining Unknowns*
