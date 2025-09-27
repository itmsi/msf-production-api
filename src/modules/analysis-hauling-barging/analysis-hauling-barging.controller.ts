import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { AnalysisHaulingBargingService } from './analysis-hauling-barging.service';
import { AnalysisHaulingBargingFilterDto, AnalysisHaulingBargingResponseDto } from './dto/analysis-hauling-barging.dto';

@ApiTags('Analysis Hauling Barging')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('analysis-hauling-barging')
export class AnalysisHaulingBargingController {
  constructor(private readonly analysisHaulingBargingService: AnalysisHaulingBargingService) {}

  @Get()
  @ApiOperation({
    summary: 'Mengambil data analysis hauling barging',
    description: 'Mengambil data analisis hauling dan barging dengan filter tanggal dan pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Data analysis hauling barging berhasil diambil',
    type: [AnalysisHaulingBargingResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAnalysisData(@Query() filterDto: AnalysisHaulingBargingFilterDto) {
    return await this.analysisHaulingBargingService.getAnalysisData(filterDto);
  }
}
