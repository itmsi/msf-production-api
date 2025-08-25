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
} from '@nestjs/common';
import { BrandService } from './brand.service';
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
  CreateBrandDto,
  GetBrandsQueryDto,
  UpdateBrandDto,
  BrandResponseDto,
  BrandListResponseDto,
  SingleBrandResponseDto,
} from './dto/brand.dto';

@ApiTags('Brand')
@ApiBearerAuth('jwt')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan semua data brand dengan pagination, filtering, dan sorting',
    description: `
      Endpoint ini mendukung:
      - Pagination dengan parameter page dan limit
      - Pencarian umum dengan parameter search
      - Filter berdasarkan brand_name
      - Sorting berdasarkan field tertentu (id, brand_name, createdAt, updatedAt)
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
    description: 'Pencarian umum di field brand_name',
  })
  @ApiQuery({
    name: 'brand_name',
    required: false,
    type: String,
    description: 'Filter berdasarkan nama brand',
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
    description: 'Data brand berhasil diambil',
    type: BrandListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Data brand berhasil diambil',
        data: [
          {
            id: 1,
            brand_name: 'Toyota',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            brand_name: 'Honda',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
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
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
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
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  findAll(@Query() query: GetBrandsQueryDto) {
    return this.brandService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data brand berdasarkan ID',
    description: 'Mengambil data brand berdasarkan ID yang diberikan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID brand yang akan diambil',
    example: 1,
    type: Number,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Data brand berhasil diambil',
    type: SingleBrandResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Retrieve data success',
        data: {
          id: 1,
          brand_name: 'Toyota',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
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
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
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
    description: 'Brand tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Brand tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat brand baru',
    description:
      'Membuat brand baru dengan validasi duplikasi brand_name. Nama brand harus unik dalam sistem.',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Brand berhasil dibuat',
    type: SingleBrandResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Brand berhasil dibuat',
        data: {
          id: 1,
          brand_name: 'Toyota',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
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
        message: 'brand_name should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
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
    status: 409,
    description: 'Brand name sudah terdaftar',
    schema: {
      example: {
        statusCode: 409,
        message: 'Brand name sudah terdaftar',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data brand berdasarkan ID',
    description:
      'Mengupdate data brand dengan validasi duplikasi brand_name. Hanya field yang dikirim yang akan diupdate.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID brand yang akan diupdate',
    example: 1,
    type: Number,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Brand berhasil diupdate',
    type: SingleBrandResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Brand berhasil diupdate',
        data: {
          id: 1,
          brand_name: 'Toyota Motor',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
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
        message: 'brand_name should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
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
    description: 'Brand tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Brand tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'Brand name sudah digunakan oleh brand lain',
    schema: {
      example: {
        statusCode: 409,
        message: 'Brand name Toyota Motor sudah digunakan oleh brand lain',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data brand berdasarkan ID (soft delete)',
    description: `
      Melakukan soft delete pada brand:
      - Data tidak benar-benar dihapus dari database
      - Field deletedAt akan diisi dengan timestamp saat ini
      - Data yang sudah di-soft delete tidak akan muncul di query findAll
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID brand yang akan dihapus',
    example: 1,
    type: Number,
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Brand berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Brand berhasil dihapus',
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
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
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
    description: 'Brand tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Brand tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.remove(id);
  }
}
