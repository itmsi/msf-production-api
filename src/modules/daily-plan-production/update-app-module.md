# Cara Menambahkan Daily Plan Production Module ke App Module

Untuk mengintegrasikan module Daily Plan Production ke aplikasi utama, ikuti langkah berikut:

## 1. Import Module di app.module.ts

Tambahkan import berikut di bagian atas file `src/app.module.ts`:

```typescript
import { DailyPlanProductionModule } from './modules/daily-plan-production';
```

## 2. Tambahkan ke Imports Array

Tambahkan `DailyPlanProductionModule` ke array `imports` dalam `AppModule`:

```typescript
@Module({
  imports: [
    // ... module lainnya
    DailyPlanProductionModule,
  ],
  // ... konfigurasi lainnya
})
export class AppModule {}
```

## 3. Contoh Lengkap app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { RolesModule } from './modules/roles';
import { SitesModule } from './modules/sites';
import { EmployeeModule } from './modules/employee';
import { BrandModule } from './modules/brand';
import { UnitTypeModule } from './modules/unit-type';
import { OperationPointsModule } from './modules/operation-points';
import { BargeModule } from './modules/barge';
import { PopulationModule } from './modules/population';
import { ActivitiesModule } from './modules/activities';
import { PlanWorkingHourModule } from './modules/plan-working-hour';
import { DailyPlanProductionModule } from './modules/daily-plan-production'; // Tambahkan ini
import { MenuModule } from './modules/menu';
import { PermissionModule } from './modules/permission';
import { MenuHasPermissionModule } from './modules/menu-has-permission';
import { RoleHasPermissionModule } from './modules/role-has-permission';
import { UserRoleModule } from './modules/user-role';
import { IntegrationsModule } from './integrations';
import { DataSource } from 'typeorm';

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
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    SitesModule,
    EmployeeModule,
    BrandModule,
    UnitTypeModule,
    OperationPointsModule,
    BargeModule,
    PopulationModule,
    ActivitiesModule,
    PlanWorkingHourModule,
    DailyPlanProductionModule, // Tambahkan ini
    MenuModule,
    PermissionModule,
    MenuHasPermissionModule,
    RoleHasPermissionModule,
    UserRoleModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
```

## 4. Verifikasi

Setelah menambahkan module, pastikan:

1. Tidak ada error TypeScript
2. Aplikasi dapat di-compile
3. Module dapat diakses melalui endpoint `/daily-plan-production`

## 5. Testing

Test endpoint dengan Postman atau tools API testing lainnya:

```bash
# Test GET endpoint
curl http://localhost:3000/daily-plan-production

# Test POST endpoint
curl -X POST http://localhost:3000/daily-plan-production \
  -H "Content-Type: application/json" \
  -d '{
    "plan_date": "2025-01-01",
    "average_day_ewh": 1,
    "average_shift_ewh": 1,
    "ob_target": 1,
    "ore_target": 1,
    "quarry": 1,
    "ore_shipment_target": 1,
    "total_fleet": 1
  }'
```

## 6. Troubleshooting

Jika ada error:

1. Pastikan semua import path benar
2. Periksa apakah entity sudah terdaftar di TypeORM
3. Restart aplikasi setelah perubahan
4. Periksa console log untuk error detail
