import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { HaulingListService } from './hauling-list.service';
import { CreateHaulingListDto, UpdateHaulingListDto, QueryHaulingListDto, HaulingListResponseDto, QueryActivitiesDto, ActivitiesResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Hauling List')
@ApiBearerAuth('jwt')
@Controller('hauling-list')
@UseGuards(JwtAuthGuard)
export class HaulingListController {
  constructor(private readonly haulingListService: HaulingListService) {}

  @Post()
  @ApiOperation({ summary: 'Membuat data hauling list baru' })
  @ApiBody({
    type: CreateHaulingListDto,
    examples: {
      'hauling-list-ore': {
        summary: 'Contoh data hauling list untuk material ore',
        description: 'Data lengkap untuk membuat hauling list dengan material ore',
        value: {
          activity_date: '2024-01-15T00:00:00Z',
          shift: 'ds',
          time: '2024-01-15T08:00:00Z',
          unit_loading_id: 6,
          unit_hauler_id: 7,
          material: 'ore',
          loading_point_id: 2,
          dumping_point_op_id: 2,
          dumping_point_barge_id: 2,
          vessel: 5
        } as CreateHaulingListDto
      },
      'hauling-list-biomas': {
        summary: 'Contoh data hauling list untuk material biomas',
        description: 'Data lengkap untuk membuat hauling list dengan material biomas',
        value: {
          activity_date: '2024-01-16T00:00:00Z',
          shift: 'ns',
          time: '2024-01-16T20:00:00Z',
          unit_loading_id: 8,
          unit_hauler_id: 9,
          material: 'biomas',
          loading_point_id: 3,
          dumping_point_op_id: 3,
          dumping_point_barge_id: 3,
          vessel: 3
        } as CreateHaulingListDto
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Data hauling list berhasil dibuat',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Data hauling list berhasil dibuat' },
        data: { $ref: '#/components/schemas/HaulingListResponseDto' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - validasi error atau foreign key constraint violation' })
  @ApiResponse({ status: 401, description: 'Unauthorized - token tidak valid' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  create(@Body() createHaulingListDto: CreateHaulingListDto) {
    return this.haulingListService.create(createHaulingListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Mengambil semua data hauling list dengan pagination dan filter' })
  @ApiQuery({ name: 'page', required: false, description: 'Nomor halaman', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Jumlah data per halaman', example: 10 })
  @ApiQuery({ name: 'activity_date', required: false, description: 'Filter berdasarkan tanggal aktivitas', example: '2024-01-15' })
  @ApiQuery({ name: 'shift', required: false, description: 'Filter berdasarkan shift', enum: ['ds', 'ns'], example: 'ds' })
  @ApiQuery({ name: 'material', required: false, description: 'Filter berdasarkan material', enum: ['biomas', 'boulder', 'ob', 'ore', 'ore-barge', 'quarry'], example: 'ore' })
  @ApiQuery({ name: 'unit_loading_name', required: false, description: 'Filter berdasarkan nama unit loading', example: 'KFM-DT-001' })
  @ApiQuery({ name: 'unit_hauler_name', required: false, description: 'Filter berdasarkan nama unit hauler', example: 'KFM-DT-002' })
  @ApiResponse({ 
    status: 200, 
    description: 'Data hauling list berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Data hauling list berhasil diambil' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/HaulingListResponseDto' }
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 3 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            lastPage: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QueryHaulingListDto) {
    return this.haulingListService.findAll(queryDto);
  }

  @Get('activities')
  @ApiOperation({ summary: 'Mengambil data activities (operation points) dengan pagination dan filter' })
  @ApiQuery({ name: 'page', required: false, description: 'Nomor halaman', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Jumlah data per halaman', example: 10 })
  @ApiQuery({ name: 'name', required: false, description: 'Filter berdasarkan nama operation point', example: 'OP-001' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter berdasarkan tipe operation point', enum: ['loading', 'dumping', 'stockpile'], example: 'loading' })
  @ApiQuery({ name: 'site_name', required: false, description: 'Filter berdasarkan nama site', example: 'Site A' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Urutan berdasarkan field', enum: ['id', 'name', 'type', 'longitude', 'latitude', 'createdAt'], example: 'name' })
  @ApiQuery({ name: 'orderDirection', required: false, description: 'Urutan ascending atau descending', enum: ['ASC', 'DESC'], example: 'ASC' })
  @ApiResponse({ 
    status: 200, 
    description: 'Data activities berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Data activities berhasil diambil' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ActivitiesResponseDto' }
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 5 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            lastPage: { type: 'number', example: 1 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getActivities(@Query() queryDto: QueryActivitiesDto) {
    return this.haulingListService.getActivities(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mengambil data hauling list berdasarkan ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID hauling list',
    example: 7,
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Data hauling list berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Data hauling list berhasil diambil' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 7 },
            activity_date: { type: 'string', example: '2024-01-15' },
            shift: { type: 'string', example: 'ds' },
            time: { type: 'string', example: '2024-01-15T08:00:00.000Z' },
            unit_loading_id: { type: 'number', example: 6 },
            unit_loading_name: { type: 'string', example: 'KFM-DT-001' },
            unit_hauler_id: { type: 'number', example: 7 },
            unit_hauler_name: { type: 'string', example: 'KFM-DT-002' },
            material: { type: 'string', example: 'ore' },
            loading_point_id: { type: 'number', example: 2 },
            loading_point_name: { type: 'string', example: 'OP-002' },
            dumping_point_op_id: { type: 'number', example: 2 },
            dumping_point_op_name: { type: 'string', example: 'OP-002' },
            dumping_point_barge_id: { type: 'number', example: 2 },
            dumping_point_barge_name: { type: 'string', example: 'Barge-002' },
            vessel: { type: 'number', example: 5 },
            total_tonnage: { type: 'number', example: 175 },
            createdAt: { type: 'string', example: '2025-08-28T21:34:46.993Z' },
            updatedAt: { type: 'string', example: '2025-08-28T21:34:46.993Z' }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Data tidak ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Hauling list dengan ID 999 tidak ditemukan' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.haulingListService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mengupdate data hauling list berdasarkan ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID hauling list yang akan diupdate',
    example: 7,
    type: 'number'
  })
  @ApiBody({
    type: UpdateHaulingListDto,
    examples: {
      'update-activity-date': {
        summary: 'Update tanggal aktivitas dan shift',
        description: 'Contoh update tanggal aktivitas dan shift',
        value: {
          activity_date: '2025-08-15T09:00:00Z',
          shift: 'ns'
        } as UpdateHaulingListDto
      },
      'update-material-vessel': {
        summary: 'Update material dan vessel',
        description: 'Contoh update material dan vessel (total_tonnage akan dihitung otomatis)',
        value: {
          material: 'boulder',
          vessel: 8
        } as UpdateHaulingListDto
      },
      'update-complete-data': {
        summary: 'Update semua data',
        description: 'Contoh update semua field data',
        value: {
          activity_date: '2025-08-15T09:00:00Z',
          shift: 'ds',
          time: '2025-01-15T08:00:00Z',
          unit_loading_id: 6,
          unit_hauler_id: 6,
          material: 'ore',
          loading_point_id: 1,
          dumping_point_op_id: 1,
          dumping_point_barge_id: 1,
          vessel: 5
        } as UpdateHaulingListDto
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Data hauling list berhasil diupdate',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Data hauling list berhasil diupdate' },
        data: { $ref: '#/components/schemas/HaulingListResponseDto' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - validasi error atau foreign key constraint violation',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Foreign key constraint violation: Unit loading dengan ID 999 tidak ditemukan di tabel m_population' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Data tidak ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Hauling list dengan ID 999 tidak ditemukan' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateHaulingListDto: UpdateHaulingListDto
  ) {
    return this.haulingListService.update(id, updateHaulingListDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus data hauling list berdasarkan ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID hauling list yang akan dihapus',
    example: 7,
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Data hauling list berhasil dihapus',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Data hauling list berhasil dihapus' },
        data: { type: 'null', example: null }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Data tidak ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Hauling list dengan ID 999 tidak ditemukan' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.haulingListService.remove(id);
  }
}
