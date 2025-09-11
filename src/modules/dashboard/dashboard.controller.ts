import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  SpiderResponseDto,
  AchievementResponseDto,
  HaulingResponseDto,
  BargeResponseDto,
  TmmResponseDto,
  LostTimeResponseDto,
  DailyAchievementResponseDto,
  BargeListResponseDto,
  BargeStatusResponseDto,
  LostTimeSummaryResponseDto,
  MonthlyStatusResponseDto,
  TrendHaulingBargingResponseDto,
  TrendFuelRatioResponseDto,
  TrendPerformanceUnitResponseDto,
} from './dto/dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('jwt')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('spider')
  @ApiOperation({ summary: 'Get spider chart data', description: 'Retrieve data for spider chart with metrics CT, Prod, EWH, FR, and Speed' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved spider chart data', type: SpiderResponseDto })
  async getSpiderData() {
    return this.dashboardService.getSpiderData();
  }

  @Get('mtd-achievment')
  @ApiOperation({ summary: 'Get MTD achievement data', description: 'Retrieve Month-to-Date achievement data for various activities' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved MTD achievement data', type: AchievementResponseDto })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for filtering (YYYY-MM-DD format)', example: '2025-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for filtering (YYYY-MM-DD format)', example: '2025-01-31' })
  async getMtdAchievement(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.dashboardService.getMtdAchievement(startDate, endDate);
  }

  @Get('hauling')
  @ApiOperation({ summary: 'Get hauling data', description: 'Retrieve daily hauling data with target, actual, and weather conditions' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved hauling data', type: HaulingResponseDto })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date in YYYY-MM-DD format' })
  async getHaulingData(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.dashboardService.getHaulingData(startDate, endDate);
  }

  @Get('barge')
  @ApiOperation({ summary: 'Get barge data', description: 'Retrieve daily barge and hauling data' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved barge data', type: BargeResponseDto })
  async getBargeData() {
    return this.dashboardService.getBargeData();
  }

  @Get('tmm')
  @ApiOperation({ summary: 'Get TMM data', description: 'Retrieve Total Material Movement (TMM) daily data' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved TMM data', type: TmmResponseDto })
  async getTmmData() {
    return this.dashboardService.getTmmData();
  }

  @Get('lost-time')
  @ApiOperation({ summary: 'Get lost time data', description: 'Retrieve lost time data by category' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved lost time data', type: LostTimeResponseDto })
  async getLostTimeData() {
    return this.dashboardService.getLostTimeData();
  }

  @Get('daily-achievment')
  @ApiOperation({ summary: 'Get daily achievement data', description: 'Retrieve daily achievement data for various shifts' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved daily achievement data', type: DailyAchievementResponseDto })
  @ApiQuery({ name: 'selectedDate', required: false, description: 'Selected date (YYYY-MM-DD)', example: '2025-01-15' })
  async getDailyAchievement(@Query('selectedDate') selectedDate?: string) {
    return this.dashboardService.getDailyAchievement(selectedDate);
  }

  @Get('barge-list')
  @ApiOperation({ summary: 'Get barge list', description: 'Retrieve barge list and capacity details' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved barge list data', type: BargeListResponseDto })
  async getBargeList() {
    return this.dashboardService.getBargeList();
  }

  @Get('barge-status')
  @ApiOperation({ summary: 'Get barge status data', description: 'Retrieve barge status with barging ore, list, and gain lost data' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved barge status data', type: BargeStatusResponseDto })
  async getBargeStatus() {
    return this.dashboardService.getBargeStatus();
  }

  @Get('lost-time-summary')
  @ApiOperation({ summary: 'Get lost time summary data', description: 'Retrieve lost time summary with MOHH, lost time, and tables data' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved lost time summary data', type: LostTimeSummaryResponseDto })
  async getLostTimeSummary() {
    return this.dashboardService.getLostTimeSummary();
  }

  @Get('monthly/status')
  @ApiOperation({ summary: 'Get monthly status data', description: 'Retrieve monthly status data for various activities with progress charts' })
  @ApiQuery({ name: 'month', description: 'Month in YYYY-MM format', example: '2025-09' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved monthly status data', type: MonthlyStatusResponseDto })
  async getMonthlyStatus(@Query('month') month: string) {
    return this.dashboardService.getMonthlyStatus(month);
  }

  @Get('monthly/trend-hauling-barging')
  @ApiOperation({ summary: 'Get monthly trend hauling barging data', description: 'Retrieve monthly trend data for hauling and barging with weather conditions' })
  @ApiQuery({ name: 'month', description: 'Month in YYYY-MM format', example: '2025-09' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved trend hauling barging data', type: TrendHaulingBargingResponseDto })
  async getTrendHaulingBarging(@Query('month') month: string) {
    return this.dashboardService.getTrendHaulingBarging(month);
  }

  @Get('monthly/trend-fuel-ratio')
  @ApiOperation({ summary: 'Get monthly trend fuel ratio data', description: 'Retrieve monthly trend data for fuel ratio (FR) and specific ratio (SR)' })
  @ApiQuery({ name: 'month', description: 'Month in YYYY-MM format', example: '2025-09' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved trend fuel ratio data', type: TrendFuelRatioResponseDto })
  async getTrendFuelRatio(@Query('month') month: string) {
    return this.dashboardService.getTrendFuelRatio(month);
  }

  @Get('monthly/trend-performance-unit')
  @ApiOperation({ summary: 'Get monthly trend performance unit data', description: 'Retrieve monthly trend data for performance metrics (PA, MA, UA, EU)' })
  @ApiQuery({ name: 'month', description: 'Month in YYYY-MM format', example: '2025-09' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved trend performance unit data', type: TrendPerformanceUnitResponseDto })
  async getTrendPerformanceUnit(@Query('month') month: string) {
    return this.dashboardService.getTrendPerformanceUnit(month);
  }

  @Get('summary-production')
  @ApiOperation({ summary: 'Get summary production data', description: 'Retrieve summary production data from stored procedure' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved summary production data' })
  async getSummaryProduction() {
    return this.dashboardService.getSummaryProduction();
  }
}
