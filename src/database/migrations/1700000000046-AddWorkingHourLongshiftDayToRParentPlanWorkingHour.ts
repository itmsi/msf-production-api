import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddWorkingHourLongshiftDayToRParentPlanWorkingHour1700000000046
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambah kolom working_hour_longshift_day ke tabel r_parent_plan_working_hour
    await queryRunner.addColumn(
      'r_parent_plan_working_hour',
      new TableColumn({
        name: 'working_hour_longshift_day',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        comment: 'Working hour untuk longshift per hari',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus kolom working_hour_longshift_day dari tabel r_parent_plan_working_hour
    await queryRunner.dropColumn(
      'r_parent_plan_working_hour',
      'working_hour_longshift_day',
    );
  }
}
