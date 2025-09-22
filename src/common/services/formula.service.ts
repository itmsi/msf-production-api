import { Injectable } from '@nestjs/common';
import { concat } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class FormulaService {
  constructor(private dataSource: DataSource) {}

  /**
   * Menghitung Cycle Time dari Control MTD Production
   * Formula: SUM[Cycle Time] sesuai rentang tanggal yang dipilih
   */
  async calculateCycleTime(
    queryRunner: any,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const result = await queryRunner.query(
        `
        SELECT 
          COALESCE(SUM(
            CASE 
              WHEN rbdp.total_hm > 0 AND rbdp.total_vessel > 0 
              THEN rbdp.total_hm / rbdp.total_vessel 
              ELSE 0 
            END
          ), 0) as total_cycle_time
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rpbdp.activity_date BETWEEN $1 AND $2
          AND rbdp.total_hm > 0 
          AND rbdp.total_vessel > 0
          AND rbdp."deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

      return parseFloat(result[0]?.total_cycle_time || '0');
    } catch (error) {
      console.error('Error calculating cycle time:', error);
      return 0;
    }
  }

  /**
   * Menghitung Production Actual dari Summary Production
   * Formula: SUM[Tonnage] where material_type = ore_hauling sesuai rentang tanggal yang dipilih
   */
  async calculateProductionActual(
    queryRunner: any,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const result = await queryRunner.query(
        `
        SELECT 
          SUM(rbdp.total_vessel * 
            CASE 
              WHEN mp.tyre_type = '6x4' THEN 26.56
              WHEN mp.tyre_type = '8x4' THEN 29.56
              ELSE 0
            END
          ) as total_ore_hauling_tonnage
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rbdp.material = 'ore'
          AND rbdp.activity in ('hauling','direct')
          AND rpbdp.activity_date BETWEEN $1 AND $2
          AND rbdp."deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

      return parseFloat(result[0]?.total_ore_hauling_tonnage || '0');
    } catch (error) {
      console.error('Error calculating production actual:', error);
      return 0;
    }
  }

  /**
   * Menghitung EWH Actual dari Control Day Production
   * Formula: Total EWH lalu di rata-ratakan berdasarkan total unit yang ada
   */
  async calculateEWHActual(
    queryRunner: any,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const result = await queryRunner.query(
        `
        SELECT 
          COALESCE(AVG(rbdp.total_hm), 0) as avg_ewh_actual
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rpbdp.activity_date BETWEEN $1 AND $2
          AND rbdp.total_hm > 0
          AND rbdp."deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

      return parseFloat(result[0]?.avg_ewh_actual || '0');
    } catch (error) {
      console.error('Error calculating EWH actual:', error);
      return 0;
    }
  }

  /**
   * Menghitung Fuel Ratio Actual
   * Formula: [SUM(qty_supply)] dibagi dengan [SUM(ORE BARGE TONNAGE)]
   */
  async calculateFuelRatioActual(
    queryRunner: any,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const fuelResult = await queryRunner.query(
        `
        SELECT COALESCE(SUM(qty_supply), 0) as total_qty_supply
        FROM r_fuel 
        WHERE activity_date BETWEEN $1 AND $2
          AND qty_supply IS NOT NULL
      `,
        [startDate, endDate],
      );

      const oreBargeResult = await queryRunner.query(
        `
        SELECT 
          SUM(rbdp.total_vessel * 
            CASE 
              WHEN mp.tyre_type = '6x4' THEN 16.6
              WHEN mp.tyre_type = '8x4' THEN 18.26
              ELSE 0
            END
          ) as total_ore_barge_tonnage
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rbdp.material = 'ore'
          AND rbdp.activity = 'barging'
          AND rpbdp.activity_date BETWEEN $1 AND $2
          AND rbdp."deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

      const totalQtySupply = parseFloat(fuelResult[0]?.total_qty_supply || '0');
      const totalOreBarge = parseFloat(
        oreBargeResult[0]?.total_ore_barge_tonnage || '0',
      );

      return totalOreBarge > 0 ? totalQtySupply / totalOreBarge : 0;
    } catch (error) {
      console.error('Error calculating fuel ratio actual:', error);
      return 0;
    }
  }

  /**
   * Menghitung Speed Actual dari Control MTD Production
   * Formula: AVG[SPEED] sesuai rentang tanggal yang dipilih
   */
  async calculateSpeedActual(
    queryRunner: any,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const result = await queryRunner.query(
        `
        SELECT 
          COALESCE(AVG(
            CASE 
              WHEN rbdp.total_hm > 0 AND rbdp.total_km > 0 
              THEN rbdp.total_km / rbdp.total_hm 
              ELSE 0 
            END
          ), 0) as avg_speed
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rpbdp.activity_date BETWEEN $1 AND $2
          AND rbdp.total_hm > 0 
          AND rbdp.total_km > 0
          AND rbdp."deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

      return parseFloat(result[0]?.avg_speed || '0');
    } catch (error) {
      console.error('Error calculating speed actual:', error);
      return 0;
    }
  }

  /**
   * Menghitung Production Target dari R_Plan_Production
   * Formula: SUM(ore_target) sesuai rentang tanggal yang dipilih
   */
  async calculateProductionTarget(
    queryRunner: any,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      const result = await queryRunner.query(
        `
        SELECT COALESCE(SUM(ore_target), 0) as total_ore_target
        FROM r_plan_production 
        WHERE plan_date BETWEEN $1 AND $2
          AND "deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

      return parseFloat(result[0]?.total_ore_target || '0');
    } catch (error) {
      console.error('Error calculating production target:', error);
      return 0;
    }
  }

  /**
   * Menghitung EWH Target dari R_Plan_Working_Hours
   * Formula: MOHH dikurangi activities yang delay, breakdown, idle
   */
  // async calculateEWHTarget(
  //   queryRunner: any,
  //   startDate: Date,
  //   endDate: Date,
  // ): Promise<number> {
  //   try {
  //     const result = await queryRunner.query(
  //       `
  //       SELECT
  //         COALESCE(AVG(
  //           CASE
  //             WHEN rpwh.mohh_per_month > 0
  //             THEN rpwh.mohh_per_month - COALESCE((
  //               SELECT SUM(rlt.duration)
  //               FROM r_loss_time rlt
  //               JOIN m_activities ma ON rlt.activities_id = ma.id
  //               WHERE DATE(rlt.date_activity) = DATE(rpwh.plan_date)
  //                 AND rlt.loss_type IN ('BD', 'STB')
  //                 AND (LOWER(ma.name) LIKE '%delay%'
  //                    OR LOWER(ma.name) LIKE '%breakdown%'
  //                    OR LOWER(ma.name) LIKE '%idle%')
  //             ), 0)
  //             ELSE 0
  //           END
  //         ), 0) as avg_ewh_target
  //       FROM r_plan_working_hour rpwh
  //       WHERE rpwh.plan_date BETWEEN $1 AND $2
  //         AND rpwh."deletedAt" IS NULL
  //     `,
  //       [startDate, endDate],
  //     );

  //     return parseFloat(result[0]?.avg_ewh_target || '0');
  //   } catch (error) {
  //     console.error('Error calculating EWH target:', error);
  //     return 0;
  //   }
  // }
  async calculateEWHTarget(queryRunner: any, planDate: Date): Promise<number> {
    try {
      if (!planDate) {
        planDate = new Date();
      }
      // selalu reset ke 00:00:00
      const result = await queryRunner.query(
        `
      SELECT 
        (rpwh.mohh_per_month::numeric - SUM(rpwhd.activities_hour::numeric)) AS target
      FROM r_plan_working_hour_detail rpwhd
      LEFT JOIN r_plan_working_hour rpwh 
        ON rpwh.id = rpwhd.plant_working_hour_id
      WHERE rpwh.plan_date::date = $1
        AND rpwh."deletedAt" IS NULL
      GROUP BY rpwh.mohh_per_month
      `,
        [planDate],
      );

      return parseFloat(result[0]?.target || '0');
    } catch (error) {
      console.error('Error calculating EWH target:', error);
      return 0;
    }
  }

  /**
   * Mendapatkan nilai target dari m_setting_dashboard
   */
  async getSettingValue(
    queryRunner: any,
    field: 'cycle_time' | 'fuel_ratio' | 'speed',
    defaultValue: number,
  ): Promise<number> {
    try {
      const result = await queryRunner.query(`
        SELECT ${field} FROM m_setting_dashboard 
        WHERE "deletedAt" IS NULL 
        ORDER BY "createdAt" DESC 
        LIMIT 1
      `);
      return parseFloat(result[0]?.[field] || defaultValue.toString());
    } catch (error) {
      console.error(`Error getting ${field} setting:`, error);
      return defaultValue;
    }
  }

  /**
   * Menghitung persentase pencapaian
   * Formula: (actual / target) * 100
   */
  calculatePercentage(actual: number, target: number): number {
    if (target <= 0) return 0;
    return Math.round((actual / target) * 100);
  }
}
