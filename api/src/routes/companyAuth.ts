import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/auth";

const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, password } = parsed.data;

  const employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, employee.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({
    kind: "employee",
    employeeId: employee.id,
    companyId: employee.companyId,
  });
  res.json({
    token,
    employee: { id: employee.id, name: employee.name, email: employee.email, companyId: employee.companyId },
  });
});

export default router;
