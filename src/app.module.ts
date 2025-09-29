import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { SitesModule } from './modules/sites/sites.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { DepartmentModule } from './modules/department/department.module';
import { BrandModule } from './modules/brand/brand.module';
import { UnitTypeModule } from './modules/unit-type/unit-type.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { PopulationModule } from './modules/population/population.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MenuModule } from './modules/menu/menu.module';
import { MenuHasPermissionModule } from './modules/menu-has-permission/menu-has-permission.module';
import { RoleHasPermissionModule } from './modules/role-has-permission/role-has-permission.module';
import { UserRoleModule } from './modules/user-role/user-role.module';
import { PlanWorkingHourModule } from './modules/plan-working-hour/plan-working-hour.module';
import { BargeModule } from './modules/barge/barge.module';
import { DailyPlanProductionModule } from './modules/daily-plan-production/daily-plan-production.module';
import { ParentPlanProductionModule } from './modules/parent-plan-production/parent-plan-production.module';
import { PlanProductionModule } from './modules/plan-production/plan-production.module';
import { BaseDataProductionModule } from './modules/base-data-production/base-data-production.module';
import { EffectiveWorkingHoursModule } from './modules/effective-working-hours/effective-working-hours.module';
import { BargeFormModule } from './modules/barge-form/barge-form.module';
import { FuelConsumptionModule } from './modules/fuel-consumption/fuel-consumption.module';
import { HaulingListModule } from './modules/hauling-list/hauling-list.module';
import { HaulingProblemModule } from './modules/hauling-problem/hauling-problem.module';
import { BargingListModule } from './modules/barging-list/barging-list.module';
import { BargingProblemModule } from './modules/barging-problem/barging-problem.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SettingDashboardModule } from './modules/setting-dashboard/setting-dashboard.module';
import { SummaryProductionModule } from './modules/summary-production/summary-production.module';
import { DailySummaryProductionModule } from './modules/daily-summary-production/daily-summary-production.module';
import { MtdProductionModule } from './modules/control-production/mtd-production.module';
import { AnalysisHaulingBargingModule } from './modules/analysis-hauling-barging/analysis-hauling-barging.module';
import { MtdWorkHourModule } from './modules/mtd-work-hour/mtd-work-hour.module';
import { ControlDayWorkHourModule } from './modules/control-day-work-hour/control-day-work-hour.module';
import { S3Module } from './integrations/s3/s3.module';
import { SshTunnelService } from './common/services/ssh-tunnel.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbHitServer = configService.get<string>('DB_HIT_SERVER', 'OFF').toUpperCase();

        if (dbHitServer === 'ON') {
          // Wait for SSH tunnel to be ready for server database
          const sshTunnelService = new SshTunnelService(configService);
          await sshTunnelService.onModuleInit();

          return {
            type: 'postgres',
            host: process.env.POSTGRES_HOST || '127.0.0.1',
            port: parseInt(process.env.POSTGRES_PORT || '6543'),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'],
            synchronize: false,
          };
        } else {
          // Use local database configuration
          return {
            type: 'postgres',
            host: process.env.POSTGRES_HOST || 'localhost',
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
            username: process.env.POSTGRES_USER || 'falaqmsi',
            password: process.env.POSTGRES_PASSWORD || '',
            database: process.env.POSTGRES_DB || 'msf_production',
            entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'],
            synchronize: false,
          };
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    SitesModule,
    EmployeeModule,
    DepartmentModule,
    BrandModule,
    UnitTypeModule,
    ActivitiesModule,
    PopulationModule,
    PermissionModule,
    MenuModule,
    MenuHasPermissionModule,
    RoleHasPermissionModule,
    UserRoleModule,
    PlanWorkingHourModule,
    BargeModule,
    DailyPlanProductionModule,
    ParentPlanProductionModule,
    PlanProductionModule,
    BaseDataProductionModule,
    EffectiveWorkingHoursModule,
    BargeFormModule,
    FuelConsumptionModule,
    HaulingListModule,
    HaulingProblemModule,
    BargingListModule,
    BargingProblemModule,
    DashboardModule,
    SettingDashboardModule,
    SummaryProductionModule,
    DailySummaryProductionModule,
    MtdProductionModule,
    AnalysisHaulingBargingModule,
    MtdWorkHourModule,
    ControlDayWorkHourModule,
    S3Module,
  ],
  providers: [],
})
export class AppModule {}
