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
  ApiQuery,
} from '@nestjs/swagger';
import { RoleHasPermissionService } from './role-has-permission.service';
import {
  CreateRoleHasPermissionDto,
  UpdateRoleHasPermissionDto,
  RoleHasPermissionResponseDto,
  GetRoleHasPermissionsQueryDto,
  RoleHasPermissionListResponseDto,
  SingleRoleHasPermissionResponseDto,
} from './dto/role-has-permission.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Role Has Permission')
@ApiBearerAuth('jwt')
@Controller('role-has-permissions')
export class RoleHasPermissionController {
  constructor(
    private readonly roleHasPermissionService: RoleHasPermissionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat role has permission baru',
    description:
      'Memberikan permission kepada role untuk menu tertentu. Kombinasi role_id, mhp_id, dan permission_id harus unik.',
  })
  @ApiResponse({
    status: 201,
    description: 'Role has permission berhasil dibuat',
    type: SingleRoleHasPermissionResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Role permission created successfully',
        data: {
          id: 1,
          role_id: 1,
          mhp_id: 1,
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
        message: 'role_id should not be empty',
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
    description: 'Role permission combination already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Role permission combination already exists',
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
    @Body() createRoleHasPermissionDto: CreateRoleHasPermissionDto,
    @Request() req: any,
  ) {
    if (!createRoleHasPermissionDto.createdBy) {
      createRoleHasPermissionDto.createdBy = req.user?.id;
    }
    return this.roleHasPermissionService.create(createRoleHasPermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan semua data role has permissions dengan pagination, filtering, dan sorting',
    description: `
      Endpoint ini mendukung:
      - Pagination dengan parameter page dan limit
      - Filter berdasarkan role_id, mhp_id, dan permission_id
      - Sorting berdasarkan field tertentu
      - Urutan sorting ASC atau DESC
    `,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Nomor halaman (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Jumlah data per halaman (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'role_id',
    required: false,
    type: String,
    description: 'Filter berdasarkan role ID',
  })
  @ApiQuery({
    name: 'mhp_id',
    required: false,
    type: String,
    description: 'Filter berdasarkan menu has permission ID',
  })
  @ApiQuery({
    name: 'permission_id',
    required: false,
    type: String,
    description: 'Filter berdasarkan permission ID',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field untuk sorting',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Urutan sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Data role has permissions berhasil diambil',
    type: RoleHasPermissionListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get role permissions successfully',
        data: [
          {
            id: 1,
            role_id: 1,
            mhp_id: 1,
            permission_id: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            role: {
              id: 1,
              name: 'Admin',
              description: 'Administrator role',
              slug: 'admin',
            },
            menuHasPermission: {
              id: 1,
              menu_id: 1,
              permission_id: 1,
              menu_name: 'Dashboard',
              permission_name: 'read',
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
  findAll(@Query() query: GetRoleHasPermissionsQueryDto) {
    return this.roleHasPermissionService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-role/:roleId')
  @ApiOperation({
    summary: 'Mendapatkan semua permissions berdasarkan role ID',
    description: 'Mengambil semua permissions yang dimiliki oleh role tertentu',
  })
  @ApiParam({
    name: 'roleId',
    description: 'ID role yang akan dicari permissionsnya',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description:
      'Data role has permissions berdasarkan role ID berhasil diambil',
    type: [RoleHasPermissionResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Get role permissions by role ID successfully',
        data: [
          {
            id: 1,
            role_id: 1,
            mhp_id: 1,
            permission_id: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            menuHasPermission: {
              id: 1,
              menu_id: 1,
              permission_id: 1,
              menu_name: 'Dashboard',
              permission_name: 'read',
            },
            permission: {
              id: 1,
              name: 'read',
              description: 'Read permission',
              slug: 'read',
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
  findByRoleId(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.roleHasPermissionService.findByRoleId(roleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-permission/:permissionId')
  @ApiOperation({
    summary: 'Mendapatkan semua roles berdasarkan permission ID',
    description: 'Mengambil semua roles yang memiliki permission tertentu',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'ID permission yang akan dicari rolesnya',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description:
      'Data role has permissions berdasarkan permission ID berhasil diambil',
    type: [RoleHasPermissionResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Get role permissions by permission ID successfully',
        data: [
          {
            id: 1,
            role_id: 1,
            mhp_id: 1,
            permission_id: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            role: {
              id: 1,
              name: 'Admin',
              description: 'Administrator role',
              slug: 'admin',
            },
            menuHasPermission: {
              id: 1,
              menu_id: 1,
              permission_id: 1,
              menu_name: 'Dashboard',
              permission_name: 'read',
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
    return this.roleHasPermissionService.findByPermissionId(permissionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-menu-has-permission/:mhpId')
  @ApiOperation({
    summary: 'Mendapatkan semua roles berdasarkan menu has permission ID',
    description:
      'Mengambil semua roles yang memiliki permission untuk menu tertentu',
  })
  @ApiParam({
    name: 'mhpId',
    description: 'ID menu has permission yang akan dicari rolesnya',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description:
      'Data role has permissions berdasarkan menu has permission ID berhasil diambil',
    type: [RoleHasPermissionResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Get role permissions by menu has permission ID successfully',
        data: [
          {
            id: 1,
            role_id: 1,
            mhp_id: 1,
            permission_id: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            role: {
              id: 1,
              name: 'Admin',
              description: 'Administrator role',
              slug: 'admin',
            },
            permission: {
              id: 1,
              name: 'read',
              description: 'Read permission',
              slug: 'read',
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
  findByMenuHasPermissionId(@Param('mhpId', ParseIntPipe) mhpId: number) {
    return this.roleHasPermissionService.findByMenuHasPermissionId(mhpId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data role has permission berdasarkan ID',
    description:
      'Mengambil data role has permission berdasarkan ID yang diberikan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID role has permission yang akan diambil',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data role has permission berhasil diambil',
    type: SingleRoleHasPermissionResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get role permission successfully',
        data: {
          id: 1,
          role_id: 1,
          mhp_id: 1,
          permission_id: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
          role: {
            id: 1,
            name: 'Admin',
            description: 'Administrator role',
            slug: 'admin',
          },
          menuHasPermission: {
            id: 1,
            menu_id: 1,
            permission_id: 1,
            menu_name: 'Dashboard',
            permission_name: 'read',
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
    description: 'Role has permission tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Role permission not found',
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
    return this.roleHasPermissionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data role has permission berdasarkan ID',
    description:
      'Mengupdate data role has permission dengan validasi duplikasi kombinasi role_id, mhp_id, dan permission_id',
  })
  @ApiParam({
    name: 'id',
    description: 'ID role has permission yang akan diupdate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Role has permission berhasil diupdate',
    type: SingleRoleHasPermissionResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Role permission updated successfully',
        data: {
          id: 1,
          role_id: 1,
          mhp_id: 2,
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
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Role has permission tidak ditemukan',
  })
  @ApiResponse({
    status: 409,
    description: 'Role permission combination already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleHasPermissionDto: UpdateRoleHasPermissionDto,
    @Request() req: any,
  ) {
    if (!updateRoleHasPermissionDto.updatedBy) {
      updateRoleHasPermissionDto.updatedBy = req.user?.id;
    }
    return this.roleHasPermissionService.update(id, updateRoleHasPermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data role has permission berdasarkan ID',
    description:
      'Menghapus data role has permission secara permanen dari database',
  })
  @ApiParam({
    name: 'id',
    description: 'ID role has permission yang akan dihapus',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Role has permission berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Role permission deleted successfully',
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
    description: 'Role has permission tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleHasPermissionService.remove(id);
  }
}
