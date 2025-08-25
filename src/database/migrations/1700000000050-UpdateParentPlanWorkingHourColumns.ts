import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateParentPlanWorkingHourColumns1700000000050
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename kolom total_working_hour menjadi total_working_hour_month
    await queryRunner.query(
      `ALTER TABLE r_parent_plan_working_hour RENAME COLUMN total_working_hour TO total_working_hour_month`,
    );

    // Rename kolom working_hour_longshift menjadi total_working_hour_day
    await queryRunner.query(
      `ALTER TABLE r_parent_plan_working_hour RENAME COLUMN working_hour_longshift TO total_working_hour_day`,
    );

    // Rename kolom total_working_day_longshift menjadi total_working_day_longshift (tidak berubah)
    // Kolom ini sudah sesuai namanya

    // Rename kolom working_hour_longshift_day menjadi total_working_hour_longshift
    await queryRunner.query(
      `ALTER TABLE r_parent_plan_working_hour RENAME COLUMN working_hour_longshift_day TO total_working_hour_longshift`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename kembali kolom total_working_hour_month menjadi total_working_hour
    await queryRunner.query(
      `ALTER TABLE r_parent_plan_working_hour RENAME COLUMN total_working_hour_month TO total_working_hour`,
    );

    // Rename kembali kolom total_working_hour_day menjadi working_hour_longshift
    await queryRunner.query(
      `ALTER TABLE r_parent_plan_working_hour RENAME COLUMN total_working_hour_day TO working_hour_longshift`,
    );

    // Rename kembali kolom total_working_hour_longshift menjadi working_hour_longshift_day
    await queryRunner.query(
      `ALTER TABLE r_parent_plan_working_hour RENAME COLUMN total_working_hour_longshift TO working_hour_longshift_day`,
    );
  }
}
