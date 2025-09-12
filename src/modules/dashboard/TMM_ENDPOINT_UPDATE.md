# TMM Endpoint Update Implementation

## Overview
Endpoint `/api/dashboard/tmm` telah diupdate sesuai dengan spesifikasi yang diberikan untuk menggunakan data dari tabel `analysis_hauling_barging` dengan filter berdasarkan tanggal.

## Perubahan yang Dibuat

### 1. Dashboard Service Update (src/modules/dashboard/dashboard.service.ts)
- Mengupdate method `getTmmData()` untuk menggunakan data real dari database
- Menambahkan parameter `startDate` dan `endDate` untuk filtering
- Menggunakan query yang mengambil data dari tabel:
  - `r_parent_base_data_pro` (untuk activity_date)
  - `r_base_data_pro` (untuk material, activity, total_vessel)
  - `m_population` (untuk tyre_type)

### 2. Dashboard Controller Update (src/modules/dashboard/dashboard.controller.ts)
- Menambahkan query parameters `startDate` dan `endDate`
- Mengupdate Swagger documentation untuk parameter baru
- Menambahkan deskripsi yang lebih detail tentang endpoint

## Formula Implementasi

### Data Sources:
- **Date**: Diambil dari `r_parent_base_data_pro.activity_date`
- **Ore Hauling**: `material = 'ore'` AND `activity = 'hauling'`
- **OB (Overburden)**: `material = 'ob'`
- **TMM**: Penjumlahan dari Ore Hauling + OB

### Calculations:
- **Ore Hauling BCM**: `total_vessel * factor` berdasarkan `tyre_type`
  - 6x4: factor = 26.56
  - 8x4: factor = 29.56
- **OB BCM**: `(total_vessel * factor) / 1.6` berdasarkan `tyre_type`
  - 6x4: factor = 26.56
  - 8x4: factor = 29.56
- **TMM BCM**: Ore Hauling BCM + OB BCM

### Filter:
- Filter berdasarkan `r_parent_base_data_pro.activity_date` BETWEEN `${start_date}` AND `${end_date}`
- Default range: 7 hari terakhir jika tidak ada parameter tanggal

## Response Format
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "date": "01/07",
      "ore": 500,
      "over": 1400,
      "tmm": 2000
    },
    {
      "date": "02/07",
      "ore": 700,
      "over": 1600,
      "tmm": 2400
    }
  ]
}
```

## API Usage

### Endpoint:
```
GET /api/dashboard/tmm
```

### Query Parameters:
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format

### Example Request:
```bash
curl -X 'GET' \
  'http://localhost:9539/api/dashboard/tmm?startDate=2024-01-01&endDate=2024-01-31' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>'
```

### Example Response:
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "date": "01/01",
      "ore": 500,
      "over": 1400,
      "tmm": 2000
    },
    {
      "date": "02/01",
      "ore": 700,
      "over": 1600,
      "tmm": 2400
    }
  ]
}
```

## Database Query Logic

Query utama mengambil data dengan logika berikut:

1. **Join Tables**: 
   - `r_parent_base_data_pro` → `r_base_data_pro` → `m_population`

2. **Filter Conditions**:
   - Date range filtering
   - Material type filtering (ore hauling dan ob)
   - Exclude deleted records

3. **Aggregation**:
   - Group by date
   - Sum calculations berdasarkan tyre_type
   - Calculate BCM values

4. **Formatting**:
   - Format date sebagai DD/MM
   - Round values ke integer
   - Calculate TMM sebagai sum dari ore + over

## Error Handling

- Database connection errors
- Invalid date format
- Missing data scenarios
- Query execution errors

Semua error akan dikembalikan dengan status code 500 dan pesan error yang sesuai.
