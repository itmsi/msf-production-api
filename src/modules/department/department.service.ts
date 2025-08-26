import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Department } from './entities/department.entity';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
  GetDepartmentsQueryDto,
} from './dto/department.dto';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<ApiResponse<DepartmentResponseDto>> {
    try {
      // Check if department name already exists
      const existingDepartment = await this.departmentRepository.findOne({
        where: { name: createDepartmentDto.name },
      });

      if (existingDepartment) {
        throwError('Department name already exists', 409);
      }

      const department = this.departmentRepository.create(createDepartmentDto);
      const result = await this.departmentRepository.save(department);

      const response: DepartmentResponseDto = {
        id: result.id,
        name: result.name,
        description: result.description,
        createdAt: result.createdAt!,
        updatedAt: result.updatedAt!,
      };

      return successResponse(response, 'Department created successfully', 201);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create department');
    }
  }

  async findAll(
    query: GetDepartmentsQueryDto,
  ): Promise<ApiResponse<DepartmentResponseDto[]>> {
    try {
      const page = parseInt(query.page || '1', 10);
      const limit = parseInt(query.limit || '10', 10);
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

      if (search) {
        qb.andWhere(
          '(department.name ILIKE :search OR department.description ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'name',
        'description',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`department.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      const [result, total] = await qb.getManyAndCount();

      const transformedResult = result.map((department) => ({
        id: department.id,
        name: department.name,
        description: department.description,
        createdAt: department.createdAt!,
        updatedAt: department.updatedAt!,
      }));

      return paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Get departments successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch departments');
    }
  }

  async findOne(id: number): Promise<ApiResponse<DepartmentResponseDto | null>> {
    try {
      const department = await this.departmentRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!department) {
        return emptyDataResponse('Department not found', null);
      }

      const response: DepartmentResponseDto = {
        id: department.id,
        name: department.name,
        description: department.description,
        createdAt: department.createdAt!,
        updatedAt: department.updatedAt!,
      };

      return successResponse(response, 'Get department successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch department');
    }
  }

  async update(
    id: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<ApiResponse<DepartmentResponseDto | null>> {
    try {
      const department = await this.departmentRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!department) {
        return emptyDataResponse('Department not found', null);
      }

      // Check if department name already exists (if being updated)
      if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
        const existingDepartment = await this.departmentRepository.findOne({
          where: { name: updateDepartmentDto.name, deletedAt: null as any },
        });

        if (existingDepartment) {
          throwError('Department name already exists', 409);
        }
      }

      Object.assign(department, updateDepartmentDto);
      const result = await this.departmentRepository.save(department);

      const response: DepartmentResponseDto = {
        id: result.id,
        name: result.name,
        description: result.description,
        createdAt: result.createdAt!,
        updatedAt: result.updatedAt!,
      };

      return successResponse(response, 'Department updated successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update department');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const department = await this.departmentRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!department) {
        return emptyDataResponse('Department not found', null);
      }

      await this.departmentRepository.softDelete(id);

      return successResponse(null, 'Department deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete department');
    }
  }

  async findByName(name: string): Promise<Department | null> {
    return this.departmentRepository.findOne({
      where: { name, deletedAt: null as any },
    });
  }
}
