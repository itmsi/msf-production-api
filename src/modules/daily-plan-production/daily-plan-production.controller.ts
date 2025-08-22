import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DailyPlanProductionService } from './daily-plan-production.service';
import {
  CreateDailyPlanProductionDto,
  UpdateDailyPlanProductionDto,
  QueryDailyPlanProductionDto,
  DailyPlanProductionResponseDto,
  DailyPlanProductionListResponseMainDto,
} from './dto/daily-plan-production.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Daily Plan Production')
@ApiBearerAuth('jwt')
@Controller('daily-plan-production')
export class DailyPlanProductionController {
  constructor(
    private readonly dailyPlanProductionService: DailyPlanProductionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Create Daily Plan Production',
    description: 'Membuat rencana produksi harian baru dengan validasi dan perhitungan otomatis',
  })
  @ApiBody({
    type: CreateDailyPlanProductionDto,
    description: 'Data untuk membuat daily plan production',
    examples: {
      example1: {
        summary: 'Contoh data lengkap',
        value: {
          plan_date: '2025-01-01',
          average_day_ewh: 1.5,
          average_shift_ewh: 0.75,
          ob_target: 1000,
          ore_target: 800,
          quarry: 200,
          ore_shipment_target: 750,
          total_fleet: 15,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Daily plan production berhasil dibuat',
    type: DailyPlanProductionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validasi gagal atau data duplikat',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Plan date sudah ada dalam database' },
        error: { type: 'boolean', example: true },
        timestamp: { type: 'string', example: '2025-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  create(@Body() createDto: CreateDailyPlanProductionDto) {
    return this.dailyPlanProductionService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Get All Daily Plan Production',
    description: 'Mengambil semua data rencana produksi dengan pagination, filter, pencarian, dan sorting',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Filter tanggal mulai (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Filter tanggal akhir (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Keyword pencarian',
    example: '2025-08',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field untuk sorting',
    example: 'plan_date',
    enum: ['id', 'plan_date', 'ob_target', 'ore_target', 'total_fleet', 'createdAt'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Urutan sorting',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Nomor halaman',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit per halaman',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Data daily plan production berhasil diambil',
    type: DailyPlanProductionListResponseMainDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  findAll(@Query() queryDto: QueryDailyPlanProductionDto) {
    return this.dailyPlanProductionService.findAll(queryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get Daily Plan Production by ID',
    description: 'Mengambil data rencana produksi berdasarkan ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID rencana produksi',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Data daily plan production berhasil diambil',
    type: DailyPlanProductionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Data tidak ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Daily plan production tidak ditemukan' },
        error: { type: 'boolean', example: true },
        timestamp: { type: 'string', example: '2025-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  findOne(@Param('id') id: string) {
    return this.dailyPlanProductionService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update Daily Plan Production',
    description: `Update data rencana produksi berdasarkan ID dengan validasi dan perhitungan otomatis.

**Proses Update:**
1. Validasi duplikasi plan_date (jika diupdate)
2. Set boolean fields otomatis berdasarkan plan_date:
   - is_calender_day: true jika plan_date terisi
   - is_holiday_day: true jika plan_date kosong
   - is_available_day: true jika bukan hari minggu
3. Perhitungan otomatis:
   - sr_target = ob_target / ore_target
   - shift_ob_target = ob_target / 2
   - shift_ore_target = ore_target / 2
   - shift_quarry = quarry / 2
   - shift_sr_target = shift_ob_target / shift_ore_target
   - daily_old_stock dan remaining_stock berdasarkan old_stock_global

**Field yang tersedia untuk update:**
- plan_date: Tanggal rencana (YYYY-MM-DD)
- average_day_ewh: Rata-rata EWH per hari
- average_month_ewh: Rata-rata EWH per bulan
- schedule_day: Schedule day (default: 1)
- ob_target: Target OB (Overburden)
- ore_target: Target ore
- quarry: Target quarry
- ore_shipment_target: Target pengiriman ore
- total_fleet: Total armada`,
  })
  @ApiParam({
    name: 'id',
    description: 'ID rencana produksi',
    example: 1,
  })
  @ApiBody({
    type: UpdateDailyPlanProductionDto,
    description: 'Data untuk update daily plan production. Semua field bersifat opsional.',
    examples: {
      example1: {
        summary: 'Update lengkap dengan semua field',
        value: {
          plan_date: "2025-08-21",
          average_day_ewh: 1.5,
          average_month_ewh: 1.5,
          schedule_day: 1,
          sisa_stock: 100,
          ob_target: 1200,
          ore_target: 900,
          quarry: 200,
          ore_shipment_target: 750,
          total_fleet: 15
        },
      },
      example2: {
        summary: 'Update target OB dan ore saja',
        value: {
          ob_target: 1200,
          ore_target: 900,
        },
      },
      example3: {
        summary: 'Update quarry dan fleet saja',
        value: {
          quarry: 250,
          total_fleet: 18,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Daily plan production berhasil diupdate',
    type: DailyPlanProductionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validasi gagal atau data duplikat',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Plan date sudah ada dalam database' },
        error: { type: 'boolean', example: true },
        timestamp: { type: 'string', example: '2025-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Data tidak ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Daily plan production tidak ditemukan' },
        error: { type: 'boolean', example: true },
        timestamp: { type: 'string', example: '2025-01-01T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDailyPlanProductionDto,
  ) {
    return this.dailyPlanProductionService.update(+id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Daily Plan Production',
    description: 'Soft delete data rencana produksi berdasarkan ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID rencana produksi',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Daily plan production berhasil dihapus',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Daily plan production berhasil dihapus' },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Data tidak ditemukan',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  remove(@Param('id') id: string) {
    return this.dailyPlanProductionService.remove(+id);
  }
}
