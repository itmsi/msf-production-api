import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, SelectQueryBuilder } from 'typeorm';
import { EffectiveWorkingHours, LossType, Shift } from './entities/effective-working-hours.entity';
import {
  CreateEffectiveWorkingHoursDto,
  UpdateEffectiveWorkingHoursDto,
  QueryEffectiveWorkingHoursDto,
  EffectiveWorkingHoursResponseDto,
} from './dto/effective-working-hours.dto';
import { successResponseWithMeta } from '../../common/helpers/response.helper';

@Injectable()
export class EffectiveWorkingHoursService {
  constructor(
    @InjectRepository(EffectiveWorkingHours)
    private readonly effectiveWorkingHoursRepository: Repository<EffectiveWorkingHours>,
  ) {}

  async create(createDto: CreateEffectiveWorkingHoursDto): Promise<EffectiveWorkingHours> {
    const effectiveWorkingHours = this.effectiveWorkingHoursRepository.create(createDto);
    
    // Calculate duration if start and stop are provided
    if (createDto.start && createDto.stop) {
      const startTime = new Date(createDto.start);
      const stopTime = new Date(createDto.stop);
      const durationInMinutes = (stopTime.getTime() - startTime.getTime()) / (1000 * 60);
      effectiveWorkingHours.duration = durationInMinutes;
    }

    return await this.effectiveWorkingHoursRepository.save(effectiveWorkingHours);
  }

  async findAll(query: QueryEffectiveWorkingHoursDto) {
    const { startDate, endDate, lossType, keyword, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};
    if (startDate && endDate) {
      whereConditions.dateActivity = Between(startDate, endDate);
    }
    if (lossType) {
      whereConditions.lossType = lossType;
    }

    // Get total count
    const total = await this.effectiveWorkingHoursRepository.count({
      where: whereConditions,
    });

    // Get data with relations
    const results = await this.effectiveWorkingHoursRepository.find({
      where: whereConditions,
      relations: ['population', 'population.unitType', 'activities'],
      skip,
      take: limit,
    });

    // Transform data to response format
    const data: EffectiveWorkingHoursResponseDto[] = results.map((result) => ({
      id: result.id,
      dateActivity: result.dateActivity, // Already in YYYY-MM-DD format
      lossType: this.mapLossType(result.lossType),
      shift: result.shift,
      unit: `${result.population?.unitType?.unit_name || ''}-${result.population?.unitType?.type_name || ''}-${result.population?.unitType?.model_name || ''}`,
      activity: result.activities?.name || '',
      description: result.description || '',
      start: result.start instanceof Date ? result.start.toISOString() : (result.start || ''),
      end: result.stop instanceof Date ? result.stop.toISOString() : (result.stop || ''),
      duration: result.duration || 0,
    }));

    // Apply keyword filter if provided
    let filteredData = data;
    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase();
      filteredData = data.filter(item =>
        item.description.toLowerCase().includes(lowercaseKeyword) ||
        item.activity.toLowerCase().includes(lowercaseKeyword) ||
        item.unit.toLowerCase().includes(lowercaseKeyword)
      );
    }

    return successResponseWithMeta(filteredData, 'Data retrieved successfully', 200, {
      total,
      page,
      limit,
    });
  }

  async findOne(id: number): Promise<EffectiveWorkingHours> {
    const effectiveWorkingHours = await this.effectiveWorkingHoursRepository.findOne({
      where: { id },
      relations: ['population', 'population.unitType', 'activities'],
    });

    if (!effectiveWorkingHours) {
      throw new NotFoundException(`Effective working hours with ID ${id} not found`);
    }

    return effectiveWorkingHours;
  }

  async update(id: number, updateDto: UpdateEffectiveWorkingHoursDto): Promise<EffectiveWorkingHours> {
    const effectiveWorkingHours = await this.findOne(id);

    // Calculate duration if start and stop are provided
    if (updateDto.start && updateDto.stop) {
      const startTime = new Date(updateDto.start);
      const stopTime = new Date(updateDto.stop);
      const durationInMinutes = (stopTime.getTime() - startTime.getTime()) / (1000 * 60);
      updateDto['duration'] = durationInMinutes;
    }

    Object.assign(effectiveWorkingHours, updateDto);
    return await this.effectiveWorkingHoursRepository.save(effectiveWorkingHours);
  }

  async remove(id: number): Promise<void> {
    const effectiveWorkingHours = await this.findOne(id);
    await this.effectiveWorkingHoursRepository.softDelete(id);
  }

  private mapLossType(lossType: string): string {
    switch (lossType) {
      case 'STB':
        return 'StandBy';
      case 'BD':
        return 'BreakDown';
      default:
        return lossType;
    }
  }
}
