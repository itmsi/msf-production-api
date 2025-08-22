# Swagger Documentation - Parent Plan Production API

## 📋 **Overview**

API ini menangani pembuatan dan pengelolaan parent plan production serta generate data plan production harian secara otomatis.

## 🔄 **Proses Generate Data Harian Otomatis**

### **1. POST /parent-plan-production**
Ketika Anda POST data ke endpoint ini, sistem akan:

1. **Validasi Input**: Memastikan data yang dikirim valid
2. **Auto Calculation**: Menghitung otomatis jumlah hari dalam bulan
3. **Create Parent**: Menyimpan data ke tabel `r_parent_plan_production`
4. **Generate Daily Data**: Membuat data harian otomatis ke tabel `r_plan_production`

### **2. Contoh Request Body**

#### **Untuk Bulan Agustus 2025 (31 hari):**
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

**Output:**
- 1 record di `r_parent_plan_production`
- 31 records di `r_plan_production` (tanggal 1-31 Agustus 2025)

#### **Untuk Bulan November 2025 (30 hari):**
```json
{
  "plan_date": "2025-11-15",
  "total_average_day_ewh": 120.0,
  "total_average_month_ewh": 3600.0,
  "total_ob_target": 1200000.0,
  "total_ore_target": 600000.0,
  "total_quarry_target": 240000.0,
  "total_sr_target": 2.0,
  "total_ore_shipment_target": 480000.0,
  "total_remaining_stock": 80000.0,
  "total_sisa_stock": 40000.0,
  "total_fleet": 20
}
```

**Output:**
- 1 record di `r_parent_plan_production`
- 30 records di `r_plan_production` (tanggal 1-30 November 2025)

#### **Untuk Bulan Februari 2025 (28 hari):**
```json
{
  "plan_date": "2025-02-15",
  "total_average_day_ewh": 100.0,
  "total_average_month_ewh": 2800.0,
  "total_ob_target": 1000000.0,
  "total_ore_target": 500000.0,
  "total_quarry_target": 200000.0,
  "total_sr_target": 2.0,
  "total_ore_shipment_target": 400000.0,
  "total_remaining_stock": 60000.0,
  "total_sisa_stock": 30000.0,
  "total_fleet": 18
}
```

**Output:**
- 1 record di `r_parent_plan_production`
- 28 records di `r_plan_production` (tanggal 1-28 Februari 2025)

## 🧮 **Formula Perhitungan Otomatis**

### **1. Perhitungan Hari:**
- `total_calender_day`: Total hari dalam bulan (auto)
- `total_holiday_day`: Total hari minggu dalam bulan (auto)
- `total_available_day`: `total_calender_day - total_holiday_day` (auto)

### **2. Perhitungan Nilai Harian:**
- `average_day_ewh`: `total_average_day_ewh ÷ total_calender_day`
- `ob_target`: `total_ob_target ÷ total_calender_day`
- `ore_target`: `total_ore_target ÷ total_calender_day`
- `quarry`: `total_quarry_target ÷ total_calender_day`
- `ore_shipment_target`: `total_ore_shipment_target ÷ total_calender_day`

### **3. Perhitungan Shift:**
- `shift_ob_target`: `ob_target ÷ 2`
- `shift_ore_target`: `ore_target ÷ 2`
- `shift_quarry`: `quarry ÷ 2`
- `shift_sr_target`: `shift_ob_target ÷ shift_ore_target`

### **4. Perhitungan Stock:**
- `daily_old_stock`: Mengambil dari data sebelumnya atau `total_sisa_stock`
- `remaining_stock`: `daily_old_stock - ore_shipment_target + ore_target`

### **5. Perhitungan SR:**
- `sr_target`: `ob_target ÷ ore_target`

## 📊 **Struktur Data Harian yang Di-Generate**

Setiap data harian akan memiliki struktur:

```json
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
}
```

## 🚨 **Validasi dan Error Handling**

### **1. Validasi Input:**
- `plan_date`: Harus format YYYY-MM-DD
- Semua field numerik harus positif
- Semua field required harus diisi

### **2. Error Responses:**

#### **409 Conflict - Plan Date Sudah Ada:**
```json
{
  "statusCode": 409,
  "message": "Plan date sudah ada dalam sistem",
  "error": "Conflict"
}
```

#### **400 Bad Request - Data Tidak Valid:**
```json
{
  "statusCode": 400,
  "message": [
    "plan_date must be a valid date string",
    "total_average_day_ewh must be a positive number",
    "total_ob_target must be a positive number"
  ],
  "error": "Bad Request"
}
```

#### **400 Bad Request - Data Tidak Ditemukan:**
```json
{
  "statusCode": 400,
  "message": "Parent plan production tidak ditemukan",
  "error": "Bad Request"
}
```

## 🔍 **Testing API**

### **1. Test dengan Postman/Insomnia:**
```bash
POST http://localhost:3000/parent-plan-production
Content-Type: application/json

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

### **2. Verifikasi Data yang Di-Generate:**
```bash
# Cek parent plan production
GET http://localhost:3000/parent-plan-production/1

# Cek data harian
GET http://localhost:3000/parent-plan-production/date/2025-08-21
```

## 📝 **Catatan Penting**

1. **Auto Generation**: Data harian akan otomatis dibuat sesuai jumlah hari dalam bulan
2. **Hari Minggu**: Otomatis dianggap hari libur (`is_holiday_day: true`)
3. **Relasi Data**: Setiap data harian terhubung dengan parent via `parent_plan_production_id`
4. **Perhitungan Otomatis**: Semua nilai harian dihitung otomatis berdasarkan formula yang ditentukan
5. **Validasi Unik**: Tidak boleh ada `plan_date` yang duplikat dalam sistem
