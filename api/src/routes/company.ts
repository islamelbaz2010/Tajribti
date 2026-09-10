import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireEmployee, asEmployee } from "../middleware/auth";
import { checkReadiness } from "../lib/readiness";
import {
  getFunnel,
  getSourceBreakdown,
  getPurchaseIntent,
  getSatisfaction,
  getVerbatims,
  getQuestionAggregates,
  classifySample,
} from "../lib/measurement";
import { buildReport } from "../lib/report";

const router = Router();
router.use(requireEmployee);

// Company isolation (Benchmark §10): every campaign/product lookup below is
// scoped to req.claims.companyId. Cross-company access returns 404, not
// leaking existence of another company's resource.
async function loadOwnedCampaign(req: Request, res: Response) {
  const { companyId } = asEmployee(req);
  const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!campaign || campaign.companyId !== companyId) {
    res.status(404).json({ error: "Campaign not found" });
    return null;
  }
  return campaign;
}

// --- Company Profile ---------------------------------------------------
router.get("/profile", async (req, res) => {
  const { companyId } = asEmployee(req);
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  res.json(company);
});

router.patch("/profile", async (req, res) => {
  const { companyId } = asEmployee(req);
  const schema = z.object({ name: z.string().min(1).optional(), industry: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const company = await prisma.company.update({ where: { id: companyId }, data: parsed.data });
  res.json(company);
});

// --- Employees -----------------------------------------------------------
router.get("/employees", async (req, res) => {
  const { companyId } = asEmployee(req);
  const employees = await prisma.employee.findMany({
    where: { companyId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  res.json(employees);
});

router.post("/employees", async (req, res) => {
  const { companyId, role } = asEmployee(req);
  if (role !== "OWNER") return res.status(403).json({ error: "Only an OWNER can add employees" });
  const schema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    const employee = await prisma.employee.create({
      data: { companyId, name: parsed.data.name, email: parsed.data.email, passwordHash, role: "MEMBER" },
    });
    res.status(201).json({ id: employee.id, name: employee.name, email: employee.email, role: employee.role });
  } catch {
    res.status(409).json({ error: "Email already in use" });
  }
});

// --- Product / Assets ------------------------------------------------------
router.get("/products", async (req, res) => {
  const { companyId } = asEmployee(req);
  res.json(await prisma.product.findMany({ where: { companyId } }));
});

router.post("/products", async (req, res) => {
  const { companyId } = asEmployee(req);
  const schema = z.object({ name: z.string().min(1), description: z.string().optional(), imageUrl: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const product = await prisma.product.create({ data: { companyId, ...parsed.data } });
  res.status(201).json(product);
});

// --- Campaigns -------------------------------------------------------------
router.get("/campaigns", async (req, res) => {
  const { companyId } = asEmployee(req);
  const campaigns = await prisma.campaign.findMany({
    where: { companyId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(campaigns);
});

const createCampaignSchema = z.object({
  name: z.string().min(1),
  objective: z.string().min(1),
  productId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  audienceAgeMin: z.number().int().optional(),
  audienceAgeMax: z.number().int().optional(),
  audienceGender: z.string().optional(),
  audienceCity: z.string().optional(),
});

router.post("/campaigns", async (req, res) => {
  const { companyId } = asEmployee(req);
  const parsed = createCampaignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const d = parsed.data;
  const campaign = await prisma.campaign.create({
    data: {
      companyId,
      name: d.name,
      objective: d.objective,
      productId: d.productId,
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate),
      audienceAgeMin: d.audienceAgeMin,
      audienceAgeMax: d.audienceAgeMax,
      audienceGender: d.audienceGender,
      audienceCity: d.audienceCity,
      status: "DRAFT",
    },
  });
  res.status(201).json(campaign);
});

router.get("/campaigns/:id", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  const full = await prisma.campaign.findUnique({
    where: { id: campaign.id },
    include: { product: true, questions: { orderBy: { order: "asc" } }, qrSources: true },
  });
  res.json(full);
});

function assertConfigurable(campaign: { status: string }, res: Response): boolean {
  if (campaign.status !== "DRAFT" && campaign.status !== "READY") {
    res.status(409).json({ error: "Campaign configuration is locked once launched" });
    return false;
  }
  return true;
}

router.patch("/campaigns/:id", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;

  const schema = createCampaignSchema.partial();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const d = parsed.data;
  const updated = await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      ...d,
      startDate: d.startDate ? new Date(d.startDate) : undefined,
      endDate: d.endDate ? new Date(d.endDate) : undefined,
    },
  });
  res.json(updated);
});

// Configure -> Review/Ready is a company-driven step (Benchmark §2.4);
// Launch/Pause/Close remains TAJRIBTI Operations-controlled (§4 OPERATIONS
// "Launch / Pause / Close"; §8 hybrid model).
router.post("/campaigns/:id/submit-for-review", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (campaign.status !== "DRAFT") return res.status(409).json({ error: "Only a DRAFT campaign can be submitted for review" });
  const readiness = await checkReadiness(campaign.id);
  if (!readiness.ready) return res.status(422).json({ error: "Campaign is not ready", readiness });
  const updated = await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "READY" } });
  res.json({ campaign: updated, readiness });
});

router.post("/campaigns/:id/revert-to-draft", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (campaign.status !== "READY") return res.status(409).json({ error: "Only a READY campaign can revert to draft" });
  const updated = await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "DRAFT" } });
  res.json(updated);
});

// --- Journey / Survey questions --------------------------------------------
const questionSchema = z.object({
  stage: z.enum(["ELIGIBILITY", "POST_TRIAL"]),
  type: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE", "TEXT", "RATING_1_5", "PURCHASE_INTENT_1_5"]),
  text: z.string().min(1),
  options: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  order: z.number().int().default(0),
  required: z.boolean().default(true),
});

router.post("/campaigns/:id/questions", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;
  const parsed = questionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const d = parsed.data;
  const question = await prisma.question.create({
    data: {
      campaignId: campaign.id,
      stage: d.stage,
      type: d.type,
      text: d.text,
      options: d.options ? JSON.stringify(d.options) : null,
      order: d.order,
      required: d.required,
    },
  });
  res.status(201).json(question);
});

router.delete("/campaigns/:id/questions/:qid", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;
  await prisma.question.delete({ where: { id: req.params.qid } }).catch(() => null);
  res.status(204).end();
});

// --- QR / Sources ------------------------------------------------------------
const qrSchema = z.object({
  label: z.string().min(1),
  code: z.string().min(3),
  activeFrom: z.string(),
  activeTo: z.string(),
});

router.post("/campaigns/:id/qr-sources", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;
  const parsed = qrSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const d = parsed.data;
  try {
    const source = await prisma.qrSource.create({
      data: {
        campaignId: campaign.id,
        label: d.label,
        code: d.code,
        activeFrom: new Date(d.activeFrom),
        activeTo: new Date(d.activeTo),
      },
    });
    res.status(201).json(source);
  } catch {
    res.status(409).json({ error: "QR/source code already in use" });
  }
});

// --- Live Results (Benchmark §4 COMPANY "Live Results") --------------------
router.get("/campaigns/:id/live", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  const [funnel, sources, purchaseIntent, satisfaction] = await Promise.all([
    getFunnel(campaign.id),
    getSourceBreakdown(campaign.id),
    getPurchaseIntent(campaign.id),
    getSatisfaction(campaign.id),
  ]);
  res.json({ campaignId: campaign.id, status: campaign.status, funnel, sources, purchaseIntent, satisfaction });
});

// --- Insights (Benchmark §4 COMPANY "Insights"; §6 insight model) ----------
router.get("/campaigns/:id/insights", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  const [purchaseIntent, satisfaction, verbatims, questionAggregates, funnel] = await Promise.all([
    getPurchaseIntent(campaign.id),
    getSatisfaction(campaign.id),
    getVerbatims(campaign.id),
    getQuestionAggregates(campaign.id),
    getFunnel(campaign.id),
  ]);
  res.json({
    campaignId: campaign.id,
    evidence: classifySample(funnel.surveyComplete),
    purchaseIntent,
    satisfaction,
    verbatims,
    questionAggregates,
  });
});

// --- Reports (Benchmark §4 COMPANY "Reports") -------------------------------
router.get("/campaigns/:id/report", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  res.json(await buildReport(campaign.id));
});

export default router;
