# TAJRIBTI — PLATFORM ADMIN CONSOLE FORENSIC VERIFICATION

**Date:** 2026-09-20 · **Pass:** READ-ONLY. No code/schema/user/production changes.

## 1. Executive Finding

A Platform Admin console exists **by deliberate design as role-gated sections inside the Operations console** (`/app/ops/`), not as a separate `/app/admin/` application — this is evidenced by an in-code comment recording a prior forensic decision ("added to the existing Operations experience … not a separate admin application", `web/app/ops/index.html` ~line 107). Backend authorization is complete; the UI covers **two of four** admin capabilities (company onboarding, participant-PII gating). Ops-user management and the audit log are **backend-only — no UI**.

## 2. Repository Commit / Branch

`master` @ `f44dc56` (local; release commit `9bc15f0` = `origin/benchmark-current`, deployed). Working tree clean.

## 3. Benchmark Verification

`governance/REFERENCE_PRODUCT_BENCHMARK.md` SHA-256 `648d2031…534a` — unchanged.

## 4. Platform Admin Role Evidence

- `schema.prisma:35–40` — `OpsUser.role String @default("OPERATIONS")`; comment block documents PLATFORM_ADMIN scope.
- `api/src/middleware/auth.ts:61` — `requirePlatformAdmin`: loads `OpsUser` **from DB per request**, rejects unless `role === "PLATFORM_ADMIN"` (role changes take effect immediately; no JWT staleness).
- Migration `20260920055805_founder_innovation` line 163: `UPDATE "OpsUser" SET "role"='PLATFORM_ADMIN' WHERE "role"='OPERATIONS'` — **all OpsUsers existing at migration time were backfilled to PLATFORM_ADMIN** (capability-preserving).

## 5. Platform Admin Backend Evidence (`api/src/routes/ops.ts`)

| Endpoint | Guard | Capability |
|---|---|---|
| `POST /ops/companies` (l.62) | requirePlatformAdmin | company onboarding (+ writes `AccessAuditEvent` COMPANY_CREATE) |
| `GET /ops/campaigns/:id/participants` (l.254) | requirePlatformAdmin | consumer PII (name/phone) — audited PII access |
| `GET/POST /ops/ops-users` (l.351/355) | requirePlatformAdmin | ops-user list + create with role assignment; create writes OPS_USER_CREATE audit |
| `GET /ops/audit-events` (l.379) | requirePlatformAdmin | access audit log |

## 6. Platform Admin UI Evidence (`web/app/ops/index.html`)

- `currentOpsRole` from session (`l.181,244–245`), stored per login.
- `l.326` — `#company-onboard-block` hidden unless `PLATFORM_ADMIN` → **admin UI exists** (Companies tab → "Onboard new company" form).
- `l.570–577` — Participants tab PII gated client-side; backend enforces regardless.
- **No UI found for:** `/ops/ops-users` (ops-user creation/role management) and `/ops/audit-events` (audit log) — grep over the ops page returns no references. These capabilities are API-only.
- No `/app/admin/` surface exists — by design, not omission-of-record.

## 7. Role Assignment Evidence

1. **How PLATFORM_ADMIN is created:** only via `POST /api/ops/ops-users` with `role:"PLATFORM_ADMIN"` — requires an existing PLATFORM_ADMIN JWT. **No self-service promotion exists** (correct — no privilege-escalation path).
2. **Through UI:** no — the ops-users endpoints have no UI (§6).
3. **Seeding:** `api/prisma/seed.ts` creates `ops@tajribti.internal` with no role → schema default `OPERATIONS` when created fresh.
4. **Migration bootstrap:** the innovation migration promotes all pre-existing OpsUsers to PLATFORM_ADMIN.
5. **No self-service role promotion:** intentional — role mutation is admin-gated.

## 8. Operations vs Platform Admin Comparison

| Capability | OPERATIONS | PLATFORM_ADMIN |
|---|---|---|
| Campaign pipeline / lifecycle / readiness / live / issues / QR ops | ✓ | ✓ |
| Study-type requests review | ✓ | ✓ |
| Question change-request apply/reject | ✓ | ✓ |
| Reports / intelligence | ✓ | ✓ |
| Company list (view) | ✓ | ✓ |
| **Company onboarding (create)** | ✗ (403) | ✓ + UI + audit |
| **Participant consumer PII (name/phone)** | ✗ (403) | ✓ + UI + audited |
| **Ops-user management / role assignment** | ✗ (403) | ✓ API only — no UI |
| **Access audit log** | ✗ (403) | ✓ API only — no UI |
| Cross-company visibility | ✓ (global ops visibility — D-1 GLOBAL ratified) | ✓ |

## 9. Production Account Evidence

- Production DB predates the innovation migration (campaigns existed pre-release). Therefore **every OpsUser that existed at deploy time — including the account used for the manual Ops review — was backfilled to PLATFORM_ADMIN** by migration SQL. Repository evidence indicates a PLATFORM_ADMIN account **very likely already exists in production**: the existing ops login.
- **Verification check for the Founder (read-only):** log into `/app/ops/` with the existing ops credentials → open the **Companies** tab → if the "Onboard new company" form is visible, that account IS PLATFORM_ADMIN (the form renders only for that role). If it is hidden, the account is OPERATIONS (e.g. created after migration) and promotion requires an existing PLATFORM_ADMIN calling `POST /api/ops/ops-users` — or a deliberate Founder decision on bootstrap.

## 10. Public Website Innovation Verification

- OFD-17 approved the expanded public surface — **already present** (journey, sectors, sample report, CTA, trust — all observed by Founder).
- The innovation commit's only public-site delta: **5 added study-type pills** (Concept Testing, Pricing Reaction, Advertising/Message, Brand Perception, Segmentation) — catalog alignment (`git diff 45aa571 3086038 -- web/public/index.html` = +5 lines only).
- **Conclusion: the Founder's observation is explained, not a defect** — the public site was already built pre-innovation; the approved innovation delta on it was intentionally small. No missing required change.

## 11. Manual Verification Blockers

- No UI exists to create an ops user or assign a role → first PLATFORM_ADMIN bootstrap can only occur via migration backfill (already applied to pre-existing users) or an existing PLATFORM_ADMIN calling the API.
- If the current ops login proves to be OPERATIONS (onboard form hidden), PLATFORM_ADMIN access requires either an existing admin (check other ops users) or a Founder decision on how to bootstrap — **do not hand-edit the DB without authorization.**

## 12. Exact Remaining Action

1. Founder logs into `/app/ops/` and checks whether the Companies tab shows "Onboard new company" → confirms PLATFORM_ADMIN status of the existing account.
2. Decide whether the two backend-only admin capabilities (ops-user management, audit log) need UI — a product decision, not a defect.

## 13. Founder Decision Required? **YES** (minor)

Whether the ops-integrated admin sections satisfy "Platform Admin Console" (OFD-08) as-is, or whether a dedicated console surface/UI for ops-user management + audit log is wanted. Not blocking release.

## 14. Recommended Next Step

Perform the §9 login check; if PLATFORM_ADMIN is confirmed via backfill, the console is usable today for company onboarding + audited PII; then record the §13 decision. Proceed to B-04 window regardless — none of this blocks it.

---

**CLASSIFICATION: C — PARTIALLY IMPLEMENTED** (backend complete; role-gated admin UI exists inside the Ops console for company onboarding + PII gating; ops-user management and audit log have no UI; no separate console surface — integrated design was a deliberate recorded decision).
