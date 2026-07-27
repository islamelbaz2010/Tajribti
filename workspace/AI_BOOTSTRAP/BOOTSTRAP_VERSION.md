# Bootstrap Version Record

**This file tracks every version of the AI Bootstrap Layer.**

---

## Current Version

| Field | Value |
|---|---|
| **Bootstrap Version** | 1.1 |
| **Repository Version** | v4.0 |
| **Generation Date** | 2026-07-27 |
| **Certification Date** | 2026-07-27 |
| **Status** | FROZEN |
| **Total Bootstrap Files** | 21 |

---

## Compatible AI Models

| Model | Compatibility | Notes |
|---|---|---|
| claude-opus-4-8 | ✅ Full | Recommended for deep strategy sessions |
| claude-sonnet-4-6 | ✅ Full | Recommended for standard sessions |
| claude-haiku-4-5 | ✅ Full (minimum load) | Suitable for quick lookups with minimum load |
| gpt-4o | ✅ Full | Compatible |
| gpt-4-turbo | ✅ Full | Compatible |
| Any model with 128K+ context | ✅ Full | For full onboarding load (~60K tokens) |
| Any model with 32K context | ⚠️ Minimum load only | Load files 00, 02, 03, 11 only |

---

## Breaking Changes

**Version 1.1 → (not yet versioned)**  
No breaking changes yet.

**Version 1.0 → 1.1 (certification pass)**

| Change | Impact |
|---|---|
| Added `PROJECT_FINGERPRINT.json` | New — no breaking change |
| Added `TRACEABILITY_INDEX.md` | New — no breaking change |
| Added `AI_SESSION_TEMPLATE.md` | New — no breaking change |
| Added `BOOTSTRAP_VERSION.md` | New — this file |
| Added `BOOTSTRAP_FREEZE_REPORT.md` | New — no breaking change |
| Documented CONFLICT-001 (blocker ID collision) | Clarification — no change to existing files |
| Documented CONFLICT-002 (authority chain position) | Clarification — no change to existing files |

---

## Revision History

| Version | Date | Author | Summary |
|---|---|---|---|
| 1.0 | 2026-07-27 | Chief AI Project Bootstrap Architect | Initial 16-file bootstrap generation. Files 00–15 created from complete repository read. All source documents in inbox/ and all workspace files read before generation. |
| 1.1 | 2026-07-27 | Chief AI Repository Architect | Bootstrap certification pass. Repository re-read in full (including previously unread: READINESS_AUDIT.md, PROJECT_MEMORY.md, EBOS dirs, AI_CONTEXT dir, 18_Archive). Validation completed. 5 new files added: PROJECT_FINGERPRINT.json, TRACEABILITY_INDEX.md, AI_SESSION_TEMPLATE.md, BOOTSTRAP_VERSION.md, BOOTSTRAP_FREEZE_REPORT.md. Known conflicts documented. Status: FROZEN. |

---

## Update Protocol

This bootstrap layer is **read-first, write-never unless officially versioned**.

To update the bootstrap:

1. Identify a specific gap, error, or change in project state
2. Record the proposed change in `BOOTSTRAP_FREEZE_REPORT.md` under "Pending Updates"
3. Create a new bootstrap version entry here
4. Apply the change to the specific file(s)
5. Update `PROJECT_FINGERPRINT.json` with new generation date
6. Update `CHANGELOG.md` with a v4.x entry
7. Re-run the validation checklist in `BOOTSTRAP_FREEZE_REPORT.md`

**Do NOT** edit bootstrap files between versioned updates. If current project state changes (e.g., a blocking item closes), update `02_PROJECT_STATE.md`, `12_AI_CHECKLIST.md`, and `PROJECT_FINGERPRINT.json` only, and mark as a patch update (e.g., v1.1.1).

---

## What Would Trigger a Version Update

| Event | Version bump | Files to update |
|---|---|---|
| Blocking item closed (B-01 through B-04) | Patch (x.x.1) | 02, 03, 04, 05, 12, PROJECT_FINGERPRINT |
| Track 0 GO confirmed | Minor (x.1.x) | 02, 03, 04, 05, 12, PROJECT_FINGERPRINT + BOOTSTRAP_FREEZE_REPORT |
| Track 1 engineering started | Minor (x.1.x) | 02, 04, 05, 12 + many files |
| New founder decision locked | Patch | 03 |
| New risk identified (major) | Patch | (RISK_REGISTER — outside bootstrap) |
| Architecture decision changed | Patch | 03, 08 |
| Product scope changed | Minor | 01, 03, 06, 07, 08 |
| Competitor landscape change | Patch | 06 |

---

## Freeze Status

**Status: FROZEN as of 2026-07-27**

The bootstrap layer is frozen pending a version update trigger (see above). No file in `AI_BOOTSTRAP/` should be modified outside of a versioned update cycle.

Exception: `02_PROJECT_STATE.md` may be updated when blocking items close, with a corresponding patch version bump.
