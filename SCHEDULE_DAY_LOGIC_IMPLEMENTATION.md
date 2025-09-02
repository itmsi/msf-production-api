# Implementasi Logika Schedule Day

## Overview
Implementasi logika untuk menangani field `schedule_day` dengan otomatis mengupdate field `is_schedule_day` dan `is_holiday_day` berdasarkan nilai `schedule_day`.

## Logika yang Diterapkan

### 1. Jika schedule_day = 1
- `is_schedule_day` = `true`
- `is_holiday_day` = `false`
- **Keterangan**: Hari kerja penuh (available day)

### 2. Jika schedule_day = 0.5
- `is_schedule_day` = `false`
- `is_holiday_day` = `false`
- **Keterangan**: Hari kerja setengah shift (one shift)

### 3. Jika schedule_day = 0
- `is_schedule_day` = `false`
- `is_holiday_day` = `true`
- **Keterangan**: Hari libur (holiday)

## File yang Diupdate

### 1. Service Layer
**File**: `src/modules/plan-working-hour/parent-plan-working-hour.service.ts`

#### Method `updateDetailByPlanWorkingHourId`
```typescript
if (updateDto.schedule_day !== undefined) {
  planWorkingHour.schedule_day = updateDto.schedule_day;
  
  // Set is_schedule_day dan is_holiday_day berdasarkan schedule_day
  if (updateDto.schedule_day === 1) {
    planWorkingHour.is_schedule_day = true;
    planWorkingHour.is_holiday_day = false;
  } else if (updateDto.schedule_day === 0.5) {
    planWorkingHour.is_schedule_day = false;
    planWorkingHour.is_holiday_day = false;
  } else if (updateDto.schedule_day === 0) {
    planWorkingHour.is_schedule_day = false;
    planWorkingHour.is_holiday_day = true;
  }
}
```

#### Method `updateDetail`
Logika yang sama diterapkan untuk semua record yang diupdate dalam method `updateDetail`.

#### Method `create`
Field `schedule_day` di-set dengan default value `1` untuk semua hari saat membuat data baru.

## Endpoint yang Terpengaruh

### PATCH /api/parent-plan-working-hour/detail/{id}
Endpoint ini sekarang akan otomatis mengupdate field `is_schedule_day` dan `is_holiday_day` berdasarkan nilai `schedule_day` yang dikirim dalam request body.

### Contoh Request yang Sudah Disesuaikan

#### Contoh 1: schedule_day = 1 (Hari Kerja Penuh)
```bash
curl 'http://localhost:9528/api/parent-plan-working-hour/detail/434' \
  -X 'PATCH' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluX3Byb2R1Y3Rpb24iLCJzdWIiOjEwMDEyNSwicm9sZUlkIjo1MiwiaXNBY3RpdmUiOnRydWUsInJvbGVfY29kZSI6IlBEUiIsInJvbGVzIjoiU3VwZXIgQWRtaW4gUHJvZHVjdGlvbiIsImlhdCI6MTc1NjgwNDM5MiwiZXhwIjoxNzU2ODkwNzkyfQ.WLVl8io8kcmRux2KlX5FFbdyWE-Mv-0QgsVZvA_1yeY' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:9528' \
  -H 'Referer: http://localhost:9528/entry-data/plan/working-hour-plan/daily/update/434' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36' \
  --data-raw '{
    "plan_date": "2025-11-01T17:00:00.000Z",
    "working_hour_month": 3.33,
    "working_hour_day": 20,
    "mohh_per_month": 24,
    "working_hour_longshift": 0,
    "working_day_longshift": false,
    "schedule_day": 1,
    "detail": [
      {"activities_id": 2, "activities_hour": 10},
      {"activities_id": 3, "activities_hour": 10},
      {"activities_id": 4, "activities_hour": 10},
      {"activities_id": 15, "activities_hour": 10},
      {"activities_id": 16, "activities_hour": 10},
      {"activities_id": 21, "activities_hour": 10},
      {"activities_id": 22, "activities_hour": 0},
      {"activities_id": 23, "activities_hour": 10},
      {"activities_id": 25, "activities_hour": 10},
      {"activities_id": 28, "activities_hour": 10},
      {"activities_id": 29, "activities_hour": 10},
      {"activities_id": 30, "activities_hour": 10},
      {"activities_id": 32, "activities_hour": 10},
      {"activities_id": 33, "activities_hour": 10},
      {"activities_id": 34, "activities_hour": 10},
      {"activities_id": 37, "activities_hour": 10}
    ]
  }'
```

**Hasil**: `is_schedule_day = true`, `is_holiday_day = false`

#### Contoh 2: schedule_day = 0.5 (Hari Kerja Setengah Shift)
```bash
curl 'http://localhost:9528/api/parent-plan-working-hour/detail/434' \
  -X 'PATCH' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluX3Byb2R1Y3Rpb24iLCJzdWIiOjEwMDEyNSwicm9sZUlkIjo1MiwiaXNBY3RpdmUiOnRydWUsInJvbGVfY29kZSI6IlBEUiIsInJvbGVzIjoiU3VwZXIgQWRtaW4gUHJvZHVjdGlvbiIsImlhdCI6MTc1NjgwNDM5MiwiZXhwIjoxNzU2ODkwNzkyfQ.WLVl8io8kcmRux2KlX5FFbdyWE-Mv-0QgsVZvA_1yeY' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "plan_date": "2025-11-01T17:00:00.000Z",
    "working_hour_month": 3.33,
    "working_hour_day": 20,
    "mohh_per_month": 24,
    "working_hour_longshift": 0,
    "working_day_longshift": false,
    "schedule_day": 0.5,
    "detail": [
      {"activities_id": 2, "activities_hour": 10},
      {"activities_id": 3, "activities_hour": 10}
    ]
  }'
```

**Hasil**: `is_schedule_day = false`, `is_holiday_day = false`

#### Contoh 3: schedule_day = 0 (Hari Libur)
```bash
curl 'http://localhost:9528/api/parent-plan-working-hour/detail/434' \
  -X 'PATCH' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluX3Byb2R1Y3Rpb24iLCJzdWIiOjEwMDEyNSwicm9sZUlkIjo1MiwiaXNBY3RpdmUiOnRydWUsInJvbGVfY29kZSI6IlBEUiIsInJvbGVzIjoiU3VwZXIgQWRtaW4gUHJvZHVjdGlvbiIsImlhdCI6MTc1NjgwNDM5MiwiZXhwIjoxNzU2ODkwNzkyfQ.WLVl8io8kcmRux2KlX5FFbdyWE-Mv-0QgsVZvA_1yeY' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "plan_date": "2025-11-01T17:00:00.000Z",
    "working_hour_month": 3.33,
    "working_hour_day": 20,
    "mohh_per_month": 24,
    "working_hour_longshift": 0,
    "working_day_longshift": false,
    "schedule_day": 0,
    "detail": [
      {"activities_id": 2, "activities_hour": 10},
      {"activities_id": 3, "activities_hour": 10}
    ]
  }'
```

**Hasil**: `is_schedule_day = false`, `is_holiday_day = true`

## Response Field Update

### Field `schedule_day`
Field `schedule_day` dalam response sekarang menampilkan value sesuai dengan kolom `schedule_day` di tabel `r_plan_working_hour`:

- **Endpoint**: `GET /api/parent-plan-working-hour/detail/{id}`
- **Endpoint**: `GET /api/parent-plan-working-hour/detail`

#### Value yang Ditampilkan
Field `schedule_day` akan menampilkan nilai asli dari kolom `schedule_day` di database tanpa default value:
- **Jika `schedule_day = 0`** → Response: `"schedule_day": 0`
- **Jika `schedule_day = 1`** → Response: `"schedule_day": 1`
- **Jika `schedule_day = 0.5`** → Response: `"schedule_day": 0.5`
- **Jika `schedule_day = null`** → Response: `"schedule_day": null`

#### Debug Logging
Ditambahkan logging untuk memastikan data yang diambil dari database benar:
```typescript
// Debug: Log schedule_day value dari database
console.log(`Debug - ID: ${id}, schedule_day from DB:`, planWorkingHour.schedule_day);
```

#### Contoh Response
```json
{
  "statusCode": 200,
  "message": "Detail parent plan working hour berhasil diambil",
  "data": {
    "id": 434,
    "plan_date": "2025-11-01T00:00:00.000Z",
    "total_working_hour_month": 3.33,
    "total_working_hour_day": 20.00,
    "total_working_day_longshift": 0.00,
    "total_working_hour_longshift": "0.00",
    "total_mohh_per_month": 24.00,
    "schedule_day": 1,
    "working_longshift": false,
    "details": [...]
  }
}
```

### Method yang Diupdate
1. **`getDetailById()`**: Field `schedule_day` menampilkan value asli dari database
2. **`getDetail()`**: Field `schedule_day` menampilkan value asli dari database untuk setiap item

### Perubahan yang Dilakukan
- Menghapus field `schedule_day_boolean` dari response
- Field `schedule_day` sekarang menampilkan nilai asli tanpa default value (`|| 1`)
- Menghapus helper method `getScheduleDayBoolean()` yang tidak lagi digunakan
- Menambahkan debug logging untuk memastikan data yang diambil dari database benar

## Testing
Untuk menguji implementasi ini, gunakan nilai `schedule_day` yang berbeda:
- `schedule_day: 1` → `is_schedule_day: true`, `is_holiday_day: false`
- `schedule_day: 0.5` → `is_schedule_day: false`, `is_holiday_day: false`
- `schedule_day: 0` → `is_schedule_day: false`, `is_holiday_day: true`

## Database Schema
Field yang terlibat dalam tabel `r_plan_working_hour`:
- `schedule_day` (float): Nilai schedule day (0, 0.5, atau 1)
- `is_schedule_day` (boolean): Status hari schedule
- `is_holiday_day` (boolean): Status hari libur

## Catatan Penting
- Logika ini diterapkan secara otomatis saat melakukan update data
- Tidak perlu mengirim field `is_schedule_day` atau `is_holiday_day` dalam request body
- Field ini akan dihitung otomatis berdasarkan nilai `schedule_day`
- Implementasi ini memastikan konsistensi data antara field `schedule_day`, `is_schedule_day`, dan `is_holiday_day`
- Build aplikasi berhasil tanpa error setelah implementasi
- Field `schedule_day` dalam response menampilkan nilai asli dari kolom database tanpa default value
- Field `schedule_day_boolean` telah dihapus dan diganti dengan `schedule_day` yang menampilkan value asli
- Debug logging ditambahkan untuk memastikan data yang diambil dari database benar
