import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTableTB_R_User_Role1700000000020
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'r_user_role',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'role_id',
            type: 'int',
            isNullable: false,
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
        ],
      }),
      true,
    );

    // Tambahkan foreign key constraints
    await queryRunner.createForeignKey(
      'r_user_role',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'r_user_role',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_role',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Tambahkan unique constraint untuk mencegah duplikasi
    await queryRunner.query(`
      ALTER TABLE r_user_role 
      ADD CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraints terlebih dahulu
    const table = await queryRunner.getTable('r_user_role');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      await queryRunner.dropForeignKey('r_user_role', foreignKey);
    }

    await queryRunner.dropTable('r_user_role');
  }
}
