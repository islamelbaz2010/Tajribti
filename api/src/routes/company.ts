import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireEmployee, requireCompanyAdmin, asEmployee } from "../middleware/auth";
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
import { STUDY_TEMPLATES, findTemplate } from "../lib/studyTemplates";
import {
  MEDIA_LIMITS,
  createUploadUrl,
  deleteObject,
  isHostedMediaConfigured,
  mediaExtension,
  mediaStorageKey,
  resolveMediaUrls,
  verifyStoredObject,
} from "../lib/media";

const router = Router();
router.use(requireEmployee);

// --- Study Templates (FOUNDER-APPROVED STRATEGIC DIFFERENTIATION — see
// governance/FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md; NOT
// Benchmark-required). Read-only catalog; no company/campaign data. -----
router.get("/study-templates", async (_req, res) => {
  res.json(STUDY_TEMPLATES.map((t) => ({ key: t.key, label: t.label, decision: t.decision, questionCount: t.questions.length })));
});

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

// FOUNDER INNOVATION (OFD-08): employee management is COMPANY_ADMIN-only.
// (Earlier no-gate behavior is superseded only because the Founder has now
// authorized multiple company roles.) New employees default to
// COMPANY_MEMBER; the requester may choose COMPANY_ADMIN explicitly.
router.post("/employees", requireCompanyAdmin, async (req, res) => {
  const { companyId } = asEmployee(req);
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["COMPANY_ADMIN", "COMPANY_MEMBER"]).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    const employee = await prisma.employee.create({
      data: { companyId, name: parsed.data.name, email: parsed.data.email, passwordHash, role: parsed.data.role ?? "COMPANY_MEMBER" },
    });
    res.status(201).json({ id: employee.id, name: employee.name, email: employee.email, role: employee.role });
  } catch {
    res.status(409).json({ error: "Email already in use" });
  }
});

// Role assignment is COMPANY_ADMIN-only and a self-demotion guard prevents
// the last admin locking the company out of its own admin capability.
router.patch("/employees/:eid/role", requireCompanyAdmin, async (req, res) => {
  const { companyId, employeeId } = asEmployee(req);
  const parsed = z.object({ role: z.enum(["COMPANY_ADMIN", "COMPANY_MEMBER"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  if (req.params.eid === employeeId) {
    return res.status(409).json({ error: "You cannot change your own role" });
  }
  const result = await prisma.employee.updateMany({
    where: { id: req.params.eid, companyId },
    data: { role: parsed.data.role },
  });
  if (result.count === 0) return res.status(404).json({ error: "Employee not found" });
  const employee = await prisma.employee.findUnique({ where: { id: req.params.eid }, select: { id: true, name: true, email: true, role: true } });
  res.json(employee);
});

// --- Product / Assets ------------------------------------------------------
router.get("/products", async (req, res) => {
  const { companyId } = asEmployee(req);
  res.json(await prisma.product.findMany({ where: { companyId } }));
});

// OFD-05 fields are optional on both create and update; claims is an array
// of strings persisted as JSON.
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  priceRange: z.string().optional(),
  packSize: z.string().optional(),
  claims: z.array(z.string().min(1)).optional(),
});

router.post("/products", async (req, res) => {
  const { companyId } = asEmployee(req);
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { claims, ...rest } = parsed.data;
  const product = await prisma.product.create({ data: { companyId, ...rest, claims: claims ? JSON.stringify(claims) : null } });
  res.status(201).json(product);
});

router.patch("/products/:pid", async (req, res) => {
  const { companyId } = asEmployee(req);
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const existing = await prisma.product.findUnique({ where: { id: req.params.pid }, select: { companyId: true } });
  if (!existing || existing.companyId !== companyId) return res.status(404).json({ error: "Product not found" });
  const { claims, ...rest } = parsed.data;
  const product = await prisma.product.update({
    where: { id: req.params.pid },
    data: { ...rest, claims: claims ? JSON.stringify(claims) : undefined },
  });
  res.json(product);
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

// studyType: optional tag into the FOUNDER-APPROVED study-template catalog
// (api/src/lib/studyTemplates.ts) — NOT Benchmark-required. Validated
// against the known catalog keys so the field stays meaningful; omitting
// it leaves the campaign identical to the pre-existing Benchmark-only
// product.
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
  studyType: z
    .string()
    .optional()
    .refine((v) => v == null || v === "" || findTemplate(v) != null, { message: "Unknown study type" }),
});

router.post("/campaigns", async (req, res) => {
  const { companyId } = asEmployee(req);
  const parsed = createCampaignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const d = parsed.data;

  // Product → Company ownership (Benchmark §10 company isolation): a
  // campaign may only reference a Product owned by the same Company.
  // Same response for unknown and cross-company ids — matching
  // loadOwnedCampaign's convention of not leaking another tenant's
  // existence.
  if (d.productId) {
    const product = await prisma.product.findUnique({
      where: { id: d.productId },
      select: { companyId: true },
    });
    if (!product || product.companyId !== companyId) {
      return res.status(404).json({ error: "Product not found" });
    }
  }

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
      studyType: d.studyType || undefined,
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
    include: { product: true, questions: { orderBy: { order: "asc" } }, qrSources: true, media: true },
  });
  res.json({ ...full, media: await resolveMediaUrls(full!.media) });
});

function assertConfigurable(campaign: { status: string }, res: Response): boolean {
  if (campaign.status !== "DRAFT" && campaign.status !== "READY") {
    res.status(409).json({ error: "Campaign configuration is locked once launched" });
    return false;
  }
  return true;
}

// FOUNDER-APPROVED — forensic audit 2026-09-15, Decision 1: "Study-Type
// change = WARN + OPERATIONS REVIEW/APPROVAL". Once a campaign has ≥1
// Question row (from any source — a template application or a manually
// authored question), its studyType tag is no longer directly mutable by
// PATCH; the Company must submit a StudyTypeChangeRequest instead (see
// POST .../study-type-requests below), which TAJRIBTI Operations approves
// or rejects. A campaign with zero questions is unaffected — direct
// change remains exactly as before, no request/approval involved.
//
// Also blocks a direct change whenever a PENDING request already exists,
// even if the campaign's question count has since dropped to zero (e.g.
// every question was deleted after the request was filed) — otherwise a
// company could bypass its own pending request through the question-
// count loophole while Operations is still reviewing it (this is the
// "Company modifying the Study Type while a request is pending" case the
// audit brief's concurrency section names explicitly).
async function assertStudyTypeChangeAllowed(campaignId: string, res: Response): Promise<boolean> {
  const [questionCount, pendingRequest] = await Promise.all([
    prisma.question.count({ where: { campaignId } }),
    prisma.studyTypeChangeRequest.findFirst({ where: { campaignId, status: "PENDING" } }),
  ]);
  if (pendingRequest) {
    res.status(409).json({
      error: "A study-type change request is already pending TAJRIBTI Operations review for this campaign.",
      code: "STUDY_TYPE_CHANGE_PENDING",
    });
    return false;
  }
  if (questionCount > 0) {
    res.status(409).json({
      error:
        "This campaign already has configured survey questions. Submit a study-type change request for TAJRIBTI Operations review instead of changing it directly.",
      code: "STUDY_TYPE_CHANGE_REQUIRES_APPROVAL",
    });
    return false;
  }
  return true;
}

router.patch("/campaigns/:id", async (req, res) => {
  const { companyId } = asEmployee(req);
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;

  const schema = createCampaignSchema.partial();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const d = parsed.data;

  // "" is the Company UI's "— custom, no template —" option, normalized
  // to null the same way it already is on campaign creation (see
  // createCampaignSchema's use above) — comparing against the persisted
  // value (also null, never "") this way avoids a false-positive "change"
  // on every save of an unrelated field with studyType left at "".
  if (d.studyType !== undefined) {
    const requestedStudyType = d.studyType === "" ? null : d.studyType;
    if (requestedStudyType !== campaign.studyType) {
      if (!(await assertStudyTypeChangeAllowed(campaign.id, res))) return;
    }
  }

  // Same Product → Company ownership invariant as POST /campaigns above —
  // the PATCH path must not be able to attach another company's product
  // to this campaign either. Rejected before any mutation, with the same
  // non-leaking 404.
  if (d.productId !== undefined) {
    const product = await prisma.product.findUnique({
      where: { id: d.productId },
      select: { companyId: true },
    });
    if (!product || product.companyId !== companyId) {
      return res.status(404).json({ error: "Product not found" });
    }
  }

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

// --- Study-Type Change Requests (forensic audit 2026-09-15, Decision 1) ----
// Read-only-safe select projections below never return requestedBy's or
// reviewedBy's passwordHash — same discipline as every other cross-actor
// projection in this file (e.g. GET /employees above).
const studyTypeRequestSchema = z.object({
  requestedStudyType: z
    .string()
    .refine((v) => v === "" || findTemplate(v) != null, { message: "Unknown study type" }),
});

router.post("/campaigns/:id/study-type-requests", async (req, res) => {
  const { employeeId } = asEmployee(req);
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;

  const parsed = studyTypeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
  }
  const requestedStudyType = parsed.data.requestedStudyType === "" ? null : parsed.data.requestedStudyType;

  if (requestedStudyType === campaign.studyType) {
    return res.status(400).json({ error: "Requested study type is the same as the campaign's current study type" });
  }

  const existingPending = await prisma.studyTypeChangeRequest.findFirst({
    where: { campaignId: campaign.id, status: "PENDING" },
  });
  if (existingPending) {
    return res.status(409).json({
      error: "A study-type change request is already pending TAJRIBTI Operations review for this campaign.",
      request: existingPending,
    });
  }

  const request = await prisma.studyTypeChangeRequest.create({
    data: {
      campaignId: campaign.id,
      currentStudyType: campaign.studyType,
      requestedStudyType,
      requestedById: employeeId,
      status: "PENDING",
    },
  });
  res.status(201).json(request);
});

router.get("/campaigns/:id/study-type-requests", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  const requests = await prisma.studyTypeChangeRequest.findMany({
    where: { campaignId: campaign.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      currentStudyType: true,
      requestedStudyType: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
      rejectionReason: true,
      requestedBy: { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
  });
  res.json(requests);
});

// FOUNDER-APPROVED — Feature A: Evidence Sufficiency Coach (optional
// extension). Company previously had no read-only way to view readiness/
// evidence coverage before attempting submit-for-review (only the
// success/failure response of that action ever returned it). This lets
// Company view the same already-existing checkReadiness() output
// (including the new evidenceCoverage field) proactively, at any time —
// no new business rule, same company-isolation scoping as every other
// route in this file.
router.get("/campaigns/:id/readiness", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  res.json(await checkReadiness(campaign.id));
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

// No "revert to draft" action: Benchmark §2.4 names the Company chain as
// Configure -> Review/Ready -> Launch/Active -> Monitor -> Complete with
// no reverse transition. Inventing an undo action here is the same class
// of over-reach as inferring Resume from Pause (Benchmark §35 caution).

// --- Journey / Survey questions --------------------------------------------
// A SINGLE_CHOICE/MULTI_CHOICE question with no (or fewer than two) options
// is not a data-shape the Consumer app can ever render an answer control
// for — this is not an invented business rule, it is what "choice question"
// already means. Previously `options` was optional for every type, which
// let a choice-type question be created with none; the Consumer survey then
// rendered only the question label with zero selectable controls, silently
// making that question unanswerable while still allowing the survey to be
// submitted and the participation to reach SURVEY_COMPLETE. Rejecting the
// malformed shape at creation time is the smallest fix that closes the
// entire chain (see governance acceptance pass, Survey investigation).
const questionSchema = z
  .object({
    stage: z.enum(["ELIGIBILITY", "POST_TRIAL"]),
    type: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE", "TEXT", "RATING_1_5", "PURCHASE_INTENT_1_5"]),
    text: z.string().min(1),
    options: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
    order: z.number().int().default(0),
    required: z.boolean().default(true),
  })
  .superRefine((d, ctx) => {
    if (d.type === "SINGLE_CHOICE" || d.type === "MULTI_CHOICE") {
      const labeled = (d.options ?? []).filter((o) => o.label.trim().length > 0);
      if (labeled.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "Single/multiple choice questions need at least 2 answer options.",
        });
      }
    }
  });

router.post("/campaigns/:id/questions", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;
  const parsed = questionSchema.safeParse(req.body);
  if (!parsed.success) {
    // Surface the specific validation message (e.g. the choice-options
    // check above) rather than a generic "Invalid input" — the existing
    // Company UI already displays whatever `error` string comes back
    // (web/app/company/index.html's api() throws on data.error), so this
    // is enough for the tester to see exactly what to fix.
    const message = parsed.error.issues[0]?.message || "Invalid input";
    return res.status(400).json({ error: message, details: parsed.error.flatten() });
  }
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
  await auditQuestionChange(req, campaign, "CREATE", null, question, null);
  res.status(201).json(question);
});

router.delete("/campaigns/:id/questions/:qid", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;
  // Company isolation (Benchmark §10 "must preserve" foundation): the
  // delete must be scoped to this campaign, not just any question id —
  // otherwise an employee of Company A could delete a question belonging
  // to Company B's campaign by supplying a campaign id they own alongside
  // a guessed/observed foreign question id.
  const existing = await prisma.question.findFirst({ where: { id: req.params.qid, campaignId: campaign.id } });
  if (!existing) return res.status(404).json({ error: "Question not found" });
  const result = await prisma.question.deleteMany({ where: { id: req.params.qid, campaignId: campaign.id } });
  if (result.count === 0) return res.status(404).json({ error: "Question not found" });
  await auditQuestionChange(req, campaign, "DELETE", existing, null, null);
  res.status(204).end();
});

// FOUNDER-APPROVED STRATEGIC DIFFERENTIATION (see
// governance/FOUNDER_DECISION_STRATEGIC_DIFFERENTIATION.md) — NOT
// Benchmark-required. Bulk-creates a study template's recommended
// questions through the exact same prisma.question.create() shape as the
// single-question POST above; applies the same assertConfigurable() lock.
// Every created question is stored as an ordinary Question row — nothing
// here is a new question mechanism. (The Company console currently has
// no edit/delete UI for any question, generated or manual, despite the
// backend DELETE route existing — see the correction note in the
// founder-decision record. Because of that, this route must not create
// a question a user cannot then remove if they re-apply.)
//
// Two independent duplicate guards, both correctness constraints:
//
// 1. getSatisfaction()/getPurchaseIntent() in measurement.ts average ALL
//    RATING_1_5 / PURCHASE_INTENT_1_5 answers on the campaign together
//    with no per-question breakdown. Every catalog template already
//    contains at most one of each (see studyTemplates.ts), but a company
//    could have already added one manually, or applied another template
//    first — so a template question of either type is skipped, not
//    created, if the campaign already has one.
//
// 2. Discovered in final-acceptance browser testing: re-applying the
//    same (or an overlapping) template a second time created duplicate
//    SINGLE_CHOICE/TEXT questions with identical wording — harmless to
//    any aggregate (each Question row is analyzed independently by id
//    in getQuestionAggregates()/getVerbatims()), but a real defect: with
//    no delete UI, a company had no way to remove the duplicates. Any
//    template question whose exact text already exists on the campaign
//    is now skipped too, regardless of type.
//
// Skipped questions are reported back so the Company UI can show
// exactly what happened.
router.post("/campaigns/:id/questions/apply-template", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;

  const parsed = z.object({ templateKey: z.string() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const template = findTemplate(parsed.data.templateKey);
  if (!template) return res.status(404).json({ error: "Unknown study type" });

  const existing = await prisma.question.findMany({
    where: { campaignId: campaign.id },
    select: { type: true, text: true, order: true },
  });
  const hasType = (t: string) => existing.some((q) => q.type === t);
  const hasText = (t: string) => existing.some((q) => q.text === t);

  const created = [];
  const skipped: string[] = [];
  let order = existing.length ? Math.max(...existing.map((q) => q.order)) + 1 : 0;
  for (const q of template.questions) {
    const measurementConflict = (q.type === "RATING_1_5" && hasType("RATING_1_5")) || (q.type === "PURCHASE_INTENT_1_5" && hasType("PURCHASE_INTENT_1_5"));
    if (measurementConflict || hasText(q.text)) {
      skipped.push(q.text);
      continue;
    }
    const question = await prisma.question.create({
      data: {
        campaignId: campaign.id,
        stage: q.stage,
        type: q.type,
        text: q.text,
        options: q.options ? JSON.stringify(q.options) : null,
        order: order++,
        required: q.required ?? true,
      },
    });
    created.push(question);
    existing.push({ type: q.type, text: q.text, order }); // prevent a repeat within the same template application
    await auditQuestionChange(req, campaign, "CREATE", null, question, null);
  }

  res.status(201).json({ created, skipped });
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

// ===========================================================================
// FOUNDER INNOVATION LAYER (docs/TAJRIBTI_FOUNDER_INNOVATION_SPEC_2026-09-20.md)
// ===========================================================================

// --- OFD-19: question audit trail + change requests --------------------------
// Every question mutation writes a QuestionAuditEvent (what/prev/new/actor/
// campaign/lifecycle-state). Direct edits happen only while the campaign is
// configurable (DRAFT/READY); once locked, a company files a change request
// that Operations performs.
async function auditQuestionChange(
  req: Request,
  campaign: { id: string; status: string },
  action: "CREATE" | "EDIT" | "DELETE",
  prev: { id: string; stage: string; type: string; text: string; options: string | null; order: number; required: boolean } | null,
  next: { id: string; stage: string; type: string; text: string; options: string | null; order: number; required: boolean } | null,
  requestId: string | null
) {
  const { employeeId } = asEmployee(req);
  const actor = await prisma.employee.findUnique({ where: { id: employeeId }, select: { name: true } });
  await prisma.questionAuditEvent.create({
    data: {
      campaignId: campaign.id,
      questionId: (next ?? prev)?.id ?? null,
      action,
      prevValue: prev ? JSON.stringify(prev) : null,
      newValue: next ? JSON.stringify(next) : null,
      actorKind: "employee",
      actorId: employeeId,
      actorName: actor?.name ?? "unknown",
      lifecycleState: campaign.status,
      requestId,
    },
  });
}

router.get("/campaigns/:id/question-audit", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  const events = await prisma.questionAuditEvent.findMany({
    where: { campaignId: campaign.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(events);
});

// Change requests are filed only when the campaign is locked (once a
// campaign is configurable the company edits directly — audited above).
// Filing is COMPANY_ADMIN-only (spec §H–L matrix).
const questionChangeRequestSchema = z.object({
  action: z.enum(["EDIT", "DELETE"]),
  questionId: z.string().min(1),
  payload: z
    .object({
      text: z.string().min(1).optional(),
      options: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
      required: z.boolean().optional(),
      order: z.number().int().optional(),
    })
    .optional(),
  reason: z.string().optional(),
});

router.post("/campaigns/:id/question-change-requests", requireCompanyAdmin, async (req, res) => {
  const { employeeId } = asEmployee(req);
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (campaign.status === "DRAFT" || campaign.status === "READY") {
    return res.status(409).json({ error: "Campaign is still configurable — edit questions directly (edits are audited)." });
  }
  const parsed = questionChangeRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const d = parsed.data;
  const question = await prisma.question.findFirst({ where: { id: d.questionId, campaignId: campaign.id } });
  if (!question) return res.status(404).json({ error: "Question not found" });
  if (d.action === "EDIT" && (!d.payload || Object.keys(d.payload).length === 0)) {
    return res.status(400).json({ error: "EDIT requests require a non-empty payload" });
  }
  const pending = await prisma.questionChangeRequest.findFirst({
    where: { campaignId: campaign.id, questionId: d.questionId, status: "PENDING" },
  });
  if (pending) return res.status(409).json({ error: "A change request for this question is already pending" });
  const request = await prisma.questionChangeRequest.create({
    data: {
      campaignId: campaign.id,
      questionId: d.questionId,
      action: d.action,
      payload: d.payload ? JSON.stringify(d.payload) : null,
      reason: d.reason ?? null,
      requestedById: employeeId,
    },
  });
  res.status(201).json(request);
});

router.get("/campaigns/:id/question-change-requests", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  const requests = await prisma.questionChangeRequest.findMany({
    where: { campaignId: campaign.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, questionId: true, action: true, payload: true, reason: true, status: true,
      reviewNote: true, performedAt: true, createdAt: true,
      requestedBy: { select: { name: true } }, performedBy: { select: { name: true } },
    },
  });
  res.json(requests);
});

// --- OFD-12 + D-5: campaign media — URL-referenced + hosted uploads -------
// URL path is unchanged (OFD-12). Hosted uploads (D-5): private Railway
// Bucket; init creates a PENDING row + signed PUT URL; confirm verifies
// the stored object (content-type + size) then marks READY; reads resolve
// fresh signed GET URLs for HOSTED rows. Fails closed (503) when the
// bucket is not provisioned — URL media is unaffected.
const mediaSchema = z.object({
  kind: z.enum(["PRODUCT_IMAGE", "PACKAGING_IMAGE", "CAMPAIGN_MEDIA", "CREATIVE"]),
  url: z.string().url(),
  caption: z.string().optional(),
});

const uploadInitSchema = z.object({
  kind: z.enum(["PRODUCT_IMAGE", "PACKAGING_IMAGE", "CAMPAIGN_MEDIA", "CREATIVE"]),
  contentType: z.string(),
  sizeBytes: z.number().int().positive(),
  caption: z.string().optional(),
});

router.get("/campaigns/:id/media", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  const media = await prisma.campaignMedia.findMany({ where: { campaignId: campaign.id }, orderBy: { createdAt: "asc" } });
  res.json(await resolveMediaUrls(media));
});

router.post("/campaigns/:id/media", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;
  const parsed = mediaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const count = await prisma.campaignMedia.count({ where: { campaignId: campaign.id } });
  if (count >= MEDIA_LIMITS.maxPerCampaign) return res.status(400).json({ error: "Media limit reached (20 per campaign)" });
  const media = await prisma.campaignMedia.create({ data: { campaignId: campaign.id, ...parsed.data } });
  res.status(201).json(media);
});

// D-5 hosted upload step 1: declare the asset, get a signed PUT URL.
router.post("/campaigns/:id/media/upload-init", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;
  if (!isHostedMediaConfigured()) return res.status(503).json({ error: "Hosted media storage is not provisioned" });
  const parsed = uploadInitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { kind, contentType, sizeBytes, caption } = parsed.data;
  const ext = mediaExtension(contentType);
  if (!ext) return res.status(400).json({ error: "Unsupported media type — JPEG, PNG or WebP only" });
  if (sizeBytes > MEDIA_LIMITS.maxBytes) return res.status(400).json({ error: "File too large — maximum 5 MB" });
  const count = await prisma.campaignMedia.count({ where: { campaignId: campaign.id } });
  if (count >= MEDIA_LIMITS.maxPerCampaign) return res.status(400).json({ error: "Media limit reached (20 per campaign)" });
  const media = await prisma.campaignMedia.create({
    data: { campaignId: campaign.id, kind, caption, url: "", source: "HOSTED", status: "PENDING", contentType, sizeBytes },
  });
  const storageKey = mediaStorageKey(campaign.id, media.id, ext);
  await prisma.campaignMedia.update({ where: { id: media.id }, data: { storageKey } });
  const uploadUrl = await createUploadUrl(storageKey, contentType);
  res.status(201).json({ mediaId: media.id, uploadUrl, storageKey, expiresIn: MEDIA_LIMITS.uploadUrlTtlSeconds });
});

// D-5 hosted upload step 2: confirm the stored object matches the
// declared type+size, then mark the row READY.
router.post("/campaigns/:id/media/:mid/confirm", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  const media = await prisma.campaignMedia.findFirst({ where: { id: req.params.mid, campaignId: campaign.id } });
  if (!media || media.source !== "HOSTED" || !media.storageKey) return res.status(404).json({ error: "Media not found" });
  if (media.status === "READY") return res.json(media);
  const ok = await verifyStoredObject(media.storageKey, media.contentType!, media.sizeBytes!).catch(() => false);
  if (!ok) return res.status(400).json({ error: "Uploaded object missing or does not match declared type/size" });
  res.json(await prisma.campaignMedia.update({ where: { id: media.id }, data: { status: "READY" } }));
});

router.delete("/campaigns/:id/media/:mid", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  if (!assertConfigurable(campaign, res)) return;
  const media = await prisma.campaignMedia.findFirst({ where: { id: req.params.mid, campaignId: campaign.id } });
  if (!media) return res.status(404).json({ error: "Media not found" });
  if (media.source === "HOSTED" && media.storageKey && isHostedMediaConfigured()) {
    await deleteObject(media.storageKey).catch(() => undefined); // row delete proceeds; sweep covers orphans
  }
  await prisma.campaignMedia.delete({ where: { id: media.id } });
  res.status(204).end();
});

// NOTE (forensic audit 2026-09-20): the OFD-14B activation-notification
// request routes were removed — the Founder decision of 2026-09-20 states
// consumers receive NO push notifications, so there is no delivery target
// for a notification workflow. The CampaignNotificationRequest model is left
// dormant in the schema (dropping it would be a destructive migration with
// no product need).

// --- OFD-15B: same-company cross-campaign panel intelligence -----------------
// Aggregates ONLY across this company's campaigns and ONLY consumers who
// explicitly opted into the panel. No PII is returned — counts only. Cells
// below MIN_PANEL_CELL are suppressed (OFD-15 small-cell privacy rule).
const MIN_PANEL_CELL = 5;

router.get("/panel-insights", async (req, res) => {
  const { companyId, employeeId } = asEmployee(req);
  const actor = await prisma.employee.findUnique({ where: { id: employeeId }, select: { name: true } });
  await writeAccessAudit({ actorKind: "employee", actorId: employeeId, actorName: actor?.name ?? "unknown", action: "PANEL_INSIGHTS_VIEW", targetType: "company", targetId: companyId });

  const campaigns = await prisma.campaign.findMany({ where: { companyId }, select: { id: true, name: true, status: true } });
  const campaignIds = campaigns.map((c) => c.id);
  const optedInParticipations = await prisma.participation.findMany({
    where: { campaignId: { in: campaignIds }, consumer: { panelOptIn: true } },
    select: { campaignId: true, consumerId: true, status: true },
  });

  const byConsumer = new Map<string, Set<string>>();
  for (const p of optedInParticipations) {
    if (!byConsumer.has(p.consumerId)) byConsumer.set(p.consumerId, new Set());
    byConsumer.get(p.consumerId)!.add(p.campaignId);
  }
  const repeatConsumers = Array.from(byConsumer.values()).filter((s) => s.size > 1).length;

  const perCampaign = campaigns.map((c) => {
    const rows = optedInParticipations.filter((p) => p.campaignId === c.id);
    const completed = rows.filter((p) => p.status === "SURVEY_COMPLETE").length;
    return {
      campaignId: c.id,
      name: c.name,
      status: c.status,
      optedInParticipants: rows.length < MIN_PANEL_CELL ? { suppressed: true as const, n: rows.length } : rows.length,
      optedInSurveyCompletes: completed < MIN_PANEL_CELL ? { suppressed: true as const, n: completed } : completed,
    };
  });

  res.json({
    companyId,
    derived: true,
    methodology:
      "Counts over opted-in panel consumers only, restricted to this company's campaigns. Aggregates only — no consumer-level data. Cells with n<5 are suppressed (OFD-15 small-cell rule). No cross-company data is ever included.",
    optedInPanelConsumers: byConsumer.size,
    repeatParticipantsAcrossCampaigns: repeatConsumers,
    perCampaign,
  });
});

// --- OFD-06: derived advanced intelligence -----------------------------------
router.get("/campaigns/:id/intelligence", async (req, res) => {
  const campaign = await loadOwnedCampaign(req, res);
  if (!campaign) return;
  res.json(await buildIntelligence(campaign.id));
});

export default router;
