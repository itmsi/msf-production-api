import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTableRPlanProduction1700000000030
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename ore_shipment to ore_shipment_target (PostgreSQL syntax)
    await queryRunner.query(
      `ALTER TABLE r_plan_production RENAME COLUMN ore_shipment TO ore_shipment_target`,
    );

    // Add total_fleet column
    await queryRunner.query(
      `ALTER TABLE r_plan_production ADD COLUMN total_fleet INTEGER`,
    );

    // Add remaining_stock column
    await queryRunner.query(
      `ALTER TABLE r_plan_production ADD COLUMN remaining_stock DOUBLE PRECISION`,
    );

    // Update comments for calculated fields (PostgreSQL syntax)
    await queryRunner.query(
      `COMMENT ON COLUMN r_plan_production.sr_target IS 'Calculated: (ore_target / ob_target)'`,
    );

    await queryRunner.query(
      `COMMENT ON COLUMN r_plan_production.daily_old_stock IS 'Calculated: (old stock global - ore shipment + ore target)'`,
    );

    await queryRunner.query(
      `COMMENT ON COLUMN r_plan_production.shift_ob_target IS 'Calculated: (ob target / 2)'`,
    );

    await queryRunner.query(
      `COMMENT ON COLUMN r_plan_production.shift_ore_target IS 'Calculated: (ore target / 2)'`,
    );

    await queryRunner.query(
      `COMMENT ON COLUMN r_plan_production.shift_quarrt IS 'Calculated: (quarry / 2)'`,
    );

    await queryRunner.query(
      `COMMENT ON COLUMN r_plan_production.shift_sr_target IS 'Calculated: (shift ob target / shift ore target)'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove remaining_stock column
    await queryRunner.query(
      `ALTER TABLE r_plan_production DROP COLUMN remaining_stock`,
    );

    // Remove total_fleet column
    await queryRunner.query(
      `ALTER TABLE r_plan_production DROP COLUMN total_fleet`,
    );

    // Rename ore_shipment_target back to ore_shipment (PostgreSQL syntax)
    await queryRunner.query(
      `ALTER TABLE r_plan_production RENAME COLUMN ore_shipment_target TO ore_shipment`,
    );
  }
}
