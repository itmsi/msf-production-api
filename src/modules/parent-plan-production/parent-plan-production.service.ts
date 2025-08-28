import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Not } from 'typeorm';
import { ParentPlanProduction } from './entities/parent-plan-production.entity';
import { PlanProduction } from '../plan-production/entities/plan-production.entity';
import { CreateParentPlanProductionDto } from './dto/create-parent-plan-production.dto';
import {
  GetParentPlanProductionQueryDto,
  UpdateParentPlanProductionDto,
} from './dto/parent-plan-production.dto';
import { paginateResponse } from '../../common/helpers/public.helper';

@Injectable()
export class ParentPlanProductionService {
  constructor(
    @InjectRepository(ParentPlanProduction)
    private parentPlanProductionRepository: Repository<ParentPlanProduction>,
    @InjectRepository(PlanProduction)
    private planProductionRepository: Repository<PlanProduction>,
  ) {}

  /**
   * Membuat parent plan production dan generate data plan production harian
   */
  async create(createDto: CreateParentPlanProductionDto) {
    const planDate = new Date(createDto.plan_date);

    // Validasi apakah plan_date sudah ada
    const existingParent = await this.parentPlanProductionRepository.findOne({
      where: { plan_date: planDate },
    });

    if (existingParent) {
      throw new ConflictException('Plan date sudah ada dalam sistem');
    }

    // Hitung jumlah hari dalam bulan
    const totalCalendarDays = this.getDaysInMonth(planDate);
    const totalHolidayDays = this.getSundaysInMonth(planDate);
    const totalAvailableDays = totalCalendarDays - totalHolidayDays;

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
    const generatedDailyData = await this.generateDailyPlanProductions(
      savedParent,
      createDto,
    );

    // Log hasil generate
    console.log(`Parent Plan Production created with ID: ${savedParent.id}`);
    console.log(
      `Generated ${generatedDailyData.length} daily plan productions`,
    );

    return savedParent;
  }

  /**
   * Generate data plan production harian berdasarkan parent
   */
  private async generateDailyPlanProductions(
    parentPlanProduction: ParentPlanProduction,
    createDto: CreateParentPlanProductionDto,
  ) {
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
      const isSunday = currentDate.getDay() === 0; // 0 = Sunday

      // Hitung nilai-nilai berdasarkan logika yang diminta
      const dailyOldStock = oldStockGlobal;
      const shiftObTarget = obTarget / 2;
      const shiftOreTarget = oreTarget / 2;
      const shiftQuarry = quarry / 2;
      const shiftSrTarget = shiftObTarget / shiftOreTarget;
      const remainingStock = oldStockGlobal - oreShipmentTarget + oreTarget;

      const planProduction: Partial<PlanProduction> = {
        plan_date: currentDate,
        is_calender_day: true, // Selalu true karena ada tanggal
        is_holiday_day: isSunday, // True jika hari minggu
        is_available_day: !isSunday, // False jika hari minggu
        average_day_ewh: averageDayEwh,
        average_shift_ewh: averageMonthEwh,
        ob_target: obTarget,
        ore_target: oreTarget,
        quarry: quarry,
        sr_target: obTarget / oreTarget, // Sesuai rumus yang diminta
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

    // Log untuk debugging
    console.log(
      `Generating ${planProductions.length} daily plan productions for month ${planDate.getMonth() + 1}/${planDate.getFullYear()}`,
    );
    console.log(
      `Date range: ${planProductions[0]?.plan_date} to ${planProductions[planProductions.length - 1]?.plan_date}`,
    );

    // Simpan semua plan production
    const savedPlanProductions =
      await this.planProductionRepository.save(planProductions);
    console.log(
      `Successfully saved ${savedPlanProductions.length} daily plan productions`,
    );

    return savedPlanProductions;
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

      const qb: SelectQueryBuilder<ParentPlanProduction> =
        this.parentPlanProductionRepository
          .createQueryBuilder('parent')
          .leftJoinAndSelect('parent.planProductions', 'planProductions');

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
        let isAvailableToEdit = false;
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
          average_month_ewh: parent.total_average_month_ewh,
          average_day_ewh: parent.total_average_day_ewh,
          ob_target: parent.total_ob_target,
          ore_target: parent.total_ore_target,
          quarry_target: parent.total_quarry_target,
          sr_target: parent.total_ore_target / parent.total_ob_target,
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
      totalHolidayDays = this.getSundaysInMonth(planDate);
      totalAvailableDays = totalCalendarDays - totalHolidayDays;
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
      const isSunday = currentDate.getDay() === 0; // 0 = Sunday

      // Hitung nilai-nilai berdasarkan logika yang diminta
      const dailyOldStock = oldStockGlobal;
      const shiftObTarget = obTarget / 2;
      const shiftOreTarget = oreTarget / 2;
      const shiftQuarry = quarry / 2;
      const shiftSrTarget = shiftObTarget / shiftOreTarget;
      const remainingStock = oldStockGlobal - oreShipmentTarget + oreTarget;

      // Update fields pada data yang sudah ada
      existingPlan.plan_date = currentDate;
      existingPlan.is_calender_day = true; // Selalu true karena ada tanggal
      existingPlan.is_holiday_day = isSunday; // True jika hari minggu
      existingPlan.is_available_day = !isSunday; // False jika hari minggu
      existingPlan.average_day_ewh = averageDayEwh;
      existingPlan.average_shift_ewh = averageMonthEwh;
      existingPlan.ob_target = obTarget;
      existingPlan.ore_target = oreTarget;
      existingPlan.quarry = quarry;
      existingPlan.sr_target = obTarget / oreTarget; // Sesuai rumus yang diminta
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
}
