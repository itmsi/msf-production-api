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
import { CcrDashboardService } from './ccr-dashboard.service';
import { BargingSummaryResponseDto, CcrActivitesResponseDto, FleetStatusResponseDto, ResponseDto, TonnageResponseDto } from './dto/ccr-dashboard.dto';


@ApiTags('Central Control Room')
@Controller('ccr')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class CcrDashboardController {
  constructor(
    private readonly ccrDashboardService: CcrDashboardService,
  ) {}

  @Get('hauling-summary')
  async getHaulingSummary(): Promise<ResponseDto> {
    return this.ccrDashboardService.getHaulingSummary();
  }

  @Get('fleet-status')
  async getFleetStatus(): Promise<FleetStatusResponseDto>{ 
    return this.ccrDashboardService.getFleetStatus();
  }

  @Get('tonnage')
  async getTonnage(): Promise<TonnageResponseDto>{ 
    return this.ccrDashboardService.getTonnage();
  }

  @Get('barging-summary')
  async getBargingSumary(): Promise<BargingSummaryResponseDto> {
    return this.ccrDashboardService.getBargingSummary();
  }

  @Get('activities')
  async getAcitivites(): Promise<CcrActivitesResponseDto> {
    return this.ccrDashboardService.getActivities();
  }

}
