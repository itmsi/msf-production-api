import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBargeFormEndLoadingNullable1756268000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ubah field end_loading agar bisa null
    await queryRunner.query(
      `ALTER TABLE r_input_barge ALTER COLUMN end_loading DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Kembalikan field end_loading menjadi NOT NULL
    await queryRunner.query(
      `ALTER TABLE r_input_barge ALTER COLUMN end_loading SET NOT NULL`,
    );
  }
}
