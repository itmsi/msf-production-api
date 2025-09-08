import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { ParentBaseDataPro, BaseDataPro } from '../base-data-production/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ ParentBaseDataPro, BaseDataPro ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}