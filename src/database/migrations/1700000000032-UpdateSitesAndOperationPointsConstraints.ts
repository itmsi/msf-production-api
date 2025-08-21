import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSitesAndOperationPointsConstraints1700000000032
  implements MigrationInterface
{
  name = 'UpdateSitesAndOperationPointsConstraints1700000000032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update m_sites table - make name, location, longitude, latitude NOT NULL
    await queryRunner.query(`
      ALTER TABLE "m_sites" 
      ALTER COLUMN "name" SET NOT NULL,
      ALTER COLUMN "location" SET NOT NULL,
      ALTER COLUMN "longitude" SET NOT NULL,
      ALTER COLUMN "latitude" SET NOT NULL
    `);

    // Update m_operation_points table - make type and name NOT NULL, longitude and latitude remain NULL
    await queryRunner.query(`
      ALTER TABLE "m_operation_points" 
      ALTER COLUMN "type" SET NOT NULL,
      ALTER COLUMN "name" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert m_sites table changes
    await queryRunner.query(`
      ALTER TABLE "m_sites" 
      ALTER COLUMN "name" DROP NOT NULL,
      ALTER COLUMN "location" DROP NOT NULL,
      ALTER COLUMN "longitude" DROP NOT NULL,
      ALTER COLUMN "latitude" DROP NOT NULL
    `);

    // Revert m_operation_points table changes
    await queryRunner.query(`
      ALTER TABLE "m_operation_points" 
      ALTER COLUMN "type" DROP NOT NULL,
      ALTER COLUMN "name" DROP NOT NULL
    `);
  }
}
