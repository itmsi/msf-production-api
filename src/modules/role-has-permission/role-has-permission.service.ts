import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleHasPermission } from './entities/role-has-permission.entity';
import { CreateRoleHasPermissionDto, UpdateRoleHasPermissionDto } from './dto/role-has-permission.dto';
import { ApiResponse, successResponse, throwError } from '../../common/helpers/response.helper';

@Injectable()
export class RoleHasPermissionService {
  constructor(
    @InjectRepository(RoleHasPermission)
    private roleHasPermissionRepository: Repository<RoleHasPermission>,
  ) {}

  async create(createRoleHasPermissionDto: CreateRoleHasPermissionDto): Promise<ApiResponse<RoleHasPermission>> {
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

      const roleHasPermission = this.roleHasPermissionRepository.create(createRoleHasPermissionDto);
      const result = await this.roleHasPermissionRepository.save(roleHasPermission);

      return successResponse(result, 'Role permission created successfully', 201);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create role permission');
    }
  }

  async findAll(): Promise<ApiResponse<RoleHasPermission[]>> {
    try {
      const result = await this.roleHasPermissionRepository.find({
        relations: ['role', 'menuHasPermission', 'permission'],
        order: { createdAt: 'DESC' },
      });

      return successResponse(result, 'Get role permissions successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch role permissions');
    }
  }

  async findOne(id: number): Promise<ApiResponse<RoleHasPermission>> {
    try {
      const roleHasPermission = await this.roleHasPermissionRepository.findOne({
        where: { id },
        relations: ['role', 'menuHasPermission', 'permission'],
      });

      if (!roleHasPermission) {
        throwError('Role permission not found', 404);
      }

      return successResponse(roleHasPermission!, 'Get role permission successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch role permission');
    }
  }

  async update(id: number, updateRoleHasPermissionDto: UpdateRoleHasPermissionDto): Promise<ApiResponse<RoleHasPermission>> {
    try {
      const roleHasPermission = await this.roleHasPermissionRepository.findOne({
        where: { id },
      });

      if (!roleHasPermission) {
        throwError('Role permission not found', 404);
      }

      // Check if new combination already exists (if being updated)
      if (updateRoleHasPermissionDto.role_id || updateRoleHasPermissionDto.mhp_id || updateRoleHasPermissionDto.permission_id) {
        const newRoleId = updateRoleHasPermissionDto.role_id || roleHasPermission!.role_id;
        const newMhpId = updateRoleHasPermissionDto.mhp_id || roleHasPermission!.mhp_id;
        const newPermissionId = updateRoleHasPermissionDto.permission_id || roleHasPermission!.permission_id;

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

      Object.assign(roleHasPermission!, updateRoleHasPermissionDto);
      const result = await this.roleHasPermissionRepository.save(roleHasPermission!);

      return successResponse(result, 'Role permission updated successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update role permission');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const roleHasPermission = await this.roleHasPermissionRepository.findOne({
        where: { id },
      });

      if (!roleHasPermission) {
        throwError('Role permission not found', 404);
      }

      await this.roleHasPermissionRepository.remove(roleHasPermission!);

      return successResponse(null, 'Role permission deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete role permission');
    }
  }

  async findByRoleId(roleId: number): Promise<ApiResponse<RoleHasPermission[]>> {
    try {
      const result = await this.roleHasPermissionRepository.find({
        where: { role_id: roleId },
        relations: ['menuHasPermission', 'permission'],
      });

      return successResponse(result, 'Get role permissions by role ID successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch role permissions by role ID');
    }
  }

  async findByPermissionId(permissionId: number): Promise<ApiResponse<RoleHasPermission[]>> {
    try {
      const result = await this.roleHasPermissionRepository.find({
        where: { permission_id: permissionId },
        relations: ['role', 'menuHasPermission'],
      });

      return successResponse(result, 'Get role permissions by permission ID successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch role permissions by permission ID');
    }
  }

  async findByMenuHasPermissionId(mhpId: number): Promise<ApiResponse<RoleHasPermission[]>> {
    try {
      const result = await this.roleHasPermissionRepository.find({
        where: { mhp_id: mhpId },
        relations: ['role', 'permission'],
      });

      return successResponse(result, 'Get role permissions by menu has permission ID successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch role permissions by menu has permission ID');
    }
  }
}
