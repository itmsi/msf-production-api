import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { FuelConsumptionService } from './fuel-consumption.service';
import {
  CreateFuelConsumptionDto,
  UpdateFuelConsumptionDto,
  FuelConsumptionResponseDto,
  QueryFuelConsumptionDto,
} from './dto';

@ApiTags('Fuel Consumption')
@ApiBearerAuth('jwt')
@ApiExtraModels(FuelConsumptionResponseDto)
@UseGuards(JwtAuthGuard)
@Controller('fuel-consumption')
export class FuelConsumptionController {
  constructor(private readonly fuelConsumptionService: FuelConsumptionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Membuat data fuel consumption baru',
    description: 'Membuat data fuel consumption baru dengan perhitungan otomatis untuk running_refueling_hm, running_refueling_km, l_per_km, l_per_hm, dan lead_time_refueling_time',
  })
  @ApiResponse({
    status: 201,
    description: 'Fuel consumption berhasil dibuat',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Fuel consumption created successfully' },
        data: { $ref: '#/components/schemas/FuelConsumptionResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validasi error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(@Body() createFuelConsumptionDto: CreateFuelConsumptionDto) {
    return this.fuelConsumptionService.create(createFuelConsumptionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua data fuel consumption',
    description: 'Mengambil semua data fuel consumption dengan filter opsional berdasarkan rentang tanggal dan pencarian keyword. Mendukung pagination dan sorting berdasarkan tanggal pembuatan.',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Tanggal mulai untuk filter rentang tanggal (activity_date) - format YYYY-MM-DD',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Tanggal akhir untuk filter rentang tanggal (activity_date) - format YYYY-MM-DD',
    example: '2024-01-31',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Kata kunci pencarian untuk semua kolom (part_name, no_unit, site_name, unit_type, serial_number, operator_name)',
    example: 'alpha',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Nomor halaman untuk pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Jumlah item per halaman',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Fuel consumption data berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Fuel consumption data retrieved successfully' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/FuelConsumptionResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tidak ada data fuel consumption ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'No fuel consumption data found' },
        data: { type: 'null' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  async findAll(@Query() queryDto: QueryFuelConsumptionDto) {
    return this.fuelConsumptionService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data fuel consumption berdasarkan ID',
    description: 'Mengambil data fuel consumption spesifik berdasarkan ID dengan relasi unit, operator, site, dan unit_type',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Fuel Consumption',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Fuel consumption berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Fuel consumption retrieved successfully' },
        data: { $ref: '#/components/schemas/FuelConsumptionResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Fuel consumption tidak ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Fuel consumption not found' },
        data: { type: 'null' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  @ApiResponse({
    status: 404,
    description: 'Fuel consumption tidak ditemukan',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fuelConsumptionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Memperbarui data fuel consumption',
    description: 'Memperbarui data fuel consumption yang sudah ada dengan perhitungan ulang otomatis untuk running_refueling_hm, running_refueling_km, l_per_km, l_per_hm, dan lead_time_refueling_time',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Fuel Consumption',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Fuel consumption berhasil diperbarui',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Fuel consumption updated successfully' },
        data: { $ref: '#/components/schemas/FuelConsumptionResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validasi error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  @ApiResponse({
    status: 404,
    description: 'Fuel consumption tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFuelConsumptionDto: UpdateFuelConsumptionDto,
  ) {
    return this.fuelConsumptionService.update(id, updateFuelConsumptionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Menghapus data fuel consumption',
    description: 'Soft delete data fuel consumption berdasarkan ID. Data tidak benar-benar dihapus dari database.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Fuel Consumption',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Fuel consumption berhasil dihapus',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Fuel consumption deleted successfully' },
        data: { type: 'null' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  @ApiResponse({
    status: 404,
    description: 'Fuel consumption tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.fuelConsumptionService.remove(id);
  }
}
