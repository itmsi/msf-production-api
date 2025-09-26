import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisHaulingBargingFilterDto, AnalysisHaulingBargingResponseDto } from './dto/analysis-hauling-barging.dto';
import { paginateResponse } from '../../common/helpers/public.helper';
import { BaseDataPro } from '../base-data-production/entities/base-data-pro.entity';
import { ParentBaseDataPro } from '../base-data-production/entities/parent-base-data-pro.entity';
import { Population } from '../population/entities/population.entity';
import { ProductionFormulaService } from '../../common/services/production-formula.service';

@Injectable()
export class AnalysisHaulingBargingService {
  constructor(
    @InjectRepository(BaseDataPro)
    private readonly baseDataProRepository: Repository<BaseDataPro>,
    @InjectRepository(ParentBaseDataPro)
    private readonly parentBaseDataProRepository: Repository<ParentBaseDataPro>,
    @InjectRepository(Population)
    private readonly populationRepository: Repository<Population>,
    private readonly productionFormulaService: ProductionFormulaService,
  ) {}

  async getAnalysisData(filterDto: AnalysisHaulingBargingFilterDto) {
    const { startDate, endDate, page = 1, limit = 10 } = filterDto;

    // Query untuk mendapatkan data dari tabel yang diperlukan
    let query = `
      SELECT 
        rpbdp.activity_date as date,
        rbdp.material,
        rbdp.activity,
        mp.no_unit,
        SUM(rbdp.total_vessel) as total_vessel,
        CASE 
          WHEN rbdp.material in('ore-barge','ore') AND rbdp.activity = 'barging' THEN 'ore-barge'
          WHEN rbdp.material = 'ore' AND rbdp.activity in ('hauling','direct') THEN 'ore'
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
        (rbdp.material in('ore-barge','ore') AND rbdp.activity = 'barging') OR
        (rbdp.material = 'ore' AND rbdp.activity in ('hauling','direct')) OR
        (rbdp.material = 'ob')
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
      ORDER BY rpbdp.activity_date DESC
    `;

    // Execute query
    const rawData = await this.baseDataProRepository.query(query, queryParams);
    // Process data sesuai spesifikasi
    const processedData = this.processAnalysisData(rawData);
    console.log(rawData);
    console.log(processedData);

    // Pagination
    const total = processedData.length;
    const offset = (page - 1) * limit;
    const paginatedData = processedData.slice(offset, offset + limit);

    return paginateResponse(
      paginatedData,
      total,
      page,
      limit,
      'Data analysis hauling barging berhasil diambil',
    );
  }

  private processAnalysisData(rawData: any[]): AnalysisHaulingBargingResponseDto[] {
    // Group data by date
    const groupedByDate = rawData.reduce((acc, row) => {
      const date = row.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          bargeVessel: 0,
          bargeBCM: 0,
          bargeTonnage: 0,
          oreHaulingVessel: 0,
          oreHaulingBCM: 0,
          oreHaulingTonnage: 0,
          obVessel: 0,
          obBCM: 0,
          obTonnage: 0,
          tmmVessel: 0,
          tmmBCM: 0,
          tmmTonnage: 0,
        };
      }
      const materialType = row.material_type;
      const vessel = parseInt(row.total_vessel) || 0;
      const tonnage = parseFloat(row.tonnage) || 0;
      const bcm = tonnage / 1.6;

      switch (materialType) {
        case 'ore-barge':
          acc[date].bargeVessel += vessel;
          acc[date].bargeTonnage += tonnage;
          acc[date].bargeBCM += bcm;
          break;
        case 'ore':
          acc[date].oreHaulingVessel += vessel;
          acc[date].oreHaulingTonnage += tonnage;
          acc[date].oreHaulingBCM += bcm;
          break;
        case 'ob':
          acc[date].obVessel += vessel;
          acc[date].obTonnage += tonnage;
          acc[date].obBCM += bcm;
          break;
      }

      return acc;
    }, {});

    // Calculate TMM values (ore hauling + OB)
    Object.values(groupedByDate).forEach((data: any) => {
      data.tmmVessel = data.oreHaulingVessel + data.obVessel;
      data.tmmBCM = data.oreHaulingBCM + data.obBCM;
      data.tmmTonnage = data.oreHaulingTonnage + data.obTonnage;
    });

    // Convert to array and format dates
    return Object.values(groupedByDate)
      .map((data: any) => ({
        date: data.date,
        bargeVessel: data.bargeVessel,
        bargeBCM: Math.round(data.bargeBCM * 100) / 100,
        bargeTonnage: Math.round(data.bargeTonnage * 100) / 100,
        oreHaulingVessel: data.oreHaulingVessel,
        oreHaulingBCM: Math.round(data.oreHaulingBCM * 100) / 100,
        oreHaulingTonnage: Math.round(data.oreHaulingTonnage * 100) / 100,
        obVessel: data.obVessel,
        obBCM: Math.round(data.obBCM * 100) / 100,
        obTonnage: Math.round(data.obTonnage * 100) / 100,
        tmmVessel: data.tmmVessel,
        tmmBCM: Math.round(data.tmmBCM * 100) / 100,
        tmmTonnage: Math.round(data.tmmTonnage * 100) / 100,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
