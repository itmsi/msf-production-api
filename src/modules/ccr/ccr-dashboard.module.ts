import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Population } from '../population/entities/population.entity';
import { EffectiveWorkingHours } from '../effective-working-hours/entities/effective-working-hours.entity';
import { CcrDashboardService } from './ccr-dashboard.service';
import { CcrDashboardController } from './ccr-dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Population, EffectiveWorkingHours])],
  controllers: [CcrDashboardController],
  providers: [CcrDashboardService],
  exports: [CcrDashboardService],
})
export class CcrDashboardModule {}
