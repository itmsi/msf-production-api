# Summary Production Module

Module ini menyediakan API untuk mengambil data summary production dengan berbagai filter yang dapat diterapkan.

## Fitur

- ✅ GET endpoint untuk mengambil data summary production
- ✅ Filter berdasarkan date range (startDate, endDate)
- ✅ Filter berdasarkan DT Type (10, 12, N/A)
- ✅ Filter berdasarkan material type
- ✅ Data loss time (hujan dan slippery)
- ✅ Swagger documentation
- ✅ JWT Authentication
- ✅ Error handling

## Struktur File

```
src/modules/summary-production/
├── dto/
│   └── summary-production.dto.ts    # DTO untuk request/response
├── summary-production.controller.ts  # Controller dengan endpoint GET
├── summary-production.service.ts     # Service dengan business logic
├── summary-production.module.ts      # Module configuration
├── index.ts                         # Export file
├── API_DOCUMENTATION.md            # Dokumentasi API lengkap
└── README.md                       # File ini
```

## Database Function

Module ini menggunakan database function `get_summary_production_with_loss_time()` yang dibuat melalui migration. Function ini mengambil data dari:

- `r_parent_base_data_pro` - Parent base data production
- `r_base_data_pro` - Base data production  
- `m_population` - Population data
- `r_loss_time` - Loss time data
- `m_activities` - Activities untuk kategori loss time

## Endpoint

### GET /summary-production

Mengambil data summary production dengan filter opsional.

**Query Parameters:**
- `startDate` (optional): Start date untuk filter (YYYY-MM-DD)
- `endDate` (optional): End date untuk filter (YYYY-MM-DD)
- `dtType` (optional): Filter berdasarkan DT Type (10, 12, N/A)
- `material` (optional): Filter berdasarkan material type

**Response:**
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
      "tonnage": 132.8,
      "hujan": 2.5,
      "slippery": 1.2
    }
  ]
}
```

## Contoh Penggunaan

1. **Ambil semua data:**
   ```
   GET /summary-production
   ```

2. **Filter berdasarkan tanggal:**
   ```
   GET /summary-production?startDate=2025-01-01&endDate=2025-01-31
   ```

3. **Filter berdasarkan DT Type:**
   ```
   GET /summary-production?dtType=10
   ```

4. **Filter berdasarkan material:**
   ```
   GET /summary-production?material=ore barge
   ```

5. **Kombinasi filter:**
   ```
   GET /summary-production?startDate=2025-01-01&endDate=2025-01-31&dtType=10&material=ore
   ```

## Authentication

Endpoint ini memerlukan JWT authentication dengan header:
```
Authorization: Bearer <token>
```

## Error Handling

Jika terjadi error, response akan mengembalikan:
```json
{
  "statusCode": 500,
  "message": "Error executing summary production query",
  "error": "Error message details"
}
```

## Dependencies

- `@nestjs/common`
- `@nestjs/swagger`
- `typeorm`
- `class-validator`

## Migration

Module ini menggunakan database function yang dibuat melalui migration:
- `1757000000001-CreateGetSummaryProductionFunction.ts`
- `1757000000002-CreateGetSummaryProductionWithLossTimeFunction.ts`

Pastikan migration sudah dijalankan sebelum menggunakan module ini.
