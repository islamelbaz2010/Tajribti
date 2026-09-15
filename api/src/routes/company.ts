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
import { STUDY_TEMPLATES, findTemplate } from "../lib/studyTemplates";

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
    select: { id: true, name: true, email: true, createdAt: true },
  });
  res.json(employees);
});

// No role gate on invitation: Benchmark §4 COMPANY names only "Employees"
// as a capability, with no permission tier defined (see schema.prisma
// Employee model comment). Any authenticated employee of this company —
// company-level isolation is what Benchmark §10 actually names — may add
// another employee to it.
router.post("/employees", async (req, res) => {
  const { companyId } = asEmployee(req);
  const schema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    const employee = await prisma.employee.create({
      data: { companyId, name: parsed.data.name, email: parsed.data.email, passwordHash },
    });
    res.status(201).json({ id: employee.id, name: employee.name, email: employee.email });
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
  const result = await prisma.question.deleteMany({ where: { id: req.params.qid, campaignId: campaign.id } });
  if (result.count === 0) return res.status(404).json({ error: "Question not found" });
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

export default router;
