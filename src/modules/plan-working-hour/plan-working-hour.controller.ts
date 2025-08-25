import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PlanWorkingHourService } from './plan-working-hour.service';
import {
  CreatePlanWorkingHourDto,
  UpdatePlanWorkingHourDto,
  QueryPlanWorkingHourDto,
  PlanWorkingHourDetailDto,
} from './dto/plan-working-hour.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { successResponse } from '../../common/helpers/response.helper';



@Controller('plan-working-hour')
@UseGuards(JwtAuthGuard)
export class PlanWorkingHourController {
  constructor(
    private readonly planWorkingHourService: PlanWorkingHourService,
  ) {}

  @Post()
  async create(@Body() createDto: CreatePlanWorkingHourDto) {
    const result = await this.planWorkingHourService.create(createDto);
    return successResponse(result, 'Plan working hour created successfully');
  }

  @Get()
  async findAll(@Query() query: QueryPlanWorkingHourDto) {
    const result = await this.planWorkingHourService.findAll(query);
    return result;
  }

  @Get('form')
  async getFormData() {
    const result = await this.planWorkingHourService.getFormData();
    return successResponse(result, 'Plan working hour form data');
  }

  @Get('summary')
  async getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const result = await this.planWorkingHourService.getWorkingHoursSummary(
      new Date(startDate),
      new Date(endDate),
    );
    return successResponse(
      result,
      'Working hours summary retrieved successfully',
    );
  }

  @Get('date-range')
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const result = await this.planWorkingHourService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
    return successResponse(
      result,
      'Plan working hours by date range retrieved successfully',
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.planWorkingHourService.findOne(id);
    return successResponse(result, 'Plan working hour retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePlanWorkingHourDto,
  ) {
    const result = await this.planWorkingHourService.update(id, updateDto);
    return successResponse(result, 'Plan working hour updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.planWorkingHourService.remove(id);
    return successResponse(null, 'Plan working hour deleted successfully');
  }
}
