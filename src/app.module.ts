import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { SitesModule } from './master/sites/sites.module';
import { EmployeeModule } from './master/employee/employee.module';
import { BrandModule } from './master/brand/brand.module';
import { UnitTypeModule } from './master/unit-type/unit-type.module';
import { ActivitiesModule } from './master/activities/activities.module';
import { PopulationModule } from './master/population/population.module';

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
        entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}', __dirname + '/master/**/entities/*.entity{.ts,.js}'],
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
  ],
})
export class AppModule {}
