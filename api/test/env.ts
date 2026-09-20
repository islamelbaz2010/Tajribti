import path from "path";

export const apiRoot = path.join(__dirname, "..");
// Per-test-file database path: node --test runs each test file in its own
// process, and a shared SQLite file locks when two files run concurrently.
// Derived from argv[1] (the test file under execution) so every suite gets
// an isolated fresh migration chain.
const suiteName = path.basename(process.argv[1] ?? "integrity", path.extname(process.argv[1] ?? "")).replace(/[^a-z0-9]/gi, "-");
export const dbPath = path.join(__dirname, `.integrity-test-${suiteName}.db`);

// Must execute before ../src/lib/prisma or ../src/lib/auth are first
// required: PrismaClient captures DATABASE_URL at construction, and
// lib/auth throws at import time without JWT_SECRET. helpers.ts imports
// this module first for exactly that reason — import side effects run
// in order, so these assignments land before any src module loads.
process.env.DATABASE_URL = `file:${dbPath}`;
process.env.JWT_SECRET = "integrity-test-secret";
