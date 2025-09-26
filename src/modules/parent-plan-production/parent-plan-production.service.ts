import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Not, DataSource } from 'typeorm';
import { ParentPlanProduction } from './entities/parent-plan-production.entity';
import { PlanProduction } from '../plan-production/entities/plan-production.entity';
import { CreateParentPlanProductionDto } from './dto/create-parent-plan-production.dto';
import {
  ExportParentPlanProductionQueryDto,
  GetParentPlanProductionQueryDto,
  UpdateParentPlanProductionDto,
} from './dto/parent-plan-production.dto';
import {
  paginateResponse,
  setCsvExportHeaders,
} from '../../common/helpers/public.helper';
import { ApiResponse, successResponse } from 'src/common';
import {
  ImportParentPlanProductionRow,
  ImportParentPlanProductionItemDto,
} from './dto/import-parent-plan-production.dto';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { S3Service } from '../../integrations/s3/s3.service';
import { format } from '@fast-csv/format';
import { Response } from 'express';
import moment from 'moment';

@Injectable()
export class ParentPlanProductionService {
  private readonly logger = new Logger(ParentPlanProductionService.name);
  constructor(
    @InjectRepository(ParentPlanProduction)
    private parentPlanProductionRepository: Repository<ParentPlanProduction>,
    @InjectRepository(PlanProduction)
    private planProductionRepository: Repository<PlanProduction>,
    private s3Service: S3Service,
    private dataSource: DataSource,
  ) {}

  /**
   * Membuat parent plan production dan generate data plan production harian
   */
  async create(createDto: CreateParentPlanProductionDto) {
    try {
      const planDate = new Date(createDto.plan_date);

      // Validasi apakah plan_date sudah ada
      const existingParent = await this.parentPlanProductionRepository.findOne({
        where: { plan_date: planDate },
      });

      if (existingParent) {
        throw new ConflictException('Plan date sudah ada dalam sistem');
      }

      // Validasi data untuk mencegah division by zero
      if (createDto.total_ore_target <= 0) {
        throw new BadRequestException('total_ore_target harus lebih dari 0');
      }

      if (createDto.total_ob_target < 0) {
        throw new BadRequestException(
          'total_ob_target tidak boleh kurang dari 0',
        );
      }

      if (createDto.total_quarry_target < 0) {
        throw new BadRequestException(
          'total_quarry_target tidak boleh kurang dari 0',
        );
      }
      // Hitung jumlah hari dalam bulan
      const totalCalendarDays = this.getDaysInMonth(planDate);
      const totalHolidayDays = 0; // Tidak ada hari libur, semua hari tersedia
      const totalAvailableDays = totalCalendarDays; // Semua hari tersedia

      // Buat parent plan production
      const parentPlanProduction = this.parentPlanProductionRepository.create({
        plan_date: planDate,
        total_calender_day: totalCalendarDays,
        total_holiday_day: totalHolidayDays,
        total_available_day: totalAvailableDays,
        total_average_day_ewh: createDto.total_average_day_ewh,
        total_average_month_ewh: createDto.total_average_month_ewh,
        total_ob_target: createDto.total_ob_target,
        total_ore_target: createDto.total_ore_target,
        total_quarry_target: createDto.total_quarry_target,
        total_sr_target: createDto.total_sr_target || 2.0, // Default value jika tidak diisi
        total_ore_shipment_target: createDto.total_ore_shipment_target,
        total_remaining_stock: createDto.total_remaining_stock || 0, // Default value jika tidak diisi
        total_sisa_stock: createDto.total_sisa_stock,
        total_fleet: createDto.total_fleet,
      });

      const savedParent =
        await this.parentPlanProductionRepository.save(parentPlanProduction);

      // Generate data plan production harian
      await this.generateDailyPlanProductions(savedParent, createDto);

      return savedParent;
    } catch (error) {
      console.error('Error creating parent plan production:', error);
      throw error;
    }
  }

  /**
   * Generate data plan production harian berdasarkan parent
   */
  private async generateDailyPlanProductions(
    parentPlanProduction: ParentPlanProduction,
    createDto: CreateParentPlanProductionDto,
  ) {
    try {
      const planDate = parentPlanProduction.plan_date;
      const totalDays = parentPlanProduction.total_calender_day;

      // Hitung nilai per hari
      const averageDayEwh = createDto.total_average_day_ewh;
      const averageMonthEwh = createDto.total_average_month_ewh / totalDays;
      const obTarget = createDto.total_ob_target / totalDays;
      const oreTarget = createDto.total_ore_target / totalDays;
      const quarry = createDto.total_quarry_target; // Diambil langsung dari body request, tidak dibagi jumlah hari
      const oreShipmentTarget = createDto.total_ore_shipment_target / totalDays;

      // Ambil old stock global
      const oldStockGlobal = await this.getOldStockGlobal(planDate);

      const planProductions: Partial<PlanProduction>[] = [];

      // Generate data untuk setiap hari dalam bulan (dari tanggal 1 sampai akhir bulan)
      for (let day = 1; day <= totalDays; day++) {
        // Buat tanggal untuk hari tertentu dalam bulan
        const currentDate = new Date(
          planDate.getFullYear(),
          planDate.getMonth(),
          day,
        );

        // Hitung nilai-nilai berdasarkan logika yang diminta
        const dailyOldStock = oldStockGlobal;
        const shiftObTarget = obTarget / 2;
        const shiftOreTarget = oreTarget / 2;
        const shiftQuarry = quarry / 2;

        // Validasi untuk mencegah division by zero
        const shiftSrTarget =
          shiftOreTarget > 0 ? shiftObTarget / shiftOreTarget : 0;
        const remainingStock = oldStockGlobal - oreShipmentTarget + oreTarget;

        const planProduction: Partial<PlanProduction> = {
          plan_date: currentDate,
          is_calender_day: true, // Selalu true karena ada tanggal
          is_holiday_day: false, // Tidak ada hari libur, semua hari tersedia
          is_available_day: true, // Semua hari tersedia
          average_day_ewh: averageDayEwh,
          average_shift_ewh: averageMonthEwh,
          ob_target: obTarget,
          ore_target: oreTarget,
          quarry: quarry,
          sr_target: oreTarget > 0 ? obTarget / oreTarget : 0, // Sesuai rumus yang diminta
          ore_shipment_target: oreShipmentTarget,
          total_fleet: createDto.total_fleet,
          daily_old_stock: dailyOldStock,
          shift_ob_target: shiftObTarget,
          shift_ore_target: shiftOreTarget,
          shift_quarry: shiftQuarry,
          shift_sr_target: shiftSrTarget,
          remaining_stock: remainingStock,
          average_moth_ewh: averageMonthEwh,
          parent_plan_production_id: parentPlanProduction.id,
        };

        planProductions.push(planProduction);
      }

      // Simpan semua plan production
      const savedPlanProductions =
        await this.planProductionRepository.save(planProductions);

      return savedPlanProductions;
    } catch (error) {
      console.error('Error generating daily plan productions:', error);
      throw error;
    }
  }

  /**
   * Mendapatkan old stock global
   */
  private async getOldStockGlobal(planDate: Date): Promise<number> {
    // Cari data sebelumnya di r_plan_production
    const previousPlan = await this.planProductionRepository.findOne({
      where: {
        plan_date: new Date(planDate.getFullYear(), planDate.getMonth() - 1, 1),
      },
      order: { plan_date: 'DESC' },
    });

    if (previousPlan) {
      return previousPlan.daily_old_stock;
    }

    // Jika tidak ada, ambil dari parent plan production
    const previousParent = await this.parentPlanProductionRepository.findOne({
      where: {
        plan_date: new Date(planDate.getFullYear(), planDate.getMonth() - 1, 1),
      },
      order: { plan_date: 'DESC' },
    });

    if (previousParent) {
      return previousParent.total_sisa_stock;
    }

    // Default value jika tidak ada data sebelumnya
    return 0;
  }

  /**
   * Mendapatkan jumlah hari dalam bulan
   */
  private getDaysInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    console.log(`Month: ${month + 1}, Year: ${year}, Days: ${daysInMonth}`);

    return daysInMonth;
  }

  /**
   * Mendapatkan jumlah hari minggu dalam bulan
   */
  private getSundaysInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = this.getDaysInMonth(date);
    let sundayCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      if (currentDate.getDay() === 0) {
        // 0 = Sunday
        sundayCount++;
      }
    }

    console.log(`Sundays in month ${month + 1}/${year}: ${sundayCount}`);

    return sundayCount;
  }

  /**
   * Mendapatkan semua parent plan production dengan pagination dan filter
   */
  async findAll(query?: GetParentPlanProductionQueryDto) {
    try {
      const page = parseInt(query?.page?.toString() ?? '1', 10);
      const limit = parseInt(query?.limit?.toString() ?? '10', 10);
      const skip = (page - 1) * limit;
      const sortBy = query?.sort ?? 'plan_date';
      const sortOrder = query?.sortOrder ?? 'DESC';
      const dateFrom = query?.date_from;
      const dateTo = query?.date_to;
      const month = query?.month ? parseInt(query.month, 10) : null;

      // Validate limit
      if (limit > 100) {
        throw new BadRequestException('Limit tidak boleh lebih dari 100');
      }

      // Validate month
      if (month !== null && month !== undefined && (month < 1 || month > 12)) {
        throw new BadRequestException('Bulan harus antara 1-12');
      }
      const qb = this.findAllQueryBuilder();
      // Filter by month (1-12) - akan filter data sesuai bulan tersebut walaupun tahunnya beda
      if (month) {
        qb.andWhere('EXTRACT(MONTH FROM parent.plan_date) = :month', { month });
      }

      // Filter by date range
      if (dateFrom && dateTo) {
        qb.andWhere(
          'parent.plan_date >= :dateFrom AND parent.plan_date <= :dateTo',
          {
            dateFrom: new Date(dateFrom),
            dateTo: new Date(dateTo),
          },
        );
      } else if (dateFrom) {
        qb.andWhere('parent.plan_date >= :dateFrom', {
          dateFrom: new Date(dateFrom),
        });
      } else if (dateTo) {
        qb.andWhere('parent.plan_date <= :dateTo', {
          dateTo: new Date(dateTo),
        });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'plan_date',
        'total_calender_day',
        'total_holiday_day',
        'total_available_day',
        'total_average_month_ewh',
        'total_average_day_ewh',
        'total_ob_target',
        'total_ore_target',
        'total_quarry_target',
        'total_sr_target',
        'total_ore_shipment_target',
        'total_remaining_stock',
        'total_sisa_stock',
        'total_fleet',
        'created_at',
        'updated_at',
      ];
      const validSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : 'plan_date';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`parent.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      const [result, total] = await qb.getManyAndCount();

      // Transform result to new response format
      const transformedResult = result.map((parent) => {
        const planDate = new Date(parent.plan_date);
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const planMonth = planDate.getMonth();
        const planYear = planDate.getFullYear();

        // Hitung jumlah hari tersedia dan libur dari planProductions
        const availableDay =
          parent.planProductions?.filter((p) => p.is_available_day).length || 0;
        const holidayDay =
          parent.planProductions?.filter((p) => p.is_holiday_day).length || 0;

        // Logic untuk is_available_to_edit dan is_available_to_delete
        let isAvailableToEdit =
          process.env.DEFAULT_AVAIL_TO_EDIT_PRODUCTION_PLAN === 'true';
        let isAvailableToDelete = false;

        if (
          parent.plan_date &&
          parent.plan_date.toString() !== '0' &&
          parent.plan_date.toString() !== ''
        ) {
          if (
            planYear > currentYear ||
            (planYear === currentYear && planMonth > currentMonth)
          ) {
            isAvailableToEdit = true;
            isAvailableToDelete = true;
          } else if (planYear === currentYear && planMonth === currentMonth) {
            // Jika bulan sama, cek apakah tanggal lebih dari hari ini
            const planDay = planDate.getDate();
            const currentDay = currentDate.getDate();
            if (planDay > currentDay) {
              isAvailableToEdit = true;
              isAvailableToDelete = true;
            }
          }
        }

        return {
          id: parent.id,
          month_year: `${planYear.toString().padStart(4, '0')}-${(planMonth + 1).toString().padStart(2, '0')}`,
          available_day: availableDay,
          holiday_day: holidayDay,
          calendar_day: availableDay + holidayDay,
          average_month_ewh: parent.total_average_month_ewh,
          average_day_ewh: parent.total_average_day_ewh,
          ob_target: parent.total_ob_target,
          ore_target: parent.total_ore_target,
          quarry_target: parent.total_quarry_target,
          sr_target: parent.total_ob_target / parent.total_ore_target,
          ore_shipment_target: parent.total_ore_shipment_target,
          sisa_stock: parent.total_sisa_stock,
          is_available_to_edit: isAvailableToEdit,
          is_available_to_delete: isAvailableToDelete,
        };
      });

      return paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data parent plan production berhasil diambil',
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        'Gagal mengambil data parent plan production',
      );
    }
  }

  /**
   * Mendapatkan parent plan production by ID
   */
  async findOne(id: number) {
    const parentPlanProduction =
      await this.parentPlanProductionRepository.findOne({
        where: { id },
        relations: ['planProductions'],
      });

    if (!parentPlanProduction) {
      throw new BadRequestException('Parent plan production tidak ditemukan');
    }

    return parentPlanProduction;
  }

  /**
   * Mendapatkan parent plan production by date
   */
  async findByDate(planDate: string) {
    const date = new Date(planDate);
    const parentPlanProduction =
      await this.parentPlanProductionRepository.findOne({
        where: { plan_date: date },
        relations: ['planProductions'],
      });

    if (!parentPlanProduction) {
      throw new BadRequestException(
        'Parent plan production tidak ditemukan untuk tanggal tersebut',
      );
    }

    return parentPlanProduction;
  }

  /**
   * Update parent plan production dan update data plan production harian
   */
  async update(id: number, updateDto: UpdateParentPlanProductionDto) {
    // Cari parent plan production yang akan diupdate
    const existingParent = await this.parentPlanProductionRepository.findOne({
      where: { id },
      relations: ['planProductions'],
    });

    if (!existingParent) {
      throw new BadRequestException('Parent plan production tidak ditemukan');
    }

    // Jika plan_date diupdate, validasi apakah tanggal baru sudah ada
    if (updateDto.plan_date) {
      const newPlanDate = new Date(updateDto.plan_date);
      const existingWithNewDate =
        await this.parentPlanProductionRepository.findOne({
          where: { plan_date: newPlanDate, id: Not(id) },
        });

      if (existingWithNewDate) {
        throw new ConflictException('Plan date baru sudah ada dalam sistem');
      }
    }

    // Update parent plan production
    const planDate = updateDto.plan_date
      ? new Date(updateDto.plan_date)
      : existingParent.plan_date;

    // Hitung ulang jumlah hari dalam bulan jika plan_date berubah
    let totalCalendarDays = existingParent.total_calender_day;
    let totalHolidayDays = existingParent.total_holiday_day;
    let totalAvailableDays = existingParent.total_available_day;

    if (updateDto.plan_date) {
      totalCalendarDays = this.getDaysInMonth(planDate);
      totalHolidayDays = 0; // Tidak ada hari libur, semua hari tersedia
      totalAvailableDays = totalCalendarDays; // Semua hari tersedia
    }

    // Update fields
    const updatedParent = {
      ...existingParent,
      plan_date: planDate,
      total_calender_day: totalCalendarDays,
      total_holiday_day: totalHolidayDays,
      total_available_day: totalAvailableDays,
      total_average_day_ewh:
        updateDto.total_average_day_ewh ?? existingParent.total_average_day_ewh,
      total_average_month_ewh:
        updateDto.total_average_month_ewh ??
        existingParent.total_average_month_ewh,
      total_ob_target:
        updateDto.total_ob_target ?? existingParent.total_ob_target,
      total_ore_target:
        updateDto.total_ore_target ?? existingParent.total_ore_target,
      total_quarry_target:
        updateDto.total_quarry_target ?? existingParent.total_quarry_target,
      total_sr_target:
        updateDto.total_sr_target ?? existingParent.total_sr_target,
      total_ore_shipment_target:
        updateDto.total_ore_shipment_target ??
        existingParent.total_ore_shipment_target,
      total_remaining_stock:
        updateDto.total_remaining_stock ?? existingParent.total_remaining_stock,
      total_sisa_stock:
        updateDto.total_sisa_stock ?? existingParent.total_sisa_stock,
      total_fleet: updateDto.total_fleet ?? existingParent.total_fleet,
    };

    const savedParent =
      await this.parentPlanProductionRepository.save(updatedParent);

    // Update data plan production harian yang sudah ada (bukan delete dan insert ulang)
    if (
      existingParent.planProductions &&
      existingParent.planProductions.length > 0
    ) {
      await this.updateDailyPlanProductions(
        existingParent.planProductions,
        savedParent,
        updateDto,
      );
      console.log(
        `Updated ${existingParent.planProductions.length} existing daily plan productions`,
      );
    } else {
      // Jika tidak ada data harian, generate baru
      const createDto = {
        plan_date: savedParent.plan_date.toISOString(),
        total_average_day_ewh: savedParent.total_average_day_ewh,
        total_average_month_ewh: savedParent.total_average_month_ewh,
        total_ob_target: savedParent.total_ob_target,
        total_ore_target: savedParent.total_ore_target,
        total_quarry_target: savedParent.total_quarry_target,
        total_sr_target: savedParent.total_sr_target,
        total_ore_shipment_target: savedParent.total_ore_shipment_target,
        total_remaining_stock: savedParent.total_remaining_stock,
        total_sisa_stock: savedParent.total_sisa_stock,
        total_fleet: savedParent.total_fleet,
      };

      const generatedDailyData = await this.generateDailyPlanProductions(
        savedParent,
        createDto,
      );
      console.log(
        `Generated ${generatedDailyData.length} new daily plan productions`,
      );
    }

    // Log hasil update
    console.log(`Parent Plan Production updated with ID: ${savedParent.id}`);

    return savedParent;
  }

  /**
   * Update data plan production harian yang sudah ada
   */
  private async updateDailyPlanProductions(
    existingPlanProductions: PlanProduction[],
    parentPlanProduction: ParentPlanProduction,
    updateDto: UpdateParentPlanProductionDto,
  ) {
    const planDate = parentPlanProduction.plan_date;
    const totalDays = parentPlanProduction.total_calender_day;

    // Hitung nilai per hari
    const averageDayEwh =
      updateDto.total_average_day_ewh ??
      parentPlanProduction.total_average_day_ewh;
    const averageMonthEwh =
      (updateDto.total_average_month_ewh ??
        parentPlanProduction.total_average_month_ewh) / totalDays;
    const obTarget =
      (updateDto.total_ob_target ?? parentPlanProduction.total_ob_target) /
      totalDays;
    const oreTarget =
      (updateDto.total_ore_target ?? parentPlanProduction.total_ore_target) /
      totalDays;
    const quarry =
      updateDto.total_quarry_target ?? parentPlanProduction.total_quarry_target; // Diambil langsung dari body request, tidak dibagi jumlah hari
    const oreShipmentTarget =
      (updateDto.total_ore_shipment_target ??
        parentPlanProduction.total_ore_shipment_target) / totalDays;

    // Ambil old stock global
    const oldStockGlobal = await this.getOldStockGlobal(planDate);

    // Update setiap data harian yang sudah ada
    for (let i = 0; i < existingPlanProductions.length; i++) {
      const existingPlan = existingPlanProductions[i];
      const day = i + 1;

      // Buat tanggal untuk hari tertentu dalam bulan
      const currentDate = new Date(
        planDate.getFullYear(),
        planDate.getMonth(),
        day,
      );

      // Hitung nilai-nilai berdasarkan logika yang diminta
      const dailyOldStock = oldStockGlobal;
      const shiftObTarget = obTarget / 2;
      const shiftOreTarget = oreTarget / 2;
      const shiftQuarry = quarry / 2;

      // Validasi untuk mencegah division by zero
      const shiftSrTarget =
        shiftOreTarget > 0 ? shiftObTarget / shiftOreTarget : 0;
      const remainingStock = oldStockGlobal - oreShipmentTarget + oreTarget;

      // Update fields pada data yang sudah ada
      existingPlan.plan_date = currentDate;
      existingPlan.is_calender_day = true; // Selalu true karena ada tanggal
      existingPlan.is_holiday_day = false; // Tidak ada hari libur, semua hari tersedia
      existingPlan.is_available_day = true; // Semua hari tersedia
      existingPlan.average_day_ewh = averageDayEwh;
      existingPlan.average_shift_ewh = averageMonthEwh;
      existingPlan.ob_target = obTarget;
      existingPlan.ore_target = oreTarget;
      existingPlan.quarry = quarry;
      existingPlan.sr_target = oreTarget > 0 ? obTarget / oreTarget : 0; // Sesuai rumus yang diminta
      existingPlan.ore_shipment_target = oreShipmentTarget;
      existingPlan.total_fleet =
        updateDto.total_fleet ?? parentPlanProduction.total_fleet;
      existingPlan.daily_old_stock = dailyOldStock;
      existingPlan.shift_ob_target = shiftObTarget;
      existingPlan.shift_ore_target = shiftOreTarget;
      existingPlan.shift_quarry = shiftQuarry;
      existingPlan.shift_sr_target = shiftSrTarget;
      existingPlan.remaining_stock = remainingStock;
      existingPlan.average_moth_ewh = averageMonthEwh;
      existingPlan.parent_plan_production_id = parentPlanProduction.id;
    }

    // Simpan semua data yang sudah diupdate
    await this.planProductionRepository.save(existingPlanProductions);
  }

  /**
   * Delete parent plan production dan data plan production harian
   */
  async delete(id: number) {
    // Cari parent plan production yang akan dihapus
    const existingParent = await this.parentPlanProductionRepository.findOne({
      where: { id },
      relations: ['planProductions'],
    });

    if (!existingParent) {
      throw new BadRequestException('Parent plan production tidak ditemukan');
    }

    // Validasi apakah data bisa dihapus (berdasarkan tanggal)
    const planDate = new Date(existingParent.plan_date);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const planMonth = planDate.getMonth();
    const planYear = planDate.getFullYear();

    let isAvailableToDelete = false;

    if (planDate && planDate.toString() !== '0' && planDate.toString() !== '') {
      if (
        planYear > currentYear ||
        (planYear === currentYear && planMonth > currentMonth)
      ) {
        isAvailableToDelete = true;
      } else if (planYear === currentYear && planMonth === currentMonth) {
        // Jika bulan sama, cek apakah tanggal lebih dari hari ini
        const planDay = planDate.getDate();
        const currentDay = currentDate.getDate();
        if (planDay > currentDay) {
          isAvailableToDelete = true;
        }
      }
    }

    if (!isAvailableToDelete) {
      throw new BadRequestException(
        'Data tidak dapat dihapus karena tanggal sudah lewat atau hari ini',
      );
    }

    // Hapus semua plan production harian terlebih dahulu
    if (
      existingParent.planProductions &&
      existingParent.planProductions.length > 0
    ) {
      await this.planProductionRepository.remove(
        existingParent.planProductions,
      );
      console.log(
        `Deleted ${existingParent.planProductions.length} daily plan productions`,
      );
    }

    // Hapus parent plan production
    await this.parentPlanProductionRepository.remove(existingParent);
    console.log(`Deleted parent plan production with ID: ${id}`);

    return {
      message: 'Parent plan production dan data harian berhasil dihapus',
      deletedId: id,
      deletedPlanDate: existingParent.plan_date,
      deletedDailyRecords: existingParent.planProductions?.length || 0,
    };
  }

  /**
   * Mendapatkan remaining stock dari bulan sebelumnya
   */
  async getRemainingStockFromPreviousMonth(planDate: string) {
    // Validasi input date
    const inputDate = new Date(planDate);
    if (isNaN(inputDate.getTime())) {
      throw new BadRequestException(
        'Format tanggal tidak valid. Gunakan format YYYY-MM-DD',
      );
    }

    // Hitung tanggal terakhir bulan sebelumnya
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth(); // 0-based index

    // Jika bulan adalah Januari (0), maka bulan sebelumnya adalah Desember tahun sebelumnya
    let previousYear = year;
    let previousMonth = month - 1;

    if (previousMonth < 0) {
      previousMonth = 11; // Desember
      previousYear = year - 1;
    }

    // Hitung tanggal terakhir bulan sebelumnya
    const lastDayOfPreviousMonth = new Date(
      previousYear,
      previousMonth + 1,
      0,
    ).getDate();
    const previousMonthDate = new Date(
      previousYear,
      previousMonth,
      lastDayOfPreviousMonth,
    );

    // Format tanggal untuk query
    const formattedDate = previousMonthDate.toLocaleDateString('en-CA');

    console.log(`Input date: ${planDate}`);
    console.log(`Previous month date: ${formattedDate}`);
    console.log(`Searching for date: ${previousMonthDate}`);

    // Cari data di tabel r_plan_production untuk tanggal terakhir bulan sebelumnya
    const planProduction = await this.planProductionRepository.findOne({
      where: {
        plan_date: previousMonthDate,
      },
      select: ['remaining_stock', 'plan_date'],
    });

    // Jika data tidak ditemukan, return default value 0
    if (!planProduction) {
      return {
        remaining_stock: 0,
        plan_date: null,
        search_date: formattedDate,
        input_date: planDate,
        message: `Data remaining stock tidak ditemukan untuk tanggal ${formattedDate} (tanggal terakhir bulan sebelumnya), menggunakan default value 0`,
      };
    }

    return {
      remaining_stock: planProduction.remaining_stock,
      plan_date: planProduction.plan_date,
      search_date: formattedDate,
      input_date: planDate,
    };
  }

  async importData(
    file: Express.Multer.File,
    userId?: number | null,
  ): Promise<ApiResponse<any>> {
    try {
      if (!file) {
        throw new BadRequestException('File tidak ditemukan');
      }

      if (
        !file.mimetype.includes('csv') &&
        !file.originalname.endsWith('.csv')
      ) {
        throw new BadRequestException('File harus berupa CSV');
      }

      const csvData = await this.parseCsvFile(file.buffer);
      const importResults: ImportParentPlanProductionItemDto[] = [];
      let successCount = 0;
      let failedCount = 0;
      const errorRows: any[] = [];
      const successRows: any[] = [];

      // Validasi semua data terlebih dahulu
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const rowNumber = i + 1;

        try {
          const validation = this.validateCsvRow(row);

          if (validation.isValid) {
            successRows.push({ row: rowNumber, data: row });
            importResults.push({
              status: 'success',
              message: 'Data valid',
              row: rowNumber,
              data: row,
            });
          } else {
            failedCount++;
            errorRows.push({
              row: rowNumber,
              data: row,
              errors: validation.errors,
            });
            importResults.push({
              status: 'error',
              message: validation.message,
              row: rowNumber,
              data: row,
            });
          }
        } catch (error) {
          failedCount++;
          errorRows.push({
            row: rowNumber,
            data: row,
            errors: [
              {
                field: 'general',
                message: error.message || 'Gagal validasi data',
              },
            ],
          });
          importResults.push({
            status: 'error',
            message: error.message || 'Gagal validasi data',
            row: rowNumber,
            data: row,
          });
        }
      }
      // Jika ada error, buat file error dan return tanpa insert ke database
      if (errorRows.length > 0) {
        this.logger.log(
          `Found ${errorRows.length} rows with errors, generating error CSV...`,
        );

        try {
          const errorCsvBuffer = this.generateErrorCsv(errorRows);
          this.logger.log('Error CSV generated successfully');

          // Coba upload ke MinIO, jika gagal gunakan fallback
          let errorFileInfo: { key: string; downloadUrl: string } | null = null;
          let minioAvailable = false;

          try {
            // Test koneksi MinIO terlebih dahulu
            minioAvailable = await this.s3Service.testConnection();

            if (minioAvailable) {
              errorFileInfo = await this.s3Service.uploadErrorFile(
                `import_error_${Date.now()}.csv`,
                errorCsvBuffer,
                'ewh_import_error',
              );

              if (errorFileInfo) {
                this.logger.log('Error file uploaded to MinIO successfully');
              } else {
                this.logger.warn(
                  'MinIO upload failed, using fallback response',
                );
                minioAvailable = false;
              }
            } else {
              this.logger.warn(
                'MinIO tidak tersedia, menggunakan fallback response',
              );
            }
          } catch (s3Error) {
            this.logger.warn(
              'MinIO error, menggunakan fallback response:',
              s3Error.message,
            );
            minioAvailable = false;
          }

          const response = {
            total: csvData.length,
            success: 0,
            failed: failedCount,
            details: importResults,
            error_file:
              errorFileInfo && minioAvailable
                ? {
                    download_url: errorFileInfo.downloadUrl,
                    message:
                      'File error telah diupload ke cloud storage. Silakan download dan perbaiki data sebelum import ulang.',
                  }
                : {
                    download_url: null,
                    message:
                      'File error gagal diupload ke cloud storage. Silakan periksa data error di response details.',
                  },
          };

          return successResponse(
            response,
            'Import dibatalkan karena ada data yang tidak valid',
          );
        } catch (error) {
          this.logger.error('Error generating error CSV:', error);
          this.logger.error('Error stack:', error.stack);

          // Fallback response tanpa file error
          const response = {
            total: csvData.length,
            success: 0,
            failed: failedCount,
            details: importResults,
            error_file: {
              download_url: null,
              message:
                'Gagal generate file error. Silakan periksa data error di response details.',
            },
          };

          return successResponse(
            response,
            'Import dibatalkan karena ada data yang tidak valid',
          );
        }
      }

      // Jika semua data valid, lakukan import dengan transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const rowData of successRows) {
          await this.importCsvRow(rowData.data, userId);
          successCount++;
        }

        await queryRunner.commitTransaction();

        const response = {
          total: csvData.length,
          success: successCount,
          failed: 0,
          details: importResults,
        };

        return successResponse(response, 'Data berhasil diimport');
      } catch (error) {
        await queryRunner.rollbackTransaction();
        if (error?.response && error?.response?.statusCode === 400) {
          throw error;
        }
        throw new InternalServerErrorException(
          `Gagal import data: ${error.message}`,
        );
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal import CSV');
    }
  }

  private async parseCsvFile(
    buffer: Buffer,
  ): Promise<ImportParentPlanProductionRow[]> {
    return new Promise((resolve, reject) => {
      const results: ImportParentPlanProductionRow[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            plan_date: data.plan_date || '',
            total_average_month_ewh: data.total_average_month_ewh || 0,
            total_ore_target: data.total_ore_target || 0,
            total_ore_shipment_target: data.total_ore_shipment_target || 0,
            total_sisa_stock: data.total_sisa_stock || 0,
            total_ob_target: data.total_ob_target || 0,
            total_quarry_target: data.total_quarry_target || 0,
            total_fleet: data.total_fleet || 0,
            total_average_day_ewh: data.total_average_day_ewh || 0,
          });
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      !!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
    );
  }

  private validateCsvRow(row: ImportParentPlanProductionRow): {
    isValid: boolean;
    message: string;
    errors: Array<{ field: string; message: string }>;
  } {
    const errors: Array<{ field: string; message: string }> = [];

    // Validasi required fields
    if (!row.plan_date) {
      errors.push({
        field: 'plan_date',
        message: 'Tanggal Plan Aktifitas wajib diisi',
      });
    }
    if (!row.total_average_month_ewh) {
      errors.push({
        field: 'total_average_month_ewh',
        message: 'Total Average Month EWH wajib diisi',
      });
    }
    if (!row.total_average_day_ewh) {
      errors.push({
        field: 'total_average_day_ewh',
        message: 'Total Average EWH per Day wajib diisi',
      });
    }
    if (!row.total_ore_target) {
      errors.push({
        field: 'total_ore_target',
        message: 'Total Ore Target wajib diisi',
      });
    }
    if (!row.total_ore_shipment_target) {
      errors.push({
        field: 'total_ore_shipment_target',
        message: 'Total Ore Shipment target wajib diisi',
      });
    }
    if (!row.total_sisa_stock) {
      errors.push({
        field: 'Total sisa stock',
        message: 'Total sisa stock wajib diisi',
      });
    }
    if (!row.total_ob_target) {
      errors.push({
        field: 'total_ob_target',
        message: 'Total OB target wajib diisi',
      });
    }
    if (!row.total_quarry_target) {
      errors.push({
        field: 'total_quarry_target',
        message: 'Total Quarry Target wajib diisi',
      });
    }

    if (!row.total_fleet) {
      errors.push({
        field: 'total_fleet',
        message: 'Total Fleet wajib diisi',
      });
    }

    // Validasi format date
    if (row.plan_date && !this.isValidDate(row.plan_date)) {
      errors.push({
        field: 'activity_date',
        message: 'Format tanggal tidak valid (yyyy-mm-dd)',
      });
    }

    const isValid = errors.length === 0;

    // Buat message yang lebih detail
    let message = 'Data valid';
    if (!isValid) {
      if (errors.length === 1) {
        const error = errors[0];
        message = `Field "${error.field}" tidak valid: ${error.message}`;
      } else {
        const errorDetails = errors
          .map((err) => `"${err.field}": ${err.message}`)
          .join(', ');
        message = `${errors.length} field(s) tidak valid: ${errorDetails}`;
      }
    }

    return { isValid, message, errors };
  }

  private generateErrorCsv(errorRows: any[]): Buffer {
    try {
      // Header dengan kolom error
      const headers = [
        'row_number',
        'error_details',
        'plan_date',
        'total_average_month_ewh',
        'total_average_day_ewh',
        'total_ore_target',
        'total_ore_shipment_target',
        'total_sisa_stock',
        'total_ob_target',
        'total_quarry_target',
        'total_fleet',
      ];

      // Buat CSV content secara manual
      let csvContent = headers.join(',') + '\n';

      // Tambahkan data dengan error
      errorRows.forEach((errorRow) => {
        const rowData = errorRow.data;
        const errors = errorRow.errors;
        // Gabungkan semua error message
        const errorMessages = errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('; ');

        const csvRow = [
          errorRow.row,
          `"${errorMessages}"`, // Wrap dalam quotes untuk menghindari masalah dengan comma
          rowData.plan_date || '',
          rowData.total_average_month_ewh || '',
          rowData.total_average_day_ewh || '',
          rowData.total_ore_target || '',
          rowData.total_ore_shipment_target || '',
          rowData.total_sisa_stock || '',
          rowData.total_ob_target || '',
          rowData.total_quarry_target || '',
          rowData.total_fleet || '',
        ];

        csvContent += csvRow.join(',') + '\n';
      });

      return Buffer.from(csvContent, 'utf-8');
    } catch (error) {
      this.logger.error('Error in generateErrorCsv:', error);
      throw error;
    }
  }

  private async importCsvRow(
    row: ImportParentPlanProductionRow,
    userId?: number | null,
  ): Promise<void> {
    const monthlyPlanProduction: CreateParentPlanProductionDto = {
      plan_date: row.plan_date,
      total_average_month_ewh: row.total_average_day_ewh,
      total_average_day_ewh: row.total_average_day_ewh,
      total_ore_target: row.total_ore_target ?? 0,
      total_ore_shipment_target: row.total_ore_shipment_target ?? 0,
      total_sisa_stock: row.total_sisa_stock ?? 0,
      total_ob_target: row.total_ob_target ?? 0,
      total_quarry_target: row.total_quarry_target ?? 0,
      total_fleet: row.total_fleet ?? 0,
    };

    await this.create(monthlyPlanProduction);
  }

  private findAllQueryBuilder(): SelectQueryBuilder<ParentPlanProduction> {
    return this.parentPlanProductionRepository
      .createQueryBuilder('parent')
      .leftJoinAndSelect('parent.planProductions', 'planProductions');
  }

  private applyFilterExportData(
    qb: SelectQueryBuilder<ParentPlanProduction>,
    query: ExportParentPlanProductionQueryDto,
  ): SelectQueryBuilder<ParentPlanProduction> {
    const month = query?.month ? parseInt(query.month, 10) : null;
    if (month) {
      qb.andWhere('EXTRACT(MONTH FROM parent.plan_date) = :month', { month });
    }
    const validSortOrder = query?.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy('parent.plan_date', validSortOrder);
    return qb;
  }

  private mapExportDataToCsvRow(parent: any, index: number) {
    const availableDay =
      parent.planProductions?.filter((p) => p.is_available_day).length || 0;
    const holidayDay =
      parent.planProductions?.filter((p) => p.is_holiday_day).length || 0;

    return {
      No: index + 1,
      Month: moment(parent.plan_date, 'MMMM/YYYY'),
      'Calendar Day': availableDay + holidayDay,
      'Available Day': availableDay,
      'Holiday Day': holidayDay,
      'EWH Hours/Month': parent.total_average_month_ewh,
      'EWH Hours/Day': parent.total_average_day_ewh,
      'OB Target (BCM)': parent.total_ob_target,
      'Ore Target (WMT)': parent.total_ore_target,
      Quary: parent.total_quarry_target,
      'SR Target (BCM/WMT)': parent.total_ob_target / parent.total_ore_target,
      'Ore Shipment Target (WMT)': parent.total_ore_shipment_target,
      'Sisa Stock di EFO': parent.total_sisa_stock,
    };
  }

  async exportData(query: ExportParentPlanProductionQueryDto, res: Response) {
    try {
      const qb = this.findAllQueryBuilder();
      // Apply filters & sorting
      this.applyFilterExportData(qb, query);

      const data = await qb.getMany();
      if (!data.length) {
        res.status(200).json(successResponse([], 'Data Not Found'));
        return;
      }
      // Set headers CSV
      setCsvExportHeaders(res, `monthly_working_hour_export_${Date.now()}.csv`);

      // Buat stream writer
      const csvStream = format({ headers: true });
      csvStream.pipe(res);

      // Mapping ke row CSV
      data.forEach((item, i) => {
        csvStream.write(this.mapExportDataToCsvRow(item, i));
      });

      csvStream.end();
    } catch (error) {
      throw new InternalServerErrorException('Gagal export data');
    }
  }
}
