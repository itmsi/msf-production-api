import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiExtraModels, ApiBearerAuth } from '@nestjs/swagger';
import { ParentPlanProductionService } from './parent-plan-production.service';
import { CreateParentPlanProductionDto } from './dto/create-parent-plan-production.dto';
import { GetParentPlanProductionQueryDto, ParentPlanProductionSummaryResponseDto, UpdateParentPlanProductionDto } from './dto/parent-plan-production.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { Pagination } from '../../common/helpers/public.helper';

@ApiTags('Parent Plan Production')
@ApiBearerAuth('jwt')
@Controller('parent-plan-production')
@ApiExtraModels(CreateParentPlanProductionDto)
export class ParentPlanProductionController {
  constructor(
    private readonly parentPlanProductionService: ParentPlanProductionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Membuat parent plan production baru',
    description: 'Membuat parent plan production dan generate data plan production harian secara otomatis. Sistem akan otomatis menghitung jumlah hari dalam bulan, hari libur, dan generate data harian untuk setiap tanggal dalam bulan tersebut.\n\n**Field Mandatory:** plan_date, total_average_day_ewh, total_average_month_ewh, total_ob_target, total_ore_target, total_quarry_target, total_ore_shipment_target, total_sisa_stock, total_fleet\n\n**Field Optional:** total_sr_target (default: 2.0), total_remaining_stock (default: 0)\n\n**Catatan Khusus:** Field quarry akan diambil langsung dari body request tanpa dibagi jumlah hari dalam bulan',
  })
  @ApiBody({
    type: CreateParentPlanProductionDto,
    description: 'Data untuk membuat parent plan production',
    examples: {
      'Agustus 2025': {
        summary: 'Contoh untuk bulan Agustus 2025 (31 hari)',
        description: 'Akan generate 31 data harian otomatis',
        value: {
          plan_date: '2025-08-21',
          total_average_day_ewh: 150,
          total_average_month_ewh: 4500,
          total_ob_target: 1500000,
          total_ore_target: 750000,
          total_quarry_target: 300000,
          total_ore_shipment_target: 600000,
          total_sisa_stock: 50000,
          total_fleet: 25,
        },
      },
      'November 2025': {
        summary: 'Contoh untuk bulan November 2025 (30 hari)',
        description: 'Akan generate 30 data harian otomatis',
        value: {
          plan_date: '2025-11-15',
          total_average_day_ewh: 120,
          total_average_month_ewh: 3600,
          total_ob_target: 1200000,
          total_ore_target: 600000,
          total_quarry_target: 240000,
          total_ore_shipment_target: 480000,
          total_sisa_stock: 40000,
          total_fleet: 20,
        },
      },
      'Februari 2025': {
        summary: 'Contoh untuk bulan Februari 2025 (28 hari)',
        description: 'Akan generate 28 data harian otomatis',
        value: {
          plan_date: '2025-02-15',
          total_average_day_ewh: 100,
          total_average_month_ewh: 2800,
          total_ob_target: 1000000,
          total_ore_target: 500000,
          total_quarry_target: 200000,
          total_ore_shipment_target: 400000,
          total_sisa_stock: 30000,
          total_fleet: 18,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Parent plan production berhasil dibuat dan data harian berhasil di-generate',
    schema: {
      example: {
        id: 1,
        plan_date: '2025-08-01T00:00:00.000Z',
        total_calender_day: 31,
        total_holiday_day: 5,
        total_available_day: 26,
        total_average_month_ewh: 4500.0,
        total_average_day_ewh: 150.0,
        total_ob_target: 1500000.0,
        total_ore_target: 750000.0,
        total_quarry_target: 300000.0,
        total_sr_target: 2.0,
        total_ore_shipment_target: 600000.0,
        total_remaining_stock: 100000.0,
        total_sisa_stock: 50000.0,
        total_fleet: 25,
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Plan date sudah ada dalam sistem',
    schema: {
      example: {
        statusCode: 409,
        message: 'Plan date sudah ada dalam sistem',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'plan_date must be a valid date string',
          'total_average_day_ewh must be a positive number',
          'total_ob_target must be a positive number',
        ],
        error: 'Bad Request',
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
        error: 'Unauthorized',
      },
    },
  })
  async create(@Body() createDto: CreateParentPlanProductionDto) {
    return this.parentPlanProductionService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update parent plan production',
    description: 'Update parent plan production dan regenerate data plan production harian secara otomatis. Sistem akan otomatis menghitung ulang jumlah hari dalam bulan, hari libur, dan generate ulang data harian untuk setiap tanggal dalam bulan tersebut.\n\n**Field yang dapat diupdate:** Semua field yang ada di CreateParentPlanProductionDto\n\n**Catatan Khusus:** Field quarry akan diambil langsung dari body request tanpa dibagi jumlah hari dalam bulan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID parent plan production yang akan diupdate',
    example: 1,
    type: 'integer',
  })
  @ApiBody({
    type: UpdateParentPlanProductionDto,
    description: 'Data untuk update parent plan production',
    examples: {
      'Update Agustus 2025': {
        summary: 'Contoh update untuk bulan Agustus 2025',
        description: 'Akan regenerate 31 data harian otomatis',
        value: {
          plan_date: '2025-08-21',
          total_average_day_ewh: 160,
          total_average_month_ewh: 4800,
          total_ob_target: 1600000,
          total_ore_target: 800000,
          total_quarry_target: 320000,
          total_ore_shipment_target: 640000,
          total_sisa_stock: 60000,
          total_fleet: 30,
        },
      },
      'Update November 2025': {
        summary: 'Contoh update untuk bulan November 2025',
        description: 'Akan regenerate 30 data harian otomatis',
        value: {
          plan_date: '2025-11-15',
          total_average_day_ewh: 130,
          total_average_month_ewh: 3900,
          total_ob_target: 1300000,
          total_ore_target: 650000,
          total_quarry_target: 260000,
          total_ore_shipment_target: 520000,
          total_sisa_stock: 45000,
          total_fleet: 22,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Parent plan production berhasil diupdate dan data harian berhasil di-regenerate',
    schema: {
      example: {
        id: 1,
        plan_date: '2025-08-01T00:00:00.000Z',
        total_calender_day: 31,
        total_holiday_day: 5,
        total_available_day: 26,
        total_average_month_ewh: 4800.0,
        total_average_day_ewh: 160.0,
        total_ob_target: 1600000.0,
        total_ore_target: 800000.0,
        total_quarry_target: 320000.0,
        total_sr_target: 2.0,
        total_ore_shipment_target: 640000.0,
        total_remaining_stock: 120000.0,
        total_sisa_stock: 60000.0,
        total_fleet: 30,
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: '2025-01-15T11:45:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid atau parent plan production tidak ditemukan',
    schema: {
      example: {
        statusCode: 400,
        message: 'Parent plan production tidak ditemukan',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Plan date baru sudah ada dalam sistem',
    schema: {
      example: {
        statusCode: 409,
        message: 'Plan date baru sudah ada dalam sistem',
        error: 'Conflict',
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
        error: 'Unauthorized',
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateParentPlanProductionDto,
  ) {
    return this.parentPlanProductionService.update(+id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete parent plan production',
    description: 'Delete parent plan production dan semua data plan production harian yang terkait. Data hanya dapat dihapus jika tanggal plan_date belum lewat.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID parent plan production yang akan dihapus',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Parent plan production berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Parent plan production dan data harian berhasil dihapus',
        data: {
          message: 'Parent plan production dan data harian berhasil dihapus',
          deletedId: 1,
          deletedPlanDate: '2025-08-01T00:00:00.000Z',
          deletedDailyRecords: 31,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid, parent plan production tidak ditemukan, atau tidak dapat dihapus',
    schema: {
      example: {
        statusCode: 400,
        message: 'Data tidak dapat dihapus karena tanggal sudah lewat atau hari ini',
        error: 'Bad Request',
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
        error: 'Unauthorized',
      },
    },
  })
  async delete(@Param('id') id: string) {
    const result = await this.parentPlanProductionService.delete(+id);
    return {
      statusCode: 200,
      message: 'Parent plan production berhasil dihapus',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua parent plan production dengan pagination dan filter',
    description: 'Mengambil data parent plan production dengan pagination, filter tanggal, filter bulan, dan response format yang disesuaikan',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Filter bulan (1-12) untuk menampilkan data sesuai bulan tersebut walaupun tahunnya beda',
    example: 8,
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: 12,
    },
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    description: 'Filter tanggal dari (format: YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    description: 'Filter tanggal sampai (format: YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Nomor halaman (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Jumlah data per halaman (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Field untuk sorting (default: plan_date)',
    example: 'plan_date',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Urutan sorting (default: DESC)',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar parent plan production berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Data parent plan production berhasil diambil',
        data: [
          {
            id: 1,
            month_year: '2025-01',
            available_day: 26,
            holiday_day: 5,
            average_month_ewh: 4500.0,
            average_day_ewh: 150.0,
            ob_target: 1500000.0,
            ore_target: 750000.0,
            quarry_target: 300000.0,
            sr_target: 2.0,
            ore_shipment_target: 600000.0,
            sisa_stock: 50000.0,
            is_available_to_edit: true,
            is_available_to_delete: true,
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          lastPage: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid atau gagal mengambil data',
    schema: {
      example: {
        statusCode: 400,
        message: 'Gagal mengambil data parent plan production',
        error: 'Bad Request',
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
        error: 'Unauthorized',
      },
    },
  })
  async findAll(@Query() query: GetParentPlanProductionQueryDto): Promise<{
    statusCode: number;
    message: string;
    data: ParentPlanProductionSummaryResponseDto[];
    pagination: Pagination;
  }> {
    return this.parentPlanProductionService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan parent plan production by ID',
    description: 'Mengambil data parent plan production berdasarkan ID dengan relasi plan production harian yang telah di-generate otomatis',
  })
  @ApiParam({
    name: 'id',
    description: 'ID parent plan production',
    example: 1,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Parent plan production berhasil ditemukan',
    schema: {
      example: {
        id: 1,
        plan_date: '2025-08-01T00:00:00.000Z',
        total_calender_day: 31,
        total_holiday_day: 5,
        total_available_day: 26,
        total_average_month_ewh: 4500.0,
        total_average_day_ewh: 150.0,
        total_ob_target: 1500000.0,
        total_ore_target: 750000.0,
        total_quarry_target: 300000.0,
        total_sr_target: 2.0,
        total_ore_shipment_target: 600000.0,
        total_remaining_stock: 100000.0,
        total_sisa_stock: 50000.0,
        total_fleet: 25,
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: '2025-01-15T10:30:00.000Z',
        planProductions: [
          {
            id: 1,
            plan_date: '2025-08-01T00:00:00.000Z',
            is_calender_day: true,
            is_holiday_day: false,
            is_available_day: true,
            average_day_ewh: 150.0,
            ob_target: 48387.1,
            ore_target: 24193.55,
            sr_target: 2.0,
            total_fleet: 25,
            parent_plan_production_id: 1,
          },
          // ... dan data harian lainnya sesuai jumlah hari dalam bulan
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parent plan production tidak ditemukan',
    schema: {
      example: {
        statusCode: 400,
        message: 'Parent plan production tidak ditemukan',
        error: 'Bad Request',
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
        error: 'Unauthorized',
      },
    },
  })
  async findOne(@Param('id') id: string) {
    return this.parentPlanProductionService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('date/:planDate')
  @ApiOperation({
    summary: 'Mendapatkan parent plan production by date',
    description: 'Mengambil data parent plan production berdasarkan tanggal dengan relasi plan production harian yang telah di-generate otomatis',
  })
  @ApiParam({
    name: 'planDate',
    description: 'Tanggal rencana produksi (format: YYYY-MM-DD). Sistem akan mencari berdasarkan bulan dari tanggal tersebut.',
    example: '2025-08-21',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Parent plan production berhasil ditemukan',
    schema: {
      example: {
        id: 1,
        plan_date: '2025-08-01T00:00:00.000Z',
        total_calender_day: 31,
        total_holiday_day: 5,
        total_available_day: 26,
        total_average_month_ewh: 4500.0,
        total_average_day_ewh: 150.0,
        total_ob_target: 1500000.0,
        total_ore_target: 750000.0,
        total_quarry_target: 300000.0,
        total_sr_target: 2.0,
        total_ore_shipment_target: 600000.0,
        total_remaining_stock: 100000.0,
        total_sisa_stock: 50000.0,
        total_fleet: 25,
        created_at: '2025-01-15T10:30:00.000Z',
        updated_at: '2025-01-15T10:30:00.000Z',
        planProductions: [
          {
            id: 1,
            plan_date: '2025-08-01T00:00:00.000Z',
            is_calender_day: true,
            is_holiday_day: false,
            is_available_day: true,
            average_day_ewh: 150.0,
            ob_target: 48387.1,
            ore_target: 24193.55,
            sr_target: 2.0,
            total_fleet: 25,
            parent_plan_production_id: 1,
          },
          // ... dan data harian lainnya sesuai jumlah hari dalam bulan
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parent plan production tidak ditemukan untuk tanggal tersebut',
    schema: {
      example: {
        statusCode: 400,
        message: 'Parent plan production tidak ditemukan untuk tanggal tersebut',
        error: 'Bad Request',
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
        error: 'Unauthorized',
      },
    },
  })
  async findByDate(@Param('planDate') planDate: string) {
    return this.parentPlanProductionService.findByDate(planDate);
  }
}
