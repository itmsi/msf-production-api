# Population Module - Import CSV Feature

## Overview
Module ini menyediakan fitur untuk import data population dari file CSV dengan validasi data yang komprehensif.

## Endpoints

### 1. Download Template CSV
**GET** `/populations/import/template`

Mendownload template CSV yang berisi format kolom yang diperlukan untuk import data population.

**Response:**
- File CSV template dengan header yang sesuai

### 2. Preview Import CSV
**POST** `/populations/import/preview`

Mengecek validitas data CSV sebelum import, memvalidasi unit_name, activities_name, dan site_id.

**Request Body:**
```
Content-Type: multipart/form-data
{
  "file": "file_csv"
}
```

**Response:**
```json
{
  "status": "error|success",
  "message": "Pesan status",
  "data": [
    {
      "status": "error|success",
      "message": "Pesan untuk baris data",
      "row": 1,
      "data": {
        "date_arrive": "2025-01-01",
        "status": "active",
        "unit_name": "Excavator",
        "no_unit": "EXC001",
        "vin_number": "VIN123456789",
        "no_unit_system": "SYS001",
        "serial_engine": "ENG123456",
        "activities_name": "Mining",
        "user_site": "user_site",
        "site_origin": "Site A",
        "remarks": "RFU",
        "site_name": "Site A",
        "company": "PT ABC",
        "tyre_type": "6x4"
      }
    }
  ]
}
```

### 3. Import Data CSV
**POST** `/populations/import`

Mengimport data population dari CSV ke database setelah validasi.

**Request Body:**
```
Content-Type: multipart/form-data
{
  "file": "file_csv"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Data berhasil diimport",
  "data": {
    "total": 10,
    "success": 8,
    "failed": 2,
    "details": [
      {
        "status": "success",
        "message": "Data berhasil diimport",
        "row": 1,
        "data": {
          "date_arrive": "2025-01-01",
          "status": "active",
          "unit_name": "Excavator",
          "no_unit": "EXC001",
          "vin_number": "VIN123456789",
          "no_unit_system": "SYS001",
          "serial_engine": "ENG123456",
          "activities_name": "Mining",
          "user_site": "user_site",
          "site_origin": "Site A",
          "remarks": "RFU",
          "site_name": "Site A",
          "company": "PT ABC",
          "tyre_type": "6x4"
        }
      }
    ]
  }
}
```

## Format CSV

### Kolom yang Diperlukan:
1. **date_arrive** (required) - Format: yyyy-mm-dd
2. **status** (required) - Values: "active" atau "inactive"
3. **unit_name** (required) - Harus ada di tabel m_unit_type
4. **no_unit** (required) - String unik
5. **vin_number** (required) - String unik
6. **no_unit_system** (required) - String unik
7. **serial_engine** (required) - String
8. **engine_brand** (required) - Values: "cummins" atau "weichai"
9. **activities_name** (required) - Harus ada di tabel m_activities
10. **user_site** (required) - String
11. **site_origin** (required) - String
12. **remarks** (required) - Values: "RFU" atau "BD"
13. **site_name** (required) - Harus ada di tabel m_site
14. **company** (required) - String
15. **last_unit_number** (optional) - String
16. **tyre_type** (required) - Values: "6x4" atau "8x4"

### Contoh Data CSV:
```csv
date_arrive,status,unit_name,no_unit,vin_number,no_unit_system,serial_engine,activities_name,user_site,site_origin,remarks,site_name,company,last_unit_number,tyre_type
2025-01-01,active,Excavator,EXC001,VIN123456789,SYS001,ENG123456,Mining,user_site,Site A,RFU,Site A,PT ABC,LUN001,6x4
2025-01-02,active,Dump Truck,DT001,VIN987654321,SYS002,ENG654321,Hauling,user_site,Site B,BD,Site B,PT XYZ,LUN002,8x4
```

## Validasi Data

### 1. Validasi Format
- Format tanggal harus yyyy-mm-dd
- Status harus "active" atau "inactive"
- Remarks harus "RFU" atau "BD"
- Tyre type harus "6x4" atau "8x4"

### 2. Validasi Referensi
- **unit_name** harus ada di tabel `m_unit_type.unit_name`
- **activities_name** harus ada di tabel `m_activities.name`
- **site_name** harus ada di tabel `m_site.name`

### 3. Validasi Duplikasi
- **vin_number** tidak boleh duplikat
- **no_unit** tidak boleh duplikat
- **no_unit_system** tidak boleh duplikat

## Error Handling

### Error Response Format:
```json
{
  "status": "error",
  "message": "Deskripsi error",
  "data": [
    {
      "status": "error",
      "message": "Field \"status\" tidak valid: Status harus active atau inactive",
      "row": 1,
      "data": { ... }
    },
    {
      "status": "error",
      "message": "3 field(s) tidak valid: \"date_arrive\": Format tanggal tidak valid (yyyy-mm-dd), \"unit_name\": Unit type \"InvalidUnit\" tidak ditemukan, \"tyre_type\": Tyre type harus 6x4 atau 8x4",
      "row": 2,
      "data": { ... }
    }
  ]
}
```

### Jenis Error yang Dapat Terjadi:
1. **Data tidak lengkap** - Field required tidak terisi
2. **Format tanggal tidak valid** - Format tidak sesuai yyyy-mm-dd
3. **Status tidak valid** - Bukan "active" atau "inactive"
4. **Tyre type tidak valid** - Bukan "6x4" atau "8x4"
5. **Remarks tidak valid** - Bukan "RFU" atau "BD"
6. **unit_name tidak ada** - Tidak ditemukan di tabel m_unit_type
7. **activities_name tidak ada** - Tidak ditemukan di tabel m_activities
8. **site_name tidak ada** - Tidak ditemukan di tabel m_site
9. **VIN number sudah terdaftar** - Duplikasi VIN number
10. **Nomor unit sudah terdaftar** - Duplikasi no_unit
11. **Nomor unit sistem sudah terdaftar** - Duplikasi no_unit_system

## Cara Penggunaan

### 1. Download Template
```bash
GET /populations/import/template
Authorization: Bearer <jwt_token>
```

### 2. Preview Data
```bash
POST /populations/import/preview
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <csv_file>
```

### 3. Import Data
```bash
POST /populations/import
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <csv_file>
```

## Catatan Penting

1. **JWT Authentication** - Semua endpoint memerlukan JWT token yang valid
2. **File Size** - Pastikan ukuran file CSV tidak terlalu besar
3. **Encoding** - Gunakan encoding UTF-8 untuk file CSV
4. **Header Row** - Baris pertama harus berisi nama kolom
5. **Data Validation** - Selalu preview data sebelum import untuk memastikan validitas
6. **Backup** - Backup database sebelum melakukan import data dalam jumlah besar
