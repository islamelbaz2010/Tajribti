// Vercel serverless entry point (review/preview deployments only — production
// remains the long-running Node service on Railway).
//
// SQLite is bundled read-only inside the deployment; each function instance
// copies the seeded preview database into writable /tmp on cold start and
// points Prisma at it. Preview writes therefore do NOT touch production data
// and are not shared between instances — acceptable for Founder review.
import fs from "fs";
import path from "path";

const TMP_DB = "/tmp/tj-preview.db";

if (!fs.existsSync(TMP_DB)) {
  const candidates = [
    path.join(__dirname, "..", "prisma", "preview.db"),
    path.join(__dirname, "..", "..", "prisma", "preview.db"),
    path.join(process.cwd(), "api", "prisma", "preview.db"),
    path.join(process.cwd(), "prisma", "preview.db"),
  ];
  const src = candidates.find((p) => fs.existsSync(p));
  if (src) fs.copyFileSync(src, TMP_DB);
}

process.env.DATABASE_URL = `file:${TMP_DB}`;
process.env.NODE_ENV = "production";

// require (not import) so DATABASE_URL is set before PrismaClient instantiates.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require("./server").default as import("express").Express;

export default app;
