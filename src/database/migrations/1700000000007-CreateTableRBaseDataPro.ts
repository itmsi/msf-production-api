import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableRBaseDataPro1700000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat ENUM types terlebih dahulu
    await queryRunner.query(`
      CREATE TYPE enum_shift AS ENUM ('DS', 'NS')
    `);

    await queryRunner.query(`
      CREATE TYPE enum_material AS ENUM ('biomas', 'boulder', 'ob', 'ore', 'ore-barge', 'quarry')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'r_base_data_pro',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'unit_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'activity_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'shift',
            type: 'enum',
            enum: ['DS', 'NS'],
            default: "'DS'",
          },
          {
            name: 'driver_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'start_shift',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_shift',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'km_awal',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'km_akhir',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'total_km',
            type: 'int',
            isNullable: true,
            comment: 'Calculated: (km_akhir - km_awal)',
          },
          {
            name: 'hm_awal',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'hm_akhir',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'total_hm',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: (hm_akhir - hm_awal)',
          },
          {
            name: 'loading_point_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'dumping_point_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'mround_distance',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'distance',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'total_vessel',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'material',
            type: 'enum',
            enum: ['biomas', 'boulder', 'ob', 'ore', 'ore-barge', 'quarry'],
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
      'r_base_data_pro',
      new TableForeignKey({
        columnNames: ['loading_point_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_sites',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'r_base_data_pro',
      new TableForeignKey({
        columnNames: ['dumping_point_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_sites',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints terlebih dahulu
    const table = await queryRunner.getTable('r_base_data_pro');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      await queryRunner.dropForeignKey('r_base_data_pro', foreignKey);
    }

    await queryRunner.dropTable('r_base_data_pro');
    
    // Hapus ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS enum_shift`);
    await queryRunner.query(`DROP TYPE IF EXISTS enum_material`);
  }
} 