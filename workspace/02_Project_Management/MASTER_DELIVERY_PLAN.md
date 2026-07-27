# Master Delivery Plan — PMO Execution Package v1.0

**Title:** Master Delivery Plan — PMO Execution Package v1.0 — MVP Delivery  
**Original Filename:** B 5-Tajribti_Master_Delivery_Plan_v1.0.docx  
**Original Location:** inbox/  
**Category:** Planning / Project Management  
**Version:** 1.0  
**Word Count:** ~1,442  
**Keywords:** delivery plan, sprint plan, WBS, backlog, release roadmap, QA, DevOps, risk register, resource plan, operational readiness  

---

## Summary

The PMO Execution Package for Tajribti MVP. Defines work breakdown structure, full product backlog with 20-field specifications for 12 critical-path items, sprint schedule (Sprint 0 + Sprints 1–6 = ~12 weeks), release roadmap, dependency matrix, risk register, resource plan, QA strategy, DevOps plan, security plan, and operational readiness runbooks.

**Total timeline:** ~24 weeks (~6 months) from Sprint 0 start to Production v1.0.

---

## Section 1 — Work Breakdown Structure

### Decomposition Hierarchy

`Programs → Projects → Epics → Features → User Stories → Tasks → Subtasks`

No item below the Feature level exceeds one developer-sprint.

### Epic → Feature Summary (All 22 Features)

| Epic | Features |
|---|---|
| Consumer Authentication | TJ-001 (OTP Login), TJ-002 (Profile Setup) |
| Campaign Engagement | TJ-003 (Discovery), TJ-004 (Push Notification), TJ-005 (QR Redemption) |
| Data Collection | TJ-006 (Post-Trial Survey) |
| Compliance & Privacy | TJ-008 (Consent & Privacy Center) |
| Consumer Retention | TJ-007 (In-App Support), TJ-009 (Rewards Wallet), TJ-010 (Referral), TJ-011 (Communities) |
| Brand Platform | TJ-012 (Onboarding), TJ-013 (Campaign Wizard), TJ-014 (Live Monitoring), TJ-015 (Analytics), TJ-016 (User Management), TJ-017 (Contract/Invoice) |
| Intelligence Layer | TJ-018 (AI Narratives), TJ-019 (Enterprise API) |
| Admin Operations | TJ-020 (Campaign Config), TJ-021 (Fraud Queue), TJ-022 (Support Tickets) |

---

## Section 2 — Product Backlog (Critical Path Items)

### TJ-001 — OTP Registration/Login [P0]

| Field | Detail |
|---|---|
| Epic | Consumer Authentication |
| Priority | P0 — MVP critical path |
| Description | Phone number entry + OTP delivery via SMS; login on subsequent visits |
| Acceptance Criteria | OTP delivered in <30s; 6-digit code; expires in 5 minutes; max 3 retries per hour |
| Dependencies | Auth module, SMS provider (e.g., Twilio, local provider TBD) |
| Security | Rate-limited; OTP not logged; no OTP reuse |
| Performance | <500ms P95 OTP trigger response |
| Definition of Done | Unit + integration tests pass; security scan clear |

### TJ-005 — QR Redemption [P0] *(Highest Technical Risk)*

| Field | Detail |
|---|---|
| Epic | Campaign Engagement |
| Priority | P0 — MVP critical path |
| Risk | R-03: Highest technical risk — concurrent redemption race condition |
| Description | Consumer scans QR at physical location; platform verifies eligibility and issues sample |
| Acceptance Criteria | Idempotent — duplicate scan must NOT issue second sample; fraud flag if consumer redeems same campaign twice; <1s response time |
| Concurrency handling | Optimistic locking on QRCode entity; DB-level unique constraint on (consumer_id, campaign_id) |
| Load test requirement | Must be load-tested before Private Beta gate |
| Dependencies | Campaign module, Fulfillment module, Location services |

### TJ-006 — Post-Trial Survey [P0]

| Field | Detail |
|---|---|
| Epic | Data Collection |
| Description | 3–5 question survey presented immediately after redemption |
| Target completion time | <3 minutes total consumer experience |
| Survey types | Rating scale, multiple choice, NPS, open text (optional) |
| Trigger | Automatic push notification 15 minutes after redemption |
| Data | Linked to consumer_id, campaign_id, redemption_id; never hard-deleted |

### TJ-008 — Consent & Privacy Center [P0]

| Field | Detail |
|---|---|
| Compliance | PDPL (Law No. 151 of 2020) — FDD non-negotiable |
| Features | View all collected personal data; delete account and all data; withdraw consent per data category |
| Deletion | Consumer-initiated; data anonymized (not hard-deleted) within 30 days |
| Audit trail | All consent changes logged in AuditLog entity |

### TJ-013 — Campaign Creation Wizard [P0]

| Field | Detail |
|---|---|
| User | Brand Marketing Manager ("Ahmed" persona) |
| Steps | Product definition → Target segment → Locations → Dates → Survey questions → Budget confirmation → Submit for approval |
| Validation | All required fields before submission; budget sanity check |
| Output | Draft campaign record; triggers Ops review in Admin Portal |

### TJ-015 — Basic Analytics Report + CSV Export [P0]

| Field | Detail |
|---|---|
| Contents | Redemption count, completion rate, demographic breakdown (age/gender/city), survey response aggregates |
| Latency | Report available within 1 hour of campaign close |
| Export | CSV download; all raw response data per brand's own consumers |
| Access control | Brand Admin + Brand Viewer; no cross-brand data access |

---

## Section 3 — Sprint Schedule

| Sprint | Duration | Focus | Key Deliverables |
|---|---|---|---|
| Sprint 0 | 2 weeks | Setup | Legal entity, AWS account, Terraform base, CI/CD, local dev, vendor contracts signed |
| Sprint 1 | 2 weeks | Auth foundation | TJ-001 (OTP Login), TJ-002 (Consumer Profile), TJ-012 (Brand Onboarding) |
| Sprint 2 | 2 weeks | Core engagement | TJ-003 (Discovery), TJ-005 (QR Redemption), TJ-013 (Campaign Wizard) |
| Sprint 3 | 2 weeks | Data collection | TJ-006 (Survey), TJ-004 (Push Notifications), TJ-020 (Admin Campaign Config) |
| Sprint 4 | 2 weeks | Analytics & compliance | TJ-015 (Analytics), TJ-008 (Privacy Center), TJ-014 (Live Monitoring) |
| Sprint 5 | 2 weeks | Hardening | Bug fixes, load testing (QR concurrency), security scan, performance tuning |
| Sprint 6 | 2 weeks | Private Beta prep | TJ-007 (Support), TJ-016 (User Mgmt), TJ-022 (Support Tickets), UAT |

**Critical path:** Sprint 0 legal/infra → Sprint 1 Auth → Sprint 2 Campaign+QR → Sprint 3 Survey+Notification → Sprint 4 Analytics → Hardening → Beta gates → Production

---

## Section 4 — Release Roadmap

| Release | Gate | Content |
|---|---|---|
| Track 0 | Commercial validation sprint GO/NO-GO | No engineering; market validation only |
| MVP (Week 12) | Zero P0/P1 bugs; all critical path tests pass | 22 features across 3 products |
| Private Beta | UAT sign-off; security scan clear | ~5 brand partners, ~500 consumers |
| Public Beta | P0 load tests pass; PDPL sign-off | Expanded brand pipeline |
| Production v1.0 | All exit criteria met | Full public launch, Cairo |

---

## Section 5 — Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | PDPL sign-off delayed | High | Critical | Begin legal review in Sprint 0; do not ship data-heavy MVP without sign-off |
| R-02 | Brand pilots not secured before Beta | High | Critical | CEO/Sales begin brand outreach in Sprint 0 |
| R-03 | QR redemption race condition under load | Medium | High | Optimistic locking + DB unique constraint + mandatory load test in Sprint 5 |
| R-04 | AWS data residency migration mid-build | Medium | High | Finalize Bahrain region in Sprint 0; do not proceed with undefined region |
| R-05 | SMS/OTP provider outage | Medium | Medium | Runbook defined; secondary provider evaluated |
| R-06 | Consumer panel insufficient for brand statistics | Low | High | Minimum panel threshold defined before first brand report is delivered |
| R-07 | Module boundaries wrong — extraction cost | Low | Medium | Module boundary review in Sprint 4; architecture review before Y2 scaling |

---

## Section 6 — Resource Plan

### Year 1 Team (Post-GO)

| Role | Headcount | Type |
|---|---|---|
| CEO | 1 | Full-time |
| CTO | 1 | Full-time |
| Backend Engineer | 2 | Full-time |
| Head of Brand Partnerships (Sales) | 1 | Full-time |
| Ops Manager | 1 | Full-time |
| Field Coordinators | 2 | Full-time |
| Data Lead | 1 | Full-time |
| CFO | 1 | Fractional |
| Legal Counsel | 1 | Fractional |
| **Total** | **~10–12** | |

*Product Manager role: CEO doubles in Year 1 (pending FDD Open Decision confirmation)*

---

## Section 7 — QA Strategy

### Shift-Left Testing

- Unit + integration tests written alongside feature code, not after
- E2E and performance tests target critical path per Master PRD
- Feature not "Done" without Definition of Done testing requirements met

### Bug Severity Matrix

| Severity | Definition | SLA |
|---|---|---|
| P0 | Core loop broken (redemption, survey, authentication) | Fix before any release |
| P1 | Major feature broken but workaround exists | Fix before beta |
| P2 | Non-critical feature degraded | Fix before production |
| P3 | UI/cosmetic issues | Backlog |

### Exit Criteria (Per Release Gate)

- Zero open P0/P1 bugs
- All test types passed for in-scope features
- UAT sign-off (Beta stages)
- Security scan findings triaged (Hardening onward)

---

## Section 8 — Operational Readiness (Runbooks Required Before Private Beta)

| Runbook | Scenario |
|---|---|
| OTP/SMS outage | Fallback steps and consumer communication |
| QR dispute resolution | Field staff handling for already-redeemed complaints |
| Notification-provider outage | WhatsApp/push fallback procedure |
| Manual brand account creation | CS runbook (pre-self-serve) |
| PDPL data-deletion request | Handling and verification procedure |

### Playbooks (Pre-Production)

- P0 incident response: data corruption, security breach, core-loop outage

---

## Related Documents

- [[Master PRD]] → `08_PRD/MASTER_PRD_v1.0.md`
- [[Technical Architecture]] → `09_Technical/TECHNICAL_ARCHITECTURE.md`
- [[Readiness Audit]] → `13_Audits/READINESS_AUDIT.md`
- [[Remediation & Re-Audit]] → `13_Audits/REMEDIATION_REAUDIT.md`
- [[Master Execution Blueprint]] → `01_Project_Overview/PROJECT_OVERVIEW.md`
