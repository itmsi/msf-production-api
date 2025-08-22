import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyPlanProductionService } from './daily-plan-production.service';
import { DailyPlanProductionController } from './daily-plan-production.controller';
import { PlanProduction } from '../plan-production/entities/plan-production.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanProduction])],
  controllers: [DailyPlanProductionController],
  providers: [DailyPlanProductionService],
  exports: [DailyPlanProductionService],
})
export class DailyPlanProductionModule {}
