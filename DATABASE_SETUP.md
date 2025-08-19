# Database Setup Guide

Dokumen ini menjelaskan cara setup database untuk MSF Production API.

## Struktur Database

### Tabel Utama: `r_plan_working_hour`
Tabel ini berisi rencana jam kerja dengan struktur yang sudah diperbarui:
- `id`: Primary Key
- `plan_date`: Tanggal rencana
- `is_calender_day`: Apakah hari kalender
- `is_holiday_day`: Apakah hari libur
- `is_scheduled_day`: Apakah hari terjadwal
- `working_hour`: Jam kerja (float)
- `working_day_longshift`: Hari kerja shift panjang
- `working_hour_longshift`: Jam kerja shift panjang
- `mohh_per_month`: MOHH per bulan (float)
- `createdAt`, `updatedAt`, `deletedAt`: Timestamp

### Tabel Detail: `r_plan_working_hour_detail`
Tabel baru untuk menyimpan detail aktivitas per rencana jam kerja:
- `id`: Primary Key
- `plant_working_hour_id`: Foreign Key ke `r_plan_working_hour`
- `activities_id`: Foreign Key ke `m_activities`
- `activities_hour`: Jam aktivitas
- `createdAt`, `updatedAt`, `deletedAt`: Timestamp

## Relasi Database

```
r_plan_working_hour (1) ←→ (N) r_plan_working_hour_detail
r_plan_working_hour_detail (N) ←→ (1) m_activities
```

## Setup Database

### 1. Jalankan Migrasi

Migrasi akan membuat struktur tabel yang diperlukan:

```bash
npm run migration:run
```

### 2. Jalankan Seeding

Seeder akan mengisi data awal:

```bash
npm run seed:complete
```

### 3. Setup Lengkap (Migrasi + Seeding)

Untuk menjalankan migrasi dan seeding sekaligus:

```bash
npm run db:setup
```

## Script yang Tersedia

- `npm run migration:run`: Jalankan semua migrasi
- `npm run migration:revert`: Rollback migrasi terakhir
- `npm run seed:complete`: Jalankan semua seeder
- `npm run db:setup`: Setup lengkap database

## Urutan Migrasi

1. **1700000000028-UpdateTableRPlanWorkingHour.ts**: Update tabel utama
2. **1700000000029-CreateTableRPlanWorkingHourDetail.ts**: Buat tabel detail

## Urutan Seeding

1. Basic data (sites, roles, employees, brands, activities)
2. Dependent data (unit types, operation points, barge, population)
3. Plan working hour data
4. Plan working hour detail data
5. Permission & menu system
6. User & access control

## Troubleshooting

### Error: "Table already exists"
- Pastikan migrasi belum dijalankan sebelumnya
- Gunakan `npm run migration:revert` untuk rollback

### Error: "Foreign key constraint fails"
- Pastikan tabel parent sudah dibuat
- Jalankan migrasi sesuai urutan

### Error: "Connection refused"
- Periksa konfigurasi database di `.env`
- Pastikan database server berjalan

## Catatan Penting

- **Jangan hapus file migrasi** yang sudah dijalankan di production
- **Backup database** sebelum menjalankan migrasi di production
- **Test migrasi** di environment development terlebih dahulu
- Pastikan semua dependency (seperti tabel `m_activities`) sudah ada sebelum menjalankan migrasi
