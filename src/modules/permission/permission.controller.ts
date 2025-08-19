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
import { PermissionService } from './permission.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionResponseDto,
  GetPermissionsQueryDto,
  PermissionListResponseDto,
  SinglePermissionResponseDto,
} from './dto/permission.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Permission')
@ApiBearerAuth('jwt')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat permission baru',
    description: 'Membuat permission baru dengan nama dan kode yang unik. Permission code harus unik dalam sistem.',
  })
  @ApiResponse({
    status: 201,
    description: 'Permission berhasil dibuat',
    type: SinglePermissionResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Permission created successfully',
        data: {
          id: 1,
          permission_name: 'Create User',
          permission_code: 'CREATE_USER',
          description: 'Permission untuk membuat user baru',
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
        message: 'permission_name should not be empty',
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
    description: 'Permission code already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Permission code already exists',
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
    @Body() createPermissionDto: CreatePermissionDto,
    @Request() req: any,
  ) {
    if (!createPermissionDto.createdBy) {
      createPermissionDto.createdBy = req.user?.id;
    }
    return this.permissionService.create(createPermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua data permissions dengan pagination, filtering, dan sorting',
    description: `
      Endpoint ini mendukung:
      - Pagination dengan parameter page dan limit
      - Search berdasarkan permission_name atau permission_code
      - Sorting berdasarkan field tertentu
      - Urutan sorting ASC atau DESC
    `,
  })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Nomor halaman (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Jumlah data per halaman (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search berdasarkan permission_name atau permission_code' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field untuk sorting' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Urutan sorting' })
  @ApiResponse({
    status: 200,
    description: 'Data permissions berhasil diambil',
    type: PermissionListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get permissions successfully',
        data: [
          {
            id: 1,
            permission_name: 'Create User',
            permission_code: 'CREATE_USER',
            description: 'Permission untuk membuat user baru',
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
          },
          {
            id: 2,
            permission_name: 'Read User',
            permission_code: 'READ_USER',
            description: 'Permission untuk membaca data user',
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
          },
        ],
        meta: {
          total: 2,
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
  findAll(@Query() query: GetPermissionsQueryDto) {
    return this.permissionService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data permission berdasarkan ID',
    description: 'Mengambil data permission berdasarkan ID yang diberikan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID permission yang akan diambil',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data permission berhasil diambil',
    type: SinglePermissionResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get permission successfully',
        data: {
          id: 1,
          permission_name: 'Create User',
          permission_code: 'CREATE_USER',
          description: 'Permission untuk membuat user baru',
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
    description: 'Bad Request - ID tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Permission tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Permission not found',
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
    return this.permissionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data permission berdasarkan ID',
    description: 'Mengupdate data permission dengan validasi duplikasi permission_code',
  })
  @ApiParam({
    name: 'id',
    description: 'ID permission yang akan diupdate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Permission berhasil diupdate',
    type: SinglePermissionResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Permission updated successfully',
        data: {
          id: 1,
          permission_name: 'Create User Updated',
          permission_code: 'CREATE_USER',
          description: 'Permission untuk membuat user baru (updated)',
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
    description: 'Permission tidak ditemukan',
  })
  @ApiResponse({
    status: 409,
    description: 'Permission code already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Request() req: any,
  ) {
    if (!updatePermissionDto.updatedBy) {
      updatePermissionDto.updatedBy = req.user?.id;
    }
    return this.permissionService.update(id, updatePermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data permission berdasarkan ID',
    description: 'Soft delete permission (marks as deleted but keeps in database)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID permission yang akan dihapus',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Permission berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Permission deleted successfully',
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
    description: 'Permission tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const deletedBy = req.user?.id;
    return this.permissionService.remove(id, deletedBy);
  }
}
