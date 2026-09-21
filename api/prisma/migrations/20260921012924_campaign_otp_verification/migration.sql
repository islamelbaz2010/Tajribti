-- AlterTable
ALTER TABLE "OtpCode" ADD COLUMN "campaignId" TEXT;

-- CreateTable
CREATE TABLE "CampaignOtpVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consumerId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "otpCodeId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "consumedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignOtpVerification_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "Consumer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CampaignOtpVerification_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CampaignOtpVerification_consumerId_campaignId_idx" ON "CampaignOtpVerification"("consumerId", "campaignId");

-- CreateIndex
CREATE INDEX "OtpCode_phone_campaignId_idx" ON "OtpCode"("phone", "campaignId");
