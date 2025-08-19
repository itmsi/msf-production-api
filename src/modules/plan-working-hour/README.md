# Plan Working Hour Module

Modul ini menangani operasi CRUD untuk tabel `r_plan_working_hour` dan `r_plan_working_hour_detail` yang berisi rencana jam kerja.

## Struktur Tabel

### Tabel Utama: `r_plan_working_hour`

| Kolom | Tipe Data | Deskripsi |
|-------|-----------|-----------|
| `id` | int | Primary Key, auto increment |
| `plan_date` | date | Tanggal rencana |
| `is_calender_day` | bool | Apakah hari kalender |
| `is_holiday_day` | bool | Apakah hari libur |
| `is_scheduled_day` | bool | Apakah hari terjadwal |
| `working_hour` | float | Jam kerja |
| `working_day_longshift` | int | Hari kerja shift panjang |
| `working_hour_longshift` | int | Jam kerja shift panjang |
| `mohh_per_month` | float | MOHH per bulan |
| `createdAt` | date | Waktu pembuatan |
| `updatedAt` | date | Waktu update |
| `deletedAt` | date | Waktu soft delete |

### Tabel Detail: `r_plan_working_hour_detail`

| Kolom | Tipe Data | Deskripsi |
|-------|-----------|-----------|
| `id` | int | Primary Key, auto increment |
| `plant_working_hour_id` | int | Foreign Key ke tabel r_plan_working_hour |
| `activities_id` | int | Foreign Key ke tabel m_activities |
| `activities_hour` | float | Jam aktivitas |
| `createdAt` | date | Waktu pembuatan |
| `updatedAt` | date | Waktu update |
| `deletedAt` | date | Waktu soft delete |

## Fitur

- **CRUD Operations**: Create, Read, Update, Delete plan working hour dan detail
- **Query by Date Range**: Mencari data berdasarkan rentang tanggal
- **Query by Activities**: Mencari data berdasarkan ID aktivitas
- **Working Hours Summary**: Menghitung ringkasan jam kerja
- **Soft Delete**: Data tidak benar-benar dihapus dari database
- **Relasi One-to-Many**: Satu plan working hour dapat memiliki banyak detail aktivitas

## API Endpoints

### POST `/plan-working-hour`
Membuat data plan working hour baru.

**Body:**
```json
{
  "plan_date": "2024-01-15",
  "is_calender_day": true,
  "is_holiday_day": false,
  "is_scheduled_day": true,
  "working_hour": 8.0,
  "working_day_longshift": 0,
  "working_hour_longshift": 0,
  "mohh_per_month": 160.0
}
```

### POST `/plan-working-hour-detail`
Membuat data detail plan working hour baru.

**Body:**
```json
{
  "plant_working_hour_id": 1,
  "activities_id": 1,
  "activities_hour": 6.0
}
```

### GET `/plan-working-hour`
Mengambil semua data plan working hour dengan filter opsional.

**Query Parameters:**
- `plan_date`: Filter berdasarkan tanggal
- `is_calender_day`: Filter berdasarkan hari kalender
- `is_holiday_day`: Filter berdasarkan hari libur
- `is_scheduled_day`: Filter berdasarkan hari terjadwal

### GET `/plan-working-hour/:id`
Mengambil data plan working hour berdasarkan ID.

### GET `/plan-working-hour/summary`
Mengambil ringkasan jam kerja berdasarkan rentang tanggal.

**Query Parameters:**
- `startDate`: Tanggal mulai (format: YYYY-MM-DD)
- `endDate`: Tanggal akhir (format: YYYY-MM-DD)

### GET `/plan-working-hour/date-range`
Mengambil data plan working hour berdasarkan rentang tanggal.

**Query Parameters:**
- `startDate`: Tanggal mulai (format: YYYY-MM-DD)
- `endDate`: Tanggal akhir (format: YYYY-MM-DD)

### PATCH `/plan-working-hour/:id`
Mengupdate data plan working hour berdasarkan ID.

### DELETE `/plan-working-hour/:id`
Menghapus data plan working hour berdasarkan ID (soft delete).

## Relasi

- **PlanWorkingHour** ↔ **PlanWorkingHourDetail**: One-to-Many
- **PlanWorkingHourDetail** ↔ **Activities**: Many-to-One dengan tabel `m_activities`

## Validasi

Semua input akan divalidasi menggunakan class-validator:
- `plan_date`: Harus berupa tanggal yang valid
- `working_hour`, `mohh_per_month`, `activities_hour`: Harus berupa angka float
- `working_day_longshift`, `working_hour_longshift`, `plant_working_hour_id`, `activities_id`: Harus berupa angka integer
- `is_calender_day`, `is_holiday_day`, `is_scheduled_day`: Harus berupa boolean

## Keamanan

Semua endpoint dilindungi dengan JWT Authentication Guard.
