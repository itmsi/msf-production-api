import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingColumnsToParentPlanProduction1700000000041
  implements MigrationInterface
{
  name = 'AddMissingColumnsToParentPlanProduction1700000000041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists and get its current name
    const tableExists = await queryRunner.hasTable('r_parent_plan_production');
    const oldTableExists = await queryRunner.hasTable(
      'TB_R_Parent_Plan_Production',
    );

    let tableName = 'r_parent_plan_production';

    if (!tableExists && oldTableExists) {
      // Rename old table to match entity name
      await queryRunner.query(
        `ALTER TABLE "TB_R_Parent_Plan_Production" RENAME TO "r_parent_plan_production"`,
      );
      tableName = 'r_parent_plan_production';
    } else if (!tableExists && !oldTableExists) {
      // Create table if it doesn't exist
      await queryRunner.query(`
        CREATE TABLE "r_parent_plan_production" (
          "id" SERIAL NOT NULL,
          "plan_date" TIMESTAMP NOT NULL,
          "total_calender_day" integer NOT NULL,
          "total_holiday_day" integer NOT NULL,
          "total_available_day" integer NOT NULL,
          "total_average_month_ewh" double precision NOT NULL,
          "total_average_day_ewh" double precision NOT NULL,
          "total_ob_target" double precision NOT NULL,
          "total_ore_target" double precision NOT NULL,
          "total_quarry_target" double precision NOT NULL,
          "total_sr_target" double precision NOT NULL DEFAULT 2.0,
          "total_ore_shipment_target" double precision NOT NULL,
          "total_remaining_stock" double precision NOT NULL DEFAULT 0,
          "total_sisa_stock" integer NOT NULL DEFAULT 0,
          "total_fleet" integer NOT NULL DEFAULT 0,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMP,
          CONSTRAINT "PK_ParentPlanProduction" PRIMARY KEY ("id")
        )
      `);
      return;
    }

    // Add missing columns if they don't exist
    const hasQuarryTarget = await queryRunner.hasColumn(
      tableName,
      'total_quarry_target',
    );
    const hasSisaStock = await queryRunner.hasColumn(
      tableName,
      'total_sisa_stock',
    );
    const hasFleet = await queryRunner.hasColumn(tableName, 'total_fleet');

    if (!hasQuarryTarget) {
      // Check if old column exists and rename it
      const hasOldQuarryTarget = await queryRunner.hasColumn(
        tableName,
        'total_quary_target',
      );
      if (hasOldQuarryTarget) {
        await queryRunner.query(
          `ALTER TABLE "${tableName}" RENAME COLUMN "total_quary_target" TO "total_quarry_target"`,
        );
      } else {
        await queryRunner.query(
          `ALTER TABLE "${tableName}" ADD COLUMN "total_quarry_target" double precision NOT NULL DEFAULT 0`,
        );
      }
    }

    if (!hasSisaStock) {
      await queryRunner.query(
        `ALTER TABLE "${tableName}" ADD COLUMN "total_sisa_stock" integer NOT NULL DEFAULT 0`,
      );
    }

    if (!hasFleet) {
      await queryRunner.query(
        `ALTER TABLE "${tableName}" ADD COLUMN "total_fleet" integer NOT NULL DEFAULT 0`,
      );
    }

    // Add comments for new columns
    await queryRunner.query(`
      COMMENT ON COLUMN "${tableName}"."total_sisa_stock" IS 'Total sisa stock yang tersedia'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "${tableName}"."total_fleet" IS 'Total fleet yang tersedia'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove added columns
    const tableExists = await queryRunner.hasTable('r_parent_plan_production');
    if (tableExists) {
      await queryRunner.query(
        `ALTER TABLE "r_parent_plan_production" DROP COLUMN IF EXISTS "total_sisa_stock"`,
      );
      await queryRunner.query(
        `ALTER TABLE "r_parent_plan_production" DROP COLUMN IF EXISTS "total_fleet"`,
      );

      // Revert column name if it was renamed
      const hasQuarryTarget = await queryRunner.hasColumn(
        'r_parent_plan_production',
        'total_quarry_target',
      );
      if (hasQuarryTarget) {
        await queryRunner.query(
          `ALTER TABLE "r_parent_plan_production" RENAME COLUMN "total_quarry_target" TO "total_quary_target"`,
        );
      }
    }
  }
}
