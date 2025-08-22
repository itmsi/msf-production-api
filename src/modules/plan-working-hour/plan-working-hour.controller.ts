import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PlanWorkingHourService } from './plan-working-hour.service';
import {
  CreatePlanWorkingHourDto,
  UpdatePlanWorkingHourDto,
  QueryPlanWorkingHourDto,
  PlanWorkingHourDetailDto,
} from './dto/plan-working-hour.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { successResponse } from '../../common/helpers/response.helper';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PlanWorkingHourListResponseDto } from './dto/plan-working-hour.dto';

@ApiTags('Plan Working Hour')
@ApiBearerAuth('jwt')
@Controller('plan-working-hour')
@UseGuards(JwtAuthGuard)
export class PlanWorkingHourController {
  constructor(
    private readonly planWorkingHourService: PlanWorkingHourService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Membuat data plan working hour baru',
    description: `
      Endpoint untuk membuat data plan working hour baru.
      
      Field yang akan diisi otomatis:
      - is_calender_day: true jika plan_date terisi
      - is_holiday_day: false jika plan_date terisi  
      - is_schedule_day: true jika bukan hari minggu
      
      Validasi:
      - plan_date tidak boleh duplikat (sudah ada di database)
      - activities_id harus valid
      - activities_hour harus > 0
    `,
  })
  @ApiBody({
    type: CreatePlanWorkingHourDto,
    description: 'Data plan working hour yang akan dibuat',
    examples: {
      example1: {
        summary: 'Contoh request dengan detail activities',
        value: {
          plan_date: "2025-01-01",
          working_day_longshift: 1,
          working_hour_longshift: 1,
          working_hour: 1,
          mohh_per_month: 1,
          detail: [
            {
              activities_id: 1,
              activities_hour: 1,
            },
            {
              activities_id: 2,
              activities_hour: 1,
            },
            {
              activities_id: 3,
              activities_hour: 1,
            },
            {
              activities_id: 4,
              activities_hour: 1,
            },
            {
              activities_id: 5,
              activities_hour: 1,
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Data plan working hour berhasil dibuat',
    schema: {
      example: {
        id: 1,
        plan_date: "2025-01-01",
        is_calender_day: true,
        is_holiday_day: false,
        is_schedule_day: true,
        working_day_longshift: 1,
        working_hour_longshift: 1,
        working_hour: 1,
        mohh_per_month: 1,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
        details: [
          {
            id: 1,
            plant_working_hour_id: 1,
            activities_id: 1,
            activities_hour: 1,
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z"
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data untuk tanggal tersebut sudah ada',
    schema: {
      example: {
        statusCode: 400,
        message: "Data untuk tanggal 2025-08-25 sudah ada. Silakan gunakan tanggal yang berbeda.",
        error: "Bad Request"
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid atau expired'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error'
  })
  async create(@Body() createDto: CreatePlanWorkingHourDto) {
    const result = await this.planWorkingHourService.create(createDto);
    return successResponse(result, 'Plan working hour created successfully');
  }

  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua data plan working hour',
    description: `
      Endpoint untuk mendapatkan semua data plan working hour dengan filtering dan pagination.
      
      Response akan menambahkan field:
      - total_mohh: Total MOHH per bulan
      - total_delay: Total jam delay
      - total_idle: Total jam idle
      - total_repair: Total jam repair/breakdown
      - ewh: Effective Working Hours
      - pa: Production Availability
      - ma: Mechanical Availability
      - ua: Utilization Availability
      - eu: Equipment Utilization
      - is_available_to_edit: true jika plan_date > hari ini
      - is_available_to_delete: true jika plan_date > hari ini
    `,
  })
  @ApiQuery({ name: 'plan_date', required: false, type: String, description: 'Filter berdasarkan tanggal plan (format: YYYY-MM-DD)' })
  @ApiQuery({ name: 'start_date', required: false, type: String, description: 'Filter berdasarkan tanggal mulai (format: YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'Filter berdasarkan tanggal akhir (format: YYYY-MM-DD)' })
  @ApiQuery({ name: 'is_calender_day', required: false, type: Boolean, description: 'Filter berdasarkan calendar day' })
  @ApiQuery({ name: 'is_holiday_day', required: false, type: Boolean, description: 'Filter berdasarkan holiday day' })
  @ApiQuery({ name: 'is_schedule_day', required: false, type: Boolean, description: 'Filter berdasarkan schedule day' })
  @ApiQuery({ name: 'working_hour', required: false, type: Number, description: 'Filter berdasarkan working hour' })
  @ApiQuery({ name: 'working_day_longshift', required: false, type: Number, description: 'Filter berdasarkan working day longshift' })
  @ApiQuery({ name: 'working_hour_longshift', required: false, type: Number, description: 'Filter berdasarkan working hour longshift' })
  @ApiQuery({ name: 'mohh_per_month', required: false, type: Number, description: 'Filter berdasarkan MOHH per month' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Halaman yang akan ditampilkan (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Jumlah data per halaman (default: 10, max: 100)' })
  @ApiResponse({
    status: 200,
    description: 'Data plan working hour berhasil diambil',
    type: PlanWorkingHourListResponseDto
  })
  async findAll(@Query() query: QueryPlanWorkingHourDto) {
    const result = await this.planWorkingHourService.findAll(query);
    return result;
  }

  @Get('form')
  @ApiOperation({
    summary: 'Mendapatkan data activities untuk form plan working hour',
    description: `
      Endpoint untuk mendapatkan data activities yang dikelompokkan berdasarkan status.
      
      Data akan dikelompokkan secara dinamis berdasarkan status yang ada:
      - working: activities dengan status 'working'
      - delay: activities dengan status 'delay'
      - idle: activities dengan status 'idle'  
      - breakdown: activities dengan status 'breakdown'
      - [status]: activities dengan status lainnya (otomatis)
      
      Setiap activity memiliki field tambahan:
      - type_data: tipe data yang diharapkan (default: 'number')
      - type_field: tipe field input (default: 'input')
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Data activities berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Plan working hour form data',
        data: [
          {
            "name": "Delay",
            "group_detail": [
              {
                "id": 1,
                "name": "P5M",
                "type_data": "number",
                "type_field": "input"
              },
              {
                "id": 2,
                "name": "P2H",
                "type_data": "number",
                "type_field": "input"
              }
            ]
          },
          {
            "name": "Idle",
            "group_detail": [
              {
                "id": 3,
                "name": "P1H",
                "type_data": "number",
                "type_field": "input"
              },
              {
                "id": 4,
                "name": "P7H",
                "type_data": "number",
                "type_field": "input"
              }
            ]
          }
        ]
      }
    }
  })
  async getFormData() {
    const result = await this.planWorkingHourService.getFormData();
    return successResponse(result, 'Plan working hour form data');
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Mendapatkan summary working hours berdasarkan range tanggal',
    description: 'Endpoint untuk mendapatkan summary working hours dalam rentang tanggal tertentu',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Tanggal mulai (format: YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'Tanggal akhir (format: YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Summary working hours berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Working hours summary retrieved successfully',
        data: {
          totalWorkingHours: 160,
          totalWorkingDays: 20,
          totalHolidayDays: 2,
          averageWorkingHoursPerDay: 8,
        }
      }
    }
  })
  async getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const result = await this.planWorkingHourService.getWorkingHoursSummary(
      new Date(startDate),
      new Date(endDate),
    );
    return successResponse(result, 'Working hours summary retrieved successfully');
  }

  @Get('date-range')
  @ApiOperation({
    summary: 'Mendapatkan data plan working hour berdasarkan range tanggal',
    description: 'Endpoint untuk mendapatkan data plan working hour dalam rentang tanggal tertentu',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Tanggal mulai (format: YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'Tanggal akhir (format: YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Data plan working hour berdasarkan range tanggal berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Plan working hours by date range retrieved successfully',
        data: [
          {
            id: 1,
            plan_date: "2025-01-01",
            working_day_longshift: 1,
            working_hour_longshift: 1,
                            activities_hour: 1,
            mohh_per_month: 1,
            is_available_to_edit: true,
            is_available_to_delete: true,
            details: [
              {
                id: 1,
                activities_id: 1,
                activities_hour: 1,
              }
            ],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          }
        ]
      }
    }
  })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const result = await this.planWorkingHourService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
    return successResponse(result, 'Plan working hours by date range retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data plan working hour berdasarkan ID',
    description: 'Endpoint untuk mendapatkan data plan working hour berdasarkan ID tertentu',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID plan working hour' })
  @ApiResponse({
    status: 200,
    description: 'Data plan working hour berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Plan working hour retrieved successfully',
        data: {
          id: 1,
          plan_date: "2025-01-01",
          working_day_longshift: 1,
          working_hour_longshift: 1,
                          activities_hour: 1,
          mohh_per_month: 1,
          is_available_to_edit: true,
          is_available_to_delete: true,
          details: [
            {
              id: 1,
              activities_id: 1,
              activities_hour: 1,
            }
          ],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Plan working hour tidak ditemukan',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.planWorkingHourService.findOne(id);
    return successResponse(result, 'Plan working hour retrieved successfully');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mengupdate data plan working hour berdasarkan ID',
    description: 'Endpoint untuk mengupdate data plan working hour berdasarkan ID tertentu',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID plan working hour' })
  @ApiBody({
    type: UpdatePlanWorkingHourDto,
    description: 'Data plan working hour yang akan diupdate',
  })
  @ApiResponse({
    status: 200,
    description: 'Data plan working hour berhasil diupdate',
    schema: {
      example: {
        statusCode: 200,
        message: 'Plan working hour updated successfully',
        data: {
          id: 1,
          plan_date: "2025-01-01",
          working_day_longshift: 1,
          working_hour_longshift: 1,
                          activities_hour: 1,
          mohh_per_month: 1,
          is_available_to_edit: true,
          is_available_to_delete: true,
          details: [
            {
              id: 1,
              activities_id: 1,
              activities_hour: 1,
            }
          ],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Plan working hour tidak ditemukan',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePlanWorkingHourDto,
  ) {
    const result = await this.planWorkingHourService.update(id, updateDto);
    return successResponse(result, 'Plan working hour updated successfully');
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data plan working hour berdasarkan ID',
    description: 'Endpoint untuk menghapus data plan working hour berdasarkan ID tertentu (soft delete)',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID plan working hour' })
  @ApiResponse({
    status: 200,
    description: 'Data plan working hour berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Plan working hour deleted successfully',
        data: null
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Plan working hour tidak ditemukan',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.planWorkingHourService.remove(id);
    return successResponse(null, 'Plan working hour deleted successfully');
  }
}
