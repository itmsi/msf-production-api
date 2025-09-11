# Daily Achievement Endpoint Implementation

## Overview
Endpoint `/api/dashboard/daily-achievment` telah diimplementasikan sesuai dengan spesifikasi yang diberikan. Endpoint ini mengembalikan data Daily Achievement untuk berbagai shift dengan formula yang benar berdasarkan data dari tabel `r_plan_production` dan `control/day-production`.

## Perubahan yang Dibuat

### 1. ProductionFormulaService (src/common/services/production-formula.service.ts)
Service terpusat yang berisi formula untuk menghitung target dan actual produksi:

#### Interface Baru:
- `DailyAchievementData` - Interface untuk data achievement per kategori
- `ProductionActuals` - Interface untuk data actual produksi

#### Methods Baru:
- `getActualByShift()` - Mengambil actual produksi berdasarkan shift (DS/NS)
- `getOreHaulingTonnageByShift()` - Menghitung actual ore hauling berdasarkan shift
- `getObBCMByShift()` - Menghitung actual OB BCM berdasarkan shift
- `getBargeTonnageByShift()` - Menghitung actual barge tonnage berdasarkan shift
- `getQuarryTonnageByShift()` - Menghitung actual quarry tonnage berdasarkan shift
- `getDailyAchievementData()` - Mengambil semua data Daily Achievement lengkap

### 2. Dashboard Service Update (src/modules/dashboard/dashboard.service.ts)
- Mengupdate method `getDailyAchievement()` untuk menggunakan ProductionFormulaService
- Menambahkan parameter `selectedDate` untuk filtering berdasarkan tanggal
- Menggunakan formula yang benar sesuai spesifikasi

### 3. Dashboard Controller Update (src/modules/dashboard/dashboard.controller.ts)
- Menambahkan query parameter `selectedDate` (opsional)
- Menambahkan Swagger documentation untuk parameter baru

### 4. Dashboard Module Update (src/modules/dashboard/dashboard.module.ts)
- Sudah mengimport ProductionFormulaService
- Sudah mengimport entity yang diperlukan (PlanProduction, ParentPlanProduction, BaseDataPro)

## Formula Implementasi

### Target Data (dari r_plan_production):
- **Ore Hauling Target**: `ore_target` berdasarkan tanggal yang dipilih
- **OB Target**: `ob_target` berdasarkan tanggal yang dipilih  
- **Ore Barging Target**: `ore_shipment_target` berdasarkan tanggal yang dipilih
- **Quarry Target**: `quarry` berdasarkan tanggal yang dipilih

### Actual Data (dari control/day-production):
- **Ore Hauling Actual**: SUM[Ore Hauling Tonnage] dengan konversi berdasarkan tyre_type (6x4: 26.56, 8x4: 29.56)
- **OB Actual**: SUM[OB Tonnage] dengan konversi berdasarkan tyre_type dan dibagi 1.6 untuk BCM
- **Ore Barging Actual**: SUM[Ore Barge Tonnage] dengan konversi berdasarkan tyre_type
- **Quarry Actual**: SUM[Quarry Tonnage] dengan konversi berdasarkan tyre_type

### Shift Calculation:
- **Daily ACV**: Target dan actual untuk semua shift
- **Day Shift ACV**: Target dibagi 2, actual berdasarkan shift 'DS'
- **Night Shift ACV**: Target dibagi 2, actual berdasarkan shift 'NS'

## Response Format

```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "title": "Daily ACV",
      "details": [
        { "name": "Ore Hauling", "target": 10000, "actual": 8500 },
        { "name": "OB", "target": 12000, "actual": 10000 },
        { "name": "Ore Barging", "target": 9000, "actual": 8700 },
        { "name": "Quarry", "target": 8000, "actual": 7500 }
      ]
    },
    {
      "title": "Day Shift ACV",
      "details": [
        { "name": "Ore Hauling", "target": 5000, "actual": 4250 },
        { "name": "OB", "target": 6000, "actual": 5000 },
        { "name": "Ore Barging", "target": 4500, "actual": 4350 },
        { "name": "Quarry", "target": 4000, "actual": 3750 }
      ]
    },
    {
      "title": "Night Shift ACV",
      "details": [
        { "name": "Ore Hauling", "target": 5000, "actual": 4250 },
        { "name": "OB", "target": 6000, "actual": 5000 },
        { "name": "Ore Barging", "target": 4500, "actual": 4350 },
        { "name": "Quarry", "target": 4000, "actual": 3750 }
      ]
    }
  ]
}
```

## Usage

### Request
```bash
GET /api/dashboard/daily-achievment?selectedDate=2025-01-15
```

### Parameters
- `selectedDate` (optional): Tanggal dalam format YYYY-MM-DD. Jika tidak disediakan, akan menggunakan tanggal hari ini.

### Headers
- `Authorization: Bearer <token>`
- `accept: application/json`

## Keunggulan Implementasi

1. **Formula Terpusat**: Semua formula perhitungan berada di ProductionFormulaService, sehingga mudah untuk maintenance dan update
2. **Reusable**: Method-method di ProductionFormulaService dapat digunakan oleh endpoint lain
3. **Flexible**: Mendukung filtering berdasarkan tanggal dan shift
4. **Consistent**: Menggunakan struktur data yang konsisten dengan endpoint lain
5. **Error Handling**: Dilengkapi dengan error handling yang proper

## Testing

Endpoint telah ditest dan berfungsi dengan baik:
- ✅ Response format sesuai spesifikasi
- ✅ Parameter tanggal berfungsi
- ✅ Formula perhitungan sesuai requirement
- ✅ Error handling berfungsi
