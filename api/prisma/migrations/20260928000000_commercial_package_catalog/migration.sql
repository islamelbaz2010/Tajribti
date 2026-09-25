-- Founder-authorized commercial continuation: reusable four-tier package
-- catalog plus contract-period fields on the governing company agreement.
CREATE TABLE "CommercialPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deliverables" TEXT NOT NULL,
    "serviceNote" TEXT,
    "defaultStudyFeeEgp" INTEGER,
    "defaultParticipantRateEgp" INTEGER,
    "defaultHomeDeliveryFeeEgp" INTEGER,
    "minimumParticipants" INTEGER,
    "maximumParticipants" INTEGER,
    "defaultFulfillmentModel" TEXT NOT NULL DEFAULT 'POINT_OF_TRIAL',
    "turnaroundLabel" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "internalNote" TEXT,
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "CommercialPackage_tier_key" ON "CommercialPackage"("tier");

ALTER TABLE "CompanyCommercialAgreement" ADD COLUMN "effectiveFrom" DATETIME;
ALTER TABLE "CompanyCommercialAgreement" ADD COLUMN "effectiveTo" DATETIME;

INSERT INTO "CommercialPackage" (
    "id", "tier", "name", "description", "deliverables", "serviceNote",
    "maximumParticipants", "displayOrder", "internalNote"
) VALUES
(
    'commercial-package-essential', 'ESSENTIAL', 'Essential',
    'The evidence-bound report for a single trial campaign.',
    '["Core report","Trial funnel and source profile","Measured responses and consumer voice","Findings, recommendations and limitations"]',
    'No human readout unless separately purchased.',
    249, 0,
    'Catalog defaults only; the executed company agreement controls commercial terms.'
),
(
    'commercial-package-standard', 'STANDARD', 'Standard',
    'The core report plus deterministic quantitative presentation and analyst-written summary.',
    '["Everything in Essential","Distributions, percentages and charts","Evidence coverage","Analyst-written summary"]',
    'Analyst-written summary included; no human readout.',
    249, 1,
    'Catalog defaults only; the executed company agreement controls commercial terms.'
),
(
    'commercial-package-professional', 'PROFESSIONAL', 'Professional',
    'Standard-level reporting plus a human analyst readout and evidence-bound discussion.',
    '["Everything in Standard","Human analyst readout","Evidence-bound discussion with the client team"]',
    'Human analyst readout included within approved evidence boundaries.',
    249, 2,
    'Catalog defaults only; the executed company agreement controls commercial terms.'
),
(
    'commercial-package-custom', 'CUSTOM', 'Custom',
    'Non-standard scope, 250+ participants, special logistics, linked campaigns, or authorized special methodology.',
    '["Scoped statement of work","Special logistics or linked campaigns","Authorized special methodology","Scoped reporting terms"]',
    'Requires a campaign/company-specific scope note or SOW basis.',
    NULL, 3,
    'Catalog defaults only; the executed company agreement controls commercial terms.'
);

UPDATE "CommercialPackage"
SET "minimumParticipants" = 250
WHERE "tier" = 'CUSTOM';
