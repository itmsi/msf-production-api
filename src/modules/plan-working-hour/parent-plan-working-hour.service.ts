import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  In,
  IsNull,
  Between,
  SelectQueryBuilder,
} from 'typeorm';
import { ParentPlanWorkingHour } from './entities/parent-plan-working-hour.entity';
import { PlanWorkingHour } from './entities/plan-working-hour.entity';
import { PlanWorkingHourDetail } from './entities/plan-working-hour-detail.entity';
import {
  CreateParentPlanWorkingHourDto,
  GetParentPlanWorkingHourQueryDto,
  GetParentPlanWorkingHourDetailQueryDto,
  UpdateDetailParentPlanWorkingHourDto,
  UpdateParentPlanWorkingHourSimpleDto,
  ExportParentPlanWorkingHourQueryDto,
} from './dto/parent-plan-working-hour.dto';
import { CsvHelper, paginateResponse   setCsvExportHeaders,
} from '../../common/helpers/public.helper';
import { Activities } from '../activities/entities/activities.entity';
import { validateImportFile } from 'src/common/helpers/validation.helper';
import moment from 'moment';
import { successResponse, throwError } from 'src/common';
import { S3Service } from 'src/integrations/s3/s3.service';
import { Response } from 'express';
import { format } from '@fast-csv/format';

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
    private s3Service: S3Service,
  ) {}

  // Helper method untuk menghitung jumlah hari dalam bulan
  private getDaysInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }

  // Helper method untuk menghitung jumlah hari kerja dalam bulan (termasuk hari sabtu dan minggu)
  private getWorkingDaysInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = this.getDaysInMonth(date);

    // Semua hari dihitung sebagai hari kerja (termasuk sabtu dan minggu)
    return daysInMonth;
  }

  async create(createDto: CreateParentPlanWorkingHourDto): Promise<ParentPlanWorkingHour> {
    // Konversi otomatis plan_date ke tanggal pertama dari bulan jika bukan tanggal pertama
    const inputDate = new Date(createDto.plan_date);
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth();
    const day = inputDate.getDate();

    // Jika tanggal sudah tanggal pertama (01), gunakan langsung
    // Jika bukan tanggal pertama, konversi ke tanggal pertama dari bulan yang sama
    let planDate: Date;
    if (day === 1) {
      // Tanggal sudah tanggal pertama, gunakan langsung
      planDate = inputDate;
    } else {
      // Konversi ke tanggal pertama dari bulan yang sama
      planDate = new Date(year, month, 1);
      createDto.plan_date = planDate.toLocaleDateString('en-CA');
    }

    // Validasi duplikat bulan di tahun yang sama
    const yearAfterConversion = planDate.getFullYear();
    const monthAfterConversion = planDate.getMonth();

    // Validasi bahwa plan_date tidak boleh di masa lalu (untuk bulan yang sudah lewat)
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (yearAfterConversion < currentYear || (yearAfterConversion === currentYear && monthAfterConversion < currentMonth)) {
      throw new BadRequestException(
        `Tidak dapat membuat plan untuk bulan yang sudah lewat. ` +
          `Bulan yang dipilih: ${yearAfterConversion}-${String(monthAfterConversion + 1).padStart(2, '0')}. ` +
          `Bulan saat ini: ${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
      );
    }

    // Hitung field yang diperlukan otomatis
    const totalCalendarDay = this.getDaysInMonth(planDate);
    const totalHolidayDay = 0; // Semua hari bukan holiday, jadi 0
    const totalAvailableDay = this.getDaysInMonth(planDate); // Semua hari adalah hari kerja

    // Validasi detail activities tidak kosong
    if (!createDto.detail || createDto.detail.length === 0) {
      throw new BadRequestException('Detail activities tidak boleh kosong. Minimal harus ada satu aktivitas.');
    }

    // Validasi activities_id unik
    const uniqueActivitiesIds = [...new Set(createDto.detail.map((d) => d.activities_id))];
    if (uniqueActivitiesIds.length !== createDto.detail.length) {
      throw new BadRequestException('Activities ID harus unik. Tidak boleh ada duplikasi activities_id dalam detail.');
    }

    // Validasi bahwa semua activities_id yang dikirim ada di database
    const activities = await this.dataSource.getRepository(Activities).find({
      where: {
        id: In(uniqueActivitiesIds),
        deletedAt: IsNull(),
      },
      select: ['id'],
    });

    if (activities.length !== uniqueActivitiesIds.length) {
      const foundIds = activities.map((a) => a.id);
      const missingIds = uniqueActivitiesIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(`Activities ID berikut tidak ditemukan atau sudah dihapus: ${missingIds.join(', ')}`);
    }

    // Validasi activities_hour tidak negatif
    for (const detail of createDto.detail) {
      if (detail.activities_hour < 0) {
        throw new BadRequestException(
          `Activities hour tidak boleh negatif. Activities ID ${detail.activities_id}: ${detail.activities_hour}`,
        );
      }
    }

    // Cek apakah sudah ada data untuk bulan yang sama di tahun yang sama
    // Menggunakan pendekatan yang kompatibel dengan berbagai database
    const startOfMonth = new Date(yearAfterConversion, monthAfterConversion, 1);
    const endOfMonth = new Date(yearAfterConversion, monthAfterConversion + 1, 0, 23, 59, 59, 999);

    // Query untuk mencari data yang plan_date-nya berada dalam rentang bulan yang sama
    // Menggunakan BETWEEN untuk kompatibilitas yang lebih baik
    // Hanya cek data yang tidak di-soft delete
    const existingPlan = await this.parentPlanWorkingHourRepository
      .createQueryBuilder('ppwh')
      .where('ppwh.plan_date BETWEEN :startOfMonth AND :endOfMonth', {
        startOfMonth,
        endOfMonth,
      })
      .andWhere('ppwh.deletedAt IS NULL') // Hanya cek data yang tidak di-soft delete
      .getOne();

    if (existingPlan) {
      const monthNames = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
      throw new BadRequestException(
        `Data untuk bulan ${monthNames[monthAfterConversion]} ${yearAfterConversion} sudah ada dalam sistem. ` +
          `Silakan gunakan bulan lain atau update data yang sudah ada.`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Insert ke tabel r_parent_plan_working_hour
      const parentPlan = this.parentPlanWorkingHourRepository.create({
        plan_date: new Date(createDto.plan_date),
        total_calendar_day: totalCalendarDay,
        total_holiday_day: totalHolidayDay,
        total_available_day: totalAvailableDay,
        total_working_hour_month: createDto.total_working_hour_month,
        total_working_day_longshift:
          typeof createDto.total_working_day_longshift === 'boolean'
            ? createDto.total_working_day_longshift
              ? 1
              : 0
            : createDto.total_working_day_longshift,
        total_working_hour_day: createDto.total_working_hour_day,
        total_working_hour_longshift: createDto.total_working_hour_longshift,
        total_mohh_per_month: createDto.total_mohh_per_month,
      });

      const savedParentPlan = await queryRunner.manager.save(ParentPlanWorkingHour, parentPlan);

      // 2. Generate tanggal untuk bulan yang dipilih
      const year = yearAfterConversion;
      const month = monthAfterConversion;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // 3. Insert ke tabel r_plan_working_hour untuk setiap tanggal
      const planWorkingHours: PlanWorkingHour[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);

        const planWorkingHour = this.planWorkingHourRepository.create({
          plan_date: currentDate,
          is_calender_day: true, // auto true semua
          is_holiday_day: false, // auto false semua
          is_schedule_day: true, // semua hari dihitung hari kerja jadi auto true semua
          schedule_day: 1, // default schedule_day = 1 untuk semua hari
          working_day_longshift:
            typeof createDto.total_working_day_longshift === 'boolean'
              ? createDto.total_working_day_longshift
                ? 1
                : 0
              : createDto.total_working_day_longshift,
          working_hour_longshift: 0, // Set default ke 0 sesuai permintaan
          working_hour_month: createDto.total_working_hour_month / daysInMonth,
          working_hour_day: createDto.total_working_hour_day,
          mohh_per_month: createDto.total_mohh_per_month / daysInMonth, // Dibagi jumlah hari di bulan
          parent_plan_working_hour_id: savedParentPlan.id,
        });

        // Update working_longshift berdasarkan total_working_day_longshift
        if (typeof createDto.total_working_day_longshift === 'boolean') {
          // Jika total_working_day_longshift adalah boolean
          planWorkingHour.working_longshift = createDto.total_working_day_longshift;
          planWorkingHour.working_day_longshift = createDto.total_working_day_longshift ? 1 : 0;
          planWorkingHour.working_hour_longshift = createDto.total_working_day_longshift ? createDto.total_working_hour_longshift || 0 : 0;
        } else {
          // Jika total_working_day_longshift adalah number
          const isLongshift = createDto.total_working_day_longshift > 0;
          planWorkingHour.working_longshift = isLongshift;
          planWorkingHour.working_day_longshift = createDto.total_working_day_longshift;
          planWorkingHour.working_hour_longshift = isLongshift ? createDto.total_working_hour_longshift || 0 : 0;
        }

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

      // 5. Update total_working_hour_month di parent plan berdasarkan jumlah dari r_plan_working_hour
      // Dan langsung update total_working_hour_day dari payload tanpa akumulasi
      const updatedPlanWorkingHours = await queryRunner.manager.find(PlanWorkingHour, {
        where: { parent_plan_working_hour_id: savedParentPlan.id },
      });

      if (updatedPlanWorkingHours.length > 0) {
        // Hitung total working_hour_month dari semua record di r_plan_working_hour
        const totalWorkingHourMonth = updatedPlanWorkingHours.reduce((sum, pwh) => sum + (pwh.working_hour_month || 0), 0);

        // Hitung total mohh_per_month dari semua record di r_plan_working_hour
        const totalMohhPerMonth = updatedPlanWorkingHours.reduce((sum, pwh) => sum + (pwh.mohh_per_month || 0), 0);

        // Update parent plan dengan nilai yang dihitung untuk total_working_hour_month (dibulatkan ke 2 desimal)
        savedParentPlan.total_working_hour_month = Math.round(totalWorkingHourMonth * 100) / 100;

        // Update total_mohh_per_month di parent plan berdasarkan jumlah dari r_plan_working_hour (dibulatkan ke 2 desimal)
        savedParentPlan.total_mohh_per_month = Math.round(totalMohhPerMonth * 100) / 100;

        // Langsung update total_working_hour_day dari payload tanpa akumulasi dari r_plan_working_hour
        if (createDto.total_working_hour_day !== undefined) {
          savedParentPlan.total_working_hour_day = createDto.total_working_hour_day;
        }

        // Langsung update total_working_hour_longshift dan total_working_day_longshift dari payload
        if (createDto.total_working_hour_longshift !== undefined) {
          savedParentPlan.total_working_hour_longshift = createDto.total_working_hour_longshift;
        }
        if (createDto.total_working_day_longshift !== undefined) {
          savedParentPlan.total_working_day_longshift =
            typeof createDto.total_working_day_longshift === 'boolean'
              ? createDto.total_working_day_longshift
                ? 1
                : 0
              : createDto.total_working_day_longshift;
        }

        await queryRunner.manager.save(ParentPlanWorkingHour, savedParentPlan);
      }

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

      // Jika error sudah BadRequestException, throw langsung
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Jika error lain, buat message yang lebih detail
      let errorMessage = 'Gagal membuat parent plan working hour';

      if (error.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'Data dengan informasi yang sama sudah ada dalam sistem';
        } else if (error.message.includes('violates foreign key constraint')) {
          errorMessage = 'Data referensi tidak ditemukan (activities_id tidak valid)';
        } else if (error.message.includes('invalid input syntax')) {
          errorMessage = 'Format data tidak valid';
        } else {
          errorMessage += `: ${error.message}`;
        }
      }

      throw new BadRequestException(errorMessage);
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
        'COUNT(DISTINCT CASE WHEN pwh.is_schedule_day = true THEN pwh.plan_date END) as schedule_day',
        'COUNT(DISTINCT CASE WHEN pwh.is_holiday_day = true THEN pwh.plan_date END) as holiday_day',
        'ppwh.total_working_hour_month as working_hour_month',
        'ppwh.total_working_hour_day as working_hour_day',
        'ppwh.total_working_hour_longshift as working_hour_longshift',
        'ppwh.total_working_day_longshift as working_day_longshift',
        'ppwh.total_mohh_per_month as total_mohh',
        'SUM(CASE WHEN a.status = :delayStatus THEN COALESCE(pwhd.activities_hour, 0) ELSE 0 END) as total_delay',
        'SUM(CASE WHEN a.status = :idleStatus THEN COALESCE(pwhd.activities_hour, 0) ELSE 0 END) as total_idle',
        'SUM(CASE WHEN a.status = :breakdownStatus THEN COALESCE(pwhd.activities_hour, 0) ELSE 0 END) as total_breakdown',
      ])
      .from('r_parent_plan_working_hour', 'ppwh')
      .leftJoin('r_plan_working_hour', 'pwh', 'pwh.parent_plan_working_hour_id = ppwh.id')
      .leftJoin('r_plan_working_hour_detail', 'pwhd', 'pwhd.plant_working_hour_id = pwh.id')
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

    queryBuilder.groupBy('ppwh.id, ppwh.plan_date, ppwh.createdAt, ppwh.updatedAt');

    // Get total count for pagination
    const countQueryBuilder = this.dataSource
      .createQueryBuilder()
      .select('COUNT(DISTINCT ppwh.id)', 'count')
      .from('r_parent_plan_working_hour', 'ppwh');

    if (month) {
      countQueryBuilder.andWhere('EXTRACT(MONTH FROM ppwh.plan_date) = :month', {
        month: month,
      });
    }

    const totalResult = await countQueryBuilder.getRawOne();
    const total = parseInt(totalResult?.count || '0');

    // Apply sorting and pagination
    queryBuilder.orderBy(`ppwh.${validSortBy}`, validSortOrder).skip(skip).take(limit);

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

      const totalDelay = roundToTwoDecimals(parseFloat(result.total_delay) || 0);
      const totalIdle = roundToTwoDecimals(parseFloat(result.total_idle) || 0);
      const totalBreakdown = roundToTwoDecimals(parseFloat(result.total_breakdown) || 0);
      const totalMohh = roundToTwoDecimals(parseFloat(result.total_mohh) || 0);

      // Hitung EWH
      const ewh = roundToTwoDecimals(totalMohh - totalDelay - totalIdle - totalBreakdown);

      // Hitung PA
      const pa = totalMohh > 0 ? roundToTwoDecimals((ewh + totalDelay + totalIdle) / totalMohh) : 0;

      // Hitung MA
      const ma = ewh + totalBreakdown > 0 ? roundToTwoDecimals(ewh / (ewh + totalBreakdown)) : 0;

      // Hitung UA
      const ua = ewh + totalDelay + totalIdle > 0 ? roundToTwoDecimals(ewh / (ewh + totalDelay + totalIdle)) : 0;

      // Hitung EU
      const eu =
        ewh + totalDelay + totalIdle + totalBreakdown > 0 ? roundToTwoDecimals(ewh / (ewh + totalDelay + totalIdle + totalBreakdown)) : 0;

      // Status edit dan delete - jika plan_date lebih dari bulan ini maka true
      const isAvailableToEdit = planYear > currentYear || (planYear === currentYear && planMonth > currentMonth);
      const isAvailableToDelete = planYear > currentYear || (planYear === currentYear && planMonth > currentMonth);

      return {
        parent_id: result.parent_id,
        month_year: monthYear,
        schedule_day: parseInt(result.schedule_day) || 0,
        holiday_day: parseInt(result.holiday_day) || 0,
        calendar_day: parseInt(result.schedule_day) + parseInt(result.holiday_day) || 0,
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
        is_available_to_delete: isAvailableToDelete,
      };
    });

    return paginateResponse(processedResults, total, page, limit, 'Parent plan working hour summary berhasil diambil');
  }

  async findOne(id: number): Promise<any> {
    try {
      // Ambil parent plan tanpa relations yang kompleks
      const parentPlan = await this.parentPlanWorkingHourRepository.findOne({
        where: { id },
      });

      if (!parentPlan) {
        throw new BadRequestException(`Parent plan working hour dengan ID ${id} tidak ditemukan`);
      }

      // Ambil data detail dari database untuk activities yang sudah ada
      const planWorkingHourDetails = await this.dataSource
        .createQueryBuilder()
        .select([
          'pwhd.activities_id as activities_id',
          'pwhd.activities_hour as activities_hour',
          'a.name as activity_name',
          'a.status as activity_status',
        ])
        .from('r_plan_working_hour_detail', 'pwhd')
        .leftJoin('r_plan_working_hour', 'pwh', 'pwh.id = pwhd.plant_working_hour_id')
        .leftJoin('m_activities', 'a', 'a.id = pwhd.activities_id')
        .where('pwh.parent_plan_working_hour_id = :parentId', { parentId: id })
        .getRawMany();

      // Kelompokkan activities berdasarkan status dengan data yang sebenarnya
      const activitiesByStatus: Record<string, any[]> = {};

      for (const detail of planWorkingHourDetails) {
        const status = detail.activity_status || 'null';
        if (!activitiesByStatus[status]) {
          activitiesByStatus[status] = [];
        }

        // Cek apakah activity sudah ada di grup
        const existingActivity = activitiesByStatus[status].find((act) => act.activities_id === detail.activities_id);

        if (!existingActivity) {
          activitiesByStatus[status].push({
            activities_id: detail.activities_id,
            name: detail.activity_name,
            type_data: 'number',
            type_field: 'input',
            activities_hour: detail.activities_hour,
          });
        }
      }

      // Buat response dengan format yang diinginkan - selalu tampilkan idle, delay, breakdown
      const allowedStatuses = ['idle', 'delay', 'breakdown'];
      const filteredActivities = Object.entries(activitiesByStatus)
        .filter(([status]) => allowedStatuses.includes(status.toLowerCase()))
        .sort(([statusA], [statusB]) => {
          const order = { idle: 0, delay: 1, breakdown: 2 };
          return order[statusA.toLowerCase()] - order[statusB.toLowerCase()];
        });

      // Pastikan semua status yang diinginkan selalu ada dalam response
      const finalDetails: Array<{
        name: string;
        group_detail: any[];
      }> = [];
      for (const status of allowedStatuses) {
        const existingStatus = filteredActivities.find(([s]) => s.toLowerCase() === status);
        if (existingStatus) {
          finalDetails.push({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            group_detail: existingStatus[1],
          });
        } else {
          // Jika status tidak ada, tambahkan dengan group_detail kosong
          finalDetails.push({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            group_detail: [],
          });
        }
      }

      const response = {
        id: parentPlan.id,
        plan_date: parentPlan.plan_date,
        total_working_hour_month: parentPlan.total_working_hour_month,
        total_working_hour_day: parentPlan.total_working_hour_day,
        total_working_day_longshift: parentPlan.total_working_day_longshift,
        total_working_hour_longshift: this.formatDecimalToString(parentPlan.total_working_hour_longshift),
        total_mohh_per_month: parentPlan.total_mohh_per_month,
        details: finalDetails,
      };

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
      throw new BadRequestException(`Parent plan working hour dengan ID ${id} tidak ditemukan`);
    }

    return parentPlan;
  }

  async update(id: number, updateDto: UpdateParentPlanWorkingHourSimpleDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Ambil parent plan yang akan diupdate
      const parentPlan = await this.findOneEntity(id);

      // 2. Validasi duplikat bulan jika plan_date diupdate
      if (updateDto.plan_date) {
        // Konversi otomatis plan_date ke tanggal pertama dari bulan
        const inputDate = new Date(updateDto.plan_date);
        const year = inputDate.getFullYear();
        const month = inputDate.getMonth();

        // Buat tanggal pertama dari bulan yang sama
        const newPlanDate = new Date(year, month, 1);

        // Update plan_date dengan tanggal yang sudah dikonversi
        updateDto.plan_date = newPlanDate.toLocaleDateString('en-CA');

        // Validasi bahwa plan_date tidak boleh di masa lalu (untuk bulan yang sudah lewat)
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          throw new BadRequestException(
            `Tidak dapat mengupdate plan untuk bulan yang sudah lewat. ` +
              `Bulan yang dipilih: ${year}-${String(month + 1).padStart(2, '0')}. ` +
              `Bulan saat ini: ${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
          );
        }

        // Cek apakah sudah ada data untuk bulan yang sama di tahun yang sama (kecuali record yang sedang diupdate)
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const existingPlan = await this.parentPlanWorkingHourRepository
          .createQueryBuilder('ppwh')
          .where('ppwh.plan_date BETWEEN :startOfMonth AND :endOfMonth', {
            startOfMonth,
            endOfMonth,
          })
          .andWhere('ppwh.deletedAt IS NULL') // Hanya cek data yang tidak di-soft delete
          .andWhere('ppwh.id != :currentId', { currentId: id }) // Kecualikan record yang sedang diupdate
          .getOne();

        if (existingPlan) {
          const monthNames = [
            'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember',
          ];
          throw new BadRequestException(
            `Data untuk bulan ${monthNames[month]} ${year} sudah ada dalam sistem. ` +
              `Silakan gunakan bulan lain atau update data yang sudah ada.`,
          );
        }
      }

      // 3. Update parent plan - hanya update field yang ada di request
      if (updateDto.plan_date) {
        parentPlan.plan_date = new Date(updateDto.plan_date);
      }
      if (updateDto.total_calendar_day !== undefined) {
        parentPlan.total_calendar_day = updateDto.total_calendar_day;
      }
      if (updateDto.total_holiday_day !== undefined) {
        parentPlan.total_holiday_day = updateDto.total_holiday_day;
      }
      if (updateDto.total_available_day !== undefined) {
        parentPlan.total_available_day = updateDto.total_available_day;
      }
      if (updateDto.total_working_hour_month !== undefined) {
        parentPlan.total_working_hour_month = updateDto.total_working_hour_month;
      }
      if (updateDto.total_working_day_longshift !== undefined) {
        parentPlan.total_working_day_longshift =
          typeof updateDto.total_working_day_longshift === 'boolean'
            ? updateDto.total_working_day_longshift
              ? 1
              : 0
            : updateDto.total_working_day_longshift;
      }
      if (updateDto.total_working_hour_day !== undefined) {
        parentPlan.total_working_hour_day = updateDto.total_working_hour_day;
      }
      if (updateDto.total_working_hour_longshift !== undefined) {
        parentPlan.total_working_hour_longshift = updateDto.total_working_hour_longshift;
      }
      if (updateDto.total_mohh_per_month !== undefined) {
        parentPlan.total_mohh_per_month = updateDto.total_mohh_per_month;
      }

      const updatedParentPlan = await queryRunner.manager.save(ParentPlanWorkingHour, parentPlan);

      // 4. Update data yang sudah ada di r_plan_working_hour (bukan hapus dan insert ulang)
      const existingPlanWorkingHours = await queryRunner.manager.find(PlanWorkingHour, {
        where: { parent_plan_working_hour_id: id },
      });

      if (existingPlanWorkingHours.length > 0) {
        // Update data yang sudah ada - hanya update field yang ada di request
        for (const planWorkingHour of existingPlanWorkingHours) {
          if (updateDto.total_working_day_longshift !== undefined) {
            // Convert boolean to number if needed
            const workingDayLongshift =
              typeof updateDto.total_working_day_longshift === 'boolean'
                ? updateDto.total_working_day_longshift
                  ? 1
                  : 0
                : updateDto.total_working_day_longshift;

            // Update working_longshift berdasarkan total_working_day_longshift
            if (typeof updateDto.total_working_day_longshift === 'boolean') {
              // Jika total_working_day_longshift adalah boolean
              planWorkingHour.working_longshift = updateDto.total_working_day_longshift;
              planWorkingHour.working_day_longshift = updateDto.total_working_day_longshift ? 1 : 0;
              planWorkingHour.working_hour_longshift = updateDto.total_working_day_longshift
                ? updateDto.total_working_hour_longshift || 0
                : 0;
            } else {
              // Jika total_working_day_longshift adalah number
              const isLongshift = workingDayLongshift > 0;
              planWorkingHour.working_longshift = isLongshift;
              planWorkingHour.working_day_longshift = workingDayLongshift;
              planWorkingHour.working_hour_longshift = isLongshift ? updateDto.total_working_hour_longshift || 0 : 0;
            }
          } else if (updateDto.total_working_hour_longshift !== undefined) {
            // Jika hanya total_working_hour_longshift yang diupdate
            planWorkingHour.working_hour_longshift = updateDto.total_working_hour_longshift;
          }
          if (updateDto.total_working_hour_month !== undefined) {
            planWorkingHour.working_hour_month = updateDto.total_working_hour_month / existingPlanWorkingHours.length;
          }
          if (updateDto.total_working_hour_day !== undefined) {
            planWorkingHour.working_hour_day = updateDto.total_working_hour_day;
          }
          if (updateDto.total_mohh_per_month !== undefined) {
            planWorkingHour.mohh_per_month = updateDto.total_mohh_per_month / existingPlanWorkingHours.length;
          }
        }

        await queryRunner.manager.save(PlanWorkingHour, existingPlanWorkingHours);
      }

      // 5. Update total_working_hour_month di parent plan berdasarkan jumlah dari r_plan_working_hour
      // Dan langsung update total_working_hour_day dari payload tanpa akumulasi
      const updatedPlanWorkingHours = await queryRunner.manager.find(PlanWorkingHour, {
        where: { parent_plan_working_hour_id: id },
      });

      if (updatedPlanWorkingHours.length > 0) {
        // Hitung total working_hour_month dari semua record di r_plan_working_hour
        const totalWorkingHourMonth = updatedPlanWorkingHours.reduce((sum, pwh) => sum + (pwh.working_hour_month || 0), 0);

        // Hitung total mohh_per_month dari semua record di r_plan_working_hour
        const totalMohhPerMonth = updatedPlanWorkingHours.reduce((sum, pwh) => sum + (pwh.mohh_per_month || 0), 0);

        // Update parent plan dengan nilai yang dihitung untuk total_working_hour_month (dibulatkan ke 2 desimal)
        parentPlan.total_working_hour_month = Math.round(totalWorkingHourMonth * 100) / 100;

        // Update total_mohh_per_month di parent plan berdasarkan jumlah dari r_plan_working_hour (dibulatkan ke 2 desimal)
        parentPlan.total_mohh_per_month = Math.round(totalMohhPerMonth * 100) / 100;

        // Langsung update total_working_hour_day dari payload tanpa akumulasi dari r_plan_working_hour
        if (updateDto.total_working_hour_day !== undefined) {
          parentPlan.total_working_hour_day = updateDto.total_working_hour_day;
        }

        // Langsung update total_working_hour_longshift dan total_working_day_longshift dari payload
        if (updateDto.total_working_hour_longshift !== undefined) {
          parentPlan.total_working_hour_longshift = updateDto.total_working_hour_longshift;
        }
        if (updateDto.total_working_day_longshift !== undefined) {
          parentPlan.total_working_day_longshift =
            typeof updateDto.total_working_day_longshift === 'boolean'
              ? updateDto.total_working_day_longshift
                ? 1
                : 0
              : updateDto.total_working_day_longshift;
        }

        await queryRunner.manager.save(ParentPlanWorkingHour, parentPlan);
      }

      // 6. Update data yang sudah ada di r_plan_working_hour_detail (bukan hapus dan insert ulang)
      if (updateDto.detail && updateDto.detail.length > 0) {
        // Ambil semua plan working hour IDs
        const planWorkingHourIds = existingPlanWorkingHours.map((pwh) => pwh.id);

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

        await queryRunner.manager.save(PlanWorkingHourDetail, planWorkingHourDetails);
      }

      await queryRunner.commitTransaction();

      // 7. Return response dengan format yang sama seperti findOne
      return await this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error in update:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateDetail(id: number, updateDto: Partial<UpdateDetailParentPlanWorkingHourDto>): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Ambil parent plan yang akan diupdate
      const parentPlan = await this.findOneEntity(id);

      // 2. Update parent plan jika ada perubahan
      if (updateDto.plan_date) {
        // Validasi duplikat bulan jika plan_date diupdate
        const newPlanDate = new Date(updateDto.plan_date);
        const year = newPlanDate.getFullYear();
        const month = newPlanDate.getMonth();

        // Validasi bahwa plan_date adalah tanggal pertama dari bulan (01)
        const dayOfMonth = newPlanDate.getDate();
        if (dayOfMonth !== 1) {
          throw new BadRequestException(
            `plan_date harus berupa tanggal pertama dari bulan (01). ` +
              `Tanggal yang dikirim: ${updateDto.plan_date}. ` +
              `Gunakan format YYYY-MM-01 (contoh: 2025-09-01)`,
          );
        }

        // Validasi bahwa plan_date tidak boleh di masa lalu (untuk bulan yang sudah lewat)
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          throw new BadRequestException(
            `Tidak dapat mengupdate plan untuk bulan yang sudah lewat. ` +
              `Bulan yang dipilih: ${year}-${String(month + 1).padStart(2, '0')}. ` +
              `Bulan saat ini: ${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
          );
        }

        // Cek apakah sudah ada data untuk bulan yang sama di tahun yang sama (kecuali record yang sedang diupdate)
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const existingPlan = await this.parentPlanWorkingHourRepository
          .createQueryBuilder('ppwh')
          .where('ppwh.plan_date BETWEEN :startOfMonth AND :endOfMonth', {
            startOfMonth,
            endOfMonth,
          })
          .andWhere('ppwh.deletedAt IS NULL') // Hanya cek data yang tidak di-soft delete
          .andWhere('ppwh.id != :currentId', { currentId: id }) // Kecualikan record yang sedang diupdate
          .getOne();

        if (existingPlan) {
          const monthNames = [
            'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember',
          ];
          throw new BadRequestException(
            `Data untuk bulan ${monthNames[month]} ${year} sudah ada dalam sistem. ` +
              `Silakan gunakan bulan lain atau update data yang sudah ada.`,
          );
        }

        parentPlan.plan_date = new Date(updateDto.plan_date);
        await queryRunner.manager.save(ParentPlanWorkingHour, parentPlan);
      }

      // 3. Update data di r_plan_working_hour
      const existingPlanWorkingHours = await queryRunner.manager.find(PlanWorkingHour, {
        where: { parent_plan_working_hour_id: id },
      });

      if (existingPlanWorkingHours.length > 0) {
        // Update data yang sudah ada
        for (const planWorkingHour of existingPlanWorkingHours) {
          // Update field yang relevan dengan field baru
          if (updateDto.working_day_longshift !== undefined) {
            // Convert boolean to number if needed
            const workingDayLongshift =
              typeof updateDto.working_day_longshift === 'boolean'
                ? updateDto.working_day_longshift
                  ? 1
                  : 0
                : updateDto.working_day_longshift;

            // Update working_longshift berdasarkan working_day_longshift
            if (typeof updateDto.working_day_longshift === 'boolean') {
              // Jika working_day_longshift adalah boolean
              planWorkingHour.working_longshift = updateDto.working_day_longshift;
              planWorkingHour.working_day_longshift = updateDto.working_day_longshift ? 1 : 0;
              planWorkingHour.working_hour_longshift = updateDto.working_day_longshift ? updateDto.working_hour_longshift || 0 : 0;
            } else {
              // Jika working_day_longshift adalah number
              const isLongshift = workingDayLongshift > 0;
              planWorkingHour.working_longshift = isLongshift;
              planWorkingHour.working_day_longshift = workingDayLongshift;
              planWorkingHour.working_hour_longshift = isLongshift ? updateDto.working_hour_longshift || 0 : 0;
            }
          } else if (updateDto.working_hour_longshift !== undefined) {
            // Jika hanya working_hour_longshift yang diupdate
            planWorkingHour.working_hour_longshift = updateDto.working_hour_longshift;
          }
          if (updateDto.working_hour_month !== undefined) {
            planWorkingHour.working_hour_month = updateDto.working_hour_month / existingPlanWorkingHours.length;
          }
          if (updateDto.working_hour_day !== undefined) {
            planWorkingHour.working_hour_day = updateDto.working_hour_day;
          }
          if (updateDto.mohh_per_month !== undefined) {
            planWorkingHour.mohh_per_month = updateDto.mohh_per_month / existingPlanWorkingHours.length;
          }
          if (updateDto.schedule_day !== undefined) {
            planWorkingHour.schedule_day = updateDto.schedule_day;

            // Set is_schedule_day dan is_holiday_day berdasarkan schedule_day
            if (updateDto.schedule_day === 1) {
              planWorkingHour.is_schedule_day = true;
              planWorkingHour.is_holiday_day = false;
            } else if (updateDto.schedule_day === 0.5) {
              planWorkingHour.is_schedule_day = false;
              planWorkingHour.is_holiday_day = false;
            } else if (updateDto.schedule_day === 0) {
              planWorkingHour.is_schedule_day = false;
              planWorkingHour.is_holiday_day = true;
            }
          }
        }

        await queryRunner.manager.save(PlanWorkingHour, existingPlanWorkingHours);
      }

      // 4. Update data di r_plan_working_hour_detail
      if (updateDto.detail && updateDto.detail.length > 0) {
        // Ambil semua plan working hour IDs
        const planWorkingHourIds = existingPlanWorkingHours.map((pwh) => pwh.id);

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

        await queryRunner.manager.save(PlanWorkingHourDetail, planWorkingHourDetails);
      }

      // 5. Update total_working_hour_month di parent plan berdasarkan jumlah dari r_plan_working_hour
      // Dan langsung update total_working_hour_day dari payload tanpa akumulasi
      const updatedPlanWorkingHours = await queryRunner.manager.find(PlanWorkingHour, {
        where: { parent_plan_working_hour_id: id },
      });

      if (updatedPlanWorkingHours.length > 0) {
        // Hitung total working_hour_month dari semua record di r_plan_working_hour
        const totalWorkingHourMonth = updatedPlanWorkingHours.reduce((sum, pwh) => sum + (pwh.working_hour_month || 0), 0);

        // Hitung total mohh_per_month dari semua record di r_plan_working_hour
        const totalMohhPerMonth = updatedPlanWorkingHours.reduce((sum, pwh) => sum + (pwh.mohh_per_month || 0), 0);

        // Update parent plan dengan nilai yang dihitung untuk total_working_hour_month (dibulatkan ke 2 desimal)
        parentPlan.total_working_hour_month = Math.round(totalWorkingHourMonth * 100) / 100;

        // Update total_mohh_per_month di parent plan berdasarkan jumlah dari r_plan_working_hour (dibulatkan ke 2 desimal)
        parentPlan.total_mohh_per_month = Math.round(totalMohhPerMonth * 100) / 100;

        // Langsung update total_working_hour_day dari payload tanpa akumulasi dari r_plan_working_hour
        if (updateDto.working_hour_day !== undefined) {
          parentPlan.total_working_hour_day = updateDto.working_hour_day;
        }

        await queryRunner.manager.save(ParentPlanWorkingHour, parentPlan);
      }

      await queryRunner.commitTransaction();

      // 6. Return response dengan format yang sama seperti findOne
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

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Build query untuk mengambil data plan working hour
    const queryBuilder = this.planWorkingHourRepository
      .createQueryBuilder('pwh')
      .leftJoinAndSelect('pwh.details', 'details')
      .leftJoinAndSelect('details.activities', 'activities');

    // Add date filters only if provided
    if (query.start_date) {
      // Validate date format
      const startDate = new Date(query.start_date);
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException('start_date must be a valid date format (YYYY-MM-DD)');
      }
      queryBuilder.andWhere('pwh.plan_date >= :startDate', { startDate });
    }

    if (query.end_date) {
      // Validate date format
      const endDate = new Date(query.end_date);
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException('end_date must be a valid date format (YYYY-MM-DD)');
      }
      queryBuilder.andWhere('pwh.plan_date <= :endDate', { endDate });
    }

    // Add filter berdasarkan calendar_day
    if (query.calendar_day) {
      switch (query.calendar_day) {
        case 'available':
          queryBuilder.andWhere('pwh.schedule_day = :scheduleDay', {
            scheduleDay: 1,
          });
          break;
        case 'holiday':
          queryBuilder.andWhere('pwh.schedule_day = :scheduleDay', {
            scheduleDay: 0,
          });
          break;
        case 'one-shift':
          queryBuilder.andWhere('pwh.schedule_day = :scheduleDay', {
            scheduleDay: 0.5,
          });
          break;
      }
    }

    queryBuilder.orderBy('pwh.plan_date', 'ASC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated data
    const planWorkingHours = await queryBuilder.skip(offset).take(limit).getMany();

    // Process data untuk response
    const result = await Promise.all(
      planWorkingHours.map((pwh) => {
        // Hitung total berdasarkan status activities
        let totalDelay = 0;
        let totalIdle = 0;
        let totalBreakdown = 0;

        if (pwh.details && pwh.details.length > 0) {
          for (const detail of pwh.details) {
            if (detail.activities?.status) {
              switch (detail.activities.status) {
                case ActivityStatus.DELAY:
                  totalDelay += detail.activities_hour || 0;
                  break;
                case ActivityStatus.IDLE:
                  totalIdle += detail.activities_hour || 0;
                  break;
                case ActivityStatus.BREAKDOWN:
                  totalBreakdown += detail.activities_hour || 0;
                  break;
              }
            }
          }
        }

        // Hitung metrics
        const totalMohh = pwh.mohh_per_month || 0;
        const ewh = Math.max(0, totalMohh - totalDelay - totalIdle - totalBreakdown);

        // Hitung PA, MA, UA, EU
        const pa = totalMohh > 0 ? (ewh + totalDelay + totalIdle) / totalMohh : 0;
        const ma = ewh + totalBreakdown > 0 ? ewh / (ewh + totalBreakdown) : 0;
        const ua = ewh + totalDelay + totalIdle > 0 ? ewh / (ewh + totalDelay + totalIdle) : 0;
        const eu = ewh + totalDelay + totalIdle + totalBreakdown > 0 ? ewh / (ewh + totalDelay + totalIdle + totalBreakdown) : 0;

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
          plan_date: pwh.plan_date.toLocaleDateString('en-CA'), // Format YYYY-MM-DD dengan timezone lokal
          calendar_day: calendarDay,
          working_hour_day: this.roundToTwoDecimals(pwh.working_hour_day || 0),
          working_hour_month: this.roundToTwoDecimals(pwh.working_hour_month || 0),
          working_hour_longshift: this.roundToTwoDecimals(pwh.working_hour_longshift || 0),
          working_day_longshift: this.roundToTwoDecimals(pwh.working_day_longshift || 0),
          mohh_per_month: this.roundToTwoDecimals(pwh.mohh_per_month || 0),
          schedule_day: pwh.schedule_day,
          working_longshift: pwh.working_longshift || false, // ambil langsung dari kolom working_longshift yang bertipe boolean
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

    return paginateResponse(result, total, page, limit, 'Detail parent plan working hour berhasil diambil');
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
      throw new BadRequestException(`Plan working hour dengan ID ${id} tidak ditemukan`);
    }

    // Hitung total berdasarkan status activities
    let totalDelay = 0;
    let totalIdle = 0;
    let totalBreakdown = 0;

    if (planWorkingHour.details && planWorkingHour.details.length > 0) {
      for (const detail of planWorkingHour.details) {
        if (detail.activities?.status) {
          switch (detail.activities.status) {
            case ActivityStatus.DELAY:
              totalDelay += detail.activities_hour || 0;
              break;
            case ActivityStatus.IDLE:
              totalIdle += detail.activities_hour || 0;
              break;
            case ActivityStatus.BREAKDOWN:
              totalBreakdown += detail.activities_hour || 0;
              break;
          }
        }
      }
    }

    // Hitung metrics
    const totalMohh = planWorkingHour.mohh_per_month || 0;
    const ewh = Math.max(0, totalMohh - totalDelay - totalIdle - totalBreakdown);

    // Hitung PA, MA, UA, EU
    const pa = totalMohh > 0 ? (ewh + totalDelay + totalIdle) / totalMohh : 0;
    const ma = ewh + totalBreakdown > 0 ? ewh / (ewh + totalBreakdown) : 0;
    const ua = ewh + totalDelay + totalIdle > 0 ? ewh / (ewh + totalDelay + totalIdle) : 0;
    const eu = ewh + totalDelay + totalIdle + totalBreakdown > 0 ? ewh / (ewh + totalDelay + totalIdle + totalBreakdown) : 0;

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
        ?.filter((detail) => detail.activities?.status === ActivityStatus.DELAY)
        .map((detail) => ({
          activities_id: detail.activities_id,
          name: detail.activities?.name || '',
          type_data: 'number',
          type_field: 'input',
          activities_hour: detail.activities_hour || 0,
        })) || [];

    const workingActivities =
      planWorkingHour.details
        ?.filter((detail) => detail.activities?.status === ActivityStatus.WORKING)
        .map((detail) => ({
          activities_id: detail.activities_id,
          name: detail.activities?.name || '',
          type_data: 'number',
          type_field: 'input',
          activities_hour: detail.activities_hour || 0,
        })) || [];

    const breakdownActivities =
      planWorkingHour.details
        ?.filter((detail) => detail.activities?.status === ActivityStatus.BREAKDOWN)
        .map((detail) => ({
          activities_id: detail.activities_id,
          name: detail.activities?.name || '',
          type_data: 'number',
          type_field: 'input',
          activities_hour: detail.activities_hour || 0,
        })) || [];

    const idleActivities =
      planWorkingHour.details
        ?.filter((detail) => detail.activities?.status === ActivityStatus.IDLE)
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

    // Create details array - urutan: Idle, Delay, Breakdown
    const details = [
      {
        name: 'Idle',
        group_detail: idleActivities,
      },
      {
        name: 'Delay',
        group_detail: delayActivities,
      },
      {
        name: 'Breakdown',
        group_detail: breakdownActivities,
      },
    ];

    return {
      id: planWorkingHour.id,
      plan_date: planWorkingHour.plan_date,
      total_working_hour_month: this.roundToTwoDecimals(planWorkingHour.working_hour_month || 0),
      total_working_hour_day: this.roundToTwoDecimals(planWorkingHour.working_hour_day || 0),
      total_working_day_longshift: this.roundToTwoDecimals(planWorkingHour.working_day_longshift || 0),
      total_working_hour_longshift: this.roundToTwoDecimals(planWorkingHour.working_hour_longshift || 0).toFixed(2),
      total_mohh_per_month: this.roundToTwoDecimals(planWorkingHour.mohh_per_month || 0),
      schedule_day: planWorkingHour.schedule_day,
      working_longshift: planWorkingHour.working_longshift || false, // ambil langsung dari kolom working_longshift yang bertipe boolean
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
    const activities = await this.dataSource.getRepository(Activities).find({
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

    // Filter hanya status yang diinginkan: idle, delay, breakdown
    const allowedStatuses = ['idle', 'delay', 'breakdown'];
    const filteredGroupedData = Object.entries(groupedData).filter(([status]) => allowedStatuses.includes(status.toLowerCase()));

    // Urutkan sesuai urutan yang diinginkan: idle, delay, breakdown
    const sortedGroupedData = filteredGroupedData.sort(([statusA], [statusB]) => {
      const order = { idle: 0, delay: 1, breakdown: 2 };
      return order[statusA.toLowerCase()] - order[statusB.toLowerCase()];
    });

    // Transform ke format yang diminta
    const result = sortedGroupedData.map(([status, activities]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
      group_detail: activities,
    }));

    return result;
  }

  // Method baru untuk update detail berdasarkan ID dari r_plan_working_hour
  async updateDetailByPlanWorkingHourId(id: number, updateDto: Partial<UpdateDetailParentPlanWorkingHourDto>): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Ambil plan working hour yang akan diupdate
      const planWorkingHour = await queryRunner.manager.findOne(PlanWorkingHour, {
        where: { id },
        relations: ['parentPlanWorkingHour', 'details'],
      });

      if (!planWorkingHour) {
        throw new BadRequestException(`Plan working hour dengan ID ${id} tidak ditemukan`);
      }

      const parentPlan = planWorkingHour.parentPlanWorkingHour;

      // 2. Update parent plan jika ada perubahan
      if (updateDto.plan_date) {
        parentPlan.plan_date = new Date(updateDto.plan_date);
        await queryRunner.manager.save(ParentPlanWorkingHour, parentPlan);
      }

      // 3. Update data di r_plan_working_hour
      if (updateDto.working_day_longshift !== undefined) {
        // Convert boolean to number if needed
        const workingDayLongshift =
          typeof updateDto.working_day_longshift === 'boolean'
            ? updateDto.working_day_longshift
              ? 1
              : 0
            : updateDto.working_day_longshift;
        planWorkingHour.working_day_longshift = workingDayLongshift;

        // Update working_longshift berdasarkan working_day_longshift
        if (typeof updateDto.working_day_longshift === 'boolean') {
          // Jika working_day_longshift adalah boolean
          planWorkingHour.working_longshift = updateDto.working_day_longshift;
          planWorkingHour.working_day_longshift = updateDto.working_day_longshift ? 1 : 0;
          planWorkingHour.working_hour_longshift = updateDto.working_day_longshift ? updateDto.working_hour_longshift || 0 : 0;
        } else {
          // Jika working_day_longshift adalah number
          const isLongshift = workingDayLongshift > 0;
          planWorkingHour.working_longshift = isLongshift;
          planWorkingHour.working_day_longshift = workingDayLongshift;
          planWorkingHour.working_hour_longshift = isLongshift ? updateDto.working_hour_longshift || 0 : 0;
        }
      } else if (updateDto.working_hour_longshift !== undefined) {
        // Jika hanya working_hour_longshift yang diupdate
        planWorkingHour.working_hour_longshift = updateDto.working_hour_longshift;
      }
      if (updateDto.working_hour_month !== undefined) {
        planWorkingHour.working_hour_month = updateDto.working_hour_month;
      }
      if (updateDto.working_hour_day !== undefined) {
        planWorkingHour.working_hour_day = updateDto.working_hour_day;
      }
      if (updateDto.mohh_per_month !== undefined) {
        planWorkingHour.mohh_per_month = updateDto.mohh_per_month;
      }
      if (updateDto.schedule_day !== undefined) {
        planWorkingHour.schedule_day = updateDto.schedule_day;

        // Set is_schedule_day dan is_holiday_day berdasarkan schedule_day
        if (updateDto.schedule_day === 1) {
          planWorkingHour.is_schedule_day = true;
          planWorkingHour.is_holiday_day = false;
        } else if (updateDto.schedule_day === 0.5) {
          planWorkingHour.is_schedule_day = false;
          planWorkingHour.is_holiday_day = false;
        } else if (updateDto.schedule_day === 0) {
          planWorkingHour.is_schedule_day = false;
          planWorkingHour.is_holiday_day = true;
        }
      }

      await queryRunner.manager.save(PlanWorkingHour, planWorkingHour);

      // 4. Update data di r_plan_working_hour_detail
      if (updateDto.detail && updateDto.detail.length > 0) {
        // Hapus detail lama
        await queryRunner.manager.delete(PlanWorkingHourDetail, {
          plant_working_hour_id: planWorkingHour.id,
        });

        // Insert detail baru
        const planWorkingHourDetails: PlanWorkingHourDetail[] = [];
        for (const activityDetail of updateDto.detail) {
          const detail = this.planWorkingHourDetailRepository.create({
            plant_working_hour_id: planWorkingHour.id,
            activities_id: activityDetail.activities_id,
            activities_hour: activityDetail.activities_hour,
          });

          planWorkingHourDetails.push(detail);
        }

        await queryRunner.manager.save(PlanWorkingHourDetail, planWorkingHourDetails);
      }

      // 5. Update total_working_hour_month di parent plan berdasarkan jumlah dari r_plan_working_hour
      // Dan langsung update total_working_hour_day dari payload tanpa akumulasi
      const updatedPlanWorkingHours = await queryRunner.manager.find(PlanWorkingHour, {
        where: { parent_plan_working_hour_id: parentPlan.id },
      });

      if (updatedPlanWorkingHours.length > 0) {
        // Hitung total working_hour_month dari semua record di r_plan_working_hour
        const totalWorkingHourMonth = updatedPlanWorkingHours.reduce((sum, pwh) => sum + (pwh.working_hour_month || 0), 0);

        // Hitung total mohh_per_month dari semua record di r_plan_working_hour
        const totalMohhPerMonth = updatedPlanWorkingHours.reduce((sum, pwh) => sum + (pwh.mohh_per_month || 0), 0);

        // Update parent plan dengan nilai yang dihitung untuk total_working_hour_month (dibulatkan ke 2 desimal)
        parentPlan.total_working_hour_month = Math.round(totalWorkingHourMonth * 100) / 100;

        // Update total_mohh_per_month di parent plan berdasarkan jumlah dari r_plan_working_hour (dibulatkan ke 2 desimal)
        parentPlan.total_mohh_per_month = Math.round(totalMohhPerMonth * 100) / 100;

        // Langsung update total_working_hour_day dari payload tanpa akumulasi dari r_plan_working_hour
        if (updateDto.working_hour_day !== undefined) {
          parentPlan.total_working_hour_day = updateDto.working_hour_day;
        }

        // Langsung update total_working_hour_longshift dan total_working_day_longshift dari payload
        if (updateDto.working_hour_longshift !== undefined) {
          parentPlan.total_working_hour_longshift = updateDto.working_hour_longshift;
        }
        if (updateDto.working_day_longshift !== undefined) {
          parentPlan.total_working_day_longshift =
            typeof updateDto.working_day_longshift === 'boolean'
              ? updateDto.working_day_longshift
                ? 1
                : 0
              : updateDto.working_day_longshift;
        }

        await queryRunner.manager.save(ParentPlanWorkingHour, parentPlan);
      }

      await queryRunner.commitTransaction();

      // 6. Return response dengan format yang sama seperti getDetailById
      return await this.getDetailById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error in updateDetailByPlanWorkingHourId:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async validateRowData(row: any): Promise<{
    isValid: boolean;
    error?: string;
    payload?: any;
  }> {
    const normalizeActivityName = (name: string) => name?.trim().replace(/_/g, ' ').toLowerCase();

    if (!row.year_month) {
      return { isValid: false, error: 'year_month is required' };
    }

    if (!moment(row.year_month, 'YYYY-MM', true).isValid()) {
      return {
        isValid: false,
        error: `year_month harus dalam format YYYY-MM ex:2025-01 (row: ${row.year_month})`,
      };
    }

    const validateNumber = (field: string, label: string, max?: number): { ok: boolean; error?: string } => {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        return { ok: false, error: `${label} is required` };
      }
      const val = Number(row[field]);
      if (isNaN(val)) {
        return {
          ok: false,
          error: `${label} harus berupa number (row: ${row[field]})`,
        };
      }
      if (val < 1) {
        return {
          ok: false,
          error: `${label} tidak boleh kurang dari 1 (row: ${row[field]})`,
        };
      }
      if (max !== undefined && val > max) {
        return {
          ok: false,
          error: `${label} tidak boleh lebih dari ${max} (row: ${row[field]})`,
        };
      }
      return { ok: true };
    };

    let res = validateNumber('total_working_hour_month', 'total_working_hour_month');
    if (!res.ok) return { isValid: false, error: res.error };

    res = validateNumber('total_working_hour_day', 'total_working_hour_day', 24);
    if (!res.ok) return { isValid: false, error: res.error };

    res = validateNumber('total_mohh_per_month', 'total_mohh_per_month', 744);
    if (!res.ok) return { isValid: false, error: res.error };

    const workingHour = ['year_month', 'total_working_hour_month', 'total_working_hour_day', 'total_mohh_per_month'];
    const activityNames = Object.keys(row).filter((key) => !workingHour.includes(key));

    const findActivities = await this.dataSource
      .getRepository(Activities)
      .createQueryBuilder('a')
      .where('LOWER(a.name) IN (:...names)', {
        names: activityNames.map((n) => normalizeActivityName(n)),
      })
      .andWhere('a.deletedAt IS NULL')
      .select(['a.id', 'a.name'])
      .getMany();

    const foundNames = findActivities?.map((a) => a?.name?.toLowerCase());
    const notFound = activityNames?.filter((n) => !foundNames?.includes(normalizeActivityName(n)));

    if (notFound?.length > 0) {
      return {
        isValid: false,
        error: `Activities tidak ditemukan: ${notFound.join(', ')}`,
      };
    }

    const activities = activityNames.map((name) => {
      const normalized = normalizeActivityName(name);
      const rawVal = row[name];
      const numVal = rawVal ? Number(rawVal) : 0;

      if (isNaN(numVal)) {
        throw new BadRequestException(`Activity "${name}" harus berupa number (row: ${row[name]})`);
      }

      if (numVal < 0) {
        throw new BadRequestException(`Activity "${name}" tidak boleh kurang dari 0 (row: ${row[name]})`);
      }

      return {
        activities_hour: numVal,
        id: findActivities.find((a) => a.name.toLowerCase() === normalized)?.id,
      };
    });

    const m = moment(row.year_month, 'YYYY-MM');
    const totalCalendarDay = m.daysInMonth();
    const startOfMonth = m.startOf('month').format('YYYY-MM-DD');
    const endOfMonth = m.endOf('month').format('YYYY-MM-DD');
    const existingPlan = await this.parentPlanWorkingHourRepository
      .createQueryBuilder('ppwh')
      .where('ppwh.plan_date BETWEEN :startOfMonth AND :endOfMonth', {
        startOfMonth,
        endOfMonth,
      })
      .andWhere('ppwh.deletedAt IS NULL')
      .getOne();

    if (existingPlan) {
      const monthNames = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
      ];
      const monthIdx = m.month();
      const yearNum = m.year();

      throw new BadRequestException(
        `Data untuk bulan ${monthNames[monthIdx]} ${yearNum} sudah ada dalam sistem. ` +
          `Silakan gunakan bulan lain atau update data yang sudah ada.`,
      );
    }

    const payload = {
      plan_date: `${row.year_month}-01`,
      total_working_hour_month: Number(row.total_working_hour_month),
      total_working_day_longshift: 0,
      total_working_hour_longshift: 0,
      total_working_hour_day: Number(row.total_working_hour_day),
      total_mohh_per_month: Number(row.total_mohh_per_month),
      total_calendar_day: totalCalendarDay,
      total_available_day: totalCalendarDay,
      total_holiday_day: 0,
      year: m.year(),
      month: m.month() + 1,
      startOfMonth,
      endOfMonth,
      activities,
    };

    return { isValid: true, payload };
  }

  private async processImportData(csvData: any[]): Promise<{
    results: any[];
    failedRows: any[];
    successCount: number;
    failedCount: number;
    payload: any[];
  }> {
    const results: any[] = [];
    const failedRows: any[] = [];
    let successCount = 0;
    let failedCount = 0;
    const payload: any[] = [];

    const validations = await Promise.all(
      csvData.map(async (row: any, idx: number) => {
        const rowNumber = idx + 1;
        try {
          const validationResult = await this.validateRowData(row);
          if (!validationResult.isValid) {
            failedCount++;
            failedRows.push({
              rowNumber,
              ...row,
              error: validationResult.error,
            });
            return {
              row: rowNumber,
              status: 'error',
              message: validationResult.error,
              data: row,
            };
          }

          successCount++;
          if (validationResult.payload) payload.push(validationResult.payload);
          return {
            row: rowNumber,
            status: 'success',
            message: 'Data valid',
            data: row,
          };
        } catch (err) {
          failedCount++;
          failedRows.push({ rowNumber, ...row, error: err.message });
          return {
            row: rowNumber,
            status: 'error',
            message: err.message || 'Validasi gagal',
            data: row,
          };
        }
      }),
    );

    results.push(...validations);

    return {
      results,
      failedRows,
      successCount,
      failedCount,
      payload,
    };
  }

  async bulkCreate(payloads: any[]): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // simpan semua parent sekaligus
      const parentPlans = payloads.map((p) => {
        const planDate = moment(p.plan_date, 'YYYY-MM-DD', true);
        if (!planDate.isValid()) {
          throw new BadRequestException(`plan_date tidak valid: ${p.plan_date} (harus format YYYY-MM-DD)`);
        }

        return this.parentPlanWorkingHourRepository.create({
          plan_date: planDate.toDate(),
          total_calendar_day: p.total_calendar_day,
          total_holiday_day: p.total_holiday_day,
          total_available_day: p.total_available_day,
          total_working_hour_month: p.total_working_hour_month,
          total_working_day_longshift: p.total_working_day_longshift,
          total_working_hour_day: p.total_working_hour_day,
          total_working_hour_longshift: p.total_working_hour_longshift,
          total_mohh_per_month: p.total_mohh_per_month,
        });
      });

      const savedParentPlans = await queryRunner.manager.save(ParentPlanWorkingHour, parentPlans);

      const allPlanWorkingHours: PlanWorkingHour[] = [];

      // generate r_plan_working_hour untuk tiap parent plan
      savedParentPlans.forEach((savedParentPlan, idx) => {
        const p = payloads[idx];
        const year = Number(p.year);
        const month = Number(p.month); // 1-based
        const daysInMonth = new Date(year, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = moment({ year, month: month - 1, day }).toDate();

          const planWorkingHour = this.planWorkingHourRepository.create({
            plan_date: currentDate,
            is_calender_day: true,
            is_holiday_day: false,
            is_schedule_day: true,
            schedule_day: 1,
            working_day_longshift: p.total_working_day_longshift,
            working_hour_longshift: 0,
            working_hour_month: p.total_working_hour_month / daysInMonth,
            working_hour_day: p.total_working_hour_day,
            mohh_per_month: p.total_mohh_per_month / daysInMonth,
            parent_plan_working_hour_id: savedParentPlan.id,
            working_longshift: p.total_working_day_longshift > 0,
          });

          // set ulang longshift hour/day
          if (p.total_working_day_longshift > 0) {
            planWorkingHour.working_hour_longshift = p.total_working_hour_longshift || 0;
          }

          allPlanWorkingHours.push(planWorkingHour);
        }
      });

      const savedPlanWorkingHours = await queryRunner.manager.save(PlanWorkingHour, allPlanWorkingHours);

      const planWorkingHourDetails: PlanWorkingHourDetail[] = [];

      savedParentPlans.forEach((savedParentPlan, idx) => {
        const p = payloads[idx];

        const relatedPlanWorkingHours = savedPlanWorkingHours.filter((pwh) => pwh.parent_plan_working_hour_id === savedParentPlan.id);

        for (const planWorkingHour of relatedPlanWorkingHours) {
          for (const activityDetail of p.activities) {
            planWorkingHourDetails.push(
              this.planWorkingHourDetailRepository.create({
                plant_working_hour_id: planWorkingHour.id,
                activities_id: activityDetail.id,
                activities_hour: activityDetail.activities_hour,
              }),
            );
          }
        }
      });

      await queryRunner.manager.save(PlanWorkingHourDetail, planWorkingHourDetails);

      for (const savedParentPlan of savedParentPlans) {
        const updatedPlanWorkingHours = savedPlanWorkingHours.filter((pwh) => pwh.parent_plan_working_hour_id === savedParentPlan.id);

        if (updatedPlanWorkingHours.length > 0) {
          const totalWorkingHourMonth = updatedPlanWorkingHours.reduce((sum, pwh) => sum + (pwh.working_hour_month || 0), 0);
          const totalMohhPerMonth = updatedPlanWorkingHours.reduce((sum, pwh) => sum + (pwh.mohh_per_month || 0), 0);

          savedParentPlan.total_working_hour_month = Math.round(totalWorkingHourMonth * 100) / 100;
          savedParentPlan.total_mohh_per_month = Math.round(totalMohhPerMonth * 100) / 100;

          await queryRunner.manager.save(ParentPlanWorkingHour, savedParentPlan);
        }
      }

      await queryRunner.commitTransaction();
      return savedParentPlans;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throwError('Failed to import Parent Plan Working Hour', 500);
    } finally {
      await queryRunner.release();
    }
  }

  private createErrorCsvContent(failedRows: any[]): string {
    if (failedRows.length === 0) return '';

    const dynamicKeys = new Set<string>();
    failedRows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== 'error' && key !== 'rowNumber') {
          dynamicKeys.add(key);
        }
      });
    });

    const workingHour = ['year_month', 'total_working_hour_month', 'total_working_hour_day', 'total_mohh_per_month'];
    const activityKeys = [...dynamicKeys].filter((k) => !workingHour.includes(k));

    const csvHeaders = [...workingHour, ...activityKeys, 'error_message  (Please delete this column before importing again)'];

    const csvRows = failedRows.map((row) =>
      csvHeaders
        .map((header) => {
          if (header === 'error_message') return `"${row.error || ''}"`;
          return `"${row[header] ?? ''}"`;
        })
        .join(','),
    );

    return [csvHeaders.join(','), ...csvRows].join('\n');
  }

  private async generateErrorCsv(failedRows: any[]): Promise<{
    error_file: { download_url: string; file_name: string } | null;
  }> {
    if (failedRows.length === 0) {
      return {
        error_file: null,
      };
    }

    try {
      const csvContent = this.createErrorCsvContent(failedRows);
      const csvBuffer = Buffer.from(csvContent, 'utf8');
      const filename = `import-barge-errors-${Date.now()}.csv`;

      const result = await this.s3Service.uploadErrorFile(filename, csvBuffer, 'parent_plan_working_hour_import_error');
      return {
        error_file: result
          ? {
              download_url: result.downloadUrl,
              file_name: filename,
            }
          : null,
      };
    } catch (error) {
      return {
        error_file: null,
      };
    }
  }

  private buildImportResponse(
    total: number,
    successCount: number,
    failedCount: number,
    errorFileInfo: {
      error_file: { download_url: string; file_name: string } | null;
    },
  ) {
    return successResponse(
      {
        total,
        success: successCount,
        failed: failedCount,
        error_file: errorFileInfo.error_file,
        hasErrorFile: failedCount > 0,
      },
      failedCount > 0
        ? `Import selesai dengan ${failedCount} error. ${
            errorFileInfo.error_file ? 'Download error CSV untuk detail.' : 'Gagal generate error file.'
          }`
        : 'Semua data valid',
    );
  }
  async importData(file: Express.Multer.File) {
    try {
      validateImportFile(file);
      const csvData = await CsvHelper.parseCsvFile(file.buffer);
      const validationResult = await this.processImportData(csvData);
      if (validationResult?.payload?.length > 0 && validationResult.successCount > 0) {
        await this.bulkCreate(validationResult.payload);
      }

      const errorFileInfo = await this.generateErrorCsv(validationResult.failedRows);

      return this.buildImportResponse(csvData.length, validationResult.successCount, validationResult.failedCount, errorFileInfo);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throwError(error, 400);
      }

      if (error.message?.includes('CSV') || error.message?.includes('parse')) {
        throwError('Format CSV tidak valid. Pastikan file CSV memiliki format yang benar.', 400);
      }

      if (error.code === '23503') {
        throwError('Data referensi tidak ditemukan. Pastikan semua ID referensi valid.', 400);
      }

      console.error('Unexpected error in importData:', error.stack);
     throwError(
        'Terjadi kesalahan saat memproses file import. Silakan coba lagi atau hubungi administrator.',
        400,
      );
    }
  }

  private findAllQueryBuilder(): SelectQueryBuilder<any> {
    return this.dataSource
      .createQueryBuilder()
      .select([
        'ppwh.id as parent_id',
        'ppwh.plan_date as plan_date',
        'ppwh.createdAt as createdAt',
        'ppwh.updatedAt as updatedAt',
        'COUNT(DISTINCT CASE WHEN pwh.is_schedule_day = true THEN pwh.plan_date END) as schedule_day',
        'COUNT(DISTINCT CASE WHEN pwh.is_holiday_day = true THEN pwh.plan_date END) as holiday_day',
        'ppwh.total_working_hour_month as working_hour_month',
        'ppwh.total_working_hour_day as working_hour_day',
        'ppwh.total_working_hour_longshift as working_hour_longshift',
        'ppwh.total_working_day_longshift as working_day_longshift',
        'ppwh.total_mohh_per_month as total_mohh',
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
  }

  private applyFilterExportData(
    qb: SelectQueryBuilder<any>,
    query: ExportParentPlanWorkingHourQueryDto,
  ): SelectQueryBuilder<any> {
    const { month, sortOrder } = query;
    const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    if (month) {
      qb.andWhere('EXTRACT(MONTH FROM ppwh.plan_date) = :month', {
        month: month,
      });
    } else {
      qb.orderBy('ppwh.id', validSortOrder).limit(10);
    }
    qb.groupBy('ppwh.id');
    return qb;
  }

  private mapExportDataToCsvRow(item: any, index: number) {
    const roundToTwoDecimals = (value: number): number => {
      return Math.round(value * 100) / 100;
    };
    const totalDelay = roundToTwoDecimals(parseFloat(item.total_delay) || 0);
    const totalIdle = roundToTwoDecimals(parseFloat(item.total_idle) || 0);
    const totalBreakdown = roundToTwoDecimals(
      parseFloat(item.total_breakdown) || 0,
    );
    const totalMohh = roundToTwoDecimals(parseFloat(item.total_mohh) || 0);
    const ewh = roundToTwoDecimals(
      totalMohh - totalDelay - totalIdle - totalBreakdown,
    );
    const pa =
      totalMohh > 0
        ? roundToTwoDecimals((ewh + totalDelay + totalIdle) / totalMohh)
        : 0;
    const ma =
      ewh + totalBreakdown > 0
        ? roundToTwoDecimals(ewh / (ewh + totalBreakdown))
        : 0;

    const ua =
      ewh + totalDelay + totalIdle > 0
        ? roundToTwoDecimals(ewh / (ewh + totalDelay + totalIdle))
        : 0;

    const eu =
      ewh + totalDelay + totalIdle + totalBreakdown > 0
        ? roundToTwoDecimals(
            ewh / (ewh + totalDelay + totalIdle + totalBreakdown),
          )
        : 0;
    return {
      No: index + 1,
      Month: moment(item.plan_date).format('MMMM/YYYY'),
      'Calendar Day': Number(item.schedule_day) + Number(item.holiday_day) || 0,
      'Schedule Day': item?.schedule_day || 0,
      'Holiday Day': item?.holiday_day || 0,
      'EWH Hour/Month': roundToTwoDecimals(
        parseFloat(item.working_hour_month) || 0,
      ),
      'EWH Hour/Day': roundToTwoDecimals(
        parseFloat(item.working_hour_day) || 0,
      ),
      'Working Longshift (Day)': roundToTwoDecimals(
        parseFloat(item.working_day_longshift) || 0,
      ),
      'Working Hours Longshift': roundToTwoDecimals(
        parseFloat(item.working_hour_longshift) || 0,
      ),
      'Total MOHH': totalMohh,
      'Total Delay': totalDelay,
      'Total Idle': totalIdle,
      'Total Repair': totalBreakdown,
      EWH: Math.max(0, ewh),
      PA: Math.max(0, pa),
      MA: Math.max(0, ma),
      UA: Math.max(0, ua),
      EU: Math.max(0, eu),
    };
  }

  async exportData(query: ExportParentPlanWorkingHourQueryDto, res: Response) {
    try {
      const qb = this.findAllQueryBuilder();

      this.applyFilterExportData(qb, query);

      const data = await qb.getRawMany();

      if (!data.length) {
        res.status(200).json(successResponse([], 'Data Not Found'));
        return;
      }
      // // Set headers CSV
      setCsvExportHeaders(
        res,
        `parent_plan_working_hour_export_${Date.now()}.csv`,
      );
      // // Buat stream writer
      const csvStream = format({ headers: true });
      csvStream.pipe(res);
      data.forEach((item, i) => {
        csvStream.write(this.mapExportDataToCsvRow(item, i));
      });
      csvStream.end();
    } catch (error) {
      throw new InternalServerErrorException('Gagal export data');
    }
  }

  private findAllQueryBuilder(): SelectQueryBuilder<any> {
    return this.dataSource
      .createQueryBuilder()
      .select([
        'ppwh.id as parent_id',
        'ppwh.plan_date as plan_date',
        'ppwh.createdAt as createdAt',
        'ppwh.updatedAt as updatedAt',
        'COUNT(DISTINCT CASE WHEN pwh.is_schedule_day = true THEN pwh.plan_date END) as schedule_day',
        'COUNT(DISTINCT CASE WHEN pwh.is_holiday_day = true THEN pwh.plan_date END) as holiday_day',
        'ppwh.total_working_hour_month as working_hour_month',
        'ppwh.total_working_hour_day as working_hour_day',
        'ppwh.total_working_hour_longshift as working_hour_longshift',
        'ppwh.total_working_day_longshift as working_day_longshift',
        'ppwh.total_mohh_per_month as total_mohh',
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
  }

  private applyFilterExportData(
    qb: SelectQueryBuilder<any>,
    query: ExportParentPlanWorkingHourQueryDto,
  ): SelectQueryBuilder<any> {
    const { month, sortOrder } = query;
    const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    if (month) {
      qb.andWhere('EXTRACT(MONTH FROM ppwh.plan_date) = :month', {
        month: month,
      });
    } else {
      qb.orderBy('ppwh.id', validSortOrder).limit(10);
    }
    qb.groupBy('ppwh.id');
    return qb;
  }

  private mapExportDataToCsvRow(item: any, index: number) {
    const roundToTwoDecimals = (value: number): number => {
      return Math.round(value * 100) / 100;
    };
    const totalDelay = roundToTwoDecimals(parseFloat(item.total_delay) || 0);
    const totalIdle = roundToTwoDecimals(parseFloat(item.total_idle) || 0);
    const totalBreakdown = roundToTwoDecimals(
      parseFloat(item.total_breakdown) || 0,
    );
    const totalMohh = roundToTwoDecimals(parseFloat(item.total_mohh) || 0);
    const ewh = roundToTwoDecimals(
      totalMohh - totalDelay - totalIdle - totalBreakdown,
    );
    const pa =
      totalMohh > 0
        ? roundToTwoDecimals((ewh + totalDelay + totalIdle) / totalMohh)
        : 0;
    const ma =
      ewh + totalBreakdown > 0
        ? roundToTwoDecimals(ewh / (ewh + totalBreakdown))
        : 0;

    const ua =
      ewh + totalDelay + totalIdle > 0
        ? roundToTwoDecimals(ewh / (ewh + totalDelay + totalIdle))
        : 0;

    const eu =
      ewh + totalDelay + totalIdle + totalBreakdown > 0
        ? roundToTwoDecimals(
            ewh / (ewh + totalDelay + totalIdle + totalBreakdown),
          )
        : 0;
    return {
      No: index + 1,
      Month: moment(item.plan_date).format('MMMM/YYYY'),
      'Calendar Day': Number(item.schedule_day) + Number(item.holiday_day) || 0,
      'Schedule Day': item?.schedule_day || 0,
      'Holiday Day': item?.holiday_day || 0,
      'EWH Hour/Month': roundToTwoDecimals(
        parseFloat(item.working_hour_month) || 0,
      ),
      'EWH Hour/Day': roundToTwoDecimals(
        parseFloat(item.working_hour_day) || 0,
      ),
      'Working Longshift (Day)': roundToTwoDecimals(
        parseFloat(item.working_day_longshift) || 0,
      ),
      'Working Hours Longshift': roundToTwoDecimals(
        parseFloat(item.working_hour_longshift) || 0,
      ),
      'Total MOHH': totalMohh,
      'Total Delay': totalDelay,
      'Total Idle': totalIdle,
      'Total Repair': totalBreakdown,
      EWH: Math.max(0, ewh),
      PA: Math.max(0, pa),
      MA: Math.max(0, ma),
      UA: Math.max(0, ua),
      EU: Math.max(0, eu),
    };
  }

  async exportData(query: ExportParentPlanWorkingHourQueryDto, res: Response) {
    try {
      const qb = this.findAllQueryBuilder();

      this.applyFilterExportData(qb, query);

      const data = await qb.getRawMany();

      if (!data.length) {
        res.status(200).json(successResponse([], 'Data Not Found'));
        return;
      }
      // // Set headers CSV
      setCsvExportHeaders(
        res,
        `parent_plan_working_hour_export_${Date.now()}.csv`,
      );
      // // Buat stream writer
      const csvStream = format({ headers: true });
      csvStream.pipe(res);
      data.forEach((item, i) => {
        csvStream.write(this.mapExportDataToCsvRow(item, i));
      });
      csvStream.end();
    } catch (error) {
      throw new InternalServerErrorException('Gagal export data');
    }
  }
}
