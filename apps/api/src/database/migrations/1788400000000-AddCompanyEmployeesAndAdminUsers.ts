import { MigrationInterface, QueryRunner } from 'typeorm';

// Founder rulings W-1 (authenticated Company Employees) and W-2 (real
// TAJRIBTI Admin identity), 2026-09-02. Purely additive, mirrors the
// IF-NOT-EXISTS / duplicate-object-guarded pattern already used by
// 1788100000000-AddCompanyFoundation — safe to run twice, touches no
// existing rows/columns/constraints:
//
// 1. `brand_accounts.employee_code` — nullable, unique. The Company-
//    specific code an employee must supply to self-register (see
//    auth.service.ts employeeSignup()). Nullable so every pre-existing
//    Company (including the demo account) keeps working with employee
//    self-registration simply not yet enabled for it.
// 2. `company_employees` — new table. A REAL authenticated user (has its
//    own password_hash/email, unlike brand_contacts) scoped to exactly
//    one Company. Cascades with its owning brand_account, same as
//    brand_contacts already does.
// 3. `admin_users` — new table. A real authenticated TAJRIBTI operator
//    identity, replacing sole reliance on the static ADMIN_SECRET header
//    as the final product model (the secret remains a bootstrap/
//    migration mechanism only — see admin.controller.ts).
export class AddCompanyEmployeesAndAdminUsers1788400000000 implements MigrationInterface {
  name = 'AddCompanyEmployeesAndAdminUsers1788400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "brand_accounts" ADD COLUMN IF NOT EXISTS "employee_code" character varying(20)
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "brand_accounts" ADD CONSTRAINT "UQ_brand_accounts_employee_code" UNIQUE ("employee_code");
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "company_employees" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "brand_account_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "email" character varying(150) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_company_employees" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_company_employees_email" UNIQUE ("email"),
        CONSTRAINT "FK_company_employees_brand_account" FOREIGN KEY ("brand_account_id")
          REFERENCES "brand_accounts"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "email" character varying(150) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_admin_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admin_users_email" UNIQUE ("email")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "company_employees"`);
    await queryRunner.query(
      `ALTER TABLE "brand_accounts" DROP CONSTRAINT IF EXISTS "UQ_brand_accounts_employee_code"`,
    );
    await queryRunner.query(`ALTER TABLE "brand_accounts" DROP COLUMN IF EXISTS "employee_code"`);
  }
}
