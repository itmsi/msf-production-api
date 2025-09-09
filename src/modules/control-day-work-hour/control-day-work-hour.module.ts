import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControlDayWorkHour } from './entities/control-day-work-hour.entity';
import { ControlDayWorkHourService } from './control-day-work-hour.service';
import { ControlDayWorkHourController } from './control-day-work-hour.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ControlDayWorkHour])],
  controllers: [ControlDayWorkHourController],
  providers: [ControlDayWorkHourService],
  exports: [ControlDayWorkHourService],
})
export class ControlDayWorkHourModule {}
