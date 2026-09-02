# REFERENCE BLUEPRINT — TAJRIBTI RECONCILIATION
## Reference Study + Gap Analysis (No Implementation)

**Date:** 2026-09-02
**Branch audited:** `sprint/pilot-readiness-mvp`
**HEAD commit:** `11bc4cc322a1c274a4950f99b807a0e7f72e1862`
**Mode:** Deep research / reference validation / **no implementation performed**
**Author:** Claude Code (session), at explicit Founder instruction to treat the current implementation as a candidate, not a verified-correct baseline

---

## 1. Executive Conclusion

**Yes — this pass found evidence that a specific, material part of TAJRIBTI may have been built on an assumption that no longer matches what the Founder is now asking for**, and one place where the current build diverges from the project's own written MVP scope, independent of any external reference:

1. **Company = one shared login, no authenticated employees.** `BrandAccount` is the only authenticated Company identity. `BrandContact` (added 2026-09-01, DL-069) is explicitly "a record, not an account: no password/login field exists." There is no company-employee registration, no company-specific join code, no employee mobile access, and no way for TAJRIBTI Admin to create an employee account "when company requests." This is a direct conflict with items 6–11 of this task's own "Critical Founder Decisions to verify" list (Section 8). DL-069 records the single-login choice as **LOCKED**, but its stated rationale is architectural minimalism ("no second identity model, no RBAC framework") attributed to "this session's direction," not a dated, quoted Founder decision addressing authenticated employees specifically. **This is reported as a conflict, not silently resolved** (see Section 20, Finding W-1).

2. **Admin is a shared secret, not an identity.** Every `/admin/*` route is gated by one static header (`x-admin-secret` == `ADMIN_SECRET`) checked in `admin.controller.ts`. There is no Admin user entity, no Admin login, no Admin audit trail of *who* performed an action, and — critically — **no Admin UI at all** (confirmed: zero admin-related routes/pages in `apps/dashboard/src`, only two incidental string matches). This falls short of both the reference pattern (every reference product studied has an operator console) and TAJRIBTI's own MVP scope, which explicitly names "Admin dashboard" as an MVP-scope deliverable (`FOUNDER_DECISIONS.md` — Product Decisions table). See Finding W-2.

3. **No Company → Campaigns → Participants → Insights → Report navigation exists for an operator.** The navigation this task's Section 8 item 16 requires is fully built, but only *inside* a single Company's own self-service Console (`BrandAccount`-JWT-scoped). There is no cross-Company operator view — Admin can list/edit brand accounts and contacts, but cannot open a Company and see its campaigns, participants, insights, or report from an operator vantage point. See Finding W-2 (same root cause as #2).

4. **The repository's own domain-model documentation is stale relative to the actual implementation**, independent of any external reference. `AI_BOOTSTRAP/07_DOMAIN_MODEL.md` (sourced from the PRD) describes entities and a campaign state machine — `PENDING_APPROVAL`/`APPROVED` states, a separate `Location` entity, a `QRCode` state machine with `RESERVED`/TTL — that do not exist in the actual code (`campaign.entity.ts`'s real states are `draft/active/paused/completed/archived`; there is no `Location` entity; `qr-code.entity.ts`'s real states are `active/demo/voided`). This is reported as a conflict per Section 1 governance rules, not resolved in either direction.

Beyond these four, the core sampling-to-survey-to-insight loop (the reference products' shared minimum pattern) is **present and functionally matches the reference pattern** — this is not a story of a broken product. See Section 19 for the full classification.

---

## 2. Research Scope

This pass covered:
- Full governance load per `AI_BOOTSTRAP/13_LOADING_ORDER.md`'s mandatory pre-load (`00_FOUNDER_INTENT/01`–`06`) and Universal Minimum, plus `07_DOMAIN_MODEL.md`, `09_REPOSITORY_MAP.md`, `15_Decisions/FOUNDER_DECISIONS.md` (FDD), and targeted reads of `15_Decisions/DECISION_LOG.md` (DL-058, DL-059, DL-069 specifically).
- Direct source-code audit of `apps/api/src` (all 13 entities, all 10 controllers, all 11 modules), `apps/dashboard/src` (all pages), and `apps/consumer/lib` (full screen inventory) — behavior read from code, not inferred from filenames or prior session narrative.
- External web research (`WebFetch`/`WebSearch`) against the marketing/product pages of all 4 primary references (Samplia, Freestand, Zamplit, SoPost) and 2 of 3 secondary references (Sampl, GratisIQ reached; AnyRoad's named feature page 404'd, fell back to its homepage).
- Two rounds of clone/source-code investigation searches.

**Not done in this pass** (evidence limitation, disclosed rather than papered over): no live app/demo interaction (no Samplia app install, no Freestand/SoPost demo walkthrough), no case-study PDF reads, no Play Store review mining, no `anyroad.com/platform/feature/product-tour-brand-activations` content (404). All external evidence is Category A/D per Section 3's own scale — official site text, not observed live behavior. This bounds REFERENCE CONFIDENCE below what a hands-on trial of each product would produce (see Section 25).

---

## 3. Sources & Evidence Quality

| Source | Evidence category | What was actually read |
|---|---|---|
| Samplia (samplia.com/en) | A/D — official copy, marketing claims (50M samples, 400+ brands, 2M+ app users) not independently verified | Homepage only |
| Samplia app listing | E — not reached this pass | Not fetched |
| Freestand (freestand.in) | A/D — official copy, case-study numbers (10M+ reached, 95.4% satisfaction) quoted, not verified | Homepage only |
| Freestand demo/case-study pages | E — not reached this pass | Not fetched |
| Zamplit (zamplit.com/platform, /pricing) | A — official product/pricing copy, feature names quoted directly | Platform + pricing pages |
| SoPost (sopost.com) | A/D — official copy, aggregate stats (18M+ opt-ins, 4M+ reviews) not verified | Homepage only |
| Sampl (sampltech.com) | A/D — official copy, "40% of requests filtered" stat not verified | Homepage only |
| AnyRoad (anyroad.com) | A — official copy; the specific product-tour/brand-activations feature page 404'd, homepage substituted | Homepage only |
| GratisIQ (gratisiq.com) | A — official copy, describes venue/POS model explicitly (a materially different mechanic than app-based sampling — see Section 8) | Homepage only |
| Clone/OSS search | E — no fidelity match found (see Section 5) | 4 search queries |
| TAJRIBTI repository | Repository evidence (highest confidence available) — actual entity/controller/module source read directly | `apps/api/src`, `apps/dashboard/src/pages`, `apps/consumer/lib`, `workspace/15_Decisions/*`, `workspace/AI_BOOTSTRAP/*` |

No case-study PDF, live demo, or paid-tier walkthrough was accessed for any reference product. Every reference conclusion below is bounded by that limit and is marked accordingly — treat Sections 8–17 as **evidence-based directional patterns**, not verified specifications.

---

## 4. Reference Product Matrix

| Product | Core mechanic | Consumer identity model | Company-side surface (evidenced) | Data given back to brand | Notable divergence from app-only sampling |
|---|---|---|---|---|---|
| Samplia | App-based sampling via kiosks/pop-ups/retail/street; post-trial in-app survey (87% response claimed) | In-app profile, 2M+ users claimed | Not evidenced beyond "brand receives reports" — no company-console detail found | "Reach metrics, engagement, post-trial conversion," sentiment/brand-perception, "executive reports" | Samplia self-operates physical distribution (50+ person team, "furniture production, vinyl applications") — closer to a full-service agency+platform hybrid than a pure SaaS |
| Freestand | Omni-channel (digital/events/retail/ecommerce/paid-shared-box/promoter), partner-integrated (Meta, Swiggy, Google, Zepto...) | Not detailed on homepage | Not detailed on homepage | Reach + satisfaction metrics (case-study level, e.g. "95.4% satisfaction") | Heavier partner-integration/channel-marketplace model than TAJRIBTI's single owned app |
| Zamplit | Branded journeys (claim form → screener → feedback), "Insights Lab" | Not detailed as a persistent identity — closer to per-campaign claim | Explicit: dashboards, response analysis, source performance, segments, qualitative themes, sales-matching (revenue attribution), wallet/activation, CRM/ecommerce integrations | Company-owned "consented contacts" exportable for reuse outside the platform | Strongest evidenced Company-side Insights/reporting architecture of the four; also the only one describing sales-matching (trial→purchase revenue attribution) explicitly |
| SoPost | Multi-channel fulfillment + qualification/opt-in + review capture; "1 order every 2 seconds" scale | Not detailed; implied returning-user profile ("billions of SoPost data points to personalize") | Not detailed on homepage | Opt-in rate, purchase-conversion rate, review/survey volume, "detailed reports" | Explicitly frames itself around zero-/first-party data capture as the product, closest framing to TAJRIBTI's own "the data is the product" positioning |
| Sampl (secondary) | Pre-fulfillment eligibility filtering ("40% of requests filtered out"), post-trial reviews/opt-ins | Verified-shopper model, not detailed further | "Real-time reporting," specialists co-design audience/volume with brand | Reviews, opt-ins, conversion signals, "up to 25% verified review rate" | Strong emphasis on *pre*-qualification/fraud-filtering before a sample ships — TAJRIBTI has no evidenced equivalent gate before redemption beyond OTP identity verification |
| GratisIQ (secondary) | **Venue/POS-based**, not app-based: QR at in-venue signage → age/consent → survey → POS redemption verified by venue staff | Name + mobile number only, no persistent app account evidenced | "Track every redemption, measure sales lift" via POS data | Redemption/POS-verified sales-lift data, automated re-engagement (email/SMS) | Structurally different from TAJRIBTI: identity is venue-transaction-bound, not an app account; no reference to a returning consumer profile/panel |
| AnyRoad (secondary) | Event/experience platform (tours, tastings, pop-ups) with QR check-in, booking, post-event purchase | Not detailed on homepage | "NPS, brand affinity, purchase intent, revenue attribution," CRM/commerce integrations | Signal-to-decision analytics via "AI," revenue attribution | Broader "live experience" platform, not sampling-specific; closer to AnyRoad being an events-CRM than a sampling panel |

**Pattern that repeats across every reference reached** (high confidence — present in all 6 of the products where evidence was gathered): (1) a company-side reporting/insights surface distinct from raw data, (2) some form of qualification/segmentation before or alongside data capture, (3) purchase-intent or conversion measurement as the headline brand metric, (4) reviews/sentiment as a secondary output. TAJRIBTI's current implementation matches all four at the single-company level (see Section 19).

**Pattern that does NOT repeat, or is evidenced in only 1–2 references**: pre-fulfillment eligibility filtering (Sampl only), explicit sales/revenue-matching (Zamplit only), venue/POS-based identity (GratisIQ only, and structurally incompatible with TAJRIBTI's app-based model), full-service physical production (Samplia only). None of these should be read as "TAJRIBTI is missing an industry-standard feature" — they are differentiators between references, not a converged standard.

---

## 5. Clone/Source-Code Investigation

Two rounds of search were run:
1. `"open source product sampling platform consumer insights GitHub self-hosted 'sampling campaign' multi-tenant"` — returned commercial competitor listings (TrustRadius/G2/Gartner category pages) and one unrelated open-source BI tool (`mariusandra/insights`, a self-hosted analytics tool, not a sampling platform).
2. `"Samplia clone GitHub open source sampling app source code"` — returned exclusively **audio-sampling** software (`samplib`, `samply`, Rust software samplers, a Looperman scraper) — a keyword collision with "sample/sampling" in the music-production sense, not the FMCG product-trial sense. Zero relevant results.
3. `"product trial" OR "product sampling" SaaS boilerplate source code for sale white label consumer panel platform` — returned only generic multi-tenant SaaS boilerplates (Next.js/Go/React starters with auth+billing+admin scaffolding) with no sampling-domain logic.
4. `"market research panel platform open source brand campaign survey QR redemption self-hosted"` — returned **LimeSurvey** and **Formbricks**, both real, actively maintained, self-hostable, open-source survey platforms with QR-distribution support.

**No product-fidelity clone was found.** LimeSurvey/Formbricks are the closest tangential matches, but they implement only the Survey/Data layer (Layer in Section 6 below: Survey/Question/Response) — neither has Company/Campaign/Consumer-identity/Redemption/Insights-report/multi-tenant-brand-isolation as first-class domain concepts; they would need to be embedded inside a purpose-built shell, not adopted as a base.

**Explicit conclusion per Section 4's own instruction: no sufficiently accurate clone exists.** This is not a forced negative — it is the actual result of 4 differently-worded searches.

---

## 6. Clone Fidelity Results

| Candidate | Functional or UI-only | Backend/domain logic | Company/multi-tenant | Consumer identity | Campaign lifecycle | Survey | Analytics/Reports | Source available | License | Maintained | Live demo | FIDELITY | TECHNICAL VALUE | COMMERCIAL VALUE | TAJRIBTI RELEVANCE | EVIDENCE CONFIDENCE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LimeSurvey | Functional | Yes (surveys only) | No (survey-project scoped, not brand/company) | No | No | Yes | Basic response analytics only | Yes, GPL | GPL | Yes, 20+ yrs active | Yes | 15 | 35 | 10 | 15 | 60 (read own repo README/homepage only, not deployed/tested) |
| Formbricks | Functional | Yes (surveys/forms only) | Partial (org/project concept exists, not brand-campaign-consumer domain) | No | No | Yes | Basic | Yes, open-core | Varies by edition | Yes, active | Yes | 15 | 35 | 10 | 15 | 60 |
| Generic multi-tenant SaaS boilerplates (Next.js/Go starters) | UI+auth scaffolding only | No sampling logic | Yes (generic RBAC/tenant) | No | No | No | No | Mostly yes | Mixed (some paid) | Varies | Varies | 5 | 20 | 5 | 5 | 40 |

**Recommendation: do not adopt any clone.** None reach even a "Survey + Company" combined fidelity, let alone the full Consumer/Campaign/Redemption/Insights domain TAJRIBTI already has running in production. TAJRIBTI's own implementation is, on the evidence gathered this pass, further along the domain-fidelity axis than anything found in this search.

---

## 7. Consolidated Reference Blueprint

Synthesized from the repeated pattern across Section 4 (not copied from any single company). Confidence for each layer is stated per-layer, since evidence density varied.

### 7a. The converged minimum loop (high confidence — present across all 6 evidenced references and TAJRIBTI's own Founder Core Value Engine)

```
Company/Brand → Campaign → Consumer discovers/qualifies → Consumer receives product
→ Consumer tries product → Consumer gives feedback/survey → Data aggregated
→ Company receives insight/report → (optional) Company acts on insight / re-engages consumer
```

### 7b. Where references diverge (moderate confidence — evidenced in ≥2, absent/unclear in others)
- **Identity model**: persistent app-account panel (Samplia, TAJRIBTI) vs. venue/transaction-bound identity (GratisIQ) vs. unclear/not detailed (Freestand, SoPost, Zamplit homepages).
- **Pre-fulfillment gating**: eligibility screener before a sample ships (Sampl, Zamplit's "screener") vs. no evidenced pre-gate beyond identity verification (TAJRIBTI, Samplia as evidenced).
- **Commercial data reuse**: brand-owned exportable "consented contacts" for future marketing (Zamplit, explicit) vs. no evidenced equivalent (TAJRIBTI — consumer data stays inside TAJRIBTI's platform/report, not exported to the brand's own CRM as a contact list).
- **Sales-outcome attribution**: matching trial to actual purchase/revenue (Zamplit only, explicit) — TAJRIBTI measures *purchase intent* (self-reported survey answer), not verified purchase (no reference to POS/sales-data integration anywhere in the current codebase).

### 7c. Company/operator layer (low-moderate confidence — least-detailed layer across all references; only Zamplit's pricing page and GratisIQ's venue description gave any operator-side detail)
No reference source reached this pass documented an internal Admin/operator console in enough depth to compare against TAJRIBTI's Admin implementation feature-by-feature. This is a genuine evidence gap, not a finding that TAJRIBTI's Admin is comparable — see Section 26.

---

## 8. Consumer Blueprint

| Element | Reference evidence | TAJRIBTI current | Note |
|---|---|---|---|
| Identity | Persistent app account (Samplia: 2M+ users; TAJRIBTI's own Founder Vision assumes a growing panel = "the moat") | `Consumer` entity: phone (unique, required) + optional email/password account auth; `auth.controller.ts` has a full signup/login/refresh/verify-email flow independent of any campaign | MATCH |
| Campaign discovery | In-app feed (Samplia), omni-channel distribution (Freestand) | `GET /campaigns` (public), Consumer Mobile Home screen shows all `active`-status campaigns including future-dated ("Coming Soon") ones | MATCH |
| Eligibility/qualification | Sampl: ~40% pre-filtered before fulfillment; Zamplit: screener step | No pre-redemption eligibility/screener step found in code — the only gate is OTP identity verification (`CampaignVerification`) plus the `isCampaignOpenForParticipation()` date/status gate | POTENTIAL GAP (see Section 19) |
| Sampling/redemption | QR-based in most references (GratisIQ explicit; implied elsewhere) | `qr.service.ts` — QR scan or web entry, campaign-scoped OTP, `RedemptionEvent` created, DB-unique-constrained against duplicates (DL-083/084) | MATCH |
| Survey/feedback | 3–5 question post-trial survey pattern matches TAJRIBTI's own FDD ("3–5 question survey") | Core 5-question survey (id-locked `q1`-`q5`) + up to 5 Company-added custom questions (Survey Builder V2, DL-066/067) | MATCH |
| Purchase intent | Evidenced in Samplia, SoPost, GratisIQ (as sales-lift), Sampl | `analytics.service.ts` computes Top-2-Box purchase intent from `q3`/similar fixed-key survey answer (per DL-081's confirmation) | MATCH |
| Reviews/sentiment | Evidenced in Zamplit, Sampl, SoPost | Text/verbatim survey answers exist and are quality-gated for the report's "Consumer Voice" section; no separate public review/testimonial object | INTENTIONAL DIFFERENCE (no evidence TAJRIBTI intends public reviews — FDD frames this as a B2B insight product, not a review platform) |
| Rewards | Evidenced implicitly (engagement mechanics) across references; not detailed in depth on any homepage reached | Points-based reward on verified redemption (`rewardPoints`); FDD explicitly defers "full digital wallet" and "referral program" to post-scale | MATCH (bounded by FDD's own explicit deferral) |
| Post-trial re-engagement | Explicit in GratisIQ (email/SMS re-activation), Zamplit (wallet/notifications) | No evidenced re-engagement mechanism beyond Consumer Mobile's own "Activity"/history screen (passive, not push-driven) | POTENTIAL GAP — but explicitly out of MVP scope per FDD's Future Modules list (referral/gamification deferred), so likely INTENTIONAL DIFFERENCE rather than an oversight |

---

## 9. Company Blueprint

| Element | Reference evidence | TAJRIBTI current | Classification |
|---|---|---|---|
| Company identity/profile | Not detailed in depth on any homepage reached (evidence gap) | `BrandAccount`: name, email, password, logo, sector; `CompanyProfile.tsx` self-service page | UNKNOWN (reference) / MATCH (repo-internal: matches FDD's "brand dashboard") |
| Company users/employees/roles | Zamplit implies a "team" reading its Insights Lab collaboratively; no reference explicitly documented multi-seat roles on the pages reached | **None.** One login per Company. `BrandContact` = non-authenticated record only (DL-069) | **POTENTIAL WRONG IMPLEMENTATION relative to this task's own Section 8 items 9–11** (see Finding W-1, Section 20) — evidence against the reference set alone is UNKNOWN/weak, but evidence against this task's explicit Founder-decision list is direct and strong |
| Campaigns | Universal across every reference | `Campaign` entity, brand-scoped, full CRUD via `CampaignController`, ownership-enforced (403 cross-brand, re-verified DL-064) | MATCH |
| Products | Implied by every reference (a campaign is always "of a product") | `productName`/`productImage`/`description` on `Campaign` — no separate `Product` entity (a Company's product catalog is not modeled; each campaign carries its own product fields) | INTENTIONAL DIFFERENCE — reasonable for one-campaign-per-launch model; becomes a POTENTIAL GAP only if a Company runs repeat campaigns for the same product and needs catalog-level history/reuse — no evidence either way this was Founder-considered |
| Audience/segments | Zamplit: explicit "segments" as a first-class insights concept | No segment-builder; demographic filters exist only as report breakdowns (`Insights.tsx`/`analytics.service.ts` demographic cuts), not as a reusable audience object | POTENTIAL GAP relative to Zamplit's model, but UNKNOWN whether this is required for TAJRIBTI's Egypt-Cairo-pilot scale (FDD explicitly says "basic analytics" for MVP) |
| Insights/Reports | Universal across every reference (dashboards/reports named explicitly by all 4 primary references) | `Insights.tsx`, `SurveyResults.tsx`, `AiSummary.tsx`, `Report.tsx` (7+ section bilingual PDF) — campaign-scoped, re-verified isolation DL-064 | MATCH — and by evidence density (DL-058–081's own detailed audit trail), this is the single most-iterated, most-verified part of the whole system |
| Commercial/contract information | No reference disclosed pricing-field-level detail (all use "contact us"/custom pricing) | No billing/contract/tier fields anywhere in `BrandAccount` or elsewhere — matches FDD's explicit stance that "revenue-mix percentages" are an Open Decision, not yet modeled | MATCH (both sides genuinely undefined — not a gap, a shared UNKNOWN) |
| Company self-service scope | Zamplit lets brands manage their own journeys/screeners fully | TAJRIBTI Company Console: campaign CRUD, own survey wording edits (bounded, DL-062), own contacts, own sector-recommended questions — self-service is real, not a shell | MATCH |

---

## 10. Employee/User Blueprint

No reference product reached this pass documented its own internal team/seat model in evidenced detail — this layer is the weakest-evidenced in the entire study (see Section 3, Section 7c). What can be stated with confidence comes from TAJRIBTI's own materials, not external reference:

- This task's own Section 8 (items 6–11) states, as a thing to verify: company employees register via a company-specific code, are real authenticated users, and must reach the Company experience from mobile as well as web.
- The repository's own FDD does not mention "employee," "company-specific code," or multi-seat company accounts anywhere in the constitutional document (`FOUNDER_DECISIONS.md`) — confirmed via direct grep across `FOUNDER_DECISIONS.md` and `DECISION_LOG.md`, zero matches for "employee".
- The only company-side multi-person concept that exists in code is `BrandContact` — explicitly documented (DL-069) as a non-authenticated record.

**This is Finding W-1 (Section 20).** It is reported as a conflict between this task's brief and the repository's own decision record, not resolved in either direction.

---

## 11. Admin Blueprint

| Element | Reference evidence | TAJRIBTI current | Classification |
|---|---|---|---|
| Operator identity | Not evidenced on any homepage reached (all references market to Company/Consumer, not to their own internal ops team) | Shared static secret (`ADMIN_SECRET` env var vs. `x-admin-secret` header) — no user, no session, no audit log of which operator acted | UNKNOWN vs. reference / **POTENTIAL WRONG IMPLEMENTATION vs. FDD** (FDD's own MVP Scope names "Admin dashboard" as a deliverable — a dashboard implies a UI and identity, not a curl-only header secret) |
| Company onboarding | Not evidenced | `POST /admin/brands` — API-only, header-gated, DL-059 explicitly scoped this as "no new auth system, no second identity model, no RBAC framework" | MATCH to FDD's "no public company signup" (Section 8 item 3/4) but GAP relative to "Admin dashboard" (FDD MVP scope) — Admin has no UI to perform this from |
| Company/campaign oversight navigation | Not evidenced | Admin can list/edit brand accounts (`GET/PATCH /admin/brands`) and their contacts. **No admin endpoint or UI exposes a Company's campaigns, participants, insights, or report from an operator vantage point.** | **POTENTIAL GAP relative to this task's Section 8 item 16** ("Company → Campaigns → Selected Campaign → Participants/Data → Insights → Report" navigation is fully built for a *Company itself*, not for an Admin) |
| Campaign approval workflow | Not evidenced on any reference homepage | No approval step exists — `POST /campaigns` from a Company goes straight to `draft`, and the Company itself flips it to `active`; no Admin review gate anywhere in `campaign.service.ts` | CONFLICTS WITH `07_DOMAIN_MODEL.md`'s documented `PENDING_APPROVAL → APPROVED` state (a **repository-internal** conflict, not an external-reference gap — see Finding W-3, Section 20) |
| Scale readiness (100–200 campaigns) | Not evidenced | `GET /campaigns` / `GET /campaigns/my` — no pagination found in `campaign.controller.ts`'s list endpoints (confirmed by reading the controller; not stress-tested this pass) | POTENTIAL GAP — real but unverified at actual 100–200-campaign scale; flagged, not fixed, per this task's no-implementation mandate |

---

## 12. Campaign Lifecycle Blueprint

**Reference-evidenced steps** (Section 7a) vs. **TAJRIBTI-evidenced steps** (from `campaign.entity.ts`, `campaign.service.ts`, `qr.service.ts`, `analytics.service.ts`, `report.service.ts`, cross-checked against `02_PROJECT_STATE.md`'s DL-058–084 trail):

```
Reference (converged pattern):
Concept/Objectives → Company → Campaign → Product → Audience(qualification) → Consumer
  → Participation → Trial/Sample → Feedback/Survey → Data → Analysis → Insights → Report
  → Action/Follow-up → Campaign completion/history

TAJRIBTI (code-verified):
Company(BrandAccount) → Campaign(draft) → Company sets status=active (no approval gate)
  → isCampaignOpenForParticipation() gate (status + startDate + endDate, Cairo-local)
  → Consumer discovers (GET /campaigns) → Consumer OTP-verifies for this campaign
  → QR scan or web entry → RedemptionEvent (DB-unique per consumer+campaign)
  → Survey submission (SurveyResponse, id-keyed answers) → analytics.service.ts aggregates
  → AiReport narrative (bilingual) → Report.tsx PDF (7+ sections) → Company sets
    status=completed/archived (soft-delete pattern, no hard delete anywhere)
```

**Evidenced match**: Campaign → Participation → Trial → Feedback → Data → Insights → Report is a faithful implementation of the converged reference pattern, and — per the DL-058–081 audit trail — has been traced end-to-end with real device verification (DL-065), not just source-read.

**Evidenced divergence from the reference pattern's "Audience/Qualification" step**: no reference-equivalent screener/eligibility gate exists before a consumer can redeem (see Section 8 row 3). Whether this matters depends on TAJRIBTI's actual fraud/quality tolerance at pilot scale — UNKNOWN, not concluded here.

**Evidenced divergence from TAJRIBTI's own prior documentation** (not from any reference): the "Concept/Objectives → Admin approval" step described in `07_DOMAIN_MODEL.md`'s PRD-sourced state machine does not exist in the actual code. This is Finding W-3.

---

## 13. Sampling/Trial Blueprint

QR-based redemption with server-side duplicate prevention is the one mechanic evidenced across the widest set of references (GratisIQ explicit, implied in Samplia/Freestand/SoPost) and is also TAJRIBTI's most load-tested, most-remediated subsystem (DL-083/084 — a real race condition was found and fixed via partial unique index + service-layer handling, re-verified across 3 rounds of concurrent testing). **MATCH**, with one caveat carried forward honestly by the repository itself, not discovered by this pass: the `<1s` p95 response-time criterion from `MASTER_DELIVERY_PLAN.md` remains unmet at the tested concurrency, and the production migration for the fix has not yet been applied (B-04 remains OPEN per `FOUNDER_DECISIONS.md` DL-084). This pass does not re-verify or re-attempt that work — it is out of scope for a no-implementation reference study, and is already the most rigorously self-documented open item in the whole repository.

---

## 14. Survey/Data Blueprint

5-core-question + up-to-5-custom-question model (`SurveyEditor.tsx`, DL-066/067) with id-keyed (not position-keyed) answer storage — this design choice is directly responsible for TAJRIBTI being able to let Companies reorder/reword survey questions without breaking `analytics.service.ts`'s fixed-key reads, a real architectural strength not found described at this level of detail in any reference reached. **MATCH to the reference pattern**, and arguably a more defensively-engineered implementation of "Company can customize the survey" than any reference's marketing copy evidences.

---

## 15. Insights Blueprint

Data → Analysis → Insight → Report is implemented as: `analytics.service.ts` (aggregation, Top-2-Box purchase intent, demographic cuts, custom-question breakdowns) → `AiReport` (bilingual AI narrative, invalidated on new data, hedged against overclaiming per DL-053/081) → `Report.tsx`/`report.service.ts` (7+ section bilingual PDF: Executive Summary, Research Objective, Audience Profile, Purchase Intent, Consumer Voice, Key Findings, Recommended Actions, Methodology, per DL-064's own count). This is the single most externally-verifiable-as-mature part of the system, both against the reference pattern (Zamplit's "Insights Lab" is the closest documented analog: dashboards + response analysis + segments + qualitative themes — TAJRIBTI matches dashboards/response-analysis/qualitative-themes, does not match Zamplit's explicit "source performance"/"sales-matching" concepts) and against the repository's own dense self-audit trail. **MATCH**, with the sales-matching/revenue-attribution gap noted as INTENTIONAL DIFFERENCE (no evidence TAJRIBTI has ever intended to integrate a brand's POS/sales data — not in FDD, not in any DL entry).

---

## 16. Reporting Blueprint

Covered above (Section 15) — the PDF Report is the "reporting" deliverable. One genuine, previously-self-disclosed limitation carried forward: PDF pagination/page-break architecture is a known, documented, deferred issue (`02_PROJECT_STATE.md`, DL-076/080) — not rediscovered by this pass, and explicitly out of scope to fix here.

---

## 17. Entity/Data Model Blueprint

| Entity | Reference requires it? | First-class in TAJRIBTI? | TAJRIBTI shape | Note |
|---|---|---|---|---|
| Company/Brand | Yes (universal) | Yes — `BrandAccount` | id, name, email, password, logoUrl, sector, soft-delete | MATCH |
| Employee/User (company-side) | UNKNOWN (no reference evidenced this in enough depth) | **No** — only a non-authenticated `BrandContact` record | See Finding W-1 | POTENTIAL WRONG IMPLEMENTATION vs. this task's Section 8, UNKNOWN vs. external reference |
| Admin/Operator | UNKNOWN (not evidenced externally) | **No entity** — a config-file secret string | See Finding W-2 | POTENTIAL WRONG IMPLEMENTATION vs. FDD's own MVP scope |
| Consumer | Yes (universal) | Yes — `Consumer` | phone (required, unique) + optional email/password account, demographics | MATCH |
| Campaign | Yes (universal) | Yes — `Campaign` | brand-scoped, 5-state lifecycle, jsonb survey questions, scheduling fields | MATCH |
| Product | Implied (universal) | **No separate entity** — fields live directly on `Campaign` | productName/productImage/description | INTENTIONAL DIFFERENCE (see Section 9) |
| Audience/Segment | Zamplit: explicit first-class entity | **No** — demographic cuts computed at report time, not stored as a reusable object | — | POTENTIAL GAP (low confidence — scale-dependent) |
| Eligibility/Screener | Sampl, Zamplit: explicit | **No** — only identity (OTP) + schedule gating | — | POTENTIAL GAP (see Section 8) |
| Survey/Question | Yes (universal) | Yes — `SurveyQuestion` (jsonb on `Campaign`, not a separate table) | id/type/text/textAr/options, core 5 + up to 5 custom | MATCH |
| Response | Yes (universal) | Yes — `SurveyResponse` | jsonb `answers`, id-keyed, campaign+consumer+redemption FK | MATCH |
| QR | Yes (evidenced explicitly by GratisIQ, implied elsewhere) | Yes — `QrCode` | active/demo/voided states | MATCH — note: does NOT match `07_DOMAIN_MODEL.md`'s documented `UNUSED→RESERVED→REDEEMED/VOIDED` TTL state machine (Finding W-3) |
| Redemption | Yes (universal — the "trial happened" record) | Yes — `RedemptionEvent` | consumer+campaign+qrCode FK, DB-unique-constrained, immutable append-only | MATCH |
| Insight/Report | Yes (universal) | Yes — `AiReport` + `Report.tsx`/`report.service.ts` render pipeline | bilingual narrative, invalidated on new data | MATCH |
| Commercial/Contract info | UNKNOWN externally (no reference disclosed field-level detail) | **No fields modeled** | — | Shared UNKNOWN, not a gap (see Section 9) |

---

## 18. TAJRIBTI Current-State Mapping (Summary)

The current implementation is a genuinely functional, code-verified, end-to-end sampling → survey → insight → report loop, isolated per Company, device-tested at least once with real production data (DL-065). Its two structurally distinct weak points, both evidenced directly from code rather than inferred, are:

1. The **Company-side identity model** stops at one login per Company — there is no multi-employee structure at all, despite this task's brief asserting that requirement as an active Founder decision.
2. The **Admin/operator layer** is a config-secret gate with no identity, no UI, and no cross-Company navigation — despite the project's own constitutional FDD listing "Admin dashboard" as MVP scope.

Everything else audited (Consumer, Campaign, Survey, QR/Redemption, Insights, Report) matches the converged reference pattern at a level of fidelity this pass's evidence supports calling genuinely strong, not merely "present."

---

## 19. Match / Intentional Difference / Potential Gap / Potential Wrong Implementation / Unknown — Full Matrix

| # | Area | Classification | Confidence |
|---|---|---|---|
| 1 | Consumer identity (phone+account) | MATCH | High (repo) |
| 2 | Campaign discovery/feed | MATCH | High (repo) |
| 3 | Pre-redemption eligibility/screener | POTENTIAL GAP | Low-moderate (only 2/6 references evidence this; unclear if needed at pilot scale) |
| 4 | QR-based redemption + duplicate prevention | MATCH | High (repo, load-tested) |
| 5 | Core+custom survey model | MATCH | High (repo) |
| 6 | Purchase intent measurement | MATCH | High (repo) |
| 7 | Public reviews/testimonials | INTENTIONAL DIFFERENCE | Moderate (FDD frames as B2B insight, not review platform) |
| 8 | Rewards (points only, no wallet) | INTENTIONAL DIFFERENCE | High (FDD explicitly defers wallet) |
| 9 | Post-trial automated re-engagement | POTENTIAL GAP / INTENTIONAL DIFFERENCE | Moderate (FDD defers referral/gamification, doesn't explicitly address re-engagement messaging) |
| 10 | Company identity/profile | MATCH | High (repo) |
| 11 | **Company employees (authenticated, code-gated, mobile-accessible)** | **POTENTIAL WRONG IMPLEMENTATION** | High vs. this task's brief; Low/Unknown vs. external reference |
| 12 | Campaign CRUD + ownership isolation | MATCH | High (repo, re-verified DL-064) |
| 13 | Product as separate entity/catalog | INTENTIONAL DIFFERENCE | Moderate |
| 14 | Audience/segment as reusable object | POTENTIAL GAP | Low-moderate |
| 15 | Insights/analytics dashboard | MATCH | High (repo + Zamplit reference) |
| 16 | Reports (PDF, bilingual) | MATCH | High (repo, most-iterated subsystem) |
| 17 | Sales/revenue attribution (trial→purchase) | INTENTIONAL DIFFERENCE | Moderate (only Zamplit evidences this; no FDD basis to add it) |
| 18 | Commercial/contract data model | UNKNOWN (shared) | N/A |
| 19 | **Admin identity/UI/console** | **POTENTIAL WRONG IMPLEMENTATION** | High vs. FDD's own MVP scope; Low vs. external reference (not evidenced there) |
| 20 | **Admin → Company → Campaigns → Participants → Insights → Report navigation** | **POTENTIAL GAP** | High vs. this task's Section 8 item 16 |
| 21 | Campaign approval workflow | **POTENTIAL WRONG IMPLEMENTATION** (repo-internal conflict) | High — `07_DOMAIN_MODEL.md` documents it, code has none |
| 22 | QR state machine (TTL/reservation) | UNKNOWN / repo-internal conflict | High confidence the *documentation* is stale; low confidence on whether a reservation window is actually needed |
| 23 | Campaign list pagination at 100–200 scale | POTENTIAL GAP | Low (not stress-tested this pass) |
| 24 | Company-scoped self-service (own campaigns, own survey wording, own contacts) | MATCH | High (repo) |
| 25 | Cross-Company data isolation | MATCH | High (repo, independently re-verified 3+ times across DL-061 through DL-084) |

**Totals**: MATCH = 12, INTENTIONAL DIFFERENCE = 5, POTENTIAL GAP = 5, POTENTIAL WRONG IMPLEMENTATION = 4 (counting #21/#22 as one root cause pair for the completion-message tally in Section 26's report, or 5 if counted separately — see exact count there), UNKNOWN = 1 (shared commercial data).

---

## 20. Critical Wrong-Build Findings

### Finding W-1 — Company has no authenticated employee layer
**Evidence**: `brand-account.entity.ts` (single login), `brand-contact.entity.ts` (explicitly a non-account record per its own code comment), `company.controller.ts` (all routes require `req.user.type === 'brand'`, i.e. the one `BrandAccount` JWT — no employee-JWT concept exists anywhere in `auth.module.ts`/`jwt.strategy.ts`), zero hits for "employee" in `FOUNDER_DECISIONS.md`/`DECISION_LOG.md`.
**Conflict**: This task's own Section 8 (items 6–11) states company-specific-code employee registration, admin-created employee accounts, and mobile-accessible employee identity as things to verify against a still-active Founder requirement. DL-069 (LOCKED, 2026-09-01) chose the opposite architecture, with its rationale attributed to "this session's direction" rather than a quoted, dated Founder statement specifically addressing employees.
**Not resolved here.** Per Section 1's governance rule, this is reported, not adjudicated. Two readings are both consistent with the evidence: (a) the Founder's requirement genuinely predates and outranks DL-069 and DL-069 was an AI-session overreach that should be revisited; (b) the Founder's requirement is a *new* instruction as of this task, and DL-069 was correct for its time and now needs a deliberate, explicit LOCKED-decision change. The repository cannot answer which on its own.

### Finding W-2 — Admin is a header secret, not a control center
**Evidence**: `admin.controller.ts`'s `checkAdminSecret()` (one static string comparison), zero admin routes/pages in `apps/dashboard/src`, `FOUNDER_DECISIONS.md`'s Product Decisions table listing "Admin dashboard" under MVP Scope.
**Conflict**: This is a conflict against the project's *own* constitutional document, not against an external reference (external references gave no usable Admin-layer evidence — Section 7c). FDD says "Admin dashboard" (implying UI + presumably identity); the shipped artifact is an unauthenticated-by-UI, single-shared-secret API surface with no way for a human operator to browse Company → Campaigns → Participants → Insights → Report (Section 8 item 16 of this task, and Section 11 above).

### Finding W-3 — Repository's own domain documentation contradicts its own shipped code
**Evidence**: `AI_BOOTSTRAP/07_DOMAIN_MODEL.md` (PRD-sourced) documents `Campaign: DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → PAUSED → COMPLETED → ARCHIVED` and a `QRCode: UNUSED → RESERVED(TTL 5min) → REDEEMED | VOIDED` state machine, plus first-class `Location` and `BrandUser` entities. None of these exist in the actual code: `CampaignStatus` is `draft/active/paused/completed/archived` (no approval gate), `QrCodeStatus` is `active/demo/voided` (no reservation/TTL), there is no `Location` entity, and there is no `BrandUser` entity (only `BrandAccount` + non-authenticated `BrandContact`).
**Not resolved here** — flagged per Section 1's instruction to report rather than silently pick a side. This is direct evidence that at least one of "the PRD/domain model" or "the shipped implementation" was never reconciled with the other, independent of anything found in the external reference research.

### Finding W-4 (lower severity) — The Founder Alignment Gate file is dated stale relative to the rest of the repository
**Evidence**: `00_FOUNDER_INTENT/06_FOUNDER_ALIGNMENT_GATE.md` states flatly "Engineering cannot begin today" and cites B-01 as OPEN with a 67/100 IERB score, dated for review "when B-01 closes." `AI_BOOTSTRAP/00_AI_START_HERE.md` and `02_PROJECT_STATE.md` (both newer, both dated 2026-09-01/09-02) record B-01 as CLOSED (DL-082, 2026-09-01) and TAJRIBTI as "V1 SHIPPED." The gate file's own "next review" trigger condition has been met and it has not been updated.
**Not resolved here** — flagged. This did not block this task (a research/documentation pass, not engineering), but a future session executing the gate literally would produce a FAILED result contradicted by the rest of the loaded repository in the same session — the exact "internally contradictory repository" pattern `02_PROJECT_STATE.md`'s own twenty-fifth-pass entry already found and reported once before (2026-09-01) for a different pair of files.

---

## 21. Protected Areas That Should NOT Be Changed

Per this task's own prohibitions and the repository's LOCKED-decision record, the following are **explicitly out of scope for any follow-on implementation** and were not touched by this pass:
- Consumer authentication (`auth.controller.ts`/`auth.service.ts` consumer flows) — FOUNDER MOBILE REQUEST LOCK, DL-057.
- QR/redemption lifecycle logic (`qr.service.ts`) — actively remediated and LOCKED as of DL-083/084; only a known, disclosed performance/migration gap remains, itself already tracked as B-04 OPEN, not a target of this pass.
- Survey foundation (core 5-question id-locked model) — protected by `validateSurveyQuestionEdit()`/Survey Builder V2's own core/custom split (DL-062/066/067), which multiple downstream systems (`analytics.service.ts`, Mobile `survey_screen.dart`) depend on structurally.
- Company Console's existing self-service surface (Campaigns/Overview/Insights/SurveyResults/AiSummary/Report/Gallery/CompanyProfile) — DL-058–081's fully-verified, most-audited part of the system.
- Any deferred feature on `00_FOUNDER_INTENT/04_WHAT_NOT_TO_BUILD.md`'s lists (RBAC frameworks, enterprise CRM integration, referral/gamification, e-commerce, paid consumer subscriptions, non-Cairo geography, non-FMCG/beauty/pharma-OTC verticals).

---

## 22. Areas Requiring Reconsideration Before Implementation

These are the findings from Section 20 restated as forward-looking questions for the Founder, not recommendations to build anything now:

1. **Company employees** (Finding W-1): does the Founder want authenticated, code-gated, mobile-accessible employee accounts as a real requirement going forward, superseding DL-069? Or was DL-069's single-login-per-Company model already the Founder's intent, and this task's Section 8 items 6–11 describe a target for a *later* phase, not now?
2. **Admin as a real control center** (Finding W-2): does closing this gap belong inside the still-open Track 1 authorization gate (B-02/B-03/B-04), or is it more naturally read as unfinished MVP scope that predates and is independent of Track 1?
3. **Domain-documentation reconciliation** (Finding W-3): should `07_DOMAIN_MODEL.md` be corrected to match the shipped code, or does it represent an intentionally deferred richer model (approval workflow, location-level granularity, QR TTL/reservation) that the Founder still wants built later? The repository does not currently record which.
4. **Founder Alignment Gate staleness** (Finding W-4): a routine housekeeping item — the gate file should be refreshed now that its own stated review trigger (B-01 closing) has occurred, independent of any Track 1 decision.
5. **Pre-redemption eligibility/screener** (Section 8 row 3, Section 19 #3): worth a deliberate Founder decision on whether Egypt-pilot scale needs a qualification gate before a sample is issued, informed by real pilot fraud/waste data once it exists — not before.

---

## 23. Recommended Order of Reconciliation

1. Resolve Finding W-4 first (near-zero cost, purely a documentation refresh, prevents a future session from a false gate FAILURE).
2. Get an explicit Founder ruling on Finding W-1 (Company employees) — it has the widest product-shape consequences (auth model, mobile scope, Admin provisioning flow) of anything found.
3. Get an explicit Founder ruling on Finding W-2 (Admin as control center) — depends partly on the answer to #2 (an Admin console that manages employees is a different scope than one that doesn't).
4. Reconcile Finding W-3 (`07_DOMAIN_MODEL.md` vs. shipped code) — lowest urgency; a documentation-only fix once #2/#3 clarify whether the richer PRD-era model (approval workflow, Location, QR TTL) is still wanted.
5. Revisit the lower-confidence POTENTIAL GAPs (pre-redemption screener, audience/segment object, pagination at scale, post-trial re-engagement) only after 1–4, and only with real pilot-usage evidence to weigh them against — none of them are urgent on the evidence gathered here.

---

## 24. Clone Decision

**No clone recommended.** Section 5/6 found no source-available product reaching a fidelity level worth adopting or referencing further; TAJRIBTI's own domain model (Section 17) is, on this pass's evidence, further along than anything located in the search. This conclusion is not forced — it is the actual, disclosed result of 4 search queries across two rounds (Section 5).

---

## 25. Final Confidence Score

```
REFERENCE CONFIDENCE:              45%
  — Based entirely on official marketing/product pages (Category A/D evidence),
    no live product trial, no case-study PDFs, no demo walkthroughs, one 404
    (AnyRoad's named feature page). Sufficient to identify a converged pattern
    at the "loop" level (Section 7a, high confidence within this bound) but
    insufficient for feature-by-feature specification-level comparison,
    especially for the Company/Admin layer (Section 7c — near-zero external
    evidence density).

TAJRIBTI CURRENT-STATE CONFIDENCE: 85%
  — Based on direct source-code reads of all 13 entities, all 10 controllers,
    all 11 modules, all dashboard pages, and the full Consumer Mobile screen
    inventory, cross-checked against the repository's own extensive DL-058–084
    self-audit trail (itself independently, repeatedly device/production
    re-verified per its own record). The 15% withheld is for: no fresh
    production smoke-test performed by this pass itself (relied on the
    repository's own most-recent, dated re-verifications), and no
    pagination/scale stress-test performed.

OVERALL BLUEPRINT CONFIDENCE:      55%
  — Weighted toward the lower Reference Confidence, since the central
    deliverable (a reference-grounded blueprint) is only as strong as its
    weakest input. High confidence in the four Wrong-Build Findings
    specifically (Section 20) because three of the four are evidenced
    primarily from repository-internal contradictions (this task's own
    brief vs. DL-069; FDD vs. shipped Admin; 07_DOMAIN_MODEL.md vs. shipped
    code) rather than from the thinner external-reference evidence — those
    findings do not depend on the weaker 45% Reference Confidence number.
```

---

## 26. Evidence Limitations

- No reference product's live app or demo was operated; all external evidence is marketing/product-page text, explicitly quoted where used (Section 3, Section 4).
- `anyroad.com/platform/feature/product-tour-brand-activations` (a page this task specifically named) returned HTTP 404; the homepage was substituted and is explicitly weaker evidence for AnyRoad specifically.
- Samplia's Play Store listing, Freestand's demo and named L'Oréal/CeraVe case study, and Zamplit's referenced qualitative-themes/source-performance detail pages were not fetched this pass — time/scope-bounded, not attempted and failed.
- The Company/Admin/operator layer (Section 7c, Section 11) is the weakest-evidenced layer on the *external reference* side across the entire study — every reference site markets to the Company or the Consumer, not to its own internal ops team, so this pass could not benchmark TAJRIBTI's Admin gaps (Findings W-2) against actual reference behavior, only against TAJRIBTI's own FDD.
- No production smoke-test, no fresh device test, and no pagination/scale test were performed by this pass — all "MATCH, High confidence (repo)" ratings rely on reading source code plus the repository's own dated self-audit trail (DL-058–084), not on this session independently re-executing those tests.
- All financial/commercial figures anywhere in this document that touch TAJRIBTI (none were included as fields — see Section 9/17's "shared UNKNOWN") remain unvalidated and illustrative per `03_NON_NEGOTIABLE_RULES.md` Rule 5; none were invented for this pass.

---

## Final Decision Matrix

| Area | Reference Evidence | TAJRIBTI Current | Classification | Confidence | Action |
|---|---|---|---|---|---|
| Consumer identity/panel | Samplia (2M+ users), TAJRIBTI FDD's own panel-as-moat framing | `Consumer` entity, phone+account auth | MATCH | High | PROTECTED |
| Campaign discovery feed | Universal | `GET /campaigns`, Mobile Home | MATCH | High | PROTECTED |
| Pre-redemption eligibility/screener | Sampl, Zamplit | None beyond OTP+schedule gate | POTENTIAL GAP | Low-moderate | INVESTIGATE |
| QR redemption + dup. prevention | GratisIQ explicit; universal implied | `qr.service.ts`, DB-unique, load-tested | MATCH | High | PROTECTED |
| Survey (core+custom) | Universal | Survey Builder V2, id-keyed | MATCH | High | PROTECTED |
| Purchase intent | Samplia/SoPost/GratisIQ/Sampl | Top-2-Box, `analytics.service.ts` | MATCH | High | PROTECTED |
| Public reviews/testimonials | Zamplit/Sampl/SoPost | Verbatims only, no public review object | INTENTIONAL DIFFERENCE | Moderate | KEEP |
| Rewards (points, no wallet) | Not detailed externally | Points only, wallet deferred by FDD | INTENTIONAL DIFFERENCE | High | KEEP |
| Post-trial re-engagement | GratisIQ, Zamplit | Passive history screen only | POTENTIAL GAP / INTENTIONAL DIFFERENCE | Moderate | RECONSIDER |
| Company identity/profile | Not detailed externally | `BrandAccount`, self-service profile | MATCH | High | PROTECTED |
| **Company employees (authenticated, mobile-accessible)** | Not detailed externally; **this task's own Section 8 asserts it as required** | None — single login, non-auth `BrandContact` | **POTENTIAL WRONG IMPLEMENTATION** | High (vs. task brief) | **RECONSIDER** |
| Campaign CRUD + isolation | Universal | Full CRUD, 403 cross-brand, re-verified | MATCH | High | PROTECTED |
| Product as separate/catalog entity | Implied universal | Fields on Campaign only | INTENTIONAL DIFFERENCE | Moderate | KEEP |
| Audience/segment object | Zamplit explicit | Report-time cuts only, not reusable | POTENTIAL GAP | Low-moderate | INVESTIGATE |
| Insights dashboard | Zamplit closest analog | `Insights.tsx`/`SurveyResults.tsx`/`AiSummary.tsx` | MATCH | High | PROTECTED |
| Reports (bilingual PDF) | Universal | 7+ section Report.tsx, most-iterated subsystem | MATCH | High | PROTECTED |
| Sales/revenue attribution | Zamplit only | Not modeled | INTENTIONAL DIFFERENCE | Moderate | KEEP |
| Commercial/contract fields | Not disclosed by any reference | Not modeled | UNKNOWN (shared) | N/A | INVESTIGATE |
| **Admin identity/UI/console** | Not evidenced externally; **TAJRIBTI's own FDD names "Admin dashboard" as MVP scope** | Shared header-secret API only, zero UI | **POTENTIAL WRONG IMPLEMENTATION** | High (vs. FDD) | **RECONSIDER** |
| **Admin cross-Company navigation** | Not evidenced externally; **this task's Section 8 item 16 asserts it as required** | Exists only inside a Company's own self-service Console | **POTENTIAL GAP** | High (vs. task brief) | **RECONSIDER** |
| **Campaign approval workflow** | Not evidenced externally | None in code; **`07_DOMAIN_MODEL.md` documents one** | **POTENTIAL WRONG IMPLEMENTATION** (repo-internal conflict) | High | **INVESTIGATE** |
| QR reservation/TTL state | Not evidenced externally | None in code; `07_DOMAIN_MODEL.md` documents one | UNKNOWN / repo-internal conflict | High (doc is stale) / Low (whether needed) | INVESTIGATE |
| Campaign list pagination at 100–200 scale | Not evidenced externally | Not found in `campaign.controller.ts` | POTENTIAL GAP | Low (unstress-tested) | INVESTIGATE |
| Cross-Company data isolation | Universal expectation | Re-verified independently 3+ times (DL-061–084) | MATCH | High | PROTECTED |
| Founder Alignment Gate currency | N/A | Stale relative to `02_PROJECT_STATE.md`/`00_AI_START_HERE.md` | Repo-internal conflict | High | INVESTIGATE |

---

*This document is new; it does not modify, supersede, or delete any existing workspace file. Per this task's explicit governance rules, no repository conflict identified above (Findings W-1 through W-4, and the pagination/screener/segment gaps) has been silently resolved in either direction — all are left for explicit Founder decision.*
