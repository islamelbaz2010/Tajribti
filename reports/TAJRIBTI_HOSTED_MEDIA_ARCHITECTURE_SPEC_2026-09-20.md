# TAJRIBTI — HOSTED MEDIA ARCHITECTURE SPEC (D-5)

**Date:** 2026-09-20 · **Status:** ARCHITECTURE SPECIFIED — implementation deferred pending bucket provisioning (a production infrastructure action). URL-referenced media remains the live mechanism and is unchanged.

## 0. Provider audit (repository evidence)

- `api/package.json`: no S3/multer/storage dependency exists.
- Infrastructure: production runs on Railway (`railway.json`, project `tajribti-pilot`); Railway offers managed object-storage **Buckets** — this is the *existing established provider*, not a new one.
- Conclusion: Railway Bucket is the evidence-grounded provider. No new vendor is introduced.

## 1. Architecture

- **Storage:** one Railway Bucket `tajribti-media` (production), S3-compatible API.
- **Keys:** `campaigns/{campaignId}/{mediaId}.{ext}` — campaign-scoped path makes ownership/tenant isolation structural.
- **Ownership:** `CampaignMedia` row remains the source of truth; gains `storageKey` + `source: "URL"|"HOSTED"` fields (additive schema migration).
- **Tenant isolation:** company of the campaign is checked on every upload/delete; ops read-only via signed GETs.
- **Media types:** images only initially — `image/jpeg`, `image/png`, `image/webp` (MIME sniffed from bytes, not just extension).
- **Size limits:** ≤ 5 MB per asset; ≤ 20 assets per campaign (matches gallery use).
- **Upload validation:** auth (COMPANY_MEMBER+) → campaign ownership + lifecycle (configurable only, same lock as URL media) → MIME+size checks → generate key → presigned PUT → client uploads → confirm endpoint marks row ready.
- **Access control:** uploads/deletes authenticated; reads via short-lived signed URLs (private bucket) or public-read object URLs only if the asset is part of a live consumer-facing campaign — decision: **private + signed URLs** (safer default).
- **Deletion:** allowed while campaign is configurable (same rule as URL media); delete removes bucket object + row atomically-ish (object delete then row delete; orphan sweeper below).
- **Orphan cleanup:** nightly/manual script lists bucket keys not referenced by any `CampaignMedia.storageKey` → deletes after 7-day grace.
- **Replacement:** new upload = new key + new row update; old object cleaned by orphan sweep.
- **Lifecycle:** follows campaign lifecycle — no media mutation after launch.
- **Migration:** existing URL media untouched (`source="URL"`); hosted uploads additive; no data migration needed.
- **Rollback:** remove upload routes; hosted rows keep serving via stored signed-URL regeneration or fall back to URL — bucket contents preserved.
- **Tests:** MIME/size rejection, cross-company upload denial, launch-lock enforcement, orphan-sweep correctness (mocked bucket client), signed-URL expiry.
- **Production requirements:** create Railway Bucket (one-time infra action — needs authorization), set `MEDIA_BUCKET_*` env vars (endpoint/key/secret via Railway secret store — never in repo), deploy.

## 2. Explicitly not in scope

Video, CDN custom domain, image transforms, moderation pipeline — future decisions if needed.
