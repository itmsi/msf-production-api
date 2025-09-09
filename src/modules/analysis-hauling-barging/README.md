# Analysis Hauling Barging Module

## Deskripsi
Module ini menyediakan API untuk mengambil data analisis hauling dan barging berdasarkan data produksi yang ada. Module ini mengolah data dari tabel-tabel produksi untuk menghasilkan analisis yang komprehensif tentang aktivitas hauling dan barging.

## Fitur
- ✅ GET endpoint untuk mengambil data analysis hauling barging
- ✅ Filter berdasarkan date range (startDate, endDate)
- ✅ Pagination dengan page dan limit
- ✅ Swagger documentation
- ✅ JWT Authentication
- ✅ Error handling

## Struktur File
```
analysis-hauling-barging/
├── entities/
│   └── analysis-hauling-barging.entity.ts    # Entity untuk response data
├── dto/
│   └── analysis-hauling-barging.dto.ts       # DTO untuk request/response
├── analysis-hauling-barging.controller.ts   # Controller dengan endpoint GET
├── analysis-hauling-barging.service.ts        # Service dengan business logic
├── analysis-hauling-barging.module.ts          # Module configuration
├── index.ts                                   # Export file
├── API_DOCUMENTATION.md                      # Dokumentasi API lengkap
└── README.md                                  # File ini
```

## Database Schema
Module ini menggunakan data dari tabel-tabel berikut:
- `r_parent_base_data_pro` - Parent base data production
- `r_base_data_pro` - Base data production detail
- `m_population` - Population data

## API Endpoints
- `GET /analysis-hauling-barging` - Get analysis data dengan filter dan pagination

## Dependencies
- TypeORM untuk database operations
- Class-validator untuk validation
- Class-transformer untuk transformation
- JWT Guard untuk authentication
- Swagger untuk dokumentasi API

## Cara Penggunaan
1. Import module ke `app.module.ts`
2. Pastikan tabel-tabel yang diperlukan sudah ada di database
3. Pastikan foreign key constraints sudah terpasang
4. Gunakan endpoint dengan authentication JWT

## Business Logic

### Data Sources:
- **Date**: Diambil dari `r_parent_base_data_pro.activity_date`
- **Material Types**: 
  - `ore barge`: material = 'ore-barge' AND activity = 'barging'
  - `ore hauling`: material = 'ore' AND activity = 'hauling'
  - `OB`: material = 'ob'

### Calculations:
- **Vessel**: SUM dari `total_vessel` berdasarkan material dan activity
- **Tonnage**: `total_vessel * factor` berdasarkan `tyre_type`
  - 6x4: factor = 26.56
  - 8x4: factor = 29.56
- **BCM**: `tonnage / 1.6`
- **TMM**: Penjumlahan dari ore hauling + OB

## Response Format
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
