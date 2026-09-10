import { Request, Response, NextFunction } from "express";
import { verifyToken, Claims, ConsumerClaims, EmployeeClaims, OpsClaims } from "../lib/auth";

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

export function asConsumer(req: Request): ConsumerClaims {
  return req.claims as ConsumerClaims;
}
export function asEmployee(req: Request): EmployeeClaims {
  return req.claims as EmployeeClaims;
}
export function asOps(req: Request): OpsClaims {
  return req.claims as OpsClaims;
}
