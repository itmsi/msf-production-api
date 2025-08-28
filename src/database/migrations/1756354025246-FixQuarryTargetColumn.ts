import { MigrationInterface, QueryRunner } from "typeorm";

export class FixQuarryTargetColumn1756354025246 implements MigrationInterface {
    name = 'FixQuarryTargetColumn1756354025246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the old column exists and rename it to the correct name
        const hasOldQuarryTarget = await queryRunner.hasColumn(
            'r_parent_plan_production',
            'total_quary_target'
        );

        if (hasOldQuarryTarget) {
            // Rename the old column to the correct name
            await queryRunner.query(
                `ALTER TABLE "r_parent_plan_production" RENAME COLUMN "total_quary_target" TO "total_quarry_target"`
            );
            console.log('Successfully renamed total_quary_target to total_quarry_target');
        } else {
            // Check if the correct column already exists
            const hasCorrectQuarryTarget = await queryRunner.hasColumn(
                'r_parent_plan_production',
                'total_quarry_target'
            );

            if (!hasCorrectQuarryTarget) {
                // Add the correct column if it doesn't exist
                await queryRunner.query(
                    `ALTER TABLE "r_parent_plan_production" ADD COLUMN "total_quarry_target" double precision NOT NULL DEFAULT 0`
                );
                console.log('Successfully added total_quarry_target column');
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if the correct column exists and rename it back to the old name
        const hasCorrectQuarryTarget = await queryRunner.hasColumn(
            'r_parent_plan_production',
            'total_quarry_target'
        );

        if (hasCorrectQuarryTarget) {
            // Rename the correct column back to the old name
            await queryRunner.query(
                `ALTER TABLE "r_parent_plan_production" RENAME COLUMN "total_quarry_target" TO "total_quary_target"`
            );
            console.log('Successfully reverted total_quarry_target back to total_quary_target');
        }
    }
}
