import {
  Controller,
  Get,
  Post,
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
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

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
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua parent plan production',
    description: 'Mengambil semua data parent plan production dengan relasi plan production harian yang telah di-generate otomatis',
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
    description: 'Urutan sorting (default: plan_date DESC)',
    example: 'plan_date',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar parent plan production berhasil diambil',
    schema: {
      example: [
        {
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
              average_shift_ewh: 145.16,
              ob_target: 48387.1,
              ore_target: 24193.55,
              quarry: 9677.42,
              sr_target: 2.0,
              ore_shipment_target: 19354.84,
              total_fleet: 25,
              daily_old_stock: 50000.0,
              shift_ob_target: 24193.55,
              shift_ore_target: 12096.77,
              shift_quarry: 4838.71,
              shift_sr_target: 2.0,
              remaining_stock: 54838.71,
              average_moth_ewh: 145.16,
            },
            {
              id: 2,
              plan_date: '2025-08-02T00:00:00.000Z',
              is_calender_day: true,
              is_holiday_day: false,
              is_available_day: true,
              average_day_ewh: 150.0,
              average_shift_ewh: 145.16,
              ob_target: 48387.1,
              ore_target: 24193.55,
              quarry: 9677.42,
              sr_target: 2.0,
              ore_shipment_target: 19354.84,
              total_fleet: 25,
              daily_old_stock: 50000.0,
              shift_ob_target: 24193.55,
              shift_ore_target: 12096.77,
              shift_quarry: 4838.71,
              shift_sr_target: 2.0,
              remaining_stock: 54838.71,
              average_moth_ewh: 145.16,
            },
            {
              id: 3,
              plan_date: '2025-08-03T00:00:00.000Z',
              is_calender_day: true,
              is_holiday_day: true,
              is_available_day: false,
              average_day_ewh: 150.0,
              average_shift_ewh: 145.16,
              ob_target: 48387.1,
              ore_target: 24193.55,
              quarry: 9677.42,
              sr_target: 2.0,
              ore_shipment_target: 19354.84,
              total_fleet: 25,
              daily_old_stock: 50000.0,
              shift_ob_target: 24193.55,
              shift_ore_target: 12096.77,
              shift_quarry: 4838.71,
              shift_sr_target: 2.0,
              remaining_stock: 54838.71,
              average_moth_ewh: 145.16,
            },
            // ... dan 28 data harian lainnya
          ],
        },
      ],
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
  async findAll() {
    return this.parentPlanProductionService.findAll();
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
