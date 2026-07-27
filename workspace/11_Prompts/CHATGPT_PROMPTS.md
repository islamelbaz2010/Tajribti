# ChatGPT Conversation & Prompt Library

**Title:** ChatGPT Chat History — Investment Analysis Session (until 26 July)  
**Original Filename:** chatgpt chat till 26-7.docx  
**Original Location:** inbox/  
**Category:** Conversation / Prompts  
**Date:** Until 2026-07-26  
**Word Count:** ~4,372  
**Keywords:** ChatGPT, prompts, investment analysis, due diligence, peer review, consulting, multidisciplinary, Egypt, Samplia  

---

## Summary

This document is the ChatGPT conversation that generated the foundational investment analysis. It contains two major prompt templates and the AI's response to them. The prompts are enterprise-grade, multi-phase consulting frameworks that produce investment-committee-quality analysis. These prompts constitute an IP asset for the project.

---

## Prompt 1 — Full Investment Due Diligence Prompt

**Purpose:** Drive a complete 18-phase investment due diligence analysis from a video input.  
**Role assigned:** Elite multidisciplinary consulting team (McKinsey, BCG, Deloitte, EY, VC, Startup Founder, PM, CTO, Market Research, Competitive Intelligence, Business Model, Financial Modeling, Operations, Legal, Marketing, CX experts)

### The 18 Phases

| Phase | Topic |
|---|---|
| 1 | Idea Reconstruction — completely reconstruct business from video |
| 2 | Company Research — history, founders, funding, investors, revenue, growth, countries, users, revenue, team, partnerships, tech stack |
| 3 | Market Research (Egypt) — TAM, SAM, SOM, customer segments, behavior, purchasing power, geographic concentration, demand, growth |
| 4 | Competitor Analysis — direct, indirect, alternative solutions, Egyptian companies, international; comparison matrix |
| 5 | Localization — culture, language, consumer behavior, payments, pricing, legal, trust, acquisition, support, logistics, partnerships, government, technology adoption |
| 6 | Business Model — revenue streams, pricing model, subscription, marketplace, commission, advertising, enterprise, hybrid |
| 7 | Financial Feasibility — startup cost, monthly operating cost, team, technology, marketing, infrastructure, break-even, cash flow, margins, ROI, payback, 3-year projection |
| 8 | Legal & Regulatory — licenses, taxes, corporate structure, consumer protection, data privacy, industry regulations, legal risks, compliance, IP |
| 9 | Go-to-Market — target audience, positioning, marketing channels, sales, acquisition, retention, referral, partnerships, first 100 / first 1000 customers |
| 10 | Operational Plan — team, hiring roadmap, daily operations, processes, tech stack, automation, KPIs, risks, scaling |
| 11 | Risk Analysis — market, financial, operational, technical, legal, competitive, execution, founder, economic, political risks; probability, impact, mitigation |
| 12 | SWOT Analysis |
| 13 | Porter's Five Forces |
| 14 | PESTEL Analysis (Egypt) |
| 15 | Implementation Roadmap — 30 days, 90 days, 6 months, 12 months, 24 months |
| 16 | Investment Decision — invest? launch? modify? pivot? reject? |
| 17 | Challenge the Idea — actively disprove; weak assumptions, hidden risks, blind spots, failure reasons |
| 18 | Final Verdict — 6 scores (/100) + overall recommendation + confidence level + data gaps |

### Final Verdict Scorecard Format

```
Investment Score:        /100
Market Readiness:        /100
Execution Difficulty:    /100
Financial Attractiveness:/100
Scalability:             /100
Competitive Advantage:   /100

Overall Recommendation:
[ ] Build immediately
[ ] Build with modifications
[ ] Build later
[ ] Do not build

Confidence Level: [%]
Data gaps that would most improve accuracy: [list]
```

### Prompt Rules

- Never make unsupported assumptions
- Distinguish clearly between: facts from video / externally verified information / estimates / opinions
- If something is unclear, explicitly state the uncertainty instead of guessing
- Do NOT summarize the video only — treat as a complete investment due diligence project

---

## Prompt 2 — Peer Review & Synthesis Prompt

**Purpose:** Independently peer-review two AI-generated consulting reports and produce a single Final Master Report stronger than either original.  
**Role assigned:** Same multidisciplinary team; acting as Investment Committee peer reviewer

### The 6 Steps

| Step | Action |
|---|---|
| 1 | Read both reports completely; understand Facts/Assumptions/Estimates/Opinions; identify contradictions |
| 2 | Create comparison matrix: Coverage, Accuracy, Depth, Logic, Evidence, Business realism, Financial realism, Market realism, Implementation feasibility, Risk awareness, Innovation, Actionability — score each section from both reports |
| 3 | Identify: missing information in A, missing in B, weak arguments, unsupported assumptions, incorrect conclusions, hallucinations, missing risks/competitors/financials/legal/operational/market insights |
| 4 | Merge reports — keep only strongest version of every section; rewrite where necessary; remove duplication; resolve contradictions; fill every gap |
| 5 | Create Final Master Report — must read as one professionally written consulting document; reader should never know two reports existed |
| 6 | Final self-review — "If I were an Investment Committee reviewing a multi-million-dollar investment, what would still be missing?" — repeat until no major weaknesses remain |

### Required Output

1. Executive Comparison Matrix
2. Strengths of Report A
3. Strengths of Report B
4. Weaknesses of Report A
5. Weaknesses of Report B
6. Newly Added Insights
7. Final Master Report
8. Investment Committee Review
9. Confidence Score
10. Remaining Unknowns

### Review Rules

- Never assume your own report is correct
- Never assume the other report is correct
- Challenge both
- Every conclusion must be justified
- When two reports disagree: determine which is stronger, explain why. If neither sufficiently supported, create a better conclusion.

---

## AI Response Excerpt

The AI (ChatGPT) responded to Prompt 2 by noting it could not execute the full peer review without both reports present. It provided:

1. A preliminary assessment of the available report (Egypt_Pop-Up_Feasibility_Scoping_Note.docx) — noting its strengths: methodological discipline, FACT/ESTIMATE/INFERENCE tagging, correct "Conditional/Hold" recommendation, and professional acknowledgment of evidence gaps.

2. Confirmation that a full comparison requires both documents to be present simultaneously.

3. A preview of the 10-part output structure it would produce once both reports were available.

The conversation then progressed to uploading the second report and the full peer review was subsequently generated (see `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`).

---

## Source Material Referenced in Chat

| File | Description |
|---|---|
| v1c044g50000d9dqtfvog65snstfbbdg.mp4 | Original Samplia video — the business concept source |
| samples app text.txt | Text transcription of the Samplia video |
| Egypt_Pop-Up_Feasibility_Scoping_Note.docx | Screening-stage feasibility note (Report B subject) |
| Egypt_Pop-Up_Feasibility_Scoping_Note(1).docx | Second version of the above |

---

## Prompt Reuse Guide

These prompts can be reused for any new business idea analysis:

| Prompt | Best for |
|---|---|
| Prompt 1 (18-phase due diligence) | Any new business idea requiring full investment-committee-grade analysis |
| Prompt 2 (peer review synthesis) | Any situation where two independent analyses exist and need to be merged into a definitive version |

**Recommendation:** Save these prompts as reusable templates in `11_Prompts/` for future use on other ventures or expansion markets.

---

## Related Documents

- [[Peer Review Master Report]] → `12_Reviews/PEER_REVIEW_MASTER_REPORT.md`
- [[IC Report Template]] → `04_Investment/IC_REPORT_TEMPLATE.md`
- [[Source Video Transcript]] → `03_Research/SOURCE_VIDEO_TRANSCRIPT.md`
