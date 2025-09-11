import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanProduction } from './entities/plan-production.entity';
import { ParentPlanProduction } from '../parent-plan-production/entities/parent-plan-production.entity';

@Injectable()
export class PlanProductionService {
  constructor(
    @InjectRepository(PlanProduction)
    private readonly planProductionRepository: Repository<PlanProduction>,
    @InjectRepository(ParentPlanProduction)
    private readonly parentPlanProductionRepository: Repository<ParentPlanProduction>,
  ) {}

  async findAll() {
    return await this.planProductionRepository.find({
      relations: ['parentPlanProduction'],
    });
  }

  async findOne(id: number) {
    return await this.planProductionRepository.findOne({
      where: { id },
      relations: ['parentPlanProduction'],
    });
  }
}
