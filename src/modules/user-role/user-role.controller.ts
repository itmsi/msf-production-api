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
import { UserRoleService } from './user-role.service';
import {
  CreateUserRoleDto,
  UpdateUserRoleDto,
  UserRoleResponseDto,
  AssignRoleDto,
  RemoveRoleDto,
  GetUserRolesQueryDto,
  UserRoleListResponseDto,
  SingleUserRoleResponseDto,
} from './dto/user-role.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('User Role')
@ApiBearerAuth('jwt')
@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat user role baru',
    description: 'Memberikan role kepada user. Kombinasi user_id dan role_id harus unik.',
  })
  @ApiResponse({
    status: 201,
    description: 'User role berhasil dibuat',
    type: SingleUserRoleResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'User role created successfully',
        data: {
          id: 1,
          user_id: 1,
          role_id: 2,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
          user: {
            id: 1,
            email: 'john@example.com',
            name: 'John Doe',
            status: 'active',
          },
          role: {
            id: 2,
            name: 'Manager',
            description: 'Manager role',
            slug: 'manager',
          },
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
        message: 'user_id should not be empty',
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
    description: 'User role combination already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'User role combination already exists',
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
  create(@Body() createUserRoleDto: CreateUserRoleDto, @Request() req: any) {
    if (!createUserRoleDto.createdBy) {
      createUserRoleDto.createdBy = req.user?.id;
    }
    return this.userRoleService.create(createUserRoleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('assign')
  @ApiOperation({
    summary: 'Memberikan role kepada user',
    description: 'Endpoint khusus untuk memberikan role kepada user. Alternative dari POST /user-roles.',
  })
  @ApiResponse({
    status: 201,
    description: 'Role berhasil diberikan kepada user',
    type: SingleUserRoleResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'User role created successfully',
        data: {
          id: 1,
          user_id: 1,
          role_id: 2,
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
    status: 409,
    description: 'User role combination already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  assignRoleToUser(
    @Body() body: AssignRoleDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id;
    return this.userRoleService.assignRoleToUser(
      body.user_id,
      body.role_id,
      createdBy,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('remove')
  @ApiOperation({
    summary: 'Mencabut role dari user',
    description: 'Menghapus role yang dimiliki oleh user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Role berhasil dicabut dari user',
    schema: {
      example: {
        statusCode: 200,
        message: 'Role removed from user successfully',
        data: null,
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
    description: 'User role combination not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User role combination not found',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  removeRoleFromUser(@Body() body: RemoveRoleDto) {
    return this.userRoleService.removeRoleFromUser(body.user_id, body.role_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua data user roles dengan pagination, filtering, dan sorting',
    description: `
      Endpoint ini mendukung:
      - Pagination dengan parameter page dan limit
      - Filter berdasarkan user_id dan role_id
      - Sorting berdasarkan field tertentu
      - Urutan sorting ASC atau DESC
    `,
  })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Nomor halaman (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Jumlah data per halaman (default: 10, max: 100)' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filter berdasarkan user ID' })
  @ApiQuery({ name: 'role_id', required: false, type: String, description: 'Filter berdasarkan role ID' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field untuk sorting' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Urutan sorting' })
  @ApiResponse({
    status: 200,
    description: 'Data user roles berhasil diambil',
    type: UserRoleListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get user roles successfully',
        data: [
          {
            id: 1,
            user_id: 1,
            role_id: 2,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            user: {
              id: 1,
              email: 'john@example.com',
              name: 'John Doe',
              status: 'active',
            },
            role: {
              id: 2,
              name: 'Manager',
              description: 'Manager role',
              slug: 'manager',
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
  findAll(@Query() query: GetUserRolesQueryDto) {
    return this.userRoleService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-user/:userId')
  @ApiOperation({
    summary: 'Mendapatkan semua roles berdasarkan user ID',
    description: 'Mengambil semua role yang dimiliki oleh user tertentu',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID user yang akan dicari rolenya',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data user roles berdasarkan user ID berhasil diambil',
    type: [UserRoleResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Get user roles by user ID successfully',
        data: [
          {
            id: 1,
            user_id: 1,
            role_id: 2,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            role: {
              id: 2,
              name: 'Manager',
              description: 'Manager role',
              slug: 'manager',
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
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.userRoleService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-role/:roleId')
  @ApiOperation({
    summary: 'Mendapatkan semua users berdasarkan role ID',
    description: 'Mengambil semua user yang memiliki role tertentu',
  })
  @ApiParam({
    name: 'roleId',
    description: 'ID role yang akan dicari usernya',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data user roles berdasarkan role ID berhasil diambil',
    type: [UserRoleResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Get user roles by role ID successfully',
        data: [
          {
            id: 1,
            user_id: 1,
            role_id: 2,
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            user: {
              id: 1,
              email: 'john@example.com',
              name: 'John Doe',
              status: 'active',
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
    return this.userRoleService.findByRoleId(roleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data user role berdasarkan ID',
    description: 'Mengambil data user role berdasarkan ID yang diberikan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID user role yang akan diambil',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data user role berhasil diambil',
    type: SingleUserRoleResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get user role successfully',
        data: {
          id: 1,
          user_id: 1,
          role_id: 2,
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
          user: {
            id: 1,
            email: 'john@example.com',
            name: 'John Doe',
            status: 'active',
          },
          role: {
            id: 2,
            name: 'Manager',
            description: 'Manager role',
            slug: 'manager',
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
    description: 'User role tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'User role not found',
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
    return this.userRoleService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data user role berdasarkan ID',
    description: 'Mengupdate data user role dengan validasi duplikasi kombinasi user_id dan role_id',
  })
  @ApiParam({
    name: 'id',
    description: 'ID user role yang akan diupdate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'User role berhasil diupdate',
    type: SingleUserRoleResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'User role updated successfully',
        data: {
          id: 1,
          user_id: 1,
          role_id: 3,
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
    description: 'User role tidak ditemukan',
  })
  @ApiResponse({
    status: 409,
    description: 'User role combination already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req: any,
  ) {
    if (!updateUserRoleDto.updatedBy) {
      updateUserRoleDto.updatedBy = req.user?.id;
    }
    return this.userRoleService.update(id, updateUserRoleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data user role berdasarkan ID',
    description: 'Menghapus data user role secara permanen dari database',
  })
  @ApiParam({
    name: 'id',
    description: 'ID user role yang akan dihapus',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'User role berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'User role deleted successfully',
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
    description: 'User role tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userRoleService.remove(id);
  }
}
