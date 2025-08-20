# Plan Working Hour Module

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
- `GET /api/plan-working-hour/:id` - Get plan working hour by ID
- `PATCH /api/plan-working-hour/:id` - Update plan working hour
- `DELETE /api/plan-working-hour/:id` - Delete plan working hour

### Additional Endpoints
- `GET /api/plan-working-hour/summary` - Get working hours summary
- `GET /api/plan-working-hour/date-range` - Get by date range

## Request Format

### Create/Update Request
```json
{
  "plan_date": "2025-01-01",
  "is_calender_day": true,
  "is_holiday_day": false,
  "is_schedule_day": true,
  "working_day_longshift": 1,
  "working_hour_longshift": 1,
  "working_hour": 1,
  "mohh_per_month": 1,
  "detail": [
    {
      "activities_id": 1,
      "working_hour": 1
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
    "is_calender_day": true,
    "is_holiday_day": false,
    "is_schedule_day": true,
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
