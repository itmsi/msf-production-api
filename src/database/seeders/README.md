# Database Seeders

Dokumentasi untuk sistem seeder database MSF Production API.

## Overview

Sistem seeder ini dirancang untuk mengisi database dengan data awal yang diperlukan untuk pengembangan dan testing. Seeder dijalankan secara berurutan sesuai dengan dependensi antar tabel.

## Struktur Seeder

### 1. Sites Seeder (`sites.seeder.ts`)
- **Tabel**: `m_sites`
- **Dependensi**: Tidak ada
- **Data**: 5 lokasi site di Indonesia (Jakarta, Surabaya, Medan, Makassar, Semarang)
- **Koordinat**: Longitude dan latitude untuk setiap site

### 2. Roles Seeder (`roles.seeder.ts`)
- **Tabel**: `m_role`
- **Dependensi**: Tidak ada
- **Data**: 7 role (Super Admin, Admin, Manager, Supervisor, Operator, Staff, Viewer)
- **Struktur**: role_code dan position_name

### 3. Employee Seeder (`employee.seeder.ts`)
- **Tabel**: `m_employee`
- **Dependensi**: Tidak ada
- **Data**: 8 karyawan dengan berbagai department dan position
- **Status**: active, inactive, resign, on-leave

### 4. Users Seeder (`users.seeder.ts`)
- **Tabel**: `m_user`
- **Dependensi**: Sites, Roles, Employees
- **Data**: 7 user dengan berbagai role dan site
- **Password**: Semua password di-hash menggunakan bcrypt

### 5. Unit Type Seeder (`unit-type.seeder.ts`)
- **Tabel**: `m_unit_type`
- **Dependensi**: Tidak ada
- **Data**: 8 tipe unit (Excavator, Bulldozer, Crane, Truck, dll)
- **Kategori**: Heavy Equipment, Lifting Equipment, Transport, dll

### 6. Unit Variant Seeder (`unit-variant.seeder.ts`)
- **Tabel**: `m_unit_variant`
- **Dependensi**: Unit Types
- **Data**: 8 varian unit dengan brand dan model spesifik
- **Brand**: Komatsu, Hitachi, Caterpillar, Volvo, dll

### 7. Activities Seeder (`activities.seeder.ts`)
- **Tabel**: `m_activities`
- **Dependensi**: Tidak ada
- **Data**: 10 aktivitas (Excavation, Loading, Transportation, dll)
- **Durasi**: Estimasi waktu dalam jam

### 8. Operation Points Seeder (`operation-points.seeder.ts`)
- **Tabel**: `m_operation_points`
- **Dependensi**: Tidak ada
- **Data**: 8 titik operasi dengan koordinat
- **Zona**: North, East, South, West, Central

### 9. Barge Seeder (`barge.seeder.ts`)
- **Tabel**: `m_barge`
- **Dependensi**: Tidak ada
- **Data**: 6 barge dengan berbagai kapasitas
- **Kapasitas**: 100-1000 ton

### 10. Population Seeder (`population.seeder.ts`)
- **Tabel**: `m_population`
- **Dependensi**: Tidak ada
- **Data**: 5 komunitas lokal dengan informasi kontak
- **Lokasi**: Berbagai area di Indonesia

### 11. Engine Brand Seeder (`engine-brand.seeder.ts`)
- **Tabel**: `tb_m_engine_brand`
- **Dependensi**: Tidak ada
- **Data**: 8 brand engine terkenal
- **Negara**: USA, Japan, Germany, Sweden, UK

## Cara Menjalankan

### 1. Jalankan Semua Seeder
```bash
npm run seed
```

### 2. Jalankan Seeder Individual
```typescript
import { SitesSeeder } from './seeders/sites.seeder';

const sitesSeeder = new SitesSeeder(dataSource);
await sitesSeeder.run();
```

## Urutan Seeding

Seeder dijalankan dalam urutan berikut untuk menghindari konflik dependensi:

1. **Sites** (no dependencies)
2. **Roles** (no dependencies)
3. **Employees** (no dependencies)
4. **Users** (depends on Sites, Roles, Employees)
5. **Unit Types** (no dependencies)
6. **Unit Variants** (depends on Unit Types)
7. **Activities** (no dependencies)
8. **Operation Points** (no dependencies)
9. **Barges** (no dependencies)
10. **Population** (no dependencies)
11. **Engine Brands** (no dependencies)

## Data Default

### User Credentials
- **superadmin** / superadmin123
- **admin** / admin123
- **manager** / manager123
- **staff1** / staff123
- **staff2** / staff123
- **operator1** / operator123
- **viewer1** / viewer123

### Site Locations
- Jakarta: 106.8456, -6.2088
- Surabaya: 112.7508, -7.2575
- Medan: 98.6722, 3.5952
- Makassar: 119.4361, -5.1477
- Semarang: 110.4203, -6.9932

## Fitur

- **Duplicate Check**: Seeder akan mengecek data yang sudah ada sebelum insert
- **Error Handling**: Logging error yang detail jika terjadi masalah
- **Progress Tracking**: Progress bar dan status untuk setiap seeder
- **Dependency Management**: Urutan seeding yang benar sesuai dependensi
- **Data Validation**: Data yang konsisten dan valid

## Troubleshooting

### Error: "Required roles not found"
- Pastikan seeder roles sudah dijalankan terlebih dahulu

### Error: "Required sites not found"
- Pastikan seeder sites sudah dijalankan terlebih dahulu

### Error: "No employees found"
- Pastikan seeder employees sudah dijalankan terlebih dahulu

### Error: Database Connection
- Periksa environment variables (POSTGRES_HOST, POSTGRES_USER, dll)
- Pastikan database server berjalan
- Periksa kredensial database

## Customization

Untuk menambahkan data baru atau mengubah data existing:

1. Edit file seeder yang sesuai
2. Tambahkan data baru ke array data
3. Jalankan seeder lagi (data yang sudah ada tidak akan di-duplicate)

## Notes

- Semua password di-hash menggunakan bcrypt dengan salt rounds 10
- Koordinat menggunakan format POINT(longitude latitude)
- Status default untuk semua data adalah `active`
- Timestamp otomatis menggunakan `CURRENT_TIMESTAMP`
