# Implementasi Number Format Interceptor

## Overview
Interceptor ini dibuat untuk memformat semua angka dalam response API agar hanya memiliki 2 digit di belakang koma. Hal ini memastikan konsistensi format angka di seluruh aplikasi.

## File yang Dibuat/Dimodifikasi

### 1. Interceptor Baru
- **File**: `src/common/interceptors/number-format.interceptor.ts`
- **Fungsi**: Memformat semua angka dalam response ke 2 digit di belakang koma

### 2. Controller yang Dimodifikasi
- **File**: `src/modules/daily-plan-production/daily-plan-production.controller.ts`
- **Endpoint yang Diterapkan**:
  - `POST /daily-plan-production` - Create
  - `GET /daily-plan-production` - Get All
  - `GET /daily-plan-production/:id` - Get by ID
  - `PATCH /daily-plan-production/:id` - Update
  - `DELETE /daily-plan-production/:id` - Delete

### 3. File Index yang Dibuat
- `src/common/interceptors/index.ts`
- `src/common/index.ts`
- `src/common/helpers/index.ts`
- `src/common/guard/index.ts`

## Cara Kerja Interceptor

### 1. Format Number
```typescript
if (typeof data === 'number') {
  // Jika data adalah number, format ke 2 digit di belakang koma
  return Number(data.toFixed(2));
}
```

### 2. Format String yang Bisa Dikonversi ke Number
```typescript
if (typeof data === 'string') {
  // Jika data adalah string, cek apakah bisa dikonversi ke number
  const num = parseFloat(data);
  if (!isNaN(num)) {
    return Number(num.toFixed(2));
  }
  return data;
}
```

### 3. Format Array
```typescript
if (Array.isArray(data)) {
  // Jika data adalah array, format setiap elemen
  return data.map((item) => this.formatNumbers(item));
}
```

### 4. Format Object (Selektif)
```typescript
if (typeof data === 'object') {
  // Jika data adalah object, format hanya field numeric/pecahan
  const formattedData: any = {};
  for (const [key, value] of Object.entries(data)) {
    // Skip field yang tidak boleh diformat (tanggal, boolean, string non-numeric)
    if (this.shouldSkipFormatting(key, value)) {
      formattedData[key] = value;
        } else {
          formattedData[key] = this.formatNumbers(value);
        }
      }
      return formattedData;
    }
```

### 5. Field yang Di-skip (Tidak Diformat)
```typescript
private shouldSkipFormatting(key: string, value: any): boolean {
  // Skip field yang tidak boleh diformat
  const skipFields = [
    'id', 'createdAt', 'updatedAt', 'deletedAt', 'plan_date',
    'is_calender_day', 'is_holiday_day', 'is_available_day',
    'schedule_day', 'total_fleet'
  ];

  // Skip jika key ada dalam daftar skip
  if (skipFields.includes(key)) {
    return true;
  }

  // Skip jika value adalah Date object
  if (value instanceof Date) {
    return true;
  }

  // Skip jika value adalah boolean
  if (typeof value === 'boolean') {
    return true;
  }

  // Skip jika value adalah string yang bukan numeric
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return true;
    }
  }

  return false;
}
```

## Contoh Penggunaan

### Sebelum Interceptor
```json
{
  "statusCode": 200,
  "message": "Data daily plan production berhasil diambil",
  "data": {
    "id": 303,
    "plan_date": "2025-01-01T00:00:00.000Z",
    "is_calender_day": true,
    "is_holiday_day": false,
    "is_available_day": true,
    "average_day_ewh": 1.567890123,
    "average_shift_ewh": 0.753456789,
    "ob_target": 1000.123456789,
    "ore_target": 800.987654321,
    "quarry": 200.555555555,
    "sr_target": 1.2345678901234567,
    "ore_shipment_target": 750.111111111,
    "daily_old_stock": 0.000000000,
    "shift_ob_target": 500.061728394,
    "shift_ore_target": 400.493827160,
    "shift_quarry": 100.277777777,
    "shift_sr_target": 1.2345678901234567,
    "total_fleet": 15,
    "remaining_stock": 50.111111111,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Setelah Interceptor (Hanya Field Numeric/Pecahan yang Diformat)
```json
{
  "statusCode": 200,
  "message": "Data daily plan production berhasil diambil",
  "data": {
    "id": 303,
    "plan_date": "2025-01-01T00:00:00.000Z",
    "is_calender_day": true,
    "is_holiday_day": false,
    "is_available_day": true,
    "average_day_ewh": 1.57,
    "average_shift_ewh": 0.75,
    "ob_target": 1000.12,
    "ore_target": 800.99,
    "quarry": 200.56,
    "sr_target": 1.23,
    "ore_shipment_target": 750.11,
    "daily_old_stock": 0.00,
    "shift_ob_target": 500.06,
    "shift_ore_target": 400.49,
    "shift_quarry": 100.28,
    "shift_sr_target": 1.23,
    "total_fleet": 15,
    "remaining_stock": 50.11,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Field yang Diformat (Numeric/Pecahan)
- `average_day_ewh`: 1.567890123 → 1.57
- `average_shift_ewh`: 0.753456789 → 0.75
- `ob_target`: 1000.123456789 → 1000.12
- `ore_target`: 800.987654321 → 800.99
- `quarry`: 200.555555555 → 200.56
- `sr_target`: 1.2345678901234567 → 1.23
- `ore_shipment_target`: 750.111111111 → 750.11
- `daily_old_stock`: 0.000000000 → 0.00
- `shift_ob_target`: 500.061728394 → 500.06
- `shift_ore_target`: 400.493827160 → 400.49
- `shift_quarry`: 100.277777777 → 100.28
- `shift_sr_target`: 1.2345678901234567 → 1.23
- `remaining_stock`: 50.111111111 → 50.11

### Field yang Tidak Diformat (Dibiarkan Asli)
- `id`: 303 (integer)
- `plan_date`: "2025-01-01T00:00:00.000Z" (tanggal)
- `is_calender_day`: true (boolean)
- `is_holiday_day`: false (boolean)
- `is_available_day`: true (boolean)
- `total_fleet`: 15 (integer)
- `createdAt`: "2025-01-01T00:00:00.000Z" (tanggal)
- `updatedAt`: "2025-01-01T00:00:00.000Z" (tanggal)

## Implementasi di Controller

```typescript
@UseGuards(JwtAuthGuard)
@UseInterceptors(NumberFormatInterceptor)
@Get(':id')
findOne(@Param('id') id: string) {
  return this.dailyPlanProductionService.findOne(+id);
}
```

## Keuntungan

1. **Konsistensi Format**: Hanya field numeric/pecahan yang diformat ke 2 digit di belakang koma
2. **Selektif**: Field non-numeric seperti tanggal, boolean, dan integer tidak diubah
3. **Otomatis**: Tidak perlu memodifikasi setiap service atau response
4. **Fleksibel**: Bisa diterapkan ke endpoint mana saja
5. **Maintainable**: Mudah untuk diubah atau diperluas
6. **Data Integrity**: Mempertahankan tipe data asli untuk field yang tidak seharusnya diformat

## Testing

Untuk memastikan interceptor berfungsi dengan baik, test endpoint berikut:

```bash
# Test endpoint GET by ID
curl -X GET "https://dev-msf-revenues-api.motorsights.com/api/daily-plan-production/303" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test endpoint GET All
curl -X GET "https://dev-msf-revenues-api.motorsights.com/api/daily-plan-production" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Catatan Penting

1. **Performance**: Interceptor akan memproses semua response, pastikan tidak ada impact performance yang signifikan
2. **Data Type**: Pastikan field yang seharusnya integer tidak berubah menjadi float
3. **Testing**: Test dengan berbagai tipe data untuk memastikan tidak ada side effect

## Troubleshooting

Jika ada masalah dengan interceptor:

1. **Check Console**: Lihat error di console aplikasi
2. **Verify Import**: Pastikan import interceptor sudah benar
3. **Check Decorator**: Pastikan `@UseInterceptors(NumberFormatInterceptor)` sudah diterapkan
4. **Build Error**: Jalankan `npm run build` untuk memastikan tidak ada syntax error
