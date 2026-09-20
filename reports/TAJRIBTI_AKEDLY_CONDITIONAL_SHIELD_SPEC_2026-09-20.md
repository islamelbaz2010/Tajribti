# TAJRIBTI — AKEDLY CONDITIONAL SHIELD SPEC (D-6)

**Date:** 2026-09-20 · **Status:** ARCHITECTURE SPECIFIED — no code change required now; current implementation already satisfies the conditional design. Mobile untouched.

## 0. Verified current architecture (V1.2-conformant)

`api/src/lib/akedly.ts` + `api/src/routes/consumerAuth.ts`:
- `AKEDLY_API_KEY` / `AKEDLY_PIPELINE_ID` server-side only; never sent client-side.
- `GET /consumer/auth/otp/challenge` — backend proxies the pipeline challenge.
- Client solves PoW (`SHA256(challenge + ":" + nonce)`) — web via `@akedly/shield` CDN SDK; mobile has a contract-level Dart solver.
- `powSolution` + `turnstileToken` forwarded **verbatim**; server never solves.
- `transactionReqID` stored server-side (`OtpCode.code`); verify = `transactionReqID + OTP`; JWT issued only after backend verify.
- `app.set("trust proxy", 1)` + `x-end-user-ip` forwarding; send/verify rate-limited; fail-closed.
- The challenge response already exposes the provider's requirement signal (test T5: "challenge passthrough exposes a Turnstile-required pipeline to the client").

## 1. Normal path (default)

Challenge → client solves PoW → `{ challengeToken, nonce }` (+ `turnstileToken` only when required) → send → verify → JWT. This is the current path and stays default.

## 2. Conditional path — trigger (grounded, not invented)

The trigger is **provider-driven**, not a self-invented threshold:

1. `challenge.turnstileRequired === true` — Akedly's pipeline itself demands a Turnstile token; client must produce one (web: Shield SDK/Turnstile widget).
2. Elevated PoW difficulty in the challenge beyond the client's practical solve budget — the threshold is **the provider's configured difficulty vs. a measured client solve-time budget**; the exact budget value is a *product decision* recorded here as **open** (default suggestion to be ratified: ~10s on reference hardware — not silently chosen).

No arbitrary risk score is introduced. If Akedly later exposes a richer risk signal, it becomes an additional trigger by the same provider-driven rule.

## 3. Shield invocation & responsibilities

- **Web:** `@akedly/shield` (CDN npm build) — already used for PoW; Turnstile token path activates only when trigger (1) fires.
- **Mobile:** contract-level Dart solver remains; official `akedly_shield` Flutter SDK (GitHub distribution) is adopted **only** when a trigger requires Turnstile/high-difficulty support on mobile — a Phase D concern, out of scope now.
- **Backend:** unchanged proxy; no Shield server component; credentials never leave the backend.

## 4. Failure / timeout / fallback

- Turnstile token absent when required → Akedly rejects → 401 surfaced to client; no local bypass.
- PoW solve timeout → user-visible retry; backend unchanged.
- Akedly 4xx/429 propagate as today (tests T2/T3); fail-closed — no JWT without backend verification.

## 5. Rate limiting / privacy / audit

- Existing per-phone send/verify limits unchanged; challenge endpoint stateless.
- Turnstile token is a proof artifact, not PII; `x-end-user-ip` forwarded per contract.
- No new audit surface required; auth failures already observable via logs.

## 6. Testing

Existing suite already covers: challenge passthrough (T0), full round-trip (T1), 401/429 propagation (T2/T3), verbatim forwarding (T4), Turnstile-required exposure (T5), uniform no-provider behavior (T6). Conditional-path additions when a trigger activates: Turnstile-required e2e, solve-timeout UX.

## 7. Remaining open item

**FOUNDER/PRODUCT DECISION (documented, not guessed):** the client solve-time budget that defines "elevated difficulty" — default suggestion ~10s pending ratification. Until then the only active trigger is `turnstileRequired` (provider-signaled, already wired).
