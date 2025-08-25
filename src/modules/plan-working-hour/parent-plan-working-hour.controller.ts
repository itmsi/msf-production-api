import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ParentPlanWorkingHourService } from './parent-plan-working-hour.service';
import { CreateParentPlanWorkingHourDto, ParentPlanWorkingHourResponseDto, ParentPlanWorkingHourSummaryResponseDto, GetParentPlanWorkingHourQueryDto } from './dto/parent-plan-working-hour.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { successResponse } from '../../common/helpers/response.helper';

@ApiTags('Parent Plan Working Hour')
@ApiBearerAuth('jwt')
@Controller('parent-plan-working-hour')
@UseGuards(JwtAuthGuard)
export class ParentPlanWorkingHourController {
  constructor(private readonly parentPlanWorkingHourService: ParentPlanWorkingHourService) {}

  @Post()
  @ApiOperation({
    summary: 'Buat Parent Plan Working Hour',
    description: `
      Membuat parent plan working hour beserta detail harian dan aktivitas secara otomatis.
      
      Proses yang akan dijalankan:
      1. Simpan data ke tabel r_parent_plan_working_hour
      2. Generate tanggal 01-31 sesuai bulan plan_date
      3. Simpan data harian ke tabel r_plan_working_hour
      4. Simpan detail aktivitas ke tabel r_plan_working_hour_detail
      
      Field yang akan diisi otomatis:
      - is_calender_day: true jika bukan hari minggu
      - is_holiday_day: true jika hari minggu
      - is_schedule_day: true jika bukan hari minggu
      - working_hour: total_working_hour ÷ jumlah hari di bulan
      - parent_plan_working_hour_id: ID dari parent yang dibuat
    `
  })
  @ApiBody({
    type: CreateParentPlanWorkingHourDto,
    description: 'Data parent plan working hour yang akan dibuat',
    examples: {
      example1: {
        summary: 'Contoh request dengan detail activities',
        value: {
          plan_date: "2025-08-21",
          total_calendar_day: 31,
          total_holiday_day: 8,
          total_available_day: 23,
          total_working_hour_month: 184,
          total_working_day_longshift: 5,
          total_working_hour_day: 8,
          total_working_hour_longshift: 12,
          total_mohh_per_month: 1000,
          detail: [
            {
              activities_id: 1,
              activities_hour: 1
            },
            {
              activities_id: 2,
              activities_hour: 1
            },
            {
              activities_id: 3,
              activities_hour: 1
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Parent plan working hour berhasil dibuat',
            schema: {
          example: {
            id: 1,
            plan_date: "2025-08-21T00:00:00.000Z",
            total_calendar_day: 31,
            total_holiday_day: 8,
            total_available_day: 23,
            total_working_hour_month: 184,
            total_working_day_longshift: 5,
            total_working_hour_day: 8,
            total_working_hour_longshift: 12,
            total_mohh_per_month: 1000,
            createdAt: "2025-08-21T00:00:00.000Z",
            updatedAt: "2025-08-21T00:00:00.000Z",
        planWorkingHours: [
          {
            id: 1,
            plan_date: "2025-08-01T00:00:00.000Z",
            is_calender_day: true,
            is_holiday_day: false,
            is_schedule_day: true,
            working_hour_month: 5.94,
            working_hour_day: 5.94,
            working_day_longshift: 5,
            working_hour_longshift: 12,
            mohh_per_month: 1000,
            parent_plan_working_hour_id: 1,
            createdAt: "2025-08-21T00:00:00.000Z",
            updatedAt: "2025-08-21T00:00:00.000Z"
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid atau terjadi error',
    schema: {
      example: {
        statusCode: 400,
        message: 'Gagal membuat parent plan working hour: Error message',
        error: 'Bad Request'
      }
    }
  })
  async create(@Body() createDto: CreateParentPlanWorkingHourDto) {
    const result = await this.parentPlanWorkingHourService.create(createDto);
    return successResponse(result, 'Parent plan working hour berhasil dibuat', 201);
  }

  @Get()
  @ApiOperation({
    summary: 'Ambil Semua Parent Plan Working Hour Summary',
    description: 'Mengambil semua data parent plan working hour dengan perhitungan summary sesuai spesifikasi. Mendukung filter, sorting, dan pagination.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Nomor halaman (default: 1)',
    example: '1'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Jumlah data per halaman (default: 10, max: 100)',
    example: '10'
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Filter berdasarkan bulan (1-12)',
    example: '8'
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field untuk sorting',
    enum: ['id', 'plan_date', 'createdAt', 'updatedAt'],
    example: 'id'
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Urutan sorting',
    enum: ['ASC', 'DESC'],
    example: 'DESC'
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar parent plan working hour summary berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Parent plan working hour summary berhasil diambil',
        data: [
          {
            parent_id: 1,
            month_year: "2025-08",
            schedule_day: 27,
            holiday_day: 4,
            working_hour_month: 216,
            working_hour_day: 7.2,
            working_hour_longshift: 14.4,
            working_day_longshift: 1.5,
            total_mohh: 100,
            total_delay: 10,
            total_idle: 10,
            total_breakdown: 10,
            ewh: 80,
            pa: 1.0,
            ma: 0.89,
            ua: 0.8,
            eu: 0.73,
            is_available_to_edit: true,
            is_available_to_delete: true
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          lastPage: 1
        }
      }
    }
  })
  async findAll(@Query() query: GetParentPlanWorkingHourQueryDto) {
    const result = await this.parentPlanWorkingHourService.findAllSummary(query);
    return result;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ambil Parent Plan Working Hour by ID',
    description: 'Mengambil data parent plan working hour berdasarkan ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID parent plan working hour',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Parent plan working hour berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Parent plan working hour berhasil diambil',
        data: {
          id: 1,
          plan_date: "2025-08-21T00:00:00.000Z",
          total_calendar_day: 31,
          total_holiday_day: 8,
          total_available_day: 23,
          total_working_hour: 184,
          total_working_day_longshift: 5,
          working_hour_longshift: 12,
          working_hour_longshift_day: 8.5,
          total_mohh_per_month: 1000,
          createdAt: "2025-08-21T00:00:00.000Z",
          updatedAt: "2025-08-21T00:00:00.000Z"
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak ditemukan',
    schema: {
      example: {
        statusCode: 400,
        message: 'Parent plan working hour dengan ID 1 tidak ditemukan',
        error: 'Bad Request'
      }
    }
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.parentPlanWorkingHourService.findOne(id);
    return successResponse(result, 'Parent plan working hour berhasil diambil');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Parent Plan Working Hour',
    description: 'Mengupdate data parent plan working hour berdasarkan ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID parent plan working hour',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Parent plan working hour berhasil diupdate',
    schema: {
      example: {
        statusCode: 200,
        message: 'Parent plan working hour berhasil diupdate',
        data: {
          id: 1,
          plan_date: "2025-08-21T00:00:00.000Z",
          total_calendar_day: 31,
          total_holiday_day: 8,
          total_available_day: 23,
          total_working_hour_month: 184,
          total_working_day_longshift: 5,
          total_working_hour_day: 8,
          total_working_hour_longshift: 12,
          total_mohh_per_month: 1000,
          createdAt: "2025-08-21T00:00:00.000Z",
          updatedAt: "2025-08-21T00:00:00.000Z"
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak ditemukan atau data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Parent plan working hour dengan ID 1 tidak ditemukan',
        error: 'Bad Request'
      }
    }
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateParentPlanWorkingHourDto>
  ) {
    const result = await this.parentPlanWorkingHourService.update(id, updateDto);
    return successResponse(result, 'Parent plan working hour berhasil diupdate');
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Hapus Parent Plan Working Hour',
    description: 'Menghapus data parent plan working hour berdasarkan ID (soft delete)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID parent plan working hour',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Parent plan working hour berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Parent plan working hour berhasil dihapus',
        data: null
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak ditemukan',
    schema: {
      example: {
        statusCode: 400,
        message: 'Parent plan working hour dengan ID 1 tidak ditemukan',
        error: 'Bad Request'
      }
    }
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.parentPlanWorkingHourService.remove(id);
    return successResponse(null, 'Parent plan working hour berhasil dihapus');
  }
}
