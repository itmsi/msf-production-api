import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { BargeService } from './barge.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateBargeDto,
  GetBargesQueryDto,
  UpdateBargeDto,
  BargeResponseDto,
  BargeListResponseDto,
  SingleBargeResponseDto,
} from './dto/barge.dto';

@ApiTags('Barge')
@ApiBearerAuth('jwt')
@Controller('barges')
export class BargeController {
  constructor(private readonly bargeService: BargeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan semua data barge dengan pagination, filtering, dan sorting',
    description: `
      Endpoint ini mendukung:
      - Pagination dengan parameter page dan limit
      - Pencarian umum dengan parameter search (name, remarks)
      - Filter berdasarkan name dan range kapasitas
      - Sorting berdasarkan field tertentu (id, name, capacity, createdAt, updatedAt)
      - Urutan sorting ASC atau DESC
    `,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Nomor halaman (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Jumlah data per halaman (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Pencarian umum di field name dan remarks',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter berdasarkan nama barge',
  })
  @ApiQuery({
    name: 'minCapacity',
    required: false,
    type: String,
    description: 'Filter berdasarkan kapasitas minimum',
  })
  @ApiQuery({
    name: 'maxCapacity',
    required: false,
    type: String,
    description: 'Filter berdasarkan kapasitas maksimum',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field untuk sorting',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Urutan sorting',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Data barge berhasil diambil',
    type: BargeListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Data barge berhasil diambil',
        data: [
          {
            id: 1,
            name: 'Barge Kalimantan',
            capacity: 1000,
            remarks: 'Barge untuk pengangkutan batu bara',
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
          },
          {
            id: 2,
            name: 'Barge Sumatra',
            capacity: 1500,
            remarks: 'Barge untuk pengangkutan CPO',
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - Parameter query tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 500,
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Gagal mengambil data barge',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async findAll(@Query() query: GetBargesQueryDto) {
    return this.bargeService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data barge berdasarkan ID',
    description:
      'Endpoint untuk mengambil data barge spesifik berdasarkan ID yang diberikan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID barge yang akan diambil',
    type: 'number',
    example: 1,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Data barge berhasil diambil',
    type: SingleBargeResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Data barge berhasil diambil',
        data: {
          id: 1,
          name: 'Barge Kalimantan',
          capacity: 1000,
          remarks: 'Barge untuk pengangkutan batu bara',
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID harus berupa angka',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Not Found - Barge tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Barge tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 500,
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Gagal mengambil data barge',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.bargeService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat data barge baru',
    description: 'Endpoint untuk membuat data barge baru',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Barge berhasil dibuat',
    type: SingleBargeResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Barge berhasil dibuat',
        data: {
          id: 1,
          name: 'Barge Kalimantan',
          capacity: 1000,
          remarks: 'Barge untuk pengangkutan batu bara',
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 500,
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Gagal membuat barge',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async create(@Body() createBargeDto: CreateBargeDto, @Request() req: any) {
    const userId = req.user?.id || 1; // Default user ID jika tidak ada
    return this.bargeService.create(createBargeDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data barge berdasarkan ID',
    description: 'Endpoint untuk mengupdate data barge yang sudah ada',
  })
  @ApiParam({
    name: 'id',
    description: 'ID barge yang akan diupdate',
    type: 'number',
    example: 1,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Barge berhasil diupdate',
    type: SingleBargeResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Barge berhasil diupdate',
        data: {
          id: 1,
          name: 'Barge Kalimantan Updated',
          capacity: 1500,
          remarks: 'Barge untuk pengangkutan batu bara - Updated',
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Not Found - Barge tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Barge tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 500,
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Gagal mengupdate barge',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBargeDto: UpdateBargeDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 1; // Default user ID jika tidak ada
    return this.bargeService.update(id, updateBargeDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data barge berdasarkan ID (Soft Delete)',
    description:
      'Endpoint untuk menghapus data barge secara soft delete (tidak benar-benar dihapus dari database)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID barge yang akan dihapus',
    type: 'number',
    example: 1,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Barge berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Barge berhasil dihapus',
        data: null,
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID harus berupa angka',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Not Found - Barge tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Barge tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 500,
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Gagal menghapus barge',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id || 1; // Default user ID jika tidak ada
    return this.bargeService.delete(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/restore')
  @ApiOperation({
    summary: 'Memulihkan data barge yang sudah dihapus (Soft Delete)',
    description:
      'Endpoint untuk memulihkan data barge yang sudah di-soft delete',
  })
  @ApiParam({
    name: 'id',
    description: 'ID barge yang akan dipulihkan',
    type: 'number',
    example: 1,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Barge berhasil dipulihkan',
    type: SingleBargeResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Barge berhasil dipulihkan',
        data: {
          id: 1,
          name: 'Barge Kalimantan',
          capacity: 1000,
          remarks: 'Barge untuk pengangkutan batu bara',
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID harus berupa angka',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 404,
    description:
      'Not Found - Barge tidak ditemukan atau tidak dalam status deleted',
    schema: {
      example: {
        statusCode: 404,
        message: 'Barge tidak ditemukan atau tidak dalam status deleted',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 500,
    description: 'Internal Server Error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Gagal memulihkan barge',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async restore(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id || 1; // Default user ID jika tidak ada
    return this.bargeService.restore(id, userId);
  }
}
