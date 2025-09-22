import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Population } from '../population/entities/population.entity';
import { FormulaService } from '../../common/services/formula.service';
import { ProductionFormulaService } from '../../common/services/production-formula.service';
import { AnalysisHaulingBargingService } from '../analysis-hauling-barging/analysis-hauling-barging.service';
import {
  FleetStatusItemDto,
  ActivityType,
  CcrActivitiesDto,
  CcrActivitiesItemDto,
  CcrTonnageDto,
  ChartTonnageVesselResult,
  ChartTonnageVesselRow,
  FleetStatusResponseDto,
  HaulingSummaryResponseDto,
  RawDataTonnageVesselRow,
} from './dto/ccr-dashboard.dto';
import {
  LostTimeSummaryResponseDto,
  RawTrendPerformanceRowDto,
  TrendPerformanceChartDto,
  TrendPerformanceUnitChartItemDto,
  TrendPerformanceUnitDataDto,
} from './dto/dashboard.dto';
import { Barge } from '../barge/entities/barge.entity';
import { ApiResponse, successResponse } from 'src/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';
import { HaulingList } from '../hauling-list';
import { BargingList } from '../barging-list/entities/barging-list.entity';
import { calculateTimeRange } from '../../common/helpers/public.helper';
import { BaseDataPro } from '../base-data-production';
import moment from 'moment';
import { Activities } from '../activities';
import { EffectiveWorkingHours } from '../effective-working-hours';

@Injectable()
export class DashboardService {
  constructor(
    private dataSource: DataSource,
    private formulaService: FormulaService,
    private productionFormulaService: ProductionFormulaService,
    private analysisHaulingBargingService: AnalysisHaulingBargingService,
    @InjectRepository(HaulingList)
    private readonly haulingRepo: Repository<HaulingList>,
    @InjectRepository(BargingList)
    private readonly bargingRepo: Repository<BargingList>,
    @InjectRepository(BaseDataPro)
    private readonly baseDataProductionRepository: Repository<BaseDataPro>,
    @InjectRepository(Population)
    private readonly populationRepo: Repository<Population>,
    @InjectRepository(Activities)
    private readonly activitiesRepo: Repository<Activities>,
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
      const ctTarget = await this.formulaService.getSettingValue(
        queryRunner,
        'cycle_time',
        1,
      );
      const ctActual = await this.formulaService.calculateCycleTime(
        queryRunner,
        start,
        end,
      );

      // 2. Prod (Production) - Static metric
      const prodTarget = await this.formulaService.calculateProductionTarget(
        queryRunner,
        start,
        end,
      );
      const prodActual = await this.formulaService.calculateProductionActual(
        queryRunner,
        start,
        end,
      );

      // 3. EWH (Effective Working Hours) - Static metric
      const ewhTarget = await this.formulaService.calculateEWHTarget(
        queryRunner,
        end,
      );
      const ewhActual = await this.formulaService.calculateEWHActual(
        queryRunner,
        start,
        end,
      );

      // 4. FR (Fuel Ratio) - Static metric
      const frTarget = await this.formulaService.getSettingValue(
        queryRunner,
        'fuel_ratio',
        95,
      );
      const frActual = await this.formulaService.calculateFuelRatioActual(
        queryRunner,
        start,
        end,
      );

      // 5. Speed - Static metric
      const speedTarget = await this.formulaService.getSettingValue(
        queryRunner,
        'speed',
        110,
      );
      const speedActual = await this.formulaService.calculateSpeedActual(
        queryRunner,
        start,
        end,
      );

      await queryRunner.release();

      const data = [
        {
          metric: 'CT',
          target: ctTarget,
          actual: ctActual,
          percent: this.formulaService.calculatePercentage(ctActual, ctTarget),
        },
        {
          metric: 'Prod',
          target: prodTarget,
          actual: prodActual,
          percent: this.formulaService.calculatePercentage(
            prodActual,
            prodTarget,
          ),
        },
        {
          metric: 'EWH',
          target: ewhTarget,
          actual: ewhActual,
          percent: this.formulaService.calculatePercentage(
            ewhActual,
            ewhTarget,
          ),
        },
        {
          metric: 'FR',
          target: frTarget,
          actual: frActual,
          percent: this.formulaService.calculatePercentage(frActual, frTarget),
        },
        {
          metric: 'Speed',
          target: speedTarget,
          actual: speedActual,
          percent: this.formulaService.calculatePercentage(
            speedActual,
            speedTarget,
          ),
        },
      ];

      return {
        statusCode: 200,
        message: 'success',
        data: data,
      };
    } catch (error) {
      console.error('Error in getSpiderData:', error);
      return {
        statusCode: 500,
        message: 'Error retrieving spider data',
        error: error.message,
      };
    }
  }

  async getMtdAchievement(startDate?: string, endDate?: string) {
    const start = startDate ?? moment().startOf('month').format('YYYY-MM-DD');
    const end = endDate ?? moment().format('YYYY-MM-DD');
    try {
      // Mendapatkan target dan actual menggunakan shared formula service
      const [targets, actuals] = await Promise.all([
        this.productionFormulaService.getProductionTargets(start, end),
        this.productionFormulaService.getProductionActuals(start, end),
      ]);

      return {
        statusCode: 200,
        message: 'success',
        data: [
          {
            name: 'Ore Hauling',
            target: targets.oreTarget,
            actual: actuals.oreHaulingTonnage,
          },
          {
            name: 'OB',
            target: targets.obTarget,
            actual: actuals.obBCM,
          },
          {
            name: 'Ore Barging',
            target: targets.oreShipmentTarget,
            actual: actuals.bargeTonnage,
          },
          {
            name: 'Quarry',
            target: targets.quarryTarget,
            actual: actuals.quarryTonnage,
          },
        ],
      };
    } catch (error) {
      console.error('Error in getMtdAchievement:', error);
      return {
        statusCode: 500,
        message: 'Error retrieving MTD achievement data',
        error: error.message,
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
      // const actualMap = new Map();
      // actualData.forEach((item) => {
      //   actualMap.set(item.date, {
      //     tonnage: parseFloat(item.total_tonnage) || 0,
      //     slippery: parseFloat(item.total_slippery) || 0,
      //     rain: parseFloat(item.total_rain) || 0,
      //   });
      // });
      const actualMap = new Map();
      actualData.forEach((item) => {
        // convert ke YYYY-MM-DD string
        const key = new Date(item.date).toISOString().split('T')[0];
        actualMap.set(key, {
          tonnage: parseFloat(item.total_tonnage) || 0,
          slippery: parseFloat(item.total_slippery) || 0,
          rain: parseFloat(item.total_rain) || 0,
        });
      });

      // Combine target and actual data
      const result = targetData.map((item) => {
        const key = new Date(item.plan_date).toISOString().split('T')[0];
        const actualInfo = actualMap.get(key) || {
          tonnage: 0,
          slippery: 0,
          rain: 0,
        };

        const date = new Date(item.plan_date);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

        return {
          date: formattedDate,
          target: parseFloat(item.ore_target) || 0,
          actual: actualInfo.tonnage,
          slippery: actualInfo.slippery,
          rain: actualInfo.rain,
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
        error: error.message,
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
          sampleData: sampleData,
        },
      };
    } catch (error) {
      console.error('Error in debug:', error);
      return {
        statusCode: 500,
        message: 'Debug error',
        error: error.message,
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
      const formattedData = tmmData.map((item) => {
        const date = new Date(item.activity_date);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

        const ore = Math.round(parseFloat(item.ore_hauling_bcm) || 0);
        const over = Math.round(parseFloat(item.ob_bcm) || 0);
        const tmm = Math.round(parseFloat(item.tmm_bcm) || 0);

        return {
          date: formattedDate,
          ore: ore,
          over: over,
          tmm: tmm,
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
        error: error.message,
      };
    }
  }

  async getLostTimeData(
    startDate?: string,
    endDate?: string,
    status: string[] = ['idle', 'delay'],
  ) {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Set default date range if not provided (last 30 days)
      const defaultEndDate = new Date();
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);

      const start = startDate ? new Date(startDate) : defaultStartDate;
      const end = endDate ? new Date(endDate) : defaultEndDate;

      const qb = this.activitiesRepo
        .createQueryBuilder('ma')
        .leftJoin(
          EffectiveWorkingHours,
          'rlt',
          'rlt.activities_id = ma.id AND rlt.date_activity BETWEEN :start AND :end AND rlt.deletedAt IS NULL',
          { start, end },
        )
        .select('ma.name', 'name')
        .addSelect('ma.status', 'status')
        .addSelect('COALESCE(SUM(rlt.duration) / 60, 0)', 'total_duration')
        .where('ma.status IN (:...status)', { status })
        .andWhere('ma.deletedAt IS NULL')
        .groupBy('ma.name')
        .addGroupBy('ma.status')
        .orderBy('ma.name', 'ASC');

      const result = await qb.getRawMany();

      const data = result.map((row) => ({
        name: row.name,
        value: Math.round(row.total_duration * 100) / 100, // Round to 2 decimal places
      }));

      return {
        statusCode: 200,
        message: 'success',
        data: data,
      };
    } catch (error) {
      console.error('Error retrieving lost time data:', error);
      return {
        statusCode: 500,
        message: 'Error retrieving lost time data',
        error: error.message,
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
        data: result,
      };
    } catch (error) {
      console.error('Error retrieving activities list:', error);
      return {
        statusCode: 500,
        message: 'Error retrieving activities list',
        error: error.message,
      };
    }
  }

  async getDailyAchievement(selectedDate?: string, shift?: string) {
    try {
      // Get current date if not provided
      const dateToUse = selectedDate || new Date().toISOString().split('T')[0];

      // Get data from ProductionFormulaService
      const achievementData =
        await this.productionFormulaService.getDailyAchievementData(
          dateToUse,
          shift,
        );

      return {
        statusCode: 200,
        message: 'success',
        data: [
          {
            title: 'Daily ACV',
            details: [
              {
                name: 'Ore Hauling',
                target: achievementData.dailyACV.oreHauling.target,
                actual: achievementData.dailyACV.oreHauling.actual,
              },
              {
                name: 'OB',
                target: achievementData.dailyACV.ob.target,
                actual: achievementData.dailyACV.ob.actual,
              },
              {
                name: 'Ore Barging',
                target: achievementData.dailyACV.oreBarging.target,
                actual: achievementData.dailyACV.oreBarging.actual,
              },
              {
                name: 'Quarry',
                target: achievementData.dailyACV.quarry.target,
                actual: achievementData.dailyACV.quarry.actual,
              },
            ],
          },
          {
            title: 'Day Shift ACV',
            details: [
              {
                name: 'Ore Hauling',
                target: achievementData.dayShiftACV.oreHauling.target,
                actual: achievementData.dayShiftACV.oreHauling.actual,
              },
              {
                name: 'OB',
                target: achievementData.dayShiftACV.ob.target,
                actual: achievementData.dayShiftACV.ob.actual,
              },
              {
                name: 'Ore Barging',
                target: achievementData.dayShiftACV.oreBarging.target,
                actual: achievementData.dayShiftACV.oreBarging.actual,
              },
              {
                name: 'Quarry',
                target: achievementData.dayShiftACV.quarry.target,
                actual: achievementData.dayShiftACV.quarry.actual,
              },
            ],
          },
          {
            title: 'Night Shift ACV',
            details: [
              {
                name: 'Ore Hauling',
                target: achievementData.nightShiftACV.oreHauling.target,
                actual: achievementData.nightShiftACV.oreHauling.actual,
              },
              {
                name: 'OB',
                target: achievementData.nightShiftACV.ob.target,
                actual: achievementData.nightShiftACV.ob.actual,
              },
              {
                name: 'Ore Barging',
                target: achievementData.nightShiftACV.oreBarging.target,
                actual: achievementData.nightShiftACV.oreBarging.actual,
              },
              {
                name: 'Quarry',
                target: achievementData.nightShiftACV.quarry.target,
                actual: achievementData.nightShiftACV.quarry.actual,
              },
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
      let whereClause =
        'WHERE rib."deletedAt" IS NULL AND mb."deletedAt" IS NULL';
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
      const formattedList = listData.map((item) => ({
        barge_name: item.barge_name || '',
        start_loading: item.start_loading
          ? new Date(item.start_loading)
              .toISOString()
              .slice(0, 16)
              .replace('T', ' ')
          : '',
        finish_load: item.finish_load
          ? new Date(item.finish_load)
              .toISOString()
              .slice(0, 16)
              .replace('T', ' ')
          : '',
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

      // Get barge data from analysis-hauling-barging service
      const bargeDataArray = await this.getBargeData(startDateStr, endDateStr);

      // Calculate total barge and hauling tonnage
      const totalBargeTonnage = bargeDataArray.reduce(
        (sum, item) => sum + item.barge,
        0,
      );
      const totalHaulingTonnage = bargeDataArray.reduce(
        (sum, item) => sum + item.hauling,
        0,
      );

      // For now, we'll use the total tonnage as both target and actual
      // In a real scenario, you might want to get target values from a different source
      const bargeData = {
        targetBarge: totalBargeTonnage,
        actualBarge: totalBargeTonnage,
      };

      // Get tonnage data
      const tonnageData = await this.getTonnageData(startDateStr, endDateStr);

      // Calculate barging ore progress (actual tonnage / plan tonnage)
      const bargingOreProgress =
        tonnageData.actualTonnage > 0 && tonnageData.targetTonnage > 0
          ? Math.min(
              Math.round(
                (tonnageData.actualTonnage / tonnageData.targetTonnage) * 100,
              ),
              100,
            )
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
              percent:
                bargeData.actualBarge > 0 && bargeData.targetBarge > 0
                  ? Math.round(
                      (bargeData.actualBarge / bargeData.targetBarge) * 100,
                    )
                  : 0,
            },
            {
              variable: 'Tonnage',
              target: tonnageData.targetTonnage,
              actual: tonnageData.actualTonnage,
              dev: tonnageData.targetTonnage - tonnageData.actualTonnage,
              percent:
                tonnageData.actualTonnage > 0 && tonnageData.targetTonnage > 0
                  ? Math.min(
                      Math.round(
                        (tonnageData.actualTonnage /
                          tonnageData.targetTonnage) *
                          100,
                      ),
                      100,
                    )
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
          error: 'Invalid input parameter',
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
          error: 'Year must be between 2000-2100, month must be between 1-12',
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

      const targetResult = await queryRunner.query(targetQuery, [
        startDate,
        endDate,
      ]);
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

      const achievementResult = await queryRunner.query(achievementQuery, [
        startDate,
        endDate,
      ]);

      // Convert achievement result to object for easy lookup dengan grouping yang benar
      const achievements = {
        ob: 0,
        ore_hauling: 0,
        ore_barging: 0,
        quarry: 0,
      };

      achievementResult.forEach((row) => {
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
              value:
                obTarget > 0
                  ? Math.round((obAchievement / obTarget) * 100 * 100) / 100
                  : 0,
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
              value:
                oreTarget > 0
                  ? Math.round((oreAchievement / oreTarget) * 100 * 100) / 100
                  : 0,
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
              value:
                oreShipmentTarget > 0
                  ? Math.round(
                      (oreBargeAchievement / oreShipmentTarget) * 100 * 100,
                    ) / 100
                  : 0,
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
              value:
                quarryTarget > 0
                  ? Math.round((quarryAchievement / quarryTarget) * 100 * 100) /
                    100
                  : 0,
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
          error: 'Service temporarily unavailable',
        };
      }

      if (error.code === '42P01') {
        return {
          statusCode: 500,
          message: 'Database table not found',
          error: 'Internal server configuration error',
        };
      }

      return {
        statusCode: 500,
        message: 'Error retrieving monthly status data',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
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
      const [oreBargingData, oreHaulingData, slipperyData, rainData] =
        await Promise.all([
          this.dataSource.query(oreBargingQuery, [startDate, endDate]),
          this.dataSource.query(oreHaulingQuery, [startDate, endDate]),
          this.dataSource.query(slipperyQuery, [startDate, endDate]),
          this.dataSource.query(rainQuery, [startDate, endDate]),
        ]);

      // Create maps for quick lookup
      const oreBargingMap = new Map();
      const oreHaulingMap = new Map();
      const slipperyMap = new Map();
      const rainMap = new Map();

      oreBargingData.forEach((item) => {
        oreBargingMap.set(
          item.activity_date.toISOString().split('T')[0],
          item.ore_barging_tonnage,
        );
      });

      oreHaulingData.forEach((item) => {
        oreHaulingMap.set(
          item.activity_date.toISOString().split('T')[0],
          item.ore_hauling_tonnage,
        );
      });

      slipperyData.forEach((item) => {
        slipperyMap.set(
          item.activity_date.toISOString().split('T')[0],
          item.slippery_duration,
        );
      });

      rainData.forEach((item) => {
        rainMap.set(
          item.activity_date.toISOString().split('T')[0],
          item.rain_duration,
        );
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
          rain: rainMap.get(dateKey) || 0,
        });
      }

      return {
        statusCode: 200,
        message: 'success',
        data: result,
      };
    } catch (error) {
      console.error('Error in getTrendHaulingBarging:', error);
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: [],
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
      const [fuelData, oreBargingData, obRemovingData, oreHaulingData] =
        await Promise.all([
          this.dataSource.query(fuelConsumptionQuery, [startDate, endDate]),
          this.dataSource.query(oreBargingQuery, [startDate, endDate]),
          this.dataSource.query(obRemovingQuery, [startDate, endDate]),
          this.dataSource.query(oreHaulingQuery, [startDate, endDate]),
        ]);

      // Extract values
      const totalQtySupply = parseFloat(fuelData[0]?.total_qty_supply || 0);
      const totalOreBarging = parseFloat(
        oreBargingData[0]?.total_ore_barging || 0,
      );
      const totalObRemoving = parseFloat(
        obRemovingData[0]?.total_ob_removing || 0,
      );
      const totalOreHauling = parseFloat(
        oreHaulingData[0]?.total_ore_hauling || 0,
      );

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
              sr: Math.round(sr * 100) / 100, // Round to 2 decimal places
            },
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

  private toNum(value: any): number {
    return Number(value) || 0;
  }

  // Helper: safe percentage calculation
  private safeRatio(num: number, den: number): number {
    return den ? Math.round((num / den) * 10000) / 100 : 0;
  }

  private aggregateByDate(
    rows: RawTrendPerformanceRowDto[],
  ): Record<string, RawTrendPerformanceRowDto> {
    return rows.reduce(
      (acc, row) => {
        const dateKey = moment(row.date).format('DD/MM');
        if (!acc[dateKey]) {
          acc[dateKey] = { date: dateKey, mohh: 0, ewh: 0, breakdown: 0 };
        }
        acc[dateKey].mohh += this.toNum(row.mohh);
        acc[dateKey].ewh += this.toNum(row.ewh);
        acc[dateKey].breakdown += this.toNum(row.breakdown);
        return acc;
      },
      {} as Record<string, RawTrendPerformanceRowDto>,
    );
  }

  private mapToChartData(
    aggregated: Record<string, RawTrendPerformanceRowDto>,
  ): TrendPerformanceChartDto[] {
    return Object.values(aggregated).map(({ date, mohh, ewh, breakdown }) => {
      const standby = mohh - breakdown - ewh;
      return {
        date,
        pa: this.safeRatio(ewh + standby, mohh),
        ua: this.safeRatio(ewh, ewh + standby),
        ma: this.safeRatio(ewh, ewh + breakdown),
        eu: this.safeRatio(ewh, mohh),
      };
    });
  }

  private async fetchBaseDataProRawData(
    startDate: string,
    endDate: string,
  ): Promise<RawTrendPerformanceRowDto[]> {
    return this.baseDataProductionRepository
      .createQueryBuilder('rbdp')
      .select('rpbdp.population_id', 'population_id')
      .addSelect('rpbdp.shift', 'shift')
      .addSelect('rpbdp.activity_date::date', 'date')
      .addSelect('((DATE(:endDate) - DATE(:startDate) + 1) * 24)', 'mohh')
      .addSelect('SUM(rbdp.total_hm::numeric)', 'ewh')
      .addSelect('COALESCE(SUM(rtl.duration),0) / 60', 'breakdown')
      .where('rpbdp.activity_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .leftJoin(
        'r_parent_base_data_pro',
        'rpbdp',
        'rpbdp.id = rbdp.parent_base_data_pro_id',
      )
      .leftJoin(
        'r_loss_time',
        'rtl',
        'rtl.population_id = rpbdp.population_id AND rtl.loss_type = :lossType AND rtl.start BETWEEN :startDate AND :endDate',
        { lossType: 'BD', startDate, endDate },
      )
      .groupBy('rpbdp.population_id')
      .addGroupBy('rpbdp.shift')
      .addGroupBy('rpbdp.activity_date::date')
      .getRawMany<RawTrendPerformanceRowDto>();
  }

  async getTrendPerformanceUnit(month: string): Promise<ApiResponse<any>> {
    try {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = moment({ year, month: monthNum - 1, day: 1 }).format(
        'YYYY-MM-DD',
      );
      const endDate = moment({ year, month: monthNum - 1, day: 1 })
        .endOf('month')
        .format('YYYY-MM-DD');

      const rawData = await this.fetchBaseDataProRawData(startDate, endDate);
      const aggregated = this.aggregateByDate(rawData);
      const chart = this.mapToChartData(aggregated);

      return successResponse({
        chart,
        meta: [
          { key: 'pa', label: 'PA', color: '#D96C06', yAxis: 'left' },
          { key: 'ma', label: 'MA', color: '#3E7D70', yAxis: 'left' },
          { key: 'ua', label: 'UA', color: '#54AD9B', yAxis: 'left' },
          { key: 'eu', label: 'EU', color: '#D7EED2', yAxis: 'left' },
        ],
      });
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
        data: {
          chart: [],
          meta: [
            { key: 'pa', label: 'PA', color: '#D96C06', yAxis: 'left' },
            { key: 'ma', label: 'MA', color: '#3E7D70', yAxis: 'left' },
            { key: 'ua', label: 'UA', color: '#54AD9B', yAxis: 'left' },
            { key: 'eu', label: 'EU', color: '#D7EED2', yAxis: 'left' },
          ],
        },
      };
    }
  }

  private generateDummyPerformanceData(startDate: Date, endDate: Date) {
    const chartData: Array<{
      date: string;
      pa: number;
      ma: number;
      ua: number;
      eu: number;
    }> = [];
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

    const countResult = await this.dataSource.query(checkQuery, [
      startDate,
      endDate,
    ]);
    console.log('Parent data count:', countResult);

    const checkQuery2 = `
      SELECT COUNT(*) as count FROM r_base_data_pro rbdp
      JOIN r_parent_base_data_pro rpbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      WHERE rpbdp.activity_date BETWEEN $1 AND $2
    `;

    const countResult2 = await this.dataSource.query(checkQuery2, [
      startDate,
      endDate,
    ]);
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

  private async getBreakdownTimeForDate(
    noUnit: string,
    activityDate: string,
    shift: string,
  ) {
    const query = `
      SELECT COALESCE(SUM(duration), 0) as breakdown_time
      FROM r_loss_time
      WHERE no_unit = $1
        AND DATE(activity_date) = $2
        AND shift = $3
        AND loss_type = 'BD'
    `;

    const result = await this.dataSource.query(query, [
      noUnit,
      activityDate,
      shift,
    ]);
    return parseFloat(result[0]?.breakdown_time || '0');
  }

  private async calculateDailyPerformanceMetrics(
    controlMtdData: any[],
    startDate: Date,
    endDate: Date,
  ) {
    const chartData: Array<{
      date: string;
      pa: number;
      ma: number;
      ua: number;
      eu: number;
    }> = [];
    const daysInMonth = endDate.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        day,
      );
      const dateStr = currentDate.toISOString().split('T')[0];
      const formattedDate = `${day.toString().padStart(2, '0')}/${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;

      // Get data for this specific date
      const dayData = controlMtdData.filter(
        (item) => item.activity_date === dateStr,
      );

      let totalEwh = 0;
      let totalStandby = 0;
      let totalBreakdown = 0;
      let totalMohh = 0;

      // Calculate totals for all units on this date
      for (const item of dayData) {
        const ewh = parseFloat(item.total_hm || '0');
        const mohh = 24; // 24 hours per day per unit
        const breakdownTime = await this.getBreakdownTimeForDate(
          item.no_unit,
          dateStr,
          item.shift,
        );
        const standbyTime = mohh - breakdownTime - ewh;

        totalEwh += ewh;
        totalStandby += Math.max(0, standbyTime); // Ensure non-negative
        totalBreakdown += breakdownTime;
        totalMohh += mohh;
      }

      // Calculate PA, MA, UA, EU according to the specified formulas
      const pa = totalMohh > 0 ? (totalEwh + totalStandby) / totalMohh : 0;
      const ma =
        totalEwh + totalBreakdown > 0
          ? totalEwh / (totalEwh + totalBreakdown)
          : 0;
      const ua =
        totalEwh + totalStandby > 0 ? totalEwh / (totalEwh + totalStandby) : 0;
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

      const result = await queryRunner.query(
        'SELECT * FROM get_summary_production()',
      );

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

  async getHaulingSummary(
    selectedDate?: string,
    shift?: string,
  ): Promise<HaulingSummaryResponseDto> {
    try {
      const today = new Date();
      const defaultSelectedDate =
        selectedDate ?? today.toISOString().split('T')[0];
      let shiftChange = '';
      let shiftProb = '';
      if (shift) {
        shiftChange = `AND rch.shift ='${shift}'`;
        shiftProb = `AND rchp.shift ='${shift}'`;
      }
      const query = `
        WITH ore_data_hauling AS (
          SELECT
            rch.activity_date,
            COALESCE(SUM(vessel), 0) AS total_vessel,
            COALESCE(SUM(total_tonnage), 0) AS total_tonnage
          FROM r_ccr_hauling rch
          WHERE rch.activity_date::date = $1
          ${shiftChange}
          GROUP BY rch.activity_date
        ),
        material_data AS (
          SELECT
            rch.activity_date,
            rch.material,
            COALESCE(SUM(vessel), 0) AS total_vessel,
            COALESCE(SUM(total_tonnage), 0) AS total_tonnage
          FROM r_ccr_hauling rch
          WHERE rch.activity_date::date = $1
          ${shiftChange}
          GROUP BY rch.activity_date, rch.material
        ),
        plan_production AS (
          SELECT
            rpp.plan_date,
            rpp.ore_target,
            rpp.ore_shipment_target,
            rpp.ob_target,
            rpp.quarry
          FROM r_plan_production rpp
          WHERE rpp.plan_date::date = $1
        ),
        plan_working_hour AS (
          SELECT
            rpwh.plan_date,
            COALESCE(rpwh.mohh_per_month, 0) / 2 AS ewh
          FROM r_plan_working_hour rpwh
          WHERE rpwh.plan_date::date = $1
        ),
        hauling_problem AS (
          SELECT
            rchp.activity_date,
            COALESCE(SUM(CASE WHEN ma.status IN ('idle','delay') THEN rchp.duration END), 0) AS idle_duration,
            COALESCE(SUM(CASE WHEN ma.status = 'breakdown' THEN rchp.duration END), 0) AS bd_duration
          FROM r_ccr_hauling_problem rchp
          LEFT JOIN m_activities ma ON ma.id = rchp.activities_id
          WHERE rchp.activity_date::date = $1
          ${shiftProb}
          GROUP BY rchp.activity_date
        )
        SELECT 
          pp.plan_date,
          pp.ore_target,
          pp.ore_shipment_target,
          pp.ob_target,
          pp.quarry,
          COALESCE(odch.total_tonnage, 0) AS total_tonnage,
          COALESCE(odch.total_vessel, 0) AS total_vessel,
          COALESCE(hp.idle_duration, 0) AS idle_duration,
          COALESCE(hp.bd_duration, 0) AS bd_duration,
          COALESCE(pwh.ewh, 0) AS ewh,
          COALESCE(SUM(md.total_vessel) FILTER (WHERE md.material = 'ore'), 0) AS ore_vessel,
          COALESCE(SUM(md.total_tonnage) FILTER (WHERE md.material = 'ore'), 0) AS ore_tonnage,
          COALESCE(SUM(md.total_vessel) FILTER (WHERE md.material = 'quarry'), 0) AS quarry_vessel,
          COALESCE(SUM(md.total_tonnage) FILTER (WHERE md.material = 'quarry'), 0) AS quarry_tonnage,
          COALESCE(SUM(md.total_vessel) FILTER (WHERE md.material = 'ob'), 0) AS ob_vessel,
          COALESCE(SUM(md.total_tonnage) FILTER (WHERE md.material = 'ob'), 0) AS ob_tonnage
        FROM plan_production pp
        LEFT JOIN material_data md ON md.activity_date::date = pp.plan_date
        LEFT JOIN ore_data_hauling odch ON odch.activity_date::date = pp.plan_date
        LEFT JOIN hauling_problem hp ON hp.activity_date::date = pp.plan_date
        LEFT JOIN plan_working_hour pwh ON pwh.plan_date::date = pp.plan_date
        GROUP BY
          pp.plan_date, pp.ore_target, pp.ore_shipment_target, pp.ob_target, pp.quarry,
          odch.total_tonnage, odch.total_vessel, hp.idle_duration, hp.bd_duration, pwh.ewh;
        `;

      const result = await this.dataSource.query(query, [defaultSelectedDate]);

      const row = result[0] ?? {};
      const productionData = {
        planDate: row.plan_date ?? null,
        oreTarget: row.ore_target ?? 0,
        oreShipmentTarget: row.ore_shipment_target ?? 0,
        obTarget: row.ob_target ?? 0,
        quarryTarget: row.quarry ?? 0,
        totalTonnage: row.total_tonnage ?? 0,
        totalVessel: parseInt(row.total_vessel ?? '0'),
        totalOreTonnage: row.ore_tonnage ?? 0,
        totalQuarryTonnage: row.quarry_tonnage ?? 0,
        totalObTonnage: row.ob_tonnage ?? 0,
        bdDuration: row.bd_duration ?? 0,
        idleDuration: row.idle_duration ?? 0,
        ewh: row.ewh ?? 0,
      };
      const tonnagePercentage =
        productionData.oreTarget > 0
          ? (productionData.totalTonnage / productionData.oreTarget) * 100
          : 0;
      const vesselPercentage =
        productionData.oreTarget > 0
          ? (productionData.totalVessel / productionData.oreTarget) * 100
          : 0;
      const orePercentage =
        productionData.oreTarget > 0
          ? (productionData.totalOreTonnage / productionData.oreTarget) * 100
          : 0;
      const quarryPercentage =
        productionData.quarryTarget > 0
          ? (productionData.totalQuarryTonnage / productionData.quarryTarget) *
            100
          : 0;
      const obPercentage =
        productionData.obTarget > 0
          ? (productionData.totalObTonnage / productionData.obTarget) * 100
          : 0;

      return {
        statusCode: 200,
        message: 'success',
        data: {
          total_mp: 0,
          attendance: [
            { name: 'Hadir', value: 0, color: '#54AD9B' },
            { name: 'Sakit', value: 0, color: '#54AD9B' },
            { name: 'Izin', value: 0, color: '#54AD9B' },
            { name: 'Alpa', value: 0, color: '#FF0000' },
            { name: 'Cuti', value: 0, color: '#F1C40F' },
            { name: 'Punishment', value: 0, color: '#F1C40F' },
            { name: 'Standby', value: 0, color: '#F1C40F' },
          ],
          chart_summary: [
            {
              title: 'Tonnage',
              meta: {
                actual: productionData?.totalTonnage || 0,
                target:
                  productionData.oreTarget ||
                  0 + productionData.oreShipmentTarget ||
                  0 + productionData.obTarget ||
                  +productionData.quarryTarget ||
                  0,
                percent: tonnagePercentage,
              },
            },
            {
              title: 'Vessel',
              meta: {
                actual: productionData.totalVessel,
                target: productionData.oreTarget / 35,
                percent: vesselPercentage,
              },
            },
            {
              title: 'Ore',
              meta: {
                actual: productionData.totalOreTonnage,
                target: productionData.oreTarget,
                percent: orePercentage,
              },
            },
            {
              title: 'Quarry',
              meta: {
                actual: productionData.totalQuarryTonnage,
                target: productionData.quarryTarget,
                percent: quarryPercentage,
              },
            },
            {
              title: 'OB',
              meta: {
                actual: productionData.totalObTonnage,
                target: productionData.obTarget,
                percent: obPercentage,
              },
            },
          ],
          working_hour: [
            { title: 'EWH', value: productionData.ewh ?? 0 },
            {
              title: 'STB',
              value: productionData.bdDuration + productionData.idleDuration,
            },
          ],
        },
      };
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data`);
    }
  }

  async getMockFleetStatus(
    type?: string,
    selectedDate?: string,
  ): Promise<ApiResponse<FleetStatusResponseDto>> {
    try {
      const condition = type ?? 'hauling';

      const date = selectedDate ?? new Date().toISOString().split('T')[0];

      let result;
      const responseData = new FleetStatusResponseDto();
      const fleetStatusItem: FleetStatusItemDto[] = [];

      if (condition === 'hauling') {
        result = await this.haulingRepo
          .createQueryBuilder('rch')
          .leftJoin(Population, 'mpl', 'mpl.id = rch.unit_loading_id')
          .leftJoin(OperationPoints, 'mopl', 'mopl.id = rch.loading_point_id')
          .leftJoin(OperationPoints, 'mopd', 'mopd.id = rch.dumpingPointOp')
          .select('rch.unit_loading_id', 'unit_loading_id')
          .addSelect('MAX(rch.time)', 'end_time')
          .addSelect('MIN(rch.time)', 'start_time')
          .addSelect('mopl.name', 'loading_point')
          .addSelect('mopd.name', 'dumping_point')
          .addSelect('mpl.no_unit', 'no_unit')
          .addSelect(
            `COALESCE(SUM(CASE WHEN rch.material IN ('ore','ob','quarry') THEN rch.vessel ELSE 0 END),0)`,
            'total_vessel',
          )
          .addSelect(`COALESCE(SUM(rch.total_tonnage),0)`, 'total_tonnage')
          .addSelect(
            `COALESCE(SUM(CASE WHEN rch.material = 'ore' THEN rch.vessel * 35 ELSE 0 END),0)`,
            'ore',
          )
          .addSelect(
            `COALESCE(SUM(CASE WHEN rch.material = 'ob' THEN rch.vessel * 26 ELSE 0 END),0)`,
            'ob',
          )
          .addSelect(
            `COALESCE(SUM(CASE WHEN rch.material = 'quarry' THEN rch.vessel * 35 ELSE 0 END),0)`,
            'quarry',
          )
          .where('DATE(rch.activity_date) = :date', { date })
          .groupBy('rch.unit_loading_id')
          .addGroupBy('mopl.name')
          .addGroupBy('mopd.name')
          .addGroupBy('mpl.no_unit')
          .limit(3)
          .getRawMany();

        result.map((row) => {
          const fleetStatus = new FleetStatusItemDto();
          fleetStatus.fleet = row.no_unit;
          fleetStatus.start_loading = row.start_time; // bisa juga diubah ke tipe Date jika perlu
          fleetStatus.finish_loading = row.end_time;
          fleetStatus.loading_point = row.loading_point ?? null;
          fleetStatus.dumping_point = row.dumping_point ?? null;
          fleetStatus.total_vessel = Number(row.total_vessel ?? 0);
          fleetStatus.total_tonnage = Number(row.total_tonnage ?? 0);
          fleetStatus.ore = Number(row.ore ?? 0);
          fleetStatus.ob = Number(row.ob ?? 0);
          fleetStatus.quarry = Number(row.quarry ?? 0);

          fleetStatusItem.push(fleetStatus);
        });

        console.log('Hauling', fleetStatusItem);
      } else {
        result = await this.bargingRepo
          .createQueryBuilder('rcb')
          .leftJoin(Population, 'mpl', 'mpl.id = rcb.unit_hauler_id')
          .leftJoin(Barge, 'mb', 'mb.id = rcb.barge_id')
          .select('mpl.no_unit', 'no_unit')
          .addSelect('rcb.unit_hauler_id', 'unit_hauler_id')
          .addSelect('mb.name', 'barge_name')
          .addSelect('MAX(rcb.time)', 'end_time')
          .addSelect('MIN(rcb.time)', 'start_time')
          .addSelect('COALESCE(SUM(rcb.vessel), 0)', 'total_vessel')
          .addSelect('COALESCE(SUM(rcb.total_tonnage), 0)', 'total_tonnage')
          .where('DATE(rcb.activity_date) = :date', { date })
          .groupBy('rcb.unit_hauler_id, mpl.no_unit, mb.name')
          .limit(3)
          .getRawMany();

        result.map((row) => {
          const fleetStatus = new FleetStatusItemDto();
          fleetStatus.fleet = row.no_unit;
          fleetStatus.start_loading = row.start_time ?? ''; // bisa juga diubah ke tipe Date jika perlu
          fleetStatus.finish_loading = row.end_time ?? '';
          fleetStatus.barge_name = row.barge_name ?? '';
          fleetStatus.loading_point = row.loading_point ?? null;
          fleetStatus.dumping_point = row.dumping_point ?? null;
          fleetStatus.total_vessel = Number(row.total_vessel ?? 0);
          fleetStatus.total_tonnage = Number(row.total_tonnage ?? 0);

          fleetStatusItem.push(fleetStatus);
        });

        console.log('Barging', fleetStatusItem);
      }

      responseData.data = fleetStatusItem;

      return successResponse(responseData, 'success', 200);
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data`);
    }
  }

  private getUnitColumn(type: ActivityType, alias: string): string {
    return type === ActivityType.BARGING
      ? `${alias}.unit_hauler_id`
      : `${alias}.unit_loading_id`;
  }

  private getValueColumn(isTonnage: boolean, alias: string): string {
    return isTonnage ? `${alias}.total_tonnage` : `${alias}.vessel`;
  }

  private buildChart(
    allRawData: RawDataTonnageVesselRow[],
  ): ChartTonnageVesselResult {
    const chartMap: Record<string, ChartTonnageVesselRow> = {};
    const uniqueUnits: string[] = [];

    allRawData.forEach((item) => {
      const hourRange = calculateTimeRange(item.time);
      const unit = item.unit;
      const value = item.value ?? 0;

      if (!uniqueUnits.includes(unit)) {
        uniqueUnits.push(unit);
      }

      if (!chartMap[hourRange]) {
        chartMap[hourRange] = { hour: hourRange, total: 0 };
      }

      chartMap[hourRange][unit] =
        ((chartMap[hourRange][unit] as number) || 0) + value;
      chartMap[hourRange].total += value;
    });

    const chart = Object.values(chartMap).sort((a, b) =>
      a.hour.localeCompare(b.hour),
    );

    const colorPalette = ['#F6C89F', '#94D1B2', '#54AD9B'];
    const meta: Record<string, string> = {};
    uniqueUnits.forEach((unit, index) => {
      meta[unit] = colorPalette[index] || '#000000';
    });
    meta.total = '#D96C06';

    return { chart, meta };
  }

  async getCcrTonnageVessel(
    body: CcrTonnageDto,
    pathname: string,
  ): Promise<ApiResponse<ChartTonnageVesselResult | []>> {
    try {
      const { date: selectedDate, type, shift, unit_id } = body;
      const dateToFilter =
        selectedDate || new Date().toISOString().split('T')[0];
      const typeFilter: ActivityType =
        type || ('hauling' as ActivityType.HAULING);
      const shiftFilter = shift?.toLowerCase() || 'ns';
      const mainTable =
        typeFilter === ActivityType.BARGING ? 'r_ccr_barging' : 'r_ccr_hauling';
      const mainAlias = 'ccr';
      const isTonnage = pathname.includes('tonnage');

      if (!unit_id.length) return successResponse([], 'success', 200);

      // helper: tentukan unitColumn
      const unitColumn = this.getUnitColumn(typeFilter, mainAlias);

      // helper: tentukan valueColumn + alias selalu `value`
      const valueColumn = this.getValueColumn(isTonnage, mainAlias);

      const qb = this.dataSource
        .createQueryBuilder()
        .select([
          `${valueColumn} AS value`,
          `${mainAlias}.time AS time`,
          'mp.no_unit AS unit',
        ])
        .from(mainTable, mainAlias)
        .leftJoin('m_population', 'mp', `${unitColumn} = mp.id`)
        .where(`DATE(${mainAlias}.activity_date) = :date`, {
          date: dateToFilter,
        })
        .andWhere(`${mainAlias}.shift = :shift`, { shift: shiftFilter })
        .andWhere(`${unitColumn} IN (:...unitIds)`, { unitIds: unit_id });

      const allRawData = await qb.getRawMany();

      // helper: build chart & meta
      const result = this.buildChart(allRawData);
      return successResponse(result, 'success', 200);
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data`);
    }
  }

  async getMockBargingSummary(date?: string): Promise<any> {
    try {
      const dateParam = date || new Date().toISOString().split('T')[0];

      // Query untuk tonnage
      const qb = this.dataSource
        .createQueryBuilder()
        .select('t.actual', 'actual')
        .addSelect('t.target', 'target')
        .addSelect(
          'ROUND(CASE WHEN t.target > 0 THEN (t.actual::numeric / t.target::numeric) ELSE 0 END, 2)',
          'percent',
        )
        .from((subQb) => {
          return subQb
            .from('r_ccr_barging', 'dummy')
            .select(
              `(SELECT COALESCE(SUM(b.total_tonnage)::numeric, 0) 
              FROM r_ccr_barging b 
              WHERE b.activity_date = :dateParam)`,
              'actual',
            )
            .addSelect(
              `(SELECT COALESCE(ROUND(p.ore_shipment_target::numeric, 2), 0) 
              FROM r_plan_production p 
              WHERE p.plan_date = :dateParam)`,
              'target',
            );
        }, 't')
        .setParameter('dateParam', dateParam);

      // Query untuk vessel
      const qb2 = this.dataSource
        .createQueryBuilder()
        .select('t.actual', 'actual')
        .addSelect('t.target', 'target')
        .addSelect(
          'ROUND((t.actual / NULLIF(t.target, 0))::numeric, 2)',
          'percent',
        )
        .from((subQb) => {
          return subQb
            .from('r_ccr_barging', 'dummy')
            .select(
              `(SELECT COALESCE(SUM(b.vessel)::numeric, 0) 
              FROM r_ccr_barging b 
              WHERE b.activity_date = :dateParam)`,
              'actual',
            )
            .addSelect(
              `(SELECT COALESCE(ROUND(((p.ore_shipment_target / p.total_fleet) / 40 / 2)::numeric, 2), 0) 
              FROM r_plan_production p 
              WHERE p.plan_date = :dateParam)`,
              'target',
            );
        }, 't')
        .setParameter('dateParam', dateParam);

      const tonnageRaw = (await qb.getRawOne()) || {
        actual: 0,
        target: 0,
        percent: 0,
      };
      const vesselRaw = (await qb2.getRawOne()) || {
        actual: 0,
        target: 0,
        percent: 0,
      };

      const tonnage = {
        actual: Number(tonnageRaw.actual),
        target: Number(tonnageRaw.target),
        percent: Number(tonnageRaw.percent),
      };

      const vessel = {
        actual: Number(vesselRaw.actual),
        target: Number(vesselRaw.target),
        percent: Number(vesselRaw.percent),
      };
      const construct = [
        {
          title: 'Tonnage',
          meta: tonnage,
        },
        {
          title: 'Vessel',
          meta: vessel,
        },
      ];

      return successResponse(construct, 'success', 200);
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data: ${error.message}`);
    }
  }

  async getCcrActivities(
    query: CcrActivitiesDto,
  ): Promise<ApiResponse<CcrActivitiesItemDto[]>> {
    try {
      const { date: selectedDate, type, shift } = query;
      const dateToFilter = selectedDate
        ? moment(selectedDate).format('YYYY-MM-DD')
        : moment().format('YYYY-MM-DD');

      const typeFilter = type || 'hauling';
      const shiftFilter = shift.toLowerCase();

      const mainTable =
        typeFilter === ActivityType.BARGING
          ? 'r_ccr_barging_problem'
          : 'r_ccr_hauling_problem';
      const mainAlias = 'cp';

      const allProblems = await this.dataSource
        .createQueryBuilder()
        .select([
          `${mainAlias}.activities_id`,
          `${mainAlias}.duration`,
          'a.name',
          'pwd.activities_hour',
          'pwd.plant_working_hour_id',
          'pwh.id AS pwh_id',
        ])
        .from(mainTable, mainAlias)
        .leftJoin(
          'm_activities',
          'a',
          `${mainAlias}.activities_id = a.id AND a.status IN (:...statuses)`,
          { statuses: ['breakdown', 'idle', 'delay'] },
        )
        .leftJoin('r_plan_working_hour', 'pwh', 'DATE(pwh.plan_date) = :date', {
          date: dateToFilter,
        })
        .leftJoin(
          'r_plan_working_hour_detail',
          'pwd',
          `pwd.plant_working_hour_id = pwh.id AND pwd.activities_id = ${mainAlias}.activities_id`,
        )
        .where(
          `DATE(${mainAlias}.activity_date) = :date AND ${mainAlias}.shift = :shift`,
          {
            date: dateToFilter,
            shift: shiftFilter,
          },
        )
        .getRawMany();
      // Handle duplikasi: group berdasarkan activities_id
      const grouped = new Map<string, CcrActivitiesItemDto>();

      allProblems.forEach((item) => {
        // key unik per activity_id + date + shift
        const key = `${item.activities_id}_${dateToFilter}_${shiftFilter}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            label: item.a_name || '',
            target: item.pwd_activities_hour || 0,
            actual: item[`${mainAlias}_duration`] || 0,
          });
        } else {
          const existing = grouped.get(key)!;
          // jika target ingin ambil max, actual dijumlahkan
          existing.target = Math.max(
            existing.target,
            item.pwd_activities_hour || 0,
          );
          existing.actual += item[`${mainAlias}_duration`] || 0;
        }
      });
      grouped.forEach((value) => {
        value.actual = value.actual / 2;
      });

      const result: CcrActivitiesItemDto[] = Array.from(grouped.values());

      return successResponse<CcrActivitiesItemDto[]>(result, 'success', 200);
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data`);
    }
  }

  async getLostTimeSummary(
    startDate?: string,
    endDate?: string,
  ): Promise<LostTimeSummaryResponseDto> {
    try {
      // Set default date range jika tidak ada parameter
      const defaultStartDate =
        startDate ||
        new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split('T')[0];
      const defaultEndDate = endDate || new Date().toISOString().split('T')[0];

      // 1. Hitung MOHH data (STB, BD, EWH)
      const mohhData = await this.calculateMohhData(
        defaultStartDate,
        defaultEndDate,
      );

      // 2. Hitung Lost Time data berdasarkan activities dengan status idle dan delay
      const lostTimeData = await this.calculateLostTimeData(
        defaultStartDate,
        defaultEndDate,
      );

      // 3. Hitung Tables data (PA, MA, UA, EU)
      const tablesData = await this.calculateTablesData(
        defaultStartDate,
        defaultEndDate,
      );

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
      const mohhQuery = await this.dataSource.query(
        `
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
      `,
        [startDate, endDate],
      );

      // Hitung EWH = SUM(r_base_data_pro.totalHM) all unit
      const ewhQuery = await this.dataSource.query(
        `
        SELECT COALESCE(SUM(rbdp.total_hm), 0) as total_ewh
        FROM r_parent_base_data_pro rpbdp
        LEFT JOIN r_base_data_pro rbdp ON rbdp.parent_base_data_pro_id = rpbdp.id
        WHERE rpbdp.activity_date BETWEEN $1 AND $2
      `,
        [startDate, endDate],
      );

      // Hitung BD = SUM(r_loss_time.duration) WHERE loss_type = 'BD'
      const breakdownQuery = await this.dataSource.query(
        `
        SELECT COALESCE(SUM(duration), 0) as total_breakdown
        FROM r_loss_time 
        WHERE loss_type = 'BD' 
          AND date_activity BETWEEN $1 AND $2
      `,
        [startDate, endDate],
      );

      const totalMohh = parseFloat(mohhQuery[0]?.total_mohh || '0');
      const totalEwh = parseFloat(ewhQuery[0]?.total_ewh || '0');
      const totalBreakdown = parseFloat(
        breakdownQuery[0]?.total_breakdown || '0',
      );

      // Hitung STB = MOHH - EWH - Breakdown Time
      const standbyTime = Math.max(0, totalMohh - totalEwh - totalBreakdown);

      return [
        {
          name: 'STB',
          value: Math.round(standbyTime * 10) / 10,
          color: '#34d399',
        },
        {
          name: 'BD',
          value: Math.round(totalBreakdown * 10) / 10,
          color: '#d1d5db',
        },
        {
          name: 'EWH',
          value: Math.round(totalEwh * 10) / 10,
          color: '#10b981',
        },
      ];
    } catch (error) {
      console.error('Error calculating MOHH data:', error);
      return [
        { name: 'STB', value: 0, color: '#34d399' },
        { name: 'BD', value: 0, color: '#d1d5db' },
        { name: 'EWH', value: 0, color: '#10b981' },
      ];
    }
  }

  private async calculateLostTimeData(startDate: string, endDate: string) {
    try {
      // Ambil data berdasarkan activities dengan status 'idle' dan 'delay'
      // dan r_loss_time dengan loss_type = 'STB'
      const lostTimeQuery = await this.dataSource.query(
        `
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
      `,
        [startDate, endDate],
      );

      // Mapping nama aktivitas ke warna yang sesuai
      const activityColors: { [key: string]: string } = {
        Rain: '#1e3a8a',
        Slippery: '#d1d5db',
        MHR: '#34d399',
        Internal: '#fbbf24',
        External: '#60a5fa',
      };

      const result = lostTimeQuery.map((item: any) => ({
        name: item.activity_name,
        value: Math.round(parseFloat(item.total_duration) * 10) / 10,
        color: activityColors[item.activity_name] || '#6b7280',
      }));

      // Pastikan semua aktivitas yang diharapkan ada dalam response
      const expectedActivities = [
        'Rain',
        'Slippery',
        'MHR',
        'Internal',
        'External',
      ];
      const existingNames = result.map((item) => item.name);

      expectedActivities.forEach((activityName) => {
        if (!existingNames.includes(activityName)) {
          result.push({
            name: activityName,
            value: 0,
            color: activityColors[activityName] || '#6b7280',
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
        { name: 'External', value: 0, color: '#60a5fa' },
      ];
    }
  }

  private async calculateTablesData(startDate: string, endDate: string) {
    try {
      // Hitung target dari r_parent_plan_working_hour berdasarkan formula yang sama dengan actual
      // Target dihitung dari data plan working hour yang sudah ada

      const targetDataQuery = await this.dataSource.query(
        `
        SELECT 
          (SELECT COALESCE(SUM(mohh_per_month), 0)
          FROM r_plan_working_hour
          WHERE plan_date BETWEEN $1 AND $2
          ) as target_mohh,
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
        WHERE pwh.plan_date BETWEEN $1 AND $2
      `,
        [startDate, endDate],
      );

      // Hitung actual data sesuai spesifikasi:
      // PA actual = (SUM(all Unit control_mtd_production.ewh) + SUM(all unit control_mtd_production.standby_time)) / SUM(control_mtd_production.MOHH)
      // MA actual = (SUM(all Unit control_mtd_production.ewh) / (SUM(all unit control_mtd_production.ewh) + SUM(control_mtd_production.breakdown_time))
      // UA actual = (SUM(all Unit control_mtd_production.ewh) / (SUM(all unit control_mtd_production.ewh) + SUM(control_mtd_production.standby_time))
      // EU actual = SUM(all Unit control_mtd_production.ewh) / SUM(all unit control_mtd_production.mohh)

      const actualDataQuery = await this.dataSource.query(
        `
        SELECT 
          COALESCE(SUM(rbdp.total_hm), 0) as total_ewh,
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
      `,
        [startDate, endDate],
      );

      const targetData = targetDataQuery[0] || {
        target_mohh: 0,
        target_delay: 0,
        target_idle: 0,
        target_breakdown: 0,
      };
      const actualData = actualDataQuery[0] || {
        total_ewh: 0,
        total_breakdown: 0,
        total_mohh: 0,
      };

      // Hitung target values menggunakan formula yang sama
      const targetMohh = parseFloat(targetData.target_mohh);
      const targetDelay = parseFloat(targetData.target_delay);
      const targetIdle = parseFloat(targetData.target_idle);
      const targetBreakdown = parseFloat(targetData.target_breakdown);

      // Hitung target EWH = MOHH - Delay - Idle - Breakdown
      const targetEwh = Math.max(
        0,
        targetMohh - targetDelay - targetIdle - targetBreakdown,
      );

      // Hitung target standby time = MOHH - EWH - Breakdown Time
      const targetStandby = Math.max(
        0,
        targetMohh - targetEwh - targetBreakdown,
      );

      // Hitung actual values
      const actualEwh = parseFloat(actualData.total_ewh);
      const actualBreakdown = parseFloat(actualData.total_breakdown);
      const actualMohh = parseFloat(actualData.total_mohh);

      // Hitung actual standby time = MOHH - EWH - Breakdown Time
      const actualStandby = Math.max(
        0,
        actualMohh - actualEwh - actualBreakdown,
      );

      // Hitung PA: (EWH + Standby Time) / MOHH
      const paActual =
        actualMohh > 0 ? (actualEwh + actualStandby) / actualMohh : 0;
      const paTarget =
        targetMohh > 0 ? (targetEwh + targetStandby) / targetMohh : 0;
      const paPercent = paTarget > 0 ? (paActual / paTarget) * 100 : 0;

      // Hitung MA: EWH / (EWH + Breakdown Time)
      const maActual =
        actualEwh + actualBreakdown > 0
          ? actualEwh / (actualEwh + actualBreakdown)
          : 0;
      const maTarget =
        targetEwh + targetBreakdown > 0
          ? targetEwh / (targetEwh + targetBreakdown)
          : 0;
      const maPercent = maTarget > 0 ? (maActual / maTarget) * 100 : 0;

      // Hitung UA: EWH / (EWH + Standby Time)
      const uaActual =
        actualEwh + actualStandby > 0
          ? actualEwh / (actualEwh + actualStandby)
          : 0;
      const uaTarget =
        targetEwh + targetStandby > 0
          ? targetEwh / (targetEwh + targetStandby)
          : 0;
      const uaPercent = uaTarget > 0 ? (uaActual / uaTarget) * 100 : 0;

      // Hitung EU: EWH / MOHH
      const euActual = actualMohh > 0 ? actualEwh / actualMohh : 0;
      const euTarget = targetMohh > 0 ? targetEwh / targetMohh : 0;
      const euPercent = euTarget > 0 ? (euActual / euTarget) * 100 : 0;

      return [
        {
          title: 'PA',
          data: [
            {
              target: Math.round(paTarget * 100) / 100,
              actual: Math.round(paActual * 100) / 100,
              percent: Math.round(paPercent * 100) / 100,
            },
          ],
        },
        {
          title: 'MA',
          data: [
            {
              target: Math.round(maTarget * 100) / 100,
              actual: Math.round(maActual * 100) / 100,
              percent: Math.round(maPercent * 100) / 100,
            },
          ],
        },
        {
          title: 'UA',
          data: [
            {
              target: Math.round(uaTarget * 100) / 100,
              actual: Math.round(uaActual * 100) / 100,
              percent: Math.round(uaPercent * 100) / 100,
            },
          ],
        },
        {
          title: 'EU',
          data: [
            {
              target: Math.round(euTarget * 100) / 100,
              actual: Math.round(euActual * 100) / 100,
              percent: Math.round(euPercent * 100) / 100,
            },
          ],
        },
      ];
    } catch (error) {
      console.error('Error calculating tables data:', error);
      return [
        { title: 'PA', data: [{ target: 0, actual: 0, percent: 0 }] },
        { title: 'MA', data: [{ target: 0, actual: 0, percent: 0 }] },
        { title: 'UA', data: [{ target: 0, actual: 0, percent: 0 }] },
        { title: 'EU', data: [{ target: 0, actual: 0, percent: 0 }] },
      ];
    }
  }

  /**
   * Get barge data from analysis-hauling-barging service
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

      // Get data from analysis-hauling-barging service
      const analysisData =
        await this.analysisHaulingBargingService.getAnalysisData({
          startDate,
          endDate,
          page: 1,
          limit: 1000, // Get all data for the date range
        });

      // Process data to match the required format
      const processedData = analysisData.data.map((item: any) => ({
        date: this.formatDateToDDMM(item.date),
        barge: Math.round(item.bargeTonnage || 0),
        hauling: Math.round(item.oreHaulingTonnage || 0),
      }));

      return processedData;
    } catch (error) {
      console.error('Error getting barge data:', error);
      return [];
    }
  }

  /**
   * Format date from YYYY-MM-DD to DD/MM
   */
  private formatDateToDDMM(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }

  /**
   * Get tonnage data from r_input_barge and m_barge tables
   */
  private async getTonnageData(startDate: string, endDate: string) {
    try {
      // Get target tonnage (sum of capacity from m_barge joined with r_input_barge)
      const targetTonnageQuery = await this.dataSource.query(
        `
        SELECT COALESCE(SUM(mb.capacity), 0) as target_tonnage
        FROM r_input_barge rib
        JOIN m_barge mb ON rib.barge_id = mb.id
        WHERE rib.start_loading BETWEEN $1 AND $2
          AND rib."deletedAt" IS NULL
          AND mb."deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

      // Get actual tonnage (sum of vol_by_survey from r_input_barge)
      const actualTonnageQuery = await this.dataSource.query(
        `
        SELECT COALESCE(SUM(rib.vol_by_survey), 0) as actual_tonnage
        FROM r_input_barge rib
        WHERE rib.start_loading BETWEEN $1 AND $2
          AND rib."deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

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
      const targetQuery = await this.dataSource.query(
        `
        SELECT COALESCE(SUM(pp.ore_target), 0) as target_value
        FROM r_plan_production pp
        WHERE pp.plan_date BETWEEN $1 AND $2
          AND pp."deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

      const target = parseFloat(targetQuery[0]?.target_value || '0');

      // Get Actual from Summary Production (ore hauling tonnage)
      const actualQuery = await this.dataSource.query(
        `
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
      `,
        [startDate, endDate],
      );

      const actual = parseFloat(actualQuery[0]?.actual_value || '0');

      // Calculate PDTY
      const pdtyData = await this.calculatePDTY(
        startDate,
        endDate,
        target,
        actual,
      );

      // Calculate PA
      const paData = await this.calculatePA(startDate, endDate);

      // Calculate UA
      const uaValue = -Math.abs(
        target + paData.value + pdtyData.value - actual,
      );

      return [
        {
          name: 'Target',
          value: Math.round(target),
          type: 'increase',
          base: 0,
          height: Math.round(target),
        },
        {
          name: 'PDTY',
          value: Math.round(pdtyData.value),
          type: 'increase',
          base: Math.round(target),
          height: Math.round(pdtyData.value),
        },
        {
          name: 'PA',
          value: Math.round(paData.value),
          type: 'increase',
          base: Math.round(target + pdtyData.value),
          height: Math.round(paData.value),
        },
        {
          name: 'UA',
          value: Math.round(uaValue),
          type: 'decrease',
          base: Math.round(target + pdtyData.value + paData.value),
          height: Math.abs(Math.round(uaValue)),
        },
        {
          name: 'Actual',
          value: Math.round(actual),
          type: 'total',
          base: 0,
          height: Math.round(actual),
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
  private async calculatePDTY(
    startDate: string,
    endDate: string,
    planPlan: number,
    planActual: number,
  ) {
    try {
      // Get EWHplan from r_plan_working_hours
      const ewhPlanQuery = await this.dataSource.query(
        `
        SELECT COALESCE(SUM(pwh.mohh_per_month - sub.total_hour), 0) AS ewh_plan
        FROM r_parent_plan_working_hour ppwh
        LEFT JOIN r_plan_working_hour pwh 
            ON pwh.parent_plan_working_hour_id = ppwh.id
        LEFT JOIN (
            SELECT pwhd.plant_working_hour_id,
                  SUM(
                    CASE 
                      WHEN a.status IN ('delay','idle','breakdown') THEN pwhd.activities_hour
                      ELSE 0
                    END
                  ) AS total_hour
            FROM r_plan_working_hour_detail pwhd
            LEFT JOIN m_activities a ON a.id = pwhd.activities_id
            GROUP BY pwhd.plant_working_hour_id
        ) sub ON sub.plant_working_hour_id = pwh.id
        WHERE ppwh.plan_date BETWEEN $1 AND $2;
      `,
        [startDate, endDate],
      );

      const ewhPlan = parseFloat(ewhPlanQuery[0]?.ewh_plan || '0');

      // Get EWHactual from Control Day Production
      const ewhActualQuery = await this.dataSource.query(
        `
        SELECT COALESCE(AVG(rbdp.total_hm), 0) as ewh_actual
        FROM r_parent_base_data_pro rpbdp
        JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
        WHERE rpbdp.activity_date BETWEEN $1 AND $2
          AND rbdp.total_hm > 0
          AND rbdp."deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

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
      const paPlanQuery = await this.dataSource.query(
        `
        SELECT COALESCE(SUM(pwhd.activities_hour), 0) as pa_plan
        FROM r_parent_plan_working_hour ppwh
        LEFT JOIN r_plan_working_hour pwh ON pwh.parent_plan_working_hour_id = ppwh.id
        LEFT JOIN r_plan_working_hour_detail pwhd ON pwhd.plant_working_hour_id = pwh.id
        LEFT JOIN m_activities a ON a.id = pwhd.activities_id
        WHERE ppwh.plan_date BETWEEN $1 AND $2
          AND a.status = 'breakdown'
      `,
        [startDate, endDate],
      );

      const paPlan = parseFloat(paPlanQuery[0]?.pa_plan || '0');

      // Get PAactual (Average EWH duration by unit)
      const paActualQuery = await this.dataSource.query(
        `
        SELECT COALESCE(AVG(unit_ewh.total_ewh), 0) as pa_actual
        FROM (
          SELECT SUM(rbdp.total_hm) as total_ewh
          FROM r_parent_base_data_pro rpbdp
          JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
          WHERE rpbdp.activity_date BETWEEN $1 AND $2
            AND rbdp.total_hm > 0
            AND rbdp."deletedAt" IS NULL
          GROUP BY rpbdp.population_id
        ) as unit_ewh
      `,
        [startDate, endDate],
      );

      const paActual = parseFloat(paActualQuery[0]?.pa_actual || '0');

      // Calculate PA values
      const paGainLoss = Math.abs(paPlan - paActual);

      // Get PDTYplan for calculation
      const pdtyPlanQuery = await this.dataSource.query(
        `
        SELECT COALESCE(SUM(pp.ore_target), 0) as plan_plan
        FROM r_plan_production pp
        WHERE pp.plan_date BETWEEN $1 AND $2
          AND pp."deletedAt" IS NULL
      `,
        [startDate, endDate],
      );

      const planPlan = parseFloat(pdtyPlanQuery[0]?.plan_plan || '0');

      const ewhPlanQuery = await this.dataSource.query(
        `
        SELECT COALESCE(SUM(pwh.mohh_per_month), 0) as ewh_plan
        FROM r_parent_plan_working_hour ppwh
        LEFT JOIN r_plan_working_hour pwh ON pwh.parent_plan_working_hour_id = ppwh.id
        WHERE ppwh.plan_date BETWEEN $1 AND $2
      `,
        [startDate, endDate],
      );

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
