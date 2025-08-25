import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableRPlanWorkingHourDetail1700000000029
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat tabel baru r_plan_working_hour_detail
    await queryRunner.createTable(
      new Table({
        name: 'r_plan_working_hour_detail',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'plant_working_hour_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'activities_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'activities_hour',
            type: 'float',
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
    );

    // Tambah foreign key constraint untuk plant_working_hour_id
    await queryRunner.createForeignKey(
      'r_plan_working_hour_detail',
      new TableForeignKey({
        columnNames: ['plant_working_hour_id'],
        referencedTableName: 'r_plan_working_hour',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Tambah foreign key constraint untuk activities_id
    await queryRunner.createForeignKey(
      'r_plan_working_hour_detail',
      new TableForeignKey({
        columnNames: ['activities_id'],
        referencedTableName: 'm_activities',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints dari tabel detail
    const detailTable = await queryRunner.getTable(
      'r_plan_working_hour_detail',
    );
    if (detailTable) {
      const foreignKeys = detailTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey(
          'r_plan_working_hour_detail',
          foreignKey,
        );
      }
    }

    // Hapus tabel detail
    await queryRunner.dropTable('r_plan_working_hour_detail');
  }
}
