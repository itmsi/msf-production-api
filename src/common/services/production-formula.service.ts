import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanProduction } from '../../modules/plan-production/entities/plan-production.entity';
import { ParentPlanProduction } from '../../modules/parent-plan-production/entities/parent-plan-production.entity';
import {
  BaseDataPro,
  MaterialType,
  ActivityType,
} from '../../modules/base-data-production/entities/base-data-pro.entity';

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
  async getProductionTargets(
    startDate?: string,
    endDate?: string,
  ): Promise<ProductionTargets> {
    let query = this.planProductionRepository
      .createQueryBuilder('pp')
      .select([
        'SUM(pp.ore_target) AS "oreTarget"',
        'SUM(pp.ob_target) AS "obTarget"',
        'SUM(pp.ore_shipment_target) AS "oreShipmentTarget"',
        'SUM(pp.quarry) AS "quarryTarget"',
      ]);

    if (startDate && endDate) {
      query = query.where('pp.plan_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const result = await query.getRawOne<{
      oreTarget: string | null;
      obTarget: string | null;
      oreShipmentTarget: string | null;
      quarryTarget: string | null;
    }>();

    return {
      oreTarget: parseFloat(result?.oreTarget ?? '0'),
      obTarget: parseFloat(result?.obTarget ?? '0'),
      oreShipmentTarget: parseFloat(result?.oreShipmentTarget ?? '0'),
      quarryTarget: parseFloat(result?.quarryTarget ?? '0'),
    };
  }

  /**
   * Mendapatkan target produksi untuk tanggal tertentu (bukan SUM)
   */
  async getProductionTargetsForDate(
    selectedDate: string,
  ): Promise<ProductionTargets> {
    const query = `
      SELECT 
        ore_target as "oreTarget",
        ob_target as "obTarget", 
        ore_shipment_target as "oreShipmentTarget",
        quarry as "quarryTarget"
      FROM r_plan_production 
      WHERE plan_date = $1
      LIMIT 1
    `;

    const result = await this.planProductionRepository.query(query, [
      selectedDate,
    ]);

    return {
      oreTarget: parseFloat(result[0]?.oreTarget) || 0,
      obTarget: parseFloat(result[0]?.obTarget) || 0,
      oreShipmentTarget: parseFloat(result[0]?.oreShipmentTarget) || 0,
      quarryTarget: parseFloat(result[0]?.quarryTarget) || 0,
    };
  }

  /**
   * Mendapatkan actual produksi dari Analysis Hauling and Barging
   * Formula: SUM [Ore Hauling Tonnage] sesuai rentang tanggal
   */
  async getOreHaulingTonnage(
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const today = new Date();

    if (!startDate) {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = firstDay.toISOString().split('T')[0];
    }

    if (!endDate) {
      endDate = today.toISOString().split('T')[0];
    }

    console.log(startDate);
    console.log(endDate);

    const qb = this.baseDataProRepository
      .createQueryBuilder('rbdp')
      .select(
        `COALESCE(SUM(
    CASE
      WHEN rbdp.material = 'ore' AND rbdp.activity IN ('hauling','direct') AND mp.tyre_type = '6x4'
        THEN rbdp.total_vessel * 26.56
      WHEN rbdp.material = 'ore' AND rbdp.activity IN ('hauling','direct') AND mp.tyre_type = '8x4'
        THEN rbdp.total_vessel * 29.56
      ELSE 0
    END
  ), 0)`,
        'total_tonnage',
      )
      .leftJoin(
        'r_parent_base_data_pro',
        'rpbdp',
        'rpbdp.id = rbdp.parent_base_data_pro_id',
      )
      .leftJoin('m_population', 'mp', 'mp.id = rpbdp.population_id')
      .where('DATE(rpbdp.activity_date) BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    const resultData = await qb.getRawMany();

    console.log(resultData);

    let total_tonnage = 0;

    resultData.map((item) => {
      total_tonnage = item.total_tonnage ?? 0;
    });

    return total_tonnage;
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
    const totalTonnage = result.reduce(
      (total: number, row: any) => total + parseFloat(row.tonnage),
      0,
    );
    return totalTonnage / 1.6;
  }

  /**
   * Mendapatkan actual Barge Tonnage dari Analysis Hauling and Barging
   * Formula: SUM [Barge Tonnage] sesuai rentang tanggal
   */
  async getBargeTonnage(startDate?: string, endDate?: string): Promise<number> {
    const qb = this.baseDataProRepository
      .createQueryBuilder('rbdp')
      .select(
        `
      CASE
        WHEN mp.tyre_type = '6x4' THEN SUM(rbdp.total_vessel) * 26.56
        WHEN mp.tyre_type = '8x4' THEN SUM(rbdp.total_vessel) * 29.56
        ELSE 0
      END
    `,
        'tonnage',
      )
      .innerJoin(
        'r_parent_base_data_pro',
        'rpbdp',
        'rpbdp.id = rbdp.parent_base_data_pro_id',
      )
      .innerJoin('m_population', 'mp', 'mp.id = rpbdp.population_id')
      .where('rbdp.material IN (:...materials)', {
        materials: [MaterialType.ORE, MaterialType.ORE_BARGE],
      })
      .andWhere('rbdp.activity = :activity', {
        activity: ActivityType.BARGING,
      });

    if (startDate) {
      qb.andWhere('rpbdp.activity_date >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('rpbdp.activity_date <= :endDate', { endDate });
    }

    qb.groupBy('mp.tyre_type');

    const result = await qb.getRawMany();

    // jumlahkan tonnage dari semua tyre_type
    return result.reduce(
      (total: number, row: any) => total + parseFloat(row.tonnage),
      0,
    );
  }

  /**
   * Mendapatkan data barge dan hauling harian untuk dashboard
   * Formula terpusat yang sama dengan analysis-hauling-barging
   */
  async getDailyBargeHaulingData(
    startDate?: string,
    endDate?: string,
  ): Promise<any[]> {
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
  async getQuarryTonnage(
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
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

    return result.reduce(
      (total: number, row: any) => total + parseFloat(row.tonnage),
      0,
    );
  }

  /**
   * Mendapatkan semua data actual produksi sekaligus
   */
  async getProductionActuals(
    startDate?: string,
    endDate?: string,
  ): Promise<ProductionActuals> {
    const [oreHaulingTonnage, obBCM, bargeTonnage, quarryTonnage] =
      await Promise.all([
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
  async getActualByShift(
    startDate?: string,
    endDate?: string,
    shift?: string,
  ): Promise<ProductionActuals> {
    const oreHaulingTonnage = await this.getOreHaulingTonnageByShift(
      startDate,
      endDate,
      shift,
    );
    const obBCM = await this.getObBCMByShift(startDate, endDate, shift);
    const bargeTonnage = await this.getBargeTonnageByShift(
      startDate,
      endDate,
      shift,
    );
    const quarryTonnage = await this.getQuarryTonnageByShift(
      startDate,
      endDate,
      shift,
    );

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
  async getOreHaulingTonnageByShift(
    startDate?: string,
    endDate?: string,
    shift?: string,
  ): Promise<number> {
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

    return result.reduce(
      (total: number, row: any) => total + parseFloat(row.tonnage),
      0,
    );
  }

  /**
   * Mendapatkan actual OB berdasarkan shift
   */
  async getObBCMByShift(
    startDate?: string,
    endDate?: string,
    shift?: string,
  ): Promise<number> {
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
    const totalTonnage = result.reduce(
      (total: number, row: any) => total + parseFloat(row.tonnage),
      0,
    );
    return totalTonnage / 1.6;
  }

  /**
   * Mendapatkan actual Barge berdasarkan shift
   */
  async getBargeTonnageByShift(
    startDate?: string,
    endDate?: string,
    shift?: string,
  ): Promise<number> {
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

    return result.reduce(
      (total: number, row: any) => total + parseFloat(row.tonnage),
      0,
    );
  }

  /**
   * Mendapatkan actual Quarry berdasarkan shift
   * Menggunakan faktor yang sama dengan Control MTD Production: 6x4=16.6, 8x4=18.26
   */
  async getQuarryTonnageByShift(
    startDate?: string,
    endDate?: string,
    shift?: string,
  ): Promise<number> {
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

    return result.reduce(
      (total: number, row: any) => total + parseFloat(row.tonnage),
      0,
    );
  }

  /**
   * Mendapatkan actual produksi dari Control Day Production API
   * Berdasarkan formula yang diminta: menggunakan data dari /api/control/day-production
   */
  // async getActualFromControlDayProduction(selectedDate?: string, shift?: string): Promise<ProductionActuals> {
  //   // Query untuk mendapatkan data actual dari control day production
  //   let query = `
  //     SELECT
  //       SUM(ore_hauling_tonnage) as ore_hauling_tonnage,
  //       SUM(ob_tonnage) as ob_tonnage,
  //       SUM(ore_barge_tonnage) as ore_barge_tonnage,
  //       SUM(quarry_tonnage) as quarry_tonnage
  //     FROM (
  //       SELECT DISTINCT
  //         activity_date,
  //         tyre_type,
  //         no_unit,
  //         shift,
  //         ore_hauling_tonnage,
  //         ob_tonnage,
  //         ore_barge_tonnage,
  //         quarry_tonnage
  //       FROM (
  //         SELECT
  //           DATE(pbdp.activity_date) as activity_date,
  //           mp.tyre_type,
  //           mp.no_unit,
  //           pbdp.shift,
  //           CASE
  //             WHEN rbdp.material = 'ore' AND rbdp.activity = 'hauling' THEN
  //               CASE
  //                 WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
  //                 WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
  //                 ELSE 0
  //               END
  //             ELSE 0
  //           END as ore_hauling_tonnage,
  //           CASE
  //             WHEN rbdp.material = 'ob' THEN
  //               CASE
  //                 WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56) / 1.6
  //                 WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56) / 1.6
  //                 ELSE 0
  //               END
  //             ELSE 0
  //           END as ob_tonnage,
  //           CASE
  //             WHEN rbdp.material = 'ore-barge' AND rbdp.activity = 'barging' THEN
  //               CASE
  //                 WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
  //                 WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
  //                 ELSE 0
  //               END
  //             ELSE 0
  //           END as ore_barge_tonnage,
  //           CASE
  //             WHEN rbdp.material = 'quarry' THEN
  //               CASE
  //                 WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 16.6)
  //                 WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 18.26)
  //                 ELSE 0
  //               END
  //             ELSE 0
  //           END as quarry_tonnage
  //         FROM r_parent_base_data_pro pbdp
  //         JOIN r_base_data_pro rbdp ON pbdp.id = rbdp.parent_base_data_pro_id
  //         JOIN m_population mp ON pbdp.population_id = mp.id
  //         WHERE mp.site_id = 1
  //   `;

  //   const queryParams: any[] = [];
  //   let paramIndex = 1;

  //   // Filter by activity_date (default to Today if not provided)
  //   const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
  //   query += ` AND DATE(pbdp.activity_date) = $${paramIndex}`;
  //   queryParams.push(dateToUse);
  //   paramIndex++;

  //   // Filter by shift (ds or ns) - menggunakan nilai lowercase yang sesuai dengan database
  //   if (shift) {
  //     // Konversi input ke lowercase untuk mencocokkan dengan nilai di database
  //     const shiftValue = shift.toLowerCase();
  //     if (shiftValue === 'ds' || shiftValue === 'ns') {
  //       query += ` AND pbdp.shift = $${paramIndex}`;
  //       queryParams.push(shiftValue);
  //       paramIndex++;
  //     } else {
  //       // Jika nilai shift tidak valid, tidak menambahkan filter
  //       console.warn(`Invalid shift value: ${shift}. Valid values are 'ds' or 'ns'`);
  //     }
  //   } else {
  //     // Default filter for both ds and ns shifts
  //     query += ` AND pbdp.shift IN ('ds', 'ns')`;
  //   }

  //   query += `
  //         GROUP BY DATE(pbdp.activity_date), mp.tyre_type, mp.no_unit, pbdp.shift, rbdp.material, rbdp.activity
  //       ) grouped_data
  //     ) final_data
  //   `;

  //   const result = await this.baseDataProRepository.query(query, queryParams);
  //   console.log(result);
  //   const data = result[0] || {};

  //   return {
  //     oreHaulingTonnage: parseFloat(data.ore_hauling_tonnage) || 0,
  //     obBCM: parseFloat(data.ob_tonnage) || 0,
  //     bargeTonnage: parseFloat(data.ore_barge_tonnage) || 0,
  //     quarryTonnage: parseFloat(data.quarry_tonnage) || 0,
  //   };
  // }
  async getActualFromControlDayProduction(
    selectedDate?: string,
    shift?: string,
  ) {
    const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
    const shifts = shift ? [shift] : ['ds', 'ns'];

    console.log(dateToUse);
    console.log(shifts);
    const result = await this.baseDataProRepository
      .createQueryBuilder('rbdp')
      .select(
        `
          SUM(CASE 
                WHEN rbdp.material = 'ore' AND rbdp.activity = 'hauling' THEN 
                  CASE WHEN mp.tyre_type = '6x4' THEN rbdp.total_vessel * 26.56
                      WHEN mp.tyre_type = '8x4' THEN rbdp.total_vessel * 29.56
                      ELSE 0 END
                ELSE 0 END
              ) AS "oreHaulingTonnage",
          SUM(CASE 
                WHEN rbdp.material = 'ob' AND rbdp.activity = 'barging' THEN 
                  CASE WHEN mp.tyre_type = '6x4' THEN rbdp.total_vessel * 26.56 / 1.6
                      WHEN mp.tyre_type = '8x4' THEN rbdp.total_vessel * 29.56 / 1.6
                      ELSE 0 END
                ELSE 0 END
              ) AS "obBCM",
          SUM(CASE 
                WHEN rbdp.material = 'ore-barge' AND rbdp.activity IN ('barging','direct') THEN 
                  CASE WHEN mp.tyre_type = '6x4' THEN rbdp.total_vessel * 26.56
                      WHEN mp.tyre_type = '8x4' THEN rbdp.total_vessel * 29.56
                      ELSE 0 END
                ELSE 0 END
              ) AS "bargeTonnage",
          SUM(CASE 
                WHEN rbdp.material = 'quarry' THEN 
                  CASE WHEN mp.tyre_type = '6x4' THEN rbdp.total_vessel * 16.6
                      WHEN mp.tyre_type = '8x4' THEN rbdp.total_vessel * 18.26
                      ELSE 0 END
                ELSE 0 END
              ) AS "quarryTonnage"
        `,
      )
      .innerJoin('rbdp.parentBaseDataPro', 'rpbdp')
      .innerJoin('rpbdp.population', 'mp')
      .where('rpbdp.activity_date = :date', { date: dateToUse })
      .andWhere('rpbdp.shift IN (:...shifts)', { shifts })
      .getRawOne();

    const response = {
      oreHaulingTonnage: parseFloat(result.oreHaulingTonnage) || 0,
      obBCM: parseFloat(result.obBCM) || 0,
      bargeTonnage: parseFloat(result.bargeTonnage) || 0,
      quarryTonnage: parseFloat(result.quarryTonnage) || 0,
    };
    console.log(response);
    return response;
  }
  /**
   * Mendapatkan data Daily Achievement lengkap sesuai formula yang diminta
   */
  async getDailyAchievementData(
    selectedDate?: string,
    shift?: string,
  ): Promise<{
    dailyACV: DailyAchievementData;
    dayShiftACV: DailyAchievementData;
    nightShiftACV: DailyAchievementData;
  }> {
    // Gunakan tanggal yang dipilih atau hari ini sebagai default
    const dateToUse = selectedDate || new Date().toISOString().split('T')[0];

    // Ambil target dari r_plan_production berdasarkan tanggal yang dipilih (bukan SUM)
    const targets = await this.getProductionTargetsForDate(dateToUse);

    // Jika shift tidak ditentukan, ambil data untuk semua shift (daily)
    const dailyActuals =
      await this.getActualFromControlDayProduction(dateToUse);

    // Ambil actual untuk Day Shift (ds)
    const dayShiftActuals = await this.getActualFromControlDayProduction(
      dateToUse,
      'ds',
    );

    // Ambil actual untuk Night Shift (ns)
    const nightShiftActuals = await this.getActualFromControlDayProduction(
      dateToUse,
      'ns',
    );

    // Jika shift ditentukan, sesuaikan data yang dikembalikan
    if (shift && shift.toLowerCase() === 'ds') {
      // Jika filter Day Shift, kembalikan data Day Shift saja
      return {
        dailyACV: {
          oreHauling: {
            target: targets.oreTarget / 2,
            actual: dayShiftActuals.oreHaulingTonnage,
          },
          ob: { target: targets.obTarget / 2, actual: dayShiftActuals.obBCM },
          oreBarging: {
            target: targets.oreShipmentTarget / 2,
            actual: dayShiftActuals.bargeTonnage,
          },
          quarry: {
            target: targets.quarryTarget / 2,
            actual: dayShiftActuals.quarryTonnage,
          },
        },
        dayShiftACV: {
          oreHauling: {
            target: targets.oreTarget / 2,
            actual: dayShiftActuals.oreHaulingTonnage,
          },
          ob: { target: targets.obTarget / 2, actual: dayShiftActuals.obBCM },
          oreBarging: {
            target: targets.oreShipmentTarget / 2,
            actual: dayShiftActuals.bargeTonnage,
          },
          quarry: {
            target: targets.quarryTarget / 2,
            actual: dayShiftActuals.quarryTonnage,
          },
        },
        nightShiftACV: {
          oreHauling: { target: 0, actual: 0 },
          ob: { target: 0, actual: 0 },
          oreBarging: { target: 0, actual: 0 },
          quarry: { target: 0, actual: 0 },
        },
      };
    } else if (shift && shift.toLowerCase() === 'ns') {
      // Jika filter Night Shift, kembalikan data Night Shift saja
      return {
        dailyACV: {
          oreHauling: {
            target: targets.oreTarget / 2,
            actual: nightShiftActuals.oreHaulingTonnage,
          },
          ob: { target: targets.obTarget / 2, actual: nightShiftActuals.obBCM },
          oreBarging: {
            target: targets.oreShipmentTarget / 2,
            actual: nightShiftActuals.bargeTonnage,
          },
          quarry: {
            target: targets.quarryTarget / 2,
            actual: nightShiftActuals.quarryTonnage,
          },
        },
        dayShiftACV: {
          oreHauling: { target: 0, actual: 0 },
          ob: { target: 0, actual: 0 },
          oreBarging: { target: 0, actual: 0 },
          quarry: { target: 0, actual: 0 },
        },
        nightShiftACV: {
          oreHauling: {
            target: targets.oreTarget / 2,
            actual: nightShiftActuals.oreHaulingTonnage,
          },
          ob: { target: targets.obTarget / 2, actual: nightShiftActuals.obBCM },
          oreBarging: {
            target: targets.oreShipmentTarget / 2,
            actual: nightShiftActuals.bargeTonnage,
          },
          quarry: {
            target: targets.quarryTarget / 2,
            actual: nightShiftActuals.quarryTonnage,
          },
        },
      };
    } else {
      // Jika tidak ada filter shift atau shift tidak valid, kembalikan data lengkap
      return {
        dailyACV: {
          oreHauling: {
            target: targets.oreTarget,
            actual: dailyActuals.oreHaulingTonnage,
          },
          ob: { target: targets.obTarget, actual: dailyActuals.obBCM },
          oreBarging: {
            target: targets.oreShipmentTarget,
            actual: dailyActuals.bargeTonnage,
          },
          quarry: {
            target: targets.quarryTarget,
            actual: dailyActuals.quarryTonnage,
          },
        },
        dayShiftACV: {
          oreHauling: {
            target: targets.oreTarget / 2,
            actual: dayShiftActuals.oreHaulingTonnage,
          },
          ob: { target: targets.obTarget / 2, actual: dayShiftActuals.obBCM },
          oreBarging: {
            target: targets.oreShipmentTarget / 2,
            actual: dayShiftActuals.bargeTonnage,
          },
          quarry: {
            target: targets.quarryTarget / 2,
            actual: dayShiftActuals.quarryTonnage,
          },
        },
        nightShiftACV: {
          oreHauling: {
            target: targets.oreTarget / 2,
            actual: nightShiftActuals.oreHaulingTonnage,
          },
          ob: { target: targets.obTarget / 2, actual: nightShiftActuals.obBCM },
          oreBarging: {
            target: targets.oreShipmentTarget / 2,
            actual: nightShiftActuals.bargeTonnage,
          },
          quarry: {
            target: targets.quarryTarget / 2,
            actual: nightShiftActuals.quarryTonnage,
          },
        },
      };
    }
  }
}
