import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOperationPointsForeignKeysToBaseDataPro1757000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambahkan foreign key constraint untuk loading_point_id ke m_operation_points
    await queryRunner.query(`
      ALTER TABLE r_base_data_pro 
      ADD CONSTRAINT FK_r_base_data_pro_loading_point_id 
      FOREIGN KEY (loading_point_id) REFERENCES m_operation_points(id) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // Tambahkan foreign key constraint untuk dumping_point_id ke m_operation_points
    await queryRunner.query(`
      ALTER TABLE r_base_data_pro 
      ADD CONSTRAINT FK_r_base_data_pro_dumping_point_id 
      FOREIGN KEY (dumping_point_id) REFERENCES m_operation_points(id) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // Tambahkan foreign key constraint untuk dumping_point_op_id ke m_operation_points
    await queryRunner.query(`
      ALTER TABLE r_base_data_pro 
      ADD CONSTRAINT FK_r_base_data_pro_dumping_point_op_id 
      FOREIGN KEY (dumping_point_op_id) REFERENCES m_operation_points(id) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // Tambahkan foreign key constraint untuk dumping_point_barge_id ke m_barge
    await queryRunner.query(`
      ALTER TABLE r_base_data_pro 
      ADD CONSTRAINT FK_r_base_data_pro_dumping_point_barge_id 
      FOREIGN KEY (dumping_point_barge_id) REFERENCES m_barge(id) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // Skip parent_base_data_pro_id constraint karena sudah ada
    // await queryRunner.query(`
    //   ALTER TABLE r_base_data_pro
    //   ADD CONSTRAINT FK_r_base_data_pro_parent_base_data_pro_id
    //   FOREIGN KEY (parent_base_data_pro_id) REFERENCES r_parent_base_data_pro(id)
    //   ON DELETE CASCADE ON UPDATE CASCADE
    // `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints
    await queryRunner.query(`
      ALTER TABLE r_base_data_pro 
      DROP CONSTRAINT IF EXISTS FK_r_base_data_pro_loading_point_id
    `);

    await queryRunner.query(`
      ALTER TABLE r_base_data_pro 
      DROP CONSTRAINT IF EXISTS FK_r_base_data_pro_dumping_point_id
    `);

    await queryRunner.query(`
      ALTER TABLE r_base_data_pro 
      DROP CONSTRAINT IF EXISTS FK_r_base_data_pro_dumping_point_op_id
    `);

    await queryRunner.query(`
      ALTER TABLE r_base_data_pro 
      DROP CONSTRAINT IF EXISTS FK_r_base_data_pro_dumping_point_barge_id
    `);

    await queryRunner.query(`
      ALTER TABLE r_base_data_pro 
      DROP CONSTRAINT IF EXISTS FK_r_base_data_pro_parent_base_data_pro_id
    `);
  }
}
