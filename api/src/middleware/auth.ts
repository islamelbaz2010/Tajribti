import { Request, Response, NextFunction } from "express";
import { verifyToken, Claims, ConsumerClaims, EmployeeClaims, OpsClaims } from "../lib/auth";
import { prisma } from "../lib/prisma";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      claims?: Claims;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "Missing authorization token" });
  const claims = verifyToken(token);
  if (!claims) return res.status(401).json({ error: "Invalid or expired token" });
  req.claims = claims;
  next();
}

export function requireConsumer(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.claims?.kind !== "consumer") {
      return res.status(403).json({ error: "Consumer authentication required" });
    }
    next();
  });
}

export function requireEmployee(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.claims?.kind !== "employee") {
      return res.status(403).json({ error: "Company authentication required" });
    }
    next();
  });
}

export function requireOps(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.claims?.kind !== "ops") {
      return res.status(403).json({ error: "TAJRIBTI Operations authentication required" });
    }
    next();
  });
}

// FOUNDER INNOVATION (OFD-08) — role helpers. Roles live on the DB rows (not
// the JWT) so a role change takes effect on the next request rather than
// waiting for token expiry — important for revocation. Role names are
// Innovation-layer spec (docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md),
// not Benchmark truth.
export async function requirePlatformAdmin(req: Request, res: Response, next: NextFunction) {
  const claims = req.claims as OpsClaims | undefined;
  if (!claims || claims.kind !== "ops") return res.status(403).json({ error: "TAJRIBTI Operations authentication required" });
  const user = await prisma.opsUser.findUnique({ where: { id: claims.opsUserId }, select: { role: true } });
  if (!user || user.role !== "PLATFORM_ADMIN") {
    return res.status(403).json({ error: "Platform Admin role required" });
  }
  next();
}

// Company-role gate: COMPANY_ADMIN only (employee management, change
// requests). COMPANY_MEMBER retains campaign/product/question authoring and
// reporting — see spec §H–L for the minimal matrix.
export async function requireCompanyAdmin(req: Request, res: Response, next: NextFunction) {
  const claims = req.claims as EmployeeClaims | undefined;
  if (!claims || claims.kind !== "employee") {
    return res.status(403).json({ error: "Company authentication required" });
  }
  const employee = await prisma.employee.findUnique({ where: { id: claims.employeeId }, select: { role: true } });
  if (!employee || employee.role !== "COMPANY_ADMIN") {
    return res.status(403).json({ error: "Company Admin role required" });
  }
  next();
}

export function asConsumer(req: Request): ConsumerClaims {
  return req.claims as ConsumerClaims;
}
export function asEmployee(req: Request): EmployeeClaims {
  return req.claims as EmployeeClaims;
}
export function asOps(req: Request): OpsClaims {
  return req.claims as OpsClaims;
}
