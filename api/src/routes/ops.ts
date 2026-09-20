import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireOps, requirePlatformAdmin, asOps } from "../middleware/auth";
import { checkReadiness } from "../lib/readiness";
import { buildIntelligence } from "../lib/intelligence";
import { writeAccessAudit } from "../lib/audit";
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
import { STUDY_TEMPLATES } from "../lib/studyTemplates";

const router = Router();
router.use(requireOps);

// Founder-approved strategic differentiation, not Benchmark-required (see
// governance/FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md) — read-only,
// same catalog the Company console reads from GET /company/study-templates.
router.get("/study-templates", async (_req, res) => {
  res.json(STUDY_TEMPLATES.map((t) => ({ key: t.key, label: t.label, decision: t.decision, questionCount: t.questions.length })));
});

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

// FOUNDER INNOVATION (OFD-08): company creation is PLATFORM_ADMIN-only and
// audited. OPERATIONS retains all campaign-pipeline/monitoring capability.
router.post("/companies", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const parsed = createCompanySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const d = parsed.data;
  const passwordHash = await bcrypt.hash(d.employeePassword, 10);
  try {
    // Security hardening: select only safe fields for the response. The
    // previous `include: { employees: true }` returned the full Employee
    // row, including the bcrypt passwordHash, to the calling Ops client.
    // No response should ever carry credential material — this changes
    // only the response shape, not what is created or how it is created.
    const company = await prisma.company.create({
      data: {
        name: d.name,
        industry: d.industry,
        employees: {
          create: { name: d.employeeName, email: d.employeeEmail, passwordHash },
        },
      },
      select: {
        id: true,
        name: true,
        industry: true,
        createdAt: true,
        employees: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      },
    });
    const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
    await writeAccessAudit({ actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown", action: "COMPANY_CREATE", targetType: "company", targetId: company.id });
    res.status(201).json(company);
  } catch {
    res.status(409).json({ error: "Employee email already in use" });
  }
});

// --- Campaign Pipeline (Benchmark §4 OPERATIONS "Campaign Pipeline") -------
// Benchmark §4 OPERATIONS names "Companies" and "Campaign Pipeline" as
// separate nodes, and §13/§14 of the current completion pass require the
// two to be functionally connected — an ops user viewing a company had no
// way to see just that company's campaigns. `companyId` is an additional,
// optional filter alongside the existing `status` one: same pattern, no
// new authorization model, no new business rule.
router.get("/campaigns", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const companyId = typeof req.query.companyId === "string" ? req.query.companyId : undefined;
  const campaigns = await prisma.campaign.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(companyId ? { companyId } : {}),
    },
    include: { company: { select: { name: true } }, product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(campaigns);
});

router.get("/campaigns/:id", async (req, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { company: true, product: true, questions: { orderBy: { order: "asc" } }, qrSources: true, media: true },
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

// --- Study-Type Change Requests (forensic audit 2026-09-15, Decision 1) ----
// "Study-Type change = WARN + OPERATIONS REVIEW/APPROVAL." Read-only
// projections below never return requestedBy's/reviewedBy's passwordHash.
router.get("/study-type-requests", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const requests = await prisma.studyTypeChangeRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      campaign: { select: { id: true, name: true, status: true, company: { select: { name: true } } } },
      requestedBy: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true } },
    },
  });
  res.json(requests);
});

router.post("/study-type-requests/:id/approve", async (req, res) => {
  const { opsUserId } = asOps(req);
  const request = await prisma.studyTypeChangeRequest.findUnique({
    where: { id: req.params.id },
    include: { campaign: true },
  });
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "PENDING") return res.status(409).json({ error: "Request is not pending" });
  if (request.campaign.status !== "DRAFT" && request.campaign.status !== "READY") {
    return res.status(409).json({ error: "Campaign is no longer configurable; this request can no longer be approved" });
  }

  // Concurrency safety: only flip PENDING -> APPROVED, and only apply the
  // campaign.studyType change, if the request is still PENDING at the
  // moment of write — guards two reviewers (or a double click) acting on
  // the same request. No new framework: same "conditional updateMany,
  // check affected count" guard already used by DELETE
  // /questions/:qid above.
  const outcome = await prisma.$transaction(async (tx) => {
    const flipped = await tx.studyTypeChangeRequest.updateMany({
      where: { id: request.id, status: "PENDING" },
      data: { status: "APPROVED", reviewedById: opsUserId, reviewedAt: new Date() },
    });
    if (flipped.count === 0) return null;
    // Preserve existing questions — this only ever changes the campaign's
    // studyType tag, never touches Question rows (no automatic
    // reconciliation/deletion — Decision 1's explicit safety rule).
    const campaign = await tx.campaign.update({
      where: { id: request.campaignId },
      data: { studyType: request.requestedStudyType },
    });
    return campaign;
  });

  if (!outcome) return res.status(409).json({ error: "Request was already reviewed" });
  const updatedRequest = await prisma.studyTypeChangeRequest.findUnique({ where: { id: request.id } });
  res.json({ request: updatedRequest, campaign: outcome });
});

const rejectStudyTypeRequestSchema = z.object({ reason: z.string().min(1) });

router.post("/study-type-requests/:id/reject", async (req, res) => {
  const { opsUserId } = asOps(req);
  const parsed = rejectStudyTypeRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "A rejection reason is required" });

  const request = await prisma.studyTypeChangeRequest.findUnique({ where: { id: req.params.id } });
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "PENDING") return res.status(409).json({ error: "Request is not pending" });

  // Rejecting never touches the Campaign row (studyType/questions both
  // stay exactly as they are), so no campaign-configurability gate is
  // needed here the way approve requires one.
  const flipped = await prisma.studyTypeChangeRequest.updateMany({
    where: { id: request.id, status: "PENDING" },
    data: { status: "REJECTED", reviewedById: opsUserId, reviewedAt: new Date(), rejectionReason: parsed.data.reason },
  });
  if (flipped.count === 0) return res.status(409).json({ error: "Request was already reviewed" });

  const updatedRequest = await prisma.studyTypeChangeRequest.findUnique({ where: { id: request.id } });
  res.json(updatedRequest);
});

// --- Participants (Benchmark §4 OPERATIONS "Participants") -----------------
// FOUNDER INNOVATION (OFD-08): this endpoint returns consumer PII (phone,
// name). Per the Founder decision, consumer-PII access is PLATFORM_ADMIN-only
// and every access writes an AccessAuditEvent. OPERATIONS keeps all non-PII
// monitoring surfaces (live/insights/report/issues).
router.get("/campaigns/:id/participants", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({ actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown", action: "PARTICIPANTS_PII_VIEW", targetType: "campaign", targetId: campaign.id });
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

// ===========================================================================
// FOUNDER INNOVATION LAYER (docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md)
// ===========================================================================

// --- OFD-08: Operations user + role management (PLATFORM_ADMIN only) ---------
const MIN_PANEL_CELL = 5;

router.get("/ops-users", requirePlatformAdmin, async (_req, res) => {
  res.json(await prisma.opsUser.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } }));
});

router.post("/ops-users", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["PLATFORM_ADMIN", "OPERATIONS"]).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    const user = await prisma.opsUser.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: parsed.data.role ?? "OPERATIONS" },
    });
    const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
    await writeAccessAudit({ actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown", action: "OPS_USER_CREATE", targetType: "ops-user", targetId: user.id });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch {
    res.status(409).json({ error: "Email already in use" });
  }
});

// --- OFD-08 access audit log (PLATFORM_ADMIN only) ----------------------------
router.get("/audit-events", requirePlatformAdmin, async (req, res) => {
  const take = Math.min(Number(req.query.take) || 200, 500);
  res.json(await prisma.accessAuditEvent.findMany({ orderBy: { createdAt: "desc" }, take }));
});

// --- OFD-19: question change request queue -----------------------------------
router.get("/question-change-requests", async (_req, res) => {
  const requests = await prisma.questionChangeRequest.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      campaign: { select: { id: true, name: true, status: true, company: { select: { name: true } } } },
      requestedBy: { select: { name: true } },
      performedBy: { select: { name: true } },
    },
  });
  // questionId is nullable (a question may already be gone) and carries no
  // relation — join manually so the reviewer sees the current question state.
  const questionIds = Array.from(new Set(requests.map((r) => r.questionId).filter((q): q is string => !!q)));
  const questions = await prisma.question.findMany({ where: { id: { in: questionIds } } });
  const byId = new Map(questions.map((q) => [q.id, q]));
  res.json(requests.map((r) => ({ ...r, question: r.questionId ? byId.get(r.questionId) ?? null : null })));
});

async function writeQuestionAudit(
  opsUserId: string,
  campaign: { id: string; status: string },
  action: "EDIT" | "DELETE",
  prev: object | null,
  next: object | null,
  requestId: string
) {
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await prisma.questionAuditEvent.create({
    data: {
      campaignId: campaign.id,
      questionId: ((next ?? prev) as { id?: string } | null)?.id ?? null,
      action,
      prevValue: prev ? JSON.stringify(prev) : null,
      newValue: next ? JSON.stringify(next) : null,
      actorKind: "ops",
      actorId: opsUserId,
      actorName: actor?.name ?? "unknown",
      lifecycleState: campaign.status,
      requestId,
    },
  });
}

// Operations performs the change the company requested. EDIT applies only
// the whitelisted fields (text/options/order/required); stage/type are
// immutable to preserve the Benchmark's answer-history contract.
router.post("/question-change-requests/:id/apply", async (req, res) => {
  const { opsUserId } = asOps(req);
  const request = await prisma.questionChangeRequest.findUnique({ where: { id: req.params.id }, include: { campaign: true } });
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "PENDING") return res.status(409).json({ error: `Request already ${request.status}` });
  const question = request.questionId ? await prisma.question.findUnique({ where: { id: request.questionId } }) : null;
  if (!question || question.campaignId !== request.campaignId) {
    await prisma.questionChangeRequest.update({ where: { id: request.id }, data: { status: "REJECTED", reviewNote: "Question no longer exists" } });
    return res.status(404).json({ error: "Question not found — request auto-rejected" });
  }

  if (request.action === "DELETE") {
    const answerCount = await prisma.answer.count({ where: { questionId: question.id } });
    if (answerCount > 0) {
      await prisma.questionChangeRequest.update({
        where: { id: request.id },
        data: { status: "REJECTED", reviewNote: `Cannot delete: ${answerCount} historical answer(s) are attached to this question`, performedById: opsUserId },
      });
      return res.status(409).json({ error: "Question has historical answers; deletion rejected to preserve Benchmark answer-history integrity" });
    }
    await prisma.question.delete({ where: { id: question.id } });
    await writeQuestionAudit(opsUserId, request.campaign, "DELETE", question, null, request.id);
  } else {
    const payload = request.payload ? (JSON.parse(request.payload) as Record<string, unknown>) : {};
    const data: Record<string, unknown> = {};
    if (typeof payload.text === "string") data.text = payload.text;
    if (Array.isArray(payload.options)) data.options = JSON.stringify(payload.options);
    if (typeof payload.order === "number") data.order = payload.order;
    if (typeof payload.required === "boolean") data.required = payload.required;
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Request payload has no applicable fields" });
    }
    const updated = await prisma.question.update({ where: { id: question.id }, data });
    await writeQuestionAudit(opsUserId, request.campaign, "EDIT", question, updated, request.id);
  }

  const done = await prisma.questionChangeRequest.update({
    where: { id: request.id },
    data: { status: "PERFORMED", performedById: opsUserId, performedAt: new Date() },
  });
  res.json(done);
});

router.post("/question-change-requests/:id/reject", async (req, res) => {
  const { opsUserId } = asOps(req);
  const request = await prisma.questionChangeRequest.findUnique({ where: { id: req.params.id } });
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "PENDING") return res.status(409).json({ error: `Request already ${request.status}` });
  const note = typeof req.body?.note === "string" ? req.body.note : null;
  const updated = await prisma.questionChangeRequest.update({
    where: { id: request.id },
    data: { status: "REJECTED", performedById: opsUserId, performedAt: new Date(), reviewNote: note },
  });
  res.json(updated);
});

router.get("/campaigns/:id/question-audit", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  res.json(await prisma.questionAuditEvent.findMany({ where: { campaignId: campaign.id }, orderBy: { createdAt: "desc" } }));
});

// --- OFD-14: activation notification requests ---------------------------------
// Launches are recorded as PENDING_DELIVERY. Actual push transport is a
// separate gate (provider credentials, consumer push tokens — spec §14).
router.get("/notification-requests", async (_req, res) => {
  const requests = await prisma.campaignNotificationRequest.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      campaign: { select: { id: true, name: true, status: true, company: { select: { name: true } } } },
      requestedBy: { select: { name: true } },
      launchedBy: { select: { name: true } },
    },
  });
  res.json(requests);
});

router.post("/notification-requests/:id/launch", async (req, res) => {
  const { opsUserId } = asOps(req);
  const request = await prisma.campaignNotificationRequest.findUnique({ where: { id: req.params.id }, include: { campaign: true } });
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "PENDING") return res.status(409).json({ error: `Request already ${request.status}` });
  if (request.campaign.status !== "ACTIVE") {
    return res.status(409).json({ error: "Campaign is not ACTIVE — launch only once the campaign is live" });
  }
  // Eligible audience = consumers who explicitly opted in to push AND have
  // any participation record for this campaign's company. OFD-14C.
  const optedIn = await prisma.consumer.count({
    where: {
      pushOptIn: true,
      participations: { some: { campaign: { companyId: request.campaign.companyId } } },
    },
  });
  const updated = await prisma.campaignNotificationRequest.update({
    where: { id: request.id },
    data: {
      status: "LAUNCHED",
      deliveryStatus: "PENDING_DELIVERY",
      eligibleCount: optedIn,
      launchedById: opsUserId,
      launchedAt: new Date(),
    },
  });
  await writeAccessAudit({ actorKind: "ops", actorId: opsUserId, actorName: "ops", action: "NOTIFICATION_LAUNCH", targetType: "campaign", targetId: request.campaignId });
  res.json(updated);
});

router.post("/notification-requests/:id/reject", async (req, res) => {
  const { opsUserId } = asOps(req);
  const request = await prisma.campaignNotificationRequest.findUnique({ where: { id: req.params.id } });
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "PENDING") return res.status(409).json({ error: `Request already ${request.status}` });
  const note = typeof req.body?.note === "string" ? req.body.note : null;
  res.json(await prisma.campaignNotificationRequest.update({
    where: { id: request.id },
    data: { status: "REJECTED", reviewNote: note, launchedById: opsUserId },
  }));
});

// --- OFD-15C: TAJRIBTI-managed shared panel (opt-in aggregates only) ----------
router.get("/panel", async (_req, res) => {
  const optedIn = await prisma.consumer.count({ where: { panelOptIn: true } });
  const optedInWithPush = await prisma.consumer.count({ where: { panelOptIn: true, pushOptIn: true } });
  const optInsWithParticipation = await prisma.participation.groupBy({
    by: ["consumerId"],
    where: { consumer: { panelOptIn: true } },
    _count: { _all: true },
  });
  res.json({
    derived: true,
    methodology: "Opted-in panel consumers only (OFD-15C). Aggregate counts — no PII surfaced through this endpoint.",
    optedInPanelSize: optedIn,
    optedInWithPushOptIn: optedInWithPush,
    consumersWithParticipation: optInsWithParticipation.length,
    minCellSuppression: MIN_PANEL_CELL,
  });
});

// --- OFD-06: derived advanced intelligence ------------------------------------
router.get("/campaigns/:id/intelligence", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  res.json(await buildIntelligence(campaign.id));
});

export default router;
