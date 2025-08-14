import {
  MigrationInterface,
  QueryRunner,
  TableForeignKey,
} from 'typeorm';

export class UpdateTableTBMUserRemoveRoleId1700000000025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hapus foreign key constraint untuk roleId terlebih dahulu
    const table = await queryRunner.getTable('m_user');
    const foreignKeys = table?.foreignKeys;

    for (const foreignKey of foreignKeys || []) {
      if (foreignKey.columnNames.includes('roleId')) {
        await queryRunner.dropForeignKey('m_user', foreignKey);
      }
    }

    // Hapus kolom roleId
    await queryRunner.query(`ALTER TABLE m_user DROP COLUMN "roleId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Tambahkan kembali kolom roleId
    await queryRunner.query(`ALTER TABLE m_user ADD COLUMN "roleId" int NOT NULL`);

    // Tambahkan kembali foreign key constraint
    await queryRunner.createForeignKey(
      'm_user',
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_role',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
