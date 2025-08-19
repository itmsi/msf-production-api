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
import { UnitTypeService } from './unit-type.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import {
  CreateUnitTypeDto,
  GetUnitTypesQueryDto,
  UpdateUnitTypeDto,
  UnitTypeResponseDto,
} from './dto/unit-type.dto';

@ApiTags('Unit Type')
@ApiBearerAuth('jwt')
@Controller('unit-types')
export class UnitTypeController {
  constructor(private readonly unitTypeService: UnitTypeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan semua data unit type dengan pagination, filtering, dan sorting',
    description:
      'Endpoint ini mendukung pagination, pencarian, filtering berdasarkan brand_id, unit_name, type_name, model_name, dan sorting berdasarkan field tertentu',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Data unit type berhasil diambil',
    type: [UnitTypeResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Data unit type berhasil diambil',
        data: [
          {
            id: 1,
            brand_id: 1,
            unit_name: 'Excavator',
            type_name: 'Heavy Equipment',
            model_name: 'PC200-8',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            brand: {
              id: 1,
              brand_name: 'Komatsu',
            },
          },
        ],
        meta: {
          total: 1,
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
  findAll(@Query() query: GetUnitTypesQueryDto) {
    return this.unitTypeService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data unit type berdasarkan ID',
    description: 'Mengambil data unit type berdasarkan ID yang diberikan',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Data unit type berhasil diambil',
    type: UnitTypeResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Retrieve data success',
        data: {
          id: 1,
          brand_id: 1,
          unit_name: 'Excavator',
          type_name: 'Heavy Equipment',
          model_name: 'PC200-8',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          brand: {
            id: 1,
            brand_name: 'Komatsu',
          },
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
    description: 'Unit type tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Unit type tidak ditemukan',
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
  findOne(@Param('id') id: number) {
    return this.unitTypeService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat unit type baru',
    description:
      'Membuat unit type baru dengan validasi duplikasi kombinasi brand_id, unit_name, type_name, dan model_name',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Unit type berhasil dibuat',
    type: UnitTypeResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Unit type berhasil dibuat',
        data: {
          id: 1,
          brand_id: 1,
          unit_name: 'Excavator',
          type_name: 'Heavy Equipment',
          model_name: 'PC200-8',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          brand: {
            id: 1,
            brand_name: 'Komatsu',
          },
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
        message: 'brand_id should not be empty',
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
    description: 'Unit type dengan kombinasi yang sama sudah terdaftar',
    schema: {
      example: {
        statusCode: 409,
        message:
          'Unit type dengan kombinasi brand, unit, type, dan model yang sama sudah terdaftar',
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
  create(@Body() dto: CreateUnitTypeDto) {
    return this.unitTypeService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data unit type berdasarkan ID',
    description:
      'Mengupdate data unit type dengan validasi duplikasi kombinasi brand_id, unit_name, type_name, dan model_name',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Unit type berhasil diupdate',
    type: UnitTypeResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Unit type berhasil diupdate',
        data: {
          id: 1,
          brand_id: 1,
          unit_name: 'Excavator',
          type_name: 'Heavy Equipment',
          model_name: 'PC200-8M',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          brand: {
            id: 1,
            brand_name: 'Komatsu',
          },
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
        message: 'unit_name should not be empty',
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
    description: 'Unit type tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Unit type tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 409,
    description:
      'Unit type dengan kombinasi yang sama sudah digunakan oleh unit type lain',
    schema: {
      example: {
        statusCode: 409,
        message:
          'Unit type dengan kombinasi brand, unit, type, dan model yang sama sudah digunakan oleh unit type lain',
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
  update(@Param('id') id: number, @Body() dto: UpdateUnitTypeDto) {
    return this.unitTypeService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data unit type berdasarkan ID (soft delete)',
    description:
      'Melakukan soft delete pada unit type (data tidak benar-benar dihapus dari database)',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Unit type berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Unit type berhasil dihapus',
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
    description: 'Unit type tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Unit type tidak ditemukan',
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
  remove(@Param('id') id: number) {
    return this.unitTypeService.remove(id);
  }
}
