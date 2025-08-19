import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto, UpdateMenuDto, GetMenusQueryDto } from './dto/menu.dto';
import { MenuHasPermission } from '../menu-has-permission/entities/menu-has-permission.entity';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import { MenuStatus, MenuModuleType } from './entities/menu.entity';

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
      console.log('Creating menu with data:', createMenuDto);

      // Check if menu_code already exists
      const existingMenu = await this.menuRepository.findOne({
        where: { menu_code: createMenuDto.menu_code },
      });

      if (existingMenu) {
        throwError('Menu code already exists', 409);
      }

      // Set default values if not provided
      const menuData: Partial<Menu> = {
        parent_id: createMenuDto.parent_id ?? undefined,
        menu_name: createMenuDto.menu_name,
        menu_code: createMenuDto.menu_code,
        icon: createMenuDto.icon ?? undefined,
        url: createMenuDto.url ?? undefined,
        is_parent: createMenuDto.is_parent ?? false,
        sort_order: createMenuDto.sort_order ?? 0,
        status: createMenuDto.status ?? MenuStatus.ACTIVE,
        module: createMenuDto.module ?? MenuModuleType.PRODUCTION,
        createdBy: createMenuDto.createdBy ?? undefined,
      };

      console.log('Processed menu data:', menuData);

      const menu = this.menuRepository.create(menuData);
      const savedMenu = await this.menuRepository.save(menu);

      console.log('Menu saved successfully:', savedMenu);

      // Handle permissions if provided
      if (
        createMenuDto.permissionIds &&
        createMenuDto.permissionIds.length > 0
      ) {
        console.log('Assigning permissions:', createMenuDto.permissionIds);
        await this.assignPermissionsToMenu(
          savedMenu.id,
          createMenuDto.permissionIds,
          createMenuDto.createdBy || 0,
        );
        console.log('Permissions assigned successfully');
      }

      return successResponse(savedMenu, 'Menu created successfully', 201);
    } catch (error) {
      console.error('Error creating menu:', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        `Failed to create menu: ${error.message}`,
      );
    }
  }

  async findAll(query: GetMenusQueryDto): Promise<ApiResponse<Menu[]>> {
    try {
      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const module = query.module;
      const status = query.status;
      const isParent = query.is_parent;
      const parentId = query.parent_id;
      const sortBy = query.sortBy ?? 'sort_order';
      const sortOrder = query.sortOrder ?? 'ASC';

      const qb = this.menuRepository
        .createQueryBuilder('menu')
        .leftJoinAndSelect('menu.children', 'children')
        .leftJoinAndSelect('menu.menuHasPermissions', 'menuHasPermissions')
        .leftJoinAndSelect('menuHasPermissions.permission', 'permission')
        .where('menu.deletedAt IS NULL');

      // Search filter
      if (search) {
        qb.andWhere(
          '(menu.menu_name ILIKE :search OR menu.menu_code ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Filter by module
      if (module) {
        qb.andWhere('menu.module = :module', { module });
      }

      // Filter by status
      if (status) {
        qb.andWhere('menu.status = :status', { status });
      }

      // Filter by is_parent
      if (isParent !== undefined) {
        qb.andWhere('menu.is_parent = :isParent', { isParent });
      }

      // Filter by parent_id
      if (parentId !== undefined) {
        qb.andWhere('menu.parent_id = :parentId', { parentId });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'menu_name',
        'menu_code',
        'sort_order',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'sort_order';
      const validSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

      qb.orderBy(`menu.${validSortBy}`, validSortOrder).skip(skip).take(limit);

      const [result, total] = await qb.getManyAndCount();

      return paginateResponse(
        result,
        total,
        page,
        limit,
        'Get menus successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menus');
    }
  }

  async findOne(id: number): Promise<ApiResponse<Menu | null>> {
    try {
      const menu = await this.menuRepository.findOne({
        where: { id, deletedAt: null as any },
        relations: [
          'children',
          'menuHasPermissions',
          'menuHasPermissions.permission',
        ],
      });

      if (!menu) {
        return emptyDataResponse('Menu not found', null);
      }

      return successResponse(menu, 'Get menu successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menu');
    }
  }

  async update(
    id: number,
    updateMenuDto: UpdateMenuDto,
  ): Promise<ApiResponse<Menu | null>> {
    try {
      const menu = await this.menuRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!menu) {
        return emptyDataResponse('Menu not found', null);
      }

      // Check if menu_code already exists (if being updated)
      if (
        updateMenuDto.menu_code &&
        updateMenuDto.menu_code !== menu.menu_code
      ) {
        const existingMenu = await this.menuRepository.findOne({
          where: { menu_code: updateMenuDto.menu_code, deletedAt: null as any },
        });

        if (existingMenu) {
          throwError('Menu code already exists', 409);
        }
      }

      Object.assign(menu, updateMenuDto);
      const updatedMenu = await this.menuRepository.save(menu);

      // Handle permissions if provided
      if (updateMenuDto.permissionIds) {
        await this.updateMenuPermissions(
          id,
          updateMenuDto.permissionIds,
          updateMenuDto.updatedBy || 0,
        );
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
        return emptyDataResponse('Menu not found', null);
      }

      menu.deletedAt = new Date();
      menu.deletedBy = deletedBy;

      await this.menuRepository.save(menu);

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
        relations: [
          'children',
          'menuHasPermissions',
          'menuHasPermissions.permission',
        ],
        order: { sort_order: 'ASC' },
      });

      return successResponse(allMenus, 'Get menu tree successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menu tree');
    }
  }

  async findByModule(module: string): Promise<ApiResponse<Menu[]>> {
    try {
      const menus = await this.menuRepository.find({
        where: { module: module as any, deletedAt: null as any },
        relations: [
          'children',
          'menuHasPermissions',
          'menuHasPermissions.permission',
        ],
        order: { sort_order: 'ASC', createdAt: 'ASC' },
      });

      return successResponse(
        menus,
        `Get menus for module ${module} successfully`,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menus by module');
    }
  }

  async getMenuTreeByModule(module: string): Promise<ApiResponse<Menu[]>> {
    try {
      const allMenus = await this.menuRepository.find({
        where: {
          module: module as any,
          deletedAt: null as any,
          parent_id: null as any,
        },
        relations: [
          'children',
          'menuHasPermissions',
          'menuHasPermissions.permission',
        ],
        order: { sort_order: 'ASC' },
      });

      return successResponse(
        allMenus,
        `Get menu tree for module ${module} successfully`,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch menu tree by module',
      );
    }
  }

  private async assignPermissionsToMenu(
    menuId: number,
    permissionIds: number[],
    createdBy: number,
  ): Promise<void> {
    const menuHasPermissions = permissionIds.map((permissionId) => ({
      menu_id: menuId,
      permission_id: permissionId,
      createdBy,
    }));

    await this.menuHasPermissionRepository.save(menuHasPermissions);
  }

  private async updateMenuPermissions(
    menuId: number,
    permissionIds: number[],
    updatedBy: number,
  ): Promise<void> {
    // Remove existing permissions
    await this.menuHasPermissionRepository.delete({ menu_id: menuId });

    // Add new permissions
    if (permissionIds.length > 0) {
      await this.assignPermissionsToMenu(menuId, permissionIds, updatedBy);
    }
  }
}
