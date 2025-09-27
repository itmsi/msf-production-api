import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SummaryProductionService } from './summary-production.service';
import { SummaryProductionQueryDto, SummaryProductionResponseDto } from './dto/summary-production.dto';

@ApiTags('Summary Production')
@ApiBearerAuth('jwt')
@Controller('summary-production')
export class SummaryProductionController {
  constructor(private readonly summaryProductionService: SummaryProductionService) {}

  @Get()
  @ApiOperation({
    summary: 'Get summary production data',
    description: 'Retrieve summary production data with optional filters for date range, DT type, and material type',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for filtering (YYYY-MM-DD format)',
    example: '2025-01-01',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for filtering (YYYY-MM-DD format)',
    example: '2025-01-31',
    required: false,
  })
  @ApiQuery({
    name: 'dtType',
    description: 'DT Type filter (10, 12, or N/A)',
    example: '10',
    required: false,
  })
  @ApiQuery({
    name: 'material',
    description: 'Material type filter',
    example: 'ore barge',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved summary production data',
    type: SummaryProductionResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getSummaryProduction(@Query() query: SummaryProductionQueryDto) {
    return this.summaryProductionService.getSummaryProduction(query);
  }
}
