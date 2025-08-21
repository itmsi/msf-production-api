# Parent Plan Production Module

Modul ini menangani data rencana produksi tingkat parent (bulanan) untuk sistem MSF Production.

## Deskripsi

`r_parent_plan_production` adalah tabel yang menyimpan rencana produksi tingkat bulanan dengan perhitungan agregat dari rencana produksi harian.

## Struktur Tabel

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `SERIAL` | ❌ | Primary Key |
| `plan_date` | `TIMESTAMP` | ❌ | Tanggal rencana produksi |
| `total_calender_day` | `INTEGER` | ❌ | Total hari kalender dalam bulan |
| `total_holiday_day` | `INTEGER` | ❌ | Total hari libur dalam bulan |
| `total_available_day` | `INTEGER` | ❌ | Total hari tersedia dalam bulan |
| `total_average_month_ewh` | `DOUBLE PRECISION` | ❌ | Total rata-rata EWH bulanan |
| `total_average_day_ewh` | `DOUBLE PRECISION` | ❌ | Total rata-rata EWH harian |
| `total_ob_target` | `DOUBLE PRECISION` | ❌ | Total target OB (Overburden) |
| `total_ore_target` | `DOUBLE PRECISION` | ❌ | Total target bijih |
| `total_quary_target` | `DOUBLE PRECISION` | ❌ | Total target quarry |
| `total_sr_target` | `DOUBLE PRECISION` | ❌ | Total target SR (Stripping Ratio) |
| `total_ore_shipment_target` | `DOUBLE PRECISION` | ❌ | Total target pengiriman bijih |
| `total_remaining_stock` | `DOUBLE PRECISION` | ❌ | Total stok tersisa |
| `created_at` | `TIMESTAMP` | ❌ | Tanggal dibuat |
| `updated_at` | `TIMESTAMP` | ❌ | Tanggal diupdate |
| `deleted_at` | `TIMESTAMP` | ✅ | Tanggal dihapus (soft delete) |

## Relasi

- **One-to-Many** dengan `r_plan_production`
  - Satu parent plan production dapat memiliki banyak plan production harian
  - Foreign key: `r_plan_production.parent_plan_production_id`

## Index

- `PK_r_parent_plan_production` - Primary Key pada `id`
- `IDX_r_parent_plan_production_plan_date` - Index pada `plan_date` untuk query berdasarkan tanggal

## Catatan Perhitungan

- `total_calender_day`: Dihitung dari total hari dalam bulan
- `total_holiday_day`: Dihitung dari total hari Minggu dalam bulan
- `total_available_day`: Dihitung dari total hari dalam bulan (sama dengan total_calender_day)

## Penggunaan

Tabel ini digunakan untuk:
1. Menyimpan target produksi bulanan
2. Menghitung rata-rata EWH bulanan dan harian
3. Melacak target OB, bijih, quarry, dan SR
4. Mengelola target pengiriman bijih dan stok tersisa
5. Sebagai referensi untuk rencana produksi harian
