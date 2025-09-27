import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MtdProductionService } from './mtd-production.service';
import { MtdProductionQueryDto, DayProductionQueryDto, MtdProductionResponseDto } from './dto/mtd-production.dto';

@ApiTags('Control MTD Production')
@ApiBearerAuth('jwt')
@Controller('control')
export class MtdProductionController {
  constructor(private readonly controlMtdProductionService: MtdProductionService) {}

  @Get('mtd-production')
  @ApiOperation({
    summary: 'Get MTD Production Data',
    description: 'Mengambil data produksi Month-to-Date dengan filter tanggal, unit, dan pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Data MTD Production berhasil diambil',
    type: MtdProductionResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Data berhasil diambil',
        data: [
          {
            activity_date: '2025-10-01',
            tyre_type: '6x4',
            no_unit: 'KFM-DT-001',
            shift: 'ds',
            mohh: 24,
            standby_time: 2,
            breakdown_time: 3.5,
            ewh_time: 35,
            km: 500,
            hm: 0,
            speed: 0,
            ct: 0,
            pa: 0,
            ua: 0,
            ma: 0,
            eu: 0,
            ore_hauling: 5,
            quarry: 0,
            ob: 0,
            boulder: 20,
            ore_barge: 8,
            ore_hauling_tonnage: 132.8,
            quarry_tonnage: 0,
            ore_barge_tonnage: 212.48,
            boulder_tonnage: 0,
            ob_tonnage: 0,
            sr: 0,
          },
        ],
        pagination: {
          total: 7,
          page: 1,
          limit: 10,
          lastPage: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Parameter tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Gagal mendapatkan data: Invalid date format',
        error: true,
        timestamp: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  async getControlMTDProduction(@Query() query: MtdProductionQueryDto) {
    return this.controlMtdProductionService.getMtdProduction(query);
  }

  @Get('day-production')
  @ApiOperation({
    summary: 'Get Daily Production Data',
    description: 'Mengambil data produksi harian dengan grouping berdasarkan NS/DS dan filter tanggal, shift, unit, dan pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Data Daily Production berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Data berhasil diambil',
        data: [
          {
            activity_date: '2025-10-01',
            tyre_type: '6x4',
            no_unit: 'KFM-DT-001',
            shift: 'ds',
            mohh: 24,
            standby_time: 2,
            breakdown_time: 3.5,
            ewh_time: 35,
            pa: 0,
            ua: 0,
            ma: 0,
            eu: 0,
            ore_hauling: 5,
            quarry: 0,
            ob: 0,
            boulder: 20,
            ore_barge: 8,
            ore_hauling_tonnage: 132.8,
            quarry_tonnage: 0,
            ore_barge_tonnage: 212.48,
            boulder_tonnage: 0,
            ob_tonnage: 0,
            sr: 0,
          },
        ],
        pagination: {
          total: 7,
          page: 1,
          limit: 10,
          lastPage: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Parameter tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Gagal mendapatkan data: Invalid date format',
        error: true,
        timestamp: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @ApiQuery({
    name: 'shift',
    required: false,
    description: 'Shift type (DS/NS)',
    example: 'DS',
  })
  @ApiQuery({
    name: 'unit',
    required: false,
    description: 'Unit number',
    example: 'DT-001',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: '10',
  })
  async getControlDayProduction(@Query() query: DayProductionQueryDto) {
    return this.controlMtdProductionService.getDayProduction(query);
  }

  //   @Get('mtd-work-hour')
  //   @ApiOperation({
  //     summary: 'Get MTD Work Hour Data',
  //     description:
  //       'Mengambil data jam kerja Month-to-Date dengan filter tanggal dan pagination',
  //   })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Data MTD Work Hour berhasil diambil',
  //     schema: {
  //       example: {
  //         statusCode: 200,
  //         message: 'success',
  //         data: [],
  //       },
  //     },
  //   })
  //   @ApiResponse({
  //     status: 400,
  //     description: 'Bad Request - Parameter tidak valid',
  //     schema: {
  //       example: {
  //         statusCode: 400,
  //         message: 'Gagal mendapatkan data',
  //         error: true,
  //         timestamp: '2025-01-15T10:30:00.000Z',
  //       },
  //     },
  //   })
  //   async getControlMTDWorkHour(@Query() query: MtdProductionQueryDto) {
  //     return await query;
  //   }

  @Get('day-work-hour')
  @ApiOperation({
    summary: 'Get Daily Work Hour Data',
    description: 'Mengambil data jam kerja harian dengan filter tanggal dan pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Data Daily Work Hour berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'success',
        data: [],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Parameter tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Gagal mendapatkan data',
        error: true,
        timestamp: '2025-01-15T10:30:00.000Z',
      },
    },
  })
  getControlDayWorkHour(@Query() query: MtdProductionQueryDto) {
    return this.controlMtdProductionService.getDayWorkHour(query);
  }
}
