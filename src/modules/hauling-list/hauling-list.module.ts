import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HaulingListController } from './hauling-list.controller';
import { HaulingListService } from './hauling-list.service';
import { HaulingList } from './entities/hauling-list.entity';
import { Population } from '../population/entities/population.entity';
import { Sites } from '../sites/entities/sites.entity';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';
import { Barge } from '../barge/entities/barge.entity';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { S3Module } from 'src/integrations/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([HaulingList, Population, Sites, OperationPoints, Barge]), S3Module],
  controllers: [HaulingListController],
  providers: [HaulingListService, JwtAuthGuard],
  exports: [HaulingListService],
})
export class HaulingListModule {}
