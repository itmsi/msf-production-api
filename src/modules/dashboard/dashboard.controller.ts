import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { QueryDashboardMetricsDto } from './dto/query-dashboard-metrics.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('jwt')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/spider-achievement')
  @ApiOperation({
    summary: 'Mendapatkan Spider Chart Metrics',
    description: 'Mengambil semua data untuk di jadikan metrics spider chart berdasarkan jarak tanggal.',
  })
  
  async findAll(
    @Query() query: QueryDashboardMetricsDto
  ){   
    return this.dashboardService.findAll(query);
  }
  
  // MTD Achievement Endpoint
  @Get('/mtd-achievement')
  @ApiOperation({
    summary: 'Mendapatkan Spider Chart Metrics',
    description: 'Mengambil semua data untuk di jadikan metrics spider chart berdasarkan jarak tanggal.',
  })

  async getMtdAchievement(){
    return this.dashboardService.getMtdAchievement();
  }
}