# Parent Plan Production Module

Module ini menangani pembuatan dan pengelolaan parent plan production serta generate data plan production harian secara otomatis.

## Fitur Utama

1. **Create Parent Plan Production**: Membuat parent plan production baru dengan data bulanan
2. **Auto Calculation**: Menghitung otomatis jumlah hari kalender, hari libur, dan hari tersedia
3. **Generate Daily Data**: **OTOMATIS** membuat data plan production harian untuk setiap hari dalam bulan yang dipilih
4. **Smart Stock Calculation**: Menghitung old stock global berdasarkan data sebelumnya

### 🔄 **Proses Generate Data Harian Otomatis**

Ketika Anda POST data ke endpoint `/parent-plan-production`, sistem akan:

1. **Menyimpan data parent** ke tabel `r_parent_plan_production`
2. **Otomatis menghitung** jumlah hari dalam bulan yang dipilih
3. **Generate data harian** ke tabel `r_plan_production` sebanyak hari dalam bulan tersebut
4. **Setiap data harian** akan memiliki tanggal dari tanggal 1 sampai akhir bulan

**Contoh:**
- Jika `plan_date: "2025-08-21"` (bulan Agustus)
- Sistem akan generate **31 data** di tabel `r_plan_production`
- Tanggal: 1 Agustus 2025, 2 Agustus 2025, ..., 31 Agustus 2025

## Struktur Data

### Request Body untuk Create

```json
{
  "plan_date": "2025-08-21",
  "total_average_day_ewh": 150.0,
  "total_average_month_ewh": 4500.0,
  "total_ob_target": 1500000.0,
  "total_ore_target": 750000.0,
  "total_quarry_target": 300000.0,
  "total_sr_target": 2.0,
  "total_ore_shipment_target": 600000.0,
  "total_remaining_stock": 100000.0,
  "total_sisa_stock": 50000.0,
  "total_fleet": 25
}
```

### Auto Generated Fields

- `total_calender_day`: Jumlah hari dalam bulan (auto)
- `total_holiday_day`: Jumlah hari minggu dalam bulan (auto)
- `total_available_day`: Jumlah hari bukan minggu dalam bulan (auto)

## Logika Perhitungan

### 1. Perhitungan Hari
- **Calendar Days**: Total hari dalam bulan
- **Holiday Days**: Total hari minggu dalam bulan
- **Available Days**: Calendar days - Holiday days

### 2. Perhitungan Harian
- **average_day_ewh**: `total_average_day_ewh / total_calender_day`
- **average_shift_ewh**: `total_average_month_ewh / total_calender_day`
- **ob_target**: `total_ob_target / total_calender_day`
- **ore_target**: `total_ore_target / total_calender_day`
- **quarry**: `total_quarry_target / total_calender_day`
- **ore_shipment_target**: `total_ore_shipment_target / total_calender_day`

### 3. Perhitungan Shift
- **shift_ob_target**: `ob_target / 2`
- **shift_ore_target**: `ore_target / 2`
- **shift_quarry**: `quarry / 2`
- **shift_sr_target**: `shift_ob_target / shift_ore_target`

### 4. Perhitungan Stock
- **daily_old_stock**: Mengambil dari data sebelumnya atau `total_sisa_stock`
- **remaining_stock**: `daily_old_stock - ore_shipment_target + ore_target`

### 5. Perhitungan SR
- **sr_target**: `ob_target / ore_target`

## Endpoints

### POST `/parent-plan-production`
Membuat parent plan production baru dan generate data harian.

### GET `/parent-plan-production`
Mendapatkan semua parent plan production.

### GET `/parent-plan-production/:id`
Mendapatkan parent plan production berdasarkan ID.

### GET `/parent-plan-production/date/:planDate`
Mendapatkan parent plan production berdasarkan tanggal.

## Validasi

1. **Plan Date Uniqueness**: Tidak boleh ada plan_date yang duplikat
2. **Data Validation**: Semua field required harus diisi
3. **Date Format**: plan_date harus dalam format YYYY-MM-DD

## Contoh Response

### Response Parent Plan Production

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
  "total_quary_target": 300000.0,
  "total_sr_target": 2.0,
  "total_ore_shipment_target": 600000.0,
  "total_remaining_stock": 100000.0,
  "total_sisa_stock": 50000.0,
  "total_fleet": 25,
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-01-15T10:30:00.000Z"
}
```

### Data Harian yang Di-Generate Otomatis

Setelah POST berhasil, sistem akan otomatis membuat **31 data** di tabel `r_plan_production`:

```json
[
  {
    "id": 1,
    "plan_date": "2025-08-01T00:00:00.000Z",
    "is_calender_day": true,
    "is_holiday_day": false,
    "is_available_day": true,
    "average_day_ewh": 4.84,
    "average_shift_ewh": 145.16,
    "ob_target": 48387.1,
    "ore_target": 24193.55,
    "quarry": 9677.42,
    "sr_target": 2.0,
    "ore_shipment_target": 19354.84,
    "total_fleet": 25,
    "daily_old_stock": 50000.0,
    "shift_ob_target": 24193.55,
    "shift_ore_target": 12096.77,
    "shift_quarry": 4838.71,
    "shift_sr_target": 2.0,
    "remaining_stock": 54838.71,
    "parent_plan_production_id": 1
  },
  {
    "id": 2,
    "plan_date": "2025-08-02T00:00:00.000Z",
    "is_calender_day": true,
    "is_holiday_day": false,
    "is_available_day": true,
    // ... data yang sama untuk tanggal 2
    "parent_plan_production_id": 1
  },
  // ... data untuk tanggal 3-30
  {
    "id": 31,
    "plan_date": "2025-08-31T00:00:00.000Z",
    "is_calender_day": true,
    "is_holiday_day": false,
    "is_available_day": true,
    // ... data yang sama untuk tanggal 31
    "parent_plan_production_id": 1
  }
]
```

**Catatan:** Semua 31 data akan otomatis dibuat dengan tanggal yang berurutan dari 1-31 Agustus 2025.

## Catatan Penting

1. **Old Stock Global**: Diambil dari data `daily_old_stock` bulan sebelumnya, jika tidak ada maka dari `total_sisa_stock`
2. **Hari Minggu**: Otomatis dianggap sebagai hari libur (`is_holiday_day: true`, `is_available_day: false`)
3. **Data Harian**: **OTOMATIS** dibuat untuk setiap hari dalam bulan yang dipilih
4. **Relasi**: Setiap data harian terhubung dengan parent melalui `parent_plan_production_id`

## 🔍 **Testing Generate Data Harian**

### **1. Unit Testing (Jest)**
```bash
# Test semua fitur
npm test -- parent-plan-production

# Test khusus generate data harian
npm test -- generate-daily-data.spec

# Test dengan coverage
npm test -- --coverage parent-plan-production
```

### **2. Manual Testing (Node.js)**
```bash
# Jalankan script test manual
node src/modules/parent-plan-production/test-generate-daily.js
```

Script ini akan menampilkan:
- Perhitungan jumlah hari untuk berbagai bulan
- Simulasi generate data harian
- Contoh data yang di-generate
- Validasi perhitungan otomatis

### **3. API Testing (Postman/Insomnia)**
```bash
POST http://localhost:3000/parent-plan-production

Body:
{
  "plan_date": "2025-08-21",
  "total_average_day_ewh": 150.0,
  "total_average_month_ewh": 4500.0,
  "total_ob_target": 1500000.0,
  "total_ore_target": 750000.0,
  "total_quarry_target": 300000.0,
  "total_sr_target": 2.0,
  "total_ore_shipment_target": 600000.0,
  "total_remaining_stock": 100000.0,
  "total_sisa_stock": 50000.0,
  "total_fleet": 25
}
```

**Expected Result:**
- 1 record di tabel `r_parent_plan_production`
- 31 records di tabel `r_plan_production` (tanggal 1-31 Agustus 2025)

## 📊 **Contoh Perhitungan Generate Data Harian**

### Input (POST Request):
```json
{
  "plan_date": "2025-08-21",
  "total_average_day_ewh": 150.0,
  "total_average_month_ewh": 4500.0,
  "total_ob_target": 1500000.0,
  "total_ore_target": 750000.0,
  "total_quarry_target": 300000.0,
  "total_sr_target": 2.0,
  "total_ore_shipment_target": 600000.0,
  "total_remaining_stock": 100000.0,
  "total_sisa_stock": 50000.0,
  "total_fleet": 25
}
```

### Output yang Di-Generate Otomatis:

1. **Parent Plan Production** (1 record di `r_parent_plan_production`):
   - `total_calender_day`: 31 (Agustus 2025)
   - `total_holiday_day`: 5 (5 hari minggu)
   - `total_available_day`: 26 (31 - 5)

2. **Daily Plan Productions** (31 records di `r_plan_production`):
   - **Tanggal 1 Agustus 2025**: `average_day_ewh = 150.0 / 31 = 4.84`
   - **Tanggal 2 Agustus 2025**: `average_day_ewh = 150.0 / 31 = 4.84`
   - **...**
   - **Tanggal 31 Agustus 2025**: `average_day_ewh = 150.0 / 31 = 4.84`

### Formula Perhitungan:
- **Per Hari**: `total_bulanan / total_hari_bulan`
- **Per Shift**: `nilai_harian / 2`
- **SR Target**: `ob_target / ore_target`
- **Remaining Stock**: `daily_old_stock - ore_shipment_target + ore_target`
