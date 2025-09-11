import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlanProductionService } from './plan-production.service';

@ApiTags('Plan Production')
@Controller('plan-production')
export class PlanProductionController {
  constructor(private readonly planProductionService: PlanProductionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all plan production data' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved plan production data' })
  async findAll() {
    return await this.planProductionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan production data by ID' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved plan production data' })
  async findOne(@Param('id') id: string) {
    return await this.planProductionService.findOne(+id);
  }
}
