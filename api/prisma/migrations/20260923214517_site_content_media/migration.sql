-- CreateTable
CREATE TABLE "SiteContentSection" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "draft" TEXT,
    "published" TEXT,
    "draftBy" TEXT,
    "draftAt" DATETIME,
    "publishedBy" TEXT,
    "publishedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteMedia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "alt" TEXT,
    "attribution" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
