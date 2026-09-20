// FOUNDER INNOVATION (D-5, 2026-09-20): HOSTED campaign media.
// Storage: Railway Bucket (S3-compatible) — the existing established
// infrastructure provider; no new vendor. Private bucket: reads and
// writes go through short-lived signed URLs issued by the backend;
// objects are never publicly addressable.
//
// Environment (set via the provider secret store — never in code):
//   MEDIA_BUCKET_ENDPOINT   S3-compatible endpoint URL
//   MEDIA_BUCKET_NAME       bucket name
//   MEDIA_BUCKET_ACCESS_KEY access key
//   MEDIA_BUCKET_SECRET_KEY secret key
//   MEDIA_BUCKET_REGION     optional (default "auto")
//
// When unconfigured the hosted path fails closed with 503 — URL media
// is unaffected, and nothing pretends hosted uploads exist.

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const MEDIA_LIMITS = {
  maxBytes: 5 * 1024 * 1024, // 5 MB per asset (spec §1)
  maxPerCampaign: 20, // 20 assets per campaign (spec §1)
  allowedContentTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  uploadUrlTtlSeconds: 300,
  readUrlTtlSeconds: 3600,
};

let client: S3Client | null = null;

export function isHostedMediaConfigured(): boolean {
  return Boolean(
    process.env.MEDIA_BUCKET_ENDPOINT &&
      process.env.MEDIA_BUCKET_NAME &&
      process.env.MEDIA_BUCKET_ACCESS_KEY &&
      process.env.MEDIA_BUCKET_SECRET_KEY
  );
}

function bucket(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: process.env.MEDIA_BUCKET_ENDPOINT,
      region: process.env.MEDIA_BUCKET_REGION ?? "auto",
      credentials: {
        accessKeyId: process.env.MEDIA_BUCKET_ACCESS_KEY!,
        secretAccessKey: process.env.MEDIA_BUCKET_SECRET_KEY!,
      },
      // Railway Buckets use virtual-hosted-style URLs (bucket subdomain
      // of the endpoint) — the SDK default; do not force path style.
    });
  }
  return client;
}

const bucketName = () => process.env.MEDIA_BUCKET_NAME!;

// Campaign-scoped object key — tenant isolation is structural: an object
// can only ever live under its own campaign prefix.
export function mediaStorageKey(campaignId: string, mediaId: string, ext: string): string {
  return `campaigns/${campaignId}/${mediaId}.${ext}`;
}

export function mediaExtension(contentType: string): string | null {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

export async function createUploadUrl(storageKey: string, contentType: string): Promise<string> {
  return getSignedUrl(
    bucket(),
    new PutObjectCommand({ Bucket: bucketName(), Key: storageKey, ContentType: contentType }),
    { expiresIn: MEDIA_LIMITS.uploadUrlTtlSeconds }
  );
}

export async function createReadUrl(storageKey: string): Promise<string> {
  return getSignedUrl(bucket(), new GetObjectCommand({ Bucket: bucketName(), Key: storageKey }), {
    expiresIn: MEDIA_LIMITS.readUrlTtlSeconds,
  });
}

// Confirm-time verification: the stored object's ContentType and size must
// match what upload-init declared — a client cannot smuggle a different
// payload under an approved key.
export async function verifyStoredObject(
  storageKey: string,
  expectedContentType: string,
  expectedSizeBytes: number
): Promise<boolean> {
  const head = await bucket().send(new HeadObjectCommand({ Bucket: bucketName(), Key: storageKey }));
  return head.ContentType === expectedContentType && Number(head.ContentLength) === expectedSizeBytes;
}

export async function deleteObject(storageKey: string): Promise<void> {
  await bucket().send(new DeleteObjectCommand({ Bucket: bucketName(), Key: storageKey }));
}

// Response shaping: HOSTED+READY rows get a fresh signed read URL in
// `url`; PENDING/unconfigured hosted rows and plain URL rows pass through.
export async function resolveMediaUrls<
  T extends { source: string; status: string; storageKey: string | null; url: string }
>(media: T[]): Promise<T[]> {
  return Promise.all(
    media.map(async (m) =>
      m.source === "HOSTED" && m.status === "READY" && m.storageKey && isHostedMediaConfigured()
        ? { ...m, url: await createReadUrl(m.storageKey) }
        : m
    )
  );
}

// Orphan sweep support: list every object key under the campaigns/ prefix.
export async function listMediaKeys(): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const page = await bucket().send(
      new ListObjectsV2Command({ Bucket: bucketName(), Prefix: "campaigns/", ContinuationToken: token })
    );
    for (const obj of page.Contents ?? []) if (obj.Key) keys.push(obj.Key);
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return keys;
}
