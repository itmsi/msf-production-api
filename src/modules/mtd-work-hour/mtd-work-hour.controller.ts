import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MtdWorkHourService } from './mtd-work-hour.service';
import { MtdWorkHourQueryDto, MtdWorkHourResponseDto, MtdWorkHourSummaryDto, ProblemType } from './dto/mtd-work-hour.dto';

@ApiTags('MTD Work Hour')
@ApiBearerAuth('jwt')
@Controller('mtd-work-hour')
export class MtdWorkHourController {
  constructor(private readonly mtdWorkHourService: MtdWorkHourService) {}

  @Get()
  @ApiOperation({
    summary: 'Get MTD Work Hour Data',
    description: 'Mengambil data MTD Work Hour berdasarkan filter tanggal, unit, dan jenis problem',
  })
  @ApiResponse({
    status: 200,
    description: 'Data MTD Work Hour berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Data MTD Work Hour berhasil diambil',
        data: [
          {
            unit: 'DT-001',
            totalDuration: 24.5,
            problems: [
              {
                unit: 'DT-001',
                activityDate: '2024-01-15',
                problemType: 'P5M',
                duration: 2.5,
                description: 'P5M - Preventive Maintenance',
                totalDuration: 2.5,
              },
              {
                unit: 'DT-001',
                activityDate: '2024-01-15',
                problemType: 'GST',
                duration: 1.0,
                description: 'GST - General Service Time',
                totalDuration: 1.0,
              },
            ],
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Parameter tidak valid',
  })
  async getMtdWorkHourData(@Query() query: MtdWorkHourQueryDto) {
    return this.mtdWorkHourService.getMtdWorkHourData(query);
  }

  @Get('by-problem-type')
  @ApiOperation({
    summary: 'Get MTD Work Hour by Problem Type',
    description: 'Mengambil data MTD Work Hour berdasarkan jenis problem tertentu',
  })
  @ApiResponse({
    status: 200,
    description: 'Data MTD Work Hour berdasarkan problem type berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Data P5M berhasil diambil',
        data: [
          {
            unit: 'DT-001',
            activityDate: '2024-01-15',
            problemType: 'P5M',
            duration: 2.5,
            description: 'P5M - Preventive Maintenance',
            totalDuration: 2.5,
          },
          {
            unit: 'DT-002',
            activityDate: '2024-01-15',
            problemType: 'P5M',
            duration: 3.0,
            description: 'P5M - Preventive Maintenance',
            totalDuration: 3.0,
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Problem type harus diisi',
  })
  async getMtdWorkHourByProblemType(@Query() query: MtdWorkHourQueryDto) {
    return this.mtdWorkHourService.getMtdWorkHourByProblemType(query);
  }

  @Get('all-problem-types')
  @ApiOperation({
    summary: 'Get MTD Work Hour by All Problem Types',
    description: 'Mengambil data MTD Work Hour berdasarkan semua problem type yang spesifik sesuai requirement',
  })
  @ApiResponse({
    status: 200,
    description: 'Data MTD Work Hour berdasarkan semua problem types berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Data MTD Work Hour berdasarkan semua problem types berhasil diambil',
        data: [
          {
            unit: 'DT-001',
            p5m: 2.5,
            pergShift: 1.0,
            restTime: 0.5,
            gst: 1.5,
            travelling: 2.0,
            perbaikanFrontLoading: 0.0,
            cekElevasi: 0.5,
            refuelling: 1.0,
            slippery: 0.0,
            travellingEquipment: 0.5,
            fogging: 0.0,
            safetyTalk: 0.5,
            p2h: 1.0,
            totalDuration: 11.0,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Parameter tidak valid',
  })
  async getMtdWorkHourByAllProblemTypes(@Query() query: MtdWorkHourQueryDto) {
    return this.mtdWorkHourService.getMtdWorkHourByAllProblemTypes(query);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get MTD Work Hour Summary',
    description: 'Mengambil summary data MTD Work Hour berdasarkan jenis problem',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary data MTD Work Hour berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Summary data berhasil diambil',
        data: [
          {
            problemType: 'P5M',
            totalDuration: 15.5,
            count: 5,
            averageDuration: 3.1,
          },
          {
            problemType: 'GST',
            totalDuration: 8.0,
            count: 4,
            averageDuration: 2.0,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Parameter tidak valid',
  })
  async getMtdWorkHourSummary(@Query() query: MtdWorkHourQueryDto) {
    return this.mtdWorkHourService.getMtdWorkHourSummary(query);
  }

  @Get('problem-types')
  @ApiOperation({
    summary: 'Get Available Problem Types',
    description: 'Mengambil daftar jenis problem yang tersedia',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar jenis problem berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Daftar jenis problem berhasil diambil',
        data: [
          'P5M',
          'Perg. Shift',
          'Rest Time',
          'GST',
          'Travelling',
          'Perbaikan Front Loading',
          'Cek Elevasi',
          'Refuelling',
          'Slippery',
          'Travelling Equipment',
          'Fogging',
          'Safety Talk',
          'P2H',
        ],
      },
    },
  })
  async getProblemTypes() {
    return {
      statusCode: 200,
      message: 'Daftar jenis problem berhasil diambil',
      data: Object.values(ProblemType),
    };
  }
}
