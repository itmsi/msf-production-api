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
      Endpoint untuk membuat data plan working hour baru dengan detail activities.
      
      Field yang akan di-auto-fill:
      - is_calender_day: true jika plan_date terisi
      - is_holiday_day: false jika plan_date terisi  
      - is_schedule_day: true jika plan_date bukan hari minggu
      
      Detail activities akan disimpan ke table r_plan_working_hour_detail
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
          is_calender_day: true,
          is_holiday_day: false,
          is_schedule_day: true,
          working_day_longshift: 1,
          working_hour_longshift: 1,
          working_hour: 1,
          mohh_per_month: 1,
          detail: [
            {
              activities_id: 1,
              working_hour: 1,
            },
            {
              activities_id: 2,
              working_hour: 1,
            },
            {
              activities_id: 3,
              working_hour: 1,
            },
            {
              activities_id: 4,
              working_hour: 1,
            },
            {
              activities_id: 5,
              working_hour: 1,
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Plan working hour berhasil dibuat',
    schema: {
      example: {
        statusCode: 201,
        message: 'Plan working hour created successfully',
        data: {
          id: 1,
          plan_date: "2025-01-01",
          is_calender_day: true,
          is_holiday_day: false,
          is_schedule_day: true,
          working_day_longshift: 1,
          working_hour_longshift: 1,
          working_hour: 1,
          mohh_per_month: 1,
          is_available_to_edit: true,
          is_available_to_delete: true,
          details: [
            {
              id: 1,
              activities_id: 1,
              working_hour: 1,
            }
          ],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
  })
  async create(@Body() createDto: CreatePlanWorkingHourDto) {
    const result = await this.planWorkingHourService.create(createDto);
    return successResponse(result, 'Plan working hour created successfully');
  }

  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua data plan working hour',
    description: `
      Endpoint untuk mendapatkan semua data plan working hour dengan filtering.
      
      Response akan menambahkan field:
      - is_available_to_edit: true jika plan_date > hari ini
      - is_available_to_delete: true jika plan_date > hari ini
    `,
  })
  @ApiQuery({ name: 'plan_date', required: false, type: String, description: 'Filter berdasarkan tanggal plan' })
  @ApiQuery({ name: 'is_calender_day', required: false, type: Boolean, description: 'Filter berdasarkan calendar day' })
  @ApiQuery({ name: 'is_holiday_day', required: false, type: Boolean, description: 'Filter berdasarkan holiday day' })
  @ApiQuery({ name: 'is_schedule_day', required: false, type: Boolean, description: 'Filter berdasarkan schedule day' })
  @ApiQuery({ name: 'working_hour', required: false, type: Number, description: 'Filter berdasarkan working hour' })
  @ApiQuery({ name: 'working_day_longshift', required: false, type: Number, description: 'Filter berdasarkan working day longshift' })
  @ApiQuery({ name: 'working_hour_longshift', required: false, type: Number, description: 'Filter berdasarkan working hour longshift' })
  @ApiQuery({ name: 'mohh_per_month', required: false, type: Number, description: 'Filter berdasarkan MOHH per month' })
  @ApiResponse({
    status: 200,
    description: 'Data plan working hour berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Plan working hours retrieved successfully',
        data: [
          {
            id: 1,
            plan_date: "2025-01-01",
            is_calender_day: true,
            is_holiday_day: false,
            is_schedule_day: true,
            working_day_longshift: 1,
            working_hour_longshift: 1,
            working_hour: 1,
            mohh_per_month: 1,
            is_available_to_edit: true,
            is_available_to_delete: true,
            details: [
              {
                id: 1,
                activities_id: 1,
                working_hour: 1,
              }
            ],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          }
        ]
      }
    }
  })
  async findAll(@Query() query: QueryPlanWorkingHourDto) {
    const result = await this.planWorkingHourService.findAll(query);
    return successResponse(result, 'Plan working hours retrieved successfully');
  }

  @Get('form')
  @ApiOperation({
    summary: 'Mendapatkan data activities untuk form plan working hour',
    description: `
      Endpoint untuk mendapatkan data activities yang dikelompokkan berdasarkan status.
      
      Data akan dikelompokkan secara dinamis berdasarkan status yang ada:
      - data_working: activities dengan status 'working'
      - data_delay: activities dengan status 'delay'
      - data_idle: activities dengan status 'idle'  
      - data_breakdown: activities dengan status 'breakdown'
      - data_[status]: activities dengan status lainnya (otomatis)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Data activities berhasil diambil',
    schema: {
      example: {
        statusCode: 200,
        message: 'Plan working hour form data',
        data: {
          data_working: [
            {
              id: 1,
              name: "Loading Barge"
            }
          ],
          data_delay: [
            {
              id: 2,
              name: "P5M"
            }
          ],
          data_idle: [
            {
              id: 3,
              name: "Waiting"
            }
          ],
          data_breakdown: [
            {
              id: 4,
              name: "Maintenance"
            }
          ]
        }
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
            is_calender_day: true,
            is_holiday_day: false,
            is_schedule_day: true,
            working_day_longshift: 1,
            working_hour_longshift: 1,
            working_hour: 1,
            mohh_per_month: 1,
            is_available_to_edit: true,
            is_available_to_delete: true,
            details: [
              {
                id: 1,
                activities_id: 1,
                working_hour: 1,
              }
            ],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
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
          is_calender_day: true,
          is_holiday_day: false,
          is_schedule_day: true,
          working_day_longshift: 1,
          working_hour_longshift: 1,
          working_hour: 1,
          mohh_per_month: 1,
          is_available_to_edit: true,
          is_available_to_delete: true,
          details: [
            {
              id: 1,
              activities_id: 1,
              working_hour: 1,
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
          is_calender_day: true,
          is_holiday_day: false,
          is_schedule_day: true,
          working_day_longshift: 1,
          working_hour_longshift: 1,
          working_hour: 1,
          mohh_per_month: 1,
          is_available_to_edit: true,
          is_available_to_delete: true,
          details: [
            {
              id: 1,
              activities_id: 1,
              working_hour: 1,
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
