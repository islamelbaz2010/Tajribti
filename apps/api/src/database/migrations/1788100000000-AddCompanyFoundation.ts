import { MigrationInterface, QueryRunner } from 'typeorm';

// Company Foundation (2026-09-01): purely additive. Three independent
// changes, none of which touch existing rows/columns/constraints:
//
// 1. `brand_accounts.sector` — nullable enum, sourced only from locked
//    Founder decisions DL-003/DL-007 (FMCG, Beauty & Personal Care,
//    Pharma-OTC). Nullable so every pre-existing brand (incl. the demo
//    account) keeps working unset.
// 2. `brand_contacts` — new table. A responsible person at a Company; not
//    a second auth-account system (no password/login columns). Cascades
//    with its owning brand_account (deleting a Company removes its own
//    contact records, same as it already implicitly owns its campaigns).
// 3. `campaigns.contact_id` — nullable FK to brand_contacts, ON DELETE SET
//    NULL so removing a contact never touches campaign history/analytics.
export class AddCompanyFoundation1788100000000 implements MigrationInterface {
  name = 'AddCompanyFoundation1788100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "brand_accounts_sector_enum" AS ENUM ('fmcg', 'beauty_personal_care', 'pharma_otc');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "brand_accounts" ADD COLUMN IF NOT EXISTS "sector" "brand_accounts_sector_enum"
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "brand_contacts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "brand_account_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "email" character varying(150) NOT NULL,
        "role" character varying(100),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_brand_contacts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_brand_contacts_brand_account" FOREIGN KEY ("brand_account_id")
          REFERENCES "brand_accounts"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "contact_id" uuid
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "campaigns" ADD CONSTRAINT "FK_campaigns_contact"
          FOREIGN KEY ("contact_id") REFERENCES "brand_contacts"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT IF EXISTS "FK_campaigns_contact"`);
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "contact_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "brand_contacts"`);
    await queryRunner.query(`ALTER TABLE "brand_accounts" DROP COLUMN IF EXISTS "sector"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "brand_accounts_sector_enum"`);
  }
}
