import { MigrationInterface, QueryRunner } from 'typeorm';

// Upload capability (2026-09-02): see entities/asset.entity.ts for why this
// table exists instead of a third-party storage integration.
export class AddAssetsTable1788300000000 implements MigrationInterface {
  name = 'AddAssetsTable1788300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "assets_owner_type_enum" AS ENUM ('brand_logo', 'campaign_product_image')
    `);
    await queryRunner.query(`
      CREATE TABLE "assets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_type" "assets_owner_type_enum" NOT NULL,
        "owner_id" uuid NOT NULL,
        "mime_type" varchar(100) NOT NULL,
        "data" bytea NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_assets_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_assets_owner_type_owner_id" ON "assets" ("owner_type", "owner_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_assets_owner_type_owner_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "assets"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "assets_owner_type_enum"`);
  }
}
