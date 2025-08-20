import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { DailyPlanProduction } from './entities/daily-plan-production.entity';
import { CreateDailyPlanProductionDto, UpdateDailyPlanProductionDto, QueryDailyPlanProductionDto } from './dto/daily-plan-production.dto';
import { successResponse } from '../../common/helpers/response.helper';

@Injectable()
export class DailyPlanProductionService {
  constructor(
    @InjectRepository(DailyPlanProduction)
    private readonly dailyPlanProductionRepository: Repository<DailyPlanProduction>,
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
    const dailyPlanProduction = new DailyPlanProduction();
    dailyPlanProduction.plan_date = new Date(createDto.plan_date);
    dailyPlanProduction.average_day_ewh = createDto.average_day_ewh;
    dailyPlanProduction.average_shift_ewh = createDto.average_shift_ewh;
    dailyPlanProduction.ob_target = createDto.ob_target;
    dailyPlanProduction.ore_target = createDto.ore_target;
    dailyPlanProduction.quarry = createDto.quarry;
    dailyPlanProduction.ore_shipment_target = createDto.ore_shipment_target;
    dailyPlanProduction.total_fleet = createDto.total_fleet;

    // 4. Set nilai boolean berdasarkan plan_date
    const planDate = new Date(createDto.plan_date);
    const dayOfWeek = planDate.getDay();

    dailyPlanProduction.is_calender_day = planDate.getTime() > 0;
    dailyPlanProduction.is_holiday_day = !dailyPlanProduction.is_calender_day;
    dailyPlanProduction.is_available_day = dayOfWeek !== 0;

    // 5. Hitung nilai-nilai yang dihitung otomatis
    dailyPlanProduction.sr_target = createDto.ob_target / createDto.ore_target;
    dailyPlanProduction.daily_old_stock = oldStockGlobal;
    dailyPlanProduction.shift_ob_target = createDto.ob_target / 2;
    dailyPlanProduction.shift_ore_target = createDto.ore_target / 2;
    dailyPlanProduction.shift_quarrt = createDto.quarry / 2;
    dailyPlanProduction.shift_sr_target = dailyPlanProduction.shift_ob_target / dailyPlanProduction.shift_ore_target;
    dailyPlanProduction.remaining_stock = oldStockGlobal - createDto.ore_shipment_target + createDto.ore_target;

    const savedPlan = await this.dailyPlanProductionRepository.save(dailyPlanProduction);
    return successResponse(savedPlan, 'Daily plan production berhasil dibuat');
  }

  async findAll(queryDto: QueryDailyPlanProductionDto): Promise<any> {
    const { start_date, end_date, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<DailyPlanProduction> = {};

    if (start_date && end_date) {
      where.plan_date = {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      } as any;
    } else if (start_date) {
      where.plan_date = {
        $gte: new Date(start_date),
      } as any;
    } else if (end_date) {
      where.plan_date = {
        $lte: new Date(end_date),
      } as any;
    }

    const [plans, total] = await this.dailyPlanProductionRepository.findAndCount({
      where,
      order: { plan_date: 'DESC' },
      skip,
      take: limit,
    });

    const processedData = plans.map(plan => {
      const planDate = new Date(plan.plan_date);
      planDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isAvailableToEdit = plan.plan_date && planDate > today;
      const isAvailableToDelete = plan.plan_date && planDate > today;

      return {
        ...plan,
        isAvailableToEdit,
        isAvailableToDelete,
      };
    });

    return successResponse({
      data: processedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, 'Data daily plan production berhasil diambil');
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

    if (updateDto.plan_date && updateDto.plan_date !== plan.plan_date.toISOString().split('T')[0]) {
      const existingPlan = await this.dailyPlanProductionRepository.findOne({
        where: { plan_date: new Date(updateDto.plan_date) },
      });

      if (existingPlan && existingPlan.id !== id) {
        throw new BadRequestException('Plan date sudah ada dalam database');
      }
    }

    if (updateDto.plan_date) {
      plan.plan_date = new Date(updateDto.plan_date);
      
      const planDate = new Date(updateDto.plan_date);
      const dayOfWeek = planDate.getDay();

      plan.is_calender_day = planDate.getTime() > 0;
      plan.is_holiday_day = !plan.is_calender_day;
      plan.is_available_day = dayOfWeek !== 0;
    }

    if (updateDto.average_day_ewh !== undefined) plan.average_day_ewh = updateDto.average_day_ewh;
    if (updateDto.average_shift_ewh !== undefined) plan.average_shift_ewh = updateDto.average_shift_ewh;
    if (updateDto.ob_target !== undefined) plan.ob_target = updateDto.ob_target;
    if (updateDto.ore_target !== undefined) plan.ore_target = updateDto.ore_target;
    if (updateDto.quarry !== undefined) plan.quarry = updateDto.quarry;
    if (updateDto.ore_shipment_target !== undefined) plan.ore_shipment_target = updateDto.ore_shipment_target;
    if (updateDto.total_fleet !== undefined) plan.total_fleet = updateDto.total_fleet;

    if (updateDto.ob_target !== undefined || updateDto.ore_target !== undefined) {
      plan.sr_target = plan.ob_target / plan.ore_target;
      plan.shift_ob_target = plan.ob_target / 2;
      plan.shift_ore_target = plan.ore_target / 2;
      plan.shift_sr_target = plan.shift_ob_target / plan.shift_ore_target;
    }

    if (updateDto.quarry !== undefined) {
      plan.shift_quarrt = plan.quarry / 2;
    }

    if (updateDto.ore_target !== undefined || updateDto.ore_shipment_target !== undefined) {
      const oldStockGlobal = await this.getOldStockGlobal();
      plan.daily_old_stock = oldStockGlobal;
      plan.remaining_stock = oldStockGlobal - plan.ore_shipment_target + plan.ore_target;
    }

    const updatedPlan = await this.dailyPlanProductionRepository.save(plan);
    return successResponse(updatedPlan, 'Daily plan production berhasil diupdate');
  }

  async remove(id: number): Promise<any> {
    const plan = await this.dailyPlanProductionRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Daily plan production tidak ditemukan');
    }

    await this.dailyPlanProductionRepository.softDelete(id);
    return successResponse(null, 'Daily plan production berhasil dihapus');
  }

  private async getOldStockGlobal(): Promise<number> {
    const previousPlan = await this.dailyPlanProductionRepository.findOne({
      where: {},
      order: { plan_date: 'DESC' },
    });

    if (!previousPlan) {
      return 0;
    }

    return previousPlan.daily_old_stock || 0;
  }
}
