import { MigrationInterface, QueryRunner } from 'typeorm';

// B-04 (QR Concurrency Load Test) remediation, 2026-09-01.
//
// RISK_REGISTER.md R-TECH-01 and MASTER_DELIVERY_PLAN.md's TJ-005 acceptance
// criteria both document "DB-level unique constraint on (consumer_id,
// campaign_id)" as the concurrency mitigation for real (non-demo) QR
// redemption. A focused local load test this session proved that
// constraint was never actually created: 50 concurrent redemption requests
// from one consumer against one campaign produced 50 separate
// `redemption_events` rows instead of one. This migration adds the
// constraint the governance documents already claimed existed.
//
// Scoped as a PARTIAL unique index (`WHERE is_demo_seed = false`) rather
// than a plain unique constraint: `qr.service.ts` intentionally exempts
// DEMO-status QR codes from the duplicate-redemption check (see
// `redeemQr()`'s `isDemo` branch) to allow repeated live walkthrough/demo
// scans. A non-partial constraint would break that existing, intentional
// behavior. Real consumer redemptions (`is_demo_seed = false`, which is
// every row `redeemQr()`/`enterCampaignWeb()` ever create) are exactly
// what this constraint protects.
export class AddRedemptionUniqueConstraint1788200000000 implements MigrationInterface {
  name = 'AddRedemptionUniqueConstraint1788200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_redemption_events_consumer_campaign_real"
      ON "redemption_events" ("consumer_id", "campaign_id")
      WHERE "is_demo_seed" = false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_redemption_events_consumer_campaign_real"
    `);
  }
}
