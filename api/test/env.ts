import path from "path";

export const apiRoot = path.join(__dirname, "..");
export const dbPath = path.join(__dirname, ".integrity-test.db");

// Must execute before ../src/lib/prisma or ../src/lib/auth are first
// required: PrismaClient captures DATABASE_URL at construction, and
// lib/auth throws at import time without JWT_SECRET. helpers.ts imports
// this module first for exactly that reason — import side effects run
// in order, so these assignments land before any src module loads.
process.env.DATABASE_URL = `file:${dbPath}`;
process.env.JWT_SECRET = "integrity-test-secret";
