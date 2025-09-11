# MTD Achievement Endpoint Implementation

## Overview
Endpoint `/api/dashboard/mtd-achievment` telah diimplementasikan sesuai dengan spesifikasi yang diberikan. Endpoint ini mengembalikan data Month-to-Date achievement untuk berbagai aktivitas dengan formula yang benar.

## Perubahan yang Dibuat

### 1. ProductionFormulaService (src/common/services/production-formula.service.ts)
Service baru yang berisi formula terpusat untuk menghitung target dan actual produksi:

#### Methods:
- `getProductionTargets()` - Mengambil target dari TB_R_Plan_Production
- `getOreHaulingTonnage()` - Menghitung actual ore hauling tonnage
- `getObBCM()` - Menghitung actual OB BCM
- `getBargeTonnage()` - Menghitung actual barge tonnage
- `getQuarryTonnage()` - Menghitung actual quarry tonnage
- `getProductionActuals()` - Mengambil semua data actual sekaligus

### 2. Dashboard Service Update (src/modules/dashboard/dashboard.service.ts)
- Mengupdate method `getMtdAchievement()` untuk menggunakan ProductionFormulaService
- Menambahkan parameter `startDate` dan `endDate` untuk filtering
- Menggunakan formula yang benar sesuai spesifikasi

### 3. Dashboard Controller Update (src/modules/dashboard/dashboard.controller.ts)
- Menambahkan query parameters `startDate` dan `endDate`
- Menambahkan Swagger documentation untuk parameter baru

### 4. Dashboard Module Update (src/modules/dashboard/dashboard.module.ts)
- Mengimport ProductionFormulaService
- Mengimport entity yang diperlukan (PlanProduction, ParentPlanProduction, BaseDataPro)

## Formula Implementasi

### Target Data (dari TB_R_Plan_Production):
- **Ore Hauling Target**: SUM(ore_target) sesuai rentang tanggal
- **OB Target**: SUM(ob_target) sesuai rentang tanggal  
- **Ore Barging Target**: SUM(ore_shipment_target) sesuai rentang tanggal
- **Quarry Target**: SUM(quarry) sesuai rentang tanggal

### Actual Data (dari Analysis Hauling and Barging):
- **Ore Hauling Actual**: SUM[Ore Hauling Tonnage] dengan konversi berdasarkan tyre_type
  - 6x4: total_vessel * 26.56
  - 8x4: total_vessel * 29.56
- **OB Actual**: SUM[OB BCM] dengan konversi tonnage ke BCM (tonnage / 1.6)
- **Ore Barging Actual**: SUM[Barge Tonnage] dengan konversi berdasarkan tyre_type
- **Quarry Actual**: SUM[QUARRY Tonnage] dengan konversi berdasarkan tyre_type

## Response Format

```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "name": "Ore Hauling",
      "target": 10000,
      "actual": 8500
    },
    {
      "name": "OB", 
      "target": 12000,
      "actual": 10000
    },
    {
      "name": "Ore Barging",
      "target": 9000,
      "actual": 8700
    },
    {
      "name": "Quarry",
      "target": 8000,
      "actual": 7500
    }
  ]
}
```

## Query Parameters

- `startDate` (optional): Start date untuk filtering (YYYY-MM-DD format)
- `endDate` (optional): End date untuk filtering (YYYY-MM-DD format)

## Contoh Penggunaan

### 1. Mengambil semua data
```bash
GET /api/dashboard/mtd-achievment
```

### 2. Filter berdasarkan tanggal
```bash
GET /api/dashboard/mtd-achievment?startDate=2025-01-01&endDate=2025-01-31
```

## Keuntungan Implementasi

1. **Formula Terpusat**: Semua formula produksi berada di satu service, memudahkan maintenance
2. **Konsistensi**: Formula yang sama digunakan di semua endpoint yang membutuhkan
3. **Reusability**: ProductionFormulaService dapat digunakan oleh module lain
4. **Type Safety**: Menggunakan enum MaterialType dan ActivityType untuk konsistensi
5. **Error Handling**: Dilengkapi dengan try-catch untuk error handling yang baik

## Database Tables Used

- `r_plan_production` - Untuk data target
- `r_parent_base_data_pro` - Untuk data produksi parent
- `r_base_data_pro` - Untuk data produksi detail
- `m_population` - Untuk data tyre_type dan konversi

## Testing

Endpoint dapat ditest menggunakan curl:

```bash
curl -X 'GET' \
  'http://localhost:9539/api/dashboard/mtd-achievment' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <your-jwt-token>'
```

Dengan parameter tanggal:

```bash
curl -X 'GET' \
  'http://localhost:9539/api/dashboard/mtd-achievment?startDate=2025-01-01&endDate=2025-01-31' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <your-jwt-token>'
```
