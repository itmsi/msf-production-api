import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
} from 'typeorm';

export class AddWorkingLongshiftColumnToRPlanWorkingHour1756361000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambah kolom working_longshift
    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'working_longshift',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus kolom working_longshift
    await queryRunner.dropColumn(
      'r_plan_working_hour',
      'working_longshift',
    );
  }
}
