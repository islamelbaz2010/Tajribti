import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireOps, asOps } from "../middleware/auth";
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
router.use(requireOps);

async function loadCampaignOrNotFound(req: Request, res: Response) {
  const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return null;
  }
  return campaign;
}

// --- Companies (Benchmark §4 OPERATIONS "Companies") ------------------------
router.get("/companies", async (_req, res) => {
  const companies = await prisma.company.findMany({
    include: { _count: { select: { campaigns: true, employees: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(companies);
});

// Field names are neutral ("employee...", not "owner...") on purpose —
// see schema.prisma Employee model comment: Benchmark defines no
// permission tier, so this is simply the company's first employee.
const createCompanySchema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  employeeName: z.string().min(1),
  employeeEmail: z.string().email(),
  employeePassword: z.string().min(8),
});

router.post("/companies", async (req, res) => {
  const parsed = createCompanySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const d = parsed.data;
  const passwordHash = await bcrypt.hash(d.employeePassword, 10);
  try {
    const company = await prisma.company.create({
      data: {
        name: d.name,
        industry: d.industry,
        employees: {
          create: { name: d.employeeName, email: d.employeeEmail, passwordHash },
        },
      },
      include: { employees: true },
    });
    res.status(201).json(company);
  } catch {
    res.status(409).json({ error: "Employee email already in use" });
  }
});

// --- Campaign Pipeline (Benchmark §4 OPERATIONS "Campaign Pipeline") -------
router.get("/campaigns", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const campaigns = await prisma.campaign.findMany({
    where: status ? { status: status as any } : undefined,
    include: { company: { select: { name: true } }, product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(campaigns);
});

router.get("/campaigns/:id", async (req, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { company: true, product: true, questions: { orderBy: { order: "asc" } }, qrSources: true },
  });
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });
  res.json(campaign);
});

// --- Campaign Configuration / Readiness -------------------------------------
router.get("/campaigns/:id/readiness", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  res.json(await checkReadiness(campaign.id));
});

// --- Launch / Pause / Close (Benchmark §4 OPERATIONS) ------------------------
router.post("/campaigns/:id/launch", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (campaign.status !== "READY") return res.status(409).json({ error: "Only a READY campaign can be launched" });
  const readiness = await checkReadiness(campaign.id);
  if (!readiness.ready) return res.status(422).json({ error: "Campaign is not ready to launch", readiness });
  const updated = await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "ACTIVE" } });
  res.json(updated);
});

router.post("/campaigns/:id/pause", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (campaign.status !== "ACTIVE") return res.status(409).json({ error: "Only an ACTIVE campaign can be paused" });
  const updated = await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "PAUSED" } });
  res.json(updated);
});

// No "resume" action: Benchmark §4 OPERATIONS names exactly
// "Launch / Pause / Close" as the action set. Resume is not named, and
// naming Pause does not itself authorize Resume (Benchmark §35 caution).
// A PAUSED campaign can only be closed — not reactivated — until the
// Benchmark explicitly authorizes a resume action.
router.post("/campaigns/:id/close", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (campaign.status !== "ACTIVE" && campaign.status !== "PAUSED") {
    return res.status(409).json({ error: "Only an ACTIVE or PAUSED campaign can be closed" });
  }
  const updated = await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "COMPLETED" } });
  res.json(updated);
});

// --- Participants (Benchmark §4 OPERATIONS "Participants") -----------------
router.get("/campaigns/:id/participants", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  const participants = await prisma.participation.findMany({
    where: { campaignId: campaign.id },
    include: { consumer: { select: { id: true, phone: true, name: true } }, qrSource: { select: { label: true } } },
    orderBy: { enteredAt: "desc" },
  });
  res.json(participants);
});

// --- Live Monitoring (Benchmark §4 OPERATIONS "Live Monitoring") -----------
router.get("/campaigns/:id/live", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  const [funnel, sources, purchaseIntent, satisfaction] = await Promise.all([
    getFunnel(campaign.id),
    getSourceBreakdown(campaign.id),
    getPurchaseIntent(campaign.id),
    getSatisfaction(campaign.id),
  ]);
  res.json({ campaignId: campaign.id, status: campaign.status, funnel, sources, purchaseIntent, satisfaction });
});

// --- Operational Issues (Benchmark §4 OPERATIONS "Operational Issues") -----
router.get("/campaigns/:id/issues", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  res.json(await prisma.operationalIssue.findMany({ where: { campaignId: campaign.id }, orderBy: { createdAt: "desc" } }));
});

const issueSchema = z.object({ type: z.string().min(1), description: z.string().min(1) });

router.post("/campaigns/:id/issues", async (req, res) => {
  const { opsUserId } = asOps(req);
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  const parsed = issueSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const issue = await prisma.operationalIssue.create({
    data: { campaignId: campaign.id, openedById: opsUserId, type: parsed.data.type, description: parsed.data.description },
  });
  res.status(201).json(issue);
});

router.patch("/issues/:issueId/resolve", async (req, res) => {
  const issue = await prisma.operationalIssue
    .update({ where: { id: req.params.issueId }, data: { status: "RESOLVED", resolvedAt: new Date() } })
    .catch(() => null);
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  res.json(issue);
});

// --- Survey Operations (Benchmark §4 OPERATIONS "Survey Operations") -------
router.get("/campaigns/:id/survey", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  const questions = await prisma.question.findMany({ where: { campaignId: campaign.id }, orderBy: { order: "asc" } });
  const aggregates = await getQuestionAggregates(campaign.id);
  res.json({ questions, aggregates });
});

// --- Insights / Reporting (Benchmark §4 OPERATIONS) -------------------------
router.get("/campaigns/:id/insights", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
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

router.get("/campaigns/:id/report", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  res.json(await buildReport(campaign.id));
});

export default router;
