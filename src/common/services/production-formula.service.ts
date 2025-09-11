import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanProduction } from '../../modules/plan-production/entities/plan-production.entity';
import { ParentPlanProduction } from '../../modules/parent-plan-production/entities/parent-plan-production.entity';
import { BaseDataPro, MaterialType, ActivityType } from '../../modules/base-data-production/entities/base-data-pro.entity';

export interface ProductionTargets {
  oreTarget: number;
  obTarget: number;
  oreShipmentTarget: number;
  quarryTarget: number;
}

export interface ProductionActuals {
  oreHaulingTonnage: number;
  obBCM: number;
  bargeTonnage: number;
  quarryTonnage: number;
}

export interface DailyAchievementData {
  oreHauling: { target: number; actual: number };
  ob: { target: number; actual: number };
  oreBarging: { target: number; actual: number };
  quarry: { target: number; actual: number };
}

@Injectable()
export class ProductionFormulaService {
  constructor(
    @InjectRepository(PlanProduction)
    private readonly planProductionRepository: Repository<PlanProduction>,
    @InjectRepository(ParentPlanProduction)
    private readonly parentPlanProductionRepository: Repository<ParentPlanProduction>,
    @InjectRepository(BaseDataPro)
    private readonly baseDataProRepository: Repository<BaseDataPro>,
  ) {}

  /**
   * Mendapatkan target produksi dari TB_R_Plan_Production berdasarkan rentang tanggal
   */
  async getProductionTargets(startDate?: string, endDate?: string): Promise<ProductionTargets> {
    let query = this.planProductionRepository
      .createQueryBuilder('pp')
      .select([
        'SUM(pp.ore_target) as oreTarget',
        'SUM(pp.ob_target) as obTarget', 
        'SUM(pp.ore_shipment_target) as oreShipmentTarget',
        'SUM(pp.quarry) as quarryTarget'
      ]);

    if (startDate && endDate) {
      query = query.where('pp.plan_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    const result = await query.getRawOne();

    return {
      oreTarget: parseFloat(result.oreTarget) || 0,
      obTarget: parseFloat(result.obTarget) || 0,
      oreShipmentTarget: parseFloat(result.oreShipmentTarget) || 0,
      quarryTarget: parseFloat(result.quarryTarget) || 0,
    };
  }

  /**
   * Mendapatkan actual produksi dari Analysis Hauling and Barging
   * Formula: SUM [Ore Hauling Tonnage] sesuai rentang tanggal
   */
  async getOreHaulingTonnage(startDate?: string, endDate?: string): Promise<number> {
    let query = `
      SELECT 
        CASE 
          WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
          WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
          ELSE 0
        END as tonnage
      FROM r_parent_base_data_pro rpbdp
      JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      JOIN m_population mp ON rpbdp.population_id = mp.id
      WHERE rbdp.material = $1 AND rbdp.activity = $2
    `;

    const queryParams: any[] = [MaterialType.ORE, ActivityType.HAULING];
    let paramIndex = 3;

    if (startDate) {
      query += ` AND DATE(rpbdp.activity_date) >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND DATE(rpbdp.activity_date) <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` GROUP BY mp.tyre_type`;

    const result = await this.baseDataProRepository.query(query, queryParams);
    
    return result.reduce((total: number, row: any) => total + parseFloat(row.tonnage), 0);
  }

  /**
   * Mendapatkan actual OB BCM dari Analysis Hauling and Barging
   * Formula: SUM [OB BCM] sesuai rentang tanggal
   */
  async getObBCM(startDate?: string, endDate?: string): Promise<number> {
    let query = `
      SELECT 
        CASE 
          WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
          WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
          ELSE 0
        END as tonnage
      FROM r_parent_base_data_pro rpbdp
      JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      JOIN m_population mp ON rpbdp.population_id = mp.id
      WHERE rbdp.material = $1
    `;

    const queryParams: any[] = [MaterialType.OB];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND DATE(rpbdp.activity_date) >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND DATE(rpbdp.activity_date) <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` GROUP BY mp.tyre_type`;

    const result = await this.baseDataProRepository.query(query, queryParams);
    
    // Convert tonnage to BCM (divide by 1.6)
    const totalTonnage = result.reduce((total: number, row: any) => total + parseFloat(row.tonnage), 0);
    return totalTonnage / 1.6;
  }

  /**
   * Mendapatkan actual Barge Tonnage dari Analysis Hauling and Barging
   * Formula: SUM [Barge Tonnage] sesuai rentang tanggal
   */
  async getBargeTonnage(startDate?: string, endDate?: string): Promise<number> {
    let query = `
      SELECT 
        CASE 
          WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
          WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
          ELSE 0
        END as tonnage
      FROM r_parent_base_data_pro rpbdp
      JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      JOIN m_population mp ON rpbdp.population_id = mp.id
      WHERE rbdp.material = $1 AND rbdp.activity = $2
    `;

    const queryParams: any[] = [MaterialType.ORE_BARGE, ActivityType.BARGING];
    let paramIndex = 3;

    if (startDate) {
      query += ` AND DATE(rpbdp.activity_date) >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND DATE(rpbdp.activity_date) <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` GROUP BY mp.tyre_type`;

    const result = await this.baseDataProRepository.query(query, queryParams);
    
    return result.reduce((total: number, row: any) => total + parseFloat(row.tonnage), 0);
  }

  /**
   * Mendapatkan data barge dan hauling harian untuk dashboard
   * Formula terpusat yang sama dengan analysis-hauling-barging
   */
  async getDailyBargeHaulingData(startDate?: string, endDate?: string): Promise<any[]> {
    let query = `
      SELECT 
        rpbdp.activity_date as date,
        rbdp.material,
        rbdp.activity,
        mp.no_unit,
        SUM(rbdp.total_vessel) as total_vessel,
        CASE 
          WHEN rbdp.material = 'ore-barge' AND rbdp.activity = 'barging' THEN 'ore-barge'
          WHEN rbdp.material = 'ore' AND rbdp.activity = 'hauling' THEN 'ore'
          WHEN rbdp.material = 'ob' THEN 'ob'
          ELSE rbdp.material
        END as material_type,
        CASE 
          WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
          WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
          ELSE 0
        END as tonnage
      FROM r_parent_base_data_pro rpbdp
      JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      JOIN m_population mp ON rpbdp.population_id = mp.id
      WHERE (
        (rbdp.material = 'ore-barge' AND rbdp.activity = 'barging') OR
        (rbdp.material = 'ore' AND rbdp.activity = 'hauling')
      )
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      query += ` AND rpbdp.activity_date >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND rpbdp.activity_date <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += `
      GROUP BY rpbdp.activity_date, rbdp.material, rbdp.activity, mp.no_unit, mp.tyre_type
      ORDER BY rpbdp.activity_date ASC
    `;

    // Execute query
    const rawData = await this.baseDataProRepository.query(query, queryParams);

    // Process data sesuai spesifikasi dashboard
    const processedData = this.processDashboardBargeData(rawData);

    return processedData;
  }

  /**
   * Memproses data barge dan hauling untuk dashboard
   */
  private processDashboardBargeData(rawData: any[]): any[] {
    // Group data by date
    const groupedByDate = rawData.reduce((acc, row) => {
      const date = row.date;
      if (!acc[date]) {
        acc[date] = {
          date: this.formatDateForDashboard(date),
          barge: 0,
          hauling: 0,
        };
      }

      const materialType = row.material_type;
      const tonnage = parseFloat(row.tonnage) || 0;

      switch (materialType) {
        case 'ore-barge':
          acc[date].barge += tonnage;
          break;
        case 'ore':
          acc[date].hauling += tonnage;
          break;
      }

      return acc;
    }, {});

    // Convert to array and round values
    return Object.values(groupedByDate).map((data: any) => ({
      date: data.date,
      barge: Math.round(data.barge),
      hauling: Math.round(data.hauling),
    }));
  }

  /**
   * Format tanggal untuk dashboard (DD/MM)
   */
  private formatDateForDashboard(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }

  /**
   * Mendapatkan actual Quarry Tonnage dari Control MTD Production
   * Formula: SUM[QUARRY Tonnage] sesuai rentang tanggal
   * Menggunakan faktor yang sama dengan Control MTD Production: 6x4=16.6, 8x4=18.26
   */
  async getQuarryTonnage(startDate?: string, endDate?: string): Promise<number> {
    let query = `
      SELECT 
        CASE 
          WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 16.6)
          WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 18.26)
          ELSE 0
        END as tonnage
      FROM r_parent_base_data_pro rpbdp
      JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      JOIN m_population mp ON rpbdp.population_id = mp.id
      WHERE rbdp.material = $1
    `;

    const queryParams: any[] = [MaterialType.QUARRY];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND DATE(rpbdp.activity_date) >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND DATE(rpbdp.activity_date) <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` GROUP BY mp.tyre_type`;

    const result = await this.baseDataProRepository.query(query, queryParams);
    
    return result.reduce((total: number, row: any) => total + parseFloat(row.tonnage), 0);
  }

  /**
   * Mendapatkan semua data actual produksi sekaligus
   */
  async getProductionActuals(startDate?: string, endDate?: string): Promise<ProductionActuals> {
    const [oreHaulingTonnage, obBCM, bargeTonnage, quarryTonnage] = await Promise.all([
      this.getOreHaulingTonnage(startDate, endDate),
      this.getObBCM(startDate, endDate),
      this.getBargeTonnage(startDate, endDate),
      this.getQuarryTonnage(startDate, endDate),
    ]);

    return {
      oreHaulingTonnage,
      obBCM,
      bargeTonnage,
      quarryTonnage,
    };
  }

  /**
   * Mendapatkan actual produksi berdasarkan shift (DS/NS)
   */
  async getActualByShift(startDate?: string, endDate?: string, shift?: string): Promise<ProductionActuals> {
    const oreHaulingTonnage = await this.getOreHaulingTonnageByShift(startDate, endDate, shift);
    const obBCM = await this.getObBCMByShift(startDate, endDate, shift);
    const bargeTonnage = await this.getBargeTonnageByShift(startDate, endDate, shift);
    const quarryTonnage = await this.getQuarryTonnageByShift(startDate, endDate, shift);

    return {
      oreHaulingTonnage,
      obBCM,
      bargeTonnage,
      quarryTonnage,
    };
  }

  /**
   * Mendapatkan actual Ore Hauling berdasarkan shift
   */
  async getOreHaulingTonnageByShift(startDate?: string, endDate?: string, shift?: string): Promise<number> {
    let query = `
      SELECT 
        CASE 
          WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
          WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
          ELSE 0
        END as tonnage
      FROM r_parent_base_data_pro rpbdp
      JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      JOIN m_population mp ON rpbdp.population_id = mp.id
      WHERE rbdp.material = $1 AND rbdp.activity = $2
    `;

    const queryParams: any[] = [MaterialType.ORE, ActivityType.HAULING];
    let paramIndex = 3;

    if (startDate) {
      query += ` AND DATE(rpbdp.activity_date) >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND DATE(rpbdp.activity_date) <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    if (shift) {
      query += ` AND LOWER(rpbdp.shift) = $${paramIndex}`;
      queryParams.push(shift.toLowerCase());
      paramIndex++;
    }

    query += ` GROUP BY mp.tyre_type`;

    const result = await this.baseDataProRepository.query(query, queryParams);
    
    return result.reduce((total: number, row: any) => total + parseFloat(row.tonnage), 0);
  }

  /**
   * Mendapatkan actual OB berdasarkan shift
   */
  async getObBCMByShift(startDate?: string, endDate?: string, shift?: string): Promise<number> {
    let query = `
      SELECT 
        CASE 
          WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
          WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
          ELSE 0
        END as tonnage
      FROM r_parent_base_data_pro rpbdp
      JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      JOIN m_population mp ON rpbdp.population_id = mp.id
      WHERE rbdp.material = $1
    `;

    const queryParams: any[] = [MaterialType.OB];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND DATE(rpbdp.activity_date) >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND DATE(rpbdp.activity_date) <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    if (shift) {
      query += ` AND LOWER(rpbdp.shift) = $${paramIndex}`;
      queryParams.push(shift.toLowerCase());
      paramIndex++;
    }

    query += ` GROUP BY mp.tyre_type`;

    const result = await this.baseDataProRepository.query(query, queryParams);
    
    // Convert tonnage to BCM (divide by 1.6)
    const totalTonnage = result.reduce((total: number, row: any) => total + parseFloat(row.tonnage), 0);
    return totalTonnage / 1.6;
  }

  /**
   * Mendapatkan actual Barge berdasarkan shift
   */
  async getBargeTonnageByShift(startDate?: string, endDate?: string, shift?: string): Promise<number> {
    let query = `
      SELECT 
        CASE 
          WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
          WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
          ELSE 0
        END as tonnage
      FROM r_parent_base_data_pro rpbdp
      JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      JOIN m_population mp ON rpbdp.population_id = mp.id
      WHERE rbdp.material = $1 AND rbdp.activity = $2
    `;

    const queryParams: any[] = [MaterialType.ORE_BARGE, ActivityType.BARGING];
    let paramIndex = 3;

    if (startDate) {
      query += ` AND DATE(rpbdp.activity_date) >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND DATE(rpbdp.activity_date) <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    if (shift) {
      query += ` AND LOWER(rpbdp.shift) = $${paramIndex}`;
      queryParams.push(shift.toLowerCase());
      paramIndex++;
    }

    query += ` GROUP BY mp.tyre_type`;

    const result = await this.baseDataProRepository.query(query, queryParams);
    
    return result.reduce((total: number, row: any) => total + parseFloat(row.tonnage), 0);
  }

  /**
   * Mendapatkan actual Quarry berdasarkan shift
   * Menggunakan faktor yang sama dengan Control MTD Production: 6x4=16.6, 8x4=18.26
   */
  async getQuarryTonnageByShift(startDate?: string, endDate?: string, shift?: string): Promise<number> {
    let query = `
      SELECT 
        CASE 
          WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 16.6)
          WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 18.26)
          ELSE 0
        END as tonnage
      FROM r_parent_base_data_pro rpbdp
      JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
      JOIN m_population mp ON rpbdp.population_id = mp.id
      WHERE rbdp.material = $1
    `;

    const queryParams: any[] = [MaterialType.QUARRY];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND DATE(rpbdp.activity_date) >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND DATE(rpbdp.activity_date) <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    if (shift) {
      query += ` AND LOWER(rpbdp.shift) = $${paramIndex}`;
      queryParams.push(shift.toLowerCase());
      paramIndex++;
    }

    query += ` GROUP BY mp.tyre_type`;

    const result = await this.baseDataProRepository.query(query, queryParams);
    
    return result.reduce((total: number, row: any) => total + parseFloat(row.tonnage), 0);
  }

  /**
   * Mendapatkan actual produksi dari Control Day Production API
   * Berdasarkan formula yang diminta: menggunakan data dari /api/control/day-production
   */
  async getActualFromControlDayProduction(selectedDate?: string, shift?: string): Promise<ProductionActuals> {
    // Query untuk mendapatkan data actual dari control day production
    let query = `
      SELECT 
        SUM(ore_hauling_tonnage) as ore_hauling_tonnage,
        SUM(ob_tonnage) as ob_tonnage,
        SUM(ore_barge_tonnage) as ore_barge_tonnage,
        SUM(quarry_tonnage) as quarry_tonnage
      FROM (
        SELECT DISTINCT
          activity_date,
          tyre_type,
          no_unit,
          shift,
          ore_hauling_tonnage,
          ob_tonnage,
          ore_barge_tonnage,
          quarry_tonnage
        FROM (
          SELECT 
            DATE(pbdp.activity_date) as activity_date,
            mp.tyre_type,
            mp.no_unit,
            pbdp.shift,
            CASE 
              WHEN rbdp.material = 'ore' AND rbdp.activity = 'hauling' THEN
                CASE 
                  WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
                  WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
                  ELSE 0
                END
              ELSE 0
            END as ore_hauling_tonnage,
            CASE 
              WHEN rbdp.material = 'ob' THEN
                CASE 
                  WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56) / 1.6
                  WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56) / 1.6
                  ELSE 0
                END
              ELSE 0
            END as ob_tonnage,
            CASE 
              WHEN rbdp.material = 'ore-barge' AND rbdp.activity = 'barging' THEN
                CASE 
                  WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
                  WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
                  ELSE 0
                END
              ELSE 0
            END as ore_barge_tonnage,
            CASE 
              WHEN rbdp.material = 'quarry' THEN
                CASE 
                  WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 16.6)
                  WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 18.26)
                  ELSE 0
                END
              ELSE 0
            END as quarry_tonnage
          FROM r_parent_base_data_pro pbdp
          JOIN r_base_data_pro rbdp ON pbdp.id = rbdp.parent_base_data_pro_id
          JOIN m_population mp ON pbdp.population_id = mp.id
          WHERE mp.site_id = 1
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    if (selectedDate) {
      query += ` AND DATE(pbdp.activity_date) = $${paramIndex}`;
      queryParams.push(selectedDate);
      paramIndex++;
    }

    if (shift) {
      query += ` AND LOWER(pbdp.shift) = $${paramIndex}`;
      queryParams.push(shift.toLowerCase());
      paramIndex++;
    }

    query += `
          GROUP BY DATE(pbdp.activity_date), mp.tyre_type, mp.no_unit, pbdp.shift, rbdp.material, rbdp.activity
        ) grouped_data
      ) final_data
    `;

    const result = await this.baseDataProRepository.query(query, queryParams);
    const data = result[0] || {};

    return {
      oreHaulingTonnage: parseFloat(data.ore_hauling_tonnage) || 0,
      obBCM: parseFloat(data.ob_tonnage) || 0,
      bargeTonnage: parseFloat(data.ore_barge_tonnage) || 0,
      quarryTonnage: parseFloat(data.quarry_tonnage) || 0,
    };
  }

  /**
   * Mendapatkan data Daily Achievement lengkap sesuai formula yang diminta
   */
  async getDailyAchievementData(selectedDate?: string): Promise<{
    dailyACV: DailyAchievementData;
    dayShiftACV: DailyAchievementData;
    nightShiftACV: DailyAchievementData;
  }> {
    // Gunakan tanggal yang dipilih atau hari ini sebagai default
    const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
    
    // Ambil target dari r_plan_production berdasarkan tanggal yang dipilih
    const targets = await this.getProductionTargets(dateToUse, dateToUse);
    
    // Ambil actual dari control day production untuk semua shift (daily)
    const dailyActuals = await this.getActualFromControlDayProduction(dateToUse);
    
    // Ambil actual untuk Day Shift (DS)
    const dayShiftActuals = await this.getActualFromControlDayProduction(dateToUse, 'DS');
    
    // Ambil actual untuk Night Shift (NS)
    const nightShiftActuals = await this.getActualFromControlDayProduction(dateToUse, 'NS');

    return {
      dailyACV: {
        oreHauling: { target: targets.oreTarget, actual: dailyActuals.oreHaulingTonnage },
        ob: { target: targets.obTarget, actual: dailyActuals.obBCM },
        oreBarging: { target: targets.oreShipmentTarget, actual: dailyActuals.bargeTonnage },
        quarry: { target: targets.quarryTarget, actual: dailyActuals.quarryTonnage },
      },
      dayShiftACV: {
        oreHauling: { target: targets.oreTarget / 2, actual: dayShiftActuals.oreHaulingTonnage },
        ob: { target: targets.obTarget / 2, actual: dayShiftActuals.obBCM },
        oreBarging: { target: targets.oreShipmentTarget / 2, actual: dayShiftActuals.bargeTonnage },
        quarry: { target: targets.quarryTarget / 2, actual: dayShiftActuals.quarryTonnage },
      },
      nightShiftACV: {
        oreHauling: { target: targets.oreTarget / 2, actual: nightShiftActuals.oreHaulingTonnage },
        ob: { target: targets.obTarget / 2, actual: nightShiftActuals.obBCM },
        oreBarging: { target: targets.oreShipmentTarget / 2, actual: nightShiftActuals.bargeTonnage },
        quarry: { target: targets.quarryTarget / 2, actual: nightShiftActuals.quarryTonnage },
      },
    };
  }
}
