import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableMOperationPoints1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'm_operation_points',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'sites_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'latitude',
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

    // Tambahkan foreign key constraint
    await queryRunner.createForeignKey(
      'm_operation_points',
      new TableForeignKey({
        columnNames: ['sites_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_sites',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint terlebih dahulu
    const table = await queryRunner.getTable('m_operation_points');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      await queryRunner.dropForeignKey('m_operation_points', foreignKey);
    }

    await queryRunner.dropTable('m_operation_points');
  }
} 