import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddScheduleDayToRPlanProduction1700000000042 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'r_plan_production',
      new TableColumn({
        name: 'schedule_day',
        type: 'float',
        default: 1,
        isNullable: true,
        comment: 'Schedule day value with default 1',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('r_plan_production', 'schedule_day');
  }
}
