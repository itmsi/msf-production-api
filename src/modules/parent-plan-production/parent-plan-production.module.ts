import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentPlanProductionService } from './parent-plan-production.service';
import { ParentPlanProductionController } from './parent-plan-production.controller';
import { ParentPlanProduction } from './entities/parent-plan-production.entity';
import { PlanProduction } from '../plan-production/entities/plan-production.entity';
import { S3Module } from 'src/integrations/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParentPlanProduction, PlanProduction]),
    S3Module,
  ],
  controllers: [ParentPlanProductionController],
  providers: [ParentPlanProductionService],
  exports: [ParentPlanProductionService],
})
export class ParentPlanProductionModule {}
