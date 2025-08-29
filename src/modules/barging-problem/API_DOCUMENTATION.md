# API Documentation - Barging Problem

## Overview
Modul Barging Problem digunakan untuk mengelola data problem yang terjadi pada aktivitas barging. Modul ini menangani pencatatan masalah, durasi, dan lokasi kejadian dengan relasi ke tabel barge, activities, dan sites.

## Fitur Utama
- **CRUD Operations**: Create, Read, Update, Delete data barging problem
- **Validasi Data**: Validasi FK ke tabel m_barge, m_activities, dan m_sites
- **Auto Calculation**: Duration otomatis dihitung dari start - finish
- **Pagination & Filtering**: Support pagination, search, dan berbagai filter
- **Soft Delete**: Data tidak benar-benar dihapus dari database
- **Relasi Data**: Join dengan tabel m_barge, m_activities, dan m_sites

## Struktur Database

### Tabel: r_ccr_barging_problem
| Kolom | Tipe Data | Keterangan |
|-------|-----------|------------|
| id | INT | Primary Key, Auto Increment |
| activity_date | TIMESTAMP | Tanggal aktivitas barging problem |
| shift | ENUM('ds', 'ns') | Shift kerja (day shift/night shift) |
| barge_id | INT | FK ke tabel m_barge |
| activities_id | INT | FK ke tabel m_activities |
| site_id | INT | FK ke tabel m_sites (nullable) |
| start | TIMESTAMP | Waktu mulai problem |
| finish | TIMESTAMP | Waktu selesai problem |
| duration | FLOAT | Durasi problem dalam jam (otomatis) |
| remark | TEXT | Catatan tambahan tentang problem |
| createdAt | TIMESTAMP | Waktu pembuatan |
| createdBy | INT | ID user yang membuat |
| updatedAt | TIMESTAMP | Waktu update terakhir |
| updatedBy | INT | ID user yang mengupdate |
| deletedAt | TIMESTAMP | Waktu soft delete |
| deletedBy | INT | ID user yang menghapus |

### Relasi
- `barge_id` → `m_barge.id` (untuk mendapatkan nama barge)
- `activities_id` → `m_activities.id` (untuk mendapatkan nama aktivitas)
- `site_id` → `m_sites.id` (untuk mendapatkan nama site)

## Endpoints

### 1. POST /api/barging-problem
**Membuat data barging problem baru**

#### Request Body
```json
{
  "activity_date": "2024-01-01T00:00:00.000Z",
  "shift": "ds",
  "barge_id": 1,
  "activities_id": 1,
  "site_id": 1,
  "start": "2024-01-01T08:00:00.000Z",
  "finish": "2024-01-01T16:00:00.000Z",
  "remark": "Problem pada unit excavator"
}
```

#### Field Validation
- `activity_date`: String, required, format tanggal valid
- `shift`: Enum ('ds', 'ns'), required
- `barge_id`: Number, required, min 1, harus ada di tabel m_barge
- `activities_id`: Number, required, min 1, harus ada di tabel m_activities
- `site_id`: Number, optional, min 1, harus ada di tabel m_sites jika diisi
- `start`: String, required, format tanggal valid
- `finish`: String, required, format tanggal valid, harus > start
- `remark`: String, optional

#### Response Success (201)
```json
{
  "statusCode": 201,
  "message": "Barging problem berhasil dibuat",
  "data": {
    "id": 1,
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ds",
    "barge_id": 1,
    "barge_name": "Barge Kalimantan",
    "activities_id": 1,
    "activities_name": "Excavation",
    "site_id": 1,
    "site_name": "Site Jakarta",
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "duration": 8.0,
    "remark": "Problem pada unit excavator",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### 2. GET /api/barging-problem
**Mendapatkan semua data barging problem**

#### Query Parameters
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10, max: 100)
- `search` (optional): Pencarian umum di field remark, barge name, activities name, dan site name
- `shift` (optional): Filter berdasarkan shift ('ds' atau 'ns')
- `barge_id` (optional): Filter berdasarkan ID barge
- `activities_id` (optional): Filter berdasarkan ID aktivitas
- `site_id` (optional): Filter berdasarkan ID site
- `sortBy` (optional): Field untuk sorting
- `sortOrder` (optional): Urutan sorting ('ASC' atau 'DESC')

#### Contoh Request
```bash
GET /api/barging-problem?page=1&limit=10&search=excavator&shift=ds&sortBy=createdAt&sortOrder=DESC
```

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Data barging problem berhasil diambil",
  "data": [
    {
      "id": 1,
      "activity_date": "2024-01-01T00:00:00.000Z",
      "shift": "ds",
      "barge_id": 1,
      "barge_name": "Barge Kalimantan",
      "activities_id": 1,
      "activities_name": "Excavation",
      "site_id": 1,
      "site_name": "Site Jakarta",
      "start": "2024-01-01T08:00:00.000Z",
      "finish": "2024-01-01T16:00:00.000Z",
      "duration": 8.0,
      "remark": "Problem pada unit excavator",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "lastPage": 3
  }
}
```

### 3. GET /api/barging-problem/:id
**Mendapatkan data barging problem berdasarkan ID**

#### Path Parameters
- `id`: ID barging problem (number)

#### Contoh Request
```bash
GET /api/barging-problem/1
```

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Data barging problem berhasil diambil",
  "data": {
    "id": 1,
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ds",
    "barge_id": 1,
    "barge_name": "Barge Kalimantan",
    "activities_id": 1,
    "activities_name": "Excavation",
    "site_id": 1,
    "site_name": "Site Jakarta",
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "duration": 8.0,
    "remark": "Problem pada unit excavator",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
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

### 4. PATCH /api/barging-problem/:id
**Mengupdate data barging problem**

#### Path Parameters
- `id`: ID barging problem yang akan diupdate (number)

#### Request Body
```json
{
  "shift": "ns",
  "remark": "Problem pada unit excavator - updated"
}
```

#### Field Validation
- Semua field bersifat optional
- Jika field diisi, akan divalidasi sesuai dengan aturan yang sama
- Field `duration` akan otomatis dihitung ulang jika `start` atau `finish` diupdate

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Barging problem berhasil diupdate",
  "data": {
    "id": 1,
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ns",
    "barge_id": 1,
    "barge_name": "Barge Kalimantan",
    "activities_id": 1,
    "activities_name": "Excavation",
    "site_id": 1,
    "site_name": "Site Jakarta",
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "duration": 8.0,
    "remark": "Problem pada unit excavator - updated",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T11:00:00.000Z"
  }
}
```

### 5. DELETE /api/barging-problem/:id
**Menghapus data barging problem (soft delete)**

#### Path Parameters
- `id`: ID barging problem yang akan dihapus (number)

#### Contoh Request
```bash
DELETE /api/barging-problem/1
```

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Barging problem berhasil dihapus",
  "data": null
}
```

## Error Responses

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "Barge dengan ID tersebut tidak ditemukan",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Barging problem tidak ditemukan",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Internal Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication

Semua endpoint memerlukan JWT token yang valid. Token harus dikirim dalam header Authorization:

```
Authorization: Bearer <jwt_token>
```

## Business Rules

1. **Validasi FK**: 
   - `barge_id` harus ada di tabel m_barge
   - `activities_id` harus ada di tabel m_activities
   - `site_id` harus ada di tabel m_sites jika diisi

2. **Validasi Waktu**: 
   - Waktu `start` harus lebih awal dari waktu `finish`
   - Field `duration` otomatis dihitung dan tidak perlu diisi manual

3. **Soft Delete**: 
   - Data tidak benar-benar dihapus, hanya di-mark sebagai deleted
   - Data yang sudah di-soft delete tidak akan muncul di query

4. **Pagination**: 
   - Limit maksimal adalah 100 data per halaman
   - Default page adalah 1, default limit adalah 10

5. **Search & Filter**: 
   - Search dilakukan di field remark, barge name, activities name, dan site name
   - Filter dapat dikombinasikan untuk hasil yang lebih spesifik

## Testing Examples

### Valid Create Request
```bash
curl -X POST http://localhost:3000/api/barging-problem \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_date": "2024-01-01T00:00:00.000Z",
    "shift": "ds",
    "barge_id": 1,
    "activities_id": 1,
    "start": "2024-01-01T08:00:00.000Z",
    "finish": "2024-01-01T16:00:00.000Z",
    "remark": "Problem pada unit excavator"
  }'
```

### Valid Update Request
```bash
curl -X PATCH http://localhost:3000/api/barging-problem/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shift": "ns",
    "remark": "Problem pada unit excavator - updated"
  }'
```

### Valid Delete Request
```bash
curl -X DELETE http://localhost:3000/api/barging-problem/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Dependencies

- `@nestjs/common`
- `@nestjs/typeorm`
- `@nestjs/swagger`
- `class-validator`
- `class-transformer`
- `typeorm`

## Notes

- Semua validasi menggunakan class-validator decorators
- Field `duration` otomatis dihitung dan tidak perlu diisi manual
- Relasi dengan tabel `m_barge`, `m_activities`, dan `m_sites` menggunakan eager loading
- Implementasi menggunakan soft delete untuk menjaga integritas data
- Response format konsisten dengan helper function yang sudah ada
- Semua endpoint dilindungi dengan JWT authentication
