import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableRCCRHauling1700000000100 implements MigrationInterface {
  name = 'UpdateTableRCCRHauling1700000000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hapus kolom dumping_point_id
    await queryRunner.query(`ALTER TABLE r_ccr_hauling DROP COLUMN dumping_point_id`);
    
    // Tambah kolom dumping_point_op_id
    await queryRunner.query(`ALTER TABLE r_ccr_hauling ADD COLUMN dumping_point_op_id INT NULL`);
    
    // Tambah kolom dumping_point_barge_id
    await queryRunner.query(`ALTER TABLE r_ccr_hauling ADD COLUMN dumping_point_barge_id INT NULL`);
    
    // Tambah foreign key constraints
    await queryRunner.query(`ALTER TABLE r_ccr_hauling ADD CONSTRAINT FK_r_ccr_hauling_dumping_point_op_id FOREIGN KEY (dumping_point_op_id) REFERENCES m_operation_points(id)`);
    await queryRunner.query(`ALTER TABLE r_ccr_hauling ADD CONSTRAINT FK_r_ccr_hauling_dumping_point_barge_id FOREIGN KEY (dumping_point_barge_id) REFERENCES m_barge(id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints
    await queryRunner.query(`ALTER TABLE r_ccr_hauling DROP CONSTRAINT FK_r_ccr_hauling_dumping_point_op_id`);
    await queryRunner.query(`ALTER TABLE r_ccr_hauling DROP CONSTRAINT FK_r_ccr_hauling_dumping_point_barge_id`);
    
    // Hapus kolom yang ditambahkan
    await queryRunner.query(`ALTER TABLE r_ccr_hauling DROP COLUMN dumping_point_op_id`);
    await queryRunner.query(`ALTER TABLE r_ccr_hauling DROP COLUMN dumping_point_barge_id`);
    
    // Tambah kembali kolom dumping_point_id
    await queryRunner.query(`ALTER TABLE r_ccr_hauling ADD COLUMN dumping_point_id INT NULL`);
  }
}
