import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseDataProductionService } from './base-data-production.service';
import { BaseDataProductionController } from './base-data-production.controller';
import { ParentBaseDataPro, BaseDataPro } from './entities';
import { Population } from '../population/entities/population.entity';
import { Employee } from '../employee/entities/employee.entity';
import { Sites } from '../sites/entities/sites.entity';
import { Barge } from '../barge/entities/barge.entity';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParentBaseDataPro, BaseDataPro, Population, Employee, Sites, Barge, OperationPoints]),
  ],
  controllers: [BaseDataProductionController],
  providers: [BaseDataProductionService],
  exports: [BaseDataProductionService],
})
export class BaseDataProductionModule {}
