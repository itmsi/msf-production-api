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
import { PopulationService } from './population.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { 
  CreatePopulationDto, 
  GetPopulationsQueryDto, 
  UpdatePopulationDto,
  PopulationResponseDto 
} from './dto/population.dto';

@ApiTags('Population')
@ApiBearerAuth('jwt')
@Controller('populations')
export class PopulationController {
  constructor(private readonly populationService: PopulationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ 
    summary: 'Mendapatkan semua data population dengan pagination, filtering, dan sorting',
    description: 'Endpoint ini mendukung pagination, pencarian, filtering berdasarkan status, unit_type_id, activities_id, site_id, engine_brand, tyre_type, dan range tanggal, serta sorting berdasarkan field tertentu'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Data population berhasil diambil',
    type: [PopulationResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Data population berhasil diambil',
        data: [
          {
            id: 1,
            date_arrive: '2024-01-01T00:00:00.000Z',
            status: 'active',
            unit_type_id: 1,
            no_unit: 'EXC001',
            vin_number: 'VIN123456789',
            no_unit_system: 'SYS001',
            engine_brand: 'cummins',
            serial_engine: 'ENG123456',
            activities_id: 1,
            site_origin: 'Site A',
            remarks: 'Unit dalam kondisi baik',
            site_id: 1,
            company: 'PT ABC',
            tyre_type: '6x4',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            unitType: {
              id: 1,
              unit_name: 'Excavator',
              type_name: 'Heavy Equipment',
              model_name: 'PC200-8',
              brand: {
                id: 1,
                brand_name: 'Komatsu'
              }
            },
            activities: {
              id: 1,
              activity_name: 'Mining'
            },
            site: {
              id: 1,
              site_name: 'Site A'
            }
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
  findAll(@Query() query: GetPopulationsQueryDto) {
    return this.populationService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ 
    summary: 'Mendapatkan data population berdasarkan ID',
    description: 'Mengambil data population berdasarkan ID yang diberikan dengan relasi lengkap'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Data population berhasil diambil',
    type: PopulationResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Retrieve data success',
        data: {
          id: 1,
          date_arrive: '2024-01-01T00:00:00.000Z',
          status: 'active',
          unit_type_id: 1,
          no_unit: 'EXC001',
          vin_number: 'VIN123456789',
          no_unit_system: 'SYS001',
          engine_brand: 'cummins',
          serial_engine: 'ENG123456',
          activities_id: 1,
          site_origin: 'Site A',
          remarks: 'Unit dalam kondisi baik',
          site_id: 1,
          company: 'PT ABC',
          tyre_type: '6x4',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          unitType: {
            id: 1,
            unit_name: 'Excavator',
            type_name: 'Heavy Equipment',
            model_name: 'PC200-8',
            brand: {
              id: 1,
              brand_name: 'Komatsu'
            }
          },
          activities: {
            id: 1,
            activity_name: 'Mining'
          },
          site: {
            id: 1,
            site_name: 'Site A'
          }
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
    description: 'Population tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Population tidak ditemukan',
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
    return this.populationService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ 
    summary: 'Membuat population baru',
    description: 'Membuat population baru dengan validasi duplikasi VIN number, no_unit, dan no_unit_system'
  })
  @SwaggerApiResponse({ 
    status: 201, 
    description: 'Population berhasil dibuat',
    type: PopulationResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Population berhasil dibuat',
        data: {
          id: 1,
          date_arrive: '2024-01-01T00:00:00.000Z',
          status: 'active',
          unit_type_id: 1,
          no_unit: 'EXC001',
          vin_number: 'VIN123456789',
          no_unit_system: 'SYS001',
          engine_brand: 'cummins',
          serial_engine: 'ENG123456',
          activities_id: 1,
          site_origin: 'Site A',
          remarks: 'Unit dalam kondisi baik',
          site_id: 1,
          company: 'PT ABC',
          tyre_type: '6x4',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          unitType: {
            id: 1,
            unit_name: 'Excavator',
            type_name: 'Heavy Equipment',
            model_name: 'PC200-8',
            brand: {
              id: 1,
              brand_name: 'Komatsu'
            }
          },
          activities: {
            id: 1,
            activity_name: 'Mining'
          },
          site: {
            id: 1,
            site_name: 'Site A'
          }
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
        message: 'date_arrive should not be empty',
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
    description: 'Population dengan data yang sama sudah terdaftar',
    schema: {
      example: {
        statusCode: 409,
        message: 'VIN number sudah terdaftar',
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
  create(@Body() dto: CreatePopulationDto) {
    return this.populationService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ 
    summary: 'Mengupdate data population berdasarkan ID',
    description: 'Mengupdate data population dengan validasi duplikasi VIN number, no_unit, dan no_unit_system'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Population berhasil diupdate',
    type: PopulationResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Population berhasil diupdate',
        data: {
          id: 1,
          date_arrive: '2024-01-01T00:00:00.000Z',
          status: 'active',
          unit_type_id: 1,
          no_unit: 'EXC001',
          vin_number: 'VIN123456789',
          no_unit_system: 'SYS001',
          engine_brand: 'cummins',
          serial_engine: 'ENG123456',
          activities_id: 1,
          site_origin: 'Site A',
          remarks: 'Unit dalam kondisi baik',
          site_id: 1,
          company: 'PT ABC',
          tyre_type: '6x4',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          unitType: {
            id: 1,
            unit_name: 'Excavator',
            type_name: 'Heavy Equipment',
            model_name: 'PC200-8',
            brand: {
              id: 1,
              brand_name: 'Komatsu'
            }
          },
          activities: {
            id: 1,
            activity_name: 'Mining'
          },
          site: {
            id: 1,
            site_name: 'Site A'
          }
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
        message: 'no_unit should not be empty',
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
    description: 'Population tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Population tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @SwaggerApiResponse({ 
    status: 409, 
    description: 'Population dengan data yang sama sudah digunakan oleh population lain',
    schema: {
      example: {
        statusCode: 409,
        message: 'VIN number sudah digunakan oleh population lain',
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
  update(@Param('id') id: number, @Body() dto: UpdatePopulationDto) {
    return this.populationService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Menghapus data population berdasarkan ID (soft delete)',
    description: 'Melakukan soft delete pada population (data tidak benar-benar dihapus dari database)'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Population berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Population berhasil dihapus',
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
    description: 'Population tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Population tidak ditemukan',
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
    return this.populationService.remove(id);
  }
}
