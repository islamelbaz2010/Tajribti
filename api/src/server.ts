import "./lib/asyncSafety"; // must patch Router before any route file registers handlers
import express from "express";
import cors from "cors";
import path from "path";
import consumerAuthRoutes from "./routes/consumerAuth";
import consumerRoutes from "./routes/consumer";
import companyAuthRoutes from "./routes/companyAuth";
import companyRoutes from "./routes/company";
import opsAuthRoutes from "./routes/opsAuth";
import opsRoutes from "./routes/ops";

const app = express();
app.disable("x-powered-by");

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

// Thin static web clients (Public / Consumer / Company / Operations),
// served from the same process for simplicity (no product decision).
const webRoot = path.join(__dirname, "..", "..", "web");
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
app.listen(PORT, () => {
  console.log(`TAJRIBTI Benchmark API listening on http://localhost:${PORT}`);
});
