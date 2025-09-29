import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BargingProblemController } from './barging-problem.controller';
import { BargingProblemService } from './barging-problem.service';
import { BargingProblem } from './entities/barging-problem.entity';
import { Barge } from '../barge/entities/barge.entity';
import { Activities } from '../activities/entities/activities.entity';
import { Sites } from '../sites/entities/sites.entity';
import { S3Module } from 'src/integrations/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([BargingProblem, Barge, Activities, Sites]), S3Module],
  controllers: [BargingProblemController],
  providers: [BargingProblemService],
  exports: [TypeOrmModule, BargingProblemService],
})
export class BargingProblemModule {}
