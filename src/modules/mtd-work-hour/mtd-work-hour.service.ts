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
      const populationQuery = this.populationRepository
        .createQueryBuilder('pop')
        .where('pop.status = :status', { status: 'active' });

      if (query.unit) {
        populationQuery.andWhere('pop.no_unit ILIKE :unit', { unit: `%${query.unit}%` });
      }

      const populations = await populationQuery.getMany();

      // Ambil data dari Effective Working Hours berdasarkan problem type
      const effectiveWorkingHoursQuery = this.effectiveWorkingHoursRepository
        .createQueryBuilder('ewh')
        .leftJoinAndSelect('ewh.population', 'pop')
        .leftJoinAndSelect('ewh.activities', 'act')
        .where('pop.status = :status', { status: 'active' });

      // Filter berdasarkan problem type
      if (query.problemType) {
        effectiveWorkingHoursQuery.andWhere('act.name = :problemType', { 
          problemType: query.problemType 
        });
      }

      // Filter berdasarkan date range
      if (query.startDate && query.endDate) {
        effectiveWorkingHoursQuery.andWhere('ewh.dateActivity BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      }

      const effectiveWorkingHours = await effectiveWorkingHoursQuery.getMany();

      // Group data berdasarkan unit dan problem type
      const groupedData: Record<string, MtdWorkHourSummaryDto> = {};

      // Initialize data untuk setiap unit
      populations.forEach(pop => {
        if (pop.no_unit) {
          groupedData[pop.no_unit] = {
            unit: pop.no_unit,
            totalDuration: 0,
            problems: [],
          };
        }
      });

      // Process effective working hours data
      effectiveWorkingHours.forEach(ewh => {
        const unit = ewh.population?.no_unit;
        const problemType = ewh.activities?.name;
        const duration = ewh.duration || 0;

        if (unit && problemType) {
          if (!groupedData[unit]) {
            groupedData[unit] = {
              unit,
              totalDuration: 0,
              problems: [],
            };
          }

          // Cari apakah problem type sudah ada
          const existingProblem = groupedData[unit].problems.find(p => p.problemType === problemType);
          
          if (existingProblem) {
            existingProblem.duration += duration;
          } else {
            groupedData[unit].problems.push({
              unit,
              activityDate: ewh.dateActivity,
              problemType,
              duration,
              description: ewh.description,
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

      return paginateResponse(
        paginatedResult,
        total,
        page,
        limit,
        'Data MTD Work Hour berhasil diambil',
      );
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

      // Ambil data dari Effective Working Hours berdasarkan problem type
      const effectiveWorkingHoursQuery = this.effectiveWorkingHoursRepository
        .createQueryBuilder('ewh')
        .leftJoinAndSelect('ewh.population', 'pop')
        .leftJoinAndSelect('ewh.activities', 'act')
        .where('pop.status = :status', { status: 'active' })
        .andWhere('act.name = :problemType', { problemType: query.problemType });

      // Filter berdasarkan unit
      if (query.unit) {
        effectiveWorkingHoursQuery.andWhere('pop.no_unit ILIKE :unit', { 
          unit: `%${query.unit}%` 
        });
      }

      // Filter berdasarkan date range
      if (query.startDate && query.endDate) {
        effectiveWorkingHoursQuery.andWhere('ewh.dateActivity BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      }

      const [effectiveWorkingHours, total] = await effectiveWorkingHoursQuery
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const result: MtdWorkHourResponseDto[] = effectiveWorkingHours.map(ewh => ({
        unit: ewh.population?.no_unit || '',
        activityDate: ewh.dateActivity,
        problemType: ewh.activities?.name || '',
        duration: ewh.duration || 0,
        description: ewh.description,
        totalDuration: ewh.duration || 0,
      }));

      return paginateResponse(
        result,
        total,
        page,
        limit,
        `Data ${query.problemType} berhasil diambil`,
      );
    } catch (error) {
      throw new BadRequestException(`Gagal mendapatkan data: ${error.message}`);
    }
  }

  async getMtdWorkHourSummary(query: MtdWorkHourQueryDto) {
    try {
      // Ambil data dari Effective Working Hours
      const effectiveWorkingHoursQuery = this.effectiveWorkingHoursRepository
        .createQueryBuilder('ewh')
        .leftJoinAndSelect('ewh.population', 'pop')
        .leftJoinAndSelect('ewh.activities', 'act')
        .where('pop.status = :status', { status: 'active' });

      // Filter berdasarkan problem type
      if (query.problemType) {
        effectiveWorkingHoursQuery.andWhere('act.name = :problemType', { 
          problemType: query.problemType 
        });
      }

      // Filter berdasarkan unit
      if (query.unit) {
        effectiveWorkingHoursQuery.andWhere('pop.no_unit ILIKE :unit', { 
          unit: `%${query.unit}%` 
        });
      }

      // Filter berdasarkan date range
      if (query.startDate && query.endDate) {
        effectiveWorkingHoursQuery.andWhere('ewh.dateActivity BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      }

      const effectiveWorkingHours = await effectiveWorkingHoursQuery.getMany();

      // Group data berdasarkan problem type
      const groupedByProblemType: Record<string, { totalDuration: number; count: number }> = {};

      effectiveWorkingHours.forEach(ewh => {
        const problemType = ewh.activities?.name || 'Unknown';
        const duration = ewh.duration || 0;

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
}
