import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuHasPermission } from './entities/menu-has-permission.entity';
import { CreateMenuHasPermissionDto, UpdateMenuHasPermissionDto } from './dto/menu-has-permission.dto';
import { ApiResponse, successResponse, throwError } from '../../common/helpers/response.helper';

@Injectable()
export class MenuHasPermissionService {
  constructor(
    @InjectRepository(MenuHasPermission)
    private menuHasPermissionRepository: Repository<MenuHasPermission>,
  ) {}

  async create(createMenuHasPermissionDto: CreateMenuHasPermissionDto): Promise<ApiResponse<MenuHasPermission>> {
    try {
      // Check if combination already exists
      const existing = await this.menuHasPermissionRepository.findOne({
        where: {
          menu_id: createMenuHasPermissionDto.menu_id,
          permission_id: createMenuHasPermissionDto.permission_id,
        },
      });

      if (existing) {
        throwError('Menu permission combination already exists', 409);
      }

      const menuHasPermission = this.menuHasPermissionRepository.create(createMenuHasPermissionDto);
      const result = await this.menuHasPermissionRepository.save(menuHasPermission);

      return successResponse(result, 'Menu permission created successfully', 201);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create menu permission');
    }
  }

  async findAll(): Promise<ApiResponse<MenuHasPermission[]>> {
    try {
      const result = await this.menuHasPermissionRepository.find({
        relations: ['menu', 'permission'],
        order: { createdAt: 'DESC' },
      });

      return successResponse(result, 'Get menu permissions successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menu permissions');
    }
  }

  async findOne(id: number): Promise<ApiResponse<MenuHasPermission>> {
    try {
      const menuHasPermission = await this.menuHasPermissionRepository.findOne({
        where: { id },
        relations: ['menu', 'permission'],
      });

      if (!menuHasPermission) {
        throwError('Menu permission not found', 404);
      }

      return successResponse(menuHasPermission!, 'Get menu permission successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menu permission');
    }
  }

  async update(id: number, updateMenuHasPermissionDto: UpdateMenuHasPermissionDto): Promise<ApiResponse<MenuHasPermission>> {
    try {
      const menuHasPermission = await this.menuHasPermissionRepository.findOne({
        where: { id },
      });

      if (!menuHasPermission) {
        throwError('Menu permission not found', 404);
      }

      // Check if new combination already exists (if being updated)
      if (updateMenuHasPermissionDto.menu_id || updateMenuHasPermissionDto.permission_id) {
        const newMenuId = updateMenuHasPermissionDto.menu_id || menuHasPermission!.menu_id;
        const newPermissionId = updateMenuHasPermissionDto.permission_id || menuHasPermission!.permission_id;

        const existing = await this.menuHasPermissionRepository.findOne({
          where: {
            menu_id: newMenuId,
            permission_id: newPermissionId,
          },
        });

        if (existing && existing.id !== id) {
          throwError('Menu permission combination already exists', 409);
        }
      }

      Object.assign(menuHasPermission!, updateMenuHasPermissionDto);
      const result = await this.menuHasPermissionRepository.save(menuHasPermission!);

      return successResponse(result, 'Menu permission updated successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update menu permission');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const menuHasPermission = await this.menuHasPermissionRepository.findOne({
        where: { id },
      });

      if (!menuHasPermission) {
        throwError('Menu permission not found', 404);
      }

      await this.menuHasPermissionRepository.remove(menuHasPermission!);

      return successResponse(null, 'Menu permission deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete menu permission');
    }
  }

  async findByMenuId(menuId: number): Promise<ApiResponse<MenuHasPermission[]>> {
    try {
      const result = await this.menuHasPermissionRepository.find({
        where: { menu_id: menuId },
        relations: ['permission'],
      });

      return successResponse(result, 'Get menu permissions by menu ID successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menu permissions by menu ID');
    }
  }

  async findByPermissionId(permissionId: number): Promise<ApiResponse<MenuHasPermission[]>> {
    try {
      const result = await this.menuHasPermissionRepository.find({
        where: { permission_id: permissionId },
        relations: ['menu'],
      });

      return successResponse(result, 'Get menu permissions by permission ID successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menu permissions by permission ID');
    }
  }
}
