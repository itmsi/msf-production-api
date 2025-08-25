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
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  CreateUserDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UserListResponseDto,
  SingleUserResponseDto,
} from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth('jwt')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan semua data users dengan pagination, filtering, dan sorting',
    description: `
      Endpoint ini mendukung:
      - Pagination dengan parameter page dan limit
      - Search berdasarkan username, email, atau nama employee
      - Filter berdasarkan role code
      - Sorting berdasarkan field tertentu
      - Urutan sorting ASC atau DESC
    `,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term untuk username, email, atau nama employee',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    type: String,
    description: 'Filter berdasarkan role code',
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
    description: 'Data users berhasil diambil',
    type: UserListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get users successfully',
        data: [
          {
            id: 1,
            username: 'usertest',
            email: 'john@example.com',
            isActive: true,
            employee_id: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            roles: [
              {
                id: 1,
                role_code: 'ADMIN',
                position_name: 'Administrator',
              },
            ],
            employees: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@company.com',
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
  findAll(@Query() query: GetUsersQueryDto) {
    const page = query.page || '1';
    const limit = query.limit || '10';
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.usersService.findAll(
      pageNum,
      limitNum,
      query.search,
      query.role,
      query.sortBy,
      query.sortOrder,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data user berdasarkan ID',
    description: 'Mengambil data user berdasarkan ID yang diberikan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID user yang akan diambil',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data user berhasil diambil',
    type: SingleUserResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'User found successfully',
        data: {
          id: 1,
          username: 'usertest',
          email: 'john@example.com',
          isActive: true,
          employee_id: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          roles: [
            {
              id: 1,
              role_code: 'ADMIN',
              position_name: 'Administrator',
            },
          ],
          employees: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
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
    description: 'User tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
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
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat user baru',
    description:
      'Membuat user baru dengan username dan email yang unik. Password akan di-hash secara otomatis.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Data untuk membuat user baru',
    examples: {
      example1: {
        summary: 'Contoh pembuatan user dengan semua field',
        description: 'Contoh lengkap untuk membuat user baru',
        value: {
          username: 'usertest',
          password: 'password123',
          email: 'john@example.com',
          roleId: 1,
          employee_id: 1,
        },
      },
      example2: {
        summary: 'Contoh pembuatan user tanpa employee_id',
        description: 'Contoh minimal untuk membuat user baru',
        value: {
          username: 'user2',
          password: 'password123',
          email: 'user2@example.com',
          roleId: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User berhasil dibuat',
    type: SingleUserResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'User created successfully',
        data: {
          id: 1,
          username: 'usertest',
          email: 'john@example.com',
          isActive: true,
          employee_id: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          roles: [],
          employees: undefined,
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
        message:
          'Username hanya boleh mengandung huruf dan angka, tanpa spasi atau simbol',
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
    description: 'Username atau email sudah ada',
    schema: {
      example: {
        statusCode: 409,
        message: 'Username already registered',
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
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data user berdasarkan ID',
    description:
      'Mengupdate data user dengan validasi duplikasi email dan role assignment',
  })
  @ApiParam({
    name: 'id',
    description: 'ID user yang akan diupdate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'User berhasil diupdate',
    type: SingleUserResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'User updated successfully',
        data: {
          id: 1,
          username: 'usertest',
          email: 'john.updated@example.com',
          isActive: true,
          employee_id: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          roles: [],
          employees: undefined,
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
    description: 'User tidak ditemukan',
  })
  @ApiResponse({
    status: 409,
    description: 'Email sudah digunakan oleh user lain',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data user berdasarkan ID',
    description:
      'Soft delete user (marks as deleted but keeps in database). User-role relationships akan dihapus terlebih dahulu.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID user yang akan dihapus',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'User berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'User deleted successfully',
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
    description: 'User tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
