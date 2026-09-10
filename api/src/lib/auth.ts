import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

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
  role: "OWNER" | "MEMBER";
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
