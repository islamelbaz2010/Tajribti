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

  const opsUser = await prisma.opsUser.findUnique({ where: { email } });
  if (!opsUser) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, opsUser.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ kind: "ops", opsUserId: opsUser.id });
  res.json({ token, opsUser: { id: opsUser.id, name: opsUser.name, email: opsUser.email } });
});

export default router;
