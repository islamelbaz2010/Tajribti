// FOUNDER DIRECTION 2026-09-24 — Public Website content management.
// PLATFORM_ADMIN-only administration of the fixed public-site sections
// and media library. Lifecycle: Draft → Preview → Publish. Every write
// is audited via the existing AccessAuditEvent infrastructure. This is
// deliberately not a generic CMS: sections are the closed key set in
// lib/siteContent.ts, payloads are zod-validated, and media uploads are
// constrained to small image types.

import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireOps, requirePlatformAdmin, asOps } from "../middleware/auth";
import { writeAccessAudit } from "../lib/audit";
import {
  SITE_SECTION_KEYS,
  SITE_SECTION_SCHEMAS,
  SITE_SECTION_DEFAULTS,
  isSiteSectionKey,
} from "../lib/siteContent";

const router = Router();
router.use(requireOps, requirePlatformAdmin);

const SITE_MEDIA_MAX_BYTES = 5 * 1024 * 1024;
const SITE_MEDIA_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;

async function actorName(req: Request): Promise<string> {
  const { opsUserId } = asOps(req);
  const u = await prisma.opsUser.findUnique({ where: { id: opsUserId }, select: { name: true } });
  return u?.name ?? "unknown";
}

function parseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// --- Sections ---------------------------------------------------------------

router.get("/sections", async (_req, res) => {
  const rows = await prisma.siteContentSection.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r]));
  res.json(
    SITE_SECTION_KEYS.map((key) => {
      const row = byKey.get(key);
      return {
        key,
        defaults: SITE_SECTION_DEFAULTS[key],
        draft: parseJson(row?.draft ?? null),
        published: parseJson(row?.published ?? null),
        draftBy: row?.draftBy ?? null,
        draftAt: row?.draftAt ?? null,
        publishedBy: row?.publishedBy ?? null,
        publishedAt: row?.publishedAt ?? null,
      };
    })
  );
});

router.put("/sections/:key/draft", async (req: Request, res: Response) => {
  const key = req.params.key;
  if (!isSiteSectionKey(key)) return res.status(404).json({ error: "Unknown content section" });
  const parsed = SITE_SECTION_SCHEMAS[key].safeParse(req.body?.content);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid content for this section", issues: parsed.error.issues });
  }
  const name = await actorName(req);
  const row = await prisma.siteContentSection.upsert({
    where: { key },
    create: { key, draft: JSON.stringify(parsed.data), draftBy: name, draftAt: new Date() },
    update: { draft: JSON.stringify(parsed.data), draftBy: name, draftAt: new Date() },
  });
  const { opsUserId } = asOps(req);
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: name,
    action: "SITE_CONTENT_DRAFT", targetType: "site-section", targetId: key,
  });
  res.json({ key: row.key, draft: parsed.data, draftBy: row.draftBy, draftAt: row.draftAt });
});

router.post("/sections/:key/publish", async (req: Request, res: Response) => {
  const key = req.params.key;
  if (!isSiteSectionKey(key)) return res.status(404).json({ error: "Unknown content section" });
  const row = await prisma.siteContentSection.findUnique({ where: { key } });
  if (!row?.draft) return res.status(400).json({ error: "No draft to publish — save a draft first" });
  const name = await actorName(req);
  const updated = await prisma.siteContentSection.update({
    where: { key },
    data: { published: row.draft, publishedBy: name, publishedAt: new Date() },
  });
  const { opsUserId } = asOps(req);
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: name,
    action: "SITE_CONTENT_PUBLISH", targetType: "site-section", targetId: key,
  });
  res.json({
    key: updated.key,
    published: parseJson(updated.published),
    publishedBy: updated.publishedBy,
    publishedAt: updated.publishedAt,
  });
});

// --- Media library ------------------------------------------------------------

router.get("/media", async (_req, res) => {
  const media = await prisma.siteMedia.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, mime: true, alt: true, attribution: true, active: true, sortOrder: true, createdBy: true, createdAt: true },
  });
  res.json(media.map((m) => ({ ...m, url: `/api/public/site/media/${m.id}` })));
});

const uploadSchema = z.object({
  name: z.string().min(1).max(200),
  mime: z.enum(SITE_MEDIA_MIMES),
  dataBase64: z.string().min(8),
  alt: z.string().max(300).optional(),
  attribution: z.string().max(300).optional(),
  sortOrder: z.number().int().min(0).max(99).optional(),
});

router.post("/media", async (req: Request, res: Response) => {
  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid media upload", issues: parsed.error.issues });
  const data = Buffer.from(parsed.data.dataBase64, "base64");
  if (!data.length) return res.status(400).json({ error: "Empty file" });
  if (data.length > SITE_MEDIA_MAX_BYTES) return res.status(413).json({ error: "File exceeds 5 MB limit" });
  const name = await actorName(req);
  const media = await prisma.siteMedia.create({
    data: {
      name: parsed.data.name,
      mime: parsed.data.mime,
      data,
      alt: parsed.data.alt ?? null,
      attribution: parsed.data.attribution ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
      createdBy: name,
    },
  });
  const { opsUserId } = asOps(req);
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: name,
    action: "SITE_MEDIA_UPLOAD", targetType: "site-media", targetId: media.id,
  });
  res.status(201).json({ id: media.id, url: `/api/public/site/media/${media.id}` });
});

const patchMediaSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  alt: z.string().max(300).nullable().optional(),
  attribution: z.string().max(300).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(99).optional(),
});

router.patch("/media/:id", async (req: Request, res: Response) => {
  const parsed = patchMediaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid media update", issues: parsed.error.issues });
  const media = await prisma.siteMedia.update({ where: { id: req.params.id }, data: parsed.data }).catch(() => null);
  if (!media) return res.status(404).json({ error: "Media not found" });
  const name = await actorName(req);
  const { opsUserId } = asOps(req);
  await writeAccessAudit({
    actorKind: "ops", actorId: opsUserId, actorName: name,
    action: "SITE_MEDIA_UPDATE", targetType: "site-media", targetId: media.id,
  });
  res.json({ id: media.id, active: media.active, sortOrder: media.sortOrder });
});

// Admin preview of any media row, active or not.
router.get("/media/:id/raw", async (req: Request, res: Response) => {
  const media = await prisma.siteMedia.findUnique({ where: { id: req.params.id } });
  if (!media) return res.status(404).json({ error: "Media not found" });
  res.setHeader("content-type", media.mime);
  res.setHeader("cache-control", "private, max-age=60");
  res.send(media.data);
});

export default router;
