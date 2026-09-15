-- CreateTable
CREATE TABLE "StudyTypeChangeRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "currentStudyType" TEXT,
    "requestedStudyType" TEXT,
    "requestedById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" DATETIME,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudyTypeChangeRequest_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudyTypeChangeRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudyTypeChangeRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "OpsUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StudyTypeChangeRequest_campaignId_idx" ON "StudyTypeChangeRequest"("campaignId");

-- CreateIndex
CREATE INDEX "StudyTypeChangeRequest_status_idx" ON "StudyTypeChangeRequest"("status");
