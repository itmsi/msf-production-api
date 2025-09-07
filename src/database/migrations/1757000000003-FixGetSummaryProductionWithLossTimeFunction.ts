import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixGetSummaryProductionWithLossTimeFunction1757000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_summary_production_with_loss_time()
      RETURNS TABLE (
          dt_type TEXT,
          unit TEXT,
          date DATE,
          material_type TEXT,
          vessel NUMERIC,
          tonnage NUMERIC,
          hujan NUMERIC,
          slippery NUMERIC
      ) AS $$
      BEGIN
          RETURN QUERY
          WITH base AS (
              SELECT 
                  mp.tyre_type,
                  mp.no_unit,
                  mp.date_arrive,
                  CASE
                      WHEN rbdp.material IN ('ore', 'ore-barge') THEN 
                          CASE
                              WHEN rbdp.activity = 'barging' THEN 'ore barge'
                              WHEN rbdp.activity = 'hauling' THEN 'ore hauling'
                              ELSE rbdp.material::text
                          END
                      ELSE rbdp.material::text
                  END AS material,
                  rbdp.total_vessel,
                  COALESCE(SUM(CASE WHEN ma.name = 'Raining' THEN rlt.duration ELSE 0 END), 0) AS hujan_duration,
                  COALESCE(SUM(CASE WHEN ma.name = 'Slippery' THEN rlt.duration ELSE 0 END), 0) AS slippery_duration
              FROM r_parent_base_data_pro rpbdp
              JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
              JOIN m_population mp ON rpbdp.population_id = mp.id
              LEFT JOIN r_loss_time rlt ON rlt.population_id = mp.id
              LEFT JOIN m_activities ma ON ma.id = rlt.activities_id
              GROUP BY mp.tyre_type, mp.no_unit, mp.date_arrive, rbdp.material, rbdp.activity, rbdp.total_vessel
          )
          SELECT 
              CASE 
                  WHEN base.tyre_type = '6x4' THEN '10' 
                  WHEN base.tyre_type = '8x4' THEN '12' 
                  ELSE 'N/A'
              END::TEXT AS dt_type,
              base.no_unit::TEXT AS unit,
              base.date_arrive::DATE AS date,
              base.material::TEXT AS material_type,
              SUM(base.total_vessel)::NUMERIC AS vessel,
              CASE 
                  WHEN base.material = 'ob' THEN 
                      CASE
                          WHEN base.tyre_type = '6x4' THEN (SUM(base.total_vessel) * 26.56) / 1.6
                          WHEN base.tyre_type = '8x4' THEN (SUM(base.total_vessel) * 29.56) / 1.6
                          ELSE 0
                      END
                  ELSE 
                      CASE
                          WHEN base.tyre_type = '6x4' THEN (SUM(base.total_vessel) * 26.56)
                          WHEN base.tyre_type = '8x4' THEN (SUM(base.total_vessel) * 29.56)
                          ELSE 0
                      END
              END::NUMERIC AS tonnage,
              SUM(base.hujan_duration)::NUMERIC AS hujan,
              SUM(base.slippery_duration)::NUMERIC AS slippery
          FROM base
          GROUP BY base.tyre_type, base.no_unit, base.date_arrive, base.material;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS get_summary_production_with_loss_time();`);
  }
}
