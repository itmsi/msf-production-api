import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRBaseDataProAndCreateRParentBaseDataPro1700000000050
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Buat tabel baru r_parent_base_data_pro
    await queryRunner.query(`
      CREATE TABLE r_parent_base_data_pro (
        id SERIAL PRIMARY KEY,
        unit_id INTEGER NOT NULL,
        activity_date TIMESTAMP NOT NULL,
        shift VARCHAR(2) CHECK (shift IN ('ds', 'ns')) NOT NULL,
        driver_id INTEGER NOT NULL,
        start_shift TIMESTAMP NULL,
        end_shift TIMESTAMP NULL
      )
    `);

    // 2. Hapus kolom dari tabel r_base_data_pro
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro DROP COLUMN unit_id`,
    );
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro DROP COLUMN activity_date`,
    );
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro DROP COLUMN shift`,
    );
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro DROP COLUMN driver_id`,
    );
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro DROP COLUMN start_shift`,
    );
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro DROP COLUMN end_shift`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Tambahkan kembali kolom ke tabel r_base_data_pro
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ADD COLUMN unit_id INT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ADD COLUMN activity_date DATETIME NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ADD COLUMN shift ENUM('ds', 'ns') NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ADD COLUMN driver_id INT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ADD COLUMN start_shift DATETIME NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ADD COLUMN end_shift DATETIME NULL`,
    );

    // 2. Hapus tabel r_parent_base_data_pro
    await queryRunner.query(`DROP TABLE r_parent_base_data_pro`);
  }
}
