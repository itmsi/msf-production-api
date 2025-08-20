import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, IsNull } from 'typeorm';
import { MenuHasPermission } from './entities/menu-has-permission.entity';
import { Permission } from '../permission/entities/permission.entity';
import { Menu } from '../menu/entities/menu.entity';
import { RoleHasPermission } from '../role-has-permission/entities/role-has-permission.entity';
import {
  CreateMenuHasPermissionDto,
  UpdateMenuHasPermissionDto,
  GetMenuHasPermissionsQueryDto,
} from './dto/menu-has-permission.dto';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';

@Injectable()
export class MenuHasPermissionService {
  constructor(
    @InjectRepository(MenuHasPermission)
    private menuHasPermissionRepository: Repository<MenuHasPermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(RoleHasPermission)
    private roleHasPermissionRepository: Repository<RoleHasPermission>,
  ) {}

  async create(
    createMenuHasPermissionDto: CreateMenuHasPermissionDto,
  ): Promise<ApiResponse<MenuHasPermission>> {
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

      const menuHasPermission = this.menuHasPermissionRepository.create(
        createMenuHasPermissionDto,
      );
      const result =
        await this.menuHasPermissionRepository.save(menuHasPermission);

      return successResponse(
        result,
        'Menu permission created successfully',
        201,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to create menu permission',
      );
    }
  }

  async findAll(query?: GetMenuHasPermissionsQueryDto): Promise<ApiResponse<MenuHasPermission[]>> {
    try {
      if (!query) {
        // Fallback untuk kompatibilitas backward
        const result = await this.menuHasPermissionRepository.find({
          relations: ['menu', 'permission'],
          order: { createdAt: 'DESC' },
        });
        return successResponse(result, 'Get menu permissions successfully');
      }

      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const menu_id = query.menu_id ? parseInt(query.menu_id, 10) : null;
      const permission_id = query.permission_id ? parseInt(query.permission_id, 10) : null;
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      const qb: SelectQueryBuilder<MenuHasPermission> = this.menuHasPermissionRepository
        .createQueryBuilder('mhp')
        .leftJoinAndSelect('mhp.menu', 'menu')
        .leftJoinAndSelect('mhp.permission', 'permission');

      // Filter by menu_id
      if (menu_id) {
        qb.andWhere('mhp.menu_id = :menu_id', { menu_id });
      }

      // Filter by permission_id
      if (permission_id) {
        qb.andWhere('mhp.permission_id = :permission_id', { permission_id });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'menu_id',
        'permission_id',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`mhp.${validSortBy}`, validSortOrder).skip(skip).take(limit);

      const [result, total] = await qb.getManyAndCount();

      return paginateResponse(
        result,
        total,
        page,
        limit,
        'Get menu permissions successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch menu permissions',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<MenuHasPermission | null>> {
    try {
      const menuHasPermission = await this.menuHasPermissionRepository.findOne({
        where: { id },
        relations: ['menu', 'permission'],
      });

      if (!menuHasPermission) {
        return emptyDataResponse('Menu permission not found', null);
      }

      return successResponse(
        menuHasPermission,
        'Get menu permission successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch menu permission');
    }
  }

  async update(
    id: number,
    updateMenuHasPermissionDto: UpdateMenuHasPermissionDto,
  ): Promise<ApiResponse<MenuHasPermission | null>> {
    try {
      const menuHasPermission = await this.menuHasPermissionRepository.findOne({
        where: { id },
      });

      if (!menuHasPermission) {
        return emptyDataResponse('Menu permission not found', null);
      }

      // Check if new combination already exists (if being updated)
      if (
        updateMenuHasPermissionDto.menu_id ||
        updateMenuHasPermissionDto.permission_id
      ) {
        const newMenuId =
          updateMenuHasPermissionDto.menu_id || menuHasPermission.menu_id;
        const newPermissionId =
          updateMenuHasPermissionDto.permission_id ||
          menuHasPermission.permission_id;

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

      Object.assign(menuHasPermission, updateMenuHasPermissionDto);
      const result =
        await this.menuHasPermissionRepository.save(menuHasPermission);

      return successResponse(result, 'Menu permission updated successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to update menu permission',
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const menuHasPermission = await this.menuHasPermissionRepository.findOne({
        where: { id },
      });

      if (!menuHasPermission) {
        return emptyDataResponse('Menu permission not found', null);
      }

      await this.menuHasPermissionRepository.remove(menuHasPermission);

      return successResponse(null, 'Menu permission deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to delete menu permission',
      );
    }
  }

  async findByMenuId(
    menuId: number,
  ): Promise<ApiResponse<any>> {
    try {
      // Ambil semua permissions dari tabel m_permission
      const allPermissions = await this.permissionRepository.find({
        where: { deletedAt: IsNull() },
        order: { id: 'ASC' },
      });

      // Ambil menu has permissions yang sudah ada untuk menu ini
      const existingMenuPermissions = await this.menuHasPermissionRepository.find({
        where: { menu_id: menuId },
        relations: ['permission'],
      });

      // Buat map untuk permission yang sudah ada
      const existingPermissionMap = new Map();
      existingMenuPermissions.forEach(mhp => {
        existingPermissionMap.set(mhp.permission_id, true);
      });

      // Buat response data dengan format yang diminta
      const dataPermissions = allPermissions.map(permission => ({
        permission_id: permission.id,
        permission_name: permission.permission_name,
        has_status: existingPermissionMap.has(permission.id),
      }));

      const responseData = {
        id: existingMenuPermissions[0]?.id || null,
        menu_id: menuId,
        data_permission: dataPermissions,
      };

      return successResponse(
        [responseData],
        'Get menu permissions by menu ID successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch menu permissions by menu ID',
      );
    }
  }

  async findByPermissionId(
    permissionId: number,
  ): Promise<ApiResponse<MenuHasPermission[]>> {
    try {
      const result = await this.menuHasPermissionRepository.find({
        where: { permission_id: permissionId },
        relations: ['menu'],
      });

      return successResponse(
        result,
        'Get menu permissions by permission ID successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch menu permissions by permission ID',
      );
    }
  }

  async findMenuPermissionsByRole(roleId: number): Promise<ApiResponse<any>> {
    try {
      // Ambil semua menus
      const allMenus = await this.menuRepository.find({
        where: { deletedAt: IsNull() },
        order: { id: 'ASC' },
      });

      // Ambil role has permissions untuk role tertentu
      const rolePermissions = await this.roleHasPermissionRepository.find({
        where: { role_id: roleId },
      });

      // Buat map untuk permission yang dimiliki role
      const rolePermissionMap = new Map();
      rolePermissions.forEach(rhp => {
        rolePermissionMap.set(rhp.permission_id, true);
      });

      // Buat response data
      const responseData = await Promise.all(allMenus.map(async (menu) => {
        // Ambil menu has permissions yang benar-benar ada untuk menu ini
        const menuHasPermissions = await this.menuHasPermissionRepository.find({
          where: { menu_id: menu.id },
          relations: ['permission'],
          order: { permission_id: 'ASC' },
        });

        // Buat array permissions yang hanya berisi permission yang di-assign ke menu
        const menuPermissions = menuHasPermissions.map(mhp => ({
          permission_id: mhp.permission_id,
          permission_name: mhp.permission.permission_name,
          role_has_status: rolePermissionMap.has(mhp.permission_id),
          mhp_id: mhp.id, // Selalu ada value karena diambil dari r_menu_has_permission
        }));

        return {
          menu_id: menu.id,
          menu_name: menu.menu_name,
          has_permission: menuPermissions,
        };
      }));

      return successResponse(
        responseData,
        'Get menu permissions successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch menu permissions by role',
      );
    }
  }
}
