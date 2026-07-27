# Product Strategy — Tajribti

**Source:** B 2.5 FDD, B 3 Master PRD, B 2 Master Execution Blueprint, IC Due Diligence v2.0  
**Category:** Product  
**Keywords:** product strategy, product vision, roadmap, features, MVP, V1, V2, personas  

---

## Product Vision

> Every new product launch in Egypt should be informed by real, consented consumer data — not guesswork.

Tajribti is the technology layer that makes this possible: it converts a physical product trial into a brand-actionable consumer data point within 24 hours. The product is not the free sample. The product is the data.

---

## Two-Sided Platform Model

| Side | User | Value Received | Value Given |
|---|---|---|---|
| Brand side | Brand marketing / innovation teams | Structured consumer data, demographics, purchase intent, survey responses | Campaign fees + subscription |
| Consumer side | Egyptian consumers 18–40 | Free products, rewards, early adopter experience | Data (demographic profile + survey responses) |

The platform is the intermediary that makes this exchange trustworthy, measurable, and scalable.

---

## Product Ecosystem

### MVP Products (Sprint 0–6)

| Product | Users | Purpose |
|---|---|---|
| Consumer App (Flutter, mobile-only) | Consumers | Sample discovery, QR redemption, post-trial survey, rewards |
| Brand Dashboard (React, desktop-first) | Brand marketing teams | Campaign creation, live monitoring, analytics, CSV export |
| Admin Portal (React, internal) | Tajribti Ops | Campaign config + approval, fraud review, support tickets |

### V1 Additions (Post-MVP)

| Feature | Value |
|---|---|
| Rewards Wallet | Consumer retention beyond first campaign |
| Referral Program | Lower consumer CAC via peer invites |
| AI Insight Narratives | Plain-language recommendations from raw survey data |
| Contract & Invoice View | Brand self-service billing transparency |

### V2+ Roadmap

| Module | Strategic Purpose |
|---|---|
| Consumer Panel Marketplace | Sell access to defined demographic/interest segments as a data product |
| Enterprise API / CRM Connector | Enable large-account data integration with Salesforce/HubSpot |
| Retail Media Marketplace | Sponsored placement within app and at physical activation sites |
| Gamification + Interest Communities | Higher-frequency consumer engagement; resellable panels |
| Predictive Purchase Intent | ML scoring: probability this consumer buys after trial |
| "Ask Your Data" Interface | Conversational analytics — only if validated as a product need |

---

## Feature Priority Framework

| Priority | Definition | Examples |
|---|---|---|
| P0 | MVP critical path — must launch with | OTP login, QR redemption, post-trial survey, basic analytics |
| P1 | V1 — ship after MVP learnings | Rewards wallet, referral, AI narratives |
| P2 | Future — fully spec'd one sprint before build | Enterprise API, panel marketplace, gamification |

**Specification depth rule (from FDD):** Fully speccing V1/V2 features today would fix details that should be informed by MVP learnings. P1/P2 features receive full 20-field specification one sprint before build.

---

## SWOT Analysis

### Strengths
| Strength | Detail |
|---|---|
| Correct strategic framing | Correctly positioned as Consumer Intelligence Platform, not sampling company |
| First-party data moat | Proprietary consumer dataset grows with every campaign — competitors cannot replicate |
| In-moment data quality | Feedback captured within minutes of product trial — more accurate than recall-based research |
| Egypt-first design | Arabic-first, Vodafone Cash, Carrefour/Spinneys retail partners, lower-end Android support |
| Proven reference model | Samplia has 10+ years of operational proof in Spain |
| Evidence-based culture | FDD mandates "evidence over opinion" — drives credible insights and brand trust |

### Weaknesses
| Weakness | Detail |
|---|---|
| No primary customer research | Zero brand or consumer interviews conducted — all demand is assumed |
| No unit economics | CAC, LTV, contribution margin, payback period — none built |
| No bottom-up TAM/SAM/SOM | Egypt FMCG sampling/research spend not sized from real data |
| Two-sided chicken-and-egg problem | Need brands to attract consumers; need consumers to sell to brands |
| Brand sensitivity to data quality | One bad dataset or fraud incident damages the core product irreparably |
| Unfunded Sales function | Brand pipeline acquisition has no dedicated funded resource yet |

### Opportunities
| Opportunity | Detail |
|---|---|
| Egypt FMCG innovation growth | Rising activity; brands launching more products; need faster consumer validation |
| Traditional research is slow | 3–6 week turnaround for traditional market research creates clear gap |
| Marketeers Research doesn't do physical sampling | No Egyptian player yet combines physical trial with instant structured data |
| MENA regional expansion | Saudi Arabia, UAE, Kuwait after Egypt is proven |
| Enterprise data products | Consumer panel access, predictive analytics, retail media — high-margin future revenue |
| AI analytics differentiation | LLM-generated insight narratives vs. raw dashboards creates perceived value premium |

### Threats
| Threat | Detail |
|---|---|
| Marketeers Research enters sampling | Could acquire/partner with a field sampling operator to replicate the pipeline |
| Global players enter MENA | Samplia itself or funded competitors (~127 globally) could enter Egypt |
| Samplia enters directly | Reference company could license or replicate to new markets |
| PDPL over-compliance costs | Strict data governance requirements may increase operational complexity |
| Consumer distrust | "Free stuff" distrust in Egyptian market; need strong trust signals to achieve scale |
| Economic instability | Egypt's economic environment affects brand marketing budgets (primary customers) |

---

## Porter's Five Forces Analysis (Egypt Market)

| Force | Rating | Analysis |
|---|---|---|
| **Competitive Rivalry** | Medium | No direct Egyptian competitor yet combines physical sampling + instant data. Marketeers Research is the closest but uses different mechanic. Global competition is high (127+ players) but none yet in Egypt specifically. |
| **Threat of New Entrants** | High | Low barriers to concept replication; any BTL agency could observe and attempt to copy. First-mover advantage exists but time-limited. |
| **Bargaining Power of Buyers (Brands)** | Medium | Brand marketing budgets are negotiation-driven; early relationships can be locked in with multi-campaign contracts. Loss of one major brand account early could be serious. |
| **Bargaining Power of Suppliers (Consumers)** | Low | Consumer panel is acquired through free product exchange; no monetary cost. Consumer churn risk is real but individual consumer has low bargaining power. |
| **Threat of Substitutes** | High | Traditional market research firms, mystery shopping, in-store sampling, paid survey platforms, and post-purchase feedback tools all compete for the same brand budget line. |

---

## PESTEL Analysis (Egypt, 2026)

| Factor | Analysis | Impact |
|---|---|---|
| **Political** | Stable for business operations; government supports tech startups and foreign investment in certain sectors | Low risk |
| **Economic** | Inflation and EGP depreciation affect consumer purchasing power and brand marketing budgets. Egypt's economy is growing but volatile. FMCG sector continues strong. | Medium risk — monitor brand budget sensitivity |
| **Social** | Young, urban, mall-centric, social-media-active population. Rising consumer brand consciousness. Cairo penetration of smartphones and apps is high (18–40 demographic). | Positive — strong fit for the model |
| **Technological** | Widespread WhatsApp and mobile app adoption. Android dominates market (lower-end devices). 4G coverage in Cairo sufficient for app-based redemption. InstaPay and Vodafone Cash enable rewards payment. | Positive — platform assumptions supported |
| **Environmental** | Minimal direct environmental impact. Packaging waste from physical samples is a minor consideration but not strategically relevant at MVP scale. | Low risk |
| **Legal** | PDPL (Law No. 151/2020) is the primary compliance obligation. Consumer Protection Law. Companies Law. E-commerce regulations. Key gap: cross-border data transfer rules, consent mechanics, data-retention periods. | High risk — PDPL sign-off is a blocking gate |

---

## Product Roadmap

| Phase | Timeline | Milestone |
|---|---|---|
| Track 0 | Now — Day 60 | Commercial validation sprint: $15K–$25K, no engineering, secure 3–5 brand pilots |
| Sprint 0–1 | Day 61–75 | Legal, infra setup, vendor contracts — depends on Track 0 GO |
| Sprint 2–4 | Day 76–120 | Core MVP build: auth, campaigns, QR, surveys, analytics |
| Sprint 5–6 | Day 121–135 | Hardening, load test, PDPL, UAT |
| Private Beta | Day 136–150 | 5 brand partners, 500 consumers |
| Production v1.0 | Day 150–180 | Public launch, Cairo |
| V1 | Month 7–9 | Rewards wallet, referral, AI narratives |
| Year 2 | Month 13+ | Geographic expansion (Alexandria, Giza) |
| Year 3 | Month 25+ | National scale; evaluate GCC gate |

---

## Related Documents

- [[Master PRD]] → `08_PRD/MASTER_PRD_v1.0.md`
- [[FDD — Product Decisions]] → `15_Decisions/FOUNDER_DECISIONS.md`
- [[GTM Strategy]] → `07_Product/GO_TO_MARKET.md`
- [[Master Delivery Plan]] → `02_Project_Management/MASTER_DELIVERY_PLAN.md`
