# Perbaikan Rounding untuk Field month_year

## Masalah
Field `month_year` dalam response API parent-plan-production mengalami rounding yang tidak diinginkan. Field ini seharusnya tetap dalam format string "YYYY-MM" (contoh: "2025-01") tanpa di-round.

## Penyebab
`NumberFormatInterceptor` secara otomatis melakukan rounding ke 2 digit di belakang koma untuk semua field numeric. Field `month_year` yang memiliki format string "YYYY-MM" dikenali sebagai numeric string oleh interceptor dan di-round.

## Solusi
Menambahkan `month_year` ke daftar `skipFields` dalam `NumberFormatInterceptor` agar field ini tidak diformat.

## Perubahan yang Dilakukan

### File: `src/common/interceptors/number-format.interceptor.ts`

**Sebelum:**
```typescript
const skipFields = [
  'id', 'createdAt', 'updatedAt', 'deletedAt', 'plan_date', 'date',
  'is_calender_day', 'is_holiday_day', 'is_available_day',
  'schedule_day', 'total_fleet'
];
```

**Sesudah:**
```typescript
const skipFields = [
  'id', 'createdAt', 'updatedAt', 'deletedAt', 'plan_date', 'date',
  'is_calender_day', 'is_holiday_day', 'is_available_day',
  'schedule_day', 'total_fleet', 'month_year'
];
```

## Hasil

### Sebelum Perbaikan
```json
{
  "id": 21,
  "month_year": 2025.10,  // Di-round menjadi number
  "available_day": 31,
  "holiday_day": 0,
  "calendar_day": 31,
  "average_month_ewh": 312,
  "average_day_ewh": 24,
  "ob_target": 312,
  "ore_target": 312,
  "quarry_target": 312,
  "sr_target": 1,
  "ore_shipment_target": 312,
  "sisa_stock": 312,
  "is_available_to_edit": true,
  "is_available_to_delete": true
}
```

### Sesudah Perbaikan
```json
{
  "id": 21,
  "month_year": "2025-10",  // Tetap dalam format string yang benar
  "available_day": 31,
  "holiday_day": 0,
  "calendar_day": 31,
  "average_month_ewh": 312,
  "average_day_ewh": 24,
  "ob_target": 312,
  "ore_target": 312,
  "quarry_target": 312,
  "sr_target": 1,
  "ore_shipment_target": 312,
  "sisa_stock": 312,
  "is_available_to_edit": true,
  "is_available_to_delete": true
}
```

## Testing

### Test Command
```bash
curl 'http://localhost:9527/api/parent-plan-production?page=1&limit=10&sortOrder=DESC' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  | jq '.data[0].month_year'
```

### Expected Output
```json
"2025-10"
```

## Dampak

### ✅ Positif
- Field `month_year` sekarang tetap dalam format string yang benar
- Frontend dapat memproses data dengan format yang diharapkan
- Konsistensi data untuk field tanggal/bulan

### ⚠️ Tidak Berubah
- Field numeric lainnya tetap di-round ke 2 digit di belakang koma
- Performance tidak terpengaruh
- API contract tetap sama

## Catatan Penting

1. **Field Type**: `month_year` sekarang diakui sebagai field non-numeric oleh interceptor
2. **Format Consistency**: Format "YYYY-MM" dipertahankan untuk semua response
3. **Backward Compatibility**: Perubahan ini tidak mempengaruhi API yang sudah ada
4. **Future Fields**: Jika ada field serupa di masa depan, tambahkan ke `skipFields`

## Kesimpulan

Perbaikan ini memastikan bahwa field `month_year` tidak mengalami rounding yang tidak diinginkan, sambil tetap mempertahankan fungsionalitas rounding untuk field numeric lainnya. Field ini sekarang dikembalikan dalam format string yang benar sesuai dengan kebutuhan frontend.
