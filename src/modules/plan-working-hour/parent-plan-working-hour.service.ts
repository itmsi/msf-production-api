import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ParentPlanWorkingHour } from './entities/parent-plan-working-hour.entity';
import { PlanWorkingHour } from './entities/plan-working-hour.entity';
import { PlanWorkingHourDetail } from './entities/plan-working-hour-detail.entity';
import { CreateParentPlanWorkingHourDto, ActivityDetailDto } from './dto/parent-plan-working-hour.dto';

@Injectable()
export class ParentPlanWorkingHourService {
  constructor(
    @InjectRepository(ParentPlanWorkingHour)
    private parentPlanWorkingHourRepository: Repository<ParentPlanWorkingHour>,
    @InjectRepository(PlanWorkingHour)
    private planWorkingHourRepository: Repository<PlanWorkingHour>,
    @InjectRepository(PlanWorkingHourDetail)
    private planWorkingHourDetailRepository: Repository<PlanWorkingHourDetail>,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateParentPlanWorkingHourDto): Promise<ParentPlanWorkingHour> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Insert ke tabel r_parent_plan_working_hour
      const parentPlan = this.parentPlanWorkingHourRepository.create({
        plan_date: new Date(createDto.plan_date),
        total_calendar_day: createDto.total_calendar_day,
        total_holiday_day: createDto.total_holiday_day,
        total_available_day: createDto.total_available_day,
        total_working_hour_month: createDto.total_working_hour_month,
        total_working_day_longshift: createDto.total_working_day_longshift,
        total_working_hour_day: createDto.total_working_hour_day,
        total_working_hour_longshift: createDto.total_working_hour_longshift,
        total_mohh_per_month: createDto.total_mohh_per_month,
      });

      const savedParentPlan = await queryRunner.manager.save(ParentPlanWorkingHour, parentPlan);

      // 2. Generate tanggal untuk bulan yang dipilih
      const planDate = new Date(createDto.plan_date);
      const year = planDate.getFullYear();
      const month = planDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // 3. Insert ke tabel r_plan_working_hour untuk setiap tanggal
      const planWorkingHours: PlanWorkingHour[] = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const isSunday = currentDate.getDay() === 0; // 0 = Sunday
        
        const planWorkingHour = this.planWorkingHourRepository.create({
          plan_date: currentDate,
          is_calender_day: !isSunday,
          is_holiday_day: isSunday,
          is_schedule_day: !isSunday,
          working_day_longshift: createDto.total_working_day_longshift,
          working_hour_longshift: createDto.total_working_hour_longshift,
          working_hour_month: createDto.total_working_hour_month / daysInMonth,
          working_hour_day: createDto.total_working_hour_day,
          mohh_per_month: createDto.total_mohh_per_month,
          parent_plan_working_hour_id: savedParentPlan.id,
        });

        planWorkingHours.push(planWorkingHour);
      }

      const savedPlanWorkingHours = await queryRunner.manager.save(PlanWorkingHour, planWorkingHours);

      // 4. Insert ke tabel r_plan_working_hour_detail untuk setiap tanggal dan aktivitas
      const planWorkingHourDetails: PlanWorkingHourDetail[] = [];

      for (const planWorkingHour of savedPlanWorkingHours) {
        for (const activityDetail of createDto.detail) {
          const detail = this.planWorkingHourDetailRepository.create({
            plant_working_hour_id: planWorkingHour.id,
            activities_id: activityDetail.activities_id,
            activities_hour: activityDetail.activities_hour,
          });

          planWorkingHourDetails.push(detail);
        }
      }

      await queryRunner.manager.save(PlanWorkingHourDetail, planWorkingHourDetails);

      await queryRunner.commitTransaction();

      // Return parent plan dengan relasi
      const result = await this.parentPlanWorkingHourRepository.findOne({
        where: { id: savedParentPlan.id },
        relations: ['planWorkingHours', 'planWorkingHours.details'],
      });

      if (!result) {
        throw new BadRequestException('Gagal mengambil data parent plan working hour yang baru dibuat');
      }

      return result;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Gagal membuat parent plan working hour: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<ParentPlanWorkingHour[]> {
    return await this.parentPlanWorkingHourRepository.find({
      relations: ['planWorkingHours', 'planWorkingHours.details'],
    });
  }

  async findOne(id: number): Promise<ParentPlanWorkingHour> {
    const parentPlan = await this.parentPlanWorkingHourRepository.findOne({
      where: { id },
      relations: ['planWorkingHours', 'planWorkingHours.details'],
    });

    if (!parentPlan) {
      throw new BadRequestException(`Parent plan working hour dengan ID ${id} tidak ditemukan`);
    }

    return parentPlan;
  }

  async update(id: number, updateDto: Partial<CreateParentPlanWorkingHourDto>): Promise<ParentPlanWorkingHour> {
    const parentPlan = await this.findOne(id);
    
    // Update parent plan
    Object.assign(parentPlan, updateDto);
    
    if (updateDto.plan_date) {
      parentPlan.plan_date = new Date(updateDto.plan_date);
    }

    return await this.parentPlanWorkingHourRepository.save(parentPlan);
  }

  async remove(id: number): Promise<void> {
    const parentPlan = await this.findOne(id);
    await this.parentPlanWorkingHourRepository.softDelete(id);
  }
}
