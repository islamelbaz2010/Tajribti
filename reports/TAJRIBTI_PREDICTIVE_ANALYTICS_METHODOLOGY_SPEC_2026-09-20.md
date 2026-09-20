# TAJRIBTI — PREDICTIVE ANALYTICS METHODOLOGY SPEC (D-4)

**Date:** 2026-09-20 · **Status:** METHODOLOGY ONLY — the Founder decision authorizes the *methodology direction*, not uncontrolled implementation. **Nothing in this document is implemented.** No ML/regression/forecasting/significance-testing code may be added under this spec alone.

---

## 1. Intended use

Descriptive-to-predictive graduation for the intelligence layer: answering forward-looking questions for Company users *only when evidence volume and method justify it*. Until then, the live product continues to emit descriptive statistics only (current state — preserved).

## 2. Acceptable predictive questions (bounded set)

Only questions answerable from campaign evidence, e.g.:

- expected purchase-intent level for a *similar* future campaign of the same company;
- expected feedback-completion rate for a campaign configuration;
- expected segment response differences at a given sample size.

Explicitly out of bounds: individual-consumer prediction, cross-company prediction, revenue/sales forecasting, anything requiring data the platform does not collect.

## 3. Required data & feature lineage

- Only persisted campaign evidence: participations, answers, question/campaign metadata, segment fields, `Product` descriptors.
- Every feature must trace to a schema field; lineage documented per model version.
- **Leakage prevention:** features must be knowable *before* the predicted event (e.g. cannot use post-trial answers to predict eligibility); temporal split required for validation.

## 4. Methodology (minimum bar before any implementation)

- Start with calibrated baselines (pooled proportions with shrinkage / hierarchical pooling), not opaque models.
- Any model beyond baselines requires: stated target, stated features, stated algorithm, stated hyperparameters — recorded in this document's successor revision.
- RESEARCH EVIDENCE — NOT PRODUCT REQUIREMENT: `doc/` files may inform question framing only.

## 5. Validation

- Temporal or grouped holdout (by campaign); metrics reported with sample sizes.
- Minimum evidence gate: no predictive output shown below a defined n per segment (default: the existing n<5 suppression floor is the absolute minimum; a predictive surface would likely require a *higher* floor — set when a concrete method is chosen).
- A model that cannot beat the descriptive baseline is not shown.

## 6. Confidence / uncertainty treatment

- Every predictive output carries an interval or explicit uncertainty statement and a sample-size disclosure.
- Uncertainty language is factual ("estimated", "based on n=…"), never causal or deterministic.

## 7. Explainability & auditability

- Each output lists contributing evidence counts and the method name/version.
- `AccessAuditEvent`-style logging for any predictive surface access; model version recorded with each output.

## 8. Report presentation

- Predictive content is a separate, clearly-labeled block — never merged into evidence findings.
- Labels: `predictive: true`, method, training scope, n, generated-at.

## 9. Failure conditions (must suppress output)

- training n below the defined floor; missing features; drift between training and target campaign config; validation performance worse than baseline; any cross-company data request.

## 10. Prohibitions

- No fabricated predictions, no unsupported causal claims, no per-consumer scoring for PII-bearing decisions, no cross-company model pooling without a new explicit Founder decision (OFD-15 isolation is preserved).

## 11. Status

**METHODOLOGY SPECIFIED — IMPLEMENTATION NOT AUTHORIZED by this spec.** A concrete method choice (algorithm + feature set + floor) is itself a further technical decision to be made against real data volumes; until then the live surface remains descriptive-only — which is correct and unchanged.
