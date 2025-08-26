import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShiftColumnToRFuel1700000000053 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Buat ENUM type untuk shift jika belum ada
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE enum_shift_fuel AS ENUM ('DS', 'NS');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Tambahkan kolom shift ke tabel r_fuel
    await queryRunner.query(`
      ALTER TABLE r_fuel 
      ADD COLUMN shift enum_shift_fuel DEFAULT 'DS'
    `);

    // Tambahkan comment untuk kolom shift
    await queryRunner.query(`
      COMMENT ON COLUMN r_fuel.shift IS 'Shift: DS (Day Shift) or NS (Night Shift)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Hapus kolom shift dari tabel r_fuel
    await queryRunner.query(`
      ALTER TABLE r_fuel DROP COLUMN IF EXISTS shift
    `);

    // Hapus ENUM type untuk shift
    await queryRunner.query(`
      DROP TYPE IF EXISTS enum_shift_fuel
    `);
  }
}
