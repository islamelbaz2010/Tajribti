import jwt from "jsonwebtoken";

// Security hardening: JWT_SECRET must never silently fall back to a known
// default. A hardcoded fallback (formerly "dev-secret") would let anyone
// forge valid Consumer/Company/Operations tokens for a deployment that
// omitted this env var. Fail fast and loudly at startup instead — this is
// a pure operational-safety fix, not a change to the auth model itself.
// The secret value itself is never logged.
const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error(
    "JWT_SECRET environment variable is required and must not be empty. " +
      "Refusing to start with an insecure default signing key."
  );
}
const JWT_SECRET: string = rawSecret;

// Three distinct actor surfaces per Benchmark §4 (CONSUMER / COMPANY /
// TAJRIBTI OPERATIONS). Tokens are scoped and never interchangeable —
// backend authorization is authoritative (Benchmark user-directive §20).
export type ActorKind = "consumer" | "employee" | "ops";

export interface ConsumerClaims {
  kind: "consumer";
  consumerId: string;
}

export interface EmployeeClaims {
  kind: "employee";
  employeeId: string;
  companyId: string;
}

export interface OpsClaims {
  kind: "ops";
  opsUserId: string;
}

export type Claims = ConsumerClaims | EmployeeClaims | OpsClaims;

export function signToken(claims: Claims): string {
  return jwt.sign(claims, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyToken(token: string): Claims | null {
  try {
    return jwt.verify(token, JWT_SECRET) as Claims;
  } catch {
    return null;
  }
}
