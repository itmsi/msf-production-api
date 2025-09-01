# Parent Plan Production - Available Days Update

## Overview
Update pada logika parent plan production untuk memastikan semua hari tersedia (available_day = true) tanpa hari libur saat data pertama kali dibuat.

## Perubahan Logika

### Sebelum Update
- Sistem menghitung hari libur berdasarkan hari Minggu (`getSundaysInMonth`)
- `total_holiday_day` = jumlah hari Minggu dalam bulan
- `total_available_day` = `total_calender_day` - `total_holiday_day`
- Data harian memiliki `is_holiday_day: true` untuk hari Minggu
- Data harian memiliki `is_available_day: false` untuk hari Minggu

### Setelah Update
- **Tidak ada hari libur** saat data pertama kali dibuat
- `total_holiday_day` = 0 (selalu)
- `total_available_day` = `total_calender_day` (semua hari tersedia)
- Data harian memiliki `is_holiday_day: false` untuk semua hari
- Data harian memiliki `is_available_day: true` untuk semua hari

## Implementasi Teknis

### 1. Create Method
```typescript
// Sebelum
const totalHolidayDays = this.getSundaysInMonth(planDate);
const totalAvailableDays = totalCalendarDays - totalHolidayDays;

// Sesudah
const totalHolidayDays = 0; // Tidak ada hari libur, semua hari tersedia
const totalAvailableDays = totalCalendarDays; // Semua hari tersedia
```

### 2. Generate Daily Data
```typescript
// Sebelum
const isSunday = currentDate.getDay() === 0;
const planProduction: Partial<PlanProduction> = {
  is_holiday_day: isSunday, // True jika hari minggu
  is_available_day: !isSunday, // False jika hari minggu
};

// Sesudah
const planProduction: Partial<PlanProduction> = {
  is_holiday_day: false, // Tidak ada hari libur, semua hari tersedia
  is_available_day: true, // Semua hari tersedia
};
```

### 3. Update Method
```typescript
// Sebelum
if (updateDto.plan_date) {
  totalCalendarDays = this.getDaysInMonth(planDate);
  totalHolidayDays = this.getSundaysInMonth(planDate);
  totalAvailableDays = totalCalendarDays - totalHolidayDays;
}

// Sesudah
if (updateDto.plan_date) {
  totalCalendarDays = this.getDaysInMonth(planDate);
  totalHolidayDays = 0; // Tidak ada hari libur, semua hari tersedia
  totalAvailableDays = totalCalendarDays; // Semua hari tersedia
}
```

## Hasil Test

### Test Case 1: September 2025 (30 hari)
```bash
curl -X 'POST' 'http://localhost:9526/api/parent-plan-production' \
  -H 'Content-Type: application/json' \
  -d '{
    "plan_date": "2025-09-01",
    "total_average_day_ewh": 150,
    "total_average_month_ewh": 4500,
    "total_ob_target": 1500000,
    "total_ore_target": 750000,
    "total_quarry_target": 300000,
    "total_ore_shipment_target": 600000,
    "total_sisa_stock": 50000,
    "total_fleet": 25
  }'
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "total_calender_day": 30,
    "total_holiday_day": 0,
    "total_available_day": 30
  }
}
```

**Data Harian:**
- Total data harian: 30
- Semua hari memiliki `calender_day: "available"`
- Tidak ada hari libur

### Test Case 2: Februari 2025 (28 hari)
```bash
curl -X 'POST' 'http://localhost:9526/api/parent-plan-production' \
  -H 'Content-Type: application/json' \
  -d '{
    "plan_date": "2025-02-01",
    "total_average_day_ewh": 150,
    "total_average_month_ewh": 4200,
    "total_ob_target": 1500000,
    "total_ore_target": 750000,
    "total_quarry_target": 300000,
    "total_ore_shipment_target": 600000,
    "total_sisa_stock": 50000,
    "total_fleet": 25
  }'
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "total_calender_day": 28,
    "total_holiday_day": 0,
    "total_available_day": 28
  }
}
```

## Keuntungan Perubahan

1. **Konsistensi Data**: Semua hari tersedia saat pertama kali dibuat
2. **Fleksibilitas**: Hari libur dapat diatur melalui proses update
3. **Kemudahan Pengelolaan**: Admin dapat mengatur hari libur sesuai kebutuhan
4. **Backward Compatibility**: Tidak mempengaruhi data yang sudah ada

## Catatan Penting

- **Hari libur dapat diatur melalui proses update** setelah data dibuat
- **Tidak ada breaking change** untuk data yang sudah ada
- **Logika update tetap berfungsi** untuk mengubah hari libur jika diperlukan
- **Semua fitur lain tetap berfungsi** seperti pagination, filtering, dan sorting

## File yang Diubah

1. `src/modules/parent-plan-production/parent-plan-production.service.ts`
   - Method `create()`
   - Method `update()`
   - Method `updateDailyPlanProductions()`

## Testing

Semua test case berhasil:
- ✅ Create parent plan production dengan semua hari tersedia
- ✅ Generate data harian dengan `is_available_day: true`
- ✅ Update method tetap berfungsi
- ✅ Backward compatibility terjaga
