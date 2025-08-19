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
  UseInterceptors,
  UploadedFile,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PopulationService } from './population.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreatePopulationDto,
  GetPopulationsQueryDto,
  UpdatePopulationDto,
  PopulationResponseDto,
  ImportPopulationCsvDto,
  ImportPopulationPreviewResponseDto,
  ImportPopulationRequestDto,
  ImportPopulationResponseDto,
  FileUploadDto,
} from './dto/population.dto';

@ApiTags('Population')
@ApiBearerAuth('jwt')
@Controller('populations')
export class PopulationController {
  constructor(private readonly populationService: PopulationService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan semua data population dengan pagination, filtering, dan sorting',
    description:
      'Endpoint ini mendukung pagination, pencarian, filtering berdasarkan status, unit_type_id, activities_id, site_id, engine_brand, tyre_type, dan range tanggal, serta sorting berdasarkan field tertentu',
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
            no_unit: 'KFM-DT-0100',
            vin_number: 'VIN123456789',
            no_unit_system: 'SYS001',
            engine_brand: 'cummins',
            serial_engine: 'ENG123456',
            activities_id: 6,
            site_origin: 'Site A',
            remarks: 'RFU',
            site_id: 1,
            company: 'PT ABC',
            last_unit_number: 'LUN001',
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
                brand_name: 'Komatsu',
              },
            },
            activities: {
              id: 6,
              activity_name: 'Mining',
            },
            site: {
              id: 1,
              site_name: 'Site A',
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
  findAll(@Query() query: GetPopulationsQueryDto) {
    return this.populationService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data population berdasarkan ID',
    description:
      'Mengambil data population berdasarkan ID yang diberikan dengan relasi lengkap',
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
          no_unit: 'KFM-DT-0100',
          vin_number: 'VIN123456789',
          no_unit_system: 'SYS001',
          engine_brand: 'cummins',
          serial_engine: 'ENG123456',
          activities_id: 6,
          site_origin: 'Site A',
          remarks: 'RFU',
          site_id: 1,
          company: 'PT ABC',
          last_unit_number: 'LUN001',
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
              brand_name: 'Komatsu',
            },
          },
          activities: {
            id: 6,
            activity_name: 'Mining',
          },
          site: {
            id: 1,
            site_name: 'Site A',
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
    description: 'Population tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Population tidak ditemukan',
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
    return this.populationService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat population baru',
    description:
      'Membuat population baru dengan validasi duplikasi VIN number, no_unit, dan no_unit_system',
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
          no_unit: 'KFM-DT-0100',
          vin_number: 'VIN123456789',
          no_unit_system: 'SYS001',
          engine_brand: 'cummins',
          serial_engine: 'ENG123456',
          activities_id: 6,
          site_origin: 'Site A',
          remarks: 'RFU',
          site_id: 1,
          company: 'PT ABC',
          last_unit_number: 'LUN001',
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
              brand_name: 'Komatsu',
            },
          },
          activities: {
            id: 6,
            activity_name: 'Mining',
          },
          site: {
            id: 1,
            site_name: 'Site A',
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
        message: 'date_arrive should not be empty',
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
    description: 'Population dengan data yang sama sudah terdaftar',
    schema: {
      example: {
        statusCode: 409,
        message: 'VIN number sudah terdaftar',
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
  create(@Body() dto: CreatePopulationDto) {
    return this.populationService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data population berdasarkan ID',
    description:
      'Mengupdate data population dengan validasi duplikasi VIN number, no_unit, dan no_unit_system',
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
          no_unit: 'KFM-DT-0100',
          vin_number: 'VIN123456789',
          no_unit_system: 'SYS001',
          engine_brand: 'cummins',
          serial_engine: 'ENG123456',
          activities_id: 6,
          site_origin: 'Site A',
          remarks: 'RFU',
          site_id: 1,
          company: 'PT ABC',
          last_unit_number: 'LUN001',
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
              brand_name: 'Komatsu',
            },
          },
          activities: {
            id: 6,
            activity_name: 'Mining',
          },
          site: {
            id: 1,
            site_name: 'Site A',
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
        message: 'no_unit should not be empty',
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
    description: 'Population tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Population tidak ditemukan',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @SwaggerApiResponse({
    status: 409,
    description:
      'Population dengan data yang sama sudah digunakan oleh population lain',
    schema: {
      example: {
        statusCode: 409,
        message: 'VIN number sudah digunakan oleh population lain',
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
  update(@Param('id') id: number, @Body() dto: UpdatePopulationDto) {
    return this.populationService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data population berdasarkan ID (soft delete)',
    description:
      'Melakukan soft delete pada population (data tidak benar-benar dihapus dari database)',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Population berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Population berhasil dihapus',
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
    description: 'Population tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Population tidak ditemukan',
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
    return this.populationService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('import/preview')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File CSV yang akan di-preview',
    type: FileUploadDto,
  })
  @ApiOperation({
    summary: 'Preview import data population dari CSV',
    description:
      'Mengecek validitas data CSV sebelum import, memvalidasi unit_name, activities_name, dan site_id',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Preview import berhasil',
    type: ImportPopulationPreviewResponseDto,
    schema: {
      example: {
        status: 'error',
        message: 'unit_name tidak ada',
        data: [
          {
            status: 'error',
            message: 'unit_name tidak ada',
            row: 1,
            data: {
              date_arrive: '2025-01-01',
              status: 'active',
              unit_name: 'unit_name',
              no_unit: 'no_unit',
              vin_number: 'vin_number',
              no_unit_system: 'no_unit_system',
              serial_engine: 'serial_engine',
              engine_brand: 'engine_brand',
              activities_name: 'activities_name',
              user_site: 'user_site',
              site_origin: 'site_origin',
              remarks: 'RFU atau BD',
              site_name: 'site_name',
              company: 'company',
              last_unit_number: 'last_unit_number',
              tyre_type: '6x4 atau 8x4',
            },
          },
        ],
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - File tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'File harus berupa CSV',
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
  previewImport(@UploadedFile() file: Express.Multer.File) {
    return this.populationService.previewImport(file);
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
    summary: 'Import data population dari CSV',
    description:
      'Mengimport data population dari CSV ke database setelah validasi',
  })
  @SwaggerApiResponse({
    status: 201,
    description: 'Import data berhasil',
    schema: {
      example: {
        statusCode: 201,
        message: 'Data berhasil diimport',
        data: {
          total: 10,
          success: 8,
          failed: 2,
          details: [
            {
              status: 'success',
              message: 'Data berhasil diimport',
              row: 1,
              data: {
                date_arrive: '2025-01-01',
                status: 'active',
                unit_name: 'Excavator',
                no_unit: 'EXC001',
                vin_number: 'VIN123456789',
                no_unit_system: 'SYS001',
                serial_engine: 'ENG123456',
                engine_brand: 'cummins',
                activities_name: 'Mining',
                user_site: 'user_site',
                site_origin: 'Site A',
                remarks: 'RFU',
                site_name: 'Site A',
                company: 'PT ABC',
                last_unit_number: 'LUN001',
                tyre_type: '6x4',
              },
            },
          ],
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 400,
    description: 'Bad Request - File tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'File harus berupa CSV',
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
  importData(@UploadedFile() file: Express.Multer.File) {
    return this.populationService.importData(file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('import/template')
  @ApiOperation({ 
    summary: 'Download template CSV untuk import data population',
    description: 'Mendownload template CSV yang berisi format kolom yang diperlukan untuk import data population'
  })
  @SwaggerApiResponse({ 
    status: 200, 
    description: 'Template CSV berhasil didownload',
    schema: {
      example: {
        description: 'File CSV template'
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
  async downloadTemplate(@Res() res: Response) {
    try {
      const templateBuffer = await this.populationService.downloadTemplate();
      
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="template-population-import.csv"',
        'Content-Length': templateBuffer.length,
      });
      
      res.send(templateBuffer);
    } catch (error) {
      throw new InternalServerErrorException('Gagal download template CSV');
    }
  }
}
