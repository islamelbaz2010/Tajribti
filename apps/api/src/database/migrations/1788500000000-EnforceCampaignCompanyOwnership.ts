import { MigrationInterface, QueryRunner } from 'typeorm';

// Product Reference Alignment (2026-09-02), Phase 16: Founder requirement
// "Every Campaign belongs to a Company." `campaigns.brand_account_id` has
// been nullable since the column was introduced — this migration enforces
// the invariant now that the precondition has actually been verified, not
// assumed:
//   - local dev DB (tajribti_demo): 0 nulls / 3 campaigns
//   - production (Railway): 0 nulls / 7 campaigns, checked via a
//     read-only query over an authorized SSH tunnel (see DECISION_LOG.md)
// The `up()` migration re-checks this itself at migration time (not just
// trusting the prior manual check) and raises a clear error instead of
// silently enforcing a constraint that would corrupt an unexpected row —
// no blind ALTER.
export class EnforceCampaignCompanyOwnership1788500000000 implements MigrationInterface {
  name = 'EnforceCampaignCompanyOwnership1788500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ count }] = await queryRunner.query(
      `SELECT count(*)::int AS count FROM "campaigns" WHERE "brand_account_id" IS NULL`,
    );
    if (count > 0) {
      throw new Error(
        `EnforceCampaignCompanyOwnership: refusing to enforce NOT NULL — ${count} campaign(s) have a null brand_account_id. ` +
          `Resolve those rows manually (this migration does not invent an owner) before re-running.`,
      );
    }
    await queryRunner.query(`ALTER TABLE "campaigns" ALTER COLUMN "brand_account_id" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaigns" ALTER COLUMN "brand_account_id" DROP NOT NULL`);
  }
}
