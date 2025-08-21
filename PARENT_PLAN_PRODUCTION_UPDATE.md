# Update Tabel r_parent_plan_production

## Deskripsi Perubahan

Telah ditambahkan 2 kolom baru ke tabel `r_parent_plan_production`:

1. **total_sisa_stock** (integer, NOT NULL, DEFAULT 0)
   - Deskripsi: Total sisa stock yang tersedia
   - Tipe: Integer
   - Constraint: NOT NULL
   - Default Value: 0
   - Comment: "Total sisa stock yang tersedia"

2. **total_fleet** (integer, NOT NULL, DEFAULT 0)
   - Deskripsi: Total fleet yang tersedia
   - Tipe: Integer
   - Constraint: NOT NULL
   - Default Value: 0
   - Comment: "Total fleet yang tersedia"

## File yang Diperbarui

### 1. Migrasi Database
- **File**: `src/database/migrations/1700000000039-AddTotalSisaStockAndTotalFleetToParentPlanProduction.ts`
- **Fungsi**: Menambahkan kolom baru ke database

### 2. Entity
- **File**: `src/modules/parent-plan-production/entities/parent-plan-production.entity.ts`
- **Perubahan**: Menambahkan properti `total_sisa_stock` dan `total_fleet` dengan decorator `@Column`

### 3. DTO
- **File**: `src/modules/parent-plan-production/dto/parent-plan-production.dto.ts`
- **Perubahan**: 
  - `CreateParentPlanProductionDto`: Menambahkan field baru (mandatory)
  - `UpdateParentPlanProductionDto`: Menambahkan field baru (optional)
  - `ParentPlanProductionResponseDto`: Menambahkan field baru untuk response

## Cara Menjalankan Migrasi

```bash
npm run migration:run
```

## Rollback Migrasi (Jika Diperlukan)

```bash
npm run migration:revert
```

## Contoh Penggunaan

### Create Parent Plan Production
```typescript
const createDto = {
  plan_date: '2024-01-01T00:00:00.000Z',
  total_calender_day: 31,
  total_holiday_day: 8,
  total_available_day: 23,
  total_average_month_ewh: 150.5,
  total_average_day_ewh: 5.0,
  total_ob_target: 1000000.0,
  total_ore_target: 500000.0,
  total_quary_target: 200000.0,
  total_sr_target: 2.0,
  total_ore_shipment_target: 450000.0,
  total_remaining_stock: 50000.0,
  total_sisa_stock: 1000,        // Kolom baru
  total_fleet: 50                // Kolom baru
};
```

### Update Parent Plan Production
```typescript
const updateDto = {
  total_sisa_stock: 1200,        // Update sisa stock
  total_fleet: 55                // Update fleet
};
```

## Catatan Penting

- Kolom baru bersifat mandatory saat create (NOT NULL)
- Kolom baru memiliki default value 0
- Kolom baru dapat diupdate secara terpisah
- Semua validasi dan dokumentasi API telah diperbarui
- Entity relationship tetap tidak berubah

## Status

✅ Migrasi berhasil dijalankan  
✅ Entity diperbarui  
✅ DTO diperbarui  
✅ Build berhasil  
✅ Siap digunakan
