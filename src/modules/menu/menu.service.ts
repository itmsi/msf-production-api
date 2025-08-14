import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { MenuHasPermission } from '../menu-has-permission/entities/menu-has-permission.entity';
import { ApiResponse, successResponse, throwError } from '../../common/helpers/response.helper';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(MenuHasPermission)
    private menuHasPermissionRepository: Repository<MenuHasPermission>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<ApiResponse<Menu>> {
    try {
      // Check if menu_code already exists
      const existingMenu = await this.menuRepository.findOne({
        where: { menu_code: createMenuDto.menu_code },
      });

      if (existingMenu) {
        throwError('Menu code already exists', 409);
      }

      const menu = this.menuRepository.create(createMenuDto);
      const savedMenu = await this.menuRepository.save(menu);

      // Handle permissions if provided
      if (createMenuDto.permissionIds && createMenuDto.permissionIds.length > 0) {
        await this.assignPermissionsToMenu(savedMenu.id, createMenuDto.permissionIds, createMenuDto.createdBy || 0);
      }

      return successResponse(savedMenu, 'Menu created successfully', 201);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create menu');
    }
  }

  async findAll(): Promise<ApiResponse<Menu[]>> {
    try {
      const result = await this.menuRepository.find({
        where: { deletedAt: null as any },
        relations: ['children', 'menuHasPermissions', 'menuHasPermissions.permission'],
        order: { sort_order: 'ASC', createdAt: 'ASC' },
      });

      return successResponse(result, 'Get menus successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menus');
    }
  }

  async findOne(id: number): Promise<ApiResponse<Menu>> {
    try {
      const menu = await this.menuRepository.findOne({
        where: { id, deletedAt: null as any },
        relations: ['children', 'menuHasPermissions', 'menuHasPermissions.permission'],
      });

      if (!menu) {
        throwError('Menu not found', 404);
      }

      return successResponse(menu!, 'Get menu successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menu');
    }
  }

  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<ApiResponse<Menu>> {
    try {
      const menu = await this.menuRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!menu) {
        throwError('Menu not found', 404);
      }

      // Check if menu_code already exists (if being updated)
      if (updateMenuDto.menu_code && updateMenuDto.menu_code !== menu!.menu_code) {
        const existingMenu = await this.menuRepository.findOne({
          where: { menu_code: updateMenuDto.menu_code, deletedAt: null as any },
        });

        if (existingMenu) {
          throwError('Menu code already exists', 409);
        }
      }

      Object.assign(menu!, updateMenuDto);
      const updatedMenu = await this.menuRepository.save(menu!);

      // Handle permissions if provided
      if (updateMenuDto.permissionIds) {
        await this.updateMenuPermissions(id, updateMenuDto.permissionIds, updateMenuDto.updatedBy || 0);
      }

      return successResponse(updatedMenu, 'Menu updated successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update menu');
    }
  }

  async remove(id: number, deletedBy: number): Promise<ApiResponse<null>> {
    try {
      const menu = await this.menuRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!menu) {
        throwError('Menu not found', 404);
      }
      
      menu!.deletedAt = new Date();
      menu!.deletedBy = deletedBy;
      
      await this.menuRepository.save(menu!);

      return successResponse(null, 'Menu deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete menu');
    }
  }

  async findByCode(menuCode: string): Promise<Menu | null> {
    return this.menuRepository.findOne({
      where: { menu_code: menuCode, deletedAt: null as any },
    });
  }

  async getMenuTree(): Promise<ApiResponse<Menu[]>> {
    try {
      const allMenus = await this.menuRepository.find({
        where: { deletedAt: null as any, parent_id: null as any },
        relations: ['children', 'menuHasPermissions', 'menuHasPermissions.permission'],
        order: { sort_order: 'ASC' },
      });

      return successResponse(allMenus, 'Get menu tree successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menu tree');
    }
  }

  private async assignPermissionsToMenu(menuId: number, permissionIds: number[], createdBy: number): Promise<void> {
    const menuHasPermissions = permissionIds.map(permissionId => ({
      menu_id: menuId,
      permission_id: permissionId,
      createdBy,
    }));

    await this.menuHasPermissionRepository.save(menuHasPermissions);
  }

  private async updateMenuPermissions(menuId: number, permissionIds: number[], updatedBy: number): Promise<void> {
    // Remove existing permissions
    await this.menuHasPermissionRepository.delete({ menu_id: menuId });

    // Add new permissions
    if (permissionIds.length > 0) {
      await this.assignPermissionsToMenu(menuId, permissionIds, updatedBy);
    }
  }
}
