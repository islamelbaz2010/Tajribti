// O5 Full Monitoring (2026-09-24): database-aware health/readiness — a
// trivial SELECT 1 probe. Same response shape when healthy (ok:true
// preserved for the existing Railway healthcheck); 503 when the DB read
// fails so uptime monitoring catches real outages. No PII, no
// credentials, no expensive queries. Shared by server.ts and tests.
import { Request, Response } from "express";
import { prisma } from "./prisma";

export async function healthHandler(_req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "up", service: "tajribti-benchmark-api", dev: process.env.NODE_ENV !== "production" });
  } catch {
    res.status(503).json({ ok: false, db: "down", service: "tajribti-benchmark-api" });
  }
}
