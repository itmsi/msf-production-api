# Daily Plan Production API Documentation

## Overview

Module Daily Plan Production menyediakan endpoint CRUD untuk mengelola data rencana produksi harian. Module ini menggunakan tabel `r_plan_production` dengan logika bisnis yang kompleks termasuk perhitungan otomatis dan validasi data.

## Base URL

```
http://localhost:3000/daily-plan-production
```

## Authentication

Semua endpoint memerlukan JWT authentication. Tambahkan header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Daily Plan Production

**POST** `/daily-plan-production`

Membuat rencana produksi harian baru dengan validasi dan perhitungan otomatis.

#### Request Body

```json
{
  "plan_date": "2025-01-01",
  "average_day_ewh": 1.5,
  "average_shift_ewh": 0.75,
  "ob_target": 1000,
  "ore_target": 800,
  "quarry": 200,
  "ore_shipment_target": 750,
  "total_fleet": 15
}
```

#### Field Descriptions

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `plan_date` | string | Yes | Tanggal rencana (YYYY-MM-DD) | Format date valid |
| `average_day_ewh` | number | Yes | Rata-rata EWH per hari | Number > 0 |
| `average_shift_ewh` | number | Yes | Rata-rata EWH per shift | Number > 0 |
| `ob_target` | number | Yes | Target OB (Overburden) | Number > 0 |
| `ore_target` | number | Yes | Target ore | Number > 0 |
| `quarry` | number | Yes | Target quarry | Number > 0 |
| `ore_shipment_target` | number | Yes | Target pengiriman ore | Number > 0 |
| `total_fleet` | number | Yes | Total armada | Integer > 0 |

#### Response Success (201)

```json
{
  "statusCode": 200,
  "message": "Daily plan production berhasil dibuat",
  "data": {
    "id": 1,
    "plan_date": "2025-01-01T00:00:00.000Z",
    "is_calender_day": true,
    "is_holiday_day": false,
    "is_available_day": true,
    "average_day_ewh": 1.5,
    "average_shift_ewh": 0.75,
    "ob_target": 1000,
    "ore_target": 800,
    "quarry": 200,
    "sr_target": 1.25,
    "ore_shipment_target": 750,
    "daily_old_stock": 0,
    "shift_ob_target": 500,
    "shift_ore_target": 400,
    "shift_quarrt": 100,
    "shift_sr_target": 1.25,
    "total_fleet": 15,
    "remaining_stock": 50,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Response Error (400)

```json
{
  "statusCode": 400,
  "message": "Plan date sudah ada dalam database"
}
```

### 2. Get All Daily Plan Production

**GET** `/daily-plan-production`

Mengambil semua data rencana produksi dengan pagination dan filter.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | string | No | - | Filter tanggal mulai (YYYY-MM-DD) |
| `end_date` | string | No | - | Filter tanggal akhir (YYYY-MM-DD) |
| `page` | number | No | 1 | Nomor halaman |
| `limit` | number | No | 10 | Jumlah data per halaman |

#### Example Request

```
GET /daily-plan-production?start_date=2025-01-01&end_date=2025-01-31&page=1&limit=20
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Data daily plan production berhasil diambil",
  "data": {
    "data": [
      {
        "id": 1,
        "plan_date": "2025-01-01T00:00:00.000Z",
        "is_calender_day": true,
        "is_holiday_day": false,
        "is_available_day": true,
        "average_day_ewh": 1.5,
        "average_shift_ewh": 0.75,
        "ob_target": 1000,
        "ore_target": 800,
        "quarry": 200,
        "sr_target": 1.25,
        "ore_shipment_target": 750,
        "daily_old_stock": 0,
        "shift_ob_target": 500,
        "shift_ore_target": 400,
        "shift_quarrt": 100,
        "shift_sr_target": 1.25,
        "total_fleet": 15,
        "remaining_stock": 50,
        "isAvailableToEdit": true,
        "isAvailableToDelete": true,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 3. Get Daily Plan Production by ID

**GET** `/daily-plan-production/:id`

Mengambil data rencana produksi berdasarkan ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID rencana produksi |

#### Example Request

```
GET /daily-plan-production/1
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Data daily plan production berhasil diambil",
  "data": {
    "id": 1,
    "plan_date": "2025-01-01T00:00:00.000Z",
    "is_calender_day": true,
    "is_holiday_day": false,
    "is_available_day": true,
    "average_day_ewh": 1.5,
    "average_shift_ewh": 0.75,
    "ob_target": 1000,
    "ore_target": 800,
    "quarry": 200,
    "sr_target": 1.25,
    "ore_shipment_target": 750,
    "daily_old_stock": 0,
    "shift_ob_target": 500,
    "shift_ore_target": 400,
    "shift_quarrt": 100,
    "shift_sr_target": 1.25,
    "total_fleet": 15,
    "remaining_stock": 50,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Response Error (404)

```json
{
  "statusCode": 404,
  "message": "Daily plan production tidak ditemukan"
}
```

### 4. Update Daily Plan Production

**PATCH** `/daily-plan-production/:id`

Update data rencana produksi berdasarkan ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID rencana produksi |

#### Request Body

```json
{
  "ob_target": 1200,
  "ore_target": 900,
  "quarry": 250
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `plan_date` | string | No | Tanggal rencana (YYYY-MM-DD) |
| `average_day_ewh` | number | No | Rata-rata EWH per hari |
| `average_shift_ewh` | number | No | Rata-rata EWH per shift |
| `ob_target` | number | No | Target OB (Overburden) |
| `ore_target` | number | No | Target ore |
| `quarry` | number | No | Target quarry |
| `ore_shipment_target` | number | No | Target pengiriman ore |
| `total_fleet` | number | No | Total armada |

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Daily plan production berhasil diupdate",
  "data": {
    "id": 1,
    "plan_date": "2025-01-01T00:00:00.000Z",
    "is_calender_day": true,
    "is_holiday_day": false,
    "is_available_day": true,
    "average_day_ewh": 1.5,
    "average_shift_ewh": 0.75,
    "ob_target": 1200,
    "ore_target": 900,
    "quarry": 250,
    "sr_target": 1.33,
    "ore_shipment_target": 750,
    "daily_old_stock": 0,
    "shift_ob_target": 600,
    "shift_ore_target": 450,
    "shift_quarrt": 125,
    "shift_sr_target": 1.33,
    "total_fleet": 15,
    "remaining_stock": 150,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 5. Delete Daily Plan Production

**DELETE** `/daily-plan-production/:id`

Soft delete data rencana produksi berdasarkan ID.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | ID rencana produksi |

#### Example Request

```
DELETE /daily-plan-production/1
```

#### Response Success (200)

```json
{
  "statusCode": 200,
  "message": "Daily plan production berhasil dihapus",
  "data": null
}
```

## Business Logic

### 1. Validasi Tanggal

- Sistem akan mengecek apakah `plan_date` sudah ada di database
- Jika sudah ada, akan mengembalikan error "Plan date sudah ada dalam database"
- Validasi ini berlaku untuk operasi CREATE dan UPDATE

### 2. Perhitungan Otomatis

Sistem akan menghitung nilai-nilai berikut secara otomatis:

| Field | Formula | Description |
|-------|---------|-------------|
| `sr_target` | `ob_target / ore_target` | Stripping ratio target |
| `shift_ob_target` | `ob_target / 2` | Target OB per shift |
| `shift_ore_target` | `ore_target / 2` | Target ore per shift |
| `shift_quarrt` | `quarry / 2` | Target quarry per shift |
| `shift_sr_target` | `shift_ob_target / shift_ore_target` | SR target per shift |
| `remaining_stock` | `old_stock_global - ore_shipment_target + ore_target` | Stock tersisa |

### 3. Logika Boolean

| Field | Logic | Description |
|-------|-------|-------------|
| `is_calender_day` | `plan_date.getTime() > 0` | True jika tanggal valid |
| `is_holiday_day` | `!is_calender_day` | True jika tanggal tidak valid |
| `is_available_day` | `dayOfWeek !== 0` | False jika hari minggu |

### 4. Old Stock Global

- Sistem mengambil nilai `daily_old_stock` dari data sebelumnya
- Data diurutkan berdasarkan `plan_date` terbaru
- Jika tidak ada data sebelumnya, nilai default adalah 0

## Error Handling

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Validasi gagal atau data duplikat |
| 401 | Unauthorized - JWT token tidak valid |
| 404 | Not Found - Data tidak ditemukan |
| 500 | Internal Server Error - Error server |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": true,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Testing

### Test dengan cURL

```bash
# Create
curl -X POST http://localhost:3000/daily-plan-production \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "plan_date": "2025-01-01",
    "average_day_ewh": 1.5,
    "average_shift_ewh": 0.75,
    "ob_target": 1000,
    "ore_target": 800,
    "quarry": 200,
    "ore_shipment_target": 750,
    "total_fleet": 15
  }'

# Get All
curl -H "Authorization: Bearer <your-token>" \
  "http://localhost:3000/daily-plan-production?page=1&limit=10"

# Get by ID
curl -H "Authorization: Bearer <your-token>" \
  "http://localhost:3000/daily-plan-production/1"

# Update
curl -X PATCH http://localhost:3000/daily-plan-production/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"ob_target": 1200}'

# Delete
curl -X DELETE http://localhost:3000/daily-plan-production/1 \
  -H "Authorization: Bearer <your-token>"
```

### Test dengan Postman

1. Import collection ke Postman
2. Set environment variable `base_url` dan `token`
3. Jalankan request secara berurutan
4. Verifikasi response dan business logic

## Notes

- Semua operasi DELETE menggunakan soft delete
- Data yang sudah dihapus masih tersimpan di database dengan flag `deletedAt`
- Perhitungan otomatis akan dijalankan setiap kali ada perubahan data
- Validasi tanggal mencegah duplikasi data berdasarkan tanggal yang sama
- Module ini terintegrasi dengan sistem authentication JWT
