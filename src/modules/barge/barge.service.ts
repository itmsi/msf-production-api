import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Barge } from './entities/barge.entity';
import { Repository, Not } from 'typeorm';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import {
  CreateBargeDto,
  BargeResponseDto,
  GetBargesQueryDto,
  UpdateBargeDto,
} from './dto/barge.dto';

@Injectable()
export class BargeService {
  constructor(
    @InjectRepository(Barge)
    private bargeRepository: Repository<Barge>,
  ) {}

  async findById(id: number): Promise<ApiResponse<BargeResponseDto | null>> {
    try {
      const result = await this.bargeRepository.findOne({
        where: { id },
      });

      if (!result) {
        return emptyDataResponse('Barge tidak ditemukan', null);
      }

      return successResponse(result as BargeResponseDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data barge');
    }
  }

  async findAll(
    query: GetBargesQueryDto,
  ): Promise<ApiResponse<BargeResponseDto[]>> {
    try {
      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';

      const name = query.name?.toLowerCase() ?? '';
      const minCapacity = query.minCapacity ? parseInt(query.minCapacity, 10) : null;
      const maxCapacity = query.maxCapacity ? parseInt(query.maxCapacity, 10) : null;
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      const qb = this.bargeRepository
        .createQueryBuilder('barge')
        .where('barge.deletedAt IS NULL'); // Exclude soft deleted records

      // Search filter (mencari di semua field yang relevan)
      if (search) {
        qb.andWhere(
          '(barge.name ILIKE :search OR barge.remarks ILIKE :search)',
          { search: `%${search}%` },
        );
      }



      // Filter by name
      if (name) {
        qb.andWhere('barge.name ILIKE :name', {
          name: `%${name}%`,
        });
      }

      // Filter by capacity range
      if (minCapacity !== null) {
        qb.andWhere('barge.capacity >= :minCapacity', { minCapacity });
      }

      if (maxCapacity !== null) {
        qb.andWhere('barge.capacity <= :maxCapacity', { maxCapacity });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = ['id', 'name', 'capacity', 'createdAt', 'updatedAt'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`barge.${validSortBy}`, validSortOrder).skip(skip).take(limit);

      const [result, total] = await qb.getManyAndCount();

      // Transform result to DTO format
      const transformedResult = result.map((barge) => ({
        id: barge.id,
        name: barge.name,
        capacity: barge.capacity,
        remarks: barge.remarks,
        createdAt: barge.createdAt,
        createdBy: barge.createdBy,
        updatedAt: barge.updatedAt,
        updatedBy: barge.updatedBy,
      }));

      return paginateResponse(transformedResult, total, page, limit);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data barge');
    }
  }

  async create(
    createBargeDto: CreateBargeDto,
    userId: number,
  ): Promise<ApiResponse<BargeResponseDto>> {
    try {


      const barge = this.bargeRepository.create({
        ...createBargeDto,
        createdBy: userId,
        updatedBy: userId,
      });

      const result = await this.bargeRepository.save(barge);

      return successResponse(result as BargeResponseDto, 'Barge berhasil dibuat');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal membuat barge');
    }
  }

  async update(
    id: number,
    updateBargeDto: UpdateBargeDto,
    userId: number,
  ): Promise<ApiResponse<BargeResponseDto>> {
    try {
      const barge = await this.bargeRepository.findOne({
        where: { id, deletedAt: undefined },
      });

      if (!barge) {
        throwError('Barge tidak ditemukan', 404);
      }



      // Update only provided fields
      Object.assign(barge!, updateBargeDto);
      barge!.updatedBy = userId;

      const result = await this.bargeRepository.save(barge!);

      return successResponse(result as BargeResponseDto, 'Barge berhasil diupdate');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengupdate barge');
    }
  }

  async delete(id: number, userId: number): Promise<ApiResponse<null>> {
    try {
      const barge = await this.bargeRepository.findOne({
        where: { id, deletedAt: undefined },
      });

      if (!barge) {
        throwError('Barge tidak ditemukan', 404);
      }

      // Soft delete
      barge!.deletedAt = new Date();
      barge!.deletedBy = userId;

      await this.bargeRepository.save(barge!);

      return successResponse(null, 'Barge berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus barge');
    }
  }

  async restore(id: number, userId: number): Promise<ApiResponse<BargeResponseDto>> {
    try {
      const barge = await this.bargeRepository.findOne({
        where: { id, deletedAt: Not(undefined) as any },
      });

      if (!barge) {
        throwError('Barge tidak ditemukan atau tidak dalam status deleted', 404);
      }

      // Restore soft deleted barge
      barge!.deletedAt = undefined as any;
      barge!.deletedBy = undefined as any;
      barge!.updatedBy = userId;

      const result = await this.bargeRepository.save(barge!);

      return successResponse(result as BargeResponseDto, 'Barge berhasil dipulihkan');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal memulihkan barge');
    }
  }
}
