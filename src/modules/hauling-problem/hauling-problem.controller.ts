import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  StreamableFile,
  InternalServerErrorException,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { HaulingProblemService } from './hauling-problem.service';
import { CreateHaulingProblemDto, UpdateHaulingProblemDto, HaulingProblemResponseDto, GetHaulingProblemQueryDto } from './dto';
import { createReadStream } from 'fs';
import { join } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from '../population';
import { Response } from 'express';

@ApiTags('Hauling Problem')
@Controller('hauling-problem')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class HaulingProblemController {
  constructor(private readonly haulingProblemService: HaulingProblemService) {}

  @Get('export')
  @ApiOperation({
    summary: 'Export data Fuel consumption dari CSV',
    description: 'Mengimport data Fuel consumption dari CSV ke database setelah validasi',
  })
  async exportData(@Query() query: GetHaulingProblemQueryDto, @Res({ passthrough: false }) res: Response) {
    return await this.haulingProblemService.exportData(query, res);
  }

  @Post()
  @ApiOperation({
    summary: 'Membuat data hauling problem baru',
    description: 'Endpoint untuk membuat data hauling problem baru dengan validasi lengkap',
  })
  @ApiResponse({
    status: 201,
    description: 'Data hauling problem berhasil dibuat',
    type: HaulingProblemResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Data hauling problem berhasil dibuat',
        data: {
          id: 1,
          activity_date: '2024-01-01T00:00:00.000Z',
          shift: 'ds',
          activities_id: 1,
          activities_name: 'Excavation',
          start: '2024-01-01T08:00:00.000Z',
          finish: '2024-01-01T16:00:00.000Z',
          duration: 8.0,
          site_id: 1,
          site_name: 'Site Jakarta',
          remark: 'Problem pada unit excavator',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validasi gagal atau data tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async create(@Body() createDto: CreateHaulingProblemDto) {
    return this.haulingProblemService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Mengambil semua data hauling problem',
    description: 'Endpoint untuk mengambil data hauling problem dengan pagination, filtering, dan sorting',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Nomor halaman (default: 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Jumlah data per halaman (default: 10, max: 100)',
    type: Number,
  })
  @ApiQuery({
    name: 'activity_date',
    required: false,
    description: 'Filter berdasarkan tanggal aktivitas (format: YYYY-MM-DD)',
    type: String,
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Filter berdasarkan tanggal mulai aktivitas (format: YYYY-MM-DD)',
    type: String,
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Filter berdasarkan tanggal akhir aktivitas (format: YYYY-MM-DD)',
    type: String,
  })
  @ApiQuery({
    name: 'shift',
    required: false,
    description: 'Filter berdasarkan shift (ds atau ns)',
    enum: ['ds', 'ns'],
  })
  @ApiQuery({
    name: 'activities_id',
    required: false,
    description: 'Filter berdasarkan ID aktivitas',
    type: Number,
  })
  @ApiQuery({
    name: 'site_id',
    required: false,
    description: 'Filter berdasarkan ID site',
    type: Number,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Pencarian umum di nama aktivitas, nama site, atau remark',
    type: String,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field untuk sorting (id, activityDate, shift, start, finish, duration, createdAt, updatedAt)',
    type: String,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Urutan sorting (ASC atau DESC)',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: 'Data hauling problem berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Data hauling problem berhasil diambil',
        data: [
          {
            id: 1,
            activity_date: '2024-01-01T00:00:00.000Z',
            shift: 'ds',
            activities_id: 1,
            activities_name: 'Excavation',
            start: '2024-01-01T08:00:00.000Z',
            finish: '2024-01-01T16:00:00.000Z',
            duration: 8.0,
            site_id: 1,
            site_name: 'Site Jakarta',
            remark: 'Problem pada unit excavator',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
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
    description: 'Bad Request - Parameter query tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findAll(@Query() query: GetHaulingProblemQueryDto) {
    return this.haulingProblemService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Mengambil data hauling problem berdasarkan ID',
    description: 'Endpoint untuk mengambil data hauling problem berdasarkan ID tertentu',
  })
  @ApiParam({
    name: 'id',
    description: 'ID hauling problem',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Data hauling problem berhasil diambil',
    type: HaulingProblemResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Data hauling problem berhasil diambil',
        data: {
          id: 1,
          activity_date: '2024-01-01T00:00:00.000Z',
          shift: 'ds',
          activities_id: 1,
          activities_name: 'Excavation',
          start: '2024-01-01T08:00:00.000Z',
          finish: '2024-01-01T16:00:00.000Z',
          duration: 8.0,
          site_id: 1,
          site_name: 'Site Jakarta',
          remark: 'Problem pada unit excavator',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data tidak ditemukan',
    schema: {
      example: {
        statusCode: 200,
        message: 'Data hauling problem tidak ditemukan',
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
    description: 'Unauthorized - Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async findById(@Param('id') id: number) {
    return this.haulingProblemService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data hauling problem',
    description: 'Endpoint untuk mengupdate data hauling problem berdasarkan ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID hauling problem yang akan diupdate',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Data hauling problem berhasil diupdate',
    type: HaulingProblemResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Data hauling problem berhasil diupdate',
        data: {
          id: 1,
          activity_date: '2024-01-01T00:00:00.000Z',
          shift: 'ns',
          activities_id: 1,
          activities_name: 'Excavation',
          start: '2024-01-01T08:00:00.000Z',
          finish: '2024-01-01T16:00:00.000Z',
          duration: 8.0,
          site_id: 1,
          site_name: 'Site Jakarta',
          remark: 'Problem pada unit excavator - updated',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validasi gagal atau data tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Data hauling problem tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async update(@Param('id') id: number, @Body() updateDto: UpdateHaulingProblemDto) {
    return this.haulingProblemService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data hauling problem',
    description: 'Endpoint untuk menghapus data hauling problem berdasarkan ID (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID hauling problem yang akan dihapus',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Data hauling problem berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Data hauling problem berhasil dihapus',
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
    description: 'Unauthorized - Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Data hauling problem tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async delete(@Param('id') id: number) {
    return this.haulingProblemService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('import/template')
  @ApiOperation({
    summary: 'Download template CSV untuk import Fuel Consumption Data',
    description: 'Mendownload template CSV yang berisi format kolom yang diperlukan',
  })
  downloadTemplate(): StreamableFile {
    try {
      const file = join(process.cwd(), 'src/modules/hauling-problem/template-hauling-problem-import.csv');
      const stream = createReadStream(file);
      return new StreamableFile(stream, {
        type: 'text/csv',
        disposition: 'attachment; filename="template-hauling-problem-import.csv"',
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to download CSV template');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File CSV yang akan diimport',
    type: FileUploadDto,
  })
  @ApiOperation({
    summary: 'Import data Hauling CCR  dari CSV',
    description: 'Mengimport data Hauling CCR dari CSV ke database setelah validasi',
  })
  importData(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user?.id;
    return this.haulingProblemService.importData(file, userId);
  }
}
