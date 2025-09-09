# Analysis Hauling Barging Module

Module ini menyediakan API untuk mengambil data analisis hauling dan barging berdasarkan data produksi yang ada.

## Fitur

- ✅ GET endpoint untuk mengambil data analysis hauling barging
- ✅ Filter berdasarkan date range (startDate, endDate)
- ✅ Pagination dengan page dan limit
- ✅ Swagger documentation
- ✅ JWT Authentication
- ✅ Error handling

## Struktur File

```
src/modules/analysis-hauling-barging/
├── entities/
│   └── analysis-hauling-barging.entity.ts    # Entity untuk response data
├── dto/
│   └── analysis-hauling-barging.dto.ts       # DTO untuk request/response
├── analysis-hauling-barging.controller.ts   # Controller dengan endpoint GET
├── analysis-hauling-barging.service.ts        # Service dengan business logic
├── analysis-hauling-barging.module.ts          # Module configuration
├── index.ts                                   # Export file
└── API_DOCUMENTATION.md                      # File ini
```

## Database Logic

Module ini mengambil data dari tabel-tabel berikut:

### Data Sources:
- `r_parent_base_data_pro` - Parent base data production (untuk date_arrive)
- `r_base_data_pro` - Base data production (untuk material, activity, total_vessel)
- `m_population` - Population data (untuk no_unit, tyre_type)

### Business Logic:

#### 1. Ore Barge
- **Vessel**: `total_vessel` dari `r_base_data_pro` dimana `material = 'ore-barge'` dan `activity = 'barging'`
- **Tonnage**: `total_vessel * factor` berdasarkan `tyre_type` (6x4 = 26.56, 8x4 = 29.56)
- **BCM**: `tonnage / 1.6`

#### 2. Ore Hauling
- **Vessel**: `total_vessel` dari `r_base_data_pro` dimana `material = 'ore'` dan `activity = 'hauling'`
- **Tonnage**: `total_vessel * factor` berdasarkan `tyre_type`
- **BCM**: `tonnage / 1.6`

#### 3. OB (Overburden)
- **Vessel**: `total_vessel` dari `r_base_data_pro` dimana `material = 'ob'`
- **Tonnage**: `total_vessel * factor` berdasarkan `tyre_type`
- **BCM**: `tonnage / 1.6`

#### 4. TMM (Total Material Movement)
- **Vessel**: `ore_hauling_vessel + ob_vessel`
- **Tonnage**: `ore_hauling_tonnage + ob_tonnage`
- **BCM**: `ore_hauling_bcm + ob_bcm`

## Endpoint

### GET /analysis-hauling-barging

Mengambil data analysis hauling barging dengan filter opsional.

**Query Parameters:**
- `startDate` (optional): Start date untuk filter (YYYY-MM-DD)
- `endDate` (optional): End date untuk filter (YYYY-MM-DD)
- `page` (optional): Page number untuk pagination (default: 1)
- `limit` (optional): Limit data per page (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "message": "Data analysis hauling barging berhasil diambil",
  "data": [
    {
      "date": "2024-01-01",
      "bargeVessel": 5,
      "bargeBCM": 125.5,
      "bargeTonnage": 200.8,
      "oreHaulingVessel": 8,
      "oreHaulingBCM": 200.0,
      "oreHaulingTonnage": 320.0,
      "obVessel": 12,
      "obBCM": 300.0,
      "obTonnage": 480.0,
      "tmmVessel": 20,
      "tmmBCM": 500.0,
      "tmmTonnage": 800.0
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "lastPage": 10
  }
}
```

## Authentication

Semua endpoint memerlukan JWT authentication. Pastikan untuk menyertakan token dalam header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Contoh Penggunaan

### 1. Mengambil semua data
```bash
GET /analysis-hauling-barging
```

### 2. Filter berdasarkan tanggal
```bash
GET /analysis-hauling-barging?startDate=2024-01-01&endDate=2024-01-31
```

### 3. Dengan pagination
```bash
GET /analysis-hauling-barging?page=2&limit=20
```

### 4. Kombinasi filter dan pagination
```bash
GET /analysis-hauling-barging?startDate=2024-01-01&endDate=2024-12-31&page=1&limit=50
```

## Dependencies

- TypeORM untuk database operations
- Class-validator untuk validation
- Class-transformer untuk transformation
- JWT Guard untuk authentication
- Swagger untuk dokumentasi API
