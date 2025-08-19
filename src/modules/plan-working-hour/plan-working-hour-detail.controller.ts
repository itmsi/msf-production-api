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
} from '@nestjs/common';
import { PlanWorkingHourDetailService } from './plan-working-hour-detail.service';
import {
  CreatePlanWorkingHourDetailDto,
  UpdatePlanWorkingHourDetailDto,
  QueryPlanWorkingHourDetailDto,
} from './dto/plan-working-hour-detail.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@Controller('plan-working-hour-detail')
@UseGuards(JwtAuthGuard)
export class PlanWorkingHourDetailController {
  constructor(
    private readonly planWorkingHourDetailService: PlanWorkingHourDetailService,
  ) {}

  @Post()
  create(@Body() createDto: CreatePlanWorkingHourDetailDto) {
    return this.planWorkingHourDetailService.create(createDto);
  }

  @Get()
  findAll(@Query() queryDto: QueryPlanWorkingHourDetailDto) {
    return this.planWorkingHourDetailService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planWorkingHourDetailService.findOne(+id);
  }

  @Get('plan-working-hour/:id')
  findByPlanWorkingHourId(@Param('id') id: string) {
    return this.planWorkingHourDetailService.findByPlanWorkingHourId(+id);
  }

  @Get('activities/:id')
  findByActivitiesId(@Param('id') id: string) {
    return this.planWorkingHourDetailService.findByActivitiesId(+id);
  }

  @Get('plan-working-hour/:id/summary')
  getSummaryByPlanWorkingHour(@Param('id') id: string) {
    return this.planWorkingHourDetailService.getSummaryByPlanWorkingHour(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePlanWorkingHourDetailDto,
  ) {
    return this.planWorkingHourDetailService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planWorkingHourDetailService.remove(+id);
  }
}
