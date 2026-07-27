# AI Strategy — Tajribti Platform

**Source:** B 2.5 FDD (AI Strategy section), B 4 Technical Architecture (AI Architecture), B 3 PRD (Feature TJ-018)  
**Category:** AI / Intelligence  
**Keywords:** AI strategy, LLM, OpenAI, Anthropic, prompt management, insight generation, fraud detection, data moat, AI gateway  

---

## Summary

AI is an **enabler of faster, better insight delivery** — not Tajribti's defensible moat. The moat is the proprietary consumer dataset and brand relationships. AI is the layer that converts raw structured survey data into readable brand intelligence and automates fraud detection. This distinction governs every AI investment decision.

---

## AI Philosophy (from FDD)

> AI is an enabler of faster, better insight delivery — not the company's defensible moat.  
> The moat is proprietary consumer data, brand relationships, and execution quality.

### What this means in practice

| Do | Don't |
|---|---|
| Use third-party LLM APIs for insight narrative generation | Build your own LLMs |
| Build proprietary fraud-detection models once real campaign data exists | Train fraud models on fabricated data |
| Use AI to make the existing data more valuable | Collect data just because AI could use it |
| Multi-provider LLMs to avoid lock-in | Commit to a single LLM vendor |
| Version and test prompts systematically | Hardcode prompts in application code |

---

## AI Roadmap

| Phase | AI Capability | Status |
|---|---|---|
| MVP | None — basic analytics only | Track 0 / Sprint 1–4 |
| V1 | AI Insight Narratives (Feature TJ-018) | Post-MVP (P2 feature) |
| V1.5 | Automated Fraud/Anomaly Detection (TJ-021) | Post-V1 |
| V2 | Predictive Purchase Intent Scoring | Future |
| Future (if validated) | "Ask Your Data" conversational interface (RAG + embeddings) | Only if validated as product need |

---

## AI Architecture

### LLM Provider Strategy

| Element | Decision |
|---|---|
| Primary providers | OpenAI + Anthropic (both, multi-provider) |
| Selection rationale | Avoid single-vendor lock-in (FDD requirement) |
| Routing | Internal AI Gateway service (Python/FastAPI) — not hardcoded in application code |
| Azure/Google Vertex | Evaluated only if a specific enterprise client requires particular compliance certification |
| Fallback | Multi-provider gateway enables seamless provider switching without application code changes |

### AI Gateway Design

```
NestJS API
    ↓ HTTP request to AI service
Python FastAPI AI Gateway
    ├── Provider router (OpenAI vs. Anthropic)
    ├── Prompt template loader (versioned)
    ├── JSON-mode output schema validation
    └── Response caching (per campaign/survey_set)
    ↓
OpenAI API  or  Anthropic API
```

### Prompt Management Architecture

| Element | Decision |
|---|---|
| Storage | Dedicated prompt-management module (not inline in code) |
| Format | Versioned templates with structured JSON output schemas |
| Output contract | Frontend consumes typed data, not free text requiring parsing |
| Testing | A/B testable — can run two prompt versions simultaneously |
| Versioning | Git-tracked alongside application code |

---

## Feature: AI Insight Narratives (TJ-018)

**Priority:** P2 (V1 — post-MVP)  
**Depends on:** Analytics module, LLM API

### What it does

Converts raw post-trial survey data into a plain-language, brand-actionable narrative for the brand dashboard. Instead of a table of numbers, the brand sees:

> *"68% of female consumers aged 25–35 who tried the product rated it 4/5 or above on taste. Purchase intent was 42%, which is 15 points above category average for first-trial products. The main concern cited (34% of responses) was 'too sweet' — consider a reduced-sugar variant for this segment."*

### Input (from Analytics module)

- Survey response aggregates per campaign
- Demographic breakdowns (age/gender/city)
- Comparative benchmarks (when available from historical data)
- Campaign metadata (product category, target segment, dates)

### Output (JSON-mode, typed)

```json
{
  "executive_summary": "string",
  "key_findings": ["string"],
  "segment_insights": [{"segment": "string", "finding": "string"}],
  "recommended_actions": ["string"],
  "confidence_note": "string",
  "sample_size": "integer",
  "data_coverage": "percentage"
}
```

### Important communication principle

The brand-facing confidence note must **never oversell certainty**. Always show sample size and coverage context. Brand credibility depends on never overstating what the data actually shows. This is a non-negotiable communication rule (from FDD Brand Decisions).

---

## Feature: Fraud / Anomaly Detection (TJ-021)

**Priority:** P0 (manual queue in MVP) → P1 (automated in V1.5)  
**Depends on:** Survey module; automated model requires real campaign data to train on

### Why it matters

Fraud in the data pipeline (fake redemptions, bot surveys, duplicate consumer accounts) directly degrades the quality of the data product. One high-fraud campaign that reaches a brand report destroys trust in the platform. Data quality is the product.

### MVP approach (manual)

Ops Admin reviews flagged anomalies in the Admin Portal queue. Fraud flags triggered by:
- Consumer attempting to redeem the same campaign more than once (DB unique constraint + application logic)
- Survey completion time under 30 seconds (likely bot)
- Geographic anomaly (redemption event coordinates inconsistent with declared location)
- Survey response patterns identical across multiple consumer profiles

### V1.5 approach (automated)

Proprietary fraud-detection ML model trained on real campaign data (only after sufficient volume exists — not on fabricated data). Model surfaces a confidence score per redemption event. Human review queue filters by model score, not manual scan of every event.

---

## What AI Is NOT Used For

Per FDD explicit decisions:

| Capability | Reason not automated |
|---|---|
| Brand relationship management | Egypt B2B is relationship-driven — human-only |
| Campaign strategy for brands | Requires deep product knowledge and market context |
| Consumer support at scale | In-app support only in MVP; CS team handles brand escalations |

---

## RAG / Embeddings / Vector Database Decision

**Decision: NOT required for V2 insight-narrative use case.**

Rationale: The underlying knowledge for V2 insight generation is the campaign's own structured survey data (already in PostgreSQL/warehouse) — not an external document corpus. Insight generation is a data-to-narrative transformation, not a retrieval problem.

**RAG is explicitly deferred** to a future "ask your data" conversational feature (e.g., *"Show me trends across my last 5 campaigns for female consumers aged 25–30"*) — and only if that becomes a validated product need. No speculative infrastructure spend.

---

## Data Intelligence Flywheel

```
Campaign runs
    ↓
Consumer data collected (demographics + survey + redemption)
    ↓
Proprietary dataset grows
    ↓
ML models improve (fraud detection, purchase intent)
    ↓
AI narratives become more accurate (benchmarks, segmentation)
    ↓
Brands renew (better ROI evidence)
    ↓
More campaigns → more data
```

This flywheel is the actual competitive moat. Not the technology — the data accumulation that only grows with time and can't be bought or replicated.

---

## Related Documents

- [[FDD — AI Strategy + AI Providers]] → `15_Decisions/FOUNDER_DECISIONS.md`
- [[Technical Architecture — AI Architecture section]] → `09_Technical/TECHNICAL_ARCHITECTURE.md`
- [[Master PRD — Feature TJ-018]] → `08_PRD/MASTER_PRD_v1.0.md`
- [[ChatGPT Prompts — reusable prompt templates]] → `11_Prompts/CHATGPT_PROMPTS.md`
