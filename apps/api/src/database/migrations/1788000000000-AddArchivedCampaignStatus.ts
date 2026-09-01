import { MigrationInterface, QueryRunner } from 'typeorm';

// Purely additive: adds one new value to the existing `campaigns_status_enum`
// Postgres type (TypeORM's default naming — table `campaigns`, column
// `status`). No existing rows, columns, or constraints are touched. Enables
// Campaign Management's archive action (Campaign Management, 2026-09-01):
// PATCH /campaigns/:id { status: 'archived' } via the campaign's owning
// brand, reusing the existing status-lifecycle update path — no new
// endpoint, no hard delete.
//
// Note: Postgres cannot run ALTER TYPE ... ADD VALUE inside the same
// transaction as a later statement that uses that value, but this
// migration only adds the value and does nothing else, so it is safe.
export class AddArchivedCampaignStatus1788000000000 implements MigrationInterface {
  name = 'AddArchivedCampaignStatus1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "campaigns_status_enum" ADD VALUE IF NOT EXISTS 'archived'
    `);
  }

  public async down(): Promise<void> {
    // Postgres has no ALTER TYPE ... DROP VALUE. Reverting would require
    // rebuilding the enum type (create new type, cast column, drop old
    // type) and is only safe if no row currently has status='archived'.
    // Deliberately not implemented — a real down-migration would need to
    // check for and handle existing archived campaigns first, which is a
    // data decision, not a schema one.
    throw new Error(
      'Irreversible: Postgres cannot drop an enum value. Revert requires a manual, ' +
        'data-aware migration if any campaign has status=archived.',
    );
  }
}
