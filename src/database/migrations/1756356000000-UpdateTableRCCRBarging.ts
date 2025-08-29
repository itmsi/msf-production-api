import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableRCCRBarging1756356000000 implements MigrationInterface {
  name = 'UpdateTableRCCRBarging1756356000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint untuk dumping_point_id terlebih dahulu
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP CONSTRAINT IF EXISTS FK_r_ccr_barging_dumping_point_id
    `);

    // Hapus foreign key constraint untuk unit_hauler_id yang lama
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP CONSTRAINT IF EXISTS FK_r_ccr_barging_unit_hauler_id
    `);

    // Hapus kolom dumping_point_id
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP COLUMN IF EXISTS dumping_point_id
    `);

    // Tambah foreign key constraint untuk unit_hauler_id ke tabel m_population
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD CONSTRAINT FK_r_ccr_barging_unit_hauler_id 
      FOREIGN KEY (unit_hauler_id) REFERENCES m_population(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint untuk unit_hauler_id ke m_population
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      DROP CONSTRAINT IF EXISTS FK_r_ccr_barging_unit_hauler_id
    `);

    // Tambah kembali kolom dumping_point_id
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD COLUMN dumping_point_id INT NULL
    `);

    // Tambah kembali foreign key constraint untuk dumping_point_id
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD CONSTRAINT FK_r_ccr_barging_dumping_point_id 
      FOREIGN KEY (dumping_point_id) REFERENCES m_operation_points(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Tambah kembali foreign key constraint untuk unit_hauler_id ke r_ccr_hauling
    await queryRunner.query(`
      ALTER TABLE r_ccr_barging 
      ADD CONSTRAINT FK_r_ccr_barging_unit_hauler_id_hauling 
      FOREIGN KEY (unit_hauler_id) REFERENCES r_ccr_hauling(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }
}
