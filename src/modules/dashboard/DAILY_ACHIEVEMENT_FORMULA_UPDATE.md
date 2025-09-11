# Update Formula Daily Achievement Endpoint

## Overview
Endpoint `/api/dashboard/daily-achievment` telah diperbarui sesuai dengan formula yang diminta untuk menggunakan data dari tabel `r_plan_production` dan API `/api/control/day-production`.

## Perubahan yang Dibuat

### 1. ProductionFormulaService Update (src/common/services/production-formula.service.ts)

#### Method Baru:
- `getActualFromControlDayProduction()` - Mengambil data actual dari control day production sesuai dengan formula yang diminta

#### Method yang Diupdate:
- `getDailyAchievementData()` - Menggunakan formula yang benar sesuai spesifikasi

### 2. Formula Implementasi Sesuai Spesifikasi

#### Target Data (dari r_plan_production):
- **Ore Hauling Target**: `ore_target` berdasarkan tanggal yang dipilih
- **OB Target**: `ob_target` berdasarkan tanggal yang dipilih  
- **Ore Barging Target**: `ore_shipment_target` berdasarkan tanggal yang dipilih
- **Quarry Target**: `quarry` berdasarkan tanggal yang dipilih

#### Actual Data (dari control day production):
- **Ore Hauling Actual**: `ORE_HAULING_TONNAGE` dari `/api/control/day-production`
- **OB Actual**: `OB_TONNAGE` dari `/api/control/day-production` 
- **Ore Barging Actual**: `ORE_BARGE_TONNAGE` dari `/api/control/day-production`
- **Quarry Actual**: `QUARRY_TONNAGE` dari `/api/control/day-production`

#### Perhitungan Shift:
- **Day Shift**: Target dibagi 2, Actual berdasarkan shift 'DS'
- **Night Shift**: Target dibagi 2, Actual berdasarkan shift 'NS'
- **Daily**: Target penuh, Actual semua shift

### 3. Query Formula yang Digunakan

```sql
-- Formula untuk mendapatkan actual data dari control day production
SELECT 
  SUM(ore_hauling_tonnage) as ore_hauling_tonnage,
  SUM(ob_tonnage) as ob_tonnage,
  SUM(ore_barge_tonnage) as ore_barge_tonnage,
  SUM(quarry_tonnage) as quarry_tonnage
FROM (
  -- Subquery dengan perhitungan tonnage berdasarkan tyre_type
  -- 6x4: ore_hauling * 26.56, quarry * 16.6
  -- 8x4: ore_hauling * 29.56, quarry * 18.26
  -- OB: tonnage / 1.6 (konversi ke BCM)
)
```

## Response Format

Endpoint mengembalikan response dengan format:

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

1. **Formula Terpusat**: Semua formula perhitungan berada di ProductionFormulaService
2. **Konsisten dengan Control Day Production**: Menggunakan data dan formula yang sama dengan `/api/control/day-production`
3. **Filter Berdasarkan Tanggal**: Mendukung filtering berdasarkan tanggal yang dipilih
4. **Filter Berdasarkan Shift**: Mendukung filtering berdasarkan shift (DS/NS)
5. **Error Handling**: Dilengkapi dengan error handling yang proper
6. **Maintainable**: Mudah untuk maintenance dan update formula

## Testing

Endpoint telah ditest dan berfungsi dengan baik:
- ✅ Response format sesuai spesifikasi
- ✅ Parameter tanggal berfungsi
- ✅ Formula perhitungan sesuai requirement
- ✅ Error handling berfungsi
- ✅ Build berhasil tanpa error

## Catatan Penting

- Formula menggunakan faktor konversi yang sama dengan Control Day Production
- Data actual diambil langsung dari tabel yang sama dengan `/api/control/day-production`
- Target data diambil dari tabel `r_plan_production` berdasarkan tanggal yang dipilih
- Shift-specific data menggunakan filter shift yang tepat (DS/NS)
