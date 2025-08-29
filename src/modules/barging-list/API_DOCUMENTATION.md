# API Documentation - Barging List

## Overview
Modul Barging List digunakan untuk mengelola data aktivitas barging yang meliputi unit hauler, barge, vessel, dan perhitungan total tonnage.

## Fitur Utama
- **CRUD Operations**: Create, Read, Update, Delete data barging list
- **Validasi Data**: Validasi unit_hauler_id dan barge_id
- **Auto Calculation**: Total tonnage otomatis dihitung (vessel * 40)
- **Pagination & Filtering**: Support pagination, search, dan berbagai filter
- **Soft Delete**: Data tidak benar-benar dihapus dari database

## Struktur Database

### Tabel: r_ccr_barging
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | INT | Primary Key, Auto Increment |
| activity_date | DATE | Tanggal aktivitas barging |
| shift | ENUM('ds', 'ns') | Shift kerja (day shift/night shift) |
| time | TIMESTAMP | Waktu aktivitas |
| unit_hauler_id | INT | FK ke tabel m_population |
| barge_id | INT | FK ke tabel m_barge |
| vessel | INT | Jumlah vessel |
| total_tonnage | FLOAT | Total tonnage (vessel * 40) |
| createdAt | TIMESTAMP | Waktu pembuatan |
| createdBy | INT | ID user yang membuat |
| updatedAt | TIMESTAMP | Waktu update terakhir |
| updatedBy | INT | ID user yang mengupdate |
| deletedAt | TIMESTAMP | Waktu soft delete |
| deletedBy | INT | ID user yang menghapus |

### Relasi
- `unit_hauler_id` → `m_population.id` (untuk mendapatkan nama unit hauler)
- `barge_id` → `m_barge.id` (untuk mendapatkan nama barge)

## Endpoints

### 1. POST /api/barging-list
**Membuat data barging list baru**

#### Request Body
```json
{
  "activity_date": "2025-01-15",
  "shift": "ds",
  "time": "2025-01-15T08:00:00.000Z",
  "unit_hauler_id": 1,
  "barge_id": 1,
  "vessel": 5
}
```

#### Response Success (201)
```json
{
  "statusCode": 201,
  "message": "Barging list berhasil dibuat",
  "data": {
    "id": 1,
    "activity_date": "2025-01-15",
    "shift": "ds",
    "time": "2025-01-15T08:00:00.000Z",
    "unit_hauler_id": 1,
    "unit_hauler_name": "DT-001",
    "barge_id": 1,
    "barge_name": "Barge A",
    "vessel": 5,
    "total_tonnage": 200,
    "createdAt": "2025-01-15T08:00:00.000Z",
    "updatedAt": "2025-01-15T08:00:00.000Z"
  }
}
```

#### Validasi
- `unit_hauler_id` harus ada di tabel `m_population`
- `barge_id` harus ada di tabel `m_barge`
- `vessel` harus lebih dari 0
- `shift` harus berupa 'ds' atau 'ns'

### 2. GET /api/barging-list
**Mengambil semua data barging list dengan pagination dan filter**

#### Query Parameters
| Parameter | Tipe | Required | Default | Keterangan |
|-----------|------|----------|---------|------------|
| page | number | false | 1 | Nomor halaman |
| limit | number | false | 10 | Limit data per halaman |
| search | string | false | - | Pencarian berdasarkan unit hauler name atau barge name |
| shift | enum | false | - | Filter berdasarkan shift ('ds' atau 'ns') |
| unit_hauler_id | number | false | - | Filter berdasarkan unit hauler ID |
| barge_id | number | false | - | Filter berdasarkan barge ID |
| date_from | string | false | - | Filter berdasarkan tanggal dari (YYYY-MM-DD) |
| date_to | string | false | - | Filter berdasarkan tanggal sampai (YYYY-MM-DD) |
| sortBy | string | false | 'id' | Field untuk sorting |
| sortOrder | enum | false | 'DESC' | Urutan sorting ('ASC' atau 'DESC') |

#### Contoh Request
```
GET /api/barging-list?page=1&limit=10&search=DT-001&shift=ds&date_from=2025-01-01&date_to=2025-01-31
```

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Data barging list berhasil diambil",
  "data": [
    {
      "id": 1,
      "activity_date": "2025-01-15",
      "shift": "ds",
      "time": "2025-01-15T08:00:00.000Z",
      "unit_hauler_id": 1,
      "unit_hauler_name": "DT-001",
      "barge_id": 1,
      "barge_name": "Barge A",
      "vessel": 5,
      "total_tonnage": 200,
      "createdAt": "2025-01-15T08:00:00.000Z",
      "updatedAt": "2025-01-15T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "lastPage": 10
  }
}
```

### 3. GET /api/barging-list/:id
**Mengambil data barging list berdasarkan ID**

#### Path Parameters
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| id | number | ID barging list |

#### Contoh Request
```
GET /api/barging-list/1
```

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Data barging list berhasil diambil",
  "data": {
    "id": 1,
    "activity_date": "2025-01-15",
    "shift": "ds",
    "time": "2025-01-15T08:00:00.000Z",
    "unit_hauler_id": 1,
    "unit_hauler_name": "DT-001",
    "barge_id": 1,
    "barge_name": "Barge A",
    "vessel": 5,
    "total_tonnage": 200,
    "createdAt": "2025-01-15T08:00:00.000Z",
    "updatedAt": "2025-01-15T08:00:00.000Z"
  }
}
```

#### Response Data Not Found (200)
```json
{
  "statusCode": 200,
  "message": "Data tidak ditemukan",
  "data": null
}
```

### 4. PATCH /api/barging-list/:id
**Mengupdate data barging list**

#### Path Parameters
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| id | number | ID barging list yang akan diupdate |

#### Request Body
```json
{
  "vessel": 6,
  "shift": "ns"
}
```

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Barging list berhasil diupdate",
  "data": {
    "id": 1,
    "activity_date": "2025-01-15",
    "shift": "ns",
    "time": "2025-01-15T08:00:00.000Z",
    "unit_hauler_id": 1,
    "unit_hauler_name": "DT-001",
    "barge_id": 1,
    "barge_name": "Barge A",
    "vessel": 6,
    "total_tonnage": 240,
    "createdAt": "2025-01-15T08:00:00.000Z",
    "updatedAt": "2025-01-15T08:00:00.000Z"
  }
}
```

### 5. DELETE /api/barging-list/:id
**Menghapus data barging list (soft delete)**

#### Path Parameters
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| id | number | ID barging list yang akan dihapus |

#### Contoh Request
```
DELETE /api/barging-list/1
```

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Barging list berhasil dihapus",
  "data": null
}
```

## Error Handling

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "Unit hauler dengan ID 999 tidak ditemukan di tabel m_population"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Barging list tidak ditemukan"
}
```

### Internal Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Gagal membuat barging list"
}
```

## Business Rules

### 1. Perhitungan Total Tonnage
- Total tonnage otomatis dihitung: `vessel * 40`
- Nilai ini diupdate otomatis setiap kali vessel berubah

### 2. Validasi Foreign Key
- `unit_hauler_id` harus ada di tabel `m_population`
- `barge_id` harus ada di tabel `m_barge`
- Validasi dilakukan sebelum insert/update

### 3. Soft Delete
- Data tidak benar-benar dihapus dari database
- Kolom `deletedAt` diisi dengan timestamp saat soft delete
- Query otomatis exclude data yang sudah di-soft delete

## Contoh Penggunaan

### 1. Membuat Data Barging List
```bash
curl -X POST http://localhost:3000/api/barging-list \
  -H "Content-Type: application/json" \
  -d '{
    "activity_date": "2025-01-15",
    "shift": "ds",
    "time": "2025-01-15T08:00:00.000Z",
    "unit_hauler_id": 1,
    "barge_id": 1,
    "vessel": 5
  }'
```

### 2. Mengambil Data dengan Filter
```bash
curl "http://localhost:3000/api/barging-list?page=1&limit=10&shift=ds&date_from=2025-01-01&date_to=2025-01-31"
```

### 3. Update Data
```bash
curl -X PATCH http://localhost:3000/api/barging-list/1 \
  -H "Content-Type: application/json" \
  -d '{
    "vessel": 6
  }'
```

### 4. Hapus Data
```bash
curl -X DELETE http://localhost:3000/api/barging-list/1
```

## Catatan Penting

1. **Auto Calculation**: Total tonnage selalu dihitung otomatis (vessel * 40)
2. **Validasi**: Semua foreign key divalidasi sebelum operasi database
3. **Response Format**: Menggunakan helper function yang konsisten dengan module lain
4. **Pagination**: Support pagination dengan metadata lengkap
5. **Search & Filter**: Support pencarian dan berbagai jenis filter
6. **Soft Delete**: Data tidak benar-benar dihapus, hanya ditandai sebagai deleted
