import { MigrationInterface, QueryRunner } from 'typeorm';

// DL-105 (2026-09-06): QR source attribution — Zamplit benchmark:
// "QR codes and campaign sources can be tracked." A nullable label allows
// each QR code to represent a distinct physical or digital placement (e.g.
// "Mall Entrance", "Social Media", "Street Poster"). Redemption events
// already carry qr_code_id, so source attribution is queryable as soon as
// the label exists on the row.  No default value — the original
// auto-generated QR per campaign has label NULL (unlabelled primary QR);
// only explicitly created source QRs carry a label.
export class AddQrCodeLabel1788610000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE qr_codes
        ADD COLUMN IF NOT EXISTS label VARCHAR(100) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE qr_codes DROP COLUMN IF EXISTS label
    `);
  }
}
