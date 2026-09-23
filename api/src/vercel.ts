// Vercel serverless entry point (review/preview deployments only — production
// remains the long-running Node service on Railway).
//
// SQLite is bundled read-only inside the deployment; each function instance
// copies the seeded preview database into writable /tmp on cold start and
// points Prisma at it. Preview writes therefore do NOT touch production data
// and are not shared between instances — acceptable for Founder review.
//
// NOTE: literal-path fs calls below are intentional — Vercel's file tracer
// only bundles files referenced through statically-resolvable expressions.
import fs from "fs";
import path from "path";

const TMP_DB = "/tmp/tj-preview.db";

// Force the Prisma query engine binary into the function bundle.
fs.existsSync(
  path.join(__dirname, "..", "node_modules", ".prisma", "client", "libquery_engine-rhel-openssl-3.0.x.so.node")
);

if (!fs.existsSync(TMP_DB)) {
  const bundled = path.join(__dirname, "..", "prisma", "preview.db");
  const alt = path.join(__dirname, "..", "..", "prisma", "preview.db");
  const src = fs.existsSync(bundled) ? bundled : alt;
  fs.copyFileSync(src, TMP_DB);
}

process.env.DATABASE_URL = `file:${TMP_DB}`;
process.env.NODE_ENV = "production";

// require (not import) so DATABASE_URL is set before PrismaClient instantiates.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require("./server").default as import("express").Express;

export default app;
