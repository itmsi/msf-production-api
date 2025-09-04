import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingDashboardController } from './setting-dashboard.controller';
import { SettingDashboardService } from './setting-dashboard.service';
import { SettingDashboard } from './entities/setting-dashboard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SettingDashboard])],
  controllers: [SettingDashboardController],
  providers: [SettingDashboardService],
  exports: [SettingDashboardService],
})
export class SettingDashboardModule {}
