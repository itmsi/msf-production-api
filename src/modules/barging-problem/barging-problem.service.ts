import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, IsNull } from 'typeorm';
import { BargingProblem } from './entities/barging-problem.entity';
import { Barge } from '../barge/entities/barge.entity';
import { Activities } from '../activities/entities/activities.entity';
import { Sites } from '../sites/entities/sites.entity';
import {
  CreateBargingProblemDto,
  UpdateBargingProblemDto,
  BargingProblemResponseDto,
  GetBargingProblemsQueryDto,
} from './dto/barging-problem.dto';
import {
  successResponse,
  emptyDataResponse,
  throwError,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

@Injectable()
export class BargingProblemService {
  constructor(
    @InjectRepository(BargingProblem)
    private bargingProblemRepository: Repository<BargingProblem>,
    @InjectRepository(Barge)
    private bargeRepository: Repository<Barge>,
    @InjectRepository(Activities)
    private activitiesRepository: Repository<Activities>,
    @InjectRepository(Sites)
    private sitesRepository: Repository<Sites>,
  ) {}

  async findAll(
    query: GetBargingProblemsQueryDto,
  ): Promise<ApiResponse<BargingProblemResponseDto[]>> {
    try {
      const page = parseInt(query.page?.toString() ?? '1', 10);
      const limit = parseInt(query.limit?.toString() ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const shift = query.shift?.toLowerCase() ?? '';
      const bargeId = query.barge_id;
      const activitiesId = query.activities_id;
      const siteId = query.site_id;
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      const qb = this.bargingProblemRepository
        .createQueryBuilder('bargingProblem')
        .leftJoinAndSelect('bargingProblem.barge', 'barge')
        .leftJoinAndSelect('bargingProblem.activities', 'activities')
        .leftJoinAndSelect('bargingProblem.site', 'site')
        .where('bargingProblem.deletedAt IS NULL'); // Exclude soft deleted records

      // Search filter
      if (search) {
        qb.andWhere(
          '(bargingProblem.remark ILIKE :search OR barge.name ILIKE :search OR activities.name ILIKE :search OR site.name ILIKE :search)',
          {
            search: `%${search}%`,
          },
        );
      }

      // Filter by shift
      if (shift) {
        qb.andWhere('bargingProblem.shift = :shift', { shift });
      }

      // Filter by barge_id
      if (bargeId) {
        qb.andWhere('bargingProblem.bargeId = :bargeId', { bargeId });
      }

      // Filter by activities_id
      if (activitiesId) {
        qb.andWhere('bargingProblem.activitiesId = :activitiesId', { activitiesId });
      }

      // Filter by site_id
      if (siteId) {
        qb.andWhere('bargingProblem.siteId = :siteId', { siteId });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'activity_date',
        'shift',
        'barge_id',
        'activities_id',
        'site_id',
        'start',
        'finish',
        'duration',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';

      // Apply sorting
      if (validSortBy === 'barge_id') {
        qb.orderBy('bargingProblem.bargeId', sortOrder);
      } else if (validSortBy === 'activities_id') {
        qb.orderBy('bargingProblem.activitiesId', sortOrder);
      } else if (validSortBy === 'site_id') {
        qb.orderBy('bargingProblem.siteId', sortOrder);
      } else if (validSortBy === 'activity_date') {
        qb.orderBy('bargingProblem.activityDate', sortOrder);
      } else {
        qb.orderBy(`bargingProblem.${validSortBy}`, sortOrder);
      }

      const [result, total] = await qb.skip(skip).take(limit).getManyAndCount();

      // Transform result to DTO format
      const transformedResult: BargingProblemResponseDto[] = result.map((item) => ({
        id: item.id,
        activity_date: item.activityDate.toISOString(),
        shift: item.shift,
        barge_id: item.bargeId,
        barge_name: item.barge?.name || '',
        activities_id: item.activitiesId,
        activities_name: item.activities?.name || '',
        site_id: item.siteId,
        site_name: item.site?.name || null,
        start: item.start.toISOString(),
        finish: item.finish.toISOString(),
        duration: item.duration || this.calculateDuration(item.start, item.finish),
        remark: item.remark,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      return paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data barging problem berhasil diambil',
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Gagal mengambil data barging problem');
    }
  }

  async findById(id: number): Promise<ApiResponse<BargingProblemResponseDto | null>> {
    try {
      const bargingProblem = await this.bargingProblemRepository.findOne({
        where: { id, deletedAt: IsNull() },
        relations: ['barge', 'activities', 'site'],
      });

      if (!bargingProblem) {
        return emptyDataResponse('Barging problem tidak ditemukan');
      }

      const result: BargingProblemResponseDto = {
        id: bargingProblem.id,
        activity_date: bargingProblem.activityDate.toISOString(),
        shift: bargingProblem.shift,
        barge_id: bargingProblem.bargeId,
        barge_name: bargingProblem.barge?.name || '',
        activities_id: bargingProblem.activitiesId,
        activities_name: bargingProblem.activities?.name || '',
        site_id: bargingProblem.siteId,
        site_name: bargingProblem.site?.name || null,
        start: bargingProblem.start.toISOString(),
        finish: bargingProblem.finish.toISOString(),
        duration: bargingProblem.duration || this.calculateDuration(bargingProblem.start, bargingProblem.finish),
        remark: bargingProblem.remark,
        createdAt: bargingProblem.createdAt,
        updatedAt: bargingProblem.updatedAt,
      };

      return successResponse(result, 'Data barging problem berhasil diambil');
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data barging problem');
    }
  }

  async create(createDto: CreateBargingProblemDto): Promise<ApiResponse<BargingProblemResponseDto>> {
    try {
      // Validate barge_id exists
      const barge = await this.bargeRepository.findOne({
        where: { id: createDto.barge_id, deletedAt: IsNull() },
      });
      if (!barge) {
        throwError('Barge dengan ID tersebut tidak ditemukan', 400);
      }

      // Validate activities_id exists
      const activities = await this.activitiesRepository.findOne({
        where: { id: createDto.activities_id, deletedAt: IsNull() },
      });
      if (!activities) {
        throwError('Activities dengan ID tersebut tidak ditemukan', 400);
      }

      // Validate site_id exists if provided
      if (createDto.site_id) {
        const site = await this.sitesRepository.findOne({
          where: { id: createDto.site_id, deletedAt: IsNull() },
        });
        if (!site) {
          throwError('Site dengan ID tersebut tidak ditemukan', 400);
        }
      }

      // Validate start and finish dates
      const startDate = new Date(createDto.start);
      const finishDate = new Date(createDto.finish);
      
      if (startDate >= finishDate) {
        throwError('Waktu start harus lebih awal dari waktu finish', 400);
      }

      // Calculate duration
      const duration = this.calculateDuration(startDate, finishDate);

      const bargingProblem = this.bargingProblemRepository.create({
        activityDate: new Date(createDto.activity_date),
        shift: createDto.shift,
        bargeId: createDto.barge_id,
        activitiesId: createDto.activities_id,
        siteId: createDto.site_id,
        start: startDate,
        finish: finishDate,
        duration,
        remark: createDto.remark,
      });

      const savedBargingProblem = await this.bargingProblemRepository.save(bargingProblem);

      // Get the saved entity with relations for response
      const result = await this.bargingProblemRepository.findOne({
        where: { id: savedBargingProblem.id },
        relations: ['barge', 'activities', 'site'],
      });

      if (!result) {
        throw new InternalServerErrorException('Gagal mengambil data barging problem yang baru dibuat');
      }

      const response: BargingProblemResponseDto = {
        id: result.id,
        activity_date: result.activityDate.toISOString(),
        shift: result.shift,
        barge_id: result.bargeId,
        barge_name: result.barge?.name || '',
        activities_id: result.activitiesId,
        activities_name: result.activities?.name || '',
        site_id: result.siteId,
        site_name: result.site?.name || null,
        start: result.start.toISOString(),
        finish: result.finish.toISOString(),
        duration: result.duration || this.calculateDuration(result.start, result.finish),
        remark: result.remark,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(response, 'Barging problem berhasil dibuat', 201);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Gagal membuat barging problem');
    }
  }

  async update(
    id: number,
    updateDto: UpdateBargingProblemDto,
  ): Promise<ApiResponse<BargingProblemResponseDto>> {
    try {
      const existingBargingProblem = await this.bargingProblemRepository.findOne({
        where: { id, deletedAt: IsNull() },
      });

      if (!existingBargingProblem) {
        throwError('Barging problem tidak ditemukan', 404);
      }

      // Validate barge_id exists if provided
      if (updateDto.barge_id) {
        const barge = await this.bargeRepository.findOne({
          where: { id: updateDto.barge_id, deletedAt: IsNull() },
        });
        if (!barge) {
          throwError('Barge dengan ID tersebut tidak ditemukan', 400);
        }
      }

      // Validate activities_id exists if provided
      if (updateDto.activities_id) {
        const activities = await this.activitiesRepository.findOne({
          where: { id: updateDto.activities_id, deletedAt: IsNull() },
        });
        if (!activities) {
          throwError('Activities dengan ID tersebut tidak ditemukan', 400);
        }
      }

      // Validate site_id exists if provided
      if (updateDto.site_id) {
        const site = await this.sitesRepository.findOne({
          where: { id: updateDto.site_id, deletedAt: IsNull() },
        });
        if (!site) {
          throwError('Site dengan ID tersebut tidak ditemukan', 400);
        }
      }

      // Validate start and finish dates if provided
      let startDate = existingBargingProblem!.start;
      let finishDate = existingBargingProblem!.finish;

      if (updateDto.start) {
        startDate = new Date(updateDto.start);
      }
      if (updateDto.finish) {
        finishDate = new Date(updateDto.finish);
      }

      if (startDate >= finishDate) {
        throwError('Waktu start harus lebih awal dari waktu finish', 400);
      }

      // Calculate duration
      const duration = this.calculateDuration(startDate, finishDate);

      // Update fields
      if (updateDto.activity_date) {
        existingBargingProblem!.activityDate = new Date(updateDto.activity_date);
      }
      if (updateDto.shift) {
        existingBargingProblem!.shift = updateDto.shift;
      }
      if (updateDto.barge_id) {
        existingBargingProblem!.bargeId = updateDto.barge_id;
      }
      if (updateDto.activities_id) {
        existingBargingProblem!.activitiesId = updateDto.activities_id;
      }
      if (updateDto.site_id !== undefined) {
        existingBargingProblem!.siteId = updateDto.site_id;
      }
      if (updateDto.start) {
        existingBargingProblem!.start = startDate;
      }
      if (updateDto.finish) {
        existingBargingProblem!.finish = finishDate;
      }
      existingBargingProblem!.duration = duration;
      if (updateDto.remark !== undefined) {
        existingBargingProblem!.remark = updateDto.remark;
      }

      const updatedBargingProblem = await this.bargingProblemRepository.save(existingBargingProblem!);

      // Get the updated entity with relations for response
      const result = await this.bargingProblemRepository.findOne({
        where: { id: updatedBargingProblem.id },
        relations: ['barge', 'activities', 'site'],
      });

      if (!result) {
        throw new InternalServerErrorException('Gagal mengambil data barging problem yang diupdate');
      }

      const response: BargingProblemResponseDto = {
        id: result.id,
        activity_date: result.activityDate.toISOString(),
        shift: result.shift,
        barge_id: result.bargeId,
        barge_name: result.barge?.name || '',
        activities_id: result.activitiesId,
        activities_name: result.activities?.name || '',
        site_id: result.siteId,
        site_name: result.site?.name || null,
        start: result.start.toISOString(),
        finish: result.finish.toISOString(),
        duration: result.duration || this.calculateDuration(result.start, result.finish),
        remark: result.remark,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(response, 'Barging problem berhasil diupdate');
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Gagal mengupdate barging problem');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const bargingProblem = await this.bargingProblemRepository.findOne({
        where: { id, deletedAt: IsNull() },
      });

      if (!bargingProblem) {
        throwError('Barging problem tidak ditemukan', 404);
      }

      // Soft delete
      await this.bargingProblemRepository.softDelete(id);

      return successResponse(null, 'Barging problem berhasil dihapus');
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Gagal menghapus barging problem');
    }
  }

  private calculateDuration(start: Date, finish: Date): number {
    const diffMs = finish.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  }
}
