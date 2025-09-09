import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { ControlDayWorkHourService } from './control-day-work-hour.service';
import {
  GetControlDayWorkHourDto,
  ControlDayWorkHourListResponseDto,
} from './dto/control-day-work-hour.dto';

@ApiTags('Control Day Work Hour')
@Controller('control-day-work-hour')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ControlDayWorkHourController {
  constructor(
    private readonly controlDayWorkHourService: ControlDayWorkHourService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Control Day Work Hour Data',
    description: `
      Mengambil data Control Day Work Hour berdasarkan spesifikasi:
      
      **Data Sources:**
      - **Unit**: Dari data master population (m_population)
      - **Shift**: Dari Production[Shift] (r_plan_production)
      
      **Problem Types dari Effective Working Hours (r_loss_time):**
      - P5M
      - Perg. Shift
      - Rest Time
      - GST
      - Travelling
      - Perbaikan Front Loading
      - Cek Elevasi
      - Refuelling
      - Slippery
      - Travelling Equipment
      - Fogging
      - Safety Talk
      - P2H
      
      **Logic:**
      - Control Day Work Hour[Unit] == Group By Effective Working Hour[Unit]
      - Jika filter tanggal X sampai Y, tanggal yang diambil hanya Y
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data Control Day Work Hour berhasil diambil',
    type: ControlDayWorkHourListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Token tidak valid',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Parameter tidak valid',
  })
  async getControlDayWorkHour(
    @Query() query: GetControlDayWorkHourDto,
  ): Promise<ControlDayWorkHourListResponseDto> {
    return this.controlDayWorkHourService.getControlDayWorkHour(query);
  }

  @Get('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate Control Day Work Hour Data',
    description: `
      Generate data Control Day Work Hour berdasarkan data yang ada di database.
      Endpoint ini akan mengambil data dari Population, Production, dan Effective Working Hours
      kemudian mengolahnya sesuai dengan spesifikasi yang diberikan.
      
      **Parameter:**
      - startDate: Tanggal mulai filter
      - endDate: Tanggal akhir filter (yang akan digunakan sebagai filterDate)
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data Control Day Work Hour berhasil di-generate',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Token tidak valid',
  })
  async generateControlDayWorkHourData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<{ message: string }> {
    await this.controlDayWorkHourService.generateControlDayWorkHourData(
      startDate,
      endDate,
    );
    
    return {
      message: 'Data Control Day Work Hour berhasil di-generate',
    };
  }
}
