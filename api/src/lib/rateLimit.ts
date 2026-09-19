import type { Request, Response, NextFunction } from "express";

// Minimal fixed-window rate limiter for the credential endpoints. In-memory
// state is correct for the current single-replica deployment and needs no
// new dependency. Keys are per-credential (phone/email) so one identity
// cannot be brute-forced or spammed; without a key extractor the client IP
// is used instead.
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(opts: { windowMs: number; max: number; key?: (req: Request) => string | undefined }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    // Bucket key includes this limiter's window/max so different endpoints
    // throttling the same credential (e.g. OTP request vs OTP verify) do
    // not share counters.
    const key = `${opts.windowMs}/${opts.max}:${opts.key?.(req) ?? req.ip ?? "unknown"}`;
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }
    if (entry.count >= opts.max) {
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }
    entry.count++;
    return next();
  };
}
