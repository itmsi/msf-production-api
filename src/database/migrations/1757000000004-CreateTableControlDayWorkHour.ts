import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableControlDayWorkHour1757000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'control_day_work_hour',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Unit dari data master population',
          },
          {
            name: 'shift',
            type: 'varchar',
            length: '10',
            isNullable: false,
            comment: 'Shift dari Production[Shift]',
          },
          {
            name: 'filterDate',
            type: 'date',
            isNullable: false,
            comment: 'Tanggal filter',
          },
          {
            name: 'p5m',
            type: 'float',
            isNullable: true,
            comment: 'Data P5M dari Effective Working Hours',
          },
          {
            name: 'pergShift',
            type: 'float',
            isNullable: true,
            comment: 'Data Perg. Shift dari Effective Working Hours',
          },
          {
            name: 'restTime',
            type: 'float',
            isNullable: true,
            comment: 'Data Rest Time dari Effective Working Hours',
          },
          {
            name: 'gst',
            type: 'float',
            isNullable: true,
            comment: 'Data GST dari Effective Working Hours',
          },
          {
            name: 'travelling',
            type: 'float',
            isNullable: true,
            comment: 'Data Travelling dari Effective Working Hours',
          },
          {
            name: 'perbaikanFrontLoading',
            type: 'float',
            isNullable: true,
            comment: 'Data Perbaikan Front Loading dari Effective Working Hours',
          },
          {
            name: 'cekElevasi',
            type: 'float',
            isNullable: true,
            comment: 'Data Cek Elevasi dari Effective Working Hours',
          },
          {
            name: 'refuelling',
            type: 'float',
            isNullable: true,
            comment: 'Data Refuelling dari Effective Working Hours',
          },
          {
            name: 'slippery',
            type: 'float',
            isNullable: true,
            comment: 'Data Slippery dari Effective Working Hours',
          },
          {
            name: 'travellingEquipment',
            type: 'float',
            isNullable: true,
            comment: 'Data Travelling Equipment dari Effective Working Hours',
          },
          {
            name: 'fogging',
            type: 'float',
            isNullable: true,
            comment: 'Data Fogging dari Effective Working Hours',
          },
          {
            name: 'safetyTalk',
            type: 'float',
            isNullable: true,
            comment: 'Data Safety Talk dari Effective Working Hours',
          },
          {
            name: 'p2h',
            type: 'float',
            isNullable: true,
            comment: 'Data P2H dari Effective Working Hours',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Waktu pembuatan record',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            comment: 'Waktu terakhir update record',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
            comment: 'Waktu soft delete record',
          },
        ],
      }),
      true,
    );

    // Tambahkan index untuk performa query
    await queryRunner.query(`
      CREATE INDEX idx_control_day_work_hour_unit ON control_day_work_hour(unit);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_control_day_work_hour_shift ON control_day_work_hour(shift);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_control_day_work_hour_filter_date ON control_day_work_hour("filterDate");
    `);

    await queryRunner.query(`
      CREATE INDEX idx_control_day_work_hour_unit_shift_date ON control_day_work_hour(unit, shift, "filterDate");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('control_day_work_hour');
  }
}
