import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Department } from './entities/department.entity';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
  GetDepartmentsQueryDto,
} from './dto';
import {
  successResponse,
  emptyDataResponse,
  throwError,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import { HttpException } from '@nestjs/common';

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
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<ApiResponse<DepartmentResponseDto>> {
    try {
      // Check if department with same name already exists
      const existingDepartment = await this.departmentRepository.findOne({
        where: { name: createDepartmentDto.name },
      });

      if (existingDepartment) {
        throwError('Department dengan nama tersebut sudah ada', 409);
      }

      const department = this.departmentRepository.create(createDepartmentDto);
      const savedDepartment = await this.departmentRepository.save(department);

      const responseData: DepartmentResponseDto = {
        id: savedDepartment.id,
        name: savedDepartment.name,
        createdAt: savedDepartment.createdAt,
        updatedAt: savedDepartment.updatedAt,
      };

      return successResponse(responseData, 'Department berhasil dibuat', 201);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return throwError('Gagal membuat department', 500);
    }
  }

  async findAll(query: GetDepartmentsQueryDto): Promise<ApiResponse<DepartmentResponseDto[]>> {
    try {
      const page = parseInt(query.page?.toString() || '1', 10);
      const limit = parseInt(query.limit?.toString() || '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() || '';
      const sortBy = query.sortBy || 'id';
      const sortOrder = query.sortOrder || 'DESC';

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      const qb: SelectQueryBuilder<Department> = this.departmentRepository
        .createQueryBuilder('department')
        .where('department.deletedAt IS NULL');

      // Search filter
      if (search) {
        qb.andWhere('department.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = ['id', 'name', 'createdAt', 'updatedAt'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`department.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      const [result, total] = await qb.getManyAndCount();

      const transformedResult = result.map((department) => ({
        id: department.id,
        name: department.name,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
      }));

      return paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data department berhasil diambil',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Gagal mengambil data department');
    }
  }

  async findOne(id: number): Promise<ApiResponse<DepartmentResponseDto | null>> {
    try {
      const department = await this.departmentRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!department) {
        return emptyDataResponse('Department tidak ditemukan');
      }

      const responseData: DepartmentResponseDto = {
        id: department.id,
        name: department.name,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
      };

      return successResponse(responseData, 'Department berhasil diambil');
    } catch (error) {
      return throwError('Gagal mengambil department', 500);
    }
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<ApiResponse<DepartmentResponseDto>> {
    try {
      const department = await this.departmentRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!department) {
        throw new NotFoundException('Department tidak ditemukan');
      }

      // Check if another department with same name already exists (excluding current one)
      if (updateDepartmentDto.name) {
        const existingDepartment = await this.departmentRepository.findOne({
          where: { name: updateDepartmentDto.name },
        });

        if (existingDepartment && existingDepartment.id !== id) {
          throwError('Department dengan nama tersebut sudah ada', 409);
        }
      }

      await this.departmentRepository.update(id, updateDepartmentDto);
      
      const updatedDepartment = await this.departmentRepository.findOne({
        where: { id },
      });

      if (!updatedDepartment) {
        throw new NotFoundException('Department tidak ditemukan setelah update');
      }

      const responseData: DepartmentResponseDto = {
        id: updatedDepartment.id,
        name: updatedDepartment.name,
        createdAt: updatedDepartment.createdAt,
        updatedAt: updatedDepartment.updatedAt,
      };

      return successResponse(responseData, 'Department berhasil diperbarui');
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof HttpException) {
        throw error;
      }
      return throwError('Gagal memperbarui department', 500);
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const department = await this.departmentRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!department) {
        throw new NotFoundException('Department tidak ditemukan');
      }

      await this.departmentRepository.softDelete(id);

      return successResponse(null, 'Department berhasil dihapus');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      return throwError('Gagal menghapus department', 500);
    }
  }
}