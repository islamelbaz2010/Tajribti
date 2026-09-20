# TAJRIBTI — FOUNDER INNOVATION SPECIFICATION
## Date: 2026-09-20 · Baseline: 45aa571 · Layer: FOUNDER INNOVATION (not Benchmark)

This document specifies Founder-approved Innovation (OFD register:
`reports/TAJRIBTI_FOUNDER_INNOVATION_MASTER_REGISTER_2026-09-20.md`). It is NOT a Benchmark
amendment. `governance/REFERENCE_PRODUCT_BENCHMARK.md` is unchanged and remains Product Truth
for the existing product. Everything below is an additive Innovation layer.

Core preserved principle: **Consumer experiences/evaluates a product or approved concept and
provides feedback that becomes actionable consumer intelligence.** Study types must never turn
TAJRIBTI into a generic market-research platform.

---

## A–D. Study Types (OFD-04) + Price/Pack/Claims (OFD-05) + Beauty (OFD-07)

### Data model impact
- `Product.priceRange String?` — optional free-text price point/band label (e.g. "EGP 25–35").
  A structured numeric price with currency was NOT added: the platform has no defined currency
  model and no numeric-answer question type; inventing one would exceed the decision's scope.
- `Product.packSize String?` — optional pack/size label (e.g. "250ml", "90g").
- `Product.claims String?` — JSON array of claim strings (e.g. `["24h protection","sugar-free"]`).
- `Company.industry` already exists — Beauty is now a documented valid value (OFD-07). No schema
  change needed. Healthcare/Electronics/Services are NOT implemented.
- `CampaignMedia` — see §M.
- Lifecycle impact: none — these fields are descriptive metadata, editable while the campaign is
  configurable; no readiness gate added.

### Study-type catalog additions (`api/src/lib/studyTemplates.ts`)
All eight are catalog entries over the UNCHANGED question engine (5 types × 2 stages). Each
respects the existing correctness constraint: at most one `RATING_1_5` and at most one
`PURCHASE_INTENT_1_5` per template (campaign-wide aggregation blends same-type questions).

| Key | Objective | Trial model | Instrument notes | What it must NOT become |
|---|---|---|---|---|
| `CONCEPT_TESTING` | Is the product/concept appealing and differentiated enough to proceed? | Post-exposure/post-trial evaluation | Appeal + differentiation + intent + open improvement question | NOT a pre-development concept board — no stimulus stage exists; media assets may serve as stimulus reference only |
| `PRICING_PERCEPTION` | Is the perceived price acceptable for the value delivered? | Trial + price-context feedback | Price-acceptability + value-for-money choices; uses `Product.priceRange` as context | NOT Van Westendorp — needs a numeric price-ladder instrument that does not exist (future methodology decision) |
| `PACKAGING_EVALUATION` | Does the pack attract, communicate, and function? | Trial with pack in hand | Appeal/clarity/usability choices + open standout message | NOT a shelf test — no competitive shelf simulation exists |
| `CLAIMS_TESTING` | Is the main claim understood and believed? | Trial + claim exposure | Claim recall + believability rating; uses `Product.claims` | NOT substantiation research — measures perception only |
| `ADVERTISING_MESSAGE_TESTING` | Does the intended message land? | Message exposure + recall | Message recall + clarity + relevance choices; `CREATIVE` media as stimulus reference | NOT ad-effectiveness measurement — no exposure metrics exist |
| `BRAND_PERCEPTION` | How is the brand perceived by trialing consumers? | Trial + brand association | Brand attribute associations (multi-choice) + open text | NOT a brand tracker — single point-in-time, no longitudinal data |
| `UA_EXPANSION` | Deeper usage & attitude picture of category consumers | Screener-heavy + post-trial | Usage frequency/repertoire/drivers/barriers screeners + post-trial context | NOT a standalone U&A panel study — still campaign-bound |
| `SEGMENTATION_STUDY` | Do meaningful audience groups respond differently? | Trial + demographic/behavioral screeners | Multiple ELIGIBILITY screeners feeding segment dimensions | NOT a market-segmentation model — no clustering/inference is performed |

For each: findings/recommendations use the existing deterministic evidence rules; report
structure is the existing report (no per-type report branching is invented).

---

## E. AI Narrative (OFD-03)

**Methodology (binding):** `lib/narrative.ts` composes a report narrative from values ALREADY
computed by `buildReport()` — deterministic sentence templates, one fact per sentence, every
numeric value identical to its source field. No LLM, no external service, no probabilistic
generation. Both EN and AR renderings are produced from the same evidence fields.

Guardrails enforced by construction:
- cannot fabricate findings — it can only restate computed evidence;
- cannot invent causality — templates contain no causal connectives;
- cannot invent statistics — numbers are copied verbatim from the report object;
- sentiment/themes are absent from the narrative (they live, clearly labeled, in the derived
  intelligence layer);
- every narrative block is labeled `derivedNarrative: true` with a methodology string.

Failure cases: zero-data campaign → narrative states only that no evidence exists yet.
Arabic: templates hand-authored in Arabic (not machine-translated) to keep register honest.

## F. Consumer Identity / Panel / Same-Company Cross-Campaign Intelligence (OFD-15)

**Identity:** `Consumer` is already persistent (OTP-verified phone identity). OFD-08.4's
"traditional login/account" is satisfied by the persistent account + session model; no
email/password was added (the Benchmark OTP flow is a preserved foundation).

**Consent:** `Consumer.panelOptIn` + `panelOptInAt`; `POST /consumer/panel/opt-in` /
`.../opt-out`. Opt-in is explicit, reversible, timestamped.

**Same-company cross-campaign intelligence (15B):** `GET /company/panel-insights` returns, for
the caller's OWN company only: opted-in panel size reached by that company, repeat-participation
counts across that company's campaigns, and per-campaign participation counts for opted-in
consumers. It NEVER exposes another company's data and never returns consumer PII — aggregates
only. Small-cell suppression: any segment cell with n<5 is reported as `suppressed: true`
(minimum defined by OFD-15's "small-cell / privacy protection" requirement — this threshold is
a Founder-mandated privacy control, not an invented statistic).

**Shared panel (15C) — SUPERSEDED:** the post-innovation forensic audit (2026-09-20) confirmed
OFD-15C is a REJECTED direction under the authoritative Founder decision set. `GET /ops/panel`
and its Operations UI tab were removed; no shared TAJRIBTI-managed panel surface exists.
See `reports/TAJRIBTI_CORRECTIVE_IMPLEMENTATION_2026-09-20.md`.

**15D marketplace:** NOT implemented (future only). **Cross-company intelligence: never.**

Opt-out/deletion implications: opting out stops future inclusion in panel aggregates; historical
participation records remain campaign evidence (they are the campaign's data), but the consumer
no longer appears in panel aggregations. Full data-deletion semantics require the PDPL legal
sign-off (B-03, still open) — flagged as OPEN DEPENDENCY.

## G. Advanced Intelligence (OFD-06) — `lib/intelligence.ts`

Endpoint: `GET /company/campaigns/:id/intelligence` and `GET /ops/campaigns/:id/intelligence`
(same ownership scoping as insights). Every output block carries `derived: true` and a
`methodology` string. This layer is additive — `buildReport` output is unchanged except for the
additive `narrative` field.

- **Segmentation (A):** descriptive only — existing gender/city segment-conditioned evidence plus
  age-band buckets (18–24, 25–34, 35–44, 45–54, 55+) computed from `ageAtEntry` snapshots.
  Cells below n=5 are suppressed. No clustering, no inference.
- **Sentiment (B):** transparent keyword-lexicon heuristic (small EN/AR positive/negative word
  lists, versioned in code). Each verbatim gets a per-response label (`positive`/`negative`/
  `neutral`) computed by visible rules; aggregate = raw counts. Labeled: "derived — keyword
  lexicon heuristic, not a validated sentiment model." Responses containing no lexicon term are
  `neutral` — never guessed.
- **Automated Themes (C):** keyword-frequency themes — top recurring non-stopword terms (EN/AR
  stopword lists) with, per theme: `term`, `count`, `questionText`, and `sampleResponses`
  (traceable verbatim excerpts). No clustering, no naming of abstract themes — the theme IS the
  observed term. Labeled derived.
- **Predictive/Statistical (D):** descriptive statistics ONLY — Wilson score 95% confidence
  intervals on proportions (named, standard methodology) for choice questions and PI
  distribution; means already exposed. **No prediction model is implemented** — no defensible
  predictive methodology exists yet at platform data volumes. Prediction remains a documented
  future methodology decision. No significance testing between segments (no pre-registered
  hypothesis framework exists — inventing one would violate the evidence rules).

## H–L. Account / Platform Governance (OFD-08)

**Actors (Innovation-layer names — not Benchmark truth):**
- `PLATFORM_ADMIN` — TAJRIBTI platform-level administration: create companies, manage ops users,
  may access consumer PII (each PII-bearing access writes an `AccessAuditEvent`).
- `OPERATIONS` — operational monitoring/control: pipeline, readiness, lifecycle, issues, live,
  insights, reports, change-request review. Does NOT receive consumer PII
  lists (participants endpoint requires PLATFORM_ADMIN).
- `COMPANY_ADMIN` — full company capability incl. employee management and change requests.
- `COMPANY_MEMBER` — campaign/product authoring + reporting; cannot manage employees.
- Consumer — unchanged.

**Migration note:** existing `OpsUser` rows → `PLATFORM_ADMIN`; existing `Employee` rows →
`COMPANY_ADMIN`. This preserves current capability exactly — no existing user loses access.

**Explicit assignment (OFD-08.5):** ops campaign visibility is currently all-campaigns for all
ops users; "explicit assignment" is specified as future scoping (an `OpsAssignment` table) —
recorded as PARTIALLY IMPLEMENTED because the assignment mechanism needs a product decision on
assignment granularity (per-campaign vs per-company) that the decision does not specify.

**Auditability:** `AccessAuditEvent` (actorKind, actorId, actorName, action, targetType,
targetId, at) written for: company creation, ops-user creation, participants-PII access, panel
access, question-change apply. `GET /ops/audit-events` (PLATFORM_ADMIN).

## M. Campaign Media / Gallery (OFD-12)

`CampaignMedia(id, campaignId, kind, url, caption, createdAt)` — URL-referenced assets only this
pass (no binary storage infra exists; a future storage decision is needed for uploads).
`kind`: `PRODUCT_IMAGE | PACKAGING_IMAGE | CAMPAIGN_MEDIA | CREATIVE`. Company CRUD while
campaign configurable; read-only after launch; visible to ops on campaign detail; consumer-facing
display (campaign screen hero) is wired in web consumer app. Relationship to study types:
`PACKAGING_EVALUATION`/`CLAIMS_TESTING`/`ADVERTISING_MESSAGE_TESTING`/`CONCEPT_TESTING`
campaigns SHOULD carry relevant stimulus assets (documented in template `decision` text).

## N. PDF Export (OFD-13)

Print-view export path: report views in company + ops apps gain a language toggle (EN/AR) and an
"Export PDF" affordance that triggers a print-optimized layout (`@media print` stylesheet,
`dir="rtl"` for AR). Browser-native Save-as-PDF produces the file — no new server dependency,
no binary storage. Server-side generated PDF remains a technical-only future option.
Existing report data/behavior is untouched.

## O. Push Notifications (OFD-14) — SUPERSEDED

**Superseded by Founder decision (2026-09-20, product forensic pass):** consumers receive NO
push notifications — no campaign push, reminders, lifecycle push, reactivation, or "new
campaign" push, and no push provider is to be selected or configured. The consent endpoints,
notification-request routes, ops launch surface, and consumer/ops UI controls described below
were removed in that pass. The `Consumer.pushOptIn`/`pushOptInAt`/`pushToken` columns and the
`CampaignNotificationRequest` model are left dormant in the schema (dropping them would be a
destructive migration with no product need). Mobile push UI removal is deferred to the final
mobile-release phase (mobile code frozen this pass).

*Historical record of the superseded implementation:* consent (`pushOptIn`, `pushOptInAt`,
`pushToken`), `CampaignNotificationRequest` (company requests with title/body → ops launches),
`GET /ops/notification-requests`, `POST /ops/notification-requests/:id/launch`. On launch the
request recorded the eligible audience count (push-opted-in consumers matching the campaign's
audience fields) and `deliveryStatus: "PENDING_PROVIDER"` — no actual push delivery ever
existed; FCM/provider credentials were an OPEN DEPENDENCY. No WhatsApp, no SMS, no lifecycle
notifications.

## P. Public Website (OFD-17)

Expanded `web/public/index.html` (static, bilingual EN/AR sections): what TAJRIBTI is; how it
works (Trial→Feedback→Intelligence); for companies; for consumers; study types; consumer
intelligence; CTA/contact; trust/legal. No operational function on the site (login, signup,
surveys stay in the apps).

## Q. Question Change Audit Trail (OFD-19)

- `QuestionChangeRequest(id, campaignId, questionId?, action: EDIT|DELETE, payload JSON,
  reason?, requestedById→Employee, status PENDING|APPLIED|REJECTED, performedById→OpsUser,
  performedAt, reviewNote?, createdAt, updatedAt)`. Flow: company files a request against a
  lifecycle-locked campaign → ops applies (performs the actual Question mutation inside the same
  transaction that writes the audit event) or rejects with a note.
- `QuestionAuditEvent(id, campaignId, questionId?, action CREATE|EDIT|DELETE, prevValue JSON?,
  newValue JSON?, actorKind, actorId, actorName, lifecycleState, requestId?, createdAt)`.
  Written for EVERY question mutation — direct company edits on configurable campaigns AND
  ops-applied changes — satisfying "every modification must be traceable".
- Lifecycle: no new states invented — DRAFT/READY remain directly editable (audited);
  ACTIVE/PAUSED/COMPLETED require the request→ops-apply path.
- Known boundary: an EDIT request can only change `text`, `options`, `required`, `order` —
  changing `type`/`stage` is rejected (that would silently re-shape collected answers; a
  delete+create pair is the honest path).

## Testing requirements
New suite `api/test/innovation.test.ts` covers: product fields, media CRUD + isolation,
change-request flow + audit events, panel opt-in + same-company aggregation + cross-company
denial + small-cell suppression, notification request/launch, role gates (member vs admin,
ops vs platform admin), narrative presence/traceability, intelligence endpoint labeling.

## Release gate (OFD-09/20)
Technical release can proceed independently of commercial gates. Android release still requires:
CI build, signing config, physical-device validation, Akedly validation. Commercial/public launch
remains blocked on B-02 (LLC), B-03 (PDPL), B-04 (current-stack QR write-path load validation —
script provided at `api/scripts/load-test-qr.ts`).
