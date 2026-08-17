# WHAT NOT TO BUILD
## The Postponement List — Enforced Until Further Notice

**If any session produces a recommendation to build something on this list, reject it.**  
**"We could add X" is not a reason to build X.**

---

## SECTION 1 — DO NOT BUILD DURING TRACK 0

Nothing on this list gets built during Track 0. Not planned. Not designed. Not architected. Not discussed.

Track 0 is commercial validation only.

| What | Why Not Now |
|---|---|
| Flutter consumer app | Cannot be built — engineering not authorized |
| React brand portal | Cannot be built — engineering not authorized |
| React operations portal | Cannot be built — engineering not authorized |
| NestJS API | Cannot be built — engineering not authorized |
| PostgreSQL schema | Cannot be built — engineering not authorized |
| AWS infrastructure | Cannot be built — engineering not authorized |
| Terraform | Cannot be built — engineering not authorized |
| CI/CD pipeline | Cannot be built — engineering not authorized |
| Any backend service | Cannot be built — engineering not authorized |

*Source: `15_Decisions/FOUNDER_DECISIONS.md` BD-13 LOCKED; `13_Audits/REMEDIATION_REAUDIT.md` REM-04 LOCKED*

---

## SECTION 2 — DO NOT BUILD IN MVP v1.0

These features are explicitly deferred. They do not belong in the first working product.

| Feature | Decision ID | Build When |
|---|---|---|
| AI Insight Narratives (TJ-018) | PD-07 LOCKED — V2 only | After data flywheel established |
| RAG / vector database | TD-18 LOCKED — not in V1 | Validated need required |
| Microservices architecture | ADR-01 LOCKED | >8 backend engineers |
| Multi-cloud | TD-17 LOCKED | Year 2–3 |
| Referral program | — | Post consumer-panel scale |
| Consumer wallet (full digital) | — | Post-payment rail setup |
| HubSpot / Salesforce CRM integration | PD-03 LOCKED | Enterprise tier |
| Enterprise API | PD-03 LOCKED | Post-scale |
| GCC features | BD-05 LOCKED | After Egypt proven |
| Non-FMCG verticals | BD-07 LOCKED | Not in Years 1–3 |
| Paid consumer subscriptions | PD-03 LOCKED | Not planned |
| E-commerce layer | PD-03 LOCKED | Not planned |
| Permanent kiosk installations | OPS-02 LOCKED | Not planned |
| Owned product logistics | OPS-03 LOCKED | Not planned |

*Source: `15_Decisions/FOUNDER_DECISIONS.md` PD-03, PD-07, BD-07; `08_PRD/MASTER_PRD_v1.0.md`*

---

## SECTION 3 — DO NOT ADD TO THE REPOSITORY

These documentation categories are frozen. No new files of these types should be created during Track 0.

| Document Type | Why Not |
|---|---|
| Architecture constitutions | Premature — belongs in CTO onboarding post-GO |
| Governance frameworks | Overhead for a 1-person company in commercial validation |
| New AI bootstrap files | The bootstrap layer is complete. Freeze it. |
| New navigator index files | The navigation layer is complete. Freeze it. |
| Structured data JSON files | Machine-readable overhead. No current consumer. |
| Quality certifications for documents | Documents are not the product. LOIs are. |
| Sprint retrospectives for Track 0 | Commercial execution logs belong in MEOS, not the workspace |
| Reports about other reports | Self-referential documentation creates no commercial value |

**The workspace should shrink during Track 0, not grow.**

---

## SECTION 4 — DO NOT BUILD ON THE CORPORATE WEBSITE

The Corporate Website is marketing infrastructure only. It acquires leads and presents company information. It is not a software product.

Never place on the website:
- Consumer registration
- Consumer login
- QR scanning
- Post-trial surveys
- Rewards or wallet
- Consumer profile management
- Campaign discovery
- Push notifications
- Brand campaign management
- Consumer intelligence reports
- Any operational function

*Source: `docs/governance/PROJECT_ARCHITECTURE_CONSTITUTION.md` CAD-04; `15_Decisions/FOUNDER_DECISIONS.md` PD-01*

---

## SECTION 5 — GEOGRAPHIC AND SECTOR EXCLUSIONS

| Exclusion | Decision | Trigger to revisit |
|---|---|---|
| Outside Cairo (Year 1) | BD-03, BD-04 LOCKED | Cairo unit economics proven |
| Alexandria, Giza, New Cairo (before Year 2) | BD-04 LOCKED | Cairo proven |
| GCC expansion | BD-05 LOCKED | Egypt proven |
| Healthcare (clinical) | BD-07 LOCKED | Not in Years 1–3 |
| Insurance | BD-07 LOCKED | Not in Years 1–3 |
| Banking | BD-07 LOCKED | Not in Years 1–3 |
| Telecom | BD-07 LOCKED | Not in Years 1–3 |
| Government | BD-07 LOCKED | Not in Years 1–3 |
| Education | BD-07 LOCKED | Not in Years 1–3 |

*Source: `15_Decisions/FOUNDER_DECISIONS.md` BD-03, BD-04, BD-05, BD-07 LOCKED*

---

## THE MOST IMPORTANT SENTENCE ON THIS PAGE

> **"We could also build X"** is never a reason to build X.

Every feature on the postponement list was proposed for a reason. Every reason was evaluated. The decision to postpone was intentional.

An AI that recommends building a postponed feature without explicit Founder authorization is drifting.
