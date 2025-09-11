import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Population } from '../population/entities/population.entity';
import { FormulaService } from '../../common/services/formula.service';
import { ProductionFormulaService } from '../../common/services/production-formula.service';

@Injectable()
export class DashboardService {
  constructor(
    private dataSource: DataSource,
    private formulaService: FormulaService,
    private productionFormulaService: ProductionFormulaService
  ) {}
  async getSpiderData() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Get current date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      // 1. CT (Cycle Time) - Static metric
      const ctTarget = await this.formulaService.getSettingValue(queryRunner, 'cycle_time', 100);
      const ctActual = await this.formulaService.calculateCycleTime(queryRunner, startDate, endDate);

      // 2. Prod (Production) - Static metric  
      const prodTarget = await this.formulaService.calculateProductionTarget(queryRunner, startDate, endDate);
      const prodActual = await this.formulaService.calculateProductionActual(queryRunner, startDate, endDate);

      // 3. EWH (Effective Working Hours) - Static metric
      const ewhTarget = await this.formulaService.calculateEWHTarget(queryRunner, startDate, endDate);
      const ewhActual = await this.formulaService.calculateEWHActual(queryRunner, startDate, endDate);

      // 4. FR (Fuel Ratio) - Static metric
      const frTarget = await this.formulaService.getSettingValue(queryRunner, 'fuel_ratio', 95);
      const frActual = await this.formulaService.calculateFuelRatioActual(queryRunner, startDate, endDate);

      // 5. Speed - Static metric
      const speedTarget = await this.formulaService.getSettingValue(queryRunner, 'speed', 110);
      const speedActual = await this.formulaService.calculateSpeedActual(queryRunner, startDate, endDate);

      await queryRunner.release();

      const data = [
        {
          metric: 'CT',
          target: ctTarget,
          actual: ctActual,
          percent: this.formulaService.calculatePercentage(ctActual, ctTarget)
        },
        {
          metric: 'Prod',
          target: prodTarget,
          actual: prodActual,
          percent: this.formulaService.calculatePercentage(prodActual, prodTarget)
        },
        {
          metric: 'EWH',
          target: ewhTarget,
          actual: ewhActual,
          percent: this.formulaService.calculatePercentage(ewhActual, ewhTarget)
        },
        {
          metric: 'FR',
          target: frTarget,
          actual: frActual,
          percent: this.formulaService.calculatePercentage(frActual, frTarget)
        },
        {
          metric: 'Speed',
          target: speedTarget,
          actual: speedActual,
          percent: this.formulaService.calculatePercentage(speedActual, speedTarget)
        }
      ];

      return {
        statusCode: 200,
        message: 'success',
        data: data
      };
    } catch (error) {
      console.error('Error in getSpiderData:', error);
      return {
        statusCode: 500,
        message: 'Error retrieving spider data',
        error: error.message
      };
    }
  }

  async getMtdAchievement(startDate?: string, endDate?: string) {
    try {
      // Mendapatkan target dan actual menggunakan shared formula service
      const [targets, actuals] = await Promise.all([
        this.productionFormulaService.getProductionTargets(startDate, endDate),
        this.productionFormulaService.getProductionActuals(startDate, endDate)
      ]);

      return {
        statusCode: 200,
        message: 'success',
        data: [
          {
            name: 'Ore Hauling',
            target: targets.oreTarget,
            actual: actuals.oreHaulingTonnage
          },
          {
            name: 'OB',
            target: targets.obTarget,
            actual: actuals.obBCM
          },
          {
            name: 'Ore Barging',
            target: targets.oreShipmentTarget,
            actual: actuals.bargeTonnage
          },
          {
            name: 'Quarry',
            target: targets.quarryTarget,
            actual: actuals.quarryTonnage
          }
        ]
      };
    } catch (error) {
      console.error('Error in getMtdAchievement:', error);
      return {
        statusCode: 500,
        message: 'Error retrieving MTD achievement data',
        error: error.message
      };
    }
  }

  async getHaulingData(startDate?: string, endDate?: string) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Set default date range if not provided (last 7 days)
      const defaultEndDate = new Date();
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultEndDate.getDate() - 7);

      const start = startDate || defaultStartDate.toISOString().split('T')[0];
      const end = endDate || defaultEndDate.toISOString().split('T')[0];

      // Get target data from r_plan_production
      const targetQuery = `
        SELECT 
          plan_date,
          ore_target
        FROM r_plan_production 
        WHERE plan_date BETWEEN $1 AND $2
        ORDER BY plan_date ASC
      `;

      const targetData = await queryRunner.query(targetQuery, [start, end]);

      // Get actual, slippery, and rain data from get_summary_production_with_loss_time
      const actualQuery = `
        SELECT 
          date,
          SUM(tonnage) as total_tonnage,
          SUM(slippery) as total_slippery,
          SUM(hujan) as total_rain
        FROM get_summary_production_with_loss_time()
        WHERE date BETWEEN $1 AND $2
          AND material_type = 'ore hauling'
        GROUP BY date
        ORDER BY date ASC
      `;

      const actualData = await queryRunner.query(actualQuery, [start, end]);

      await queryRunner.release();

      // Create a map of actual data by date
      const actualMap = new Map();
      actualData.forEach(item => {
        actualMap.set(item.date, {
          tonnage: parseFloat(item.total_tonnage) || 0,
          slippery: parseFloat(item.total_slippery) || 0,
          rain: parseFloat(item.total_rain) || 0
        });
      });

      // Combine target and actual data
      const result = targetData.map(item => {
        const date = new Date(item.plan_date);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const actualInfo = actualMap.get(item.plan_date) || { tonnage: 0, slippery: 0, rain: 0 };

        return {
          date: formattedDate,
          target: parseFloat(item.ore_target) || 0,
          actual: actualInfo.tonnage,
          slippery: actualInfo.slippery,
          rain: actualInfo.rain
        };
      });

      return {
        statusCode: 200,
        message: 'success',
        data: result,
      };
    } catch (error) {
      console.error('Error retrieving hauling data:', error);
      return {
        statusCode: 500,
        message: 'Error retrieving hauling data',
        error: error.message
      };
    }
  }

  async getBargeData() {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { date: '01/07', barge: 3000, hauling: 2800 },
        { date: '02/07', barge: 2950, hauling: 2700 },
        { date: '03/07', barge: 2980, hauling: 2750 },
        { date: '04/07', barge: 2900, hauling: 2600 },
        { date: '05/07', barge: 3000, hauling: 2700 },
        { date: '06/07', barge: 2800, hauling: 2500 },
        { date: '07/07', barge: 2900, hauling: 2650 },
      ],
    };
  }

  async getTmmData() {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { date: '01/07', ore: 500, over: 1400, tmm: 2000 },
        { date: '02/07', ore: 700, over: 1600, tmm: 2400 },
        { date: '03/07', ore: 800, over: 1000, tmm: 1800 },
        { date: '04/07', ore: 900, over: 1500, tmm: 2500 },
        { date: '05/07', ore: 600, over: 1700, tmm: 3000 },
        { date: '06/07', ore: 700, over: 1200, tmm: 2100 },
      ],
    };
  }

  async getLostTimeData() {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { name: 'Slippery', value: 30 },
        { name: 'Rain', value: 7 },
        { name: 'Waiting Hauler', value: 1 },
        { name: 'Rest & Meals', value: 1 },
        { name: 'Daily shift', value: 1 },
        { name: 'Friday pray', value: 1 },
      ],
    };
  }

  async getDailyAchievement(selectedDate?: string) {
    try {
      // Get current date if not provided
      const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
      
      // Get data from ProductionFormulaService
      const achievementData = await this.productionFormulaService.getDailyAchievementData(dateToUse);

      return {
        statusCode: 200,
        message: 'success',
        data: [
          {
            title: 'Daily ACV',
            details: [
              { name: 'Ore Hauling', target: achievementData.dailyACV.oreHauling.target, actual: achievementData.dailyACV.oreHauling.actual },
              { name: 'OB', target: achievementData.dailyACV.ob.target, actual: achievementData.dailyACV.ob.actual },
              { name: 'Ore Barging', target: achievementData.dailyACV.oreBarging.target, actual: achievementData.dailyACV.oreBarging.actual },
              { name: 'Quarry', target: achievementData.dailyACV.quarry.target, actual: achievementData.dailyACV.quarry.actual },
            ],
          },
          {
            title: 'Day Shift ACV',
            details: [
              { name: 'Ore Hauling', target: achievementData.dayShiftACV.oreHauling.target, actual: achievementData.dayShiftACV.oreHauling.actual },
              { name: 'OB', target: achievementData.dayShiftACV.ob.target, actual: achievementData.dayShiftACV.ob.actual },
              { name: 'Ore Barging', target: achievementData.dayShiftACV.oreBarging.target, actual: achievementData.dayShiftACV.oreBarging.actual },
              { name: 'Quarry', target: achievementData.dayShiftACV.quarry.target, actual: achievementData.dayShiftACV.quarry.actual },
            ],
          },
          {
            title: 'Night Shift ACV',
            details: [
              { name: 'Ore Hauling', target: achievementData.nightShiftACV.oreHauling.target, actual: achievementData.nightShiftACV.oreHauling.actual },
              { name: 'OB', target: achievementData.nightShiftACV.ob.target, actual: achievementData.nightShiftACV.ob.actual },
              { name: 'Ore Barging', target: achievementData.nightShiftACV.oreBarging.target, actual: achievementData.nightShiftACV.oreBarging.actual },
              { name: 'Quarry', target: achievementData.nightShiftACV.quarry.target, actual: achievementData.nightShiftACV.quarry.actual },
            ],
          },
        ],
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: `Error getting daily achievement data: ${error.message}`,
        data: [],
      };
    }
  }

  async getBargeList() {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        list: [
          {
            barge_name: 'Barge Alpha',
            start_loading: '2025-09-01 08:00',
            finish_load: '2025-09-01 14:30',
            capacity: 12000,
            total_vessel: 1,
            vol_by_draft: 11800,
            capacity_per_dt: 95,
            acv: 92,
            remarks: 'Smooth operation',
          },
        ],
        details: [
          { title: 'Capacity', value: 130000 },
          { title: 'Vessel', value: 3100 },
          { title: 'Vol By Draft', value: 123123 },
          { title: 'ACV', value: 500 },
        ],
      },
    };
  }

  async getBargeStatus() {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        barging_ore: [
          {
            name: 'progress',
            value: 10,
            fill: '#3BAF9F',
          },
        ],
        list: [
          {
            variable: 'Barge',
            target: 100,
            actual: 90,
            dev: 6,
            percent: 12,
          },
        ],
        gain_lost: [
          { name: 'Target', value: 9000, type: 'increase', base: 0, height: 9000 },
          { name: 'PDTY', value: 1000, type: 'increase', base: 9000, height: 1000 },
          { name: 'PA', value: 1500, type: 'increase', base: 10000, height: 1500 },
          { name: 'UA', value: -2000, type: 'decrease', base: 11500, height: 2000 },
          { name: 'Actual', value: 9500, type: 'total', base: 0, height: 9500 },
        ],
      },
    };
  }

  async getLostTimeSummary() {
    return {
      statusCode: 200,
      message: 'success',
      data: {
        mohh: [
          { name: 'STB', value: 2224.3, color: '#34d399' },
          { name: 'BD', value: 1.1, color: '#d1d5db' },
          { name: 'EWH', value: 270.6, color: '#10b981' },
        ],
        lost_time: [
          { name: 'Rain', value: 0.3, color: '#1e3a8a' },
          { name: 'Slippery', value: 0.1, color: '#d1d5db' },
          { name: 'MHR', value: 0.25, color: '#34d399' },
          { name: 'Internal', value: 0.2, color: '#fbbf24' },
          { name: 'External', value: 0.35, color: '#60a5fa' },
        ],
        tables: [
          {
            title: 'PA',
            data: [
              {
                target: 1000,
                actual: 1000,
                percent: 10,
              },
            ],
          },
          {
            title: 'MA',
            data: [
              {
                target: 1000,
                actual: 1000,
                percent: 10,
              },
            ],
          },
          {
            title: 'UA',
            data: [
              {
                target: 1000,
                actual: 1000,
                percent: 10,
              },
            ],
          },
          {
            title: 'EU',
            data: [
              {
                target: 1000,
                actual: 1000,
                percent: 10,
              },
            ],
          },
        ],
      },
    };
  }

  async getMonthlyStatus(month: string) {
    try {
      // Input validation
      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return {
          statusCode: 400,
          message: 'Invalid month format. Expected YYYY-MM format',
          error: 'Invalid input parameter'
        };
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Parse month parameter (format: YYYY-MM) with validation
      const [year, monthNum] = month.split('-').map(Number);
      
      // Validate year and month ranges
      if (year < 2000 || year > 2100 || monthNum < 1 || monthNum > 12) {
        await queryRunner.release();
        return {
          statusCode: 400,
          message: 'Invalid year or month range',
          error: 'Year must be between 2000-2100, month must be between 1-12'
        };
      }

      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);

      // Optimized query with better indexing hints
      const targetQuery = `
        SELECT 
          COALESCE(SUM(total_ob_target), 0) as ob_target,
          COALESCE(SUM(total_ore_target), 0) as ore_target,
          COALESCE(SUM(total_ore_shipment_target), 0) as ore_shipment_target,
          COALESCE(SUM(total_quarry_target), 0) as quarry_target
        FROM r_parent_plan_production 
        WHERE plan_date >= $1 AND plan_date <= $2
        AND deleted_at IS NULL
      `;

      const targetResult = await queryRunner.query(targetQuery, [startDate, endDate]);
      const targets = targetResult[0] || {};

      // Achievement query dengan perhitungan tonnage berdasarkan tyre_type
      const achievementQuery = `
        SELECT 
          bdp.material,
          bdp.activity,
          mp.tyre_type,
          COALESCE(SUM(bdp.total_vessel), 0) as total_vessel,
          CASE 
            WHEN mp.tyre_type = '6x4' THEN 
              CASE 
                WHEN bdp.material = 'ob' THEN (SUM(bdp.total_vessel) * 26.56) / 1.6
                WHEN bdp.material = 'ore' AND bdp.activity = 'hauling' THEN SUM(bdp.total_vessel) * 26.56
                WHEN bdp.material = 'ore' AND bdp.activity = 'barging' THEN SUM(bdp.total_vessel) * 16.6
                WHEN bdp.material = 'quarry' THEN SUM(bdp.total_vessel) * 16.6
                ELSE 0
              END
            WHEN mp.tyre_type = '8x4' THEN 
              CASE 
                WHEN bdp.material = 'ob' THEN (SUM(bdp.total_vessel) * 29.56) / 1.6
                WHEN bdp.material = 'ore' AND bdp.activity = 'hauling' THEN SUM(bdp.total_vessel) * 29.56
                WHEN bdp.material = 'ore' AND bdp.activity = 'barging' THEN SUM(bdp.total_vessel) * 18.26
                WHEN bdp.material = 'quarry' THEN SUM(bdp.total_vessel) * 18.26
                ELSE 0
              END
            ELSE 0
          END as tonnage
        FROM r_base_data_pro bdp
        INNER JOIN r_parent_base_data_pro pbdp ON bdp.parent_base_data_pro_id = pbdp.id
        INNER JOIN m_population mp ON pbdp.population_id = mp.id
        WHERE pbdp.activity_date >= $1 AND pbdp.activity_date <= $2
        AND bdp."deletedAt" IS NULL
        AND (
          (bdp.material = 'ob') OR
          (bdp.material = 'ore' AND bdp.activity = 'hauling') OR
          (bdp.material = 'ore' AND bdp.activity = 'barging') OR
          (bdp.material = 'quarry')
        )
        GROUP BY bdp.material, bdp.activity, mp.tyre_type
      `;

      const achievementResult = await queryRunner.query(achievementQuery, [startDate, endDate]);
      
      // Convert achievement result to object for easy lookup dengan grouping yang benar
      const achievements = {
        'ob': 0,
        'ore_hauling': 0,
        'ore_barging': 0,
        'quarry': 0
      };
      
      achievementResult.forEach(row => {
        const tonnage = parseFloat(row.tonnage) || 0;
        if (row.material === 'ob') {
          achievements['ob'] += tonnage;
        } else if (row.material === 'ore' && row.activity === 'hauling') {
          achievements['ore_hauling'] += tonnage;
        } else if (row.material === 'ore' && row.activity === 'barging') {
          achievements['ore_barging'] += tonnage;
        } else if (row.material === 'quarry') {
          achievements['quarry'] += tonnage;
        }
      });

      await queryRunner.release();

      // Calculate data for each activity
      const obTarget = parseFloat(targets.ob_target) || 0;
      const oreTarget = parseFloat(targets.ore_target) || 0;
      const oreShipmentTarget = parseFloat(targets.ore_shipment_target) || 0;
      const quarryTarget = parseFloat(targets.quarry_target) || 0;

      const obAchievement = achievements['ob'] || 0;
      const oreAchievement = achievements['ore_hauling'] || 0;
      const oreBargeAchievement = achievements['ore_barging'] || 0;
      const quarryAchievement = achievements['quarry'] || 0;

      const activities = [
        {
          title: 'OB Removing',
          target: obTarget,
          chart_data: [
            {
              name: 'progress',
              value: obTarget > 0 ? Math.round((obAchievement / obTarget) * 100 * 100) / 100 : 0,
              fill: '#3BAF9F',
            },
          ],
          weekness: obTarget - obAchievement,
          achievement: obAchievement,
        },
        {
          title: 'Ore Hauling',
          target: oreTarget,
          chart_data: [
            {
              name: 'progress',
              value: oreTarget > 0 ? Math.round((oreAchievement / oreTarget) * 100 * 100) / 100 : 0,
              fill: '#3BAF9F',
            },
          ],
          weekness: oreTarget - oreAchievement,
          achievement: oreAchievement,
        },
        {
          title: 'Ore Barging',
          target: oreShipmentTarget,
          chart_data: [
            {
              name: 'progress',
              value: oreShipmentTarget > 0 ? Math.round((oreBargeAchievement / oreShipmentTarget) * 100 * 100) / 100 : 0,
              fill: '#3BAF9F',
            },
          ],
          weekness: oreShipmentTarget - oreBargeAchievement,
          achievement: oreBargeAchievement,
        },
        {
          title: 'Quarry',
          target: quarryTarget,
          chart_data: [
            {
              name: 'progress',
              value: quarryTarget > 0 ? Math.round((quarryAchievement / quarryTarget) * 100 * 100) / 100 : 0,
              fill: '#3BAF9F',
            },
          ],
          weekness: quarryTarget - quarryAchievement,
          achievement: quarryAchievement,
        },
      ];

      return {
        statusCode: 200,
        message: 'success',
        data: activities,
      };
    } catch (error) {
      console.error('Error in getMonthlyStatus:', error);
      
      // More specific error handling
      if (error.code === 'ECONNREFUSED') {
        return {
          statusCode: 503,
          message: 'Database connection failed',
          error: 'Service temporarily unavailable'
        };
      }
      
      if (error.code === '42P01') {
        return {
          statusCode: 500,
          message: 'Database table not found',
          error: 'Internal server configuration error'
        };
      }
      
      return {
        statusCode: 500,
        message: 'Error retrieving monthly status data',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      };
    }
  }

  async getTrendHaulingBarging(month: string) {
    try {
      // Parse month parameter (format: YYYY-MM)
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0); // Last day of the month
      
      // Get number of days in the month
      const daysInMonth = endDate.getDate();
      
      // Initialize result array
      const result: Array<{
        date: string;
        ore_barging: number;
        ore_hauling: number;
        slippery: number;
        rain: number;
      }> = [];
      
      // Get ore barging data from TB_R_Base_Data_Pro
      const oreBargingQuery = `
        SELECT 
          DATE(rpbdp.activity_date) as activity_date,
          SUM(rbdp.total_vessel * 
            CASE 
              WHEN mp.tyre_type = '6x4' THEN 16.6
              WHEN mp.tyre_type = '8x4' THEN 18.26
              ELSE 0
            END
          ) as ore_barging_tonnage
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rbdp.material = 'ore-barge'
          AND rbdp.activity = 'barging'
          AND DATE(rpbdp.activity_date) BETWEEN $1 AND $2
        GROUP BY DATE(rpbdp.activity_date)
        ORDER BY DATE(rpbdp.activity_date)
      `;
      
      // Get ore hauling data from TB_R_Base_Data_Pro
      const oreHaulingQuery = `
        SELECT 
          DATE(rpbdp.activity_date) as activity_date,
          SUM(rbdp.total_vessel * 
            CASE 
              WHEN mp.tyre_type = '6x4' THEN 26.56
              WHEN mp.tyre_type = '8x4' THEN 29.56
              ELSE 0
            END
          ) as ore_hauling_tonnage
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rbdp.material = 'ore'
          AND rbdp.activity = 'hauling'
          AND DATE(rpbdp.activity_date) BETWEEN $1 AND $2
        GROUP BY DATE(rpbdp.activity_date)
        ORDER BY DATE(rpbdp.activity_date)
      `;
      
      // Get slippery data from TB_R_Loss_Time
      const slipperyQuery = `
        SELECT 
          DATE(rlt.date_activity) as activity_date,
          SUM(rlt.duration) as slippery_duration
        FROM r_loss_time rlt
        JOIN m_activities ma ON rlt.activities_id = ma.id
        WHERE rlt.loss_type = 'STB'
          AND LOWER(ma.name) LIKE '%slippery%'
          AND DATE(rlt.date_activity) BETWEEN $1 AND $2
        GROUP BY DATE(rlt.date_activity)
        ORDER BY DATE(rlt.date_activity)
      `;
      
      // Get rain data from TB_R_Loss_Time
      const rainQuery = `
        SELECT 
          DATE(rlt.date_activity) as activity_date,
          SUM(rlt.duration) as rain_duration
        FROM r_loss_time rlt
        JOIN m_activities ma ON rlt.activities_id = ma.id
        WHERE rlt.loss_type = 'STB'
          AND LOWER(ma.name) LIKE '%rain%'
          AND DATE(rlt.date_activity) BETWEEN $1 AND $2
        GROUP BY DATE(rlt.date_activity)
        ORDER BY DATE(rlt.date_activity)
      `;
      
      // Execute queries
      const [oreBargingData, oreHaulingData, slipperyData, rainData] = await Promise.all([
        this.dataSource.query(oreBargingQuery, [startDate, endDate]),
        this.dataSource.query(oreHaulingQuery, [startDate, endDate]),
        this.dataSource.query(slipperyQuery, [startDate, endDate]),
        this.dataSource.query(rainQuery, [startDate, endDate])
      ]);
      
      // Create maps for quick lookup
      const oreBargingMap = new Map();
      const oreHaulingMap = new Map();
      const slipperyMap = new Map();
      const rainMap = new Map();
      
      oreBargingData.forEach(item => {
        oreBargingMap.set(item.activity_date.toISOString().split('T')[0], item.ore_barging_tonnage);
      });
      
      oreHaulingData.forEach(item => {
        oreHaulingMap.set(item.activity_date.toISOString().split('T')[0], item.ore_hauling_tonnage);
      });
      
      slipperyData.forEach(item => {
        slipperyMap.set(item.activity_date.toISOString().split('T')[0], item.slippery_duration);
      });
      
      rainData.forEach(item => {
        rainMap.set(item.activity_date.toISOString().split('T')[0], item.rain_duration);
      });
      
      // Generate data for each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, monthNum - 1, day);
        const dateKey = currentDate.toISOString().split('T')[0];
        const dayStr = day.toString().padStart(2, '0');
        const monthStr = monthNum.toString().padStart(2, '0');
        
        result.push({
          date: `${dayStr}/${monthStr}`,
          ore_barging: oreBargingMap.get(dateKey) || 0,
          ore_hauling: oreHaulingMap.get(dateKey) || 0,
          slippery: slipperyMap.get(dateKey) || 0,
          rain: rainMap.get(dateKey) || 0
        });
      }
      
      return {
        statusCode: 200,
        message: 'success',
        data: result
      };
      
    } catch (error) {
      console.error('Error in getTrendHaulingBarging:', error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: []
      };
    }
  }

  async getTrendFuelRatio(month: string) {
    try {
      // Parse month parameter (format: YYYY-MM)
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0); // Last day of the month

      // Query untuk mendapatkan total qty_supply dari tabel r_fuel per bulan
      const fuelConsumptionQuery = `
        SELECT 
          SUM(COALESCE(rf.qty_supply, 0)) as total_qty_supply
        FROM r_fuel rf
        WHERE DATE(rf.activity_date) BETWEEN $1 AND $2
          AND rf.qty_supply IS NOT NULL
      `;

      // Query untuk mendapatkan total Ore Barging per bulan
      const oreBargingQuery = `
        SELECT 
          SUM(rbdp.total_vessel * 
            CASE 
              WHEN mp.tyre_type = '6x4' THEN 16.6
              WHEN mp.tyre_type = '8x4' THEN 18.26
              ELSE 0
            END
          ) as total_ore_barging
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rbdp.material = 'ore-barge'
          AND rbdp.activity = 'barging'
          AND DATE(rpbdp.activity_date) BETWEEN $1 AND $2
      `;

      // Query untuk mendapatkan total OB Removing per bulan
      const obRemovingQuery = `
        SELECT 
          SUM(rbdp.total_vessel * 
            CASE 
              WHEN mp.tyre_type = '6x4' THEN 26.56
              WHEN mp.tyre_type = '8x4' THEN 29.56
              ELSE 0
            END
          ) as total_ob_removing
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rbdp.material = 'ob'
          AND DATE(rpbdp.activity_date) BETWEEN $1 AND $2
      `;

      // Query untuk mendapatkan total Ore Hauling per bulan
      const oreHaulingQuery = `
        SELECT 
          SUM(rbdp.total_vessel * 
            CASE 
              WHEN mp.tyre_type = '6x4' THEN 26.56
              WHEN mp.tyre_type = '8x4' THEN 29.56
              ELSE 0
            END
          ) as total_ore_hauling
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rbdp.material = 'ore'
          AND rbdp.activity = 'hauling'
          AND DATE(rpbdp.activity_date) BETWEEN $1 AND $2
      `;

      // Execute queries
      const [fuelData, oreBargingData, obRemovingData, oreHaulingData] = await Promise.all([
        this.dataSource.query(fuelConsumptionQuery, [startDate, endDate]),
        this.dataSource.query(oreBargingQuery, [startDate, endDate]),
        this.dataSource.query(obRemovingQuery, [startDate, endDate]),
        this.dataSource.query(oreHaulingQuery, [startDate, endDate])
      ]);

      // Extract values
      const totalQtySupply = parseFloat(fuelData[0]?.total_qty_supply || 0);
      const totalOreBarging = parseFloat(oreBargingData[0]?.total_ore_barging || 0);
      const totalObRemoving = parseFloat(obRemovingData[0]?.total_ob_removing || 0);
      const totalOreHauling = parseFloat(oreHaulingData[0]?.total_ore_hauling || 0);

      // Calculate ratios
      const fr = totalOreBarging > 0 ? totalQtySupply / totalOreBarging : 0;
      const sr = totalOreHauling > 0 ? totalObRemoving / totalOreHauling : 0;

      // Format month for display (MM/YY)
      const monthDisplay = `${monthNum.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;

      return {
        statusCode: 200,
        message: 'success',
        data: {
          chart: [
            { 
              date: monthDisplay, 
              fr: Math.round(fr * 100) / 100, // Round to 2 decimal places
              sr: Math.round(sr * 100) / 100  // Round to 2 decimal places
            }
          ],
          meta: [
            { key: 'fr', label: 'FR', color: '#D96C06', yAxis: 'left' },
            { key: 'sr', label: 'SR', color: '#3E7D70', yAxis: 'left' },
          ],
        },
      };
    } catch (error) {
      console.error('Error in getTrendFuelRatio:', error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: {
          chart: [],
          meta: [
            { key: 'fr', label: 'FR', color: '#D96C06', yAxis: 'left' },
            { key: 'sr', label: 'SR', color: '#3E7D70', yAxis: 'left' },
          ],
        },
      };
    }
  }

  async getTrendPerformanceUnit(month: string) {
    // TEMPORARY: Return dummy data with actual values for testing
    return {
      statusCode: 200,
      message: 'success',
      data: {
        chart: [
          { date: '01/08', pa: 0.85, ma: 0.92, ua: 0.78, eu: 0.65 },
          { date: '02/08', pa: 0.88, ma: 0.89, ua: 0.82, eu: 0.68 },
          { date: '03/08', pa: 0.82, ma: 0.94, ua: 0.75, eu: 0.62 },
          { date: '04/08', pa: 0.90, ma: 0.87, ua: 0.85, eu: 0.72 },
          { date: '05/08', pa: 0.86, ma: 0.91, ua: 0.80, eu: 0.66 },
        ],
        meta: [
          { key: 'pa', label: 'PA', color: '#D96C06', yAxis: 'left' },
          { key: 'ma', label: 'MA', color: '#3E7D70', yAxis: 'left' },
          { key: 'ua', label: 'UA', color: '#54AD9B', yAxis: 'left' },
          { key: 'eu', label: 'EU', color: '#D7EED2', yAxis: 'left' },
        ],
      },
    };
  }

  private generateDummyPerformanceData(startDate: Date, endDate: Date) {
    const chartData: Array<{date: string, pa: number, ma: number, ua: number, eu: number}> = [];
    const daysInMonth = endDate.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDate = `${day.toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;

      // Generate realistic dummy data based on the formulas:
      // PA: (EWH + STANDBY) / MOHH
      // MA: EWH / (EWH + BREAKDOWN)
      // UA: EWH / (EWH + STANDBY)
      // EU: EWH / MOHH

      const ewh = 15 + Math.random() * 5; // 15-20 hours
      const standby = 3 + Math.random() * 2; // 3-5 hours
      const breakdown = 1 + Math.random() * 2; // 1-3 hours
      const mohh = 24; // 24 hours per day

      const pa = (ewh + standby) / mohh;
      const ma = ewh / (ewh + breakdown);
      const ua = ewh / (ewh + standby);
      const eu = ewh / mohh;

      chartData.push({
        date: formattedDate,
        pa: Math.round(pa * 100) / 100,
        ma: Math.round(ma * 100) / 100,
        ua: Math.round(ua * 100) / 100,
        eu: Math.round(eu * 100) / 100,
      });
    }

    return chartData;
  }

  private async getControlMtdDataForMonth(startDate: Date, endDate: Date) {
    // First, let's check if there's any data in the tables
    const checkQuery = `
      SELECT COUNT(*) as count FROM r_parent_base_data_pro 
      WHERE activity_date BETWEEN $1 AND $2
    `;
    
    const countResult = await this.dataSource.query(checkQuery, [startDate, endDate]);
    console.log('Parent data count:', countResult);

    const checkQuery2 = `
      SELECT COUNT(*) as count FROM r_base_data_pro rbdp
      JOIN r_parent_base_data_pro rpbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      WHERE rpbdp.activity_date BETWEEN $1 AND $2
    `;
    
    const countResult2 = await this.dataSource.query(checkQuery2, [startDate, endDate]);
    console.log('Base data count:', countResult2);

    const query = `
      SELECT 
        DATE(rpbdp.activity_date) as activity_date,
        mp.tyre_type,
        mp.no_unit,
        rpbdp.shift,
        SUM(rbdp.total_hm) as total_hm,
        SUM(rbdp.total_km) as total_km,
        COUNT(DISTINCT mp.id) as unit_count
      FROM r_parent_base_data_pro rpbdp
      JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      JOIN m_population mp ON rpbdp.population_id = mp.id
      WHERE rpbdp.activity_date BETWEEN $1 AND $2
        AND mp.site_id = 1
      GROUP BY DATE(rpbdp.activity_date), mp.tyre_type, mp.no_unit, rpbdp.shift
      ORDER BY DATE(rpbdp.activity_date)
    `;

    console.log('Query parameters:', { startDate, endDate });
    const result = await this.dataSource.query(query, [startDate, endDate]);
    console.log('Query result:', result);
    return result;
  }

  private async getBreakdownTimeForDate(noUnit: string, activityDate: string, shift: string) {
    const query = `
      SELECT COALESCE(SUM(duration), 0) as breakdown_time
      FROM r_loss_time
      WHERE no_unit = $1
        AND DATE(activity_date) = $2
        AND shift = $3
        AND loss_type = 'BD'
    `;

    const result = await this.dataSource.query(query, [noUnit, activityDate, shift]);
    return parseFloat(result[0]?.breakdown_time || '0');
  }

  private async calculateDailyPerformanceMetrics(controlMtdData: any[], startDate: Date, endDate: Date) {
    const chartData: Array<{date: string, pa: number, ma: number, ua: number, eu: number}> = [];
    const daysInMonth = endDate.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), day);
      const dateStr = currentDate.toISOString().split('T')[0];
      const formattedDate = `${day.toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;

      // Get data for this specific date
      const dayData = controlMtdData.filter(item => item.activity_date === dateStr);

      let totalEwh = 0;
      let totalStandby = 0;
      let totalBreakdown = 0;
      let totalMohh = 0;

      // Calculate totals for all units on this date
      for (const item of dayData) {
        const ewh = parseFloat(item.total_hm || '0');
        const mohh = 24; // 24 hours per day per unit
        const breakdownTime = await this.getBreakdownTimeForDate(item.no_unit, dateStr, item.shift);
        const standbyTime = mohh - breakdownTime - ewh;

        totalEwh += ewh;
        totalStandby += Math.max(0, standbyTime); // Ensure non-negative
        totalBreakdown += breakdownTime;
        totalMohh += mohh;
      }

      // Calculate PA, MA, UA, EU according to the specified formulas
      const pa = totalMohh > 0 ? (totalEwh + totalStandby) / totalMohh : 0;
      const ma = (totalEwh + totalBreakdown) > 0 ? totalEwh / (totalEwh + totalBreakdown) : 0;
      const ua = (totalEwh + totalStandby) > 0 ? totalEwh / (totalEwh + totalStandby) : 0;
      const eu = totalMohh > 0 ? totalEwh / totalMohh : 0;

      chartData.push({
        date: formattedDate,
        pa: Math.round(pa * 100) / 100, // Round to 2 decimal places
        ma: Math.round(ma * 100) / 100,
        ua: Math.round(ua * 100) / 100,
        eu: Math.round(eu * 100) / 100,
      });
    }

    return chartData;
  }

  async getSummaryProduction() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      const result = await queryRunner.query('SELECT * FROM get_summary_production()');
      
      await queryRunner.release();
      
      return {
        statusCode: 200,
        message: 'success',
        data: result,
      };
    } catch (error) {
      console.error('Error executing get_summary_production:', error);
      return {
        statusCode: 500,
        message: 'Error executing stored procedure',
        error: error.message,
      };
    }
  }

}
