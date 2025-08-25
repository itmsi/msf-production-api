import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentBaseDataProIdToRBaseDataPro1700000000051
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambahkan kolom parent_base_data_pro_id ke tabel r_base_data_pro
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ADD COLUMN parent_base_data_pro_id INTEGER NOT NULL`,
    );

    // Tambahkan foreign key constraint
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro ADD CONSTRAINT FK_r_base_data_pro_parent_base_data_pro_id FOREIGN KEY (parent_base_data_pro_id) REFERENCES r_parent_base_data_pro(id) ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro DROP CONSTRAINT FK_r_base_data_pro_parent_base_data_pro_id`,
    );

    // Hapus kolom parent_base_data_pro_id
    await queryRunner.query(
      `ALTER TABLE r_base_data_pro DROP COLUMN parent_base_data_pro_id`,
    );
  }
}
