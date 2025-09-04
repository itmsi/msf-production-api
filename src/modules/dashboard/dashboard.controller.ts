import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
  async getMtdAchievement() {
    return this.dashboardService.getMtdAchievement();
  }

  @Get('hauling')
  @ApiOperation({ summary: 'Get hauling data', description: 'Retrieve daily hauling data with target, actual, and weather conditions' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved hauling data', type: HaulingResponseDto })
  async getHaulingData() {
    return this.dashboardService.getHaulingData();
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
  async getDailyAchievement() {
    return this.dashboardService.getDailyAchievement();
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
}
