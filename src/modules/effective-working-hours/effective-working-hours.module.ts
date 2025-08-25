import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EffectiveWorkingHoursController } from './effective-working-hours.controller';
import { EffectiveWorkingHoursService } from './effective-working-hours.service';
import { EffectiveWorkingHours } from './entities/effective-working-hours.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EffectiveWorkingHours])],
  controllers: [EffectiveWorkingHoursController],
  providers: [EffectiveWorkingHoursService],
  exports: [EffectiveWorkingHoursService],
})
export class EffectiveWorkingHoursModule {}
