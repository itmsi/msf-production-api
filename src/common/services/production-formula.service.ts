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
      query += ` AND rpbdp.activity_date >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND rpbdp.activity_date <= $${paramIndex}`;
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
      query += ` AND rpbdp.activity_date >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND rpbdp.activity_date <= $${paramIndex}`;
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
      query += ` AND rpbdp.activity_date >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND rpbdp.activity_date <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }

    query += ` GROUP BY mp.tyre_type`;

    const result = await this.baseDataProRepository.query(query, queryParams);
    
    return result.reduce((total: number, row: any) => total + parseFloat(row.tonnage), 0);
  }

  /**
   * Mendapatkan actual Quarry Tonnage dari Control MTD Production
   * Formula: SUM[QUARRY Tonnage] sesuai rentang tanggal
   */
  async getQuarryTonnage(startDate?: string, endDate?: string): Promise<number> {
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

    const queryParams: any[] = [MaterialType.QUARRY];
    let paramIndex = 2;

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
}
