-- AlterTable
ALTER TABLE "Product" ADD COLUMN "claims" TEXT;
ALTER TABLE "Product" ADD COLUMN "packSize" TEXT;
ALTER TABLE "Product" ADD COLUMN "priceRange" TEXT;

-- CreateTable
CREATE TABLE "CampaignMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CampaignMedia_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionChangeRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "questionId" TEXT,
    "action" TEXT NOT NULL,
    "payload" TEXT,
    "reason" TEXT,
    "requestedById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "performedById" TEXT,
    "performedAt" DATETIME,
    "reviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuestionChangeRequest_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuestionChangeRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuestionChangeRequest_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "OpsUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionAuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "questionId" TEXT,
    "action" TEXT NOT NULL,
    "prevValue" TEXT,
    "newValue" TEXT,
    "actorKind" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "lifecycleState" TEXT NOT NULL,
    "requestId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuestionAuditEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "QuestionChangeRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CampaignNotificationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "launchedById" TEXT,
    "launchedAt" DATETIME,
    "eligibleCount" INTEGER,
    "deliveryStatus" TEXT,
    "reviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampaignNotificationRequest_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CampaignNotificationRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CampaignNotificationRequest_launchedById_fkey" FOREIGN KEY ("launchedById") REFERENCES "OpsUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessAuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorKind" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Consumer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "panelOptIn" BOOLEAN NOT NULL DEFAULT false,
    "panelOptInAt" DATETIME,
    "pushOptIn" BOOLEAN NOT NULL DEFAULT false,
    "pushOptInAt" DATETIME,
    "pushToken" TEXT
);
INSERT INTO "new_Consumer" ("createdAt", "id", "name", "phone") SELECT "createdAt", "id", "name", "phone" FROM "Consumer";
DROP TABLE "Consumer";
ALTER TABLE "new_Consumer" RENAME TO "Consumer";
CREATE UNIQUE INDEX "Consumer_phone_key" ON "Consumer"("phone");
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'COMPANY_MEMBER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("companyId", "createdAt", "email", "id", "name", "passwordHash") SELECT "companyId", "createdAt", "email", "id", "name", "passwordHash" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");
CREATE TABLE "new_OpsUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATIONS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_OpsUser" ("createdAt", "email", "id", "name", "passwordHash") SELECT "createdAt", "email", "id", "name", "passwordHash" FROM "OpsUser";
DROP TABLE "OpsUser";
ALTER TABLE "new_OpsUser" RENAME TO "OpsUser";
CREATE UNIQUE INDEX "OpsUser_email_key" ON "OpsUser"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CampaignMedia_campaignId_idx" ON "CampaignMedia"("campaignId");

-- CreateIndex
CREATE INDEX "QuestionChangeRequest_campaignId_idx" ON "QuestionChangeRequest"("campaignId");

-- CreateIndex
CREATE INDEX "QuestionChangeRequest_status_idx" ON "QuestionChangeRequest"("status");

-- CreateIndex
CREATE INDEX "QuestionAuditEvent_campaignId_idx" ON "QuestionAuditEvent"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignNotificationRequest_campaignId_idx" ON "CampaignNotificationRequest"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignNotificationRequest_status_idx" ON "CampaignNotificationRequest"("status");

-- CreateIndex
CREATE INDEX "AccessAuditEvent_actorKind_actorId_idx" ON "AccessAuditEvent"("actorKind", "actorId");

-- CreateIndex
CREATE INDEX "AccessAuditEvent_createdAt_idx" ON "AccessAuditEvent"("createdAt");

-- OFD-08 capability-preserving backfill: existing employees keep full company
-- capability (COMPANY_ADMIN) and existing ops users keep platform-wide
-- capability (PLATFORM_ADMIN). New rows default to the narrower roles
-- declared in schema.prisma (COMPANY_MEMBER / OPERATIONS).
UPDATE "Employee" SET "role" = 'COMPANY_ADMIN' WHERE "role" = 'COMPANY_MEMBER';
UPDATE "OpsUser" SET "role" = 'PLATFORM_ADMIN' WHERE "role" = 'OPERATIONS';
