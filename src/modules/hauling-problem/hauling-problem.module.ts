import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HaulingProblem } from './entities/hauling-problem.entity';
import { Activities } from '../activities/entities/activities.entity';
import { Sites } from '../sites/entities/sites.entity';
import { HaulingProblemController } from './hauling-problem.controller';
import { HaulingProblemService } from './hauling-problem.service';

@Module({
  imports: [TypeOrmModule.forFeature([HaulingProblem, Activities, Sites])],
  controllers: [HaulingProblemController],
  providers: [HaulingProblemService],
  exports: [TypeOrmModule, HaulingProblemService],
})
export class HaulingProblemModule {}
