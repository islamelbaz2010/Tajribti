# TAJRIBTI — AKEDLY V1.2 COMPATIBILITY AUDIT (CORRECTED)
## OFD-10 · Date: 2026-09-20 · Audited HEAD: 3086038 + corrections
## Supersedes: reports/TAJRIBTI_AKEDLY_FLUTTER_COMPATIBILITY_2026-09-20.md

## 0. Correction to the previous assessment

The earlier report (`TAJRIBTI_AKEDLY_FLUTTER_COMPATIBILITY_2026-09-20.md`) assessed the
`akedly` package on pub.dev (v0.0.4). That package is the **deprecated V1.0 SDK** — per the
official docs sidebar it lives under "Legacy → V1.0 SDKs → Flutter SDK". Its client-side
credential model is exactly what V1.2 forbids, which is why the earlier verdict read
"INCOMPATIBLE". The correct comparison target is the **V1.2 Shield SDK** (`akedly_shield`,
Git dependency) and the published V1.2 proxy contract. This report replaces that verdict.

## 1. Production configuration evidence (read-only)

Railway project `tajribti-pilot` → environment `production` → service `api` variables list
(2026-09-20, masked): `AKEDLY_API_KEY` and `AKEDLY_PIPELINE_ID` are present — the existing
pipeline ("Sample app", V1.2, Active, PoW on, Turnstile off per Track 0 verification) is live.
No production variables were read (values are masked), changed, rotated, or copied.

Related observation (informational): the production service also carries legacy `DEMO_*` and
`JWT_REFRESH_*` variables that **no code in the current repository reads** — inert leftovers
from the old implementation line. Not a defect; noted for a future hygiene decision.

## 2. Official V1.2 contract (docs.akedly.io, fetched 2026-09-20)

The documented V1.2 architecture is exactly:

- `APIKey` + `pipelineID` stay **on the backend**; the client must never embed them.
- The backend exposes a thin proxy: `/auth/akedly/challenge`, `/send`, `/verify` mapping to
  `api.akedly.io/api/v1.2/transactions/{challenge,send,verify}`.
- The **client** solves the PoW challenge (algorithm: `SHA256(challenge + ":" + nonce)`,
  hex digest must start with `difficulty` leading zeros; challenge = 64-char hex) and submits
  `powSolution: {challengeToken, nonce}`.
- Turnstile, when `turnstile.required` is true, is obtained client-side (Web: `getTurnstileToken()`;
  Flutter: `AkedlyTurnstile` widget) and forwarded as `turnstileToken` (2-minute expiry).
- `verify` authenticates by `transactionReqID` + `otp` only.
- Optional per-end-user-IP rate limiting via `x-end-user-ip` header (requires
  `trust proxy` on the backend).

## 3. Current implementation vs the contract

| Contract element | Implementation | Verdict |
|---|---|---|
| Credentials server-side | `api/src/lib/akedly.ts` header comment + env-only access; never serialized | CONFORMANT |
| Challenge proxy | `GET /api/consumer/auth/otp/challenge` → `/transactions/challenge?APIKey&pipelineID` — identical shape to the official Express example | CONFORMANT |
| `challengeRequired`/`challengeToken`/`difficulty` handling | Passthrough of `body.data` verbatim to the client | CONFORMANT |
| PoW algorithm | `mobile/.../akedly_pow.dart`: `hex(SHA256("$challenge:$nonce"))` startsWith `'0'*difficulty` — byte-identical to the published algorithm | CONFORMANT |
| `powSolution` forwarding | `{challengeToken, nonce}` forwarded unchanged on `/transactions/send` | CONFORMANT |
| Turnstile conditional flow | Challenge passthrough exposes `turnstile.required`/`siteKey`; web consumer uses official `@akedly/shield` `getTurnstileToken()`; token forwarded verbatim | CONFORMANT (web) / GAP (mobile — see §5) |
| `x-end-user-ip` | Forwarded from `req.ip`; `app.set("trust proxy", 1)` present in `server.ts` | CONFORMANT |
| Verify | `/transactions/verify` with `{transactionReqID, otp}` only; `transactionReqID` stored server-side in `OtpCode.code`, never accepted from client | CONFORMANT |
| Session trust model | JWT issued only after server-side verify — matches the proxy model (official SDK's client-side `bool` pattern is the legacy/V1.0 style and is NOT used) | CONFORMANT |
| Error propagation | 429 → 429; 5xx → 502; invalid OTP → 401; uniform local-dev challenge response | CONFORMANT |
| Server never solves PoW | `sendOtp` accepts only client-supplied `powSolution`; test T4 asserts verbatim forwarding | CONFORMANT |
| Rate limiting (our own) | 1 send/60s/phone; 10 verify/5min/phone; 30 challenge/5min | CONFORMANT (additional, not conflicting) |

## 4. PoW compatibility — the direct question

The custom Dart solver is **algorithmically identical** to `akedly_shield`'s
`solvePow()`/`solvePowInIsolate()`: same input format, same hash construction, same
leading-hex-zeros check. Interchangeable output — the nonce is just an integer either way.

**Differences vs the official package (non-blocking):**
- Runs synchronously on the UI thread rather than in a Dart Isolate. At the pipeline's
  difficulty (~3; few thousand hashes) this is milliseconds. At high adaptive difficulty it
  could block UI frames — the file's own comment already flags this trade-off.
- No `AkedlyTurnstile` widget — mobile has no Turnstile path at all.

## 5. Findings

| # | Severity | Finding |
|---|---|---|
| A-1 | MEDIUM (latent) | **Mobile has no Turnstile support.** If the production pipeline ever enables `turnstile.required`, Android OTP fails into a generic retryable error (otp_screen.dart handles `challengeRequired` only). Mitigated today: production pipeline has Turnstile OFF (Track 0 evidence). Not fixed — requires either the `akedly_shield` Git dependency or a custom WebView bridge; a dependency/architecture choice that should be a deliberate decision, not an audit-time patch. |
| A-2 | LOW | **PoW runs on the main thread** (documented in code). Safe at current difficulty; `solvePowInIsolate` equivalent would matter only if difficulty is pinned high. |
| A-3 | LOW | **OTP input is hardcoded to 6 digits** in otp_screen.dart; the backend accepts 4–6 per pipeline config. If the pipeline is ever set to 4 or 5 digits the mobile UI cannot submit. |
| A-4 | INFORMATIONAL | Dead ternary in `otp_screen.dart` (`statusCode == 401 ? otpWrong : otpWrong`) — both branches identical; no behavior impact. |
| A-5 | INFORMATIONAL | Prior report conflated the deprecated `akedly` (V1.0) package with the V1.2 Shield SDK. Corrected here. |

## 6. Verdict

**The current implementation is CONFORMANT with the Akedly V1.2 contract.** The backend proxy
matches the official recommended architecture verbatim (credentials server-side, challenge
passthrough, verbatim proof forwarding, transactionReqID-keyed verify). The custom Dart PoW
solver is algorithmically equivalent to `solvePowInIsolate()` output.

**Official `akedly_shield` adoption: OPTIONAL, not required.** Adopt only if/when:
(a) the pipeline enables Turnstile (its `AkedlyTurnstile` widget is the fastest compliant path), or
(b) pipeline difficulty is pinned high enough that main-thread solving hurts UX.
Until then the current implementation is functionally equivalent, already exercised in
production, and carries zero new dependency risk.

**No changes were made to the Akedly implementation in this audit.** No production settings,
pipelines, or credentials were touched.
