import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { ParentPlanWorkingHour } from './entities/parent-plan-working-hour.entity';
import { PlanWorkingHour } from './entities/plan-working-hour.entity';
import { PlanWorkingHourDetail } from './entities/plan-working-hour-detail.entity';
import {
  CreateParentPlanWorkingHourDto,
  ActivityDetailDto,
  GetParentPlanWorkingHourQueryDto,
  GetParentPlanWorkingHourDetailQueryDto,
  UpdateDetailParentPlanWorkingHourDto,
} from './dto/parent-plan-working-hour.dto';
import { paginateResponse } from '../../common/helpers/public.helper';
import { Activities } from '../activities/entities/activities.entity';
import { ActivityStatus } from '../activities/dto/activities.dto';

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

  async create(
    createDto: CreateParentPlanWorkingHourDto,
  ): Promise<ParentPlanWorkingHour> {
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

      const savedParentPlan = await queryRunner.manager.save(
        ParentPlanWorkingHour,
        parentPlan,
      );

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

      const savedPlanWorkingHours = await queryRunner.manager.save(
        PlanWorkingHour,
        planWorkingHours,
      );

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

      await queryRunner.manager.save(
        PlanWorkingHourDetail,
        planWorkingHourDetails,
      );

      await queryRunner.commitTransaction();

      // Return parent plan dengan relasi
      const result = await this.parentPlanWorkingHourRepository.findOne({
        where: { id: savedParentPlan.id },
        relations: ['planWorkingHours', 'planWorkingHours.details'],
      });

      if (!result) {
        throw new BadRequestException(
          'Gagal mengambil data parent plan working hour yang baru dibuat',
        );
      }

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Gagal membuat parent plan working hour: ${error.message}`,
      );
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
        'SUM(CASE WHEN a.status = :breakdownStatus THEN COALESCE(pwhd.activities_hour, 0) ELSE 0 END) as total_breakdown',
      ])
      .from('r_parent_plan_working_hour', 'ppwh')
      .leftJoin(
        'r_plan_working_hour',
        'pwh',
        'pwh.parent_plan_working_hour_id = ppwh.id',
      )
      .leftJoin(
        'r_plan_working_hour_detail',
        'pwhd',
        'pwhd.plant_working_hour_id = pwh.id',
      )
      .leftJoin('m_activities', 'a', 'a.id = pwhd.activities_id')
      .setParameters({
        delayStatus: 'delay',
        idleStatus: 'idle',
        breakdownStatus: 'breakdown',
      });

    // Filter by month
    if (month) {
      queryBuilder.andWhere('EXTRACT(MONTH FROM ppwh.plan_date) = :month', {
        month: month,
      });
    }

    queryBuilder.groupBy(
      'ppwh.id, ppwh.plan_date, ppwh.createdAt, ppwh.updatedAt, pwh.mohh_per_month',
    );

    // Get total count for pagination
    const countQueryBuilder = this.dataSource
      .createQueryBuilder()
      .select('COUNT(DISTINCT ppwh.id)', 'count')
      .from('r_parent_plan_working_hour', 'ppwh');

    if (month) {
      countQueryBuilder.andWhere(
        'EXTRACT(MONTH FROM ppwh.plan_date) = :month',
        {
          month: month,
        },
      );
    }

    const totalResult = await countQueryBuilder.getRawOne();
    const total = parseInt(totalResult?.count || '0');

    // Apply sorting and pagination
    queryBuilder
      .orderBy(`ppwh.${validSortBy}`, validSortOrder)
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

    const processedResults = results.map((result) => {
      const planDate = new Date(result.plan_date);
      const planYear = planDate.getFullYear();
      const planMonth = planDate.getMonth() + 1;
      const monthYear = `${planYear}-${String(planMonth).padStart(2, '0')}`;

      const totalDelay = roundToTwoDecimals(
        parseFloat(result.total_delay) || 0,
      );
      const totalIdle = roundToTwoDecimals(parseFloat(result.total_idle) || 0);
      const totalBreakdown = roundToTwoDecimals(
        parseFloat(result.total_breakdown) || 0,
      );
      const totalMohh = roundToTwoDecimals(parseFloat(result.total_mohh) || 0);

      // Hitung EWH
      const ewh = roundToTwoDecimals(totalMohh - totalDelay - totalBreakdown);

      // Hitung PA
      const pa =
        totalMohh > 0
          ? roundToTwoDecimals((ewh + totalDelay + totalIdle) / totalMohh)
          : 0;

      // Hitung MA
      const ma =
        ewh + totalBreakdown > 0
          ? roundToTwoDecimals(ewh / (ewh + totalBreakdown))
          : 0;

      // Hitung UA
      const ua =
        ewh + totalDelay + totalIdle > 0
          ? roundToTwoDecimals(ewh / (ewh + totalDelay + totalIdle))
          : 0;

      // Hitung EU
      const eu =
        ewh + totalDelay + totalIdle + totalBreakdown > 0
          ? roundToTwoDecimals(
              ewh / (ewh + totalDelay + totalIdle + totalBreakdown),
            )
          : 0;

      // Status edit dan delete - jika plan_date lebih dari bulan ini maka true
      const isAvailableToEdit =
        planYear > currentYear ||
        (planYear === currentYear && planMonth > currentMonth);
      const isAvailableToDelete =
        planYear > currentYear ||
        (planYear === currentYear && planMonth > currentMonth);

      return {
        parent_id: result.parent_id,
        month_year: monthYear,
        schedule_day: parseInt(result.schedule_day) || 0,
        holiday_day: parseInt(result.holiday_day) || 0,
        working_hour_month: roundToTwoDecimals(
          parseFloat(result.working_hour_month) || 0,
        ),
        working_hour_day: roundToTwoDecimals(
          parseFloat(result.working_hour_day) || 0,
        ),
        working_hour_longshift: roundToTwoDecimals(
          parseFloat(result.working_hour_longshift) || 0,
        ),
        working_day_longshift: roundToTwoDecimals(
          parseFloat(result.working_day_longshift) || 0,
        ),
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
        is_available_to_delete: isAvailableToDelete,
      };
    });

    return paginateResponse(
      processedResults,
      total,
      page,
      limit,
      'Parent plan working hour summary berhasil diambil',
    );
  }

  async findOne(id: number): Promise<any> {
    try {
      console.log('Starting findOne with ID:', id);

      // Ambil parent plan tanpa relations yang kompleks
      const parentPlan = await this.parentPlanWorkingHourRepository.findOne({
        where: { id },
      });

      console.log('Parent plan found:', parentPlan);

      if (!parentPlan) {
        throw new BadRequestException(
          `Parent plan working hour dengan ID ${id} tidak ditemukan`,
        );
      }

      // Ambil semua activities dari tabel m_activities dengan error handling
      let allActivities: Activities[] = [];
      try {
        allActivities = await this.dataSource
          .getRepository(Activities)
          .createQueryBuilder('activities')
          .getMany();
        console.log('Activities found:', allActivities.length);
      } catch (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        // Jika ada error, gunakan array kosong
        allActivities = [];
      }

      // Kelompokkan activities berdasarkan status dengan error handling
      let activitiesByStatus: Record<string, Activities[]> = {};
      try {
        activitiesByStatus = allActivities.reduce(
          (acc, activity) => {
            const status = activity.status;
            if (!acc[status]) {
              acc[status] = [];
            }
            acc[status].push(activity);
            return acc;
          },
          {} as Record<string, Activities[]>,
        );
        console.log(
          'Activities grouped by status:',
          Object.keys(activitiesByStatus),
        );
      } catch (groupingError) {
        console.error('Error grouping activities:', groupingError);
        activitiesByStatus = {};
      }

      // Buat response dengan format yang diinginkan
      const response = {
        id: parentPlan.id,
        plan_date: parentPlan.plan_date,
        total_working_hour_month: parentPlan.total_working_hour_month,
        total_working_hour_day: parentPlan.total_working_hour_day,
        total_working_day_longshift: parentPlan.total_working_day_longshift,
        total_working_hour_longshift: this.formatDecimalToString(
          parentPlan.total_working_hour_longshift,
        ),
        total_mohh_per_month: parentPlan.total_mohh_per_month,
        details: Object.entries(activitiesByStatus).map(
          ([status, activities]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
            group_detail: activities.map((activity: Activities) => ({
              activities_id: activity.id,
              name: activity.name,
              type_data: 'number', // Default value as per requirement
              type_field: 'input', // Default value as per requirement
              activities_hour: 1, // Default value as per requirement
            })),
          }),
        ),
      };

      console.log('Response created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  // Method internal untuk mendapatkan entity asli
  private async findOneEntity(id: number): Promise<ParentPlanWorkingHour> {
    const parentPlan = await this.parentPlanWorkingHourRepository.findOne({
      where: { id },
      relations: ['planWorkingHours', 'planWorkingHours.details'],
    });

    if (!parentPlan) {
      throw new BadRequestException(
        `Parent plan working hour dengan ID ${id} tidak ditemukan`,
      );
    }

    return parentPlan;
  }

  async update(
    id: number,
    updateDto: Partial<CreateParentPlanWorkingHourDto>,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Ambil parent plan yang akan diupdate
      const parentPlan = await this.findOneEntity(id);

      // 2. Update parent plan
      Object.assign(parentPlan, updateDto);

      if (updateDto.plan_date) {
        parentPlan.plan_date = new Date(updateDto.plan_date);
      }

      const updatedParentPlan = await queryRunner.manager.save(
        ParentPlanWorkingHour,
        parentPlan,
      );

      // 3. Update data yang sudah ada di r_plan_working_hour (bukan hapus dan insert ulang)
      const existingPlanWorkingHours = await queryRunner.manager.find(
        PlanWorkingHour,
        {
          where: { parent_plan_working_hour_id: id },
        },
      );

      if (existingPlanWorkingHours.length > 0) {
        // Update data yang sudah ada
        for (const planWorkingHour of existingPlanWorkingHours) {
          // Update field yang relevan
          planWorkingHour.working_day_longshift =
            updateDto.total_working_day_longshift ||
            parentPlan.total_working_day_longshift;
          planWorkingHour.working_hour_longshift =
            updateDto.total_working_hour_longshift ||
            parentPlan.total_working_hour_longshift;
          planWorkingHour.working_hour_month =
            (updateDto.total_working_hour_month ||
              parentPlan.total_working_hour_month) /
            existingPlanWorkingHours.length;
          planWorkingHour.working_hour_day =
            updateDto.total_working_hour_day ||
            parentPlan.total_working_hour_day;
          planWorkingHour.mohh_per_month =
            updateDto.total_mohh_per_month || parentPlan.total_mohh_per_month;
        }

        await queryRunner.manager.save(
          PlanWorkingHour,
          existingPlanWorkingHours,
        );
      }

      // 4. Update data yang sudah ada di r_plan_working_hour_detail (bukan hapus dan insert ulang)
      if (updateDto.detail && updateDto.detail.length > 0) {
        // Ambil semua plan working hour IDs
        const planWorkingHourIds = existingPlanWorkingHours.map(
          (pwh) => pwh.id,
        );

        // Hapus detail lama yang tidak ada di update data
        await queryRunner.manager.delete(PlanWorkingHourDetail, {
          plant_working_hour_id: In(planWorkingHourIds),
        });

        // Insert detail baru untuk semua tanggal
        const planWorkingHourDetails: PlanWorkingHourDetail[] = [];

        for (const planWorkingHour of existingPlanWorkingHours) {
          for (const activityDetail of updateDto.detail) {
            const detail = this.planWorkingHourDetailRepository.create({
              plant_working_hour_id: planWorkingHour.id,
              activities_id: activityDetail.activities_id,
              activities_hour: activityDetail.activities_hour,
            });

            planWorkingHourDetails.push(detail);
          }
        }

        await queryRunner.manager.save(
          PlanWorkingHourDetail,
          planWorkingHourDetails,
        );
      }

      await queryRunner.commitTransaction();

      // 5. Return response dengan format yang sama seperti findOne
      return await this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error in update:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateDetail(
    id: number,
    updateDto: Partial<UpdateDetailParentPlanWorkingHourDto>,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Ambil parent plan yang akan diupdate
      const parentPlan = await this.findOneEntity(id);

      // 2. Update parent plan jika ada perubahan
      if (updateDto.plan_date) {
        parentPlan.plan_date = new Date(updateDto.plan_date);
        await queryRunner.manager.save(ParentPlanWorkingHour, parentPlan);
      }

      // 3. Update data di r_plan_working_hour
      const existingPlanWorkingHours = await queryRunner.manager.find(
        PlanWorkingHour,
        {
          where: { parent_plan_working_hour_id: id },
        },
      );

      if (existingPlanWorkingHours.length > 0) {
        // Update data yang sudah ada
        for (const planWorkingHour of existingPlanWorkingHours) {
          // Update field yang relevan dengan field baru
          if (updateDto.working_day_longshift !== undefined) {
            planWorkingHour.working_day_longshift =
              updateDto.working_day_longshift;
          }
          if (updateDto.working_hour_longshift !== undefined) {
            planWorkingHour.working_hour_longshift =
              updateDto.working_hour_longshift;
          }
          if (updateDto.working_hour_month !== undefined) {
            planWorkingHour.working_hour_month =
              updateDto.working_hour_month / existingPlanWorkingHours.length;
          }
          if (updateDto.working_hour_day !== undefined) {
            planWorkingHour.working_hour_day = updateDto.working_hour_day;
          }
          if (updateDto.mohh_per_month !== undefined) {
            planWorkingHour.mohh_per_month = updateDto.mohh_per_month;
          }
          if (updateDto.schedule_day !== undefined) {
            planWorkingHour.schedule_day = updateDto.schedule_day;
          }
        }

        await queryRunner.manager.save(
          PlanWorkingHour,
          existingPlanWorkingHours,
        );
      }

      // 4. Update data di r_plan_working_hour_detail
      if (updateDto.detail && updateDto.detail.length > 0) {
        // Ambil semua plan working hour IDs
        const planWorkingHourIds = existingPlanWorkingHours.map(
          (pwh) => pwh.id,
        );

        // Hapus detail lama yang tidak ada di update data
        await queryRunner.manager.delete(PlanWorkingHourDetail, {
          plant_working_hour_id: In(planWorkingHourIds),
        });

        // Insert detail baru untuk semua tanggal
        const planWorkingHourDetails: PlanWorkingHourDetail[] = [];

        for (const planWorkingHour of existingPlanWorkingHours) {
          for (const activityDetail of updateDto.detail) {
            const detail = this.planWorkingHourDetailRepository.create({
              plant_working_hour_id: planWorkingHour.id,
              activities_id: activityDetail.activities_id,
              activities_hour: activityDetail.activities_hour,
            });

            planWorkingHourDetails.push(detail);
          }
        }

        await queryRunner.manager.save(
          PlanWorkingHourDetail,
          planWorkingHourDetails,
        );
      }

      await queryRunner.commitTransaction();

      // 5. Return response dengan format yang sama seperti findOne
      return await this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error in updateDetail:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const parentPlan = await this.findOneEntity(id);
    await this.parentPlanWorkingHourRepository.softDelete(id);
  }

  async getDetail(query: GetParentPlanWorkingHourDetailQueryDto) {
    const page = parseInt(query.page || '1');
    const limit = Math.min(parseInt(query.limit || '10'), 100);
    const offset = (page - 1) * limit;

    // Parse dates
    const startDate = new Date(query.start_date);
    const endDate = new Date(query.end_date);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Build query untuk mengambil data plan working hour
    const queryBuilder = this.planWorkingHourRepository
      .createQueryBuilder('pwh')
      .leftJoinAndSelect('pwh.details', 'details')
      .leftJoinAndSelect('details.activities', 'activities')
      .where('pwh.plan_date >= :startDate', { startDate })
      .andWhere('pwh.plan_date <= :endDate', { endDate });

    // Add filter berdasarkan calendar_day
    if (query.calendar_day) {
      switch (query.calendar_day) {
        case 'available':
          queryBuilder.andWhere('pwh.schedule_day = :scheduleDay', { scheduleDay: 1 });
          break;
        case 'holiday':
          queryBuilder.andWhere('pwh.schedule_day = :scheduleDay', { scheduleDay: 0 });
          break;
        case 'one-shift':
          queryBuilder.andWhere('pwh.schedule_day = :scheduleDay', { scheduleDay: 0.5 });
          break;
      }
    }

    queryBuilder.orderBy('pwh.plan_date', 'ASC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated data
    const planWorkingHours = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();

    // Process data untuk response
    const result = await Promise.all(
      planWorkingHours.map((pwh) => {
        // Hitung total berdasarkan status activities
        let totalDelay = 0;
        let totalIdle = 0;
        let totalBreakdown = 0;

        if (pwh.details && pwh.details.length > 0) {
          for (const detail of pwh.details) {
            if (detail.activities && detail.activities.status) {
              switch (detail.activities.status) {
                case 'delay':
                  totalDelay += detail.activities_hour || 0;
                  break;
                case 'idle':
                  totalIdle += detail.activities_hour || 0;
                  break;
                case 'breakdown':
                  totalBreakdown += detail.activities_hour || 0;
                  break;
              }
            }
          }
        }

        // Hitung metrics
        const totalMohh = pwh.mohh_per_month || 0;
        const ewh = Math.max(0, totalMohh - totalDelay - totalBreakdown);

        // Hitung PA, MA, UA, EU
        const pa =
          totalMohh > 0 ? (ewh + totalDelay + totalIdle) / totalMohh : 0;
        const ma = ewh + totalBreakdown > 0 ? ewh / (ewh + totalBreakdown) : 0;
        const ua =
          ewh + totalDelay + totalIdle > 0
            ? ewh / (ewh + totalDelay + totalIdle)
            : 0;
        const eu =
          ewh + totalDelay + totalIdle + totalBreakdown > 0
            ? ewh / (ewh + totalDelay + totalIdle + totalBreakdown)
            : 0;

        // Tentukan calendar day status berdasarkan schedule_day
        let calendarDay = 'holiday';
        if (pwh.schedule_day === 1) {
          calendarDay = 'available';
        } else if (pwh.schedule_day === 0.5) {
          calendarDay = 'one-shift';
        } else if (pwh.schedule_day === 0) {
          calendarDay = 'holiday';
        }

        // Tentukan availability untuk edit dan delete
        const planDate = new Date(pwh.plan_date);
        // Set time to start of day for accurate comparison
        planDate.setHours(0, 0, 0, 0);
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);

        // true hanya jika plan_date lebih dari tanggal hari ini
        const isAvailableToEdit = planDate > todayStart;
        const isAvailableToDelete = planDate > todayStart;

        return {
          r_plan_working_hour_id: pwh.id,
          plan_date: pwh.plan_date.toISOString().split('T')[0], // Format YYYY-MM-DD
          calendar_day: calendarDay,
          working_hour_day: this.roundToTwoDecimals(pwh.working_hour_day || 0),
          working_hour_month: this.roundToTwoDecimals(
            pwh.working_hour_month || 0,
          ),
          working_hour_longshift: this.roundToTwoDecimals(
            pwh.working_hour_longshift || 0,
          ),
          working_day_longshift: this.roundToTwoDecimals(
            pwh.working_day_longshift || 0,
          ),
          mohh_per_month: this.roundToTwoDecimals(pwh.mohh_per_month || 0),
          schedule_day: this.roundToTwoDecimals(pwh.schedule_day || 1),
          total_delay: this.roundToTwoDecimals(totalDelay),
          total_idle: this.roundToTwoDecimals(totalIdle),
          total_breakdown: this.roundToTwoDecimals(totalBreakdown),
          ewh: this.roundToTwoDecimals(ewh),
          pa: this.roundToTwoDecimals(pa),
          ma: this.roundToTwoDecimals(ma),
          ua: this.roundToTwoDecimals(ua),
          eu: this.roundToTwoDecimals(eu),
          is_available_to_edit: isAvailableToEdit,
          is_available_to_delete: isAvailableToDelete,
        };
      }),
    );

    return paginateResponse(
      result,
      total,
      page,
      limit,
      'Detail parent plan working hour berhasil diambil',
    );
  }

  async getDetailById(id: number) {
    // Get data dari r_plan_working_hour dengan join ke detail dan activities
    const planWorkingHour = await this.planWorkingHourRepository
      .createQueryBuilder('pwh')
      .leftJoinAndSelect('pwh.details', 'details')
      .leftJoinAndSelect('details.activities', 'activities')
      .where('pwh.id = :id', { id })
      .getOne();

    if (!planWorkingHour) {
      throw new BadRequestException(
        `Plan working hour dengan ID ${id} tidak ditemukan`,
      );
    }

    // Hitung total berdasarkan status activities
    let totalDelay = 0;
    let totalIdle = 0;
    let totalBreakdown = 0;

    if (planWorkingHour.details && planWorkingHour.details.length > 0) {
      for (const detail of planWorkingHour.details) {
        if (detail.activities && detail.activities.status) {
          switch (detail.activities.status) {
            case 'delay':
              totalDelay += detail.activities_hour || 0;
              break;
            case 'idle':
              totalIdle += detail.activities_hour || 0;
              break;
            case 'breakdown':
              totalBreakdown += detail.activities_hour || 0;
              break;
          }
        }
      }
    }

    // Hitung metrics
    const totalMohh = planWorkingHour.mohh_per_month || 0;
    const ewh = Math.max(0, totalMohh - totalDelay - totalBreakdown);

    // Hitung PA, MA, UA, EU
    const pa = totalMohh > 0 ? (ewh + totalDelay + totalIdle) / totalMohh : 0;
    const ma = ewh + totalBreakdown > 0 ? ewh / (ewh + totalBreakdown) : 0;
    const ua =
      ewh + totalDelay + totalIdle > 0
        ? ewh / (ewh + totalDelay + totalIdle)
        : 0;
    const eu =
      ewh + totalDelay + totalIdle + totalBreakdown > 0
        ? ewh / (ewh + totalDelay + totalIdle + totalBreakdown)
        : 0;

    // Tentukan calendar day status berdasarkan schedule_day
    let calendarDay = 'holiday';
    if (planWorkingHour.schedule_day === 1) {
      calendarDay = 'available';
    } else if (planWorkingHour.schedule_day === 0.5) {
      calendarDay = 'one-shift';
    } else if (planWorkingHour.schedule_day === 0) {
      calendarDay = 'holiday';
    }

    // Tentukan availability untuk edit dan delete
    const planDate = new Date(planWorkingHour.plan_date);
    const today = new Date();
    // Set time to start of day for accurate comparison
    planDate.setHours(0, 0, 0, 0);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    // true hanya jika plan_date lebih dari tanggal hari ini
    const isAvailableToEdit = planDate > todayStart;
    const isAvailableToDelete = planDate > todayStart;

    // Process activities data
    const activities =
      planWorkingHour.details?.map((detail) => ({
        id: detail.id,
        activities_id: detail.activities_id,
        activities_hour: this.roundToTwoDecimals(detail.activities_hour || 0),
        activity_name: detail.activities?.name || '',
        activity_status: detail.activities?.status || '',
        activities_group_id: null, // TODO: Implement when activities_group entity is available
        activities_group_name: '', // TODO: Implement when activities_group entity is available
      })) || [];

    // Group activities by status
    const delayActivities =
      planWorkingHour.details
        ?.filter((detail) => detail.activities?.status === 'delay')
        .map((detail) => ({
          activities_id: detail.activities_id,
          name: detail.activities?.name || '',
          type_data: 'number',
          type_field: 'input',
          activities_hour: detail.activities_hour || 0,
        })) || [];

    const workingActivities =
      planWorkingHour.details
        ?.filter((detail) => detail.activities?.status === 'working')
        .map((detail) => ({
          activities_id: detail.activities_id,
          name: detail.activities?.name || '',
          type_data: 'number',
          type_field: 'input',
          activities_hour: detail.activities_hour || 0,
        })) || [];

    const breakdownActivities =
      planWorkingHour.details
        ?.filter((detail) => detail.activities?.status === 'breakdown')
        .map((detail) => ({
          activities_id: detail.activities_id,
          name: detail.activities?.name || '',
          type_data: 'number',
          type_field: 'input',
          activities_hour: detail.activities_hour || 0,
        })) || [];

    const idleActivities =
      planWorkingHour.details
        ?.filter((detail) => detail.activities?.status === 'idle')
        .map((detail) => ({
          activities_id: detail.activities_id,
          name: detail.activities?.name || '',
          type_data: 'number',
          type_field: 'input',
          activities_hour: detail.activities_hour || 0,
        })) || [];

    const nullActivities =
      planWorkingHour.details
        ?.filter((detail) => !detail.activities?.status)
        .map((detail) => ({
          activities_id: detail.activities_id,
          name: detail.activities?.name || '',
          type_data: 'number',
          type_field: 'input',
          activities_hour: detail.activities_hour || 0,
        })) || [];

    // Create details array
    const details = [
      {
        name: 'Delay',
        group_detail: delayActivities,
      },
      {
        name: 'Working',
        group_detail: workingActivities,
      },
      {
        name: 'Breakdown',
        group_detail: breakdownActivities,
      },
      {
        name: 'Idle',
        group_detail: idleActivities,
      },
      {
        name: 'Null',
        group_detail: nullActivities,
      },
    ];

    return {
      id: planWorkingHour.id,
      plan_date: planWorkingHour.plan_date,
      total_working_hour_month: this.roundToTwoDecimals(
        planWorkingHour.working_hour_month || 0,
      ),
      total_working_hour_day: this.roundToTwoDecimals(
        planWorkingHour.working_hour_day || 0,
      ),
      total_working_day_longshift: this.roundToTwoDecimals(
        planWorkingHour.working_day_longshift || 0,
      ),
      total_working_hour_longshift: this.roundToTwoDecimals(
        planWorkingHour.working_hour_longshift || 0,
      ).toFixed(2),
      total_mohh_per_month: this.roundToTwoDecimals(
        planWorkingHour.mohh_per_month || 0,
      ),
      details: details.map((group) => ({
        name: group.name,
        group_detail: group.group_detail.map((activity) => ({
          activities_id: activity.activities_id,
          name: activity.name,
          type_data: activity.type_data,
          type_field: activity.type_field,
          activities_hour: this.roundToTwoDecimals(activity.activities_hour),
        })),
      })),
    };
  }

  private formatDecimalToString(value: number | string): string {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
