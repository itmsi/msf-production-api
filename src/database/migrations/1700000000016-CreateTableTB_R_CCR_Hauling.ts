import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTableTB_R_CCR_Hauling1700000000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat tabel TB_R_CCR_Hauling
    await queryRunner.createTable(
      new Table({
        name: 'r_ccr_hauling',
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
            name: 'time_range',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'unit_loading_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'unit_hauler_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'material',
            type: 'enum',
            enum: ['biomas', 'boulder', 'ob', 'ore', 'ore-barge', 'quarry'],
            isNullable: false,
          },
          {
            name: 'loading_point_id',
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
            isNullable: true,
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

    // Tambahkan foreign key constraints
    await queryRunner.createForeignKey(
      'r_ccr_hauling',
      new TableForeignKey({
        columnNames: ['unit_loading_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_population',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'r_ccr_hauling',
      new TableForeignKey({
        columnNames: ['unit_hauler_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_population',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'r_ccr_hauling',
      new TableForeignKey({
        columnNames: ['loading_point_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_operation_points',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'r_ccr_hauling',
      new TableForeignKey({
        columnNames: ['dumping_point_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_operation_points',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints
    const table = await queryRunner.getTable('r_ccr_hauling');
    if (table) {
      const foreignKeys = table.foreignKeys;
      
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('r_ccr_hauling', foreignKey);
      }
    }

    // Hapus tabel
    await queryRunner.dropTable('r_ccr_hauling');
  }
}
