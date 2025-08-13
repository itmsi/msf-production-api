import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTableTB_R_CCR_Hauling_Problem1700000000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat tabel TB_R_CCR_Hauling_Problem
    await queryRunner.createTable(
      new Table({
        name: 'r_ccr_hauling_problem',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'activity_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'shift',
            type: 'enum',
            enum: ['ds', 'ns'],
            isNullable: false,
          },
          {
            name: 'activities_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'start',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'finish',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'duration',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'remark',
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

    // Tambahkan foreign key constraint untuk activities_id
    await queryRunner.createForeignKey(
      'r_ccr_hauling_problem',
      new TableForeignKey({
        columnNames: ['activities_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'r_ccr_hauling',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints
    const table = await queryRunner.getTable('r_ccr_hauling_problem');
    if (table) {
      const foreignKeys = table.foreignKeys;
      
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('r_ccr_hauling_problem', foreignKey);
      }
    }

    // Hapus tabel
    await queryRunner.dropTable('r_ccr_hauling_problem');
  }
}
