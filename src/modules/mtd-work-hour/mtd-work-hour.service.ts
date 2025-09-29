import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MtdWorkHour } from './entities/mtd-work-hour.entity';
import { Population } from '../population/entities/population.entity';
import { EffectiveWorkingHours } from '../effective-working-hours/entities/effective-working-hours.entity';
import { MtdWorkHourQueryDto, MtdWorkHourResponseDto, MtdWorkHourSummaryDto, ProblemType } from './dto/mtd-work-hour.dto';
import { paginateResponse } from 'src/common';
import moment from 'moment';

@Injectable()
export class MtdWorkHourService {
  constructor(
    @InjectRepository(MtdWorkHour)
    private readonly mtdWorkHourRepository: Repository<MtdWorkHour>,
    @InjectRepository(Population)
    private readonly populationRepository: Repository<Population>,
    @InjectRepository(EffectiveWorkingHours)
    private readonly effectiveWorkingHoursRepository: Repository<EffectiveWorkingHours>,
  ) {}

  async getMtdWorkHourData(query: MtdWorkHourQueryDto) {
    try {
      const page = parseInt(query.page?.toString() ?? '1', 10);
      const limit = parseInt(query.limit?.toString() ?? '10', 10);

      // Ambil data dari Population untuk mendapatkan daftar unit
      const populationQuery = this.populationRepository.createQueryBuilder('pop').where('pop.status = :status', { status: 'active' });

      if (query.unit) {
        populationQuery.andWhere('pop.no_unit ILIKE :unit', { unit: `%${query.unit}%` });
      }

      const populations = await populationQuery.getMany();

      // Ambil data dari r_loss_time berdasarkan problem type yang spesifik
      const lossTimeQuery = this.effectiveWorkingHoursRepository
        .createQueryBuilder('lt')
        .leftJoinAndSelect('lt.population', 'pop')
        .leftJoinAndSelect('lt.activities', 'act')
        .where('pop.status = :status', { status: 'active' })
        .andWhere('lt.deletedAt IS NULL');

      // Filter berdasarkan problem type yang spesifik
      if (query.problemType) {
        lossTimeQuery.andWhere('act.name = :problemType', {
          problemType: query.problemType,
        });
      }

      // Filter berdasarkan date range
      if (query.startDate && query.endDate) {
        lossTimeQuery.andWhere('lt.dateActivity BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      }

      const lossTimeData = await lossTimeQuery.getMany();

      // Group data berdasarkan unit dan problem type
      const groupedData: Record<string, MtdWorkHourSummaryDto> = {};

      // Initialize data untuk setiap unit dari population
      populations.forEach((pop) => {
        if (pop.no_unit) {
          groupedData[pop.no_unit] = {
            unit: pop.no_unit,
            totalDuration: 0,
            problems: [],
          };
        }
      });

      // Process loss time data dan group by unit
      lossTimeData.forEach((lt) => {
        const unit = lt.population?.no_unit;
        const problemType = lt.activities?.name;
        const duration = lt.duration || 0;

        if (unit && problemType) {
          if (!groupedData[unit]) {
            groupedData[unit] = {
              unit,
              totalDuration: 0,
              problems: [],
            };
          }

          // Cari apakah problem type sudah ada untuk unit ini
          const existingProblem = groupedData[unit].problems.find((p) => p.problemType === problemType);

          if (existingProblem) {
            existingProblem.duration += duration;
            existingProblem.totalDuration += duration;
          } else {
            groupedData[unit].problems.push({
              unit,
              activityDate: lt.dateActivity,
              problemType,
              duration,
              description: lt.description,
              totalDuration: duration,
            });
          }

          groupedData[unit].totalDuration += duration;
        }
      });

      // Convert to array and apply pagination
      const result = Object.values(groupedData);
      const total = result.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResult = result.slice(startIndex, endIndex);

      return paginateResponse(paginatedResult, total, page, limit, 'Data MTD Work Hour berhasil diambil');
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data: ${error.message}`);
    }
  }

  async getMtdWorkHourByProblemType(query: MtdWorkHourQueryDto) {
    try {
      const page = parseInt(query.page?.toString() ?? '1', 10);
      const limit = parseInt(query.limit?.toString() ?? '10', 10);

      if (!query.problemType) {
        throw new BadRequestException('Problem type harus diisi');
      }

      // Ambil data dari r_loss_time berdasarkan problem type
      const lossTimeQuery = this.effectiveWorkingHoursRepository
        .createQueryBuilder('lt')
        .leftJoinAndSelect('lt.population', 'pop')
        .leftJoinAndSelect('lt.activities', 'act')
        .where('pop.status = :status', { status: 'active' })
        .andWhere('lt.deletedAt IS NULL')
        .andWhere('act.name = :problemType', { problemType: query.problemType });

      // Filter berdasarkan unit
      if (query.unit) {
        lossTimeQuery.andWhere('pop.no_unit ILIKE :unit', {
          unit: `%${query.unit}%`,
        });
      }

      // Filter berdasarkan date range
      if (query.startDate && query.endDate) {
        lossTimeQuery.andWhere('lt.dateActivity BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      }

      const [lossTimeData, total] = await lossTimeQuery
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const result: MtdWorkHourResponseDto[] = lossTimeData.map((lt) => ({
        unit: lt.population?.no_unit || '',
        activityDate: lt.dateActivity,
        problemType: lt.activities?.name || '',
        duration: lt.duration || 0,
        description: lt.description,
        totalDuration: lt.duration || 0,
      }));

      return paginateResponse(result, total, page, limit, `Data ${query.problemType} berhasil diambil`);
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data: ${error.message}`);
    }
  }

  async getMtdWorkHourSummary(query: MtdWorkHourQueryDto) {
    try {
      // Ambil data dari r_loss_time
      const lossTimeQuery = this.effectiveWorkingHoursRepository
        .createQueryBuilder('lt')
        .leftJoinAndSelect('lt.population', 'pop')
        .leftJoinAndSelect('lt.activities', 'act')
        .where('pop.status = :status', { status: 'active' })
        .andWhere('lt.deletedAt IS NULL');

      // Filter berdasarkan problem type
      if (query.problemType) {
        lossTimeQuery.andWhere('act.name = :problemType', {
          problemType: query.problemType,
        });
      }

      // Filter berdasarkan unit
      if (query.unit) {
        lossTimeQuery.andWhere('pop.no_unit ILIKE :unit', {
          unit: `%${query.unit}%`,
        });
      }

      // Filter berdasarkan date range
      if (query.startDate && query.endDate) {
        lossTimeQuery.andWhere('lt.dateActivity BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      }

      const lossTimeData = await lossTimeQuery.getMany();

      // Group data berdasarkan problem type
      const groupedByProblemType: Record<string, { totalDuration: number; count: number }> = {};

      lossTimeData.forEach((lt) => {
        const problemType = lt.activities?.name || 'Unknown';
        const duration = lt.duration || 0;

        if (!groupedByProblemType[problemType]) {
          groupedByProblemType[problemType] = {
            totalDuration: 0,
            count: 0,
          };
        }

        groupedByProblemType[problemType].totalDuration += duration;
        groupedByProblemType[problemType].count += 1;
      });

      const summary = Object.entries(groupedByProblemType).map(([problemType, data]) => ({
        problemType,
        totalDuration: data.totalDuration,
        count: data.count,
        averageDuration: data.totalDuration / data.count,
      }));

      return {
        statusCode: 200,
        message: 'Summary data berhasil diambil',
        data: summary,
      };
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan summary: ${error.message}`);
    }
  }

  /**
   * Mengambil data MTD Work Hour berdasarkan semua problem type yang spesifik
   * Sesuai dengan requirement: Unit dari m_population, Duration dari r_loss_time berdasarkan problem
   */
  async getMtdWorkHourByAllProblemTypes(query: MtdWorkHourQueryDto) {
    try {
      const page = parseInt(query.page?.toString() ?? '1', 10);
      const limit = parseInt(query.limit?.toString() ?? '10', 10);

      // Ambil data dari Population untuk mendapatkan daftar unit
      const populationQuery = this.populationRepository.createQueryBuilder('pop').where('pop.status = :status', { status: 'active' });

      if (query.unit) {
        populationQuery.andWhere('pop.no_unit ILIKE :unit', { unit: `%${query.unit}%` });
      }

      const populations = await populationQuery.getMany();

      // Problem types yang spesifik sesuai requirement
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

      // Ambil data dari r_loss_time untuk semua problem types
      const lossTimeQuery = this.effectiveWorkingHoursRepository
        .createQueryBuilder('lt')
        .leftJoinAndSelect('lt.population', 'pop')
        .leftJoinAndSelect('lt.activities', 'act')
        .where('pop.status = :status', { status: 'active' })
        .andWhere('lt.deletedAt IS NULL')
        .andWhere('act.name IN (:...problemTypes)', { problemTypes });

      // Filter berdasarkan date range
      if (query.startDate && query.endDate) {
        lossTimeQuery.andWhere('lt.dateActivity BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      }

      const lossTimeData = await lossTimeQuery.getMany();

      // Group data berdasarkan unit dan problem type
      const groupedData: Record<string, any> = {};

      // Initialize data untuk setiap unit dari population
      populations.forEach((pop) => {
        if (pop.no_unit) {
          groupedData[pop.no_unit] = {
            unit: pop.no_unit,
            p5m: 0,
            pergShift: 0,
            restTime: 0,
            gst: 0,
            travelling: 0,
            perbaikanFrontLoading: 0,
            cekElevasi: 0,
            refuelling: 0,
            slippery: 0,
            travellingEquipment: 0,
            fogging: 0,
            safetyTalk: 0,
            p2h: 0,
            totalDuration: 0,
          };
        }
      });

      // Process loss time data dan group by unit
      lossTimeData.forEach((lt) => {
        const unit = lt.population?.no_unit;
        const problemType = lt.activities?.name;
        const duration = lt.duration || 0;

        if (unit && problemType && groupedData[unit]) {
          // Map problem type ke field yang sesuai
          switch (problemType) {
            case 'P5M':
              groupedData[unit].p5m += duration;
              break;
            case 'Pergantian Shift':
              groupedData[unit].pergShift += duration;
              break;
            case 'Rest Time':
              groupedData[unit].restTime += duration;
              break;
            case 'GST':
              groupedData[unit].gst += duration;
              break;
            case 'Travelling':
              groupedData[unit].travelling += duration;
              break;
            case 'Perbaikan Front Loading':
              groupedData[unit].perbaikanFrontLoading += duration;
              break;
            case 'Cek Elevasi':
              groupedData[unit].cekElevasi += duration;
              break;
            case 'Refuelling':
              groupedData[unit].refuelling += duration;
              break;
            case 'Slippery':
              groupedData[unit].slippery += duration;
              break;
            case 'Travelling Equipment':
              groupedData[unit].travellingEquipment += duration;
              break;
            case 'Fogging':
              groupedData[unit].fogging += duration;
              break;
            case 'Safety Talk':
              groupedData[unit].safetyTalk += duration;
              break;
            case 'P2H':
              groupedData[unit].p2h += duration;
              break;
          }

          groupedData[unit].totalDuration += duration;
        }
      });

      // Convert to array and apply pagination
      const result = Object.values(groupedData);
      const total = result.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResult = result.slice(startIndex, endIndex);

      return paginateResponse(paginatedResult, total, page, limit, 'Data MTD Work Hour berdasarkan semua problem types berhasil diambil');
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data: ${error.message}`);
    }
  }
}
