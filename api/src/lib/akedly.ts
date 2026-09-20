// Akedly V1.2 REST integration — backend-only proxy. AKEDLY_API_KEY and
// AKEDLY_PIPELINE_ID are server credentials and must never reach a client.
//
// Architecture (per the official V1.2 contract): the Shield PoW challenge is
// a CLIENT-side step. The client fetches the challenge through this proxy,
// solves the proof-of-work itself (official Shield SDKs, or the documented
// SHA256(challenge + ":" + nonce) algorithm), and submits the resulting
// powSolution back here — we forward it to Akedly unchanged. The server
// never solves PoW: doing so would defeat the abuse-deterrence the pipeline
// control exists for. Turnstile, when enabled on a pipeline, likewise
// requires a client-side Cloudflare token — it is surfaced to the client
// via the challenge payload, never bypassed.
const AKEDLY_BASE = "https://api.akedly.io";

type FetchLike = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<{ status: number; json: () => Promise<any> }>;
let fetchImpl: FetchLike = (url, init) => fetch(url, init as never) as never;

// Test seam — the only way to exercise this module without real sends.
export function _setAkedlyFetch(f: FetchLike | null): void {
  fetchImpl = f ?? ((url, init) => fetch(url, init as never) as never);
}

export function isAkedlyEnabled(): boolean {
  return Boolean(process.env.AKEDLY_API_KEY && process.env.AKEDLY_PIPELINE_ID);
}

function credentials(): { APIKey: string; pipelineID: string } {
  return { APIKey: process.env.AKEDLY_API_KEY as string, pipelineID: process.env.AKEDLY_PIPELINE_ID as string };
}

export type AkedlyChallengeResult = { ok: true; data: any } | { ok: false };

export async function getChallenge(): Promise<AkedlyChallengeResult> {
  const { APIKey, pipelineID } = credentials();
  const res = await fetchImpl(
    `${AKEDLY_BASE}/api/v1.2/transactions/challenge?APIKey=${encodeURIComponent(APIKey)}&pipelineID=${encodeURIComponent(pipelineID)}`
  );
  const body = await res.json().catch(() => null);
  if (res.status !== 200 || !body?.data) return { ok: false };
  return { ok: true, data: body.data };
}

export type AkedlySendResult =
  | { ok: true; transactionReqID: string; expiresAt: Date }
  | { ok: false; status: number; message: string };

export async function sendOtp(
  phone: string,
  endUserIp?: string,
  powSolution?: { challengeToken: string; nonce: number },
  turnstileToken?: string
): Promise<AkedlySendResult> {
  const { APIKey, pipelineID } = credentials();
  const sendRes = await fetchImpl(`${AKEDLY_BASE}/api/v1.2/transactions/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(endUserIp ? { "x-end-user-ip": endUserIp } : {}),
    },
    body: JSON.stringify({
      APIKey,
      pipelineID,
      verificationAddress: { phoneNumber: phone },
      ...(powSolution ? { powSolution } : {}),
      ...(turnstileToken ? { turnstileToken } : {}),
    }),
  });
  const sendBody = await sendRes.json().catch(() => null);
  if (sendRes.status === 200 && sendBody?.data?.transactionReqID) {
    return {
      ok: true,
      transactionReqID: sendBody.data.transactionReqID,
      expiresAt: sendBody.data.expiresAt ? new Date(sendBody.data.expiresAt) : new Date(Date.now() + 5 * 60 * 1000),
    };
  }
  const status = sendRes.status === 429 ? 429 : sendRes.status >= 500 ? 502 : sendRes.status;
  return { ok: false, status, message: sendBody?.message ?? "OTP provider send failed" };
}

export type AkedlyVerifyResult = { ok: boolean; status: number };

export async function verifyOtp(transactionReqID: string, otp: string): Promise<AkedlyVerifyResult> {
  const res = await fetchImpl(`${AKEDLY_BASE}/api/v1.2/transactions/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Published V1.2 contract: verify authenticates by transactionReqID + otp.
    body: JSON.stringify({ transactionReqID, otp }),
  });
  const body = await res.json().catch(() => null);
  if (res.status === 200 && body?.data?.verified === true) return { ok: true, status: 200 };
  return { ok: false, status: res.status === 429 ? 429 : 401 };
}
