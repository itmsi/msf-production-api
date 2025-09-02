# Implementasi Logika Working Day Longshift Boolean

## Deskripsi
Implementasi logika untuk mengupdate kolom `working_longshift`, `working_day_longshift`, dan `working_hour_longshift` berdasarkan nilai `working_day_longshift` dari payload.

## Logika Implementasi

### Jika `working_day_longshift` adalah `true`:
- `working_longshift` = `true`
- `working_day_longshift` = `1`
- `working_hour_longshift` = nilai dari payload `working_hour_longshift`

### Jika `working_day_longshift` adalah `false`:
- `working_longshift` = `false`
- `working_day_longshift` = `0`
- `working_hour_longshift` = `0`

### Jika `working_day_longshift` adalah `number`:
- `working_longshift` = `true` jika nilai > 0, `false` jika nilai = 0
- `working_day_longshift` = nilai number yang diberikan
- `working_hour_longshift` = nilai dari payload `working_hour_longshift` jika longshift aktif, `0` jika tidak

## File yang Dimodifikasi

### 1. Service (`src/modules/plan-working-hour/parent-plan-working-hour.service.ts`)

#### Method `create()`
- Menambahkan logika untuk mengkonversi `total_working_day_longshift` boolean ke number sebelum menyimpan ke database
- Menambahkan logika untuk mengupdate `working_longshift` dan `working_hour_longshift` berdasarkan nilai boolean

#### Method `update()`
- Menambahkan logika untuk mengkonversi `total_working_day_longshift` boolean ke number
- Menambahkan logika untuk mengupdate `working_longshift` dan `working_hour_longshift` berdasarkan nilai boolean

#### Method `updateDetail()`
- Menambahkan logika untuk mengkonversi `working_day_longshift` boolean ke number
- Menambahkan logika untuk mengupdate `working_longshift` dan `working_hour_longshift` berdasarkan nilai boolean

#### Method `updateDetailByPlanWorkingHourId()`
- Menambahkan logika untuk mengkonversi `working_day_longshift` boolean ke number
- Menambahkan logika untuk mengupdate `working_longshift` dan `working_hour_longshift` berdasarkan nilai boolean

### 2. DTO (`src/modules/plan-working-hour/dto/parent-plan-working-hour.dto.ts`)

#### Update Type Definitions
- Mengubah tipe `total_working_day_longshift` dari `number` menjadi `number | boolean`
- Mengubah tipe `working_day_longshift` dari `number` menjadi `number | boolean`

#### Update Validators
- Menambahkan `@ValidateIf` dan `@IsBoolean()` untuk mendukung validasi boolean
- Menambahkan `@ValidateIf` dan `@IsNumber()` untuk mendukung validasi number

#### Update API Documentation
- Menambahkan deskripsi yang menjelaskan dukungan untuk tipe boolean dan number
- Menambahkan contoh nilai boolean dalam examples

## Contoh Penggunaan

### Request dengan Boolean True
```json
{
  "working_day_longshift": true,
  "working_hour_longshift": 12,
  "working_hour_month": 6.45,
  "working_hour_day": 20,
  "mohh_per_month": 24,
  "schedule_day": 0,
  "detail": [...]
}
```

**Hasil:**
- `working_longshift` = `true`
- `working_day_longshift` = `1`
- `working_hour_longshift` = `12`

### Request dengan Boolean False
```json
{
  "working_day_longshift": false,
  "working_hour_longshift": 12,
  "working_hour_month": 6.45,
  "working_hour_day": 20,
  "mohh_per_month": 24,
  "schedule_day": 0,
  "detail": [...]
}
```

**Hasil:**
- `working_longshift` = `false`
- `working_day_longshift` = `0`
- `working_hour_longshift` = `0`

### Request dengan Number
```json
{
  "working_day_longshift": 5,
  "working_hour_longshift": 12,
  "working_hour_month": 6.45,
  "working_hour_day": 20,
  "mohh_per_month": 24,
  "schedule_day": 0,
  "detail": [...]
}
```

**Hasil:**
- `working_longshift` = `true` (karena 5 > 0)
- `working_day_longshift` = `5`
- `working_hour_longshift` = `12`

## Endpoint yang Mendukung

1. `POST /api/parent-plan-working-hour` - Create
2. `PATCH /api/parent-plan-working-hour/:id` - Update
3. `PATCH /api/parent-plan-working-hour/detail/:id` - Update Detail

## Testing

Untuk menguji implementasi, gunakan curl request berikut:

```bash
curl 'http://localhost:9527/api/parent-plan-working-hour/detail/619' \
  -X 'PATCH' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "plan_date":"2025-10-01T17:00:00.000Z",
    "working_hour_month":6.45,
    "working_hour_day":20,
    "mohh_per_month":24,
    "working_hour_longshift":1,
    "working_day_longshift":true,
    "schedule_day":0,
    "detail":[...]
  }'
```

## Catatan Penting

1. **Backward Compatibility**: Implementasi tetap mendukung tipe `number` untuk kompatibilitas dengan kode yang sudah ada
2. **Database Storage**: Nilai boolean akan dikonversi ke number (1 untuk true, 0 untuk false) sebelum disimpan ke database
3. **Validation**: DTO mendukung validasi untuk kedua tipe data (boolean dan number)
4. **API Documentation**: Swagger documentation telah diupdate untuk mencerminkan perubahan tipe data
