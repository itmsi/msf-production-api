import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableMtdWorkHour1756400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mtd_work_hour',
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
          },
          {
            name: 'activityDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'problemType',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'duration',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
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
    await queryRunner.dropTable('mtd_work_hour');
  }
}
