import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Population } from '../population/entities/population.entity';
import { EffectiveWorkingHours } from '../effective-working-hours/entities/effective-working-hours.entity';
import { ControlDayWorkHourService } from './control-day-work-hour.service';
import { ControlDayWorkHourController } from './control-day-work-hour.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Population, EffectiveWorkingHours])],
  controllers: [ControlDayWorkHourController],
  providers: [ControlDayWorkHourService],
  exports: [ControlDayWorkHourService],
})
export class ControlDayWorkHourModule {}
