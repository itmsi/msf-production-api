import { Module } from '@nestjs/common';
import { MtdProductionController } from './mtd-production.controller';
import { MtdProductionService } from './mtd-production.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Population } from '../population';
import { BaseDataPro, ParentBaseDataPro } from '../base-data-production';
import { EffectiveWorkingHours } from '../effective-working-hours';

@Module({
  imports: [TypeOrmModule.forFeature([Population, BaseDataPro, ParentBaseDataPro, EffectiveWorkingHours])],
  controllers: [MtdProductionController],
  providers: [MtdProductionService],
  exports: [MtdProductionService],
})
export class MtdProductionModule {}
