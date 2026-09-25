-- Founder-authorized Model A: company Commercial Agreement + campaign scope.
CREATE TABLE "CompanyCommercialAgreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "packageTier" TEXT NOT NULL DEFAULT 'ESSENTIAL',
    "contractedParticipantBasis" TEXT NOT NULL DEFAULT 'PER_CAMPAIGN_SCOPE',
    "contractedParticipants" INTEGER,
    "fulfillmentModel" TEXT NOT NULL DEFAULT 'POINT_OF_TRIAL',
    "contractReference" TEXT,
    "scopeNote" TEXT,
    "quotedStudyFeeEgp" INTEGER,
    "quotedParticipantRateEgp" INTEGER,
    "quotedHomeDeliveryFeeEgp" INTEGER,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "discountBasis" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'MANUAL_BANK_TRANSFER',
    "paymentStatus" TEXT NOT NULL DEFAULT 'QUOTE_DRAFT',
    "agreementStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "readyAt" DATETIME,
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyCommercialAgreement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CompanyCommercialAgreement_companyId_key" ON "CompanyCommercialAgreement"("companyId");

ALTER TABLE "CampaignCommercialTerms" ADD COLUMN "commercialAgreementId" TEXT
    CONSTRAINT "CampaignCommercialTerms_commercialAgreementId_fkey" REFERENCES "CompanyCommercialAgreement" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "CampaignCommercialTerms_commercialAgreementId_idx" ON "CampaignCommercialTerms"("commercialAgreementId");
