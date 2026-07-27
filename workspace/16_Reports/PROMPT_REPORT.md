# Prompt Report

**Generated:** 2026-07-27  
**Source:** `chatgpt chat till 26-7.docx` → `11_Prompts/CHATGPT_PROMPTS.md`

---

## Prompt Inventory

| ID | Name | Phases | Output | Reusable |
|---|---|---|---|---|
| PROMPT-001 | Full Investment Due Diligence | 18 phases | Full consulting report + 6 scores + recommendation | Yes |
| PROMPT-002 | Peer Review Synthesis | 6 steps | 10-part output: comparison matrix + strengths/weaknesses + insights + final master report | Yes |

---

## Prompt Quality Assessment

### PROMPT-001 — Full Investment Due Diligence

| Dimension | Assessment |
|---|---|
| Completeness | Excellent — 18 phases cover idea reconstruction through final verdict |
| Specificity | High — each phase has explicit required outputs |
| Evidence discipline | Built-in — explicit instructions to distinguish facts/estimates/opinions |
| Output format | Well-structured — 6 numerical scores + explicit recommendation categories |
| Reusability | High — works for any business idea |
| Weakness | Phases 3 and 7 (market sizing, financial model) can generate hallucinated figures if AI is not explicitly prompted to refuse when data is unavailable |
| Improvement suggestion | Add explicit instruction: "If market size data cannot be independently verified, state UNKNOWN GAP rather than estimating. Do not fabricate TAM/SAM/SOM." |

### PROMPT-002 — Peer Review Synthesis

| Dimension | Assessment |
|---|---|
| Completeness | Excellent — 6 steps + 10-part required output |
| Independence enforcement | Built-in — explicitly forbids assuming either report is correct |
| Evidence standard | Strong — imports Report B's FACT/VERIFIED/ESTIMATE/UNKNOWN tagging methodology |
| Output format | Very good — 10-part structured output is actionable |
| Reusability | High — works for any two competing analyses |
| Weakness | Requires both reports to be simultaneously available — as the ChatGPT conversation shows, the AI correctly refused to execute without both inputs |

---

## Prompt Reuse Recommendations

| Use Case | Prompt |
|---|---|
| Evaluating the GCC expansion opportunity (Saudi Arabia, UAE) | PROMPT-001 with region changed to KSA/UAE |
| Adding a new vertical (pharma, banking, telecom) | PROMPT-001 with industry context changed |
| Merging two analysis documents for any future decision | PROMPT-002 unchanged |
| Evaluating a potential acquisition (e.g., Marketeers Research) | PROMPT-001 adapted for M&A screening |
| Annual strategic review of the business | PROMPT-001 adapted for "progress review" mode |

---

## AI Prompt Architecture (Platform-Level)

Beyond the meta-prompts used for analysis, the platform itself requires a versioned prompt library for its AI Insight Narrative feature (TJ-018). See `10_AI/AI_STRATEGY.md` for the prompt management architecture.

Key principle from FDD: *Versioned prompt templates stored in a dedicated prompt-management module — not inline in application code.*

---

## Related Documents

- [[ChatGPT Prompts — full text]] → `11_Prompts/CHATGPT_PROMPTS.md`
- [[AI Strategy — prompt management architecture]] → `10_AI/AI_STRATEGY.md`
- [[Prompt Index]] → `_navigator/PROMPT_INDEX.md`
