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

### 4. Format Object
```typescript
if (typeof data === 'object') {
  // Jika data adalah object, format setiap property
  const formattedData: any = {};
  for (const [key, value] of Object.entries(data)) {
    formattedData[key] = this.formatNumbers(value);
  }
  return formattedData;
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
    "average_day_ewh": 1.567890123,
    "ob_target": 1000.123456789,
    "sr_target": 1.2345678901234567
  }
}
```

### Setelah Interceptor
```json
{
  "statusCode": 200,
  "message": "Data daily plan production berhasil diambil",
  "data": {
    "id": 303,
    "average_day_ewh": 1.57,
    "ob_target": 1000.12,
    "sr_target": 1.23
  }
}
```

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

1. **Konsistensi Format**: Semua angka akan memiliki format yang sama (2 digit di belakang koma)
2. **Otomatis**: Tidak perlu memodifikasi setiap service atau response
3. **Fleksibel**: Bisa diterapkan ke endpoint mana saja
4. **Maintainable**: Mudah untuk diubah atau diperluas

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
