// Public (unauthenticated) read surface for published site content.
// Serves ONLY the `published` payload of each section — drafts are never
// exposed here. Missing or unparsable rows are simply omitted; the
// public page keeps its static fallback markup for those sections.

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { SITE_SECTION_KEYS } from "../lib/siteContent";

const router = Router();

router.get("/site", async (_req, res) => {
  const rows = await prisma.siteContentSection.findMany();
  const sections: Record<string, unknown> = {};
  for (const row of rows) {
    if (!row.published || !(SITE_SECTION_KEYS as readonly string[]).includes(row.key)) continue;
    try {
      sections[row.key] = JSON.parse(row.published);
    } catch {
      // Unparsable published payload — omit; static fallback applies.
    }
  }
  res.setHeader("cache-control", "public, max-age=30");
  res.json({ sections });
});

// Public media bytes — only rows marked active are served.
router.get("/site/media/:id", async (req, res) => {
  const media = await prisma.siteMedia.findUnique({ where: { id: req.params.id } });
  if (!media || !media.active) return res.status(404).json({ error: "Media not found" });
  res.setHeader("content-type", media.mime);
  res.setHeader("cache-control", "public, max-age=300");
  res.send(media.data);
});

export default router;
