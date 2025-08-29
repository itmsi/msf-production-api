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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BargingListService } from './barging-list.service';
import {
  CreateBargingListDto,
  UpdateBargingListDto,
  BargingListResponseDto,
  GetBargingListQueryDto,
} from './dto';

@ApiTags('Barging List')
@ApiBearerAuth('jwt')
@Controller('barging-list')
export class BargingListController {
  constructor(private readonly bargingListService: BargingListService) {}

  @Get('test/data')
  @ApiOperation({
    summary: 'Test endpoint untuk cek data yang tersedia',
    description: 'Endpoint untuk cek data unit hauler dan barge yang tersedia',
  })
  @ApiResponse({
    status: 200,
    description: 'Data test berhasil diambil',
  })
  async testData() {
    return this.bargingListService.testData();
  }

  @Post()
  @ApiOperation({
    summary: 'Buat data barging list baru',
    description: 'Endpoint untuk membuat data barging list baru dengan validasi unit_hauler_id dan barge_id',
  })
  @ApiBody({
    type: CreateBargingListDto,
    description: 'Data barging list yang akan dibuat',
    examples: {
      example1: {
        summary: 'Contoh data barging list lengkap',
        value: {
          activity_date: '2025-01-15',
          shift: 'ds',
          time: '2025-01-15T08:00:00.000Z',
          unit_hauler_id: 1,
          barge_id: 1,
          vessel: 5,
        },
      },
      example2: {
        summary: 'Contoh data barging list dengan shift night',
        value: {
          activity_date: '2025-01-16',
          shift: 'ns',
          time: '2025-01-16T20:00:00.000Z',
          unit_hauler_id: 2,
          barge_id: 3,
          vessel: 8,
        },
      },
      example3: {
        summary: 'Contoh data barging list dengan data real dari database',
        value: {
          activity_date: '2025-01-15',
          shift: 'ds',
          time: '2025-01-15T08:00:00.000Z',
          unit_hauler_id: 6,
          barge_id: 1,
          vessel: 5,
        },
        description: 'Contoh dengan unit hauler ID 6 (KFM-DT-001) dan barge ID 1 (Barge-001tt)',
      },
      example4: {
        summary: 'Contoh data barging list dengan barge ID 2',
        value: {
          activity_date: '2025-01-15',
          shift: 'ds',
          time: '2025-01-15T08:00:00.000Z',
          unit_hauler_id: 6,
          barge_id: 2,
          vessel: 5,
        },
        description: 'Contoh dengan unit hauler ID 6 (KFM-DT-001) dan barge ID 2 (Barge-002)',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Barging list berhasil dibuat',
    examples: {
      example1: {
        summary: 'Response sukses create',
        value: {
          statusCode: 201,
          message: 'Barging list berhasil dibuat',
          data: {
            id: 1,
            activity_date: '2025-01-15',
            shift: 'ds',
            time: '2025-01-15T08:00:00.000Z',
            unit_hauler_id: 1,
            unit_hauler_name: 'DT-001',
            barge_id: 1,
            barge_name: 'Barge A',
            vessel: 5,
            total_tonnage: 200,
            createdAt: '2025-01-15T08:00:00.000Z',
            updatedAt: '2025-01-15T08:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validasi gagal atau data tidak ditemukan',
    examples: {
      example1: {
        summary: 'Unit hauler tidak ditemukan',
        value: {
          statusCode: 400,
          message: 'Unit hauler dengan ID 999 tidak ditemukan di tabel m_population',
        },
      },
      example2: {
        summary: 'Barge tidak ditemukan',
        value: {
          statusCode: 400,
          message: 'Barge dengan ID 999 tidak ditemukan di tabel m_barge',
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
          message: 'Gagal membuat barging list',
        },
      },
    },
  })
  create(@Body() createBargingListDto: CreateBargingListDto) {
    return this.bargingListService.create(createBargingListDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Ambil semua data barging list',
    description: 'Endpoint untuk mengambil semua data barging list dengan pagination, filter, dan search',
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
    description: 'Limit data per halaman (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Pencarian berdasarkan unit hauler name atau barge name',
  })
  @ApiQuery({
    name: 'shift',
    required: false,
    enum: ['ds', 'ns'],
    description: 'Filter berdasarkan shift',
  })
  @ApiQuery({
    name: 'unit_hauler_id',
    required: false,
    type: Number,
    description: 'Filter berdasarkan unit hauler ID',
  })
  @ApiQuery({
    name: 'barge_id',
    required: false,
    type: Number,
    description: 'Filter berdasarkan barge ID',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Filter berdasarkan tanggal dari (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Filter berdasarkan tanggal sampai (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field untuk sorting (default: id)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Urutan sorting (default: DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Data barging list berhasil diambil',
    examples: {
      example1: {
        summary: 'Response sukses dengan data',
        value: {
          statusCode: 200,
          message: 'Data barging list berhasil diambil',
          data: [
            {
              id: 1,
              activity_date: '2025-01-15',
              shift: 'ds',
              time: '2025-01-15T08:00:00.000Z',
              unit_hauler_id: 1,
              unit_hauler_name: 'DT-001',
              barge_id: 1,
              barge_name: 'Barge A',
              vessel: 5,
              total_tonnage: 200,
              createdAt: '2025-01-15T08:00:00.000Z',
              updatedAt: '2025-01-15T08:00:00.000Z',
            },
          ],
          pagination: {
            total: 100,
            page: 1,
            limit: 10,
            lastPage: 10,
          },
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
          message: 'Gagal mengambil data barging list',
        },
      },
    },
  })
  findAll(@Query() query: GetBargingListQueryDto) {
    return this.bargingListService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ambil data barging list berdasarkan ID',
    description: 'Endpoint untuk mengambil data barging list berdasarkan ID tertentu',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID barging list',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Data barging list berhasil diambil',
    examples: {
      example1: {
        summary: 'Response sukses dengan data',
        value: {
          statusCode: 200,
          message: 'Data barging list berhasil diambil',
          data: {
            id: 1,
            activity_date: '2025-01-15',
            shift: 'ds',
            time: '2025-01-15T08:00:00.000Z',
            unit_hauler_id: 1,
            unit_hauler_name: 'DT-001',
            barge_id: 1,
            barge_name: 'Barge A',
            vessel: 5,
            total_tonnage: 200,
            createdAt: '2025-01-15T08:00:00.000Z',
            updatedAt: '2025-01-15T08:00:00.000Z',
          },
        },
      },
      example2: {
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
    status: 500,
    description: 'Internal Server Error',
    examples: {
      example1: {
        summary: 'Server error',
        value: {
          statusCode: 500,
          message: 'Gagal mengambil data barging list',
        },
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bargingListService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update data barging list',
    description: 'Endpoint untuk mengupdate data barging list berdasarkan ID',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID barging list yang akan diupdate',
    example: 1,
  })
  @ApiBody({
    type: UpdateBargingListDto,
    description: 'Data barging list yang akan diupdate',
    examples: {
      example1: {
        summary: 'Update vessel dan shift',
        value: {
          vessel: 6,
          shift: 'ns',
        },
      },
      example2: {
        summary: 'Update activity date dan time',
        value: {
          activity_date: '2025-01-16',
          time: '2025-01-16T09:00:00.000Z',
        },
      },
      example3: {
        summary: 'Update unit hauler dan barge',
        value: {
          unit_hauler_id: 5,
          barge_id: 7,
        },
      },
      example4: {
        summary: 'Update multiple fields',
        value: {
          activity_date: '2025-01-17',
          shift: 'ds',
          time: '2025-01-17T10:00:00.000Z',
          vessel: 10,
          unit_hauler_id: 3,
          barge_id: 2,
        },
      },
      example5: {
        summary: 'Update lengkap semua field',
        value: {
          activity_date: '2025-01-15',
          shift: 'ds',
          time: '2025-01-15T08:00:00.000Z',
          unit_hauler_id: 6,
          barge_id: 2,
          vessel: 5,
        },
      },
      example6: {
        summary: 'Update dengan data real dari database',
        value: {
          activity_date: '2025-01-15',
          shift: 'ds',
          time: '2025-01-15T08:00:00.000Z',
          unit_hauler_id: 6,
          barge_id: 2,
          vessel: 5,
        },
        description: 'Contoh update dengan data yang sesuai dengan unit hauler ID 6 (KFM-DT-001) dan barge ID 2 (Barge-002)',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Barging list berhasil diupdate',
    examples: {
      example1: {
        summary: 'Response sukses update',
        value: {
          statusCode: 200,
          message: 'Barging list berhasil diupdate',
          data: {
            id: 1,
            activity_date: '2025-01-15',
            shift: 'ns',
            time: '2025-01-15T08:00:00.000Z',
            unit_hauler_id: 1,
            unit_hauler_name: 'DT-001',
            barge_id: 1,
            barge_name: 'Barge A',
            vessel: 6,
            total_tonnage: 240,
            createdAt: '2025-01-15T08:00:00.000Z',
            updatedAt: '2025-01-15T08:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validasi gagal atau data tidak ditemukan',
    examples: {
      example1: {
        summary: 'Unit hauler tidak ditemukan',
        value: {
          statusCode: 400,
          message: 'Unit hauler dengan ID 999 tidak ditemukan di tabel m_population',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Data tidak ditemukan',
    examples: {
      example1: {
        summary: 'Data tidak ditemukan',
        value: {
          statusCode: 404,
          message: 'Barging list tidak ditemukan',
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
          message: 'Gagal mengupdate barging list',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBargingListDto: UpdateBargingListDto,
  ) {
    return this.bargingListService.update(id, updateBargingListDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Hapus data barging list',
    description: 'Endpoint untuk menghapus data barging list berdasarkan ID (soft delete)',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID barging list yang akan dihapus',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Barging list berhasil dihapus',
    examples: {
      example1: {
        summary: 'Response sukses delete',
        value: {
          statusCode: 200,
          message: 'Barging list berhasil dihapus',
          data: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Data tidak ditemukan',
    examples: {
      example1: {
        summary: 'Data tidak ditemukan',
        value: {
          statusCode: 404,
          message: 'Barging list tidak ditemukan',
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
          message: 'Gagal menghapus barging list',
        },
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bargingListService.remove(id);
  }
}
