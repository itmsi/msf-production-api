import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  IsNull,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { PlanWorkingHour } from './entities/plan-working-hour.entity';
import { PlanWorkingHourDetail } from './entities/plan-working-hour-detail.entity';
import { Activities } from '../activities/entities/activities.entity';
import {
  CreatePlanWorkingHourDto,
  UpdatePlanWorkingHourDto,
  QueryPlanWorkingHourDto,
} from './dto/plan-working-hour.dto';
import { paginateResponse } from '../../common/helpers/public.helper';

@Injectable()
export class PlanWorkingHourService {
  constructor(
    @InjectRepository(PlanWorkingHour)
    private readonly planWorkingHourRepository: Repository<PlanWorkingHour>,
    @InjectRepository(PlanWorkingHourDetail)
    private readonly planWorkingHourDetailRepository: Repository<PlanWorkingHourDetail>,
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
  ) {}

  async create(createDto: CreatePlanWorkingHourDto): Promise<PlanWorkingHour> {
    try {
      // Validasi duplikasi plan_date
      const existingPlan = await this.planWorkingHourRepository.findOne({
        where: { plan_date: createDto.plan_date },
      });

      if (existingPlan) {
        // Handle plan_date yang bisa berupa string atau Date
        const planDateStr =
          createDto.plan_date instanceof Date
            ? createDto.plan_date.toISOString().split('T')[0]
            : new Date(createDto.plan_date).toISOString().split('T')[0];

        throw new BadRequestException(
          `Data untuk tanggal ${planDateStr} sudah ada. Silakan gunakan tanggal yang berbeda.`,
        );
      }

      const planDate = new Date(createDto.plan_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Buat object untuk disimpan ke database dengan field auto-fill
      const planWorkingHourData = {
        ...createDto,
        // is_calender_day: true jika plan_date terisi
        is_calender_day: true,
        // is_holiday_day: false jika plan_date terisi
        is_holiday_day: false,
        // is_schedule_day: true jika bukan hari minggu
        is_schedule_day: planDate.getDay() !== 0, // 0 = Sunday
      };

      // Buat plan working hour
      const planWorkingHour =
        this.planWorkingHourRepository.create(planWorkingHourData);
      const savedPlan =
        await this.planWorkingHourRepository.save(planWorkingHour);

      // Buat detail records
      if (createDto.detail && createDto.detail.length > 0) {
        const detailEntities = createDto.detail.map((detail) => {
          return this.planWorkingHourDetailRepository.create({
            plant_working_hour_id: savedPlan.id,
            activities_id: detail.activities_id,
            activities_hour: detail.activities_hour,
          });
        });

        await this.planWorkingHourDetailRepository.save(detailEntities);
      }

      return await this.findOne(savedPlan.id);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in create plan working hour:', error);
      throw new InternalServerErrorException(
        `Gagal membuat plan working hour: ${error.message}`,
      );
    }
  }

  async findAll(queryDto: QueryPlanWorkingHourDto): Promise<any> {
    const where: FindOptionsWhere<PlanWorkingHour> = {};

    if (queryDto.plan_date) {
      where.plan_date = queryDto.plan_date;
    }

    // Date range filter
    if (queryDto.start_date || queryDto.end_date) {
      if (queryDto.start_date && queryDto.end_date) {
        where.plan_date = Between(
          new Date(queryDto.start_date),
          new Date(queryDto.end_date),
        );
      } else if (queryDto.start_date) {
        where.plan_date = MoreThanOrEqual(new Date(queryDto.start_date));
      } else if (queryDto.end_date) {
        where.plan_date = LessThanOrEqual(new Date(queryDto.end_date));
      }
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

    if (queryDto.working_hour_month !== undefined) {
      where.working_hour_month = queryDto.working_hour_month;
    }

    if (queryDto.working_hour_day !== undefined) {
      where.working_hour_day = queryDto.working_hour_day;
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

    // Pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const totalItems = await this.planWorkingHourRepository.count({ where });

    // Get paginated data
    const plans = await this.planWorkingHourRepository.find({
      where,
      relations: ['details', 'details.activities'],
      order: { plan_date: 'DESC' },
      skip,
      take: limit,
    });

    // Process data
    const processedData = plans.map((plan) => {
      const planDate = new Date(plan.plan_date);
      planDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isAvailableToEdit = plan.plan_date && planDate > today;
      const isAvailableToDelete = plan.plan_date && planDate > today;

      // Hitung metrics berdasarkan detail activities
      const total_mohh = plan.mohh_per_month || 0;

      let total_delay = 0;
      let total_idle = 0;
      let total_repair = 0;

      if (plan.details && plan.details.length > 0) {
        plan.details.forEach((detail) => {
          if (detail.activities && detail.activities.status === 'delay') {
            total_delay += detail.activities_hour || 0;
          } else if (detail.activities && detail.activities.status === 'idle') {
            total_idle += detail.activities_hour || 0;
          } else if (
            detail.activities &&
            detail.activities.status === 'breakdown'
          ) {
            total_repair += detail.activities_hour || 0;
          }
        });
      }

      // Hitung EWH (Effective Working Hours)
      const ewh =
        Math.round(
          (total_mohh - (total_delay + total_idle + total_repair)) * 100,
        ) / 100;

      // Hitung PA (Production Availability)
      const pa =
        total_mohh > 0
          ? Math.round(((ewh + total_delay + total_idle) / total_mohh) * 100) /
            100
          : 0;

      // Hitung MA (Mechanical Availability)
      const ma =
        ewh + total_repair > 0
          ? Math.round((ewh / (ewh + total_repair)) * 100) / 100
          : 0;

      // Hitung UA (Utilization Availability)
      const ua =
        ewh + total_delay + total_idle > 0
          ? Math.round((ewh / (ewh + total_delay + total_idle)) * 100) / 100
          : 0;

      // Hitung EU (Equipment Utilization)
      const eu =
        total_mohh > 0 ? Math.round((ewh / total_mohh) * 100) / 100 : 0;

      return {
        id: plan.id,
        plan_date: plan.plan_date,
        total_mohh,
        total_delay,
        total_idle,
        total_repair,
        ewh,
        pa,
        ma,
        ua,
        eu,
        is_available_to_edit: isAvailableToEdit,
        is_available_to_delete: isAvailableToDelete,
      };
    });

    return paginateResponse(
      processedData,
      totalItems,
      page,
      limit,
      'Plan working hours retrieved successfully',
    );
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
    const updatedPlan =
      await this.planWorkingHourRepository.save(planWorkingHour);

    // Update detail records jika ada
    if (updateDto.detail && updateDto.detail.length > 0) {
      // Hapus detail lama
      await this.planWorkingHourDetailRepository.delete({
        plant_working_hour_id: id,
      });

      // Buat detail baru
      const detailEntities = updateDto.detail.map((detail) => {
        return this.planWorkingHourDetailRepository.create({
          plant_working_hour_id: id,
          activities_id: detail.activities_id,
          activities_hour: detail.activities_hour,
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

  async findByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
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

    return plans.map((plan) => {
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
      (sum, plan) => sum + (plan.activities_hour || 0),
      0,
    );

    const totalWorkingDays = plans.filter(
      (plan) => plan.is_schedule_day && !plan.is_holiday_day,
    ).length;

    const totalHolidayDays = plans.filter((plan) => plan.is_holiday_day).length;

    const averageWorkingHoursPerDay =
      totalWorkingDays > 0 ? totalWorkingHours / totalWorkingDays : 0;

    return {
      totalWorkingHours,
      totalWorkingDays,
      totalHolidayDays,
      averageWorkingHoursPerDay,
    };
  }

  async getFormData(): Promise<
    Array<{
      name: string;
      group_detail: Array<{
        id: number;
        name: string;
        type_data: string;
        type_field: string;
      }>;
    }>
  > {
    // Ambil semua activities yang aktif
    const activities = await this.activitiesRepository.find({
      where: { deletedAt: IsNull() },
      select: ['id', 'name', 'status'],
    });

    // Kelompokkan berdasarkan status
    const groupedData: {
      [key: string]: Array<{
        id: number;
        name: string;
        type_data: string;
        type_field: string;
      }>;
    } = {};

    activities.forEach((activity) => {
      if (activity.status) {
        const statusKey = activity.status.toLowerCase();

        if (!groupedData[statusKey]) {
          groupedData[statusKey] = [];
        }

        groupedData[statusKey].push({
          id: activity.id,
          name: activity.name,
          type_data: 'number',
          type_field: 'input',
        });
      }
    });

    // Transform ke format yang diminta
    const result = Object.entries(groupedData).map(([status, activities]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
      group_detail: activities,
    }));

    return result;
  }
}
