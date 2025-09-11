import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FormulaService } from '../../common/services/formula.service';
import { ProductionFormulaService } from '../../common/services/production-formula.service';
import { PlanProduction } from '../plan-production/entities/plan-production.entity';
import { ParentPlanProduction } from '../parent-plan-production/entities/parent-plan-production.entity';
import { BaseDataPro } from '../base-data-production/entities/base-data-pro.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanProduction,
      ParentPlanProduction,
      BaseDataPro
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService, FormulaService, ProductionFormulaService],
  exports: [DashboardService],
})
export class DashboardModule {}
