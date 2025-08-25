# Update Response Format Endpoint `/api/parent-plan-working-hour/detail/{id}`

## Overview

Endpoint `/api/parent-plan-working-hour/detail/{id}` telah diupdate untuk mengembalikan response format yang baru sesuai dengan permintaan user. Format response sekarang lebih sederhana dan terstruktur dengan pengelompokan activities berdasarkan status.

## Response Format Baru

### Structure Response
```json
{
  "statusCode": 200,
  "message": "Detail parent plan working hour berhasil diambil",
  "data": {
    "id": 9,
    "plan_date": "2025-08-01T00:00:00.000Z",
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

### Field Descriptions

#### Main Data Fields
- **`id`**: ID dari tabel `r_plan_working_hour`
- **`plan_date`**: Tanggal rencana kerja (format ISO string)
- **`total_working_hour_month`**: Total jam kerja per bulan
- **`total_working_hour_day`**: Total jam kerja per hari
- **`total_working_day_longshift`**: Total hari kerja longshift
- **`total_working_hour_longshift`**: Total jam kerja longshift (string dengan 2 digit desimal)
- **`total_mohh_per_month`**: Total MOHH per bulan

#### Details Array
Array `details` berisi 5 grup activities yang dikelompokkan berdasarkan status:

1. **Delay**: Activities dengan status `delay`
2. **Working**: Activities dengan status `working`
3. **Breakdown**: Activities dengan status `breakdown`
4. **Idle**: Activities dengan status `idle`
5. **Null**: Activities tanpa status atau status tidak valid

#### Activity Detail Fields
Setiap activity dalam `group_detail` memiliki struktur:
- **`activities_id`**: ID dari tabel `m_activities`
- **`name`**: Nama aktivitas
- **`type_data`**: Tipe data (selalu "number")
- **`type_field`**: Tipe field input (selalu "input")
- **`activities_hour`**: Jam aktivitas

## Response Format Lama (Sebelum Update)

### Structure Response Lama
```json
{
  "statusCode": 200,
  "message": "Detail parent plan working hour berhasil diambil",
  "data": {
    "id": 9,
    "plan_date": "2025-08-01",
    "calendar_day": "available",
    "working_hour_day": 8.00,
    "working_hour_month": 216.00,
    "working_hour_longshift": 14.40,
    "working_day_longshift": 1.50,
    "mohh_per_month": 100.00,
    "schedule_day": 1.00,
    "total_delay": 10.00,
    "total_idle": 10.00,
    "total_breakdown": 10.00,
    "ewh": 80.00,
    "pa": 1.00,
    "ma": 0.89,
    "ua": 0.80,
    "eu": 0.67,
    "is_available_to_edit": true,
    "is_available_to_delete": true,
    "activities": [
      {
        "id": 1,
        "activities_id": 1,
        "activities_hour": 5.00,
        "activity_name": "Loading Barge",
        "activity_status": "working",
        "activities_group_id": 1,
        "activities_group_name": "Production"
      }
    ]
  }
}
```

## Perubahan yang Dilakukan

### 1. DTO Update
- **`ParentPlanWorkingHourDetailByIdResponseDto`**: Struktur response baru
- **`ActivityGroupDto`**: Untuk grup activities berdasarkan status
- **`ActivityDetailDto`**: Untuk detail setiap activity

### 2. Service Update
- **`getDetailById` method**: Logic baru untuk grouping activities
- **Activities grouping**: Berdasarkan status (`delay`, `working`, `breakdown`, `idle`, `null`)
- **Response mapping**: Dari format lama ke format baru

### 3. Controller Update
- **Swagger documentation**: Contoh response yang baru
- **API examples**: Sesuai dengan format yang diminta user

## Implementation Details

### Service Logic
```typescript
// Group activities by status
const delayActivities = planWorkingHour.details
  ?.filter(detail => detail.activities?.status === 'delay')
  .map(detail => ({
    activities_id: detail.activities_id,
    name: detail.activities?.name || '',
    type_data: 'number',
    type_field: 'input',
    activities_hour: detail.activities_hour || 0,
  })) || [];

// Create details array with 5 groups
const details = [
  { name: 'Delay', group_detail: delayActivities },
  { name: 'Working', group_detail: workingActivities },
  { name: 'Breakdown', group_detail: breakdownActivities },
  { name: 'Idle', group_detail: idleActivities },
  { name: 'Null', group_detail: nullActivities },
];
```

### DTO Structure
```typescript
export class ParentPlanWorkingHourDetailByIdResponseDto {
  id: number;
  plan_date: Date;
  total_working_hour_month: number;
  total_working_hour_day: number;
  total_working_day_longshift: number;
  total_working_hour_longshift: string;
  total_mohh_per_month: number;
  details: ActivityGroupDto[];
}

export class ActivityGroupDto {
  name: string;
  group_detail: ActivityDetailDto[];
}

export class ActivityDetailDto {
  activities_id: number;
  name: string;
  type_data: string;
  type_field: string;
  activities_hour: number;
}
```

## Testing

### Test Coverage
- ✅ **17 test cases** berhasil dijalankan
- ✅ **Service tests**: Logic grouping activities
- ✅ **Controller tests**: Response format validation
- ✅ **DTO validation**: Struktur data yang benar

### Test Scenarios
1. **Activities grouping**: Activities dikelompokkan berdasarkan status
2. **Response structure**: Format response sesuai dengan yang diminta
3. **Data mapping**: Semua field ter-mapping dengan benar
4. **Error handling**: Error handling tetap berfungsi

## Business Impact

### 1. Frontend Integration
- **Simplified structure**: Response lebih mudah diproses
- **Grouped activities**: Activities dikelompokkan berdasarkan status
- **Consistent format**: Format yang konsisten untuk semua activities

### 2. Data Processing
- **Status-based grouping**: Activities dikelompokkan berdasarkan status
- **Standardized fields**: Semua activities memiliki field yang sama
- **Cleaner response**: Response lebih bersih dan terstruktur

### 3. API Consistency
- **Unified format**: Format yang seragam untuk semua activities
- **Predictable structure**: Struktur yang dapat diprediksi
- **Better documentation**: Dokumentasi yang lebih jelas

## Migration Notes

### Backward Compatibility
- **Endpoint URL**: Tidak berubah (`/api/parent-plan-working-hour/detail/{id}`)
- **HTTP Method**: Tetap `GET`
- **Authentication**: Tetap menggunakan `JwtAuthGuard`
- **Error handling**: Tetap sama

### Breaking Changes
- **Response structure**: Struktur response berubah total
- **Field names**: Nama field berubah
- **Data grouping**: Activities sekarang dikelompokkan
- **Metrics removal**: Metrics seperti EWH, PA, MA, UA, EU dihapus

## Future Considerations

### 1. Additional Status Groups
- **Custom status**: Menambah status group baru jika diperlukan
- **Dynamic grouping**: Grouping yang lebih fleksibel
- **Status mapping**: Mapping status yang lebih kompleks

### 2. Enhanced Activity Details
- **Additional fields**: Menambah field baru untuk activities
- **Validation rules**: Rules validasi yang lebih ketat
- **Type safety**: Type safety yang lebih baik

### 3. Performance Optimization
- **Database queries**: Optimasi query database
- **Caching**: Implementasi caching jika diperlukan
- **Pagination**: Pagination untuk activities jika data terlalu banyak

## Conclusion

Update response format endpoint `/api/parent-plan-working-hour/detail/{id}` telah berhasil diimplementasikan dengan:

- ✅ **New DTOs**: Struktur response yang baru dan terstruktur
- ✅ **Service logic**: Logic grouping activities berdasarkan status
- ✅ **Controller updates**: Swagger documentation yang updated
- ✅ **Comprehensive testing**: Semua test berhasil
- ✅ **Clean structure**: Response format yang bersih dan mudah diproses

Format response baru sekarang sesuai dengan permintaan user dan memberikan struktur data yang lebih terorganisir dengan pengelompokan activities berdasarkan status.
