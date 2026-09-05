import { MigrationInterface, QueryRunner } from 'typeorm';

// Benchmark Alignment — Campaign Creation + Audience/Eligibility
// (2026-09-06, DL-101): Three new nullable columns on the `campaigns`
// table.
//
//   objective         — varchar(500), nullable: campaign purpose/goal text.
//   audience_gender   — varchar(20), nullable: 'male' | 'female' | NULL
//                       (NULL = all genders eligible).
//   audience_age_ranges — jsonb, nullable: string[] of accepted ageRange
//                       values (NULL or empty = all ages eligible).
//
// All columns are nullable with no default, so the migration is safe
// against any existing campaign row — legacy data gets NULL on all three,
// which means "no restriction" in every eligibility check.
//
// No data back-fill is needed: NULL semantics on all three fields mean
// "campaign has no audience restrictions" — the correct, safe interpretation
// for every campaign that was created before this migration runs.
export class AddCampaignAudienceAndObjective1788600000000 implements MigrationInterface {
  name = 'AddCampaignAudienceAndObjective1788600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "objective" varchar(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "audience_gender" varchar(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "audience_age_ranges" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "audience_age_ranges"`);
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "audience_gender"`);
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "objective"`);
  }
}
