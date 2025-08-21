import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDateColumnsToDatetime1700000000031
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Update kolom activity_date di tabel r_base_data_pro
      await queryRunner.query(
        'ALTER TABLE r_base_data_pro ALTER COLUMN activity_date TYPE timestamp',
      );
      console.log('Updated r_base_data_pro.activity_date');
    } catch (error) {
      console.log('Table r_base_data_pro or column activity_date not found, skipping...');
    }

    try {
      // Update kolom plan_date di tabel r_plan_production
      await queryRunner.query(
        'ALTER TABLE r_plan_production ALTER COLUMN plan_date TYPE timestamp',
      );
      console.log('Updated r_plan_production.plan_date');
    } catch (error) {
      console.log('Table r_plan_production or column plan_date not found, skipping...');
    }

    try {
      // Update kolom plan_date di tabel r_plan_working_hour
      await queryRunner.query(
        'ALTER TABLE r_plan_working_hour ALTER COLUMN plan_date TYPE timestamp',
      );
      console.log('Updated r_plan_working_hour.plan_date');
    } catch (error) {
      console.log('Table r_plan_working_hour or column plan_date not found, skipping...');
    }

    try {
      // Update kolom activity_date di tabel r_ccr_hauling
      await queryRunner.query(
        'ALTER TABLE r_ccr_hauling ALTER COLUMN activity_date TYPE timestamp',
      );
      console.log('Updated r_ccr_hauling.activity_date');
    } catch (error) {
      console.log('Table r_ccr_hauling or column activity_date not found, skipping...');
    }

    try {
      // Update kolom start_loading di tabel r_input_barge
      await queryRunner.query(
        'ALTER TABLE r_input_barge ALTER COLUMN start_loading TYPE timestamp',
      );
      console.log('Updated r_input_barge.start_loading');
    } catch (error) {
      console.log('Table r_input_barge or column start_loading not found, skipping...');
    }

    try {
      // Update kolom end_loading di tabel r_input_barge
      await queryRunner.query(
        'ALTER TABLE r_input_barge ALTER COLUMN end_loading TYPE timestamp',
      );
      console.log('Updated r_input_barge.end_loading');
    } catch (error) {
      console.log('Table r_input_barge or column end_loading not found, skipping...');
    }

    try {
      // Update kolom date_arrive di tabel m_population
      await queryRunner.query(
        'ALTER TABLE m_population ALTER COLUMN date_arrive TYPE timestamp',
      );
      console.log('Updated m_population.date_arrive');
    } catch (error) {
      console.log('Table m_population or column date_arrive not found, skipping...');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // Revert kolom activity_date di tabel r_base_data_pro
      await queryRunner.query(
        'ALTER TABLE r_base_data_pro ALTER COLUMN activity_date TYPE date',
      );
    } catch (error) {
      console.log('Table r_base_data_pro or column activity_date not found, skipping...');
    }

    try {
      // Revert kolom plan_date di tabel r_plan_production
      await queryRunner.query(
        'ALTER TABLE r_plan_production ALTER COLUMN plan_date TYPE date',
      );
    } catch (error) {
      console.log('Table r_plan_production or column plan_date not found, skipping...');
    }

    try {
      // Revert kolom plan_date di tabel r_plan_working_hour
      await queryRunner.query(
        'ALTER TABLE r_plan_working_hour ALTER COLUMN plan_date TYPE date',
      );
    } catch (error) {
      console.log('Table r_plan_working_hour or column plan_date not found, skipping...');
    }

    try {
      // Revert kolom activity_date di tabel r_ccr_hauling
      await queryRunner.query(
        'ALTER TABLE r_ccr_hauling ALTER COLUMN activity_date TYPE date',
      );
    } catch (error) {
      console.log('Table r_ccr_hauling or column activity_date not found, skipping...');
    }

    try {
      // Revert kolom start_loading di tabel r_input_barge
      await queryRunner.query(
        'ALTER TABLE r_input_barge ALTER COLUMN start_loading TYPE date',
      );
    } catch (error) {
      console.log('Table r_input_barge or column start_loading not found, skipping...');
    }

    try {
      // Revert kolom end_loading di tabel r_input_barge
      await queryRunner.query(
        'ALTER TABLE r_input_barge ALTER COLUMN end_loading TYPE date',
      );
    } catch (error) {
      console.log('Table r_input_barge or column end_loading not found, skipping...');
    }

    try {
      // Revert kolom date_arrive di tabel m_population
      await queryRunner.query(
        'ALTER TABLE m_population ALTER COLUMN date_arrive TYPE date',
      );
    } catch (error) {
      console.log('Table m_population or column date_arrive not found, skipping...');
    }
  }
}
