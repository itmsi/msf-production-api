import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class AddSupportToActivityEnum1756885070000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambahkan nilai 'support' ke ENUM activity
    await queryRunner.query(`
      ALTER TYPE r_base_data_pro_activity_enum ADD VALUE 'support'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Catatan: PostgreSQL tidak mendukung penghapusan nilai ENUM secara langsung
    // Untuk rollback, perlu membuat ENUM baru tanpa nilai 'support'
    // Ini adalah operasi yang kompleks dan memerlukan backup data
    
    // Alternatif: Buat ENUM baru tanpa 'support' dan update kolom
    await queryRunner.query(`
      CREATE TYPE r_base_data_pro_activity_enum_new AS ENUM ('hauling', 'barging', 'direct')
    `);
    
    // Update kolom untuk menggunakan ENUM baru
    await queryRunner.query(`
      ALTER TABLE r_base_data_pro 
      ALTER COLUMN activity TYPE r_base_data_pro_activity_enum_new 
      USING activity::text::r_base_data_pro_activity_enum_new
    `);
    
    // Drop ENUM lama dan rename yang baru
    await queryRunner.query(`DROP TYPE r_base_data_pro_activity_enum`);
    await queryRunner.query(`ALTER TYPE r_base_data_pro_activity_enum_new RENAME TO r_base_data_pro_activity_enum`);
  }
}
