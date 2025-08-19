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
import { SitesService } from './sites.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import {
  CreateSitesDto,
  GetSitesQueryDto,
  UpdateSitesDto,
  SitesResponseDto,
} from './dto/sites.dto';

@ApiTags('Sites')
@ApiBearerAuth('jwt')
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan semua data sites dengan pagination, filtering, dan sorting',
    description:
      'Endpoint ini mendukung pagination, pencarian, filtering berdasarkan name dan location, dan sorting berdasarkan field tertentu',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Data sites berhasil diambil',
    type: [SitesResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Data sites berhasil diambil',
        data: [
          {
            id: 1,
            name: 'Site Jakarta',
            location: 'Jakarta Selatan',
            longitude: 106.8456,
            latitude: -6.2088,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            operator_points: [
              {
                id: 1,
                sites_id: 1,
                type: 'dumping',
                name: 'Dumping Point A',
                longitude: 106.8456,
                latitude: -6.2088,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
              },
            ],
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
  findAll(@Query() query: GetSitesQueryDto) {
    return this.sitesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data site berdasarkan ID',
    description:
      'Mengambil data site berdasarkan ID yang diberikan beserta operator points',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Data site berhasil diambil',
    type: SitesResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Retrieve data success',
        data: {
          id: 1,
          name: 'Site Jakarta',
          location: 'Jakarta Selatan',
          longitude: 106.8456,
          latitude: -6.2088,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          operator_points: [
            {
              id: 1,
              sites_id: 1,
              type: 'dumping',
              name: 'Dumping Point A',
              longitude: 106.8456,
              latitude: -6.2088,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
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
    description: 'Site tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Site tidak ditemukan',
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
    return this.sitesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat site baru',
    description: 'Membuat site baru beserta operator points (dumping/loading)',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Site berhasil dibuat',
    type: SitesResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Site berhasil dibuat',
        data: {
          id: 1,
          name: 'Site Jakarta',
          location: 'Jakarta Selatan',
          longitude: 106.8456,
          latitude: -6.2088,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          operator_points: [
            {
              id: 1,
              sites_id: 1,
              type: 'dumping',
              name: 'Dumping Point A',
              longitude: 106.8456,
              latitude: -6.2088,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
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
  create(@Body() dto: CreateSitesDto) {
    return this.sitesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data site berdasarkan ID',
    description: 'Mengupdate data site beserta operator points',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Site berhasil diupdate',
    type: SitesResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Site berhasil diupdate',
        data: {
          id: 1,
          name: 'Site Jakarta Updated',
          location: 'Jakarta Selatan',
          longitude: 106.8456,
          latitude: -6.2088,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          operator_points: [
            {
              id: 1,
              sites_id: 1,
              type: 'loading',
              name: 'Loading Point A',
              longitude: 106.8456,
              latitude: -6.2088,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
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
    description: 'Site tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Site tidak ditemukan',
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
  update(@Param('id') id: number, @Body() dto: UpdateSitesDto) {
    return this.sitesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data site berdasarkan ID (soft delete)',
    description:
      'Melakukan soft delete pada site (data tidak benar-benar dihapus dari database)',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Site berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Site berhasil dihapus',
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
    description: 'Site tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Site tidak ditemukan',
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
    return this.sitesService.remove(id);
  }
}
