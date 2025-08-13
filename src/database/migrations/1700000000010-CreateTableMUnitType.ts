import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableMUnitType1700000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.createTable(
      new Table({
        name: 'm_unit_type',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'brand',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'unit_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'type_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'model_name',
            type: 'varchar',
            length: '255',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('m_unit_type');
  }
} 