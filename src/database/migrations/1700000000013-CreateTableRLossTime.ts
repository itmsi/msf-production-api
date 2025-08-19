import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableRLossTime1700000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat ENUM types terlebih dahulu
    await queryRunner.query(`
      CREATE TYPE enum_loss_type AS ENUM ('STB', 'BD')
    `);

    await queryRunner.query(`
      CREATE TYPE enum_shift_loss AS ENUM ('DS', 'NS')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'r_loss_time',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'date_activity',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'loss_type',
            type: 'enum',
            enum: ['STB', 'BD'],
            isNullable: true,
          },
          {
            name: 'shift',
            type: 'enum',
            enum: ['DS', 'NS'],
            default: "'DS'",
          },
          {
            name: 'population_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'activities_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'start',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'stop',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: (stop - start) / 60',
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
      'r_loss_time',
      new TableForeignKey({
        columnNames: ['activities_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_activities',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'r_loss_time',
      new TableForeignKey({
        columnNames: ['population_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_population',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint terlebih dahulu
    const table = await queryRunner.getTable('r_loss_time');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      await queryRunner.dropForeignKey('r_loss_time', foreignKey);
    }

    await queryRunner.dropTable('r_loss_time');

    // Hapus ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS enum_loss_type`);
    await queryRunner.query(`DROP TYPE IF EXISTS enum_shift_loss`);
  }
}
