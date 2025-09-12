import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Population } from '../population/entities/population.entity';
import { FormulaService } from '../../common/services/formula.service';
import { ProductionFormulaService } from '../../common/services/production-formula.service';
import { BargingSummaryResponseDto, CcrActivitesResponseDto, FleetStatusResponseDto, HaulingSummaryResponseDto, TonnageResponseDto } from './dto/ccr-dashboard.dto';
import { HaulingResponseDto, LostTimeSummaryResponseDto } from './dto/dashboard.dto';
import { BargeForm } from '../barge-form/entities/barge-form.entity';
import { Barge } from '../barge/entities/barge.entity';
import { EffectiveWorkingHours } from '../effective-working-hours/entities/effective-working-hours.entity';
import { Activities } from '../activities/entities/activities.entity';
import { ParentPlanWorkingHour } from '../plan-working-hour/entities/parent-plan-working-hour.entity';

@Injectable()
export class DashboardService {
  constructor(
    private dataSource: DataSource,
    private formulaService: FormulaService,
    private productionFormulaService: ProductionFormulaService
  ) {}
  async getSpiderData(startDate?: string, endDate?: string) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Set default date range if not provided (last 30 days)
      const defaultEndDate = new Date();
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      const start = startDate ? new Date(startDate) : defaultStartDate;
      const end = endDate ? new Date(endDate) : defaultEndDate;

      // 1. CT (Cycle Time) - Static metric
      const ctTarget = await this.formulaService.getSettingValue(queryRunner, 'cycle_time', 100);
      const ctActual = await this.formulaService.calculateCycleTime(queryRunner, start, end);

      // 2. Prod (Production) - Static metric  
      const prodTarget = await this.formulaService.calculateProductionTarget(queryRunner, start, end);
      const prodActual = await this.formulaService.calculateProductionActual(queryRunner, start, end);

      // 3. EWH (Effective Working Hours) - Static metric
      const ewhTarget = await this.formulaService.calculateEWHTarget(queryRunner, start, end);
      const ewhActual = await this.formulaService.calculateEWHActual(queryRunner, start, end);

      // 4. FR (Fuel Ratio) - Static metric
      const frTarget = await this.formulaService.getSettingValue(queryRunner, 'fuel_ratio', 95);
      const frActual = await this.formulaService.calculateFuelRatioActual(queryRunner, start, end);

      // 5. Speed - Static metric
      const speedTarget = await this.formulaService.getSettingValue(queryRunner, 'speed', 110);
      const speedActual = await this.formulaService.calculateSpeedActual(queryRunner, start, end);

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

  async getTmmDebug() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Check total records in parent table
      const totalParentQuery = `SELECT COUNT(*) as count FROM r_parent_base_data_pro`;
      const totalParent = await queryRunner.query(totalParentQuery);

      // Check total records in base data table
      const totalBaseQuery = `SELECT COUNT(*) as count FROM r_base_data_pro`;
      const totalBase = await queryRunner.query(totalBaseQuery);

      // Check total records in population table
      const totalPopQuery = `SELECT COUNT(*) as count FROM m_population`;
      const totalPop = await queryRunner.query(totalPopQuery);

      // Check recent data (last 30 days)
      const recentQuery = `
        SELECT COUNT(*) as count FROM r_parent_base_data_pro 
        WHERE activity_date >= CURRENT_DATE - INTERVAL '30 days'
      `;
      const recentData = await queryRunner.query(recentQuery);

      // Check data with our specific filters
      const filterQuery = `
        SELECT COUNT(*) as count FROM r_base_data_pro rbdp
        JOIN r_parent_base_data_pro rpbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        WHERE (
          (rbdp.material = 'ore' AND rbdp.activity = 'hauling') OR
          (rbdp.material = 'ob')
        )
        AND rbdp."deletedAt" IS NULL
      `;
      const filterData = await queryRunner.query(filterQuery);

      // Sample data from last 30 days
      const sampleQuery = `
        SELECT 
          rpbdp.activity_date,
          rbdp.material,
          rbdp.activity,
          rbdp.total_vessel,
          mp.tyre_type
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rpbdp.activity_date >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY rpbdp.activity_date DESC
        LIMIT 10
      `;
      const sampleData = await queryRunner.query(sampleQuery);

      await queryRunner.release();

      return {
        statusCode: 200,
        message: 'Debug information',
        data: {
          totalRecords: {
            parentBaseData: totalParent[0]?.count || 0,
            baseData: totalBase[0]?.count || 0,
            population: totalPop[0]?.count || 0,
          },
          recentData: {
            last30Days: recentData[0]?.count || 0,
            withFilters: filterData[0]?.count || 0,
          },
          sampleData: sampleData
        }
      };
    } catch (error) {
      console.error('Error in debug:', error);
      return {
        statusCode: 500,
        message: 'Debug error',
        error: error.message
      };
    }
  }

  async getTmmData(startDate?: string, endDate?: string) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Set default date range if not provided (last 7 days)
      const defaultEndDate = new Date();
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultEndDate.getDate() - 7);

      const start = startDate || defaultStartDate.toISOString().split('T')[0];
      const end = endDate || defaultEndDate.toISOString().split('T')[0];

      console.log('TMM Query Parameters:', { start, end });

      // Debug: Check if there's any data in the tables
      const debugQuery1 = `
        SELECT COUNT(*) as count FROM r_parent_base_data_pro 
        WHERE DATE(activity_date) BETWEEN $1 AND $2
      `;
      const debugResult1 = await queryRunner.query(debugQuery1, [start, end]);
      console.log('Parent base data count:', debugResult1);

      const debugQuery2 = `
        SELECT COUNT(*) as count FROM r_base_data_pro rbdp
        JOIN r_parent_base_data_pro rpbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        WHERE DATE(rpbdp.activity_date) BETWEEN $1 AND $2
          AND (
            (rbdp.material = 'ore' AND rbdp.activity = 'hauling') OR
            (rbdp.material = 'ob')
          )
          AND rbdp."deletedAt" IS NULL
      `;
      const debugResult2 = await queryRunner.query(debugQuery2, [start, end]);
      console.log('Base data count with filters:', debugResult2);

      // Debug: Check sample data
      const debugQuery3 = `
        SELECT 
          rpbdp.activity_date,
          rbdp.material,
          rbdp.activity,
          rbdp.total_vessel,
          mp.tyre_type
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE DATE(rpbdp.activity_date) BETWEEN $1 AND $2
          AND (
            (rbdp.material = 'ore' AND rbdp.activity = 'hauling') OR
            (rbdp.material = 'ob')
          )
          AND rbdp."deletedAt" IS NULL
        LIMIT 5
      `;
      const debugResult3 = await queryRunner.query(debugQuery3, [start, end]);
      console.log('Sample data:', debugResult3);

      // Query untuk mendapatkan data TMM berdasarkan tabel analysis_hauling_barging
      // Menggunakan tabel r_parent_base_data_pro, r_base_data_pro, dan m_population
      const tmmQuery = `
        SELECT 
          DATE(rpbdp.activity_date) as activity_date,
          SUM(
            CASE 
              WHEN rbdp.material = 'ore' AND rbdp.activity IN ('hauling', 'direct') THEN
                CASE 
                  WHEN mp.tyre_type = '6x4' THEN rbdp.total_vessel * 26.56
                  WHEN mp.tyre_type = '8x4' THEN rbdp.total_vessel * 29.56
                  ELSE 0
                END
              ELSE 0
            END
          ) as ore_hauling_bcm,
          SUM(
            CASE 
              WHEN rbdp.material = 'ob' THEN
                CASE 
                  WHEN mp.tyre_type = '6x4' THEN (rbdp.total_vessel * 26.56) / 1.6
                  WHEN mp.tyre_type = '8x4' THEN (rbdp.total_vessel * 29.56) / 1.6
                  ELSE 0
                END
              ELSE 0
            END
          ) as ob_bcm,
          SUM(
            CASE 
              WHEN rbdp.material = 'ore' AND rbdp.activity IN ('hauling', 'direct') THEN
                CASE 
                  WHEN mp.tyre_type = '6x4' THEN rbdp.total_vessel * 26.56
                  WHEN mp.tyre_type = '8x4' THEN rbdp.total_vessel * 29.56
                  ELSE 0
                END
              WHEN rbdp.material = 'ob' THEN
                CASE 
                  WHEN mp.tyre_type = '6x4' THEN (rbdp.total_vessel * 26.56) / 1.6
                  WHEN mp.tyre_type = '8x4' THEN (rbdp.total_vessel * 29.56) / 1.6
                  ELSE 0
                END
              ELSE 0
            END
          ) as tmm_bcm
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE DATE(rpbdp.activity_date) BETWEEN $1 AND $2
          AND (
            (rbdp.material = 'ore' AND rbdp.activity IN ('hauling', 'direct')) OR
            (rbdp.material = 'ob')
          )
          AND rbdp."deletedAt" IS NULL
        GROUP BY DATE(rpbdp.activity_date)
        ORDER BY DATE(rpbdp.activity_date) ASC
      `;

      const tmmData = await queryRunner.query(tmmQuery, [start, end]);
      console.log('TMM Query Result:', tmmData);

      await queryRunner.release();

      // Format data sesuai dengan spesifikasi yang diminta
      const formattedData = tmmData.map(item => {
        const date = new Date(item.activity_date);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const ore = Math.round(parseFloat(item.ore_hauling_bcm) || 0);
        const over = Math.round(parseFloat(item.ob_bcm) || 0);
        const tmm = Math.round(parseFloat(item.tmm_bcm) || 0);

        return {
          date: formattedDate,
          ore: ore,
          over: over,
          tmm: tmm
        };
      });

      return {
        statusCode: 200,
        message: 'success',
        data: formattedData,
      };
    } catch (error) {
      console.error('Error retrieving TMM data:', error);
      return {
        statusCode: 500,
        message: 'Error retrieving TMM data',
        error: error.message
      };
    }
  }

  async getLostTimeData(startDate?: string, endDate?: string) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Set default date range if not provided (last 30 days)
      const defaultEndDate = new Date();
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      const start = startDate ? new Date(startDate) : defaultStartDate;
      const end = endDate ? new Date(endDate) : defaultEndDate;

      // Query untuk mengambil data lost time berdasarkan problem type
      const lostTimeQuery = `
        SELECT 
          CASE 
            WHEN LOWER(ma.name) LIKE '%slippery%' THEN 'Slippery'
            WHEN LOWER(ma.name) LIKE '%rain%' OR LOWER(ma.name) LIKE '%hujan%' THEN 'Rain'
            WHEN LOWER(ma.name) LIKE '%waiting hauler%' OR LOWER(ma.name) LIKE '%menunggu hauler%' THEN 'Waiting Hauler'
            WHEN LOWER(ma.name) LIKE '%rest%' OR LOWER(ma.name) LIKE '%meal%' OR LOWER(ma.name) LIKE '%istirahat%' THEN 'Rest & Meals'
            WHEN LOWER(ma.name) LIKE '%daily shift%' OR LOWER(ma.name) LIKE '%shift harian%' THEN 'Daily shift'
            WHEN LOWER(ma.name) LIKE '%friday pray%' OR LOWER(ma.name) LIKE '%jumat%' OR LOWER(ma.name) LIKE '%shalat%' THEN 'Friday pray'
            WHEN LOWER(lt.description) LIKE '%slippery%' THEN 'Slippery'
            WHEN LOWER(lt.description) LIKE '%rain%' OR LOWER(lt.description) LIKE '%hujan%' THEN 'Rain'
            WHEN LOWER(lt.description) LIKE '%waiting hauler%' OR LOWER(lt.description) LIKE '%menunggu hauler%' THEN 'Waiting Hauler'
            WHEN LOWER(lt.description) LIKE '%rest%' OR LOWER(lt.description) LIKE '%meal%' OR LOWER(lt.description) LIKE '%istirahat%' THEN 'Rest & Meals'
            WHEN LOWER(lt.description) LIKE '%daily shift%' OR LOWER(lt.description) LIKE '%shift harian%' THEN 'Daily shift'
            WHEN LOWER(lt.description) LIKE '%friday pray%' OR LOWER(lt.description) LIKE '%jumat%' OR LOWER(lt.description) LIKE '%shalat%' THEN 'Friday pray'
            ELSE 'Other'
          END as problem_type,
          COALESCE(SUM(lt.duration), 0) as total_duration
        FROM r_loss_time lt
        INNER JOIN m_activities ma ON lt.activities_id = ma.id
        WHERE lt.date_activity BETWEEN $1 AND $2
          AND ma.status IN ('idle', 'delay', 'breakdown')
          AND lt."deletedAt" IS NULL
          AND ma."deletedAt" IS NULL
        GROUP BY 
          CASE 
            WHEN LOWER(ma.name) LIKE '%slippery%' THEN 'Slippery'
            WHEN LOWER(ma.name) LIKE '%rain%' OR LOWER(ma.name) LIKE '%hujan%' THEN 'Rain'
            WHEN LOWER(ma.name) LIKE '%waiting hauler%' OR LOWER(ma.name) LIKE '%menunggu hauler%' THEN 'Waiting Hauler'
            WHEN LOWER(ma.name) LIKE '%rest%' OR LOWER(ma.name) LIKE '%meal%' OR LOWER(ma.name) LIKE '%istirahat%' THEN 'Rest & Meals'
            WHEN LOWER(ma.name) LIKE '%daily shift%' OR LOWER(ma.name) LIKE '%shift harian%' THEN 'Daily shift'
            WHEN LOWER(ma.name) LIKE '%friday pray%' OR LOWER(ma.name) LIKE '%jumat%' OR LOWER(ma.name) LIKE '%shalat%' THEN 'Friday pray'
            WHEN LOWER(lt.description) LIKE '%slippery%' THEN 'Slippery'
            WHEN LOWER(lt.description) LIKE '%rain%' OR LOWER(lt.description) LIKE '%hujan%' THEN 'Rain'
            WHEN LOWER(lt.description) LIKE '%waiting hauler%' OR LOWER(lt.description) LIKE '%menunggu hauler%' THEN 'Waiting Hauler'
            WHEN LOWER(lt.description) LIKE '%rest%' OR LOWER(lt.description) LIKE '%meal%' OR LOWER(lt.description) LIKE '%istirahat%' THEN 'Rest & Meals'
            WHEN LOWER(lt.description) LIKE '%daily shift%' OR LOWER(lt.description) LIKE '%shift harian%' THEN 'Daily shift'
            WHEN LOWER(lt.description) LIKE '%friday pray%' OR LOWER(lt.description) LIKE '%jumat%' OR LOWER(lt.description) LIKE '%shalat%' THEN 'Friday pray'
            ELSE 'Other'
          END
        ORDER BY total_duration DESC
      `;

      const result = await queryRunner.query(lostTimeQuery, [
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      ]);

      // Ambil semua aktivitas yang ada di database untuk memastikan semua muncul
      const activitiesQuery = `
        SELECT DISTINCT name
        FROM m_activities
        WHERE "deletedAt" IS NULL
        ORDER BY name
      `;
      
      const activitiesResult = await queryRunner.query(activitiesQuery);
      const definedCategories = activitiesResult.map(row => row.name);

      await queryRunner.release();

      // Format data sesuai spesifikasi
      const data = result.map(row => ({
        name: row.problem_type,
        value: Math.round(row.total_duration * 100) / 100 // Round to 2 decimal places
      }));

      const finalData: { name: string; value: number }[] = [];
      
      // Tambahkan kategori yang sudah ada data
      definedCategories.forEach(category => {
        const existingData = data.find(item => item.name === category);
        if (existingData) {
          finalData.push(existingData);
        } else {
          finalData.push({ name: category, value: 0 });
        }
      });

      // Tambahkan kategori "Other" jika ada data
      const otherData = data.find(item => item.name === 'Other');
      if (otherData) {
        finalData.push(otherData);
      }

    return {
      statusCode: 200,
      message: 'success',
        data: finalData
      };

    } catch (error) {
      console.error('Error retrieving lost time data:', error);
      return {
        statusCode: 500,
        message: 'Error retrieving lost time data',
        error: error.message
      };
    }
  }

  async getActivitiesList() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const activitiesQuery = `
        SELECT DISTINCT name, status
        FROM m_activities
        WHERE "deletedAt" IS NULL
        ORDER BY name
      `;

      const result = await queryRunner.query(activitiesQuery);
      await queryRunner.release();

      return {
        statusCode: 200,
        message: 'success',
        data: result
      };

    } catch (error) {
      console.error('Error retrieving activities list:', error);
      return {
        statusCode: 500,
        message: 'Error retrieving activities list',
        error: error.message
      };
    }
  }

  async getDailyAchievement(selectedDate?: string, shift?: string) {
    try {
      // Get current date if not provided
      const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
      
      // Get data from ProductionFormulaService
      const achievementData = await this.productionFormulaService.getDailyAchievementData(dateToUse, shift);

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

  async getBargeList(month?: string) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Build WHERE clause untuk filter bulan
      let whereClause = 'WHERE rib."deletedAt" IS NULL AND mb."deletedAt" IS NULL';
      if (month) {
        // Format month: YYYY-MM, kita perlu filter berdasarkan bulan dan tahun
        const year = month.split('-')[0];
        const monthNum = month.split('-')[1];
        whereClause += ` AND EXTRACT(YEAR FROM rib.start_loading) = ${year} AND EXTRACT(MONTH FROM rib.start_loading) = ${monthNum}`;
      }

      // Query untuk mendapatkan list barge dengan join r_input_barge dan m_barge
      // Order by start_loading DESC untuk mendapatkan data terbaru
      const listQuery = `
        SELECT 
          mb.name as barge_name,
          rib.start_loading,
          rib.end_loading as finish_load,
          mb.capacity,
          rib.total_vessel,
          rib.vol_by_survey as vol_by_draft,
          rib.capacity_per_dt,
          rib.achievment as acv,
          rib.remarks
        FROM r_input_barge rib
        JOIN m_barge mb ON rib.barge_id = mb.id
        ${whereClause}
        ORDER BY rib.start_loading DESC
      `;

      const listData = await queryRunner.query(listQuery);

      // Query untuk mendapatkan summary details dengan filter yang sama
      const summaryQuery = `
        SELECT 
          SUM(mb.capacity) as total_capacity,
          SUM(rib.total_vessel) as total_vessel,
          SUM(rib.vol_by_survey) as total_vol_by_draft,
          SUM(rib.achievment) as total_acv
        FROM r_input_barge rib
        JOIN m_barge mb ON rib.barge_id = mb.id
        ${whereClause}
      `;

      const summaryData = await queryRunner.query(summaryQuery);
      const summary = summaryData[0];

      await queryRunner.release();

      // Format response data sesuai spesifikasi
      const formattedList = listData.map(item => ({
        barge_name: item.barge_name || '',
        start_loading: item.start_loading ? new Date(item.start_loading).toISOString().slice(0, 16).replace('T', ' ') : '',
        finish_load: item.finish_load ? new Date(item.finish_load).toISOString().slice(0, 16).replace('T', ' ') : '',
        capacity: item.capacity || 0,
        total_vessel: item.total_vessel || 0,
        vol_by_draft: item.vol_by_draft || 0,
        capacity_per_dt: item.capacity_per_dt || 0,
        acv: item.acv || 0,
        remarks: item.remarks || '',
      }));

      return {
        statusCode: 200,
        message: 'success',
        data: {
          list: formattedList,
          details: [
            {
              title: 'Capacity',
              value: summary.total_capacity || 0,
            },
            {
              title: 'Vessel',
              value: summary.total_vessel || 0,
            },
            {
              title: 'Vol By Draft',
              value: summary.total_vol_by_draft || 0,
            },
            {
              title: 'ACV',
              value: summary.total_acv || 0,
            },
          ],
        },
      };
    } catch (error) {
      console.error('Error in getBargeList:', error);
      throw error;
    }
  }

  async getBargeStatus(month?: string) {
    try {
      // Default to current month if not provided
      const targetMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      // Parse month to get start and end date
      const [year, monthNum] = targetMonth.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Get barge data from r_input_barge and m_barge
      const bargeData = await this.getBargeData(startDateStr, endDateStr);
      
      // Get tonnage data
      const tonnageData = await this.getTonnageData(startDateStr, endDateStr);
      
      // Calculate barging ore progress (actual tonnage / plan tonnage)
      const bargingOreProgress = tonnageData.actualTonnage > 0 && tonnageData.targetTonnage > 0 
        ? Math.min(Math.round((tonnageData.actualTonnage / tonnageData.targetTonnage) * 100), 100)
        : 0;

      // Get gain/lost data
      const gainLostData = await this.getGainLostData(startDateStr, endDateStr);

      return {
        statusCode: 200,
        message: 'success',
        data: {
          barging_ore: [
            {
              name: 'progress',
              value: bargingOreProgress,
              fill: '#3BAF9F',
            },
          ],
          list: [
            {
              variable: 'Barge',
              target: bargeData.targetBarge,
              actual: bargeData.actualBarge,
              dev: bargeData.targetBarge - bargeData.actualBarge,
              percent: bargeData.actualBarge > 0 && bargeData.targetBarge > 0 
                ? Math.round((bargeData.actualBarge / bargeData.targetBarge) * 100)
                : 0,
            },
            {
              variable: 'Tonnage',
              target: tonnageData.targetTonnage,
              actual: tonnageData.actualTonnage,
              dev: tonnageData.targetTonnage - tonnageData.actualTonnage,
              percent: tonnageData.actualTonnage > 0 && tonnageData.targetTonnage > 0 
                ? Math.min(Math.round((tonnageData.actualTonnage / tonnageData.targetTonnage) * 100), 100)
                : 0,
            },
          ],
          gain_lost: gainLostData,
        },
      };
    } catch (error) {
      console.error('Error in getBargeStatus:', error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        error: error.message,
      };
    }
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

    async getHaulingSummary() : Promise<HaulingSummaryResponseDto> {
          try {
              return {
                  statusCode: 200,
                  message: 'success',
                  data: {
                    total_mp: 24,
                    attendance: [
                            { name: 'Hadir', value: 16, color: '#54AD9B' },
                            { name: 'Sakit', value: 2, color: '#54AD9B' },
                            { name: 'Izin', value: 1, color: '#54AD9B' },
                            { name: 'Alpa', value: 1, color: '#FF0000' },
                            { name: 'Cuti', value: 1, color: '#F1C40F' },
                            { name: 'Punishment', value: 1, color: '#F1C40F' },
                            { name: 'Standby', value: 1, color: '#F1C40F' },
                        ],
                        chart_summary: [
                            {
                                title: 'Tonnage',
                                meta: {
                                    actual: 4000,
                                    target: 8000,
                                    percent: 50,
                                },
                            },
                            {
                                title: 'Vessel',
                                meta: {
                                    actual: 5000,
                                    target: 13000,
                                    percent: 38,
                                },
                            },
                            {
                                title: 'Ore',
                                meta: {
                                    actual: 2000,
                                    target: 10000,
                                    percent: 20,
                                },
                            },
                            {
                                title: 'Quarry',
                                meta: {
                                    actual: 2000,
                                    target: 10000,
                                    percent: 20,
                                },
                            },
                            {
                                title: 'OB',
                                meta: {
                                    actual: 2000,
                                    target: 10000,
                                    percent: 20,
                                },
                            },
                ],
                working_hour: [
                    { title: 'EWH', value: 10 },
                    { title: 'STB', value: 50 },
                ]
                }    
              };
          } catch (error){
              throw new BadRequestException(`Gagal mendapatkan data`); 
          }
      }

      async getMockFleetStatus() : Promise<FleetStatusResponseDto> {
          try {
              return {
                  statusCode: 200,
                  message: 'success',
                  data: [
                    {
                        fleet: 'TID-DT-001',
                        start_loading: 'ETO 1',
                        loading_point: 'EFO 1',
                        dumping_point: 'string',
                        target_hauler: 123,
                        actual_hauler: 123,
                        mf: 123,
                        total_vessel: 123,
                        total_tonnage: 123,
                        ore: 123,
                        quarry: 123,
                        ob: 123,
                    },
                    {
                        fleet: 'TID-DT-002',
                        start_loading: 'ETO 1',
                        loading_point: 'EFO 1',
                        dumping_point: 'string',
                        target_hauler: 123,
                        actual_hauler: 123,
                        mf: 123,
                        total_vessel: 123,
                        total_tonnage: 123,
                        ore: 123,
                        quarry: 123,
                        ob: 123,
                    },
                    {
                        fleet: 'TID-DT-003',
                        start_loading: 'ETO 1',
                        loading_point: 'EFO 1',
                        dumping_point: 'string',
                        target_hauler: 123,
                        actual_hauler: 123,
                        mf: 123,
                        total_vessel: 123,
                        total_tonnage: 123,
                        ore: 123,
                        quarry: 123,
                        ob: 123,
                    },
                  ] 
              };
          } catch (error){
              throw new BadRequestException(`Gagal mendapatkan data`); 
          }
      }

      async getMockTonnage() : Promise<TonnageResponseDto> {
          try {
              return {
                  statusCode: 200,
                  message: 'success',
                  data: {
                    chart: [
                        {
                            hour: '18-19',
                            'TID-EX-013': 1,
                            'DT-TR-001': 3,
                            'HD-EX-777': 5,
                            total: 8,
                        },
                        {
                            hour: '19-20',
                            'TID-EX-013': 2,
                            'DT-TR-001': 4,
                            'HD-EX-777': 6,
                            total: 12,
                        },
                    ],
                    meta: {
                        'TID-EX-013': '#F6C89F',
                        'DT-TR-001': '#94D1B2',
                        'HD-EX-777': '#54AD9B',
                        total: '#D96C06',
                    },
                  }
              };
          } catch (error){
              throw new BadRequestException(`Gagal mendapatkan data`); 
          }
      }

      async getMockBargingSummary() : Promise<BargingSummaryResponseDto> {
          try {
              return {
                  statusCode: 200,
                  message: 'success',
                  data: [
                    {
                        title: 'Unit Running',
                        meta: {
                            actual: 4000,
                            target: 8000,
                            percent: 50,
                        },
                    },
                    {
                        title: 'Tonnage',
                        meta: {
                            actual: 5000,
                            target: 13000,
                            percent: 38,
                        },
                    },
                    {
                        title: 'Vessel',
                        meta: {
                            actual: 2000,
                            target: 10000,
                            percent: 20,
                        },
                    },
                ]
              };
          } catch (error){
              throw new BadRequestException(`Gagal mendapatkan data`); 
          }
      }

      async getMockActivities() : Promise<CcrActivitesResponseDto> {
          try {
              return {
                statusCode: 200,
                message: 'success',
                data: [
                    { label: 'No Operator', target: 3000, actual: 2800 },
                    { label: 'Fogging', target: 2950, actual: 2700 },
                    { label: 'Friday Pray', target: 2980, actual: 2750 },
                    { label: 'Hujan', target: 2900, actual: 2600 },
                    { label: 'P2H', target: 3000, actual: 2700 },
                    { label: 'Perbaikan Front Loading', target: 2800, actual: 2500 },
                    { label: 'Refueling', target: 2900, actual: 2650 },
                    { label: 'Rest Time', target: 3000, actual: 2700 },
                    { label: 'Safety Talk', target: 2950, actual: 2800 },
                ]
            };
          } catch (error){
              throw new BadRequestException(`Gagal mendapatkan data`); 
          }
      }

  async getLostTimeSummary(startDate?: string, endDate?: string): Promise<LostTimeSummaryResponseDto> {
    try {
      // Set default date range jika tidak ada parameter
      const defaultStartDate = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const defaultEndDate = endDate || new Date().toISOString().split('T')[0];

      // 1. Hitung MOHH data (STB, BD, EWH)
      const mohhData = await this.calculateMohhData(defaultStartDate, defaultEndDate);

      // 2. Hitung Lost Time data berdasarkan activities dengan status idle dan delay
      const lostTimeData = await this.calculateLostTimeData(defaultStartDate, defaultEndDate);

      // 3. Hitung Tables data (PA, MA, UA, EU)
      const tablesData = await this.calculateTablesData(defaultStartDate, defaultEndDate);

      return {
        statusCode: 200,
        message: 'success',
        data: {
          mohh: mohhData,
          lost_time: lostTimeData,
          tables: tablesData,
        },
      };
    } catch (error) {
      console.error('Error in getLostTimeSummary:', error);
      throw new BadRequestException('Gagal mendapatkan data lost time summary');
    }
  }

  private async calculateMohhData(startDate: string, endDate: string) {
    try {
      // Ambil data dari control_mtd_production sesuai spesifikasi
      // MOHH = duration dari ${start_date} and ${end_date} (dari start_shift dan end_shift)
      // EWH = sum(control.mtdtotal_hm) from r_base_data_pro all unit
      // Breakdown = SUM(r_loss_time.duration) WHERE (r_loss_time.lossType = 'BD')
      // STB = MOHH - EWH - Breakdown Time
      
      // Hitung MOHH = duration dari start_date and end_date
      // Menggunakan data dari r_parent_base_data_pro dengan durasi yang lebih akurat
      const mohhQuery = await this.dataSource.query(`
        SELECT 
          COALESCE(SUM(
            CASE 
              WHEN rpbdp.activity_date BETWEEN $1 AND $2 
                AND rpbdp.start_shift IS NOT NULL 
                AND rpbdp.end_shift IS NOT NULL
              THEN EXTRACT(EPOCH FROM (rpbdp.end_shift - rpbdp.start_shift)) / 3600
              ELSE 0 
            END
          ), 0) as total_mohh
        FROM r_parent_base_data_pro rpbdp
        WHERE rpbdp.activity_date BETWEEN $1 AND $2
      `, [startDate, endDate]);

      // Hitung EWH = SUM(r_base_data_pro.totalHM) all unit
      const ewhQuery = await this.dataSource.query(`
        SELECT COALESCE(SUM(rbdp.totalHM), 0) as total_ewh
        FROM r_parent_base_data_pro rpbdp
        LEFT JOIN r_base_data_pro rbdp ON rbdp.parent_base_data_pro_id = rpbdp.id
        WHERE rpbdp.activity_date BETWEEN $1 AND $2
      `, [startDate, endDate]);

      // Hitung BD = SUM(r_loss_time.duration) WHERE loss_type = 'BD'
      const breakdownQuery = await this.dataSource.query(`
        SELECT COALESCE(SUM(duration), 0) as total_breakdown
        FROM r_loss_time 
        WHERE loss_type = 'BD' 
          AND date_activity BETWEEN $1 AND $2
      `, [startDate, endDate]);

      const totalMohh = parseFloat(mohhQuery[0]?.total_mohh || '0');
      const totalEwh = parseFloat(ewhQuery[0]?.total_ewh || '0');
      const totalBreakdown = parseFloat(breakdownQuery[0]?.total_breakdown || '0');
      
      // Hitung STB = MOHH - EWH - Breakdown Time
      const standbyTime = Math.max(0, totalMohh - totalEwh - totalBreakdown);

      return [
        {
          name: 'STB',
          value: Math.round(standbyTime * 10) / 10,
          color: '#34d399'
        },
        {
          name: 'BD',
          value: Math.round(totalBreakdown * 10) / 10,
          color: '#d1d5db'
        },
        {
          name: 'EWH',
          value: Math.round(totalEwh * 10) / 10,
          color: '#10b981'
        }
      ];
    } catch (error) {
      console.error('Error calculating MOHH data:', error);
      return [
        { name: 'STB', value: 0, color: '#34d399' },
        { name: 'BD', value: 0, color: '#d1d5db' },
        { name: 'EWH', value: 0, color: '#10b981' }
      ];
    }
  }

  private async calculateLostTimeData(startDate: string, endDate: string) {
    try {
      // Ambil data berdasarkan activities dengan status 'idle' dan 'delay'
      // dan r_loss_time dengan loss_type = 'STB'
      const lostTimeQuery = await this.dataSource.query(`
        SELECT 
          TRIM(a.name) as activity_name,
          COALESCE(SUM(lt.duration), 0) as total_duration
        FROM m_activities a
        LEFT JOIN r_loss_time lt ON lt.activities_id = a.id
        WHERE a.status IN ('idle', 'delay')
          AND lt.loss_type = 'STB'
          AND lt.date_activity BETWEEN $1 AND $2
        GROUP BY a.id, TRIM(a.name)
        ORDER BY total_duration DESC
      `, [startDate, endDate]);

      // Mapping nama aktivitas ke warna yang sesuai
      const activityColors: { [key: string]: string } = {
        'Rain': '#1e3a8a',
        'Slippery': '#d1d5db',
        'MHR': '#34d399',
        'Internal': '#fbbf24',
        'External': '#60a5fa'
      };

      const result = lostTimeQuery.map((item: any) => ({
        name: item.activity_name,
        value: Math.round(parseFloat(item.total_duration) * 10) / 10,
        color: activityColors[item.activity_name] || '#6b7280'
      }));

      // Pastikan semua aktivitas yang diharapkan ada dalam response
      const expectedActivities = ['Rain', 'Slippery', 'MHR', 'Internal', 'External'];
      const existingNames = result.map(item => item.name);
      
      expectedActivities.forEach(activityName => {
        if (!existingNames.includes(activityName)) {
          result.push({
            name: activityName,
            value: 0,
            color: activityColors[activityName] || '#6b7280'
          });
        }
      });

      return result;
    } catch (error) {
      console.error('Error calculating lost time data:', error);
      return [
        { name: 'Rain', value: 0, color: '#1e3a8a' },
        { name: 'Slippery', value: 0, color: '#d1d5db' },
        { name: 'MHR', value: 0, color: '#34d399' },
        { name: 'Internal', value: 0, color: '#fbbf24' },
        { name: 'External', value: 0, color: '#60a5fa' }
      ];
    }
  }

  private async calculateTablesData(startDate: string, endDate: string) {
    try {
      // Hitung target dari r_parent_plan_working_hour berdasarkan formula yang sama dengan actual
      // Target dihitung dari data plan working hour yang sudah ada
      
      const targetDataQuery = await this.dataSource.query(`
        SELECT 
          COALESCE(SUM(pwh.mohh_per_month), 0) as target_mohh,
          COALESCE(SUM(
            CASE 
              WHEN a.status = 'delay' THEN COALESCE(pwhd.activities_hour, 0)
              ELSE 0 
            END
          ), 0) as target_delay,
          COALESCE(SUM(
            CASE 
              WHEN a.status = 'idle' THEN COALESCE(pwhd.activities_hour, 0)
              ELSE 0 
            END
          ), 0) as target_idle,
          COALESCE(SUM(
            CASE 
              WHEN a.status = 'breakdown' THEN COALESCE(pwhd.activities_hour, 0)
              ELSE 0 
            END
          ), 0) as target_breakdown
        FROM r_parent_plan_working_hour ppwh
        LEFT JOIN r_plan_working_hour pwh ON pwh.parent_plan_working_hour_id = ppwh.id
        LEFT JOIN r_plan_working_hour_detail pwhd ON pwhd.plant_working_hour_id = pwh.id
        LEFT JOIN m_activities a ON a.id = pwhd.activities_id
        WHERE ppwh.plan_date BETWEEN $1 AND $2
      `, [startDate, endDate]);

      // Hitung actual data sesuai spesifikasi:
      // PA actual = (SUM(all Unit control_mtd_production.ewh) + SUM(all unit control_mtd_production.standby_time)) / SUM(control_mtd_production.MOHH)
      // MA actual = (SUM(all Unit control_mtd_production.ewh) / (SUM(all unit control_mtd_production.ewh) + SUM(control_mtd_production.breakdown_time))
      // UA actual = (SUM(all Unit control_mtd_production.ewh) / (SUM(all unit control_mtd_production.ewh) + SUM(control_mtd_production.standby_time))
      // EU actual = SUM(all Unit control_mtd_production.ewh) / SUM(all unit control_mtd_production.mohh)
      
      const actualDataQuery = await this.dataSource.query(`
        SELECT 
          COALESCE(SUM(rbdp.totalHM), 0) as total_ewh,
          COALESCE(SUM(lt.duration), 0) as total_breakdown,
          COALESCE(SUM(
            CASE 
              WHEN rpbdp.activity_date BETWEEN $1 AND $2 
                AND rpbdp.start_shift IS NOT NULL 
                AND rpbdp.end_shift IS NOT NULL
              THEN EXTRACT(EPOCH FROM (rpbdp.end_shift - rpbdp.start_shift)) / 3600
              ELSE 0 
            END
          ), 0) as total_mohh
        FROM r_parent_base_data_pro rpbdp
        LEFT JOIN r_base_data_pro rbdp ON rbdp.parent_base_data_pro_id = rpbdp.id
        LEFT JOIN r_loss_time lt ON lt.population_id = rpbdp.population_id 
          AND lt.date_activity = rpbdp.activity_date
          AND lt.loss_type = 'BD'
        WHERE rpbdp.activity_date BETWEEN $1 AND $2
      `, [startDate, endDate]);

      const targetData = targetDataQuery[0] || { target_mohh: 0, target_delay: 0, target_idle: 0, target_breakdown: 0 };
      const actualData = actualDataQuery[0] || { total_ewh: 0, total_breakdown: 0, total_mohh: 0 };

      // Hitung target values menggunakan formula yang sama
      const targetMohh = parseFloat(targetData.target_mohh);
      const targetDelay = parseFloat(targetData.target_delay);
      const targetIdle = parseFloat(targetData.target_idle);
      const targetBreakdown = parseFloat(targetData.target_breakdown);
      
      // Hitung target EWH = MOHH - Delay - Idle - Breakdown
      const targetEwh = Math.max(0, targetMohh - targetDelay - targetIdle - targetBreakdown);
      
      // Hitung target standby time = MOHH - EWH - Breakdown Time
      const targetStandby = Math.max(0, targetMohh - targetEwh - targetBreakdown);

      // Hitung actual values
      const actualEwh = parseFloat(actualData.total_ewh);
      const actualBreakdown = parseFloat(actualData.total_breakdown);
      const actualMohh = parseFloat(actualData.total_mohh);
      
      // Hitung actual standby time = MOHH - EWH - Breakdown Time
      const actualStandby = Math.max(0, actualMohh - actualEwh - actualBreakdown);

      // Hitung PA: (EWH + Standby Time) / MOHH
      const paActual = actualMohh > 0 ? (actualEwh + actualStandby) / actualMohh : 0;
      const paTarget = targetMohh > 0 ? (targetEwh + targetStandby) / targetMohh : 0;
      const paPercent = paTarget > 0 ? (paActual / paTarget) * 100 : 0;

      // Hitung MA: EWH / (EWH + Breakdown Time)
      const maActual = (actualEwh + actualBreakdown) > 0 ? actualEwh / (actualEwh + actualBreakdown) : 0;
      const maTarget = (targetEwh + targetBreakdown) > 0 ? targetEwh / (targetEwh + targetBreakdown) : 0;
      const maPercent = maTarget > 0 ? (maActual / maTarget) * 100 : 0;

      // Hitung UA: EWH / (EWH + Standby Time)
      const uaActual = (actualEwh + actualStandby) > 0 ? actualEwh / (actualEwh + actualStandby) : 0;
      const uaTarget = (targetEwh + targetStandby) > 0 ? targetEwh / (targetEwh + targetStandby) : 0;
      const uaPercent = uaTarget > 0 ? (uaActual / uaTarget) * 100 : 0;

      // Hitung EU: EWH / MOHH
      const euActual = actualMohh > 0 ? actualEwh / actualMohh : 0;
      const euTarget = targetMohh > 0 ? targetEwh / targetMohh : 0;
      const euPercent = euTarget > 0 ? (euActual / euTarget) * 100 : 0;

      return [
        {
          title: 'PA',
          data: [{
            target: Math.round(paTarget * 100) / 100,
            actual: Math.round(paActual * 100) / 100,
            percent: Math.round(paPercent * 100) / 100
          }]
        },
        {
          title: 'MA',
          data: [{
            target: Math.round(maTarget * 100) / 100,
            actual: Math.round(maActual * 100) / 100,
            percent: Math.round(maPercent * 100) / 100
          }]
        },
        {
          title: 'UA',
          data: [{
            target: Math.round(uaTarget * 100) / 100,
            actual: Math.round(uaActual * 100) / 100,
            percent: Math.round(uaPercent * 100) / 100
          }]
        },
        {
          title: 'EU',
          data: [{
            target: Math.round(euTarget * 100) / 100,
            actual: Math.round(euActual * 100) / 100,
            percent: Math.round(euPercent * 100) / 100
          }]
        }
      ];
    } catch (error) {
      console.error('Error calculating tables data:', error);
      return [
        { title: 'PA', data: [{ target: 0, actual: 0, percent: 0 }] },
        { title: 'MA', data: [{ target: 0, actual: 0, percent: 0 }] },
        { title: 'UA', data: [{ target: 0, actual: 0, percent: 0 }] },
        { title: 'EU', data: [{ target: 0, actual: 0, percent: 0 }] }
      ];
    }
  }

  /**
   * Get barge data from r_input_barge and m_barge tables
   */
  async getBargeData(startDate?: string, endDate?: string) {
    try {
      // Default to current month if dates not provided
      if (!startDate || !endDate) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        startDate = firstDay.toISOString().split('T')[0];
        endDate = lastDay.toISOString().split('T')[0];
      }

      // Get target barge (count of shipment from r_input_barge)
      const targetBargeQuery = await this.dataSource.query(`
        SELECT COUNT(DISTINCT rib.shipment) as target_barge
        FROM r_input_barge rib
        WHERE rib.start_loading BETWEEN $1 AND $2
          AND rib."deletedAt" IS NULL
      `, [startDate, endDate]);

      // Get actual barge (count of barge from r_input_barge)
      const actualBargeQuery = await this.dataSource.query(`
        SELECT COUNT(DISTINCT rib.barge_id) as actual_barge
        FROM r_input_barge rib
        WHERE rib.start_loading BETWEEN $1 AND $2
          AND rib."deletedAt" IS NULL
      `, [startDate, endDate]);

      return {
        targetBarge: parseInt(targetBargeQuery[0]?.target_barge || '0'),
        actualBarge: parseInt(actualBargeQuery[0]?.actual_barge || '0'),
      };
    } catch (error) {
      console.error('Error getting barge data:', error);
      return { targetBarge: 0, actualBarge: 0 };
    }
  }

  /**
   * Get tonnage data from r_input_barge and m_barge tables
   */
  private async getTonnageData(startDate: string, endDate: string) {
    try {
      // Get target tonnage (sum of capacity from m_barge joined with r_input_barge)
      const targetTonnageQuery = await this.dataSource.query(`
        SELECT COALESCE(SUM(mb.capacity), 0) as target_tonnage
        FROM r_input_barge rib
        JOIN m_barge mb ON rib.barge_id = mb.id
        WHERE rib.start_loading BETWEEN $1 AND $2
          AND rib."deletedAt" IS NULL
          AND mb."deletedAt" IS NULL
      `, [startDate, endDate]);

      // Get actual tonnage (sum of vol_by_survey from r_input_barge)
      const actualTonnageQuery = await this.dataSource.query(`
        SELECT COALESCE(SUM(rib.vol_by_survey), 0) as actual_tonnage
        FROM r_input_barge rib
        WHERE rib.start_loading BETWEEN $1 AND $2
          AND rib."deletedAt" IS NULL
      `, [startDate, endDate]);

      return {
        targetTonnage: parseFloat(targetTonnageQuery[0]?.target_tonnage || '0'),
        actualTonnage: parseFloat(actualTonnageQuery[0]?.actual_tonnage || '0'),
      };
    } catch (error) {
      console.error('Error getting tonnage data:', error);
      return { targetTonnage: 0, actualTonnage: 0 };
    }
  }

  /**
   * Get gain/lost data with PDTY, PA, and UA calculations
   */
  private async getGainLostData(startDate: string, endDate: string) {
    try {
      // Get Target from r_plan_production (ore_target)
      const targetQuery = await this.dataSource.query(`
        SELECT COALESCE(SUM(pp.ore_target), 0) as target_value
        FROM r_plan_production pp
        WHERE pp.plan_date BETWEEN $1 AND $2
          AND pp."deletedAt" IS NULL
      `, [startDate, endDate]);

      const target = parseFloat(targetQuery[0]?.target_value || '0');

      // Get Actual from Summary Production (ore hauling tonnage)
      const actualQuery = await this.dataSource.query(`
        SELECT COALESCE(SUM(
          CASE 
            WHEN mp.tyre_type = '6x4' THEN rbdp.total_vessel * 26.56
            WHEN mp.tyre_type = '8x4' THEN rbdp.total_vessel * 29.56
            ELSE 0
          END
        ), 0) as actual_value
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        JOIN m_population mp ON rpbdp.population_id = mp.id
        WHERE rbdp.material = 'ore'
          AND rbdp.activity = 'hauling'
          AND rpbdp.activity_date BETWEEN $1 AND $2
          AND rbdp."deletedAt" IS NULL
      `, [startDate, endDate]);

      const actual = parseFloat(actualQuery[0]?.actual_value || '0');

      // Calculate PDTY
      const pdtyData = await this.calculatePDTY(startDate, endDate, target, actual);
      
      // Calculate PA
      const paData = await this.calculatePA(startDate, endDate);
      
      // Calculate UA
      const uaValue = -Math.abs((target + paData.value + pdtyData.value) - actual);

      return [
        { 
          name: 'Target', 
          value: Math.round(target), 
          type: 'increase', 
          base: 0, 
          height: Math.round(target) 
        },
        { 
          name: 'PDTY', 
          value: Math.round(pdtyData.value), 
          type: 'increase', 
          base: Math.round(target), 
          height: Math.round(pdtyData.value) 
        },
        { 
          name: 'PA', 
          value: Math.round(paData.value), 
          type: 'increase', 
          base: Math.round(target + pdtyData.value), 
          height: Math.round(paData.value) 
        },
        { 
          name: 'UA', 
          value: Math.round(uaValue), 
          type: 'decrease', 
          base: Math.round(target + pdtyData.value + paData.value), 
          height: Math.abs(Math.round(uaValue)) 
        },
        { 
          name: 'Actual', 
          value: Math.round(actual), 
          type: 'total', 
          base: 0, 
          height: Math.round(actual) 
        },
      ];
    } catch (error) {
      console.error('Error getting gain/lost data:', error);
      return [
        { name: 'Target', value: 0, type: 'increase', base: 0, height: 0 },
        { name: 'PDTY', value: 0, type: 'increase', base: 0, height: 0 },
        { name: 'PA', value: 0, type: 'increase', base: 0, height: 0 },
        { name: 'UA', value: 0, type: 'decrease', base: 0, height: 0 },
        { name: 'Actual', value: 0, type: 'total', base: 0, height: 0 },
      ];
    }
  }

  /**
   * Calculate PDTY (Production Efficiency)
   * Formula: EWHplan x PDTYgain/loss
   * PDTYgain/loss = ABS(PDTYplan - PDTYactual)
   * PDTYplan = (Planplan)/(EWHplan)
   * PDTYactual = (Planactual)/(EWHactual)
   */
  private async calculatePDTY(startDate: string, endDate: string, planPlan: number, planActual: number) {
    try {
      // Get EWHplan from r_plan_working_hours
      const ewhPlanQuery = await this.dataSource.query(`
        SELECT COALESCE(SUM(
          pwh.mohh_per_month - COALESCE(SUM(
            CASE 
              WHEN a.status = 'delay' THEN pwhd.activities_hour
              WHEN a.status = 'idle' THEN pwhd.activities_hour
              WHEN a.status = 'breakdown' THEN pwhd.activities_hour
              ELSE 0
            END
          ), 0)
        ), 0) as ewh_plan
        FROM r_parent_plan_working_hour ppwh
        LEFT JOIN r_plan_working_hour pwh ON pwh.parent_plan_working_hour_id = ppwh.id
        LEFT JOIN r_plan_working_hour_detail pwhd ON pwhd.plant_working_hour_id = pwh.id
        LEFT JOIN m_activities a ON a.id = pwhd.activities_id
        WHERE ppwh.plan_date BETWEEN $1 AND $2
        GROUP BY pwh.mohh_per_month
      `, [startDate, endDate]);

      const ewhPlan = parseFloat(ewhPlanQuery[0]?.ewh_plan || '0');

      // Get EWHactual from Control Day Production
      const ewhActualQuery = await this.dataSource.query(`
        SELECT COALESCE(AVG(rbdp.totalHM), 0) as ewh_actual
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        WHERE rpbdp.activity_date BETWEEN $1 AND $2
          AND rbdp.totalHM > 0
          AND rbdp.deletedAt IS NULL
      `, [startDate, endDate]);

      const ewhActual = parseFloat(ewhActualQuery[0]?.ewh_actual || '0');

      // Calculate PDTY values
      const pdtyPlan = ewhPlan > 0 ? planPlan / ewhPlan : 0;
      const pdtyActual = ewhActual > 0 ? planActual / ewhActual : 0;
      const pdtyGainLoss = Math.abs(pdtyPlan - pdtyActual);
      const pdtyValue = ewhPlan * pdtyGainLoss;

      return { value: pdtyValue };
    } catch (error) {
      console.error('Error calculating PDTY:', error);
      return { value: 0 };
    }
  }

  /**
   * Calculate PA (Production Availability)
   * Formula: PDTYplan x PAgain/loss
   * PAgain/loss = ABS(PAplan - PAactual)
   * PAplan = SUM(Daily Working Hour Plan["Total Repair"] by Filtered Range Date)
   * PAactual = AVG((SUM(Effective Working Hour["Duration"] by Filtered Range Date))) / SUM(*) GROUP BY(Production["Unit"])
   */
  private async calculatePA(startDate: string, endDate: string) {
    try {
      // Get PAplan (Total Repair from plan working hours)
      const paPlanQuery = await this.dataSource.query(`
        SELECT COALESCE(SUM(pwhd.activities_hour), 0) as pa_plan
        FROM r_parent_plan_working_hour ppwh
        LEFT JOIN r_plan_working_hour pwh ON pwh.parent_plan_working_hour_id = ppwh.id
        LEFT JOIN r_plan_working_hour_detail pwhd ON pwhd.plant_working_hour_id = pwh.id
        LEFT JOIN m_activities a ON a.id = pwhd.activities_id
        WHERE ppwh.plan_date BETWEEN $1 AND $2
          AND a.status = 'breakdown'
      `, [startDate, endDate]);

      const paPlan = parseFloat(paPlanQuery[0]?.pa_plan || '0');

      // Get PAactual (Average EWH duration by unit)
      const paActualQuery = await this.dataSource.query(`
        SELECT COALESCE(AVG(unit_ewh.total_ewh), 0) as pa_actual
        FROM (
          SELECT SUM(rbdp.totalHM) as total_ewh
          FROM r_parent_base_data_pro rpbdp
          JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
          WHERE rpbdp.activity_date BETWEEN $1 AND $2
            AND rbdp.totalHM > 0
            AND rbdp.deletedAt IS NULL
          GROUP BY rpbdp.population_id
        ) as unit_ewh
      `, [startDate, endDate]);

      const paActual = parseFloat(paActualQuery[0]?.pa_actual || '0');

      // Calculate PA values
      const paGainLoss = Math.abs(paPlan - paActual);
      
      // Get PDTYplan for calculation
      const pdtyPlanQuery = await this.dataSource.query(`
        SELECT COALESCE(SUM(pp.ore_target), 0) as plan_plan
        FROM r_plan_production pp
        WHERE pp.plan_date BETWEEN $1 AND $2
          AND pp."deletedAt" IS NULL
      `, [startDate, endDate]);

      const planPlan = parseFloat(pdtyPlanQuery[0]?.plan_plan || '0');

      const ewhPlanQuery = await this.dataSource.query(`
        SELECT COALESCE(SUM(pwh.mohh_per_month), 0) as ewh_plan
        FROM r_parent_plan_working_hour ppwh
        LEFT JOIN r_plan_working_hour pwh ON pwh.parent_plan_working_hour_id = ppwh.id
        WHERE ppwh.plan_date BETWEEN $1 AND $2
      `, [startDate, endDate]);

      const ewhPlan = parseFloat(ewhPlanQuery[0]?.ewh_plan || '0');
      const pdtyPlan = ewhPlan > 0 ? planPlan / ewhPlan : 0;
      
      const paValue = pdtyPlan * paGainLoss;

      return { value: paValue };
    } catch (error) {
      console.error('Error calculating PA:', error);
      return { value: 0 };
    }
  }

}
