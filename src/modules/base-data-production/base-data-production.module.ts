import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseDataProductionService } from './base-data-production.service';
import { BaseDataProductionController } from './base-data-production.controller';
import { ParentBaseDataPro, BaseDataPro } from './entities';
import { UnitType } from '../unit-type/entities/unit-type.entity';
import { Employee } from '../employee/entities/employee.entity';
import { Sites } from '../sites/entities/sites.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParentBaseDataPro, BaseDataPro, UnitType, Employee, Sites]),
  ],
  controllers: [BaseDataProductionController],
  providers: [BaseDataProductionService],
  exports: [BaseDataProductionService],
})
export class BaseDataProductionModule {}
