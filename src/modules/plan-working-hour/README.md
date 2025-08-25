# Plan Working Hour Module

## Overview
Modul ini menangani manajemen rencana jam kerja untuk operasional perusahaan.

## Endpoints

### Parent Plan Working Hour

#### GET /api/parent-plan-working-hour
Mengambil semua data parent plan working hour dengan perhitungan summary.

**Headers:**
- `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `month` (optional): Filter berdasarkan bulan (1-12)
- `sortBy` (optional): Field untuk sorting (id, plan_date, createdAt, updatedAt)
- `sortOrder` (optional): Urutan sorting (ASC, DESC)

**Contoh Request:**
```bash
# Tanpa filter
curl -X 'GET' 'http://localhost:9526/api/parent-plan-working-hour' \
  -H 'Authorization: Bearer {token}'

# Dengan filter bulan dan pagination
curl -X 'GET' 'http://localhost:9526/api/parent-plan-working-hour?month=8&page=1&limit=20' \
  -H 'Authorization: Bearer {token}'

# Dengan sorting
curl -X 'GET' 'http://localhost:9526/api/parent-plan-working-hour?sortBy=plan_date&sortOrder=ASC' \
  -H 'Authorization: Bearer {token}'
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Parent plan working hour summary berhasil diambil",
  "data": [
    {
      "parent_id": 1,
      "month_year": "2025-08",
      "schedule_day": 27,
      "holiday_day": 4,
      "working_hour_month": 216,
      "working_hour_day": 7.2,
      "working_hour_longshift": 14.4,
      "working_day_longshift": 1.5,
      "total_mohh": 100,
      "total_delay": 10,
      "total_idle": 10,
      "total_breakdown": 10,
      "ewh": 80,
      "pa": 1.0,
      "ma": 0.89,
      "ua": 0.8,
      "eu": 0.73,
      "is_available_to_edit": true,
      "is_available_to_delete": true
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

**Field Description:**
- `parent_id`: ID dari tabel r_parent_plan_working_hour
- `month_year`: Bulan dan tahun dari kolom plan_date (format: YYYY-MM)
- `schedule_day`: Jumlah kolom is_schedule_day yang bernilai true
- `holiday_day`: Jumlah kolom is_holiday_day yang bernilai true
- `working_hour_month`: Jumlah value di kolom working_hour_month
- `working_hour_day`: Jumlah value di kolom working_hour_day
- `working_hour_longshift`: Jumlah value di kolom working_hour_longshift
- `working_day_longshift`: Jumlah value di kolom working_day_longshift
- `total_mohh`: Value dari kolom mohh_per_month
- `total_delay`: Jumlah value di kolom activities_hour dengan status delay
- `total_idle`: Jumlah value di kolom activities_hour dengan status idle
- `total_breakdown`: Jumlah value di kolom activities_hour dengan status breakdown
- `ewh`: Rumus: total_mohh - total_delay - total_breakdown
- `pa`: Rumus: (ewh + total_delay + total_idle) / total_mohh
- `ma`: Rumus: ewh / (ewh + total_breakdown)
- `ua`: Rumus: ewh / (ewh + total_delay + total_idle)
- `eu`: Rumus: ewh / (ewh + total_delay + total_idle + total_breakdown)
- `is_available_to_edit`: Status edit: true jika plan_date lebih dari hari ini
- `is_available_to_delete`: Status delete: true jika plan_date lebih dari hari ini

#### GET /api/parent-plan-working-hour/:id
Mengambil data parent plan working hour berdasarkan ID dengan detail activities yang dikelompokkan berdasarkan status.

**Headers:**
- `Authorization: Bearer {token}`

**Path Parameters:**
- `id`: ID parent plan working hour (number)

**Contoh Request:**
```bash
curl -X 'GET' 'http://localhost:9526/api/parent-plan-working-hour/9' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Parent plan working hour berhasil diambil",
  "data": {
    "id": 9,
    "plan_date": "2025-08-21T00:00:00.000Z",
    "total_working_hour_month": 184,
    "total_working_hour_day": 8,
    "total_working_day_longshift": 5,
    "total_working_hour_longshift": "12.00",
    "total_mohh_per_month": 1000,
    "details": [
      {
        "name": "Delay",
        "group_detail": [
          {
            "activities_id": 1,
            "name": "P5M",
            "type_data": "number",
            "type_field": "input",
            "activities_hour": 1
          }
        ]
      }
    ]
  }
}
```

#### GET /api/parent-plan-working-hour/form
Mendapatkan data activities yang dikelompokkan berdasarkan status untuk form parent plan working hour.

**Headers:**
- `Authorization: Bearer {token}`

**Contoh Request:**
```bash
curl -X 'GET' 'http://localhost:9526/api/parent-plan-working-hour/form' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Parent plan working hour form data",
  "data": [
    {
      "name": "Delay",
      "group_detail": [
        {
          "id": 1,
          "name": "P5M",
          "type_data": "number",
          "type_field": "input"
        },
        {
          "id": 5,
          "name": "GST",
          "type_data": "number",
          "type_field": "input"
        }
      ]
    },
    {
      "name": "Working",
      "group_detail": [
        {
          "id": 2,
          "name": "Loading Barge",
          "type_data": "number",
          "type_field": "input"
        }
      ]
    },
    {
      "name": "Breakdown",
      "group_detail": [
        {
          "id": 3,
          "name": "Maintenance",
          "type_data": "number",
          "type_field": "input"
        }
      ]
    },
    {
      "name": "Idle",
      "group_detail": [
        {
          "id": 4,
          "name": "Waiting",
          "type_data": "number",
          "type_field": "input"
        }
      ]
    }
  ]
}
```

**Response Description:**
Data akan dikelompokkan secara dinamis berdasarkan status yang ada:
- `Delay`: activities dengan status 'delay'
- `Working`: activities dengan status 'working'
- `Breakdown`: activities dengan status 'breakdown'
- `Idle`: activities dengan status 'idle'
- `[status]`: activities dengan status lainnya (otomatis)

Setiap activity memiliki field:
- `id`: ID dari activity
- `name`: Nama activity
- `type_data`: Tipe data yang diharapkan (default: 'number')
- `type_field`: Tipe field input (default: 'input')

**Error Responses:**
- `400 Bad Request`: ID tidak ditemukan
- `401 Unauthorized`: Token tidak valid atau expired
- `500 Internal Server Error`: Error server internal

**Notes:**
- Data activities diambil dari tabel `m_activities` dan dikelompokkan berdasarkan kolom `status`
- Setiap status akan menjadi grup terpisah dalam array `details`
- Field `type_data`, `type_field`, dan `activities_hour` menggunakan nilai default sesuai requirement
- Response menggunakan format yang konsisten dengan endpoint lainnya

#### PATCH /api/parent-plan-working-hour/:id
Mengupdate data parent plan working hour berdasarkan ID beserta semua tabel terkait.

**Headers:**
- `Authorization: Bearer {token}`

**Path Parameters:**
- `id`: ID parent plan working hour (number)

**Request Body:**
```json
{
  "plan_date": "2025-08-21",
  "total_calendar_day": 31,
  "total_holiday_day": 8,
  "total_available_day": 23,
  "total_working_hour_month": 184,
  "total_working_day_longshift": 5,
  "total_working_hour_day": 8,
  "total_working_hour_longshift": 12,
  "total_mohh_per_month": 1000,
  "detail": [
    {
      "activities_id": 1,
      "activities_hour": 1
    },
    {
      "activities_id": 2,
      "activities_hour": 1
    },
    {
      "activities_id": 3,
      "activities_hour": 1
    }
  ]
}
```

**Contoh Request:**
```bash
curl -X 'PATCH' 'http://localhost:9526/api/parent-plan-working-hour/9' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "plan_date": "2025-08-21",
    "total_calendar_day": 31,
    "total_holiday_day": 8,
    "total_available_day": 23,
    "total_working_hour_month": 184,
    "total_working_day_longshift": 5,
    "total_working_hour_day": 8,
    "total_working_hour_longshift": 12,
    "total_mohh_per_month": 1000,
    "detail": [
      {
        "activities_id": 1,
        "activities_hour": 1
      },
      {
        "activities_id": 2,
        "activities_hour": 1
      },
      {
        "activities_id": 3,
        "activities_hour": 1
      }
    ]
  }'
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Parent plan working hour berhasil diupdate",
  "data": {
    "id": 9,
    "plan_date": "2025-08-21T00:00:00.000Z",
    "total_working_hour_month": 184,
    "total_working_hour_day": 8,
    "total_working_day_longshift": 5,
    "total_working_hour_longshift": "12.00",
    "total_mohh_per_month": 1000,
    "details": [
      {
        "name": "Delay",
        "group_detail": [
          {
            "activities_id": 1,
            "name": "P5M",
            "type_data": "number",
            "type_field": "input",
            "activities_hour": 1
          }
        ]
      }
    ]
  }
}
```

**Field Description:**
- Semua field sama seperti endpoint GET, dengan data yang sudah diupdate
- Response mengembalikan data lengkap dengan activities yang dikelompokkan

**Proses Update:**
1. **Update Parent Plan**: Update data di tabel `r_parent_plan_working_hour`
2. **Update Daily Data**: Update data yang sudah ada di tabel `r_plan_working_hour` (bukan hapus dan insert ulang)
3. **Update Activities**: Update data di tabel `r_plan_working_hour_detail` dengan menghapus detail lama dan insert detail baru
4. **Transaction Safety**: Semua operasi menggunakan database transaction untuk memastikan konsistensi data

**Perbedaan dengan Versi Sebelumnya:**
- **Sebelumnya**: Hapus semua data lama dan insert ulang (DELETE + INSERT)
- **Sekarang**: Update data yang sudah ada (UPDATE) untuk mempertahankan struktur data
- **Keuntungan**: Data history dan referensi tetap terjaga, tidak ada data yang hilang

**Error Responses:**
- `400 Bad Request`: ID tidak ditemukan atau data tidak valid
- `401 Unauthorized`: Token tidak valid atau expired
- `500 Internal Server Error`: Error server internal

**Notes:**
- Endpoint ini akan mengupdate semua tabel terkait secara otomatis
- Data harian akan di-generate ulang berdasarkan bulan yang baru
- Activities detail akan di-update sesuai dengan data yang dikirim
- Menggunakan database transaction untuk memastikan data konsisten

## Overview
Modul Plan Working Hour digunakan untuk mengelola data perencanaan jam kerja dengan detail activities. Data detail activities akan disimpan ke table `r_plan_working_hour_detail`.

## Features
- CRUD operations untuk plan working hour
- Auto-fill fields berdasarkan plan_date
- Management detail activities
- Availability checking untuk edit dan delete
- Summary dan reporting berdasarkan range tanggal

## Business Logic

### Auto-fill Fields
1. **is_calender_day**: Otomatis `true` jika `plan_date` terisi
2. **is_holiday_day**: Otomatis `false` jika `plan_date` terisi
3. **is_schedule_day**: Otomatis `true` jika `plan_date` bukan hari minggu

### Availability Fields
1. **is_available_to_edit**: `true` jika `plan_date` > hari ini
2. **is_available_to_delete**: `true` jika `plan_date` > hari ini

### Detail Management
- Saat create: Detail activities akan disimpan ke table `r_plan_working_hour_detail`
- Saat update: Detail lama akan dihapus dan diganti dengan detail baru
- Saat delete: Detail akan dihapus terlebih dahulu sebelum menghapus plan working hour

## API Endpoints

### Main Endpoints
- `POST /api/plan-working-hour` - Create plan working hour
- `GET /api/plan-working-hour` - Get all plan working hours
- `GET /api/plan-working-hour/form` - Get activities grouped by status for form
- `GET /api/plan-working-hour/:id` - Get plan working hour by ID
- `PATCH /api/plan-working-hour/:id` - Update plan working hour
- `DELETE /api/plan-working-hour/:id` - Delete plan working hour

### Additional Endpoints
- `GET /api/plan-working-hour/summary` - Get working hours summary
- `GET /api/plan-working-hour/date-range` - Get by date range

### Parent Plan Working Hour Endpoints
- `POST /api/parent-plan-working-hour` - Create parent plan working hour
- `GET /api/parent-plan-working-hour` - Get all parent plan working hours
- `GET /api/parent-plan-working-hour/form` - Get activities grouped by status for form
- `GET /api/parent-plan-working-hour/:id` - Get parent plan working hour by ID
- `PATCH /api/parent-plan-working-hour/:id` - Update parent plan working hour
- `DELETE /api/parent-plan-working-hour/:id` - Delete parent plan working hour
- `GET /api/parent-plan-working-hour/detail` - Get detail by date range
- `GET /api/parent-plan-working-hour/detail/:id` - Get detail by ID
- `PATCH /api/parent-plan-working-hour/detail/:id` - Update detail by ID

## Request Format

### Create/Update Request
```json
{
  "plan_date": "2025-01-01",
  "working_day_longshift": 1,
  "working_hour_longshift": 1,
  "working_hour": 1,
  "mohh_per_month": 1,
  "detail": [
    {
      "activities_id": 1,
      "activities_hour": 1
    },
    {
      "activities_id": 2,
      "activities_hour": 1
    }
  ]
}
```

### Response Format
```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {
    "id": 1,
    "plan_date": "2025-01-01",
    "working_day_longshift": 1,
    "working_hour_longshift": 1,
    "working_hour": 1,
    "mohh_per_month": 1,
    "is_available_to_edit": true,
    "is_available_to_delete": true,
    "details": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Dependencies
- TypeORM
- JWT Authentication
- Activities Module
- Validation (class-validator)

## Database Tables
- `r_plan_working_hour` - Main table untuk plan working hour
- `r_plan_working_hour_detail` - Detail table untuk activities

## Notes
- Semua endpoint memerlukan authentication JWT
- Field availability akan otomatis dihitung berdasarkan tanggal
- Soft delete digunakan untuk semua operasi delete
- Detail activities akan otomatis dikelola saat CRUD operations
