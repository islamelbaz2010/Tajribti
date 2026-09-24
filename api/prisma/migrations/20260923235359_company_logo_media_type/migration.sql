-- AlterTable
ALTER TABLE "Company" ADD COLUMN "logoContentType" TEXT;
ALTER TABLE "Company" ADD COLUMN "logoSizeBytes" INTEGER;
ALTER TABLE "Company" ADD COLUMN "logoStorageKey" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CampaignMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "source" TEXT NOT NULL DEFAULT 'URL',
    "status" TEXT NOT NULL DEFAULT 'READY',
    "mediaType" TEXT NOT NULL DEFAULT 'IMAGE',
    "storageKey" TEXT,
    "contentType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignMedia_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CampaignMedia" ("campaignId", "caption", "contentType", "createdAt", "id", "kind", "sizeBytes", "source", "status", "storageKey", "url") SELECT "campaignId", "caption", "contentType", "createdAt", "id", "kind", "sizeBytes", "source", "status", "storageKey", "url" FROM "CampaignMedia";
DROP TABLE "CampaignMedia";
ALTER TABLE "new_CampaignMedia" RENAME TO "CampaignMedia";
CREATE INDEX "CampaignMedia_campaignId_idx" ON "CampaignMedia"("campaignId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
