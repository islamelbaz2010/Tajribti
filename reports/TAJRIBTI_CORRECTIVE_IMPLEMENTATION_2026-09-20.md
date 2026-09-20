# TAJRIBTI — CORRECTIVE IMPLEMENTATION
## Post-Innovation Forensic Audit corrections · Date: 2026-09-20
## Base: 3086038 (Founder Innovation commit) → corrective commit recorded in the audit report

All corrections satisfy the corrective-implementation rule: each fixes a defect against an
already-authoritative decision; none require a new Founder product decision, redesign completed
work, change Benchmark behavior, or touch production.

## C-1 — Removed rejected OFD-15C shared-panel surface

**Defect:** `GET /api/ops/panel` + the "Panel" tab in the Operations console implemented a
TAJRIBTI-managed shared opt-in panel (platform-wide aggregate counts). The authoritative
OFD-15 decision set marks 15C **REJECTED** ("Do NOT create a shared TAJRIBTI-managed consumer
panel"). The endpoint leaked no PII (aggregates only), so this is a scope violation, not a
data leak — severity LOW, but rejected scope must not ship.

**Change:**
- `api/src/routes/ops.ts` — removed `GET /panel` and the now-unused `MIN_PANEL_CELL` constant;
  left an audit note in place of the endpoint.
- `web/app/ops/index.html` — removed the Panel tab button, the `tab-panel` card, the
  `loadPanel()` loader, and its dispatch entry; updated the comment.
- `api/test/innovation.test.ts` — replaced the test asserting the endpoint with one asserting
  it returns 404.
- `docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md` — single surgical annotation marking
  the 15C section SUPERSEDED (the spec otherwise described a live endpoint that no longer
  exists; no other content touched).

**Preserved (correctly approved scope):** `Consumer.panelOptIn` + opt-in/out endpoints (15A),
`/company/panel-insights` same-company aggregates with n<5 suppression (15B). No cross-company
or marketplace surface exists anywhere.

## C-2 — Concurrency guard on question-change apply/reject (OFD-19)

**Defect:** `POST /ops/question-change-requests/:id/apply` and `/reject` read-check-then-write:
two concurrent reviewers (or a double click) could both pass the PENDING check and double-apply
an edit/delete or double-write audit events. The study-type flow already solved this with a
conditional `updateMany` — the new code didn't use it.

**Change:** `ops.ts` —
- `apply`: atomic `updateMany` PENDING→"APPLYING" claim before any mutation; on the
  empty-payload path the claim is released back to PENDING. Downstream logic unchanged.
- `reject`: conditional `updateMany` PENDING→REJECTED; returns the fresh row.
- Statuses remain plain strings; "APPLYING" is transient and never persisted on success
  (ends at PERFORMED/REJECTED).

## C-3 — Same guard on notification-request launch/reject (OFD-14)

**Defect:** identical read-check-then-write race on `/notification-requests/:id/launch` and
`/reject` — a double launch could record two launches and double-write the access audit.

**Change:** `ops.ts` — conditional `updateMany` PENDING→LAUNCHED / PENDING→REJECTED flips.
The ACTIVE-campaign check still runs before the claim so a stale request on a non-live
campaign reports the campaign error, not a status error.

## C-4 — Real actor names in privileged audit events (OFD-08 auditability)

**Defect:** `NOTIFICATION_LAUNCH` and `PANEL_INSIGHTS_VIEW` audit rows stored a hardcoded
`actorName` ("ops" / "employee"), weakening the actor attribution OFD-08/OFD-19 require.

**Change:** `ops.ts` launch handler and `company.ts` `/panel-insights` now resolve the
actor's name from the database like every other audit writer.

## Validation after corrections

- `tsc -p tsconfig.json` — exit 0
- `npm test` — **53 tests / 16 suites / 53 pass / 0 fail** (includes the new 404 assertion
  for the removed endpoint)
- `node` syntax check of edited `web/app/ops/index.html` inline script — OK
- Benchmark SHA-256 before and after: `648d2031…534a` — UNCHANGED

## Explicitly NOT changed (by rule)

- PLATFORM_ADMIN / COMPANY_ADMIN backfill: preserves pre-innovation capability exactly;
  re-tiering real users is a Founder governance decision (recorded in the audit report).
- Mobile Turnstile / isolate-PoW: latent gaps requiring a dependency decision (see Akedly
  audit report).
- PDF export: browser print-path remains; a server-side PDF engine is a new-dependency
  decision, not an audit fix.
