# Monthly Status API Update

## Perubahan yang Dilakukan

API `/api/dashboard/monthly/status` telah diperbarui sesuai dengan spesifikasi yang diberikan untuk menghitung achievement berdasarkan Control MTD dengan formula tonnage yang benar.

### 1. Perubahan Logic Achievement Calculation

#### Sebelum:
- Menggunakan `total_vessel` langsung dari tabel `r_base_data_pro`
- Tidak mempertimbangkan `tyre_type` untuk perhitungan tonnage
- Material mapping tidak sesuai dengan spesifikasi

#### Sesudah:
- Menggunakan perhitungan tonnage berdasarkan `tyre_type` dan `material`
- Menggabungkan data dari `r_base_data_pro`, `r_parent_base_data_pro`, dan `m_population`
- Material dan activity mapping sesuai spesifikasi

### 2. Formula Perhitungan Tonnage

#### Tyre Type 6x4:
- **OB**: `(total_vessel * 26.56) / 1.6` (BCM to Tonnage conversion)
- **ORE Hauling**: `total_vessel * 26.56`
- **ORE Barging**: `total_vessel * 16.6`
- **Quarry**: `total_vessel * 16.6`

#### Tyre Type 8x4:
- **OB**: `(total_vessel * 29.56) / 1.6` (BCM to Tonnage conversion)
- **ORE Hauling**: `total_vessel * 29.56`
- **ORE Barging**: `total_vessel * 18.26`
- **Quarry**: `total_vessel * 18.26`

### 3. Material dan Activity Mapping

- **OB Removing**: `material = 'ob'`
- **Ore Hauling**: `material = 'ore' AND activity = 'hauling'`
- **Ore Barging**: `material = 'ore' AND activity = 'barging'`
- **Quarry**: `material = 'quarry'`

### 4. Target Calculation

Target tetap diambil dari tabel `TB_R_Parent_Plan_Production` dengan SUM sesuai rentang bulan:
- **OB Target**: `SUM(total_OB_target)`
- **Ore Target**: `SUM(total_ore_target)`
- **Ore Shipment Target**: `SUM(total_ore_shipment_target)`
- **Quarry Target**: `SUM(total_quarry_target)`

### 5. Response Format

Response tetap mengikuti format yang sama dengan 4 aktivitas:
- `title`: Static (OB Removing, Ore Hauling, Ore Barging, Quarry)
- `target`: Dari tabel Parent Plan Production
- `chart_data`: Progress percentage dengan fill color #3BAF9F
- `weekness`: `target - achievement`
- `achievement`: Tonnage berdasarkan formula Control MTD

### 6. Query Optimization

- Menggunakan JOIN yang efisien antara 3 tabel
- Filter berdasarkan rentang tanggal yang diberikan
- Grouping berdasarkan material, activity, dan tyre_type
- Menggunakan COALESCE untuk handle NULL values

## Testing

Untuk menguji perubahan ini, gunakan endpoint:
```
GET /api/dashboard/monthly/status?month=2025-09
```

Pastikan response menunjukkan:
- Achievement values yang realistis berdasarkan tonnage calculation
- Progress percentage yang akurat
- Weekness calculation yang benar (target - achievement)
