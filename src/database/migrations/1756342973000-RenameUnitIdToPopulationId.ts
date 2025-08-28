import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUnitIdToPopulationId1756342973000 implements MigrationInterface {
    name = 'RenameUnitIdToPopulationId1756342973000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, check if there are any invalid unit_id values that don't exist in m_population
        const invalidUnitIds = await queryRunner.query(`
            SELECT DISTINCT rp.unit_id 
            FROM r_parent_base_data_pro rp 
            LEFT JOIN m_population mp ON rp.unit_id = mp.id 
            WHERE rp.unit_id IS NOT NULL AND mp.id IS NULL
        `);

        if (invalidUnitIds.length > 0) {
            console.log('Found invalid unit_id values:', invalidUnitIds);
            
            // First, make the column nullable temporarily
            await queryRunner.query(`ALTER TABLE "r_parent_base_data_pro" ALTER COLUMN "unit_id" DROP NOT NULL`);
            
            // Set invalid unit_id values to NULL temporarily
            await queryRunner.query(`
                UPDATE r_parent_base_data_pro 
                SET unit_id = NULL 
                WHERE unit_id IN (${invalidUnitIds.map(u => u.unit_id).join(',')})
            `);
        }

        // Rename column from unit_id to population_id
        await queryRunner.query(`ALTER TABLE "r_parent_base_data_pro" RENAME COLUMN "unit_id" TO "population_id"`);
        
        // Add foreign key constraint to m_population table
        await queryRunner.query(`ALTER TABLE "r_parent_base_data_pro" ADD CONSTRAINT "FK_parent_base_data_pro_population" FOREIGN KEY ("population_id") REFERENCES "m_population"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        
        // Make the column NOT NULL again if there are no NULL values
        const nullCount = await queryRunner.query(`
            SELECT COUNT(*) as count FROM r_parent_base_data_pro WHERE population_id IS NULL
        `);
        
        if (nullCount[0].count === 0) {
            await queryRunner.query(`ALTER TABLE "r_parent_base_data_pro" ALTER COLUMN "population_id" SET NOT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraint
        await queryRunner.query(`ALTER TABLE "r_parent_base_data_pro" DROP CONSTRAINT "FK_parent_base_data_pro_population"`);
        
        // Rename column back from population_id to unit_id
        await queryRunner.query(`ALTER TABLE "r_parent_base_data_pro" RENAME COLUMN "population_id" TO "unit_id"`);
        
        // Make the column NOT NULL again
        await queryRunner.query(`ALTER TABLE "r_parent_base_data_pro" ALTER COLUMN "unit_id" SET NOT NULL`);
    }
}
