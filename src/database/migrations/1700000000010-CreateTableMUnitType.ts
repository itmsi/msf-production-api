import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableMUnitType1700000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat ENUM type untuk nama unit
    await queryRunner.query(`
      CREATE TYPE enum_unit_type_name AS ENUM (
        'dump-truck', 'exca', 'water-truck', 'fuel-truck', 'motor-greader', 
        'wheel-loader', 'genset', 'lamp-tower', 'light-vehicle', 'looker', 
        'main-hauler', 'compactor', 'dozer'
      )
    `);

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
            name: 'name',
            type: 'enum',
            enum: [
              'dump-truck', 'exca', 'water-truck', 'fuel-truck', 'motor-greader',
              'wheel-loader', 'genset', 'lamp-tower', 'light-vehicle', 'looker',
              'main-hauler', 'compactor', 'dozer'
            ],
            isNullable: false,
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
    // Hapus ENUM type
    await queryRunner.query(`DROP TYPE IF EXISTS enum_unit_type_name`);
  }
} 