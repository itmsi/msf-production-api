import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableRInputBarge1700000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'r_input_barge',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'barge_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'start_loading',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'end_loading',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'barge',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'capacity',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'total_vessel',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'vol_by_survey',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'capacity_per_dt',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: (vol_by_survey / total_vessel)',
          },
          {
            name: 'achievment',
            type: 'float',
            isNullable: true,
            comment: 'Calculated: (vol_by_survey / capacity)',
          },
          {
            name: 'remarks',
            type: 'varchar',
            length: '500',
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
      'r_input_barge',
      new TableForeignKey({
        columnNames: ['barge_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_barge',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint terlebih dahulu
    const table = await queryRunner.getTable('r_input_barge');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      await queryRunner.dropForeignKey('r_input_barge', foreignKey);
    }

    await queryRunner.dropTable('r_input_barge');
  }
} 