import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Population } from '../population/entities/population.entity';
import { EffectiveWorkingHours } from '../effective-working-hours/entities/effective-working-hours.entity';
import { GetControlDayWorkHourDto, ControlDayWorkHourListResponseDto } from './dto/control-day-work-hour.dto';

@Injectable()
export class ControlDayWorkHourService {
  constructor(
    @InjectRepository(Population)
    private readonly populationRepository: Repository<Population>,
    @InjectRepository(EffectiveWorkingHours)
    private readonly effectiveWorkingHoursRepository: Repository<EffectiveWorkingHours>,
  ) {}

  async getControlDayWorkHour(query: GetControlDayWorkHourDto): Promise<ControlDayWorkHourListResponseDto> {
    const { startDate, endDate, unit, shift, page = 1, limit = 10 } = query;

    // Tentukan tanggal filter - jika ada startDate dan endDate, gunakan endDate saja
    // Jika tidak ada tanggal yang disediakan, gunakan tanggal hari ini
    let filterDate = endDate || startDate || new Date().toISOString().split('T')[0];

    // Query untuk mengambil data unit dari m_population
    const populationQuery = this.populationRepository.createQueryBuilder('pop').where('pop.status = :status', { status: 'active' });

    // Filter berdasarkan unit jika ada
    if (unit) {
      // Coba filter dengan exact match dulu
      populationQuery.andWhere('pop.no_unit = :unit', { unit });
    }

    let populations = await populationQuery.getMany();

    // Jika tidak ada population yang ditemukan dengan exact match, coba dengan LIKE
    if (populations.length === 0 && unit) {
      const likeQuery = this.populationRepository
        .createQueryBuilder('pop')
        .where('pop.status = :status', { status: 'active' })
        .andWhere('pop.no_unit LIKE :unit', { unit: `%${unit}%` });

      populations = await likeQuery.getMany();
    }

    // Debug: Periksa apakah ada data di r_loss_time untuk tanggal ini
    const totalLossTimeData = await this.effectiveWorkingHoursRepository
      .createQueryBuilder('ewh')
      .where('ewh.date_activity = :filterDate', { filterDate })
      .getCount();

    // Jika tidak ada data untuk tanggal ini, coba tanggal kemarin dan beberapa hari sebelumnya
    if (totalLossTimeData === 0 && !startDate && !endDate) {
      for (let i = 1; i <= 7; i++) {
        const previousDate = new Date();
        previousDate.setDate(previousDate.getDate() - i);
        const previousDateStr = previousDate.toISOString().split('T')[0];

        const previousData = await this.effectiveWorkingHoursRepository
          .createQueryBuilder('ewh')
          .where('ewh.date_activity = :previousDate', { previousDate: previousDateStr })
          .getCount();

        if (previousData > 0) {
          filterDate = previousDateStr;
          break;
        }
      }
    }

    // Debug: Periksa data r_loss_time untuk unit yang dicari
    if (unit) {
      const unitLossTimeData = await this.effectiveWorkingHoursRepository
        .createQueryBuilder('ewh')
        .leftJoin('ewh.population', 'pop')
        .where('pop.no_unit = :unit', { unit })
        .andWhere('ewh.date_activity = :filterDate', { filterDate })
        .getCount();
    }

    // Array untuk menyimpan hasil data
    const resultData: any[] = [];

    // Loop untuk setiap population/unit
    for (const population of populations) {
      // Query untuk mengambil data shift dari r_loss_time untuk unit ini
      const shiftQuery = this.effectiveWorkingHoursRepository
        .createQueryBuilder('ewh')
        .select('DISTINCT ewh.shift', 'shift')
        .where('ewh.population_id = :populationId', { populationId: population.id })
        .andWhere('ewh.date_activity = :filterDate', { filterDate });

      // Filter berdasarkan shift jika ada
      if (shift) {
        shiftQuery.andWhere('ewh.shift = :shift', { shift });
      }

      const shifts = await shiftQuery.getRawMany();

      // Loop untuk setiap shift
      for (const shiftData of shifts) {
        const currentShift = shiftData.shift;

        // Query untuk mengambil data duration berdasarkan problem type
        const problemTypes = [
          'P5M',
          'Pergantian Shift',
          'Rest Time',
          'GST',
          'Travelling',
          'Perbaikan Front Loading',
          'Cek Elevasi',
          'Refuelling',
          'Slippery',
          'Travelling Equipment',
          'Fogging',
          'Safety Talk',
          'P2H',
        ];

        const problemData = {};

        // Ambil data untuk setiap problem type
        for (const problemType of problemTypes) {
          const durationQuery = this.effectiveWorkingHoursRepository
            .createQueryBuilder('ewh')
            .select('SUM(ewh.duration)', 'totalDuration')
            .where('ewh.population_id = :populationId', { populationId: population.id })
            .andWhere('ewh.date_activity = :filterDate', { filterDate })
            .andWhere('ewh.shift = :shift', { shift: currentShift })
            .andWhere('ewh.description = :problemType', { problemType });

          const durationResult = await durationQuery.getRawOne();

          // Jika tidak ada data dengan exact match, coba dengan LIKE
          if (!durationResult?.totalDuration) {
            const likeQuery = this.effectiveWorkingHoursRepository
              .createQueryBuilder('ewh')
              .select('SUM(ewh.duration)', 'totalDuration')
              .where('ewh.population_id = :populationId', { populationId: population.id })
              .andWhere('ewh.date_activity = :filterDate', { filterDate })
              .andWhere('ewh.shift = :shift', { shift: currentShift })
              .andWhere('ewh.description LIKE :problemType', { problemType: `%${problemType}%` });

            const likeResult = await likeQuery.getRawOne();

            problemData[this.mapProblemTypeToField(problemType)] = likeResult?.totalDuration ? parseFloat(likeResult.totalDuration) : null;
          } else {
            problemData[this.mapProblemTypeToField(problemType)] = durationResult?.totalDuration
              ? parseFloat(durationResult.totalDuration)
              : null;
          }
        }

        // Buat object data untuk unit dan shift ini
        const controlData = {
          unit: population.no_unit,
          shift: currentShift,
          filterDate: filterDate,
          ...problemData,
        };

        resultData.push(controlData);
      }
    }

    // Implementasi pagination manual
    const total = resultData.length;
    const skip = (page - 1) * limit;
    const paginatedData = resultData.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private mapProblemTypeToField(problemType: string): string {
    const mapping = {
      P5M: 'p5m',
      'Pergantian Shift': 'pergShift',
      'Rest Time': 'restTime',
      GST: 'gst',
      Travelling: 'travelling',
      'Perbaikan Front Loading': 'perbaikanFrontLoading',
      'Cek Elevasi': 'cekElevasi',
      Refuelling: 'refuelling',
      Slippery: 'slippery',
      'Travelling Equipment': 'travellingEquipment',
      Fogging: 'fogging',
      'Safety Talk': 'safetyTalk',
      P2H: 'p2h',
    };

    return mapping[problemType] || problemType.toLowerCase().replace(/\s+/g, '');
  }
}
