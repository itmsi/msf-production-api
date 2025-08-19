import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RoleHasPermission } from './entities/role-has-permission.entity';
import {
  CreateRoleHasPermissionDto,
  UpdateRoleHasPermissionDto,
  GetRoleHasPermissionsQueryDto,
} from './dto/role-has-permission.dto';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';

@Injectable()
export class RoleHasPermissionService {
  constructor(
    @InjectRepository(RoleHasPermission)
    private roleHasPermissionRepository: Repository<RoleHasPermission>,
  ) {}

  async create(
    createRoleHasPermissionDto: CreateRoleHasPermissionDto,
  ): Promise<ApiResponse<RoleHasPermission>> {
    try {
      // Check if combination already exists
      const existing = await this.roleHasPermissionRepository.findOne({
        where: {
          role_id: createRoleHasPermissionDto.role_id,
          mhp_id: createRoleHasPermissionDto.mhp_id,
          permission_id: createRoleHasPermissionDto.permission_id,
        },
      });

      if (existing) {
        throwError('Role permission combination already exists', 409);
      }

      const roleHasPermission = this.roleHasPermissionRepository.create(
        createRoleHasPermissionDto,
      );
      const result =
        await this.roleHasPermissionRepository.save(roleHasPermission);

      return successResponse(
        result,
        'Role permission created successfully',
        201,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to create role permission',
      );
    }
  }

  async findAll(query?: GetRoleHasPermissionsQueryDto): Promise<ApiResponse<RoleHasPermission[]>> {
    try {
      if (!query) {
        // Fallback untuk kompatibilitas backward
        const result = await this.roleHasPermissionRepository.find({
          relations: ['role', 'menuHasPermission', 'permission'],
          order: { createdAt: 'DESC' },
        });
        return successResponse(result, 'Get role permissions successfully');
      }

      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const role_id = query.role_id ? parseInt(query.role_id, 10) : null;
      const mhp_id = query.mhp_id ? parseInt(query.mhp_id, 10) : null;
      const permission_id = query.permission_id ? parseInt(query.permission_id, 10) : null;
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      const qb: SelectQueryBuilder<RoleHasPermission> = this.roleHasPermissionRepository
        .createQueryBuilder('rhp')
        .leftJoinAndSelect('rhp.role', 'role')
        .leftJoinAndSelect('rhp.menuHasPermission', 'menuHasPermission')
        .leftJoinAndSelect('rhp.permission', 'permission');

      // Filter by role_id
      if (role_id) {
        qb.andWhere('rhp.role_id = :role_id', { role_id });
      }

      // Filter by mhp_id
      if (mhp_id) {
        qb.andWhere('rhp.mhp_id = :mhp_id', { mhp_id });
      }

      // Filter by permission_id
      if (permission_id) {
        qb.andWhere('rhp.permission_id = :permission_id', { permission_id });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'role_id',
        'mhp_id',
        'permission_id',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`rhp.${validSortBy}`, validSortOrder).skip(skip).take(limit);

      const [result, total] = await qb.getManyAndCount();

      return paginateResponse(
        result,
        total,
        page,
        limit,
        'Get role permissions successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch role permissions',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<RoleHasPermission | null>> {
    try {
      const roleHasPermission = await this.roleHasPermissionRepository.findOne({
        where: { id },
        relations: ['role', 'menuHasPermission', 'permission'],
      });

      if (!roleHasPermission) {
        return emptyDataResponse('Role permission not found', null);
      }

      return successResponse(
        roleHasPermission,
        'Get role permission successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch role permission');
    }
  }

  async update(
    id: number,
    updateRoleHasPermissionDto: UpdateRoleHasPermissionDto,
  ): Promise<ApiResponse<RoleHasPermission | null>> {
    try {
      const roleHasPermission = await this.roleHasPermissionRepository.findOne({
        where: { id },
      });

      if (!roleHasPermission) {
        return emptyDataResponse('Role permission not found', null);
      }

      // Check if new combination already exists (if being updated)
      if (
        updateRoleHasPermissionDto.role_id ||
        updateRoleHasPermissionDto.mhp_id ||
        updateRoleHasPermissionDto.permission_id
      ) {
        const newRoleId =
          updateRoleHasPermissionDto.role_id || roleHasPermission.role_id;
        const newMhpId =
          updateRoleHasPermissionDto.mhp_id || roleHasPermission.mhp_id;
        const newPermissionId =
          updateRoleHasPermissionDto.permission_id ||
          roleHasPermission.permission_id;

        const existing = await this.roleHasPermissionRepository.findOne({
          where: {
            role_id: newRoleId,
            mhp_id: newMhpId,
            permission_id: newPermissionId,
          },
        });

        if (existing && existing.id !== id) {
          throwError('Role permission combination already exists', 409);
        }
      }

      Object.assign(roleHasPermission, updateRoleHasPermissionDto);
      const result =
        await this.roleHasPermissionRepository.save(roleHasPermission);

      return successResponse(result, 'Role permission updated successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to update role permission',
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const roleHasPermission = await this.roleHasPermissionRepository.findOne({
        where: { id },
      });

      if (!roleHasPermission) {
        return emptyDataResponse('Role permission not found', null);
      }

      await this.roleHasPermissionRepository.remove(roleHasPermission);

      return successResponse(null, 'Role permission deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to delete role permission',
      );
    }
  }

  async findByRoleId(
    roleId: number,
  ): Promise<ApiResponse<RoleHasPermission[]>> {
    try {
      const result = await this.roleHasPermissionRepository.find({
        where: { role_id: roleId },
        relations: ['menuHasPermission', 'permission'],
      });

      return successResponse(
        result,
        'Get role permissions by role ID successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch role permissions by role ID',
      );
    }
  }

  async findByPermissionId(
    permissionId: number,
  ): Promise<ApiResponse<RoleHasPermission[]>> {
    try {
      const result = await this.roleHasPermissionRepository.find({
        where: { permission_id: permissionId },
        relations: ['role', 'menuHasPermission'],
      });

      return successResponse(
        result,
        'Get role permissions by permission ID successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch role permissions by permission ID',
      );
    }
  }

  async findByMenuHasPermissionId(
    mhpId: number,
  ): Promise<ApiResponse<RoleHasPermission[]>> {
    try {
      const result = await this.roleHasPermissionRepository.find({
        where: { mhp_id: mhpId },
        relations: ['role', 'permission'],
      });

      return successResponse(
        result,
        'Get role permissions by menu has permission ID successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch role permissions by menu has permission ID',
      );
    }
  }
}
