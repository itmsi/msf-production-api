import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { PlanWorkingHourDetail } from './entities/plan-working-hour-detail.entity';
import {
  CreatePlanWorkingHourDetailDto,
  UpdatePlanWorkingHourDetailDto,
  QueryPlanWorkingHourDetailDto,
} from './dto/plan-working-hour-detail.dto';

@Injectable()
export class PlanWorkingHourDetailService {
  constructor(
    @InjectRepository(PlanWorkingHourDetail)
    private readonly planWorkingHourDetailRepository: Repository<PlanWorkingHourDetail>,
  ) {}

  async create(
    createDto: CreatePlanWorkingHourDetailDto,
  ): Promise<PlanWorkingHourDetail> {
    const detail = this.planWorkingHourDetailRepository.create(createDto);
    return await this.planWorkingHourDetailRepository.save(detail);
  }

  async findAll(
    queryDto: QueryPlanWorkingHourDetailDto,
  ): Promise<PlanWorkingHourDetail[]> {
    const where: FindOptionsWhere<PlanWorkingHourDetail> = {};

    if (queryDto.plant_working_hour_id) {
      where.plant_working_hour_id = queryDto.plant_working_hour_id;
    }

    if (queryDto.activities_id) {
      where.activities_id = queryDto.activities_id;
    }

    if (queryDto.activities_hour !== undefined) {
      where.activities_hour = queryDto.activities_hour;
    }

    return await this.planWorkingHourDetailRepository.find({
      where,
      relations: ['planWorkingHour', 'activities'],
    });
  }

  async findOne(id: number): Promise<PlanWorkingHourDetail> {
    const detail = await this.planWorkingHourDetailRepository.findOne({
      where: { id },
      relations: ['planWorkingHour', 'activities'],
    });

    if (!detail) {
      throw new NotFoundException(
        `Plan Working Hour Detail with ID ${id} not found`,
      );
    }

    return detail;
  }

  async findByPlanWorkingHourId(
    planWorkingHourId: number,
  ): Promise<PlanWorkingHourDetail[]> {
    return await this.planWorkingHourDetailRepository.find({
      where: { plant_working_hour_id: planWorkingHourId },
      relations: ['activities'],
    });
  }

  async findByActivitiesId(
    activitiesId: number,
  ): Promise<PlanWorkingHourDetail[]> {
    return await this.planWorkingHourDetailRepository.find({
      where: { activities_id: activitiesId },
      relations: ['planWorkingHour'],
    });
  }

  async update(
    id: number,
    updateDto: UpdatePlanWorkingHourDetailDto,
  ): Promise<PlanWorkingHourDetail> {
    const detail = await this.findOne(id);

    Object.assign(detail, updateDto);
    return await this.planWorkingHourDetailRepository.save(detail);
  }

  async remove(id: number): Promise<void> {
    const detail = await this.findOne(id);
    await this.planWorkingHourDetailRepository.softDelete(id);
  }

  async getSummaryByPlanWorkingHour(planWorkingHourId: number): Promise<{
    totalActivities: number;
    totalHours: number;
    activities: Array<{
      activities_id: number;
      activities_name: string;
      activities_hour: number;
    }>;
  }> {
    const details = await this.findByPlanWorkingHourId(planWorkingHourId);

    const totalActivities = details.length;
    const totalHours = details.reduce(
      (sum, detail) => sum + (detail.activities_hour || 0),
      0,
    );

    const activities = details.map((detail) => ({
      activities_id: detail.activities_id,
      activities_name: detail.activities?.name || 'Unknown',
      activities_hour: detail.activities_hour || 0,
    }));

    return {
      totalActivities,
      totalHours,
      activities,
    };
  }
}
