# TAJRIBTI Reference Product Benchmark

**Document type:** Product research / implementation benchmark  
**Version:** v1.0  
**Date:** 2026-09-02  
**Status:** ACTIVE REFERENCE  
**Authority:** Supplemental product-reference source. Founder Decisions remain constitutional; Master PRD remains product-requirements authority.  
**Purpose:** Preserve the evidence-backed reference model used to evaluate TAJRIBTI's product shape before implementation work. This document is a benchmark, not a command to copy competitor features.

---

## 1. Objective

TAJRIBTI is being developed toward a full Consumer Intelligence Platform experience in which product trial is the acquisition mechanism and structured consumer data is the product.

The benchmark question is therefore not:

> "Does TAJRIBTI have a sampling app?"

It is:

> "Does the complete TAJRIBTI journey connect consumer experience, campaign operations, data capture, live measurement, insight, and decision-ready reporting in a way that is credible against the strongest relevant products in the category?"

The reference set is deliberately composed of different strengths:

- **Samplia** — consumer experience, smart sampling, managed campaign execution, post-trial feedback and executive insight/reporting.
- **Sampl** — verified consumer journey, live campaign measurement, segmentation and purchase-intent/commercial signals.
- **Zamplit** — configurable branded journeys, screeners, feedback, source tracking, Insights Lab, segmentation and outcome-oriented campaign design.
- **ExpertVoice Campaign Manager** — self-service campaign configuration, targeting, applications/screeners, segments, activities, dates, preview/save and campaign monitoring.

These references are complementary. No claim is made that TAJRIBTI should reproduce their entire businesses.

---

## 2. Reference Evidence

### 2.1 Samplia — consumer + managed campaign + insights reference

**Official sources**
- https://samplia.com/en
- https://samplia.com/en/servicios/feedback-consumidor
- https://samplia.com/en/servicios
- https://samplia.com/en/aviso-legal

**Observed product patterns**

1. The consumer app is the digital meeting point between consumers and product experiences.
2. Sampling is connected to consumer profiles and feedback rather than treated as an isolated distribution event.
3. Campaigns are designed around product, audience and goals.
4. Activation can occur through multiple physical/digital channels.
5. Post-trial surveys and consumer feedback are part of the commercial service.
6. The company explicitly positions consumer insights as an output of product trial.
7. Reporting includes metrics, insights and actionable recommendations.
8. Samplia's current public site describes a managed-service model in which its team can design campaign dynamics and handle production/activation work.

**TAJRIBTI implication**

TAJRIBTI should preserve the same fundamental chain:

`Consumer → Trial → Feedback → Consumer Data → Insight → Recommendation`

The physical activation mechanisms used by Samplia (machines, pop-ups, retail network) are not automatically required for TAJRIBTI V1.

---

### 2.2 Sampl — live measurement + verified journey reference

**Official sources**
- https://www.sampltech.com/measurement-insight
- https://www.sampltech.com/solutions/measure-success

**Observed product patterns**

1. Each sample request is tied to a named/verified consumer.
2. Campaign performance is visible while the campaign is still running.
3. The platform exposes performance by channel and audience.
4. Journey completion/drop-off is measurable by stage.
5. Review rate and purchase intent can be viewed by audience segment.
6. Campaign data connects activity through to commercial signals where the relevant integrations exist.
7. A campaign closes with a structured view of trial volume, review/feedback signals and purchase intent.

**TAJRIBTI implication**

TAJRIBTI's campaign workspace should not stop at historical totals. Where the current data model supports it, a live campaign should make it possible to understand:

- participation/progress
- journey completion/drop-off
- feedback completion
- purchase intent
- audience differences
- source/channel performance where source attribution exists

No unsupported commercial metric should be invented.

---

### 2.3 Zamplit — configurable journey + insights platform reference

**Official sources**
- https://zamplit.com/platform/
- https://zamplit.com/how-it-works/
- https://zamplit.com/market-research/
- https://zamplit.com/product-launch-testing/

**Observed product patterns**

1. Campaigns begin with an outcome/objective rather than a generic form.
2. The journey can contain screening, claim, trial, feedback and follow-up stages.
3. QR codes and campaign sources can be tracked.
4. The platform distinguishes customer/source/audience signals from analysis.
5. Insights include satisfaction, purchase intent, sentiment, value perception, barriers, audience differences and qualitative themes.
6. The platform supports filtering and comparisons.
7. The product explicitly connects insight to a decision: launch, refine, retest, change messaging, compare audiences, or shape the next campaign.
8. Different campaign objectives can use the same underlying platform capabilities with different journey designs.

**TAJRIBTI implication**

TAJRIBTI's Campaign should be treated as a structured research/activation object, not merely a product record plus a survey.

Target conceptual chain:

`Objective → Audience → Journey → Trial → Survey/Feedback → Signals → Analysis → Decision`

The exact journey components must remain constrained by TAJRIBTI's current business model and approved scope.

---

### 2.4 ExpertVoice Campaign Manager — campaign configuration reference

**Official source**
- https://resourcehub.expertvoice.com/hc/en-us/articles/5004150658450-Product-sampling-campaigns-on-ExpertVoice

**Observed product patterns**

1. Campaign setup begins with goals, timeline, target audience and product availability.
2. Campaign Manager provides guided configuration rather than forcing the user into an empty dashboard.
3. Targeting is an explicit campaign concern.
4. Applications/screeners can qualify participants.
5. Segments organize participants and support differentiated monitoring.
6. Messaging and campaign activities are configured as part of the campaign.
7. Availability/start/end dates are part of setup.
8. Preview/save-before-launch is part of the workflow.
9. Campaign monitoring exposes application/progress and activity completion.
10. Changes become more constrained after a campaign is live, reinforcing the need for a clear pre-launch configuration stage.

**TAJRIBTI implication**

A credible Company campaign experience should provide a guided configuration workflow with a clear distinction between:

`Configure → Review/Ready → Launch/Active → Monitor → Complete`

The exact status names must use TAJRIBTI's existing lifecycle model rather than introducing a competing state machine.

---

## 3. Cross-Reference Capability Model

The following capabilities are repeatedly supported by the strongest relevant references and are therefore the primary benchmark for TAJRIBTI.

| Capability | Reference evidence | TAJRIBTI benchmark |
|---|---|---|
| Consumer discovery/trial | Samplia | Consumer can discover/enter a relevant campaign and complete the trial journey |
| Verified participation | Samplia, Sampl | Participation is tied to authenticated/verified consumer identity where the current TAJRIBTI flow requires it |
| Campaign objective | Zamplit, ExpertVoice, Samplia | Campaign has a clear purpose, not only product/date fields |
| Audience/qualification | Sampl, Zamplit, ExpertVoice, Samplia | Audience/eligibility is an explicit campaign concern where supported |
| Journey | Zamplit, Samplia | Campaign connects entry, qualification, trial and feedback |
| Survey/feedback | Samplia, Zamplit, ExpertVoice | Feedback is a campaign component and feeds analysis |
| QR/source attribution | Zamplit, Samplia | QR/journey source is operationally visible where applicable |
| Live campaign measurement | Sampl, ExpertVoice | Campaign can be monitored before it closes |
| Segmentation | Sampl, Zamplit, Samplia, ExpertVoice | Meaningful audience differences can be examined when data supports them |
| Qualitative consumer voice | Samplia, Zamplit | Open feedback/consumer language is preserved and surfaced |
| Purchase intent | Sampl, Samplia, Zamplit | Purchase intent is a first-class insight signal already supported by TAJRIBTI |
| Insight → decision | Zamplit, Samplia | Findings should lead to evidence-grounded recommendations |
| Executive reporting | Samplia, Sampl | Final report should be decision-ready, not merely a database export |
| Campaign configuration | ExpertVoice, Zamplit | Company-facing campaign setup should be real product functionality |
| Operational control | Sampl, ExpertVoice, Samplia | Internal operations should be able to understand and control campaign state |

---

## 4. Target TAJRIBTI Product Shape

The benchmark supports the following product shape, subject to Founder decisions and current repository architecture.

```text
TAJRIBTI
│
├── CONSUMER
│   ├── Discover
│   ├── Campaign
│   ├── Eligibility
│   ├── Trial / Redemption
│   ├── QR / Journey
│   ├── Survey
│   ├── Feedback
│   └── Post-Trial
│
├── COMPANY
│   ├── Company Profile
│   ├── Employees
│   ├── Campaigns
│   ├── Campaign Setup
│   ├── Audience
│   ├── Product / Assets
│   ├── Journey / Survey
│   ├── QR / Sources
│   ├── Live Results
│   ├── Insights
│   └── Reports
│
└── TAJRIBTI OPERATIONS
    ├── Companies
    ├── Campaign Pipeline
    ├── Campaign Configuration
    ├── Readiness
    ├── Launch / Pause / Close
    ├── QR / Journey Operations
    ├── Participants
    ├── Live Monitoring
    ├── Operational Issues
    ├── Survey Operations
    ├── Insights
    └── Reporting
```

This is a **benchmark model**, not a replacement for the Master PRD. Any implementation must first reconcile it with the FDD, PRD, technical architecture and current code.

---

## 5. Campaign as the Core Operating Object

The benchmark consistently treats the campaign as the unit that connects configuration, participation and measurement.

```text
CAMPAIGN
├── Company
├── Objective
├── Product
├── Audience
├── Dates
├── Journey
│   ├── Entry
│   ├── Qualification
│   ├── Trial
│   └── Feedback
├── Survey
├── QR / Sources
├── Participants
├── Operations
│   ├── Status
│   ├── Progress
│   └── Exceptions
├── Live Performance
├── Insights
└── Final Report
```

TAJRIBTI should not add a field merely because this diagram contains it. Each component must be mapped to an existing data model, Founder decision, or explicitly approved product requirement before implementation.

---

## 6. Insight Model

The reference products support a progression beyond raw response counts:

```text
WHO
↓
WHAT THEY EXPERIENCED
↓
WHAT THEY THINK
↓
WHAT THEY INTEND TO DO
↓
WHAT DRIVES / BLOCKS PURCHASE
↓
HOW MEANINGFUL AUDIENCE GROUPS DIFFER
↓
WHAT THE BRAND SHOULD CONSIDER NEXT
```

TAJRIBTI's current evidence discipline remains mandatory:

- sample size must be visible
- demo/live status must not be misrepresented
- evidence must be separated from interpretation
- small samples require appropriately cautious language
- unsupported segmentation or causal claims must not be fabricated

---

## 7. Report Model

The benchmark report is not a dashboard export.

Target narrative:

`Data → Analysis → Consumer Voice → Insight → Decision → Recommendation`

A credible TAJRIBTI report should preserve the current valid report foundation and improve it only where the underlying data supports the improvement.

Required evidence categories already supported by the product direction include:

- campaign identity
- product
- dates
- participant/trial metrics
- sample size
- demographics
- product/experience feedback
- purchase intent
- campaign-specific questions
- consumer verbatims
- findings
- recommendations
- methodology
- limitations

Segment-level outputs must only be shown when the backend actually supports the required aggregation.

---

## 8. Company and Operations Model

The references show two legitimate operating patterns:

### Managed-service pattern

Samplia and Sampl demonstrate strong operational involvement around campaign design, targeting, activation, measurement and results.

### Platform / self-service pattern

Zamplit and ExpertVoice demonstrate configurable campaign tooling where the customer can build/manage campaign components through a platform.

### TAJRIBTI benchmark position

TAJRIBTI can use a hybrid model:

- Company/employee: define and manage the campaign within the supported product scope.
- TAJRIBTI Operations: maintain internal visibility, readiness, operational control and live monitoring.

**Important:** This hybrid positioning is a product benchmark/inference from the references. It is not a Founder decision about detailed permissions. Exact permissions must be derived from the repository and Founder decisions before implementation.

---

## 9. What This Benchmark Does NOT Authorize

The existence of a competitor feature is not sufficient reason to add it.

Do not automatically add:

- permanent sampling machines
- owned logistics networks
- wallet coupon systems
- CRM integrations
- ecommerce integrations
- sales/revenue matching
- Enterprise API
- referral programs
- rewards wallet/exchange mechanics
- push notifications
- automated fraud detection
- advanced AI narratives beyond supported evidence
- non-FMCG vertical expansion
- GCC expansion

These remain subject to existing scope, decisions and future gates.

---

## 10. Existing TAJRIBTI Foundations That Must Be Preserved

This benchmark does not replace or weaken existing correct foundations.

Preserve unless a concrete defect requires a surgical correction:

- consumer authentication
- OTP/JWT flow
- Already-Participated protection
- QR lifecycle/date gating
- Cairo timezone behavior
- Survey Builder V2 core question identity/history
- historical survey responses
- campaign ownership isolation
- company isolation
- employee company isolation
- report/insight ownership scoping
- current evidence-based reporting safeguards

If an existing implementation contradicts the benchmark but is supported by a locked Founder decision, the Founder decision wins.

If an existing implementation contradicts both the benchmark and the authoritative project requirements, it may be fixed or rebuilt rather than preserved for its own sake.

---

## 11. Implementation Gate

Before any implementation based on this document:

1. Read the AI bootstrap loading order.
2. Read current Founder Decisions.
3. Read current product requirements.
4. Inspect the actual working tree and current branch/commit.
5. Map benchmark capability → existing implementation → required change.
6. Classify each item as KEEP / FIX / REBUILD / ADD / DEFER.
7. Do not implement features that require invented fields or unsupported business assumptions.
8. Preserve correct completed foundations.
9. Test the resulting end-to-end campaign journey.

The desired end-to-end product shape is:

```text
Consumer
  → Discover / Enter Campaign
  → Qualification / Eligibility
  → Trial / Redemption
  → QR / Journey
  → Survey / Feedback
  → Structured Consumer Data
  → Live Campaign Measurement
  → Company Campaign Workspace
  → TAJRIBTI Operations Control
  → Insights
  → Decision-Ready Report
```

---

## 12. Source Quality and Confidence

| Source | Type | Confidence for observed product pattern |
|---|---|---|
| Samplia official site / legal / feedback pages | First-party | HIGH |
| Sampl official measurement/solution pages | First-party | HIGH |
| Zamplit official platform/how-it-works/solution pages | First-party | HIGH |
| ExpertVoice official campaign documentation | First-party | HIGH |
| Existing TAJRIBTI Peer Review Master Report | Project source | HIGH for previously verified Samplia/competitive corrections |
| Competitor screenshots, third-party summaries or secondary directories | Secondary | SUPPORTING ONLY; not used as primary authority here |

All quantitative competitor claims should be re-verified from current first-party or named independent sources before being reused in decision documents.

---

## 13. Relationship to Project Authority

This document does **not** override:

1. `workspace/15_Decisions/FOUNDER_DECISIONS.md`
2. `workspace/04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`
3. `workspace/08_PRD/MASTER_PRD_v1.0.md`
4. `workspace/09_Technical/TECHNICAL_ARCHITECTURE.md`
5. `workspace/02_Project_Management/MASTER_DELIVERY_PLAN.md`

It supplements the existing competitive-intelligence record in:

`workspace/12_Reviews/PEER_REVIEW_MASTER_REPORT.md`

The purpose is to preserve the **current reference-product operating model** so future implementation sessions do not have to reconstruct it from chat history.
