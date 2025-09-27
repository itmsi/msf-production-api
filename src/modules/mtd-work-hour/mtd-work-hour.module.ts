import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MtdWorkHour } from './entities/mtd-work-hour.entity';
import { Population } from '../population/entities/population.entity';
import { EffectiveWorkingHours } from '../effective-working-hours/entities/effective-working-hours.entity';
import { MtdWorkHourService } from './mtd-work-hour.service';
import { MtdWorkHourController } from './mtd-work-hour.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MtdWorkHour, Population, EffectiveWorkingHours])],
  controllers: [MtdWorkHourController],
  providers: [MtdWorkHourService],
  exports: [MtdWorkHourService],
})
export class MtdWorkHourModule {}
