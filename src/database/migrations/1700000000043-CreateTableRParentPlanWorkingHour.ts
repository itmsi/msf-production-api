import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableRParentPlanWorkingHour1700000000043
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'r_parent_plan_working_hour',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'plan_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'total_calendar_day',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'total_holiday_day',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'total_available_day',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'total_working_hour',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'total_working_day_longshift',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'working_hour_longshift',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'total_mohh_per_month',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('r_parent_plan_working_hour');
  }
}
