import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateTableRPlanWorkingHour1700000000028
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop kolom yang tidak diperlukan
    await queryRunner.dropColumn('r_plan_working_hour', 'average_day_ewh');
    await queryRunner.dropColumn('r_plan_working_hour', 'average_shift_ewh');
    await queryRunner.dropColumn('r_plan_working_hour', 'ob_target');
    await queryRunner.dropColumn('r_plan_working_hour', 'ore_target');
    await queryRunner.dropColumn('r_plan_working_hour', 'quarry');
    await queryRunner.dropColumn('r_plan_working_hour', 'sr_target');
    await queryRunner.dropColumn('r_plan_working_hour', 'ore_shipment');
    await queryRunner.dropColumn('r_plan_working_hour', 'daily_old_stock');
    await queryRunner.dropColumn('r_plan_working_hour', 'shift_ob_target');
    await queryRunner.dropColumn('r_plan_working_hour', 'shift_ore_target');
    await queryRunner.dropColumn('r_plan_working_hour', 'shift_quarrt');
    await queryRunner.dropColumn('r_plan_working_hour', 'shift_sr_target');

    // Update kolom yang ada
    await queryRunner.changeColumn(
      'r_plan_working_hour',
      'working_hour',
      new TableColumn({
        name: 'working_hour',
        type: 'float',
        isNullable: true,
      }),
    );

    await queryRunner.changeColumn(
      'r_plan_working_hour',
      'mohh',
      new TableColumn({
        name: 'mohh_per_month',
        type: 'float',
        isNullable: true,
      }),
    );

    // Hapus kolom activities_id dan activities_hour dari tabel utama
    // karena akan dipindah ke tabel detail
    await queryRunner.dropColumn('r_plan_working_hour', 'activities_id');
    await queryRunner.dropColumn('r_plan_working_hour', 'activities_hour');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Tambah kembali kolom activities_id dan activities_hour ke tabel utama
    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'activities_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'activities_hour',
        type: 'float',
        isNullable: true,
      }),
    );

    // Kembalikan kolom yang diubah
    await queryRunner.changeColumn(
      'r_plan_working_hour',
      'mohh_per_month',
      new TableColumn({
        name: 'mohh',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.changeColumn(
      'r_plan_working_hour',
      'working_hour',
      new TableColumn({
        name: 'working_hour',
        type: 'int',
        isNullable: true,
      }),
    );

    // Tambah kembali kolom yang dihapus
    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'average_day_ewh',
        type: 'float',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'average_shift_ewh',
        type: 'float',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'ob_target',
        type: 'float',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'ore_target',
        type: 'float',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'quarry',
        type: 'float',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'sr_target',
        type: 'float',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'ore_shipment',
        type: 'float',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'daily_old_stock',
        type: 'float',
        isNullable: true,
        comment:
          'Calculated: (old stock global - ore shipment + ore target)',
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'shift_ob_target',
        type: 'float',
        isNullable: true,
        comment: 'Calculated: (ob target / 2)',
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'shift_ore_target',
        type: 'float',
        isNullable: true,
        comment: 'Calculated: (ore target / 2)',
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'shift_quarrt',
        type: 'float',
        isNullable: true,
        comment: 'Calculated: (quarry / 2)',
      }),
    );

    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'shift_sr_target',
        type: 'float',
        isNullable: true,
        comment: 'Calculated: (shift ob target / shift ore target)',
      }),
    );
  }
}
