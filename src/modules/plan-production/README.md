# Plan Production Module

Modul ini menangani data rencana produksi harian untuk sistem MSF Production.

## Deskripsi

`r_plan_production` adalah tabel yang menyimpan rencana produksi harian dengan detail target produksi, EWH, dan perhitungan shift.

## Struktur Tabel

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `SERIAL` | ❌ | Primary Key |
| `plan_date` | `DATE` | ❌ | Tanggal rencana produksi |
| `is_calender_day` | `BOOLEAN` | ❌ | Apakah hari kalender |
| `is_holiday_day` | `BOOLEAN` | ❌ | Apakah hari libur |
| `is_available_day` | `BOOLEAN` | ❌ | Apakah hari tersedia (is_available_day == is_scheduled_day) |
| `average_day_ewh` | `DOUBLE PRECISION` | ❌ | Rata-rata EWH harian |
| `average_shift_ewh` | `DOUBLE PRECISION` | ❌ | Rata-rata EWH shift |
| `ob_target` | `DOUBLE PRECISION` | ❌ | Target OB (Overburden) |
| `ore_target` | `DOUBLE PRECISION` | ❌ | Target bijih |
| `quarry` | `DOUBLE PRECISION` | ❌ | Target quarry |
| `remaining_stock` | `DOUBLE PRECISION` | ❌ | Stok tersisa |
| `sr_target` | `DOUBLE PRECISION` | ❌ | Target SR (Stripping Ratio) - Calculated: (ore_target / ob_target) |
| `ore_shipment_target` | `DOUBLE PRECISION` | ❌ | Target pengiriman bijih |
| `total_fleet` | `INTEGER` | ❌ | Total fleet |
| `daily_old_stock` | `DOUBLE PRECISION` | ❌ | Stok lama harian - Calculated: (old stock global - ore shipment + ore target) |
| `shift_ob_target` | `DOUBLE PRECISION` | ❌ | Target OB shift - Calculated: (ob target / 2) |
| `shift_ore_target` | `DOUBLE PRECISION` | ❌ | Target bijih shift - Calculated: (ore target / 2) |
| `shift_quarry` | `DOUBLE PRECISION` | ❌ | Target quarry shift - Calculated: (quarry / 2) |
| `shift_sr_target` | `DOUBLE PRECISION` | ❌ | Target SR shift - Calculated: (shift ob target / shift ore target) |
| `createdAt` | `DATE` | ❌ | Tanggal dibuat |
| `updatedAt` | `DATE` | ❌ | Tanggal diupdate |
| `deletedAt` | `DATE` | ✅ | Tanggal dihapus (soft delete) |
| `parent_plan_production_id` | `INTEGER` | ❌ | Foreign Key ke r_parent_plan_production |

## Relasi

- **Many-to-One** dengan `r_parent_plan_production`
  - Banyak plan production harian dapat merujuk ke satu parent plan production
  - Foreign key: `parent_plan_production_id` → `r_parent_plan_production.id`
  - Cascade: `ON UPDATE CASCADE ON DELETE CASCADE`

## Index

- `PK_r_plan_production` - Primary Key pada `id`
- `IDX_r_plan_production_plan_date` - Index pada `plan_date` untuk query berdasarkan tanggal
- `IDX_r_plan_production_parent_id` - Index pada `parent_plan_production_id` untuk foreign key lookups
- `IDX_r_plan_production_date_parent_id` - Composite index pada `(plan_date, parent_plan_production_id)`
- `IDX_r_plan_production_available_day` - Index pada `is_available_day` untuk filtering

## Perhitungan Otomatis

### SR Target
```
sr_target = ore_target / ob_target
```

### Daily Old Stock
```
daily_old_stock = old stock global - ore shipment + ore target
```

### Shift Targets
```
shift_ob_target = ob target / 2
shift_ore_target = ore target / 2
shift_quarry = quarry / 2
shift_sr_target = shift ob target / shift ore target
```

## Penggunaan

Tabel ini digunakan untuk:
1. Menyimpan target produksi harian
2. Menghitung EWH harian dan shift
3. Mengelola target OB, bijih, quarry, dan SR per hari
4. Melacak stok tersisa dan target pengiriman
5. Menghitung target shift berdasarkan target harian
6. Mengidentifikasi hari kalender, libur, dan tersedia

## Catatan Penting

- `is_available_day` sama dengan `is_scheduled_day` (hari yang dijadwalkan untuk produksi)
- Semua field perhitungan (calculated fields) disimpan di database untuk performa query
- Relasi dengan parent plan production memungkinkan tracking dari level bulanan ke harian
