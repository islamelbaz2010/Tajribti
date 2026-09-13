-- Remove Employee.role: Benchmark §4 COMPANY names only "Employees" with
-- no permission-tier language. OWNER/MEMBER was an unauthorized product
-- permission decision (see schema.prisma Employee model comment) and is
-- removed, not just unenforced. SQLite requires a table rebuild to drop
-- a column.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("id", "companyId", "email", "passwordHash", "name", "createdAt")
    SELECT "id", "companyId", "email", "passwordHash", "name", "createdAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");

PRAGMA foreign_keys=ON;
