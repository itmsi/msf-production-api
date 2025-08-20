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
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateActivitiesDto,
  GetActivitiesQueryDto,
  UpdateActivitiesDto,
  ActivitiesResponseDto,
  ActivitiesListResponseDto,
  SingleActivityResponseDto,
  ActivityStatus,
} from './dto/activities.dto';

@ApiTags('Activities')
@ApiBearerAuth('jwt')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua data aktivitas dengan pagination, filtering, dan sorting',
    description: `
      Endpoint ini mendukung:
      - Pagination dengan parameter page dan limit
      - Pencarian umum dengan parameter search
      - Filter berdasarkan name dan status
      - Sorting berdasarkan field tertentu (id, name, status, createdAt, updatedAt)
      - Urutan sorting ASC atau DESC
    `,
  })
  @ApiQuery({ name: 'page', required: false, type: String, description: 'Nomor halaman (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: String, description: 'Jumlah data per halaman (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Pencarian umum di semua field' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter berdasarkan nama aktivitas' })
  @ApiQuery({ name: 'status', required: false, enum: ActivityStatus, description: 'Filter berdasarkan status aktivitas' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field untuk sorting' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Urutan sorting' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Data aktivitas berhasil diambil',
    type: ActivitiesListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Data aktivitas berhasil diambil',
        data: [
          {
            id: 1,
            name: 'Loading Barge',
            status: 'active',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            name: 'Unloading Barge',
            status: 'active',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
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
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - Parameter query tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
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
  @SwaggerApiResponse({
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
  findAll(@Query() query: GetActivitiesQueryDto) {
    return this.activitiesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data aktivitas berdasarkan ID',
    description: 'Mengambil data aktivitas berdasarkan ID yang diberikan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID aktivitas yang akan diambil',
    example: 1,
    type: Number,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Data aktivitas berhasil diambil',
    type: SingleActivityResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Retrieve data success',
        data: {
          id: 1,
          name: 'Loading Barge',
          status: 'active',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID harus berupa angka',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
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
  @SwaggerApiResponse({
    status: 404,
    description: 'Aktivitas tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Aktivitas tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat aktivitas baru',
    description: 'Membuat aktivitas baru dengan validasi duplikasi name. Status default adalah active.',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Aktivitas berhasil dibuat',
    type: SingleActivityResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Aktivitas berhasil dibuat',
        data: {
          id: 1,
          name: 'Loading Barge',
          status: 'active',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'name should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
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
  @SwaggerApiResponse({
    status: 409,
    description: 'Nama aktivitas sudah terdaftar',
    schema: {
      example: {
        statusCode: 409,
        message: 'Nama aktivitas sudah terdaftar',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
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
  create(@Body() dto: CreateActivitiesDto) {
    console.log('Controller received:', dto);
    return this.activitiesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data aktivitas berdasarkan ID',
    description: 'Mengupdate data aktivitas dengan validasi duplikasi name. Hanya field yang dikirim yang akan diupdate.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID aktivitas yang akan diupdate',
    example: 1,
    type: Number,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Aktivitas berhasil diupdate',
    type: SingleActivityResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Aktivitas berhasil diupdate',
        data: {
          id: 1,
          name: 'Loading Barge Updated',
          status: 'inactive',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'name should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
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
  @SwaggerApiResponse({
    status: 404,
    description: 'Aktivitas tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Aktivitas tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'Nama aktivitas sudah digunakan oleh aktivitas lain',
    schema: {
      example: {
        statusCode: 409,
        message:
          'Nama aktivitas Loading Barge Updated sudah digunakan oleh aktivitas lain',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateActivitiesDto) {
    return this.activitiesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data aktivitas berdasarkan ID (soft delete)',
    description: `
      Melakukan soft delete pada aktivitas:
      - Data tidak benar-benar dihapus dari database
      - Field deletedAt akan diisi dengan timestamp saat ini
      - Data yang sudah di-soft delete tidak akan muncul di query findAll
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID aktivitas yang akan dihapus',
    example: 1,
    type: Number,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Aktivitas berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Aktivitas berhasil dihapus',
        data: null,
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID harus berupa angka',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
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
  @SwaggerApiResponse({
    status: 404,
    description: 'Aktivitas tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Aktivitas tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.remove(id);
  }
}
