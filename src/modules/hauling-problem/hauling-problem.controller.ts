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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { HaulingProblemService } from './hauling-problem.service';
import {
  CreateHaulingProblemDto,
  UpdateHaulingProblemDto,
  HaulingProblemResponseDto,
  GetHaulingProblemQueryDto,
} from './dto';

@ApiTags('Hauling Problem')
@Controller('hauling-problem')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class HaulingProblemController {
  constructor(private readonly haulingProblemService: HaulingProblemService) {}

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
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
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
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          lastPage: 1
        }
      }
    }
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
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Data tidak ditemukan',
    schema: {
      example: {
        statusCode: 200,
        message: 'Data hauling problem tidak ditemukan',
        data: null
      }
    }
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
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
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
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateHaulingProblemDto,
  ) {
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
        data: null
      }
    }
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
}
