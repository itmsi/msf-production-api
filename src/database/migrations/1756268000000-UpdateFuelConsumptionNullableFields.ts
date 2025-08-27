import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFuelConsumptionNullableFields1756268000000 implements MigrationInterface {
    name = 'UpdateFuelConsumptionNullableFields1756268000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update fuel consumption table to make fields nullable
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "last_refueling_hm" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "now_refueling_hm" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "running_refueling_hm" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "last_refueling_km" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "now_refueling_km" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "running_refueling_km" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert changes
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "running_refueling_km" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "now_refueling_km" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "last_refueling_km" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "running_refueling_hm" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "now_refueling_hm" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "r_fuel" ALTER COLUMN "last_refueling_hm" SET NOT NULL`);
    }
}
