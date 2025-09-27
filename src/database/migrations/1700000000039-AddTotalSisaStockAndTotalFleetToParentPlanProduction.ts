import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotalSisaStockAndTotalFleetToParentPlanProduction1700000000039 implements MigrationInterface {
  name = 'AddTotalSisaStockAndTotalFleetToParentPlanProduction1700000000039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add total_sisa_stock column
    await queryRunner.query(`
      ALTER TABLE "r_parent_plan_production" 
      ADD COLUMN "total_sisa_stock" integer NOT NULL DEFAULT 0
    `);

    // Add total_fleet column
    await queryRunner.query(`
      ALTER TABLE "r_parent_plan_production" 
      ADD COLUMN "total_fleet" integer NOT NULL DEFAULT 0
    `);

    // Add comments for new columns
    await queryRunner.query(`
      COMMENT ON COLUMN "r_parent_plan_production"."total_sisa_stock" IS 'Total sisa stock yang tersedia'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "r_parent_plan_production"."total_fleet" IS 'Total fleet yang tersedia'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove total_fleet column
    await queryRunner.query(`
      ALTER TABLE "r_parent_plan_production" 
      DROP COLUMN "total_fleet"
    `);

    // Remove total_sisa_stock column
    await queryRunner.query(`
      ALTER TABLE "r_parent_plan_production" 
      DROP COLUMN "total_sisa_stock"
    `);
  }
}
