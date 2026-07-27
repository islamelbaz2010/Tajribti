# Current Objective — One Page

**This file describes EXACTLY what we are trying to accomplish RIGHT NOW.**  
**Last updated:** 2026-07-27

---

## The One Sentence

Execute a 60-day, $15K–$25K commercial validation sprint to prove — or disprove — that Egyptian FMCG brands will pay for consumer intelligence from physical trial data.

*Source: `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md` — Investment Parameters*

---

## What "Right Now" Means

**Zero engineering. Zero product. Zero code.**

The current phase is a commercial and legal validation sprint, not a build phase. Engineering starts only after Track 0 produces a GO decision.

*Source: `13_Audits/REMEDIATION_REAUDIT.md` Section B; `04_Investment/INVESTMENT_DUE_DILIGENCE_REPORT_v2.md`*

---

## The 4 Things That Must Happen

### 1. Brand LOIs — the commercial gate (B-01)

Reach ≥3 Egyptian FMCG, beauty, or pharma-OTC brands with enough interest to sign pilot letters of intent (LOIs).

**How:** Outreach to the 14 pre-identified brand targets using a brand pitch deck and brand briefing document. Discovery calls. Pilot proposals. LOI signature.

**Kill criterion:** If fewer than 3 LOIs are signed in 60 days → NO-GO. Engineering does not start. Period.

*Source: `07_Product/GO_TO_MARKET.md` GTM Sequence; `12_Reviews/PEER_REVIEW_MASTER_REPORT.md` Kill Criterion*

**14 Priority brand targets (from workspace):**

| Brand | Category | Why |
|---|---|---|
| Procter & Gamble Egypt | FMCG | High SKU velocity, established sampling budgets |
| Unilever Egypt | FMCG | Household penetration campaigns |
| Nestlé Egypt | FMCG | New product launches |
| PepsiCo Egypt | FMCG | Snacks + beverages |
| Coca-Cola Egypt | FMCG | Consumer activation |
| Johnson & Johnson Egypt | FMCG/OTC | OTC pharma + baby care |
| L'Oréal Egypt | Beauty | Skincare new products |
| Dabur Egypt | FMCG/Herbal | Growing MENA presence |
| Hana Group | Beauty | Egyptian beauty market leader |
| OLA (Chipsy) Egypt | FMCG | Snacks |
| El-Rashidi El-Mizan | FMCG | Local FMCG conglomerate |
| Fine Egypt | FMCG | Household paper products |
| Juhayna | FMCG | Dairy/beverages |
| Lactel Egypt | FMCG | Dairy |

*Source: `07_Product/GO_TO_MARKET.md` Brand Target List*

---

### 2. LLC Incorporation — the legal and operational gate (B-02)

Register the Egyptian legal entity. Until registered, no contracts can be signed, no bank accounts opened, no vendor relationships established.

**Status:** Not yet incorporated.

**What closes it:** Commercial register number or confirmed formation date.

*Source: `15_Decisions/OPEN_DECISIONS_TRACKER.md` B-02; `13_Audits/REMEDIATION_REAUDIT.md`*

---

### 3. PDPL Legal Review — the data compliance gate (B-03)

Engage an Egyptian data-privacy lawyer to provide a written scope opinion on Tajribti's consumer data collection model under the Personal Data Protection Law (PDPL — Law No. 151 of 2020).

**What we need:** A written memo that confirms: (a) consent mechanism design; (b) permissible data categories; (c) data residency requirements; and (d) whether AWS Bahrain satisfies Egyptian PDPL.

**Status:** Not yet engaged. No lawyer yet hired.

**What closes it:** Written memo received.

*Source: `15_Decisions/OPEN_DECISIONS_TRACKER.md` B-03; `02_Project_Management/RISK_REGISTER.md` R-LC-01*

---

### 4. QR Load Test — the technical risk gate (B-04)

After Track 0 GO and CTO hire, execute a QR concurrency load test. The QR Redemption feature (TJ-005) has a concurrent race condition risk — multiple consumers scanning the same QR simultaneously. The load test must validate that the idempotency solution holds.

**Status:** BLOCKED until B-01 (GO) and CTO hire.

**What closes it:** Load test report showing idempotency holds at target concurrent-scan load.

*Source: `15_Decisions/OPEN_DECISIONS_TRACKER.md` B-04; `09_Technical/TECHNICAL_ARCHITECTURE.md`; `08_PRD/MASTER_PRD_v1.0.md` TJ-005*

---

## What Success Looks Like

After 60 days, the Founder presents to IC:

```
✅  ≥3 brand LOIs signed (kill criterion met)
✅  LLC registered or formation date confirmed
✅  PDPL written opinion received
✅  QR load test completed (or clear path to completion post-hire)
→   IC issues Track 1 GO authorization
→   Engineering begins
```

*Source: `04_Investment/IC_MEMO_v1.0.md` — Conditional GO Recommendation*

---

## What Failure Looks Like

```
❌  <3 brand LOIs after 60 days
→   IC issues NO-GO
→   Project pauses or pivots
→   NO engineering started
```

*Source: `07_Product/GO_TO_MARKET.md` Kill Criterion; `15_Decisions/OPEN_DECISIONS_TRACKER.md`*

---

## What an AI Should Help With Right Now

- Brand pitch materials (deck, email scripts, objection handlers)
- Brand discovery call templates and frameworks
- Pricing discovery questions
- LOI template document drafting
- LLC incorporation checklist for Egypt
- PDPL research and lawyer engagement brief
- Track 0 sprint planning
- Risk analysis of the current phase

## What an AI Should NOT Help With Right Now

- Engineering design (no code, no architecture refinement beyond what exists)
- Technical debt planning
- Infrastructure setup
- Any feature below P0 priority
- Post-launch optimization

*Source: `_ai_bootstrap/AI_WORKFLOW.md` — What to Ask AI*
