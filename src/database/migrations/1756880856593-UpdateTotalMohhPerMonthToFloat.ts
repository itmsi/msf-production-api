import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTotalMohhPerMonthToFloat1756880856593 implements MigrationInterface {
  name = 'UpdateTotalMohhPerMonthToFloat1756880856593';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update total_mohh_per_month column from integer to float
    await queryRunner.query(`ALTER TABLE "r_parent_plan_working_hour" ALTER COLUMN "total_mohh_per_month" TYPE double precision USING "total_mohh_per_month"::double precision`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert total_mohh_per_month column from float to integer
    await queryRunner.query(`ALTER TABLE "r_parent_plan_working_hour" ALTER COLUMN "total_mohh_per_month" TYPE integer USING "total_mohh_per_month"::integer`);
  }
}
