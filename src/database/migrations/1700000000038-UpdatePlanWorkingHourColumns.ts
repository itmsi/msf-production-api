import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePlanWorkingHourColumns1700000000038
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename kolom working_hour menjadi working_hour_month
    await queryRunner.query(
      `ALTER TABLE r_plan_working_hour RENAME COLUMN working_hour TO working_hour_month`,
    );

    // Tambah kolom working_hour_day
    await queryRunner.query(
      `ALTER TABLE r_plan_working_hour ADD COLUMN working_hour_day int`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus kolom working_hour_day
    await queryRunner.query(
      `ALTER TABLE r_plan_working_hour DROP COLUMN working_hour_day`,
    );

    // Rename kembali kolom working_hour_month menjadi working_hour
    await queryRunner.query(
      `ALTER TABLE r_plan_working_hour RENAME COLUMN working_hour_month TO working_hour`,
    );
  }
}
