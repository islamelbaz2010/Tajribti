# TAJRIBTI — CURRENT PROJECT STATE

Date: 2026-09-26 · Status: current-state memory layer · Supersedes: historical status summaries only where this file states newer implemented truth. It does not supersede the immutable Benchmark or any locked Founder decision.

## 1. Project identity

TAJRIBTI is a campaign-scoped **Consumer Study** platform for FMCG products: real product trial, structured consumer evidence, and an evidence-bound report. Consumer Intelligence is a category/brand term, not a package tier. Real Estate, Restaurants/Food Service, Hospitality/Travel, GCC offers, in-product incentives, and non-FMCG scope remain excluded.

## 2. Governance baseline

- Benchmark: `governance/REFERENCE_PRODUCT_BENCHMARK.md`
- Benchmark SHA-256: `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a`
- Strategic Founder decisions: `governance/FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md`
- AI_BOOTSTRAP: absent.
- Primary implementation evidence: `api/src`, `api/prisma`, `web/app`, `web/public`, `api/test`.
- Historical `reports/` files remain provenance and must not be treated as current Product Truth where this file records a newer state.

## 3. Locked Founder decisions currently governing implementation

- Consumer web journey is Product Core; Mobile remains frozen.
- Campaign lifecycle remains DRAFT → READY → ACTIVE → PAUSED → COMPLETED; no invented Resume or reverse transition.
- Company/Operations tenant isolation, role model, Platform Admin authority, audit logging, lifecycle locks, QR architecture, and small-cell suppression remain binding.
- Industry-governed study-type eligibility remains centralized: generic studies are universal; the three sector-specific Post-Trial variants are limited to their matching industries; Operations keeps the full catalog.
- Report output is deterministic and evidence-bound. No predictive analytics, statistical-significance claim, sentiment-as-finding, theme inference, norms, personas, sales/ROI claim, unsupported causal conclusion, or automated Insight → Decision verdict.
- Insight → Decision remains **not promised / not implemented** pending a separate methodology decision.
- Commercial product names are Essential, Standard, Professional, Custom.

## 4. Superseded state

- “Report Product #08 is defined but not authorized” is superseded by the current Founder-authorized execution pass: #08 is now implemented where authoritative definitions existed.
- The old Sample Report “Insight → decision” block was a documented stale surface and has been removed.
- Pilot pricing is cancelled; historical scenario numbers are assumptions/research, not public or immutable prices.
- Historical package names such as Core/Intelligence/Advanced are superseded by Essential/Standard/Professional/Custom.

## 5. Implemented product state

Implemented and regression-covered product surfaces include:

- Consumer discovery/link/QR → OTP → eligibility → trial redemption → post-trial survey.
- Company workspace: profile, employees, products, campaign setup, industry-governed study types, questions, QR/sources, media, readiness, live results, insights, reports, audit visibility.
- Operations workspace: pipeline, requests/approvals, launch/pause/close, participant PII gating, issues, survey operations, commercial terms, insights, reports, CMS.
- Platform Admin: global oversight, company identity management, employee and ops-user revocation, direct audited campaign/product/question/media/QR management, CMS draft/publish, access audit.
- Persistent media and signed/private URLs.
- Evidence-bound report with persisted participation, answer, source, demographic, choice, rating, purchase-intent, text, findings, recommendation, narrative, methodology, and limitation lineage.

## 6. Report Product #08 state

**Status: IMPLEMENTED.**

- Deterministic purchase-intent and product-rating distributions expose counts, percentages, labels, and response n.
- Choice questions expose counts and percentages with explicit denominators: respondents for single-choice, selections for multi-choice.
- Source and demographic shares are deterministic and labeled.
- Evidence coverage is shared between readiness and the final report.
- Customer-facing report surfaces use plain status/evidence labels while preserving internal machine states.
- Empty/unsupported report blocks are suppressed rather than rendered as fake or misleading values.
- All 14 executable study templates now have methodology profiles. The six profiles added for the prior gap are:
  - `POST_TRIAL_FOOD_BEVERAGE`
  - `POST_TRIAL_BEAUTY_PERSONAL_CARE`
  - `POST_TRIAL_HOME_CARE`
  - `CONCEPT_LAUNCH_VIABILITY`
  - `PACKAGING_CLAIMS_REACTION`
  - `USAGE_ATTITUDE`
- Existing evidence bands and small-cell suppression remain unchanged.
- No new scoring, thresholds, significance tests, AI findings, or Insight → Decision output were introduced.

## 7. Sample Report state

The public Sample Report is explicitly fictional demo data and now matches the Standard enhanced-report shape: funnel, executive summary, purchase-intent and rating distributions, sample composition, campaign-question percentages, audience differences, consumer voice, findings, evidence coverage, recommendations, study methodology, and limitations. The stale Insight → Decision chain and “Directional support” language are removed.

## 8. Commercial package architecture

**Status: campaign-scoped commercial/quote-readiness state implemented; billing is intentionally not implemented.**

| Package | Current product meaning |
|---|---|
| Essential | Core evidence report only; Standard+ enhanced report fields are withheld from company-facing report/insight/live output. |
| Standard | Core report plus deterministic distributions, percentages, chart-ready values, evidence coverage, and the approved human analyst-written summary service layer. |
| Professional | Standard-level reporting plus the approved human analyst readout/discussion service layer. |
| Custom | Scoped SOW for 250+ participants and/or clearly non-standard scope; a scope note/SOW basis is required. |

Implemented commercial controls:

- `CampaignCommercialTerms` records package, contracted participant count, fulfillment model, scope note, quoted EGP terms, discount basis, manual-bank-transfer state, and updater.
- Company has read-only package/quote visibility; Operations can read; Platform Admin can update with access audit.
- Completed eligible participants are compared with the contracted quantity.
- Any completed overage is marked for fieldwork change order; overage above +50% of contracted n is marked for re-scope per the commercial register.
- Discount is capped at 20% and applies to the quoted study fee only.
- Home Delivery is an explicit fulfillment state and must be separately quoted before commercial status leaves draft.
- QUOTED, AWAITING_BANK_TRANSFER, and PAID_CONFIRMED require a complete quoted scope.
- Manual bank transfer is the only supported payment method.
- No payment gateway, invoice engine, tax engine, subscription, renewal, entitlement framework, card charge, or public price list exists.

## 9. Accounting / quote readiness

Implemented:

- package identification;
- contracted/completed eligible participant comparison;
- quoted study fee, participant rate, and optional Home Delivery fee;
- discount amount on study fee;
- quoted subtotal before tax;
- shortfall and overage state;
- manual payment status.

Still external/validation-required:

- final working price list;
- VAT/e-invoicing and accounting treatment;
- contract/SOW/cancellation wording;
- first-quote Founder approval;
- margin validation from real fieldwork costs;
- PDPL handling for any future Home Delivery workflow.

## 10. Public Website state

The public website now communicates only implemented capabilities:

- real trial → structured evidence → evidence-bound report;
- three FMCG sectors;
- nine public study cards marked “Available now,” each backed by executable template support;
- approved-but-not-executable directions remain explicitly separated;
- Essential/Standard/Professional/Custom package language is published without public pricing;
- the consumer path says web/QR + OTP and does not require an app download;
- no predictive, sentiment, AI-generated finding, reward, CRM/e-commerce, marketplace, enterprise API, guaranteed-SLA, or Insight → Decision capability is promised.

## 11. Infrastructure gates

- Production media/bucket integration: implemented and previously verified.
- Health endpoint and deploy health checks: implemented.
- Railway metrics/deploy/crash notification coverage: partially implemented; external uptime and threshold/dashboard alerts remain owner actions.
- Daily snapshot/backup and restore drill: owner action; do not claim configured until verified.
- Production database remains SQLite on mounted storage; unused PostgreSQL remains retained by decision.
- Railway production follows `benchmark-current`, not `master`; current inspection shows `api` and Postgres `SUCCESS`, with the `api-volume` and `tajribti-media` bucket present.
- Vercel Preview was refreshed through the established CLI workflow: `dpl_2gJbWr9q8twus2HERNVckVPfKBhs` / `https://tajribti-5bk3yeeup-islam-elbaz-s-projects.vercel.app` is `READY`, serves the isolated seeded preview DB, and passed homepage/health/Company-workspace smoke checks. A deployment-scoped share link was issued with a 30-day TTL; the share secret is deliberately not stored in the repository. Production promotion requires explicit authorization.

## 12. Mobile freeze

`mobile/`, Flutter/iOS/Android code, mobile release files, and mobile behavior are frozen. Zero mobile changes are permitted in this state.

## 13. Test / build baseline

Current intended baseline for this state:

- API regression: 194 tests / 52 suites / 0 failures.
- TypeScript build: clean.
- Prisma schema validation and migration deploy path: clean.
- Public/Company/Ops script syntax extraction: clean.
- Benchmark diff/hash: unchanged.
- Mobile diff: zero.

If a later commit changes code, this baseline must be re-run rather than assumed.

## 14. Current remaining work

### Implemented / closed in this pass

- Report Product #08.
- Sample Report reconciliation.
- Package terms and quote-readiness state.
- Package-gated enhanced report fields.
- Public website product/claims reconciliation.
- Canonical current-state memory.

### Owner action

- Confirm final working price list before the first quote.
- Resolve first-customer validation pricing after the cancelled pilot.
- Configure daily snapshot, manual backup, restore drill, uptime checks, and alert thresholds.
- Provide final marketing assets/brand corrections.

### Legal / accounting validation

- VAT, e-invoicing, invoice sequence, contract/SOW/cancellation wording, incentive payout treatment, and PDPL controls for Home Delivery.

### Deferred / future

- Insight → Decision methodology.
- Stored report snapshots/exports.
- Payment gateway, subscriptions, renewals, entitlement automation.
- Target-n field, if separately approved.
- Content Editor role.
- GCC expansion.
- Mobile unfreeze and any B-04 work.

### True product blockers

None currently recorded in the repository for Web/API/Product acceptance.
