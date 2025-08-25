import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddParentPlanWorkingHourIdToRPlanWorkingHour1700000000044
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambah kolom parent_plan_working_hour_id
    await queryRunner.addColumn(
      'r_plan_working_hour',
      new TableColumn({
        name: 'parent_plan_working_hour_id',
        type: 'int',
        isNullable: true,
      }),
    );

    // Tambah foreign key constraint
    await queryRunner.createForeignKey(
      'r_plan_working_hour',
      new TableForeignKey({
        columnNames: ['parent_plan_working_hour_id'],
        referencedTableName: 'r_parent_plan_working_hour',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint
    const table = await queryRunner.getTable('r_plan_working_hour');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('parent_plan_working_hour_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('r_plan_working_hour', foreignKey);
      }
    }

    // Hapus kolom parent_plan_working_hour_id
    await queryRunner.dropColumn(
      'r_plan_working_hour',
      'parent_plan_working_hour_id',
    );
  }
}
