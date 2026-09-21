# TAJRIBTI — ZAMPLIA FORENSIC BENCHMARK REVIEW
Date: 2026-09-21 · Type: READ-ONLY forensic reference review
Repository: `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean` · HEAD `5b0152072d481bf5213fecd31bf830bdd7c6d3a7`
Benchmark SHA-256 (unchanged): `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a`

**Final status: FORENSIC REVIEW COMPLETE — FOUNDER DECISIONS REQUIRED** (see §16)

This review does not close or reopen the Web Review implementation. It answers one question:
is TAJRIBTI leaving useful product/presentation ideas on the table relative to Zamplia?

Zamplia is a sample marketplace + DIY survey platform. TAJRIBTI is a real-product-trial
evidence platform. Most of Zamplia's capability surface is structurally different from —
not superior to — TAJRIBTI's model. Findings below reflect that.

---

## 1. Scope

Live review of `https://zamplia.com/` public site against the current TAJRIBTI repository
(post-Founder-Web-Review corrective pass, commit `5b01520`). Reference only. No code changes.

## 2. Pages Reviewed

| Page | URL |
|---|---|
| Homepage | zamplia.com/ |
| Product Testing & Feedback | /product-testing-feedback/ |
| Real-Time Project Analytics | /real-time-project-analytics/ |
| Case Studies index | /case-studies/ |
| Case Study: New Snack Product Line | /new-snack-product-line-study/ |
| Consumer Research Panels | /consumer-research-panels/ |
| Fraud Detection (Calibr8) | /fraud-detection-system/ |
| Research Capabilities (Academic) | /research-capabilities/ |
| Nav-discovered (inspected via menus/descriptions) | Quality Assurance, Calibr8, Sample Marketplace, Survey Builder, API & Integrations, Custom Scripting, Multi-Language, White-Label, Brand & Advertising Research, Competitive Intelligence, CX Studies, Market Segmentation, Financial Services, B2B Panels, Global Panel Network, Premium Providers, Social Media Recruitment, Profile Verification, Quality Scoring, Real-Time Quality Monitoring, Response Time Analysis, Blog, Company Profile, Vendor Portal, Contact, Careers, Privacy, Terms |

## 3. Zamplia Capability Map

- **Core**: sample marketplace (access to respondents across ~190 countries), survey builder,
  feasibility/CPI estimation, real-time project analytics, Calibr8 AI fraud/quality engine.
- **Research types marketed**: brand & advertising research, competitive intelligence, CX
  studies, market segmentation, product testing & feedback, academic, financial services.
- **Sample sources**: B2B panels, consumer panels, global network, premium providers,
  social-media recruitment.
- **Quality**: fraud detection, profile verification, quality scoring, real-time quality
  monitoring, response-time analysis.
- **Workflow marketed**: Run Feasibility → Deploy Study → Access Data (3 steps); multi-wave
  tracking via project cloning + dedupe.
- **Survey builder**: single/multi select, open-ended, numeric, rating, slider, ranking, matrix;
  media embedding; screening questions; answer shuffle; templates (Brand Awareness, NPS,
  Brand Perception, Ad Testing).
- **Business model**: pay-per-response, no minimums/contracts, $500 demo credit, vendor portal.

## 4. UX / IA Observations

- Three-step workflow ("as easy as 1-2-3") is the strongest IA device on the site — the value
  chain is compressible into a memorable sequence.
- Mega-menu organized by Platform / Solutions-by-Research-Type / Solutions-by-Industry /
  Sample / Quality — capability-indexed navigation, not audience-indexed.
- Live dashboard screenshots (Feasibility, Conversion, Survey Stats, Cost Tracker) embedded
  mid-page as product proof.
- FAQ block near the conversion point answers pricing, compatibility, ease-of-use, trust.
- Blog/research teasers at page bottom create a content tail for credibility.

## 5. Reporting Observations

- Reporting is communicated as *live dashboards* (completions, drop-offs, quality scores by
  segment; cost per source; alerts) — not as a written deliverable. Zamplia's output story is
  operational monitoring, not a decision document.
- Case studies carry the "conclusion" burden instead: fixed structure **Overview →
  Demographic+Segment → Project Setup → Sample Research Questions → Key Findings → Data
  Visualization**.
- TAJRIBTI's Data → Analysis → Consumer Voice → Insight → Decision → Recommendation chain is a
  *stronger* deliverable story for a paid report product; nothing in Zamplia's reporting
  presentation suggests changing the evidence model. The useful gap is purely presentation-level:
  a public-facing example of the *written* deliverable styled like a case study (see §11/§13).

## 6. Research Catalog Observations

- Zamplia presents research types as a browsable solutions catalog with a dedicated page each.
- TAJRIBTI equivalent: the public site's study-type pills (9 executable) + "approved
  directions" honesty label. The pill list is honest but thin — each executable study type has
  no description of what it measures or what the company gets.
- Zamplia's named templates (Brand Awareness, NPS, Brand Perception, Ad Testing) partially
  overlap TAJRIBTI's executable set (Brand Perception, Advertising/Message Testing exist).
  Brand Awareness and NPS are **not** in TAJRIBTI's approved study taxonomy.

## 7. Case-Study Observations

- Structure confirmed on the snack-line study: labeled "Case Study", Overview paragraph,
  Demographic + Segment block, Project Setup (field time, method), Sample Research Questions,
  Key Findings (bolded finding headings), Data Visualization captions.
- The "Sample Research Questions" block is notable — it shows the *questions asked*, not just
  findings. TAJRIBTI's real asset here is its actual question templates; showing example
  questions per study type would be evidence-grounded (they exist in the codebase), not
  fabricated.

## 8. Trust / Quality Observations

- Zamplia's trust story is Calibr8 (8-layer AI fraud detection, fingerprinting, AI-response
  detection) + "professional survey taker" exclusion + engagement quality (low straightlining).
- TAJRIBTI's honest equivalents are different in kind: campaign-bound OTP identity,
  eligibility screening, one-participation-per-campaign, audit trail, persisted-evidence
  lineage, small-cell suppression. None of these should be inflated into fraud-detection or
  quality-scoring claims. A factual "how participation integrity works" explanation (OTP-bound,
  one response per participant, eligibility gates) is defensible presentation; anything beyond
  is not.
- Zamplia's published research posts (e.g., seasonal consumer surveys) are self-run studies
  used as content marketing — a pattern TAJRIBTI could only adopt with real pilot data.

## 9. Conversion Observations

- Persistent "Schedule a Demo" nav CTA + Login link; page-level "Launch Your Study →" CTAs;
  demo incentive ($500 credit); newsletter capture; FAQ before the form.
- TAJRIBTI now has Book a demo (nav + hero + final CTA) + Log in ▾. Equivalent CTA hierarchy
  is in place. Two honest gaps: (a) no FAQ answering "how does a trial work / what do I get /
  how are consumers recruited" before the demo ask; (b) the demo CTA is `mailto:` only — no
  structured contact path. Both are presentation-level, not product-model gaps.
- The $500-credit and pricing claims are commercial — excluded by scope.

## 10. TAJRIBTI Comparison Table

| Zamplia Pattern | TAJRIBTI Equivalent | Status | Classification | Evidence | Recommendation |
|---|---|---|---|---|---|
| 1-2-3 workflow strip | Journey strip (Product→Trial→Feedback→Measurement→Evidence→Report→Decision) + How-it-works cards | Present | ALREADY COVERED | web/public/index.html stage-strip + how-grid | Already covered |
| Mega-menu capability index | Flat nav (Journey/Sectors/Sample report/Log in/Book demo) | Different IA; appropriate at TAJRIBTI's scope | ALREADY COVERED | public nav | Already covered |
| Live dashboard screenshots | "Live Results" tab exists in product; not shown publicly | Public gap | ADAPT | company UI has live funnel/aggregates | Presentation improvement — a styled "what you see live" visual on the public site using real (non-fabricated) dashboard shape |
| Case-study structure (Overview→Segment→Setup→Questions→Findings→Viz) | Sample report section (demo-flagged) | Partially covered | ADAPT | public #report block | Presentation improvement — reframe the sample report intro around the Problem→Method→Findings→Implication narrative arc (still demo-flagged, still counts-only) |
| Sample research questions in case studies | Real question templates exist per study type (studyTemplates.ts) | Not surfaced publicly | REUSE | api/src/lib/studyTemplates.ts | Presentation improvement — show 2–3 real example questions under each executable study pill; grounded in actual templates, zero fabrication |
| FAQ before conversion | None | Gap | ADAPT | public page has no FAQ | Presentation improvement — FAQ using only verified product facts (trial flow, OTP entry, report contents) |
| Named research-type pages (one per type) | Study pills without descriptions | Thin coverage | FUTURE | public sectors section | Adapt later — per-study-type explainer blurbs or expandable cards; content needs Founder review of wording |
| Brand Awareness / NPS templates | Not in study taxonomy | Absent | FUTURE | taxonomy is Founder-approved set | Founder decision required — new study types are methodology additions |
| Sample marketplace / panels / quotas / CPI | None — TAJRIBTI recruits via campaign QR/discovery | Different model | REJECT | Benchmark campaign model | Not applicable |
| Calibr8 AI fraud detection, AI open-end validation | OTP-bound participation, screening, audit; no AI quality scoring | Different integrity model | REJECT | Benchmark excludes AI claims | Not applicable — do not claim fraud detection |
| Predictive insights / cost modeling | Deterministic measurement only | Contradicts evidence rules | REJECT | Benchmark evidence discipline | Not applicable |
| Survey builder (matrix, ranking, slider, video) | Question types: choice/rating/text per templates | Subset | FUTURE | api question model | Founder decision required — new question types are product-model additions |
| Multi-language surveys | Arabic narrative in reports; survey itself not localized | Partial | FUTURE | narrative.ts bilingual | Founder decision required |
| White-label / API / custom scripting | None | Out of scope | REJECT | — | Not applicable |
| Pay-per-response pricing, demo credit | None | Commercial | REJECT | commercial scope excluded | Not applicable |
| Blog/insights content engine | None | Absent | FUTURE | — | Adapt later — only with real pilot-derived research content |
| Vendor portal | None | Out of scope | REJECT | — | Not applicable |
| Feasibility/audience counts pre-launch | Readiness + evidence coverage checklist | Analogous stage, different content | ALREADY COVERED | readiness.ts evidenceCoverage | Already covered |
| "Track record" stat band (surveys/countries/points) | None — deliberately no fabricated metrics | N/A | REJECT | no fake stats rule | Not applicable |
| Multi-wave tracking via project cloning | Campaigns are single-run objects | Absent | FUTURE | campaign model | Founder decision required — longitudinal/tracking design is a product decision |
| Login as secondary nav item | Log in ▾ (Company + Consumer) | Present | ALREADY COVERED | public nav | Already covered |

## 11. REUSE Findings

- **Real question templates as public proof**: TAJRIBTI already owns per-study-type question
  templates in code; surfacing 2–3 example questions under each executable study pill is pure
  presentation reuse of real assets. No fabrication risk.
- **Live-results shape as public visual**: the product genuinely computes live funnel +
  aggregates; a public "what you see while the campaign runs" visual can be built from the real
  Live Results layout (clearly labeled illustrative).
- **Participation-integrity explainer**: OTP-bound entry, eligibility screening, one response
  per participant — factual existing mechanisms; presentable as a trust block without any
  quality-scoring claims.

## 12. ADAPT Findings

- **Case-study narrative arc**: adopt the Problem → Segment → Setup → Questions → Findings →
  Implication flow as framing for the public sample report section (keep demo flag, keep
  counts, keep cautious language).
- **Pre-conversion FAQ**: Zamplia's FAQ answers the practical hesitations; TAJRIBTI's honest
  FAQ would cover: what happens to my product, who the consumers are, how participation is
  verified, what the report contains, how a campaign starts.
- **Study-type descriptions**: the catalog pattern (one blurb per research type) adapted as
  short expandable descriptions under existing pills — wording must be reviewed against each
  study's actual methodology profile.
- **3-step framing**: TAJRIBTI's 7-stage strip is accurate but heavier; the site already pairs
  it with 3 how-it-works cards — reinforcing the compressed narrative (not adding steps) is the
  adaptation.

## 13. FUTURE Findings (require explicit Founder decision)

- **Brand Awareness and NPS study types** — methodology additions, not copy-able.
- **Multi-wave/tracking campaigns** — product-model decision (Benchmark does not define waves).
- **New question types** (matrix, ranking, slider, video-in-survey) — product-model additions.
- **Survey localization** (Arabic survey UX) — product decision; narrative localization exists.
- **Real case studies / published pilot research** — possible only with real campaign data and
  client permission; content-strategy decision.
- **Structured demo-request form** (vs mailto) — small but is a data-collection + backend
  decision.
- **Per-study-type public pages/expanders** — content decision on approved wording.

## 14. REJECT / NOT FIT Findings

- Sample marketplace, panel network, B2B panels, social recruitment, vendor portal — different
  supply model; TAJRIBTI runs its own campaign-based trials.
- Calibr8 / AI fraud scoring / AI open-end validation / predictive cost & insight — Benchmark's
  evidence discipline excludes AI-derived claims; do not present an analog.
- Pricing transparency claims, per-response pricing, demo credit, "20–30% savings" — commercial
  scope, excluded.
- Comparison tables vs "marketplace/ad-hoc" competitors — would require unsupported claims.
- Feasibility/CPI metrics, quota management, dedupe-across-projects — marketplace mechanics.
- White-label, public APIs, custom scripting, Decipher/Qualtrics integrations — out of scope.
- Achievement stat band — no fabricated counters (TAJRIBTI has no public track record to cite).
- Greenbook GRIT badge / industry badges — no equivalent accreditation to display.

## 15. ALREADY COVERED Findings

- Workflow storytelling (journey strip + how-it-works cards ≈ Zamplia's 1-2-3).
- Persistent primary CTA + secondary login (Book a demo + Log in ▾ ≈ Schedule a Demo + Login).
- Live monitoring story (Live Results tab ≈ real-time analytics dashboards; just not publicized).
- Screening/qualification (eligibility questions + audience gates ≈ profiling/screening,
  TAJRIBTI's is trial-contextual rather than panel-profiling).
- Survey templates positioning (study pills ≈ template gallery; TAJRIBTI's are executable,
  Zamplia's are marketing-named).
- Quality assurance honest equivalent (evidence lineage + OTP + audit ≈ integrity claims,
  stated factually without scoring).

## 16. Founder Decisions Required

1. Whether Brand Awareness and/or NPS should enter the study-type taxonomy (methodology work).
2. Whether multi-wave/tracking campaigns are a roadmap direction.
3. Whether new question types (matrix/ranking/slider) are desired.
4. Whether Arabic survey UX localization is in scope (report narrative is already bilingual).
5. Whether the public site should publish real pilot-derived case studies once a real campaign
   exists — and under what client-permission rules.
6. Whether to replace the `mailto:` demo CTA with a structured request form (stores contact
   data — has a data-handling implication).
7. Whether per-study-type expandable descriptions/pages should be drafted for Founder wording
   review.

## 17. No-Implementation Findings

All findings above are documented only. Nothing in this review is a clearly non-breaking,
already-authorized correction — the strongest candidates (public question examples, FAQ,
live-results visual) are content additions that benefit from Founder wording review, and the
just-completed Web pass is explicitly not to be redesigned by this gate.

## 18. Recommended Next-Step Priorities (no ranking, no scoring)

- Founder review of the §16 decision list — items 5, 6, 7 are the closest to pure presentation.
- If item 7 is approved: draft study-type descriptions from `studyProfiles.ts`/`studyTemplates.ts`
  source text only.
- If item 6 is approved: minimal demo-request form writing to a contact table — no marketing
  automation.
- FAQ drafting using only verified product behavior (OTP entry, eligibility, report contents).
- Longer-term: the §13 methodology additions queue behind Founder methodology decisions, on the
  same lane as the already-approved "in development" directions.

---

## Final Verification

- HEAD: `5b0152072d481bf5213fecd31bf830bdd7c6d3a7` (pre-review), unchanged by this pass.
- Working tree: modified only by adding this report; no code touched.
- Benchmark SHA-256: `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` — unchanged.
- Tests: none run — no code changed.
- Production / mobile / commercial: untouched.
