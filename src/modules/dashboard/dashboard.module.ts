import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FormulaService } from '../../common/services/formula.service';
import { ProductionFormulaService } from '../../common/services/production-formula.service';
import { AnalysisHaulingBargingModule } from '../analysis-hauling-barging/analysis-hauling-barging.module';
import { PlanProduction } from '../plan-production/entities/plan-production.entity';
import { ParentPlanProduction } from '../parent-plan-production/entities/parent-plan-production.entity';
import { BaseDataPro } from '../base-data-production/entities/base-data-pro.entity';
import { EffectiveWorkingHours } from '../effective-working-hours/entities/effective-working-hours.entity';
import { Activities } from '../activities/entities/activities.entity';
import { ParentPlanWorkingHour } from '../plan-working-hour/entities/parent-plan-working-hour.entity';
import { HaulingList } from '../hauling-list';
import { HaulingProblem } from '../hauling-problem';
import { BargingList } from '../barging-list/entities/barging-list.entity';
import { BargingProblem } from '../barging-problem';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';
import { Population } from '../population';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanProduction,
      ParentPlanProduction,
      BaseDataPro,
      EffectiveWorkingHours,
      Activities,
      ParentPlanWorkingHour,
      HaulingList,
      HaulingProblem,
      BargingList,
      BargingProblem,
      OperationPoints,
      Population,
    ]),
    AnalysisHaulingBargingModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, FormulaService, ProductionFormulaService],
  exports: [DashboardService],
})
export class DashboardModule {}
