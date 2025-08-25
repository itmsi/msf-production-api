import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScheduleDayColumnToPlanWorkingHour1700000000038 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'schedule_day',
        type: 'float',
        default: 1,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('r_plan_working_hour', 'schedule_day');
  }
}
