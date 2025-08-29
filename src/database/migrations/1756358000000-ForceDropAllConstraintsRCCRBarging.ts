import { MigrationInterface, QueryRunner } from 'typeorm';

export class ForceDropAllConstraintsRCCRBarging1756358000000 implements MigrationInterface {
  name = 'ForceDropAllConstraintsRCCRBarging1756358000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cek dan drop semua foreign key constraint yang ada
    const constraints = await queryRunner.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'r_ccr_barging'::regclass 
      AND contype = 'f'
    `);

    console.log('Found constraints:', constraints);

    // Drop semua constraint yang ditemukan
    for (const constraint of constraints) {
      await queryRunner.query(`
        ALTER TABLE r_ccr_barging 
        DROP CONSTRAINT IF EXISTS "${constraint.conname}"
      `);
    }

    // Pastikan kolom unit_hauler_id dan barge_id ada
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD COLUMN IF NOT EXISTS unit_hauler_id INTEGER
    `);

    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD COLUMN IF NOT EXISTS barge_id INTEGER
    `);

    // Tambah foreign key constraint baru
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD CONSTRAINT FK_r_ccr_barging_unit_hauler_id_new
      FOREIGN KEY (unit_hauler_id) REFERENCES m_population(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD CONSTRAINT FK_r_ccr_barging_barge_id_new
      FOREIGN KEY (barge_id) REFERENCES m_barge(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop constraint baru
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP CONSTRAINT IF EXISTS FK_r_ccr_barging_unit_hauler_id_new
    `);

    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP CONSTRAINT IF EXISTS FK_r_ccr_barging_barge_id_new
    `);
  }
}
