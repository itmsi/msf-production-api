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
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import {
  CreateActivitiesDto,
  GetActivitiesQueryDto,
  UpdateActivitiesDto,
  ActivitiesResponseDto,
} from './dto/activities.dto';

@ApiTags('Activities')
@ApiBearerAuth('jwt')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan semua data aktivitas dengan pagination, filtering, dan sorting',
    description:
      'Endpoint ini mendukung pagination, pencarian, filtering berdasarkan name dan status, dan sorting berdasarkan field tertentu',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Data aktivitas berhasil diambil',
    type: [ActivitiesResponseDto],
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
        ],
        meta: {
          total: 1,
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
  @SwaggerApiResponse({
    status: 200,
    description: 'Data aktivitas berhasil diambil',
    type: ActivitiesResponseDto,
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
  findOne(@Param('id') id: number) {
    return this.activitiesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat aktivitas baru',
    description: 'Membuat aktivitas baru dengan validasi duplikasi name',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Aktivitas berhasil dibuat',
    type: ActivitiesResponseDto,
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
    return this.activitiesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data aktivitas berdasarkan ID',
    description: 'Mengupdate data aktivitas dengan validasi duplikasi name',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Aktivitas berhasil diupdate',
    type: ActivitiesResponseDto,
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
  update(@Param('id') id: number, @Body() dto: UpdateActivitiesDto) {
    return this.activitiesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data aktivitas berdasarkan ID (soft delete)',
    description:
      'Melakukan soft delete pada aktivitas (data tidak benar-benar dihapus dari database)',
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
  remove(@Param('id') id: number) {
    return this.activitiesService.remove(id);
  }
}
