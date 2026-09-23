import "./lib/asyncSafety"; // must patch Router before any route file registers handlers
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import consumerAuthRoutes from "./routes/consumerAuth";
import consumerRoutes from "./routes/consumer";
import companyAuthRoutes from "./routes/companyAuth";
import companyRoutes from "./routes/company";
import opsAuthRoutes from "./routes/opsAuth";
import opsRoutes from "./routes/ops";
import siteAdminRoutes from "./routes/siteAdmin";
import sitePublicRoutes from "./routes/sitePublic";
import staffAuthRoutes from "./routes/staffAuth";
import { assetLinksHandler } from "./lib/appLinks";
import { INDUSTRY_TAXONOMY } from "./lib/industries";

const app = express();
app.disable("x-powered-by");
// Railway fronts the service with a proxy — trust one hop so req.ip is the
// real end-user address (used for the Akedly x-end-user-ip rate-limit
// dimension), not the proxy's.
app.set("trust proxy", 1);

// Production hardening: when CORS_ORIGIN is configured (comma-separated
// allowlist, e.g. the deployed web app origin), only those origins may make
// cross-origin API calls. Unset keeps the permissive default needed for
// local dev (emulators, file:// webviews). Same-origin static clients are
// unaffected either way.
const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));

// Baseline response headers. No CSP here — the thin web clients use inline
// scripts, so a restrictive policy would break them.
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

// Public-Website media uploads (PLATFORM_ADMIN) carry base64 image data —
// they need a larger JSON body than the global default. Scoped here so the
// rest of the API keeps the standard limit; body-parser skips re-parsing
// once a request body is already consumed.
app.use("/api/ops/site/media", express.json({ limit: "8mb" }));
app.use(express.json());

// `dev` reflects the standard NODE_ENV convention already implied by this
// package's own scripts (dev: ts-node-dev, start: node dist/server.js after
// build). It is read by the Consumer web client only to decide whether to
// render a pilot-testing-only "Change consumer" control (see
// web/app/consumer/index.html); it grants no capability and the endpoint
// itself is unauthenticated and non-privileged either way.
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "tajribti-benchmark-api", dev: process.env.NODE_ENV !== "production" })
);

app.use("/api/consumer/auth", consumerAuthRoutes);
app.use("/api/consumer", consumerRoutes);
app.use("/api/company/auth", companyAuthRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/ops/auth", opsAuthRoutes);
app.use("/api/ops", opsRoutes);
// Public Website content management (Founder direction 2026-09-24):
// PLATFORM_ADMIN writes under /api/ops/site; the public site reads only
// `published` payloads from /api/public/site (drafts never exposed).
app.use("/api/ops/site", siteAdminRoutes);
app.use("/api/public", sitePublicRoutes);
// Unified staff login (Founder 2nd Web Review §19) — single web credential
// check for Company + Operations accounts; the per-surface auth endpoints
// above remain intact for compatibility.
app.use("/api/staff", staffAuthRoutes);

// FD-M7 (2026-09-21): Digital Asset Links for Android App Links —
// /.well-known/assetlinks.json (see src/lib/appLinks.ts).
app.get("/.well-known/assetlinks.json", assetLinksHandler);

// Canonical industry/sub-industry taxonomy (Founder direction 2026-09-21)
// — one source served to every surface that renders the controlled
// Industry → Sub-industry selects. Reference data, not sensitive.
app.get("/api/meta/industries", (_req, res) => res.json(INDUSTRY_TAXONOMY));

// Thin static web clients (Public / Consumer / Company / Operations),
// served from the same process for simplicity (no product decision).
// Candidate list covers both the normal layout (api/dist → ../../web) and
// serverless bundles where the function dir is the deployment root.
const webRoot =
  [
    path.join(__dirname, "..", "..", "web"),
    path.join(__dirname, "..", "..", "..", "web"),
    path.join(__dirname, "..", "web-bundle"),
    path.join(process.cwd(), "web"),
    path.join(process.cwd(), "..", "web"),
    path.join(process.cwd(), "api", "web-bundle"),
  ].find((p) => fs.existsSync(path.join(p, "public"))) ?? path.join(__dirname, "..", "..", "web");
// Unified staff login page — must be registered BEFORE the "/" static mount
// so /login resolves to the page rather than a static-file miss.
app.get("/login", (_req, res) => res.sendFile(path.join(webRoot, "public", "login.html")));
app.use("/app/consumer", express.static(path.join(webRoot, "app", "consumer")));
app.use("/app/company", express.static(path.join(webRoot, "app", "company")));
app.use("/app/ops", express.static(path.join(webRoot, "app", "ops")));
app.use("/", express.static(path.join(webRoot, "public")));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 4000;
// Only listen when run directly (node dist/server.js / ts-node src/server.ts).
// Serverless entries (src/vercel.ts) import `app` without binding a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TAJRIBTI Benchmark API listening on http://localhost:${PORT}`);
  });
}

export default app;
