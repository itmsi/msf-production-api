import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentPlanProductionService } from './parent-plan-production.service';
import { ParentPlanProductionController } from './parent-plan-production.controller';
import { ParentPlanProduction } from './entities/parent-plan-production.entity';
import { PlanProduction } from '../plan-production/entities/plan-production.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParentPlanProduction, PlanProduction]),
  ],
  controllers: [ParentPlanProductionController],
  providers: [ParentPlanProductionService],
  exports: [ParentPlanProductionService],
})
export class ParentPlanProductionModule {}
