import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const opsPasswordHash = await bcrypt.hash("OpsPass123!", 10);
  await prisma.opsUser.upsert({
    where: { email: "ops@tajribti.internal" },
    update: {},
    create: { email: "ops@tajribti.internal", name: "TAJRIBTI Operations", passwordHash: opsPasswordHash },
  });

  const ownerPasswordHash = await bcrypt.hash("CompanyPass123!", 10);
  const company = await prisma.company.upsert({
    where: { id: "seed-company-1" },
    update: {},
    create: {
      id: "seed-company-1",
      name: "Nile Fresh Foods",
      industry: "FMCG — Food & Beverage",
      employees: {
        create: {
          name: "Layla Hassan",
          email: "layla@nilefresh.example",
          passwordHash: ownerPasswordHash,
          role: "OWNER",
        },
      },
    },
  });

  const product = await prisma.product.upsert({
    where: { id: "seed-product-1" },
    update: {},
    create: {
      id: "seed-product-1",
      companyId: company.id,
      name: "Nile Fresh Sparkling Hibiscus",
      description: "A new sparkling hibiscus (karkade) drink, zero added sugar.",
    },
  });

  const now = new Date();
  const start = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000);

  const campaign = await prisma.campaign.upsert({
    where: { id: "seed-campaign-1" },
    update: {},
    create: {
      id: "seed-campaign-1",
      companyId: company.id,
      productId: product.id,
      name: "Sparkling Hibiscus Launch Trial",
      objective: "Validate purchase intent and taste satisfaction ahead of national retail launch.",
      audienceAgeMin: 18,
      audienceAgeMax: 45,
      audienceGender: "ANY",
      audienceCity: "Cairo",
      startDate: start,
      endDate: end,
      status: "ACTIVE",
    },
  });

  await prisma.question.upsert({
    where: { id: "seed-q-eligibility-1" },
    update: {},
    create: {
      id: "seed-q-eligibility-1",
      campaignId: campaign.id,
      stage: "ELIGIBILITY",
      type: "SINGLE_CHOICE",
      text: "Do you regularly purchase sparkling / carbonated beverages?",
      options: JSON.stringify([
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" },
      ]),
      order: 1,
      required: true,
    },
  });

  await prisma.question.upsert({
    where: { id: "seed-q-posttrial-1" },
    update: {},
    create: {
      id: "seed-q-posttrial-1",
      campaignId: campaign.id,
      stage: "POST_TRIAL",
      type: "RATING_1_5",
      text: "How would you rate the taste of Nile Fresh Sparkling Hibiscus?",
      order: 1,
      required: true,
    },
  });

  await prisma.question.upsert({
    where: { id: "seed-q-posttrial-2" },
    update: {},
    create: {
      id: "seed-q-posttrial-2",
      campaignId: campaign.id,
      stage: "POST_TRIAL",
      type: "PURCHASE_INTENT_1_5",
      text: "How likely are you to purchase this product if available at your usual store?",
      order: 2,
      required: true,
    },
  });

  await prisma.question.upsert({
    where: { id: "seed-q-posttrial-3" },
    update: {},
    create: {
      id: "seed-q-posttrial-3",
      campaignId: campaign.id,
      stage: "POST_TRIAL",
      type: "TEXT",
      text: "What did you like or dislike about the product?",
      order: 3,
      required: false,
    },
  });

  await prisma.qrSource.upsert({
    where: { id: "seed-qr-1" },
    update: {},
    create: {
      id: "seed-qr-1",
      campaignId: campaign.id,
      code: "NILE-HIBISCUS-CAIRO-001",
      label: "Cairo Mall Activation",
      activeFrom: start,
      activeTo: end,
    },
  });

  console.log("Seed complete.");
  console.log("Ops login: ops@tajribti.internal / OpsPass123!");
  console.log("Company login: layla@nilefresh.example / CompanyPass123!");
  console.log(`Campaign id: ${campaign.id}, QR code: NILE-HIBISCUS-CAIRO-001`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
