import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiBody, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import {
  CreateRolesDto,
  GetRolesQueryDto,
  UpdateRolesDto,
  RoleListResponseDto,
  SingleRoleResponseDto,
} from './dto/roles.dto';

@ApiTags('Roles')
@ApiBearerAuth('jwt')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua data roles dengan pagination, filtering, dan sorting',
    description: `
      Endpoint ini mendukung:
      - Pagination dengan parameter page dan limit
      - Search berdasarkan position_name
      - Sorting berdasarkan field tertentu
      - Urutan sorting ASC atau DESC
    `,
  })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Nomor halaman (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Jumlah data per halaman (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search berdasarkan position_name' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field untuk sorting' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Urutan sorting' })
  @ApiResponse({
    status: 200,
    description: 'Data roles berhasil diambil',
    type: RoleListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get roles successfully',
        data: [
          {
            id: 1,
            role_code: 'ADMIN',
            position_name: 'Administrator',
            role_parent: 'SUPER_ADMIN',
            sites_id: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            sites: {
              id: 1,
              site_name: 'Jakarta Office',
              site_code: 'JKT',
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
  findAll(@Query() query: GetRolesQueryDto) {
    return this.rolesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data role berdasarkan ID',
    description: 'Mengambil data role berdasarkan ID yang diberikan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID role yang akan diambil',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data role berhasil diambil',
    type: SingleRoleResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get role successfully',
        data: {
          id: 1,
          role_code: 'ADMIN',
          position_name: 'Administrator',
          role_parent: 'SUPER_ADMIN',
          sites_id: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
          sites: {
            id: 1,
            site_name: 'Jakarta Office',
            site_code: 'JKT',
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
    description: 'Role tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Role not found',
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
    return this.rolesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat role baru',
    description: 'Membuat role baru dengan kode unik dan nama posisi. Role code dan position name harus unik dalam sistem.',
  })
  @ApiBody({
    type: CreateRolesDto,
    description: 'Data untuk membuat role baru',
    examples: {
      example1: {
        summary: 'Contoh pembuatan role dengan semua field',
        description: 'Contoh lengkap untuk membuat role baru',
        value: {
          role_code: 'ADMIN',
          position_name: 'Administrator',
          role_parent: 'SUPER_ADMIN',
          sites_id: 1,
        },
      },
      example2: {
        summary: 'Contoh pembuatan role tanpa role_parent dan sites_id',
        description: 'Contoh minimal untuk membuat role baru',
        value: {
          role_code: 'USER',
          position_name: 'Regular User',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Role berhasil dibuat',
    type: SingleRoleResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Create new role successfully',
        data: {
          id: 1,
          role_code: 'ADMIN',
          position_name: 'Administrator',
          role_parent: 'SUPER_ADMIN',
          sites_id: 1,
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
        message: 'role_code should not be empty',
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
    description: 'Role code atau position name sudah ada',
    schema: {
      example: {
        statusCode: 409,
        message: 'Role code already exists',
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
  create(@Body() dto: CreateRolesDto, @Request() req: any) {
    if (!dto.createdBy) {
      dto.createdBy = req.user?.id;
    }
    return this.rolesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data role berdasarkan ID',
    description: 'Mengupdate data role dengan validasi duplikasi role_code dan position_name',
  })
  @ApiParam({
    name: 'id',
    description: 'ID role yang akan diupdate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Role berhasil diupdate',
    type: SingleRoleResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Roles updated successfully',
        data: {
          id: 1,
          role_code: 'ADMIN_UPDATED',
          position_name: 'Administrator Updated',
          role_parent: 'SUPER_ADMIN',
          sites_id: 1,
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
    description: 'Role tidak ditemukan',
  })
  @ApiResponse({
    status: 409,
    description: 'Role code sudah digunakan oleh role lain',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRolesDto, @Request() req: any) {
    if (!dto.updatedBy) {
      dto.updatedBy = req.user?.id;
    }
    return this.rolesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data role berdasarkan ID',
    description: 'Soft delete role (marks as deleted but keeps in database)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID role yang akan dihapus',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Role berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Roles deleted successfully',
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
    description: 'Role tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const deletedBy = req.user?.id;
    return this.rolesService.remove(id, deletedBy);
  }
}
