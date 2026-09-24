# TAJRIBTI — COMMERCIAL CLOSURE RECONCILIATION + DECISION REGISTER

Date: 2026-09-24 · Pass: read-only forensic reconciliation of the complete commercial corpus · No code, Benchmark, or Founder-decision changes.

## 0. Corpus reconciled (all read, none modified)

| Label | Source |
|---|---|
| R1 | `TAJRIBTI_COMMERCIAL_FINANCIAL_MODEL_FORENSIC_RESEARCH_2026-09-21.md` (FCD-01… decision gate, evidence tables) |
| R2 | `TAJRIBTI_COMMERCIAL_PRODUCT_DELIVERABLE_REPORT_BENCHMARK_2026-09-24.md` (§11 deliverable audit, §11.4 sample-vs-engine truth audit) |
| R3 | `TAJRIBTI_COMMERCIAL_UNIT_ECONOMICS_PRICING_CAPACITY_2026-09-24.md` (cost model, LOW/BASE/HIGH, capacity, turnaround, Clock Start, SLA, sample policy, discount, cancellation, quotations) |
| R4 | `TAJRIBTI_FINAL_COMMERCIAL_MARKET_PRODUCT_PRICING_BENCHMARK_2026-09-24.md` (Egypt/GCC benchmarks, scenarios A/B/D/C, 29-item decision register) |
| Spec | `TAJRIBTI_FINAL_COMMERCIAL_PRODUCT_SPECIFICATION_2026-09-24.md` (Phase C consolidation; 14 Founder decisions §2) |
| Phase E | `reports/TAJRIBTI_PHASE_E_FINAL_CLOSURE_EVIDENCE_PACKAGE_2026-09-24.md` (25 locked decisions #01–#25, conflicts C1–C4, register §11, F1–F9) |
| Sources | `source-materials/` — Samplia analysis xlsx, Samply academic PDF, generic Consumer Insights guide xlsx (evidence inputs to R1–R4; findings extracted there) |
| Product evidence | `api/src/lib/report.ts`, `measurement.ts`, `studyProfiles.ts`, `web/public/index.html`, `api/src/lib/siteContent.ts`, Prisma schema at HEAD `2394f7d` |

**Status vocabulary** (from the Spec, never merged): FOUNDER-APPROVED DIRECTION · PROPOSED OPERATING RULE · NUMERIC ASSUMPTION · LEGAL/ACCOUNTING VALIDATION REQUIRED · METHODOLOGY DECISION REQUIRED · DEFERRED · CURRENTLY IMPLEMENTED · COMMERCIAL PROMISE.

---

## 1. COMMERCIAL DECISION REGISTER (42 items)

| # | Decision | Final State | Evidence Source | Implementation State | Product Impact | Public/Marketing Impact | Founder Action |
|---|---|---|---|---|---|---|---|
| 1 | Product identity | **FINAL** — "TAJRIBTI Consumer Study" (campaign-scoped, 1 product, trial + questionnaire) | Phase E #01; Spec §3 | Product itself implements this shape | None needed | Site hero/sections consistent | None |
| 2 | FMCG scope | **FINAL** — FMCG only; no Real Estate/Restaurants/Hospitality | Phase E #02/#16; Spec §2.2 | Product sector-agnostic by design; scope enforced commercially | None | Site shows 3 FMCG sectors only; Marketing Brief non-FMCG wording = MK1 correction | Marketing-doc correction |
| 3 | Point-of-Trial | **FINAL** — standard where immediate use possible | Phase C dist. A; Spec §7 | **Implemented** (QR→OTP→eligibility→redemption→survey native) | None | Site how-it-works accurate | Fieldwork rate set after first PoT cost measured (UNKNOWN) |
| 4 | Home Delivery | **FINAL** — used when usage period/reach required; quoted separately; **off-platform logistics** | Phase C dist. A; Spec §7 | Deliberately not in product (no address/shipment entity) | None | No site claim of delivery | PDPL/addresses = legal gate before first home-delivery study |
| 5 | Essential | **FINAL** name+tier — Core Report; standard evidence; no readout unless purchased | Phase E #19; Spec §4 | Sellable today, no product work | None | Not published on site (correct) | Confirm in working price list (O4) |
| 6 | Standard | **FINAL** name+tier — Core Report + analyst-written summary; percentages/charts **only after #08 work** | Phase E #19; Spec §4 | Summary=service (no product change); %/charts NOT implemented | Until #08, Standard differs from Essential **only by analyst summary** — sales material must say so | Must not promise %/charts yet | #08 authorization timing (O8) |
| 7 | Professional | **FINAL** name+tier — Standard + human readout + evidence-bound discussion | Phase E #19; Spec §4 | Service layer; no product change | None | — | — |
| 8 | Custom | **FINAL** — 250+, complex scope, special logistics, multi-product/linked campaigns, special methodology/reporting, other defined non-standard; SOW | Phase C #13; Spec §4/§12 | Only implemented capability + services may be SOW'd; no combined multi-product report exists | Multi-product = linked campaigns (1 product/campaign constraint) | — | SOW template = legal |
| 9 | Sample-size model | **FINAL** — separate quantity parameter, priced per completed eligible participant | Phase E #18; Spec §4 | No target-n field in product; commitment is contractual, ops-tracked | Commercially material gap **accepted** (R2 §11.1) | — | Optional target-n field = future product decision |
| 10 | Completed eligible participant | **FINAL** — the billing/sample unit; shortfall → extend fieldwork or pro-rata fieldwork credit; not guaranteed recruitment | Phase C #8; Spec §8/§12 | Funnel measures entered→eligible→redeemed→completed | Ops tracks contractually | — | Remedy wording = legal |
| 11 | Reference points 50/100/150/250/500+ | **PROPOSED OPERATING RULE** — study-type minimums (R3 §14): 50 directional Post-Trial only; 100 most types; 150 concept/pack/claims/pricing/message; 250 brand/U&A/segmentation/Custom threshold; 500+ Custom only | R3 §14; Spec §8 | Product accepts any n (no enforcement) | — | — | Confirm in price list |
| 12 | Turnaround ranges | **PROPOSED** — model-derived bd ranges by n, separate PoT/Home (50:12–15/15–22; 100:15–20/20–27; 150:17–22/24–30; 250:23–28/30–38; 500+:SOW) | Phase C #9; R3 §11; Spec §9 | None (ops commitment) | — | Not published | Recalibrate after real campaigns |
| 13 | SLA wording | **FINAL form** — estimated range + written target date at Clock Start; **no guaranteed SLA**, no service credits V1 | Phase C #10; Spec §9/§12 | — | — | — | Contract wording = legal |
| 14 | Overage / Change Order | **FINAL** — written change order before collection at fieldwork rate; no free overage; >+50% of contracted n → re-scope; un-ordered overage not billed | Phase C #11; R3 §19; Spec §12 | — | — | — | Contract wording = legal |
| 15 | Discount ceiling | **FINAL** — max 20%, study fee only, no stacking, net ≥ minimum price; conditions (pilot-partner/multi-campaign/annual); **authorization roles undefined → Founder authorizes by default** | Phase C #12; R3 §24; Spec §12 | — | — | — | Define roles only if delegation wanted |
| 16 | Custom criteria | **FINAL** — the 7-trigger rule (item 8) | Phase C #13 | — | — | — | — |
| 17 | Incentive policy | **FINAL** — none by default; off-platform pass-through-at-cost exception only (difficult audiences/special home-use); **no rewards/points/wallet/vouchers in-product** | Phase C #14; Spec §13; Benchmark §9 | None in product (correct) | — | Site makes no incentive claim | Legal/tax treatment of payouts |
| 18 | Target margin ≥35% BASE | **FINAL as target** — after 10% overhead; modeled vs. actual kept distinct; actual UNKNOWN (no paid campaign) | Phase C #7; Spec §11 | — | — | — | None — target preserved |
| 19 | Pilot pricing | **FINAL — CANCELLED** (Phase E #20: no active pilot offer). Scenario A figures preserved as research, **not an offer** | Phase E #20 (supersedes Phase C two-stage direction as an offer) | — | — | MK8: remove any pilot offer from sales material | Residual C1/O3: does first-customer validation run at standard prices? **OPEN** |
| 20 | Standard pricing scenarios | **NUMERIC ASSUMPTIONS** — Scenario B: fee + 450 EGP/p (420 ≥500), home-delivery standard zone: 50→52.5K, 100→80K, 150→112.5K, 250→167.5K, 500→280K (before VAT); §10.3 service-level re-expression (Essential 30K/Standard 35K/Professional 45K fees) is an **illustration pending Founder confirmation** | R4 §19B; Spec §10.2/§10.3 | No pricing code (correct — spec-only) | — | No prices published (verified — site has none) | **O4: confirm working price list before first quote**; confirm §10.3 or keep quantity-based B |
| 21 | Final pricing state | **NOT FINAL — by design.** All numbers editable assumptions; WTP UNKNOWN; final prices after pilot validation | Spec §10–11; Phase E §7 row | — | — | — | Post-pilot confirmation |
| 22 | Report included | **FINAL** — Core Report bundled in every study, not separately priced | R4 §24.8; Spec §5 | Implemented (15-section report) | — | Site shows report product | — |
| 23 | Human analyst summary/readout | **FINAL** — premium **service** layer (Standard summary; Professional summary+readout ≈18/26h model); evidence-bound, no verdicts | Phase C #1 (D); Spec §5.3 | Deliberately not a product feature | — | — | — |
| 24 | No I→D promise | **FINAL** — not promised, not implemented; separate methodology required first | Phase E #09; Spec §6 | Engine produces none (verified) | — | **Conflict C2 live**: sample report shows I→D block | Methodology decision (future); sample fix sequenced #15 |
| 25 | No unsupported stats/forecast/ROI | **FINAL** — no significance, forecasting, norms, personas, sentiment-as-findings, sales/ROI/CRM/ecommerce matching | Spec §3 prohibition list; Benchmark §9; Founder Decisions §3 | Enforced in engine limitations | — | Site carries no such claims (verified) | — |
| 26 | Manual bank transfer | **FINAL** — initial billing; invoice per order; PROPOSED 50/50 milestones (order/report); pass-throughs at cost | Phase E #22; R3 §24 | No billing code (correct) | — | — | Milestone split = PROPOSED, confirm with contract |
| 27 | Contract direction | **FINAL direction** — Order/Terms/Invoice + SOW for Custom; Clock Start/pause clauses; **draft wording requires counsel** | R4 §24.17; Spec §12 | — | — | — | **Legal gate** |
| 28 | VAT | **OPEN — legal/accounting** — prices shown before VAT; 14% illustration only if/when registered | Phase E #21; Spec §12 | — | — | — | Counsel/accountant |
| 29 | Currency | **FINAL** — EGP-first; GCC quotes would be USD (reference only) | R4 §24.12; Spec §15 | — | — | — | — |
| 30 | Payment provider | **FUTURE** — gateway deferred; manual transfer now | Phase E #22; register FUTURE | — | — | — | Later decision |
| 31 | Entitlements | **DEFERRED** — order-text entitlements only; no entitlement system | R4 §24.14; Phase E FUTURE | None (correct) | — | — | — |
| 32 | Renewal | **DEFERRED** — only with recurring commitment; annual-commitment discount path exists in policy | R4 §24.15; R3 §24 | — | — | — | — |
| 33 | Overage | See #14 — FINAL | — | — | — | — | — |
| 34 | Cancellation | **PROPOSED — legal** — draft tiers: before Clock Start refund−10% fee; before ACTIVE 50% fee; after ACTIVE fee + fieldwork + pass-throughs | R3 §24; Spec §12 | — | — | — | Counsel |
| 35 | Legal/accounting gates | **OPEN — separate gate (#21), parallel track** — VAT, e-invoicing, contract/SOW/cancellation, incentive payments, PDPL | Phase E #21; register LEGAL | — | — | — | Must close before **first invoice**, not Phase F |
| 36 | PDPL / Home Delivery | **OPEN — legal** — addresses are PDPL personal data; consent, courier-as-processor, retention | Spec §7; Phase E register | Off-platform by design | — | — | Before first home-delivery study |
| 37 | First-quote requirement | **OPEN — pre-quote Founder action** — confirm working price list (O4) + Scenario A residual (O3) | Phase E §11 OPEN, F9 | — | — | — | Before first quote, not before Phase F |
| 38 | IMPLEMENTED today | Product journey, 14 study types, funnel, report engine, CMS, media, revocation, audit | Code @ `2394f7d` | Complete | — | — | — |
| 39 | SPECIFIED BUT NOT IMPLEMENTED | #08 report improvements (%/distributions/charts/labels/evidence-in-report/hide-empty/6 study profiles); stored snapshot; exports; target-n field; entitlement system | Spec §5.2; R2 §11.3 | Defined, **not authorized** | Standard-tier %/charts promise blocked | — | O8 authorization timing |
| 40 | FOUNDER-CONFIRMED BUT PRE-QUOTE | O4 working price list; O3 validation-at-standard-prices; §10.3 confirmation; PoT fieldwork rate | Phase E §11 | — | — | — | Before first quote |
| 41 | FUTURE | I→D methodology; payment gateway; subscription/annual/renewal/entitlements; stored snapshot/exports; campaign withdraw; Content Editor role; GCC | Phase E FUTURE/DEFERRED | — | — | — | Explicit decisions later |
| 42 | Explicitly NOT allowed | Non-FMCG; GCC offer; in-product incentives/rewards/wallet; significance/predictive/causal/sentiment-as-findings claims; I→D promise; guaranteed SLA; discount >20% or on fieldwork; combined multi-product report promise; norms/personas; sales/ROI matching | Benchmark §9; Founder Decisions §3; Spec §3; Phase C #09–#14 | Enforced | — | Site/sample audited | — |

---

## 2. SCENARIOS vs. FINAL PRICES (explicit answer)

**No final approved prices exist.** Every number in the corpus is a NUMERIC ASSUMPTION:

- **Scenario A (pilot/entry):** figures preserved (45K/60K/82.5K/115K totals) — **cancelled as an offer by Phase E #20**; retained only as research. Modeled BASE margins 14–32% sat below target — that tension (Spec §11) is moot as an offer but survives as the O3 residual (validation pricing).
- **Scenario B (standard):** the working model direction (fee + 450/p): totals 52.5K/80K/112.5K/167.5K/280K; BASE margins 33–41%. **Not confirmed** — requires O4.
- **§10.3 tier re-expression:** Essential 30K / Standard 35K / Professional 45K fees + 450/p — an **illustration**, needs Founder confirmation or revert to quantity-based B.
- **Scenario D:** B + Custom SOW add-ons (readout workshop ≈15K PROPOSED) — covered by Custom tier.
- **Scenario C (GCC):** reference only, Benchmark §9 exclusion — not an offer.
- **Point-of-trial fieldwork rate:** **UNKNOWN/UNSET** — set after first PoT cost measurement.
- **Home-delivery rate:** 450 EGP/p (420 at 500+), standard zone — NUMERIC ASSUMPTION; out-of-zone quoted.

## 3. FINAL COMMERCIAL CONTROLS (locked)

Sample = completed eligible · two turnaround ranges · estimate+target date (no SLA) · change-order overage · 20% discount ceiling (study fee only, Founder authorizes) · 7-trigger Custom rule · no-incentive default w/ off-platform pass-through exception · ≥35% BASE target · report included · human analyst premium service · no I→D promise · no unsupported claims · EGP-first · manual bank transfer · pilot pricing cancelled.

## 4. COMMERCIAL ↔ PRODUCT/REPORT/SAMPLE/SITE/CMS CONTRADICTIONS

| # | Contradiction | Status |
|---|---|---|
| C1/O3 | Pilot pricing cancelled (#20) but first-customer validation plan was built around entry pricing — does validation run at standard prices? | **OPEN — Founder, pre-quote** |
| C2/MK4 | Public sample report shows "Insight → decision" / "Directional support to proceed" — violates #09 | **Known, deferred** (#15: after #08 report work). Sharpest live misalignment; recommend Founder pull the I→D block removal forward — their call |
| — | Standard-tier %/charts promise vs. unimplemented #08 work | **Not a contradiction** — spec explicitly limits Standard's sellable delta to analyst summary until #08; sales material must reflect it |
| — | Sample commitment vs. no target-n field | **Accepted design** — commitment is contractual, ops-tracked (R2 §11.1 flagged as commercially material; spec accepts) |
| — | Home delivery vs. no platform logistics | **Consistent** — explicitly off-platform (addresses → PDPL legal gate) |
| — | Marketing Brief: non-FMCG sectors, "mobile app" participation, I→D sample requirement, stale test count | **MK1/MK2/MK5/MK6 — marketing-doc corrections** (untracked PDF; public site already clean) |
| — | Package naming lineage | R3 §25 quotes used older names (Core/Intelligence/Advanced) — **superseded** by #19 (Essential/Standard/Professional/Custom); research artifact, no action |
| — | Public site pricing | **None published** (verified) — no price claims to contradict |
| — | CMS content | No commercial/pricing fields exist — consistent |

**No unresolved commercial contradiction blocks Phase F.** All open items are pre-quote/pre-invoice or explicitly deferred.

## 5. ANSWERS TO THE REQUIRED QUESTIONS

1. **All commercial work preserved?** Yes — R1–R4, Spec, Phase E register intact; no document modified.
2. **Final decisions:** register §1 rows marked FINAL (items 1–8, 10, 13–19, 22–27, 29 + controls §3).
3. **Scenarios vs. final prices:** all numbers are scenarios/assumptions — none are final approved prices (§2).
4. **Final controls:** §3 list.
5. **Implemented today:** the product itself (journey, report, workspaces, media, security). **Zero** billing/pricing/entitlement code — correct by design.
6. **Deliberately spec-only:** all pricing/billing/contract mechanics; #08 report extensions; analyst service (human service, not code).
7. **Before first quote:** O4 working price list; O3 validation-pricing residual; §10.3 confirmation; PoT fieldwork rate; legal gate before first invoice (VAT, contract, e-invoicing); PDPL before first home-delivery study.
8. **Commercial ↔ Product/Report/Public reconcile?** Yes — with one recorded live misalignment (sample-report I→D, deferred by #15) and accepted contractual-only commitments (sample n, turnaround, SLA).
9. **Unresolved contradictions:** C1/O3 (pre-quote Founder question) — non-blocking; C2 deferred by #15. Nothing else.

## 6. PHASE F POSITION

Commercial closure criterion **F9 is satisfied**: architecture DECIDED, pilot pricing removed from active offers, no contradictory public promise outside the recorded C2 deferral, no billing code expected or required. Remaining commercial items are pre-quote Founder actions and the parallel legal/accounting gate.

**COMMERCIAL = CLOSED FOR PHASE F** — with precisely recorded pre-quote actions (O3, O4, §10.3, PoT rate) and legal gates.
