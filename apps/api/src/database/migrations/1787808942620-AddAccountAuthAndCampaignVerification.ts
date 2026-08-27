import { MigrationInterface, QueryRunner } from 'typeorm';

// Purely additive: three nullable/defaulted columns on the existing
// `consumers` table, plus two new tables. Nothing existing is altered,
// renamed, or dropped — zero risk to pre-existing rows or code paths that
// don't yet know about these columns/tables.
export class AddAccountAuthAndCampaignVerification1787808942620 implements MigrationInterface {
  name = 'AddAccountAuthAndCampaignVerification1787808942620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "consumers"
        ADD COLUMN "email" character varying(255),
        ADD COLUMN "password_hash" character varying(255),
        ADD COLUMN "email_verified" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "consumers" ADD CONSTRAINT "UQ_consumers_email" UNIQUE ("email")
    `);

    await queryRunner.query(`
      CREATE TABLE "email_verification_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "consumer_id" uuid NOT NULL,
        "token" character varying(128) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_verification_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_email_verification_tokens_token" UNIQUE ("token"),
        CONSTRAINT "FK_email_verification_tokens_consumer" FOREIGN KEY ("consumer_id")
          REFERENCES "consumers"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "campaign_verifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "consumer_id" uuid NOT NULL,
        "campaign_id" uuid NOT NULL,
        "phone" character varying(20) NOT NULL,
        "verified_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_campaign_verifications" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_campaign_verifications_consumer_campaign" UNIQUE ("consumer_id", "campaign_id"),
        CONSTRAINT "FK_campaign_verifications_consumer" FOREIGN KEY ("consumer_id")
          REFERENCES "consumers"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_campaign_verifications_campaign" FOREIGN KEY ("campaign_id")
          REFERENCES "campaigns"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "campaign_verifications"`);
    await queryRunner.query(`DROP TABLE "email_verification_tokens"`);
    await queryRunner.query(`ALTER TABLE "consumers" DROP CONSTRAINT "UQ_consumers_email"`);
    await queryRunner.query(`
      ALTER TABLE "consumers"
        DROP COLUMN "email",
        DROP COLUMN "password_hash",
        DROP COLUMN "email_verified"
    `);
  }
}
