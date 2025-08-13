import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableMPopulation1700000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat ENUM types terlebih dahulu
    await queryRunner.query(`
      CREATE TYPE enum_population_status AS ENUM ('active', 'inactive')
    `);

    await queryRunner.query(`
      CREATE TYPE enum_last_unit_no AS ENUM (null, 'new-unit', 'second-unit')
    `);

    await queryRunner.query(`
      CREATE TYPE enum_tyre_type AS ENUM ('6x4', '8x4')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'm_population',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'no_unit',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'date_arrive',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive'],
            default: "'active'",
          },
          {
            name: 'variant_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'no_unit_system',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'engine_brand_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'activities_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'remarks',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'site_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'last_unit_number',
            type: 'enum',
            enum: ['null', 'new-unit', 'second-unit'],
            isNullable: true,
          },
          {
            name: 'tyre_type',
            type: 'enum',
            enum: ['6x4', '8x4'],
            isNullable: true,
          },
          {
            name: 'company',
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

    // Tambahkan foreign key constraints
    await queryRunner.createForeignKey(
      'm_population',
      new TableForeignKey({
        columnNames: ['variant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_unit_variant',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'm_population',
      new TableForeignKey({
        columnNames: ['activities_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_activities',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'm_population',
      new TableForeignKey({
        columnNames: ['site_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_sites',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'm_population',
      new TableForeignKey({
        columnNames: ['engine_brand_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_engine_brand',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints terlebih dahulu
    const table = await queryRunner.getTable('m_population');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      await queryRunner.dropForeignKey('m_population', foreignKey);
    }

    await queryRunner.dropTable('m_population');
    
    // Hapus ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS enum_population_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS enum_population_brand`);
    await queryRunner.query(`DROP TYPE IF EXISTS enum_population_model`);
    await queryRunner.query(`DROP TYPE IF EXISTS enum_population_engine_brand`);
    await queryRunner.query(`DROP TYPE IF EXISTS enum_last_unit_no`);
    await queryRunner.query(`DROP TYPE IF EXISTS enum_tyre_type`);
  }
} 