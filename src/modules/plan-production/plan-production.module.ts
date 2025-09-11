import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanProductionService } from './plan-production.service';
import { PlanProductionController } from './plan-production.controller';
import { PlanProduction } from './entities/plan-production.entity';
import { ParentPlanProduction } from '../parent-plan-production/entities/parent-plan-production.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanProduction, ParentPlanProduction])],
  controllers: [PlanProductionController],
  providers: [PlanProductionService],
  exports: [PlanProductionService],
})
export class PlanProductionModule {}
