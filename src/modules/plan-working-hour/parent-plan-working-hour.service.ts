import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ParentPlanWorkingHour } from './entities/parent-plan-working-hour.entity';
import { PlanWorkingHour } from './entities/plan-working-hour.entity';
import { PlanWorkingHourDetail } from './entities/plan-working-hour-detail.entity';
import { CreateParentPlanWorkingHourDto, ActivityDetailDto, GetParentPlanWorkingHourQueryDto } from './dto/parent-plan-working-hour.dto';
import { paginateResponse } from '../../common/helpers/public.helper';

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
      relations: ['planWorkingHours'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllSummary(query?: GetParentPlanWorkingHourQueryDto) {
    const page = parseInt(query?.page ?? '1', 10);
    const limit = parseInt(query?.limit ?? '10', 10);
    const skip = (page - 1) * limit;
    const month = query?.month ? parseInt(query.month, 10) : null;
    const sortBy = query?.sortBy ?? 'id';
    const sortOrder = query?.sortOrder ?? 'DESC';

    // Validate limit
    if (limit > 100) {
      throw new BadRequestException('Limit tidak boleh lebih dari 100');
    }

    // Validate month
    if (month && (month < 1 || month > 12)) {
      throw new BadRequestException('Bulan harus antara 1-12');
    }

    // Validate sortBy field to prevent SQL injection
    const allowedSortFields = ['id', 'plan_date', 'createdAt', 'updatedAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const queryBuilder = this.dataSource
      .createQueryBuilder()
      .select([
        'ppwh.id as parent_id',
        'ppwh.plan_date as plan_date',
        'ppwh.createdAt as createdAt',
        'ppwh.updatedAt as updatedAt',
        'COUNT(CASE WHEN pwh.is_schedule_day = true THEN 1 END) as schedule_day',
        'COUNT(CASE WHEN pwh.is_holiday_day = true THEN 1 END) as holiday_day',
        'SUM(COALESCE(pwh.working_hour_month, 0)) as working_hour_month',
        'SUM(COALESCE(pwh.working_hour_day, 0)) as working_hour_day',
        'SUM(COALESCE(pwh.working_hour_longshift, 0)) as working_hour_longshift',
        'SUM(COALESCE(pwh.working_day_longshift, 0)) as working_day_longshift',
        'COALESCE(pwh.mohh_per_month, 0) as total_mohh',
        'SUM(CASE WHEN a.status = :delayStatus THEN COALESCE(pwhd.activities_hour, 0) ELSE 0 END) as total_delay',
        'SUM(CASE WHEN a.status = :idleStatus THEN COALESCE(pwhd.activities_hour, 0) ELSE 0 END) as total_idle',
        'SUM(CASE WHEN a.status = :breakdownStatus THEN COALESCE(pwhd.activities_hour, 0) ELSE 0 END) as total_breakdown'
      ])
      .from('r_parent_plan_working_hour', 'ppwh')
      .leftJoin('r_plan_working_hour', 'pwh', 'pwh.parent_plan_working_hour_id = ppwh.id')
      .leftJoin('r_plan_working_hour_detail', 'pwhd', 'pwhd.plant_working_hour_id = pwh.id')
      .leftJoin('m_activities', 'a', 'a.id = pwhd.activities_id')
      .setParameters({
        delayStatus: 'delay',
        idleStatus: 'idle',
        breakdownStatus: 'breakdown'
      });

    // Filter by month
    if (month) {
      queryBuilder.andWhere('EXTRACT(MONTH FROM ppwh.plan_date) = :month', {
        month: month
      });
    }

    queryBuilder.groupBy('ppwh.id, ppwh.plan_date, ppwh.createdAt, ppwh.updatedAt, pwh.mohh_per_month');

    // Get total count for pagination
    const countQueryBuilder = this.dataSource
      .createQueryBuilder()
      .select('COUNT(DISTINCT ppwh.id)', 'count')
      .from('r_parent_plan_working_hour', 'ppwh');

    if (month) {
      countQueryBuilder.andWhere('EXTRACT(MONTH FROM ppwh.plan_date) = :month', {
        month: month
      });
    }

    const totalResult = await countQueryBuilder.getRawOne();
    const total = parseInt(totalResult?.count || '0');

    // Apply sorting and pagination
    queryBuilder.orderBy(`ppwh.${validSortBy}`, validSortOrder)
      .skip(skip)
      .take(limit);

    const results = await queryBuilder.getRawMany();
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // Helper function untuk rounding ke 2 digit
    const roundToTwoDecimals = (value: number): number => {
      return Math.round(value * 100) / 100;
    };

    const processedResults = results.map(result => {
      const planDate = new Date(result.plan_date);
      const planYear = planDate.getFullYear();
      const planMonth = planDate.getMonth() + 1;
      const monthYear = `${planYear}-${String(planMonth).padStart(2, '0')}`;
      
      const totalDelay = roundToTwoDecimals(parseFloat(result.total_delay) || 0);
      const totalIdle = roundToTwoDecimals(parseFloat(result.total_idle) || 0);
      const totalBreakdown = roundToTwoDecimals(parseFloat(result.total_breakdown) || 0);
      const totalMohh = roundToTwoDecimals(parseFloat(result.total_mohh) || 0);
      
      // Hitung EWH
      const ewh = roundToTwoDecimals(totalMohh - totalDelay - totalBreakdown);
      
      // Hitung PA
      const pa = totalMohh > 0 ? roundToTwoDecimals((ewh + totalDelay + totalIdle) / totalMohh) : 0;
      
      // Hitung MA
      const ma = (ewh + totalBreakdown) > 0 ? roundToTwoDecimals(ewh / (ewh + totalBreakdown)) : 0;
      
      // Hitung UA
      const ua = (ewh + totalDelay + totalIdle) > 0 ? roundToTwoDecimals(ewh / (ewh + totalDelay + totalIdle)) : 0;
      
      // Hitung EU
      const eu = (ewh + totalDelay + totalIdle + totalBreakdown) > 0 ? roundToTwoDecimals(ewh / (ewh + totalDelay + totalIdle + totalBreakdown)) : 0;
      
      // Status edit dan delete - jika plan_date lebih dari bulan ini maka true
      const isAvailableToEdit = (planYear > currentYear) || (planYear === currentYear && planMonth > currentMonth);
      const isAvailableToDelete = (planYear > currentYear) || (planYear === currentYear && planMonth > currentMonth);

      return {
        parent_id: result.parent_id,
        month_year: monthYear,
        schedule_day: parseInt(result.schedule_day) || 0,
        holiday_day: parseInt(result.holiday_day) || 0,
        working_hour_month: roundToTwoDecimals(parseFloat(result.working_hour_month) || 0),
        working_hour_day: roundToTwoDecimals(parseFloat(result.working_hour_day) || 0),
        working_hour_longshift: roundToTwoDecimals(parseFloat(result.working_hour_longshift) || 0),
        working_day_longshift: roundToTwoDecimals(parseFloat(result.working_day_longshift) || 0),
        total_mohh: roundToTwoDecimals(totalMohh),
        total_delay: roundToTwoDecimals(totalDelay),
        total_idle: roundToTwoDecimals(totalIdle),
        total_breakdown: roundToTwoDecimals(totalBreakdown),
        ewh: Math.max(0, ewh),
        pa: Math.max(0, pa),
        ma: Math.max(0, ma),
        ua: Math.max(0, ua),
        eu: Math.max(0, eu),
        is_available_to_edit: isAvailableToEdit,
        is_available_to_delete: isAvailableToDelete
      };
    });

    return paginateResponse(
      processedResults,
      total,
      page,
      limit,
      'Parent plan working hour summary berhasil diambil'
    );
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
