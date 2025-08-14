import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { SitesModule } from './modules/sites/sites.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { BrandModule } from './modules/brand/brand.module';
import { UnitTypeModule } from './modules/unit-type/unit-type.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { PopulationModule } from './modules/population/population.module';
import { PermissionModule } from './modules/permission/permission.module';
import { MenuModule } from './modules/menu/menu.module';
import { MenuHasPermissionModule } from './modules/menu-has-permission/menu-has-permission.module';
import { RoleHasPermissionModule } from './modules/role-has-permission/role-has-permission.module';
import { UserRoleModule } from './modules/user-role/user-role.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    SitesModule,
    EmployeeModule,
    BrandModule,
    UnitTypeModule,
    ActivitiesModule,
    PopulationModule,
    PermissionModule,
    MenuModule,
    MenuHasPermissionModule,
    RoleHasPermissionModule,
    UserRoleModule,
  ],
})
export class AppModule {}
