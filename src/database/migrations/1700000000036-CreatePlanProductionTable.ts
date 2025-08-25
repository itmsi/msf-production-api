import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlanProductionTable1700000000036
  implements MigrationInterface
{
  name = 'CreatePlanProductionTable1700000000036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "TB_R_Plan_Production" (
        "id" SERIAL NOT NULL,
        "plan_date" date NOT NULL,
        "is_calender_day" boolean NOT NULL,
        "is_holiday_day" boolean NOT NULL,
        "is_available_day" boolean NOT NULL,
        "average_day_ewh" double precision NOT NULL,
        "average_shift_ewh" double precision NOT NULL,
        "ob_target" double precision NOT NULL,
        "ore_target" double precision NOT NULL,
        "quarry" double precision NOT NULL,
        "remaining_stock" double precision NOT NULL,
        "sr_target" double precision NOT NULL,
        "ore_shipment_target" double precision NOT NULL,
        "total_fleet" integer NOT NULL,
        "daily_old_stock" double precision NOT NULL,
        "shift_ob_target" double precision NOT NULL,
        "shift_ore_target" double precision NOT NULL,
        "shift_quarry" double precision NOT NULL,
        "shift_sr_target" double precision NOT NULL,
        "createdAt" date NOT NULL DEFAULT now(),
        "updatedAt" date NOT NULL DEFAULT now(),
        "deletedAt" date,
        "parent_plan_production_id" integer NOT NULL,
        CONSTRAINT "PK_PlanProduction" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "TB_R_Plan_Production" 
      ADD CONSTRAINT "FK_PlanProduction_ParentPlanProduction" 
      FOREIGN KEY ("parent_plan_production_id") 
      REFERENCES "TB_R_Parent_Plan_Production"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Add comments for calculated fields
    await queryRunner.query(`
      COMMENT ON COLUMN "TB_R_Plan_Production"."is_available_day" IS 'is_available_day == is_scheduled_day'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "TB_R_Plan_Production"."sr_target" IS 'Calculated: (ore_target / ob_target)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "TB_R_Plan_Production"."daily_old_stock" IS 'Calculated: (old stock global - ore shipment + ore target)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "TB_R_Plan_Production"."shift_ob_target" IS 'Calculated: (ob target / 2)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "TB_R_Plan_Production"."shift_ore_target" IS 'Calculated: (ore target / 2)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "TB_R_Plan_Production"."shift_quarry" IS 'Calculated: (quarry / 2)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "TB_R_Plan_Production"."shift_sr_target" IS 'Calculated: (shift ob target / shift ore target)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.query(`
      ALTER TABLE "TB_R_Plan_Production" 
      DROP CONSTRAINT "FK_PlanProduction_ParentPlanProduction"
    `);

    await queryRunner.query(`DROP TABLE "TB_R_Plan_Production"`);
  }
}
