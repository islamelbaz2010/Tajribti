# TAJRIBTI — Role Capability Matrix

**Date:** 2026-09-20 · **HEAD:** `30d6a98` + this pass's working tree
**Method:** verified against `api/src/routes/*.ts`, `api/src/middleware/auth.ts`, and the test suite — not inferred from UI alone.

## Enforcement model

- **Consumer** — OTP-authenticated (`requireConsumer`), `/api/consumer/*`
- **Company Employee (Member / Admin)** — `requireEmployee`, `/api/company/*`; Admin-gated routes add `requireCompanyAdmin`
- **Operations** — `requireOps`, `/api/ops/*`
- **Platform Admin** — `requireOps` + `requirePlatformAdmin` on privileged routes
- **Public** — static `web/public/index.html` only; every API route requires a token

## Capability matrix

| Capability | Public | Consumer | Co. Member | Co. Admin | Operations | Platform Admin |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| View public site | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| OTP login / QR entry | — | ✓ | — | — | — | — |
| Discover ACTIVE campaigns | — | ✓ (excl. participated) | — | — | — | — |
| Eligibility / redeem / survey | — | ✓ own participation | — | — | — | — |
| Activity (own participations) | — | ✓ | — | — | — | — |
| Profile / panel opt-in | — | ✓ | — | — | — | — |
| View own-company campaigns | — | — | ✓ | ✓ | ✓ all companies | ✓ |
| Create campaign | — | — | ✓ | ✓ | — | — |
| Edit DRAFT/READY campaign config | — | — | ✓ | ✓ | — | — |
| Edit ACTIVE+ campaign | — | — | — (locked; change requests) | — (requests) | applies QCRs | same |
| **Delete campaign** | — | — | — | **✓ DRAFT only, audited** | — | — |
| Submit for review (DRAFT→READY) | — | — | ✓ | ✓ | — | — |
| Manage products / media / questions / QR sources | — | — | ✓ configurable only | ✓ | — | — |
| File study-type request | — | — | ✓ | ✓ | — | — |
| File question-change request | — | — | — | ✓ | — | — |
| Employee management | — | — | — | ✓ (403 for Member) | — | — |
| View reports / live results / insights | — | — | ✓ own company | ✓ | ✓ any campaign | ✓ |
| Launch / pause / close | — | — | — | — | ✓ lifecycle-gated | ✓ |
| Approve/reject study-type requests | — | — | — | — | ✓ | ✓ |
| Apply/reject question-change requests | — | — | — | — | ✓ | ✓ |
| Issues (view/file/resolve) | — | — | — | — | ✓ | ✓ |
| **View participant PII** | — | — | — | — | **—** | **✓ audited (`PARTICIPANTS_PII_VIEW`)** |
| Create companies | — | — | — | — | — | ✓ |
| Ops-user management | — | — | — | — | — | ✓ |
| Access audit log | — | — | — | — | — | ✓ |

## Notable boundaries (verified by tests)

- **Tenant isolation:** cross-company access returns 404 everywhere, including the new `DELETE` and `qr.png` routes — no existence leaks.
- **Member vs Admin:** Members retain full campaign-config capability in DRAFT/READY; Admin-only surface is employee management, question-change requests, and DRAFT delete. This matches the workflow (configuration is collaborative; destructive/privileged acts are Admin).
- **Ops vs Platform Admin:** Operations runs the entire campaign lifecycle but is deliberately denied PII, company creation, ops-user management, and the audit log — separation is API-enforced (403), not just hidden UI.
- **PII:** `GET /api/ops/campaigns/:id/participants` is `requirePlatformAdmin` + writes `PARTICIPANTS_PII_VIEW` to `AccessAuditEvent`.

## Decisions required

- **Campaign delete semantics:** implemented as **DRAFT-only hard delete** of configuration rows (a DRAFT cannot carry consumer evidence; any `Participation` → 409 refuse). Whether the Founder wants a soft-delete/archive concept for later lifecycle states is **DECISION REQUIRED** — no archive semantics were invented.
- **Campaign withdraw (READY→DRAFT):** no reverse transition exists in governance; submitted campaigns can only wait for ops launch or stay READY. **DECISION REQUIRED** if withdrawal is desired.
- **Ops-user deactivation:** `POST /ops-users` creates users; no deactivate route exists. **DECISION REQUIRED** if needed.

Everything else in the matrix is repository-verified behavior.
