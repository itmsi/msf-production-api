import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Permission } from './entities/permission.entity';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  GetPermissionsQueryDto,
} from './dto/permission.dto';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(
    createPermissionDto: CreatePermissionDto,
  ): Promise<ApiResponse<Permission>> {
    try {
      // Check if permission_code already exists
      const existingPermission = await this.permissionRepository.findOne({
        where: { permission_code: createPermissionDto.permission_code },
      });

      if (existingPermission) {
        throwError('Permission code already exists', 409);
      }

      const permission = this.permissionRepository.create(createPermissionDto);
      const result = await this.permissionRepository.save(permission);

      return successResponse(result, 'Permission created successfully', 201);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create permission');
    }
  }

  async findAll(
    query?: GetPermissionsQueryDto,
  ): Promise<ApiResponse<Permission[]>> {
    try {
      if (!query) {
        // Fallback untuk kompatibilitas backward
        const result = await this.permissionRepository.find({
          where: { deletedAt: null as any },
          order: { createdAt: 'DESC' },
        });
        return successResponse(result, 'Get permissions successfully');
      }

      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      const qb: SelectQueryBuilder<Permission> = this.permissionRepository
        .createQueryBuilder('permission')
        .where('permission.deletedAt IS NULL');

      // Search filter
      if (search) {
        qb.andWhere(
          '(permission.permission_name ILIKE :search OR permission.permission_code ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'permission_name',
        'permission_code',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`permission.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      const [result, total] = await qb.getManyAndCount();

      return paginateResponse(
        result,
        total,
        page,
        limit,
        'Get permissions successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch permissions');
    }
  }

  async findOne(id: number): Promise<ApiResponse<Permission | null>> {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!permission) {
        return emptyDataResponse('Permission not found', null);
      }

      return successResponse(permission, 'Get permission successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch permission');
    }
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<ApiResponse<Permission | null>> {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!permission) {
        return emptyDataResponse('Permission not found', null);
      }

      // Check if permission_code already exists (if being updated)
      if (
        updatePermissionDto.permission_code &&
        updatePermissionDto.permission_code !== permission.permission_code
      ) {
        const existingPermission = await this.permissionRepository.findOne({
          where: {
            permission_code: updatePermissionDto.permission_code,
            deletedAt: null as any,
          },
        });

        if (existingPermission) {
          throwError('Permission code already exists', 409);
        }
      }

      Object.assign(permission, updatePermissionDto);
      const result = await this.permissionRepository.save(permission);

      return successResponse(result, 'Permission updated successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update permission');
    }
  }

  async remove(id: number, deletedBy: number): Promise<ApiResponse<null>> {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!permission) {
        return emptyDataResponse('Permission not found', null);
      }

      permission.deletedAt = new Date();
      permission.deletedBy = deletedBy;
      await this.permissionRepository.save(permission);

      return successResponse(null, 'Permission deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete permission');
    }
  }

  async findByCode(permissionCode: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { permission_code: permissionCode, deletedAt: null as any },
    });
  }
}
