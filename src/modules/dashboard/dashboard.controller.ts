import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
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
  DailyAchievementResponseDto,
  BargeListResponseDto,
  BargeStatusResponseDto,
  LostTimeSummaryResponseDto,
  MonthlyStatusResponseDto,
  TrendHaulingBargingResponseDto,
  TrendFuelRatioResponseDto,
  TrendPerformanceUnitDataDto,
} from './dto/dashboard.dto';
import {
  BargingSummaryResponseDto,
  CcrActivitesResponseDto,
  CcrActivitiesDto,
  CcrActivitiesItemDto,
  CcrTonnageDto,
  ChartTonnageVesselResult,
  FleetStatusResponseDto,
  HaulingSummaryResponseDto,
  TonnageResponseDto,
} from './dto/ccr-dashboard.dto';
import {
  ApiResponse as ApiResponseDto,
  successResponse,
} from '../../common/helpers/response.helper';
import { Request } from 'express';
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
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
  ) {
    return await this.dashboardService.getHaulingData(date_from, date_to);
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
  async getTrendPerformanceUnit(@Query('month') month: string) {
    return await this.dashboardService.getTrendPerformanceUnit(month);
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
    @Query('date') date?: string,
    @Query('shift') shift?: string,
  ): Promise<HaulingSummaryResponseDto> {
    return await this.dashboardService.getHaulingSummary(
      date,
      shift?.toLowerCase(),
    );
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
  getFleetStatus(
    @Query('type') type: string,
    @Query('date') selectedDate?: string,
  ) {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        {
          fleet: 'DT-0089',
          start_loading: 'ETO 1',
          stop_loading: 'EFO 1',
          barge_name: 'Ayoda 3350',
          total_vessel: 12,
          total_tonnage: 354.72,
        },
        {
          fleet: 'DT-0090',
          start_loading: 'ETO 1',
          stop_loading: 'EFO 2',
          barge_name: 'Ayoda 3350',
          total_vessel: 9,
          total_tonnage: 266.04,
        },
        {
          fleet: 'DT-0026',
          start_loading: 'ETO 1',
          stop_loading: 'EFO 3',
          barge_name: 'Ayoda 3350',
          total_vessel: 10,
          total_tonnage: 295.6,
        },
      ],
    };
    // return this.dashboardService.getMockFleetStatus(type, selectedDate);
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
  getTonnage(@Body() body: CcrTonnageDto, @Req() req: Request) {
    const pathname = req.route.path;
    return {
      statusCode: 200,
      message: 'success',
      data: {
        chart: [
          {
            hour: '18-19',
            'TID-EX-013': 1,
            'DT-TR-001': 3,
            'HD-EX-777': 5,
            total: 8,
          },
          {
            hour: '19-20',
            'TID-EX-013': 2,
            'DT-TR-001': 4,
            'HD-EX-777': 6,
            total: 12,
          },
        ],
        meta: {
          'TID-EX-013': '#F6C89F',
          'DT-TR-001': '#94D1B2',
          'HD-EX-777': '#54AD9B',
          total: '#D96C06',
        },
      },
    };
    // return await this.dashboardService.getCcrTonnageVessel(body, pathname);
  }

  @Post('ccr/vessel')
  @ApiOperation({
    summary: 'Get CCR Vessel data',
    description: 'Retrieve CCR Vessel data with hourly chart and unit metadata',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved CCR Vessel data',
    type: TonnageResponseDto,
  })
  getVessel(@Body() body: CcrTonnageDto, @Req() req: Request) {
    const pathname = req.route.path;
    return {
      statusCode: 200,
      message: 'success',
      data: {
        chart: [
          {
            hour: '18-19',
            'TID-EX-013': 1,
            'DT-TR-001': 3,
            'HD-EX-777': 5,
            total: 8,
          },
          {
            hour: '19-20',
            'TID-EX-013': 2,
            'DT-TR-001': 4,
            'HD-EX-777': 6,
            total: 12,
          },
        ],
        meta: {
          'TID-EX-013': '#F6C89F',
          'DT-TR-001': '#94D1B2',
          'HD-EX-777': '#54AD9B',
          total: '#D96C06',
        },
      },
    };
    // return await this.dashboardService.getCcrTonnageVessel(body, pathname);
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
  getActivities(@Query() query: CcrActivitiesDto) {
    return {
      statusCode: 200,
      message: 'success',
      data: [
        { label: 'No Operator', target: 3000, actual: 2800 },
        { label: 'Fogging', target: 2950, actual: 2700 },
        { label: 'Friday Pray', target: 2980, actual: 2750 },
        { label: 'Hujan', target: 2900, actual: 2600 },
        { label: 'P2H', target: 3000, actual: 2700 },
        { label: 'Perbaikan Front Loading', target: 2800, actual: 2500 },
        { label: 'Refueling', target: 2900, actual: 2650 },
        { label: 'Rest Time', target: 3000, actual: 2700 },
        { label: 'Safety Talk', target: 2950, actual: 2800 },
      ],
    };
    // return await this.dashboardService.getCcrActivities(query);
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
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
  ): Promise<LostTimeSummaryResponseDto> {
    return await this.dashboardService.getLostTimeSummary(date_from, date_to);
  }
}
