import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTotalSisaStockType1757405110000 implements MigrationInterface {
  name = 'FixTotalSisaStockType1757405110000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "r_parent_plan_production" ALTER COLUMN "total_sisa_stock" TYPE FLOAT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "r_parent_plan_production" ALTER COLUMN "total_sisa_stock" TYPE INTEGER`,
    );
  }
}
