import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
} from 'typeorm';

export class AddModuleColumnToMenu1700000000026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat ENUM type untuk module
    await queryRunner.query(`
      CREATE TYPE enum_menu_module AS ENUM ('spare-part', 'production')
    `);

    // Tambahkan kolom module
    await queryRunner.addColumn(
      'm_menu',
      new TableColumn({
        name: 'module',
        type: 'enum',
        enum: ['spare-part', 'production'],
        isNullable: true,
        default: "'production'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus kolom module
    await queryRunner.dropColumn('m_menu', 'module');
    
    // Hapus ENUM type
    await queryRunner.query(`DROP TYPE IF EXISTS enum_menu_module`);
  }
}
