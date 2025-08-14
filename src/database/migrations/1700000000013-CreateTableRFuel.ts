import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableRFuel1700000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat ENUM type untuk uom
    await queryRunner.query(`
      CREATE TYPE enum_fuel_uom AS ENUM ('none', 'liter')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'r_fuel',
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
            isNullable: false,
          },
          {
            name: 'activity_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'part_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'operator_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'last_refueling_hm',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'now_refueling_hm',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'running_refueling_hm',
            type: 'float',
            isNullable: false,
            comment: 'Calculated: (now - last)',
          },
          {
            name: 'last_refueling_km',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'now_refueling_km',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'running_refueling_km',
            type: 'float',
            isNullable: false,
            comment: 'Calculated: (now - last)',
          },
          {
            name: 'qty_supply',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'uom',
            type: 'enum',
            enum: ['none', 'liter'],
            isNullable: false,
          },
          {
            name: 'l_per_km',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: qty_supply / running_refueling_km',
          },
          {
            name: 'l_per_hm',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: qty_supply / running_refueling_hm',
          },
          {
            name: 'start_refueling_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'end_refueling_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lead_time_refueling_time',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: start - end refueling time',
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

    // Tambahkan foreign key constraint
    await queryRunner.createForeignKey(
      'r_fuel',
      new TableForeignKey({
        columnNames: ['unit_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_population',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint terlebih dahulu
    const table = await queryRunner.getTable('r_fuel');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      await queryRunner.dropForeignKey('r_fuel', foreignKey);
    }

    await queryRunner.dropTable('r_fuel');
    
    // Hapus ENUM type
    await queryRunner.query(`DROP TYPE IF EXISTS enum_fuel_uom`);
  }
} 