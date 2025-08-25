# Update Detail Parent Plan Working Hour Implementation

## Overview
Implementasi endpoint `PATCH /api/parent-plan-working-hour/detail/{id}` telah diperbarui untuk menggunakan struktur request body yang baru sesuai dengan permintaan user, termasuk field `schedule_day` yang baru ditambahkan. Selain itu, endpoint `GET /api/parent-plan-working-hour/detail` telah diperbarui dengan filter berdasarkan `calendar_day` dan logic response yang diperbarui.

## Perubahan yang Telah Dibuat

### 1. DTO Baru
- **File**: `src/modules/plan-working-hour/dto/parent-plan-working-hour.dto.ts`
- **Class**: `UpdateDetailParentPlanWorkingHourDto`
- **Struktur**:
  ```typescript
  export class UpdateDetailParentPlanWorkingHourDto {
    plan_date: string;
    working_hour_month: number;
    working_day_longshift: number;
    working_hour_day: number;
    working_hour_longshift: number;
    mohh_per_month: number;
    schedule_day: number;
    detail: ActivityDetailDto[];
  }
  ```

### 2. Service Update
- **File**: `src/modules/plan-working-hour/parent-plan-working-hour.service.ts`
- **Method**: `updateDetail()`
- **Perubahan**:
  - Menggunakan DTO baru `UpdateDetailParentPlanWorkingHourDto`
  - Field mapping yang diperbarui:
    - `working_hour_month` → `planWorkingHour.working_hour_month`
    - `working_day_longshift` → `planWorkingHour.working_day_longshift`
    - `working_hour_longshift` → `planWorkingHour.working_hour_longshift`
    - `working_hour_day` → `planWorkingHour.working_hour_day`
    - `mohh_per_month` → `planWorkingHour.mohh_per_month`
    - `schedule_day` → `planWorkingHour.schedule_day`

### 3. Controller Update
- **File**: `src/modules/plan-working-hour/parent-plan-working-hour.controller.ts`
- **Method**: `updateDetail()`
- **Perubahan**:
  - Import DTO baru
  - Update `@ApiBody` type dan examples dengan field `schedule_day`
  - Update response examples
  - Update parameter type

### 4. Dokumentasi API
- **File**: `src/modules/plan-working-hour/ENDPOINT_DETAIL_UPDATE_API.md`
- **Perubahan**: Dokumentasi lengkap dengan struktur request body baru termasuk `schedule_day`

### 5. GET Detail dengan Filter calendar_day
- **File**: `src/modules/plan-working-hour/parent-plan-working-hour.service.ts`
- **Method**: `getDetail()`
- **Perubahan**:
  - Menambahkan filter berdasarkan parameter `calendar_day`
  - Update logic response `calendar_day` berdasarkan nilai `schedule_day`
  - Filter mapping:
    - `available` → `schedule_day = 1`
    - `holiday` → `schedule_day = 0`
    - `one-shift` → `schedule_day = 0.5`

## Struktur Request Body Baru

### Sebelum (Lama):
```json
{
  "plan_date": "2025-08-01",
  "total_calendar_day": 31,
  "total_holiday_day": 8,
  "total_available_day": 23,
  "total_working_hour_month": 184,
  "total_working_day_longshift": 5,
  "total_working_hour_day": 8,
  "total_working_hour_longshift": 12,
  "total_mohh_per_month": 1000,
  "detail": [...]
}
```

### Sesudah (Baru):
```json
{
  "plan_date": "2025-08-01",
  "working_hour_month": 184,
  "working_day_longshift": 5,
  "working_hour_day": 8,
  "working_hour_longshift": 12,
  "mohh_per_month": 1000,
  "schedule_day": 23,
  "detail": [...]
}
```

## Field Mapping

| Field Lama | Field Baru | Deskripsi |
|------------|------------|-----------|
| `total_working_hour_month` | `working_hour_month` | Total jam kerja per bulan |
| `total_working_day_longshift` | `working_day_longshift` | Total hari kerja long shift |
| `total_working_hour_day` | `working_hour_day` | Total jam kerja per hari |
| `total_working_hour_longshift` | `working_hour_longshift` | Total jam kerja long shift |
| `total_mohh_per_month` | `mohh_per_month` | Total MOHH per bulan |
| - | `schedule_day` | **Baru**: Total hari schedule kerja |

## Field Baru: schedule_day

- **Tipe**: `number`
- **Deskripsi**: Total hari schedule kerja dalam bulan
- **Contoh**: 23 (untuk bulan dengan 8 hari libur)
- **Validasi**: Minimum 0, Maximum 31
- **Target**: Kolom `schedule_day` di tabel `r_plan_working_hour`

## Logic Response calendar_day Baru

### Sebelum (Lama):
```typescript
// Berdasarkan kolom is_calender_day
if (pwh.is_calender_day === true) {
  calendarDay = 'available';
} else if (pwh.is_calender_day === false) {
  calendarDay = 'one shift';
} else {
  calendarDay = 'holiday';
}
```

### Sesudah (Baru):
```typescript
// Berdasarkan kolom schedule_day
if (pwh.schedule_day === 1) {
  calendarDay = 'available';
} else if (pwh.schedule_day === 0.5) {
  calendarDay = 'one-shift';
} else if (pwh.schedule_day === 0) {
  calendarDay = 'holiday';
}
```

### Mapping Nilai:
- `schedule_day = 1` → `calendar_day = "available"`
- `schedule_day = 0.5` → `calendar_day = "one-shift"`
- `schedule_day = 0` → `calendar_day = "holiday"`

## Proses Update

### 1. Update Parent Plan
- Hanya update `plan_date` jika ada perubahan
- Field lain tidak diupdate di parent plan

### 2. Update Plan Working Hour
- Update semua record di tabel `r_plan_working_hour` yang terkait
- Field yang diupdate:
  - `working_hour_month`: Dibagi dengan jumlah hari dalam bulan
  - `working_day_longshift`: Langsung dari request
  - `working_hour_longshift`: Langsung dari request
  - `working_hour_day`: Langsung dari request
  - `mohh_per_month`: Langsung dari request
  - `schedule_day`: **Baru** - Langsung dari request

### 3. Update Plan Working Hour Detail
- Hapus semua detail lama
- Insert detail baru untuk semua tanggal dan aktivitas

## Contoh Penggunaan

### cURL Request untuk Update Detail
```bash
curl -X 'PATCH' \
  'http://localhost:9526/api/parent-plan-working-hour/detail/366' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
  "plan_date": "2025-08-01",
  "working_hour_month": 184,
  "working_day_longshift": 5,
  "working_hour_day": 8,
  "working_hour_longshift": 12,
  "mohh_per_month": 1000,
  "schedule_day": 23,
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

### cURL Request untuk GET Detail dengan Filter
```bash
# Filter berdasarkan available days (schedule_day = 1)
curl -X 'GET' \
  'http://localhost:9526/api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08&page=1&limit=10&calendar_day=available' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'

# Filter berdasarkan holiday days (schedule_day = 0)
curl -X 'GET' \
  'http://localhost:9526/api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08&page=1&limit=10&calendar_day=holiday' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'

# Filter berdasarkan one-shift days (schedule_day = 0.5)
curl -X 'GET' \
  'http://localhost:9526/api/parent-plan-working-hour/detail?start_date=2025-08-01&end_date=2025-08-31&month_year=2025-08&page=1&limit=10&calendar_day=one-shift' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}'
```

## Keuntungan Perubahan

1. **Struktur Lebih Sederhana**: Menghilangkan field yang tidak diperlukan
2. **Naming Convention**: Field name lebih konsisten dan mudah dipahami
3. **Fokus Update**: Hanya update field yang relevan untuk detail
4. **Konsistensi**: Struktur yang sama dengan tabel target
5. **Field Baru**: `schedule_day` untuk tracking hari kerja yang dijadwalkan
6. **Filter Fleksibel**: Dapat memfilter data berdasarkan status hari kalender
7. **Logic Response yang Akurat**: Response `calendar_day` berdasarkan nilai `schedule_day` yang sebenarnya

## Testing

Endpoint dapat diuji dengan:
1. Request dengan semua field termasuk `schedule_day`
2. Request dengan sebagian field (partial update)
3. Request dengan detail activities yang berbeda
4. Validasi error handling
5. Verifikasi update kolom `schedule_day` di tabel `r_plan_working_hour`
6. **Filter calendar_day**:
   - Filter dengan `calendar_day=available` (harus return data dengan `schedule_day = 1`)
   - Filter dengan `calendar_day=holiday` (harus return data dengan `schedule_day = 0`)
   - Filter dengan `calendar_day=one-shift` (harus return data dengan `schedule_day = 0.5`)
7. **Verifikasi Response calendar_day**:
   - Data dengan `schedule_day = 1` harus return `calendar_day = "available"`
   - Data dengan `schedule_day = 0` harus return `calendar_day = "holiday"`
   - Data dengan `schedule_day = 0.5` harus return `calendar_day = "one-shift"`

## Catatan Penting

- Endpoint menggunakan transaction untuk konsistensi data
- Rollback otomatis jika terjadi error
- Field yang tidak ada di request tidak akan diupdate
- Detail activities akan di-refresh ulang untuk semua tanggal
- Field `schedule_day` akan diupdate ke semua record di tabel `r_plan_working_hour` yang terkait
