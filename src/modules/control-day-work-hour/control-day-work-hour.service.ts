import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ControlDayWorkHour } from './entities/control-day-work-hour.entity';
import { GetControlDayWorkHourDto, ControlDayWorkHourListResponseDto } from './dto/control-day-work-hour.dto';

@Injectable()
export class ControlDayWorkHourService {
  constructor(
    @InjectRepository(ControlDayWorkHour)
    private readonly controlDayWorkHourRepository: Repository<ControlDayWorkHour>,
  ) {}

  async getControlDayWorkHour(
    query: GetControlDayWorkHourDto,
  ): Promise<ControlDayWorkHourListResponseDto> {
    const { startDate, endDate, unit, shift, page = 1, limit = 10 } = query;

    // Query untuk mengambil data dari berbagai tabel sesuai spesifikasi
    const queryBuilder = this.controlDayWorkHourRepository
      .createQueryBuilder('cdwh')
      .leftJoin('m_population', 'pop', 'cdwh.unit = pop.no_unit')
      .leftJoin('r_plan_production', 'prod', 'cdwh.shift = prod.shift')
      .leftJoin('r_loss_time', 'ewh', 'pop.id = ewh.population_id');

    // Filter berdasarkan tanggal
    if (startDate && endDate) {
      // Jika filter tanggal X sampai Y, tanggal yang diambil hanya Y
      queryBuilder.andWhere('cdwh.filterDate = :endDate', { endDate });
    } else if (endDate) {
      queryBuilder.andWhere('cdwh.filterDate = :endDate', { endDate });
    }

    // Filter berdasarkan unit
    if (unit) {
      queryBuilder.andWhere('cdwh.unit = :unit', { unit });
    }

    // Filter berdasarkan shift
    if (shift) {
      queryBuilder.andWhere('cdwh.shift = :shift', { shift });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    // Hitung total halaman
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async generateControlDayWorkHourData(
    startDate: string,
    endDate: string,
  ): Promise<void> {
    // Query untuk mengambil data dari Population, Production, dan Effective Working Hours
    const populationQuery = `
      SELECT DISTINCT 
        mp.no_unit as unit,
        rp.shift,
        :endDate as filter_date
      FROM m_population mp
      LEFT JOIN r_parent_base_data_pro rpbdp ON mp.id = rpbdp.population_id
      LEFT JOIN r_plan_production rp ON rpbdp.id = rp.parent_plan_production_id
      WHERE mp.status = 'active'
    `;

    const populations = await this.controlDayWorkHourRepository.query(
      populationQuery,
      [endDate],
    );

    for (const pop of populations) {
      if (!pop.unit || !pop.shift) continue;

      // Query untuk mengambil data Effective Working Hours berdasarkan problem type
      const ewhQuery = `
        SELECT 
          ewh.description as problem_type,
          SUM(ewh.duration) as total_duration
        FROM r_loss_time ewh
        WHERE ewh.population_id = (
          SELECT id FROM m_population WHERE no_unit = :unit LIMIT 1
        )
        AND ewh.date_activity = :filterDate
        AND ewh.description IN (
          'P5M', 'Perg. Shift', 'Rest Time', 'GST', 'Travelling',
          'Perbaikan Front Loading', 'Cek Elevasi', 'Refuelling',
          'Slippery', 'Travelling Equipment', 'Fogging', 'Safety Talk', 'P2H'
        )
        GROUP BY ewh.description
      `;

      const ewhData = await this.controlDayWorkHourRepository.query(ewhQuery, [
        pop.unit,
        pop.filter_date,
      ]);

      // Mapping data berdasarkan problem type
      const controlData: Partial<ControlDayWorkHour> = {
        unit: pop.unit,
        shift: pop.shift,
        filterDate: pop.filter_date,
        p5m: this.getDurationByProblemType(ewhData, 'P5M') || undefined,
        pergShift: this.getDurationByProblemType(ewhData, 'Perg. Shift') || undefined,
        restTime: this.getDurationByProblemType(ewhData, 'Rest Time') || undefined,
        gst: this.getDurationByProblemType(ewhData, 'GST') || undefined,
        travelling: this.getDurationByProblemType(ewhData, 'Travelling') || undefined,
        perbaikanFrontLoading: this.getDurationByProblemType(
          ewhData,
          'Perbaikan Front Loading',
        ) || undefined,
        cekElevasi: this.getDurationByProblemType(ewhData, 'Cek Elevasi') || undefined,
        refuelling: this.getDurationByProblemType(ewhData, 'Refuelling') || undefined,
        slippery: this.getDurationByProblemType(ewhData, 'Slippery') || undefined,
        travellingEquipment: this.getDurationByProblemType(
          ewhData,
          'Travelling Equipment',
        ) || undefined,
        fogging: this.getDurationByProblemType(ewhData, 'Fogging') || undefined,
        safetyTalk: this.getDurationByProblemType(ewhData, 'Safety Talk') || undefined,
        p2h: this.getDurationByProblemType(ewhData, 'P2H') || undefined,
      };

      // Cek apakah data sudah ada
      const existingData = await this.controlDayWorkHourRepository.findOne({
        where: {
          unit: controlData.unit,
          shift: controlData.shift,
          filterDate: controlData.filterDate,
        },
      });

      if (existingData) {
        // Update data yang sudah ada
        await this.controlDayWorkHourRepository.update(existingData.id, controlData);
      } else {
        // Insert data baru
        await this.controlDayWorkHourRepository.save(controlData);
      }
    }
  }

  private getDurationByProblemType(
    ewhData: any[],
    problemType: string,
  ): number | null {
    const data = ewhData.find((item) => item.problem_type === problemType);
    return data ? parseFloat(data.total_duration) : null;
  }
}
