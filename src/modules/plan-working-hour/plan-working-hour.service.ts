import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { PlanWorkingHour } from './entities/plan-working-hour.entity';
import { PlanWorkingHourDetail } from './entities/plan-working-hour-detail.entity';
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
    @InjectRepository(PlanWorkingHourDetail)
    private readonly planWorkingHourDetailRepository: Repository<PlanWorkingHourDetail>,
  ) {}

  async create(createDto: CreatePlanWorkingHourDto): Promise<PlanWorkingHour> {
    // Auto-fill fields berdasarkan plan_date
    const planDate = new Date(createDto.plan_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // is_calender_day: true jika plan_date terisi
    createDto.is_calender_day = true;

    // is_holiday_day: false jika plan_date terisi
    createDto.is_holiday_day = false;

    // is_schedule_day: true jika bukan hari minggu
    const dayOfWeek = planDate.getDay();
    createDto.is_schedule_day = dayOfWeek !== 0; // 0 = Sunday

    // Buat plan working hour
    const planWorkingHour = this.planWorkingHourRepository.create(createDto);
    const savedPlan = await this.planWorkingHourRepository.save(planWorkingHour);

    // Buat detail records
    if (createDto.detail && createDto.detail.length > 0) {
      const detailEntities = createDto.detail.map(detail => {
        return this.planWorkingHourDetailRepository.create({
          plant_working_hour_id: savedPlan.id,
          activities_id: detail.activities_id,
          working_hour: detail.working_hour,
        });
      });

      await this.planWorkingHourDetailRepository.save(detailEntities);
    }

    return await this.findOne(savedPlan.id);
  }

  async findAll(queryDto: QueryPlanWorkingHourDto): Promise<any[]> {
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

    const plans = await this.planWorkingHourRepository.find({
      where,
      relations: ['details'],
      order: { plan_date: 'DESC' },
    });

    // Tambahkan field is_available_to_edit dan is_available_to_delete
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return plans.map(plan => {
      const planDate = new Date(plan.plan_date);
      planDate.setHours(0, 0, 0, 0);

      const isAvailableToEdit = plan.plan_date && planDate > today;
      const isAvailableToDelete = plan.plan_date && planDate > today;

      return {
        ...plan,
        is_available_to_edit: isAvailableToEdit,
        is_available_to_delete: isAvailableToDelete,
      };
    });
  }

  async findOne(id: number): Promise<any> {
    const planWorkingHour = await this.planWorkingHourRepository.findOne({
      where: { id },
      relations: ['details'],
    });

    if (!planWorkingHour) {
      throw new NotFoundException(`Plan working hour with ID ${id} not found`);
    }

    // Tambahkan field is_available_to_edit dan is_available_to_delete
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const planDate = new Date(planWorkingHour.plan_date);
    planDate.setHours(0, 0, 0, 0);

    const isAvailableToEdit = planWorkingHour.plan_date && planDate > today;
    const isAvailableToDelete = planWorkingHour.plan_date && planDate > today;

    return {
      ...planWorkingHour,
      is_available_to_edit: isAvailableToEdit,
      is_available_to_delete: isAvailableToDelete,
    };
  }

  async update(
    id: number,
    updateDto: UpdatePlanWorkingHourDto,
  ): Promise<PlanWorkingHour> {
    const planWorkingHour = await this.findOne(id);
    
    // Update plan working hour
    Object.assign(planWorkingHour, updateDto);
    const updatedPlan = await this.planWorkingHourRepository.save(planWorkingHour);

    // Update detail records jika ada
    if (updateDto.detail && updateDto.detail.length > 0) {
      // Hapus detail lama
      await this.planWorkingHourDetailRepository.delete({
        plant_working_hour_id: id,
      });

      // Buat detail baru
      const detailEntities = updateDto.detail.map(detail => {
        return this.planWorkingHourDetailRepository.create({
          plant_working_hour_id: id,
          activities_id: detail.activities_id,
          working_hour: detail.working_hour,
        });
      });

      await this.planWorkingHourDetailRepository.save(detailEntities);
    }

    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const planWorkingHour = await this.findOne(id);
    
    // Hapus detail records terlebih dahulu
    await this.planWorkingHourDetailRepository.delete({
      plant_working_hour_id: id,
    });

    // Hapus plan working hour
    await this.planWorkingHourRepository.softRemove(planWorkingHour);
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    const plans = await this.planWorkingHourRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.details', 'details')
      .where('plan.plan_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('plan.plan_date', 'ASC')
      .getMany();

    // Tambahkan field is_available_to_edit dan is_available_to_delete
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return plans.map(plan => {
      const planDate = new Date(plan.plan_date);
      planDate.setHours(0, 0, 0, 0);

      const isAvailableToEdit = plan.plan_date && planDate > today;
      const isAvailableToDelete = plan.plan_date && planDate > today;

      return {
        ...plan,
        is_available_to_edit: isAvailableToEdit,
        is_available_to_delete: isAvailableToDelete,
      };
    });
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
