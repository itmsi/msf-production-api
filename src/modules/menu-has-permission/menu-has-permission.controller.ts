import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
  Query,
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { MenuHasPermissionService } from './menu-has-permission.service';
import {
  CreateMenuHasPermissionDto,
  UpdateMenuHasPermissionDto,
  MenuHasPermissionResponseDto,
  GetMenuHasPermissionsQueryDto,
  MenuHasPermissionListResponseDto,
  SingleMenuHasPermissionResponseDto,
  MenuByMenuListResponseDto,
  MenuByRoleListResponseDto,
} from './dto/menu-has-permission.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Menu Has Permission')
@ApiBearerAuth('jwt')
@Controller('menu-has-permissions')
export class MenuHasPermissionController {
  constructor(
    private readonly menuHasPermissionService: MenuHasPermissionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat menu has permission baru',
    description: 'Memberikan permission kepada menu. Kombinasi menu_id dan permission_id harus unik.',
  })
  @ApiResponse({
    status: 201,
    description: 'Menu has permission berhasil dibuat',
    type: SingleMenuHasPermissionResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Menu permission created successfully',
        data: {
          id: 1,
          menu_id: 1,
          permission_id: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'menu_id should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Menu permission combination already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Menu permission combination already exists',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  create(
    @Body() createMenuHasPermissionDto: CreateMenuHasPermissionDto,
    @Request() req: any,
  ) {
    if (!createMenuHasPermissionDto.createdBy) {
      createMenuHasPermissionDto.createdBy = req.user?.id;
    }
    return this.menuHasPermissionService.create(createMenuHasPermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua data menu has permissions dengan pagination, filtering, dan sorting',
    description: `
      Endpoint ini mendukung:
      - Pagination dengan parameter page dan limit
      - Filter berdasarkan menu_id dan permission_id
      - Sorting berdasarkan field tertentu
      - Urutan sorting ASC atau DESC
    `,
  })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Nomor halaman (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Jumlah data per halaman (default: 10, max: 100)' })
  @ApiQuery({ name: 'menu_id', required: false, type: String, description: 'Filter berdasarkan menu ID' })
  @ApiQuery({ name: 'permission_id', required: false, type: String, description: 'Filter berdasarkan permission ID' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field untuk sorting' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Urutan sorting' })
  @ApiResponse({
    status: 200,
    description: 'Data menu has permissions berhasil diambil',
    type: MenuHasPermissionListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get menu permissions successfully',
        data: [
          {
            id: 1,
            menu_id: 1,
            permission_id: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            menu: {
              id: 1,
              name: 'Dashboard',
              slug: 'dashboard',
              url: '/dashboard',
              icon: 'fas fa-dashboard',
              sort_order: 1,
              module: 'dashboard',
            },
            permission: {
              id: 1,
              name: 'read',
              description: 'Read permission',
              slug: 'read',
            },
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Parameter query tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  findAll(@Query() query: GetMenuHasPermissionsQueryDto) {
    return this.menuHasPermissionService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-menu/:menuId')
  @ApiOperation({
    summary: 'Mendapatkan semua permissions berdasarkan menu ID',
    description: 'Mengambil semua permissions yang dimiliki oleh menu tertentu',
  })
  @ApiParam({
    name: 'menuId',
    description: 'ID menu yang akan dicari permissionsnya',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data menu has permissions berdasarkan menu ID berhasil diambil',
    type: MenuByMenuListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get menu permissions by menu ID successfully',
        data: [
          {
            id: 150,
            menu_id: 72,
            data_permission: [
              {
                permission_id: 1,
                permission_name: 'Create',
                has_status: true,
                mhp_id: 150,
              },
              {
                permission_id: 2,
                permission_name: 'Read',
                has_status: false,
                mhp_id: null,
              },
              {
                permission_id: 3,
                permission_name: 'Update',
                has_status: false,
                mhp_id: null,
              },
              {
                permission_id: 4,
                permission_name: 'Delete',
                has_status: true,
                mhp_id: 151,
              }
            ]
          }
        ]
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  findByMenuId(@Param('menuId', ParseIntPipe) menuId: number) {
    return this.menuHasPermissionService.findByMenuId(menuId);
  }



  @UseGuards(JwtAuthGuard)
  @Get('by-permission/:permissionId')
  @ApiOperation({
    summary: 'Mendapatkan semua menus berdasarkan permission ID',
    description: 'Mengambil semua menus yang memiliki permission tertentu',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'ID permission yang akan dicari menusnya',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data menu has permissions berdasarkan permission ID berhasil diambil',
    type: [MenuHasPermissionResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Get menu permissions by permission ID successfully',
        data: [
          {
            id: 1,
            menu_id: 1,
            permission_id: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            menu: {
              id: 1,
              name: 'Dashboard',
              slug: 'dashboard',
              url: '/dashboard',
              icon: 'fas fa-dashboard',
              sort_order: 1,
              module: 'dashboard',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  findByPermissionId(
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.menuHasPermissionService.findByPermissionId(permissionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-role/:roleId')
  @ApiOperation({
    summary: 'Mendapatkan menu permissions berdasarkan role ID',
    description: 'Mengambil menu permissions yang di-assign ke menu dengan status role untuk role tertentu. Hanya permission yang benar-benar di-assign ke menu yang ditampilkan.',
  })
  @ApiParam({
    name: 'roleId',
    description: 'ID role yang akan dicari menu permissionsnya',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data menu permissions berdasarkan role berhasil diambil',
    type: MenuByRoleListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get menu permissions successfully',
        data: [
          {
            menu_id: 1,
            menu_name: 'Dashboard',
            has_permission: [
              {
                permission_id: 1,
                permission_name: 'Create',
                role_has_status: true,
                mhp_id: 1,
              },
              {
                permission_id: 3,
                permission_name: 'Update',
                role_has_status: false,
                mhp_id: 3,
              }
            ]
          },
          {
            menu_id: 2,
            menu_name: 'Users',
            has_permission: [
              {
                permission_id: 1,
                permission_name: 'Create',
                role_has_status: true,
                mhp_id: 5,
              },
              {
                permission_id: 2,
                permission_name: 'Read',
                role_has_status: false,
                mhp_id: 6,
              }
            ]
          }
        ]
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Role ID tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  findMenuPermissionsByRole(
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.menuHasPermissionService.findMenuPermissionsByRole(roleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data menu has permission berdasarkan ID',
    description: 'Mengambil data menu has permission berdasarkan ID yang diberikan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID menu has permission yang akan diambil',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data menu has permission berhasil diambil',
    type: SingleMenuHasPermissionResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get menu permission successfully',
        data: {
          id: 1,
          menu_id: 1,
          permission_id: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
          menu: {
            id: 1,
            name: 'Dashboard',
            slug: 'dashboard',
            url: '/dashboard',
            icon: 'fas fa-dashboard',
            sort_order: 1,
            module: 'dashboard',
          },
          permission: {
            id: 1,
            name: 'read',
            description: 'Read permission',
            slug: 'read',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Menu has permission tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Menu permission not found',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuHasPermissionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data menu has permission berdasarkan ID',
    description: 'Mengupdate data menu has permission dengan validasi duplikasi kombinasi menu_id dan permission_id',
  })
  @ApiParam({
    name: 'id',
    description: 'ID menu has permission yang akan diupdate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Menu has permission berhasil diupdate',
    type: SingleMenuHasPermissionResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Menu permission updated successfully',
        data: {
          id: 1,
          menu_id: 1,
          permission_id: 2,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Menu has permission tidak ditemukan',
  })
  @ApiResponse({
    status: 409,
    description: 'Menu permission combination already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuHasPermissionDto: UpdateMenuHasPermissionDto,
    @Request() req: any,
  ) {
    if (!updateMenuHasPermissionDto.updatedBy) {
      updateMenuHasPermissionDto.updatedBy = req.user?.id;
    }
    return this.menuHasPermissionService.update(id, updateMenuHasPermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data menu has permission berdasarkan ID',
    description: 'Menghapus data menu has permission secara permanen dari database',
  })
  @ApiParam({
    name: 'id',
    description: 'ID menu has permission yang akan dihapus',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Menu has permission berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Menu permission deleted successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Menu has permission tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuHasPermissionService.remove(id);
  }
}
