import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/auth";
import { rateLimit } from "../lib/rateLimit";

const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post(
  "/login",
  rateLimit({ windowMs: 5 * 60_000, max: 10, key: (req) => (req.body as { email?: string })?.email }),
  async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { email, password } = parsed.data;

    const employee = await prisma.employee.findUnique({ where: { email } });
    // O5 Full Monitoring: staff login failures are logged operationally —
    // event + surface only, never email/password/payload. O2: a revoked
    // account fails identically to bad credentials (no existence leak).
    const fail = () => {
      // eslint-disable-next-line no-console
      console.warn("[auth] company login failed — invalid credentials or revoked access");
      return res.status(401).json({ error: "Invalid credentials" });
    };
    if (!employee || employee.revokedAt) return fail();
    const ok = await bcrypt.compare(password, employee.passwordHash);
    if (!ok) return fail();

    const token = signToken({
      kind: "employee",
      employeeId: employee.id,
      companyId: employee.companyId,
    });
    res.json({
      token,
      employee: { id: employee.id, name: employee.name, email: employee.email, companyId: employee.companyId, role: employee.role },
    });
  }
);

export default router;
