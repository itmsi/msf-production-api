import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableRPlanWorkingHour1700000000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'r_plan_working_hour',
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
            type: 'date',
            isNullable: true,
          },
          {
            name: 'is_calender_day',
            type: 'boolean',
            default: true,
            isNullable: true,
          },
          {
            name: 'is_holiday_day',
            type: 'boolean',
            default: false,
            isNullable: true,
          },
          {
            name: 'is_schedule_day',
            type: 'boolean',
            default: true,
            isNullable: true,
          },
          {
            name: 'working_hour',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'working_day_longshift',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'working_hour_longshift',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'mohh',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'average_day_ewh',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'average_shift_ewh',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'ob_target',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'ore_target',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'quarry',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'sr_target',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'ore_shipment',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'daily_old_stock',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: (old stock global - ore shipment + ore target)',
          },
          {
            name: 'shift_ob_target',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: (ob target / 2)',
          },
          {
            name: 'shift_ore_target',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: (ore target / 2)',
          },
          {
            name: 'shift_quarrt',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: (quarry / 2)',
          },
          {
            name: 'shift_sr_target',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: (shift ob target / shift ore target)',
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
    await queryRunner.dropTable('r_plan_working_hour');
  }
} 