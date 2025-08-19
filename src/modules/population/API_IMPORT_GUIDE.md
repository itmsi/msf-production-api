# Panduan Lengkap Import CSV Population

## Overview
Fitur import CSV memungkinkan Anda untuk mengimpor data population dalam jumlah besar dari file CSV dengan validasi otomatis dan error handling yang komprehensif.

## Langkah-langkah Import

### 1. Download Template CSV
Sebelum membuat file CSV, download template terlebih dahulu:

```bash
GET /populations/import/template
Authorization: Bearer <your_jwt_token>
```

Template akan berisi header kolom yang diperlukan dan contoh data.

### 2. Siapkan File CSV
Buat file CSV dengan format yang sesuai template. Pastikan:

- **Encoding**: UTF-8
- **Delimiter**: Koma (,)
- **Header Row**: Baris pertama berisi nama kolom
- **Data**: Mulai dari baris kedua

### 3. Preview Data (Opsional tapi Direkomendasikan)
Sebelum import, preview data untuk memvalidasi:

```bash
POST /populations/import/preview
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data

file: <your_csv_file>
```

Response akan menunjukkan:
- Data yang valid (status: success)
- Data yang tidak valid (status: error) beserta alasan error

### 4. Import Data
Jika semua data valid, lakukan import:

```bash
POST /populations/import
Authorization: Bearer <your_jwt_token>
Content-Type: multipart/form-data

file: <your_csv_file>
```

## Format Kolom CSV

| Kolom | Tipe | Required | Validasi | Contoh |
|-------|------|----------|----------|---------|
| date_arrive | String | ✅ | yyyy-mm-dd | 2025-01-01 |
| status | String | ✅ | active/inactive | active |
| unit_name | String | ✅ | Ada di m_unit_type | Excavator |
| no_unit | String | ✅ | Unique | EXC001 |
| vin_number | String | ✅ | Unique | VIN123456789 |
| no_unit_system | String | ✅ | Unique | SYS001 |
| serial_engine | String | ✅ | - | ENG123456 |
| engine_brand | String | ✅ | cummins/weichai | cummins |
| activities_name | String | ✅ | Ada di m_activities | Mining |
| user_site | String | ✅ | - | user_site |
| site_origin | String | ✅ | - | Site A |
| remarks | String | ✅ | RFU/BD | RFU |
| site_name | String | ✅ | Ada di m_site | Site A |
| company | String | ✅ | - | PT ABC |
| last_unit_number | String | ❌ | - | LUN001 |
| tyre_type | String | ✅ | 6x4/8x4 | 6x4 |

## Contoh File CSV Lengkap

```csv
date_arrive,status,unit_name,no_unit,vin_number,no_unit_system,serial_engine,activities_name,user_site,site_origin,remarks,site_name,company,last_unit_number,tyre_type
2025-01-01,active,Excavator,EXC001,VIN123456789,SYS001,ENG123456,Mining,user1,Site A,RFU,Site A,PT ABC,LUN001,6x4
2025-01-02,active,Dump Truck,DT001,VIN987654321,SYS002,ENG654321,Hauling,user2,Site B,BD,Site B,PT XYZ,LUN002,8x4
2025-01-03,inactive,Wheel Loader,WL001,VIN111222333,SYS003,ENG111222,Loading,user3,Site C,RFU,Site C,PT DEF,LUN003,6x4
2025-01-04,active,Bulldozer,BD001,VIN444555666,SYS004,ENG444555,Clearing,user4,Site D,BD,Site D,PT GHI,LUN004,6x4
2025-01-05,active,Motor Grader,MG001,VIN777888999,SYS005,ENG777888,Grading,user5,Site E,RFU,Site E,PT JKL,LUN005,6x4
```

## Validasi Data

### 1. Validasi Format
- **Tanggal**: Harus format yyyy-mm-dd (contoh: 2025-01-01)
- **Status**: Hanya "active" atau "inactive"
- **Engine Brand**: Hanya "cummins" atau "weichai"
- **Remarks**: Hanya "RFU" atau "BD"
- **Tyre Type**: Hanya "6x4" atau "8x4"

### 2. Validasi Referensi
- **unit_name**: Harus ada di tabel `m_unit_type.unit_name`
- **activities_name**: Harus ada di tabel `m_activities.name`
- **site_name**: Harus ada di tabel `m_site.name`

### 3. Validasi Duplikasi
- **vin_number**: Tidak boleh sama dengan data yang sudah ada
- **no_unit**: Tidak boleh sama dengan data yang sudah ada
- **no_unit_system**: Tidak boleh sama dengan data yang sudah ada

## Response Format

### Preview Response
```json
{
  "status": "error",
  "message": "Terdapat data yang tidak valid",
  "data": [
    {
      "status": "error",
      "message": "unit_name tidak ada",
      "row": 1,
      "data": {
        "date_arrive": "2025-01-01",
        "status": "active",
        "unit_name": "InvalidUnit",
        "no_unit": "EXC001",
        "vin_number": "VIN123456789",
        "no_unit_system": "SYS001",
        "serial_engine": "ENG123456",
        "activities_name": "Mining",
        "user_site": "user1",
        "site_origin": "Site A",
        "remarks": "RFU",
        "site_name": "Site A",
        "company": "PT ABC",
        "last_unit_number": "LUN001",
        "tyre_type": "6x4"
      }
    },
    {
      "status": "success",
      "message": "Data valid",
      "row": 2,
      "data": {
        "date_arrive": "2025-01-02",
        "status": "active",
        "unit_name": "Dump Truck",
        "no_unit": "DT001",
        "vin_number": "VIN987654321",
        "no_unit_system": "SYS002",
        "serial_engine": "ENG654321",
        "activities_name": "Hauling",
        "user_site": "user2",
        "site_origin": "Site B",
        "remarks": "BD",
        "site_name": "Site B",
        "company": "PT XYZ",
        "tyre_type": "8x4"
      }
    }
  ]
}
```

### Import Response
```json
{
  "statusCode": 201,
  "message": "Data berhasil diimport",
  "data": {
    "total": 5,
    "success": 4,
    "failed": 1,
    "details": [
      {
        "status": "success",
        "message": "Data berhasil diimport",
        "row": 1,
        "data": { ... }
      },
      {
        "status": "error",
        "message": "unit_name tidak ada",
        "row": 2,
        "data": { ... }
      }
    ]
  }
}
```

## Error Handling

### Jenis Error yang Umum

1. **Data tidak lengkap**
   - Message: "Data tidak lengkap"
   - Solusi: Pastikan semua kolom required terisi

2. **Format tanggal tidak valid**
   - Message: "Format tanggal tidak valid (yyyy-mm-dd)"
   - Solusi: Gunakan format yyyy-mm-dd

3. **Status tidak valid**
   - Message: "Status harus active atau inactive"
   - Solusi: Gunakan "active" atau "inactive"

4. **Engine brand tidak valid**
   - Message: "Engine brand harus cummins atau weichai"
   - Solusi: Gunakan "cummins" atau "weichai"

5. **Tyre type tidak valid**
   - Message: "Tyre type harus 6x4 atau 8x4"
   - Solusi: Gunakan "6x4" atau "8x4"

6. **Remarks tidak valid**
   - Message: "Remarks harus RFU atau BD"
   - Solusi: Gunakan "RFU" atau "BD"

7. **Referensi tidak ditemukan**
   - Message: "unit_name tidak ada"
   - Solusi: Pastikan unit_name ada di tabel m_unit_type
   - Message: "activities_name tidak ada"
   - Solusi: Pastikan activities_name ada di tabel m_activities
   - Message: "site_name tidak ada"
   - Solusi: Pastikan site_name ada di tabel m_site

8. **Duplikasi data**
   - Message: "VIN number sudah terdaftar"
   - Solusi: Gunakan VIN number yang unik
   - Message: "Nomor unit sudah terdaftar"
   - Solusi: Gunakan no_unit yang unik
   - Message: "Nomor unit sistem sudah terdaftar"
   - Solusi: Gunakan no_unit_system yang unik

## Best Practices

### 1. Persiapan Data
- **Backup Database**: Selalu backup sebelum import data besar
- **Validasi Manual**: Periksa data CSV sebelum upload
- **Test dengan Data Kecil**: Test dengan 2-3 baris dulu

### 2. Format File
- **Encoding**: Gunakan UTF-8
- **Delimiter**: Gunakan koma (,)
- **Header**: Pastikan nama kolom sesuai template
- **Data**: Mulai dari baris kedua

### 3. Proses Import
- **Preview Dulu**: Selalu preview sebelum import
- **Periksa Error**: Perbaiki semua error sebelum import
- **Import Bertahap**: Jika data banyak, import bertahap

### 4. Monitoring
- **Log Response**: Simpan response untuk audit trail
- **Error Tracking**: Catat semua error untuk perbaikan
- **Success Rate**: Monitor persentase keberhasilan import

## Troubleshooting

### 1. File Tidak Terupload
- Periksa ukuran file (max 10MB)
- Pastikan format file adalah CSV
- Periksa JWT token

### 2. Data Tidak Terimport
- Periksa response error
- Pastikan semua validasi passed
- Periksa koneksi database

### 3. Performance Issues
- Import data dalam batch kecil
- Gunakan preview untuk validasi awal
- Monitor penggunaan memory dan CPU

## Support

Jika mengalami masalah:

1. **Periksa Log**: Lihat log aplikasi untuk detail error
2. **Validasi Data**: Pastikan format CSV sesuai template
3. **Test Endpoint**: Test endpoint dengan Postman/Insomnia
4. **Contact Admin**: Hubungi administrator sistem

## Contoh cURL Commands

### Download Template
```bash
curl -X GET "http://localhost:3000/populations/import/template" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -o template-population-import.csv
```

### Preview Data
```bash
curl -X POST "http://localhost:3000/populations/import/preview" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "file=@your_data.csv"
```

### Import Data
```bash
curl -X POST "http://localhost:3000/populations/import" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "file=@your_data.csv"
```
