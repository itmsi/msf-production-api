# Spider Chart Endpoint Implementation

## Overview
Endpoint `/api/dashboard/spider` telah diimplementasikan sesuai dengan spesifikasi yang diberikan. Endpoint ini mengembalikan data untuk spider chart dengan 5 metrik: CT, Prod, EWH, FR, dan Speed.

## Struktur Response
```json
{
  "statusCode": 200,
  "message": "success",
  "data": [
    {
      "metric": "CT",
      "target": 100,
      "actual": 80,
      "percent": 80
    },
    {
      "metric": "Prod", 
      "target": 120,
      "actual": 90,
      "percent": 75
    },
    {
      "metric": "EWH",
      "target": 90,
      "actual": 70,
      "percent": 78
    },
    {
      "metric": "FR",
      "target": 95,
      "actual": 95,
      "percent": 100
    },
    {
      "metric": "Speed",
      "target": 110,
      "actual": 100,
      "percent": 91
    }
  ]
}
```

## Formula Implementasi

### 1. CT (Cycle Time)
- **Target**: Diambil dari `m_setting_dashboard.cycle_time` (default: 100)
- **Actual**: Rata-rata dari `total_hm / total_vessel` dari Control MTD Production
- **Formula**: `AVG(total_hm / total_vessel)` sesuai rentang tanggal yang dipilih

### 2. Prod (Production)
- **Target**: SUM dari `r_parent_plan_production.total_ore_target` sesuai rentang tanggal
- **Actual**: SUM tonnage ore hauling dengan konversi berdasarkan tyre_type
- **Formula**: `SUM(total_vessel * conversion_factor)` dimana:
  - 6x4: 26.56 ton/vessel
  - 8x4: 29.56 ton/vessel

### 3. EWH (Effective Working Hours)
- **Target**: MOHH dikurangi activities delay, breakdown, idle dari `r_plan_working_hour`
- **Actual**: Rata-rata `total_hm` dari Control Day Production
- **Formula**: `AVG(total_hm)` sesuai rentang tanggal yang dipilih

### 4. FR (Fuel Ratio)
- **Target**: Diambil dari `m_setting_dashboard.fuel_ratio` (default: 95)
- **Actual**: `SUM(qty_supply) / SUM(ore_barge_tonnage)`
- **Formula**: Total fuel consumption dibagi total ore barging tonnage

### 5. Speed
- **Target**: Diambil dari `m_setting_dashboard.speed` (default: 110)
- **Actual**: Rata-rata `total_km / total_hm` dari Control MTD Production
- **Formula**: `AVG(total_km / total_hm)` sesuai rentang tanggal yang dipilih

## Service Terpusat

### FormulaService
Service terpusat telah dibuat di `src/common/services/formula.service.ts` dengan method-method:

- `calculateCycleTime()` - Menghitung cycle time actual
- `calculateProductionActual()` - Menghitung production actual
- `calculateEWHActual()` - Menghitung EWH actual
- `calculateFuelRatioActual()` - Menghitung fuel ratio actual
- `calculateSpeedActual()` - Menghitung speed actual
- `calculateProductionTarget()` - Menghitung production target
- `calculateEWHTarget()` - Menghitung EWH target
- `getSettingValue()` - Mengambil nilai setting dari database
- `calculatePercentage()` - Menghitung persentase pencapaian

## Database Tables Used

1. **m_setting_dashboard** - Untuk cycle_time, fuel_ratio, speed
2. **r_parent_plan_production** - Untuk ore_target
3. **r_plan_working_hour** - Untuk EWH target calculation
4. **r_fuel** - Untuk qty_supply
5. **r_parent_base_data_pro** - Untuk data actual production
6. **r_base_data_pro** - Untuk detail production data
7. **m_population** - Untuk tyre_type information
8. **r_loss_time** - Untuk loss time calculation
9. **m_activities** - Untuk activity categorization

## Rentang Tanggal
Endpoint menggunakan rentang tanggal 30 hari terakhir dari tanggal saat ini untuk perhitungan actual values.

## Error Handling
- Setiap method memiliki try-catch untuk error handling
- Mengembalikan nilai default jika terjadi error
- Logging error untuk debugging

## Keuntungan Implementasi
1. **Service Terpusat**: Formula perhitungan terpusat di FormulaService, mudah diubah dan digunakan ulang
2. **Konsisten**: Semua perhitungan menggunakan method yang sama
3. **Maintainable**: Mudah untuk maintenance dan update formula
4. **Reusable**: FormulaService dapat digunakan oleh module lain
5. **Error Handling**: Robust error handling dengan fallback values
