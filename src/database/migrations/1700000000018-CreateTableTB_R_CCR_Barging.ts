import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableTB_R_CCR_Barging1700000000018
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat tabel TB_R_CCR_Barging
    await queryRunner.createTable(
      new Table({
        name: 'r_ccr_barging',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'activity_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'shift',
            type: 'enum',
            enum: ['ds', 'ns'],
            isNullable: false,
          },
          {
            name: 'time',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'unit_hauler_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'barge_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'dumping_point_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'vessel',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'total_tonnage',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdBy',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedBy',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'deletedBy',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Tambahkan foreign key constraints
    await queryRunner.createForeignKey(
      'r_ccr_barging',
      new TableForeignKey({
        columnNames: ['barge_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_barge',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'r_ccr_barging',
      new TableForeignKey({
        columnNames: ['dumping_point_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_operation_points',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'r_ccr_barging',
      new TableForeignKey({
        columnNames: ['unit_hauler_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'r_ccr_hauling',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints
    const table = await queryRunner.getTable('r_ccr_barging');
    if (table) {
      const foreignKeys = table.foreignKeys;

      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('r_ccr_barging', foreignKey);
      }
    }

    // Hapus tabel
    await queryRunner.dropTable('r_ccr_barging');
  }
}
