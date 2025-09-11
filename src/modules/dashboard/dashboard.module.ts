import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { FormulaService } from '../../common/services/formula.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, FormulaService],
  exports: [DashboardService],
})
export class DashboardModule {}
