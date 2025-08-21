import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePopulationEntityConstraints1700000000033 implements MigrationInterface {
  name = 'UpdatePopulationEntityConstraints1700000000033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update serial_engine column to enum
    await queryRunner.query(`
      ALTER TABLE m_population 
      ALTER COLUMN serial_engine TYPE VARCHAR(100)
    `);
    
    await queryRunner.query(`
      ALTER TABLE m_population 
      ADD CONSTRAINT check_serial_engine 
      CHECK (serial_engine IN ('cummins', 'weichai'))
    `);

    // Update remarks column to enum
    await queryRunner.query(`
      ALTER TABLE m_population 
      ALTER COLUMN remarks TYPE VARCHAR(500)
    `);
    
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
      DROP CONSTRAINT IF EXISTS check_serial_engine
    `);
    
    await queryRunner.query(`
      ALTER TABLE m_population 
      DROP CONSTRAINT IF EXISTS check_remarks
    `);
  }
}
