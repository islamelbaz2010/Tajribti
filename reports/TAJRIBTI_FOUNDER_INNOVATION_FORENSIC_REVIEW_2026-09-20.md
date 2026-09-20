# TAJRIBTI — FOUNDER INNOVATION FORENSIC REVIEW
## Benchmark Baseline vs Founder Innovation Archive vs Research Evidence
### READ-ONLY — NO PRODUCT IMPLEMENTATION — 2026-09-20

Companion workbook: `reports/TAJRIBTI_FOUNDER_INNOVATION_REVIEW_2026-09-20.xlsx`

---

## 1. Executive Summary

A complete forensic comparison was performed between three evidence layers:

- **Layer A — Current Benchmark Implementation**: `tajribti-benchmark-clean` @ `45aa571` (`master` == `origin/benchmark-current` == production deploy `98251b7a`).
- **Layer B — Founder Innovation Archive**: `/Users/ahmed/Documents/Projects/samples app` (~2.6 GB) — the pre-Benchmark project line, containing the old NestJS/React/Flutter implementation, the Founder Decisions Document (FDD), a ~129-entry decision log, and the project's governance workspace.
- **Layer C — Research/Market Evidence**: three files in `doc/` (two Arabic workbooks + one peer-reviewed methodology paper).

**Headline findings:**

1. The current product at `45aa571` is Benchmark-complete and production-verified (Track 0 closed). No Benchmark-required capability is missing.
2. The archive is not a foreign codebase — it is the *old line of the same GitHub repository* (`origin/main` ancestry). The Benchmark itself was reverse-engineered from it; a **byte-identical copy** of `REFERENCE_PRODUCT_BENCHMARK.md` exists in the archive at `workspace/03_Research/`.
3. The archive's most valuable residue is **not code** — it is the **Founder decision record**: a constitutional FDD, a documented moat thesis ("the panel is the moat"), explicit postponement locks, and four business gates (B-01 closed; B-02 LLC, B-03 PDPL, B-04 QR load test still open).
4. **30 innovation candidates** were extracted and classified. The strategically largest — consumer panel / cross-campaign intelligence, rewards, and activation notifications — are all currently **excluded by the Benchmark** and require explicit Founder decisions plus governance design before any implementation.
5. One already-approved Founder extension exists at baseline: the **Study-Type Intelligence layer** (6 templates, `governance/FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md`, dated 2026-09-15).
6. **20 open Founder decisions** are registered in the workbook (sheet `08`), each with evidence, conflict status, and a dropdown decision field.
7. No implementation, deployment, or file mutation occurred. Only this report and the workbook were created.

---

## 2. Current Benchmark Baseline

Verified fresh (no memory used):

| Item | Value |
|---|---|
| Local path | `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean` |
| Remote | `https://github.com/islamelbaz2010/Tajribti` |
| Branch | `master` (local); `origin/benchmark-current` = deployment branch |
| HEAD | `45aa5711ab83f97fc8985a185df221ac48031082` |
| Remote check | `origin/benchmark-current` == `45aa571` |
| Production | Railway `tajribti-pilot`, deploy `98251b7a` SUCCESS on `45aa571`, `/api/health` → `dev:false` |
| Working tree | Clean except pre-existing untracked `doc/` (the 3 research files) |

**Implemented surface at baseline:**

- **API**: Node/Express/TypeScript/Prisma/SQLite. Routes: `consumerAuth`, `consumer`, `companyAuth`, `company`, `opsAuth`, `ops`. Libs: `akedly`, `rateLimit`, `measurement`, `report`, `readiness`, `studyTemplates`, `auth`, `asyncSafety`, `prisma`.
- **Web**: static apps — `web/app/consumer`, `web/app/company`, `web/app/ops`, plus `web/public` (minimal public page).
- **Mobile**: Flutter `mobile/consumer` — home, campaign, eligibility, scanner, OTP, survey, activity, profile, settings, services, thank-you, plus `screens/employee/` and `employee_api_client.dart`; `akedly_pow.dart` client-side PoW solver.
- **Journey**: Discover → Eligibility → Redemption → QR/Journey → Survey → Measurement → Insights → Report — verified live in production on campaign "nnnnnew test" (real +20 OTP via WhatsApp).
- **Study types**: 6 static templates (`POST_TRIAL_FOOD_BEVERAGE`, `POST_TRIAL_BEAUTY_PERSONAL_CARE`, `POST_TRIAL_HOME_CARE`, `CONCEPT_LAUNCH_VIABILITY`, `PACKAGING_CLAIMS_REACTION`, `USAGE_ATTITUDE`) + optional `Campaign.studyType` + Apply Recommended Questions.
- **Integrity**: Product→Company, QR→Campaign, Answer→Question→Campaign, Answer→Participation→Campaign bindings; ownership isolation; 26 integrity tests + 4 auth-hardening + 7 Akedly transport tests (37/37 green).
- **Security**: fixed-window rate limiting, OTP request/verify throttling, login throttling, CORS allowlist, security headers, production OTP suppression.
- **OTP**: Akedly V1.2, client-side PoW (web Shield SDK + Dart solver), Turnstile-ready, `transactionReqID` stored server-side.

**Benchmark exclusions (unchanged)**: referral programs, rewards wallet/exchange mechanics, push notifications, automated fraud detection, advanced AI narratives beyond supported evidence, non-FMCG verticals, GCC expansion.

---

## 3. Founder Archive Summary

**Path**: `/Users/ahmed/Documents/Projects/samples app` (~2.6 GB, git repo, HEAD `24d99ef`, dirty working tree — inspected read-only).

**Classification: FOUNDER INNOVATION ARCHIVE — NOT PRODUCT TRUTH.**

### Source inventory (per §7 classification)

| Material | Class | Examples |
|---|---|---|
| Old implementation | PRODUCT_IMPLEMENTATION | `apps/api` (NestJS+TypeORM+Postgres), `apps/dashboard` (React), `apps/consumer` (Flutter) |
| Founder decisions | FOUNDER_DECISION | `workspace/00_FOUNDER_INTENT/*`, `15_Decisions/{FOUNDER_DECISIONS, DECISION_LOG, OPEN_DECISIONS_TRACKER, ASSUMPTION_REGISTER}` |
| Product ideas | PRODUCT_IDEA | `inbox/` docx sources (Master PRD, Technical Architecture), original idea transcript |
| Experiments | PRODUCT_EXPERIMENT | bounded-exception build waves DL-051..DL-112 |
| Market research | MARKET_RESEARCH | `03_Research/`, investment memos |
| Competitive research | COMPETITIVE_RESEARCH | Samplia references in reports/decisions |
| Reporting/analytics | REPORTING / ANALYTICS | `16_Reports/` (~75 reports incl. B-04 load test), `reports/` |
| Design/UX | DESIGN / UX | DL-086..DL-112 visual passes |
| Mobile | MOBILE | `apps/consumer`, `old apk/`, `tajribti-installed.apk` |
| Tech infrastructure | TECHNICAL_INFRASTRUCTURE | `EBOS/`, Railway/Vercel deployment records, `.github` |
| Legacy | LEGACY | superseded NestJS/Postgres stack, email/password auth |
| Backup | BACKUP | `samples-app-backups` (sibling folder), `archive/` |
| Unknown/misc | UNKNOWN | `.akwb`, `.demo-logs`, `.claude` |

### What the archive establishes

- **Genesis**: a Madrid Samplia pop-up video — consumers notified by app → collect free sample → rate in-app → brand buys the intelligence. "Tajribti is that model, built for Egypt."
- **Positioning lock**: "Egypt's Consumer Intelligence Platform" — never a sampling company. *"Brands pay. Consumers try. Tajribti delivers truth."* The data panel is the moat.
- **FDD revenue model**: campaign fees + per-sample fees + AI dashboard subscription + panel access + Enterprise API.
- **FDD future modules**: gamification, referral, AI insight narratives, predictive purchase-intent, retail media, Enterprise API, consumer panel marketplace.
- **FDD locks**: no GCC (BD-05), no non-FMCG verticals Y1–3 (BD-07), no permanent kiosks (OPS-02), no owned logistics (OPS-03), AI narratives V2-only (PD-07), CRM/Enterprise API deferred (PD-03).
- **Governance paradox found**: extensive engineering was authorized via sequential "bounded exceptions" (DL-051…DL-112) while Track-0 engineering gates remained formally open — resolved 2026-09-01 (DL-082 closed B-01 only; B-02 LLC, B-03 PDPL, B-04 QR-load-test remain open).

### Previously implemented (old line) — now absent or re-shaped at baseline

| Old-line capability | Evidence | Baseline status |
|---|---|---|
| AI insight narrative, bilingual EN/AR | `ai-report.entity`, `AiSummary.tsx`, DL-053 | Absent (Benchmark excludes advanced AI narratives) |
| Campaign media/gallery | `campaign-media.entity`, `Gallery.tsx`, DL-055 | Absent |
| Rewards/points | `campaign.rewardPoints` (default 50), consumer points system | Absent (dropped deliberately; Benchmark excludes wallet) |
| PDF report export | `Report.tsx` PDF, DL-056 fix | Absent |
| Authenticated Admin Control Center | `AdminUser`, admin console, DL-087 | Covered equivalently by ops app |
| Company employees + employee mobile | `CompanyEmployee`, employee screens, DL-087/088 | Covered (employee routes + `screens/employee/`) |
| Demo campaign mode | `campaign.isDemo` + gates | Absent |
| Consumer support contact | Settings support section, DL-103 | Settings screen exists; dedicated support unverified |
| Brand contacts (non-auth CRM) | `brand-contact.entity` | Absent |
| Email/password consumer accounts | `email-verification-token.entity` | Absent (OTP-only — intentional) |
| Public marketing site (full) | dashboard `pages/public`, DL-086/111 | Minimal `web/public/index.html` |

---

## 4. Research Source Summary

### 4.1 `Consumer_Insights_دليل_عام.xlsx` (general industry guide — Arabic)

Self-declared scope: general market-research knowledge, **not** tied to any company. Author labels confidence explicitly.

| Sheet | Content | Evidence quality |
|---|---|---|
| ملخص ونطاق البحث | Scope/confidence disclaimer | Honest framing |
| القطاعات والتكرار | 15 sectors needing periodic insights; F&B/cosmetics/home-care = continuous cadence | MEDIUM (industry knowledge) |
| أنواع التقارير | **11 report types**: concept test, product/trial test, packaging test, ad pre/post test, brand tracker, U&A, pricing (Van Westendorp), CSAT/NPS, churn survey, shelf test, segmentation study | MEDIUM |
| بنك أسئلة حسب القطاع | Per-sector post-trial question banks (Egyptian Arabic) | LOW-MEDIUM — author's own best-practice suggestions, explicitly unvalidated |
| نماذج تقارير حقيقية | 6 verified public template sources (SurveyMonkey, SurveySparrow, UserIntuition, etc.) | MEDIUM |

**Supports**: study-type catalog expansion; sector question templates. **Does not** prove any specific type should be implemented — each new type needs its own methodology.

### 4.2 `Samplia_تحليل_وتقارير.xlsx` (competitive analysis — Arabic, color-coded confidence)

| Finding | Confidence |
|---|---|
| Samplia = "Smart Sampling" company, **not** a report catalog vendor | HIGH (samplia.com) |
| 4 verified services: Smarthubs machines, SampliaX pop-ups, SampliaGO retail-POS sampling, Consumer Insights & Feedback | HIGH |
| Scale claims: +400 brands, +50M samples, +3000 campaigns, +2M app users | HIGH (vendor-claimed) |
| Report = ONE general post-campaign report: reach, engagement, conversion, purchase intent, sentiment/brand perception, actionable recommendations; ">80% response rate" claim; "hipersegmentación" | HIGH existence / claims unverified |
| Sectors list, report catalog, actual survey questions, sample reports | **UNKNOWN — not public** (honestly marked) |

**Key implication**: Samplia markets a *single* general report. TAJRIBTI's study-type layer (already implemented as the authorized extension) is plausibly **differentiating**, not table-stakes.

### 4.3 `ShevchenkoKuhlmannReips2020.Samply.PDF` (peer-reviewed, 21 pp.)

Open-source **experience-sampling** platform: browser-managed studies, **notification scheduling** (time/interval/event-based + randomized), web-linked surveys, participation tracking, compliance analytics. Study 2 modeled notification participation rate (R²≈.58; compliance varies by project/day; device settings affect reliability).

**Supports**: notification-triggered repeated measurement as a *validated methodology*. **Conflicts**: push notifications are Benchmark-excluded; ESM's repeated/event-based sampling is a *different study paradigm* than the current single-trial model → future candidate requiring methodology + consent governance, not a Benchmark requirement.

---

## 5. Feature/Capability Comparison

Full matrix in workbook sheet `03_FEATURE_COMPARISON` (26 rows). Summary:

- **Benchmark-required, implemented**: OTP auth, eligibility, QR lifecycle, survey, measurement, insights, report, company + ops workspaces, study-type layer.
- **Permitted but absent**: media/gallery, PDF export, demo mode, support contact, question edit/delete UI (known wiring gap recorded in current governance).
- **Excluded, archive-evidenced**: rewards/points, AI narratives, referral, push notifications, fraud detection.
- **Covered already**: activity/history, employee mobile, ops control center, discovery-first home.
- **Legacy, do not restore**: NestJS/Postgres stack, email/password consumer accounts, brand-contact CRM-lite.

---

## 6. Founder Innovation Candidates

30 candidates registered in workbook sheet `07` (IDs FD-001…FD-030) with archive evidence, research evidence, baseline status, value, surface, risks, conflict flag, confidence, and decision dropdown. Distribution:

| Classification | Count | Examples |
|---|---|---|
| A — already implemented | (baseline coverage, §5) | — |
| C — permitted not implemented | 7 | media/gallery, PDF export, demo mode, support contact, question edit/delete UI, reward display-only |
| D — innovation candidate | 5 | rewards wallet, panel/cross-campaign intelligence, price/pack/claims fields, predictive intent, fraud detection |
| E — already covered | 4 | activity, employee mobile, ops center, discovery home |
| F — research-supported | 2 | deeper segmentation, study-type expansion |
| G — differentiator candidate | (within D/M) | panel intelligence, notification-driven model |
| H — out of current scope | 3 | Enterprise API, gamification, physical channels |
| I — conflicts w/ Benchmark | 1 | referral (recommend keep excluded) |
| J — technical-only | 1 | seed tooling parity |
| K — legacy/do not restore | 3 | NestJS stack, email/password auth, brand contacts |
| M — Founder decision required | 4 | AI narrative, notifications, sentiment, website scope, longitudinal studies |

**Top-tier strategic candidates** (highest value × highest governance need):

1. **FD-015 — Consumer panel / cross-campaign intelligence** — the FDD's stated moat ("panel access + marketplace" revenue). Requires PDPL consent design (gate B-03 still open), new methodology governance, and would cross the Benchmark's ownership-isolation boundary. **Highest value, highest conflict — needs Founder ruling + legal sign-off first.**
2. **FD-018 — Activation notifications** — restores the *genesis mechanic* (the app notifies consumers of activations). Benchmark excludes push notifications; WhatsApp Business API was the FDD's chosen channel. Founder decision on channel + consent.
3. **FD-001/002 — Rewards** — FDD envisioned Vodafone Cash/InstaPay rewards; wallet excluded by Benchmark. Display-only "reward text" variant is cheap and unconflicted.
4. **FD-003 — AI insight narrative** — old line shipped a hedged bilingual version (DL-053); Benchmark permits only evidence-bounded narratives. Needs an integrity guardrail decision.
5. **FD-005/004/007 — PDF export, media/gallery, demo mode** — low-risk, sales-facing, previously authorized on the old line; likely quick wins if approved.

---

## 7. Research-Supported Opportunities

| Opportunity | Research basis | Caveat |
|---|---|---|
| Study-type expansion (pricing/Van Westendorp, shelf, brand tracker, ad test, churn) | Consumer_Insights 11-type taxonomy | Labels without methodology create integrity risk — add only with instrument design |
| Deeper segmentation in reports ("hipersegmentación") | Samplia markets segmented delivery | Define small-cell suppression rules first |
| Sector question banks (Egyptian Arabic) | Consumer_Insights question bank | Author-labeled best-practice, needs expert review |
| Notification-driven participation | Samply peer-reviewed validation + Samplia app mechanic + genesis video | Benchmark excludes push — Founder decision + consent design |
| Report template formats (PDF/PPT deliverables) | Consumer_Insights template links | Export format is a Benchmark ambiguity — resolve by decision |

## 8. Non-Differentiated / Legacy Ideas

- **NestJS/Postgres stack restoration** — technical regression, no product value (K).
- **Email/password consumer accounts** — OTP-only is intentional Benchmark design (K).
- **Brand contacts CRM-lite** — niche, risks scope creep into CRM (K/defer).
- **Referral program** — excluded by both Benchmark and FDD postponement (I — keep excluded).
- **Permanent kiosks / owned logistics** — locked out by FDD OPS-02/03; Samplia's Smarthub model is an *operations* decision, not software (H).
- **Gamification, Enterprise API, CRM integrations** — FDD-deferred; out of current scope (H).

## 9. Benchmark Conflicts

Capabilities that **conflict with the current Benchmark** and therefore cannot be implemented without an explicit Founder amendment:

| Capability | Exclusion basis | Path forward |
|---|---|---|
| Rewards wallet/exchange | Benchmark exclusion | Founder amendment + economics design |
| Push notifications | Benchmark exclusion | Founder amendment + consent design (FD-018) |
| Referral | Benchmark exclusion + FDD postpone | Keep excluded unless reversed |
| Automated fraud detection | Benchmark exclusion | Future, after real data exists (FDD) |
| Advanced AI narratives | "beyond supported evidence" clause | Bounded hedged narrative may fit — decision OFD-03 |
| Cross-campaign inference | Ownership isolation (integrity) | Governance + consent design (FD-015) |
| Non-FMCG / GCC | Exclusions + FDD locks | Out of scope |

## 10. Evidence Integrity Risks

TAJRIBTI's positioning is evidence-grounded ("delivers truth"). Flagged risks for any future innovation:

- **Sentiment/theme generation** on verbatims must be labeled *derived*, never presented as measured evidence (Benchmark §6 evidence/interpretation separation).
- **Predictive purchase-intent** scoring without validated methodology = unsupported inference — the single largest integrity hazard among candidates.
- **Cross-campaign segmentation** risks demographic inference on uncollected data and small-cell privacy exposure.
- **AI narratives** must carry provenance and hedge on sample size (the DL-053 pattern was correct).
- **Fraud detection** presented as automated truth would violate the exclusion; human-review flagging is the safer future shape.
- Research claims (Samplia's ">80% response", "+400 brands") are **vendor marketing** — usable as context, never as TAJRIBTI product claims.

## 11. Company vs Operations

**COMPANY: Customer company's team.**
**OPERATIONS: TAJRIBTI/Eunoia internal operations team.**

Benchmark-evidenced surfaces at `45aa571`:

| | COMPANY | OPERATIONS |
|---|---|---|
| Templates | `/study-templates` | `/study-templates` |
| Tenancy | `/profile`, `/employees`, `/products` | `/companies` |
| Campaigns | create/configure, `/study-type-requests`, `/readiness`, `/submit-for-review`, `/questions`, `/qr-sources` | `/readiness`, `/launch`, `/pause`, `/close`, study-type-request review |
| Visibility | `/live`, `/insights`, `/report` (own campaigns only) | `/participants`, `/live`, `/issues` + resolve, `/survey`, `/insights`, `/report` (cross-tenant) |

**Confirmed**: strict company isolation (integrity tests); ops has cross-tenant lifecycle + issue management; company authors questions/QR and submits for review; ops launches/pauses/closes.

**Unresolved permission details (ambiguity — not gaps)**: per-action matrix granularity; company question edit rights after launch (backend DELETE exists, UI doesn't — recorded in `governance/FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md`); whether company sees ops issues; owner-vs-employee granularity within a company; any insight/scope asymmetry between the two surfaces. These need a Founder-written permission spec (OFD-08), not engineering invention.

## 12. Mobile Release Gate

**Already ready/verified**: backend/consumer contract (production-proven); web Akedly Shield; client-side PoW architecture; Track 0 deployment; real OTP E2E; mobile API wiring; Dart PoW solver (contract-level); CI APK workflow (Flutter 3.44.8, Java 17, `CURRENT_API_BASE` repo variable **set** to the production URL, `flutter analyze` + `flutter test` + release APK artifact).

**Still pending**: official Akedly Flutter SDK (OFD-10); Flutter compile verification on supported env (host macOS 13 can't run SDK — CI is the path); Android package ID (currently `com.tajribti.consumer` from `flutter create --org com.tajribti`); release signing/keystore; iOS scaffolding (workflow is Android-only); Apple bundle ID/team/provisioning; icons/splash; store metadata; privacy + support URLs; physical-device validation; **first real QR-attributed participation** (Track 0 campaign had 0 QR sources); approved-innovation scope (this register).

**Workflow note**: `build-consumer-current.yml` header comments call `api-production-266c.up.railway.app` "the legacy Railway API" — that comment is now stale; the current Benchmark API is deployed to that service and `CURRENT_API_BASE` correctly points to it. Doc fix at next authorized change.

## 13. Folder Consolidation Plan

**No folders were moved, renamed, or deleted.** Evidence-based audit:

| Folder | Role | Git/Remote | HEAD | Proposed disposition |
|---|---|---|---|---|
| `tajribti-benchmark-clean` | CURRENT product | github/Tajribti | `45aa571` | **CURRENT** — do not touch |
| `samples app` | Founder Innovation Archive (old line) | same repo, old history | `24d99ef` (dirty) | **ARCHIVE** — keep; consider committing/zipping dirty state to preserve evidence |
| `Tajribti` | `main`-branch clone (old impl + benchmark-registration commits) | github/Tajribti | `04c736e` | **ARCHIVE candidate** — verify no unique uncommitted work first |
| `tajribti-benchmark-edition` | Earlier benchmark build, **no remote** | local-only | `d932864` | **ARCHIVE candidate** — sole copy of that history; verify unique value before any deletion |
| `samples-app-backups` | Timestamped backup | not git | — | **BACKUPS** — keep until archive is secured |

**Safe to delete now: nothing.** `tajribti-benchmark-edition` and `samples-app-backups` are the only plausible cleanup candidates, and only after uniqueness verification (OFD-18).

## 14. Open Founder Decisions

20 decisions registered (workbook `08_OPEN_FOUNDER_DECISIONS`, each with dropdown):

| ID | Decision |
|---|---|
| OFD-01 | Sequencing: differentiation work vs final mobile release order |
| OFD-02 | Rewards/loyalty: retain concept, scope (wallet vs display-only), or reject |
| OFD-03 | AI narrative: adopt bounded hedged bilingual narrative or keep excluded |
| OFD-04 | Study-type catalog expansion beyond current 6 |
| OFD-05 | Price/pack/claims structured fields |
| OFD-06 | Advanced analytics (deeper segmentation, verbatim sentiment) + methodology governance |
| OFD-07 | Non-FMCG expansion (recommend keep excluded) |
| OFD-08 | Company vs Operations permission specification |
| OFD-09 | Final mobile packaging go/no-go and scope |
| OFD-10 | Official Flutter Akedly SDK adoption timing |
| OFD-11 | Benchmark immutability confirmation |
| OFD-12 | Campaign media/gallery |
| OFD-13 | PDF report export |
| OFD-14 | Activation notifications channel (WhatsApp/push) — genesis mechanic |
| OFD-15 | Consumer panel / cross-campaign intelligence governance |
| OFD-16 | Demo campaign mode |
| OFD-17 | Public website scope |
| OFD-18 | Folder consolidation dispositions |
| OFD-19 | Question edit/delete UI wiring |
| OFD-20 | Inherited business gates B-02/B-03/B-04 (LLC, PDPL, QR load test) |

## 15. Items Already Resolved

- Benchmark completeness (STATUS A, prior audit).
- Track 0 production deployment + real OTP E2E (STATUS A).
- Study-Type Intelligence extension (Founder-approved 2026-09-15, implemented).
- Evidence-integrity boundaries (commit `362214f`), mobile eligibility (`c034e93`), auth hardening (`f39b1cd`), Akedly client-PoW (`45aa571`).
- Old-line rulings already covered at baseline: W-1 employees (DL-087), W-2 ops center (DL-087), discovery-first (DL-050), employee mobile (DL-088).

## 16. Items Requiring More Evidence

- Whether employee **self-registration via company code** exists at baseline (old line had it; current company-managed flow differs) — verify before FD-010 closes as fully covered.
- Dedicated consumer **support contact** coverage in current settings screen — unverified.
- Samplia's actual report artifacts/questions — not public (workbook marks Unknown); direct outreach was that research's own recommendation.
- Egyptian-market response-rate expectations — no local data yet; first campaigns will generate it.
- QR write-path load test at production scale (inherited B-04 criterion "<1s at hundreds concurrent" — never met on old line; the new API is a different stack and the criterion itself was old-line).

## 17. Proposed Next Execution Sequence

1. **Founder reviews** this package; marks decisions in workbook `08`/`12` dropdowns.
2. **Resolve business gates** (OFD-20): LLC incorporation, PDPL counsel sign-off — these block contracts and any consent-dependent innovation regardless of engineering.
3. **Approve/reject innovation candidates**; for approved items, write methodology/integrity guardrails first (especially OFD-03, OFD-06, OFD-15).
4. **Decide release sequencing** (OFD-01): release Benchmark-only mobile now, or batch with approved innovation.
5. **Final mobile release** (single pass): approved innovation + official Akedly Flutter SDK + signing/IDs/store assets + physical-device validation.
6. Only then: implementation planning for approved candidates — never silently.

---

## Safety / Integrity Confirmation

- No code changed · no production changed · no Benchmark changed · no governance changed
- No folders moved/deleted/renamed · no deployment · no push · no Railway/Akedly/GitHub Actions changes
- No secrets exposed (no OTP values, API keys, tokens, phone numbers, or transaction IDs appear in this report or the workbook)
- Outputs created: this report + `reports/TAJRIBTI_FOUNDER_INNOVATION_REVIEW_2026-09-20.xlsx` (both new files)

## Final Gate

**STATUS A — FOUNDER INNOVATION REVIEW COMPLETE — DECISIONS READY**
