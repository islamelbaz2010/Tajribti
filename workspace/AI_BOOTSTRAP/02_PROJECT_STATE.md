# Project State — Current and Only Current

**This file contains ONLY the current state. No historical context. Update when state changes.**  
**Last updated:** 2026-09-01 (DL-059 Controlled Brand Provisioning, on top of DL-058 Campaign Management completion; see delta blocks below. Blocks after these are superseded where they conflict.)

---

## CURRENT SESSION DELTA — 2026-09-01, second pass (Pilot Operations Closure / DL-059)

Closed the brand-onboarding gap DL-058 flagged as open, per explicit Founder direction that pilot onboarding is internal/admin-provisioned, not public self-service signup:

- Audited existing admin architecture first (as directed) rather than assuming `POST /admin/seed` was reusable as-is: found `AdminController`/`AdminService` already had a working internal-operator authorization primitive (`x-admin-secret` header vs. `ADMIN_SECRET` — already configured in Railway production, since it gates `/admin/seed`) and already created `BrandAccount` rows with bcrypt-hashed passwords inside `seedDemo()`.
- Added `POST /admin/brands` (`CreateBrandAccountDto`) reusing that exact mechanism/shape. No new auth system, no second Brand identity model, no RBAC. Response is `{id, name, email, createdAt}` only — password never returned.
- **Runtime-verified end-to-end**, not just source-read: started the API locally against the local, non-production `tajribti_demo` DB (port 3010 — port 3000 was occupied by an unrelated project's dev server, left untouched) and confirmed: unauthenticated → 401; wrong secret → 401; valid request → 201 with no password in the response; duplicate email → 409; weak password → 400. The provisioned brand then logged in via the existing `/auth/brand/login`, created a campaign with a product image, and set its own status to `archived` (confirms the DL-058 migration's enum value is correct, via local `synchronize:true`). A second provisioned brand got 403 attempting to PATCH the first brand's campaign and saw an empty `/campaigns/my` — cross-brand isolation confirmed on the real code path. All test rows deleted from the local DB afterward; local server cleanly stopped.
- Also confirmed Consumer Mobile compatibility: the Flutter app's only campaign-status check is `status != 'active'` (gates "Start Trial"), and public campaign discovery is already server-filtered to `status = active` — the new `archived` value needs no Consumer Mobile change and none was made.
- `tsc --noEmit` + `nest build` clean. No dashboard, consumer, MEOS, or deployment changes this pass.

Full detail: `DECISION_LOG.md` DL-059.

---

## CURRENT SESSION DELTA — 2026-09-01 (READ THIS FIRST)

Under DL-055 item 1's existing authorization ("Internal Tajribti Campaign Operations" — bounded, existing-account-scoped, not self-service brand signup), this session closed the gap between "campaign CRUD exists in the API/DB" and "a brand can actually operate Campaign Management as one coherent workflow":

- Full source audit (Campaign entity/DTOs/controller/service, Dashboard pages, nav, routing) found create, ownership-enforced edit, status lifecycle, QR generation/print, and campaign-scoped Media/Gallery already implemented from prior DL-055 work. The concrete missing piece was reachability: the only existing campaign list was an informational "Other Campaigns" strip at the bottom of Overview, with no manage affordance and no dedicated entry point.
- Added `Campaigns.tsx` — a campaign list/grid page at `/campaigns`, now the first CAMPAIGN nav item ("Campaign Management"). Additive; Overview and Trial QR pages unchanged in behavior.
- Added the two content gaps found: Product Image URL field on both Create and Edit (the `productImage` column/DTO already existed server-side, no UI wrote to it — image-URL architecture preserved, no upload subsystem added), and Location Name/Address on Edit (same pattern).
- Added `CampaignStatus.ARCHIVED` + additive migration `1788000000000-AddArchivedCampaignStatus` as the archive/soft-delete mechanism, since no hard-delete path exists anywhere in the schema (redemptions/survey/QR/reports FK-reference Campaign) and none was invented. **Migration has NOT been run against the production Railway DB this session — no production DB credentials in this environment; this is a Founder/deploy action** (`npm run migration:run` in `apps/api`, or run at next deploy before any UI sets status to `archived`).
- Added confirm-before-save on lifecycle-ending status changes (`completed`/`archived`) and confirm-before-remove on Gallery media.
- `tsc --noEmit` and `CI=true npm run build` clean on both `apps/api` and `apps/dashboard`.
- Brand onboarding/self-service signup audited and confirmed still absent (only `POST /auth/brand/login` exists; the only account-creation path is the demo-seed admin endpoint). Intentionally NOT built — this is the excluded "self-service Campaign Builder as a commercial SaaS model" territory from DL-055, and requires a Founder policy decision (see DL-058 in `DECISION_LOG.md`), not an engineering default.
- No consumer/Flutter, MEOS, or Vercel/Railway deployment action taken.

Full detail: `DECISION_LOG.md` DL-058.

---

## CURRENT SESSION DELTA — 2026-08-24 (READ THIS FIRST)

```
Branch : sprint/pilot-readiness-mvp
HEAD   : dccd79c49bfce9e37610ed3bef68181433721d57
Pushed : df9baa3f013dc051fadbd16922cf785d8b891eb2 (origin/sprint/pilot-readiness-mvp)
```

**5 commits exist locally on top of the last-pushed commit, NOT yet pushed:**
`1e0c9d1` → `b3dec75` → `9fab41e` → `8b77942` → `dccd79c`

Under bounded Founder exceptions **DL-052** and **DL-054** (both LOCKED in `FOUNDER_DECISIONS.md`/`DECISION_LOG.md` Phase 5–6), this session:
- Closed all 4 DL-052 items (consumer UX PASS, report remediation COMPLETE, client monitoring COMPLETE, real-pilot blockers: none found).
- Fixed a real client-facing data-integrity defect: `CampaignDetail.tsx` unconditionally labeled real campaigns "· DEMO".
- Surfaced existing campaign history (`GET /campaigns/my` already returned it; UI discarded all but the first result) and made it navigable across every dashboard page via `?campaignId=`.
- Found and fixed a real defect in that same navigation work: a brand could see another brand's campaign identity (name/product/location — not their data, which stayed ownership-protected) by editing the URL. Fixed same session, before push.
- Extended the existing report (not rebuilt): added a "Research Objective" section (standard Tajribti trial-methodology framing, not a fabricated campaign-specific objective) and a Campaign Period field on the cover, both from data that already existed.
- A full pre-push consolidation review (git integrity, security/ownership, unintended-file check, fresh `tsc`+build validation) passed clean: **READY FOR PUSH**, but the push itself was never executed — that is a Founder decision, not made this session.

**DO NOT REPEAT:** the DL-052/DL-054 audits, the 9fab41e/8b77942 review, or the report-section gap analysis — all already done exhaustively this session. Re-litigating them from scratch wastes a session; read `DECISION_LOG.md` Phase 5–6 and this block first.

**Explicitly deferred, not built, documented as real dependencies (not blockers to push):** Segment Insights / Purchase-Intent-by-Segment (needs new `analytics.service.ts` aggregation), survey analytics semantic-role mapping (`q2`/`q3`/`q5` hardcoded — fine while the live campaign uses the standard layout, would need a schema decision otherwise), PDF pagination rework (cosmetic, not content-blocking).

**Everything below this delta block reflects pre-2026-08-24 state and may be stale where it conflicts with the above** (e.g. `HEAD ad71117` and "no post-V0.5 engineering exception exists" below — both superseded by DL-052/DL-054 and the commits listed here).

---

## Product State — CURRENT (pre-DL-052 snapshot, see delta above for what changed since)

```
✅  MEOS v1 COMMERCIAL DEMO — LOCKED + FROZEN
    Branch  : sprint/meos-production-build
    Commit  : 0209b9a ("Finalize commercial demo and one-command launcher")
    Launcher: bash scripts/demo.sh
    Verification: Source-verified post-fix; read-only verify-env passes 15/15, but runtime commercial-demo dry run remains blocked because the launcher resets/reseeds and no isolated runtime is documented
    Login   : demo@brand.com / Demo1234!
    URL     : http://localhost:3001 (after launcher)
    Signals : 49 simulated consumers — NOT real data

✅  REAL PILOT MVP / V0.5 BOUNDED FOUNDATION — CLOSED FOR BOUNDED SCOPE
    Branch  : sprint/pilot-readiness-mvp
    Commit  : ad71117fe4d7db2fa59bd9a476684cd95607e440 (completed-state auth routing correction)
    GitHub  : github.com/islamelbaz2010/Tajribti

    Railway API (LIVE):
      URL      : https://api-production-266c.up.railway.app/api/v1
      Project  : tajribti-pilot
      Service  : api (ff7272bd)
      DB       : PostgreSQL online — 8 tables auto-created (synchronize:true)
      DEMO_MODE: false
      CORS     : https://dashboard-six-flame-wsaixia9cm.vercel.app

    Vercel Dashboard (LIVE — redeployed 2026-08-23):
      URL      : https://dashboard-six-flame-wsaixia9cm.vercel.app
      Project  : dashboard (islam-elbaz-s-projects)
      API_URL  : https://api-production-266c.up.railway.app/api/v1 (baked at build)
      Deploy ID: dpl_9UNY4vGTgtX36pXNozgfecjYN3nW
      Source   : HEAD 9d6b33c — includes Intelligence Report improvements (b8b461b + 9cd1fc2)
      Report   : 7-section bilingual EN/AR · Cairo typography · A4 PDF · branded cover — NOW LIVE
      D-028    : CLOSED 2026-08-26 — accepted with one documented non-blocking deferment (R8 per-study adaptability). R6 pagination defect (near-blank trailing page) found and fixed same session. See OPEN_DECISIONS_TRACKER.md / DECISION_LOG.md Phase 8 (DL-056).

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

    V0.5 BOUNDED CLOSURE: CLOSED (2026-08-23)
      - Founder-confirmed device path: Home → completed Sprite Zero → Campaign Detail → Already Participated → Home → re-entry → Already Participated
      - Survey did not open; no new reward appeared; balance remained 50 points; Home remained usable
      - Source implementation preserves alreadyCompleted through CampaignScreen, OTP, and Register paths
      - Multi-campaign reward validation remains BLOCKED/UNVERIFIED because no approved non-destructive campaign-creation workflow exists
      - 409 duplicate-submission behavior remains SOURCE-VERIFIED, not device-reproduced
      - Natural access-token expiry/refresh remains SOURCE-VERIFIED, not naturally reproduced
      - Production Akedly/provider configuration remains externally unverified where records conflict

    DO NOT BUILD AGAIN — V0.5 FOUNDATION
      - Discovery-First Home, campaign discovery, campaign detail, reward display, how-it-works, Start Trial
      - OTP/Register, JourneySession, Survey, Thank You, Return Home, AR/EN, empty/error states, QR secondary entry
      - My Activity/history and Activity campaign navigation
      - JWT refresh, alreadyCompleted handling, Already Participated state, 409 defense, reward-points mapping
      - Existing dashboard login, overview, Campaign Detail/Trial QR, Insights, Survey Results, Participants, AI/fallback summary, Campaign Report, and PDF rendering
      - These areas may receive a proven defect fix or validation, but are not new feature work

    Historical implementation evidence retained below for traceability; it is not current backlog:
    What WAS confirmed 2026-08-23 (commit 421d7aa → replaced by c734d39):
      - CI Run #10: PASS on commit 421d7aa2
      - APK #10 installed on TKINR8IJ5D9DSKQK — real device flow confirmed no crashes
      - BUT: device testing revealed 4 product-level semantic bugs (see commit c734d39)

    Historical implementation record — commit c734d39; CI Run #11 subsequently PASS, followed by later Run #13 and Run #14 build/install evidence:
      - Backend: POST /auth/refresh endpoint (JWT_REFRESH_SECRET; stateless; @Public)
      - Backend: enterCampaignWeb returns alreadyCompleted flag (loads surveyResponse relation)
      - Flutter: Dio 401 interceptor silently refreshes access token; OTP no longer required on expiry
      - Flutter: campaign_screen shows "Already Participated" when alreadyCompleted=true
      - Flutter: survey_screen 409 → "Already Submitted" state (NOT ThankYou false-reward)
      - Flutter: home_screen filters availableCampaigns to exclude participated campaign IDs
      - 9 files; CI Run #11 subsequently PASS

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

⚠️  REAL FIELD PILOT — NOT YET AUTHORIZED / NOT EVIDENCED
    Infrastructure: DEPLOYED + BUG-FIXED + AKEDLY V1.2 MIGRATED + HARDENING ACCEPTED + OTP FLOW FIXED
    Akedly V1.2 OTP: SOURCE INTEGRATION COMPLETE + HARDENED + OTP FLOW BUG FIXED — live provider status requires current external verification
    Hardening pass: DEFECT-01 fixed (DEMO_MODE challenge/transactionReqID path); formal report at 16_Reports/AKEDLY_V1_2_HARDENING_ACCEPTANCE_2026-08-17.md
    OTP flow fix: Session F (2026-08-18); Flutter crash on challengeRequired=false fixed; formal report at 16_Reports/OTP_FLOW_FIX_SESSION_F_2026-08-18.md
    Demo seed: CONFIRMED RUNNING (campaign 9c370244-..., QR tajribti:9c370244-...:demo)
    ML Kit scanner: DEVICE-CONFIRMED working on OPPO CPH2481
    Real consumer data: ZERO (no field pilot has happened)
    The V0.5 device evidence is not evidence of a real field pilot. Field activation remains subject to Track 0, legal, operational, and production-provider gates.
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

**Post-V0.5 Track 0 / Governance Closure** — V0.5 consumer foundation is closed; broad V1 remains gated

- Railway API: LIVE at https://api-production-266c.up.railway.app
- Vercel Dashboard: LIVE at https://dashboard-six-flame-wsaixia9cm.vercel.app
- PostgreSQL: ONLINE; schema created; demo/seed data may exist; no real field-pilot consumer data evidenced
- V0.5 product: CLOSED FOR BOUNDED SCOPE (Discovery-First HomeScreen, campaign cards, history, return loop, completed protection)
- Remaining authorization blockers: B-01/B-02/B-03/B-04; D-028 is CLOSED (2026-08-26, DL-056) and no longer a pending item
- No Campaign B/C creation or multi-campaign data mutation is authorized in this state
- Current pilot commercial materials describe only supported demographics (age, gender, and area); income segmentation is not a V0.5 capability and was not added to the product
- Current commercial execution constraint (RESOLVED 2026-08-27): the client-ready version gate is now 5/5 MET (Flutter-first path, safe runtime, report-quality acceptance, identifiable artifact, known limitations documented — see `16_Reports/SAFE_RUNTIME_DRY_RUN_2026-08-27.md`); customer outreach is therefore AUTHORIZED per the existing conditional rule. Target preparation (Edita/Rimon Sami) remains READY / NOT SENT — this reconciliation does not itself send it.
- DL-048 Option B FULLY VALIDATED (2026-08-23): PATH C isolated E2E completed 16/16 steps PASS on device `TKINR8IJ5D9DSKQK`. Source SHA `ad71117fe4d7db2fa59bd9a476684cd95607e440`. Run #14 APK SHA-256 `4e76a3c331007209f409e9e426628bf69b153926459147d461b7708ef3b89daf`. Disposable E2E APK SHA-256 `d32abecaffa5e2fd832e98fce006e1dc09eec6747f3210cbd52ec01b3ea26d74`. Real Akedly V1.2 OTP authenticated +201118000472. Full participation + 50-pt reward confirmed. Completed-campaign protection ("شاركت سابقاً") confirmed. Production campaign `9c370244-8dde-4540-8ba9-ff02f8f85c42` verified unchanged. Isolated runtime torn down cleanly.

---

## Current Objective

Close Track 0 and reconcile governance before any broad V1 engineering.

**Current sequence:**
1. Track 0 commercial GO/NO-GO decision (B-01)
2. LLC and PDPL/data-readiness evidence (B-02/B-03)
3. QR concurrency/idempotency load test when authorized (B-04)
4. D-028 Intelligence Report quality acceptance
5. Only after written authorization: V1 product contract, then brand campaign operating workflow

Note: AKEDLY_API_KEY is already set in Railway — do NOT change it.

After written GO and required readiness evidence: the authorized V1 operating workflow may be defined and then implemented.

*Source: Deployment Session, 2026-08-13*

---

## V0.5 / V1 Boundary

- **V0.5:** bounded Discovery-First consumer foundation; CLOSED FOR BOUNDED SCOPE.
- **Broad V1:** the existing PRD/Delivery production boundary; not authorized in the current state.
- **Existing V1 foundation:** consumer participation and history, dashboard analytics/reporting, campaign APIs, QR, and authentication.
- **Remaining V1 operating work:** approved brand onboarding and campaign lifecycle, internal campaign operations, consent/privacy, support, notifications, required export/data-quality acceptance, monitoring, and production hardening.
- **First engineering after written authorization:** brand campaign operating workflow, reusing the existing API/dashboard/reporting foundation.

The V1 definition is preserved from the canonical PRD; V0.5 is not a replacement for it.

---

## Current Blockers (4 — All Must Be Closed Before Track 1)

| ID | Blocker | Owner | What Closes It |
|---|---|---|---|
| B-01 | Track 0 GO/NO-GO not confirmed | Founder / IC | Written GO confirmation with sprint outcome summary |
| B-02 | Egyptian LLC incorporation unconfirmed | Founder | Commercial register number or formation date |
| B-03 | PDPL written legal sign-off not obtained | Legal counsel (not yet engaged) | Written memo from Egyptian data-privacy lawyer |
| B-04 | QR concurrency load test not executed | CTO (not yet hired) | Load test report showing idempotency holds at target load |

*Source: `15_Decisions/OPEN_DECISIONS_TRACKER.md`; `13_Audits/REMEDIATION_REAUDIT.md` Section B*

The ≥3 signed pilot-LOI threshold is the Track 0 commercial success/kill criterion that informs B-01. B-01 is the formal written IC/Founder GO/NO-GO decision and is not identical to the LOI count. D-028 is separately tracked as a non-blocking Intelligence Report quality decision for commercial-demo readiness; it is not a fifth B blocker or a Track 1 authorization condition.

---

## Next Milestone

**Track 0 GO Decision (B-01)** — the master gate for the entire project. The commercial result must meet the ≥3 signed pilot-LOI criterion for a GO recommendation, but written IC/Founder confirmation is still required to close B-01.

Immediately after GO:
→ Sprint 0 (2 weeks): legal entity, AWS account, Terraform, CI/CD, vendor contracts  
→ Sprint 1–6 (10 weeks): MVP build  
→ Private Beta → Production v1.0  

*Source: `02_Project_Management/MASTER_DELIVERY_PLAN.md` Section 3 — Sprint Schedule*

---

## Current Priority Stack

1. Client-ready version gate: MET (2026-08-27) — Founder-executed brand outreach toward at least 3 signed pilot LOIs is now authorized; target preparation (Edita/Rimon Sami) remains READY / NOT SENT
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
