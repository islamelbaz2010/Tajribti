import "./env"; // env first — see env.ts
import "../src/lib/asyncSafety"; // patch Router before routes register
import fs from "fs";
import { execSync } from "child_process";
import express from "express";
import { prisma } from "../src/lib/prisma";
import consumerRoutes from "../src/routes/consumer";
import consumerAuthRoutes from "../src/routes/consumerAuth";
import companyAuthRoutes from "../src/routes/companyAuth";
import opsAuthRoutes from "../src/routes/opsAuth";
import opsRoutes from "../src/routes/ops";
import companyRoutes from "../src/routes/company";
import { assetLinksHandler } from "../src/lib/appLinks";
import { signToken } from "../src/lib/auth";
import { apiRoot, dbPath } from "./env";

export { prisma, signToken };

// FD-07a fixture: eligibility now requires a live, unconsumed
// campaign-bound OTP verification (created by POST /otp/verify with a
// campaignId). Tests exercising the eligibility endpoint grant it directly
// at the persistence layer — the end-to-end OTP path itself is covered by
// campaign-otp.test.ts.
export async function grantCampaignVerification(consumerId: string, campaignId: string) {
  return prisma.campaignOtpVerification.create({
    data: {
      consumerId,
      campaignId,
      otpCodeId: "test-fixture",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });
}

export interface ApiCall {
  (path: string, opts?: { method?: string; token?: string; body?: unknown; raw?: boolean }): Promise<{ status: number; body: any; headers?: Record<string, string>; raw?: Buffer }>;
}

export async function startApi(): Promise<{ api: ApiCall; stop: () => Promise<void> }> {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    fs.rmSync(dbPath + suffix, { force: true });
  }
  // Fresh schema per run through the real migration chain — the same
  // migrations the service applies, not a hand-built schema.
  execSync("npx prisma migrate deploy", {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: `file:${dbPath}` },
    stdio: "pipe",
  });

  const app = express();
  app.use(express.json());
  app.use("/api/consumer/auth", consumerAuthRoutes);
  app.use("/api/consumer", consumerRoutes);
  app.use("/api/company/auth", companyAuthRoutes);
  app.use("/api/company", companyRoutes);
  app.use("/api/ops/auth", opsAuthRoutes);
  app.use("/api/ops", opsRoutes);
  app.get("/.well-known/assetlinks.json", assetLinksHandler);
  app.use((_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: "Internal server error" });
  });
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind a port");
  const base = `http://127.0.0.1:${address.port}`;

  const api: ApiCall = async (path, opts = {}) => {
    const res = await fetch(base + path, {
      method: opts.method ?? "GET",
      headers: {
        ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
        ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    if (opts.raw) {
      return {
        status: res.status,
        body: null,
        headers: Object.fromEntries(res.headers.entries()),
        raw: Buffer.from(await res.arrayBuffer()),
      };
    }
    return { status: res.status, body: await res.json().catch(() => null) };
  };

  return { api, stop: () => new Promise<void>((resolve) => server.close(() => resolve())) };
}
