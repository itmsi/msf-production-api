import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAndUpdatePlanProductionTables1700000000038
  implements MigrationInterface
{
  name = 'RenameAndUpdatePlanProductionTables1700000000038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop tabel lama r_plan_production jika ada
    await queryRunner.query(`DROP TABLE IF EXISTS "r_plan_production" CASCADE`);

    // 2. Rename tabel baru ke nama yang sesuai
    await queryRunner.query(
      `ALTER TABLE "TB_R_Parent_Plan_Production" RENAME TO "r_parent_plan_production"`,
    );
    await queryRunner.query(
      `ALTER TABLE "TB_R_Plan_Production" RENAME TO "r_plan_production"`,
    );

    // 3. Rename constraint dan index
    await queryRunner.query(
      `ALTER TABLE "r_parent_plan_production" RENAME CONSTRAINT "PK_ParentPlanProduction" TO "PK_r_parent_plan_production"`,
    );
    await queryRunner.query(
      `ALTER TABLE "r_plan_production" RENAME CONSTRAINT "PK_PlanProduction" TO "PK_r_plan_production"`,
    );

    // 4. Rename foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "r_plan_production" RENAME CONSTRAINT "FK_PlanProduction_ParentPlanProduction" TO "FK_r_plan_production_parent"`,
    );

    // 5. Rename indexes
    await queryRunner.query(
      `ALTER INDEX "IDX_ParentPlanProduction_PlanDate" RENAME TO "IDX_r_parent_plan_production_plan_date"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_PlanProduction_PlanDate" RENAME TO "IDX_r_plan_production_plan_date"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_PlanProduction_ParentId" RENAME TO "IDX_r_plan_production_parent_id"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_PlanProduction_DateParentId" RENAME TO "IDX_r_plan_production_date_parent_id"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_PlanProduction_AvailableDay" RENAME TO "IDX_r_plan_production_available_day"`,
    );

    // 6. Update foreign key reference
    await queryRunner.query(
      `ALTER TABLE "r_plan_production" DROP CONSTRAINT "FK_r_plan_production_parent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "r_plan_production" ADD CONSTRAINT "FK_r_plan_production_parent" FOREIGN KEY ("parent_plan_production_id") REFERENCES "r_parent_plan_production"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    // 7. Update sequence names
    await queryRunner.query(
      `ALTER SEQUENCE "TB_R_Parent_Plan_Production_id_seq" RENAME TO "r_parent_plan_production_id_seq"`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE "TB_R_Plan_Production_id_seq" RENAME TO "r_plan_production_id_seq"`,
    );

    // 8. Update default values untuk sequence
    await queryRunner.query(
      `ALTER TABLE "r_parent_plan_production" ALTER COLUMN "id" SET DEFAULT nextval('r_parent_plan_production_id_seq'::regclass)`,
    );
    await queryRunner.query(
      `ALTER TABLE "r_plan_production" ALTER COLUMN "id" SET DEFAULT nextval('r_plan_production_id_seq'::regclass)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert semua perubahan
    await queryRunner.query(
      `ALTER TABLE "r_parent_plan_production" RENAME TO "TB_R_Parent_Plan_Production"`,
    );
    await queryRunner.query(
      `ALTER TABLE "r_plan_production" RENAME TO "TB_R_Plan_Production"`,
    );

    await queryRunner.query(
      `ALTER TABLE "TB_R_Parent_Plan_Production" RENAME CONSTRAINT "PK_r_parent_plan_production" TO "PK_ParentPlanProduction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "TB_R_Plan_Production" RENAME CONSTRAINT "PK_r_plan_production" TO "PK_PlanProduction"`,
    );

    await queryRunner.query(
      `ALTER TABLE "TB_R_Plan_Production" DROP CONSTRAINT "FK_r_plan_production_parent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "TB_R_Plan_Production" ADD CONSTRAINT "FK_PlanProduction_ParentPlanProduction" FOREIGN KEY ("parent_plan_production_id") REFERENCES "TB_R_Parent_Plan_Production"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(
      `ALTER INDEX "IDX_r_parent_plan_production_plan_date" RENAME TO "IDX_ParentPlanProduction_PlanDate"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_r_plan_production_plan_date" RENAME TO "IDX_PlanProduction_PlanDate"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_r_plan_production_parent_id" RENAME TO "IDX_PlanProduction_ParentId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_r_plan_production_date_parent_id" RENAME TO "IDX_PlanProduction_DateParentId"`,
    );
    await queryRunner.query(
      `ALTER INDEX "IDX_r_plan_production_available_day" RENAME TO "IDX_PlanProduction_AvailableDay"`,
    );

    await queryRunner.query(
      `ALTER SEQUENCE "r_parent_plan_production_id_seq" RENAME TO "TB_R_Parent_Plan_Production_id_seq"`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE "r_plan_production_id_seq" RENAME TO "TB_R_Plan_Production_id_seq"`,
    );

    await queryRunner.query(
      `ALTER TABLE "TB_R_Parent_Plan_Production" ALTER COLUMN "id" SET DEFAULT nextval('TB_R_Parent_Plan_Production_id_seq'::regclass)`,
    );
    await queryRunner.query(
      `ALTER TABLE "TB_R_Plan_Production" ALTER COLUMN "id" SET DEFAULT nextval('TB_R_Plan_Production_id_seq'::regclass)`,
    );
  }
}
