import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRemarksColumnToRLossTime1700000000056 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambahkan kolom remarks ke tabel r_loss_time
    await queryRunner.query(`
      ALTER TABLE r_loss_time 
      ADD COLUMN remarks TEXT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus kolom remarks dari tabel r_loss_time
    await queryRunner.query(`
      ALTER TABLE r_loss_time 
      DROP COLUMN remarks
    `);
  }
}
