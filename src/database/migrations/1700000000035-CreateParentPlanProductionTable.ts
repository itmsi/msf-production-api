import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParentPlanProductionTable1700000000035 implements MigrationInterface {
  name = 'CreateParentPlanProductionTable1700000000035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "TB_R_Parent_Plan_Production" (
        "id" SERIAL NOT NULL,
        "plan_date" TIMESTAMP NOT NULL,
        "total_calender_day" integer NOT NULL,
        "total_holiday_day" integer NOT NULL,
        "total_available_day" integer NOT NULL,
        "total_average_month_ewh" double precision NOT NULL,
        "total_average_day_ewh" double precision NOT NULL,
        "total_ob_target" double precision NOT NULL,
        "total_ore_target" double precision NOT NULL,
        "total_quary_target" double precision NOT NULL,
        "total_sr_target" double precision NOT NULL,
        "total_ore_shipment_target" double precision NOT NULL,
        "total_remaining_stock" double precision NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_ParentPlanProduction" PRIMARY KEY ("id")
      )
    `);

    // Add comments for calculated fields
    await queryRunner.query(`
      COMMENT ON COLUMN "TB_R_Parent_Plan_Production"."total_calender_day" IS 'Calculated from total days on month'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "TB_R_Parent_Plan_Production"."total_holiday_day" IS 'Calculated from total sunday on month'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "TB_R_Parent_Plan_Production"."total_available_day" IS 'Calculated from total days on month'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "TB_R_Parent_Plan_Production"`);
  }
}
