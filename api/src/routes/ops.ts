import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireOps, requirePlatformAdmin, requireOpsManager, asOps } from "../middleware/auth";
import { resolveMediaUrls, isHostedMediaConfigured, deleteObject, MEDIA_LIMITS } from "../lib/media";
import { checkReadiness } from "../lib/readiness";
import { isValidIndustry, isValidSubIndustry } from "../lib/industries";
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
import { STUDY_TEMPLATES, findTemplate, isStudyTypeEligible } from "../lib/studyTemplates";
import { sendQrPng } from "../lib/qr";

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
  subIndustry: z.string().optional(),
  employeeName: z.string().min(1),
  employeeEmail: z.string().email(),
  employeePassword: z.string().min(8),
});

// Founder direction 2026-09-21: Industry/Sub-industry are controlled
// selections — writes must come from the canonical taxonomy
// (src/lib/industries.ts), never free text.
function industryPairValid(industry: string | undefined, subIndustry: string | undefined): boolean {
  if (industry !== undefined && !isValidIndustry(industry)) return false;
  if (subIndustry !== undefined) {
    if (!industry || !isValidSubIndustry(industry, subIndustry)) return false;
  }
  return true;
}

// FOUNDER DECISION FD-WEB-03 (2026-09-21): company creation is authorized
// for OPERATIONS_MANAGER (and PLATFORM_ADMIN as the superset layer) and is
// audited. Plain OPERATIONS retains all campaign-pipeline/monitoring
// capability but cannot create companies.
router.post("/companies", requireOpsManager, async (req, res) => {
  const { opsUserId } = asOps(req);
  const parsed = createCompanySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const d = parsed.data;
  if (!industryPairValid(d.industry, d.subIndustry)) {
    return res.status(400).json({ error: "Industry and sub-industry must be valid selections" });
  }
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
        subIndustry: d.subIndustry,
        employees: {
          create: { name: d.employeeName, email: d.employeeEmail, passwordHash },
        },
      },
      select: {
        id: true,
        name: true,
        industry: true,
        subIndustry: true,
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

// FOUNDER DIRECTION (2026-09-25 consolidated pass): PLATFORM_ADMIN holds
// global platform authority — able to view and, where appropriate, manage
// Company information across the platform. This detail view covers the
// resources the direction names (Employees, Products, Campaigns);
// passwordHash and other credential material are never selected.
router.get("/companies/:id", async (req, res) => {
  const company = await prisma.company.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      industry: true,
      subIndustry: true,
      logoStorageKey: true,
      createdAt: true,
      employees: {
        select: { id: true, name: true, email: true, role: true, revokedAt: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
      products: { select: { id: true, name: true, description: true, createdAt: true }, orderBy: { createdAt: "asc" } },
      campaigns: {
        select: { id: true, name: true, status: true, studyType: true, startDate: true, endDate: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!company) return res.status(404).json({ error: "Company not found" });
  res.json(company);
});

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().optional(),
  subIndustry: z.string().optional(),
});

// FOUNDER DIRECTION (2026-09-25): the same authority that onboards a
// company (FD-WEB-03: OPERATIONS_MANAGER + PLATFORM_ADMIN) maintains its
// identity fields — including Industry/Sub-industry, which the 2026-09-23
// ruling removed from company self-edit and which until now no one could
// correct after creation. Every change is audited with a field-level
// detail string so the Company can identify exactly what changed
// (surfaced via GET /company/audit-events).
router.patch("/companies/:id", requireOpsManager, async (req, res) => {
  const { opsUserId } = asOps(req);
  const parsed = updateCompanySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const d = parsed.data;
  if (!industryPairValid(d.industry, d.subIndustry)) {
    return res.status(400).json({ error: "Industry and sub-industry must be valid selections" });
  }
  // Sub-industry cannot be detached from its industry: a bare subIndustry
  // change is only valid against the stored industry.
  const existing = await prisma.company.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Company not found" });
  if (d.subIndustry !== undefined && d.industry === undefined) {
    if (!existing.industry || !isValidSubIndustry(existing.industry, d.subIndustry)) {
      return res.status(400).json({ error: "Sub-industry must belong to the company's industry" });
    }
  }
  if (d.subIndustry === undefined && existing.subIndustry !== null) {
    // Only clear the stored sub-industry when it is no longer valid under
    // the resulting industry — never on an industry no-op.
    const nextIndustry = d.industry !== undefined ? d.industry : existing.industry;
    if (!nextIndustry || !isValidSubIndustry(nextIndustry, existing.subIndustry)) {
      d.subIndustry = "";
    }
  }
  const updatable: { name?: string; industry?: string | null; subIndustry?: string | null } = {};
  const changes: string[] = [];
  if (d.name !== undefined && d.name !== existing.name) {
    updatable.name = d.name;
    changes.push(`name: "${existing.name}" → "${d.name}"`);
  }
  for (const field of ["industry", "subIndustry"] as const) {
    const next = d[field] === undefined ? undefined : d[field] || null;
    if (next !== undefined && next !== existing[field]) {
      updatable[field] = next;
      changes.push(`${field}: "${existing[field] ?? "—"}" → "${next ?? "—"}"`);
    }
  }
  if (changes.length === 0) return res.json(existing);
  const company = await prisma.company.update({ where: { id: existing.id }, data: updatable });
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops",
    actorId: opsUserId,
    actorName: actor?.name ?? "unknown",
    action: "COMPANY_PROFILE_UPDATED",
    targetType: "company",
    targetId: company.id,
    detail: changes.join("; "),
  });
  res.json(company);
});

// FOUNDER DIRECTION (2026-09-25): PLATFORM_ADMIN may revoke a Company
// employee's access platform-wide — the same revocation-only pattern as
// Founder ruling O2 for ops users and the company-side employee revoke.
// No self-revoke guard is needed (admins are not employees of the
// company); the last-active-admin guard is kept so a company can never be
// locked out of its own admin capability. Audited with the employee's
// identity so the Company can identify who was revoked.
router.post("/companies/:id/employees/:eid/revoke", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const target = await prisma.employee.findFirst({ where: { id: req.params.eid, companyId: req.params.id } });
  if (!target) return res.status(404).json({ error: "Employee not found" });
  if (target.revokedAt) return res.status(409).json({ error: "Access is already revoked" });
  if (target.role === "COMPANY_ADMIN") {
    const otherAdmins = await prisma.employee.count({
      where: { companyId: req.params.id, role: "COMPANY_ADMIN", revokedAt: null, id: { not: target.id } },
    });
    if (otherAdmins === 0) return res.status(409).json({ error: "Cannot revoke the last active Company Admin" });
  }
  await prisma.employee.update({ where: { id: target.id }, data: { revokedAt: new Date() } });
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops",
    actorId: opsUserId,
    actorName: actor?.name ?? "unknown",
    action: "EMPLOYEE_ACCESS_REVOKED",
    targetType: "employee",
    targetId: target.id,
    detail: `Revoked company employee "${target.name}" <${target.email}> (company ${req.params.id})`,
  });
  res.json({ id: target.id, revoked: true });
});

// FOUNDER DECISION B (2026-09-25): PLATFORM_ADMIN may change a company
// employee's role — mirrors the company-side PATCH /employees/:eid/role
// (same enum, same last-active-admin protection so a company can never
// be left without admin capability). No self-guard needed: the actor is
// an ops user, not an employee of the company.
router.patch("/companies/:id/employees/:eid/role", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const parsed = z.object({ role: z.enum(["COMPANY_ADMIN", "COMPANY_MEMBER"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const target = await prisma.employee.findFirst({ where: { id: req.params.eid, companyId: req.params.id } });
  if (!target) return res.status(404).json({ error: "Employee not found" });
  if (target.role === parsed.data.role) return res.json({ id: target.id, role: target.role });
  if (target.role === "COMPANY_ADMIN" && !target.revokedAt) {
    const otherAdmins = await prisma.employee.count({
      where: { companyId: req.params.id, role: "COMPANY_ADMIN", revokedAt: null, id: { not: target.id } },
    });
    if (otherAdmins === 0) return res.status(409).json({ error: "Cannot demote the last active Company Admin" });
  }
  await prisma.employee.update({ where: { id: target.id }, data: { role: parsed.data.role } });
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "EMPLOYEE_ROLE_CHANGE", targetType: "employee", targetId: target.id,
    detail: `Role of "${target.name}" <${target.email}> changed: ${target.role} → ${parsed.data.role}`,
  });
  res.json({ id: target.id, role: parsed.data.role });
});

// ---------------------------------------------------------------------------
// FOUNDER DECISION B (2026-09-25): PLATFORM_ADMIN = global platform
// authority — direct, audited management of Company-owned resources.
// These routes mirror the company-side schemas and guards exactly (same
// zod shapes, same DRAFT/READY configurability lock, same ownership
// scoping, same media limits) — PLATFORM_ADMIN does not bypass business
// rules, only the request/approval round-trip. Every mutation writes an
// AccessAuditEvent with detail, and question mutations also write the
// same QuestionAuditEvent the company flow produces, so the Company's
// Account Activity feed and question-audit surface both retain
// traceability. Company request/approval flows are untouched.
// ---------------------------------------------------------------------------

const opsProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  priceRange: z.string().optional(),
  packSize: z.string().optional(),
  claims: z.array(z.string().min(1)).optional(),
});

router.post("/companies/:id/products", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const company = await prisma.company.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!company) return res.status(404).json({ error: "Company not found" });
  const parsed = opsProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { claims, ...rest } = parsed.data;
  const product = await prisma.product.create({ data: { companyId: company.id, ...rest, claims: claims ? JSON.stringify(claims) : null } });
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "PRODUCT_CREATE", targetType: "product", targetId: product.id,
    detail: `Created product "${product.name}" for company ${company.id}`,
  });
  res.status(201).json(product);
});

router.patch("/companies/:id/products/:pid", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const parsed = opsProductSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const existing = await prisma.product.findUnique({ where: { id: req.params.pid }, select: { companyId: true, name: true } });
  if (!existing || existing.companyId !== req.params.id) return res.status(404).json({ error: "Product not found" });
  const { claims, ...rest } = parsed.data;
  const product = await prisma.product.update({
    where: { id: req.params.pid },
    data: { ...rest, claims: claims ? JSON.stringify(claims) : undefined },
  });
  const changes = Object.keys(rest).map((k) => `${k} updated`).concat(claims !== undefined ? ["claims updated"] : []);
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "PRODUCT_UPDATED", targetType: "product", targetId: product.id,
    detail: `Product "${product.name}" (${existing.name} → ${product.name}): ${changes.join(", ") || "no changes"}`,
  });
  res.json(product);
});

// Shared DRAFT/READY configurability lock — identical rule to company.ts's
// assertConfigurable; Platform Admin direct edits respect the same
// campaign lifecycle boundary.
function opsAssertConfigurable(campaign: { status: string }, res: Response): boolean {
  if (campaign.status !== "DRAFT" && campaign.status !== "READY") {
    res.status(409).json({ error: "Campaign configuration is locked once launched" });
    return false;
  }
  return true;
}

const opsQuestionSchema = z
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
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "Single/multiple choice questions need at least 2 answer options." });
      }
    }
  });

async function auditOpsQuestionChange(
  opsUserId: string,
  campaign: { id: string; status: string },
  action: "CREATE" | "EDIT" | "DELETE",
  prev: { id: string; stage: string; type: string; text: string; options: string | null; order: number; required: boolean } | null,
  next: { id: string; stage: string; type: string; text: string; options: string | null; order: number; required: boolean } | null,
) {
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await prisma.questionAuditEvent.create({
    data: {
      campaignId: campaign.id,
      questionId: (next ?? prev)?.id ?? null,
      action,
      prevValue: prev ? JSON.stringify(prev) : null,
      newValue: next ? JSON.stringify(next) : null,
      actorKind: "ops",
      actorId: opsUserId,
      actorName: actor?.name ?? "unknown",
      lifecycleState: campaign.status,
    },
  });
}

router.post("/campaigns/:id/questions", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (!opsAssertConfigurable(campaign, res)) return;
  const parsed = opsQuestionSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Invalid input";
    return res.status(400).json({ error: message, details: parsed.error.flatten() });
  }
  const d = parsed.data;
  const question = await prisma.question.create({
    data: { campaignId: campaign.id, stage: d.stage, type: d.type, text: d.text, options: d.options ? JSON.stringify(d.options) : null, order: d.order, required: d.required },
  });
  await auditOpsQuestionChange(opsUserId, campaign, "CREATE", null, question);
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "QUESTION_CREATE", targetType: "campaign", targetId: campaign.id,
    detail: `Added ${d.stage} question "${d.text}" to campaign ${campaign.id}`,
  });
  res.status(201).json(question);
});

router.delete("/campaigns/:id/questions/:qid", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (!opsAssertConfigurable(campaign, res)) return;
  const existing = await prisma.question.findFirst({ where: { id: req.params.qid, campaignId: campaign.id } });
  if (!existing) return res.status(404).json({ error: "Question not found" });
  const result = await prisma.question.deleteMany({ where: { id: req.params.qid, campaignId: campaign.id } });
  if (result.count === 0) return res.status(404).json({ error: "Question not found" });
  await auditOpsQuestionChange(opsUserId, campaign, "DELETE", existing, null);
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "QUESTION_DELETE", targetType: "campaign", targetId: campaign.id,
    detail: `Deleted question "${existing.text}" from campaign ${campaign.id}`,
  });
  res.status(204).end();
});

// Mirrors the company-side POST .../questions/apply-template exactly —
// same measurement-integrity guard (at most one RATING_1_5 and one
// PURCHASE_INTENT_1_5 per campaign) and same exact-text dedup — minus the
// industry-eligibility check: PLATFORM_ADMIN selects from the full catalog
// under global authority (Decision A). QuestionAuditEvent per created row
// plus one AccessAuditEvent for the application.
router.post("/campaigns/:id/questions/apply-template", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (!opsAssertConfigurable(campaign, res)) return;
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
    existing.push({ type: q.type, text: q.text, order });
    await auditOpsQuestionChange(opsUserId, campaign, "CREATE", null, question);
  }

  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "QUESTION_APPLY_TEMPLATE", targetType: "campaign", targetId: campaign.id,
    detail: `Applied template ${template.key} (${template.label}) to campaign ${campaign.id}: ${created.length} created, ${skipped.length} skipped`,
  });
  res.status(201).json({ created, skipped });
});

const opsQrSchema = z.object({
  label: z.string().min(1),
  code: z.string().min(3),
  activeFrom: z.string(),
  activeTo: z.string(),
});

router.post("/campaigns/:id/qr-sources", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (!opsAssertConfigurable(campaign, res)) return;
  const parsed = opsQrSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const d = parsed.data;
  try {
    const source = await prisma.qrSource.create({
      data: { campaignId: campaign.id, label: d.label, code: d.code, activeFrom: new Date(d.activeFrom), activeTo: new Date(d.activeTo) },
    });
    const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
    await writeAccessAudit({
      actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
      action: "QR_SOURCE_CREATE", targetType: "campaign", targetId: campaign.id,
      detail: `Added QR/source "${d.label}" (${d.code}) to campaign ${campaign.id}`,
    });
    res.status(201).json(source);
  } catch {
    res.status(409).json({ error: "QR/source code already in use" });
  }
});

// The normal campaign QR-generation surface (lib/qr.ts) exposed to
// Operations: the same deterministic PNG of the consumer entry URL the
// Company console renders — creating a source record IS the QR
// definition and this endpoint performs the actual QR generation for it.
// Any ops role that can view the campaign's sources may render/download
// the image; only PLATFORM_ADMIN can create sources (route above).
router.get("/campaigns/:id/qr-sources/:sid/qr.png", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  const source = await prisma.qrSource.findFirst({ where: { id: req.params.sid, campaignId: campaign.id } });
  if (!source) return res.status(404).json({ error: "QR/source not found" });
  await sendQrPng(source, req, res);
});

const opsMediaSchema = z.object({
  kind: z.enum(["PRODUCT_IMAGE", "PACKAGING_IMAGE", "CAMPAIGN_MEDIA", "CREATIVE"]),
  url: z.string().url(),
  caption: z.string().optional(),
});

router.post("/campaigns/:id/media", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (!opsAssertConfigurable(campaign, res)) return;
  const parsed = opsMediaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const count = await prisma.campaignMedia.count({ where: { campaignId: campaign.id } });
  if (count >= MEDIA_LIMITS.maxPerCampaign) return res.status(400).json({ error: "Media limit reached (20 per campaign)" });
  const mediaType = /\.(mp4|webm)(\?|#|$)/i.test(parsed.data.url) ? "VIDEO" : "IMAGE";
  const media = await prisma.campaignMedia.create({ data: { campaignId: campaign.id, ...parsed.data, mediaType } });
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "CAMPAIGN_MEDIA_ADD", targetType: "campaign", targetId: campaign.id,
    detail: `Added ${parsed.data.kind} media to campaign ${campaign.id}`,
  });
  res.status(201).json(media);
});

router.delete("/campaigns/:id/media/:mid", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (!opsAssertConfigurable(campaign, res)) return;
  const media = await prisma.campaignMedia.findFirst({ where: { id: req.params.mid, campaignId: campaign.id } });
  if (!media) return res.status(404).json({ error: "Media not found" });
  if (media.source === "HOSTED" && media.storageKey && isHostedMediaConfigured()) {
    await deleteObject(media.storageKey).catch(() => undefined);
  }
  await prisma.campaignMedia.delete({ where: { id: media.id } });
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "CAMPAIGN_MEDIA_DELETE", targetType: "campaign", targetId: campaign.id,
    detail: `Removed ${media.kind} media from campaign ${campaign.id}`,
  });
  res.status(204).end();
});

// Campaign creation — mirrors the company-side POST /campaigns exactly
// (same fields, same product→company ownership rule, DRAFT status), minus
// the industry-eligibility check: PLATFORM_ADMIN selects from the full
// study-type catalog under global authority (Decision A). The campaign is
// created inside the target company — no cross-tenant data model is
// invented. Audited; surfaced in the Company's Account Activity feed.
const opsCreateCampaignSchema = z.object({
  name: z.string().min(1),
  objective: z.string().min(1),
  productId: z.string().nullish().transform((v) => (v === "" ? null : v)),
  startDate: z.string(),
  endDate: z.string(),
  audienceAgeMin: z.number().int().nullish(),
  audienceAgeMax: z.number().int().nullish(),
  audienceGender: z.string().nullish().transform((v) => (v === "" ? null : v)),
  audienceCity: z.string().nullish().transform((v) => (v === "" ? null : v)),
  studyType: z
    .string()
    .optional()
    .refine((v) => v == null || v === "" || findTemplate(v) != null, { message: "Unknown study type" }),
});

router.post("/companies/:id/campaigns", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const company = await prisma.company.findUnique({ where: { id: req.params.id } });
  if (!company) return res.status(404).json({ error: "Company not found" });
  const parsed = opsCreateCampaignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const d = parsed.data;
  if (d.productId) {
    const product = await prisma.product.findUnique({ where: { id: d.productId }, select: { companyId: true } });
    if (!product || product.companyId !== company.id) {
      return res.status(404).json({ error: "Product not found" });
    }
  }
  const campaign = await prisma.campaign.create({
    data: {
      companyId: company.id,
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
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "CAMPAIGN_CREATE", targetType: "campaign", targetId: campaign.id,
    detail: `Created DRAFT campaign "${campaign.name}" in company ${company.id}`,
  });
  res.status(201).json(campaign);
});

// Campaign configuration — mirrors the company-side PATCH /campaigns/:id
// field-for-field (createCampaignSchema.partial()), with two deliberate
// Founder-authorized differences: (1) PLATFORM_ADMIN may set any catalog
// study type directly — industry eligibility scopes Company-facing
// selection only (Decision A); (2) the study-type request/approval
// round-trip does not gate the admin — the Company flow stays intact and
// any pending request remains reviewable. The DRAFT/READY lifecycle lock
// and product→company ownership rule are identical.
const opsCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  objective: z.string().min(1).optional(),
  productId: z.string().nullish().transform((v) => (v === "" ? null : v)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  audienceAgeMin: z.number().int().nullish(),
  audienceAgeMax: z.number().int().nullish(),
  audienceGender: z.string().nullish().transform((v) => (v === "" ? null : v)),
  audienceCity: z.string().nullish().transform((v) => (v === "" ? null : v)),
  studyType: z
    .string()
    .nullish()
    .refine((v) => v == null || v === "" || STUDY_TEMPLATES.some((t) => t.key === v), { message: "Unknown study type" }),
});

router.patch("/campaigns/:id", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (!opsAssertConfigurable(campaign, res)) return;
  const parsed = opsCampaignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  const d = parsed.data;
  if (d.productId) {
    const product = await prisma.product.findUnique({ where: { id: d.productId }, select: { companyId: true } });
    if (!product || product.companyId !== campaign.companyId) {
      return res.status(404).json({ error: "Product not found" });
    }
  }
  const data: Record<string, unknown> = {};
  const changes: string[] = [];
  const push = (field: string, next: unknown, prev: unknown) => {
    data[field] = next;
    changes.push(`${field}: "${prev ?? "—"}" → "${next ?? "—"}"`);
  };
  if (d.name !== undefined && d.name !== campaign.name) push("name", d.name, campaign.name);
  if (d.objective !== undefined && d.objective !== campaign.objective) push("objective", d.objective, campaign.objective);
  if (d.productId !== undefined && d.productId !== campaign.productId) push("productId", d.productId, campaign.productId);
  if (d.startDate !== undefined) {
    const next = new Date(d.startDate);
    if (next.getTime() !== campaign.startDate.getTime()) push("startDate", next, campaign.startDate);
  }
  if (d.endDate !== undefined) {
    const next = new Date(d.endDate);
    if (next.getTime() !== campaign.endDate.getTime()) push("endDate", next, campaign.endDate);
  }
  for (const f of ["audienceAgeMin", "audienceAgeMax", "audienceGender", "audienceCity"] as const) {
    const next = d[f] === undefined ? undefined : d[f];
    if (next !== undefined && next !== campaign[f]) push(f, next, campaign[f]);
  }
  if (d.studyType !== undefined) {
    const next = d.studyType === "" ? null : d.studyType;
    if (next !== campaign.studyType) push("studyType", next, campaign.studyType);
  }
  if (changes.length === 0) return res.json(campaign);
  const updated = await prisma.campaign.update({ where: { id: campaign.id }, data });
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "CAMPAIGN_CONFIG_UPDATED", targetType: "campaign", targetId: campaign.id,
    detail: changes.join("; "),
  });
  res.json(updated);
});

// Mirrors the company-side DELETE /campaigns/:id — DRAFT-only and refused
// once participation evidence exists; removes the campaign's owned rows
// and any hosted media objects. Audited with the company id so the
// Account Activity feed can attribute it.
router.delete("/campaigns/:id", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (campaign.status !== "DRAFT") {
    return res.status(409).json({ error: "Only DRAFT campaigns can be deleted" });
  }
  const participations = await prisma.participation.count({ where: { campaignId: campaign.id } });
  if (participations > 0) {
    return res.status(409).json({ error: "Campaign has participation evidence and cannot be deleted" });
  }
  if (isHostedMediaConfigured()) {
    const media = await prisma.campaignMedia.findMany({ where: { campaignId: campaign.id, source: "HOSTED" } });
    for (const m of media) {
      if (m.storageKey) await deleteObject(m.storageKey).catch(() => undefined);
    }
  }
  await prisma.$transaction([
    prisma.answer.deleteMany({ where: { question: { campaignId: campaign.id } } }),
    prisma.participation.deleteMany({ where: { campaignId: campaign.id } }),
    prisma.questionChangeRequest.deleteMany({ where: { campaignId: campaign.id } }),
    prisma.studyTypeChangeRequest.deleteMany({ where: { campaignId: campaign.id } }),
    prisma.campaignNotificationRequest.deleteMany({ where: { campaignId: campaign.id } }),
    prisma.operationalIssue.deleteMany({ where: { campaignId: campaign.id } }),
    prisma.campaignMedia.deleteMany({ where: { campaignId: campaign.id } }),
    prisma.campaignOtpVerification.deleteMany({ where: { campaignId: campaign.id } }),
    prisma.question.deleteMany({ where: { campaignId: campaign.id } }),
    prisma.qrSource.deleteMany({ where: { campaignId: campaign.id } }),
    prisma.campaign.delete({ where: { id: campaign.id } }),
  ]);
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown",
    action: "CAMPAIGN_DELETE", targetType: "company", targetId: campaign.companyId,
    detail: `Deleted DRAFT campaign "${campaign.name}" (${campaign.id})`,
  });
  res.status(204).end();
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
  res.json({ ...campaign, media: await resolveMediaUrls(campaign.media) });
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
  await auditOpsAction(asOps(req).opsUserId, "CAMPAIGN_LAUNCH", "campaign", campaign.id);
  res.json(updated);
});

router.post("/campaigns/:id/pause", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  if (campaign.status !== "ACTIVE") return res.status(409).json({ error: "Only an ACTIVE campaign can be paused" });
  const updated = await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "PAUSED" } });
  await auditOpsAction(asOps(req).opsUserId, "CAMPAIGN_PAUSE", "campaign", campaign.id);
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
  await auditOpsAction(asOps(req).opsUserId, "CAMPAIGN_CLOSE", "campaign", campaign.id);
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
    include: { campaign: { include: { company: { select: { industry: true } } } } },
  });
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "PENDING") return res.status(409).json({ error: "Request is not pending" });
  if (request.campaign.status !== "DRAFT" && request.campaign.status !== "READY") {
    return res.status(409).json({ error: "Campaign is no longer configurable; this request can no longer be approved" });
  }
  if (request.requestedStudyType && !isStudyTypeEligible(request.requestedStudyType, request.campaign.company.industry)) {
    return res.status(409).json({ error: "The requested study type is no longer available for this company's industry" });
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
  // FD-WEB-04 audit trail: every request decision is an auditable ops
  // action, visible on the Platform Admin audit surface.
  await auditOpsAction(opsUserId, "STUDY_TYPE_REQUEST_APPROVED", "study-type-request", request.id);
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
  await auditOpsAction(opsUserId, "STUDY_TYPE_REQUEST_REJECTED", "study-type-request", request.id);

  const updatedRequest = await prisma.studyTypeChangeRequest.findUnique({ where: { id: request.id } });
  res.json(updatedRequest);
});

// FD-WEB-04: the third named review outcome — send the request back to the
// company with a note instead of approving or rejecting outright. The
// request record becomes the visible outcome (the company reads it on its
// own requests list); no notification mechanism is invented — status +
// audit are the channel.
const requestChangesSchema = z.object({ note: z.string().min(1) });

router.post("/study-type-requests/:id/request-changes", async (req, res) => {
  const { opsUserId } = asOps(req);
  const parsed = requestChangesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "A note describing the required changes is required" });

  const request = await prisma.studyTypeChangeRequest.findUnique({ where: { id: req.params.id } });
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "PENDING") return res.status(409).json({ error: "Request is not pending" });

  // Request-changes never mutates the campaign — the company may re-file
  // after adjusting. Same conditional-flip guard as reject.
  const flipped = await prisma.studyTypeChangeRequest.updateMany({
    where: { id: request.id, status: "PENDING" },
    data: { status: "CHANGES_REQUESTED", reviewedById: opsUserId, reviewedAt: new Date(), reviewNote: parsed.data.note },
  });
  if (flipped.count === 0) return res.status(409).json({ error: "Request was already reviewed" });
  await auditOpsAction(opsUserId, "STUDY_TYPE_REQUEST_CHANGES_REQUESTED", "study-type-request", request.id);

  res.json(await prisma.studyTypeChangeRequest.findUnique({ where: { id: request.id } }));
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
  await auditOpsAction(opsUserId, "ISSUE_CREATE", "issue", issue.id);
  res.status(201).json(issue);
});

router.patch("/issues/:issueId/resolve", async (req, res) => {
  const issue = await prisma.operationalIssue
    .update({ where: { id: req.params.issueId }, data: { status: "RESOLVED", resolvedAt: new Date() } })
    .catch(() => null);
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  await auditOpsAction(asOps(req).opsUserId, "ISSUE_RESOLVE", "issue", issue.id);
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
router.get("/ops-users", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const users = await prisma.opsUser.findMany({ select: { id: true, name: true, email: true, role: true, revokedAt: true, createdAt: true } });
  // isSelf lets the UI suppress the self-revoke control without guessing.
  res.json(users.map((u) => ({ ...u, isSelf: u.id === opsUserId })));
});

router.post("/ops-users", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    // FD-WEB-03: OPERATIONS_MANAGER is a real assignable role.
    role: z.enum(["PLATFORM_ADMIN", "OPERATIONS", "OPERATIONS_MANAGER"]).optional(),
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

// Founder ruling O2 (2026-09-24): PLATFORM_ADMIN revokes an Ops user's
// access. Revocation-only — no reactivation is authorized by the current
// product model (a fresh account is the audit-clean way back). Guards:
// no self-revoke, no last-active-PLATFORM_ADMIN revoke. The row and all
// its history are preserved; the DB role check on every privileged
// request makes revocation effective immediately, JWTs notwithstanding.
router.post("/ops-users/:id/revoke", requirePlatformAdmin, async (req, res) => {
  const { opsUserId } = asOps(req);
  if (req.params.id === opsUserId) return res.status(409).json({ error: "You cannot revoke your own access" });
  const target = await prisma.opsUser.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: "Ops user not found" });
  if (target.revokedAt) return res.status(409).json({ error: "Access is already revoked" });
  if (target.role === "PLATFORM_ADMIN") {
    const others = await prisma.opsUser.count({
      where: { role: "PLATFORM_ADMIN", revokedAt: null, id: { not: target.id } },
    });
    if (others === 0) return res.status(409).json({ error: "Cannot revoke the last active Platform Admin" });
  }
  await prisma.opsUser.update({ where: { id: target.id }, data: { revokedAt: new Date() } });
  await auditOpsAction(opsUserId, "OPS_USER_ACCESS_REVOKED", "ops-user", target.id);
  res.json({ id: target.id, revoked: true });
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

// FD-WEB-04: request review decisions are auditable ops actions — written
// to AccessAuditEvent so the Platform Admin audit surface retains full
// visibility of the request workflow, not just question mutations.
async function auditOpsAction(opsUserId: string, action: string, targetType: string, targetId?: string) {
  const actor = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  await writeAccessAudit({ actorKind: "ops", actorId: opsUserId, actorName: actor?.name ?? "unknown", action, targetType, targetId });
}

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
  // Concurrency guard (same conditional-updateMany pattern as the
  // study-type flow): atomically claim the request PENDING -> APPLYING so
  // two reviewers/double-clicks can never apply the same change twice.
  const claimed = await prisma.questionChangeRequest.updateMany({
    where: { id: req.params.id, status: "PENDING" },
    data: { status: "APPLYING" },
  });
  if (claimed.count === 0) {
    const existing = await prisma.questionChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Request not found" });
    return res.status(409).json({ error: `Request already ${existing.status}` });
  }
  const request = await prisma.questionChangeRequest.findUnique({ where: { id: req.params.id }, include: { campaign: true } });
  if (!request) return res.status(404).json({ error: "Request not found" });
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
      // Release the claim so the request can be corrected and re-applied.
      await prisma.questionChangeRequest.update({ where: { id: request.id }, data: { status: "PENDING" } });
      return res.status(400).json({ error: "Request payload has no applicable fields" });
    }
    const updated = await prisma.question.update({ where: { id: question.id }, data });
    await writeQuestionAudit(opsUserId, request.campaign, "EDIT", question, updated, request.id);
  }

  const done = await prisma.questionChangeRequest.update({
    where: { id: request.id },
    data: { status: "PERFORMED", performedById: opsUserId, performedAt: new Date() },
  });
  await auditOpsAction(opsUserId, "QUESTION_CHANGE_APPLIED", "question-change-request", request.id);
  res.json(done);
});

router.post("/question-change-requests/:id/reject", async (req, res) => {
  const { opsUserId } = asOps(req);
  const note = typeof req.body?.note === "string" ? req.body.note : null;
  // Conditional flip — same PENDING-guard pattern as apply above.
  const flipped = await prisma.questionChangeRequest.updateMany({
    where: { id: req.params.id, status: "PENDING" },
    data: { status: "REJECTED", performedById: opsUserId, performedAt: new Date(), reviewNote: note },
  });
  if (flipped.count === 0) {
    const existing = await prisma.questionChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Request not found" });
    return res.status(409).json({ error: `Request already ${existing.status}` });
  }
  await auditOpsAction(opsUserId, "QUESTION_CHANGE_REJECTED", "question-change-request", req.params.id);
  res.json(await prisma.questionChangeRequest.findUnique({ where: { id: req.params.id } }));
});

// FD-WEB-04: send a question change request back with a note — the
// company sees the outcome and may file a corrected request.
router.post("/question-change-requests/:id/request-changes", async (req, res) => {
  const { opsUserId } = asOps(req);
  const parsed = requestChangesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "A note describing the required changes is required" });
  const flipped = await prisma.questionChangeRequest.updateMany({
    where: { id: req.params.id, status: "PENDING" },
    data: { status: "CHANGES_REQUESTED", performedById: opsUserId, performedAt: new Date(), reviewNote: parsed.data.note },
  });
  if (flipped.count === 0) {
    const existing = await prisma.questionChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Request not found" });
    return res.status(409).json({ error: `Request already ${existing.status}` });
  }
  await auditOpsAction(opsUserId, "QUESTION_CHANGE_CHANGES_REQUESTED", "question-change-request", req.params.id);
  res.json(await prisma.questionChangeRequest.findUnique({ where: { id: req.params.id } }));
});

router.get("/campaigns/:id/question-audit", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  res.json(await prisma.questionAuditEvent.findMany({ where: { campaignId: campaign.id }, orderBy: { createdAt: "desc" } }));
});

// NOTE (forensic audit 2026-09-20): the OFD-14 activation-notification
// request/launch routes were removed — the Founder decision of 2026-09-20
// states consumers receive NO push notifications, so there is no delivery
// target. The CampaignNotificationRequest model remains dormant in the
// schema (dropping it would be a destructive migration with no product need).

// NOTE (post-innovation forensic audit, 2026-09-20): no /ops/panel endpoint
// exists. OFD-15C (shared TAJRIBTI-managed opt-in panel) is REJECTED under the
// authoritative Founder decisions — the earlier aggregate endpoint and its ops
// UI tab were removed. Opted-in panel data is exposed only as same-company
// aggregates via /company/panel-insights (OFD-15B).

// --- OFD-06: derived advanced intelligence ------------------------------------
router.get("/campaigns/:id/intelligence", async (req, res) => {
  const campaign = await loadCampaignOrNotFound(req, res);
  if (!campaign) return;
  res.json(await buildIntelligence(campaign.id));
});

export default router;
