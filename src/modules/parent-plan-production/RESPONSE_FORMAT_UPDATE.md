# Response Format Update untuk Parent Plan Production

## Overview
Module parent plan production telah diupdate untuk menggunakan helper function `successResponse` yang konsisten dengan module lainnya. Semua endpoint sekarang mengembalikan response format yang seragam.

## Helper Function yang Digunakan

### Import
```typescript
import { successResponse } from '../../common/helpers/response.helper';
```

### Format Response
```typescript
export function successResponse<T = any>(
  data: T,
  message = 'Retrieve data success',
  statusCode = 200,
): ApiResponse<T> {
  return {
    statusCode,
    message,
    data,
  };
}
```

## Response Format yang Diupdate

### 1. **POST** `/api/parent-plan-production`

**Sebelum:**
```typescript
return this.parentPlanProductionService.create(createDto);
```

**Sesudah:**
```typescript
const result = await this.parentPlanProductionService.create(createDto);
return successResponse(
  result,
  'Parent plan production berhasil dibuat dan data harian berhasil di-generate',
  201,
);
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Parent plan production berhasil dibuat dan data harian berhasil di-generate",
  "data": {
    "id": 1,
    "plan_date": "2025-10-01T00:00:00.000Z",
    "total_calender_day": 31,
    "total_holiday_day": 5,
    "total_available_day": 26,
    "total_average_month_ewh": 34566.0,
    "total_average_day_ewh": 160.0,
    "total_ob_target": 1600000.0,
    "total_ore_target": 800000.0,
    "total_quarry_target": 320000.0,
    "total_sr_target": 2.0,
    "total_ore_shipment_target": 640000.0,
    "total_remaining_stock": 120000.0,
    "total_sisa_stock": 60000.0,
    "total_fleet": 30,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

### 2. **PUT** `/api/parent-plan-production/:id`

**Sebelum:**
```typescript
return this.parentPlanProductionService.update(+id, updateDto);
```

**Sesudah:**
```typescript
const result = await this.parentPlanProductionService.update(+id, updateDto);
return successResponse(
  result,
  'Parent plan production berhasil diupdate dan data harian berhasil di-regenerate',
  200,
);
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Parent plan production berhasil diupdate dan data harian berhasil di-regenerate",
  "data": {
    "id": 3,
    "plan_date": "2025-10-01T00:00:00.000Z",
    "total_calender_day": 31,
    "total_holiday_day": 5,
    "total_available_day": 26,
    "total_average_month_ewh": 34566.0,
    "total_average_day_ewh": 160.0,
    "total_ob_target": 1600000.0,
    "total_ore_target": 800000.0,
    "total_quarry_target": 320000.0,
    "total_sr_target": 2.0,
    "total_ore_shipment_target": 640000.0,
    "total_remaining_stock": 120000.0,
    "total_sisa_stock": 60000.0,
    "total_fleet": 30,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T11:45:00.000Z"
  }
}
```

### 3. **GET** `/api/parent-plan-production`

**Sebelum:**
```typescript
return this.parentPlanProductionService.findAll(query);
```

**Sesudah:**
```typescript
const result = await this.parentPlanProductionService.findAll(query);
return successResponse(
  result.data,
  'Daftar parent plan production berhasil diambil',
  200,
);
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Daftar parent plan production berhasil diambil",
  "data": [
    {
      "id": 1,
      "plan_date": "2025-08-01T00:00:00.000Z",
      "total_calender_day": 31,
      "total_holiday_day": 5,
      "total_available_day": 26,
      "total_average_month_ewh": 4500.0,
      "total_average_day_ewh": 150.0,
      "total_ob_target": 1500000.0,
      "total_ore_target": 750000.0,
      "total_quarry_target": 300000.0,
      "total_sr_target": 2.0,
      "total_ore_shipment_target": 600000.0,
      "total_remaining_stock": 100000.0,
      "total_sisa_stock": 50000.0,
      "total_fleet": 25,
      "created_at": "2025-01-15T10:30:00.000Z",
      "updated_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### 4. **GET** `/api/parent-plan-production/:id`

**Sebelum:**
```typescript
return this.parentPlanProductionService.findOne(+id);
```

**Sesudah:**
```typescript
const result = await this.parentPlanProductionService.findOne(+id);
return successResponse(
  result,
  'Parent plan production berhasil ditemukan',
  200,
);
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Parent plan production berhasil ditemukan",
  "data": {
    "id": 1,
    "plan_date": "2025-08-01T00:00:00.000Z",
    "total_calender_day": 31,
    "total_holiday_day": 5,
    "total_available_day": 26,
    "total_average_month_ewh": 4500.0,
    "total_average_day_ewh": 150.0,
    "total_ob_target": 1500000.0,
    "total_ore_target": 750000.0,
    "total_quarry_target": 300000.0,
    "total_sr_target": 2.0,
    "total_ore_shipment_target": 600000.0,
    "total_remaining_stock": 100000.0,
    "total_sisa_stock": 50000.0,
    "total_fleet": 25,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z",
    "planProductions": [
      {
        "id": 1,
        "plan_date": "2025-08-01T00:00:00.000Z",
        "is_calender_day": true,
        "is_holiday_day": false,
        "is_available_day": true,
        "average_day_ewh": 150.0,
        "ob_target": 48387.1,
        "ore_target": 24193.55,
        "sr_target": 2.0,
        "total_fleet": 25,
        "parent_plan_production_id": 1
      }
    ]
  }
}
```

### 5. **GET** `/api/parent-plan-production/date/:planDate`

**Sebelum:**
```typescript
return this.parentPlanProductionService.findByDate(planDate);
```

**Sesudah:**
```typescript
const result = await this.parentPlanProductionService.findByDate(planDate);
return successResponse(
  result,
  'Parent plan production berhasil ditemukan berdasarkan tanggal',
  200,
);
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Parent plan production berhasil ditemukan berdasarkan tanggal",
  "data": {
    "id": 1,
    "plan_date": "2025-08-01T00:00:00.000Z",
    "total_calender_day": 31,
    "total_holiday_day": 5,
    "total_available_day": 26,
    "total_average_month_ewh": 4500.0,
    "total_average_day_ewh": 150.0,
    "total_ob_target": 1500000.0,
    "total_ore_target": 750000.0,
    "total_quarry_target": 300000.0,
    "total_sr_target": 2.0,
    "total_ore_shipment_target": 600000.0,
    "total_remaining_stock": 100000.0,
    "total_sisa_stock": 50000.0,
    "total_fleet": 25,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z",
    "planProductions": [...]
  }
}
```

### 6. **DELETE** `/api/parent-plan-production/:id`

**Sebelum:**
```typescript
return {
  statusCode: 200,
  message: 'Parent plan production berhasil dihapus',
  data: result,
};
```

**Sesudah:**
```typescript
return successResponse(
  result,
  'Parent plan production dan data harian berhasil dihapus',
  200,
);
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Parent plan production dan data harian berhasil dihapus",
  "data": {
    "message": "Parent plan production dan data harian berhasil dihapus",
    "deletedId": 1,
    "deletedPlanDate": "2025-08-01T00:00:00.000Z",
    "deletedDailyRecords": 31
  }
}
```

## Keuntungan Update Response Format

### 1. **Konsistensi**
- Semua endpoint menggunakan format response yang sama
- Konsisten dengan module lainnya di aplikasi
- Mudah diprediksi oleh frontend developer

### 2. **Struktur yang Jelas**
- `statusCode`: HTTP status code
- `message`: Pesan sukses yang informatif
- `data`: Data yang diminta

### 3. **Maintainability**
- Menggunakan helper function yang terpusat
- Mudah diubah jika ada perubahan format response
- Mengurangi duplikasi kode

### 4. **Error Handling**
- Format response yang konsisten memudahkan error handling
- Frontend dapat dengan mudah mendeteksi status response

## Contoh Penggunaan

### cURL Request untuk PUT
```bash
curl -X 'PUT' \
  'https://dev-msf-revenues-api.motorsights.com/api/parent-plan-production/3' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
  "plan_date": "2025-10-01",
  "total_average_day_ewh": 160,
  "total_average_month_ewh": 34566,
  "total_ob_target": 1600000,
  "total_ore_target": 800000,
  "total_quarry_target": 320000,
  "total_ore_shipment_target": 640000,
  "total_sisa_stock": 60000,
  "total_fleet": 30
}'
```

### Response Sukses
```json
{
  "statusCode": 200,
  "message": "Parent plan production berhasil diupdate dan data harian berhasil di-regenerate",
  "data": {
    "id": 3,
    "plan_date": "2025-10-01T00:00:00.000Z",
    "total_calender_day": 31,
    "total_holiday_day": 5,
    "total_available_day": 26,
    "total_average_month_ewh": 34566.0,
    "total_average_day_ewh": 160.0,
    "total_ob_target": 1600000.0,
    "total_ore_target": 800000.0,
    "total_quarry_target": 320000.0,
    "total_sr_target": 2.0,
    "total_ore_shipment_target": 640000.0,
    "total_remaining_stock": 120000.0,
    "total_sisa_stock": 60000.0,
    "total_fleet": 30,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T11:45:00.000Z"
  }
}
```

## Catatan Penting

1. **Semua endpoint** sekarang menggunakan `successResponse` helper function
2. **Format response** konsisten dengan module lainnya
3. **Status code** sesuai dengan operasi (201 untuk create, 200 untuk lainnya)
4. **Message** informatif dan dalam bahasa Indonesia
5. **Data** tetap sama seperti sebelumnya, hanya format response yang berubah

## Testing

Setelah update, pastikan untuk test semua endpoint:
1. **POST** - Create parent plan production
2. **PUT** - Update parent plan production
3. **GET** - Get all parent plan production
4. **GET** - Get parent plan production by ID
5. **GET** - Get parent plan production by date
6. **DELETE** - Delete parent plan production

Semua endpoint harus mengembalikan response format yang konsisten.
