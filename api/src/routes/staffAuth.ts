import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/auth";
import { rateLimit } from "../lib/rateLimit";

const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

// Unified staff login (Founder 2nd Web Review §19): ONE web entry point for
// every staff account — Company employees and TAJRIBTI Operations share a
// single credential check. The workspace destination is derived server-side
// from the authenticated account's kind — never from a user-entered role,
// email pattern, or query parameter. Consumers are mobile-only (OTP) and have
// no account in either staff table, so they cannot authenticate here.
// Unknown email and wrong password both return the same 401, in the same
// shape as the per-surface login endpoints this route coexists with.
router.post(
  "/login",
  rateLimit({ windowMs: 5 * 60_000, max: 10, key: (req) => (req.body as { email?: string })?.email }),
  async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { email, password } = parsed.data;

    const employee = await prisma.employee.findUnique({ where: { email } });
    if (employee && !employee.revokedAt && (await bcrypt.compare(password, employee.passwordHash))) {
      const token = signToken({
        kind: "employee",
        employeeId: employee.id,
        companyId: employee.companyId,
      });
      return res.json({
        token,
        kind: "employee",
        name: employee.name,
        email: employee.email,
        role: employee.role,
        workspace: "/app/company",
      });
    }

    const opsUser = await prisma.opsUser.findUnique({ where: { email } });
    if (opsUser && !opsUser.revokedAt && (await bcrypt.compare(password, opsUser.passwordHash))) {
      const token = signToken({ kind: "ops", opsUserId: opsUser.id });
      return res.json({
        token,
        kind: "ops",
        name: opsUser.name,
        email: opsUser.email,
        role: opsUser.role,
        workspace: "/app/ops",
      });
    }

    // O5 Full Monitoring: staff login failure logged — event + surface
    // only, never the email/password/payload. Revoked accounts land here
    // identically to bad credentials (O2 — no existence leak).
    // eslint-disable-next-line no-console
    console.warn("[auth] staff login failed — invalid credentials or revoked access");
    return res.status(401).json({ error: "Invalid credentials" });
  }
);

export default router;
