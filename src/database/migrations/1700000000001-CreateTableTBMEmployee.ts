import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableTBMEmployee1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat ENUM type terlebih dahulu
    await queryRunner.query(`
      CREATE TYPE enum_employee_status AS ENUM ('active', 'inactive', 'resign', 'on-leave')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'm_employee',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'department',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'position',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'nip',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'resign', 'on-leave'],
            default: "'active'",
          },
          {
            name: 'salary',
            type: 'varchar',
            length: '50',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('m_employee');
    // Hapus ENUM type
    await queryRunner.query(`DROP TYPE IF EXISTS enum_employee_status`);
  }
}
