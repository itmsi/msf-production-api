import { Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
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
import {
  BargingSummaryResponseDto,
  CcrActivitesResponseDto,
  FleetStatusResponseDto,
  HaulingSummaryResponseDto,
  TonnageResponseDto,
} from './dto/ccr-dashboard.dto';
import { successResponse } from '../../common/helpers/response.helper';

@ApiTags('Dashboard')
@ApiBearerAuth('jwt')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('spider')
  @ApiOperation({
    summary: 'Get spider chart data',
    description:
      'Retrieve data for spider chart with metrics CT, Prod, EWH, FR, and Speed',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved spider chart data',
    type: SpiderResponseDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter (YYYY-MM-DD)',
  })
  async getSpiderData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.dashboardService.getSpiderData(startDate, endDate);
  }

  @Get('mtd-achievment')
  @ApiOperation({
    summary: 'Get MTD achievement data',
    description:
      'Retrieve Month-to-Date achievement data for various activities',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved MTD achievement data',
    type: AchievementResponseDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering (YYYY-MM-DD format)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering (YYYY-MM-DD format)',
    example: '2025-01-31',
  })
  async getMtdAchievement(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.dashboardService.getMtdAchievement(startDate, endDate);
  }

  @Get('hauling')
  @ApiOperation({
    summary: 'Get hauling data',
    description:
      'Retrieve daily hauling data with target, actual, and weather conditions',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved hauling data',
    type: HaulingResponseDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date in YYYY-MM-DD format',
  })
  async getHaulingData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.dashboardService.getHaulingData(startDate, endDate);
  }

  @Get('barge')
  @ApiOperation({
    summary: 'Get barge data',
    description: 'Retrieve daily barge and hauling data',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved barge data',
    type: BargeResponseDto,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date (YYYY-MM-DD)',
  })
  async getBargeData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.dashboardService.getBargeData(startDate, endDate);
    return successResponse(result, 'Data barge berhasil diambil', 200);
  }

  @Get('tmm')
  @ApiOperation({
    summary: 'Get TMM data',
    description:
      'Retrieve Total Material Movement (TMM) daily data based on analysis hauling barging table',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering (YYYY-MM-DD format)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering (YYYY-MM-DD format)',
    example: '2024-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved TMM data',
    type: TmmResponseDto,
  })
  async getTmmData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.dashboardService.getTmmData(startDate, endDate);
  }

  @Get('tmm-debug')
  @ApiOperation({
    summary: 'Debug TMM data',
    description: 'Debug endpoint to check TMM data availability',
  })
  async getTmmDebug() {
    return await this.dashboardService.getTmmDebug();
  }

  @Get('lost-time')
  @ApiOperation({
    summary: 'Get lost time data',
    description: 'Retrieve lost time data by category with date range filter',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Start date in YYYY-MM-DD format',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'End date in YYYY-MM-DD format',
    example: '2024-01-31',
  })
  async getLostTimeData(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return await this.dashboardService.getLostTimeData(startDate, endDate);
  }

  @Get('activities-list')
  @ApiOperation({
    summary: 'Get all activities from M_Activities table',
    description: 'Debug endpoint to see all activities available',
  })
  async getActivitiesList() {
    return await this.dashboardService.getActivitiesList();
  }

  @Get('daily-achievment')
  @ApiOperation({
    summary: 'Get daily achievement data',
    description:
      'Retrieve daily achievement data for Daily ACV, Day Shift ACV, and Night Shift ACV. Data is filtered by activity_date (defaults to today) and shift (DS/NS). Returns target and actual values for Ore Hauling, OB, Ore Barging, and Quarry activities.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved daily achievement data',
    type: DailyAchievementResponseDto,
  })
  @ApiQuery({
    name: 'selectedDate',
    required: false,
    description:
      'Selected date for filtering (YYYY-MM-DD format). Defaults to today if not provided.',
    example: '2025-09-15',
  })
  @ApiQuery({
    name: 'shift',
    required: false,
    description:
      'Shift filter (DS for Day Shift, NS for Night Shift). If not provided, returns data for both shifts.',
    example: 'DS',
  })
  async getDailyAchievement(
    @Query('selectedDate') selectedDate?: string,
    @Query('shift') shift?: string,
  ) {
    return await this.dashboardService.getDailyAchievement(selectedDate, shift);
  }

  @Get('barge-list')
  @ApiOperation({
    summary: 'Get barge list',
    description: 'Retrieve barge list and capacity details with month filter',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Filter by month in YYYY-MM format (e.g., 2025-09)',
    example: '2025-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved barge list data',
    type: BargeListResponseDto,
  })
  async getBargeList(@Query('month') month?: string) {
    return await this.dashboardService.getBargeList(month);
  }

  @Get('barge-status')
  @ApiOperation({
    summary: 'Get barge status data',
    description:
      'Retrieve barge status with barging ore, list, and gain lost data',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Month in YYYY-MM format (e.g., 2025-01)',
    example: '2025-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved barge status data',
    type: BargeStatusResponseDto,
  })
  async getBargeStatus(@Query('month') month?: string) {
    return await this.dashboardService.getBargeStatus(month);
  }

  @Get('monthly/status')
  @ApiOperation({
    summary: 'Get monthly status data',
    description:
      'Retrieve monthly status data for various activities with progress charts',
  })
  @ApiQuery({
    name: 'month',
    description: 'Month in YYYY-MM format',
    example: '2025-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved monthly status data',
    type: MonthlyStatusResponseDto,
  })
  async getMonthlyStatus(@Query('month') month: string) {
    return await this.dashboardService.getMonthlyStatus(month);
  }

  @Get('monthly/trend-hauling-barging')
  @ApiOperation({
    summary: 'Get monthly trend hauling barging data',
    description:
      'Retrieve monthly trend data for hauling and barging with weather conditions',
  })
  @ApiQuery({
    name: 'month',
    description: 'Month in YYYY-MM format',
    example: '2025-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved trend hauling barging data',
    type: TrendHaulingBargingResponseDto,
  })
  async getTrendHaulingBarging(@Query('month') month: string) {
    return await this.dashboardService.getTrendHaulingBarging(month);
  }

  @Get('monthly/trend-fuel-ratio')
  @ApiOperation({
    summary: 'Get monthly trend fuel ratio data',
    description:
      'Retrieve monthly trend data for fuel ratio (FR) and specific ratio (SR)',
  })
  @ApiQuery({
    name: 'month',
    description: 'Month in YYYY-MM format',
    example: '2025-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved trend fuel ratio data',
    type: TrendFuelRatioResponseDto,
  })
  async getTrendFuelRatio(@Query('month') month: string) {
    return await this.dashboardService.getTrendFuelRatio(month);
  }

  @Get('monthly/trend-performance-unit')
  @ApiOperation({
    summary: 'Get monthly trend performance unit data',
    description:
      'Retrieve monthly trend data for performance metrics (PA, MA, UA, EU)',
  })
  @ApiQuery({
    name: 'month',
    description: 'Month in YYYY-MM format',
    example: '2025-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved trend performance unit data',
    type: TrendPerformanceUnitResponseDto,
  })
  getTrendPerformanceUnit(@Query('month') month: string) {
    return this.dashboardService.getTrendPerformanceUnit(month);
  }

  @Get('summary-production')
  @ApiOperation({
    summary: 'Get summary production data',
    description: 'Retrieve summary production data from stored procedure',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved summary production data',
  })
  async getSummaryProduction() {
    return await this.dashboardService.getSummaryProduction();
  }

  @Get('hauling-summary')
  @ApiOperation({
    summary: 'Get hauling summary data',
    description:
      'Retrieve hauling summary data with attendance, chart summary, and working hours',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved hauling summary data',
    type: HaulingSummaryResponseDto,
  })
  async getHaulingSummary(
    @Query('selectedDate') selectedDate?: string,
  ): Promise<HaulingSummaryResponseDto> {
    return await this.dashboardService.getHaulingSummary(selectedDate);
  }

  @Get('ccr/fleet-status')
  @ApiOperation({
    summary: 'Get CCR fleet status data',
    description:
      'Retrieve CCR fleet status data with fleet information, loading points, and tonnage details',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved CCR fleet status data',
    type: FleetStatusResponseDto,
  })
  async getFleetStatus(
    @Query('type') type: string,
    @Query('date') selectedDate?: string,
  ) {
    return this.dashboardService.getMockFleetStatus(type, selectedDate);
  }

  @Post('ccr/tonnage')
  @ApiOperation({
    summary: 'Get CCR tonnage data',
    description:
      'Retrieve CCR tonnage data with hourly chart and unit metadata',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved CCR tonnage data',
    type: TonnageResponseDto,
  })
  getTonnage(): TonnageResponseDto {
    return this.dashboardService.getMockTonnage();
  }

  @Get('ccr/barging-summary')
  @ApiOperation({
    summary: 'Get CCR barging summary data',
    description:
      'Retrieve CCR barging summary data with unit running, tonnage, and vessel metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved CCR barging summary data',
    type: BargingSummaryResponseDto,
  })
  @ApiQuery({ name: 'date', type: String, example: '2025-09-01' })
  async getBargingSummary(
    @Query('date') date: string,
  ): Promise<BargingSummaryResponseDto> {
    return await this.dashboardService.getMockBargingSummary(date);
  }

  @Get('ccr/activities')
  @ApiOperation({
    summary: 'Get CCR activities data',
    description: 'Retrieve CCR activities data with target and actual values',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved CCR activities data',
    type: CcrActivitesResponseDto,
  })
  getActivities(): CcrActivitesResponseDto {
    return this.dashboardService.getMockActivities();
  }

  @Get('lost-time-summary')
  @ApiOperation({
    summary: 'Get lost time summary data',
    description:
      'Retrieve lost time summary data with MOHH, lost time activities, and performance tables (PA, MA, UA, EU)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date in YYYY-MM-DD format',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date in YYYY-MM-DD format',
    example: '2025-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved lost time summary data',
    type: LostTimeSummaryResponseDto,
  })
  async getLostTimeSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<LostTimeSummaryResponseDto> {
    return await this.dashboardService.getLostTimeSummary(startDate, endDate);
  }
}
