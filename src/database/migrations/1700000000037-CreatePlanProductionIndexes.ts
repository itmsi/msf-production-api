import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlanProductionIndexes1700000000037 implements MigrationInterface {
  name = 'CreatePlanProductionIndexes1700000000037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index for plan_date for date range queries
    await queryRunner.query(`
      CREATE INDEX "IDX_PlanProduction_PlanDate" 
      ON "TB_R_Plan_Production" ("plan_date")
    `);

    // Index for parent_plan_production_id for foreign key lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_PlanProduction_ParentId" 
      ON "TB_R_Plan_Production" ("parent_plan_production_id")
    `);

    // Composite index for date and parent_id
    await queryRunner.query(`
      CREATE INDEX "IDX_PlanProduction_DateParentId" 
      ON "TB_R_Plan_Production" ("plan_date", "parent_plan_production_id")
    `);

    // Index for boolean fields for filtering
    await queryRunner.query(`
      CREATE INDEX "IDX_PlanProduction_AvailableDay" 
      ON "TB_R_Plan_Production" ("is_available_day")
    `);

    // Index for ParentPlanProduction plan_date
    await queryRunner.query(`
      CREATE INDEX "IDX_ParentPlanProduction_PlanDate" 
      ON "TB_R_Parent_Plan_Production" ("plan_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_PlanProduction_PlanDate"`);
    await queryRunner.query(`DROP INDEX "IDX_PlanProduction_ParentId"`);
    await queryRunner.query(`DROP INDEX "IDX_PlanProduction_DateParentId"`);
    await queryRunner.query(`DROP INDEX "IDX_PlanProduction_AvailableDay"`);
    await queryRunner.query(`DROP INDEX "IDX_ParentPlanProduction_PlanDate"`);
  }
}
