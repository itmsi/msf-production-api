# Implementasi Field `working_hour_longshift_day`

## Overview
Field `working_hour_longshift_day` telah berhasil ditambahkan ke API Parent Plan Working Hour untuk menyimpan jam kerja long shift per hari.

## Perubahan yang Dibuat

### 1. Database Migration
- **File**: `src/database/migrations/1700000000046-AddWorkingHourLongshiftDayToRParentPlanWorkingHour.ts`
- **Kolom**: `working_hour_longshift_day`
- **Tipe**: `decimal(10,2)`
- **Nullable**: `true`
- **Comment**: "Working hour untuk longshift per hari"

### 2. Entity Update
- **File**: `src/modules/plan-working-hour/entities/parent-plan-working-hour.entity.ts`
- Field `working_hour_longshift_day` ditambahkan dengan tipe `decimal(10,2)`

### 3. DTO Update
- **File**: `src/modules/plan-working-hour/dto/parent-plan-working-hour.dto.ts`
- Field `working_hour_longshift_day` ditambahkan ke:
  - `CreateParentPlanWorkingHourDto`
  - `ParentPlanWorkingHourResponseDto`
- **Validasi**: `@IsOptional()` dan `@IsNumber()`
- **Swagger**: Dokumentasi lengkap dengan contoh dan deskripsi

### 4. Service Update
- **File**: `src/modules/plan-working-hour/parent-plan-working-hour.service.ts`
- Field `working_hour_longshift_day` diproses saat create dan update
- Data disimpan ke tabel `r_parent_plan_working_hour`

### 5. Controller Update
- **File**: `src/modules/plan-working-hour/parent-plan-working-hour.controller.ts`
- Swagger documentation diupdate untuk semua endpoint
- Contoh request dan response diupdate dengan field baru

## Struktur Field

```typescript
working_hour_longshift_day: number; // Opsional, decimal dengan 2 angka di belakang koma
```

## Contoh Penggunaan

### Request Body
```json
{
  "plan_date": "2025-08-01",
  "total_calendar_day": 31,
  "total_holiday_day": 8,
  "total_available_day": 23,
  "total_working_hour": 184,
  "total_working_day_longshift": 5,
  "working_hour_longshift": 12,
  "working_hour_longshift_day": 8.5,
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

### Response
```json
{
  "statusCode": 201,
  "message": "Parent plan working hour berhasil dibuat",
  "data": {
    "id": 6,
    "plan_date": "2025-08-01T00:00:00.000Z",
    "total_calendar_day": 31,
    "total_holiday_day": 8,
    "total_available_day": 23,
    "total_working_hour": 184,
    "total_working_day_longshift": 5,
    "working_hour_longshift": 12,
    "working_hour_longshift_day": "8.50",
    "total_mohh_per_month": 1000,
    "createdAt": "2025-08-25T01:27:33.048Z",
    "updatedAt": "2025-08-25T01:27:33.048Z"
  }
}
```

## Testing

### Test dengan cURL
```bash
curl -X 'POST' \
  'http://localhost:9526/api/parent-plan-working-hour' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "plan_date": "2025-08-01",
  "total_calendar_day": 31,
  "total_holiday_day": 8,
  "total_available_day": 23,
  "total_working_hour": 184,
  "total_working_day_longshift": 5,
  "working_hour_longshift": 12,
  "working_hour_longshift_day": 8.5,
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

## Endpoint yang Diupdate

1. **POST** `/api/parent-plan-working-hour` - Create
2. **GET** `/api/parent-plan-working-hour` - Get All
3. **GET** `/api/parent-plan-working-hour/:id` - Get By ID
4. **PATCH** `/api/parent-plan-working-hour/:id` - Update
5. **DELETE** `/api/parent-plan-working-hour/:id` - Delete

## Swagger Documentation

Semua endpoint telah diupdate dengan:
- Field `working_hour_longshift_day` di request body
- Field `working_hour_longshift_day` di response examples
- Deskripsi dan validasi yang lengkap

## Database Schema

```sql
ALTER TABLE r_parent_plan_working_hour 
ADD COLUMN working_hour_longshift_day DECIMAL(10,2) NULL 
COMMENT 'Working hour untuk longshift per hari';
```

## Validasi

- **Tipe**: Number (decimal)
- **Required**: Tidak (opsional)
- **Format**: Decimal dengan maksimal 2 angka di belakang koma
- **Range**: Tidak ada batasan khusus

## Catatan Penting

1. Field ini bersifat opsional, sehingga tidak akan mempengaruhi data yang sudah ada
2. Migration sudah berhasil dijalankan
3. Semua endpoint sudah terupdate
4. Swagger documentation sudah lengkap
5. Testing berhasil dengan berbagai nilai (8.5, 7.5, dll)

## Status Implementasi

✅ **COMPLETED** - Field `working_hour_longshift_day` telah berhasil diimplementasikan dan berfungsi dengan baik.
