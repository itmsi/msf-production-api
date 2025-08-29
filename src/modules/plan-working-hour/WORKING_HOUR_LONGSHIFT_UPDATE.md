# Update Kolom working_hour_longshift

## Deskripsi Perubahan

Berdasarkan permintaan user, kolom `working_hour_longshift` di tabel `r_plan_working_hour` sekarang akan selalu di-set ke nilai **0** secara otomatis, terlepas dari nilai yang diinput di field `total_working_hour_longshift`.

## Detail Perubahan

### 1. Service Update
**File**: `src/modules/plan-working-hour/parent-plan-working-hour.service.ts`
**Baris**: 185

**Sebelum**:
```typescript
working_hour_longshift: createDto.total_working_hour_longshift,
```

**Sesudah**:
```typescript
working_hour_longshift: 0, // Set default ke 0 sesuai permintaan
```

### 2. API Documentation Update
**File**: `src/modules/plan-working-hour/parent-plan-working-hour.controller.ts`

**Dokumentasi proses yang dijalankan**:
- `working_hour_longshift: 0 (selalu di-set ke 0)`

**Contoh request dan response**:
- `total_working_hour_longshift: 0` (dalam contoh request)
- `working_hour_longshift: 0` (dalam contoh response)

## Alur Proses

1. User mengirim request dengan field `total_working_hour_longshift` (bisa berapa saja)
2. Data disimpan ke tabel `r_parent_plan_working_hour` dengan nilai asli
3. Data di-generate ke tabel `r_plan_working_hour` dengan kolom `working_hour_longshift` selalu bernilai **0**
4. Detail activities disimpan ke tabel `r_plan_working_hour_detail`

## Contoh Request

```bash
curl -X 'POST' \
  'http://localhost:9526/api/parent-plan-working-hour' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
  "plan_date": "2025-08-01",
  "total_calendar_day": 31,
  "total_holiday_day": 8,
  "total_available_day": 23,
  "total_working_hour_month": 184,
  "total_working_day_longshift": 5,
  "total_working_hour_day": 8,
  "total_working_hour_longshift": 0,
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

## Hasil yang Diharapkan

- Field `total_working_hour_longshift` di tabel `r_parent_plan_working_hour` akan menyimpan nilai yang diinput user
- Field `working_hour_longshift` di tabel `r_plan_working_hour` akan selalu bernilai **0** untuk semua record yang di-generate
- Proses generate data tetap berjalan normal dengan perbedaan hanya pada kolom `working_hour_longshift`

## Catatan

- Perubahan ini tidak mempengaruhi field lain
- User masih bisa menginput nilai apapun untuk `total_working_hour_longshift`
- Nilai `working_hour_longshift` di tabel detail akan selalu 0
- Tidak ada validasi tambahan yang diperlukan
