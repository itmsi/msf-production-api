import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveWrongSerialEngineConstraint1700000000034
  implements MigrationInterface
{
  name = 'RemoveWrongSerialEngineConstraint1700000000034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the wrong constraint for serial_engine
    await queryRunner.query(`
      ALTER TABLE m_population 
      DROP CONSTRAINT IF EXISTS check_serial_engine
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the constraint if needed (but this is wrong, so we won't do it)
    // This is intentionally left empty as the constraint was incorrect
  }
}
