import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePopulationEntityConstraints1700000000033 implements MigrationInterface {
  name = 'UpdatePopulationEntityConstraints1700000000033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update remarks values to valid enum values
    await queryRunner.query(`
      UPDATE m_population 
      SET remarks = 'RFU' 
      WHERE remarks NOT IN ('RFU', 'BD') 
      OR remarks IS NULL
    `);

    // Update serial_engine column type (just change type, no constraint needed)
    await queryRunner.query(`
      ALTER TABLE m_population 
      ALTER COLUMN serial_engine TYPE VARCHAR(100)
    `);

    // Add constraint only for remarks (enum values)
    await queryRunner.query(`
      ALTER TABLE m_population 
      ADD CONSTRAINT check_remarks 
      CHECK (remarks IN ('RFU', 'BD'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove constraints
    await queryRunner.query(`
      ALTER TABLE m_population 
      DROP CONSTRAINT IF EXISTS check_remarks
    `);
  }
}
