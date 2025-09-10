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
@ApiBearerAuth('jwt')
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
      - **Unit**: Dari data master population (m_population) dengan status active
      - **Shift**: Dari tabel r_loss_time berdasarkan data yang ada untuk unit dan tanggal tersebut
      
      **Problem Types dari Effective Working Hours (r_loss_time):**
      - P5M: Ambil dari duration tabel r_loss_time where problem = "P5M" group by no_unit and selected date
      - Pergantian Shift: Ambil dari duration tabel r_loss_time where problem = "Pergantian Shift" group by no_unit and selected date
      - Rest Time: Ambil dari duration tabel r_loss_time where problem = "Rest Time" group by no_unit and selected date
      - GST: Ambil dari duration tabel r_loss_time where problem = "GST" group by no_unit and selected date
      - Travelling: Ambil dari duration tabel r_loss_time where problem = "Travelling" group by no_unit and selected date
      - Perbaikan Front Loading: Ambil dari duration tabel r_loss_time where problem = "Perbaikan Front Loading" group by no_unit and selected date
      - Cek Elevasi: Ambil dari duration tabel r_loss_time where problem = "Cek Elevasi" group by no_unit and selected date
      - Refuelling: Ambil dari duration tabel r_loss_time where problem = "Refuelling" group by no_unit and selected date
      - Slippery: Ambil dari duration tabel r_loss_time where problem = "Slippery" group by no_unit and selected date
      - Travelling Equipment: Ambil dari duration tabel r_loss_time where problem = "Travelling Equipment" group by no_unit and selected date
      - Fogging: Ambil dari duration tabel r_loss_time where problem = "Fogging" group by no_unit and selected date
      - Safety Talk: Ambil dari duration tabel r_loss_time where problem = "Safety Talk" group by no_unit and selected date
      - P2H: Ambil dari duration tabel r_loss_time where problem = "P2H" group by no_unit and selected date
      
      **Logic:**
      - Data diambil langsung dari tabel r_loss_time dan m_population tanpa menggunakan tabel control_day_work_hour
      - Jika filter tanggal X sampai Y, tanggal yang diambil hanya Y (endDate)
      - Jika tidak ada parameter tanggal yang disediakan, akan menggunakan tanggal hari ini sebagai default
      - Data dikelompokkan berdasarkan unit dan shift
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

}
