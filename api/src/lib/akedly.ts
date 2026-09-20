import crypto from "crypto";

// Akedly V1.2 REST integration — backend-only. AKEDLY_API_KEY and
// AKEDLY_PIPELINE_ID are server credentials and must never reach a client.
// The Shield proof-of-work is solved here server-side: the algorithm is part
// of the published V1.2 contract (SHA256(challenge + ":" + nonce) with
// `difficulty` leading hex zeros) and the adaptive difficulty makes the
// server-side cost trivial (base 3 ≈ a few thousand hashes). Turnstile,
// unlike PoW, cannot be satisfied server-side — a pipeline that requires it
// is surfaced as a configuration failure, never silently bypassed.
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

export function solvePow(challenge: string, difficulty: number): number {
  const prefix = "0".repeat(difficulty);
  for (let nonce = 0; nonce < 50_000_000; nonce++) {
    const digest = crypto.createHash("sha256").update(`${challenge}:${nonce}`).digest("hex");
    if (digest.startsWith(prefix)) return nonce;
  }
  throw new Error("PoW solution not found within budget");
}

export type AkedlySendResult =
  | { ok: true; transactionReqID: string; expiresAt: Date }
  | { ok: false; status: number; message: string };

export async function sendOtp(phone: string, endUserIp?: string): Promise<AkedlySendResult> {
  const { APIKey, pipelineID } = credentials();
  const challengeRes = await fetchImpl(
    `${AKEDLY_BASE}/api/v1.2/transactions/challenge?APIKey=${encodeURIComponent(APIKey)}&pipelineID=${encodeURIComponent(pipelineID)}`
  );
  const challengeBody = await challengeRes.json().catch(() => null);
  if (challengeRes.status !== 200 || !challengeBody?.data) {
    return { ok: false, status: 502, message: "OTP provider challenge failed" };
  }
  const challenge = challengeBody.data;
  if (challenge.turnstile?.required) {
    // Cannot be satisfied without a client-side Cloudflare token — the
    // pipeline must disable Turnstile or the clients must integrate a
    // Turnstile widget before production OTP can work.
    return { ok: false, status: 503, message: "OTP provider requires client Turnstile — account configuration required" };
  }
  let powSolution: { challengeToken: string; nonce: number } | undefined;
  if (challenge.challengeRequired && challenge.challenge && challenge.challengeToken) {
    powSolution = {
      challengeToken: challenge.challengeToken,
      nonce: solvePow(challenge.challenge, challenge.difficulty),
    };
  }

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
