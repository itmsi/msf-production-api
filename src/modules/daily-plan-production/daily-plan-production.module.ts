import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyPlanProductionService } from './daily-plan-production.service';
import { DailyPlanProductionController } from './daily-plan-production.controller';
import { DailyPlanProduction } from './entities/daily-plan-production.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyPlanProduction])],
  controllers: [DailyPlanProductionController],
  providers: [DailyPlanProductionService],
  exports: [DailyPlanProductionService],
})
export class DailyPlanProductionModule {}
