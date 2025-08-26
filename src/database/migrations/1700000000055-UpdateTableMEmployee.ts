import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class UpdateTableMEmployee1700000000055 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add department_id column
    await queryRunner.addColumn(
      'm_employee',
      new TableColumn({
        name: 'department_id',
        type: 'int',
        isNullable: true,
      }),
    );

    // Add foreign key constraint for department_id
    await queryRunner.createForeignKey(
      'm_employee',
      new TableForeignKey({
        columnNames: ['department_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'm_departments',
        onDelete: 'SET NULL',
      }),
    );

    // Change nip column type from int to varchar(255)
    // Use ALTER COLUMN to change type directly
    await queryRunner.query(`
      ALTER TABLE m_employee 
      ALTER COLUMN nip TYPE varchar(255) USING COALESCE(nip::text, 'EMP' || id::text)
    `);

    // Drop department column
    await queryRunner.dropColumn('m_employee', 'department');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back department column
    await queryRunner.addColumn(
      'm_employee',
      new TableColumn({
        name: 'department',
        type: 'varchar',
        length: '100',
        isNullable: false,
      }),
    );

    // Change nip column type back to int
    await queryRunner.changeColumn(
      'm_employee',
      'nip',
      new TableColumn({
        name: 'nip',
        type: 'int',
        isNullable: false,
      }),
    );

    // Drop foreign key constraint for department_id
    const table = await queryRunner.getTable('m_employee');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('department_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('m_employee', foreignKey);
      }
    }

    // Drop department_id column
    await queryRunner.dropColumn('m_employee', 'department_id');
  }
}
