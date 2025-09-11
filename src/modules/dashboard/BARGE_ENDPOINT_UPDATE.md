# Update Endpoint Dashboard Barge

## Overview
Endpoint `/api/dashboard/barge` telah diupdate untuk menggunakan formula terpusat yang sama dengan `/api/analysis-hauling-barging` sesuai dengan permintaan.

## Perubahan yang Dilakukan

### 1. Formula Terpusat di ProductionFormulaService
- **File**: `src/common/services/production-formula.service.ts`
- **Method Baru**: `getDailyBargeHaulingData(startDate?, endDate?)`
- **Method Baru**: `processDashboardBargeData(rawData)`
- **Method Baru**: `formatDateForDashboard(dateString)`

### 2. Update Dashboard Controller
- **File**: `src/modules/dashboard/dashboard.controller.ts`
- **Perubahan**: Menambahkan parameter `startDate` dan `endDate` pada endpoint `/barge`
- **Swagger**: Menambahkan `@ApiQuery` untuk dokumentasi parameter

### 3. Update Dashboard Service
- **File**: `src/modules/dashboard/dashboard.service.ts`
- **Perubahan**: Method `getBargeData()` sekarang menggunakan formula terpusat
- **Error Handling**: Menambahkan try-catch untuk error handling

### 4. Update Analysis Hauling Barging Module
- **File**: `src/modules/analysis-hauling-barging/analysis-hauling-barging.module.ts`
- **Perubahan**: Menambahkan `ProductionFormulaService` sebagai provider
- **Dependencies**: Menambahkan `PlanProduction` dan `ParentPlanProduction` entities

## Formula yang Digunakan

### Database Query
```sql
SELECT 
  rpbdp.activity_date as date,
  rbdp.material,
  rbdp.activity,
  mp.no_unit,
  SUM(rbdp.total_vessel) as total_vessel,
  CASE 
    WHEN rbdp.material = 'ore-barge' AND rbdp.activity = 'barging' THEN 'ore-barge'
    WHEN rbdp.material = 'ore' AND rbdp.activity = 'hauling' THEN 'ore'
    WHEN rbdp.material = 'ob' THEN 'ob'
    ELSE rbdp.material
  END as material_type,
  CASE 
    WHEN mp.tyre_type = '6x4' THEN (SUM(rbdp.total_vessel) * 26.56)
    WHEN mp.tyre_type = '8x4' THEN (SUM(rbdp.total_vessel) * 29.56)
    ELSE 0
  END as tonnage
FROM r_parent_base_data_pro rpbdp
JOIN r_base_data_pro rbdp ON rpbdp.id = rbdp.parent_base_data_pro_id
JOIN m_population mp ON rpbdp.population_id = mp.id
WHERE (
  (rbdp.material = 'ore-barge' AND rbdp.activity = 'barging') OR
  (rbdp.material = 'ore' AND rbdp.activity = 'hauling')
)
```

### Business Logic
- **Barge Tonnage**: Material = 'ore-barge' AND Activity = 'barging'
- **Hauling Tonnage**: Material = 'ore' AND Activity = 'hauling'
- **Tonnage Factor**: 
  - 6x4 = 26.56
  - 8x4 = 29.56

## API Usage

### Endpoint
```
GET /api/dashboard/barge?startDate=2024-01-01&endDate=2024-01-31
```

### Response Format
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "date": "01/07",
      "barge": 3000,
      "hauling": 2800
    },
    {
      "date": "02/07", 
      "barge": 2950,
      "hauling": 2700
    }
  ]
}
```

## Keuntungan Formula Terpusat

1. **Konsistensi**: Formula yang sama digunakan di semua endpoint
2. **Maintainability**: Perubahan formula hanya perlu dilakukan di satu tempat
3. **Reusability**: Formula dapat digunakan kembali di endpoint lain
4. **Data Integrity**: Memastikan data yang sama di semua endpoint

## Testing

Untuk menguji endpoint yang telah diupdate:

```bash
curl -X 'GET' \
  'http://localhost:9539/api/dashboard/barge?startDate=2024-01-01&endDate=2024-01-31' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <your-jwt-token>'
```

## Dependencies

- `ProductionFormulaService` - Service terpusat untuk formula produksi
- `TypeORM` - Untuk database operations
- `NestJS` - Framework utama

## Status Testing

✅ **Build Success**: Aplikasi berhasil di-build tanpa error
✅ **Runtime Success**: Aplikasi berhasil dijalankan tanpa dependency error
✅ **Endpoint Working**: Endpoint `/api/dashboard/barge` berfungsi dengan baik
✅ **Data Format**: Response format sesuai dengan spesifikasi yang diminta

## Error Resolution

**Error yang diperbaiki**:
```
UnknownDependenciesException: Nest can't resolve dependencies of the ProductionFormulaService
```

**Solusi**:
- Menambahkan `PlanProduction` dan `ParentPlanProduction` entities ke `AnalysisHaulingBargingModule`
- Memastikan semua dependencies `ProductionFormulaService` tersedia di module yang menggunakannya
