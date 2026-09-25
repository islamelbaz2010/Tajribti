// Preview-only seed extension (Vercel review deployments). Runs after
// prisma/seed.ts in vercel-build. Adds the role coverage needed for Founder
// review QA that the base seed does not create:
//   - promotes seeded Layla to COMPANY_ADMIN (Employee defaults to MEMBER)
//   - a COMPANY_MEMBER for read-only review
//   - an OPERATIONS_MANAGER and a PLATFORM_ADMIN ops account
// Not part of the product seed — preview review data only.
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.employee.update({
    where: { email: "layla@nilefresh.example" },
    data: { role: "COMPANY_ADMIN" },
  });

  const memberPasswordHash = await bcrypt.hash("CompanyPass123!", 10);
  await prisma.employee.upsert({
    where: { email: "member@nilefresh.example" },
    update: { role: "COMPANY_MEMBER" },
    create: {
      companyId: "seed-company-1",
      email: "member@nilefresh.example",
      name: "Omar Khalil",
      passwordHash: memberPasswordHash,
      role: "COMPANY_MEMBER",
    },
  });

  const opsPasswordHash = await bcrypt.hash("OpsPass123!", 10);
  await prisma.opsUser.upsert({
    where: { email: "opsmanager@tajribti.internal" },
    update: { role: "OPERATIONS_MANAGER" },
    create: {
      email: "opsmanager@tajribti.internal",
      name: "TAJRIBTI Operations Manager",
      passwordHash: opsPasswordHash,
      role: "OPERATIONS_MANAGER",
    },
  });

  // Model A preview: the governing commercial agreement exists from
  // onboarding/account setup as an explicit DRAFT row. No placeholder prices
  // or contract dates are presented as final values; Platform Admin completes
  // the actual configured terms during review.
  await prisma.companyCommercialAgreement.upsert({
    where: { companyId: "seed-company-1" },
    update: {},
    create: {
      companyId: "seed-company-1",
      packageTier: "ESSENTIAL",
      contractedParticipantBasis: "PER_CAMPAIGN_SCOPE",
      fulfillmentModel: "POINT_OF_TRIAL",
      agreementStatus: "DRAFT",
      paymentMethod: "MANUAL_BANK_TRANSFER",
      paymentStatus: "QUOTE_DRAFT",
    },
  });

  const adminPasswordHash = await bcrypt.hash("PlatformPass123!", 10);
  await prisma.opsUser.upsert({
    where: { email: "platform@tajribti.internal" },
    update: { role: "PLATFORM_ADMIN" },
    create: {
      email: "platform@tajribti.internal",
      name: "TAJRIBTI Platform Admin",
      passwordHash: adminPasswordHash,
      role: "PLATFORM_ADMIN",
    },
  });

  console.log("Preview seed complete.");
  console.log("Company member: member@nilefresh.example / CompanyPass123!");
  console.log("Ops manager: opsmanager@tajribti.internal / OpsPass123!");
  console.log("Platform admin: platform@tajribti.internal / PlatformPass123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
