# TAJRIBTI — FOUNDER WEB REVIEW ACCESS PACKAGE

**Date:** 2026-09-21 — read-only access/environment reconciliation.
No code, schema, data, or configuration was modified in this pass.

## 1. Repository Identity

| Item | Value |
|---|---|
| Path | `/Users/ahmed/Documents/Projects/tajribti-benchmark-clean` |
| Branch | `master` → `origin/benchmark-current` |
| HEAD | `027cededca5c5956ed592c7579d4cb9f983048cc` |
| Origin | `https://github.com/islamelbaz2010/Tajribti.git` |
| Benchmark SHA-256 | `648d2031c3148298d0bef5e125dcf27f32f1fb9a30b7c8cc0abaac76bd52534a` |
| AI_BOOTSTRAP | **Does not exist** — no bootstrap file is present in the repository |
| Latest reports | `TAJRIBTI_WEB_READINESS_GATE_2026-09-21.md`, `TAJRIBTI_MOBILE_READINESS_CONTINUATION_2026-09-21.md` |

## 2. Current Review Environment

| Item | Value | Evidence | Status |
|---|---|---|---|
| URL | `http://localhost:4000/` | `api/.env` PORT=4000, README | RUNNING |
| Environment | Local dev server | `npm run dev` (ts-node) | RUNNING |
| Port | 4000 | `lsof` shows node listening; all surfaces HTTP 200 | RUNNING |
| Start command | `cd api && npm install && npm run db:migrate && npm run db:seed && npm run dev` | README | already running |
| Active database | `api/prisma/dev.db` | `.env` `DATABASE_URL="file:./dev.db"` | live |
| Second DB found | `api/prisma/dev-review.db` | exists on disk, **not referenced by .env** | inactive |

All surfaces verified live (HTTP 200): `/` public site, `/app/company/`,
`/app/ops/`, `/app/consumer/`.

Environment classification: **LOCAL** — this is the only configured
environment in the repository. `dev-review.db` is a second, cleaner database
present on disk but not wired; the running server uses `dev.db`. The old
Railway URL (`api-production-266c…`) is the LEGACY deployment — not this
lineage. No staging or current production deployment exists.

## 3. Founder Review Accounts

All credentials below were verified by **live login** against the running
server on 2026-09-21. `AdminReview123!`/`OpsReview123!` are not stored in the
repository (bcrypt hashes only, created manually in `dev.db`); they are
historical credentials confirmed still valid. `OpsPass123!`/`CompanyPass123!`
are repository-defined in `api/prisma/seed.ts`.

| Role | Username | Password | Exists | Login Tested | Review Scope |
|---|---|---|---|---|---|
| Platform Admin | `admin@tajribti.local` | `AdminReview123!` | yes | **PASS** | full ops console incl. PII, ops-user admin, audit |
| Platform Admin (seed) | `ops@tajribti.internal` | `OpsPass123!` | yes | **PASS** | same — seed account promoted to PLATFORM_ADMIN in dev.db |
| Operations | `ops@tajribti.local` | `OpsReview123!` | yes | **PASS** | ops console without admin surfaces |
| Company Admin | `admin@nilefresh.example` | `CompanyPass123!` | yes | **PASS** | Nile Fresh Foods workspace, full company/campaign mgmt |
| Company Admin | `layla@nilefresh.example` | `CompanyPass123!` | yes | **PASS** | ⚠ intended as Member — currently logs in as **COMPANY_ADMIN** |
| Company Member | — | — | **none on live DB** | — | see §9 |
| Operations Manager | — | — | **none anywhere** | — | see §4 |
| Consumer | any phone (e.g. `+201001234567`) | OTP via `devOnlyCode` | n/a | — | `/app/consumer/`; dev returns the code in the request response |

## 4. Operations Manager

| Item | Value | Status |
|---|---|---|
| Role enum | `OPERATIONS_MANAGER` (schema, middleware, routes, tests) | implemented |
| Capabilities | create companies; full Operations scope | implemented + tested |
| Excluded | ops-user management, audit-event admin, participant PII | implemented + tested |
| Review account | none in `dev.db`, `dev-review.db`, or `seed.ts` | **NOT PROVISIONED** |
| Password | — | PASSWORD NOT AVAILABLE |

**Operations Manager review account is not currently provisioned.** The role
is code-verified (98/98 API tests) but the Founder cannot log in as one
without provisioning an account — a data task outside this read-only pass.

## 5. Current Role Matrix

| Role | Scope | Key Permissions | Review Purpose |
|---|---|---|---|
| PLATFORM_ADMIN | global | everything incl. ops-user mgmt, participant PII, audit events, company creation | privileged administration |
| OPERATIONS_MANAGER | global ops | company creation, ops workflows | *(no account)* |
| OPERATIONS | global ops | campaign review, request queues (approve/reject/request-changes), operational control | operational review |
| COMPANY_ADMIN | own company | products, campaigns, questions, QR, media, submit, requests, employees | full workspace mgmt |
| COMPANY_MEMBER | own company | reporting/read-only per FD-WEB-01 | *(no account on live DB)* |
| Consumer | self | discover/QR → OTP → eligibility → trial → survey; activity, profile | consumer journey |

## 6. Login Verification

| Account | Result | Notes |
|---|---|---|
| `admin@tajribti.local` / `AdminReview123!` | PASS | PLATFORM_ADMIN |
| `ops@tajribti.internal` / `OpsPass123!` | PASS | PLATFORM_ADMIN (seed acct, role elevated in dev.db) |
| `ops@tajribti.local` / `OpsReview123!` | PASS | OPERATIONS |
| `admin@nilefresh.example` / `CompanyPass123!` | PASS | COMPANY_ADMIN |
| `layla@nilefresh.example` / `CompanyPass123!` | PASS | COMPANY_ADMIN — **not Member** on live DB |
| OPERATIONS_MANAGER | NOT AVAILABLE | no account exists |
| COMPANY_MEMBER | NOT AVAILABLE | 0 member employees in live dev.db (all 7 are ADMIN) |

## 7. Public Credential Exposure

**PASS.** Scanned all served web surfaces (`web/public`, `web/app/*`) and
mobile for seed usernames, passwords, autofilled credentials, demo
credentials: no matches. Only intentional password-field clearing
(`.value = ''`) and a `mailto:` demo CTA exist. Seed passwords appear solely
in `api/prisma/seed.ts` — intentionally documented local seed credentials,
never served to a browser.

## 8. Review Fixture Readiness

Live `dev.db` contents: 7 employees (all COMPANY_ADMIN), 3 ops users,
~80 campaigns (many ACTIVE), 309 questions, 15 QR sources, 138
participations, 503 answers, audit events, 106 consumers.

Immediately reviewable: company dashboard + campaign config + QR + media,
reports/live results/insights (rich answer data), operations console incl.
request queues, platform admin surfaces, consumer journey end-to-end.

Caveats:
- **Data pollution** — dev.db accumulated test/audit artifacts
  (`AUDIT-*`, `ZZ-*-DELETE-ME`, `Impl-*`, `islam mohamed`, etc.). Reviewable
  but noisy. The cleaner `dev-review.db` exists on disk but is not the
  configured database.
- Seed campaign `seed-campaign-1` is COMPLETED in dev.db (ACTIVE in
  dev-review.db).
- QR demo code `NILE-HIBISCUS-CAIRO-001` is bound to that COMPLETED campaign —
  consumer entry against it will correctly refuse; use an ACTIVE campaign's
  QR source instead.

## 9. Blockers

1. **OPERATIONS_MANAGER has no review account** — Founder cannot manually
   exercise the new role. Code-verified only.
2. **No COMPANY_MEMBER account on the live database** — Layla was promoted
   to ADMIN in dev.db, so the FD-WEB-01 member read-only experience cannot
   be reviewed on the running environment. (A member account exists only in
   the inactive `dev-review.db`.)
3. Data noise in dev.db (cosmetic, not a hard blocker).

Neither blocker prevents starting the review — they limit coverage of two
specific role experiences.

## 10. Founder Ready-to-Use Access Block

```
CURRENT FOUNDER WEB REVIEW URL: http://localhost:4000/
CURRENT ENVIRONMENT:            LOCAL (dev server, already RUNNING)
CURRENT PORT:                   4000

  Public site:    http://localhost:4000/
  Company:        http://localhost:4000/app/company/
  Ops/Admin:      http://localhost:4000/app/ops/
  Consumer:       http://localhost:4000/app/consumer/

PLATFORM ADMIN:     admin@tajribti.local      / AdminReview123!   (verified)
                    ops@tajribti.internal     / OpsPass123!       (verified)
OPERATIONS MANAGER: NOT PROVISIONED — no account exists
OPERATIONS:         ops@tajribti.local        / OpsReview123!     (verified)
COMPANY ADMIN:      admin@nilefresh.example   / CompanyPass123!   (verified)
COMPANY MEMBER:     NOT AVAILABLE on live DB — layla@nilefresh.example
                    currently authenticates as COMPANY_ADMIN
CONSUMER:           any phone; OTP code returned in the request
                    response as devOnlyCode (dev mode — no SMS gateway)
```

## 11. Conclusion

**FOUNDER WEB REVIEW READY** — the local environment is running at
`http://localhost:4000/`, all four existing review accounts authenticate
with their historical credentials, and fixtures support the full review.

With two coverage caveats that do not block starting: **no Operations
Manager account is provisioned** and **no Company Member account exists on
the live database** — those two role experiences are currently provable only
by the API test suite, not by manual login.

## Git State

```
?? TAJRIBTI_FOUNDER_DECISION_REVIEW_WORKBOOK_2026-09-21.xlsx
?? TAJRIBTI_FOUNDER_DECISION_REVIEW_WORKBOOK_AR_2026-09-21.xlsx
?? TAJRIBTI_FOUNDER_DECISION_REVIEW_WORKBOOK_AR_FINAL_2026-09-21.xlsx
?? reports/TAJRIBTI_FOUNDER_WEB_REVIEW_ACCESS_PACKAGE_2026-09-21.md (this report)
```

NO CODE CHANGES · NO COMMIT · NO PUSH · NO DEPLOYMENT
