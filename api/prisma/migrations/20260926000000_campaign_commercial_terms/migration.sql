-- CreateTable
CREATE TABLE "CampaignCommercialTerms" (
    "campaignId" TEXT NOT NULL PRIMARY KEY,
    "packageTier" TEXT NOT NULL DEFAULT 'ESSENTIAL',
    "contractedParticipants" INTEGER,
    "fulfillmentModel" TEXT NOT NULL DEFAULT 'POINT_OF_TRIAL',
    "scopeNote" TEXT,
    "quotedStudyFeeEgp" INTEGER,
    "quotedParticipantRateEgp" INTEGER,
    "quotedHomeDeliveryFeeEgp" INTEGER,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "discountBasis" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'MANUAL_BANK_TRANSFER',
    "paymentStatus" TEXT NOT NULL DEFAULT 'QUOTE_DRAFT',
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampaignCommercialTerms_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
