import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DailySummaryProductionService } from './daily-summary-production.service';
import { 
  DailySummaryProductionQueryDto, 
  DailySummaryProductionResponseDto 
} from './dto/daily-summary-production.dto';

@ApiTags('Daily Summary Production')
@ApiBearerAuth('jwt')
@Controller('daily-summary-production')
export class DailySummaryProductionController {
  constructor(private readonly dailySummaryProductionService: DailySummaryProductionService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get daily summary production data with loss time', 
    description: 'Retrieve daily summary production data with loss time information (rain and slippery duration) with optional filters for date range, DT type, and material type' 
  })
  @ApiQuery({ 
    name: 'startDate', 
    description: 'Start date for filtering (YYYY-MM-DD format)', 
    example: '2025-01-01',
    required: false 
  })
  @ApiQuery({ 
    name: 'endDate', 
    description: 'End date for filtering (YYYY-MM-DD format)', 
    example: '2025-01-31',
    required: false 
  })
  @ApiQuery({ 
    name: 'dtType', 
    description: 'DT Type filter (10, 12, or N/A)', 
    example: '10',
    required: false 
  })
  @ApiQuery({ 
    name: 'material', 
    description: 'Material type filter', 
    example: 'ore barge',
    required: false 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved daily summary production data', 
    type: DailySummaryProductionResponseDto 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  async getDailySummaryProduction(@Query() query: DailySummaryProductionQueryDto) {
    return this.dailySummaryProductionService.getDailySummaryProduction(query);
  }
}
