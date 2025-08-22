# Implementasi Parent Plan Production API

## Overview
API ini telah disesuaikan untuk memenuhi kebutuhan yang diminta dalam curl request. Sistem akan otomatis menghitung jumlah hari dalam bulan, hari libur, dan generate data harian untuk setiap tanggal dalam bulan tersebut.

## Struktur Data

### Tabel r_parent_plan_production
Field yang akan diisi otomatis:
- `plan_date`: Tanggal dari body request
- `total_calender_day`: Jumlah hari dalam bulan (auto calculate)
- `total_holiday_day`: Jumlah hari minggu dalam bulan (auto calculate)
- `total_available_day`: Jumlah hari bukan minggu dalam bulan (auto calculate)
- `total_average_day_ewh`: Dari body request
- `total_average_month_ewh`: Dari body request
- `total_ob_target`: Dari body request
- `total_ore_target`: Dari body request
- `total_quarry_target`: Dari body request
- `total_sr_target`: Dari body request (default: 2.0)
- `total_ore_shipment_target`: Dari body request
- `total_remaining_stock`: Dari body request (default: 0)
- `total_sisa_stock`: Dari body request
- `total_fleet`: Dari body request

### Tabel r_plan_production
Data akan di-generate otomatis untuk setiap hari dalam bulan:

- `plan_date`: Tanggal spesifik dalam bulan
- `is_calender_day`: Selalu `true` (karena ada tanggal)
- `is_holiday_day`: `true` jika hari minggu, `false` jika bukan
- `is_available_day`: `true` jika bukan hari minggu, `false` jika hari minggu
- `average_day_ewh`: Nilai dari `total_average_day_ewh` (tidak dibagi jumlah hari)
- `average_moth_ewh`: `total_average_month_ewh` dibagi jumlah hari dalam bulan
- `ob_target`: `total_ob_target` dibagi jumlah hari dalam bulan
- `ore_target`: `total_ore_target` dibagi jumlah hari dalam bulan
- `quarry`: **Diambil langsung dari `total_quarry_target` body request (tidak dibagi jumlah hari)**
- `sr_target`: `ob_target / ore_target`
- `ore_shipment_target`: `total_ore_shipment_target` dibagi jumlah hari dalam bulan
- `total_fleet`: Nilai dari body request
- `daily_old_stock`: Nilai dari `old_stock_global`
- `shift_ob_target`: `ob_target / 2`
- `shift_ore_target`: `ore_target / 2`
- `shift_quarry`: `quarry / 2`
- `shift_sr_target`: `shift_ob_target / shift_ore_target`
- `remaining_stock`: `old_stock_global - ore_shipment_target + ore_target`

## Logika Perhitungan

### 1. Validasi Plan Date
- Sistem akan mengecek apakah `plan_date` sudah ada di tabel `r_parent_plan_production`
- Jika sudah ada, akan mengembalikan error 409 (Conflict)

### 2. Perhitungan Hari
- `total_calender_day`: Jumlah hari dalam bulan (28, 29, 30, atau 31)
- `total_holiday_day`: Jumlah hari minggu dalam bulan
- `total_available_day`: `total_calender_day - total_holiday_day`

### 3. Perhitungan Old Stock Global
Sistem akan mencari `old_stock_global` dengan urutan:
1. Cari data sebelumnya di tabel `r_plan_production` kolom `daily_old_stock`
2. Jika tidak ada, ambil dari tabel `r_parent_plan_production` kolom `total_sisa_stock`
3. Jika tidak ada, gunakan nilai default 0

### 4. Generate Data Harian
Untuk setiap hari dalam bulan:
- Buat tanggal spesifik (contoh: 2025-08-01, 2025-08-02, dst)
- Tentukan apakah hari minggu atau bukan
- Hitung semua nilai berdasarkan rumus yang telah ditentukan
- **Khusus untuk `quarry`: nilai diambil langsung dari body request tanpa dibagi jumlah hari**
- Simpan ke tabel `r_plan_production`

## Contoh Request

```bash
curl -X 'POST' \
  'http://localhost:9526/api/parent-plan-production' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "plan_date": "2025-08-21",
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

## Contoh Response

```json
{
  "id": 1,
  "plan_date": "2025-08-01T00:00:00.000Z",
  "total_calender_day": 31,
  "total_holiday_day": 5,
  "total_available_day": 26,
  "total_average_month_ewh": 4500.0,
  "total_average_day_ewh": 150.0,
  "total_ob_target": 1500000.0,
  "total_ore_target": 750000.0,
  "total_quarry_target": 300000.0,
  "total_sr_target": 2.0,
  "total_ore_shipment_target": 600000.0,
  "total_remaining_stock": 0.0,
  "total_sisa_stock": 50000.0,
  "total_fleet": 25,
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-01-15T10:30:00.000Z"
}
```

## Data Harian yang Di-generate

Untuk bulan Agustus 2025 (31 hari), sistem akan membuat 31 record di tabel `r_plan_production`:

- 26 hari kerja (Senin-Sabtu)
- 5 hari libur (Minggu)

Setiap record akan memiliki nilai yang sudah dihitung otomatis sesuai dengan rumus yang telah ditentukan.

**Catatan Khusus untuk Quarry:**
- Nilai `quarry` di setiap record harian akan sama: `300000` (dari body request)
- Nilai `shift_quarry` akan sama: `150000` (300000 / 2)
- Tidak seperti field lain yang dibagi dengan jumlah hari dalam bulan

## Error Handling

- **409 Conflict**: Plan date sudah ada dalam sistem
- **400 Bad Request**: Data tidak valid atau tidak lengkap
- **401 Unauthorized**: JWT token tidak valid atau tidak ada

## Catatan Penting

1. Field `total_sr_target` bersifat opsional dengan default value 2.0
2. Field `total_remaining_stock` bersifat opsional dengan default value 0
3. Sistem akan otomatis menghitung semua nilai berdasarkan rumus yang telah ditentukan
4. Data harian akan di-generate untuk seluruh bulan, bukan hanya tanggal yang diinput
5. Perhitungan hari libur hanya berdasarkan hari minggu
6. **Field `quarry` diambil langsung dari body request tanpa dibagi jumlah hari dalam bulan**
