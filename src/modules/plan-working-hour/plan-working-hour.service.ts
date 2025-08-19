import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { PlanWorkingHour } from './entities/plan-working-hour.entity';
import {
  CreatePlanWorkingHourDto,
  UpdatePlanWorkingHourDto,
  QueryPlanWorkingHourDto,
} from './dto/plan-working-hour.dto';

@Injectable()
export class PlanWorkingHourService {
  constructor(
    @InjectRepository(PlanWorkingHour)
    private readonly planWorkingHourRepository: Repository<PlanWorkingHour>,
  ) {}

  async create(createDto: CreatePlanWorkingHourDto): Promise<PlanWorkingHour> {
    const planWorkingHour = this.planWorkingHourRepository.create(createDto);
    return await this.planWorkingHourRepository.save(planWorkingHour);
  }

  async findAll(queryDto: QueryPlanWorkingHourDto): Promise<PlanWorkingHour[]> {
    const where: FindOptionsWhere<PlanWorkingHour> = {};

    if (queryDto.plan_date) {
      where.plan_date = queryDto.plan_date;
    }

    if (queryDto.is_calender_day !== undefined) {
      where.is_calender_day = queryDto.is_calender_day;
    }

    if (queryDto.is_holiday_day !== undefined) {
      where.is_holiday_day = queryDto.is_holiday_day;
    }

    if (queryDto.is_schedule_day !== undefined) {
      where.is_schedule_day = queryDto.is_schedule_day;
    }

    if (queryDto.working_hour !== undefined) {
      where.working_hour = queryDto.working_hour;
    }

    if (queryDto.working_day_longshift !== undefined) {
      where.working_day_longshift = queryDto.working_day_longshift;
    }

    if (queryDto.working_hour_longshift !== undefined) {
      where.working_hour_longshift = queryDto.working_hour_longshift;
    }

    if (queryDto.mohh_per_month !== undefined) {
      where.mohh_per_month = queryDto.mohh_per_month;
    }

    return await this.planWorkingHourRepository.find({
      where,
      relations: ['details'],
      order: { plan_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<PlanWorkingHour> {
    const planWorkingHour = await this.planWorkingHourRepository.findOne({
      where: { id },
      relations: ['details'],
    });

    if (!planWorkingHour) {
      throw new NotFoundException(`Plan working hour with ID ${id} not found`);
    }

    return planWorkingHour;
  }

  async update(
    id: number,
    updateDto: UpdatePlanWorkingHourDto,
  ): Promise<PlanWorkingHour> {
    const planWorkingHour = await this.findOne(id);
    
    Object.assign(planWorkingHour, updateDto);
    
    return await this.planWorkingHourRepository.save(planWorkingHour);
  }

  async remove(id: number): Promise<void> {
    const planWorkingHour = await this.findOne(id);
    await this.planWorkingHourRepository.softRemove(planWorkingHour);
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<PlanWorkingHour[]> {
    return await this.planWorkingHourRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.details', 'details')
      .where('plan.plan_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('plan.plan_date', 'ASC')
      .getMany();
  }

  async getWorkingHoursSummary(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalWorkingHours: number;
    totalWorkingDays: number;
    totalHolidayDays: number;
    averageWorkingHoursPerDay: number;
  }> {
    const plans = await this.findByDateRange(startDate, endDate);
    
    const totalWorkingHours = plans.reduce(
      (sum, plan) => sum + (plan.working_hour || 0),
      0,
    );
    
    const totalWorkingDays = plans.filter(
      (plan) => plan.is_schedule_day && !plan.is_holiday_day,
    ).length;
    
    const totalHolidayDays = plans.filter(
      (plan) => plan.is_holiday_day,
    ).length;
    
    const averageWorkingHoursPerDay = totalWorkingDays > 0 
      ? totalWorkingHours / totalWorkingDays 
      : 0;

    return {
      totalWorkingHours,
      totalWorkingDays,
      totalHolidayDays,
      averageWorkingHoursPerDay,
    };
  }
}
