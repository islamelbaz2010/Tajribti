# TAJRIBTI — AKEDLY FLUTTER SDK COMPATIBILITY ASSESSMENT
## OFD-10 · Date: 2026-09-20 · Baseline: 45aa571 · READ-ONLY ASSESSMENT

## 1. Current implementation (repository evidence)

- `api/src/lib/akedly.ts` — backend-only proxy. `AKEDLY_API_KEY`/`AKEDLY_PIPELINE_ID` are
  server credentials that never reach a client.
- Flow: client → `GET /api/consumer/auth/otp/challenge` (proxied) → client solves PoW →
  `POST /otp/request` with `{powSolution:{challengeToken,nonce}, turnstileToken?}` → backend
  forwards proofs verbatim to `POST /api/v1.2/transactions/send` → `transactionReqID` stored
  server-side in `OtpCode.code` → `POST /otp/verify` → `POST /api/v1.2/transactions/verify`
  → local JWT issued.
- Mobile: `mobile/consumer/lib/core/akedly_pow.dart` — minimal SHA-256 PoW solver implementing
  the documented `SHA256(challenge + ":" + nonce)` contract; wired via `api_client.dart` +
  `otp_screen.dart`.
- Production evidence (Track 0, 2026-09-15): `challengeRequired:true`, difficulty 3, Turnstile
  off; no-proof and invalid-proof requests rejected 400; real +20 OTP delivered via WhatsApp;
  verify succeeded. Dev Mode OFF, Bypass PoW OFF.

## 2. Official SDK evidence (first-party sources, fetched 2026-09-20)

Package: `akedly` on pub.dev — publisher `akedly.io`, latest **0.0.4** (~11 months old),
Dart ≥2.12 / Flutter ≥1.17 per changelog.

Documented API surface (pub.dev `AkedlyClient` class page):

- Constructor: `AkedlyClient({required String apiKey, required String pipelineId, Client? httpClient})`
- Methods: `sendOTP(String phoneNumber, String? email) → Future<String>`,
  `verifyOTP(String verificationId, String otp) → Future<bool>`, `dispose()`.
- Description: "simple … OTP verification … abstracting away the complexity of the underlying
  transaction management."

## 3. Compatibility assessment

| Dimension | Finding | Verdict |
|---|---|---|
| API compatibility | SDK exposes only `sendOTP`/`verifyOTP`. **No challenge retrieval, no `powSolution`, no `turnstileToken` parameter anywhere in the documented surface.** | INCOMPATIBLE with a `challengeRequired:true` pipeline |
| Credential model | `apiKey` + `pipelineId` are constructor parameters held **inside the app binary**. Our architecture explicitly keeps them server-side (`akedly.ts` header comment) — shipping them in an APK/IPA is a security regression (key extraction → direct provider calls bypassing our rate limits, throttling, and audit). | SECURITY CONFLICT |
| PoW / security behavior | No PoW surface documented. Production currently rejects proof-less sends with 400 — adopting the SDK as-written would fail live, or would force disabling pipeline PoW (a security downgrade). | BLOCKING |
| Trust model | SDK's `verifyOTP` returns a client-side `bool`. Our model keeps `transactionReqID` server-side and issues the JWT only after server-side verify — the SDK's trust model cannot drive our session issuance without re-architecting auth. | ARCHITECTURE CONFLICT |
| Channel model | SDK documented as "WhatsApp OTP". Our pipeline uses Smart Routing (WhatsApp priority + SMS fallback). The generic transactions API behind our proxy supports that routing; the SDK surface may not expose it. | UNCERTAIN — likely narrower |
| Flutter/Dart compat | Dart ≥2.12 / Flutter ≥1.17 vs current Flutter 3.44.8 — compatible on paper. | COMPATIBLE |
| Build/CI impact | Would add a dependency; CI `flutter pub get` handles it — but pointless given above. | N/A |
| Migration complexity | High — replaces proxy flow, restructures auth trust, ships secrets client-side. | HIGH |
| Regression risk | Severe: live OTP would break (PoW absent) and the credential model weakens. | SEVERE |
| Maturity | 0.0.x, ~11 months since last publish, minimal API surface. | EARLY |

## 4. Recommendation (evidence-based)

**DO NOT ADOPT the official `akedly` Flutter SDK (v0.0.4) for the current implementation.**

The current backend-proxy + client-PoW architecture is the correct implementation of the V1.2
contract and is production-verified. The official SDK (a) cannot express PoW proofs,
(b) requires embedding server credentials in the client, and (c) returns client-side trust
decisions incompatible with our server-issued JWT model.

**Revisit trigger:** if Akedly publishes a Shield-compatible Flutter SDK that supports
challenge retrieval + `powSolution` submission AND supports a backend-proxy mode (or
scoped client keys), reassess at that time.

## 5. What remains for final mobile release (unchanged by this verdict)

- Keep `akedly_pow.dart` + proxy endpoints as the mobile auth path.
- Compile-verify on CI (`build-consumer-current.yml`, Flutter 3.44.8).
- Physical-device OTP validation (real number, WhatsApp delivery, verify → JWT).

Evidence sources: pub.dev package page + `AkedlyClient` API docs (fetched 2026-09-20);
`api/src/lib/akedly.ts`; `mobile/consumer/lib/core/akedly_pow.dart`; Track 0 production
verification record.
