import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Raw, Between, MoreThanOrEqual, LessThanOrEqual, MoreThan } from 'typeorm';
import { PlanProduction } from '../plan-production/entities/plan-production.entity';
import { ParentPlanProduction } from '../parent-plan-production/entities/parent-plan-production.entity';
import {
  CreateDailyPlanProductionDto,
  UpdateDailyPlanProductionDto,
  QueryDailyPlanProductionDto,
  DailyPlanProductionListResponseDto,
} from './dto/daily-plan-production.dto';
import { successResponse } from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';

@Injectable()
export class DailyPlanProductionService {
  constructor(
    @InjectRepository(PlanProduction)
    private readonly dailyPlanProductionRepository: Repository<PlanProduction>,
    @InjectRepository(ParentPlanProduction)
    private readonly parentPlanProductionRepository: Repository<ParentPlanProduction>,
  ) {}

  async create(createDto: CreateDailyPlanProductionDto): Promise<any> {
    // 1. Cek apakah plan_date sudah ada di tabel
    const existingPlan = await this.dailyPlanProductionRepository.findOne({
      where: { plan_date: new Date(createDto.plan_date) },
    });

    if (existingPlan) {
      throw new BadRequestException('Plan date sudah ada dalam database');
    }

    // 2. Hitung old stock global dari data sebelumnya
    const oldStockGlobal = await this.getOldStockGlobal();

    // 3. Buat entity baru dengan perhitungan otomatis
    const dailyPlanProduction = new PlanProduction();
    dailyPlanProduction.plan_date = new Date(createDto.plan_date);
    dailyPlanProduction.average_day_ewh = createDto.average_day_ewh;
    dailyPlanProduction.average_shift_ewh = createDto.average_shift_ewh;
    dailyPlanProduction.ob_target = createDto.ob_target;
    dailyPlanProduction.ore_target = createDto.ore_target;
    dailyPlanProduction.quarry = createDto.quarry;
    dailyPlanProduction.ore_shipment_target = createDto.ore_shipment_target;
    dailyPlanProduction.total_fleet = createDto.total_fleet;
    dailyPlanProduction.average_moth_ewh = createDto.average_day_ewh; // Set default value
    dailyPlanProduction.parent_plan_production_id = 1; // Set default parent ID

    // 4. Set nilai boolean berdasarkan plan_date
    const planDate = new Date(createDto.plan_date);
    const dayOfWeek = planDate.getDay();

    dailyPlanProduction.is_calender_day = planDate.getTime() > 0;
    dailyPlanProduction.is_holiday_day = !dailyPlanProduction.is_calender_day;
    dailyPlanProduction.is_available_day = dayOfWeek !== 0;

    // 5. Hitung nilai-nilai yang dihitung otomatis
    dailyPlanProduction.sr_target = createDto.ore_target !== 0 ? createDto.ob_target / createDto.ore_target : 0;
    dailyPlanProduction.daily_old_stock = oldStockGlobal;
    dailyPlanProduction.shift_ob_target = createDto.ob_target / 2;
    dailyPlanProduction.shift_ore_target = createDto.ore_target / 2;
    dailyPlanProduction.shift_quarry = createDto.quarry / 2;
    dailyPlanProduction.shift_sr_target =
      dailyPlanProduction.shift_ore_target !== 0 ? dailyPlanProduction.shift_ob_target / dailyPlanProduction.shift_ore_target : 0;
    dailyPlanProduction.remaining_stock = oldStockGlobal - createDto.ore_shipment_target + createDto.ore_target;

    const savedPlan = await this.dailyPlanProductionRepository.save(dailyPlanProduction);

    // 6. Update parent plan production dengan total dari semua data dalam satu bulan
    await this.updateParentPlanProductionTotals(savedPlan.plan_date);

    return successResponse(savedPlan, 'Daily plan production berhasil dibuat');
  }

  async findAll(queryDto: QueryDailyPlanProductionDto): Promise<any> {
    const { start_date, end_date, search, sortBy = 'plan_date', sortOrder = 'DESC', page = 1, limit = 10, calendar_day } = queryDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<PlanProduction> = {};

    if (start_date && end_date) {
      where.plan_date = Between(new Date(start_date), new Date(end_date));
    } else if (start_date) {
      where.plan_date = MoreThanOrEqual(new Date(start_date));
    } else if (end_date) {
      where.plan_date = LessThanOrEqual(new Date(end_date));
    }

    // Add filter berdasarkan calendar_day
    if (calendar_day) {
      switch (calendar_day) {
        case 'available':
          where.schedule_day = 1;
          break;
        case 'holiday':
          where.schedule_day = 0;
          break;
        case 'one-shift':
          where.schedule_day = 0.5;
          break;
      }
    }

    // Handle search parameter - sementara dinonaktifkan karena ada masalah dengan TypeORM
    // if (search) {
    //   // Search berdasarkan plan_date menggunakan Raw operator untuk string search
    //   where.plan_date = Raw((alias) => `CAST(${alias} AS CHAR) LIKE '%${search}%'`);
    // }

    // Build order object
    const order: any = {};
    if (sortBy && sortOrder) {
      order[sortBy] = sortOrder;
    }

    const [plans, total] = await this.dailyPlanProductionRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Helper function untuk rounding ke 2 digit
    const roundToTwoDecimals = (value: number): number => {
      return Math.round(value * 100) / 100;
    };

    const processedData = plans.map((plan) => {
      // Hitung nilai-nilai yang diminta
      const sr_target = roundToTwoDecimals(plan.ore_target !== 0 ? plan.ob_target / plan.ore_target : 0);
      const sisa_stock = roundToTwoDecimals(plan.ore_target - plan.ore_shipment_target);
      const tonnage_per_fleet = roundToTwoDecimals(plan.total_fleet !== 0 ? plan.ore_target / plan.total_fleet : 0);
      const vessel_per_fleet = roundToTwoDecimals(tonnage_per_fleet / 35);

      // Handle plan_date yang mungkin bukan Date object
      let planDate: Date;
      if (plan.plan_date instanceof Date) {
        planDate = plan.plan_date;
      } else if (typeof plan.plan_date === 'string') {
        planDate = new Date(plan.plan_date);
      } else {
        // Fallback jika format tidak dikenali
        planDate = new Date(plan.plan_date as any);
      }

      // Set planDate ke awal hari untuk perbandingan yang akurat
      const planDateStart = new Date(planDate);
      planDateStart.setHours(0, 0, 0, 0);

      // Cek apakah tersedia untuk edit dan delete
      const isAvailableToEdit = planDateStart > today;
      const isAvailableToDelete = planDateStart > today;

      // Format calender_day berdasarkan schedule_day
      let calenderDay = 'holiday';
      if (plan.schedule_day === 1) {
        calenderDay = 'available';
      } else if (plan.schedule_day === 0.5) {
        calenderDay = 'one-shift';
      } else if (plan.schedule_day === 0) {
        calenderDay = 'holiday';
      }

      return {
        id: plan.id,
        date: planDate.toLocaleDateString('en-CA'),
        calender_day: calenderDay,
        average_month_ewh: roundToTwoDecimals(plan.average_moth_ewh || plan.average_day_ewh), // Menggunakan average_moth_ewh jika ada, fallback ke average_day_ewh
        average_day_ewh: roundToTwoDecimals(plan.average_day_ewh),
        ob_target: roundToTwoDecimals(plan.ob_target),
        ore_target: roundToTwoDecimals(plan.ore_target),
        quarry: roundToTwoDecimals(plan.quarry),
        sr_target: roundToTwoDecimals(sr_target),
        ore_shipment_target: roundToTwoDecimals(plan.ore_shipment_target),
        sisa_stock: Math.max(0, roundToTwoDecimals(sisa_stock)), // Pastikan tidak negatif
        total_fleet: plan.total_fleet, // Integer tidak perlu di-round
        tonnage_per_fleet: roundToTwoDecimals(tonnage_per_fleet),
        vessel_per_fleet: roundToTwoDecimals(vessel_per_fleet),
        is_available_to_edit: isAvailableToEdit,
        is_available_to_delete: isAvailableToDelete,
      };
    });

    return paginateResponse(processedData, total, page, limit, 'Data daily plan production berhasil diambil');
  }

  async findOne(id: number): Promise<any> {
    const plan = await this.dailyPlanProductionRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Daily plan production tidak ditemukan');
    }

    return successResponse(plan, 'Data daily plan production berhasil diambil');
  }

  async update(id: number, updateDto: UpdateDailyPlanProductionDto): Promise<any> {
    const plan = await this.dailyPlanProductionRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Daily plan production tidak ditemukan');
    }
    // 1. Cek apakah plan_date sudah ada di tabel r_plan_production, jika sudah ada maka kena validasi
    if (updateDto.plan_date) {
      // Handle plan_date yang mungkin bukan Date object
      let currentPlanDateStr = '';
      if (plan.plan_date instanceof Date) {
        currentPlanDateStr = plan.plan_date.toLocaleDateString('en-CA');
      } else if (typeof plan.plan_date === 'string') {
        currentPlanDateStr = (plan.plan_date as string).split('T')[0];
      } else {
        // Fallback jika format tidak dikenali
        currentPlanDateStr = new Date(plan.plan_date as any).toLocaleDateString('en-CA');
      }

      if (updateDto.plan_date !== currentPlanDateStr) {
        const existingPlan = await this.dailyPlanProductionRepository.findOne({
          where: { plan_date: new Date(updateDto.plan_date) },
        });

        if (existingPlan && existingPlan.id !== id) {
          throw new BadRequestException('Plan date sudah ada dalam database');
        }
      }
    }

    // 2. Update plan_date dan set boolean values
    if (updateDto.plan_date) {
      plan.plan_date = new Date(updateDto.plan_date);

      const planDate = new Date(updateDto.plan_date);
      const dayOfWeek = planDate.getDay();

      // is_calender_day: bernilai true jika plan_date terisi (bukan 0 atau null atau string kosong)
      plan.is_calender_day = planDate.getTime() > 0;
      // is_holiday_day: bernilai true jika plan_date tidak terisi (0 atau null atau string kosong)
      plan.is_holiday_day = !plan.is_calender_day;
      // is_available_day: bernilai true jika hari yang dipilih plan_date itu bukan hari minggu
      plan.is_available_day = dayOfWeek !== 0;
    }

    // Update field-field yang ada di body request
    if (updateDto.average_day_ewh !== undefined) plan.average_day_ewh = updateDto.average_day_ewh;
    if (updateDto.average_month_ewh !== undefined) plan.average_moth_ewh = updateDto.average_month_ewh;
    if (updateDto.schedule_day !== undefined) {
      plan.schedule_day = updateDto.schedule_day;

      // Update is_available_day dan is_holiday_day berdasarkan schedule_day
      if (updateDto.schedule_day === 0) {
        plan.is_available_day = false;
        plan.is_holiday_day = true;
      } else if (updateDto.schedule_day === 1 || updateDto.schedule_day === 0.5) {
        plan.is_available_day = true;
        plan.is_holiday_day = false;
      }
    }
    if (updateDto.ob_target !== undefined) plan.ob_target = updateDto.ob_target;
    if (updateDto.ore_target !== undefined) plan.ore_target = updateDto.ore_target;
    if (updateDto.quarry !== undefined) plan.quarry = updateDto.quarry;
    if (updateDto.ore_shipment_target !== undefined) plan.ore_shipment_target = updateDto.ore_shipment_target;
    if (updateDto.total_fleet !== undefined) plan.total_fleet = updateDto.total_fleet;

    // 3. Hitung nilai-nilai yang dihitung otomatis
    if (updateDto.ob_target !== undefined || updateDto.ore_target !== undefined) {
      // sr_target: (rumusnya yaitu (ob_target / ore_target))
      plan.sr_target = plan.ore_target !== 0 ? plan.ob_target / plan.ore_target : 0;
      // shift_ob_target: (rumusnya yaitu (ob_target / 2))
      plan.shift_ob_target = plan.ob_target / 2;
      // shift_ore_target: (rumusnya yaitu (ore_target / 2))
      plan.shift_ore_target = plan.ore_target / 2;
      // shift_sr_target: (rumusnya yaitu (shift_ob_target / shift_ore_target))
      plan.shift_sr_target = plan.shift_ore_target !== 0 ? plan.shift_ob_target / plan.shift_ore_target : 0;
    }

    if (updateDto.quarry !== undefined) {
      // shift_quarry: (rumusnya yaitu (quarry / 2))
      plan.shift_quarry = plan.quarry / 2;
    }

    // Handle sisa_stock dan remaining_stock update
    if (updateDto.sisa_stock !== undefined) {
      // Jika ada sisa_stock dalam payload, gunakan nilai tersebut untuk remaining_stock
      plan.remaining_stock = updateDto.sisa_stock;
    } else if (updateDto.ore_target !== undefined || updateDto.ore_shipment_target !== undefined) {
      // Cara mencari old_stock_global: ambil data dari tabel r_plan_production di kolom daily_old_stock
      // tapi untuk data sebelumnya, jika tidak ada maka ambil dari tabel r_parent_plan_production di kolom total_sisa_stock
      const oldStockGlobal = await this.getOldStockGlobal();
      // daily_old_stock: (rumusnya yaitu (old_stock_global - ore_shipment_target) + ore_target)
      plan.daily_old_stock = oldStockGlobal;
      // remaining_stock: (rumusnya yaitu (old_stock_global - ore_shipment_target) + ore_target)
      plan.remaining_stock = oldStockGlobal - plan.ore_shipment_target + plan.ore_target;
    }

    const updatedPlan = await this.dailyPlanProductionRepository.save(plan);

    // 4. Update remaining_stock untuk data pada tanggal setelahnya
    if (updateDto.sisa_stock !== undefined || updateDto.ore_target !== undefined || updateDto.ore_shipment_target !== undefined) {
      await this.updateRemainingStockForFutureDates(updatedPlan.plan_date);
    }

    // 5. Update parent plan production dengan total dari semua data dalam satu bulan
    await this.updateParentPlanProductionTotals(updatedPlan.plan_date);

    // 6. Fallback: Update langsung parent plan production ID 20
    await this.updateParentPlanProductionById(20);

    return successResponse(updatedPlan, 'Daily plan production berhasil diupdate');
  }

  async remove(id: number): Promise<any> {
    const plan = await this.dailyPlanProductionRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Daily plan production tidak ditemukan');
    }

    // Simpan plan_date sebelum dihapus untuk update parent
    const planDate = plan.plan_date;

    await this.dailyPlanProductionRepository.softDelete(id);

    // Update parent plan production setelah data dihapus
    await this.updateParentPlanProductionTotals(planDate);

    return successResponse(null, 'Daily plan production berhasil dihapus');
  }

  /**
   * Update remaining_stock untuk data pada tanggal setelah tanggal yang diupdate
   * Menggunakan rumus: remaining_stock = remaining_stock (data sebelumnya) - ore_shipment_target + ore_target
   */
  private async updateRemainingStockForFutureDates(updatedPlanDate: Date): Promise<void> {
    try {
      console.log(`Starting cascade update for dates after: ${updatedPlanDate.toLocaleDateString()}`);

      // Ambil semua data yang tanggalnya setelah tanggal yang diupdate, urutkan berdasarkan tanggal
      const futurePlans = await this.dailyPlanProductionRepository.find({
        where: {
          plan_date: MoreThan(updatedPlanDate),
        },
        order: {
          plan_date: 'ASC',
        },
      });

      if (futurePlans.length === 0) {
        console.log('No future plans found to update remaining_stock');
        return;
      }

      console.log(`Found ${futurePlans.length} future plans to update remaining_stock`);

      // Ambil data yang baru diupdate untuk mendapatkan remaining_stock awal
      const updatedPlan = await this.dailyPlanProductionRepository.findOne({
        where: { plan_date: updatedPlanDate },
      });

      if (!updatedPlan) {
        console.log('Updated plan not found, skipping cascade update');
        return;
      }

      let previousRemainingStock = updatedPlan.remaining_stock || 0;
      console.log(`Starting cascade update with remaining_stock from updated plan: ${previousRemainingStock}`);

      // Update setiap data secara berurutan dan simpan satu per satu
      for (let i = 0; i < futurePlans.length; i++) {
        const currentPlan = futurePlans[i];

        // Hitung remaining_stock baru sesuai rumus
        // remaining_stock = remaining_stock (data sebelumnya) - ore_shipment_target + ore_target
        const newRemainingStock = previousRemainingStock - currentPlan.ore_shipment_target + currentPlan.ore_target;

        console.log(`Processing plan ${currentPlan.id} (${currentPlan.plan_date.toLocaleDateString()})`);
        console.log(`  Previous remaining_stock: ${previousRemainingStock}`);
        console.log(`  Current ore_shipment_target: ${currentPlan.ore_shipment_target}`);
        console.log(`  Current ore_target: ${currentPlan.ore_target}`);
        console.log(`  New remaining_stock: ${newRemainingStock}`);

        // Update remaining_stock menggunakan QueryBuilder untuk memastikan update ke database
        await this.dailyPlanProductionRepository
          .createQueryBuilder()
          .update(PlanProduction)
          .set({ remaining_stock: newRemainingStock })
          .where('id = :id', { id: currentPlan.id })
          .execute();

        // Update previousRemainingStock untuk iterasi berikutnya
        previousRemainingStock = newRemainingStock;

        console.log(`  Successfully updated plan ${currentPlan.id} with remaining_stock: ${newRemainingStock}`);
      }

      console.log(`Successfully updated remaining_stock for ${futurePlans.length} future plans`);

      // Verifikasi bahwa update benar-benar terjadi di database
      await this.verifyRemainingStockUpdates(updatedPlanDate);
    } catch (error) {
      console.error('Error updating remaining_stock for future dates:', error);
      // Jangan throw error agar tidak mengganggu proses utama
    }
  }

  /**
   * Verifikasi bahwa remaining_stock benar-benar terupdate di database
   */
  private async verifyRemainingStockUpdates(updatedPlanDate: Date): Promise<void> {
    try {
      console.log('Verifying remaining_stock updates in database...');

      // Ambil data yang baru diupdate
      const updatedPlan = await this.dailyPlanProductionRepository.findOne({
        where: { plan_date: updatedPlanDate },
      });

      if (!updatedPlan) {
        console.log('Updated plan not found for verification');
        return;
      }

      let previousRemainingStock = updatedPlan.remaining_stock || 0;
      console.log(`Verification - Starting with remaining_stock: ${previousRemainingStock}`);

      // Ambil semua data yang tanggalnya setelah tanggal yang diupdate, urutkan berdasarkan tanggal
      const futurePlans = await this.dailyPlanProductionRepository.find({
        where: {
          plan_date: MoreThan(updatedPlanDate),
        },
        order: {
          plan_date: 'ASC',
        },
      });

      for (let i = 0; i < futurePlans.length; i++) {
        const currentPlan = futurePlans[i];
        const expectedRemainingStock = previousRemainingStock - currentPlan.ore_shipment_target + currentPlan.ore_target;

        console.log(`Verification - Plan ${currentPlan.id} (${currentPlan.plan_date.toLocaleDateString()}):`);
        console.log(`  Expected remaining_stock: ${expectedRemainingStock}`);
        console.log(`  Actual remaining_stock: ${currentPlan.remaining_stock}`);
        console.log(`  Match: ${Math.abs(expectedRemainingStock - currentPlan.remaining_stock) < 0.01 ? '✅' : '❌'}`);

        previousRemainingStock = currentPlan.remaining_stock || 0;
      }

      console.log('Verification completed');
    } catch (error) {
      console.error('Error during verification:', error);
    }
  }

  private async getOldStockGlobal(): Promise<number> {
    // Cara mencari old_stock_global: ambil data dari tabel r_plan_production di kolom daily_old_stock
    // tapi untuk data sebelumnya, jika tidak ada maka ambil dari tabel r_parent_plan_production di kolom total_sisa_stock

    // 1. Coba ambil dari r_plan_production terlebih dahulu
    const previousPlan = await this.dailyPlanProductionRepository.findOne({
      where: {},
      order: { plan_date: 'DESC' },
    });

    if (previousPlan && previousPlan.daily_old_stock !== undefined) {
      return previousPlan.daily_old_stock;
    }

    // 2. Jika tidak ada, ambil dari r_parent_plan_production
    const parentPlan = await this.parentPlanProductionRepository.findOne({
      where: {},
      order: { plan_date: 'DESC' },
    });

    if (parentPlan && parentPlan.total_sisa_stock !== undefined) {
      return parentPlan.total_sisa_stock;
    }

    // 3. Jika tidak ada sama sekali, return 0
    return 0;
  }

  /**
   * Update parent plan production dengan total dari semua data dalam satu bulan
   */
  private async updateParentPlanProductionTotals(planDate: Date): Promise<void> {
    try {
      // Ambil tahun dan bulan dari plan_date
      const year = planDate.getFullYear();
      const month = planDate.getMonth() + 1; // getMonth() returns 0-11, so add 1

      // Hitung tanggal awal dan akhir bulan
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0); // Last day of month

      // Ambil semua data plan production dalam satu bulan
      const monthlyPlans = await this.dailyPlanProductionRepository.find({
        where: {
          plan_date: Between(startOfMonth, endOfMonth),
        },
      });

      if (monthlyPlans.length === 0) {
        console.log(`No data found for month ${year}-${month.toString().padStart(2, '0')}`);
        return; // Tidak ada data untuk diupdate
      }

      // Hitung total dari field-field yang diminta
      const total_average_month_ewh = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          // Gunakan average_moth_ewh jika ada, fallback ke average_day_ewh
          const avgMonthEwh = Number(plan.average_moth_ewh) || Number(plan.average_day_ewh) || 0;
          return sum + avgMonthEwh;
        }, 0),
      );

      const total_ore_target = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          return sum + Number(plan.ore_target || 0);
        }, 0),
      );

      const total_ore_shipment_target = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          return sum + Number(plan.ore_shipment_target || 0);
        }, 0),
      );

      const total_ob_target = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          return sum + Number(plan.ob_target || 0);
        }, 0),
      );

      // Log untuk debugging
      console.log(`Found ${monthlyPlans.length} plans for ${year}-${month.toString().padStart(2, '0')}`);
      console.log(`Total average_month_ewh: ${total_average_month_ewh}`);
      console.log(`Total ore_target: ${total_ore_target}`);
      console.log(`Total ore_shipment_target: ${total_ore_shipment_target}`);
      console.log(`Total ob_target: ${total_ob_target}`);

      // Cari parent plan production berdasarkan tahun dan bulan yang sama
      const parentPlan = await this.parentPlanProductionRepository.findOne({
        where: {
          plan_date: Between(startOfMonth, endOfMonth),
        },
      });

      if (!parentPlan) {
        console.log(`No parent plan production found for month ${year}-${month.toString().padStart(2, '0')}`);
        return;
      }

      console.log(`Updating parent plan production with ID ${parentPlan.id}...`);

      // Gunakan QueryBuilder untuk update yang lebih eksplisit
      await this.parentPlanProductionRepository
        .createQueryBuilder()
        .update(ParentPlanProduction)
        .set({
          total_average_month_ewh: total_average_month_ewh,
          total_ore_target: total_ore_target,
          total_ore_shipment_target: total_ore_shipment_target,
          total_ob_target: total_ob_target,
        })
        .where('id = :id', { id: parentPlan.id })
        .execute();

      console.log(`Updated parent plan production ID ${parentPlan.id} with new totals:`);
      console.log(`  total_average_month_ewh: ${total_average_month_ewh}`);
      console.log(`  total_ore_target: ${total_ore_target}`);
      console.log(`  total_ore_shipment_target: ${total_ore_shipment_target}`);
      console.log(`  total_ob_target: ${total_ob_target}`);
    } catch (error) {
      console.error('Error updating parent plan production totals:', error);
      // Jangan throw error agar tidak mengganggu proses utama
    }
  }

  /**
   * Update parent plan production berdasarkan ID
   */
  private async updateParentPlanProductionById(parentId: number): Promise<void> {
    try {
      // Ambil parent plan production berdasarkan ID
      const parentPlan = await this.parentPlanProductionRepository.findOne({
        where: { id: parentId },
      });

      if (!parentPlan) {
        console.log(`Parent plan production with ID ${parentId} not found`);
        return;
      }

      // Ambil tahun dan bulan dari parent plan
      const year = parentPlan.plan_date.getFullYear();
      const month = parentPlan.plan_date.getMonth() + 1;

      // Hitung tanggal awal dan akhir bulan
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      // Ambil semua data plan production dalam satu bulan
      const monthlyPlans = await this.dailyPlanProductionRepository.find({
        where: {
          plan_date: Between(startOfMonth, endOfMonth),
        },
      });

      if (monthlyPlans.length === 0) {
        console.log(`No data found for month ${year}-${month.toString().padStart(2, '0')}`);
        return;
      }

      // Hitung total dari field-field yang diminta
      const total_average_month_ewh = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          const avgMonthEwh = Number(plan.average_moth_ewh) || Number(plan.average_day_ewh) || 0;
          return sum + avgMonthEwh;
        }, 0),
      );

      const total_ore_target = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          return sum + Number(plan.ore_target || 0);
        }, 0),
      );

      const total_ore_shipment_target = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          return sum + Number(plan.ore_shipment_target || 0);
        }, 0),
      );

      const total_ob_target = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          return sum + Number(plan.ob_target || 0);
        }, 0),
      );

      // Update parent plan production
      parentPlan.total_average_month_ewh = total_average_month_ewh;
      parentPlan.total_ore_target = total_ore_target;
      parentPlan.total_ore_shipment_target = total_ore_shipment_target;
      parentPlan.total_ob_target = total_ob_target;

      console.log(`Direct update: Updating parent plan ${parentPlan.id} with new totals:`);
      console.log(`  total_average_month_ewh: ${parentPlan.total_average_month_ewh}`);
      console.log(`  total_ore_target: ${parentPlan.total_ore_target}`);
      console.log(`  total_ore_shipment_target: ${parentPlan.total_ore_shipment_target}`);
      console.log(`  total_ob_target: ${parentPlan.total_ob_target}`);

      await this.parentPlanProductionRepository.save(parentPlan);
      console.log(`Direct update: Updated parent plan production ID ${parentId}`);
    } catch (error) {
      console.error(`Error updating parent plan production ID ${parentId}:`, error);
    }
  }

  /**
   * Test method untuk mengupdate parent plan production
   */
  async testUpdateParent(parentId: number): Promise<any> {
    try {
      await this.updateParentPlanProductionById(parentId);

      // Ambil data parent plan production yang sudah diupdate
      const updatedParent = await this.parentPlanProductionRepository.findOne({
        where: { id: parentId },
      });

      return {
        message: 'Test update parent plan production completed',
        parentId,
        updatedData: updatedParent,
      };
    } catch (error) {
      return {
        message: 'Test update parent plan production failed',
        error: error.message,
      };
    }
  }

  /**
   * Force update parent plan production dengan perhitungan ulang
   */
  async forceUpdateParent(parentId: number): Promise<any> {
    try {
      // Ambil parent plan production
      const parentPlan = await this.parentPlanProductionRepository.findOne({
        where: { id: parentId },
      });

      if (!parentPlan) {
        return {
          message: 'Parent plan production not found',
          parentId,
        };
      }

      // Ambil tahun dan bulan dari parent plan
      const year = parentPlan.plan_date.getFullYear();
      const month = parentPlan.plan_date.getMonth() + 1;

      // Hitung tanggal awal dan akhir bulan
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      // Ambil semua data plan production dalam satu bulan
      const monthlyPlans = await this.dailyPlanProductionRepository.find({
        where: {
          plan_date: Between(startOfMonth, endOfMonth),
        },
      });

      console.log(`Found ${monthlyPlans.length} plans for ${year}-${month.toString().padStart(2, '0')}`);

      if (monthlyPlans.length === 0) {
        return {
          message: 'No data found for this month',
          parentId,
          year,
          month,
        };
      }

      // Hitung total dari field-field yang diminta
      const total_average_month_ewh = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          const avgMonthEwh = Number(plan.average_moth_ewh) || Number(plan.average_day_ewh) || 0;
          return sum + avgMonthEwh;
        }, 0),
      );

      const total_ore_target = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          return sum + Number(plan.ore_target || 0);
        }, 0),
      );

      const total_ore_shipment_target = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          return sum + Number(plan.ore_shipment_target || 0);
        }, 0),
      );

      const total_ob_target = Math.round(
        monthlyPlans.reduce((sum, plan) => {
          return sum + Number(plan.ob_target || 0);
        }, 0),
      );

      console.log(`Calculated totals:`);
      console.log(`  total_average_month_ewh: ${total_average_month_ewh}`);
      console.log(`  total_ore_target: ${total_ore_target}`);
      console.log(`  total_ore_shipment_target: ${total_ore_shipment_target}`);
      console.log(`  total_ob_target: ${total_ob_target}`);

      // Update menggunakan QueryBuilder
      const result = await this.parentPlanProductionRepository
        .createQueryBuilder()
        .update(ParentPlanProduction)
        .set({
          total_average_month_ewh: total_average_month_ewh,
          total_ore_target: total_ore_target,
          total_ore_shipment_target: total_ore_shipment_target,
          total_ob_target: total_ob_target,
        })
        .where('id = :id', { id: parentId })
        .execute();

      console.log(`Update result:`, result);

      // Ambil data yang sudah diupdate
      const updatedParent = await this.parentPlanProductionRepository.findOne({
        where: { id: parentId },
      });

      return {
        message: 'Force update parent plan production completed',
        parentId,
        year,
        month,
        calculatedTotals: {
          total_average_month_ewh,
          total_ore_target,
          total_ore_shipment_target,
          total_ob_target,
        },
        updateResult: result,
        updatedData: updatedParent,
      };
    } catch (error) {
      console.error('Error in forceUpdateParent:', error);
      return {
        message: 'Force update parent plan production failed',
        error: error.message,
        parentId,
      };
    }
  }
}
