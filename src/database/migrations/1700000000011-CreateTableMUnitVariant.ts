import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableMUnitVariant1700000000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE enum_unit_variant_tyre_type AS ENUM ('6x4', '8x4')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'm_unit_variant',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'unit_type_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'no_unit',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'vin_number',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'tyre_type',
            type: 'enum',
            enum: ['6x4', '8x4'],
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
      'm_unit_variant',
      new TableForeignKey({
        columnNames: ['unit_type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_unit_type',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint terlebih dahulu
    const table = await queryRunner.getTable('m_unit_variant');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      await queryRunner.dropForeignKey('m_unit_variant', foreignKey);
    }

    await queryRunner.dropTable('m_unit_variant');

    await queryRunner.query(`DROP TYPE IF EXISTS enum_unit_variant_tyre_type`);
  }
} 