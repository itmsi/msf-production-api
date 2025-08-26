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
import { BargeFormService } from './barge-form.service';
import {
  CreateBargeFormDto,
  UpdateBargeFormDto,
  BargeFormResponseDto,
  QueryBargeFormDto,
} from './dto';

@ApiTags('Barge Form')
@ApiBearerAuth('jwt')
@ApiExtraModels(BargeFormResponseDto)
@UseGuards(JwtAuthGuard)
@Controller('barge-form')
export class BargeFormController {
  constructor(private readonly bargeFormService: BargeFormService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Membuat barge form baru',
    description: 'Membuat barge form baru dengan perhitungan otomatis capacity_per_dt dan achievment. Perhitungan: capacity_per_dt = vol_by_survey / total_vessel, achievment = vol_by_survey / capacity_per_dt',
  })
  @ApiResponse({
    status: 201,
    description: 'Barge form berhasil dibuat',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Barge form created successfully' },
        data: { $ref: '#/components/schemas/BargeFormResponseDto' },
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
  async create(@Body() createBargeFormDto: CreateBargeFormDto) {
    return this.bargeFormService.create(createBargeFormDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua barge form',
    description: 'Mengambil semua barge form dengan filter opsional berdasarkan rentang tanggal dan pencarian keyword. Mendukung pagination dan sorting berdasarkan tanggal pembuatan.',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Tanggal mulai untuk filter rentang tanggal (start_loading) - format YYYY-MM-DD',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Tanggal akhir untuk filter rentang tanggal (end_loading) - format YYYY-MM-DD',
    example: '2024-01-31',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Kata kunci pencarian untuk nama barge, nama site, shipment, atau remarks',
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
    description: 'Barge forms berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Barge forms retrieved successfully' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/BargeFormResponseDto' },
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
    description: 'Tidak ada barge form ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'No barge forms found' },
        data: { type: 'null' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  async findAll(@Query() queryDto: QueryBargeFormDto) {
    return this.bargeFormService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan barge form berdasarkan ID',
    description: 'Mengambil barge form spesifik berdasarkan ID dengan relasi barge dan site',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Barge Form',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Barge form berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Barge form retrieved successfully' },
        data: { $ref: '#/components/schemas/BargeFormResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Barge form tidak ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Barge form not found' },
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
    description: 'Barge form tidak ditemukan',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bargeFormService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Memperbarui barge form',
    description: 'Memperbarui barge form yang sudah ada dengan perhitungan ulang otomatis capacity_per_dt dan achievment',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Barge Form',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Barge form berhasil diperbarui',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Barge form updated successfully' },
        data: { $ref: '#/components/schemas/BargeFormResponseDto' },
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
    description: 'Barge form tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBargeFormDto: UpdateBargeFormDto,
  ) {
    return this.bargeFormService.update(id, updateBargeFormDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Menghapus barge form',
    description: 'Soft delete barge form berdasarkan ID. Data tidak benar-benar dihapus dari database.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Barge Form',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Barge form berhasil dihapus',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Barge form deleted successfully' },
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
    description: 'Barge form tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.bargeFormService.remove(id);
  }
}
