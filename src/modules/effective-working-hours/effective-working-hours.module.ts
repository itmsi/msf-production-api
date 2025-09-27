import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EffectiveWorkingHoursController } from './effective-working-hours.controller';
import { EffectiveWorkingHoursService } from './effective-working-hours.service';
import { EffectiveWorkingHours } from './entities/effective-working-hours.entity';
import { S3Module } from 'src/integrations/s3/s3.module';
import { Population } from '../population/entities/population.entity';
import { Activities } from '../activities/entities/activities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EffectiveWorkingHours, Population, Activities]), S3Module],
  controllers: [EffectiveWorkingHoursController],
  providers: [EffectiveWorkingHoursService],
  exports: [EffectiveWorkingHoursService],
})
export class EffectiveWorkingHoursModule {}
