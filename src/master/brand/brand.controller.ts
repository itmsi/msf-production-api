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
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { 
  CreateBrandDto, 
  GetBrandsQueryDto, 
  UpdateBrandDto,
  BrandResponseDto 
} from './dto/brand.dto';

@ApiTags('Brand')
@ApiBearerAuth('jwt')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ 
    summary: 'Mendapatkan semua data brand dengan pagination, filtering, dan sorting',
    description: 'Endpoint ini mendukung pagination, pencarian, filtering berdasarkan brand_name, dan sorting berdasarkan field tertentu'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Data brand berhasil diambil',
    type: [BrandResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Data brand berhasil diambil',
        data: [
          {
            id: 1,
            brand_name: 'Toyota',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10
        }
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 400, 
    description: 'Bad Request - Parameter query tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  findAll(@Query() query: GetBrandsQueryDto) {
    return this.brandService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ 
    summary: 'Mendapatkan data brand berdasarkan ID',
    description: 'Mengambil data brand berdasarkan ID yang diberikan'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Data brand berhasil diambil',
    type: BrandResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Retrieve data success',
        data: {
          id: 1,
          brand_name: 'Toyota',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 400, 
    description: 'Bad Request - ID tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID harus berupa angka',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 404, 
    description: 'Brand tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Brand tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  findOne(@Param('id') id: number) {
    return this.brandService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ 
    summary: 'Membuat brand baru',
    description: 'Membuat brand baru dengan validasi duplikasi brand_name'
  })
  @SwaggerApiResponse({ 
    status: 201, 
    description: 'Brand berhasil dibuat',
    type: BrandResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Brand berhasil dibuat',
        data: {
          id: 1,
          brand_name: 'Toyota',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 400, 
    description: 'Bad Request - Data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'brand_name should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 409, 
    description: 'Brand name sudah terdaftar',
    schema: {
      example: {
        statusCode: 409,
        message: 'Brand name sudah terdaftar',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ 
    summary: 'Mengupdate data brand berdasarkan ID',
    description: 'Mengupdate data brand dengan validasi duplikasi brand_name'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Brand berhasil diupdate',
    type: BrandResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Brand berhasil diupdate',
        data: {
          id: 1,
          brand_name: 'Toyota Motor',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 400, 
    description: 'Bad Request - Data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'brand_name should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 404, 
    description: 'Brand tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Brand tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 409, 
    description: 'Brand name sudah digunakan oleh brand lain',
    schema: {
      example: {
        statusCode: 409,
        message: 'Brand name Toyota Motor sudah digunakan oleh brand lain',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  update(@Param('id') id: number, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Menghapus data brand berdasarkan ID (soft delete)',
    description: 'Melakukan soft delete pada brand (data tidak benar-benar dihapus dari database)'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Brand berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Brand berhasil dihapus',
        data: null
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 400, 
    description: 'Bad Request - ID tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID harus berupa angka',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 404, 
    description: 'Brand tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Brand tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 500, 
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  remove(@Param('id') id: number) {
    return this.brandService.remove(id);
  }
}
