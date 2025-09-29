import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HaulingProblem } from './entities/hauling-problem.entity';
import { Activities } from '../activities/entities/activities.entity';
import { Sites } from '../sites/entities/sites.entity';
import { HaulingProblemController } from './hauling-problem.controller';
import { HaulingProblemService } from './hauling-problem.service';
import { S3Module } from 'src/integrations/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HaulingProblem, Activities, Sites]),
    S3Module,
  ],
  controllers: [HaulingProblemController],
  providers: [HaulingProblemService],
  exports: [TypeOrmModule, HaulingProblemService],
})
export class HaulingProblemModule {}
