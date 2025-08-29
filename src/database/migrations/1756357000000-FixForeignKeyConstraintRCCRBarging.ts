import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixForeignKeyConstraintRCCRBarging1756357000000 implements MigrationInterface {
  name = 'FixForeignKeyConstraintRCCRBarging1756357000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop semua foreign key constraint yang ada
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP CONSTRAINT IF EXISTS FK_d95b4fc1959f4e6bcef027d5a6b
    `);

    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP CONSTRAINT IF EXISTS FK_r_ccr_barging_unit_hauler_id
    `);

    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP CONSTRAINT IF EXISTS FK_r_ccr_barging_barge_id
    `);

    // Recreate foreign key constraint untuk unit_hauler_id ke m_population
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD CONSTRAINT FK_r_ccr_barging_unit_hauler_id 
      FOREIGN KEY (unit_hauler_id) REFERENCES m_population(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Recreate foreign key constraint untuk barge_id ke m_barge
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD CONSTRAINT FK_r_ccr_barging_barge_id 
      FOREIGN KEY (barge_id) REFERENCES m_barge(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints yang baru dibuat
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP CONSTRAINT IF EXISTS FK_r_ccr_barging_unit_hauler_id
    `);

    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP CONSTRAINT IF EXISTS FK_r_ccr_barging_barge_id
    `);

    // Recreate constraint lama jika ada
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD CONSTRAINT FK_d95b4fc1959f4e6bcef027d5a6b 
      FOREIGN KEY (unit_hauler_id) REFERENCES r_ccr_hauling(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }
}
