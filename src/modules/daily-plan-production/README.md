# Daily Plan Production Module

Module ini menangani operasi CRUD untuk tabel `r_plan_production` dengan logika bisnis yang kompleks.

## Fitur Utama

### 1. Validasi Tanggal
- Mengecek apakah `plan_date` sudah ada di database sebelum membuat data baru
- Mencegah duplikasi data berdasarkan tanggal

### 2. Perhitungan Otomatis
- `sr_target`: `ob_target / ore_target`
- `shift_ob_target`: `ob_target / 2`
- `shift_ore_target`: `ore_target / 2`
- `shift_quarrt`: `quarry / 2`
- `shift_sr_target`: `shift_ob_target / shift_ore_target`
- `remaining_stock`: `old_stock_global - ore_shipment_target + ore_target`

### 3. Logika Boolean
- `is_calender_day`: `true` jika `plan_date` terisi (bukan 0, null, atau string kosong)
- `is_holiday_day`: `true` jika `plan_date` tidak terisi (0, null, atau string kosong)
- `is_available_day`: `true` jika hari bukan hari minggu

### 4. Old Stock Global
- Mengambil nilai `daily_old_stock` dari data sebelumnya
- Urutkan berdasarkan `plan_date` terbaru
- Jika tidak ada data sebelumnya, nilai default adalah 0

## Endpoint API

### POST `/daily-plan-production`
Membuat daily plan production baru.

**Body Request:**
```json
{
  "plan_date": "2025-01-01",
  "average_day_ewh": 1,
  "average_shift_ewh": 1,
  "ob_target": 1,
  "ore_target": 1,
  "quarry": 1,
  "ore_shipment_target": 1,
  "total_fleet": 1
}
```

### GET `/daily-plan-production`
Mengambil semua data dengan pagination dan filter.

**Query Parameters:**
- `start_date`: Filter tanggal mulai (YYYY-MM-DD)
- `end_date`: Filter tanggal akhir (YYYY-MM-DD)
- `page`: Halaman (default: 1)
- `limit`: Limit per halaman (default: 10)

### GET `/daily-plan-production/:id`
Mengambil data berdasarkan ID.

### PATCH `/daily-plan-production/:id`
Update data berdasarkan ID.

### DELETE `/daily-plan-production/:id`
Soft delete data berdasarkan ID.

## Struktur Database

Module ini menggunakan tabel `r_plan_production` dengan kolom-kolom berikut:

- `id`: Primary Key
- `plan_date`: Tanggal rencana
- `is_calender_day`: Apakah hari kalender
- `is_holiday_day`: Apakah hari libur
- `is_available_day`: Apakah hari tersedia
- `average_day_ewh`: Rata-rata EWH per hari
- `average_shift_ewh`: Rata-rata EWH per shift
- `ob_target`: Target OB
- `ore_target`: Target ore
- `quarry`: Target quarry
- `sr_target`: Target SR (dihitung otomatis)
- `ore_shipment_target`: Target pengiriman ore
- `daily_old_stock`: Stock lama harian
- `shift_ob_target`: Target OB per shift (dihitung otomatis)
- `shift_ore_target`: Target ore per shift (dihitung otomatis)
- `shift_quarrt`: Target quarry per shift (dihitung otomatis)
- `shift_sr_target`: Target SR per shift (dihitung otomatis)
- `total_fleet`: Total armada
- `remaining_stock`: Stock tersisa (dihitung otomatis)
- `createdAt`, `updatedAt`, `deletedAt`: Timestamp

## Dependencies

- `@nestjs/common`: Framework NestJS
- `@nestjs/typeorm`: Integrasi TypeORM
- `typeorm`: ORM untuk database
- `class-validator`: Validasi DTO
- `class-transformer`: Transformasi data

## Penggunaan

1. Import module ke `app.module.ts`
2. Pastikan database connection sudah dikonfigurasi
3. Jalankan migrasi database jika diperlukan
4. Gunakan endpoint API sesuai kebutuhan

## Contoh Response

### Success Response
```json
{
  "statusCode": 200,
  "message": "Daily plan production berhasil dibuat",
  "data": {
    "id": 1,
    "plan_date": "2025-01-01T00:00:00.000Z",
    "sr_target": 1,
    "daily_old_stock": 0,
    "shift_ob_target": 0.5,
    "shift_ore_target": 0.5,
    "shift_quarrt": 0.5,
    "shift_sr_target": 1,
    "remaining_stock": 0,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Plan date sudah ada dalam database"
}
```
