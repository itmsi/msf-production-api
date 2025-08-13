import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableMBarge1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'm_barge',
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
            isNullable: true,
          },
          {
            name: 'shipment',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'remarks',
            type: 'varchar',
            length: '500',
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
      'm_barge',
      new TableForeignKey({
        columnNames: ['sites_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_sites',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint terlebih dahulu
    const table = await queryRunner.getTable('m_barge');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      await queryRunner.dropForeignKey('m_barge', foreignKey);
    }

    await queryRunner.dropTable('m_barge');
  }
} 