# Activities API Documentation

## Overview
Module ini menyediakan endpoint untuk mengelola data aktivitas dengan berbagai fitur filtering, pagination, dan sorting.

## Endpoints

### GET /api/activities
Mengambil semua data aktivitas dengan pagination, filtering, dan sorting.

#### Query Parameters

| Parameter | Type | Required | Default | Description | Example |
|-----------|------|----------|---------|-------------|---------|
| `page` | string | No | "1" | Nomor halaman | `1` |
| `limit` | string | No | "10" | Jumlah data per halaman (max: 100) | `10` |
| `search` | string | No | - | Pencarian umum di semua field (name dan status) | `loading` |
| `name` | string | No | - | Filter berdasarkan nama aktivitas (partial match) | `Loading Barge` |
| `status` | enum | No | - | Filter berdasarkan status aktivitas (single value) | `working` |
| `status_multiple` | string/array | No | - | Filter berdasarkan multiple status aktivitas (comma-separated atau array format) | `"idle,delay"` atau `["idle", "delay"]` |
| `sortBy` | string | No | "id" | Field untuk sorting | `name` |
| `sortOrder` | enum | No | "DESC" | Urutan sorting | `ASC` |

#### Status Values
- `working` - Sedang bekerja
- `breakdown` - Rusak/berhenti
- `idle` - Menganggur
- `delay` - Terlambat

#### Filter Examples

##### Single Status Filter
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?status=working' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

##### Multiple Status Filter (Comma-separated)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple=idle,delay' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

##### Multiple Status Filter (Array format)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple[]=idle&status_multiple[]=delay' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

##### Combined Filters (Comma-separated)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple=idle,delay&sortBy=name&sortOrder=ASC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

##### Combined Filters (Array format)
```bash
curl -X 'GET' \
  'http://localhost:9526/api/activities?page=1&limit=10&status_multiple[]=idle&status_multiple[]=delay&sortBy=name&sortOrder=ASC' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### Response Format
```json
{
  "statusCode": 200,
  "message": "Data aktivitas berhasil diambil",
  "data": [
    {
      "id": 1,
      "name": "Loading Barge",
      "status": "working",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "lastPage": 1
  }
}
```

### POST /api/activities
Membuat aktivitas baru.

#### Request Body
```json
{
  "name": "Loading Barge",
  "status": "working"
}
```

### PUT /api/activities/:id
Mengupdate aktivitas berdasarkan ID.

### DELETE /api/activities/:id
Menghapus aktivitas berdasarkan ID (soft delete).

## Notes
- Filter `status_multiple` mendukung dua format:
  - Comma-separated: `status_multiple=idle,delay,breakdown`
  - Array format: `status_multiple[]=idle&status_multiple[]=delay&status_multiple[]=breakdown`
- URL encoding diperlukan untuk karakter khusus (contoh: `%2c` untuk koma)
- Filter `status` dan `status_multiple` dapat digunakan bersamaan
- Jika kedua filter digunakan, akan menggunakan logika AND (kedua kondisi harus terpenuhi)
