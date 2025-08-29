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
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { BargingProblemService } from './barging-problem.service';
import {
  CreateBargingProblemDto,
  UpdateBargingProblemDto,
  BargingProblemResponseDto,
  GetBargingProblemsQueryDto,
} from './dto/barging-problem.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Barging Problem')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('barging-problem')
export class BargingProblemController {
  constructor(private readonly bargingProblemService: BargingProblemService) {}

  @Post()
  @ApiOperation({
    summary: 'Buat data barging problem baru',
    description: 'Endpoint untuk membuat data barging problem baru dengan validasi FK ke tabel m_barge, m_activities, dan m_sites',
  })
  @ApiBody({
    type: CreateBargingProblemDto,
    description: 'Data barging problem yang akan dibuat',
    examples: {
      example1: {
        summary: 'Contoh data barging problem lengkap',
        value: {
          activity_date: '2024-01-01T00:00:00.000Z',
          shift: 'ds',
          barge_id: 1,
          activities_id: 1,
          site_id: 1,
          start: '2024-01-01T08:00:00.000Z',
          finish: '2024-01-01T16:00:00.000Z',
          remark: 'Problem pada unit excavator',
        },
      },
      example2: {
        summary: 'Contoh data barging problem tanpa site_id',
        value: {
          activity_date: '2024-01-01T00:00:00.000Z',
          shift: 'ns',
          barge_id: 2,
          activities_id: 2,
          start: '2024-01-01T20:00:00.000Z',
          finish: '2024-01-02T04:00:00.000Z',
          remark: 'Problem pada unit loader',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Barging problem berhasil dibuat',
    examples: {
      example1: {
        summary: 'Response sukses create',
        value: {
          statusCode: 201,
          message: 'Barging problem berhasil dibuat',
          data: {
            id: 1,
            activity_date: '2024-01-01T00:00:00.000Z',
            shift: 'ds',
            barge_id: 1,
            barge_name: 'Barge Kalimantan',
            activities_id: 1,
            activities_name: 'Excavation',
            site_id: 1,
            site_name: 'Site Jakarta',
            start: '2024-01-01T08:00:00.000Z',
            finish: '2024-01-01T16:00:00.000Z',
            duration: 8.0,
            remark: 'Problem pada unit excavator',
            createdAt: '2024-01-01T10:00:00.000Z',
            updatedAt: '2024-01-01T10:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validasi gagal atau data referensi tidak ditemukan',
    examples: {
      example1: {
        summary: 'Barge tidak ditemukan',
        value: {
          statusCode: 400,
          message: 'Barge dengan ID tersebut tidak ditemukan',
        },
      },
      example2: {
        summary: 'Activities tidak ditemukan',
        value: {
          statusCode: 400,
          message: 'Activities dengan ID tersebut tidak ditemukan',
        },
      },
      example3: {
        summary: 'Site tidak ditemukan',
        value: {
          statusCode: 400,
          message: 'Site dengan ID tersebut tidak ditemukan',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    examples: {
      example1: {
        summary: 'Server error',
        value: {
          statusCode: 500,
          message: 'Gagal membuat barging problem',
        },
      },
    },
  })
  create(@Body() createBargingProblemDto: CreateBargingProblemDto) {
    return this.bargingProblemService.create(createBargingProblemDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Ambil semua data barging problem',
    description: 'Endpoint untuk mengambil semua data barging problem dengan pagination, filtering, dan sorting',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Nomor halaman (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit data per halaman (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Pencarian berdasarkan remark, barge name, activities name, atau site name',
  })
  @ApiQuery({
    name: 'activity_date',
    required: false,
    type: String,
    description: 'Filter berdasarkan tanggal aktivitas (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    type: String,
    description: 'Filter berdasarkan tanggal mulai aktivitas (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    type: String,
    description: 'Filter berdasarkan tanggal akhir aktivitas (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'shift',
    required: false,
    enum: ['ds', 'ns'],
    description: 'Filter berdasarkan shift',
  })
  @ApiQuery({
    name: 'barge_id',
    required: false,
    type: Number,
    description: 'Filter berdasarkan ID barge',
  })
  @ApiQuery({
    name: 'activities_id',
    required: false,
    type: Number,
    description: 'Filter berdasarkan ID aktivitas',
  })
  @ApiQuery({
    name: 'site_id',
    required: false,
    type: Number,
    description: 'Filter berdasarkan ID site',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['id', 'activity_date', 'shift', 'barge_id', 'activities_id', 'site_id', 'start', 'finish', 'duration', 'createdAt', 'updatedAt'],
    description: 'Field untuk sorting',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Urutan sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Data barging problem berhasil diambil',
    examples: {
      example1: {
        summary: 'Response sukses dengan data',
        value: {
          statusCode: 200,
          message: 'Data barging problem berhasil diambil',
          data: [
            {
              id: 1,
              activity_date: '2024-01-01T00:00:00.000Z',
              shift: 'ds',
              barge_id: 1,
              barge_name: 'Barge Kalimantan',
              activities_id: 1,
              activities_name: 'Excavation',
              site_id: 1,
              site_name: 'Site Jakarta',
              start: '2024-01-01T08:00:00.000Z',
              finish: '2024-01-01T16:00:00.000Z',
              duration: 8.0,
              remark: 'Problem pada unit excavator',
              createdAt: '2024-01-01T10:00:00.000Z',
              updatedAt: '2024-01-01T10:00:00.000Z',
            },
          ],
          pagination: {
            total: 25,
            page: 1,
            limit: 10,
            lastPage: 3,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Parameter tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  findAll(@Query() query: GetBargingProblemsQueryDto) {
    return this.bargingProblemService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ambil data barging problem berdasarkan ID',
    description: 'Endpoint untuk mengambil data barging problem berdasarkan ID dengan relasi ke tabel m_barge, m_activities, dan m_sites',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID barging problem',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Data barging problem berhasil diambil',
    examples: {
      example1: {
        summary: 'Response sukses dengan data',
        value: {
          statusCode: 200,
          message: 'Data barging problem berhasil diambil',
          data: {
            id: 1,
            activity_date: '2024-01-01T00:00:00.000Z',
            shift: 'ds',
            barge_id: 1,
            barge_name: 'Barge Kalimantan',
            activities_id: 1,
            activities_name: 'Excavation',
            site_id: 1,
            site_name: 'Site Jakarta',
            start: '2024-01-01T08:00:00.000Z',
            finish: '2024-01-01T16:00:00.000Z',
            duration: 8.0,
            remark: 'Problem pada unit excavator',
            createdAt: '2024-01-01T10:00:00.000Z',
            updatedAt: '2024-01-01T10:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data tidak ditemukan',
    examples: {
      example1: {
        summary: 'Data tidak ditemukan',
        value: {
          statusCode: 200,
          message: 'Data tidak ditemukan',
          data: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    examples: {
      example1: {
        summary: 'Server error',
        value: {
          statusCode: 500,
          message: 'Gagal mengambil data barging problem',
        },
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bargingProblemService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update data barging problem',
    description: 'Endpoint untuk mengupdate data barging problem berdasarkan ID dengan validasi FK ke tabel m_barge, m_activities, dan m_sites',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID barging problem yang akan diupdate',
    example: 1,
  })
  @ApiBody({
    type: UpdateBargingProblemDto,
    description: 'Data barging problem yang akan diupdate',
    examples: {
      example1: {
        summary: 'Update semua field (full update)',
        value: {
          activity_date: '2024-01-01T00:00:00.000Z',
          shift: 'ds',
          barge_id: 1,
          activities_id: 1,
          site_id: 1,
          start: '2024-01-01T08:00:00.000Z',
          finish: '2024-01-01T16:00:00.000Z',
          remark: 'Problem pada unit excavator',
        },
      },
      example2: {
        summary: 'Update shift dan remark saja',
        value: {
          shift: 'ns',
          remark: 'Problem pada unit excavator - updated',
        },
      },
      example3: {
        summary: 'Update waktu start dan finish',
        value: {
          start: '2024-01-01T09:00:00.000Z',
          finish: '2024-01-01T17:00:00.000Z',
        },
      },
      example4: {
        summary: 'Update site_id dan remark',
        value: {
          site_id: 2,
          remark: 'Problem dipindah ke site lain',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Barging problem berhasil diupdate',
    examples: {
      example1: {
        summary: 'Response sukses update',
        value: {
          statusCode: 200,
          message: 'Barging problem berhasil diupdate',
          data: {
            id: 1,
            activity_date: '2024-01-01T00:00:00.000Z',
            shift: 'ns',
            barge_id: 1,
            barge_name: 'Barge Kalimantan',
            activities_id: 1,
            activities_name: 'Excavation',
            site_id: 1,
            site_name: 'Site Jakarta',
            start: '2024-01-01T08:00:00.000Z',
            finish: '2024-01-01T16:00:00.000Z',
            duration: 8.0,
            remark: 'Problem pada unit excavator - updated',
            createdAt: '2024-01-01T10:00:00.000Z',
            updatedAt: '2024-01-01T11:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validasi gagal atau data referensi tidak ditemukan',
    examples: {
      example1: {
        summary: 'Barge tidak ditemukan',
        value: {
          statusCode: 400,
          message: 'Barge dengan ID tersebut tidak ditemukan',
        },
      },
      example2: {
        summary: 'Waktu start >= finish',
        value: {
          statusCode: 400,
          message: 'Waktu start harus lebih awal dari waktu finish',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Barging problem tidak ditemukan',
    examples: {
      example1: {
        summary: 'Data tidak ditemukan',
        value: {
          statusCode: 404,
          message: 'Barging problem tidak ditemukan',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    examples: {
      example1: {
        summary: 'Server error',
        value: {
          statusCode: 500,
          message: 'Gagal mengupdate barging problem',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBargingProblemDto: UpdateBargingProblemDto,
  ) {
    return this.bargingProblemService.update(id, updateBargingProblemDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Hapus data barging problem',
    description: 'Endpoint untuk menghapus data barging problem berdasarkan ID (soft delete)',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID barging problem yang akan dihapus',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Barging problem berhasil dihapus',
    examples: {
      example1: {
        summary: 'Response sukses delete',
        value: {
          statusCode: 200,
          message: 'Barging problem berhasil dihapus',
          data: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Barging problem tidak ditemukan',
    examples: {
      example1: {
        summary: 'Data tidak ditemukan',
        value: {
          statusCode: 404,
          message: 'Barging problem tidak ditemukan',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    examples: {
      example1: {
        summary: 'Server error',
        value: {
          statusCode: 500,
          message: 'Gagal menghapus barging problem',
        },
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bargingProblemService.remove(id);
  }
}
