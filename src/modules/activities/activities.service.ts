import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activities } from './entities/activities.entity';
import { Repository, Not } from 'typeorm';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import {
  CreateActivitiesDto,
  ActivitiesResponseDto,
  GetActivitiesQueryDto,
  UpdateActivitiesDto,
  ActivityStatus,
} from './dto/activities.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activities)
    private activitiesRepository: Repository<Activities>,
  ) {}

  async findById(
    id: number,
  ): Promise<ApiResponse<ActivitiesResponseDto | null>> {
    try {
      const result = await this.activitiesRepository.findOne({
        where: { id },
      });

      if (!result) {
        return emptyDataResponse('Aktivitas tidak ditemukan', null);
      }

      return successResponse(result as ActivitiesResponseDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data aktivitas');
    }
  }

  async findAll(
    query: GetActivitiesQueryDto,
  ): Promise<ApiResponse<ActivitiesResponseDto[]>> {
    try {
      console.log('ActivitiesService.findAll - Query:', query);
      
      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const name = query.name?.toLowerCase() ?? '';
      const status = query.status?.toLowerCase() ?? '';
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      console.log('ActivitiesService.findAll - Parsed params:', {
        page, limit, skip, search, name, status, sortBy, sortOrder
      });

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      const qb = this.activitiesRepository
        .createQueryBuilder('activities')
        .where('activities.deletedAt IS NULL'); // Exclude soft deleted records

      // Search filter (mencari di semua field yang relevan)
      if (search) {
        qb.andWhere(
          '(activities.name ILIKE :search OR activities.status = :search)',
          {
            search: `%${search}%`,
          },
        );
      }

      // Filter by name (exact match atau partial match)
      if (name) {
        qb.andWhere('activities.name ILIKE :name', {
          name: `%${name}%`,
        });
      }

      // Filter by status
      if (status) {
        console.log('ActivitiesService.findAll - Adding status filter:', status);
        qb.andWhere('activities.status = :status', {
          status: status,
        });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'name',
        'status',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`activities.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      console.log('ActivitiesService.findAll - Query builder:', qb.getQuery());
      console.log('ActivitiesService.findAll - Query parameters:', qb.getParameters());

      const [result, total] = await qb.getManyAndCount();
      
      console.log('ActivitiesService.findAll - Result count:', result.length);
      console.log('ActivitiesService.findAll - Total count:', total);
      
      // Log sample data untuk debugging
      if (result.length > 0) {
        console.log('ActivitiesService.findAll - Sample result:', {
          id: result[0].id,
          name: result[0].name,
          status: result[0].status,
          type: typeof result[0].status
        });
      }

      // Transform result to DTO format without using plainToInstance
      const transformedResult = result.map((activity) => ({
        id: activity.id,
        name: activity.name,
        status: activity.status as ActivityStatus,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      }));

      const response = paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data aktivitas berhasil diambil',
      );

      return {
        statusCode: response.statusCode,
        message: response.message,
        data: response.data,
        meta: {
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Gagal mengambil data aktivitas');
    }
  }

  async create(
    data: CreateActivitiesDto,
  ): Promise<ApiResponse<ActivitiesResponseDto>> {
    try {
      // Set default status if not provided
      if (!data.status) {
        data.status = ActivityStatus.WORKING;
      }

      const existing = await this.activitiesRepository.findOne({
        where: { name: data.name },
      });

      if (existing) {
        throwError('Nama aktivitas sudah terdaftar', 409);
      }

      const newActivity = this.activitiesRepository.create({
        name: data.name,
        status: data.status,
      });
      
      const result = await this.activitiesRepository.save(newActivity);

      // Transform to DTO format
      const responseData: ActivitiesResponseDto = {
        id: result.id,
        name: result.name,
        status: result.status as ActivityStatus,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(responseData, 'Aktivitas berhasil dibuat');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal membuat aktivitas');
    }
  }

  async update(
    id: number,
    updateDto: UpdateActivitiesDto,
  ): Promise<ApiResponse<ActivitiesResponseDto | null>> {
    try {
      const activity = await this.activitiesRepository.findOne({
        where: { id },
      });

      if (!activity) {
        return emptyDataResponse('Aktivitas tidak ditemukan', null);
      }

      // Check if name already exists for other activities
      if (updateDto.name) {
        const existingActivity = await this.activitiesRepository.findOne({
          where: {
            name: updateDto.name,
            id: Not(id),
          },
        });

        if (existingActivity) {
          throwError(
            `Nama aktivitas ${updateDto.name} sudah digunakan oleh aktivitas lain`,
            409,
          );
        }
      }

      const updatedActivity = this.activitiesRepository.merge(
        activity,
        updateDto,
      );
      const result = await this.activitiesRepository.save(updatedActivity);

      // Transform to DTO format
      const responseData: ActivitiesResponseDto = {
        id: result.id,
        name: result.name,
        status: result.status as ActivityStatus,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(responseData, 'Aktivitas berhasil diupdate');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengupdate aktivitas');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const activity = await this.activitiesRepository.findOne({
        where: { id },
      });

      if (!activity) {
        return emptyDataResponse('Aktivitas tidak ditemukan', null);
      }

      await this.activitiesRepository.softRemove(activity);

      return successResponse(null, 'Aktivitas berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus aktivitas');
    }
  }
}
