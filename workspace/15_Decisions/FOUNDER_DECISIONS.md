# Founder Decisions Document (FDD) — Constitutional Source of Truth

**Title:** Tajribti Founder Decisions Document v1.0  
**Original Filename:** B 2.5-Tajribti_Founder_Decisions_Document_v1.0.docx  
**Original Location:** inbox/  
**Category:** Decisions  
**Version:** 1.0  
**Keywords:** founder decisions, business decisions, product decisions, technology decisions, UX, brand, operations, finance  

---

## Summary

The FDD is the constitutional source of truth for the Tajribti platform. Every strategic, product, technology, UX, brand, operational, and financial decision is documented here with binding authority over all downstream documents. When a document contradicts the FDD, the FDD governs.

---

## Executive Vision

| Element | Decision |
|---|---|
| Mission | Replace guesswork in product launches with real-time, consented consumer truth |
| Vision | Default consumer-intelligence layer in Egypt within 3 years; MENA within 5–7 |
| North Star | Verified, brand-actionable consumer data points per month |
| Long-term | MENA's largest permissioned FMCG/beauty/pharma consumer panel |
| Exit Option A | Strategic acquisition by NielsenIQ, Kantar, Circana, or MENA media group |
| Exit Option B | Sustained independent profitability as a regional data-services company |
| Rejected | Venture-style forced-exit timeline |

---

## Business Decisions

| Decision | Value |
|---|---|
| Target Market | FMCG, beauty, personal care, pharma-OTC brands in Egypt |
| Paying Customer | Brand marketing, innovation, consumer-insights teams |
| Non-Paying (data source) | Egyptian consumers aged 18–40 in Cairo, Giza, Alexandria |
| Ideal Customer | Mid-to-large FMCG/beauty brand, 3+ launches/year, existing sampling/research budget |
| Year 1 Geography | Cairo only |
| Year 2 Geography | Alexandria, Giza, New Cairo, 6th October |
| GCC Expansion Gate | Only after Egypt unit economics are proven — hard gate, not a calendar date |
| Out of Scope (Y1–3) | Healthcare, insurance, banking, telecom, government, education |
| Pricing Philosophy | Brands pay; consumers never pay. Price for value of data/insight, not headcount |
| Revenue Model | B2B hybrid: campaign fees + per-sample fees + AI dashboard subscription + panel access + Enterprise API |
| Monetization Motion | Land with single paid campaign → expand to subscription + repeat + panel |
| Funding Strategy | Capital-efficient, bootstrapped trajectory. Raise only to hit next milestone |

---

## Product Decisions

| Decision | Value |
|---|---|
| Core Product | Two-sided platform: consumer app + brand dashboard |
| MVP Scope | Admin dashboard, brand dashboard, consumer app, QR redemption, 3–5 question survey, basic analytics |
| NOT in MVP | Permanent kiosks, owned logistics, e-commerce, paid consumer subscriptions, non-FMCG verticals, GCC features |
| Future Modules | Gamification, referral system, AI insight narratives, predictive purchase-intent, retail media, Enterprise API, consumer panel marketplace |
| AI Strategy | AI = faster insight delivery, NOT the moat. Moat = proprietary data + brand relationships. Use third-party LLM APIs (OpenAI/Anthropic). Build proprietary fraud-detection only once real campaign data exists |
| Automation | Automate: campaign creation, segmentation, reward distribution, survey generation, invoicing, notifications, QR validation. Do NOT automate: brand relationship management, campaign strategy |
| MVP Integrations | WhatsApp Business API (notifications), Vodafone Cash + InstaPay (rewards), HubSpot/Salesforce (enterprise CRM), CSV/API export |

---

## Technology Decisions

| Decision | Value |
|---|---|
| Tech Philosophy | Boring, proven technology for core stack. Reserve novelty for AI/data layer only |
| Cloud | AWS, nearest data-residency-compliant region (UAE or Bahrain) — pending legal PDPL confirmation |
| Multi-cloud | No multi-cloud in Years 1–2 |
| Security | Privacy-by-design. Encrypt at rest and in transit. Minimum data collection. Consumer self-service deletion |
| Build | Sampling-to-survey-to-dashboard pipeline, fraud-detection layer, AI insight-narrative logic (once trainable) |
| Buy | Payments, cloud, LLM APIs, analytics/BI, CRM, monitoring |
| Open Source | Use freely (PostgreSQL, Redis, Kafka). Do NOT open-source Tajribti's own code or models |
| AI Providers | OpenAI and/or Anthropic — multi-provider to avoid single-vendor lock-in |
| Scalability | Stateless services, horizontal autoscaling, queue-based decoupling. Design for 10x current volume |

---

## UX Decisions

| Decision | Value |
|---|---|
| UX Philosophy | Friction is the enemy. Every unnecessary tap costs completed surveys |
| Accessibility | RTL-first, readable Arabic typography, lower-end Android support, graceful degradation on poor connectivity |
| Mobile Strategy | Mobile-first and mobile-only for consumers. Brand dashboard = desktop-web-first |
| Languages | Egyptian-dialect Arabic = default and primary. English = secondary toggle |
| Localization | NOT a translation layer — natively Egyptian from first release |

---

## Brand Decisions

| Decision | Value |
|---|---|
| Brand Positioning | "Egypt's Consumer Intelligence Platform" — never described as sampling company or coupon app |
| Brand Personality | Sharp, evidence-driven, trustworthy — "credible insider" |
| Tone (consumer) | Direct, plain-language, zero jargon |
| Tone (brand-facing) | Data-forward, precise |
| Visual Direction | Clean, modern, Arabic-typography-led. Not "startup gradient" aesthetics |
| Brand Values | Consent, speed, honesty, usefulness |
| Communication | Never oversell certainty in insights — always show sample size and confidence context |

---

## Operational Decisions

| Decision | Value |
|---|---|
| Company Structure | Egyptian LLC initially, converting to JSC as it scales |
| Remote vs. Office | Remote-first for engineering/product/data. In-person required for Ops/field and Sales |
| Support | In-app for consumers; dedicated CS contact for brand accounts. No phone support Y1 |
| CS Strategy | Proactive ROI reporting drives renewal — not reactive ticket-answering |
| Sales Strategy | Outbound-led, ~20 named accounts. Sell measurable results, not software. Land-and-expand |
| Marketing | Consumer-side = acquire data panel. Brand-side growth = case studies + referrals from Sales/CS |

---

## Open Decisions (Unresolved as of Audit)

1. Final legal company name and trademark/domain clearance
2. Whether CEO doubles as PM through Year 1 or a dedicated PM is hired on GO
3. Final cloud hosting region (provisionally AWS me-south-1 Bahrain — see Remediation doc)
4. Whether external funding is sought or company remains bootstrapped
5. Exact revenue-mix percentages (pending validation-sprint findings)

---

## Related Documents

- [[B 2 — Master Execution Blueprint]] → `01_Project_Overview/PROJECT_OVERVIEW.md`
- [[B 3 — Master PRD]] → `08_PRD/`
- [[B 4 — Technical Architecture]] → `09_Technical/`
- [[B 6 — Readiness Audit]] → `13_Audits/READINESS_AUDIT.md`
