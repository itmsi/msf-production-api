import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { ApiResponse, successResponse, throwError } from '../../common/helpers/response.helper';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<ApiResponse<Permission>> {
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

  async findAll(): Promise<ApiResponse<Permission[]>> {
    try {
      const result = await this.permissionRepository.find({
        where: { deletedAt: null as any },
        order: { createdAt: 'DESC' },
      });

      return successResponse(result, 'Get permissions successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch permissions');
    }
  }

  async findOne(id: number): Promise<ApiResponse<Permission>> {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!permission) {
        throwError('Permission not found', 404);
      }

      return successResponse(permission!, 'Get permission successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch permission');
    }
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<ApiResponse<Permission>> {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!permission) {
        throwError('Permission not found', 404);
      }

      // Check if permission_code already exists (if being updated)
      if (updatePermissionDto.permission_code && updatePermissionDto.permission_code !== permission!.permission_code) {
        const existingPermission = await this.permissionRepository.findOne({
          where: { permission_code: updatePermissionDto.permission_code, deletedAt: null as any },
        });

        if (existingPermission) {
          throwError('Permission code already exists', 409);
        }
      }

      Object.assign(permission!, updatePermissionDto);
      const result = await this.permissionRepository.save(permission!);

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
        throwError('Permission not found', 404);
      }
      
      permission!.deletedAt = new Date();
      permission!.deletedBy = deletedBy;
      
      await this.permissionRepository.save(permission!);

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
