# Summary Production API Documentation

## Overview
Module Summary Production menyediakan endpoint untuk mengambil data summary production dengan berbagai filter yang dapat diterapkan.

## Endpoints

### GET /summary-production

Mengambil data summary production dengan filter opsional.

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| startDate | string | No | Start date untuk filter (format YYYY-MM-DD) | 2025-01-01 |
| endDate | string | No | End date untuk filter (format YYYY-MM-DD) | 2025-01-31 |
| dtType | string | No | Filter berdasarkan DT Type (10, 12, atau N/A) | 10 |
| material | string | No | Filter berdasarkan material type | ore barge |

#### Response Format

```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "dt_type": "10",
      "unit": "DT-001",
      "date": "2025-01-15",
      "material_type": "ore barge",
      "vessel": 5,
      "tonnage": 132.8
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| dt_type | string | DT Type (10 untuk 6x4, 12 untuk 8x4, N/A untuk lainnya) |
| unit | string | Nomor unit |
| date | string | Tanggal dalam format YYYY-MM-DD |
| material_type | string | Jenis material |
| vessel | number | Jumlah vessel |
| tonnage | number | Tonnage yang dihitung |

#### Example Requests

1. **Get all data:**
   ```
   GET /summary-production
   ```

2. **Filter by date range:**
   ```
   GET /summary-production?startDate=2025-01-01&endDate=2025-01-31
   ```

3. **Filter by DT Type:**
   ```
   GET /summary-production?dtType=10
   ```

4. **Filter by material:**
   ```
   GET /summary-production?material=ore barge
   ```

5. **Combined filters:**
   ```
   GET /summary-production?startDate=2025-01-01&endDate=2025-01-31&dtType=10&material=ore
   ```

## Database Function

Module ini menggunakan database function `get_summary_production()` yang dibuat melalui migration. Function ini mengambil data dari tabel:
- `r_parent_base_data_pro`
- `r_base_data_pro` 
- `m_population`

## Error Handling

Jika terjadi error, response akan mengembalikan:

```json
{
  "statusCode": 500,
  "message": "Error executing summary production query",
  "error": "Error message details"
}
```

## Authentication

Endpoint ini memerlukan JWT authentication dengan header:
```
Authorization: Bearer <token>
```
