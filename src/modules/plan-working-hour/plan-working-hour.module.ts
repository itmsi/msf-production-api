import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanWorkingHourService } from './plan-working-hour.service';
import { PlanWorkingHourController } from './plan-working-hour.controller';
import { PlanWorkingHourDetailService } from './plan-working-hour-detail.service';
import { PlanWorkingHourDetailController } from './plan-working-hour-detail.controller';
import { ParentPlanWorkingHourService } from './parent-plan-working-hour.service';
import { ParentPlanWorkingHourController } from './parent-plan-working-hour.controller';
import { ParentPlanWorkingHour } from './entities/parent-plan-working-hour.entity';
import { PlanWorkingHour } from './entities/plan-working-hour.entity';
import { PlanWorkingHourDetail } from './entities/plan-working-hour-detail.entity';
import { Activities } from '../activities/entities/activities.entity';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ParentPlanWorkingHour,
      PlanWorkingHour,
      PlanWorkingHourDetail,
      Activities,
    ]),
    ActivitiesModule,
  ],
  controllers: [
    PlanWorkingHourController,
    PlanWorkingHourDetailController,
    ParentPlanWorkingHourController,
  ],
  providers: [
    PlanWorkingHourService,
    PlanWorkingHourDetailService,
    ParentPlanWorkingHourService,
  ],
  exports: [
    PlanWorkingHourService,
    PlanWorkingHourDetailService,
    ParentPlanWorkingHourService,
  ],
})
export class PlanWorkingHourModule {}
